# Pre-Demo & Examination Operational Checklist

> **Purpose**: Mandatory verification checklist prior to live evaluation or demonstration by course instructor.  
> **Normative Framework**: ISO/IEC 27701:2025 (PII Controller Role: Admission & Payroll Scope)  
> **Source-of-Truth Hierarchy**: PIMS GESTITEL (`https://unsa.27k.pe`) > pgvector Mirror Cache > Typst Molds (`molds/`).

---

## 1. Cloudflare 443 → 444 Diagnosis Protocol (FIRST STEP)

Before troubleshooting any container or application errors, verify the network edge:

- [ ] **Edge Port Mapping**: The VPS reverse proxy (Traefik) listens on port `:444`. Cloudflare Transform Rules map public `https://*.pimsai.mistercricro8.top:443` to origin `:444`.
- [ ] **First-Response Diagnostics**: If any announced URL (`demo` or deliverable sibling slug) fails to load or yields SSL/timeout errors:
  ```bash
  # Test bypass directly against origin port 444:
  curl -vk https://demo.pimsai.mistercricro8.top:444/healthz
  ```
  *If port 444 responds correctly but public 443 fails, the issue is strictly the Cloudflare Transform Rule.*

---

## 2. Pre-Demo Diagnostic Probe Pass

Run this probe sequence before handing access tokens to the instructor:

### 2.1 PIMS GESTITEL API Reachability
- [ ] **Authentication (`POST /business/login/`)**:
  - Request JWT credentials using Group 4 credentials.
  - Verify receipt of `access` and `refresh` tokens.
- [ ] **Documents API (`GET /api/documents/`)**:
  - Verify endpoint responds HTTP 200 and returns all PIMS documents uniformly (array/paginated normalized).
- [ ] **Incidents API (`GET /api/incidents/`)**:
  - Verify endpoint responds HTTP 200 across all system incidents (`INC-001`..`INC-012`, `G4-...`).
- [ ] **Audits API (`GET /api/audits/`)**:
  - Verify endpoint responds HTTP 200 across all audits (`AUD-2026-001`..`003`) with cloned findings deduplicated in analysis.
- [ ] **Risk Evaluations API (`GET /api/risk-evaluations/`)**:
  - Verify endpoint responds HTTP 200.

### 2.2 403 Re-Probe on System Catalogs & Trainings (SPEC §3.1, §13)
- [ ] **Re-probe `trainings` & `system-catalogs`**:
  - Attempt `GET /api/trainings/` and `GET /api/system-catalogs/`.
  - **Expected Baseline**: HTTP 403 Forbidden for `grupob4` (verified on 2026-11-13).
  - **Operational Fallback Rule**: If still 403, confirm that all ISO/IEC 27701 Cl. 7.2 / 7.3 / A.3.17 training modules, attendee logs, and exam evaluations are stored and fetched as uploaded synthetic PIMS documents (`G4-DOC-CAP-...`), NOT as backend database rows.

### 2.3 Sibling Slug Publish Probe (SPEC §4.1)
- [ ] **Test Deliverable Publishing**:
  - Verify the agent can spawn a lightweight sibling container joining `internal-proxy`.
  - Confirm Traefik router `pimsai-<slug>` picks up the container dynamically.
  - Test public resolution of `https://<slug>.pimsai.mistercricro8.top`.

### 2.4 Unified Web App Health & Built-In Endpoints Probe
- [ ] **Unified Web App (`demo.pimsai.mistercricro8.top`)**:
  - Health check: `curl -f https://demo.pimsai.mistercricro8.top:444/healthz` (HTTP 200 `{"status":"ok"}`).
  - Internal publish & upload check: Verify `POST http://127.0.0.1:8082/internal/publish` returns `https://demo.pimsai.mistercricro8.top:444/api/files/<slug>` and composer upload persists under `/app/data/preserved_uploads`.
  - Built-in age secrets check: Verify `POST http://127.0.0.1:8082/internal/secrets/request` emits an inline encrypted password card, `/app/secrets` volume is mounted, and PostgreSQL `secrets_registry` is reachable.

