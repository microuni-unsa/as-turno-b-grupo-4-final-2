import { createHash } from "node:crypto";
import { chunkTextWithLines } from "./chunker.js";
import { RAG_CONFIG } from "./config.js";
import { createOpenAICompatibleEmbedder } from "./embedder.js";
import {
  readFromCorpusMirror,
  writeToCorpusMirror,
} from "./mirror.js";
import type {
  DatabaseClient,
  Embedder,
  PimsAdapterInterface,
  PimsDocumentFetcher,
  PimsDocumentVersionInfo,
} from "./types.js";

export interface IngestOptions {
  readonly fetcher?: PimsDocumentFetcher | PimsAdapterInterface;
  readonly embedder?: Embedder;
  readonly db?: DatabaseClient;
  readonly mirrorDir?: string;
  readonly targetChars?: number;
  readonly overlapLines?: number;
}

export interface IngestResult {
  readonly pims_doc_id: string;
  readonly pims_version: string;
  readonly code: string;
  readonly status: string;
  readonly chunk_count: number;
  readonly file_path: string;
  readonly manifest_path: string;
  readonly file_sha256: string;
  readonly chunk_sha256s: string[];
}

export interface RevectorizeOptions {
  readonly embedder?: Embedder;
  readonly db?: DatabaseClient;
  readonly mirrorDir?: string;
  readonly targetChars?: number;
  readonly overlapLines?: number;
}

/**
 * Helper to adapt a PIMS Documents client into a PimsDocumentFetcher.
 * Bridges packages/pims-adapter into the ingest pipeline.
 */
export function createPimsAdapterFetcher(
  client: {
    getDocument: (id: number) => Promise<{ id: number; code: string; status: string; file: string | null }>;
    getDocumentVersions: (id: number) => Promise<Array<{ id: number; version?: string | number; file?: string | null; change_summary?: string }>>;
  },
  downloadFetch: typeof fetch = fetch
): PimsDocumentFetcher {
  return async (pimsDocId: string, version: string): Promise<PimsDocumentVersionInfo> => {
    const docIdNum = parseInt(pimsDocId, 10);
    const doc = await client.getDocument(docIdNum);
    const versions = await client.getDocumentVersions(docIdNum);

    const matchingVer = versions.find(
      (v) => String(v.version ?? v.id) === String(version)
    );

    const fileUrl = matchingVer?.file ?? doc.file;
    if (!fileUrl) {
      throw new Error(
        `Document '${pimsDocId}' version '${version}' does not contain an associated file URL`
      );
    }

    const response = await downloadFetch(fileUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to download file from PIMS at ${fileUrl}: ${response.status} ${response.statusText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const content = new Uint8Array(arrayBuffer);
    const filename = fileUrl.split("/").pop() ?? `doc_${pimsDocId}_v${version}.bin`;

    return {
      pims_doc_id: pimsDocId,
      code: doc.code,
      pims_version: version,
      status: doc.status,
      filename,
      content,
      supersedes: matchingVer?.change_summary ? null : null,
    };
  };
}

/**
 * Resolves a unified PimsDocumentFetcher from either a function or an adapter instance.
 * Fails fast and deterministically if missing.
 */
function resolveFetcher(
  fetcher?: PimsDocumentFetcher | PimsAdapterInterface
): PimsDocumentFetcher {
  if (typeof fetcher === "function") {
    return fetcher;
  }
  if (fetcher !== null && typeof fetcher === "object" && "fetchDocumentVersion" in fetcher) {
    return (id: string, v: string) => fetcher.fetchDocumentVersion(id, v);
  }
  throw new Error(
    "Missing PIMS document fetcher. Ingest requires an injected fetcher or adapter instance."
  );
}

/**
 * Ingest a document version from PIMS:
 * 1. Download file content from PIMS via injected fetcher / adapter interface
 * 2. Chunk text while tracking line ranges
 * 3. Generate 1024-dim embeddings via OpenAI-compatible endpoint (mistral-embed)
 * 4. Upsert chunks into pgvector with per-chunk SHA-256
 * 5. Update pims_registry with chunk metrics and supersedes link
 * 6. Write versioned file and manifest to corpus_mirror
 */
export async function ingest(
  pims_doc_id: string,
  version: string,
  options: IngestOptions = {}
): Promise<IngestResult> {
  const fetcher = resolveFetcher(options.fetcher);
  const embedder = options.embedder ?? createOpenAICompatibleEmbedder();
  const mirrorDir = options.mirrorDir ?? RAG_CONFIG.CORPUS_MIRROR_DIR;

  // Step 1: Download file content from PIMS
  const docInfo: PimsDocumentVersionInfo = await fetcher(pims_doc_id, version);
  if (!docInfo || docInfo.pims_doc_id !== pims_doc_id || docInfo.pims_version !== version) {
    throw new Error(
      `PIMS fetcher returned invalid document payload for ${pims_doc_id} v${version}`
    );
  }

  // Normalize text representation for chunking
  const textContent =
    typeof docInfo.content === "string"
      ? docInfo.content
      : Buffer.from(docInfo.content).toString("utf8");

  // Step 2: Chunk text with exact line boundaries
  const chunks = chunkTextWithLines(textContent, {
    targetChars: options.targetChars ?? RAG_CONFIG.DEFAULT_CHUNK_SIZE,
    overlapLines: options.overlapLines ?? RAG_CONFIG.DEFAULT_CHUNK_OVERLAP,
  });

  const chunkTexts = chunks.map((c) => c.text);
  const chunkSha256s = chunks.map((c) => c.sha256);

  // Step 3: Embed chunks via 1024-dim endpoint
  const embeddings = await embedder.embed(chunkTexts);
  if (embeddings.length !== chunks.length) {
    throw new Error(
      `Embedder returned ${embeddings.length} vectors for ${chunks.length} chunks`
    );
  }

  // Step 4: Upsert chunks into pgvector (if DB client provided)
  if (options.db !== undefined) {
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = embeddings[i];
      const vectorLiteral = `[${embedding.join(",")}]`;

      await options.db.query(
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
          pims_doc_id,
          version,
          chunk.chunk_id,
          vectorLiteral,
          chunk.text,
          chunk.lines,
          chunk.sha256,
          docInfo.status,
        ]
      );
    }

    // Step 5: Upsert pims_registry record
    await options.db.query(
      `INSERT INTO pims_registry (pims_doc_id, code, pims_version, status, chunk_count, chunk_sha256s, supersedes, mold_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (pims_doc_id, pims_version)
       DO UPDATE SET
         code = EXCLUDED.code,
         status = EXCLUDED.status,
         chunk_count = EXCLUDED.chunk_count,
         chunk_sha256s = EXCLUDED.chunk_sha256s,
         supersedes = EXCLUDED.supersedes,
         mold_path = EXCLUDED.mold_path,
         updated_at = NOW()`,
      [
        pims_doc_id,
        docInfo.code,
        version,
        docInfo.status,
        chunks.length,
        chunkSha256s,
        docInfo.supersedes ?? null,
        docInfo.mold_path ?? null,
      ]
    );
  }

  // Step 6: Write to local corpus mirror (corpus_mirror/<doc_id>/v<n>.<ext> + manifest)
  const mirrorResult = writeToCorpusMirror({
    pims_doc_id,
    code: docInfo.code,
    pims_version: version,
    status: docInfo.status,
    filename: docInfo.filename,
    content: docInfo.content,
    chunk_count: chunks.length,
    chunk_sha256s: chunkSha256s,
    supersedes: docInfo.supersedes ?? null,
    mold_path: docInfo.mold_path ?? null,
    uploaded_at: docInfo.uploaded_at ?? new Date().toISOString(),
    mirrorDir,
  });

  return {
    pims_doc_id,
    pims_version: version,
    code: docInfo.code,
    status: docInfo.status,
    chunk_count: chunks.length,
    file_path: mirrorResult.filePath,
    manifest_path: mirrorResult.manifestPath,
    file_sha256: mirrorResult.fileSha256,
    chunk_sha256s: chunkSha256s,
  };
}

