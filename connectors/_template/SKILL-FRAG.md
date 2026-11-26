# Template Connector Skill Fragment

> **Connector Type:** REST API + Inbound Webhook / Native Service UI  
> **Scope:** Service-Agnostic External API or Self-Hosted Sibling Stack  
> **Hosting Slug Convention:** `https://<slug>.pimsai.mistercricro8.top:444` (Mandatory `:444` port; never claim reserved slug `demo`)

---

## 1. Endpoint Map

| Endpoint | Method | Auth Required | Parameters / Payload | Return Shape | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/health` | `GET` | Yes (`secret:<name>@<v>`) | None | `{ ok: boolean, service: string, latencyMs: number }` | Read-only probe pass for self-heal health checks. |
| `/message/send` | `POST` | Yes (`secret:<name>@<v>`) | `{ recipientId, messageType, content, mediaUrl? }` | `{ messageId, status, timestamp, recipientId }` | Sends outbound message or notification. |
| `/webhook/register` | `POST` | Yes (`secret:<name>@<v>`) | `{ callbackSlug, subscribedEvents }` | `{ webhookId, callbackUrl, active }` | Registers inbound webhook endpoint on the service. |

---

## 2. Sibling Hosting, Companion Databases & Inbound Webhooks

- **Preflight Image Inspection:** Always inspect the target image before launch (`docker image inspect` / `docker run --rm --entrypoint sh <image> -c '...'`) to verify entrypoint, required env vars, ports, companion DB dependencies, and native web UI paths.
- **Isolated Per-Stack Companion Databases:** If the service requires a database or cache, spawn a dedicated `pimsai-<slug>-db` container on an isolated `<slug>-net` bridge network with a named volume (`<slug>-db-data`). Never share `pimsai-db`.
- **Native UI First:** Connect the service container to `internal-proxy` with Traefik TLS labels exposing its native admin/setup/dashboard UI directly at `https://<slug>.pimsai.mistercricro8.top:444`. Build a custom Bun HTTP server ONLY when the software lacks a native web UI or needs a custom webhook/visualizer.
- **Callback Slug Convention:** Inbound webhook callbacks must include `:444`:  
  `https://<slug>.pimsai.mistercricro8.top:444/webhook`
- **Copy-Never-Bind:** Never `-v /app/...` on sibling containers; use named Docker volumes or `docker create` + `docker cp` + `docker start`.
- **Read Filtering Policy:** Incident/audit webhook watchers read ALL system incidents/audits uniformly (do NOT filter out non-`G4-` alerts) and read `incidents get <CODE> --json` before stating containment/evidence state. Only writes to PIMS enforce `G4-`.

---

## 3. Authentication & Secrets Handles

- **Protocol:** Connector operations MUST supply a secret handle: `secret:<name>@<v>` (e.g., `secret:service_api_key@v1`).
- **Zero-Exposure Policy:** The agent process never inspects `/app/.env` or prints raw PIMS/SMTP secrets. For self-hosted spawned sibling services, generate random credentials (`openssl rand -hex`), inject via Docker env, and hand only that spawned service's admin setup/access code to the user alongside the verified `:444` UI URL and browser steps.
- **External User-Owned Credentials:** If prompting for external SaaS/API tokens, use `secrets_request` (or `POST http://127.0.0.1:8082/internal/secrets/request`) to pop up an **inline encrypted password card inside the web chat** (users can also rotate secrets in the **Bóveda de Secretos** drawer), and start the `async: true` poll (`curl -sS -m 310 "http://127.0.0.1:8082/internal/secrets/poll/<token>?wait=true"` or `secrets_poll(handle, wait: true)`) **before** ending the turn.

---

## 4. Operational Limits

- **Request Timeout:** 15,000 ms.
- **Rate Limit:** 30 requests / minute burst cap.
- **Media Payload Cap:** 10 MB maximum for media messages.

---

## 5. Failure Modes & Self-Heal Triggers

| Failure Signature | Probable Cause | Self-Heal Action (SPEC 8.3) |
| :--- | :--- | :--- |
| `HTTP 401 Unauthorized` | Invalid or rotated token | Request updated credentials via `secrets_request` (`?wait=true` poll); resolve new handle. |
| `HTTP 404 Not Found` | Outdated API endpoint path | Probe alternate routes; patch wrapper method in `client.ts`; update fragment map. |
| `HTTP 429 Too Many Requests` | Rate limit breached | Backoff deterministically; notify coordinator without failing task. |
| `Connection Refused / ETIMEDOUT` | Container or network down | Inspect sibling container status & logs (`docker inspect` / `docker logs --tail 30`), verify `internal-proxy` and `:444` Traefik routing. |
