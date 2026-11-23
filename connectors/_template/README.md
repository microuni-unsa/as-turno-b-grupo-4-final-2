# Connector Live-Build Template & Guide

This directory provides the canonical template and fill-in-the-blank procedure for building new connectors on the fly. Autonomous background subagents dispatched during live sessions follow this standard to integrate new external services (such as Evolution API, WhatsApp, Jira, or custom APIs) without stalling the main user session.

---

## 1. Directory Structure

```
connectors/<connector-name>/
├── client.ts         # Typed API wrapper class with methods per endpoint
├── SKILL-FRAG.md     # Markdown endpoint map table, auth rules, limits & failure modes
└── README.md         # (Optional) Specific setup notes or webhook setup instructions
```

---

## 2. Fill-in-the-Blank Live-Build Procedure (SPEC 9 Item 5)

When instructed to integrate a new connector (e.g., Evolution API / WhatsApp bridge):

### Step 1: Clone the Skeleton
Create a dedicated folder under `connectors/<connector-name>/` and copy `_template/client.ts` and `_template/SKILL-FRAG.md`.

```bash
mkdir -p connectors/<connector-name>
cp connectors/_template/client.ts connectors/<connector-name>/client.ts
cp connectors/_template/SKILL-FRAG.md connectors/<connector-name>/SKILL-FRAG.md
```

### Step 2: Define Types & Endpoints
1. In `client.ts`, configure the service base URL and declare typed interfaces for each endpoint.
2. Implement explicit request and response models.
3. Replace generic placeholder methods with service-specific operations (e.g., `sendWhatsAppMessage`, `fetchChatHistory`).
4. Keep the read-only probe method `healthCheck()` intact for self-heal health checks.

### Step 3: Handle Webhooks & Callback Slugs (SPEC 4.1)
If the connector receives callbacks or webhooks (e.g., inbound WhatsApp events):
1. Allocate an unreserved subdomain slug `<slug>`.
2. Construct the webhook URL according to the platform convention (always include `:444`):  
   `https://<slug>.pimsai.mistercricro8.top:444/webhook`
3. If running a receiving sibling container, join Docker network `internal-proxy` with Traefik routing labels:
   - `traefik.enable=true`
   - `traefik.http.routers.pimsai-<slug>.rule=Host(\`<slug>.pimsai.mistercricro8.top\`)`
   - `traefik.http.routers.pimsai-<slug>.entrypoints=https`
   - `traefik.http.routers.pimsai-<slug>.tls.certresolver=cloudflare`

### Step 4: Credentials & Container Provisioning
- **Self-Hosted Sibling Containers** (e.g., Evolution API on `internal-proxy`): generate an internal API key directly when starting the container via `docker-proxy:2375` (`-e AUTHENTICATION_API_KEY=...`), trigger instance creation, and present the QR code or setup link (`:444`) immediately — never ask the user for self-generated internal keys via `secrets-sidecar`.
- **External User-Owned Credentials**: if missing, mint a one-time URL via `POST http://pimsai-secrets-sidecar:3000/api/secrets/request`, register an `async: true` background poll, and share `https://secrets.pimsai.mistercricro8.top:444/s/<token>`.
- **No `G4-` Read Filtering**: incident/audit pollers and webhooks read all PIMS records uniformly (`G4-` applies strictly to PIMS writes).

### Step 5: Read-Only Probe Pass
Before announcing completion:
1. Run a read-only probe using `healthCheck()`.
2. Confirm HTTP status code and response payload structure.
3. NEVER probe using destructive or state-mutating endpoints.

### Step 6: Registration into Agent Skill (SPEC 8.2)
Invoke the registration runtime function:
```typescript
import { registerConnector } from "../runtime/register";

await registerConnector({
  connectorDir: "connectors/<connector-name>",
  skillPath: ".omp/skills/connectors/SKILL.md",
});
```
This automatically validates and appends `SKILL-FRAG.md` into the agent's active skill registry.

---

## 3. Edge Cases & Operational Rules

1. **Secrets Security:**
   - Secrets are handled exclusively via handles (`secret:<name>@<v>`).
   - The connector client MUST NEVER print, log (`console.log`), or dump secrets.
   - Values are injected into HTTP `Authorization` headers or sibling container environment variables via `resolveAuthHeader` and `resolveToDockerEnv`.
2. **Secrets Rotation:**
   - When a secret is rotated, a new version is created (`secret:<name>@v2`).
   - Old versions remain valid and readable for existing containers until restart.
3. **Self-Heal Loop Participation (SPEC 8.3):**
   - Probe: Trigger read-only verification.
   - Diagnose: Map error signature to cause.
   - Patch: Modify `client.ts` to adjust endpoint parameters or headers.
   - Update Fragment: Update `SKILL-FRAG.md` to reflect modified contracts.
