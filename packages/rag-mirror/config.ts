/**
 * Centralized configuration for rag-mirror.
 * Single source of truth for embedding model, base_url, dimensions, and paths.
 * No repeated literals across files.
 */

export interface RagConfig {
  readonly EMBEDDING_MODEL: string;
  readonly EMBEDDING_DIM: number;
  readonly EMBEDDING_BASE_URL: string;
  readonly CORPUS_MIRROR_DIR: string;
  readonly DATABASE_URL: string;
  readonly DEFAULT_CHUNK_SIZE: number;
  readonly DEFAULT_CHUNK_OVERLAP: number;
  readonly DEFAULT_QUERY_LIMIT: number;
  readonly MIN_TRAILING_CHUNK_CHARS: number;
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined || value.trim().length === 0) {
    throw new Error(
      `[RAG_CONFIG] Missing required environment variable: ${key}. Silent fallbacks are prohibited.`,
    );
  }
  return value;
}

export const RAG_CONFIG: RagConfig = {
  get EMBEDDING_MODEL(): string {
    return requireEnv("EMBEDDING_MODEL");
  },
  EMBEDDING_DIM: 1024,
  get EMBEDDING_BASE_URL(): string {
    return requireEnv("EMBEDDINGS_BASE_URL");
  },
  get CORPUS_MIRROR_DIR(): string {
    const dir = process.env.CORPUS_MIRROR_DIR;
    if (dir !== undefined && dir.trim().length > 0) {
      return dir;
    }
    return "corpus_mirror";
  },
  get DATABASE_URL(): string {
    return requireEnv("DATABASE_URL");
  },
  DEFAULT_CHUNK_SIZE: 1200,
  DEFAULT_CHUNK_OVERLAP: 2,
  DEFAULT_QUERY_LIMIT: 5,
  MIN_TRAILING_CHUNK_CHARS: 120,
};
