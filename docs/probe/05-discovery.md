# Live PIMS REST API Discovery & Edge Semantics Audit Report

**Date**: 2026-11-23  
**Target Environment**: Live Production GESTITEL PIMS (`https://unsa.27k.pe`)  
**Target Tenant**: `unsa` (`X-PIMS-Schema: unsa`)  
**Authenticated User**: `grupob4` (User ID: 14, Platform Role: null, Platform Admin: false)  
**Probe Scope**: Non-mutating discovery (`GET`, `HEAD`, `OPTIONS`, and single `POST /business/login/`)  
**Reference Document**: `docs/PIMS-SDK-SPEC.md` (§1 Design Principles, §2 Endpoint Specifications, §2.6 Expected 403 Endpoints)

---

## 1. Executive Summary

A comprehensive, non-mutating discovery scan of the live production GESTITEL PIMS API was conducted to determine the ground truth of the API surface, examine undocumented endpoints, and characterize authentication, URL, pagination, and error semantics.

### Primary Discoveries
1. **API Index Discovery**:
   - `GET /api/` exposes a full Django REST Framework (DRF) browsable API index (`DefaultRouter`) exposing **24 distinct collection routes**, plus standalone endpoints (`/api/dashboard/`) and sub-resources.
   - Only **9** of these endpoints were documented or referenced in `docs/PIMS-SDK-SPEC.md` §2. A total of **16 extra collection routes** exist live in production.
2. **Major Spec Invalidation — `/api/system-catalogs/`**:
   - `docs/PIMS-SDK-SPEC.md` §2.6 states: `GET /api/system-catalogs/` returns HTTP `403` and must throw `PimsTrainingsForbiddenError`.
   - **Ground Truth**: `GET /api/system-catalogs/` returns **HTTP 200** with **10 system catalogs** (`DOCUMENT_CATEGORY`, `ASSET_CATEGORY`, `THREAT`, `VULNERABILITY`, `CONTROL_TYPE`, etc.). Furthermore, `/api/system-catalog-items/` returns **177 active catalog items**.
3. **RBAC & 403 Matrix**:
   - Exactly **6 routes** return HTTP 403 for `grupob4`: `/api/trainings/`, `/api/users/`, `/api/roles/`, `/api/security-logs/`, `/api/personal-data-assessments/`, and `/api/personal-data-operations/`.
   - All 403 responses return an identical DRF error envelope: `{"detail": "Usted no tiene permiso para realizar esta acción."}`.
   - For `/api/trainings/`, `/api/security-logs/`, and `/api/personal-data-assessments/`, `OPTIONS` requests return HTTP 200, exposing resource schemas, descriptions, and action capabilities despite `GET` returning 403.
4. **Tenant & Schema Resolution**:
   - Live tenant resolution is driven by the hostname domain (`unsa.27k.pe`) and the JWT access token claim (`"schema": "unsa"`).
   - Omission of `X-PIMS-Schema` or supplying a mismatching value (`X-PIMS-Schema: xxx`) does **not** fail or change the tenant on `https://unsa.27k.pe`; both return HTTP 200. Supplying a foreign `Host` header triggers a 404.
5. **Pagination & Query Semantics**:
   - Default `page_size` is **20** across all paginated collections.
   - The server enforces a hard ceiling of **`page_size=100`**. Requests specifying `page_size=200`, `500`, or `1000` are clamped to 100 items.
   - Out-of-bounds pages (`page=99999`) or invalid pages (`page=0`, `page=-1`, `page=abc`) return HTTP 404 JSON `{"detail": "Página inválida."}`.
   - `search=` searches case-insensitively across `code`, `name`, and `responsible`, supporting accented Spanish characters. It does not search `current_version`.
6. **Error Format Discrepancies**:
   - Unknown URLs (`/api/nope/`, `/api/docs/`, `/api/openapi.json`) bypass DRF and trigger standard Django/Nginx **HTML 404 pages** (`text/html; charset=utf-8`), whereas missing model IDs (`/api/documents/999999/`) return **JSON 404** `{"detail": "No Document matches the given query."}`.

---

## 2. Discovered Route Inventory (Spec-Covered vs. Extra)

The live DRF API root (`GET /api/`) was enumerated, combined with known sub-routes, and cataloged into:
- **Spec-Covered Endpoints** (9 collections / endpoints documented in `PIMS-SDK-SPEC.md` §2)
- **Extra Discovered Endpoints** (16 collections / endpoints present live but omitted from the specification)

