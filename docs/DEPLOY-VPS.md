# Production VPS Deployment Guide — Operator Manual

> **CRITICAL OPERATIONAL POLICY: AFTER APPROVAL ONLY**  
> This deployment runbook is intended **strictly for an approved operator directly on the target VPS**.  
> All changes to production infrastructure must be confirmed and executed by an authorized human administrator.

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

### Step 1: Host Layout (Staging-Copy Topology)
The deploy host keeps THREE separate paths under `PIMSAI_HOME` (e.g. `~/server-data/pimsai`):
```bash
mkdir -p ~/server-data/pimsai/repo
cd ~/server-data/pimsai/repo
git clone https://github.com/microuni-unsa/as-turno-b-grupo-4-final-2.git .
# or: rsync the working tree from a workstation (see Step 3)
```
- `repo/` — pristine checkout, rsync target, NEVER mounted into containers.
- `app/` — disposable staging copy (created by `deploy-sync.sh`), compose cwd + `.:/app` bind.
- `.env` — host-level secrets at `PIMSAI_HOME/.env` (Step 2), passed via `PIMSAI_ENV_FILE`, never bind-mounted.

### Step 2: Environment Configuration (Plain `.env` or SOPS `.enc.env`)
Create the host-level env file at `PIMSAI_HOME/.env` (NOT inside `repo/` or `app/`):
Option A — Decrypt SOPS `.enc.env` using an authorized `age` key (SOPS auto-detects dotenv on `.enc.env`):
```bash
umask 077
sops decrypt repo/.enc.env > .env
chmod 600 .env
```
Option B — Copy `.env.example` to `.env` and populate authorized credentials:
```bash
cp repo/.env.example .env
chmod 600 .env
nano .env
```

Ensure the following variables are configured:
- `PIMS_USERNAME` & `PIMS_PASSWORD`: Group 4 credentials for `https://unsa.27k.pe`.
- `POSTGRES_PASSWORD`: Strong master password for the local pgvector sidecar database.
- `EMBEDDINGS_API_KEY` & `EMBEDDINGS_BASE_URL`: OpenAI-compatible 1024-dimension embeddings credentials.
- `AGENT_ENV_VAR` & `AGENT_API_KEY`: Provider environment variable name (e.g. `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENCODE_API_KEY`) and API key for `omp`.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USERNAME`, `SMTP_PASSWORD`: Gmail SMTP credentials (Google App Password) for `summons-dispatch`.
- `CORPUS_MIRROR_DIR`: Set to `/var/lib/pimsai/corpus_mirror` (mounted outside bind-mounted `/app` via `corpus_mirror_data`).
- `WEB_PUBLIC_URL`, `WEB_RW_TOKEN`, `WEB_RO_TOKEN`: Unified Web App URL (`https://demo.pimsai.mistercricro8.top:444`) and read-write / optional read-only access tokens.
- `AGE_SECRET_KEY`: Private X25519 identity key for decrypting age-encrypted secrets stored under `/app/secrets`.

> **Warning**: Never commit `.env` into Git or share it across insecure channels.

### Step 3: Sync & Deploy (`scripts/deploy-sync.sh`)
From the workstation, sync the working tree to the PRISTINE repo dir (no runtime state lives there, so plain `--delete` is safe):
```bash
rsync -avz --delete \
  --exclude='/.env' \
  --exclude='/.enc.env' \
  --exclude='/.sops.yaml' \
  --exclude='/data/' \
  --exclude='/secrets/' \
  --exclude='/corpus_mirror/' \
  --exclude='/.playwright-mcp/' \
  --exclude='/prompt*' \
  --exclude='/omp-session-*' \
  --exclude='/docs/' \
  --exclude='/corpus_g4_src/' \
  --exclude='/CHECK.md' \
  --exclude='/CHECK*' \
  --exclude='/FIXUP_PLAN.md' \
  --exclude='.git/' \
  --exclude='/flake.*' \
  --exclude='node_modules/' \
  --exclude='/apps/web/client/node_modules/' \
  --exclude='/apps/web/client/dist/' \
  --exclude='.direnv/' \
  ./ <user>@<vps>:~/server-data/pimsai/repo/
```
Then on the host, sync repo→staging and (re)start the stack:
```bash
PIMSAI_HOME=~/server-data/pimsai repo/scripts/deploy-sync.sh --wipe --build
```
`--wipe` removes `app/` entirely before re-sync (recommended: staging holds no state worth keeping — volumes hold all state). Omit `--wipe` for incremental sync. `--no-up` syncs without restarting.
Live-built connectors in staging are DEMO-LOCAL; promote deliberately with `scripts/backport-connector.sh <name>`.

