import { chunkTextWithLines } from "../../packages/rag-mirror/chunker.ts";
import { RAG_CONFIG } from "../../packages/rag-mirror/config.ts";
import { writeToCorpusMirror } from "../../packages/rag-mirror/mirror.ts";
import { extractNormalizedText } from "../../packages/rag-mirror/pdf.ts";
import type { DatabaseClient, Embedder } from "../../packages/rag-mirror/types.ts";

export { extractNormalizedText };

export interface IngestDocumentParams {
  readonly docId: string;
  readonly code: string;
  readonly version: string;
  readonly status: string;
  readonly filename: string;
  readonly bytes: Uint8Array;
  readonly moldPath?: string | null;
  readonly supersedes?: string | null;
  readonly db: DatabaseClient;
  readonly embedder: Embedder;
}

/**
 * Chunks, reuses existing embeddings by chunk SHA-256 where available, embeds only new chunks,
 * cleans up stale chunks, and updates pims_registry + corpus_mirror.
 */
export async function ingestDocumentToMirrorAndDb(
  params: IngestDocumentParams,
): Promise<{ chunkCount: number; embeddedCount: number; reusedCount: number }> {
  const text = extractNormalizedText(params.bytes, params.filename);
  const chunks = chunkTextWithLines(text, {
    targetChars: RAG_CONFIG.DEFAULT_CHUNK_SIZE,
    overlapLines: RAG_CONFIG.DEFAULT_CHUNK_OVERLAP,
  });

  if (chunks.length === 0) {
    throw new Error(`No text chunks extracted for ${params.code} v${params.version}`);
  }

  // Look up existing embeddings by SHA-256 to avoid redundant embedding API calls
  const uniqueShas = [...new Set(chunks.map((c) => c.sha256))];
  const existingMap = new Map<string, string>();
  if (uniqueShas.length > 0) {
    const pgShaLookup = `{${uniqueShas.join(",")}}`;
    const existingRows = await params.db.query<{ sha256: string; embedding: string }>(
      `SELECT DISTINCT ON (sha256) sha256, embedding::text AS embedding
       FROM chunks
       WHERE sha256 = ANY($1::text[])`,
      [pgShaLookup],
    );
    for (const row of existingRows.rows) {
      existingMap.set(row.sha256, row.embedding);
    }
  }

  const missingChunks = chunks.filter((c) => !existingMap.has(c.sha256));
  if (missingChunks.length > 0) {
    const newEmbeddings = await params.embedder.embed(missingChunks.map((c) => c.text));
    for (let i = 0; i < missingChunks.length; i++) {
      existingMap.set(missingChunks[i].sha256, `[${newEmbeddings[i].join(",")}]`);
    }
  }

  const chunkSha256s = chunks.map((c) => c.sha256);
  const pgShaArray = `{${chunkSha256s.join(",")}}`;

  // Upsert pims_registry BEFORE chunks (fk_chunks_registry constraint)
  await params.db.query(
    `INSERT INTO pims_registry (pims_doc_id, code, pims_version, status, chunk_count, chunk_sha256s, supersedes, mold_path)
     VALUES ($1, $2, $3, $4, $5, $6::text[], $7, $8)
     ON CONFLICT (pims_doc_id, pims_version)
     DO UPDATE SET
       code = EXCLUDED.code,
       status = EXCLUDED.status,
       chunk_count = EXCLUDED.chunk_count,
       chunk_sha256s = EXCLUDED.chunk_sha256s,
       mold_path = COALESCE(EXCLUDED.mold_path, pims_registry.mold_path),
       updated_at = NOW()`,
    [
      params.docId,
      params.code,
      params.version,
      params.status,
      chunks.length,
      pgShaArray,
      params.supersedes ?? null,
      params.moldPath ?? null,
    ],
  );

  // Remove stale chunks if this version previously had more chunks
  const validIds = `{${chunks.map((c) => c.chunk_id).join(",")}}`;
  await params.db.query(
    `DELETE FROM chunks
     WHERE pims_doc_id = $1 AND pims_version = $2 AND NOT (chunk_id = ANY($3::text[]))`,
    [params.docId, params.version, validIds],
  );

  for (const chunk of chunks) {
    const vectorLiteral = existingMap.get(chunk.sha256);
    if (!vectorLiteral) {
      throw new Error(`Missing embedding for chunk ${chunk.chunk_id} of ${params.code}`);
    }
    await params.db.query(
      `INSERT INTO chunks (pims_doc_id, pims_version, chunk_id, embedding, text, lines, sha256, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (pims_doc_id, pims_version, chunk_id)
       DO UPDATE SET
         embedding = EXCLUDED.embedding,
         text = EXCLUDED.text,
         lines = EXCLUDED.lines,
         sha256 = EXCLUDED.sha256,
         status = EXCLUDED.status`,
      [
        params.docId,
        params.version,
        chunk.chunk_id,
        vectorLiteral,
        chunk.text,
        chunk.lines,
        chunk.sha256,
        params.status,
      ],
    );
  }

  writeToCorpusMirror({
    pims_doc_id: params.docId,
    code: params.code,
    pims_version: params.version,
    status: params.status,
    filename: params.filename,
    content: params.bytes,
    extracted_text: text,
    chunk_count: chunks.length,
    chunk_sha256s: chunkSha256s,
    supersedes: params.supersedes ?? null,
    mold_path: params.moldPath ?? null,
    mirrorDir: RAG_CONFIG.CORPUS_MIRROR_DIR,
  });

  return {
    chunkCount: chunks.length,
    embeddedCount: missingChunks.length,
    reusedCount: chunks.length - missingChunks.length,
  };
}
