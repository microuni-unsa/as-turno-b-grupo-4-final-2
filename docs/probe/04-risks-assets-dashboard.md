# Live PIMS Read-Only Probe: Risks, Assets, Dashboard & Annex-A Controls

> **Document Status**: Production Verified Ground Truth  
> **Target Base URL**: `https://unsa.27k.pe`  
> **Schema Header**: `X-PIMS-Schema: unsa`  
> **Date**: 2026-11-23  
> **Authentication**: Bearer JWT via `POST /business/login/` (Read-Only probe)

---

## 1. Executive Summary & Probed Endpoints Overview

A live, non-mutating scan was executed against the production GESTITEL PIMS REST API to establish the authoritative contract for risk evaluations, risk catalogs, eligible assets, assets, dashboard KPIs/charts, and Annex-A controls metadata.

| Endpoint | HTTP Method | Envelope vs Array | Live Record Count | Key Inventory Size | Primary Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/risk-evaluations/` | `GET` | DRF Paginated Envelope | 0 records | 44 item fields (from `OPTIONS`) | 200 OK |
| `/api/risk-evaluations/catalogs/` | `GET` | Single JSON Object | 18 top-level keys | 18 catalog collections/settings | 200 OK |
| `/api/risk-evaluations/eligible-assets/` | `GET` | Paginated Envelope + `scope_label` | 1 record | 13 item fields (reduced projection) | 200 OK |
| `/api/assets/` | `GET` | DRF Paginated Envelope | 1 record | 50 item fields (complete asset) | 200 OK |
| `/api/assets/{id}/` | `GET` | Single JSON Object | 1 record | 50 item fields | 200 OK |
| `/api/dashboard/?tab=summary` | `GET` | Single JSON Object | N/A (Aggregated metrics) | 13 top-level keys | 200 OK |
| `/api/annex-a-controls/meta/` | `GET` | Single JSON Object | 142 total controls | 5 top-level keys | 200 OK |

---

## 2. Endpoint: `GET /api/risk-evaluations/`

### 2.1 Envelope & Structure
- **Type**: DRF Paginated Envelope (`{ "count": number, "next": string | null, "previous": string | null, "results": Array<RiskEvaluation> }`).
- **Live State**: The database currently has `count: 0`, `next: null`, `previous: null`, and `results: []`.
- **Detail Route**: `GET /api/risk-evaluations/{id}/` is configured; querying non-existent ID (e.g. `999999` or `1`) returns `404 Not Found`.

### 2.2 Query Parameter Behavior & Acceptance Matrix

| Parameter | Probed Value | Status Code | Behavior / Verdict |
| :--- | :--- | :--- | :--- |
| `page` | `page=1` | 200 OK | Honored. Returns empty page 1 results. |
| `page` | `page=2` | 404 Not Found | Honored. Returns `{"detail": "Invalid page."}` when page exceeds total count. |
| `page_size` | `page_size=1`, `page_size=50` | 200 OK | Honored. DRF pagination parameter accepted. |
| `search` | `search=test`, `search=a` | 200 OK | Honored. Text search filter accepted across evaluation records. |
| `period` | `period=1` | 200 OK | Honored. Filters evaluations by active period foreign key. |
| Unknown Param | `unknown_param=1` | 200 OK | Tolerated. Extra query parameters are ignored gracefully. |

### 2.3 Full Item Key Inventory (Schema Contract from DRF `OPTIONS`)

The authoritative item schema union, nullability, and types extracted directly from `OPTIONS /api/risk-evaluations/`:

| Field Name | Type | Read-Only | Required | Choices / Constraints | Description / Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | Yes | No | Auto-generated PK | Evaluation numeric identifier |
| `risk_code` | `string` | Yes | No | System-generated code | Unique risk code (e.g. `RSK-2026-001`) |
| `risk_owner` | `string` | No | No | Max length text | Assigned owner / role for the risk |
| `period` | `integer` | No | No | FK to Period | Foreign key reference to evaluation period |
| `period_name` | `string` | Yes | No | Derived | Human-readable name of period |
| `period_status` | `string` | Yes | No | Derived | Period status (`O` = Open, etc.) |
| `is_locked` | `boolean` | Yes | No | Derived | Whether the evaluation period is locked |
| `carried_from` | `integer \| null`| Yes | No | FK to Evaluation | Previous evaluation if carried over |
| `carried_from_code` | `string \| null` | Yes | No | Derived | Code of prior period evaluation |
| `carried_from_period`| `string \| null`| Yes | No | Derived | Name of prior period |
| `is_carried` | `boolean` | Yes | No | Derived | Flag indicating carry-over from prior cycle |
| `threat_code` | `string` | No | No | FK / Code | Catalog threat code (e.g. `TH01`) |
| `threat` | `string` | No | No | Text | Descriptive threat name |
| `vulnerability_code` | `string` | No | No | FK / Code | Catalog vulnerability code (e.g. `VH01`) |
| `vulnerability` | `string` | No | No | Text | Descriptive vulnerability name |
| `description` | `string` | No | **Yes** | Text | Description of the specific risk scenario |
| `controlled_probability` | `integer` | No | **Yes** | 1 to 4 | Probability score with existing controls |
| `controlled_impact` | `integer` | No | **Yes** | 1 to 4 | Impact score with existing controls |
| `controlled_score` | `decimal` | Yes | No | Computed | Computed product (`controlled_probability * controlled_impact`) |
| `controlled_severity` | `string` | Yes | No | L, M, H, C | Severity classification from matrix band |
| `response_strategy` | `string` | No | No | `M`, `A`, `T`, `E` | Strategy: `M` (Mitigar), `A` (Aceptar), `T` (Transferir), `E` (Eliminar) |
| `residual_probability` | `integer` | No | No | 1 to 4 | Residual probability after treatment |
| `residual_impact` | `integer` | No | No | 1 to 4 | Residual impact after treatment |
| `residual_score` | `decimal` | Yes | No | Computed | Computed residual score |
| `residual_severity` | `string` | Yes | No | L, M, H, C | Residual severity classification |
| `reduction` | `decimal` | Yes | No | Computed | Risk reduction delta |
| `is_effective` | `string` | No | No | `P`, `Y`, `N` | Effectiveness: `P` (Pendiente), `Y` (Sí), `N` (No) |
| `verification_date`| `date` | No | No | `YYYY-MM-DD` | Date treatment was verified |
| `verified_by` | `string` | No | No | Text | Verification officer |
| `evidence` | `string` | No | No | Text | Treatment implementation evidence |
| `observations` | `string` | No | No | Text | Auditor / assessor observations |
| `status` | `string` | No | No | `O`, `T`, `C` | Risk status: `O` (Abierta), `T` (En tratamiento), `C` (Cerrada) |
| `assets` | `array` | No | No | List of Asset IDs | Associated asset identifiers |
| `treatments` | `array` | No | No | List of Treatment objects | Linked treatment action items |
| `assets_count` | `integer` | Yes | No | Computed | Number of associated assets |
| `is_data_privacy` | `boolean` | Yes | No | Computed | True if any associated asset is PII/privacy asset |
| `requires_treatment`| `boolean` | Yes | No | Computed | True if score falls within treatment bands (Alto/Crítico) |
| `pending_treatment` | `boolean` | Yes | No | Computed | True if requiring treatment without completed action |
| `review_status` | `string` | Yes | No | Computed | Current workflow review status |
| `created_at` | `datetime`| Yes | No | ISO 8601 | Record creation timestamp |
| `created_by` | `integer` | Yes | No | FK to User | User ID of creator |
| `updated_at` | `datetime`| Yes | No | ISO 8601 | Record modification timestamp |
| `updated_by` | `integer` | Yes | No | FK to User | User ID of last modifier |

---

## 3. Endpoint: `GET /api/risk-evaluations/catalogs/`

### 3.1 Overview
- **Type**: Single JSON Object.
- **Top-Level Keys (18 total)**:
  `periods`, `current_period`, `threats`, `vulnerabilities`, `control_types`, `security_measure_types`, `estimated_times`, `asset_categories`, `asset_classifications`, `appraisal_bands`, `process_options`, `compliance_standard`, `annex_a_controls`, `applicable_annex_a_controls`, `active_matrix`, `risk_treatment_levels`, `risk_treatment_levels_label`, `asset_scope_label`.

### 3.2 Collection Item Shapes & Anonymized Examples

#### 1. `periods` (Array of 1 item)
- **Item Keys**: `id`, `name`, `start_date`, `end_date`, `status`, `is_active`
- **Example**:
```json
{
  "id": 1,
  "name": "Periodo inicial",
  "start_date": "2026-10-21",
  "end_date": "2027-10-21",
  "status": "O",
  "is_active": true
}
```

#### 2. `current_period` (Object)
- **Keys**: `id`, `name`, `start_date`, `end_date`, `status`, `is_active`
- **Example**: Matches the active entry in `periods`.

#### 3. `threats` (Array of 57 items)
- **Item Keys**: `code`, `label`, `category`, `subtype`
- **Example**:
```json
{
  "code": "TH01",
  "label": "Terror. Ataque, sabotaje",
  "category": "Acciones humanas",
  "subtype": "D"
}
```

#### 4. `vulnerabilities` (Array of 82 items)
- **Item Keys**: `code`, `label`, `category`, `subtype`
- **Example**:
```json
{
  "code": "VH01",
  "label": "Mantenimiento insuficiente/instalación defectuosa de los medios de almacenamiento",
  "category": "Hardware",
  "subtype": null
}
```

#### 5. `control_types` (Array of 4 items)
- **Item Keys**: `code`, `label`, `category`, `subtype`
- **Codes**: `PR` (Preventivo), `DT` (Detectivo), `CR` (Correctivo), `DC` (Disuasivo)
- **Example**:
```json
{
  "code": "PR",
  "label": "Preventivo",
  "category": null,
  "subtype": null
}
```

#### 6. `security_measure_types` (Array of 3 items)
- **Item Keys**: `code`, `label`, `category`, `subtype`
- **Codes**: `TECNICO` (Técnico), `ORGANIZATIVO` (Organizativo), `FISICO` (Físico)
- **Example**:
```json
{
  "code": "TECNICO",
  "label": "Técnico",
  "category": null,
  "subtype": null
}
```

#### 7. `estimated_times` (Array of 3 items)
- **Item Keys**: `code`, `label`, `category`, `subtype`
- **Codes**: `CORTO` (Corto), `MEDIO` (Medio), `LARGO` (Largo)
- **Example**:
```json
{
  "code": "CORTO",
  "label": "Corto",
  "category": null,
  "subtype": null
}
```

#### 8. `asset_categories` (Array of 7 items)
- **Item Keys**: `code`, `label`, `category`, `subtype`
- **Codes & Labels**:
  - `1`: Hardware
  - `2`: Software
  - `3`: Comunicaciones / Redes
  - `4`: Personas
  - `5`: Información / Datos
  - `6`: Servicios
  - `7`: Instalaciones / Físico
- **Example**:
```json
{
  "code": "1",
  "label": "Hardware",
  "category": null,
  "subtype": null
}
```

#### 9. `asset_classifications` (Array of 4 items)
- **Item Keys**: `code`, `label`, `category`, `subtype`
- **Codes & Labels**: `1`: Pública, `2`: Interna, `3`: Confidencial, `4`: Crítica / Secreta
- **Example**:
```json
{
  "code": "1",
  "label": "Pública",
  "category": null,
  "subtype": null
}
```

#### 10. `appraisal_bands` (Array of 4 items)
- **Item Keys**: `name`, `color_code`, `min_value`, `max_value`
- **Values**:
  - `EXTREMO`: `#ff0000` (min: `3.50`, max: `5.00`)
  - `ALTO`: `#ff9900` (min: `2.50`, max: `3.49`)
  - `MEDIO`: `#ffff00` (min: `1.50`, max: `2.49`)
  - `BAJO`: `#00ff00` (min: `1.00`, max: `1.49`)

