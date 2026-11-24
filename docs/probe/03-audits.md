# PIMS Live REST API Probe Report: Audits & Findings

> **Probe ID**: `PROBE-03-AUDITS`  
> **Status**: Verified Read-Only Against Production  
> **Target Base URL**: `https://unsa.27k.pe`  
> **Schema Header**: `X-PIMS-Schema: unsa`  
> **Authentication**: Bearer JWT via `POST /business/login/`  
> **Reference Contract**: `docs/PIMS-SDK-SPEC.md` §2.4  
> **Probe Date**: 2026-11-23  

---

## 1. Executive Summary

A comprehensive, non-destructive, read-only live probe of the GESTITEL PIMS audits REST API was conducted against the live production server (`https://unsa.27k.pe`) under the `unsa` schema tenant. The scan examined all 3 existing audit records (`AUD-2026-001`, `AUD-2026-002`, `AUD-2026-003`), 32 total findings, and 122 total actions. It evaluated query parameter filters, DRF pagination behaviors, detail models, finding deduplication on `AUD-2026-003`, action closure states, and error handling contracts.

### Primary Ground-Truth Findings
1. **DRF Paginated Envelope**: `GET /api/audits/` returns a standard Django REST Framework paginated envelope `{ count, next, previous, results }`.
2. **List vs Detail Payload Identity**: The list item payload (`results[]`) and the detail payload (`GET /api/audits/{id}/`) are **100% byte-identical** across all 20 fields. The list endpoint embeds the complete hierarchical tree (`checklist[]`, `findings[]`, and nested `actions[]`), rendering separate detail calls redundant for listing workflows.
3. **Missing `id` on Nested Entities**: Neither `findings` items nor nested `actions` items possess an `id` property in live responses. Identifiers in both arrays are strictly positional (`position: number`).
4. **Severe Action Cloning in `AUD-2026-003`**: In `AUD-2026-003`, all 30 findings contain 4 actions each (120 actions total). For findings 0 through 28, actions at index 1, 2, and 3 are cloned replicas of finding 29's action (`"Send authority notification with Art 33(1) delay reasons..."`). Only the `position` integer varies; all other 7 fields are byte-identical with `responsible: "UNASSIGNED"`.
5. **Closure Rule Verdict**: Confirmed. In live data, zero actions are closed (all 122 actions have `status: "O"` and `closed_at: null`). In `AUD-2026-001`, the audit level is marked `status: "C"` while its sole action is `status: "O"`, `progress: null`, and `is_overdue: true`. The spec §2.4 verification rule (`status === "C" && progress === 100 && closed_at !== null && evidence !== null`) is essential to prevent false-green reporting.
6. **Query Parameter Validation**: `status=` filters strictly by audit status choices (`P` = Planificada, `R` = En curso, `C` = Cerrada). Invalid status values return HTTP 400 with a validation error list.
7. **Numeric Primary Key Routing**: `/api/audits/{id}/` strictly requires integer primary keys. Querying by `audit_code` (e.g., `/api/audits/AUD-2026-001/`) returns HTTP 404 `{"detail": "No encontrado."}`.

---

## 2. Endpoints Probed & HTTP Status Summary