> **Operate only via the wrapper**: all `docker compose` commands on the host must go through
> `PIMSAI_HOME=~/server-data/pimsai repo/scripts/compose.sh <args>` (it sources the host `.env`
> for `${VAR}` interpolation and runs with cwd=`app/`). Bare `docker compose` inside `app/`
> fails interpolation — that is by design (no secrets in staging).

### Step 4: Build the Container Images
Build the 2-container stack (`agent` + `db`):
```bash
docker compose build
```
This builds:
- `agent` (Debian Bookworm, Bun 1.2.4, Node 22 + pnpm prebuilt React SPA at `/opt/pimsai-web/dist`, Chromium + `@playwright/mcp` + `nodemailer` at `/node_modules`, Typst 0.15, omp 18.18.1, `age`, Docker CLI, PostgreSQL client, `CORPUS_MIRROR_DIR=/var/lib/pimsai/corpus_mirror`)
- `db` (`pgvector/pgvector:pg16` with `rag-mirror` and `secrets_registry` schema initialization)

### Step 5: Clean-Reset & Start Services
When resetting state before a clean evaluation run:
```bash
# Clear runtime mirror, prune stale omp sessions/memories (re-seeded on start),
# and truncate pgvector tables
docker compose exec agent rm -rf /var/lib/pimsai/corpus_mirror/*
docker compose exec agent bun scripts/prune-omp-state.ts --days 7 --apply
docker compose exec db psql -U "${POSTGRES_USER:-agent}" -d "${POSTGRES_DB:-pims_agent}" -c "TRUNCATE pims_registry, chunks RESTART IDENTITY CASCADE;"
docker compose up -d --build
```
Notes:
- `prune-omp-state.ts` deletes `sessions/--app--/*` older than `--days` (pin live
  threads with repeatable `--keep <id-prefix>`), wipes `memories/--app--`, and
  asserts no stale markers (`filtro G4-`, …) remain. Dry-run without `--apply`.
- On container start the entrypoint copies `.omp/memory-seed/memory_summary.md`
  into `memories/--app--/` when missing or stale-marked, so the first
  `memory://root` read always returns current rules. Keep the seed in sync with
  AGENTS.md §4 (uniform reads, gates, publish flow).
Verify initial sync populates `/var/lib/pimsai/corpus_mirror/<doc.code>/` (`v<n>.pdf` + `v<n>.txt` + `manifest.json`) keyed by `doc.code`:
```bash
docker compose ps
docker compose logs -n 60 agent
```
Both services (`pimsai-agent` and `pimsai-db`) should be `healthy`.

### Step 5b: Traefik Router Verification & Let's Encrypt Cert Check
Check that host Traefik discovers the `pimsai-agent` container and binds the `pimsai-demo` router:
```bash
# Check Traefik logs on the host
docker logs traefik | grep -E "pimsai-demo"
```

Perform edge TLS certificate checks against port 444:
```bash
# Verify TLS handshake, certificate SAN, and /healthz
curl -vk https://demo.pimsai.mistercricro8.top:444/healthz
```

Verify public resolution through Cloudflare edge (port 443):
```bash
curl -f https://demo.pimsai.mistercricro8.top/healthz
```

### Step 6: Configure Unified Web App Access Tokens for Instructor
Set strong random `WEB_RW_TOKEN` (full operator access) and optional `WEB_RO_TOKEN` (observer read-only mode) in `PIMSAI_HOME/.env`:
```bash
openssl rand -hex 24
```
Record the access URL (`https://demo.pimsai.mistercricro8.top:444`) and tokens into `docs/PRESENTATION-TEMPLATE.md` before sharing with the evaluator.

### Step 7: Unified Web App Smoke Testing
Run quick internal smoke tests inside `pimsai-agent` against port `8082`:

1. **Web App Health & Deliverable Publish Probe**:
   ```bash
   docker compose exec agent curl -fsS http://127.0.0.1:8082/healthz
   docker compose exec agent curl -fsS -X POST http://127.0.0.1:8082/internal/publish \
     -H "Content-Type: application/json" \
     -d '{"slug":"smoke-test","filename":"smoke.md","content":"# Smoke Test"}'
   ```
   *Expected response*: JSON containing `url` (`https://demo.pimsai.mistercricro8.top:444/api/files/smoke-test`).

2. **Built-In Age Secrets Request Probe**:
   ```bash
   docker compose exec agent curl -fsS -X POST http://127.0.0.1:8082/internal/secrets/request \
     -H "Content-Type: application/json" \
     -d '{"label":"smoke_test"}'
   ```
   *Expected response*: JSON containing `token`, `pollHandle`, and 300s TTL (`mode: "webapp-inline"`).

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
