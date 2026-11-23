# PIMS Documents Connector Skill Fragment (LEGACY REFERENCE ONLY)

> **Important Notice**: This connector fragment reflects the early standalone connector prototype. **All production PIMS operations** (documents, versions, incidents, audits, risks, assets) MUST use `packages/pims-adapter/client.ts` (and the unified SDK/CLI specified in `docs/PIMS-SDK-SPEC.md`).  
> **Connector Type:** GESTITEL PIMS Documents Management API  
> **Tenant Write Prefix:** `G4-` (Enforced strictly on writes; reads operate across the full system)  
> **Base URL:** `https://unsa.27k.pe` (Schema: `unsa`)

---

## 1. Endpoint Map

| Endpoint | Method | Auth Required | Parameters / Payload | Return Shape | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/business/login/` | `POST` | No (Uses credentials) | `{ username, password }` | `{ access: JWT, refresh: JWT }` | Authenticates against GESTITEL backend; tokens stored in secrets runtime. |
| `/api/documents/` | `GET` | Yes (`secret:<name>@<v>`) | `filters: { codePrefix, responsible, category, status }` | `PimsDocumentRecord[]` | Lists tenant documents. Enforces `G4-` code prefix filter to isolate Group 4 records. |
| `/api/documents/{id}/` | `GET` | Yes (`secret:<name>@<v>`) | `id: number` | `PimsDocumentRecord` | Retrieves single document details, metadata, approval data, and gap links. |
| `/api/documents/{id}/versions/` | `GET` | Yes (`secret:<name>@<v>`) | `documentId: number` | `PimsDocumentVersionRecord[]` | Retrieves full version history with change summaries and timestamps. |
| `/api/documents/` | `POST` | Yes (`secret:<name>@<v>`) | FormData: `code, name, category, status, responsible` + `upload_file` (PDF) | `PimsDocumentRecord` | Creates a new document. Rejects any code not prefixed with `G4-`. |
| `/api/documents/{id}/versions/` | `POST` | Yes (`secret:<name>@<v>`) | FormData: `file` (PDF) + `change_summary` (string) | `PimsDocumentVersionRecord` | Uploads a new version for an existing document without overwriting old versions. |
| `/api/documents/{id}/approve/` | `POST` | Yes (`secret:<name>@<v>`) | `id: number` | `ApproveDocumentResponse` | Transitions document status to `vigente` (`V`) with approval timestamp and signatory. |

---

## 2. Status Enum Mapping

| UI Status (Human-Readable) | API Status Code | Lifecycle Semantics |
| :--- | :--- | :--- |
| `borrador` | `B` | Initial working draft or draft revision. |
| `en_revision` | `R` | Under review by security committee or internal auditors. |
| `vigente` | `V` | Formally approved and active normative document. |
| `obsoleto` | `O` | Superseded by newer major version or decommissioned. |

---

## 3. Multi-Tenant Isolation Constraints (SPEC 3.1 & 13)

- **Shared Tenant Environment:** The GESTITEL instance is shared with other university project groups.
- **Strict Write Prefix Enforcement:** Writes (`POST /api/documents/`, `POST /api/incidents/`, `PATCH /api/incidents/{id}/`) MUST prefix all codes with `G4-` (e.g., `G4-POL-01`, `G4-INC-01`). Attempts to write without this prefix fail immediately.
- **Uniform System-Wide Reads:** Read operations (`GET /api/documents/`, `GET /api/incidents/`, `GET /api/audits/`) operate across the full system without filtering out non-`G4-` records.

---

## 4. File Format & Size Limits

- **Format:** Accepted format for documents is strictly **PDF** (`.pdf`).
- **File Size Cap:** 10 MB maximum (`MAX_DOCUMENT_FILE_SIZE_BYTES = 10485760`).
- **Typst Integration:** Documents compiled via Typst 0.15 local molds must be validated against the 10 MB cap before multipart upload.

---

## 5. Failure Modes & Self-Heal Diagnostics

| Failure Signature | Diagnostic Analysis | Self-Heal Action (SPEC 8.3) |
| :--- | :--- | :--- |
| `HTTP 401 Unauthorized` | Expired JWT or revoked credentials | Re-login via `/business/login/` using secrets handle `secret:pims_creds@v1`; update access token. |
| `HTTP 400 Bad Request (status)` | Unknown status code submitted | Validate status translation via `toApiStatus()`; assert `B/R/V/O`. |
| `HTTP 403 Forbidden (tenant)` | Non-G4 code or unauthorized category | Verify `code` begins with `G4-`; do not attempt write to other tenants. |
| `HTTP 413 Payload Too Large` | PDF file exceeds 10 MB limit | Compress Typst images/assets; re-render PDF under 10 MB. |
| `HTTP 500 / Network Down` | GESTITEL backend unavailable | Fall back to local pgvector mirror for read requests; report exact error to user. |
