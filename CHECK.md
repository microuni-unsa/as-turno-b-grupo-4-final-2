# Manual Verification & Review Checklist: UNSA PIMS Agentic Operator

> **System**: UNSA PIMS Agentic Operator (Turno B Grupo 4)  
> **Normative Framework**: ISO/IEC 27701:2025 (PII Controller Role: Admissions & Payroll Scope)  
> **Primary Source of Truth**: GESTITEL PIMS (`https://unsa.27k.pe`, tenant `unsa`, prefix `G4-`)  
> **Target Topology**: Debian Bookworm / Bun / Typst / Zellij Web / Traefik `:444` / Cloudflare  

---

## Executive Overview of the Review Plan

This manual review checklist provides a complete, step-by-step verification protocol to validate that **every implemented feature** across the entire codebase operates according to specification.

```mermaid
flowchart TD
    P1["Phase 1: Environment & Orchestration\n(Docker, Traefik, Port :444, Zellij)"] --> P2["Phase 2: Sidecar Services\n(Files Sidecar, Secrets Sidecar)"]
    P2 --> P3["Phase 3: Core Packages & Data Pipeline\n(PIMS Adapter, Typst Molds, pgvector)"]
    P3 --> P4["Phase 4: Connectors & Runtime\n(Documents, Mail Summons, Secret Handles)"]
    P4 --> P5["Phase 5: Agentic Operator & Runtime\n(OMP Config, Banner, /new, /resume, Redaction)"]
    P5 --> P6["Phase 6: The 12 Operational Skills\n(3 Core + 9 Behavioral Skills)"]
    P6 --> P7["Phase 7: End-to-End Examiner Walkthrough\n(Live Demo Simulation & Rehearsal)"]
```

---

## Phase 1: Environment & Container Orchestration Verification

### Task 1.1: Verify Environment Configuration (`.env` & `.enc.env`)
- [ ] Inspect `.env` (or decrypt SOPS `.enc.env` via `nix run nixpkgs#sops -- decrypt .enc.env > .env`) against [.env.example](.env.example).
- [ ] Verify that all required variables are populated with valid values:
  - `PIMS_BASE_URL=https://unsa.27k.pe`
  - `PIMS_USERNAME` & `PIMS_PASSWORD` (Group 4 credentials)
  - `PIMS_TENANT_SCHEMA=unsa`
  - `PIMS_CODE_PREFIX=G4-`
  - `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `DATABASE_URL`
  - `EMBEDDINGS_API_KEY`, `EMBEDDINGS_BASE_URL`, `EMBEDDING_MODEL`
  - `AGENT_ENV_VAR`, `AGENT_API_KEY`, `AGENT_MODEL`
  - `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_SECURE=false`, `SMTP_USERNAME`, `SMTP_PASSWORD`
  - `CORPUS_MIRROR_DIR=/var/lib/pimsai/corpus_mirror`
  - `DOMAIN_ROOT=pimsai.mistercricro8.top`
  - `DOCKER_HOST=tcp://docker-proxy:2375` (or host daemon)
- [ ] Confirm no placeholder string `CHANGEME` remains in `.env` and that `.enc.env` exists in repo encrypted with the configured `age` recipients.

### Task 1.2: External Docker Network Verification
- [ ] Verify or create the external proxy network:
  ```bash
  docker network inspect internal-proxy >/dev/null 2>&1 || docker network create internal-proxy
  ```
- [ ] Confirm that `internal-proxy` exists and is accessible.

### Task 1.3: Container Images Build
- [ ] Execute Docker Compose build:
  ```bash
  docker compose build
  ```
- [ ] Verify clean compilation of:
  - `pimsai-agent` (from [Dockerfile](Dockerfile): Debian Bookworm, Bun 1.2.4, Node 22, Chromium + `/node_modules` `@playwright/mcp` & `nodemailer`, Typst 0.15, Zellij 0.45, omp 18.18.1, `/var/lib/pimsai/corpus_mirror`)
  - `pimsai-files-sidecar` (from [services/files-sidecar/Dockerfile](services/files-sidecar/Dockerfile): Node 22 native TS)
  - `pimsai-secrets-sidecar` (from [services/secrets-sidecar/Dockerfile](services/secrets-sidecar/Dockerfile): Node 20, Age CLI)

### Task 1.4: Stack Startup & Healthcheck
- [ ] Start the stack:
  ```bash
  docker compose up -d
  ```
- [ ] Verify that all 4 containers are running and healthy:
  ```bash
  docker compose ps
  ```
  - `pimsai-db`: `healthy` (PostgreSQL 16 + pgvector listening on 5432)
  - `pimsai-agent`: `running` (Zellij Web listening on 8082)
  - `pimsai-files-sidecar`: `running` (Upload service listening on 3000)
  - `pimsai-secrets-sidecar`: `running` (Secrets service listening on 3000)

