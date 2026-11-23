---
name: pims-reader
description: Standardized full-system readers over PIMS REST API via PimsClient without G4- read filtering, fail-safe pgvector mirror fallback, and credential-hygienic execution.
---

# PIMS Reader Skill (`pims-reader`)

Standardized read interface connecting the agentic operator to the primary source of truth: **GESTITEL PIMS** (`https://unsa.27k.pe`, tenant schema `unsa`).

## 1. Authentication & Credential Hygiene
- **Canonical Client**: Always use `PimsClient` from `packages/pims-adapter/client.ts` (via `bun -e '...'`).
- **Environment Resolution**: `PimsClient` natively reads `PIMS_USERNAME`, `PIMS_PASSWORD`, `PIMS_BASE_URL`, and `PIMS_SCHEMA` from `process.env` inside Node/Bun (or loads `.env` quietly when running standalone).
- **Hard Rules**:
  - **NEVER** read `/app/.env` via file/read tools or `cat .env` into tool outputs.
  - **NEVER** echo, log, or print `access`/`refresh` JWTs, passwords, or `Authorization` headers to stdout/stderr.
  - **Endpoints**: `POST /business/login/` → `{ access, refresh }`; `POST /business/token/refresh/` → `{ access }`; requests include headers `Authorization: Bearer <access>` and `X-PIMS-Schema: unsa`.

## 2. Core Read Operations & Live Schema Contract (`packages/pims-adapter/client.ts`)
Reads operate **uniformly across the entire PIMS system** (zero `G4-` read filtering):
- **Documents**:
  - `client.listDocuments({ page_size: 200 })` → `{ count, next, previous, results: PimsDocument[] }`
    - Live fields: `id`, `code` (e.g. `"G4-POL-01"`), `current_version` (string e.g. `"3.00"`), `name`, `category` (`"PO"|"PR"|"RE"|"IN"`), `status` (`"B"|"R"|"V"|"O"`), `responsible`, `file`, `approved_at`, `approved_by_name`, `related_documents`, `gap_requirements`.
  - `client.getDocument(id)` → `PimsDocument`
  - `client.getDocumentVersions(id)` → normalized `PimsDocumentVersion[]` (`GET /api/documents/{id}/versions/` returns a plain JSON array with `{ id, document, version, file, change_summary, created_at, created_by_name }`).
  - **PDF Binary Download**: Fetch `ver.file` (or `doc.file`) with `Authorization: Bearer ${token}` and `X-PIMS-Schema: ${client.schema}`.
- **Incidents**:
  - `client.listIncidents({ page_size: 200 })` → normalized `PaginatedResult<PimsIncident>` (all incidents: `INC-001`, `G4-...`, etc.; live fields: `incident_code`, `title`, `status: "P"|"C"`, `severity: "L"|"M"|"H"`, `impact`, `dpo_contact_name`, `dpo_contact_email`, `dpo_contact_phone`, `rep_email`, `actions[]`, `attachments[]`, `history[]`).
  - `client.getIncident(id)` / `client.getIncidentHistory(id)` / `client.getIncidentAttachments(id)`.
- **Audits, Risks, Assets, Dashboard & Annex-A Meta**:
  - `client.listAudits({ page_size: 200 })` / `client.getAudit(id)` → live fields: `audit_code`, `name`, `audit_type`, `start_date`, `end_date`, `lead_auditor`, `progress`, `findings[].{classification, description, evidence, position, actions[]}`.
  - `client.listRiskEvaluations()`, `client.getRiskCatalogs()`, `client.getEligibleAssets()`, `client.listAssets()`, `client.getDashboardKpis("summary")`, `client.getAnnexAControlsMeta()`.
  - `client.getTrainings()` & `client.getSystemCatalogs()` → handle `PimsTrainingsForbiddenError` (expected HTTP `403` for `grupob4`; training records live in uploaded documents `G4-CAP-INC-01` / `G4-REG-CAP-01`).

## 3. Tenancy Rule: Uniform Reads, Strict `G4-` Writes
- **Reads**: NEVER filter out records without `G4-` on `listDocuments`, `listIncidents`, `listAudits`, `listRiskEvaluations`, or `listAssets`.
- **Writes**: `assertG4WriteCode` strictly rejects any `POST` / `PATCH` / `DELETE` without `G4-` prefix on codes BEFORE any HTTP call. Never mutate or delete records owned by other student groups without explicit human approval.

## 4. Read-Failure Protocol (Deterministic 3-Step Sequence)
If any PIMS REST call fails (HTTP 4xx/5xx, network timeout, malformed JSON):
1. **Report the Exact Failure**: State the exact endpoint and HTTP status (e.g. `GET /api/incidents/ [HTTP 502 Bad Gateway]`).
2. **Query the pgvector Mirror Immediately**: Run `bun scripts/rag-query.ts "<query>"` (or `--full --doc <doc_code>`) and read `CORPUS_MIRROR_DIR` (`/var/lib/pimsai/corpus_mirror` in container).
3. **Explicitly Label the Source**: Prepend `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]` and remind the user that PIMS is the primary source of truth.

## 5. Self-Heal Participation
When repeated read failures or schema drifts happen:
1. Run read-only GET probes via `PimsClient` or `authenticatedFetch`.
2. Hand diagnostics to `connector-builder` (background subagent) to patch and test fixes while the main session keeps answering from the pgvector mirror.
