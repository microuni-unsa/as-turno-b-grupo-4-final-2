# PIMS Unified TypeScript SDK & Companion CLI (`scripts/pims.ts`) Specification

> **Document Status**: Approved Architecture & Implementation Specification
> **Ground Truth Verification**: All endpoint paths, HTTP methods, response shapes, and enum codes below were verified read-only against the live production GESTITEL PIMS API (`https://unsa.27k.pe`, schema `unsa`).

---

## 1. Objectives & Architectural Consolidation

Currently, PIMS access is split across:
1. A partial, mocked connector (`connectors/pims-documents/client.ts` pointing at a non-existent host and fake data).
2. `packages/pims-adapter/` (whose initial TypeScript types assumed mocked schemas such as numeric `version_number` and `code` on incidents rather than live strings `"3.00"` and `incident_code`).
3. Ad-hoc `bun -e` inline invocations scattered across agent skills.

The target architecture consolidates **all** GESTITEL PIMS interactions into a single authoritative TypeScript SDK (evolving `packages/pims-adapter/`) paired with one ergonomic Bun CLI (`scripts/pims.ts`) that covers live reads, gated writes, mirror management, RAG ingestion, PDF diffs, and sidecar publishing.

### Core Design Principles
- **Strict Write-Only Tenant Isolation (`G4-`)**: All `POST`, `PATCH`, `PUT`, and `DELETE` mutations against documents, incidents, or related resources MUST enforce the `G4-` prefix on entity codes (`assertG4WriteCode`), fail fast before HTTP requests, and halt at an explicit human confirmation gate.
- **Uniform Full-System Reads**: Read paths inspect all system records (`documents`, `incidents`, `audits`, `risk-evaluations`, `assets`, `dashboard`, `annex-a-controls/meta`) without filtering out non-`G4-` rows.
- **Zero Silent Fallbacks**: Malformed envelopes throw `PimsReadFailureError`; missing credentials throw `PimsAuthError`; missing `.pdf` filenames on uploads throw `PimsValidationError`.
- **Envelope Normalization**: All collection endpoints handle both DRF paginated objects (`{ count, next, previous, results }`) and plain JSON arrays (`[...]`) uniformly.
- **Zero Credential Leakage**: Credentials read directly from `process.env` (`PIMS_USERNAME`, `PIMS_PASSWORD`, `PIMS_BASE_URL`, `PIMS_SCHEMA`) with optional silent `.env` load when needed; access/refresh JWTs and passwords are **never** printed to stdout/stderr or serialized in errors.

---

## 2. Live-Verified PIMS REST Endpoint & Schema Contract

**Base URL**: `https://unsa.27k.pe` (declared solely in `config.ts`, overridable via `PIMS_BASE_URL`).  
**Required Headers**:
- `X-PIMS-Schema: unsa` (default `unsa`, overridable via `PIMS_SCHEMA`)
- `Authorization: Bearer <access_jwt>` (for `/api/*`)

### 2.1 Authentication
- `POST /business/login/`
  - Request JSON: `{ "username": string, "password": string }`
  - Response JSON: `{ "access": string, "refresh": string, ... }`
- `POST /business/token/refresh/`
  - Request JSON: `{ "refresh": string }`
  - Response JSON: `{ "access": string }`

### 2.2 Documents
- `GET /api/documents/?search=&category=&status=&page=&page_size=`
  - Shape: DRF paginated envelope `{ count, next, previous, results }`
  - Live `Document` fields:
    - `id: number`
    - `code: string` (e.g. `"G4-POL-01"`)
    - `current_version: string` (decimal string, e.g. `"3.00"`, `"1.00"`)
    - `name: string`
    - `category: "PO" | "PR" | "RE" | "IN"`
    - `status: "B" | "R" | "V" | "O"` (`B`=Borrador, `R`=En Revisión, `V`=Vigente, `O`=Obsoleto)
    - `responsible: string`
    - `file: string` (URL or media path to latest PDF)
    - `approved_at: string | null`
    - `approved_by_name: string | null`
    - `related_documents: Array<{ id: number; code: string; name: string }>`
    - `gap_requirements: string[]`
- `GET /api/documents/{id}/` → single `Document`
- **Resolver helper (`resolveDocument(idOrCode)`)**: accepts numeric ID or exact `code` (`"G4-POL-01"`), resolving via search/listing before detail fetch.
- `GET /api/documents/{id}/versions/`
  - Shape: **plain JSON array** (`PimsDocumentVersion[]`)
  - Live item fields: `{ id: number, document: number, version: string, file: string, change_summary: string, created_at: string, created_by: number, created_by_name: string }`
