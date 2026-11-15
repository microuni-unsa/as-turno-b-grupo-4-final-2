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
}

export const RAG_CONFIG: RagConfig = {
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL ?? "mistral-embed",
  EMBEDDING_DIM: 1024,
  EMBEDDING_BASE_URL: process.env.EMBEDDINGS_BASE_URL ?? "https://api.mistral.ai/v1",
  CORPUS_MIRROR_DIR: process.env.CORPUS_MIRROR_DIR ?? "corpus_mirror",
  DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/pims",
  DEFAULT_CHUNK_SIZE: 1200,
  DEFAULT_CHUNK_OVERLAP: 2,
  DEFAULT_QUERY_LIMIT: 5,
};
