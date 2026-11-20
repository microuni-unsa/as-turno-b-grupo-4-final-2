# Agentic Incidents-PIMS for UNSA — Turno B Grupo 4

Autonomous Privacy Information Management System (PIMS) operator for the **Universidad Nacional de San Agustín (UNSA)**, strictly grounded in **ISO/IEC 27701:2025** (2nd edition, standalone PIMS, PII Controller role). The system automates document versioning, incident tracking, audit chains, and dynamic connector builds against the GESTITEL PIMS instance (`https://unsa.27k.pe`).

---

## ⚠️ Critical Operational Guardrail: Ready for Clone / No Self-Prod

> **IMPORTANT NOTICE: DO NOT GO TO PROD AUTOMATICALLY**  
> This repository is configured to be **clone-ready for local evaluation, inspection, and testing**.  
> The agent and local containers **MUST NOT** execute autonomous write operations against the live GESTITEL PIMS instance or attempt automatic deployments to the production VPS.  
> **Production deployment instructions are strictly human-run and documented in [docs/DEPLOY-VPS.md](docs/DEPLOY-VPS.md)**. All production actions must be confirmed and executed by an authorized human operator on the target box.

---

## Documentation & Normative Architecture

Comprehensive architecture blueprints, operational procedures, and normative references:

- [docs/SPEC.md](docs/SPEC.md) — Normative solution specification, VPS topology, GESTITEL API contracts, and predicted behaviors.
- [docs/PRESENTATION-TEMPLATE.md](docs/PRESENTATION-TEMPLATE.md) — Evaluator presentation document (Zellij access tokens, budget caps, degraded-at-cap policy, and key tier matrix).
- [docs/DEMO-CHECKLIST.md](docs/DEMO-CHECKLIST.md) — Pre-demo probe sequence, Cloudflare 443→444 diagnostics, shared-tenant guardrails, and SPEC §9 behavior rehearsal matrix.
- [docs/DEPLOY-VPS.md](docs/DEPLOY-VPS.md) — Human-run production deployment runbook on target VPS with Let's Encrypt verification and rollback procedures.
- [AGENTS.md](AGENTS.md) — Agentic operator identity, interactive commands (`/new`, `/resume`, `mas ayuda`), conventions, and skills roster.
- [RULES.md](RULES.md) — Non-negotiable architectural, security, and tenant isolation rules.

### Normative Standards Library
- [docs/ISO 27701-2025_ocr.pdf](docs/ISO%2027701-2025_ocr.pdf) — ISO/IEC 27701:2025 (2nd edition), Standalone PIMS standard (PII Controller role: Clauses 4–10, Tables A.1 & A.3).
- [docs/ISO-19011-2026-en_ocr.pdf](docs/ISO-19011-2026-en_ocr.pdf) — Guidelines for auditing management systems (internal audit programme).
- [docs/ISO-42001-2023-en_ocr.pdf](docs/ISO-42001-2023-en_ocr.pdf) — AI Management System governance applied to autonomous agent behaviors.
- [docs/GDPR.txt](docs/GDPR.txt) — Informative cross-reference mapping only (Annex D); does not govern operational agent logic.
- [docs/audit4.txt](docs/audit4.txt) — Audit 4 evaluation notes and instructor constraints.

---

## Repository Layout Map

The repository is structured into modular components covering all system boundaries:

```text
.
├── Dockerfile                   # Unified base image (Debian Bookworm, Bun 1.2.4, Typst 0.15, Zellij 0.45, omp 18.18.1)
├── docker-compose.yml           # Orchestration for agent, pgvector db, files-sidecar, and secrets-sidecar
├── .dockerignore                # Docker build context exclusions (docs, artifacts, node_modules)
├── .gitignore                   # Git VCS exclusions (tokens, local databases, build caches)
├── .env.example                 # Environment configuration template (all placeholders marked CHANGEME)
├── README.md                    # Primary clone-ready quickstart, layout map, and operational overview
├── AGENTS.md                    # Agentic operator identity, architecture, and skills catalog
├── RULES.md                     # Strict architectural and tenant-isolation constraints
├── docs/                        # Normative specifications, presentation templates, checklists, and ISO PDFs
├── connectors/                  # Connector framework: client.ts + SKILL-FRAG.md (see connectors/README.md)
│   ├── pims-documents/          # GESTITEL Documents API adapter (PDF multipart, versions, approval)
│   ├── mail/                    # Summons dispatch connector with explicit approval gate ("envíalo")
│   ├── runtime/                 # Secret handles resolution (secret:<name>@<v>) and skill registration
│   └── _template/               # Live-build template for dynamic integrations (e.g., WhatsApp, Jira)
├── molds/                       # Typst templates (.typ) for rendering synthetic PIMS documents (see molds/README.md)
│   ├── incident-response-procedure/ # ISO 27701 Cl. 8.1, A.3.11, A.3.12 incident procedure molds
│   ├── incident-register/       # Scripted Excel (.xlsx) and PDF incident log generators
│   ├── nc-corrective-actions/   # Non-conformity and corrective action register molds
│   └── ...                      # Management review, SoA, scope, objectives, and audit programme molds
├── packages/                    # Core TypeScript libraries
│   ├── pims-adapter/            # Typed GESTITEL REST client (see packages/pims-adapter/README.md)
│   └── rag-mirror/              # Vector database client, chunking, and diff engine (see packages/rag-mirror/README.md)
├── services/                    # Autonomous HTTP sidecar services
│   ├── files-sidecar/           # Ephemeral upload receiver (5-min token TTL, see services/files-sidecar/README.md)
│   └── secrets-sidecar/         # Zero-knowledge age-encrypted credentials store (see services/secrets-sidecar/README.md)
├── university-facts/            # Dated, sourced institutional facts for cascade mutations (see university-facts/facts.json)
└── .omp/                        # Open Multi-Agent Platform agent configuration
    ├── config.yml               # Agent runtime configuration (budgets, memory, models)
    ├── USAGE.md                 # Full operational user guide served on 'mas ayuda' command
    ├── extensions/              # Runtime extensions (session start banner, secret tools)
    └── skills/                  # Registered skill definitions (12 skills catalog)
```