### 2.1 Route Inventory Table

| Route | Live HTTP Status | Envelope Type | Live Count | Spec Status | Notes / Description |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Spec-Covered Endpoints** | | | | | |
| `/api/documents/` | `200 OK` | `drf_paginated` | 18 | Covered (§2.2) | Document management. All 18 currently in status `R` (En Revisión). |
| `/api/documents/{id}/versions/` | `200 OK` | `array` | 3 (id=1) | Covered (§2.2) | Plain JSON array of version entries. |
| `/api/incidents/` | `200 OK` | `drf_paginated` | 12 | Covered (§2.3) | Incident tracking (`INC-001` .. `INC-012`). |
| `/api/incidents/{id}/attachments/`| `200 OK` | `array` | 2 (id=1) | Covered (§2.3) | Plain JSON array of attachment metadata. |
| `/api/incidents/{id}/history/` | `200 OK` | `array` | 95 (id=1) | Covered (§2.3) | Plain JSON array of audit trail history. |
| `/api/audits/` | `200 OK` | `drf_paginated` | 3 | Covered (§2.4) | Internal audits (`AUD-2026-001` .. `AUD-2026-003`). |
| `/api/risk-evaluations/` | `200 OK` | `drf_paginated` | 0 | Covered (§2.5) | Risk evaluations collection. |
| `/api/risk-evaluations/catalogs/` | `200 OK` | `dict` | - | Covered (§2.5) | Returns active matrix, threats, vulnerabilities, periods, etc. |
| `/api/risk-evaluations/eligible-assets/` | `200 OK` | `drf_paginated` | 1 | Covered (§2.5) | Assets eligible for risk evaluation (has `scope_label`). |
| `/api/assets/` | `200 OK` | `drf_paginated` | 1 | Covered (§2.5) | Asset inventory (`ACT-HW-001`). |
| `/api/annex-a-controls/` | `200 OK` | `drf_paginated` | 142 | Partial (§2.5) | ISO 27001 / ISO 27701 master control catalog (`A.5.1` .. `A.8.34`). |
| `/api/annex-a-controls/meta/` | `200 OK` | `dict` | - | Covered (§2.5) | Returns `standard`, `groups`, `roles`, `sources`, `has_law_29733`. |
| `/api/trainings/` | `403 Forbidden`| `error_detail` | - | Covered (§2.6) | Returns 403 for `grupob4` as expected. |
| `/api/system-catalogs/` | **`200 OK`** | `drf_paginated` | 10 | **Conflict (§2.6)** | **Spec claimed 403; live returns 200 with 10 catalogs!** |
| `/api/dashboard/` | `200 OK` | `dict` | - | Partial (§2.5) | Spec only lists `?tab=summary`. Live supports 4 tabs. |
| **Extra Discovered Endpoints** | | | | | |
| `/api/processes/` | `200 OK` | `drf_paginated` | 1 | **Undocumented** | Business processes (`EC2-DEMO · Matrículas`). |
| `/api/evaluation-matrices/` | `200 OK` | `drf_paginated` | 3 | **Undocumented** | Risk matrices (`Matriz 3x3` [I], `Matriz 4x4` [A], `Matriz 5x5` [I]). |
| `/api/gap-requirements/` | `200 OK` | `drf_paginated` | 69 | **Undocumented** | ISO 27701 / SGSI normative clause gap evaluations (`4.1` .. `10.2`). |
| `/api/annex-a-assessments/` | `200 OK` | `drf_paginated` | 142 | **Undocumented** | Tenant SOA assessment records corresponding to each Annex A control. |
| `/api/appraisal-ranges/` | `200 OK` | `drf_paginated` | 4 | **Undocumented** | Asset appraisal threshold ranges (`EXTREMO`, `ALTO`, `MEDIO`, `BAJO`). |
| `/api/risk-periods/` | `200 OK` | `drf_paginated` | 1 | **Undocumented** | Risk assessment periods (`Periodo inicial`, active). |
| `/api/consents/` | `200 OK` | `drf_paginated` | 0 | **Undocumented** | Data subject consent tracking (GDPR / Law 29733). |
| `/api/incident-recipients/` | `200 OK` | `drf_paginated` | 1 | **Undocumented** | Notification email recipients configured for incident reporting. |
| `/api/arcop-requests/` | `200 OK` | `drf_paginated` | 1 | **Undocumented** | ARCO-P rights requests management (`ARCO-2026-0001`). |
| `/api/arcop-requests/{id}/history/` | `200 OK` | `array` | 1 (id=1) | **Undocumented** | Audit history trail for ARCO-P requests. |
| `/api/arcop-requests/{id}/attachments/` | `200 OK` | `array` | 1 (id=1) | **Undocumented** | File attachments for ARCO-P requests. |
| `/api/system-catalog-items/` | `200 OK` | `drf_paginated` | 177 | **Undocumented** | Normalized items belonging to the 10 system catalogs. |
| `/api/dashboard-targets/` | `200 OK` | `array` | 20 | **Undocumented** | Target & warning thresholds for all 20 dashboard KPIs. |
| `/api/users/` | `403 Forbidden`| `error_detail` | - | **Undocumented** | User accounts collection (RBAC restricted). |
| `/api/roles/` | `403 Forbidden`| `error_detail` | - | **Undocumented** | Roles collection (RBAC restricted). |
| `/api/security-logs/` | `403 Forbidden`| `error_detail` | - | **Undocumented** | Audit log / security log entries (requires `core.view_securitylog`). |
| `/api/personal-data-assessments/` | `403 Forbidden`| `error_detail` | - | **Undocumented** | EIPD / DPIA impact assessments (RBAC restricted). |
| `/api/personal-data-operations/` | `403 Forbidden`| `error_detail` | - | **Undocumented** | RAT (Registro de Actividades de Tratamiento) operations (RBAC restricted). |