### Task 1.5: Reverse Proxy Edge & Port 444 Verification
- [ ] Verify Traefik routing and Cloudflare port mapping:
  ```bash
  # Check direct origin port 444 (bypassing Cloudflare transform)
  curl -vk https://demo.pimsai.mistercricro8.top:444/
  curl -vk https://files.pimsai.mistercricro8.top:444/health
  curl -vk https://secrets.pimsai.mistercricro8.top:444/healthz

  # Check public port 443 (via Cloudflare edge)
  curl -f https://files.pimsai.mistercricro8.top/health
  curl -f https://secrets.pimsai.mistercricro8.top/healthz
  ```
- [ ] Verify that HTTP status 200 is returned.

### Task 1.6: Zellij Web Session & Token Generation
- [ ] Generate authentication tokens for the instructor session:
  ```bash
  # Read-Write token (for active evaluator)
  docker compose exec agent zellij web --create-token

  # Read-Only token (for passive observers)
  docker compose exec agent zellij web --create-read-only-token
  ```
- [ ] Access `https://demo.pimsai.mistercricro8.top:444` in a browser.
- [ ] Enter the Read-Write token and verify that the `omp` interactive terminal attaches with clean locked mode.

### Task 1.7: Headless Browser / Playwright MCP Verification
- [ ] Inside `pimsai-agent`, confirm Chromium and `@playwright/mcp` resolve cleanly:
  ```bash
  docker compose exec agent which chromium node
  docker compose exec agent node /node_modules/@playwright/mcp/cli.js --version
  ```
- [ ] Verify [.omp/mcp.json](.omp/mcp.json) configures stdio `"playwright"` (`--headless --browser chrome --executable-path /usr/bin/chromium --no-sandbox --output-dir /tmp/playwright-mcp`) and loads in `omp`.

---

## Phase 2: Sidecar Services Manual Functional Testing

### Task 2.1: Files Sidecar (`files-sidecar`)
- [ ] **Health Check**:
  ```bash
  curl -s http://localhost:3000/health
  ```
  Expected: `{"status":"ok","service":"files-sidecar",...}`.
- [ ] **Session Minting (`upload-and-read`)**:
  ```bash
  MINT_RESP=$(curl -s -X POST http://localhost:3000/api/mint \
    -H "Content-Type: application/json" \
    -d '{"flow":"upload-and-read"}')
  echo "$MINT_RESP"
  TOKEN=$(echo "$MINT_RESP" | jq -r '.token')
  ```
  Verify: `token` is non-empty, `expires_in_seconds` is 300 (5 minutes), `upload_to_pims` is `false`.
- [ ] **Web Form Display**:
  Open `http://localhost:3000/upload/$TOKEN` (or `https://files.pimsai.mistercricro8.top:444/upload/$TOKEN`) in a browser. Confirm modern drag-and-drop form renders.
- [ ] **File Upload Submission & Preservation**:
  Upload a test document via cURL:
  ```bash
  echo "Test file content for PIMS verification" > /tmp/test-upload.txt
  curl -s -X POST http://localhost:3000/upload/$TOKEN \
    -F "file=@/tmp/test-upload.txt;filename=test-upload.txt"
  ```
  Verify: Response status 200/completed and file saved to `/app/data/preserved_uploads/<token>_test-upload.txt`.
- [ ] **Single-Use Enforcement**:
  Attempt to upload again using the same `$TOKEN`.
  Verify: HTTP 409 Conflict (`TOKEN_ALREADY_USED`).
- [ ] **50MB File Size Guard**:
  Attempt to upload a payload exceeding 50 MB (`MAX_FILE_SIZE_BYTES`).
  Verify: HTTP 413 (`FILE_TOO_LARGE`).
- [ ] **Deliverable Publishing (`/api/publish`)**:
  ```bash
  PUB_RESP=$(curl -s -X POST http://localhost:3000/api/publish \
    -H "Content-Type: application/json" \
    -d '{"slug":"manual-qa-report","filename":"report.html","content":"<h1>QA Verification Passed</h1>"}')
  echo "$PUB_RESP"
  ```
  Verify: Returns `url` pointing to `https://files.pimsai.mistercricro8.top:444/p/manual-qa-report`.
  Fetch `http://localhost:3000/p/manual-qa-report` and verify HTML is served inline.
  Fetch `http://localhost:3000/p/manual-qa-report?download=1` and verify `Content-Disposition: attachment`.
