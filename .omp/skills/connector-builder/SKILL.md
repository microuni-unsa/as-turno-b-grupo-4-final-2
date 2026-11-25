---
name: connector-builder
description: Service-agnostic connector scaffolding and self-heal protocol with preflight image inspection, isolated companion DBs, native :444 UI exposure, copy-never-bind, fast boot diagnostics, secrets-sidecar ?wait=true polling, and uniform PIMS reads.
---

# Connector Builder Skill (`connector-builder`)

Governs the service-agnostic construction, registration, container orchestration, and self-healing lifecycle of system connectors under `connectors/<name>/`.

## 1. Connector Convention & Architecture
```
connectors/<name>/
├── client.ts         # Real fetch()-backed typed client wrapper (AbortController, NO mock stubs)
└── SKILL-FRAG.md     # Endpoint map, auth contract, limits (:444 URLs), and failure recovery
```
- Always register completed connectors via `registerConnector({ connectorDir: "connectors/<name>" })` from `connectors/runtime/register.ts` so `.omp/skills/connectors/SKILL.md` is updated with valid YAML frontmatter.
- Read-only event/incident/audit polling connectors MUST read all PIMS records uniformly without `G4-` filtering, and always read `bun scripts/pims.ts incidents get <CODE> --json` before stating containment or evidence state (`G4-` applies strictly to PIMS writes).
- Note: Core PIMS interactions are consolidated in the authoritative SDK (`packages/pims-adapter`) and companion CLI (`bun scripts/pims.ts`), rather than standalone connectors. Integrations under `connectors/<name>/` govern auxiliary integrations (e.g., `connectors/mail/client.ts`, sibling containers, external SaaS APIs, webhook receivers, or dashboards).

## 2. Service-Agnostic Container, UI & Credential Rules
1. **Preflight Image & Runtime Inspection**: Before launching any container via `docker-proxy:2375`, inspect the image (`docker images`, `docker image inspect <image>`, or `docker run --rm --entrypoint sh <image> -c '...'`) to verify entrypoint, required env vars, ports, companion DB/cache dependencies, and native web UI paths. Never guess env schemas blindly.
2. **Isolated Per-Stack Companion Databases**: Whenever a service requires a database or cache (PostgreSQL, Redis, MySQL, MongoDB, etc.), spawn a dedicated companion container (`pimsai-<slug>-db`) on an isolated per-stack Docker bridge network (`<slug>-net`) with a named volume (`<slug>-db-data`). Never share `pimsai-db` with dynamically spawned services.
3. **Expose Native Admin/Setup UIs on Traefik `:444`**: Connect the service container to `internal-proxy` with full Traefik TLS labels (`https://<slug>.pimsai.mistercricro8.top:444`, never reserved slugs `demo`, `files`, `secrets`). When the software provides a native web admin/setup/pairing/dashboard panel, publish that native UI directly on `:444` and provide the user with: (a) verified `:444` URL, (b) generated setup/admin access code needed to log in (never exposing `/app/.env` or PIMS secrets), and (c) concise step-by-step browser instructions. Build a custom Bun HTTP server/bridge ONLY when the target lacks a native UI or requires a custom webhook/visualizer.
4. **Copy-Never-Bind Rule**: Never `-v /app/...` on sibling containers; use named Docker volumes or `docker create` + `docker cp` + `docker start`.
5. **Fast Fail-Fast Boot Diagnostics & Verification**: Within 5–10s of `docker start`, inspect `docker inspect --format '{{.State.Status}} {{.RestartCount}}'` and `docker logs --tail 30`; diagnose and fix failures immediately instead of sleeping blindly. Verify both internal (`healthCheck()`) and public `:444` HTTP reachability (`curl`) before announcing completion or calling `registerConnector()`.
6. **Credentials Model**:
   - **Self-Hosted Spawned Services**: Generate random keys/passwords at launch (`openssl rand -hex`) and inject via Docker env; do NOT prompt via `secrets-sidecar`.
   - **External User-Owned SaaS/API Tokens**: Call `secrets_request` (or `POST http://pimsai-secrets-sidecar:3000/api/secrets/request`), launch the `async: true` poll (`curl -sS -m 310 "http://pimsai-secrets-sidecar:3000/api/secrets/poll/<token>?wait=true"`, matching `"submitted"|"expired"|"failed"`) **before** replying, and hand `https://secrets.pimsai.mistercricro8.top:444/s/<token>` to the user.
7. **Execution Mode**: Dispatch background subagent (`task`) in interactive sessions so the main session keeps answering PIMS queries; run inline in non-interactive `omp -p` runs.

## 3. Self-Heal Loop Protocol
When an existing connector breaks due to API drift, network anomalies, or schema changes:
1. **Report Exactly**: State the failed endpoint, HTTP status, or parsing error.
2. **Dispatch Background Diagnostic/Patch**: Announce repair while keeping the main session responsive via mirror queries (`bun scripts/pims.ts mirror read <doc_or_code>` or semantic `bun scripts/rag-query.ts "<query>"`).
3. **Probe → Diagnose → Patch → Re-Verify → Register**:
   - Run read-only probes first (`GET`/`HEAD`).
   - Patch `connectors/<name>/client.ts` (preserving `G4-` write guards and real HTTP semantics) and update `connectors/<name>/SKILL-FRAG.md` + `registerConnector()`. (For PIMS core issues, fixes belong in `packages/pims-adapter` or `bun scripts/pims.ts`).
   - Re-verify both internal `healthCheck()` and `:444` endpoint pass cleanly, and record the lesson in local memory.
