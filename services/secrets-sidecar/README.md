# Secrets Sidecar Service & Agent Client (`@pims/secrets-sidecar`)

The secrets sidecar service provides zero-knowledge credential injection for the synthetic UNSA PIMS AI agent.

> **CRITICAL SECURITY NOTICE:**
> Group-4 PIMS credentials live **ONLY** in this age-encrypted store at deploy time. They must **NEVER** appear in chat transcripts, agent logs, or repository files. No placeholder credentials or default passwords exist anywhere in this repository.

---

## 1. Architectural Overview & Full Flow

```
1. Agent Needs Credential (e.g. PIMS login, Jira key)
   │
   ├─► Calls client: secrets.request("pims_credentials")
   │
2. Sidecar Generates Single-Use Link
   │
   ├─► Sidecar returns one-time URL: https://secrets.pimsai.mistercricro8.top/s/<token>
   │   (TTL: 5 minutes, single-use token, raw token never logged)
   │
3. Human Operator Enters Secret
   │
   ├─► Operator opens browser to paste form
   ├─► Pastes secret value into web form
   │
4. Encryption & Storage
   │
   ├─► Sidecar encrypts secret directly via age to agent volume store
   ├─► Sidecar inserts row into secrets_registry (PostgreSQL + local store manifest)
   ├─► Sidecar invalidates token immediately (replay attempts fail with 400)
   ├─► Sidecar generates handle: secret:<label>@<version>
   │
5. Agent Polling & Resolution
   │
   ├─► Agent client polls secrets.poll(pollHandle)
   ├─► Client receives handle: "secret:pims_credentials@1" (NEVER the plaintext value)
   └─► Handle resolves inside spawned sibling containers or connector runtime per RESOLUTION.md
```

---

## 2. Store Format (Age-Encrypted File Layout)