- [ ] **Post-Upload "Ask First" Rule**:
  Verify the operator does **not** auto-vectorize or auto-upload to PIMS upon upload completion, but rather presents the received file metadata and asks the user what to do with it.

### Task 2.2: Secrets Sidecar (`secrets-sidecar`)
- [ ] **Health Check**:
  ```bash
  curl -s http://localhost:3000/healthz
  ```
  Expected: `{"status":"ok"}`.
- [ ] **Secret Request Generation**:
  ```bash
  SEC_RESP=$(curl -s -X POST http://localhost:3000/api/secrets/request \
    -H "Content-Type: application/json" \
    -d '{"label":"jira_api_token","scope":"connectors"}')
  echo "$SEC_RESP"
  SEC_TOKEN=$(echo "$SEC_RESP" | jq -r '.token')
  SEC_URL=$(echo "$SEC_RESP" | jq -r '.url')
  ```
  Verify: `SEC_URL` equals `https://secrets.pimsai.mistercricro8.top:444/s/<token>`, expires in 300s.
- [ ] **Web Paste Form**:
  Open `http://localhost:3000/s/$SEC_TOKEN` in a browser. Confirm password-masked input form renders.
- [ ] **Secret Submission & Age Encryption**:
  Submit a test secret:
  ```bash
  SUB_RESP=$(curl -s -X POST http://localhost:3000/s/$SEC_TOKEN \
    -H "Content-Type: application/json" \
    -d '{"secretValue":"super-secret-key-12345"}')
  echo "$SUB_RESP"
  HANDLE=$(echo "$SUB_RESP" | jq -r '.handle')
  ```
  Verify: `HANDLE` follows format `secret:jira_api_token@v1`.
  Verify disk storage: Check `/var/lib/secrets-store/` contains age-encrypted ciphertext, never plaintext.
- [ ] **PostgreSQL Registry Entry**:
  Verify entry in table `secrets_registry`:
  ```sql
  SELECT * FROM secrets_registry WHERE name = 'jira_api_token';
  ```
- [ ] **Secret Polling**:
  ```bash
  curl -s http://localhost:3000/api/secrets/poll/$HANDLE
  ```
  Verify: Response returns `{"status":"completed","handle":"secret:jira_api_token@v1",...}` with **zero** plaintext secret value.
- [ ] **Zero-Leak Guarantee**:
  Confirm that the plaintext `"super-secret-key-12345"` does not appear in terminal logs, database rows, or JSON responses.

---

## Phase 3: Core Packages & Data Pipeline Testing

### Task 3.1: PIMS Adapter Package & Companion CLI (`packages/pims-adapter`, `scripts/pims.ts`)
- [ ] **Multi-Tenant Write-Only Guard (`assertG4WriteCode`)**:
  Verify that calling `docs create`, `incidents create`, or `incidents update` with a code not starting with `G4-` (e.g. `G2-POL-001`) immediately exits non-zero with `TenantGuardViolationError` BEFORE sending an HTTP request. Also verify `docs create` and `docs add-version` reject missing `.pdf` filename / `--file-name` (`PimsValidationError`, never silently defaulting to `"version.pdf"`).
- [ ] **Uniform System-Wide Reads & Envelope Normalization**:
  Verify that `docs list`, `incidents list`, `audits list`, `risks list`, `assets list`, and `docs versions` normalize both plain JSON arrays and `{ count, results }` paginated envelopes and return full system records without `G4-` read filtering.
- [ ] **Authentication & Token Lifecycle**:
  Execute via `bun scripts/pims.ts` without printing tokens/secrets:
  ```bash
  bun scripts/pims.ts docs list --compact
  ```
  Verify: Authenticates cleanly with PIMS GESTITEL in-process using `PIMS_USERNAME` / `PIMS_PASSWORD`, zero JWT/credential leakage to stdout/stderr.
- [ ] **Live Full-System Reads (Documents, Incidents, Audits, Risks, Assets, Dashboard)**:
  ```bash
  bun scripts/pims.ts docs list --compact
  bun scripts/pims.ts incidents list --compact
  bun scripts/pims.ts audits list --dedupe --compact
  bun scripts/pims.ts risks list --compact
  bun scripts/pims.ts assets list --compact
  bun scripts/pims.ts dashboard --compact
  ```
  Verify: Structured, compact summary output across all records without `G4-` read filtering.
- [ ] **403 Probe Fallback Verification**:
  Note that `/api/trainings/` and `/api/system-catalogs/` return HTTP 403 for `grupob4` (`PimsTrainingsForbiddenError`), and that training records come from uploaded documents (`G4-CAP-INC-01` / `G4-REG-CAP-01`).