#### 11. `process_options` (Array of 1 item)
- **Item Keys**: `code`, `name`
- **Example**:
```json
{
  "code": "EC2-DEMO",
  "name": "EC2-DEMO · Matrículas"
}
```

#### 12. `compliance_standard` (Object)
- **Keys**: `code`, `label`, `short_label`
- **Value**:
```json
{
  "code": "ISO27001_27701_INT",
  "label": "ISO/IEC 27001:2022 + ISO/IEC 27701:2025 (integrada)",
  "short_label": "ISO 27001:2022 + 27701:2025"
}
```

#### 13. `annex_a_controls` & `applicable_annex_a_controls` (Arrays of 142 items each)
- **Item Keys**: `code`, `name`, `group_code`, `group_name`, `applicable_role`, `description`, `source_standard`
- **Example**:
```json
{
  "code": "A.5.1",
  "name": "Políticas de seguridad de la información",
  "group_code": "A.5",
  "group_name": "Controles organizacionales",
  "applicable_role": "A",
  "description": "Definir, aprobar, publicar y revisar políticas de seguridad de la información.",
  "source_standard": "ISO27001_2022"
}
```

#### 14. `active_matrix` (Object)
- **Keys**: `dimension`, `risk_ranges`
- **Dimension**: `4` (4x4 matrix, score range 1..16)
- **Risk Ranges**:
  - `L` (Bajo): min 1, max 3
  - `M` (Medio): min 4, max 7
  - `H` (Alto): min 8, max 11
  - `C` (Crítico): min 12, max 16

