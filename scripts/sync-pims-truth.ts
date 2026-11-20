import { createHash } from "node:crypto";
import { parseArgs } from "node:util";
import { PimsClient } from "../packages/pims-adapter/client.ts";
import { RAG_CONFIG } from "../packages/rag-mirror/config.ts";
import { createOpenAICompatibleEmbedder } from "../packages/rag-mirror/embedder.ts";
import { readCorpusManifest } from "../packages/rag-mirror/mirror.ts";
import { ingestDocumentToMirrorAndDb } from "./lib/ingest-helpers.ts";
import { createBunPgClient } from "./lib/pg-client.ts";

/**
 * Launch-time / periodic sync: checks all G4- documents at 27k PIMS (https://unsa.27k.pe),
 * downloads new or changed versions into corpus_mirror/, and re-ingests them into pimsai-db.
 */
async function syncOnce(tag: string): Promise<void> {
  const username = process.env.PIMS_USERNAME;
  const password = process.env.PIMS_PASSWORD;
  if (!username || !password) {
    console.log(
      `${tag} PIMS_USERNAME/PIMS_PASSWORD not set; skipping launch sync.`,
    );
    return;
  }

  const client = new PimsClient();
  await client.login({ username, password });

  const listResult = await client.listDocuments({ code_prefix: "G4-" });
  const docs = listResult.results ?? [];
  console.log(`${tag} Found ${docs.length} G4- documents in PIMS.`);

  if (docs.length === 0) {
    return;
  }

  const db = createBunPgClient();
  const embedder = createOpenAICompatibleEmbedder();
  let syncedCount = 0;

  try {
    for (const doc of docs) {
      const docId = String(doc.id);
      const version = String(doc.current_version ?? "1.0");
      const manifest = readCorpusManifest(docId, RAG_CONFIG.CORPUS_MIRROR_DIR);
      const existingEntry = manifest?.versions.find(
        (v) => v.pims_version === version,
      );

      if (!doc.file) {
        console.log(
          `${tag} Skipping ${doc.code} (v${version}): no file URL in PIMS.`,
        );
        continue;
      }

      const response = await fetch(doc.file);
      if (!response.ok) {
        console.warn(
          `${tag} Failed to download ${doc.code} v${version}: ${response.status} ${response.statusText}`,
        );
        continue;
      }

      const bytes = new Uint8Array(await response.arrayBuffer());
      const fileSha256 = createHash("sha256").update(bytes).digest("hex");

      const regCheck = await db.query<{ count: string }>(
        "SELECT count(*)::text AS count FROM pims_registry WHERE pims_doc_id = $1 AND pims_version = $2",
        [docId, version],
      );
      const inDb = Number(regCheck.rows[0]?.count ?? "0") > 0;

      if (existingEntry && existingEntry.file_sha256 === fileSha256 && inDb) {
        continue;
      }

      const filename =
        doc.file.split("/").pop()?.split("?")[0] ?? `${doc.code}-v${version}.pdf`;
      const result = await ingestDocumentToMirrorAndDb({
        docId,
        code: doc.code,
        version,
        status: doc.status,
        filename,
        bytes,
        db,
        embedder,
      });

      syncedCount++;
      console.log(
        `${tag} Synced ${doc.code} v${version} (${result.chunkCount} chunks: ${result.embeddedCount} embedded, ${result.reusedCount} reused).`,
      );
    }

    console.log(
      `${tag} Completed. ${syncedCount} new/changed document(s) ingested.`,
    );
  } finally {
    await db.close();
  }
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      loop: { type: "boolean", default: false },
      interval: { type: "string" },
    },
    strict: true,
    allowPositionals: true,
  });

  const isLoop = Boolean(values.loop);

  if (isLoop) {
    if (values.interval === undefined) {
      console.error("[sync-loop] ERROR: --interval <seconds> is required when --loop is enabled.");
      process.exit(1);
    }
    const intervalSec = Number(values.interval);
    if (!Number.isFinite(intervalSec) || intervalSec <= 0) {
      console.error(`[sync-loop] ERROR: Invalid interval "${values.interval}". Must be a positive number of seconds.`);
      process.exit(1);
    }

    const tag = "[sync-loop]";
    while (true) {
      try {
        await syncOnce(tag);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`${tag} ERROR: ${msg}`);
      }
      await Bun.sleep(intervalSec * 1000);
    }
  } else {
    const tag = "[sync-pims-truth]";
    await syncOnce(tag);
  }
}

main().catch((err) => {
  console.error("[sync-pims-truth] Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