### Task 3.2: Typst Molds & XLSX Compilation (`molds/`, `corpus_g4_src/`)
- [ ] **Full Render Test (`scripts/render-all.ts`)**:
  Run:
  ```bash
  bun scripts/render-all.ts
  ```
  Verify:
  - Exit code is 0.
  - All 54 Typst version callers (`corpus_g4_src/**/*.typ`) compile to PDF without syntax or font errors.
  - All 9 normative XLSX spreadsheets are generated:
    - Incident Register (ISO 27701 B.3.12): `G4-REG-INC-01` (v1, v2, v3)
    - Risk Assessment (Apéndice 1): `G4-RSK-INC-01` (v1, v2, v3)
    - Risk Treatment Plan (Apéndice 2): `G4-PLN-RSK-01` (v1, v2, v3)
  - 18 manifest files (`corpus_mirror/<code_id>/manifest.json`) are updated with matching SHA-256 digests.
- [ ] **Decoupled Architecture Verification**:
  - Confirm that `molds/**/mold.typ` are pure, stateless parameterized functions with **zero** hardcoded instance data.
  - Confirm that version callers in `corpus_g4_src/` pass data dictionaries via `#let data = (...)`.
  - Confirm that `molds/` is never modified in-place during normal operation.

### Task 3.3: pgvector Mirror & RAG Engine (`packages/rag-mirror`)
- [ ] **Run Unit & Smoke Tests**:
  ```bash
  bun packages/rag-mirror/fixtures/smoke.ts
  ```
  Verify all 6 tests pass:
  1. Ingest v1
  2. Ingest v2 (supersedes v1)
  3. Query with cosine search & metadata filter
  4. Structural version comparison (diff v1 vs v2)
  5. Missing version typed error handling
  6. Re-vectorization from local corpus mirror
- [ ] **Test RAG Query CLI (`scripts/rag-query.ts`)**:
  Execute against local pgvector database:
  ```bash
  bun scripts/rag-query.ts "procedimiento de respuesta ante incidentes" --limit 3
  ```
  Verify:
  - Returns verbatim quotes from `chunks`.
  - Citation follows exact standard: `pims:<doc_id>:v<version>:chunk:<id>:lines:<start>-<end>`.
  - Check distance metric is cosine distance (`<=>`).
- [ ] **Test Full-Document Read & Extracted PDF Diff (`scripts/pims.ts mirror read`, `scripts/pims.ts diff`)**:
  ```bash
  bun scripts/pims.ts mirror read G4-PRC-INC-01 | head -n 40
  bun scripts/pims.ts diff G4-PRC-INC-01 --from 1.00 --to 3.00
  ```
  Verify: `mirror read` (delegating to canonical `scripts/rag-query.ts --full`) dumps clean normalized UTF-8 text from `CORPUS_MIRROR_DIR/<doc.code>/v<n>.txt` (or ordered `chunks`), and `diff` diffs extracted PDF text cleanly via `pdftotext` (never `%PDF-` binary bytes).

### Task 3.4: PIMS Truth Synchronization (`scripts/pims.ts mirror sync`, `scripts/sync-pims-truth.ts`)
- [ ] **One-Shot Sync Pass (`doc.code` Keying)**:
  ```bash
  bun scripts/pims.ts mirror sync
  # (Delegates directly to canonical scripts/sync-pims-truth.ts)
  bun scripts/sync-pims-truth.ts
  ```
  Verify:
  - Connects to `https://unsa.27k.pe` and fetches all PIMS documents.
  - Keys `CORPUS_MIRROR_DIR/<doc.code>/` and `pimsai-db` (`pims_registry`, `chunks`) strictly by **`doc.code`** (e.g. `G4-POL-01`), never numeric DB IDs.
  - Writes sibling extracted `v<n>.txt` alongside every `.pdf`.
  - Prunes any stale numeric-ID rows/folders and mismatched seed versions.
- [ ] **Loop Mode Check (Compose Hook)**:
  Verify `bun scripts/pims.ts mirror sync --loop --interval 300` (or `bun scripts/sync-pims-truth.ts --loop --interval 300` invoked as background sync hook in compose) starts the background daemon and reports `[sync-loop]` log entries every 5 minutes.

### Task 3.5: PIMS Upload Tool (`scripts/upload-pims-truth.ts`)
- [ ] **Dry-Run Validation**:
  ```bash
  bun scripts/upload-pims-truth.ts
  ```
  Verify:
  - Runs in dry-run mode by default (zero network mutations).
  - Validates all 18 documents.
  - Plans 72 POST operations (18 creates, 36 version additions, 18 approvals).
  - Exits with status 0.