#### 15. Scalar Controls & Labels
- `risk_treatment_levels`: `["H", "C"]` (Risks evaluated as Alto or Crítico require mandatory treatment)
- `risk_treatment_levels_label`: `"Alto y Crítico"`
- `asset_scope_label`: `"ALTO y EXTREMO"` (Only assets appraised as ALTO or EXTREMO are eligible for risk assessment)

---

## 4. Endpoint: `GET /api/risk-evaluations/eligible-assets/`

### 4.1 Envelope & Structure
- **Type**: DRF Envelope extended with top-level `scope_label`.
- **Top-level Keys (5)**: `count`, `next`, `previous`, `results`, `scope_label`.
- **Live State**: `count: 1`, `scope_label: "ALTO y EXTREMO"`, `results: [ 1 item ]`.

### 4.2 Item Key Inventory (13 Keys)

The item in `eligible-assets` represents a specialized projection for the risk evaluation workflow:

| Field Name | Type | Live Value (Anonymized) | Notes |
| :--- | :--- | :--- | :--- |
| `code` | `string` | `"ACT-HW-001"` | Asset business code |
| `name` | `string` | `"EC2-DEMO-001 · Servidor de matrículas de prueba"` | Asset descriptive name |
| `category` | `string` | `"1"` | Category code (Hardware) |
| `classification` | `string` | `"3"` | Classification code (Confidencial) |
| `process` | `string` | `"EC2-DEMO · Matrículas"` | Display name of process (**Inverted vs `/api/assets/`**) |
| `process_code` | `string` | `"EC2-DEMO"` | Process code (**Inverted vs `/api/assets/`**) |
| `location` | `string` | `"Laboratorio ficticio EC2"` | Physical or logical host location |
| `confidentiality` | `string` | `"3"` | CIA Confidentiality appraisal (1-5) |
| `integrity` | `string` | `"4"` | CIA Integrity appraisal (1-5) |
| `availability` | `string` | `"4"` | CIA Availability appraisal (1-5) |
| `asset_value` | `string` | `"4.00"` | Max or weighted composite asset valuation |
| `appraisal_band` | `object` | `{"label": "EXTREMO", "color_code": "#ff0000"}` | Appraisal classification band |
| `is_data_asset` | `boolean` | `true` | True if asset stores or processes data / PII |

