# Pre-Demo & Examination Operational Checklist

> **Purpose**: Mandatory verification checklist prior to live evaluation or demonstration by course instructor.  
> **Normative Framework**: ISO/IEC 27701:2025 (PII Controller Role: Admission & Payroll Scope)  
> **Source-of-Truth Hierarchy**: PIMS GESTITEL (`https://unsa.27k.pe`) > pgvector Mirror Cache > Typst Molds (`molds/`).

---

## 1. Cloudflare 443 → 444 Diagnosis Protocol (FIRST STEP)

Before troubleshooting any container or application errors, verify the network edge:

- [ ] **Edge Port Mapping**: The VPS reverse proxy (Traefik) listens on port `:444`. Cloudflare Transform Rules map public `https://*.pimsai.mistercricro8.top:443` to origin `:444`.
- [ ] **First-Response Diagnostics**: If any announced URL (`demo`, `files`, `secrets`, or deliverable slug) fails to load or yields SSL/timeout errors:
  ```bash
  # Test bypass directly against origin port 444:
  curl -vk https://demo.pimsai.mistercricro8.top:444/
  curl -vk https://files.pimsai.mistercricro8.top:444/health
  curl -vk https://secrets.pimsai.mistercricro8.top:444/healthz
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
  - Verify endpoint responds HTTP 200.
  - Confirm ability to filter documents by `code` prefix `G4-`.
- [ ] **Incidents API (`GET /api/incidents/`)**:
  - Verify endpoint responds HTTP 200.
  - Check multi-tenant incident count (ensure non-G4 records are ignored).
- [ ] **Audits API (`GET /api/audits/`)**:
  - Verify endpoint responds HTTP 200.
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

### 2.4 Sidecars Health & Endpoints Probe
- [ ] **Files Sidecar (`files.pimsai.mistercricro8.top`)**:
  - Health check: `curl -f https://files.pimsai.mistercricro8.top/health` (HTTP 200 `{"status":"ok"}`).
  - Mint check: Verify single-use token generation (`POST /api/mint`) with 5-minute TTL.
- [ ] **Secrets Sidecar (`secrets.pimsai.mistercricro8.top`)**:
  - Health check: `curl -f https://secrets.pimsai.mistercricro8.top/healthz` (HTTP 200 `{"status":"ok"}`).
  - Verification: Age-encrypted volume mounted and PostgreSQL `secrets_registry` reachable.

---

## 3. Strict Shared-Tenant Guardrails Reminder

Because the GESTITEL PIMS instance is shared with other student teams:

1. **Prefix Discipline on All Writes (`G4-`)**:
   - Every document code (`G4-DOC-...`, `G4-POL-...`, `G4-PRC-...`).
   - Every incident identifier (`G4-INC-2025-...`).
   - Every audit record and corrective action entry (`G4-AUD-...`, `G4-AC-...`).
   - **Violation of this rule causes cross-group contamination.**
2. **Strict Filtering on All Reads**:
   - Reads must filter exclusively for `G4-` codes and responsible identity `Turno B Grupo 4` / `grupob4`.
   - Never display, edit, or delete records belonging to other groups.
3. **No Unapproved Production Writes**:
   - Destructive operations or uploads must require explicit human approval in chat before submission.

---

## 4. Graded Behavior Rehearsal Matrix (SPEC §9)

Verify each of the 8 canonical behaviors plus proactive intelligence:

| ID | Behavior | Primary Standard Clause | Verification Action | Expected Artifact / Output |
|---|---|---|---|---|
| **1** | `version-compare` | ISO 27701 Cl. 7.5.3 (Control of documented info) | Request comparison of two document versions (e.g., v1.0 vs v2.0 or v2.0 vs v3.0). | Structural diff narrative, change rationale from history table, RAFA scope shift explanation. |
| **2** | `incident RAG summons + dispatch` | ISO 27701 Cl. 8.1, A.3.11, A.3.12 | Query NC/corrective action chain for active incident findings. | Red/Amber/Green status table with owners, deadlines, and RAG evidence quotes; summons draft; dispatch on explicit `"envíalo"`. |
| **3** | `upload-and-read + ingest tool` | ISO 27701 Cl. 7.5.2 | Ask *"¿cómo te subo un archivo?"*. | Files sidecar link (`https://files.../upload/<tok>`); 5-min timeout timer; parse; upload to PIMS; run `ingest(doc_id, v)`. |
| **5** | `live connector-build` | ISO 27701 Cl. 6.1.3 / ISO 42001 Cl. 8.4 | Request integration with external platform (e.g. WhatsApp/Evolution or Jira). | Background subagent spawns via `connectors/_template/`; main session answers uninterrupted; verified announcement. |
| **6** | `audit-chain drill-down` | ISO 27701 Cl. 9.2.2, 10.2 (NC & corrective action) | Request drill-down on finding ID. | Trace: Finding → NC → Corrective Action → Owner/Deadline → Verbatim evidence citation (`pims:<id>:v<v>:chunk:<c>:lines:<l>`). |
| **7** | `directed new-version` | ISO 27701 Cl. 4.1, 7.5.3 | Direct a scope change (e.g. add filial Camaná or shift remote payroll). | Mold updated; version bumped (1.x vs 2.x); Typst PDF compiled; uploaded via PIMS API; `change_summary` logged; published link. |
| **8** | `university-change cascade` | ISO 27701 Cl. 4.1, 6.1.3 (Scope & Risk cascade) | Introduce a new university fact (e.g. Rectoral Resolution for filial expansion). | Fact recorded in `university-facts/`; scan impacted molds/docs; propose remake set; await approval; execute cascade & re-ingest. |
| **+** | **Proactive Suggestions** | Audit 1 ("de la manito" guideline) | Ask any standard operational question. | Operator offers contextually adjacent item (e.g., *"¿Desea examinar también el informe de auditoría que originó esta acción correctiva?"*). |

---

## 5. Post-Rehearsal Clean-Up

- [ ] Confirm no leftover mock documents were uploaded without `G4-` prefix.
- [ ] Reset interactive session in Zellij via `/new` so the instructor receives a clean starting banner.
- [ ] Verify `task.softRequestBudget` is active and clean.
