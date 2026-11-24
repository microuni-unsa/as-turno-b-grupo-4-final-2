---
name: pims-reader
description: Standardized full-system readers over PIMS REST API via bun scripts/pims.ts without G4- read filtering, fail-safe pgvector mirror fallback, and credential-hygienic execution.
---

# PIMS Reader Skill (`pims-reader`)

Standardized read interface connecting the agentic operator to the primary source of truth: **GESTITEL PIMS** (`https://unsa.27k.pe`, tenant schema `unsa`).

## 1. Authentication & Credential Hygiene
- **Canonical Client**: Always use `bun scripts/pims.ts <command> [subcommand] [flags]` (zero `.env` sourcing required by callers, never prints JWTs or credentials to stdout/stderr).
- **Environment Resolution**: `bun scripts/pims.ts` natively reads `PIMS_USERNAME`, `PIMS_PASSWORD`, `PIMS_BASE_URL`, and `PIMS_SCHEMA` from `process.env` inside Bun (or loads `.env` quietly when running standalone).
- **Hard Rules**:
  - **NEVER** read `/app/.env` via file/read tools or `cat .env` into tool outputs.
  - **NEVER** echo, log, or print `access`/`refresh` JWTs, passwords, or `Authorization` headers to stdout/stderr.
  - **Output Formats**: Commands support `--compact` (token-efficient table/summary format for LLM context) and `--json` (machine-readable structured JSON).
  - **JSON Shapes (do NOT guess keys)**:
    - List commands → `{ count, next, previous, results: [...] }` (NOT `data`). Iterate `results`.
    - Document item → `{ id, code, current_version, name, ... }` (title key is `name`, NOT `title`).
    - `docs versions` → PLAIN ARRAY `[{ id, document, version, file, change_summary, ... }]` (no envelope).
    - Incident item → `{ incident_code, title, status, severity, ... }`; audit item → `{ audit_code, name, findings[] }`.

## 2. Core Read Operations & Live Schema Contract (`bun scripts/pims.ts`)
Reads operate **uniformly across the entire PIMS system** (zero `G4-` read filtering):
- **Documents**:
  - `bun scripts/pims.ts docs list [--search ...] [--category PO|PR|RE|IN] [--status B|R|V|O] [--compact|--json]`
    - Live fields: `id`, `code` (e.g. `"G4-POL-01"`), `current_version` (string e.g. `"3.00"`), `name`, `category` (`"PO"|"PR"|"RE"|"IN"`), `status` (`"B"|"R"|"V"|"O"`), `responsible`, `file`, `approved_at`, `approved_by_name`, `related_documents`, `gap_requirements`.
  - `bun scripts/pims.ts docs get <id_or_code> [--compact|--json]` → single document details.
  - `bun scripts/pims.ts docs versions <id_or_code> [--compact|--json]` → plain JSON array with `{ id, document, version, file, change_summary, created_at, created_by, created_by_name }`.
  - `bun scripts/pims.ts docs download <id_or_code> [--ver <v>] [--out <path>]` → authenticated PDF binary download.
- **Incidents**:
  - `bun scripts/pims.ts incidents list [--status P|C] [--severity L|M|H] [--search ...] [--compact|--json]` (all incidents: `INC-001`, `G4-...`, etc.; live fields: `incident_code`, `title`, `status: "P"|"C"`, `severity: "L"|"M"|"H"`, `impact`, `dpo_contact_name`, `dpo_contact_email`, `dpo_contact_phone`, `rep_email`, `actions[]`, `attachments[]`, `history[]`).
  - `bun scripts/pims.ts incidents get <id_or_code> [--include-emails] [--compact|--json]` (`--include-emails` resolves `dpo_contact_email` & `rep_email`).
- **Audits, Risks, Assets, Dashboard & Annex-A Meta**:
  - `bun scripts/pims.ts audits list [--dedupe] [--compact|--json]`
  - `bun scripts/pims.ts audits get <id_or_code> [--dedupe] [--overdue-only] [--open-only] [--compact|--json]` → live fields: `audit_code`, `name`, `audit_type`, `start_date`, `end_date`, `lead_auditor`, `progress`, `findings[].{classification, description, evidence, position, actions[]}`.
  - `bun scripts/pims.ts risks list [--compact|--json]`
  - `bun scripts/pims.ts risks catalogs [--compact|--json]`
  - `bun scripts/pims.ts risks eligible-assets [--compact|--json]`
  - `bun scripts/pims.ts assets list [--compact|--json]`
  - `bun scripts/pims.ts dashboard [--tab summary] [--compact|--json]`
  - `bun scripts/pims.ts annex-a meta [--compact|--json]`
  - **Training Evidence Note**: `GET /api/trainings/` and `GET /api/system-catalogs/` return HTTP `403` for `grupob4` (expected RBAC behavior); training evidence lives in uploaded documents `G4-REG-CAP-*` / `G4-PRG-CAP-*` (e.g., `G4-REG-CAP-01`, `G4-PRG-CAP-01`).

## 3. Tenancy Rule: Uniform Reads, Strict `G4-` Writes
- **Reads**: NEVER filter out records without `G4-` on `docs list`, `incidents list`, `audits list`, `risks list`, or `assets list`.
- **Writes**: Any mutation via `docs create`, `docs add-version`, `incidents create`, or `incidents update` strictly enforces `G4-` prefix on entity codes (`assertG4WriteCode`) before sending any HTTP request, defaulting to `--dry-run` unless `--confirm` is explicitly passed. Never mutate or delete records owned by other student groups without explicit human approval.

## 4. Read-Failure Protocol (Deterministic 3-Step Sequence)
If any PIMS REST call fails (HTTP 4xx/5xx, network timeout, malformed JSON):
1. **Report the Exact Failure**: State the exact endpoint, HTTP status, and diagnostic returned by `scripts/pims.ts` (e.g. `GET /api/incidents/ [HTTP 502 Bad Gateway]`).
2. **Query the pgvector Mirror Immediately**: Run `bun scripts/pims.ts mirror read <code_or_id> [--ver <v>]` for full extracted document text, or run semantic search `bun scripts/rag-query.ts "<query>"` over `CORPUS_MIRROR_DIR` (`/var/lib/pimsai/corpus_mirror` in container).
3. **Explicitly Label the Source**: Prepend `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]` and remind the user that PIMS is the primary source of truth.

## 5. Self-Heal Participation
When repeated read failures or schema drifts happen:
1. Run read-only CLI diagnostic probes via `bun scripts/pims.ts` (`docs list --json`, `incidents list --json`, `audits list --json`, `risks list --json`, `assets list --json`, `dashboard --json`, `annex-a meta --json`).
2. Hand diagnostics to `connector-builder` (background subagent) to patch and test fixes while the main session keeps answering from the pgvector mirror.