---

## 3. 403 Forbidden Matrix & Error Body Semantics

Six endpoints consistently reject requests from the `grupob4` service principal with HTTP 403 Forbidden.

### 3.1 403 Matrix Table

| Endpoint | Method | Live HTTP Status | Content-Type | Exact Error Body | Correlated Login Permission (`user.permissions`) |
| :--- | :---: | :---: | :---: | :--- | :--- |
| `/api/trainings/` | `GET` | `403 Forbidden` | `application/json` | `{"detail": "Usted no tiene permiso para realizar esta acción."}` | `Capacitaciones` (`ver: true`, but tenant model permission denied) |
| `/api/users/` | `GET` | `403 Forbidden` | `application/json` | `{"detail": "Usted no tiene permiso para realizar esta acción."}` | `Usuarios y Roles` (`ver: false`, `crear: false`) |
| `/api/roles/` | `GET` | `403 Forbidden` | `application/json` | `{"detail": "Usted no tiene permiso para realizar esta acción."}` | `Usuarios y Roles` (`ver: false`, `crear: false`) |
| `/api/security-logs/` | `GET` | `403 Forbidden` | `application/json` | `{"detail": "Usted no tiene permiso para realizar esta acción."}` | `Seguridad` (`ver: false`, missing `core.view_securitylog`) |
| `/api/personal-data-assessments/` | `GET` | `403 Forbidden` | `application/json` | `{"detail": "Usted no tiene permiso para realizar esta acción."}` | `EIPD (Datos Personales)` (`ver: false`) |
| `/api/personal-data-operations/` | `GET` | `403 Forbidden` | `application/json` | `{"detail": "Usted no tiene permiso para realizar esta acción."}` | `EIPD (Datos Personales)` (`ver: false`) |

### 3.2 Evaluation of Spec §2.6 `PimsTrainingsForbiddenError` Mapping
`docs/PIMS-SDK-SPEC.md` §2.6 groups `/api/trainings/` and `/api/system-catalogs/` as expected 403 endpoints throwing `PimsTrainingsForbiddenError`.

1. **`/api/trainings/`**:
   - The spec mapping **holds**. `GET /api/trainings/` reliably returns HTTP 403.
   - The SDK behavior of throwing `PimsTrainingsForbiddenError` (directing consumers to uploaded training records in `/api/documents/`) remains valid.
2. **`/api/system-catalogs/`**:
   - The spec mapping **fails / is false**. Live API returns HTTP 200 with an envelope containing 10 catalog definitions:
     - `DOCUMENT_CATEGORY` (id: 1)
     - `ASSET_CATEGORY` (id: 2)
     - `ASSET_CLASSIFICATION` (id: 3)
     - `ASSET_USAGE_FREQUENCY` (id: 4)
     - `THREAT` (id: 5)
     - `VULNERABILITY` (id: 6)
     - `CONTROL_TYPE` (id: 7)
     - `SECURITY_MEASURE_TYPE` (id: 8)
     - `ESTIMATED_TIME` (id: 9)
     - `PERSONAL_DATA_OPERATION_TYPE` (id: 10)
   - Mapping `/api/system-catalogs/` to `PimsTrainingsForbiddenError` in the SDK would cause a false error when accessing active live data.

