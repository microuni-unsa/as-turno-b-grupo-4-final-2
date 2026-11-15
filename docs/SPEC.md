# [DEPRECATED] Final Solution Spec — Turno B Grupo 4: Agentic Incidents-PIMS for UNSA

Status: realigned 2026-11-13 (VPS + GESTITEL API + ISO PDF verified live).
Owner: Turno B Grupo 4. Examiner: course instructor (volatile, escalates from Q&A to live "crazy" requests).

## 1. Intent (confirmed)

- Outcome: a VPS link where the instructor interrogates and directs a synthetic UNSA PIMS — incidents vertical deep, management-system skeleton thin — and watches live versioning, comparison, and connector builds.
- Users: instructor solo in his own time (graded exam, loan profile, capped key) + group in class (guided demo, demo profile, supervised key).
- Why now: audit4 finally stated the bar — 80% agent data over our own pseudo-implementation records, 20% normative. Current state (generic LLM Q&A, blank GESTITEL app, zero records) fails.
- Success: predictions of possible behaviors hit live with low latency; anything unbuilt routes through visible live-build; capped loan key + presentation doc for solo access.
- Constraint: quality = live-hit-rate × latency. Depth in incidents; thin elsewhere.
- Scope routing (positive framing): non-incident depth routes to simpler answers + boundary line with adjacent in-scope offer; speculative behaviors route through live-build (#5).

## 2. Normative grounding

- Standard: ISO/IEC 27701:2025, second edition 2025-10, standalone PIMS (local: `ISO 27701-2025_ocr.pdf`, 72 pp).
- Role scoping: UNSA acts as PII controller (Cl. 4.1 determination: the university determines purposes and means for student, admission, payroll processing) → Tables A.1 (controller) + A.3 (both roles). Table A.2 (processor) out of scope by declared role, exclusion justified in the SoA per 6.1.3e + Annex A intro. 
- Auditor order: build/generate documents in clause order 4→10; stage-1 auditors ask by clause number.
- ISO is not a template catalog: it mandates "retain documented information about X" per clause and defines SoA abstractly (6.1.3e + Annex A intro). The ~40 concrete names come from commercial kits (instructor's 27001 kit ≈ €900–1000).
- GDPR is document data only (Annex D is an informative mapping, not requirements): Art. 30/33/34/35 specifics — 72h clock, breach notice contents, DPIA — NEVER drive agent behavior. ISO clauses + Annex A/B drive behavior.
- Supporting docs in repo: `ISO-19011-2026-en_ocr.pdf` (internal-audit method, auditor-training track), `ISO-42001-2023-en_ocr.pdf` (govern our own agent — creative flex), `GDPR.txt` (reference text, see above).

## 3. Source-of-truth model (instructor-mandated)

His PIMS (GESTITEL at `https://unsa.27k.pe`, tenant schema `unsa`) is the primary source of truth. Every team uploads synthetic data into it; the agent reads from it and writes back to it.

- Write path: Typst templates (`.typ`, local only) → render PDF/XLSX → upload via Documents API → version in PIMS. Local `.typ` files are molds, never the record.
- Read path: standardized fast readers over the PIMS REST API (`/business/login/` JWT, then `/api/.../`), plus a pgvector sidecar index of downloaded PIMS file contents for RAG quotes. Reads NEVER hit local `.typ` for content — download from PIMS, parse, cache by version.
- Reads that fail: say exactly what failed → answer from the pgvector mirror of last-known PIMS content → label the source. The mirror is a cache, not the truth.
- RAG: chunk + mistral-embed (1024-dim, OpenAI-compatible endpoint, base_url swap) + pgvector cosine (`<=>`) + metadata filter (pims_doc_id, pims_version, status) + verbatim quotes. Citation format `pims:<doc_id>:v<version>:chunk:lines`, per-chunk SHA-256.
- Local corpus copy: keep a versioned local mirror of every file uploaded (`corpus_mirror/<doc_id>/v<n>.<ext>` + manifest with PIMS ids, SHA-256, upload timestamps). Purpose: drop/modify/re-vectorize without re-downloading; re-upload produces a new PIMS version, never an overwrite.

### 3.1 GESTITEL Documents API (reverse-engineered from production bundle, verified live 2026-11-13)

- Auth: `POST /business/login/` `{username, password}` → `{access, refresh}` JWT. Group-4 credentials live in the secrets store (§4.3), never in chat or repo.
- Create: `POST /api/documents/` multipart FormData — fields `code, name, category, status, responsible` + `upload_file` (the file). Status enum: `borrador/en_revision/vigente/obsoleto` (UI) → `B/R/V/O` (API).
- New version: `POST /api/documents/{id}/versions/` FormData — `file` + `change_summary`.
- Read: `GET /api/documents/`, `GET /api/documents/{id}/` (shape: `id, code, current_version, name, category, status, responsible, file, approved_at, approved_by_name, related_documents, gap_requirements`), `GET /api/documents/{id}/versions/`, `POST /api/documents/{id}/approve/`.
- Formats: documents accept PDF (file input); incident attachments accept `png,tif,bmp,pdf,doc,docx,txt` (~10 MB cap); tabular import is `.xlsx`. Agent generates PDF (Typst) + XLSX (scripted registers).
- Tenant state (2026-11-13): `documents: 0`, `incidents: 12`, `audits: 3`, `risk-evaluations: 0`, `trainings/system-catalogs: 403 for grupob4`. Incidents/audits hold other groups' data (shared schema!) — our reads MUST filter by our incident codes / responsible names; our writes MUST use our `code` prefix (`G4-`).

## 4. VPS topology

- One Ubuntu container (omit Nix on the box; omp's own Dockerfile is Debian-bookworm family — zero compat risk). Bake one image: omp + bun + typst 0.15 + zellij 0.45 + postgres client + docker CLI + anything else that could avoid an install live.
- The agent container joins `internal-proxy`, talks to `docker-proxy:2375` (full Docker API already enabled), and spawns sibling containers on `internal-proxy` with Traefik labels — that is the network-mode hosting model. No static file server: every deliverable is a live service.
- Run as unprivileged user, never root.

### 4.1 `*.pimsai.mistercricro8.top` serving (verified live 2026-11-13)

- DNS: wildcard `*.pimsai` → VPS IP, DNS-only. Cloudflare rule maps 443→444 (user-configured). Traefik `https` entrypoint listens on :444; `*.pimsai.mistercricro8.top` added to the cloudflare certResolver SANs (`traefik_config.yaml`, backup `*.bak-20261113`); on-demand LE issuance verified with a probe container (200 on :444, then removed).
- Convention: service `<slug>` → `https://<slug>.pimsai.mistercricro8.top`, container on `internal-proxy` with labels `traefik.enable=true`, router `pimsai-<slug>`, rule `Host(\`<slug>.pimsai.mistercricro8.top\`)`, entrypoints `https`, `tls.certresolver=cloudflare`, service port label, `traefik.docker.network=internal-proxy`.
- Reserved: `demo` (zellij web), `files` (upload sidecar), `secrets` (secrets sidecar). All other slugs are agent-spawned (deliverables, evidence pages, connector callbacks, Evolution/WhatsApp bridges).
- Publish rule: every deliverable ends as "resultado aquí: link" — agent spawns (or reuses) a container or service serving it under a fresh slug, then announces the URL.

### 4.2 Zellij web

- Serve via `zellij web`; URL `https://demo.pimsai.mistercricro8.top/<session-name>` auto create/attach/resurrect — the instructor link.
- Login tokens: `zellij web --create-token` (hashed, shown once). Instructor gets a read-write token; observers get read-only tokens (`--create-read-only-token`).
- Config: `web_server true`, `web_server_ip 127.0.0.1` (proxy in front), `base_url` if served under subpath.
- Layout: omp's interface only, single pane, no extra panes.

### 4.3 Secrets sidecar (mirrors the upload sidecar)

- Flow: agent needs a credential (Jira key, PIMS password rotation) → calls `secrets.request(label)` → sidecar returns one-time URL `https://secrets.pimsai.../s/<token>` (5-min expiry) → agent shows the link, instructor pastes the secret in the web form → sidecar writes it age-encrypted to the secrets store → agent polls `secrets.poll(handle)` → receives a handle (`secret:<name>@<v>`), NEVER the value. Values never touch chat transcript, logs, or repo.
- Resolution: handles resolve to env vars only inside spawned sibling containers (`secret:<name>@<v>` → env injection at `docker run`), or to Authorization headers inside the connector runtime. The agent process itself can request "use handle H for request R" but cannot print H's value.
- Store: age-encrypted file on the agent volume + `secrets_registry(name, version, created_at, created_by, scope)`; rotation = new version, old stays readable for running containers until they restart.

## 5. omp agent configuration

- Budget: `task.softRequestBudget` configured (cap prevents bankruptcy; budget prevents one request eating the demo). Cap value + degraded behavior stated in the presentation doc. Additionally, recommend running `/new` whenever the agent considers the current "topic of conversation" exhausted.
- Skills live in project `.omp/skills/<name>/SKILL.md` (single config place; never split demo config across global+project — arrays replace, don't merge).
- AGENTS.md: identity, commands, architecture, convention.
- RULES.md (sticky; hard restrictions only): prod-write approval rule, secret handling. Everything else phrased positively (routing, not prohibition).
- Memory: `memory.backend: local` for behavior lessons (Memory Guidance injection); pgvector PIMS mirror for knowledge. Do not conflate.
- Sessions: `/new` reset in place; `/resume` picker for old chats.
- Branding: accept omp chrome, `startup.quiet`. No fork.
- Intro extension (`intro.ts` in project `.omp/extensions/`): on `session_start`, `sendMessage({content: <intro>, display: true}, {triggerTurn: false})` — shows the starting banner as the first visible message in every new chat. Intro ends with `escribe 'mas ayuda' para instrucciones mas detalladas`. On `input` matching `mas ayuda`, the agent writes the full usage guide (serve from a `USAGE.md` skill fragment so the text stays consistent). Same extension hosts the `secrets.request/poll` tools and transcript redaction.

## 6. Corpus: deep-plus-thin (uploaded to PIMS; `.typ` molds local)

### 6.1 Document anatomy (every document)

Code (`G4-` prefix), version, date, page X of Y, confidentiality level, created/reviewed/approved, version-history table (who/when/why), index, `[bracket]` placeholders resolved, RAFA prompt (Rol/Alcance/Formato/Ámbito) recorded in the mold repo for project evidence. Version rule: 1.x minor edits, 2.x major (process added/removed), always via PIMS new-version endpoint with `change_summary`. Old versions are never deleted in PIMS (`status=obsoleto`, still downloadable for the time-machine).

### 6.2 Deep: incidents vertical (× v1/v2/v3) — ISO citations authoritative

Synthetic history: v1 2019 (initial cert) → v2 2022 (post-pandemic scope shrink) → v3 2025 (+Camaná/Pedregal filiales, recert).

1. Incident response procedure (Cl. 8.1 + A.3.11/A.3.12 + guidance B.3.11/B.3.12).
2. Incident register: awareness_at, severity, categories, principals affected, containment, notification state. Register fields are org-determined under Cl. 8.1 + 7.5.1; breach records/notifications per B.3.12 (no 72h clock — that is GDPR Art. 33, document data only).
3. Finding → NC → corrective-action chain (9.2.2 audit programme + 10.2 NC/corrective action) with red/amber/green state + owners + deadlines + evidence links. The chain shape is universal to the PIMS; our deep population is incident findings only.
4. Incident-response training module + exam/attendance records (Cl. 7.2 competence + 7.3 awareness + A.3.17 awareness/education/training; one of the 4 academy tracks — awareness, norm interpretation, implementers, internal auditors — other tracks thin-mentioned).
5. Incident risk rows (6.1.2 assessment method + 6.1.3 treatment incl. risk treatment plan 6.1.3f + register excerpt for incident scenarios).
6. SoA deep rows: A.3.11/A.3.12 + A.1.2.9 (records of processing, ROPA-equivalent) / A.1.3.7 + A.1.3.10 (principals' rights handling, DSR-equivalent) / breach rows under A.3.11/A.3.12 only — with full justifications per 6.1.3e + Annex A intro.

### 6.3 Thin: skeleton (× v1/v2/v3 where evolution matters)

- Scope excerpt (admission core + payroll support — instructor-mandated pair), policy 1-pager, SoA skeleton (all A.1/A.3 rows, 1-line justifications; A.2 rows present as excluded-with-justification), objectives table, doc-control procedure (7.5.2/7.5.3 — legitimizes the version history), audit programme + report shells, management-review minute shells, doc index (auditor's map).

### 6.4 Registry + facts + mirror

- `pims_registry(pims_doc_id, code, pims_version, status, chunk_count, chunk_sha256s, supersedes, mold_path)` — PIMS ids are the keys.
- `university-facts/` dated, sourced facts (filiales, organigrama, ROF) — input to cascade (#8).
- `corpus_mirror/<doc_id>/v<n>.<ext>` + manifest (§3) — local copy for drop/modify/re-vectorize; re-upload = new PIMS version.

## 8. Connectors

### 8.1 Finished pack (pre-built, maximally correct)

- PIMS documents (create + new-version + download + approve + list), PIMS incidents (CRUD + history + attachments), PIMS reads (audits, risk-evaluations + catalogs, assets, dashboard KPIs, annex-A meta), PIMS-mirror RAG, typst generator, file sidecar, secrets sidecar.
- [pims-final](https://github.com/microuni-unsa/as-turno-b-grupo-4-final) `packages/pims-adapter` (~15 endpoints, incidents/audits/risks/assets/dashboard/annex-A) is the starting point; ADD the documents endpoints from §3.1 (missing upstream); writes outside documents/incidents/audits/risks stay approval-gated.

### 8.2 Connector convention (the framework)

`connectors/<name>/` = `client.ts` (typed wrapper) + `SKILL-FRAG.md` (endpoint map, appended to connector skill on registration). Pre-build the template + 2 examples (PIMS documents, mail) so live builds are fill-in-the-blank.

### 8.3 Self-heal loop (in `connector-builder` + `pims-reader` skills)

Report exactly → announce fix attempt → background subagent (probe → diagnose → patch wrapper → update skill endpoint map) → main session keeps answering from PIMS mirror meanwhile → announce verified fix + record lesson. Hard rules: read-only probes first; no prod writes without explicit approval.

## 9. Predicted behaviors (8 + infra)

1. **version-compare** (any doc, any versions): download both versions from PIMS → structural diff → narrate rationale from history tables + RAFA. Missing version → say which, compare available.
2. **incident RAG summons + dispatch**: query NC/corrective chain → red/amber/green table (owner, deadline, evidence) → draft summons → explicit "envíalo" → mail dispatch.
3. **upload-and-read + ingest tool**: "¿cómo te subo un archivo?" → files sidecar URL + token → poll with timeout (default 5 min, announced) → parse → upload to PIMS documents → ack + placement. Ingest tool: `ingest(pims_doc_id, version) → download + chunks + mistral-embed + pgvector + SHA-256 + registry update`. Same path serves #7/#8.
5. **live connector-build** (Evolution/WhatsApp canonical): restate target → background subagent via §8.2 convention → main session stays responsive → verified announcement or diagnosis. Credentials missing → secrets sidecar flow (§4.3), demo continues.
6. **audit-chain drill-down**: finding id → NC → action (owner/deadline/status) → evidence cite (`pims:<doc_id>:v<version>:chunk:lines`). The "ChatGPT can't do this" proof per finding.
7. **directed new-version**: download current version from PIMS + mold + RAFA → apply his direction (scope ±, campus, norm drift) → bump (1.x/2.x rule) → history row → render → upload as new PIMS version with `change_summary` → re-ingest → diff summary. Publish per §4.1.
8. **university-change cascade**: record fact in `university-facts/` (dated, sourced) → impact scan (registry + grep over molds + PIMS search) → propose remake set with reasons → his approve → run #7 per doc → re-ingest → cascade report (touched/untouched + why). Obsolete PIMS versions stay downloadable; true deletes only for contamination/errata, logged.

Proactive-suggestion behavior (graded as intelligence): when he asks X, offer adjacent Y ("¿quieres también el informe que lo originó?"). From audit1 "de la manito" passage.

## 10. Demo vs loan operation

- Demo (class): our supervised key, unscripted (skills are "how to react", not scripts).
- Loan (solo): capped key + tighter budgets. Degraded-at-cap behavior: retrieval + existing docs keep working; generation pauses with a contact message. Cap, reset policy, expiry, rotation note all stated in the presentation doc.
- Presentation doc carries: zellij URL + his login token, cap + behavior, expiry.

## 13. Risks

- Template asks delayed → build from governancedocs checklist + 27001→27701 conversion; slot his formats in on arrival.
- Shared GESTITEL tenant (other groups' incidents/audits visible) → strict `G4-` code prefix + responsible-name filtering on every read; never touch other groups' records.
- `trainings`/`system-catalogs` 403 for grupob4 → training records live as uploaded documents, not module rows; re-probe before demo.
- PIMS endpoints missing/changed → probe pass catches early.
- Heal loop eating demo time → always-answering main session.
- Template contamination across clients (his CELAPAC story) → single-client corpus + generation-through-template.
- Cloudflare 443→444 rule is user-managed: if `https://<slug>.pimsai...` (no port) fails, diagnose the CF rule first; `:444` direct is the fallback.
