/**
 * Core type definitions for rag-mirror.
 * Deterministic interfaces for PIMS adapter, embeddings, pgvector, and corpus mirror.
 */

export interface PimsDocumentVersionInfo {
  readonly pims_doc_id: string;
  readonly code: string;
  readonly pims_version: string;
  readonly status: string;
  readonly filename: string;
  readonly content: Uint8Array | string;
  readonly mold_path?: string | null;
  readonly supersedes?: string | null;
  readonly uploaded_at?: string;
}

export type PimsDocumentFetcher = (
  pimsDocId: string,
  version: string
) => Promise<PimsDocumentVersionInfo>;

export interface PimsAdapterInterface {
  fetchDocumentVersion(pimsDocId: string, version: string): Promise<PimsDocumentVersionInfo>;
}

export interface DocumentChunk {
  readonly chunk_id: string;
  readonly text: string;
  readonly lines: string;
  readonly sha256: string;
}

export interface ManifestVersionEntry {
  readonly pims_doc_id: string;
  readonly pims_version: string;
  readonly filename: string;
  readonly file_path: string;
  readonly text_path?: string;
  readonly sha256: string;
  readonly chunk_count: number;
  readonly chunk_sha256s: string[];
  readonly supersedes: string | null;
  readonly mold_path: string | null;
  readonly uploaded_at: string;
  readonly status: string;
}

export interface CorpusMirrorManifest {
  readonly pims_doc_id: string;
  readonly code: string;
  readonly latest_version: string;
  readonly versions: ManifestVersionEntry[];
}

export interface Embedder {
  embed(texts: string[]): Promise<number[][]>;
}

export interface QueryResult<T = unknown> {
  readonly rows: T[];
}

export interface DatabaseClient {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
}

export interface PimsRegistryRecord {
  readonly pims_doc_id: string;
  readonly code: string;
  readonly pims_version: string;
  readonly status: string;
  readonly chunk_count: number;
  readonly chunk_sha256s: string[];
  readonly supersedes: string | null;
  readonly mold_path: string | null;
  readonly created_at?: string;
  readonly updated_at?: string;
}

export interface ChunkRecord {
  readonly pims_doc_id: string;
  readonly pims_version: string;
  readonly chunk_id: string;
  readonly embedding: number[];
  readonly text: string;
  readonly lines: string;
  readonly sha256: string;
  readonly status: string;
  readonly created_at?: string;
}

export interface QueryFilter {
  readonly pims_doc_id?: string;
  readonly pims_version?: string;
  readonly status?: string;
  readonly includeObsolete?: boolean;
}

export interface QueryResultItem {
  readonly pims_doc_id: string;
  readonly pims_version: string;
  readonly chunk_id: string;
  readonly lines: string;
  readonly text: string;
  readonly sha256: string;
  readonly status: string;
  readonly distance: number;
  readonly citation: string;
}

export type DiffChangeType = "added" | "removed" | "modified" | "unchanged";

export interface ChunkDiffItem {
  readonly type: DiffChangeType;
  readonly chunk_id_a?: string;
  readonly chunk_id_b?: string;
  readonly lines_a?: string;
  readonly lines_b?: string;
  readonly text_a?: string;
  readonly text_b?: string;
  readonly sha256_a?: string;
  readonly sha256_b?: string;
}

export interface LineDiffItem {
  readonly type: "added" | "removed" | "unchanged";
  readonly line_number_a?: number;
  readonly line_number_b?: number;
  readonly text: string;
}

export interface DiffStats {
  readonly chunks_added: number;
  readonly chunks_removed: number;
  readonly chunks_modified: number;
  readonly chunks_unchanged: number;
  readonly lines_added: number;
  readonly lines_removed: number;
}

export interface StructuralDiff {
  readonly pims_doc_id: string;
  readonly version_a: string;
  readonly version_b: string;
  readonly chunks_a_count: number;
  readonly chunks_b_count: number;
  readonly sha256_a: string;
  readonly sha256_b: string;
  readonly supersedes: string | null;
  readonly chunk_diffs: ChunkDiffItem[];
  readonly line_diffs: LineDiffItem[];
  readonly stats: DiffStats;
  readonly summary: string;
}