### 4.3 Diffs: `/api/risk-evaluations/eligible-assets/` vs `/api/assets/`

1. **Envelope**:
   - `eligible-assets` adds the top-level property `"scope_label": "ALTO y EXTREMO"`.
   - `assets` has strictly `{ count, next, previous, results }`.
2. **Item Projection**:
   - `eligible-assets` items have only **13 fields** vs **50 fields** on `/api/assets/`.
   - `eligible-assets` omits `id` (primary key), all audit timestamps (`created_at`, `updated_at`, `deleted_at`), audit actors (`created_by`, `updated_by`, `deleted_by`), ownership fields (`owner`, `custodians`), and detailed privacy/GDPR attributes (`data_categories`, `legal_basis`, `pii_controls`, `cross_border_flow`, `national_transfers`, `international_flows`, `retention_period`, `disposal_method`).
3. **Field Naming Inversion**:
   - In `/api/assets/`: `process` is the code (`"EC2-DEMO"`) and `process_name` is the full name (`"EC2-DEMO · Matrículas"`).
   - In `/api/risk-evaluations/eligible-assets/`: `process` is the full name (`"EC2-DEMO · Matrículas"`) and `process_code` is the code (`"EC2-DEMO"`).

---

## 5. Endpoint: `GET /api/assets/`

### 5.1 Envelope & Count
- **Type**: DRF Paginated Envelope (`{ "count": 1, "next": null, "previous": null, "results": [...] }`).
- **Live Record Count**: Exactly 1 asset in production (`ACT-HW-001`).
- **Detail Route**: `GET /api/assets/{id}/` is supported. `GET /api/assets/1/` returns `200 OK` with the asset object. `GET /api/assets/999999/` returns `404 Not Found`.

### 5.2 Query Parameter Behavior & Acceptance Matrix

| Parameter | Probed Value | Status Code | Behavior / Verdict |
| :--- | :--- | :--- | :--- |
| `search` | `search=servidor` | 200 OK | **Honored**. Filters `name`/`code`; returns `count: 1`. |
| `search` | `search=NONEXISTENT_XYZ` | 200 OK | **Honored**. Returns `count: 0`. |
| `page` | `page=1` | 200 OK | **Honored**. Returns page 1. |
| `page` | `page=2` | 404 Not Found | **Honored**. Returns `{"detail": "Invalid page."}`. |
| `page_size` | `page_size=1`, `page_size=10` | 200 OK | **Honored**. Accepted by DRF pagination. |
| `page_size` | `page_size=0`, `page_size=-1`, `page_size=abc` | 200 OK | Tolerated. DRF silently ignores invalid sizes and returns standard page. |
| `is_data_asset` | `is_data_asset=true` | 200 OK | **Honored**. Returns `count: 1`. |
| `is_data_asset` | `is_data_asset=false` | 200 OK | **Honored**. Returns `count: 0`. |
| `category` | `category=1` (Hardware) | 200 OK | **Honored**. Returns `count: 1`. |
| `category` | `category=2` (Software) | 200 OK | **Honored**. Returns `count: 0`. |
| `classification` | `classification=3` (Confidencial) | 200 OK | **Honored**. Returns `count: 1`. |
| `classification` | `classification=1` (Pública) | 200 OK | **Honored**. Returns `count: 0`. |
| `process` | `process=1` (Numeric FK) | 200 OK | **Honored**. Returns `count: 1` matching process ID 1. |
| `process` | `process=EC2-DEMO` (Code string) | 400 Bad Request | **Validation Error**. DRF filter expects integer process PK, not code string. Body: `{"process": ["Escoja una opción válida. Esa opción no está entre las disponibles."]}`. |
| Unknown Param | `unknown_param=1` | 200 OK | Tolerated. Extra query parameters are ignored gracefully. |

