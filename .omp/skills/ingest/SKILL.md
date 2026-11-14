---
name: ingest
description: Document ingestion pipeline: PIMS download, local mirror storage, semantic chunking, SHA-256 hashing, 1024-dim mistral-embed vectorization, pgvector cosine indexing, and registry synchronization.
---

# Document Ingestion Skill (`ingest`)

Executes the end-to-end ingestion pipeline to synchronize primary documents from PIMS GESTITEL into the local versioned corpus mirror and PostgreSQL pgvector semantic index.

## 1. Pipeline Execution: `ingest(pims_doc_id, version)`
The ingestion process executes in a deterministic sequence:

```
[PIMS REST API]
       │
       ▼ (1. Download Document File)
[corpus_mirror/<doc_id>/v<version>.<ext>] + [manifest.json]
       │
       ▼ (2. Semantic Chunking & Line Numbering)
[Text Chunks] ──► (3. Compute SHA-256 per Chunk)
       │
       ▼ (4. Embed via mistral-embed 1024-dim OpenAI-compatible endpoint)
[Vector Embeddings (1024-dim)]
       │
       ▼ (5. Upsert to PostgreSQL pgvector: cosine distance <=>)
[pgvector Index] ──► (6. Update pims_registry metadata)
```

### Detailed Pipeline Steps
1. **Download Document from PIMS**:
   Query `GET /api/documents/{pims_doc_id}/` to resolve metadata and the current binary download URL (`file` field). Download the binary payload (PDF, XLSX, or TXT).
2. **Corpus Mirror Layout & Manifest Update**:
   - Save the file locally into the versioned directory hierarchy:
     `corpus_mirror/<pims_doc_id>/v<version>.<ext>`
   - Append or update the entry in `corpus_mirror/manifest.json`:
     ```json
     {
       "pims_doc_id": 101,
       "code": "G4-POL-001",
       "version": "1.0",
       "filename": "v1.0.pdf",
       "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
       "downloaded_at": "2026-11-13T18:00:00Z",
       "chunk_count": 14
     }
     ```
3. **Parsing & Semantic Chunking**:
   Parse document text preserving structural headings and line numbers. Split into semantic chunks (250–500 tokens) with 50-token overlaps.
4. **Per-Chunk SHA-256 Hashing**:
   Calculate a cryptographic SHA-256 digest for every chunk to guarantee tamper detection, cache integrity, and precise diff tracking.
5. **Embedding Generation (`mistral-embed`)**:
   Send chunk text to `mistral-embed`:
   - Dimensionality: 1024 dimensions.
   - Interface: OpenAI-compatible embedding API with `base_url` swap.
6. **Vector Store Ingestion (`pgvector`)**:
   Upsert embeddings into PostgreSQL pgvector table:
   - Indexing: HNSW / IVFFlat with cosine distance operator (`<=>`).
   - Citation standard: `pims:<doc_id>:v<version>:chunk:<chunk_index>:lines:<start_line>-<end_line>`.
7. **PIMS Registry Update**:
   Update `pims_registry` metadata:
   - Schema: `pims_registry(pims_doc_id, code, pims_version, status, chunk_count, chunk_sha256s, supersedes, mold_path)`.

## 2. Directory Layout: `corpus_mirror/`
The mirror directory structure is maintained as follows:
```
corpus_mirror/
├── manifest.json
├── 101/
│   ├── v1.0.pdf
│   └── v2.0.pdf
├── 102/
│   └── v1.0.xlsx
└── ...
```

## 3. Strict Immutability & Re-upload Rule
- **Never Overwrite**: Existing records or previous version files in PIMS and `corpus_mirror/` are immutable.
- **New Version Protocol**: Any updated or regenerated document must be uploaded as a brand new version via `POST /api/documents/{id}/versions/` with a concise `change_summary`.
- **Obsolete Version Archival**: In PIMS, prior versions automatically transition to `obsoleto` (`O`), remaining fully downloadable for historical audit trail comparisons and timeline verification.
