# Final Solution Spec — Turno B Grupo 4: Agentic Incidents-PIMS for UNSA

Status: confirmed intent (interview 2026-11-13). Build scope frozen: 8 behaviors + enabling infra.
Owner: Turno B Grupo 4. Examiner: course instructor (volatile, escalates from Q&A to live "crazy" requests).

## 1. Intent (confirmed)

- Outcome: a VPS link where the instructor interrogates and directs a synthetic UNSA PIMS — incidents vertical deep, management-system skeleton thin — and watches live versioning, comparison, and connector builds.
- Users: instructor solo in his own time (graded exam, loan profile, capped key) + group in class (guided demo, demo profile, supervised key).
- Why now: audit4 finally stated the bar — 80% agent data over our own pseudo-implementation records, 20% normative. Current state (generic LLM Q&A, blank GESTITEL app, zero records) fails.
- Success: Predictions of possible behaviors hit live with low latency; anything unbuilt routes through visible live-build; capped loan key + presentation doc for solo access.
- Constraint: quality = live-hit-rate × latency. Depth in incidents; thin elsewhere.
- Scope routing (positive framing): non-incident depth routes to simpler answers + boundary line with adjacent in-scope offer; processor-role (Table A.2) routes to "UNSA scoped as controller" note; speculative behaviors route through live-build (#5).

## 2. Normative grounding

- Standard: ISO/IEC 27701:2025, second edition 2025-10, standalone PIMS (local: `ISO 27701-2025_ocr.pdf`, 72 pp).
- Role scoping: UNSA acts as PII controller → Tables A.1 (controller) + A.3 (security, both roles). Table A.2 (processor) out of scope by declared role.
- Auditor order: build/generate documents in clause order 4→10; stage-1 auditors ask by clause number.
- ISO is not a template catalog: it mandates "retain documented information about X" per clause and defines SoA abstractly (6.1.3e + Annex A intro). The ~40 concrete names come from commercial kits (instructor's 27001 kit ≈ €900–1000).
- Supporting docs in repo: `ISO-19011-2026-en_ocr.pdf` (internal-audit method, auditor-training track), `ISO-42001-2023-en_ocr.pdf` (govern our own agent — creative flex), `GDPR.txt` (Art. 30/33/34 mapping).

## 3. Architecture

```
                                    ┌─────────────────────────────┐
                                    │  VPS (Ubuntu container)     │
instructor ──https── reverse proxy ─┤  zellij web (token auth)    │
  (browser)   (TLS,                 │   ├─ pane: omp (loan/demo)  │
              rate-limit)           │   ├─ pane: subagent builds  │
                                    │   └─ pane: banner/status    │
                                    │  pgvector (corpus index)    │
                   ┌────────────────┤  upload sidecar (token)     │
                   │                │  public/ via static serve   │
                   │                └─────────────────────────────┘
                   │                         │ read-first adapters
                   ▼                         ▼
            live PIMS (unsa.27k.pe)   synthetic corpus (.typ truth)
            secondary connector       primary source of truth
```

- `.typ` sources = editable truth. Rendered PDFs = artifacts. pgvector = query index. Registry DB = version/deprecation ledger.
- Synthetic corpus is the primary source; live PIMS is a secondary connector with explicit labeled fallback. Failed PIMS call → say exactly what failed → answer from synthetic corpus → label the source.
- RAG: chunk + mistral-embed (1024-dim, OpenAI-compatible endpoint, base_url swap) + pgvector cosine (`<=>`) + metadata filter (doc_id, version, status) + verbatim quotes. Keep verbatim: citation format `doc:chunk:lines` and per-chunk SHA-256.

## 4. VPS topology

- One Ubuntu container (omit Nix on the box; omp's own Dockerfile is Debian-bookworm family — zero compat risk). Bake one image: omp + bun + typst 0.15 + zellij 0.45 + postgres client + mounted docker socket + anything else that could avoid an install live. 
- Services: zellij web, omp session, pgvector, upload sidecar (one Bun/Hono endpoint, token auth), static file serve for `public/` (Bun `serve` or `npx serve`, per-link token, behind same proxy).
- Run as unprivileged user, never root.

### 4.1 Zellij web

- Serve via `zellij web`; URL scheme `https://<host>/<session-name>` auto create/attach/resurrect — the instructor link.
- Login tokens: `zellij web --create-token` (hashed, shown once). Instructor gets a read-write token; observers get read-only tokens (`--create-read-only-token`).
- Config: `web_server true`, `web_server_ip 127.0.0.1` (proxy in front), cert paths or proxy-TLS mode, `base_url` if served under subpath.
- Layout: banner pane (agent identity + how-to-start + cap notice in loan mode) + main omp pane + spare pane for background-build visibility.

## 5. omp agent configuration

- Budget: `task.softRequestBudget` configured (cap prevents bankruptcy; budget prevents one request eating the demo). Cap value + degraded behavior stated in the presentation doc.
- Skills live in project `.omp/skills/<name>/SKILL.md` (single config place; never split demo config across global+project — arrays replace, don't merge).
- AGENTS.md: identity, commands, architecture, convention.
- RULES.md (sticky; hard restrictions only): prod-write approval rule, secret handling. Everything else phrased positively (routing, not prohibition).
- Memory: `memory.backend: local` for behavior lessons (Memory Guidance injection); pgvector corpus for knowledge. Do not conflate.
- Sessions: `/new` reset in place; `/export` HTML evidence; `/resume` picker for old chats. No extension needed.
- Branding: accept omp chrome, `startup.quiet`. No fork.

## 6. Corpus: deep-plus-thin

### 6.1 Document anatomy (every document)

Code, version, date, page X of Y, confidentiality level, created/reviewed/approved, version-history table (who/when/why), index, `[bracket]` placeholders resolved, should internally use RAFA (Rol/Alcance/Formato/Ámbito used to generate), required for project evidence. Version rule: 1.x minor edits, 2.x major (process added/removed). Old versions are never deleted (`status=superseded`, still queryable for the time-machine).

### 6.2 Deep: incidents vertical (× v1/v2/v3)

Synthetic history: v1 2019 (initial cert) → v2 2022 (post-pandemic scope shrink) → v3 2025 (+Camaná/Pedregal filiales, recert).

1. Incident response procedure (8.1 + A.3.11/A.3.12).
2. Incident register: awareness_at, severity, categories, principals affected, containment, notification state (A.3.12 + 8.1/9.1).
3. Finding → NC → corrective-action chain, incident findings only (9.2.2 + 10.2) with red/amber/green state + owners + deadlines + evidence links.
4. Incident-response training module + exam/attendance records (7.2, one of the 4 academy tracks; other tracks thin-mentioned).
5. Incident risk rows (6.1.2/6.1.3 method + register excerpt for incident scenarios).
6. SoA deep rows: A.3.11/A.3.12 + ROPA/DSR/breach rows with full justifications.

### 6.3 Thin: skeleton (× v1/v2/v3 where evolution matters)

- Scope excerpt (admission core + payroll support — instructor-mandated pair), policy 1-pager, SoA skeleton (all A.1/A.3 rows, 1-line justifications), objectives table, doc-control procedure (7.5.2/7.5.3 — legitimizes the version history), audit programme + report shells, management-review minute shells, doc index (auditor's map).

### 6.4 Registry + facts

- `corpus_registry(doc_id, version, source_path, chunk_count, chunk_sha256s, supersedes, status, rafa_ref)`.
- `university-facts/` dated, sourced facts (filiales, organigrama, ROF) — input to cascade (#8).

## 8. Connectors

### 8.1 Finished pack (pre-built, maximally correct)

- PIMS incidents (CRUD + history + attachments), PIMS reads (audits, risk-evaluations + catalogs, assets, dashboard KPIs, annex-A meta), corpus RAG, typst generator, file sidecar. 
- [pims-final](https://github.com/microuni-unsa/as-turno-b-grupo-4-final) `packages/pims-adapter` (~15 endpoints) is the starting point; finish missing reads for the vertical; writes outside incidents/audits/risks stay approval-gated.

### 8.2 Connector convention (the framework)

`connectors/<name>/` = `client.ts` (typed wrapper) + `SKILL-FRAG.md` (endpoint map, appended to connector skill on registration). Pre-build the template + 2 examples (PIMS incidents, mail) so live builds are fill-in-the-blank.

### 8.3 Self-heal loop (in `connector-builder` + `pims-reader` skills)

Report exactly → announce fix attempt → background subagent (probe → diagnose → patch wrapper → update skill endpoint map) → main session keeps answering from corpus meanwhile → announce verified fix + record lesson. Hard rules: read-only probes first; no prod writes without explicit approval.

## 9. Predicted behaviors (8 + infra)

1. **version-compare** (any doc, any versions): load both `.typ` sources → structural diff → narrate rationale from history tables + RAFA. Missing version → say which, compare available.
2. **incident RAG summons + dispatch**: query NC/corrective chain → red/amber/green table (owner, deadline, evidence) → draft summons → explicit "envíalo" → mail dispatch.
3. **upload-and-read + ingest tool**: "¿cómo te subo un archivo?" → sidecar URL + token → poll with timeout (default 5 min, announced) → parse → ack + corpus placement. Ingest tool: `ingest(path, doc_id, version, section?) → chunks + mistral-embed + pgvector + SHA-256 + registry update`. Same path serves #7/#8.
5. **live connector-build** (Evolution/WhatsApp canonical): restate target → background subagent via §8.2 convention → main session stays responsive → verified announcement or diagnosis. Credentials missing → instructions, demo continues.
6. **audit-chain drill-down**: finding id → NC → action (owner/deadline/status) → evidence cite (`doc:chunk:lines`). The "ChatGPT can't do this" proof per finding.
7. **directed new-version**: load current `.typ` + RAFA → apply his direction (scope ±, campus, norm drift) → bump (1.x/2.x rule) → history row → render → ingest with supersedes → diff summary. Publish per 7b.
7b. **publish rule**: every deliverable ends as "resultado aquí: link" — render to `public/<session>/<slug>/`, serve via static server behind proxy with per-link token + expiry.
8. **university-change cascade**: record fact in `university-facts/` (dated, sourced) → impact scan (registry + grep over `.typ`) → propose remake set with reasons → his approve → run #7 per doc → re-ingest → cascade report (touched/untouched + why). Superseded chunks stay queryable; true deletes only for contamination/errata, logged.

Proactive-suggestion behavior (graded as intelligence): when he asks X, offer adjacent Y ("¿quieres también el informe que lo originó?"). From audit1 "de la manito" passage.

## 10. Demo vs loan operation

- Demo (class): our supervised key, unscripted (skills are "how to react", not scripts).
- Loan (solo): capped key + tighter budgets. Degraded-at-cap behavior: retrieval + existing docs keep working; generation pauses with a contact message. Cap, reset policy, expiry, rotation note all stated in the presentation doc.
- Presentation doc carries: zellij URL + his login token, cap + behavior, expiry.

## 13. Risks

- Template asks delayed → build from governancedocs checklist + 27001→27701 conversion; slot his formats in on arrival.
- PIMS endpoints missing/changed → probe pass catches early.
- Heal loop eating demo time → always-answering main session.
- Template contamination across clients (his CELAPAC story) → single-client corpus + generation-through-template.
