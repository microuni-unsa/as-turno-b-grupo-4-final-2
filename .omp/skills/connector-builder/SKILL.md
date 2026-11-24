---
name: connector-builder
description: Standard connector convention, live-build orchestration with background subagents, self-heal probe-and-patch loop, and Traefik :444 / real-fetch rules.
---

# Connector Builder Skill (`connector-builder`)

Governs the construction, registration, and self-healing lifecycle of system connectors under `connectors/<name>/`.

## 1. Connector Convention & Architecture
```
connectors/<name>/
├── client.ts         # Real fetch()-backed typed client wrapper (NO Math.random/mock stubs)
└── SKILL-FRAG.md     # Endpoint map, auth contract, limits (:444 URLs), and failure recovery
```
- Always register completed connectors via `registerConnector({ connectorDir: "connectors/<name>" })` from `connectors/runtime/register.ts` so `.omp/skills/connectors/SKILL.md` is updated with valid YAML frontmatter.
- Read-only event/incident/audit polling connectors MUST NOT filter out non-`G4-` records (`G4-` applies strictly to PIMS writes).
- Note: Core PIMS interactions are consolidated in the authoritative SDK (`packages/pims-adapter`) and companion CLI (`bun scripts/pims.ts`), rather than standalone connectors. Integrations under `connectors/<name>/` govern auxiliary integrations (e.g., `connectors/mail/client.ts`, sibling containers, external services).

## 2. Live-Build Credential & Network Rules
1. **Self-Hosted Sibling Containers** (`docker-proxy:2375` on `internal-proxy`): Generate internal API keys directly at container startup, wire Traefik labels with mandatory `:444` public URLs (`https://<slug>.pimsai.mistercricro8.top:444`), and surface setup artifacts (e.g., WhatsApp QR code) directly—do NOT prompt via `secrets-sidecar` for self-generated container keys.
2. **External User-Owned Credentials**: Mint via `POST http://pimsai-secrets-sidecar:3000/api/secrets/request`, launch the mandatory `async: true` poll **before** replying, share `https://secrets.pimsai.mistercricro8.top:444/s/<token>`, and keep the main session responsive.
3. **Verify Before Announcing**: Execute a real read-only HTTP `healthCheck()`/`probe()` against the target before reporting completion.

## 3. Self-Heal Loop Protocol
When an existing connector breaks due to API drift, network anomalies, or schema changes:
1. **Report Exactly**: State the failed endpoint, HTTP status, or parsing error.
2. **Dispatch Background Diagnostic/Patch**: Announce repair while keeping the main session responsive via mirror queries (`bun scripts/pims.ts mirror read <doc_or_code>` or semantic `bun scripts/rag-query.ts "<query>"`).
3. **Probe → Diagnose → Patch → Re-Verify → Register**:
   - Run read-only probes first (`GET`/`HEAD`).
   - Patch `connectors/<name>/client.ts` (preserving `G4-` write guards and real HTTP semantics) and update `connectors/<name>/SKILL-FRAG.md` + `registerConnector()`. (For PIMS core issues, fixes belong in `packages/pims-adapter` or `bun scripts/pims.ts`).
   - Re-verify the read probe passes cleanly and record the lesson in local memory.