- [ ] **Live Upload Evidence Inspection**:
  Verify [docs/PIMS-UPLOAD-EVIDENCE.md](file:///home/cricro/tiny-projects/documents/2026-B/as-turno-b-grupo-4-final-2/docs/PIMS-UPLOAD-EVIDENCE.md) confirms all 54 versions reside on `unsa.27k.pe` with IDs 1 to 18.

---

## Phase 4: Connectors Framework & Runtime Testing

### Task 4.1: Connector Runtime & Secret Handles (`connectors/runtime/`)
- [ ] **Handle Format Parsing**:
  Verify `parseSecretHandle("secret:db_token@v2")` returns `{ name: "db_token", version: 2 }`.
  Verify invalid formats (e.g. `secret:foo`, `plain-token`) throw `SecretHandleFormatError`.
- [ ] **Docker Env Var Resolution**:
  Verify `resolveToDockerEnv("API_KEY", "secret:test@v1")` outputs `["--env", "API_KEY=..."]` without printing the value.
- [ ] **Dynamic Skill Registration (`registerConnector`)**:
  Test registration of template connector:
  ```typescript
  import { registerConnector } from "./connectors/runtime/register.ts";
  await registerConnector({
    connectorDir: "connectors/mail",
    skillPath: ".omp/skills/connectors/SKILL.md",
  });
  ```
  Verify: Idempotently wraps and inserts `<!-- CONNECTOR: mail START -->` into `.omp/skills/connectors/SKILL.md`.

### Task 4.2: Mail Connector & Real Gmail SMTP Dispatch (`connectors/mail/`)
- [ ] **Persisted Draft Summons Creation**:
  Create draft summons across citations (`pims:`, `audit:`, `incident:`, or `"Sin evidencia"`):
  ```typescript
  import { MailConnectorClient } from "./connectors/mail/client.ts";
  const mailClient = new MailConnectorClient({ fromAddress: process.env.SMTP_USERNAME! });
  const draft = await mailClient.createDraftSummons({
    findingId: "AUD-2026-003-F01",
    nonConformityTitle: "Falta de MFA en portal de admisión",
    severity: "red",
    recipientName: "Responsable SGPI",
    recipientEmail: "dpo@unsa.edu.pe",
    deadlineDate: "2026-11-30",
    evidenceCitation: "pims:G4-PRC-INC-01:v3.00:chunk-1:lines:1-24",
    correctiveActionSummary: "Implementar autenticación de doble factor en portal de admisión",
  });
  ```
  Verify: Draft survives in a fresh `bun` process via `mailClient.getDraft(draft.draftId)` (`MAIL_DRAFTS_PATH`).
- [ ] **Strict Dispatch Gate ("envíalo") + Real Gmail SMTP (`nodemailer`)**:
  - Confirm calling `dispatchSummons(draft.draftId, "ok")` throws `SummonsApprovalRequiredError` (`SUMMONS_APPROVAL_REQUIRED`).
  - Confirm `SMTP_USERNAME` + `SMTP_PASSWORD` resolve cleanly via `nodemailer` (`smtp.gmail.com:587`) and real Gmail SMTP delivery requires `"envíalo"`.

---

## Phase 5: Agentic Operator Interface & Extension Controls (`.omp/`)

### Task 5.1: Startup Banner & Branding
- [ ] Start an interactive session in Zellij Web or terminal:
  ```bash
  omp
  ```
- [ ] Verify that the first visible message is the standardized intro banner from [.omp/extensions/intro.ts](file:///home/cricro/tiny-projects/documents/2026-B/as-turno-b-grupo-4-final-2/.omp/extensions/intro.ts):
  ```
  UNSA PIMS — OPERADOR AGÉNTICO DEL SGPI (GRUPO 4)
  ISO/IEC 27701:2025 — Universidad Nacional de San Agustín
  ...
  Comandos iniciales útiles:
  • /new              Iniciar una nueva conversación limpia
  • /resume           Retomar una sesión anterior
  • mas ayuda         Mostrar la guía operativa completa
  ```

### Task 5.2: Interactive Command `mas ayuda`
- [ ] In chat prompt, send: `mas ayuda`.
- [ ] Verify: Operator intercepts input and outputs the complete operational manual from [.omp/USAGE.md](file:///home/cricro/tiny-projects/documents/2026-B/as-turno-b-grupo-4-final-2/.omp/USAGE.md) without consuming model LLM generation tokens.

### Task 5.3: Session Reset (`/new`) & Session History (`/resume`)
- [ ] Send `/new`.
- [ ] Verify: The active chat session resets immediately, clearing working context while preserving agent configuration. The banner re-appears cleanly.
- [ ] Send `/resume`.
- [ ] Verify: The session history picker opens, allowing selection of prior inspection threads.

### Task 5.4: Transcript Credential Redaction Filter
- [ ] Simulate or send a message containing a JWT token (`eyJ...`), Bearer token, or password assignment.
- [ ] Inspect session transcript in `.omp/` logs.
- [ ] Verify: Redaction replaces raw values with `[REDACTED_JWT_TOKEN]`, `[REDACTED_TOKEN]`, or `[REDACTED_SECRET]`.

### Task 5.5: Token Budget & Degraded-at-Cap Policy
- [ ] Inspect [.omp/config.yml](file:///home/cricro/tiny-projects/documents/2026-B/as-turno-b-grupo-4-final-2/.omp/config.yml):
  - Confirm `task.softRequestBudget: 150`.
  - Confirm `task.softRequestBudgetNotice: true`.
- [ ] Verify degraded-at-cap behavior:
  - If budget cap is crossed, document retrieval and query remain active.
  - Generative modifications pause with mandatory loan profile message directing the user to the loan coordinator.

---

## Phase 6: The 12 Operational Skills Verification (Behavior Matrix)

Verify all 12 `.omp/skills/*/SKILL.md` skills carry valid YAML frontmatter (`name` + `description`), then test each skill:

### Skill 1: `pims-reader`
- [ ] **Prompt**: `"Consulta el documento G4-POL-01 en PIMS y muestra su estado actual y versiones."`
- [ ] **Expected Output**:
  - Connects to GESTITEL API via `bun scripts/pims.ts docs get G4-POL-01` and `bun scripts/pims.ts docs versions G4-POL-01` without reading `.env` or printing JWTs.
  - Reads full PIMS system uniformly (`G4-` enforced only on writes).
  - Returns ID, version (`"3.00"`), status (`R` or `V`), and version history table.
- [ ] **Failure Fallback Probe**:
  - Simulate network disconnection (`PIMS_BASE_URL` unreachable).
  - Verify: Reports exact endpoint + HTTP error, answers immediately from `CORPUS_MIRROR_DIR` + `pimsai-db`, and prefixes with `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]`.

### Skill 2: `doc-necessity`
- [ ] **Prompt**: `"¿Cuáles documentos del SGPI son obligatorios y cuáles son opcionales según ISO/IEC 27701:2025?"`
- [ ] **Expected Output**:
  - Evaluates against clean [reference/iso-27701-2025.md](reference/iso-27701-2025.md) (NOT `docs/ISO-27701-NORMATIVE-MAP.md`) + live PIMS state + `university-facts/`/`G4-ALC-01`/`G4-SOA-01`.
  - Applies 3-tier classification (Unconditional `shall` / Context-/Risk-/Scope-dependent / Discretionary Optional) and PII Controller scope (Tables A.1 & A.3 in scope; A.2 excluded with justification).
  - Also test general normative question (`"¿La ISO 27701 exige un procedimiento de gestión de incidentes?"`) and verify direct normative citation from `reference/iso-27701-2025.md`.

### Skill 3: `version-compare`
- [ ] **Prompt**: `"Compara la versión 1 y la versión 3 de la política de privacidad G4-POL-01 y explica el racional del cambio."`
- [ ] **Expected Output**:
  - Diffs **live PIMS PDFs** via extracted text (`bun scripts/pims.ts diff G4-POL-01 --from 1.00 --to 3.00` or `packages/rag-mirror/diff.ts` / `v<n>.txt`) without relying on `corpus_g4_src/`.
  - Extracts `change_summary` and PDF revision history table; uses internal template rationale **silently (never mentions `RAFA.md` or `RAFA`)**.
  - Publishes via `bun scripts/pims.ts publish` and returns `https://files.pimsai.mistercricro8.top:444/p/<slug>`.

### Skill 4: `incident-ops`
- [ ] **Prompt**: `"Muestra el tablero semafórico de acciones correctivas de incidentes."`
- [ ] **Expected Output**:
  - Reads **all** system incidents (`INC-001`..`INC-012`) and audits (`AUD-2026-001`..`003`) uniformly; deduplicates cloned findings on `AUD-2026-003`.
  - Strict green verification: `🟢 VERDE` ONLY when `status === "C"`, `progress === 100`, `closed_at !== null`, and evidence exists (open `progress: 0` items are never green).
  - Proactively offers to prepare summons via `summons-dispatch`.
  - Publishes deliverable via `https://files.pimsai.mistercricro8.top:444/p/<slug>`.

### Skill 5: `summons-dispatch`
- [ ] **Prompt**: `"Prepara las citaciones para los responsables con acciones en rojo y ámbar."`
- [ ] **Expected Output (Phase A)**:
  - Resolves real recipient emails (`dpo_contact_email`, `rep_email`, or asks user when missing on audit records).
  - Persists drafts on disk via `MailConnectorClient` (`connectors/mail/client.ts`); sends ZERO emails.
  - Displays warning: `Compuerta de Despacho Activa: Escribe 'envíalo' para autorizar el envío`.
- [ ] **Prompt**: `"envíalo"`
- [ ] **Expected Output (Phase B)**:
  - Dispatches real email via Gmail SMTP (`nodemailer`) using `SMTP_*` env without printing credentials.
  - Ends with `resultado aquí: https://files.pimsai.mistercricro8.top:444/p/<slug>` if report generated.

### Skill 6: `audit-chain`
- [ ] **Prompt**: `"Rastrea la cadena de auditoría del hallazgo o incidente pendiente y muestra su evidencia exacta en PIMS."`
- [ ] **Expected Output**:
  - Reads audits & incidents uniformly (no `G4-` read gate).
  - Traces Finding/Incident → NC → Corrective Action → Owner/Deadline → verbatim RAG chunk citation `pims:<doc.code>:v<version>:<chunk_id>:lines:<l1>-<l2>` (`--full` when needed).
  - Publishes via `files-sidecar` at `https://files.pimsai.mistercricro8.top:444/p/<slug>`.

### Skill 7: `directed-version`
- [ ] **Prompt**: `"Actualiza el procedimiento de incidentes G4-PRC-INC-01 para formalizar el canal de reporte en la filial Camaná."`
- [ ] **Expected Output**:
  - Enforces `G4-` write prefix.
  - Inspects live PIMS `/versions/` (via `bun scripts/pims.ts docs versions G4-PRC-INC-01`), aligns PDF cover/footer/history with next PIMS integer (`"4.0"` matching PIMS `"4.00"`), and notes minor vs. major in `change_summary`.
  - Executes copy-then-fill staging (`/tmp/pims-staging/...`) copying `molds/common/` and `molds/<category>/mold*.typ`, reconstructing current data from `CORPUS_MIRROR_DIR` `v<n>.txt` (without `corpus_g4_src/`), and reading `RAFA.md` **silently**.
  - Compiles PDF via Typst, publishes preview via `bun scripts/pims.ts publish`, and **HALTS for explicit human approval** before calling `bun scripts/pims.ts docs add-version ... --confirm` (with explicit `.pdf` `fileName`) or syncing `pgvector`.

### Skill 8: `cascade`
- [ ] **Prompt**: `"La UNSA aprobó la Resolución Rectoral N° 0143-2025 formalizando la Filial Pedregal. Aplica el cambio en cascada sobre los documentos del PIMS."`
- [ ] **Expected Output (Phase A)**:
  - Records institutional fact in `university-facts/`.
  - Scans all documents uniformly across PIMS + `CORPUS_MIRROR_DIR` (`--full` + RAG query).
  - Presents proposed remake batch (with aligned next PIMS integer versions) vs unaffected documents and halts at approval gate.
- [ ] **Prompt**: `"aprobado, procede con la cascada"`
- [ ] **Expected Output (Phase B — compile+preview, then STOPS)**:
  - Compiles approved documents via copy-then-fill staging, publishes previews via `bun scripts/pims.ts publish`, and **HALTS at the second gate** (preview gate is SEPARATE from upload gate).
- [ ] **Prompt**: `"confirmo subida de <doc> v<ver>"` (names doc+version explicitly)
- [ ] **Expected Output (Phase C — upload)**:
  - Uploads new versions with `change_summary` via `bun scripts/pims.ts docs add-version ... --confirm`, runs `bun scripts/pims.ts mirror sync` (or canonical `sync-pims-truth.ts`), and publishes report at `https://files.pimsai.mistercricro8.top:444/p/<slug>`.

### Skill 9: `live-build`
- [ ] **Prompt**: `"Conecta el sistema de incidentes con WhatsApp usando Evolution API."`
- [ ] **Expected Output**:
  - Restates target immediately and keeps main chat responsive.
  - Spawns background subagent building `connectors/evolution/...` (`fetch()` real HTTP, no `G4-` read filtering on incident watchers, registered via `registerConnector()`).
  - Deploys self-hosted container via `docker-proxy:2375` on `internal-proxy` with Traefik `:444`, injects self-generated API key directly at launch (NOT prompting via `secrets-sidecar`), creates instance, and returns live WhatsApp QR code / `:444` setup URL cleanly. (Reserve `secrets-sidecar` + `async: true` poll strictly for external user-owned credentials.)

### Skill 10: `ingest`
- [ ] **Prompt**: `"Sincroniza y re-ingesta el documento G4-SOA-01 en la base de datos vectorial."`
- [ ] **Expected Output**:
  - Downloads PDF from PIMS, saves under `CORPUS_MIRROR_DIR/G4-SOA-01/` (`v<n>.pdf` + extracted `v<n>.txt` + `manifest.json`) keyed strictly by `doc.code`.
  - Computes per-chunk SHA-256 digests + 1024-dim `mistral-embed` vectors and upserts `pims_registry` + `chunks`.

### Skill 11: `connector-builder`
- [ ] **Prompt**: Simulate a connector schema breakage or test connector scaffolding.
- [ ] **Expected Output**:
  - Reports exact failure signature.
  - Executes read-only probes first.
  - Patches `client.ts` and updates `SKILL-FRAG.md`.
  - Answers from pgvector mirror throughout the repair.

### Skill 12: `proactive`
- [ ] **Prompt**: Ask any standard operational question (e.g. `"¿Cuál es el alcance actual del SGPI?"`).
- [ ] **Expected Output**:
  - Answers the direct question accurately.
  - Proactively offers contextually adjacent information (*"¿Deseas examinar también la Declaración de Aplicabilidad (SoA) que deriva de este alcance?"*).
  - Routes speculative requests gracefully to `live-build`.

---

## Phase 7: End-to-End Examiner Walkthrough (Rehearsal Simulation)

Conduct this unbroken sequence simulating the course instructor's live evaluation:

```
[Step 1: Welcome & Setup]
  1. Access Zellij Web via instructor token.
  2. Confirm session banner displays clean identity and commands.
  3. Send: mas ayuda -> Confirm complete guide prints.
  4. Send: /new -> Confirm session resets cleanly.

[Step 2: Normative & State Queries]
  5. Ask: "¿Cuál es el rol de la UNSA bajo ISO/IEC 27701:2025 y qué tablas del Anexo A aplican?"
     -> Verify: PII Controller, Tables A.1 and A.3 in scope, Table A.2 excluded with justification in SoA.
  6. Ask: "¿Cuáles documentos de nuestro alcance son obligatorios según la norma?"
     -> Verify: doc-necessity shall-test execution against live PIMS state.

[Step 3: Incidents & Traffic Light Governance]
  7. Ask: "Muestra el estado de incidentes y no conformidades."
     -> Verify: incident-ops Red/Amber/Green audit4 table across all system incidents/audits with deduplicated findings and strict green check.
  8. Ask: "Prepara las citaciones para los responsables en rojo."
     -> Verify: summons-dispatch persisted draft table using real PIMS emails; pauses at human gate.
  9. Send: envíalo
     -> Verify: real Gmail SMTP dispatch executed and delivery log published at `:444/p/<slug>`.

[Step 4: Evidence & Version Control]
  10. Ask: "Explica el hallazgo o incidente pendiente y muestra su evidencia auditable."
      -> Verify: audit-chain trace with verbatim chunk quote and pims:... citation.
  11. Ask: "¿Qué cambió entre la v1 y v3 del procedimiento de incidentes G4-PRC-INC-01?"
      -> Verify: version-compare extracted-text structural diff and history rationale (no internal file citations).

[Step 5: Live Mutation & Dynamic Build]
  12. Ask: "¿Cómo te subo un archivo de auditoría externo?"
      -> Verify: files-sidecar minting link; async: true poll; "Ask First" inspection upon upload.
  13. Ask: "Conecta las alertas de incidentes con Evolution API / WhatsApp."
      -> Verify: live-build background dispatch; self-hosted key injected & QR code returned directly; uninterrupted main chat.
```

---

## Final Verification Sign-Off Table

| Subsystem / Feature Area | Verification Status | Tested By | Date | Notes |
|---|---|---|---|---|
| **1. Docker & VPS Orchestration** | ⬜ PASS / ⬜ FAIL | | | |
| **2. Sidecars (Files & Secrets)** | ⬜ PASS / ⬜ FAIL | | | |
| **3. PIMS Adapter & Tenant Isolation** | ⬜ PASS / ⬜ FAIL | | | |
| **4. Typst Molds & XLSX Compilers** | ⬜ PASS / ⬜ FAIL | | | |
| **5. pgvector RAG Mirror & Citations** | ⬜ PASS / ⬜ FAIL | | | |
| **6. Connectors Framework & Mail Gate** | ⬜ PASS / ⬜ FAIL | | | |
| **7. OMP Interface & Extension Tools** | ⬜ PASS / ⬜ FAIL | | | |
| **8. The 12 Operational Skills** | ⬜ PASS / ⬜ FAIL | | | |
| **9. Live Examiner Simulation Walkthrough** | ⬜ PASS / ⬜ FAIL | | | |