### 5.3 Full Item Key Inventory (50 Keys)

| Key Name | Type | Nullable | Example / Live Value | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | No | `1` | Asset primary key |
| `process` | `string` | No | `"EC2-DEMO"` | Process code |
| `process_name` | `string` | No | `"EC2-DEMO · Matrículas"` | Process human label |
| `appraisal_band` | `object` | No | `{"label": "EXTREMO", "color_code": "#ff0000"}` | Appraisal band object |
| `risk_eligible` | `boolean` | No | `true` | True if asset meets scope threshold |
| `created_at` | `string` | No | `"2026-11-05T17:12:23.850399Z"` | ISO 8601 creation timestamp |
| `updated_at` | `string` | No | `"2026-11-05T17:12:23.850443Z"` | ISO 8601 update timestamp |
| `is_deleted` | `boolean` | No | `false` | Soft-delete flag |
| `deleted_at` | `string \| null` | Yes | `null` | Soft-delete timestamp |
| `code` | `string` | No | `"ACT-HW-001"` | Asset business code |
| `legacy_code` | `string \| null` | Yes | `null` | Legacy asset tracking code |
| `name` | `string` | No | `"EC2-DEMO-001 · Servidor de matrículas de prueba"` | Asset name |
| `description` | `string` | No | `"CASO FICTICIO AUTORIZADO EC2..."` | Description text |
| `owner` | `string` | No | `"ANON"` | Asset owner / role (Anonymized) |
| `custodians` | `string \| null` | Yes | `null` | Asset custodians |
| `location` | `string` | No | `"Laboratorio ficticio EC2"` | Location description |
| `is_data_asset` | `boolean` | No | `true` | Privacy flag |
| `category` | `string` | No | `"1"` | Category code (1 = Hardware) |
| `classification` | `string` | No | `"3"` | Classification code (3 = Confidencial) |
| `usage_frequency` | `string \| null` | Yes | `null` | Operational usage cadence |
| `confidentiality` | `string` | No | `"3"` | Confidentiality rating |
| `integrity` | `string` | No | `"4"` | Integrity rating |
| `availability` | `string` | No | `"4"` | Availability rating |
| `cid_method` | `string` | No | `"M"` | CID evaluation method (`M` = Max) |
| `weight_confidentiality` | `string` | No | `"0.00"` | Weighting decimal string |
| `weight_integrity` | `string` | No | `"0.00"` | Weighting decimal string |
| `weight_availability` | `string` | No | `"0.00"` | Weighting decimal string |
| `asset_value` | `string` | No | `"4.00"` | Composite asset score |
| `purpose` | `string \| null` | Yes | `null` | Primary processing purpose |
| `data_categories` | `array` | No | `[]` | Privacy data categories list |
| `role` | `string \| null` | Yes | `null` | GDPR role (Controller/Processor) |
| `pii_controls` | `array` | No | `[]` | Linked PII technical controls |
| `legal_basis` | `string \| null` | Yes | `null` | GDPR Art 6 legal basis |
| `purpose_detail` | `string \| null` | Yes | `null` | Granular processing purpose |
| `collection_origin` | `string \| null` | Yes | `null` | PII origin channel |
| `collection_procedure` | `string \| null` | Yes | `null` | PII collection mechanism |
| `data_usage` | `string \| null` | Yes | `null` | Permitted use description |
| `retention_period` | `string \| null` | Yes | `null` | Data retention policy period |
| `disposal_method` | `string \| null` | Yes | `null` | Secure deletion method |
| `third_party_transfer` | `boolean` | No | `false` | True if transferred to 3rd party |
| `national_transfers` | `array` | No | `[]` | Domestic transfer records |
| `cross_border_flow` | `boolean` | No | `false` | True if cross-border transfer occurs |
| `international_flows` | `array` | No | `[]` | International flow destinations |
| `times_compromised` | `integer \| null`| Yes | `null` | Incident history counter |
| `processes_affected` | `string \| null` | Yes | `null` | Dependent business processes |
| `loss_range` | `string \| null` | Yes | `null` | Financial loss exposure range |
| `relevance` | `string` | No | `""` | Qualitative relevance notes |
| `created_by` | `integer` | No | `1` | Creator user ID (Anonymized) |
| `updated_by` | `integer \| null`| Yes | `null` | Last update user ID |
| `deleted_by` | `integer \| null`| Yes | `null` | Soft deletion user ID |

