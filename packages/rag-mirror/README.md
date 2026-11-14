# @pims/rag-mirror

pgvector sidecar index and local corpus mirror tooling for the UNSA synthetic PIMS (ISO/IEC 27701:2025).

Designed for TypeScript and Bun compatibility. Fully decouples read-time vector semantic search, version comparison, and offline smoke tests from production network access via injected adapters.

---

## 1. Mirror-is-Cache-Not-Truth Contract

1. **GESTITEL is the Primary Source of Truth**:
   The GESTITEL application (`https://unsa.27k.pe`, tenant schema `unsa`) is the authoritative system of record. Every document, incident, audit, and privacy record lives in PIMS.
2. **The Mirror is an Operational Cache**:
   The `pgvector` sidecar index (`chunks`, `pims_registry`) and the local filesystem mirror (`corpus_mirror/`) are caches designed for low-latency retrieval, RAG citation, and version diffing.
3. **Reads NEVER Hit Local `.typ` for Content**:
   Content must always be downloaded from PIMS, parsed, and cached by version. Local `.typ` files are molds (templates), never the record of truth.
4. **Immutability & Re-Upload Rule**:
   Re-uploading a document to PIMS produces a **NEW** PIMS version, never an overwrite. The `supersedes` chain in `pims_registry` and `manifest.json` tracks the full provenance history.

---

## 2. Read-Failure Protocol

When a live read against the PIMS REST API (`/api/documents/...`) fails (network error, timeout, 5xx):

```mermaid
flowchart TD
    Req[Read Request] --> PIMS{Call PIMS API}
    PIMS -- Success 200 --> Cache[Update Local Mirror & Answer]
    PIMS -- Failure / Timeout --> Protocol[Execute Read-Failure Protocol]
    Protocol --> Step1[1. State exactly what failed: endpoint, error code, reason]
    Step1 --> Step2[2. Retrieve last-known content from pgvector / corpus_mirror]
    Step2 --> Step3["3. Return answer labeled: [CACHED MIRROR - PIMS read failed]"]
```

### Protocol Steps:
1. **Say What Failed**: Detail the exact endpoint, HTTP status code, or network error (e.g., `PIMS GET /api/documents/G4-DOC-001/ failed with 503 Service Unavailable`).
2. **Mirror Answer**: Fallback immediately to the local `corpus_mirror` and `pgvector` chunks for the requested document version.
3. **Label the Source**: Clearly flag the output with the origin label:
   ```text
   [CACHED MIRROR - PIMS read failed: 503 at /api/documents/G4-DOC-001/versions/2/]
   Contenido recuperado de la réplica local sincronizada el 2026-11-13T14:30:00Z.
   ```

---

## 3. Manifest Format

Every mirrored document maintains an immutable manifest at:
`corpus_mirror/<pims_doc_id>/manifest.json`

```json
{
  "pims_doc_id": "G4-DOC-001",
  "code": "G4-PR-INC-001",
  "latest_version": "2",
  "versions": [
    {
      "pims_doc_id": "G4-DOC-001",
      "pims_version": "1",
      "filename": "v1.txt",
      "file_path": "corpus_mirror/G4-DOC-001/v1.txt",
      "sha256": "73e547a6c9987707dca2e69a79583bd8bc4683a13383a7135dc2cf4505758f26",
      "chunk_count": 14,
      "chunk_sha256s": [
        "73e547a6c9987707dca2e69a79583bd8bc4683a13383a7135dc2cf4505758f26",
        "2caebe271a82a03dc05f62879b8ae35806a0a77a2e144de8dde1d8b2dc016e4d"
      ],
      "supersedes": null,
      "mold_path": "molds/incident_response_v1.typ",
      "uploaded_at": "2019-06-15T10:00:00.000Z",
      "status": "V"
    },
    {
      "pims_doc_id": "G4-DOC-001",
      "pims_version": "2",
      "filename": "v2.txt",
      "file_path": "corpus_mirror/G4-DOC-001/v2.txt",
      "sha256": "9b1285e6831d3fca3eb287e0fa0cbe6a89c3c5c93a02bb4e2f3b9fa7812b4e89",
      "chunk_count": 15,
      "chunk_sha256s": [
        "f8a31e84a287c4b07e71bb5d9d71c82ec45bb927e1f40d7e2e834614a92c3a5b"
      ],
      "supersedes": "1",
      "mold_path": "molds/incident_response_v2.typ",
      "uploaded_at": "2022-10-20T14:30:00.000Z",
      "status": "V"
    }
  ]
}
```