- **Binary PDF Download**: `downloadDocumentPdf(urlOrPath)` with `Authorization` + `X-PIMS-Schema` headers (same-origin media download or fallback signed URL handling).
- `POST /api/documents/` (multipart `FormData`, **`G4-` write guard**):
  - Fields: `code` (starts with `G4-`), `name`, `category` (`PO|PR|RE|IN`, max 50 chars), `status` (`B|R|V|O`), `responsible`, `upload_file` (Blob + explicit `.pdf` filename).
- `POST /api/documents/{id}/versions/` (multipart `FormData`):
  - Fields: `file` (Blob + explicit `.pdf` filename — never `"version.pdf"` fallback), `change_summary` (non-empty).
- `POST /api/documents/{id}/approve/`:
  - Known RBAC behavior: returns HTTP `403` for `grupob4`; typed/reported clearly so administrators execute approval in UI if required.

### 2.3 Incidents
- `GET /api/incidents/?search=&status=&severity=&incident_type=&page=&page_size=`
  - Shape: DRF paginated envelope `{ count, next, previous, results }`
  - Live `Incident` fields (`INC-001`..`INC-012`, etc.):
    - `id: number`
    - `incident_code: string`
    - `title: string`
    - `description: string`
    - `status: "P" | "C"` (`P`=Pendiente/En Proceso, `C`=Cerrado)
    - `severity: "L" | "M" | "H"` (`L`=Low, `M`=Medium, `H`=High)
    - `impact: string`
    - `assigned_to?: string`
    - `reported_by?: string`
    - `dpo_contact_name?: string`
    - `dpo_contact_email?: string`
    - `dpo_contact_phone?: string`
    - `rep_email?: string`
    - `actions: Array<{ action_type: string; responsible: string; action_date: string; description: string; evidence: string; position: number }>`
    - Embedded `attachments: IncidentAttachment[]` and `history: IncidentHistory[]`
- `GET /api/incidents/{id}/` → single `Incident`
- `GET /api/incidents/{id}/history/` → **plain JSON array** of history entries
- `GET /api/incidents/{id}/attachments/` → **plain JSON array** of attachment metadata
- `POST /api/incidents/` (**`G4-` write guard** on `incident_code` / `code`)
- `PATCH /api/incidents/{id}/` (**`G4-` write guard** if code modified)
- `POST /api/incidents/{id}/attachments/` (multipart `FormData`: extension check `png|tif|bmp|pdf|doc|docx|txt`, 10 MB max)

### 2.4 Audits & Findings
- `GET /api/audits/?search=&status=&page=&page_size=`
  - Shape: DRF paginated envelope `{ count, next, previous, results }`
  - Live `Audit` fields (`AUD-2026-001`..`003`):
    - `id: number`
    - `audit_code: string`
    - `name: string`
    - `audit_type: string`
    - `start_date: string`
    - `end_date: string`
    - `lead_auditor: string`
    - `progress: number`
    - `findings_count?: number`
    - `findings: Array<{ id?: number; classification: string; description: string; evidence: string; position: number; actions: Array<{ id?: number; action_plan: string; responsible: string; due_date: string; status: string; progress: number; closed_at: string | null; position: number; is_overdue: boolean }> }>`
- **Audit Deduplication Utility**: Live data on `AUD-2026-003` contains repeated/cloned findings. The SDK/CLI MUST expose a deterministic composite-key deduplicator (`(classification, description, action_plan, responsible)`) preserving original finding counts alongside deduplicated counts.
- **Closure Verification Helper (`isActionClosedVerified`)**: Returns `true` ONLY when `status === "C"` (or closed state), `progress === 100`, `closed_at !== null`, and evidence is present — never misclassifying open `progress: 0` items as green/closed.

### 2.5 Risks, Assets, Dashboard & Annex A Metadata
- `GET /api/risk-evaluations/` → paginated list
- `GET /api/risk-evaluations/catalogs/` → `{ periods, threats, vulnerabilities, control_types, annex_a_controls, active_matrix, ... }`
- `GET /api/risk-evaluations/eligible-assets/` → paginated `{ count, results }`
- `GET /api/assets/` → paginated `{ count, results }` with `{ id, code, name, owner, custodians, is_data_asset, risk_eligible, ... }`
- `GET /api/dashboard/?tab=summary` → `{ kpis: [...], semaphores: [...], series: ... }`
- `GET /api/annex-a-controls/meta/` → `{ standard, groups, roles, sources, has_law_29733, ... }`