---

## 6. Endpoint: `GET /api/dashboard/?tab=summary`

### 6.1 Overview & Top-Level Key Inventory (13 Keys)
When calling `GET /api/dashboard/?tab=summary`, the endpoint returns a single JSON object with 13 keys:

| Top-Level Key | Type | Description |
| :--- | :--- | :--- |
| `tab` | `string` | Echoed active tab (`"summary"`) |
| `tabs` | `array` | Navigation tabs list (`summary`, `risk`, `compliance`, `privacy`) |
| `generated_at` | `string` | ISO 8601 report generation timestamp |
| `kpis` | `array` | Array of 3 summary KPI metric cards |
| `charts` | `array` | Empty array `[]` on summary tab |
| `has_any_data` | `boolean` | `true` |
| `has_sgsi_data` | `boolean` | `true` |
| `empty_reason` | `null \| string` | `null` |
| `message` | `string` | Informational banner string |
| `risk_period` | `object` | Current risk cycle metadata (`id`, `name`, `status`, `is_active`, `is_locked`) |
| `semaphores` | `array` | 3 domain status indicator cards (`risk`, `compliance`, `privacy`) |
| `series` | `object` | Historical month-by-month tracking series |
| `global_notice` | `null \| string` | Tenant or broadcast announcement notice |

### 6.2 Item Shapes per Section

#### 1. `tabs` (4 items)
```json
[
  {"key": "summary", "label": "Resumen"},
  {"key": "risk", "label": "Riesgo"},
  {"key": "compliance", "label": "Cumplimiento"},
  {"key": "privacy", "label": "Privacidad"}
]
```

#### 2. `kpis` (18 fields per KPI item)
- Item fields: `key`, `label`, `domain`, `domain_label`, `description`, `value`, `unit`, `direction`, `target`, `warning`, `has_target`, `status`, `has_data`, `reason`, `numerator`, `denominator`, `caption`, `is_default_target`.
- Summary KPIs observed:
  - `risk_evaluation_coverage`: Cobertura de evaluación de riesgos (`value: null`, `has_data: false`, `domain: "risk"`)
  - `compliance_global`: Cumplimiento global (`value: 0.0`, `has_data: true`, `status: "red"`, `domain: "compliance"`)
  - `arcop_ontime_rate`: Cumplimiento de plazo ARCO-P (`value: null`, `has_data: false`, `domain: "privacy"`)

#### 3. `semaphores` (3 items)
- Item fields: `key`, `label`, `status`, `kpis_ok`, `kpis_total`, `detail`.
- Values:
  - `risk`: `status: "gray"`, `kpis_ok: 2`, `kpis_total: 5`, detail: `"Sin datos todavía en este dominio."`
  - `compliance`: `status: "red"`, `kpis_ok: 0`, `kpis_total: 5`, detail: `"0 de 5 indicadores en meta (1 sin datos)."`
  - `privacy`: `status: "red"`, `kpis_ok: 0`, `kpis_total: 5`, detail: `"0 de 5 indicadores en meta (3 sin datos)."`

#### 4. `series` (Object)
- Object fields: `months: ["2026-10-01", "2026-11-01"]`, `gap_after: []`, `lines: Array<Line>`, `notice: string`.
- Each Line: `{ "key": string, "label": string, "points": Array<{ "month": string, "value": number | null, "has_data": boolean, "captured_at": string }> }`.

### 6.3 Dashboard Tab Value Verdicts Matrix