---

## 4. Authentication Edge Semantics

Probing of authentication edge cases was conducted against `/api/documents/` and `/business/token/refresh/`.

### 4.1 Auth Probe Results Table

| Probe Scenario | Request Configuration | Live HTTP Status | Content-Type | Response Body Shape |
| :--- | :--- | :---: | :---: | :--- |
| **No Authorization Header** | Omit `Authorization` | `401 Unauthorized` | `application/json` | `{"detail": "Las credenciales de autenticación no se proveyeron."}` |
| **Garbage Bearer Token** | `Authorization: Bearer garbage-token-12345` | `401 Unauthorized` | `application/json` | `{"detail": "El token dado no es valido para ningun tipo de token", "code": "token_not_valid", "messages": [{"token_class": "AccessToken", "token_type": "access", "message": "Token is invalid"}]}` |
| **Tampered JWT Signature** | Valid access token with last 5 signature characters altered | `401 Unauthorized` | `application/json` | `{"detail": "El token dado no es valido para ningun tipo de token", "code": "token_not_valid", "messages": [{"token_class": "AccessToken", "token_type": "access", "message": "Token is invalid"}]}` |
| **Missing `X-PIMS-Schema`** | Valid access token, omit header | `200 OK` | `application/json` | DRF paginated envelope `{ count: 18, next: null, previous: null, results: [...] }` |
| **Wrong `X-PIMS-Schema`** | `X-PIMS-Schema: xxx` | `200 OK` | `application/json` | DRF paginated envelope `{ count: 18, next: null, previous: null, results: [...] }` |
| **Missing Schema on Login** | `POST /business/login/` without header | `200 OK` | `application/json` | `{ "refresh": "...", "access": "...", "user": {...} }` |
| **Wrong Schema on Login** | `POST /business/login/` with `X-PIMS-Schema: xxx` | `200 OK` | `application/json` | `{ "refresh": "...", "access": "...", "user": {...} }` |
| **Valid Refresh Flow** | `POST /business/token/refresh/` with valid `refresh` | `200 OK` | `application/json` | `{ "access": "<new_jwt_string>" }` (Verified: newly issued access token immediately succeeds on `/api/documents/`) |
| **Garbage Refresh Flow** | `POST /business/token/refresh/` with `refresh: "garbage"` | `401 Unauthorized` | `application/json` | `{"detail": "Token is invalid", "code": "token_not_valid"}` |

### 4.2 Architecture Insight: Tenant Schema Resolution
Inspection of the decoded JWT claims revealed:
- `user_id`: 14
- `schema`: `"unsa"`
- `exp`, `iat`, `jti`, `platform_role`, `is_platform_admin`

The live multi-tenant backend uses `django-tenants` domain routing. The primary tenant identifier is resolved via the HTTP request hostname (`unsa.27k.pe`), corroborated by the JWT claim `"schema": "unsa"`. The `X-PIMS-Schema` header is accepted but non-enforcing on tenant subdomains. Overriding the `Host` header to an unknown host (`invalidtenant.27k.pe`) triggers a 404.

---

## 5. URL Semantics & Method Verdicts

URL routing conventions and method constraints were probed using HTTP non-following redirects and OPTIONS inspection.

### 5.1 Trailing Slash Semantics (`APPEND_SLASH = True`)
- **Collection missing trailing slash (`GET /api/documents`)**: Returns **HTTP 301 Moved Permanently** with `Location: /api/documents/`.
- **Detail missing trailing slash (`GET /api/documents/1`)**: Returns **HTTP 301 Moved Permanently** with `Location: /api/documents/1/`.
- **Critical SDK Implication**: For mutating calls (`POST`, `PUT`, `PATCH`), sending a request without a trailing slash will result in a 301 redirect. HTTP redirect handling frequently converts the redirected request to a `GET` or drops the request payload. Therefore, the SDK must enforce trailing slashes across all endpoints deterministically.

### 5.2 Unknown Routes vs. Unknown Model IDs
- **Unregistered URL Path (`GET /api/nope/` or `/api/nope`)**:
  - Status: **HTTP 404 Not Found**
  - Content-Type: `text/html; charset=utf-8`
  - Body: HTML response (`<!doctype html><html lang="en"><head><title>Not Found</title></head><body><h1>Not Found</h1><p>The requested resource was not found on this server.</p></body></html>`).
  - Cause: Django URL resolver finds no matching regex before reaching DRF, invoking standard Django 404 handler.
