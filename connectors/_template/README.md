# Connector Live-Build Template & Guide

This directory provides the canonical template and procedure for building new connectors on the fly. Autonomous background subagents dispatched during live sessions (or inline runs in non-interactive `omp -p` mode) follow this standard to integrate external SaaS APIs, self-hosted services, databases, bots, webhook receivers, or dashboards without stalling the main user session.

---

## 1. Directory Structure

```
connectors/<connector-name>/
├── client.ts         # Typed API wrapper class with methods per endpoint
├── SKILL-FRAG.md     # Markdown endpoint map table, auth rules, limits & failure modes
└── README.md         # (Optional) Specific setup notes or webhook setup instructions
```

---

## 2. Service-Agnostic Live-Build Procedure

### Step 1: Preflight Image & Runtime Inspection (Sibling Containers)
Before launching any sibling container via `docker-proxy:2375`, inspect the target image (`docker images`, `docker image inspect <image>`, or `docker run --rm --entrypoint sh <image> -c '...'`) to discover:
- Exact entrypoint and startup flags
- Required environment variables and ports
- Companion database/cache dependencies (PostgreSQL, Redis, MySQL, MongoDB, etc.)
- Native web admin/manager/onboarding UI paths

Never guess environment schemas blindly.

### Step 2: Clone the Skeleton
Create a dedicated folder under `connectors/<connector-name>/` and copy `_template/client.ts` and `_template/SKILL-FRAG.md`.

```bash
mkdir -p connectors/<connector-name>
cp connectors/_template/client.ts connectors/<connector-name>/client.ts
cp connectors/_template/SKILL-FRAG.md connectors/<connector-name>/SKILL-FRAG.md
```

### Step 3: Define Types & Endpoints
1. In `client.ts`, configure the service base URL and declare typed interfaces for each endpoint.
2. Implement explicit request and response models with real `fetch()` and `AbortController` timeouts (zero stubs).
3. Replace placeholder methods with service-specific operations (e.g., `dispatchAlert`, `createTicket`, `fetchEvents`).
4. Keep the read-only probe method `healthCheck()` intact for self-heal health checks.

### Step 4: Isolated Companion DBs, Native UI & Traefik `:444` Hosting
1. **Isolated Per-Stack Companion DB/Cache**: Whenever a service requires a database or cache, spawn a dedicated companion container (`pimsai-<slug>-db`) on an isolated per-stack Docker bridge network (`<slug>-net`) with a named volume (`<slug>-db-data`). Never share `pimsai-db` with dynamically spawned services.
2. **Expose Native Admin/Setup UI on Traefik `:444`**: Connect the service container to `internal-proxy` with full Traefik TLS labels (never claiming reserved slug `demo`):
   - `traefik.enable=true`
   - `traefik.docker.network=internal-proxy`
   - `traefik.http.routers.pimsai-<slug>.rule=Host(\`<slug>.pimsai.mistercricro8.top\`)`
   - `traefik.http.routers.pimsai-<slug>.entrypoints=https`
   - `traefik.http.routers.pimsai-<slug>.tls=true`
   - `traefik.http.routers.pimsai-<slug>.tls.certresolver=cloudflare`
   - `traefik.http.services.pimsai-<slug>.loadbalancer.server.port=<port>`
   When the software includes its own native admin/setup/pairing/dashboard UI, publish that native UI directly on `https://<slug>.pimsai.mistercricro8.top:444` and provide the user with: (a) the verified `:444` URL, (b) the generated setup/admin access code needed to sign in (never exposing `/app/.env` or PIMS secrets), and (c) concise step-by-step browser instructions. Build a custom Bun HTTP server ONLY when the software lacks a native UI or requires a custom webhook/visualizer.
3. **Copy-Never-Bind**: Never mount `-v /app/...` onto sibling containers; use named Docker volumes or `docker create` + `docker cp` + `docker start`.
4. **Inbound Webhooks**: Always include `:444` in callback URLs: `https://<slug>.pimsai.mistercricro8.top:444/webhook`.

### Step 5: Credentials Model & Uniform PIMS Reads
- **Self-Hosted Spawned Services**: Generate random keys/passwords at launch (`openssl rand -hex`) and inject them via `--env`; do NOT prompt via `secrets_request`.
- **External User-Owned SaaS/API Tokens**: Request via `secrets_request` tool (or `POST http://127.0.0.1:8082/internal/secrets/request`), which displays an **inline encrypted password card inside the web chat** (also manageable via the **Bóveda de Secretos** drawer), and start the `async: true` long-poll (`curl -sS -m 310 "http://127.0.0.1:8082/internal/secrets/poll/<token>?wait=true"` or `secrets_poll(handle, wait: true)`, matching `"submitted"|"expired"`) **before** ending the turn.
- **Uniform PIMS Reads**: Incident/audit pollers and watchers read all PIMS records uniformly (no `G4-` read filtering) and always inspect `incidents get <CODE> --json` before reporting containment or evidence state. (`G4-` applies strictly to PIMS writes.)

### Step 6: Fast Boot Diagnostics & Health Probe
Within 5–10 seconds of `docker start`, inspect `docker inspect --format '{{.State.Status}} {{.RestartCount}}'` and `docker logs --tail 30`; diagnose and fix failures immediately rather than sleeping blindly. Then verify both internal HTTP reachability (`healthCheck()`) and public `:444` HTTPS access (`curl`) before announcing completion.

### Step 7: Registration into Agent Skill (SPEC 8.2)
Invoke the registration runtime function:
```typescript
import { registerConnector } from "../runtime/register";

await registerConnector({
  connectorDir: "connectors/<connector-name>",
  skillPath: ".omp/skills/connectors/SKILL.md",
});
```
This automatically validates and inserts `SKILL-FRAG.md` into the agent's active skill registry.

---

## 3. Edge Cases & Operational Rules

1. **Secrets Security:**
   - Secrets are handled exclusively via handles (`secret:<name>@<v>`) or injected directly into isolated spawned containers.
   - The connector client MUST NEVER print, log (`console.log`), or dump secrets, nor inspect `/app/.env`.
   - Values are injected into HTTP `Authorization` headers or sibling container environment variables via `resolveAuthHeader` and `resolveToDockerEnv`.
2. **Secrets Rotation:**
   - When a secret is rotated, a new version is created (`secret:<name>@v2`).
   - Old versions remain valid and readable for existing containers until restart.
3. **Self-Heal Loop Participation (SPEC 8.3):**
   - Probe: Trigger read-only verification (`GET`/`HEAD`).
   - Diagnose: Map error signature to cause.
   - Patch: Modify `client.ts` to adjust endpoint parameters or headers.
   - Update Fragment: Update `SKILL-FRAG.md` to reflect modified contracts and re-register.