| Endpoint | Method | Query / Path Params | Status | Response Shape | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/audits/` | GET | None | `200 OK` | DRF Envelope `{ count: 3, next: null, results: [ ...3 ] }` | Default pagination; returns all 3 audits with embedded findings & actions |
| `/api/audits/?page=1` | GET | `page=1` | `200 OK` | DRF Envelope `{ count: 3, results: [ ...3 ] }` | First page of audits |
| `/api/audits/?page=2` | GET | `page=2` | `404 Not Found` | Error `{ "detail": "Página inválida." }` | Out-of-bounds page |
| `/api/audits/?page=999` | GET | `page=999` | `404 Not Found` | Error `{ "detail": "Página inválida." }` | Out-of-bounds page |
| `/api/audits/?page=0` | GET | `page=0` | `404 Not Found` | Error `{ "detail": "Página inválida." }` | Page index 0 invalid |
| `/api/audits/?page=abc` | GET | `page=abc` | `404 Not Found` | Error `{ "detail": "Página inválida." }` | Non-numeric page invalid |
| `/api/audits/?page_size=1` | GET | `page_size=1` | `200 OK` | DRF Envelope `{ count: 3, next: "...?page=2...", results: [ 1 ] }` | Yields valid `next` link |
| `/api/audits/?page_size=5` | GET | `page_size=5` | `200 OK` | DRF Envelope `{ count: 3, next: null, results: [ 3 ] }` | Page size > count returns all |
| `/api/audits/?page_size=100` | GET | `page_size=100` | `200 OK` | DRF Envelope `{ count: 3, next: null, results: [ 3 ] }` | Large page size accepted |
| `/api/audits/?page_size=0` | GET | `page_size=0` | `200 OK` | DRF Envelope `{ count: 3, results: [ 3 ] }` | Ignored, falls back to default |
| `/api/audits/?page_size=-1` | GET | `page_size=-1` | `200 OK` | DRF Envelope `{ count: 3, results: [ 3 ] }` | Ignored, falls back to default |
| `/api/audits/?page_size=abc` | GET | `page_size=abc` | `200 OK` | DRF Envelope `{ count: 3, results: [ 3 ] }` | Ignored, falls back to default |
| `/api/audits/?search=AUD` | GET | `search=AUD` | `200 OK` | DRF Envelope `{ count: 3, results: [ 3 ] }` | Matches `audit_code` prefix |
| `/api/audits/?search=2026` | GET | `search=2026` | `200 OK` | DRF Envelope `{ count: 3, results: [ 3 ] }` | Matches `name` / `audit_code` |
| `/api/audits/?search=XYZNONEXISTENT` | GET | `search=XYZNONEXISTENT`| `200 OK` | DRF Envelope `{ count: 0, results: [] }` | Clean zero-match response |
| `/api/audits/?status=P` | GET | `status=P` | `200 OK` | DRF Envelope `{ count: 2, results: [ AUD-2026-003, AUD-2026-002 ] }` | Planificada filter |
| `/api/audits/?status=C` | GET | `status=C` | `200 OK` | DRF Envelope `{ count: 1, results: [ AUD-2026-001 ] }` | Cerrada filter |
| `/api/audits/?status=R` | GET | `status=R` | `200 OK` | DRF Envelope `{ count: 0, results: [] }` | En curso filter (valid choice, 0 matches) |
| `/api/audits/?status=O` | GET | `status=O` | `400 Bad Request` | Field Error `{ "status": [ "Escoja una opción válida..." ] }` | Invalid status choice |
| `/api/audits/?status=INVALID` | GET | `status=INVALID` | `400 Bad Request` | Field Error `{ "status": [ "Escoja una opción válida..." ] }` | Invalid status choice |
| `/api/audits/3/` | GET | ID: `3` (`AUD-2026-003`) | `200 OK` | Single Audit Object (49,552 bytes) | 30 findings, 120 actions |
| `/api/audits/2/` | GET | ID: `2` (`AUD-2026-002`) | `200 OK` | Single Audit Object (1,859 bytes) | 1 finding, 1 action |
| `/api/audits/1/` | GET | ID: `1` (`AUD-2026-001`) | `200 OK` | Single Audit Object (699 bytes) | 1 finding, 1 action |
| `/api/audits/999999/` | GET | ID: `999999` | `404 Not Found` | Error `{ "detail": "No Audit matches the given query." }` | Numeric 404 |
| `/api/audits/0/` | GET | ID: `0` | `404 Not Found` | Error `{ "detail": "No Audit matches the given query." }` | Numeric 404 |
| `/api/audits/-1/` | GET | ID: `-1` | `404 Not Found` | Error `{ "detail": "No Audit matches the given query." }` | Numeric 404 |
| `/api/audits/AUD-2026-001/` | GET | Code: `AUD-2026-001` | `404 Not Found` | Error `{ "detail": "No encontrado." }` | String lookup not supported |
| `/api/audits/` | OPTIONS| None | `200 OK` | DRF Schema Metadata | Field types, choices, read-only labels |

---

## 3. Endpoint Shapes & Key Inventories

### 3.1 Collection Envelope (`GET /api/audits/`)

| Field | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `count` | `number` | No | Total count of audit records matching filters (currently `3`). |
| `next` | `string \| null` | Yes | URL to next page or `null` if on the last page. |
| `previous` | `string \| null` | Yes | URL to previous page or `null` if on the first page. |
| `results` | `Array<Audit>` | No | Array of audit objects (byte-identical to detail items). |

### 3.2 Audit Object Key Inventory (`results[]` & `GET /api/audits/{id}/`)

Top-level audit records contain 20 keys:

| Key | Type | Nullable | Observed Values / Example | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `number` | No | `1`, `2`, `3` | Internal database integer ID. |
| `audit_code` | `string` | No | `"AUD-2026-001"`, `"AUD-2026-002"`, `"AUD-2026-003"` | Formal business code of the audit. |
| `audit_type` | `string` | No | `"I"` | Audit classification: `"I"` (Interna), `"E"` (Externa). |
| `name` | `string` | No | `"Auditoría interna del PIMS 2026..."` | Descriptive title / name of the audit. |
| `scope` | `string \| null` | Yes | `"Procesos del alcance del PIMS..."` or `null` | Scope description. |
| `objective` | `string \| null` | Yes | `"Verificar la conformidad del PIMS..."` or `null` | Audit objective. |
| `start_date` | `string \| null` | Yes | `"2026-11-09"` or `null` | ISO date string (`YYYY-MM-DD`). |
| `end_date` | `string \| null` | Yes | `"2026-11-20"` or `null` | ISO date string (`YYYY-MM-DD`). |
| `lead_auditor` | `string \| null` | Yes | `"ANON"` or `null` | Name of lead auditor / group. |
| `audit_team` | `string \| null` | Yes | `"ANON, ANON, ANON, ANON"` or `null` | Comma-separated names of audit team members. |
| `involved_areas` | `string \| null` | Yes | `"Admisión, Registro Académico, ..."` or `null` | Areas and departments involved. |
| `status` | `string` | No | `"P"`, `"C"` | Audit status: `"P"` (Planificada), `"R"` (En curso), `"C"` (Cerrada). |
| `progress` | `number` | No | `0` | Aggregated audit completion percentage (`0`–`100`). |
| `checklist` | `Array<any>` | No | `[]` | Checklist items (currently empty array in all audits). |
| `findings` | `Array<Finding>` | No | Array of 1 to 30 findings | Embedded findings hierarchy. |
| `findings_count`| `number` | No | `1`, `30` | Read-only counter matching `findings.length`. |
| `created_at` | `string` | No | `"2026-11-05T19:27:17.399078Z"` | ISO 8601 UTC creation timestamp. |
| `created_by` | `number` | No | `13`, `14` | User ID who created the audit record. |
| `updated_at` | `string` | No | `"2026-11-06T08:22:08.365181Z"` | ISO 8601 UTC modification timestamp. |
| `updated_by` | `number` | No | `14` | User ID who last modified the record. |

### 3.3 Finding Item Key Inventory (`findings[]`)

Each item in `findings` contains 5 keys (note: NO `id` field):

| Key | Type | Nullable | Observed Values / Range | Description |
| :--- | :--- | :--- | :--- | :--- |
| `classification` | `string` | No | `"N"` (18), `"O"` (13), `"M"` (1) | Audit finding severity code: `"N"` (No conformidad Menor), `"O"` (Observación / Oportunidad), `"M"` (No conformidad Mayor). |
| `description` | `string` | No | Truncated example: `"[Propuesta del agente] H-01 · ISO/IEC 27701:2025 4.1 E2..."` | Detailed finding description and norm citation. |
| `evidence` | `string \| null`| Yes | `"\"SIM-PIMS-01\" [SIM-PIMS-01]"`, `"[source_requirement_code=A.3.12]"`, `null` | Evidence or document reference supporting finding. |
| `position` | `number` | No | `0` to `29` | Zero-based index within the audit findings array. |
| `actions` | `Array<Action>` | No | Array of 1 to 4 action items | Corrective and preventive actions array. |

### 3.4 Nested Action Item Key Inventory (`findings[].actions[]`)

Each item in `actions` contains 8 keys (note: NO `id` field):

| Key | Type | Nullable | Observed Values | Description |
| :--- | :--- | :--- | :--- | :--- |
| `action_plan` | `string` | No | `"Corrección inmediata: Actualizar el documento..."` | Action description / mitigation plan. |
| `responsible` | `string` | No | `"ANON"`, `"UNASSIGNED"` | Responsible department, person, or placeholder. |
| `due_date` | `string` | No | `"2026-11-15"`, `"2026-11-25"`, `"2026-12-02"`, `"2027-01-19"`, `"2027-02-18"` | ISO date deadline (`YYYY-MM-DD`). |
| `status` | `string` | No | `"O"` | Action status: `"O"` (Open / Abierto). |
| `progress` | `number \| null`| Yes | `0` (121 occurrences), `null` (1 occurrence in `AUD-2026-001`) | Completion percentage (`0`–`100` or `null`). |
| `closed_at` | `string \| null`| Yes | `null` (122 / 122 occurrences) | Timestamp when action was closed, or `null`. |
| `position` | `number` | No | `0`, `1`, `2`, `3` | Zero-based index within the finding actions array. |
| `is_overdue` | `boolean` | No | `false` (121 occurrences), `true` (1 occurrence in `AUD-2026-001`) | Boolean overdue flag computed by backend. |

### 3.5 List vs Detail Shape Differences
In live GESTITEL PIMS, there is **zero difference** between the objects returned in `GET /api/audits/` (`results[]`) and `GET /api/audits/{id}/`.
- Comparison test: `JSON.stringify(listItem) === JSON.stringify(detailItem)` evaluated to **`true`** for all three audits (`AUD-2026-001`, `AUD-2026-002`, `AUD-2026-003`).
- Payload lengths were identical: `AUD-2026-003` was 49,552 bytes in both list and detail endpoints.
- **Architectural implication**: The adapter can fulfill single audit lookups from an in-memory cache of `listAudits()` without additional HTTP roundtrips.

---

## 4. Query Parameter Matrix

All query parameter combinations were probed with live requests:

| Parameter & Value | Status | Response Shape / Behavior | Notes |
| :--- | :--- | :--- | :--- |
| Default `GET /api/audits/` | `200 OK` | `{ count: 3, next: null, previous: null, results: [ ...3 items... ] }` | Default page size returns all 3 audits. |
| `search=AUD` | `200 OK` | `{ count: 3, results: [ ...3 items... ] }` | Matches `audit_code` prefix. |
| `search=2026` | `200 OK` | `{ count: 3, results: [ ...3 items... ] }` | Matches `audit_code` / `name` containing "2026". |
| `search=XYZNONEXISTENT` | `200 OK` | `{ count: 0, next: null, previous: null, results: [] }` | Clean empty result set. |
| `status=P` | `200 OK` | `{ count: 2, results: [ AUD-2026-003, AUD-2026-002 ] }` | Filters Planificada audits. |
| `status=C` | `200 OK` | `{ count: 1, results: [ AUD-2026-001 ] }` | Filters Cerrada audits. |
| `status=R` | `200 OK` | `{ count: 0, results: [] }` | Accepted choice (En curso), returns 0 items. |
| `status=O` | `400 Bad Request` | `{"status": ["Escoja una opción válida. O no es una de las opciones disponibles."]}` | Rejects document status code "O". |
| `status=B` | `400 Bad Request` | `{"status": ["Escoja una opción válida. B no es una de las opciones disponibles."]}` | Rejects document status code "B". |
| `status=V` | `400 Bad Request` | `{"status": ["Escoja una opción válida. V no es una de las opciones disponibles."]}` | Rejects document status code "V". |
| `status=INVALID` | `400 Bad Request` | `{"status": ["Escoja una opción válida. INVALID no es una de las opciones disponibles."]}` | Standard DRF choice validation failure. |
| `page=1` | `200 OK` | `{ count: 3, results: [ 3 items ] }` | First page. |
| `page=2` | `404 Not Found` | `{"detail": "Página inválida."}` | Out-of-range page returns 404. |
| `page=999` | `404 Not Found` | `{"detail": "Página inválida."}` | Out-of-range page returns 404. |
| `page=0` | `404 Not Found` | `{"detail": "Página inválida."}` | Zero page is invalid. |
| `page=abc` | `404 Not Found` | `{"detail": "Página inválida."}` | Non-numeric page returns 404. |
| `page_size=1` | `200 OK` | `{ count: 3, next: "https://.../?page=2&page_size=1", results: [ 1 item ] }` | Pagination correctly yields `next` URL. |
| `page_size=5` | `200 OK` | `{ count: 3, next: null, results: [ 3 items ] }` | Page size > count returns all in page 1. |
| `page_size=100` | `200 OK` | `{ count: 3, next: null, results: [ 3 items ] }` | Large page size accepted. |
| `page_size=0` | `200 OK` | `{ count: 3, next: null, results: [ 3 items ] }` | Ignored; falls back to default page size. |
| `page_size=-1` | `200 OK` | `{ count: 3, next: null, results: [ 3 items ] }` | Negative page size ignored; returns default. |
| `page_size=abc` | `200 OK` | `{ count: 3, next: null, results: [ 3 items ] }` | Non-numeric page size ignored; returns default. |

---

## 5. Error-Case Response Shapes

### 5.1 Numeric 404: Unknown Audit Primary Key (`GET /api/audits/999999/`)
- **HTTP Status**: `404 Not Found`
- **Response Headers**: `Content-Type: application/json`
- **Response Body**:
```json
{
  "detail": "No Audit matches the given query."
}
```

### 5.2 Non-Numeric 404: String Audit Code Lookup (`GET /api/audits/AUD-2026-001/`)
- **HTTP Status**: `404 Not Found`
- **Response Body**:
```json
{
  "detail": "No encontrado."
}
```
*Note: The Django URL router matches `(?P<pk>[0-9]+)`. Non-digit routes trigger standard 404 routing rather than DRF ModelViewSet object lookup.*

### 5.3 Validation Error 400: Invalid Query Parameter Choice (`GET /api/audits/?status=INVALID`)
- **HTTP Status**: `400 Bad Request`
- **Response Body**:
```json
{
  "status": [
    "Escoja una opción válida. INVALID no es una de las opciones disponibles."
  ]
}
```

### 5.4 Pagination 404: Invalid Page (`GET /api/audits/?page=999`)
- **HTTP Status**: `404 Not Found`
- **Response Body**:
```json
{
  "detail": "Página inválida."
}
```

---

## 6. Deduplication Quantification & Evidence

### 6.1 Quantification Table Across All Audits

| Audit Code | Audit ID | Audit Name | Total Findings | Total Actions | Distinct Tuples `(classification, description, action_plan, responsible)` | Redundant / Cloned Action Entries |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `AUD-2026-001` | 1 | `SPEC-CAPTURE CLOSED audit probe — ignore` | 1 | 1 | 1 | 0 |
| `AUD-2026-002` | 2 | `Auto: incident INC-001 corrective actions` | 1 | 1 | 1 | 0 |
| `AUD-2026-003` | 3 | `Auditoría interna del PIMS 2026 — Grupo 3...` | 30 | 120 | 59 | **61** |
| **Total** | | | **32** | **122** | **61** | **61** |

### 6.2 Forensic Anatomy of the `AUD-2026-003` Clone Anomaly
In `AUD-2026-003`:
1. Every finding from position 0 through position 29 has exactly 4 items in its `actions` array ($30 \times 4 = 120$ actions).
2. For findings 0 through 28 (29 findings):
   - `actions[0]`: Contains a unique `action_plan` specifically targeting that finding (e.g., `"Corrección inmediata: Actualizar el documento de contexto..."`), with `due_date: "2027-01-19"` or `"2027-02-18"` and specific department responsibilities (`OPDP`, `CPSI`, `OUIS`, etc.).
   - `actions[1]`, `actions[2]`, `actions[3]`: **All three are exact clones** of finding 29's action plan: `"Send authority notification with Art 33(1) delay reasons; review notification delay root cause"`, with `due_date: "2026-12-02"`, `responsible: "UNASSIGNED"`, `status: "O"`, `progress: 0`, `closed_at: null`, and `is_overdue: false`.
3. For finding 29:
   - `actions[0]`, `actions[1]`, `actions[2]`, `actions[3]`: **All four actions** are identical replicas of that exact same Art 33 action plan.
4. Total occurrences of `"Send authority notification with Art 33(1) delay reasons..."` across `AUD-2026-003`:
   $$(29 \text{ findings} \times 3 \text{ cloned actions}) + (1 \text{ finding} \times 4 \text{ cloned actions}) = 87 + 4 = 91 \text{ occurrences}.$$

### 6.3 Concrete Clone Examples

#### Clone Example 1: Finding 0 (`position: 0`)
- **Finding Description (truncated to 120 chars)**:
  `"[Propuesta del agente] H-01 · ISO/IEC 27701:2025 4.1 E2. En SIM-PIMS-01 se observó que no incluye la determinación de si el ca..."`
- **Actions in Finding 0**:
  - `actions[0]`: `action_plan: "Corrección inmediata: Actualizar el documento de contexto..."`, `position: 0`, `responsible: "ANON"`
  - `actions[1]`: `action_plan: "Send authority notification with Art 33(1) delay reasons; review notification delay root cause"`, `position: 1`, `responsible: "UNASSIGNED"`
  - `actions[2]`: `action_plan: "Send authority notification with Art 33(1) delay reasons; review notification delay root cause"`, `position: 2`, `responsible: "UNASSIGNED"`
  - `actions[3]`: `action_plan: "Send authority notification with Art 33(1) delay reasons; review notification delay root cause"`, `position: 3`, `responsible: "UNASSIGNED"`

#### Clone Example 2: Finding 29 (`position: 29`)
- **Finding Description (truncated to 120 chars)**:
  `"10.2 corrective action for INC-011: authority notification deadline missed"`
- **Actions in Finding 29**:
  - `actions[0]`: `action_plan: "Send authority notification with Art 33(1) delay reasons; review notification delay root cause"`, `position: 0`, `responsible: "UNASSIGNED"`
  - `actions[1]`: `action_plan: "Send authority notification with Art 33(1) delay reasons; review notification delay root cause"`, `position: 1`, `responsible: "UNASSIGNED"`
  - `actions[2]`: `action_plan: "Send authority notification with Art 33(1) delay reasons; review notification delay root cause"`, `position: 2`, `responsible: "UNASSIGNED"`
  - `actions[3]`: `action_plan: "Send authority notification with Art 33(1) delay reasons; review notification delay root cause"`, `position: 3`, `responsible: "UNASSIGNED"`

### 6.4 Byte-Identity and Key Diff Analysis Between Clones
A deep comparison across all keys of cloned action objects (`actions[1]`, `actions[2]`, `actions[3]`) revealed:
- **Keys that DIFFER**: Only `position` (`1`, `2`, `3`).
- **Keys that are BYTE-IDENTICAL**:
  - `action_plan`: `"Send authority notification with Art 33(1) delay reasons; review notification delay root cause"`
  - `responsible`: `"UNASSIGNED"`
  - `due_date`: `"2026-12-02"`
  - `status`: `"O"`
  - `progress`: `0`
  - `closed_at`: `null`
  - `is_overdue`: `false`
- **ID presence**: Neither findings nor actions contain an `id` field.

### 6.5 Deduplication Strategy Recommendation
When presenting audit actions to users or calculating completion KPIs:
1. Deduplicate by the composite key: `(finding.classification, finding.description, action.action_plan, action.responsible)`.
2. For `AUD-2026-003`, this cleanly compresses 120 raw action rows down to 59 distinct action obligations (29 specific corrective actions + 30 Art 33 notification checks).
3. If deduplicating strictly at the action-plan level within a finding, discard actions where `action.responsible === "UNASSIGNED"` and `action.position > 0` whenever an unassigned replica already exists at `action.position: 0` or within that finding.

---

## 7. Closure-State Combinations & Spec §2.4 Verification

### 7.1 Observed Action State Combinations Table
Probing all 122 actions across all 32 findings in the live system yields the following distribution:

| Status (`status`) | Progress (`progress`) | Closed Timestamp (`closed_at`) | Overdue Flag (`is_overdue`) | Parent Finding Evidence | Occurrences | Audits Observed |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `"O"` | `0` | `null` | `false` | Present (non-empty string) | **121** | `AUD-2026-003`, `AUD-2026-002` |
| `"O"` | `null` | `null` | `true` | `null` | **1** | `AUD-2026-001` |
| `"C"` | `100` | Non-null datetime | `false` | Present | **0** | None |

### 7.2 Evaluation of Spec §2.4 Closure Rule
Spec §2.4 defines the closure rule as:
$$\text{isActionClosedVerified} \iff \text{status} = \text{"C"} \land \text{progress} = 100 \land \text{closed\_at} \neq \text{null} \land \text{evidence present}$$

**Empirical Findings:**
1. **Zero Closed Actions in Live Data**: Exactly 0 of 122 actions in the database are currently closed or verified.
2. **Audit vs Action Status Disconnect**: In `AUD-2026-001`, the top-level audit status is `"C"` (Cerrada), yet its only corrective action is open (`status: "O"`), unstarted (`progress: null`), and flagged overdue (`is_overdue: true`). An audit marked closed in PIMS does **not** imply its underlying action items are closed.
3. **Evidence Field Locus**: In the live API schema, `evidence` exists exclusively on the parent `Finding` object (`finding.evidence`), not on the `Action` object (`action.evidence` is `undefined`). Any closure evaluation helper must inspect the parent finding's evidence citation or accept finding context:
   ```ts
   export function isActionClosedVerified(
     action: PimsAuditAction,
     parentFinding?: PimsAuditFinding,
   ): boolean {
     const hasEvidence = Boolean(
       parentFinding?.evidence && parentFinding.evidence.trim().length > 0
     );
     return (
       action.status === "C" &&
       action.progress === 100 &&
       action.closed_at !== null &&
       hasEvidence
     );
   }
   ```
4. **Verdict**: **CONFIRMED & CRITICAL**. Because open actions default to `progress: 0` and top-level audits can be marked `"C"` prematurely, the strict 4-condition rule is essential to prevent false-green reporting across operational dashboards.

---

## 8. Spec Deviations & Corrections

The following table documents all discrepancies between `docs/PIMS-SDK-SPEC.md` (and existing `packages/pims-adapter/types.ts`) versus live API reality:

| Component | PIMS-SDK-SPEC.md / `types.ts` Assumption | Live Ground Truth (`https://unsa.27k.pe`) | Required Adapter / Type Fix |
| :--- | :--- | :--- | :--- |
| **Finding ID** | Spec §2.4 typed `findings: Array<{ id?: number, ... }>`. `types.ts` declared `id: number`. | Findings have **no `id` property**; positional only (`position: number`). | Update `PimsAuditFinding`: remove mandatory `id`, type `id?: undefined` or omit. |
| **Action ID** | Spec §2.4 typed `actions: Array<{ id?: number, ... }>`. | Actions have **no `id` property**; positional only (`position: number`). | Update `PimsAuditAction`: remove `id`. |
| **Finding Fields in `types.ts`** | `types.ts` defined `severity`, `non_conformity`, `responsible`, `evidence_cite`. | Live findings have `classification`, `description`, `evidence`, `position`, `actions[]`. | Replace legacy fields in `PimsAuditFinding` with live schema. |
| **Audit Fields in `types.ts`** | `types.ts` defined `code`, `title`, `audit_date`, `responsible`. | Live audits have `audit_code`, `name`, `audit_type`, `start_date`, `end_date`, `lead_auditor`, `audit_team`, `involved_areas`, `checklist`, `findings_count`. | Update `PimsAudit` interface in `types.ts` to match live schema. |
| **Action `progress` Nullability** | Spec §2.4 typed `progress: number`. | In `AUD-2026-001`, `progress` is `null`. | Type `progress: number \| null`. |
| **Action Evidence Location** | Spec §2.4 implied `evidence` is evaluated directly on action. | `evidence` exists on `Finding`, not `Action`. | `isActionClosedVerified` must accept finding context (`finding.evidence`). |
| **List vs Detail Payload** | Assumed list might return a condensed shape requiring detail fetches. | List items in `results[]` are **100% byte-identical** to detail GETs (embeds all findings & actions). | Adapter `getAudit(id)` can resolve directly from cached list results. |
| **Status Filter Values** | Unspecified choices. | `status=` accepts strictly `"P"`, `"R"`, `"C"`. Invalid choices return HTTP 400. | Type `status?: "P" \| "R" \| "C"` on `ListAuditsParams`. |
| **Audit Code Lookup** | Spec §3 implied `audits get <id_or_code>`. | Route `/api/audits/<string>/` returns HTTP 404. Live API only accepts numeric IDs. | SDK must resolve audit codes client-side via `listAudits({ search })`. |
