# Template Connector Skill Fragment

> **Connector Type:** REST API + Inbound Webhook  
> **Canonical Target:** Evolution API / WhatsApp Bridge  
> **Hosting Slug Convention:** `https://<slug>.pimsai.mistercricro8.top` (SPEC 4.1)

---

## 1. Endpoint Map

| Endpoint | Method | Auth Required | Parameters / Payload | Return Shape | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/health` | `GET` | Yes (`secret:<name>@<v>`) | None | `{ ok: boolean, service: string, latencyMs: number }` | Read-only probe pass for self-heal health checks. |
| `/message/send` | `POST` | Yes (`secret:<name>@<v>`) | `{ recipientId, messageType, content, mediaUrl? }` | `{ messageId, status, timestamp, recipientId }` | Sends outbound message or notification. |
| `/webhook/register` | `POST` | Yes (`secret:<name>@<v>`) | `{ callbackSlug, subscribedEvents }` | `{ webhookId, callbackUrl, active }` | Registers inbound webhook endpoint on the service. |

---

## 2. Inbound Webhook Configuration

- **Callback Slug Convention:** Inbound webhook callbacks must be exposed under a designated slug:  
  `https://<slug>.pimsai.mistercricro8.top/webhook`
- **Container Network Mode:** Spawned container runs on `internal-proxy` network with Traefik labels:
  - `traefik.enable=true`
  - `traefik.http.routers.pimsai-<slug>.rule=Host(\`<slug>.pimsai.mistercricro8.top\`)`
  - `traefik.http.routers.pimsai-<slug>.entrypoints=https`
  - `traefik.http.routers.pimsai-<slug>.tls.certresolver=cloudflare`

---

## 3. Authentication & Secrets Handles

- **Protocol:** Connector operations MUST supply a secret handle: `secret:<name>@<v>` (e.g., `secret:evolution_api_key@v1`).
- **Zero-Exposure Policy:** The agent process never inspects, logs, or prints raw tokens. Secrets resolve to HTTP headers or Docker environment variables solely inside the connector runtime boundary.
- **Missing Credentials:** If the required handle is absent at runtime, the connector triggers the Secrets Sidecar flow (`SPEC 4.3`):
  1. Calls `secrets.request(label)`.
  2. Emits user URL `https://secrets.pimsai.mistercricro8.top/s/<token>`.
  3. Main session continues without blocking.
  4. Once entered, retrieves handle `secret:<name>@<v>`.

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
