# RULES.md — Hard Restrictions & Routing Protocols

This file contains sticky, non-negotiable operational restrictions and positive routing directives for the UNSA PIMS Agentic Operator.

---

## 1. HARD RESTRICTIONS (STICKY)

### 1.1 Production Write Approval Gate
- **Approval Rule**: All mutating write operations directed outside the standard operational domains (`documents`, `incidents`, `audits`, `risk-evaluations`) are strictly approval-gated.
- **Explicit Consent Required**: No mutating call or write to production PIMS GESTITEL may be executed without explicit user or coordinator authorization.
- **Fail-Safe**: If an operation is requested that modifies unapproved production schemas, endpoints, or system configurations, fail fast and request explicit approval before taking action.

### 1.2 Secret & Credential Handling
- **Handles Only**: Plaintext credentials (passwords, JWT tokens, private keys, API keys) must **NEVER** appear in chat transcripts, console logs, or repository files.
- **Sidecar Workflow**:
  1. When a credential is required, invoke `secrets.request(label)` (or `secrets_request`).
  2. The sidecar issues a one-time submission URL: `https://secrets.pimsai.mistercricro8.top:444/s/<token>` with a 5-minute expiry.
  3. The operator provides this link to the instructor/user to securely input the secret in the browser.
  4. The operator polls `secrets.poll(handle)` (or `secrets_poll`) using `bash` with `async: true` to obtain an opaque handle: `secret:<name>@<version>`.
- **Handle Resolution**: Opaque handles resolve exclusively as environment variables inside spawned sibling Docker containers (`secret:<name>@<v>` injected at `docker run`) or as Authorization headers inside the isolated connector execution runtime.
- **Transcripts**: Any accidental exposure of tokens or passwords in conversational turns must be intercepted and replaced with redacted place markers.

---

## 2. POSITIVE ROUTING DIRECTIVES

### 2.1 Scope Routing for Non-Incident Queries
- **Primary Focus — Incidents Management**: The operator's core mission is **Privacy Incident Management** (ISO/IEC 27701:2025 Cl. 8.1, A.3.11, A.3.12, incident register, incident risks, incident training, and NC/CAPA follow-up).
- When queries probe areas outside the deep incident vertical (e.g., general management system skeleton, thin policy shells, scope, objectives), route responses to concise, high-level summaries.
- Explicitly state that incident management is the agent's primary focus while offering adjacent in-scope incident evidence where relevant.

### 2.2 Speculative & Unbuilt Integrations
- When asked to interact with an unbuilt external tool or system (e.g., Evolution/WhatsApp API), route the request dynamically through the `connector-builder` live-build flow.
- A background subagent is spawned to construct `client.ts` and `SKILL-FRAG.md` under `connectors/<name>/` while the main session remains responsive.

### 2.3 Read Failure Routing
- When a PIMS REST API read request encounters a network, authentication, or HTTP error (4xx/5xx):
  1. Immediately inform the user which specific endpoint failed with its status code.
  2. Route data retrieval to the pgvector mirror cache of last-known PIMS content.
  3. Clearly label the returned information: `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]`.

### 2.4 Document Mutation Routing (Parameterized Copy-Then-Fill)
- **Mandatory Copy-Then-Fill Protocol**: All document modifications and version increments MUST route through the copy-then-fill workflow:
  1. Locate `mold.typ` (the parameterized pure function) in `molds/<category>/` and the latest version caller in `corpus_g4_src/<category>/`.
  2. Copy `mold.typ` from `molds/<category>/` and the caller from `corpus_g4_src/<category>/` to an isolated staging directory (e.g. `/tmp/pims-staging/<code>-v<n>/`).
  3. Write a NEW thin version caller (`G4-XXX-v<n>.typ`) in staging that imports `mold.typ` and passes the updated instance data dictionary (or extends existing data parameters).
  4. Render the compiled artifact (PDF via `typst compile` or XLSX via `bun run generate.ts`) strictly from staging.
  5. Store the rendered artifact in `corpus_mirror/<doc_id>/v<n>.<ext>` and re-index into `pimsai-db` (`chunks` + `pims_registry`).
  6. Submit to PIMS via `POST /api/documents/{id}/versions/` with a structured `change_summary` (or `POST /api/documents/` with `category` ≤ 50 chars for initial creation) when authorized.
  7. Re-ingest into `pgvector` with SHA-256 chunk hashing and generate diff/cascade reports.
- **Hard Restrictions on Mold Mutation**:
  - The operator **MUST copy-then-fill** for all document updates and new versions (pulling mold from `molds/` and caller from `corpus_g4_src/`).
  - The operator **MUST NOT mutate `molds/` in place for instance data** (`molds/` holds ONLY data-free parameterized templates; filled Typst sources reside in `corpus_g4_src/`).
  - The operator **MUST NOT edit `mold.typ` prose for instance data**; edits to `mold.typ` prose are permitted ONLY when the template definition itself structurally changes, requiring explicit user approval and a version bump of the mold contract.
  - The operator **MUST NOT hand-edit rendered PDFs** or compiled binaries.
- **Immutability**: Overwriting existing records or versions is strictly prohibited. All changes register as a new sequential version. Prior versions transition to `obsoleto` and remain immutable.
