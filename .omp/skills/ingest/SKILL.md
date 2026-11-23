---
name: ingest
description: Document ingestion pipeline: PIMS download, CORPUS_MIRROR_DIR/<doc.code>/ storage (PDF + v<n>.txt + manifest.json), semantic chunking, SHA-256 hashing, and 1024-dim pgvector sync.
---

# Document Ingestion Skill (`ingest`)

Executes the ingestion pipeline synchronizing documents from GESTITEL PIMS into the local versioned corpus mirror and PostgreSQL pgvector index (`pimsai-db`).

> **Ask First for User Uploads**: When a user uploads a file via `files-sidecar` (`upload-and-read`), **do NOT** run the ingestion pipeline automatically unless explicitly requested beforehand. First inspect `/app/data/preserved_uploads/<token>_<filename>` and ask whether the user wants temporary Q&A only, pgvector indexing, or PIMS upload.

## 1. Canonical Pipeline & Keying (`doc.code`)
- **Primary Mirror Key**: Every document directory and `pims_doc_id` key MUST use **`doc.code`** (e.g. `G4-POL-01`), never raw numeric database IDs (`"1"`, `"2"`).
- **Configured Mirror Root**: `RAG_CONFIG.CORPUS_MIRROR_DIR` (`CORPUS_MIRROR_DIR`, `/var/lib/pimsai/corpus_mirror` inside Docker agent container; `corpus_mirror` relative locally when unset).
- **Text Extraction Rule**: Never decode PDF bytes via `Buffer.from(...).toString("utf8")`. Extract normalized UTF-8 via `extractNormalizedText` (`pdftotext - -`, `packages/rag-mirror/pdf.ts`) and persist sibling text as `v<version>.txt` alongside `v<version>.pdf`.
- **Execution**:
  - Live incremental sync & stale numeric/seed pruning: `bun scripts/sync-pims-truth.ts`
  - Query chunks or full extracted text: `bun scripts/rag-query.ts "<query>"` or `bun scripts/rag-query.ts --full --doc <doc.code> [--version <v>]`

## 2. Corpus Mirror & Schema Contract (`packages/rag-mirror/schema.sql`)
Directory structure under `CORPUS_MIRROR_DIR`:
```
CORPUS_MIRROR_DIR/
└── G4-POL-01/
    ├── manifest.json
    ├── v1.00.pdf
    ├── v1.00.txt
    ├── v3.00.pdf
    └── v3.00.txt
```
Database tables in `pimsai-db`:
- `pims_registry(pims_doc_id, code, pims_version, status, chunk_count, chunk_sha256s, supersedes, mold_path, created_at, updated_at)` — `UNIQUE(pims_doc_id, pims_version)`
- `chunks(pims_doc_id, pims_version, chunk_id, embedding, text, lines, sha256, status, created_at)` — `vector(1024)` (`mistral-embed`), HNSW cosine distance (`<=>`), `UNIQUE(pims_doc_id, pims_version, chunk_id)`
- Citation format: `pims:<doc.code>:v<version>:<chunk_id>:lines:<l1>-<l2>`

## 3. Immutability
Never overwrite historical versions. New versions are uploaded via `POST /api/documents/{id}/versions/` (explicit `.pdf` `fileName` required + `change_summary`), synced to `CORPUS_MIRROR_DIR/<doc.code>/`, and ingested while prior versions transition to `O` (`obsoleto`).
