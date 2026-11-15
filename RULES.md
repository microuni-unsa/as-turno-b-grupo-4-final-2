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

### 2.4 Document Mutation Routing
- Modifications to documents must route through a **staging copy** of the Typst mold (`molds/*.typ` → copy to `/tmp/pims-staging/`, edit staging, render PDF/XLSX) and **never** mutate `molds/` in place.
- Store rendered artifacts and updated metadata in `corpus_mirror/` + `pimsai-db` (`chunks` and `pims_registry`), and submit to PIMS via `POST /api/documents/{id}/versions/` with a concise `change_summary` (or `POST /api/documents/` with `category` ≤ 50 chars for new documents) when authorized.
- Overwriting existing records is strictly prohibited; all changes must register as a new sequential version.
