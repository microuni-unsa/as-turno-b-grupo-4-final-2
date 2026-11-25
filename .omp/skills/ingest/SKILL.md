---
name: ingest
description: "Document ingestion pipeline: PIMS download, CORPUS_MIRROR_DIR/<doc.code>/ storage (PDF + pdftotext -layout -nopgbrk / OCR v<n>.txt + manifest.json), semantic chunking, SHA-256 hashing, 1024-dim pgvector sync, and active-version RAG filtering (--include-obsolete)."
---

# Document Ingestion Skill (`ingest`)

Executes the ingestion pipeline synchronizing documents from GESTITEL PIMS into the local versioned corpus mirror and PostgreSQL pgvector index (`pimsai-db`).

> **Ask First for User Uploads**: When minting a `files-sidecar` `upload-and-read` token, register the single-call long-poll by passing tool parameter `async: true` on the `bash` tool call (**NEVER** `timeout: 0` or synchronous blocking: `curl -sS -m 310 "http://pimsai-files-sidecar:3000/poll/<token>?wait=true"`) so `bash` returns immediately before handing the upload URL to the user in the same turn. When an upload completes, **do NOT** run the ingestion pipeline or upload to PIMS automatically unless explicitly requested beforehand. First inspect `/app/data/preserved_uploads/<token>_<filename>` (via `pdftotext -layout -nopgbrk`, or `pdftoppm -png` + `tesseract ... stdout -l spa+eng` for scanned PDFs) and ask whether the user wants temporary Q&A only, pgvector indexing, or PIMS upload.

## 1. Canonical Pipeline & Keying (`doc.code`)
- **Primary Mirror Key**: Every document directory and `pims_doc_id` key MUST use **`doc.code`** (e.g. `G4-POL-01`), never raw numeric database IDs (`"1"`, `"2"`).
- **Configured Mirror Root**: `RAG_CONFIG.CORPUS_MIRROR_DIR` (`CORPUS_MIRROR_DIR`, `/var/lib/pimsai/corpus_mirror` inside Docker agent container; `corpus_mirror` relative locally when unset).
- **Text Extraction Rule (`pdftotext -layout -nopgbrk` + OCR)**: Never decode PDF bytes via `Buffer.from(...).toString("utf8")`. Extract normalized UTF-8 via `extractNormalizedText` (`pdftotext -layout -nopgbrk - -`, `packages/rag-mirror/pdf.ts`) — falling back to page rendering (`pdftoppm -png`) + OCR (`tesseract <img.png> stdout -l spa+eng`) for scanned PDFs — and persist sibling text as `v<version>.txt` alongside `v<version>.pdf`.
- **Execution**:
  - Live incremental sync & mirror management: `bun scripts/pims.ts mirror sync` (supports continuous background sync mode with `bun scripts/pims.ts mirror sync --loop --interval 300`).
  - Forced re-ingest (delta reports 0 but fresh embeddings needed): `bun scripts/pims.ts mirror sync --force --code <doc.code>` (scoped, no confirm needed) or full `bun scripts/pims.ts mirror sync --force --confirm` (destructive, confirm required). NEVER hand-roll `DELETE FROM chunks/...` SQL — the flag runs the same tested path with logging.
  - Queries:
    - Extracted document text: `bun scripts/pims.ts mirror read <doc.code> [--ver <v>]`
    - Semantic similarity query: `bun scripts/rag-query.ts "<query>"` (filters to **active / non-obsolete versions by default**; pass `--include-obsolete` when historical/obsolete versions `O` must also be searched).
  - If PIMS is unreachable, fallback to `bun scripts/pims.ts mirror read <code>` / `bun scripts/rag-query.ts "<query>"` and label `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]`.
  - **Training Evidence Note**: `/api/trainings/` returns HTTP 403 for `grupob4`; training evidence is ingested via documents `G4-REG-CAP-*` / `G4-PRG-CAP-*` (e.g., `G4-REG-CAP-01`, `G4-PRG-CAP-01`).

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
- Canonical citation format: `pims:<doc.code>:v<version>:<chunk_id>:<lines>` (e.g., `pims:G4-SOA-01:v4.00:5:L114-L133`).

## 3. Immutability
Never overwrite historical versions. New versions are uploaded via `bun scripts/pims.ts docs add-version <id_or_code> --file <path.pdf> --file-name <name.pdf> --summary "..." --confirm` (explicit `.pdf` filename required + `change_summary`) or created via `bun scripts/pims.ts docs create --code G4-... --name ... --category PO|PR|RE|IN --status B|R|V|O --responsible ... --file <path.pdf> --file-name <name.pdf> --confirm`, synced to `CORPUS_MIRROR_DIR/<doc.code>/` via `bun scripts/pims.ts mirror sync`, and ingested while prior versions transition to `O` (`obsoleto`).
