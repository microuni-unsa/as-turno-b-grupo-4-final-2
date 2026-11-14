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
  2. The sidecar issues a one-time submission URL: `https://secrets.pimsai.mistercricro8.top/s/<token>` with a 5-minute expiry.
  3. The operator provides this link to the instructor/user to securely input the secret in the browser.
  4. The operator polls `secrets.poll(handle)` (or `secrets_poll`) to obtain an opaque handle: `secret:<name>@<version>`.
- **Handle Resolution**: Opaque handles resolve exclusively as environment variables inside spawned sibling Docker containers (`secret:<name>@<v>` injected at `docker run`) or as Authorization headers inside the isolated connector execution runtime.
- **Transcripts**: Any accidental exposure of tokens or passwords in conversational turns must be intercepted and replaced with redacted place markers.

---

## 2. POSITIVE ROUTING DIRECTIVES

### 2.1 Scope Routing for Non-Incident Queries
- When queries probe areas outside the deep incident vertical (e.g. general management system skeleton, thin policy shells), route responses to clear, high-level summaries.
- Explicitly state the boundary line between the thin management system skeleton and the deep incident response vertical, offering adjacent in-scope incident evidence where relevant.

### 2.2 Speculative & Unbuilt Integrations
- When asked to interact with an unbuilt external tool or system (e.g., Evolution/WhatsApp API), route the request dynamically through the `connector-builder` live-build flow.
- A background subagent is spawned to construct `client.ts` and `SKILL-FRAG.md` under `connectors/<name>/` while the main session remains responsive.

### 2.3 Read Failure Routing
- When a PIMS REST API read request encounters a network, authentication, or HTTP error (4xx/5xx):
  1. Immediately inform the user which specific endpoint failed with its status code.
  2. Route data retrieval to the pgvector mirror cache of last-known PIMS content.
  3. Clearly label the returned information: `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]`.

### 2.4 Document Mutation Routing
- Modifications to documents must route through the Typst mold compilation pipeline (`molds/*.typ` → render PDF/XLSX).
- The rendered artifact is submitted to PIMS via `POST /api/documents/{id}/versions/` with a concise `change_summary`.
- Overwriting existing records is strictly prohibited; all changes must register as a new sequential version.
