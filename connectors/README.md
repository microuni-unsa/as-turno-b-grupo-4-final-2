# Connectors Framework Contract

This directory defines the connector architecture and runtime contract for the UNSA Agentic Incidents-PIMS solution (SPEC 8.2, 8.3, 9 item 5, 4.3).

---

## 1. Directory Layout & Structure

Every connector resides in its own subfolder under `connectors/` and adheres to a two-file minimum contract:

```
connectors/
├── README.md                 # Framework architecture & contracts specification
├── runtime/                  # Secrets handle resolution, web app workflow, registration
│   ├── constants.ts          # Centralized domain and operational parameters
│   ├── errors.ts             # Typed error hierarchy for runtime & security
│   ├── types.ts              # Type definitions (handles, sessions, docker envs)
│   ├── secrets.ts            # Handle resolver (secret:<name>@<v>), store, web secrets API
│   ├── register.ts           # Appends SKILL-FRAG.md to active agent skill
│   └── index.ts              # Unified runtime exports
├── _template/                # Canonical skeleton for service-agnostic live builds
│   ├── client.ts             # Typed wrapper skeleton (REST + Webhook)
│   ├── SKILL-FRAG.md         # Endpoint map, auth requirements, limits, failure modes
│   └── README.md             # Subagent live-build playbook
└── mail/                     # Full implementation: Summons Dispatch (SPEC 9 item 2)
    ├── client.ts             # Two-phase summons: draft -> explicit "envíalo" -> send
    └── SKILL-FRAG.md         # Summons protocol, RAG severities, citation format
```

> Note: PIMS access = `bun scripts/pims.ts` + `packages/pims-adapter` (no connector).

---

## 2. Naming Conventions

- **Connector Folder:** Lowercase kebab-case matching the integrated service (e.g., `mail`, `jira`, `slack-alerts`, `webhook-portal`).
- **Client Class:** UpperCamelCase ending in `Client` (e.g., `MailConnectorClient`, `JiraConnectorClient`, `AlertWebhookClient`).
- **Skill Fragment:** Always named `SKILL-FRAG.md` in the connector root folder.
- **Skill Registration Target:** Appended to `.omp/skills/connectors/SKILL.md` (or path configured in runtime).

---

## 3. Secrets Handle Protocol & Zero-Exposure Guarantee (SPEC 4.3)

All external credentials in connectors operate strictly via **secret handles**:
```
secret:<name>@<v>
```
Examples: `secret:gestitel_jwt@v1`, `secret:smtp_creds@v1`, `secret:jira_api_token@v2`.

### Security Guarantees:
1. **Zero Secret Printing:** Raw values are NEVER logged, printed to `console.log`, output to stdout/stderr, written to disk in plaintext, or included in chat transcripts. Never read `/app/.env` or print PIMS/SMTP keys.
2. **Handle Resolution Boundary:**
   - For child/sibling containers: Resolved to `--env <KEY>=<VALUE>` flags at container creation via `SecretsStore.getInstance().resolveToDockerEnv()`, or generated randomly at launch (`openssl rand -hex`) for self-hosted spawned stacks.
   - For in-process connectors: Resolved inside runtime execution closures via `SecretsStore.getInstance().executeWithSecret()` or `resolveAuthHeader()`.
3. **Rotation Semantics:**
   - Secrets rotation generates a new version (e.g., `@v2`).
   - Old versions remain accessible in memory/store so already-running sibling containers or active sessions continue working without disruption until restarted.
4. **Missing External Credentials Flow (Unified Web App Inline Card & Bóveda de Secretos):**
   - If an agent or connector requires a **user-owned external SaaS/API credential** that is not yet configured, it calls `secrets_request` (or `POST http://127.0.0.1:8082/internal/secrets/request`).
   - The unified web app automatically displays an **inline encrypted password card directly inside the chat** (5-minute expiry, age-encrypted, zero plaintext in chat). Users can also manage or rotate secrets anytime from the **Bóveda de Secretos** drawer.
   - **Crucial Rule:** Start the `async: true` long-poll (`curl -sS -m 310 "http://127.0.0.1:8082/internal/secrets/poll/<token>?wait=true"` or `secrets_poll(handle, wait: true)`, matching `"submitted"|"expired"`) **before** ending your turn so the main session never blocks while waiting for submission.
   - For **self-hosted sibling containers** spawned directly on `internal-proxy`, generate random admin/API keys at launch (`openssl rand -hex`) and inject them via Docker env rather than prompting via `secrets_request`.

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
- **Read-Only First:** Probes must be strictly non-mutating (`GET`/`HEAD`/health checks).
- **No Unapproved Production Writes:** Destructive or production writes outside pre-approved scopes are strictly prohibited.
- **Always-Answering Main Session:** While the background subagent is healing the connector, the main session never hangs or displays spinners; it serves last-known data from the pgvector mirror.

---

## 6. Service-Agnostic Live Connector-Build Workflow (SPEC 9 Item 5 & 4.1)

For live-build integrations (external REST APIs, webhook receivers, self-hosted services, database-backed apps, bots, or interactive dashboards):
1. **Preflight Image Inspection**: Inspect the target container image (`docker image inspect` or `docker run --rm --entrypoint sh <image> -c '...'`) to discover entrypoint, required env vars, ports, companion DB dependencies, and native UI paths.
2. **Isolated Per-Stack Companion DB**: If the service needs a database/cache, spawn a dedicated `pimsai-<slug>-db` container on an isolated `<slug>-net` bridge network with a named volume (`<slug>-db-data`). Never share `pimsai-db`.
3. **Clone & Implement**: Clone `connectors/_template/` into `connectors/<name>/` with typed `fetch()` methods, `AbortController` timeouts, and uniform PIMS read polling (no `G4-` read filtering; always call `incidents get <CODE> --json` before stating containment/evidence state).
4. **Native UI on Traefik `:444` & Copy-Never-Bind**: Wire `internal-proxy` + Traefik TLS labels (never claiming reserved slug `demo`; never `-v /app/...`), expose any native admin/setup UI directly on `https://<slug>.pimsai.mistercricro8.top:444` (with generated setup code and browser steps), and construct inbound webhook URLs as `https://<slug>.pimsai.mistercricro8.top:444/webhook`. Build a custom Bun HTTP server ONLY when no native UI exists or a custom webhook/visualizer is needed.
5. **Fast Boot Diagnostics & Verification**: Within 5–10s of `docker start`, check `docker inspect` + `docker logs --tail 30`, verify internal `healthCheck()` + public `:444` `curl`, and invoke `registerConnector()`.
6. **Execution Mode**: Dispatch via background subagent (`task`) in interactive sessions so the main session keeps answering PIMS queries; execute inline in non-interactive `omp -p` runs.