| Probe Query | HTTP Status | Response `tab` Value | Key Set Differences & Verdict |
| :--- | :--- | :--- | :--- |
| `GET /api/dashboard/` (no `tab`) | 200 OK | `"summary"` | **Defaulted to summary**. Returns all 13 keys including `semaphores`, `series`, `global_notice`. |
| `GET /api/dashboard/?tab=summary` | 200 OK | `"summary"` | Explicit summary. Returns all 13 keys. `charts` is `[]`. |
| `GET /api/dashboard/?tab=risk` | 200 OK | `"risk"` | Domain tab. Returns 8 top-level keys. Omits `semaphores`, `series`, `global_notice`. Contains 5 domain KPIs and **4 chart objects** (`key`, `type`, `title`, `data`). |
| `GET /api/dashboard/?tab=compliance` | 200 OK | `"compliance"` | Domain tab. Returns 8 top-level keys. Contains 5 domain KPIs and **1 chart object**. |
| `GET /api/dashboard/?tab=privacy` | 200 OK | `"privacy"` | Domain tab. Returns 8 top-level keys. Contains 5 domain KPIs and **3 chart objects**. |
| `GET /api/dashboard/?tab=detail` | 200 OK | `"summary"` | **Silent Fallback**. Invalid tab value falls back to `tab="summary"` with 200 OK. |
| `GET /api/dashboard/?tab=overview` | 200 OK | `"summary"` | **Silent Fallback**. Invalid tab value falls back to `tab="summary"` with 200 OK. |
| `GET /api/dashboard/?tab=kpis` | 200 OK | `"summary"` | **Silent Fallback**. Invalid tab value falls back to `tab="summary"` with 200 OK. |
| `GET /api/dashboard/?tab=invalid_xyz`| 200 OK | `"summary"` | **Silent Fallback**. Any unrecognised tab value falls back to `tab="summary"` with 200 OK. |

---

## 7. Endpoint: `GET /api/annex-a-controls/meta/`

### 7.1 Overview & Key Inventory (5 Keys)
The endpoint returns a single JSON object containing catalog configuration and aggregated control counts across the combined ISO/IEC 27001:2022 and ISO/IEC 27701:2025 frameworks:

| Key | Type | Description |
| :--- | :--- | :--- |
| `standard` | `object` | Framework specification object (`code`, `label`, `annex_label`, `total_controls`, `is_superseded`) |
| `groups` | `array` | 12 category group objects (`code`, `name`, `count`) |
| `roles` | `array` | 3 role applicability objects (`code`, `label`, `count`) |
| `sources` | `array` | 2 source standards objects (`code`, `label`, `count`) |
| `has_law_29733` | `boolean` | `true` (Peruvian Personal Data Protection Law alignment enabled) |

### 7.2 Nested Shapes & Counts

#### 1. `standard` Object
```json
{
  "code": "ISO27001_27701_INT",
  "label": "ISO/IEC 27001:2022 + ISO/IEC 27701:2025 (integrada)",
  "annex_label": "Anexo A de ISO/IEC 27001:2022 y Tablas A.1–A.2 de ISO/IEC 27701:2025",
  "total_controls": 142,
  "is_superseded": false
}
```

#### 2. `groups` Breakdown (12 Groups, 142 Total Controls)
- **ISO/IEC 27001:2022 Core Groups (93 controls)**:
  - `A.5` Controles organizacionales: **37**
  - `A.6` Controles de personas: **8**
  - `A.7` Controles físicos: **14**
  - `A.8` Controles tecnológicos: **34**
- **ISO/IEC 27701:2025 Controller (Responsable) Groups (31 controls)**:
  - `A.1.2` Condiciones para la recolección y el tratamiento: **8**
  - `A.1.3` Obligaciones con los titulares de los datos: **10**
  - `A.1.4` Privacidad desde el diseño y por defecto: **9**
  - `A.1.5` Compartición, transferencia y divulgación de datos personales: **4**
- **ISO/IEC 27701:2025 Processor (Encargado) Groups (18 controls)**:
  - `A.2.2` Condiciones para la recolección y el tratamiento: **6**
  - `A.2.3` Obligaciones con los titulares de los datos: **1**
  - `A.2.4` Privacidad desde el diseño y por defecto: **3**
  - `A.2.5` Compartición, transferencia y divulgación de datos personales: **8**

#### 3. `roles` Breakdown
- `A` (Todos): **93** controls (Applies to all ISO 27001 ISMS scope)
- `C` (Responsable del tratamiento): **31** controls (ISO 27701 Table A.1)
- `P` (Encargado del tratamiento): **18** controls (ISO 27701 Table A.2)

#### 4. `sources` Breakdown
- `ISO27001_2022`: **93** controls
- `ISO27701_2025`: **49** controls

---

## 8. Error Cases & Edge Behaviors Observed

1. **404 on Missing Entity (Numeric Detail)**:
   - `GET /api/assets/999999/` -> HTTP `404 Not Found`
     ```json
     {"detail": "No Asset matches the given query."}
     ```
   - `GET /api/risk-evaluations/999999/` -> HTTP `404 Not Found`
     ```json
     {"detail": "No RiskEvaluation matches the given query."}
     ```
2. **400 on Filter Type Mismatch**:
   - `GET /api/assets/?process=EC2-DEMO` -> HTTP `400 Bad Request`
     ```json
     {"process": ["Escoja una opción válida. Esa opción no está entre las disponibles."]}
     ```
     *Finding*: The `process` query parameter expects a numeric foreign key ID (`?process=1`), not the string process code (`?process=EC2-DEMO`).
