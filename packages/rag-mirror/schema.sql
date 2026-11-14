-- pgvector sidecar index + local mirror schema
-- Standard: ISO/IEC 27701:2025 UNSA PIMS
-- Managed by packages/rag-mirror

CREATE EXTENSION IF NOT EXISTS vector;

-- Registry of PIMS documents and versions
-- PIMS doc IDs are the primary keys (scoped by version)
CREATE TABLE IF NOT EXISTS pims_registry (
    pims_doc_id VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL,
    pims_version VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    chunk_count INTEGER NOT NULL DEFAULT 0,
    chunk_sha256s TEXT[] NOT NULL DEFAULT '{}',
    supersedes VARCHAR(50),
    mold_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (pims_doc_id, pims_version)
);

CREATE INDEX IF NOT EXISTS idx_pims_registry_code ON pims_registry(code);
CREATE INDEX IF NOT EXISTS idx_pims_registry_status ON pims_registry(status);

-- Vector chunks indexed with cosine distance (<=>) for mistral-embed 1024-dim
CREATE TABLE IF NOT EXISTS chunks (
    pims_doc_id VARCHAR(255) NOT NULL,
    pims_version VARCHAR(50) NOT NULL,
    chunk_id VARCHAR(100) NOT NULL,
    embedding vector(1024) NOT NULL,
    text TEXT NOT NULL,
    lines VARCHAR(100) NOT NULL,
    sha256 CHAR(64) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (pims_doc_id, pims_version, chunk_id),
    CONSTRAINT fk_chunks_registry
        FOREIGN KEY (pims_doc_id, pims_version)
        REFERENCES pims_registry(pims_doc_id, pims_version)
        ON DELETE CASCADE
);

-- Cosine distance index for pgvector
CREATE INDEX IF NOT EXISTS idx_chunks_embedding_cosine ON chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_chunks_doc_version ON chunks(pims_doc_id, pims_version);
CREATE INDEX IF NOT EXISTS idx_chunks_status ON chunks(status);

-- Secrets registry (owned here as shared DB schema; written only by secrets sidecar)
CREATE TABLE IF NOT EXISTS secrets_registry (
    name VARCHAR(255) NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    scope VARCHAR(255) NOT NULL,
    PRIMARY KEY (name, version)
);

CREATE INDEX IF NOT EXISTS idx_secrets_registry_name ON secrets_registry(name);
