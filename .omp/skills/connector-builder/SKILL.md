---
name: connector-builder
description: Standard connector convention, live-build workflow via background subagents, and self-heal remediation protocol.
---

# Connector Builder Skill (`connector-builder`)

Governs the construction, extension, and self-healing lifecycle of system connectors within the agentic architecture.

## 1. Connector Convention & Architecture
Every connector lives in an isolated subdirectory under the project root:
```
connectors/<name>/
├── client.ts         # Strictly typed TypeScript client wrapper
└── SKILL-FRAG.md     # Markdown fragment with endpoint map, types, and tool schema
```
- **`client.ts`**: Implements typed request/response handlers, error boundaries, auth injection, and explicit control flow. Never uses `any` or silent fallback catch-blocks.
- **`SKILL-FRAG.md`**: Provides the capability description, available methods, input/output specifications, and citation patterns. When a connector is registered, its fragment is indexed into the operational skills map.

## 2. Live-Build Workflow
When asked to interface with an external service or an unbuilt capability (e.g., Evolution/WhatsApp, Jira, SMTP bridge):
1. **Restate Target**:
   Confirm to the operator the target service, purpose, and planned integration endpoints.
   > *"Objetivo detectado: Construir conector para Evolution API (WhatsApp). Iniciando build en segundo plano."*
2. **Spawn Background Subagent**:
   Dispatch a worker subagent to scaffold `connectors/<name>/client.ts` and `connectors/<name>/SKILL-FRAG.md`.
3. **Main Session Stays Responsive**:
   The primary conversational loop never hangs or blocks. The operator can continue asking questions about ISO clauses, incident registers, or audit evidence.
4. **Credential Provisioning (if needed)**:
   If credentials are required, initiate the secrets sidecar flow (`secrets.request(label)`), present the one-time link, poll `secrets.poll(handle)`, and pass the opaque handle to the connector runtime.
5. **Verified Announcement or Diagnosis**:
   Run an automated non-mutating validation test against the newly built connector:
   - **On Success**: Announce the verified connector, its active endpoints, and sample usage commands.
   - **On Failure**: Present a concise diagnosis with the root cause and prompt for corrective direction.

## 3. Self-Heal Loop Protocol
When an existing connector breaks due to API drift, network anomalies, or schema mutations:
1. **Report Exactly**:
   State the exact failure signature immediately (endpoint, HTTP status, response body or parsing exception).
2. **Announce Fix Attempt**:
   Notify the operator that an autonomous background diagnostic and repair task has been dispatched.
   > *"Detectada anomalía en conector PIMS. Iniciando diagnóstico y autoreparación en segundo plano."*
3. **Background Probe, Diagnose, Patch, and Update**:
   - **Step A (Probe)**: Execute read-only probes first (HEAD, OPTIONS, or schema inspection). Never issue speculative mutating writes.
   - **Step B (Diagnose)**: Identify the contract mismatch, path change, or header requirement.
   - **Step C (Patch)**: Update `client.ts` with corrected routes, headers, or type definitions.
   - **Step D (Update Map)**: Update `SKILL-FRAG.md` to reflect the adjusted endpoint specifications.
4. **Answering from Mirror Meanwhile**:
   While the background worker patches the connector, the main session answers all user inquiries using the local pgvector mirror cache without interruption.
5. **Verified Fix & Lesson Recording**:
   Verify the patched connector against a live read probe. Announce the successful fix to the operator and persist the operational lesson into `memory.backend: local` (Memory Guidance) to prevent recurrence.

## 4. Hard Operational Rules
- **Read-Only Probes First**: Diagnostic routines must never perform destructive or state-modifying calls.
- **Production Write Approval Gate**: No production mutating write may be executed without explicit operator consent.
- **Zero Plaintext Credentials**: All credentials must be stored and passed as opaque handles (`secret:<name>@<version>`).
