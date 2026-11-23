# Template Connector Skill Fragment

> **Connector Type:** REST API + Inbound Webhook  
> **Canonical Target:** Evolution API / WhatsApp Bridge  
> **Hosting Slug Convention:** `https://<slug>.pimsai.mistercricro8.top:444` (Mandatory `:444` port)

---

## 1. Endpoint Map

| Endpoint | Method | Auth Required | Parameters / Payload | Return Shape | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/health` | `GET` | Yes (`secret:<name>@<v>`) | None | `{ ok: boolean, service: string, latencyMs: number }` | Read-only probe pass for self-heal health checks. |
| `/message/send` | `POST` | Yes (`secret:<name>@<v>`) | `{ recipientId, messageType, content, mediaUrl? }` | `{ messageId, status, timestamp, recipientId }` | Sends outbound message or notification. |
| `/webhook/register` | `POST` | Yes (`secret:<name>@<v>`) | `{ callbackSlug, subscribedEvents }` | `{ webhookId, callbackUrl, active }` | Registers inbound webhook endpoint on the service. |

---

## 2. Inbound Webhook Configuration

- **Callback Slug Convention:** Inbound webhook callbacks must include `:444`:  
  `https://<slug>.pimsai.mistercricro8.top:444/webhook`
- **Container Network Mode:** Spawned container runs on `internal-proxy` network with Traefik labels (`traefik.docker.network=internal-proxy`, `traefik.http.services.pimsai-<slug>.loadbalancer.server.port=<port>`, plus TLS router labels).
- **Read Filtering Policy:** Incident/audit webhook watchers read ALL system incidents/audits uniformly (do NOT filter out non-`G4-` alerts). Only writes to PIMS enforce the `G4-` prefix.

---

## 3. Authentication & Secrets Handles

- **Protocol:** Connector operations MUST supply a secret handle: `secret:<name>@<v>` (e.g., `secret:evolution_api_key@v1`).
- **Zero-Exposure Policy:** The agent process never inspects, logs, or prints raw tokens. Secrets resolve to HTTP headers or Docker environment variables solely inside the connector runtime boundary.
- **Missing Credentials (External User-Owned Secrets Only):** If prompting for external credentials, use `secrets-sidecar`:
  1. Call `POST http://pimsai-secrets-sidecar:3000/api/secrets/request`.
  2. Emit user URL `https://secrets.pimsai.mistercricro8.top:444/s/<token>` (after starting `async: true` poll).
  3. Note: for self-hosted containers spawned ourselves (e.g. Evolution API), inject generated credentials directly via `--env` without prompting via `secrets-sidecar`.

---

## 4. Operational Limits

- **Request Timeout:** 15,000 ms.
- **Rate Limit:** 30 requests / minute burst cap.
- **Media Payload Cap:** 10 MB maximum for media messages.

---

## 5. Failure Modes & Self-Heal Triggers

| Failure Signature | Probable Cause | Self-Heal Action (SPEC 8.3) |
| :--- | :--- | :--- |
| `HTTP 401 Unauthorized` | Invalid or rotated token | Request updated credentials via Secrets Sidecar; poll new handle. |
| `HTTP 404 Not Found` | Outdated API endpoint path | Probe alternate routes; patch wrapper method in `client.ts`; update fragment map. |
| `HTTP 429 Too Many Requests` | Rate limit breached | Backoff deterministically; notify coordinator without failing task. |
| `Connection Refused / ETIMEDOUT` | Container or network down | Inspect sibling container state on `internal-proxy`; verify Traefik routing. |