- **Unregistered Endpoint Documentation (`/api/schema/`, `/api/docs/`, `/api/openapi.json`, `/api/redoc/`)**:
  - Status: **HTTP 404 Not Found**
  - Content-Type: `text/html; charset=utf-8`
  - Cause: DRF SchemaView / Spectacular / Swagger endpoints are not mounted in production.
- **Missing Model Instance on Registered Route (`GET /api/documents/999999/`)**:
  - Status: **HTTP 404 Not Found**
  - Content-Type: `application/json`
  - Body: `{"detail": "No Document matches the given query."}`.
  - Cause: Handled by DRF `get_object_or_404`, returning structured JSON.

### 5.3 Method Probes via OPTIONS
DRF `OPTIONS` is enabled across all endpoints.
- `/api/documents/`: `Allow: GET, POST, HEAD, OPTIONS`
- `/api/incidents/`: `Allow: GET, POST, HEAD, OPTIONS`
- `/api/audits/`: `Allow: GET, POST, HEAD, OPTIONS`
- `/api/risk-evaluations/`: `Allow: GET, POST, HEAD, OPTIONS`
- `/api/assets/`: `Allow: GET, POST, HEAD, OPTIONS`
- `/api/annex-a-controls/`: `Allow: GET, HEAD, OPTIONS` (Read-only catalog)
- `/api/annex-a-assessments/`: `Allow: GET, HEAD, OPTIONS`
- `/api/system-catalogs/`: `Allow: GET, HEAD, OPTIONS` (Provisioned by migrations; `POST` omitted by design)
- `/api/dashboard/`: `Allow: GET, HEAD, OPTIONS` (Dashboard APIView)
- `/api/trainings/`: `Allow: GET, POST, HEAD, OPTIONS` (Returns 200 on OPTIONS with full model metadata, despite GET returning 403)

---

## 6. Pagination & Search Semantics

Tested systematically against `/api/documents/` (18 records) and corroborated on `/api/system-catalog-items/` (177 records).

### 6.1 Pagination Mechanics
1. **Default Page Size**:
   - When `page` and `page_size` are omitted, collections default to **`page_size=20`**.
   - Verified on `/api/system-catalog-items/` (`count=177`, `results_len=20`, `next=".../?page=2"`).
2. **Page Size Clamping (Ceiling = 100)**:
   - Setting `page_size=50` returns 50 items.
   - Setting `page_size=100` returns 100 items.
   - Setting `page_size=200`, `page_size=500`, or `page_size=1000` **caps at exactly 100 items** (`results_len=100`).
   - *SDK Warning*: In `scripts/sync-pims-truth.ts`, `client.listDocuments({ page_size: 200 })` is called under the assumption that 200 items can be fetched in a single request. If the document collection grows beyond 100, silent truncation or incomplete synchronization would occur unless the SDK paginates through `next`.
3. **Out-of-Bounds & Invalid Page Numbers**:
   - `page=99999` returns **HTTP 404** `{"detail": "Página inválida."}`.
   - `page=0`, `page=-1`, and `page=abc` all return **HTTP 404** `{"detail": "Página inválida."}`.
4. **Invalid `page_size` Handling**:
   - `page_size=0`, `page_size=-1`, and `page_size=abc` do not crash; DRF discards the invalid integer and falls back to default pagination (`page_size=20`).

### 6.2 Search & Filtering Mechanics
1. **Fields Searched by `search=`**:
   - Matches `code`: `?search=G4-IDX-01` (1 match), `?search=IDX` (1 match).
   - Matches `name`: `?search=Auditor` (3 matches), `?search=Audit` (3 matches).
   - Matches `responsible`: `?search=Benítez` (18 matches), `?search=Carlos` (18 matches).
   - Case Insensitivity: `?search=Privacidad` and `?search=privacidad` return identical results.
   - Diacritics: Spanish accents are matched accurately (`?search=Revisión`).
   - Non-matching fields: `?search=3.00` yields 0 matches (`current_version` is not indexed by `SearchFilter`).
   - Nonsense query: `?search=zzznonsense999` returns HTTP 200 `{ count: 0, next: null, previous: null, results: [] }`.
2. **Dedicated Query Parameters**:
   - `?category=PO` (4 results), `?category=PR` (7 results), `?category=RE` (6 results), `?category=IN` (1 result).
   - `?status=R` (18 results), `?status=B` (0 results), `?status=V` (0 results), `?status=O` (0 results).
   - Unknown parameters (e.g. `?zzz=1`) are ignored without error.

