# Connectors Framework Contract

This directory defines the connector architecture and runtime contract for the UNSA Agentic Incidents-PIMS solution (SPEC 8.2, 8.3, 9 item 5, 4.3).

---

## 1. Directory Layout & Structure

Every connector resides in its own subfolder under `connectors/` and adheres to a two-file minimum contract:

```
connectors/
├── README.md                 # Framework architecture & contracts specification
├── runtime/                  # Secrets handle resolution, sidecar workflow, registration
│   ├── constants.ts          # Centralized domain and operational parameters
│   ├── errors.ts             # Typed error hierarchy for runtime & security
│   ├── types.ts              # Type definitions (handles, sessions, docker envs)
│   ├── secrets.ts            # Handle resolver (secret:<name>@<v>), store, sidecar flow
│   ├── register.ts           # Appends SKILL-FRAG.md to active agent skill
│   └── index.ts              # Unified runtime exports
├── _template/                # Canonical fill-in-the-blank skeleton for live builds
│   ├── client.ts             # Typed wrapper skeleton (REST + Webhook)
│   ├── SKILL-FRAG.md         # Endpoint map, auth requirements, limits, failure modes
│   └── README.md             # Subagent live-build playbook
└── mail/                     # Full implementation: Summons Dispatch (SPEC 9 item 2)
    ├── client.ts             # Two-phase summons: draft -> explicit "envíalo" -> send
    └── SKILL-FRAG.md         # Summons protocol, RAG severities, citation format
```

> Note: PIMS access = bun scripts/pims.ts + packages/pims-adapter (no connector)

---

## 2. Naming Conventions

- **Connector Folder:** Lowercase kebab-case matching the integrated service (e.g., `mail`, `evolution-whatsapp`, `jira`).
- **Client Class:** UpperCamelCase ending in `Client` (e.g., `MailConnectorClient`, `EvolutionWhatsAppClient`).
- **Skill Fragment:** Always named `SKILL-FRAG.md` in the connector root folder.
- **Skill Registration Target:** Appended to `.omp/skills/connectors/SKILL.md` (or path configured in runtime).

---

## 3. Secrets Handle Protocol & Zero-Exposure Guarantee (SPEC 4.3)

All credentials in connectors operate strictly via **secret handles**:
```
secret:<name>@<v>
```
Examples: `secret:gestitel_jwt@v1`, `secret:smtp_creds@v1`, `secret:evolution_token@v2`.

### Security Guarantees:
1. **Zero Secret Printing:** Raw values are NEVER logged, printed to `console.log`, output to stdout/stderr, written to disk in plaintext, or included in chat transcripts.
2. **Handle Resolution Boundary:**
   - For child/sibling containers: Resolved to `--env <KEY>=<VALUE>` flags at `docker run` via `SecretsStore.getInstance().resolveToDockerEnv()`.
   - For in-process connectors: Resolved inside runtime execution closures via `SecretsStore.getInstance().executeWithSecret()` or `resolveAuthHeader()`.
3. **Rotation Semantics:**
   - Secrets rotation generates a new version (e.g., `@v2`).
   - Old versions remain accessible in memory/store so already-running sibling containers or active sessions continue working without disruption until restarted.
4. **Missing Credentials Flow (Secrets Sidecar):**
   - If an agent or connector requires a user-owned external credential that is not yet configured, it calls `POST http://pimsai-secrets-sidecar:3000/api/secrets/request`.
   - The sidecar returns a one-time URL with a 5-minute expiry:  
     `https://secrets.pimsai.mistercricro8.top:444/s/<token>`
   - Note: for **self-hosted sibling containers** spawned directly on `internal-proxy` (e.g., Evolution API), generate and inject the API key directly via Docker env rather than prompting via `secrets-sidecar`.
   - **Crucial Rule:** Register the `async: true` background poll before sending the URL so the main session never blocks while waiting for external submission.

---

## 4. Connector Registration Lifecycle

Registration integrates a connector's capabilities (e.g., `connectors/mail`) into the agent's active reasoning context:

```typescript
import { registerConnector } from "./runtime";

const result = await registerConnector({
  connectorDir: "connectors/mail",
  skillPath: ".omp/skills/connectors/SKILL.md",
});
```

### Registration Mechanics:
1. Validates that `connectors/<name>/SKILL-FRAG.md` exists and contains a valid markdown endpoint table.
2. Wraps the fragment in delimiter comments:
   `<!-- CONNECTOR: <name> START --> ... <!-- CONNECTOR: <name> END -->`.
3. Idempotently inserts or updates the section in `.omp/skills/connectors/SKILL.md`.
4. The agent's prompt context immediately gains awareness of the new endpoints, parameter contracts, and failure handling policies.

---

## 5. Self-Heal Loop Participation (SPEC 8.2 & 8.3)

When an endpoint changes, breaks, or returns unexpected status codes during live use:

```
[Endpoint Failure Encountered]
             │
             ▼
[Report exact failure to user]
             │
             ▼
[Announce self-heal attempt] ───► Main session continues answering from PIMS mirror
             │
             ▼
[Background Subagent Dispatched]
  1. Probe: Run read-only probes (e.g. GET /health, list)
  2. Diagnose: Identify breaking schema, auth drift, or route change
  3. Patch: Edit connectors/<name>/client.ts
  4. Test: Re-verify probe pass
  5. Update Fragment: Patch connectors/<name>/SKILL-FRAG.md and re-register
             │
             ▼
[Announce verified fix to user + record lesson in memory]
```

### Self-Heal Guardrails:
- **Read-Only First:** Probes must be strictly non-mutating (GET/head/health checks).
- **No Unapproved Production Writes:** Destructive or production writes outside pre-approved scopes are strictly prohibited.
- **Always-Answering Main Session:** While the background subagent is healing the connector, the main session never hangs or displays spinners; it serves last-known data from the pgvector mirror.

---

## 6. Live Connector-Build Workflow (SPEC 9 Item 5 & 4.1)

For live build demonstrations (e.g. creating an Evolution API / WhatsApp bridge):
1. Background subagent clones `connectors/_template/` into `connectors/<name>/`.
2. Fills in typed wrapper methods and error contracts.
3. Configures inbound webhook receiver using slug convention `https://<slug>.pimsai.mistercricro8.top/webhook` (SPEC 4.1) routed via Traefik on Docker network `internal-proxy`.
4. Fetches credentials via Secrets Sidecar handle without leaking tokens.
5. Verifies via read-only probe pass.
6. Calls `registerConnector()` to activate in agent skill.
