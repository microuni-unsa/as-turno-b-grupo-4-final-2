# Secrets Resolution Contract: `secret:<name>@<v>`

This document establishes the normative resolution contract for credentials managed by the PIMS AI secrets sidecar.

---

## 1. Architectural Purpose & Security Invariants

In compliance with **SPEC.md §4.3**, credentials required for system operations (such as PIMS / GESTITEL API tokens, Jira API keys, WhatsApp bridge credentials) are strictly decoupled from the agent LLM context.

### Invariants
1. **Zero-Knowledge to Agent Context:** Plaintext secret values NEVER touch chat transcripts, agent prompts, logs, or repository files.
2. **Handle-Only Visibility:** The agent process, prompt contexts, and tooling only observe opaque handles matching the canonical syntax:
   ```
   secret:<name>@<v>
   ```
   *(Example: `secret:pims_credentials@1`, `secret:jira_api_key@2`)*
3. **No Inspection / Printing:** The agent process cannot execute commands or tool calls to print, inspect, or reveal the underlying plaintext value of any handle.
4. **Permitted Resolution Targets:** Handles resolve to plaintext in exactly two execution environments:
   - Environment variable injection inside spawned sibling containers at `docker run` time.
   - In-memory header resolution inside the connector runtime at egress HTTP dispatch time.

---

## 2. Permitted Resolution Channels

### 2.1 Spawned Sibling Containers (Docker Run Injection)

When the agent provisions or restarts a sibling container on the `internal-proxy` network (via the Docker socket `docker-proxy:2375`):

```
Agent Orchestrator
   │
   │ passes handle in container spec:
   │ ENV PIMS_PASSWORD=secret:pims_credentials@1
   ▼
Docker Runner / Resolution Engine
   │
   │ 1. Parses handle: name="pims_credentials", version=1
   │ 2. Reads age-encrypted file: /var/lib/secrets-store/secrets/pims_credentials/v1.age
   │ 3. Decrypts using age identity: /var/lib/secrets-store/keys/identity.txt
   │ 4. Passes plaintext to container environment via stdin / Docker daemon API
   ▼
Sibling Container (Isolated Namespace)
   [Process receives plaintext in process.env.PIMS_PASSWORD]
```

- Plaintext exists solely in the isolated memory/process environment of the target sibling container.
- It is never echoed to the host shell, terminal logs, or agent output streams.

### 2.2 Connector Runtime (Authorization Header Injection)

When an agent tool requires authenticated access to an external API (e.g. GESTITEL Documents API, Jira, or Evolution/WhatsApp bridge):

1. The agent specifies the request intent using the handle:
   ```json
   {
     "action": "pims_request",
     "endpoint": "/api/documents/",
     "credential_handle": "secret:pims_credentials@1"
   }
   ```
2. The connector runtime (running in its own isolated process):
   - Resolves the handle against the age store.
   - Constructs the HTTP request in memory.
   - Injects the resolved plaintext directly into the `Authorization` header (e.g., `Authorization: Bearer <token>`).
   - Dispatches the request over the outbound TLS socket.
3. The response returned to the agent contains only status, metadata, and business payloads — the authorization header is stripped from logs and diagnostic traces.

---

## 3. Rotation Contract

1. **Version Immutability:** Once written, an encrypted version file (`v<v>.age`) and its corresponding `secrets_registry` entry are strictly immutable.
2. **Version Bump on Rotation:** Rotating a secret creates a strictly monotonic version increment:
   - Existing: `secret:pims_credentials@1`
   - Rotated: `secret:pims_credentials@2`
3. **Zero Interruption for Active Containers:** Running sibling containers retaining `secret:pims_credentials@1` continue operating without disruption because the old version remains readable in the store.
4. **Deploy-Time Refresh:** When sibling containers are restarted or new containers are spawned, the orchestrator updates their configuration to the new handle `secret:pims_credentials@2`.
