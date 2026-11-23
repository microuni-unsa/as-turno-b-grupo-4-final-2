# PIMS Agent Tooling & Harness Fixup Plan

Living diagnostic and remediation plan built across live prompt evaluations.

---

## Round 1 — `G4-POL-01` status & version history

### Issues Diagnosed
1. **No usable PIMS CLI + mock connector trap (`connectors/pims-documents/client.ts`)**
   - `connectors/pims-documents/client.ts` is a hardcoded stub/mock (`jwt_acc_...`, `mockDocuments`) that never calls `https://unsa.27k.pe`, while the real HTTP client lives in `packages/pims-adapter/client.ts`.
   - Because there is no CLI wrapper over `packages/pims-adapter`, the agent fell back to 5 `bash` calls with raw `curl` + inline `python3`, authenticating 4 times and hitting stdout truncation.
2. **JWT secret leakage & unfiltered read dumps**
   - `curl -sS .../business/login/ | head -c 500` printed raw `access` and `refresh` JWTs into the transcript, violating `pims-reader` §1.
3. **Array vs. paginated JSON bug in `packages/pims-adapter` + mirror key split**
   - `DocumentsModule.listDocuments`, `IncidentsModule.listIncidents`, and `ReadsModule` list methods assume `{ count, next, previous, results }` (`data.results ?? []`), whereas PIMS endpoints can return plain JSON arrays (`Array.isArray(raw)`).
   - `scripts/seed-local-truth.ts` seeded `pimsai-db` / `corpus_mirror/` using `pims_doc_id = doc.code` (`"G4-POL-01"`, version `"3.0"`, status `"V"`), while `scripts/sync-pims-truth.ts` uses `String(doc.id)` (`"2"`, version `"3.00"`, status `"R"`).
4. **Skill & metadata drift**
   - `connectors/pims-documents/SKILL-FRAG.md` cites `https://pimsai.mistercricro8.top` instead of `https://unsa.27k.pe`.
   - `.omp/skills/pims-reader/SKILL.md` shows outdated schema examples (`category: "politica"`, `current_version: "1.0"`, `responsible: "Turno B Grupo 4"` instead of `"PO"`, `"3.00"`, `"Ing. Carlos M. Benítez"`).

---

## Round 2 — Mandatory vs. Optional SGPI documents (`ISO/IEC 27701:2025`)

### Issues Diagnosed
1. **9 of 12 skills are invisible to `omp` (missing YAML frontmatter)**
   - `read skill://doc-necessity` failed with `Unknown skill: doc-necessity` (`Available: connector-builder, ingest, pims-reader`).
   - Only `connector-builder`, `ingest`, and `pims-reader` have YAML frontmatter (`---\nname: ...\ndescription: ...\n---`) in `.omp/skills/<name>/SKILL.md`.
   - All 9 behavior skills (`audit-chain`, `cascade`, `directed-version`, `doc-necessity`, `incident-ops`, `live-build`, `proactive`, `summons-dispatch`, `version-compare`) omit YAML frontmatter, so `omp` never loads or exposes them (which also explains why `proactive` never triggers).