### 2.6 Expected 403 Endpoints
- `GET /api/trainings/` → returns HTTP `403` for `grupob4` → throws `PimsTrainingsForbiddenError` (instructing caller that training evidence lives in uploaded documents `G4-REG-CAP-*` / `G4-PRG-CAP-*`).
- `GET /api/system-catalogs/` → returns HTTP `403` → throws `PimsTrainingsForbiddenError`.

---

## 3. Unified CLI Specification (`scripts/pims.ts`)

Invoked strictly as `bun scripts/pims.ts <command> [subcommand] [flags]` with **zero** `.env` sourcing required by callers (loads env natively in-process without printing credentials or tokens).

### Global Flags
- `--json` (machine-readable structured JSON output)
- `--compact` (token-efficient table/summary format for LLM context)
- `--confirm` / `--dry-run` (all mutating commands default to `--dry-run` unless explicit human-approved confirmation is supplied)

### Subcommands
1. `docs list [--search ...] [--category PO|PR|RE|IN] [--status B|R|V|O]`
2. `docs get <id_or_code>`
3. `docs versions <id_or_code>`
4. `docs download <id_or_code> [--ver <v>] [--out <path>]`
5. `docs create --code G4-... --name ... --category PO|PR|RE|IN --status B|R|V|O --responsible ... --file <path.pdf> --file-name <name.pdf>`
6. `docs add-version <id_or_code> --file <path.pdf> --file-name <name.pdf> --summary "..."`
7. `incidents list [--status P|C] [--severity L|M|H] [--search ...]`
8. `incidents get <id_or_code>` (`--include-emails` resolves `dpo_contact_email` & `rep_email`)
9. `incidents create` / `incidents update` (enforces `G4-` write guard)
10. `incidents attach <id_or_code> --file <path>`
11. `audits list [--dedupe]`
12. `audits get <id_or_code> [--dedupe] [--overdue-only] [--open-only]`
13. `risks list` / `risks catalogs` / `risks eligible-assets`
14. `assets list`
15. `dashboard [--tab summary]`
16. `annex-a meta`
17. `mirror sync [--loop] [--interval 300]` (unified wrapper over `CORPUS_MIRROR_DIR` keyed by `doc.code` + `v<n>.txt`)
18. `mirror read <code_or_id> [--ver <v>]` (dumps extracted text from `CORPUS_MIRROR_DIR` or `pimsai-db`)
19. `diff <code_or_id> --from <v1> --to <v2>` (extracts PDF text via `pdftotext` before running line diff — never raw PDF binary)
20. `publish --slug <slug> --file <path> [--filename <name>]` (reads file bytes in-process, sends `content_base64` to `http://pimsai-files-sidecar:3000/api/publish`, returns `https://files.pimsai.mistercricro8.top:444/p/<slug>`)

### Structured Fallback Contract (`--json` on Read Errors)
When a REST call fails (`HTTP >= 500`, connection timeout, etc.), `scripts/pims.ts` exits non-zero and prints a structured JSON diagnostic on stderr/stdout:
```json
{
  "ok": false,
  "error": "PimsReadFailureError",
  "endpoint": "/api/incidents/",
  "status": 502,
  "message": "Bad Gateway",
  "fallback_hint": "Use pgvector mirror via bun scripts/rag-query.ts and prefix answer with [FUENTE: Cache local pgvector mirror (PIMS no disponible)]"
}
```
Notice: zero `access` tokens, zero `refresh` tokens, and zero passwords ever appear in output.

---

## 4. Schema Migration Matrix (Legacy Mocks → Live Production Fields)