3. **404 on Out-of-Range Pagination**:
   - `GET /api/assets/?page=2` -> HTTP `404 Not Found`
     ```json
     {"detail": "Invalid page."}
     ```
   - `GET /api/risk-evaluations/?page=2` -> HTTP `404 Not Found`
     ```json
     {"detail": "Invalid page."}
     ```
4. **Resilient Defaults on Dashboard**:
   - `GET /api/dashboard/?tab=invalid_value` -> HTTP `200 OK` (silently defaults to `summary`).
5. **Unknown Query Parameter Tolerance**:
   - `GET /api/risk-evaluations/?foo=bar` -> HTTP `200 OK` (ignored).
   - `GET /api/assets/?foo=bar` -> HTTP `200 OK` (ignored).
   - `GET /api/dashboard/?foo=bar` -> HTTP `200 OK` (ignored).
   - `GET /api/annex-a-controls/meta/?foo=bar` -> HTTP `200 OK` (ignored).

---

## 9. Spec-Deviation List (`docs/PIMS-SDK-SPEC.md` vs Live Production)

| Spec Section / Symbol | Spec §2.5 Assumption | Live Production Ground Truth | Required SDK / Adapter Action |
| :--- | :--- | :--- | :--- |
| `GET /api/risk-evaluations/catalogs/` | Only listed `{ periods, threats, vulnerabilities, control_types, annex_a_controls, active_matrix, ... }` | Returns **18 distinct top-level keys**, including `current_period`, `security_measure_types`, `estimated_times`, `asset_categories`, `asset_classifications`, `appraisal_bands`, `process_options`, `compliance_standard`, `applicable_annex_a_controls`, `risk_treatment_levels`, `risk_treatment_levels_label`, `asset_scope_label`. | Update `PimsRiskCatalogResponse` in `types.ts` to include all 18 typed keys. |
| `GET /api/risk-evaluations/eligible-assets/` | Described simply as "paginated `{ count, results }`" | Returns top-level `"scope_label": "ALTO y EXTREMO"` in envelope. Items have only **13 fields** (not full asset shape), omits `id`, and **inverts** `process` (display string) and `process_code` (code). | Define dedicated interface `PimsEligibleAsset` reflecting the 13 fields + envelope `scope_label`. |
| `GET /api/assets/` | Legacy mock `PimsAsset` assumed `{ id, code, name, type, owner, criticality, location }` | Live `Asset` has **50 comprehensive fields**. Neither `type` nor `criticality` exists! Uses `category` (code `"1"`), `classification` (code `"3"`), nested `appraisal_band` object, CIA numerical scores, and Law 29733 / GDPR transfer arrays. | Overhaul `PimsAsset` in `types.ts` to reflect all 50 live production fields. |
| `GET /api/dashboard/` | Assumed `{ kpis: [...], semaphores: [...], series: ... }` with mock `PimsDashboardKpis` (`incidents_count`, `audits_count`, `documents_count`, etc.) | Returns 13 top-level keys. `semaphores` and `series` only exist on `tab=summary`. Domain tabs (`risk`, `compliance`, `privacy`) return 5 domain KPIs and domain `charts` array. Unrecognized tabs fall back to `summary`. | Replace mock `PimsDashboardKpis` with live types supporting both summary and domain tab variants. |
| `GET /api/annex-a-controls/meta/` | Legacy mock assumed `{ total_controls, categories: [{ id, title, count }], controls: [{ id, category_id, ... }] }` | Returns `{ standard, groups, roles, sources, has_law_29733 }`. 12 groups (A.5..A.8, A.1.2..A.1.5, A.2.2..A.2.5), 3 roles (A, C, P), 2 sources (ISO27001_2022, ISO27701_2025). Total: 142 controls. | Update `PimsAnnexAControlsMeta` in `types.ts` to match live 5-key structure. |

---

## 10. Fixture Update & Verification Summary

The live anonymized snapshot was written to `packages/pims-adapter/fixtures/reads.json`:
- **Top-level Shape**:
  ```json
  {
    "riskEvaluations": { "count": 0, "next": null, "previous": null, "results": [] },
    "catalogs": { ... 18 top-level catalog keys ... },
    "eligibleAssets": { "count": 1, "next": null, "previous": null, "results": [ ... ], "scope_label": "ALTO y EXTREMO" },
    "assets": { "count": 1, "next": null, "previous": null, "results": [ ... 50 asset keys ... ] },
    "dashboard": { ... 13 summary keys ... },
    "annexA": { ... 5 meta keys ... }
  }
  ```
- **Validation**:
  - `bun -e "JSON.parse(await Bun.file('packages/pims-adapter/fixtures/reads.json').text())"` executed with return code 0.
  - Sanitization verified: zero JWTs, passwords, or emails present.