2. **Over-scoping reads to `G4-` / existing Group 4 uploads**
   - `AGENTS.md` §4.2, `.omp/USAGE.md` §3.2, `pims-reader/SKILL.md`, `memory_summary.md`, and `packages/pims-adapter/guards.ts` (`filterGroup4Records` / `assertGroup4Record`) forced the agent to filter everything to `G4-`, causing it to answer a general ISO/IEC 27701:2025 question solely over the 18 uploaded `G4-` files and miss non-`G4-` context or normative distinctions (e.g., conflating standalone procedure documents like `G4-PRC-DOC-01` / `G4-PRC-CAPA-01` with ISO's requirement for *control* or *evidence/records*).
3. **Mirror `doc.id` vs. `doc.code` pollution confirmed**
   - Live `rag-query.ts` output returned `pims:4:v1.00:2:L58-L65` (`Estado: O`) and `pims:6:v2.00:5` / `pims:4:v3.00:11` (numeric IDs from `sync-pims-truth.ts`) alongside `pims:G4-PRC-DOC-01:v3.0` (from `seed-local-truth.ts`), creating split/stale citations in `pimsai-db`.
4. **`docs/ISO-27701-NORMATIVE-MAP.md` & repo clutter short-circuiting real reasoning**
   - `docs/ISO-27701-NORMATIVE-MAP.md` (created in commit `6e0a7f8` as a Phase 0 mold-authoring guide) pre-bakes every ISO clause directly to an `Artefacto G4 UNSA` column.
   - Because the entire repo is mounted/synced to `/app` (including `CHECK.md`, `docs/SPEC.md`, `docs/REWORK-QA-REPORT.md`, `docs/PIMS-UPLOAD-*`, 63 MB of raw OCR PDFs, and `ISO-27701-NORMATIVE-MAP.md`), the live agent treats authoring/QA artifacts as ground truth instead of reasoning from organizational context + live PIMS state.
5. **Context-blind `doc-necessity` logic (fails instructor requirement)**
   - Current `doc-necessity/SKILL.md` only checks `ISO-27701-NORMATIVE-MAP.md` + `GET /api/documents/` existence (`R`/`V`), ignoring **why** scope- and state-dependent documents are needed or excluded.
   - It fails to evaluate UNSA's actual role (PII Controller vs. Processor), scope (Admissions + Payroll, Filiales Camaná/Pedregal, `university-facts/`), risk evaluations/assets, live incidents/audits, Peruvian legal context (Ley 29733), and Cl. 7.5.1b organizational determinations.
6. **Ad-hoc `.env` sourcing & `bun -e` inline calls**
   - Agent had to discover `packages/pims-adapter/client.ts` via `sync-pims-truth.ts` and manually run `export $(grep ... .env | xargs); bun -e '...'` because no unified SDK CLI exists.
7. **Noisy exploration & stale project memory**
   - `ls -R /app | head -n 120` used instead of `glob`; `~/.omp/agent/memories/--app--/memory_summary.md` reinforces deprecated read-filtering (`filtrar/escribir solo G4-`).

---

## Round 3 — `G4-POL-01` v1 vs. v3 comparison & rationale

### Issues Diagnosed
1. **`version-compare` skill invisible to `omp`**
   - `read skill://version-compare` failed (`Unknown skill: version-compare` — same missing YAML frontmatter bug).
2. **Bypassed live PIMS PDFs via local `corpus_g4_src/` and cited `molds/policy/RAFA.md`**
   - Because `corpus_g4_src/`, `corpus_mirror/G4-*`, and `RAFA.md` were synced to `/app`, and `AGENTS.md` / `version-compare/SKILL.md` instruct reading them, the agent ignored the actual PIMS PDFs in `corpus_mirror/2/` and read `corpus_g4_src/policy/G4-POL-01-v1.typ` / `v3.typ` instead.
   - It also cited `molds/policy/RAFA.md` directly in the user-facing response; `RAFA.md` is internal authoring/execution methodology and must never be cited as evidence.
   - VPS `/app/corpus_mirror/` confirmed polluted by both rsynced `G4-POL-01/` and synced `1/`, `2/`, `3/`.
3. **`packages/rag-mirror/diff.ts` cannot diff PDFs**
   - `readFromCorpusMirror` in `packages/rag-mirror/mirror.ts` calls `content.toString("utf8")` on raw PDF bytes instead of extracting text (`pdftotext` / `v<n>.txt`).
4. **Severe secret exposure (`read /app/.env`)**
   - Agent directly read `/app/.env`, printing `PIMS_PASSWORD`, `EMBEDDINGS_API_KEY`, `OPENCODE_API_KEY`, and `POSTGRES_PASSWORD`/`DATABASE_URL` in plaintext into the session transcript.
5. **Raw `curl` + `python3` login churn**
   - Two more redundant `POST /business/login/` calls due to missing unified PIMS SDK CLI.

---

## Round 4 — Corrective action traffic-light dashboard

### Issues Diagnosed
1. **`audit-chain` & `incident-ops` skills invisible to `omp`**
   - `read skill://audit-chain` and `read skill://incident-ops` both failed (`Unknown skill` — missing YAML frontmatter).
   - Without `incident-ops/SKILL.md`, the agent invented its own semáforo rule (marking open `prog: 0` `UNASSIGNED` `INC-011` as `🟢 VERDE` solely because `due_date > 7d`), miscounted 4 cloned spam rows as 4 items, and skipped `summons-dispatch` / `rag-query.ts` cross-check.
2. **Live PIMS schema mismatch in `packages/pims-adapter/types.ts`**
   - `/api/incidents/` returns `incident_code`, `status: "P"|"C"`, `severity: "L"|"M"|"H"`, `impact`, `assigned_to`/`reported_by`/`created_by`, `actions[].{action_type, action_date, responsible, description, evidence}`, `actions_count`, `resolved_date`, `evidence_refs` — whereas `types.ts` defined `code`, `"open"|"closed"`, `"low"|"high"`, `responsible`, and `actions[].{action_description, due_date, status}`.
   - `/api/audits/` returns `audit_code`, `name`, `audit_type`, `start_date`/`end_date`, `lead_auditor`, `progress`, `findings_count`, `findings[].{classification, description, evidence, position, actions: [{action_plan, responsible, due_date, status, progress, closed_at, is_overdue, position}]}` — whereas `types.ts` defined `code`, `title`, `audit_date`, `responsible`, and `findings[].{severity, non_conformity, evidence_cite}`.
3. **Ad-hoc credential handling & `/tmp` clutter**
   - Agent fell back to `read /app/.env`, pasted plaintext credentials inline across 7 `bash` `curl` calls (6 logins), printed raw JWTs to stdout, and left `/tmp/{inc,aud,risk,inc1,inc11}.json` files behind.

---

## Round 5 — Summons dispatch (red/amber)

### Issues Diagnosed
1. **`PimsClient` silently zeroed out all live incidents & audits**
   - Transcript 4 (raw `curl`) returned 12 incidents (`INC-001`, `INC-011`) and 3 audits (`AUD-2026-002`, `AUD-2026-003`), whereas Transcript 5 (`PimsClient`) returned `TOTAL:0` and `results: []`.
   - `filterGroup4Records` in `packages/pims-adapter/guards.ts` checks `record.code` / `record.responsible`, neither of which exists on live `/api/incidents/` (`incident_code`, `assigned_to`) or `/api/audits/` (`audit_code`, `lead_auditor`). The agent falsely concluded PIMS has no REST NC rows and fell back to `G4-REG-CAPA-01` in the local mirror.
2. **`connectors/mail/client.ts` is a fake mock & SMTP env vars aren't forwarded**
   - `dispatchSummons()` / `sendGenericMail()` hardcode a nonexistent `smtp.pimsai.mistercricro8.top` and return `msg_${Math.random()}@...` with no real SMTP/API transport.
   - `docker-compose.yml` (`services.agent.environment`, no `env_file`) does not forward `SMTP_*` variables from `.env` into `pimsai-agent`.
3. **Skill discovery & SQL schema guesswork**
   - `read skill://summons-dispatch` failed (`Unknown skill` — missing YAML frontmatter), though the agent recovered by `glob` + `read`.
   - Ad-hoc `bun -e` SQL query guessed wrong `chunks` columns (`chunk_index`, `content` instead of `chunk_id`, `text`) and hit a syntax error (`null:1`).

---

## Round 6 — `G4-PRC-INC-01` Camaná reporting channel update

### Issues Diagnosed
1. **Unapproved auto-upload to PIMS (missing approval gate in both `RULES.md` & `directed-version/SKILL.md`)**
   - The agent *did* read `.omp/skills/directed-version/SKILL.md` directly (after `memory://root/skills/...` failed), yet uploaded directly to live PIMS (`POST /api/documents/11/versions/`, creating `v4.00` id `55`) without asking first.
   - Root cause in repo: `RULES.md` §1.1 only gates writes *outside* `documents`/`incidents`/`audits`/`risk-evaluations`, and `directed-version/SKILL.md` Step 8 proceeds directly from Typst compile to PIMS upload with no human-approval gate.
2. **PDF defects & PIMS version drift (`G4-PRC-INC-01_v3.1.pdf`)**
   - **Page 8 signature mismatch (`molds/common/template.typ` lines 200–215):** Signature block prints `Oficial de Seguridad de la Información (OSI / DPO)` above `Dr. Hugo José Sánchez` (who is the Rector, not `Ing. Carlos M. Benítez`) because `sig-role` prefers `owner-role` while `sig-name` prefers `approver.name`.
   - **Version drift (`3.1` in PDF vs. `4.00` in PIMS):** Live `POST /api/documents/11/versions/` auto-numbered the upload as `"4.00"` while the compiled PDF cover, footers, and revision table say `3.1` (and PIMS stored `documents/version.pdf` because `addDocumentVersion` received lowercase `filename` instead of `fileName`).
3. **Staging & `files-sidecar` path friction**
   - Staging failed twice on `../common/template.typ` placement and missing `logo-unsa.png` (`cp -r molds/common` needed).
   - `POST /api/publish` with `file_path: "/tmp/..."` returned `403 FORBIDDEN_PATH` (`services/files-sidecar/server.ts` restricts `file_path` to `/app/data/preserved_uploads`), forcing the agent to copy an outbound PDF into `preserved_uploads/`.
4. **SDK & ingest guesswork**
   - 6 failed/wasted calls guessing `a.documents.list()`, `(det as any).versions`, `ingestDocument`, `ingest()` without a fetcher, and hand-editing `corpus_mirror/G4-PRC-INC-01/manifest.json` while `sync-pims-truth.ts` created `corpus_mirror/11/v4.00.pdf`.

---

## Round 7 — WhatsApp incident alerts

### Issues Diagnosed
1. **Built a fake stub instead of provisioning Evolution API + QR code**
   - Live inspection on `cricro-vm` (`~/server-data/pimsai/connectors/whatsapp/client.ts`) confirmed `EvolutionWhatsAppClient` is a no-network stub (`dispatch simulado, sin red real`) returning fake `wa_<ts>_<last4>` IDs with zero `fetch()` calls.
   - Despite `docker-proxy:2375` returning `OK` with full permissions (`CONTAINERS=1`, `POST=1`, `IMAGES=1`, `NETWORKS=1`) and the user selecting *"Evolution API propia"*, the agent did **not** spawn an Evolution API sibling container, did **not** create an instance or return a QR code to scan, did **not** call `registerConnector()`, and did **not** wire an incident watcher.
   - Instead, `live-build/SKILL.md` pushed it to treat Evolution as an external service—stalling on a `secrets-sidecar` link asking the user for an `evolution_api_key` and external `baseUrl`.
2. **`G4-` guard on incident alerts would reject real PIMS incidents**
   - `sendIncidentAlert()` rejects any `code` not starting with `G4-`, whereas live PIMS incidents use `INC-001`, `INC-011` (`incident_code`).
3. **Harness/tool friction & main-fs deploy pollution**
   - First `task` call failed (`Unknown eval tool(s)`), first `todo init` failed (`Missing list`), and `read skill://incident-ops` failed (missing YAML frontmatter).
   - On `cricro-vm`, `~/server-data/pimsai` is bind-mounted directly as `/app`, mixing repo code with `.env`, `root:root` volume mountpoints (`data/`, `secrets/`), and runtime-written files (`corpus_mirror/`, `connectors/whatsapp/`, `.playwright-mcp/`, `prompt*.html`). Bare `rsync --delete` is unsafe without strict excludes.

---

## Consolidated Action Plan

### 1. Fix `omp` Skill Discovery (All 12 Skills)
- Add valid YAML frontmatter (`name` + concise trigger `description`) to all 9 missing `.omp/skills/<name>/SKILL.md` files (`audit-chain`, `cascade`, `directed-version`, `doc-necessity`, `incident-ops`, `live-build`, `proactive`, `summons-dispatch`, `version-compare`).
- Verify all 12 skills appear in `<skills>` on `omp` startup.
- Update `incident-ops/SKILL.md` to clarify that `🟢 VERDE` applies strictly to *closed & verified (100% + evidence)*—never open `prog: 0` actions—and instruct deduplicating cloned `AUD-2026-003` rows when summarizing counts.
- Fix `molds/common/template.typ` signature block (`sig-role` / `sig-name` must match the same person, never `owner-role` + `approver.name`).
- Update `RULES.md` §1.1, `AGENTS.md`, `directed-version/SKILL.md`, and `cascade/SKILL.md`:
  - Require **explicit manual approval** before uploading any new document/version to live PIMS (`documents` writes are no longer auto-executed; render + preview/publish draft first, upload only on explicit approval).
  - Copy all of `molds/common/` (including `logo-unsa.png`) into `/tmp/pims-staging/common/` (or use a staging helper script).
  - Account for PIMS integer auto-numbering (`1.00`, `2.00`, `3.00`, `4.00`) when preparing versions so PDF revision metadata and PIMS stay aligned.
  - For `files-sidecar` `POST /api/publish` on files outside `/app/data/preserved_uploads`, pass `content_base64` instead of copying build artifacts into `preserved_uploads/`.
- Update `live-build/SKILL.md`, `connector-builder/SKILL.md`, and `connectors/_template/client.ts`:
  - Background subagents must implement **real HTTP `fetch()` calls** (never `dispatch simulado` stubs) and call `registerConnector()` on completion.
  - When self-hosting a service (e.g., Evolution API), spawn the sibling container via `docker-proxy:2375` on `internal-proxy` with Traefik `:444`, generate/store its API key internally (reserve `secrets-sidecar` for *external* user-owned credentials), create the instance, and return the **QR code / scan link** directly.
  - Drop the `G4-` prefix check on incident alert reads/dispatch (aligning with uniform reads and `G4-` on PIMS writes only).

### 2. Relax Deprecated Read Isolation (Keep `G4-` Write Guard)
- Drop `filterGroup4Records` and `assertGroup4Record` from read paths in `packages/pims-adapter` (keep `assertG4WriteCode` strictly enforced on all writes: `POST`/`PATCH`/`DELETE`).
- Update `AGENTS.md`, `RULES.md`, `.omp/USAGE.md`, `.omp/skills/*/SKILL.md`, and project memory (`memory_summary.md`) to distinguish:
  - **Writes:** `G4-` prefix mandatory.
  - **Reads:** Uniform full-system reads (no read filtering).

### 3. Deploy Hygiene & Runtime-Only Artifacts
- Exclude from deploy rsync: all of `docs/`, `corpus_g4_src/`, `corpus_mirror/` (let `sync-pims-truth.ts` populate 100% from live PIMS), leftover filled files inside `molds/` (e.g. `molds/policy/G4-POL-01.typ`), `CHECK.md`, `FIXUP_PLAN.md`, `.git`, and `flake.*`.
- Keep pure data-free `molds/**/mold.typ`, `molds/common/`, and **`molds/**/RAFA.md`** on deploy.
- Update `AGENTS.md`, `version-compare/SKILL.md`, `directed-version/SKILL.md`, and `cascade/SKILL.md`:
  - **RAFA rule:** Read `molds/<category>/RAFA.md` silently as internal execution/authoring guidance (Rol/Alcance/Formato/Ámbito); **NEVER** mention or cite `RAFA.md` as evidence or in user-facing responses.
  - **`version-compare`:** Diff **actual PIMS PDFs** (extracted text) + PIMS `/versions/` `change_summary` + internal document revision tables (never `corpus_g4_src/`).
  - **`directed-version` / `cascade`:** Construct new `#let data = (...)` callers from live PIMS PDF content + `molds/<category>/mold.typ` + `RAFA.md` instructions (without relying on `corpus_g4_src/`).
- Convert `docs/ISO 27701-2025_ocr.pdf` directly to a clean local Markdown file (e.g. `reference/iso-27701-2025.md` with a Clause/Annex ToC and zero `G4-*` artifact mappings) for deterministic `grep`/`read` access.
- Keep `pimsai-db` (`chunks`) strictly for PIMS organizational documents; update `.omp/skills/doc-necessity/SKILL.md` to point to `reference/iso-27701-2025.md`.
- Document the safe `rsync --delete` deploy command (excluding `.env`, `data/`, `secrets/`, `corpus_mirror/`, `.playwright-mcp/`, `prompt*`, `omp-session-*`, `docs/`, `corpus_g4_src/`, `CHECK.md`, `FIXUP_PLAN.md`, `.git/`, `flake.*`) plus clean-reset instructions (`corpus_mirror/` + `TRUNCATE pims_registry, chunks`).
- Move runtime-generated `corpus_mirror/` (via `CORPUS_MIRROR_DIR` in `docker-compose.yml`) into a dedicated Docker volume (e.g., `/app/var/corpus_mirror`) so `/app` stays a clean code tree.

### 4. Rework `doc-necessity` Around Org Context, Scope & Live PIMS State
- Update `.omp/skills/doc-necessity/SKILL.md` to require a **3-tier context-driven evaluation**:
  1. **Unconditional ISO 27701:2025 `shall` mandates** (always required: Scope 4.3, Policy 5.2, Risk assessment process 6.1.2 & results 8.2, Risk treatment process 6.1.3 & results 8.3, SoA 6.1.3e, Objectives 6.2g, Competence evidence 7.2, Monitoring/measurement results 9.1, Audit programme/results 9.2.2, Management review results 9.3.3, NC/CAPA evidence 10.2).
  2. **Scope-, Risk-, Legal-, and State-Dependent documents** (Cl. 7.5.1b, Cl. 8.1 *"to the extent necessary"*, and Annex A controls): reason explicitly from:
     - **Org role & scope** (`G4-ALC-01` + `university-facts/`): UNSA is PII Controller only (Admissions + Payroll across Arequipa + Camaná + El Pedregal) -> **Table A.2 (PII Processor) is N/A / excluded**; Admissions portal, Payroll telework, and regional filiales drive concrete need for A.1/A.3 controls, ROPA (A.1.2.9), DSR handling (A.1.3.7/A.1.3.10), MDM/VPN, and Ley 29733 compliance.
     - **Live PIMS operational state**: inspect `documents`, `incidents`, `audits`, `risk-evaluations`, and `assets` + SoA (`G4-SOA-01`) to justify why specific procedures/plans/registers (e.g. `PRC-DOC`, `PRC-INC`, `PRC-CAPA`, `CAP-INC`) are **required by the org's own complexity/risks/7.5.1b** vs **not applicable / optional** if a process/risk doesn't exist.
  3. **Purely optional / convenience artifacts** (e.g., `G4-IDX-01` master map, unless adopted under 7.5.1b).
- Explicitly handle **both** general normative questions (*"what does ISO 27701 require & why does it depend on org context?"*) and concrete UNSA PIMS audits without collapsing into a blind `G4-` file inventory.

### 5. Fix `packages/pims-adapter` Response Normalization & Standardize Mirror on `doc.code`
- Normalize plain-array vs. DRF-paginated (`{ count, next, previous, results }`) responses across all list endpoints (`listDocuments`, `listIncidents`, `listAudits`, `listRiskEvaluations`, `listAssets`, `getEligibleAssets`).
- Update `scripts/sync-pims-truth.ts` to key `corpus_mirror/<doc.code>/` and `pimsai-db` (`pims_registry.pims_doc_id`, `chunks.pims_doc_id`) by **`doc.code`** (e.g., `G4-POL-01`), reconcile version formatting (`3.0` vs `3.00`), and clean up numeric-ID rows (`2`, `4`, `6`, etc.) and stale seed rows (`Estado: V` -> `R`).
- Persist extracted normalized text (`v<n>.txt`) in `corpus_mirror/<doc.code>/` during `ingestDocumentToMirrorAndDb` (and/or support full-document dump in `rag-query.ts` / SDK CLI) so the agent can seamlessly escalate from fast pgvector hits to full-document `read`/`grep`.
- Fix `packages/rag-mirror/mirror.ts` / `diff.ts` so PDF comparisons read extracted normalized text (`v<n>.txt` or `pdftotext`) instead of `content.toString("utf8")` over raw PDF bytes.
- Document the exact `chunks` and `pims_registry` table columns (`chunk_id`, `text`, `lines`, `sha256`, `status`, `pims_doc_id`, `pims_version`, `chunk_count`, `chunk_sha256s`, `supersedes`, `mold_path`) in `AGENTS.md` / `ingest/SKILL.md` so the agent never guesses SQL column names.

### 6. Author Full PIMS API SDK + Agent CLI Specification (`docs/PIMS-SDK-SPEC.md`)
- Write a complete specification for a unified TypeScript SDK + companion CLI (`scripts/pims.ts`) covering all GESTITEL PIMS endpoints, for orchestrated implementation after prompt diagnostics:
  - **Consolidation:** Merge/replace the mocked `connectors/pims-documents/client.ts` and `packages/pims-adapter` into one canonical SDK so there are zero competing/fake clients.
  - **Full endpoint coverage & live-verified schemas:** Auth (`/business/login/`, `/business/token/refresh/`), Documents (list, get by `id` or `code`, versions, PDF download, create, add version, approve), Incidents (CRUD, history, attachments — updated to live schema `incident_code`, `P`/`C`, `L`/`M`/`H`, `assigned_to`, `actions[].action_type`/`description`, plus `rep_email` and the DPO contact name/email fields shown in PIMS UI e.g. `dpo.epis@unsa.edu.pe`), Audits (updated to live schema `audit_code`, `name`, `findings[].classification`/`actions[].action_plan`/`is_overdue`), Risk Evaluations (+ catalogs + eligible assets), Assets, Dashboard KPIs, Annex-A Meta, and typed 403 handling (`/api/trainings/`, `/api/system-catalogs/`). Flag `/api/incidents/{id}/` DPO email fields, `/api/risk-evaluations/`, `/api/assets/`, and `/api/dashboard/` for live schema verification before implementation.
  - **Best-effort credential hygiene & CLI ergonomics:** SDK/CLI reads `process.env` natively (with internal `.env` fallback in code if unset) and suppresses JWTs/passwords from stdout so the agent doesn't need to inspect `.env` or inline credentials; compact JSON/table output flags to prevent truncation loops; `G4-` write guard; first-class `ingest` / `publish` CLI subcommands (avoiding `rag-mirror` guesswork, hand-editing `manifest.json`, or `FORBIDDEN_PATH` errors); `addDocumentVersion` accepting/normalizing `fileName`; and structured `pims-reader` failure payloads for seamless pgvector fallback.
  - **Skill & doc alignment:** Update `.omp/skills/pims-reader/SKILL.md` and `connectors/pims-documents/SKILL-FRAG.md` to reference the SDK/CLI, real base URL (`https://unsa.27k.pe`), and live field shapes (`PO`/`PR`/`RE`/`IN`, `"3.00"`).

### 7. Real Gmail SMTP Mail Transport & Headless Playwright MCP
- **Mail (`connectors/mail/client.ts` + compose + `summons-dispatch`):**
  - Replace the `Math.random()` stub with real Gmail SMTP transport (`nodemailer` over TLS/STARTTLS using `SMTP_*` credentials from `.env`).
  - Forward `SMTP_*` env vars in `docker-compose.yml` (`services.agent.environment`) and document placeholders in `.env.example`.
  - Resolve recipient emails from PIMS incident DPO/representative email fields (falling back to asking the user when an audit action's `responsible` has no email), while preserving the strict `"envíalo"` human confirmation gate.
- **Playwright MCP:** Wire `@playwright/mcp` with headless Chromium (`arm64`-compatible) into `pimsai-agent` / `.omp/` MCP config (or as a sibling container on `internal-proxy`), skipping `orca-ide`.