| Concept | Legacy Mock (`pims-adapter` v1 / `connectors/pims-documents`) | Live Production Field (`https://unsa.27k.pe`) |
| :--- | :--- | :--- |
| Document version | `version_number: number` / `current_version: number` | `version: string` / `current_version: string` (`"3.00"`) |
| Document version upload | optional `fileName` (`"version.pdf"`) | explicit required `fileName` (`"G4-XXX_v4.0.pdf"`) |
| Document version list | paginated `{ results: [...] }` | **plain JSON array** (`[...]`) |
| Incident identifier | `code: string` | `incident_code: string` (`INC-001`..`INC-012`) |
| Incident status | `"open" \| "investigating" \| "resolved" \| "closed"` | `"P"` (Pendiente) \| `"C"` (Cerrado) |
| Incident severity | `"low" \| "medium" \| "high" \| "critical"` | `"L"` \| `"M"` \| `"H"` |
| Incident contacts | absent | `dpo_contact_name`, `dpo_contact_email`, `dpo_contact_phone`, `rep_email` |
| Incident actions | `{ action_description, due_date, responsible, status }` | `{ action_type, responsible, action_date, description, evidence, position }` |
| Audit identifier/title | `code`, `title` | `audit_code`, `name`, `audit_type`, `lead_auditor`, `progress` |
| Audit findings | flat severity/NC strings | `{ classification, description, evidence, position, actions[].{action_plan, responsible, due_date, status, progress, closed_at, is_overdue} }` |

---

## 5. Deprecation & Removal Plan (MANDATORY Upon Spec Implementation)

Once the unified SDK (`packages/pims-adapter/` updated to match Section 2–4) and `scripts/pims.ts` CLI are implemented and verified, the implementing pass **MUST remove** all deprecated, mocked, and superseded tools/scripts so zero redundant code paths remain:

| Target Path / Symbol | Reason Deprecated | Required Action Upon Implementation |
| :--- | :--- | :--- |
| `connectors/pims-documents/client.ts` | Mocked client with non-existent `pims.gestitel.unsa.edu.pe` host and fake in-memory stubs | **Delete file** once `scripts/pims.ts` + unified SDK replace all usages |
| `connectors/pims-documents/types.ts` | Divergent mock interfaces replaced by canonical live SDK types | **Delete file** alongside `connectors/pims-documents/client.ts` |
| `connectors/pims-documents/SKILL-FRAG.md` | References mocked `PimsDocumentsClient` | **Delete directory** `connectors/pims-documents/` (or replace with thin pointer only if `connectors/README.md` registry requires, otherwise unregister & remove) |
| `connectors/index.ts` exports for `pims-documents` | Re-exports deleted mocked client | **Remove export** of `connectors/pims-documents` |
| Ad-hoc `scripts/rag-query.ts --full` / `scripts/sync-pims-truth.ts` duplicate wrappers | If fully absorbed by `scripts/pims.ts mirror sync` / `scripts/pims.ts mirror read` | **Keep only canonical shared entrypoints** or delegate via `scripts/pims.ts` while deleting duplicate standalone glue scripts (`scripts/lib/*` functions superseded into `packages/pims-adapter` & `packages/rag-mirror`) — update `Dockerfile`/startup hooks accordingly |
| Legacy UI status / mock fields in `packages/pims-adapter/types.ts` | Dual optional mock properties (`code?: string` alongside `incident_code`, `title?` alongside `name`, `uploaded_at?` alongside `created_at`) kept during transition | **Remove mock-only fields** and type strictly against verified live production schemas (`incident_code`, `audit_code`, `version`, `created_at`) |
| Legacy `packages/pims-adapter/fixtures/*.json` mock envelopes | Reflect old `code`/`version_number` mock shapes | **Update fixtures** to exact live anonymized snapshots of `/api/documents/`, `/api/incidents/`, `/api/audits/` |
| Legacy inline `bun -e` REST snippets across `.omp/skills/*/SKILL.md` and `AGENTS.md` | Replaced by deterministic `bun scripts/pims.ts ...` invocations | **Replace** all ad-hoc `bun -e` PIMS snippets across `.omp/skills/*/SKILL.md`, `.omp/USAGE.md`, `AGENTS.md`, `RULES.md`, and `CHECK.md` with exact `scripts/pims.ts` commands |

---

## 6. Acceptance Criteria for Follow-Up SDK Implementation Pass
1. `bun scripts/pims.ts --help` prints all 20 subcommands cleanly.
2. Live read-only check passes against `https://unsa.27k.pe` (`docs list --json`, `incidents list --json`, `audits list --dedupe --json`, `risks catalogs`, `assets list`, `dashboard`, `annex-a meta`) with zero JWT/password strings in stdout/stderr.
3. Write guard rejects `G4-` violations on `docs create`, `incidents create`, and `incidents update` with `TenantGuardViolationError` exit code != 0.
4. `add-version` rejects missing `.pdf` `fileName` and never falls back to `version.pdf`.
5. All deprecated files listed in Section 5 (`connectors/pims-documents/`, obsolete mock types/wrappers, and ad-hoc `bun -e` skill snippets) are deleted and all automated checks + `CHECK.md` pass cleanly.
