# RULES.md — Hard Restrictions & Routing Protocols

This file contains sticky, non-negotiable operational restrictions and positive routing directives for the UNSA PIMS Agentic Operator.

---

## 1. HARD RESTRICTIONS (STICKY)

### 1.1 Production Write Approval Gate & Write-Only `G4-` Tenancy
- **Approval Rule**: ALL live PIMS mutating write operations (`documents`, `versions`, `incidents`, `audits`, `risk-evaluations`, `assets`, or external systems) are strictly approval-gated.
- **Explicit Consent Required**: No `POST`, `PATCH`, `PUT`, or `DELETE` against production PIMS GESTITEL or outbound SMTP/messaging systems may execute without explicit human confirmation. Always present staged previews (`files-sidecar` `:444/p/<slug>` via `content_base64`) or email drafts before executing.
- **Uniform System-Wide Reads**: Reads across `documents`, `incidents`, `audits`, `risk-evaluations`, and `assets` operate uniformly without `G4-` filtering; only writes strictly require `G4-`.

### 1.2 Secret & Credential Handling
- **Credential Hygiene**: **NEVER** inspect `/app/.env`, `cat .env`, or echo/print JWTs, passwords, SMTP credentials, API keys, or DB URIs into tool outputs or chat transcripts. Process-local SDKs (`PimsClient`, `MailConnectorClient`) read `process.env` natively.
- **Self-Hosted vs External Secrets**:
  - For **self-hosted sibling containers** we deploy (`docker-proxy:2375` on `internal-proxy`, e.g., Evolution API), generate/inject API keys directly at launch and surface QR/setup URLs (`:444`) directly—do NOT prompt via `secrets-sidecar`.
  - For **external user-owned credentials**, mint a one-time URL via `secrets-sidecar` (`https://secrets.pimsai.mistercricro8.top:444/s/<token>`), register an `async: true` background poll before replying, and resolve to opaque handles `secret:<name>@<version>`.
- **Transcripts**: Any accidental exposure of tokens or passwords in conversational turns must be redacted cleanly.

---

## 2. POSITIVE ROUTING DIRECTIVES

### 2.2 Speculative & Unbuilt Integrations
- When asked to interact with an unbuilt external tool or system (e.g., Evolution/WhatsApp API), route the request dynamically through the `connector-builder` live-build flow.
- A background subagent is spawned to construct `client.ts` and `SKILL-FRAG.md` under `connectors/<name>/` while the main session remains responsive.

### 2.3 Read Failure Routing
- When a PIMS REST API read request encounters a network, authentication, or HTTP error (4xx/5xx):
  1. Immediately inform the user which specific endpoint failed with its status code.
  2. Route data retrieval to the pgvector mirror cache of last-known PIMS content.
  3. Clearly label the returned information: `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]`.

### 2.4 Document Mutation Routing (Parameterized Copy-Then-Fill)
- **Mandatory Copy-Then-Fill Protocol**: All document modifications and version increments MUST route through isolated staging without requiring `corpus_g4_src/` at runtime:
  1. Inspect live PIMS `/versions/` (`PimsClient.getDocumentVersions`) and align the PDF version to the next PIMS integer (e.g., `"3.00"` in PIMS → `"4.0"` on PDF cover/footer/history → `"4.00"` on upload), stating minor vs. major in `change_summary`.
  2. Pull current institutional content from `CORPUS_MIRROR_DIR/<doc.code>/v<n>.txt` (`bun scripts/rag-query.ts --full --doc <code>`) or live PIMS PDF extracted with `pdftotext`, inspect exact `#let mold*` symbol & parameters in `molds/<category>/mold*.typ`, and read `molds/<category>/RAFA.md` **silently** (never cite `RAFA.md` to the user).
  3. Copy `molds/common/` → `/tmp/pims-staging/common/` and `molds/<category>/*.typ` → `/tmp/pims-staging/<code>-v<n>/`.
  4. Write a new thin caller in staging passing updated `#let data` parameters, compile with `typst compile` (or `bun run generate*.ts` for XLSX), publish a preview via `http://pimsai-files-sidecar:3000/api/publish` (`content_base64`), and **halt for explicit human approval**.
  5. Only after approval: upload to PIMS (`POST /api/documents/{id}/versions/` with explicit `.pdf` `fileName` and structured `change_summary`), re-sync via `bun scripts/sync-pims-truth.ts` into `CORPUS_MIRROR_DIR` and `pimsai-db`.
- **Hard Restrictions on Mold Mutation**:
  - **MUST NOT** mutate `molds/` in place for instance data (template edits require explicit structural approval).
  - **MUST NOT** hand-edit compiled PDFs or cite internal files (`RAFA.md`, `molds/*`) in user-facing responses.
