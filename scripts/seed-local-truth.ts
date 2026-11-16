import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { RAG_CONFIG } from "../packages/rag-mirror/config.ts";
import { createOpenAICompatibleEmbedder } from "../packages/rag-mirror/embedder.ts";
import { readCorpusManifest } from "../packages/rag-mirror/mirror.ts";
import { ingestDocumentToMirrorAndDb } from "./lib/ingest-helpers.ts";
import { createBunPgClient } from "./lib/pg-client.ts";

interface SeedDoc {
  readonly code: string;
  readonly version: string;
  readonly moldPath: string;
}

const BASELINE_DOCS: readonly SeedDoc[] = [
  { code: "G4-ALC-01", version: "3.0", moldPath: "corpus_g4_src/scope/G4-ALC-01-v3.typ" },
  { code: "G4-POL-01", version: "3.0", moldPath: "corpus_g4_src/policy/G4-POL-01-v3.typ" },
  { code: "G4-RSK-INC-01", version: "3.0", moldPath: "corpus_g4_src/incident-risks/G4-RSK-INC-01-v3.typ" },
  { code: "G4-SOA-01", version: "3.0", moldPath: "corpus_g4_src/soa/G4-SOA-01-v3.typ" },
  { code: "G4-OBJ-01", version: "3.0", moldPath: "corpus_g4_src/objectives/G4-OBJ-01-v3.typ" },
  { code: "G4-PRC-DOC-01", version: "3.0", moldPath: "corpus_g4_src/document-control/G4-PRC-DOC-01-v3.typ" },
  { code: "G4-CAP-INC-01", version: "3.0", moldPath: "corpus_g4_src/incident-training/G4-CAP-INC-01-v3.typ" },
  { code: "G4-REG-CAP-01", version: "3.0", moldPath: "corpus_g4_src/incident-training/G4-REG-CAP-01-v3.typ" },
  { code: "G4-PRC-INC-01", version: "3.0", moldPath: "corpus_g4_src/incident-response-procedure/G4-PRC-INC-01-v3.typ" },
  { code: "G4-REG-INC-01", version: "3.0", moldPath: "corpus_g4_src/incident-register/G4-REG-INC-01-v3.typ" },
  { code: "G4-PRG-AUD-01", version: "3.0", moldPath: "corpus_g4_src/audit-programme/G4-PRG-AUD-01-v3.typ" },
  { code: "G4-REP-AUD-01", version: "3.0", moldPath: "corpus_g4_src/audit-programme/G4-REP-AUD-01-v3.typ" },
  { code: "G4-ACT-REV-01", version: "3.0", moldPath: "corpus_g4_src/management-review/G4-ACT-REV-01-v3.typ" },
  { code: "G4-REG-CAPA-01", version: "3.0", moldPath: "corpus_g4_src/nc-corrective-actions/G4-REG-CAPA-01-v3.typ" },
  { code: "G4-IDX-01", version: "3.0", moldPath: "corpus_g4_src/document-index/G4-IDX-01-v3.typ" },
];

/**
 * TEMPORARY MANUAL-ONLY SEED SCRIPT.
 * Do NOT auto-execute on container launch.
 * Pass --force to re-chunk/re-ingest even when file_sha256 already matches.
 */
async function main(): Promise<void> {
  const force = process.argv.includes("--force");
  const tmpDir = "/tmp/pims-seed-pdfs";
  if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true, force: true });
  mkdirSync(tmpDir, { recursive: true });

  const db = createBunPgClient();
  const embedder = createOpenAICompatibleEmbedder();

  try {
    for (const doc of BASELINE_DOCS) {
      const outPdf = join(tmpDir, `${doc.code}-v${doc.version}.pdf`);
      const compile = Bun.spawnSync(["typst", "compile", "--root", ".", doc.moldPath, outPdf], {
        stdout: "pipe",
        stderr: "pipe",
      });
      if (compile.exitCode !== 0) {
        const stderr = new TextDecoder().decode(compile.stderr);
        throw new Error(`Typst compile failed for ${doc.moldPath}: ${stderr}`);
      }

      const pdfBytes = new Uint8Array(readFileSync(outPdf));
      const fileSha256 = createHash("sha256").update(pdfBytes).digest("hex");

      if (!force) {
        const manifest = readCorpusManifest(doc.code, RAG_CONFIG.CORPUS_MIRROR_DIR);
        const existing = manifest?.versions.find((v) => v.pims_version === doc.version);
        const regCheck = await db.query<{ count: string }>(
          "SELECT count(*)::text AS count FROM pims_registry WHERE pims_doc_id = $1 AND pims_version = $2",
          [doc.code, doc.version],
        );
        if (existing?.file_sha256 === fileSha256 && Number(regCheck.rows[0]?.count ?? "0") > 0) {
          console.log(`[seed-local-truth] Skipping ${doc.code} v${doc.version} (unchanged).`);
          continue;
        }
      }

      const result = await ingestDocumentToMirrorAndDb({
        docId: doc.code,
        code: doc.code,
        version: doc.version,
        status: "V",
        filename: `${doc.code}-v${doc.version}.pdf`,
        bytes: pdfBytes,
        moldPath: doc.moldPath,
        db,
        embedder,
      });

      console.log(
        `[seed-local-truth] Seeded ${doc.code} v${doc.version} (${result.chunkCount} chunks: ${result.embeddedCount} embedded, ${result.reusedCount} reused).`,
      );
    }
  } finally {
    await db.close();
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error("[seed-local-truth] Error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
