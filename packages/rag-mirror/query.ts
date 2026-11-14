import { RAG_CONFIG } from "./config.js";
import { createOpenAICompatibleEmbedder } from "./embedder.js";
import type { DatabaseClient, Embedder, QueryFilter, QueryResultItem } from "./types.js";

export interface QueryOptions {
  readonly queryText?: string;
  readonly queryVector?: number[];
  readonly filter?: QueryFilter;
  readonly limit?: number;
  readonly embedder?: Embedder;
  readonly db: DatabaseClient;
}

/**
 * Formats canonical citation in exact spec format:
 * pims:<doc_id>:v<version>:chunk:lines
 * Example: pims:G4-DOC-01:v1:0:L1-L25
 */
export function formatCitation(
  docId: string,
  version: string,
  chunkId: string,
  lines: string
): string {
  return `pims:${docId}:v${version}:${chunkId}:${lines}`;
}

export interface ParsedCitation {
  readonly pims_doc_id: string;
  readonly pims_version: string;
  readonly chunk_id: string;
  readonly lines: string;
}

/**
 * Parses a canonical citation back into its individual components.
 */
export function parseCitation(citation: string): ParsedCitation {
  const parts = citation.split(":");
  if (parts.length < 5 || parts[0] !== "pims") {
    throw new Error(
      `Invalid citation format '${citation}'. Expected 'pims:<doc_id>:v<version>:chunk:lines'`
    );
  }

  const pims_doc_id = parts[1];
  const versionRaw = parts[2];
  const chunk_id = parts[3];
  // lines could contain colons if formatting varied, join remaining
  const lines = parts.slice(4).join(":");

  const pims_version = versionRaw.startsWith("v") ? versionRaw.slice(1) : versionRaw;

  return {
    pims_doc_id,
    pims_version,
    chunk_id,
    lines,
  };
}

/**
 * Executes cosine distance search (<=>) on pgvector sidecar index with metadata filtering.
 * Returns verbatim quote with canonical citation format.
 */
export async function query(options: QueryOptions): Promise<QueryResultItem[]> {
  if (options.db === undefined || options.db === null) {
    throw new Error("Missing required DatabaseClient in query options");
  }

  let vector = options.queryVector;
  if (vector === undefined) {
    if (options.queryText === undefined || options.queryText.trim().length === 0) {
      throw new Error("Either queryText or queryVector must be provided");
    }
    const embedder = options.embedder ?? createOpenAICompatibleEmbedder();
    const vectors = await embedder.embed([options.queryText]);
    if (vectors.length === 0) {
      throw new Error("Embedder returned empty vectors for query text");
    }
    vector = vectors[0];
  }

  const limit = options.limit ?? RAG_CONFIG.DEFAULT_QUERY_LIMIT;
  const vectorLiteral = `[${vector.join(",")}]`;

  const whereClauses: string[] = [];
  const params: unknown[] = [vectorLiteral];

  if (options.filter !== undefined) {
    if (options.filter.pims_doc_id !== undefined && options.filter.pims_doc_id.length > 0) {
      params.push(options.filter.pims_doc_id);
      whereClauses.push(`pims_doc_id = $${params.length}`);
    }

    if (options.filter.pims_version !== undefined && options.filter.pims_version.length > 0) {
      params.push(options.filter.pims_version);
      whereClauses.push(`pims_version = $${params.length}`);
    }

    if (options.filter.status !== undefined && options.filter.status.length > 0) {
      params.push(options.filter.status);
      whereClauses.push(`status = $${params.length}`);
    }
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
  params.push(limit);
  const limitParamIndex = params.length;

  const sql = `
    SELECT
      pims_doc_id,
      pims_version,
      chunk_id,
      text,
      lines,
      sha256,
      status,
      (embedding <=> $1) AS distance
    FROM chunks
    ${whereSql}
    ORDER BY distance ASC
    LIMIT $${limitParamIndex}
  `;

  const result = await options.db.query<{
    pims_doc_id: string;
    pims_version: string;
    chunk_id: string;
    text: string;
    lines: string;
    sha256: string;
    status: string;
    distance: number | string;
  }>(sql, params);

  return result.rows.map((row) => {
    const dist = typeof row.distance === "number" ? row.distance : parseFloat(row.distance);
    return {
      pims_doc_id: row.pims_doc_id,
      pims_version: row.pims_version,
      chunk_id: row.chunk_id,
      lines: row.lines,
      text: row.text, // Verbatim quote
      sha256: row.sha256,
      status: row.status,
      distance: dist,
      citation: formatCitation(row.pims_doc_id, row.pims_version, row.chunk_id, row.lines),
    };
  });
}