All secrets are encrypted with [age](https://age-encryption.org) using an X25519 keypair residing on the persistent agent volume.

The directory layout on `/var/lib/secrets-store` (configurable via `SECRETS_STORE_DIR`):

```
/var/lib/secrets-store/
├── keys/
│   ├── identity.txt       # Private age identity key (0600 permissions)
│   └── recipient.txt      # Public age recipient key (age1...)
├── secrets/
│   ├── pims_credentials/
│   │   ├── v1.age         # age-encrypted payload for version 1
│   │   └── v2.age         # age-encrypted payload for version 2 (rotated)
│   └── jira_api_key/
│       └── v1.age         # age-encrypted payload for version 1
└── registry.json          # Agent-local store registry manifest
```

### Encryption Mechanics
- Plaintext secrets are piped via standard input directly into `age --recipient <pubkey> --output <filepath>`.
- Plaintext values are never stored in unencrypted temporary files or passed as CLI arguments.
- Access permissions are restricted to the unprivileged service user (`node`, UID 1000).

---

## 3. Registry Schema Reference (`secrets_registry`)

DDL ownership belongs to `packages/rag-mirror schema.sql`. The PostgreSQL table structure:

```sql
CREATE TABLE IF NOT EXISTS secrets_registry (
    name VARCHAR(255) NOT NULL,
    version INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255) NOT NULL,
    scope VARCHAR(255) NOT NULL DEFAULT 'global',
    PRIMARY KEY (name, version)
);
```

- `name`: Target credential identifier (e.g., `pims_credentials`).
- `version`: Monotonically increasing version number (1, 2, 3...).
- `created_at`: Creation timestamp with timezone.
- `created_by`: Identity requesting or providing the credential (`instructor`, `agent`).
- `scope`: Access boundary (e.g., `pims`, `jira`, `global`).

---

## 4. Credential Rotation Procedure

1. **Initiate Rotation:**
   The operator or agent triggers a rotation request by requesting a new link for the existing label:
   ```ts
   const req = await secrets.request("pims_credentials");
   // URL: https://secrets.pimsai.mistercricro8.top/s/<token>
   ```
2. **Submit New Secret:**
   The operator submits the new credential via the paste form.
3. **Version Increment:**
   The sidecar detects the existing version `v1`, encrypts the new secret to `secrets/pims_credentials/v2.age`, and writes a new row to `secrets_registry` with `version = 2`.
4. **Handle Generation:**
   The poll returns `secret:pims_credentials@2`.
5. **Zero Downtime for Running Workloads:**
   - Active sibling containers running with `secret:pims_credentials@1` continue running without interruption (`v1.age` remains intact on the volume).
   - Upon container restart or redeploy, the orchestrator updates environment variables with `secret:pims_credentials@2`.

---

## 5. Traefik Routing Configuration

The sidecar runs in Docker on the `internal-proxy` network and serves behind the Traefik reverse proxy:

```yaml
services:
  secrets-sidecar:
    image: pimsai-secrets-sidecar:latest
    container_name: secrets-sidecar
    restart: unless-stopped
    networks:
      - internal-proxy
    environment:
      - PORT=3000
      - HOST=0.0.0.0
      - BASE_URL=https://secrets.pimsai.mistercricro8.top
      - SECRETS_STORE_DIR=/var/lib/secrets-store
      - DATABASE_URL=postgresql://user:pass@postgres:5432/pims
    volumes:
      - secrets_data:/var/lib/secrets-store
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=internal-proxy"
      - "traefik.http.routers.pimsai-secrets.rule=Host(`secrets.pimsai.mistercricro8.top`)"
      - "traefik.http.routers.pimsai-secrets.entrypoints=https"
      - "traefik.http.routers.pimsai-secrets.tls.certresolver=cloudflare"
      - "traefik.http.services.pimsai-secrets.loadbalancer.server.port=3000"
```

### Exact Host & Router Specification
- **Router:** `pimsai-secrets`
- **Exact Host:** `secrets.pimsai.mistercricro8.top`
- **Entrypoints:** `https`
- **TLS CertResolver:** `cloudflare`
- **Docker Network:** `internal-proxy`

---

## 6. Edge Case Handling

1. **Token Replay After Use / Expiry:**
   - Attempting to access or submit a consumed or expired token returns a uniform typed error (`TOKEN_INVALID_OR_EXPIRED`, HTTP 400).
   - The response reveals zero information about whether the requested label exists or previously existed.
2. **Poll Before Submission:**
   - While the operator is viewing the form, `secrets.poll()` returns `{ status: "pending", handle: null }` and continues waiting until `timeoutMs` (default 5 min).
3. **Poll After Expiry:**
   - If 5 minutes elapse without submission, the sidecar marks the request expired and poll returns HTTP 410 (`REQUEST_EXPIRED`). The client raises `SecretRequestExpiredError`.
4. **Audit & Log Cleanliness:**
   - Zero raw values and zero raw tokens are logged.
   - Logs only contain SHA-256 hashes of tokens and metadata.

---

## 7. Client Usage Example

```typescript
import { secrets, SecretRequestExpiredError, SecretPollTimeoutError } from '@pims/secrets-sidecar/client';

async function acquireCredentials() {
  // 1. Request one-time link
  const request = await secrets.request('pims_credentials');
  
  // Show URL to operator (URL contains single-use token, but never logs the secret value)
  process.stdout.write(`Please enter PIMS credentials at: ${request.url}\n`);

  try {
    // 2. Poll for handle
    const handle = await secrets.poll(request.pollHandle, {
      timeoutMs: 300000, // 5 min timeout
      intervalMs: 1500
    });

    // Received opaque handle: "secret:pims_credentials@1"
    // Plaintext is NEVER returned or known to this agent process.
    return handle;
  } catch (err) {
    if (err instanceof SecretRequestExpiredError) {
      throw new Error('Operator did not enter credentials within the 5-minute window.');
    }
    if (err instanceof SecretPollTimeoutError) {
      throw new Error('Polling timed out.');
    }
    throw err;
  }
}
```