---

## Clone-Ready Quickstart (Evaluation & Local Testing)

Follow this 5-step sequence to clone and verify the stack in an isolated testing environment:

### Step 1: Clone the Repository

```bash
git clone https://github.com/microuni-unsa/as-turno-b-grupo-4-final-2.git
cd as-turno-b-grupo-4-final-2
```

### Step 2: Prepare Environment Configuration

Copy `.env.example` to `.env` and fill in evaluation or placeholder credentials:

```bash
cp .env.example .env
nano .env
```

> **Zero Secret Leaks**: Replace `CHANGEME` placeholders with authorized credentials. Never commit `.env` into Git.

### Step 3: Create External Network (If Missing)

The stack integrates with an external `internal-proxy` network matching the VPS Traefik environment:

```bash
docker network inspect internal-proxy >/dev/null 2>&1 || docker network create internal-proxy
```

### Step 4: Build the Container Images

Build all service images using Docker Compose:

```bash
docker compose build
```

This compiles:
1. `agent`: Full operator environment with Bun runtime, Typst 0.15, Zellij 0.45, and omp.
2. `db`: PostgreSQL 16 with pgvector extension enabled.
3. `files-sidecar`: Node 22 upload receiver service.
4. `secrets-sidecar`: Node 20 age-encryption secrets service.

### Step 5: Start and Verify Services

Start the stack in detached mode:

```bash
docker compose up -d
```

Verify service status and health:

```bash
# Check running containers
docker compose ps

# Inspect logs
docker compose logs -f agent
```

All 4 services will report healthy or running:
- `pimsai-agent`: Active, serving Zellij Web on port 8082.
- `pimsai-db`: Healthy, listening on port 5432 with pgvector support.
- `pimsai-files-sidecar`: Active, serving upload portal on port 3000.
- `pimsai-secrets-sidecar`: Active, serving age secrets store on port 3000.

---

## Sibling Container Spawning & Reserved Slugs (SPEC §4.1)

The agent communicates with Docker daemon via `DOCKER_HOST=tcp://docker-proxy:2375`. Deliverables spawned dynamically by the agent attach to `internal-proxy` under Traefik router rules:

```text
Host(`<slug>.pimsai.mistercricro8.top`)
```

### Reserved Subdomains (DO NOT REUSE FOR DELIVERABLES):
- `demo.pimsai.mistercricro8.top`: Zellij Web terminal interface (SPEC §4.2).
- `files.pimsai.mistercricro8.top`: Ephemeral document upload sidecar (SPEC §9.3).
- `secrets.pimsai.mistercricro8.top`: Age-encrypted secrets injection sidecar (SPEC §4.3).

---

## Cloudflare 443 → 444 Port Forwarding & Diagnostics (SPEC §4.1, §13)

- Traefik's `https` entrypoint listens on port **`:444`** on the VPS.
- Cloudflare edge proxy forwards public `:443` traffic to origin `:444`.
- **Diagnostic Protocol**: If an endpoint at `https://<slug>.pimsai.mistercricro8.top` fails to resolve, test origin port `:444` directly:
  ```bash
  curl -vk https://<slug>.pimsai.mistercricro8.top:444/
  ```

---

## Shared-Tenant Isolation Guardrails

1. **Mandatory Prefix Discipline (`G4-`)**: Every document code, incident identifier, audit row, and risk evaluation created by this system must strictly begin with `G4-`.
2. **Strict Read Filtering**: All REST queries against GESTITEL must filter by prefix `G4-` and responsible identity `Turno B Grupo 4` / `grupob4`. Records belonging to other academic groups must never be viewed, modified, or deleted.
3. **PIMS is the Primary Source of Truth**: Typst molds (`molds/*.typ`) and pgvector caches are strictly generative templates and caches. Authentic audit records exist only once uploaded and versioned in GESTITEL PIMS.