### Key Fields:
- `pims_doc_id`: Unique PIMS document identifier (key).
- `supersedes`: Chains subsequent versions to enforce the append-only version tree.
- `sha256`: SHA-256 hash of the complete raw document file.
- `chunk_sha256s`: Array of individual SHA-256 hashes per chunk for verification.

---

## 4. Re-Vectorize Without Re-Download Flow

If embedding models or chunk parameters change, or if local modifications need re-indexing, documents can be re-vectorized directly from the local filesystem cache without round-tripping to PIMS:

```mermaid
flowchart LR
    LocalMirror["corpus_mirror/<doc_id>/v<n>.<ext>"] --> ReadMirror[readFromCorpusMirror]
    ReadMirror --> Chunk[chunkTextWithLines]
    Chunk --> Embed[mistral-embed 1024-dim]
    Embed --> DB[(pgvector chunks)]
    DB --> Reg[(pims_registry)]
    Reg --> Manifest[Update manifest.json]
```

### Code Example:
```typescript
import { revectorize } from "@pims/rag-mirror";

await revectorize("G4-DOC-001", "1", {
  targetChars: 600, // Adjusted chunk size
  overlapLines: 3,
});
```

---

## 5. Sidecar Schema (`schema.sql`)

### Tables:
1. **`pims_registry`**:
   - `pims_doc_id VARCHAR(255)`
   - `code VARCHAR(255)`
   - `pims_version VARCHAR(50)`
   - `status VARCHAR(50)`
   - `chunk_count INTEGER`
   - `chunk_sha256s TEXT[]`
   - `supersedes VARCHAR(50)`
   - `mold_path TEXT`
   - `PRIMARY KEY (pims_doc_id, pims_version)`

2. **`chunks`**:
   - `pims_doc_id VARCHAR(255)`
   - `pims_version VARCHAR(50)`
   - `chunk_id VARCHAR(100)`
   - `embedding vector(1024)` (HNSW cosine index `vector_cosine_ops`)
   - `text TEXT` (verbatim quote)
   - `lines VARCHAR(100)` (e.g., `L1-L25`)
   - `sha256 CHAR(64)` (per-chunk hash)
   - `status VARCHAR(50)`
   - `PRIMARY KEY (pims_doc_id, pims_version, chunk_id)`

3. **`secrets_registry`**:
   - `name VARCHAR(255)`
   - `version INTEGER`
   - `created_at TIMESTAMPTZ`
   - `created_by VARCHAR(255)`
   - `scope VARCHAR(255)`
   - `PRIMARY KEY (name, version)`
   *(Owned by rag-mirror shared schema; written exclusively by secrets sidecar).*

---

## 6. Citation Format

All RAG query responses return exact verbatim quotes accompanied by the canonical citation format:
```text
pims:<doc_id>:v<version>:chunk:lines
```
Examples:
- `pims:G4-DOC-001:v1:0:L1-L25`
- `pims:G4-DOC-001:v2:12:L1-L22`

The `formatCitation()` and `parseCitation()` utilities enforce and parse this format deterministically.

---

## 7. Version Comparison (`diff.ts`)

Compares any two versions of a document fetched from either the local mirror or PIMS:
- Generates structural chunk-level diffs (`added`, `removed`, `modified`, `unchanged`).
- Generates line-level diffs with line numbers.
- Raises typed `MissingVersionError` explicitly naming WHICH version was not found:

```typescript
import { compareVersions, MissingVersionError } from "@pims/rag-mirror";

try {
  const diff = await compareVersions("G4-DOC-001", "1", "3");
} catch (err) {
  if (err instanceof MissingVersionError) {
    console.error(`Missing version: ${err.missing_version} on document ${err.pims_doc_id}`);
  }
}
```

---

## 8. Centralized Configuration (`config.ts`)

All operational constants and model endpoints are centralized in a single configuration file. No repeated literals across files:
- `EMBEDDING_MODEL`: `mistral-embed` (default)
- `EMBEDDING_DIM`: `1024`
- `EMBEDDING_BASE_URL`: `https://api.mistral.ai/v1` (OpenAI-compatible endpoint, configurable via `EMBEDDING_BASE_URL` env var)
- `CORPUS_MIRROR_DIR`: `corpus_mirror`
- `DATABASE_URL`: `postgresql://postgres:postgres@localhost:5432/pims`

---

## 9. Running Offline Smoke Tests

Smoke tests run completely offline using fixtures without making production network calls:

```bash
bun run packages/rag-mirror/fixtures/smoke.ts
```
