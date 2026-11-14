import { RAG_CONFIG } from "./config.js";
import type { DatabaseClient, QueryResult } from "./types.js";

/**
 * Creates an in-memory mock database client for pgvector and registry operations.
 * Allows offline smoke testing without requiring a live Postgres instance.
 * Supports vector cosine distance (<=>) calculation.
 */
export function createMemoryDbClient(): DatabaseClient & {
  readonly registry: Map<string, Record<string, unknown>>;
  readonly chunks: Map<string, Record<string, unknown>>;
  readonly secrets: Map<string, Record<string, unknown>>;
} {
  const registry = new Map<string, Record<string, unknown>>();
  const chunks = new Map<string, Record<string, unknown>>();
  const secrets = new Map<string, Record<string, unknown>>();

  function cosineDistance(a: number[], b: number[]): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    if (denom === 0) {
      return 1.0;
    }
    const similarity = dot / denom;
    // Cosine distance = 1 - cosine similarity
    return Math.max(0, 1 - similarity);
  }

  return {
    registry,
    chunks,
    secrets,
    async query<T = unknown>(sql: string, params: unknown[] = []): Promise<QueryResult<T>> {
      const trimmed = sql.trim();

      // INSERT / UPSERT pims_registry
      if (trimmed.startsWith("INSERT INTO pims_registry")) {
        const [docId, code, version, status, count, sha256s, supersedes, moldPath] = params as [
          string,
          string,
          string,
          string,
          number,
          string[],
          string | null,
          string | null,
        ];
        const key = `${docId}:v${version}`;
        registry.set(key, {
          pims_doc_id: docId,
          code,
          pims_version: version,
          status,
          chunk_count: count,
          chunk_sha256s: sha256s,
          supersedes,
          mold_path: moldPath,
          updated_at: new Date().toISOString(),
        });
        return { rows: [] };
      }

      // INSERT / UPSERT chunks
      if (trimmed.startsWith("INSERT INTO chunks")) {
        const [docId, version, chunkId, embeddingRaw, text, lines, sha256, status] = params as [
          string,
          string,
          string,
          string | number[],
          string,
          string,
          string,
          string,
        ];

        let embedding: number[];
        if (typeof embeddingRaw === "string") {
          // Parse pgvector literal format: '[0.1, 0.2, ...]'
          embedding = JSON.parse(embeddingRaw.replace(/^\[/, "[").replace(/\]$/, "]")) as number[];
        } else {
          embedding = embeddingRaw;
        }

        const key = `${docId}:v${version}:${chunkId}`;
        chunks.set(key, {
          pims_doc_id: docId,
          pims_version: version,
          chunk_id: chunkId,
          embedding,
          text,
          lines,
          sha256,
          status,
        });
        return { rows: [] };
      }

      // SELECT chunks with cosine distance
      if (trimmed.startsWith("SELECT") && trimmed.includes("chunks")) {
        let rows = Array.from(chunks.values());

        // Extract query vector from params if present
        const queryVectorParam = params[0];
        let queryVector: number[] | null = null;
        if (queryVectorParam !== undefined) {
          if (typeof queryVectorParam === "string") {
            queryVector = JSON.parse(
              queryVectorParam.replace(/^\[/, "[").replace(/\]$/, "]")
            ) as number[];
          } else if (Array.isArray(queryVectorParam)) {
            queryVector = queryVectorParam as number[];
          }
        }

        // Apply filters based on params
        for (let i = 1; i < params.length; i++) {
          const p = params[i];
          if (typeof p === "string") {
            rows = rows.filter(
              (r) =>
                r.pims_doc_id === p ||
                r.pims_version === p ||
                r.status === p
            );
          }
        }

        const scoredRows = rows.map((r) => {
          const emb = r.embedding as number[];
          const dist = queryVector !== null ? cosineDistance(queryVector, emb) : 0;
          return {
            ...r,
            distance: dist,
          };
        });

        // Sort by distance ascending
        scoredRows.sort((a, b) => a.distance - b.distance);

        const lastParam = params[params.length - 1];
        const limit = typeof lastParam === "number" ? lastParam : scoredRows.length;

        return { rows: scoredRows.slice(0, limit) as unknown as T[] };
      }

      // SELECT pims_registry
      if (trimmed.startsWith("SELECT") && trimmed.includes("pims_registry")) {
        const docId = params[0] as string;
        const version = params[1] as string | undefined;

        let rows = Array.from(registry.values()).filter((r) => r.pims_doc_id === docId);
        if (version !== undefined) {
          rows = rows.filter((r) => r.pims_version === version);
        }
        return { rows: rows as unknown as T[] };
      }

      return { rows: [] };
    },
  };
}