---

## 7. Spec §1 Principles Cross-Check

Verification of Section 1 architecture requirements against live API realities:

1. **Non-JSON Error Responses**:
   - Principle: Zero silent fallbacks and uniform JSON envelope handling.
   - Live Reality: While DRF endpoints return structured JSON (`{"detail": "..."}`), unrouted URLs (`/api/nope/`, `/api/schema/`) return standard HTML 404 pages.
   - SDK Requirement: The HTTP client must verify `res.headers.get("content-type")?.includes("application/json")` before invoking `res.json()`.
2. **Field Casing Discipline**:
   - Principle: Strict `snake_case` normalization.
   - Live Reality: 100% of tested endpoints, nested attributes, and query parameters use `snake_case`. Zero camelCase occurrences were detected across the entire live schema.
3. **Identifier & Version Types**:
   - `id`: Strictly integer `number` across all collections (e.g. `id: 18`).
   - `code` / identifiers: Strictly string (e.g. `code: "G4-IDX-01"`, `incident_code: "INC-012"`, `audit_code: "AUD-2026-003"`, `case_code: "ARCO-2026-0001"`).
   - `version` / `current_version`: Strictly string (e.g. `"3.00"`).
4. **Envelope Inconsistencies**:
   - Most collections use the DRF paginated envelope `{ count, next, previous, results }`.
   - The following live endpoints return **plain JSON arrays (`[...]`)**:
     - `GET /api/documents/{id}/versions/`
     - `GET /api/incidents/{id}/history/`
     - `GET /api/incidents/{id}/attachments/`
     - `GET /api/arcop-requests/{id}/history/`
     - `GET /api/arcop-requests/{id}/attachments/`
     - `GET /api/dashboard-targets/`
   - Single-object endpoints returning key-value dictionaries:
     - `GET /api/dashboard/`
     - `GET /api/annex-a-controls/meta/`
     - `GET /api/risk-evaluations/catalogs/`

---

## 8. Spec Gap Analysis & Recommendations

The following discrepancies between `docs/PIMS-SDK-SPEC.md` and the live production API must be resolved:

### 8.1 Critical Spec Corrections
1. **Revise `/api/system-catalogs/` in §2.6**:
   - *Current Spec*: Classifies `/api/system-catalogs/` as an expected 403 throwing `PimsTrainingsForbiddenError`.
   - *Correction*: Move `/api/system-catalogs/` to §2.5 as an active read endpoint returning 10 catalog categories. Add `/api/system-catalog-items/` (177 items) with catalog foreign-key filtering (`?catalog=<id>`).
2. **Add Missing Collection Endpoints to §2**:
   - `/api/arcop-requests/`: ARCO-P rights requests management, complete with `/attachments/` and `/history/` sub-routes.
   - `/api/incident-recipients/`: Critical for understanding incident email routing (`rep_email`, `dpo_contact_email`).
   - `/api/processes/`: Business process inventory referenced in risk evaluations and document scopes.
   - `/api/evaluation-matrices/`: Risk matrix configuration (`dimension`, `levels`, `risk_ranges`).
   - `/api/risk-periods/`: Evaluation periods used by `/api/risk-evaluations/`.
   - `/api/appraisal-ranges/`: Asset valuation thresholds (`EXTREMO`, `ALTO`, `MEDIO`, `BAJO`).
   - `/api/annex-a-assessments/`: Tenant Statement of Applicability (SOA) evaluation rows (142 controls).
   - `/api/gap-requirements/`: ISO 27701 clause gap assessment records (69 clauses).
   - `/api/consents/`: Data subject consent registry.
3. **Update Dashboard Specification (§2.5)**:
   - *Current Spec*: Documents only `GET /api/dashboard/?tab=summary`.
   - *Live Reality*: Dashboard exposes 4 distinct tabs (`summary`, `risk`, `compliance`, `privacy`) producing different KPI sets, plus `/api/dashboard-targets/` containing 20 benchmark KPI thresholds.
4. **Document Pagination Ceiling**:
   - Explicitly note in §1 / §2 that `page_size` is capped at 100. Any operation fetching more than 100 items (such as corpus synchronization or complete audit log dumps) must iterate over `next` rather than requesting `page_size=200+`.
5. **Document HTML 404 Edge Behavior**:
   - Note in §1 that non-existent routes return HTML 404 rather than JSON, necessitating safe content-type checking in `packages/pims-adapter/errors.ts`.
