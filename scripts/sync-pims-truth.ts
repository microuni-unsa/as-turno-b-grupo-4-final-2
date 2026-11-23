import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";
import { PimsClient } from "../packages/pims-adapter/client.ts";
import { RAG_CONFIG } from "../packages/rag-mirror/config.ts";
import { createOpenAICompatibleEmbedder } from "../packages/rag-mirror/embedder.ts";
import { getDocMirrorDir, readCorpusManifest } from "../packages/rag-mirror/mirror.ts";
import { extractNormalizedText } from "../packages/rag-mirror/pdf.ts";
import { ingestDocumentToMirrorAndDb } from "./lib/ingest-helpers.ts";
import { createBunPgClient } from "./lib/pg-client.ts";

/**
 * Launch-time / periodic sync: checks all documents at GESTITEL PIMS (https://unsa.27k.pe),
 * downloads new or changed versions into CORPUS_MIRROR_DIR/<doc.code>/ (PDF + v<n>.txt + manifest.json),
 * re-ingests them into pimsai-db keyed strictly by doc.code, and prunes legacy numeric/stale rows.
 */
async function syncOnce(tag: string): Promise<void> {
  const username = process.env.PIMS_USERNAME;
  const password = process.env.PIMS_PASSWORD;
  if (!username || !password) {
    throw new Error(
      `${tag} PIMS_USERNAME and PIMS_PASSWORD must be configured in environment.`,
    );
  }

  const client = new PimsClient();
  await client.login({ username, password });

  const listResult = await client.listDocuments({ page_size: 200 });
  const docs = listResult.results ?? [];
  console.log(`${tag} Found ${docs.length} documents in PIMS.`);

  if (docs.length === 0) {
    return;
  }

  const db = createBunPgClient();
  const embedder = createOpenAICompatibleEmbedder();
  let syncedCount = 0;

  try {
    // 1. Clean up legacy numeric-ID DB rows and numeric mirror directories from older sync runs
    await db.query("DELETE FROM chunks WHERE pims_doc_id ~ '^[0-9]+$'");
    await db.query("DELETE FROM pims_registry WHERE pims_doc_id ~ '^[0-9]+$'");
    if (existsSync(RAG_CONFIG.CORPUS_MIRROR_DIR)) {
      for (const entry of readdirSync(RAG_CONFIG.CORPUS_MIRROR_DIR, { withFileTypes: true })) {
        if (entry.isDirectory() && /^[0-9]+$/.test(entry.name)) {
          rmSync(join(RAG_CONFIG.CORPUS_MIRROR_DIR, entry.name), { recursive: true, force: true });
          console.log(`${tag} Removed legacy numeric mirror directory: ${entry.name}`);
        }
      }
    }

    for (const doc of docs) {
      if (doc.id === undefined || doc.id === null) {
        throw new Error(`${tag} Missing document ID for document ${doc.code}`);
      }
      if (!doc.code || doc.code.trim() === "") {
        throw new Error(`${tag} Missing document code for document ID ${doc.id}`);
      }
      const docId = doc.code.trim().replace(/\//g, "-");

      const docVersions = await client.getDocumentVersions(doc.id);
      if (docVersions.length === 0) {
        throw new Error(`${tag} No versions returned from PIMS for document ${doc.code} (ID: ${doc.id})`);
      }

      // Sort versions in ascending numerical order (e.g. 1.00, 2.00, 3.00)
      const sortedVersions = [...docVersions].sort((a, b) => {
        const vA = parseFloat(String(a.version));
        const vB = parseFloat(String(b.version));
        return vA - vB;
      });

      const liveVersions = sortedVersions
        .map((v) => (v.version ? String(v.version) : ""))
        .filter((v) => v.length > 0);

      for (let i = 0; i < sortedVersions.length; i++) {
        const ver = sortedVersions[i];
        if (!ver.version) {
          throw new Error(`${tag} Missing version number on version ID ${ver.id} of ${doc.code}`);
        }
        if (!ver.file) {
          throw new Error(`${tag} Missing file URL on version ${ver.version} of ${doc.code}`);
        }

        const versionStr = String(ver.version);
        const isCurrent = doc.current_version !== undefined && String(ver.version) === String(doc.current_version);
        const status = isCurrent ? doc.status : "O";
        const supersedes = i > 0 ? String(sortedVersions[i - 1].version) : null;

        const manifest = readCorpusManifest(docId, RAG_CONFIG.CORPUS_MIRROR_DIR);
        const existingEntry = manifest?.versions.find(
          (v) => v.pims_version === versionStr,
        );

        const regCheck = await db.query<{ count: string; status: string }>(
          "SELECT count(*)::text AS count, status FROM pims_registry WHERE pims_doc_id = $1 AND pims_version = $2 GROUP BY status",
          [docId, versionStr],
        );
        const inDb = Number(regCheck.rows[0]?.count ?? "0") > 0;

        if (inDb) {
          if (regCheck.rows[0]?.status !== status) {
            await db.query(
              "UPDATE pims_registry SET status = $1, updated_at = NOW() WHERE pims_doc_id = $2 AND pims_version = $3",
              [status, docId, versionStr],
            );
            await db.query(
              "UPDATE chunks SET status = $1 WHERE pims_doc_id = $2 AND pims_version = $3",
              [status, docId, versionStr],
            );
          }
          if (supersedes !== null) {
            await db.query(
              "UPDATE pims_registry SET supersedes = $1 WHERE pims_doc_id = $2 AND pims_version = $3 AND supersedes IS NULL",
              [supersedes, docId, versionStr],
            );
          }
        }

        // Backfill missing v<n>.txt alongside existing cached PDF so full-text reads never touch raw PDF binary
        const docDir = getDocMirrorDir(docId, RAG_CONFIG.CORPUS_MIRROR_DIR);
        const txtPath = join(docDir, `v${versionStr}.txt`);
        if (existingEntry && inDb && existsSync(existingEntry.file_path)) {
          if (!existsSync(txtPath)) {
            const cachedBytes = new Uint8Array(readFileSync(existingEntry.file_path));
            const extracted = extractNormalizedText(cachedBytes, existingEntry.filename);
            writeFileSync(txtPath, extracted, "utf8");
          }
          continue;
        }

        const token = await client.auth.getValidAccessToken();
        const response = await fetch(ver.file, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-PIMS-Schema": client.schema,
          },
        });
        if (!response.ok) {
          throw new Error(
            `${tag} Failed to download ${doc.code} v${versionStr} from ${ver.file}: ${response.status} ${response.statusText}`,
          );
        }

        const bytes = new Uint8Array(await response.arrayBuffer());
        const urlFileName = ver.file.split("/").pop()?.split("?")[0];
        const filename = (urlFileName && urlFileName.length > 0) ? urlFileName : `${doc.code}-v${versionStr}.pdf`;

        const result = await ingestDocumentToMirrorAndDb({
          docId,
          code: doc.code,
          version: versionStr,
          status,
          supersedes,
          filename,
          bytes,
          db,
          embedder,
        });

        syncedCount++;
        console.log(
          `${tag} Synced ${doc.code} v${versionStr} [${status}] (${result.chunkCount} chunks: ${result.embeddedCount} embedded, ${result.reusedCount} reused).`,
        );
      }

      // 2. Reconcile stale DB version rows for this docId (e.g. seed-local-truth '3.0' vs PIMS '3.00')
      if (liveVersions.length > 0) {
        const pgVerArray = `{${liveVersions.join(",")}}`;
        await db.query(
          "DELETE FROM chunks WHERE pims_doc_id = $1 AND NOT (pims_version = ANY($2::text[]))",
          [docId, pgVerArray],
        );
        await db.query(
          "DELETE FROM pims_registry WHERE pims_doc_id = $1 AND NOT (pims_version = ANY($2::text[]))",
          [docId, pgVerArray],
        );
      }
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