---

## 3. Strict Shared-Tenant Guardrails Reminder

Because the GESTITEL PIMS instance is shared with other student teams:

1. **Prefix Discipline on All Writes (`G4-`)**:
   - Every written/created document code (`G4-POL-...`, `G4-PRC-...`), incident (`G4-INC-...`), audit record, or risk evaluation must start with `G4-`.
   - **Violation of this rule is blocked client-side before network calls.**
2. **Uniform Full-System Reads**:
   - Reads (`GET /api/documents/`, `/api/incidents/`, `/api/audits/`, `/api/assets/`) operate uniformly across the system without filtering out non-`G4-` records.
   - Never mutate or delete records belonging to other student groups.
3. **Mandatory Approval Gate on All Live PIMS Writes**:
   - All live PIMS mutations (documents, new versions, incidents) and outbound SMTP/messaging dispatches require explicit human approval after presenting a preview or draft.

---

## 4. Graded Behavior Rehearsal Matrix (SPEC §9)

Verify each of the 8 canonical behaviors plus proactive intelligence:

| ID | Behavior | Primary Standard Clause | Verification Action | Expected Artifact / Output |
|---|---|---|---|---|
| **1** | `version-compare` | ISO 27701 Cl. 7.5.3 (Control of documented info) | Request comparison of two live PIMS document versions (e.g., v1.00 vs v3.00). | Extracted-text structural diff, change rationale from PIMS version history & PDF revision table (internal files never cited), `/api/files/<slug>` inline preview card. |
| **2** | `incident RAG summons + dispatch` | ISO 27701 Cl. 8.1, A.3.11, A.3.12 | Query full-system incident/audit corrective chain. | Deduplicated Red/Amber/Green status table (strict verified green), persisted email draft using real PIMS emails, real Gmail SMTP dispatch only on `"envíalo"`. |
| **3** | `upload-and-read + ingest tool` | ISO 27701 Cl. 7.5.2 | Ask *"¿cómo te subo un archivo?"*. | Direct chat composer attachment/drag-and-drop instructions (up to 50 MB); "Ask First" inspection before vectorize/PIMS upload. |
| **5** | `live connector-build` | ISO 27701 Cl. 6.1.3 / ISO 42001 Cl. 8.4 | Request integration with external platform (e.g. WhatsApp/Evolution or Jira). | Background subagent via `connectors/_template/` (`fetch()`); self-hosted container keys injected directly + native `:444` UI surfaced immediately (`secrets_request` inline password card only for external user creds). |
| **6** | `audit-chain drill-down` | ISO 27701 Cl. 9.2.2, 10.2 (NC & corrective action) | Request drill-down on finding/incident ID. | Trace: Finding/Incident → NC → Corrective Action → Owner/Deadline → Verbatim evidence citation (`pims:<code>:v<v>:<chunk>:lines:<l>`) + `/api/files/<slug>` link. |
| **7** | `directed new-version` | ISO 27701 Cl. 4.1, 7.5.3 | Direct a change on a `G4-` document. | Next PIMS integer aligned on PDF cover/footer/history; copy-then-fill staging with `molds/common/`; preview published via `content_base64`; explicit approval gate before PIMS upload + re-ingest. |
| **8** | `university-change cascade` | ISO 27701 Cl. 4.1, 6.1.3 (Scope & Risk cascade) | Introduce a new university fact. | Fact recorded in `university-facts/`; scan full mirror + PIMS; propose remake set; await approval; compile via staging & re-ingest after consent. |
| **+** | **Proactive Suggestions** | Audit 1 ("de la manito" guideline) | Ask any standard operational question. | Operator offers contextually adjacent item (e.g., *"¿Desea examinar también el informe de auditoría que originó esta acción correctiva?"*). |

---

## 5. Post-Rehearsal Clean-Up

- [ ] Confirm no leftover mock documents were uploaded without `G4-` prefix.
- [ ] Reset interactive session in the Unified Web App via `/new` so the instructor receives a clean starting banner.
- [ ] Verify `task.softRequestBudget` is active and clean.
