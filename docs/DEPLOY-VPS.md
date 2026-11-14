# Production VPS Deployment Guide — Human Operator Manual

> **CRITICAL OPERATIONAL POLICY: HUMAN-RUN ONLY**  
> This deployment runbook is intended **strictly for a human operator running commands directly on the target VPS**.  
> The autonomous AI agent **NEVER** executes self-deployments, production infrastructure mutations, remote SSH commands, or automated release scripts. All changes to production infrastructure must be confirmed and executed by an authorized human administrator.

---

## 1. Target VPS Prerequisites & Topology

Before deploying the container stack, verify that the target host satisfies the architecture specification (SPEC §4, §4.1):

1. **Host Operating System & Tools**:
   - Ubuntu 22.04 LTS or 24.04 LTS (x86_64 or aarch64).
   - Docker Engine v24.0+ and Docker Compose v2.20+.
   - Git, cURL, and OpenSSL.
2. **External Network `internal-proxy`**:
   - Ensure the Docker network exists:
     ```bash
     docker network inspect internal-proxy >/dev/null 2>&1 || docker network create internal-proxy
     ```
3. **Host Traefik Reverse Proxy**:
   - Running on `internal-proxy`.
   - Entrypoint `https` listening on port **`:444`**.
   - Cloudflare DNS challenge certResolver (`cloudflare`) active with wildcard SAN for `*.pimsai.mistercricro8.top`.
   - Docker socket proxy running at `tcp://docker-proxy:2375` on `internal-proxy`.
4. **Cloudflare Transform Rule**:
   - Public traffic on `https://*.pimsai.mistercricro8.top:443` is forwarded by Cloudflare edge rules to VPS port `:444`.

---

## 2. Step-by-Step Deployment Runbook

### Step 1: Clone Repository on Target Box
```bash
cd /opt
git clone https://github.com/microuni-unsa/as-turno-b-grupo-4-final-2.git pimsai
cd pimsai
```

### Step 2: Environment Configuration
Copy `.env.example` to `.env` and populate authorized credentials:
```bash
cp .env.example .env
chmod 600 .env
nano .env
```

Ensure the following variables are configured:
- `PIMS_USERNAME` & `PIMS_PASSWORD`: Group 4 credentials for `https://unsa.27k.pe`.
- `POSTGRES_PASSWORD`: Strong master password for the local pgvector sidecar database.
- `MISTRAL_API_KEY`: API key for 1024-dimension `mistral-embed`.
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`: Execution LLM keys for the agent.
- `AGE_SECRET_KEY`: Private X25519 identity key for encrypting secrets sidecar storage.

> **Warning**: Never commit `.env` into Git or share it across insecure channels.

### Step 3: Build the Container Images
Build the 3 customized container images:
```bash
docker compose build
```
This builds:
- `agent` (Debian Bookworm, Bun 1.2.4, Typst 0.15, Zellij 0.45, omp 18.18.1, Docker CLI, PostgreSQL client)
- `files-sidecar` (Node 22 Bookworm, multipart upload engine, 5-min ephemeral minting)
- `secrets-sidecar` (Node 20 Bookworm, Age encryption engine, PostgreSQL registry client)

### Step 4: Start the Services
Launch the complete stack in detached mode:
```bash
docker compose up -d
```

Verify service status:
```bash
docker compose ps
```
All four services (`pimsai-agent`, `pimsai-db`, `pimsai-files-sidecar`, `pimsai-secrets-sidecar`) should be in the `running` state, with `pimsai-db` showing `healthy`.

### Step 5: Traefik Router Verification & Let's Encrypt Cert Check
Check that host Traefik discovers the containers and binds the routers:
```bash
# Check Traefik logs on the host
docker logs traefik | grep -E "pimsai-(demo|files|secrets)"
```

Perform edge TLS certificate checks against port 444:
```bash
# Verify TLS handshake and certificate SAN
curl -vk https://demo.pimsai.mistercricro8.top:444/
curl -vk https://files.pimsai.mistercricro8.top:444/health
curl -vk https://secrets.pimsai.mistercricro8.top:444/healthz
```

Verify public resolution through Cloudflare edge (port 443):
```bash
curl -f https://files.pimsai.mistercricro8.top/health
curl -f https://secrets.pimsai.mistercricro8.top/healthz
```

### Step 6: Generate Zellij Web Tokens for Instructor
Enter the running agent container to generate session tokens (SPEC §4.2, §10):
```bash
# Generate Instructor Read-Write Token
docker compose exec agent zellij web --create-token

# Generate Observer Read-Only Token
docker compose exec agent zellij web --create-read-only-token
```
Record the resulting hashed token strings into `docs/PRESENTATION-TEMPLATE.md` before sharing the link with the evaluator.

### Step 7: Sidecars Smoke Testing
Run quick smoke tests against the sidecar APIs:

1. **Files Sidecar Minting Probe**:
   ```bash
   curl -s -X POST https://files.pimsai.mistercricro8.top/api/mint \
     -H "Content-Type: application/json" \
     -d '{"flow":"upload-and-read"}'
   ```
   *Expected response*: JSON containing `upload_url` (`https://files.pimsai.mistercricro8.top/upload/<token>`) and 300s TTL.

2. **Secrets Sidecar Request Probe**:
   ```bash
   curl -s -X POST https://secrets.pimsai.mistercricro8.top/request \
     -H "Content-Type: application/json" \
     -d '{"label":"smoke_test"}'
   ```
   *Expected response*: JSON containing `url` (`https://secrets.pimsai.mistercricro8.top/s/<token>`) and 300s TTL.

---

## 3. Rollback & Disaster Recovery Procedures

### Standard Stack Restart
```bash
docker compose restart
```

### Safe Stack Shutdown (Data Preserved)
To safely stop containers while preserving persistent volumes (`agent_data`, `secrets_data`, `pgvector_data`):
```bash
docker compose down
```

### Reverting to Previous Stable Release
If a newly pulled code version causes runtime regressions:
```bash
# 1. Stop active containers
docker compose down

# 2. Revert Git branch to last known stable tag or commit SHA
git checkout <PREVIOUS_STABLE_COMMIT_OR_TAG>

# 3. Rebuild images with pinned code
docker compose build

# 4. Bring up previous stable stack
docker compose up -d
```

### Emergency Volume Backup & Restore
Backup persistent data volumes before major upgrades:
```bash
# Backup volumes
docker run --rm -v as-turno-b-grupo-4-final-2_pgvector_data:/db -v $(pwd):/backup \
  debian:bookworm-slim tar -czf /backup/pgvector_backup_$(date +%Y%m%d).tar.gz -C /db .

docker run --rm -v as-turno-b-grupo-4-final-2_secrets_data:/sec -v $(pwd):/backup \
  debian:bookworm-slim tar -czf /backup/secrets_backup_$(date +%Y%m%d).tar.gz -C /sec .
```

To restore:
```bash
docker compose down
docker run --rm -v as-turno-b-grupo-4-final-2_pgvector_data:/db -v $(pwd):/backup \
  debian:bookworm-slim tar -xzf /backup/pgvector_backup_<timestamp>.tar.gz -C /db
docker compose up -d
```