/**
 * Re-vectorizes an existing document version directly from the local corpus mirror
 * without re-downloading from PIMS.
 */
export async function revectorize(
  pims_doc_id: string,
  version: string,
  options: RevectorizeOptions = {}
): Promise<IngestResult> {
  const mirrorDir = options.mirrorDir ?? RAG_CONFIG.CORPUS_MIRROR_DIR;
  const embedder = options.embedder ?? createOpenAICompatibleEmbedder();

  // Read existing cached file from corpus mirror
  const mirrorData = readFromCorpusMirror(pims_doc_id, version, mirrorDir);

  const chunks = chunkTextWithLines(mirrorData.text, {
    targetChars: options.targetChars ?? RAG_CONFIG.DEFAULT_CHUNK_SIZE,
    overlapLines: options.overlapLines ?? RAG_CONFIG.DEFAULT_CHUNK_OVERLAP,
  });

  const chunkTexts = chunks.map((c) => c.text);
  const chunkSha256s = chunks.map((c) => c.sha256);

  const embeddings = await embedder.embed(chunkTexts);
  if (embeddings.length !== chunks.length) {
    throw new Error(
      `Embedder returned ${embeddings.length} vectors for ${chunks.length} chunks`
    );
  }

  if (options.db !== undefined) {
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = embeddings[i];
      const vectorLiteral = `[${embedding.join(",")}]`;

      await options.db.query(
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
          pims_doc_id,
          version,
          chunk.chunk_id,
          vectorLiteral,
          chunk.text,
          chunk.lines,
          chunk.sha256,
          mirrorData.manifestEntry.status,
        ]
      );
    }

    await options.db.query(
      `INSERT INTO pims_registry (pims_doc_id, code, pims_version, status, chunk_count, chunk_sha256s, supersedes, mold_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (pims_doc_id, pims_version)
       DO UPDATE SET
         chunk_count = EXCLUDED.chunk_count,
         chunk_sha256s = EXCLUDED.chunk_sha256s,
         updated_at = NOW()`,
      [
        pims_doc_id,
        mirrorData.manifestEntry.pims_doc_id,
        version,
        mirrorData.manifestEntry.status,
        chunks.length,
        chunkSha256s,
        mirrorData.manifestEntry.supersedes,
        mirrorData.manifestEntry.mold_path,
      ]
    );
  }

  // Update manifest entry with new chunk metrics
  const mirrorResult = writeToCorpusMirror({
    pims_doc_id,
    code: mirrorData.manifestEntry.pims_doc_id,
    pims_version: version,
    status: mirrorData.manifestEntry.status,
    filename: mirrorData.manifestEntry.filename,
    content: mirrorData.content,
    chunk_count: chunks.length,
    chunk_sha256s: chunkSha256s,
    supersedes: mirrorData.manifestEntry.supersedes,
    mold_path: mirrorData.manifestEntry.mold_path,
    uploaded_at: mirrorData.manifestEntry.uploaded_at,
    mirrorDir,
  });

  return {
    pims_doc_id,
    pims_version: version,
    code: mirrorData.manifestEntry.pims_doc_id,
    status: mirrorData.manifestEntry.status,
    chunk_count: chunks.length,
    file_path: mirrorResult.filePath,
    manifest_path: mirrorResult.manifestPath,
    file_sha256: mirrorResult.fileSha256,
    chunk_sha256s: chunkSha256s,
  };
}
