# PIMS Live REST API Probe Report: Incidents

> **Probe ID**: `PROBE-02-INCIDENTS`  
> **Status**: Verified Read-Only Against Production  
> **Target Base URL**: `https://unsa.27k.pe`  
> **Schema Header**: `X-PIMS-Schema: unsa`  
> **Authentication**: Bearer JWT via `POST /business/login/`  
> **Reference Contract**: `docs/PIMS-SDK-SPEC.md` §2.3  
> **Probe Date**: 2026-11-23  

---

## 1. Executive Summary

A comprehensive, non-destructive, read-only live probe of the PIMS Incidents REST API was conducted against the live production server (`https://unsa.27k.pe`) under the `unsa` schema tenant. The scan examined all 12 existing incident records (`INC-001` through `INC-012`), evaluated query parameter filters, investigated pagination behaviors, retrieved detail models, and verified sub-resource endpoints (`/history/` and `/attachments/`).

### Key Findings
1. **Identifier Key**: Production records use `incident_code` (e.g., `"INC-001"`, `"INC-012"`) alongside numeric `id`. Legacy `code` is **not present** in API responses.
2. **List vs Detail Shape**: `GET /api/incidents/` returns a standard Django REST Framework (DRF) pagination envelope (`{ count, next, previous, results }`). Both list items and detail items (`GET /api/incidents/{id}/`) share the **exact same 57-field schema**, already embedding `actions[]`, `attachments[]`, `history[]`, `attachments_count`, and `actions_count`.
3. **Sub-Endpoints Verdict (History & Attachments)**:
   - `GET /api/incidents/{id}/history/`: Returns a **plain JSON array** (`[...]`), NOT a DRF pagination envelope.
   - `GET /api/incidents/{id}/attachments/`: Returns a **plain JSON array** (`[...]`), NOT a DRF pagination envelope.
   - The contents and item keys returned by these sub-endpoints are 100% identical to the embedded `history` and `attachments` arrays in the incident object.
4. **Resolution by Code**: Direct lookup by code (e.g. `GET /api/incidents/INC-001/`) returns HTTP `404 Not Found`. Detail retrieval requires numeric `id` (e.g. `GET /api/incidents/1/`). Resolving by code must use list search (`?search=INC-001`).
5. **Catalog Options & Enums**: The API options define broader enum choices than specified in `docs/PIMS-SDK-SPEC.md` §2.3:
   - `status`: Spec specified `"P" | "C"`. Live choices are `O` ("Abierto"), `P` ("En proceso"), `C` ("Cerrado").
   - `severity`: Spec specified `"L" | "M" | "H"`. Live choices are `L` ("Baja"), `M` ("Media"), `H` ("Alta"), `C` ("Crítica").
   - `impact`: Spec described as generic string. Live choices are `L` ("Bajo"), `M` ("Medio"), `H` ("Alto"), `V` ("Muy alto").
   - `incident_type`: Spec listed only param name. Live choices are `UA`, `DL`, `MW`, `PH`, `DS`, `HE`, `DV`, `OT`.

---

## 2. Endpoints Probed & HTTP Status Summary

| Endpoint | Method | Params / Payload | Status | Response Shape | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/incidents/` | GET | None | `200 OK` | DRF Envelope `{ count: 12, ... }` | Default pagination; returns all 12 active incidents |
| `/api/incidents/?page_size=100` | GET | `page_size=100` | `200 OK` | DRF Envelope | Returns all records in single page |
| `/api/incidents/?search=INC` | GET | `search=INC` | `200 OK` | DRF Envelope `{ count: 12 }` | Matches all 12 incidents |
| `/api/incidents/?search=nonexistent` | GET | `search=nonexistent` | `200 OK` | DRF Envelope `{ count: 0 }` | Clean zero-match response |
| `/api/incidents/?status=C` | GET | `status=C` | `200 OK` | DRF Envelope `{ count: 11 }` | Closed incidents |
| `/api/incidents/?status=P` | GET | `status=P` | `200 OK` | DRF Envelope `{ count: 1 }` | Pending/in-process incidents |
| `/api/incidents/?status=INVALID` | GET | `status=INVALID` | `400 Bad Request` | Field Error `{ "status": [...] }` | Strict choice validation |
| `/api/incidents/?severity=L` | GET | `severity=L` | `200 OK` | DRF Envelope `{ count: 10 }` | Low severity filter |
| `/api/incidents/?severity=H` | GET | `severity=H` | `200 OK` | DRF Envelope `{ count: 2 }` | High severity filter |
| `/api/incidents/?severity=M` | GET | `severity=M` | `200 OK` | DRF Envelope `{ count: 0 }` | Valid choice, zero current records |
| `/api/incidents/?severity=INVALID` | GET | `severity=INVALID` | `400 Bad Request` | Field Error `{ "severity": [...] }` | Strict choice validation |
| `/api/incidents/?incident_type=OT` | GET | `incident_type=OT` | `200 OK` | DRF Envelope `{ count: 10 }` | "Otro" type filter |
| `/api/incidents/?incident_type=PH` | GET | `incident_type=PH` | `200 OK` | DRF Envelope `{ count: 1 }` | Phishing filter |
| `/api/incidents/?incident_type=UA` | GET | `incident_type=UA` | `200 OK` | DRF Envelope `{ count: 1 }` | Unauthorized access filter |
| `/api/incidents/?page=1&page_size=2` | GET | `page=1&page_size=2` | `200 OK` | DRF Envelope | Has `next` URL link |
| `/api/incidents/?page=999999` | GET | `page=999999` | `404 Not Found` | Error `{ "detail": "Página inválida." }` | Out-of-bounds page |
| `/api/incidents/?page=abc` | GET | `page=abc` | `404 Not Found` | Error `{ "detail": "Página inválida." }` | Non-numeric page |
| `/api/incidents/{id}/` | GET | ID: `12` | `200 OK` | Single Incident Object | Full detail representation |
| `/api/incidents/{code}/` | GET | Code: `INC-012` | `404 Not Found` | Error `{ "detail": "No encontrado." }` | Slug lookup not supported |
| `/api/incidents/99999999/` | GET | Non-existent ID | `404 Not Found` | Error `{ "detail": "No Incident matches the given query." }` | Numeric 404 |
| `/api/incidents/{id}/history/` | GET | ID: `11` | `200 OK` | **Plain JSON Array** (68 entries) | Event audit trail |
| `/api/incidents/{id}/history/` | GET | ID: `12` | `200 OK` | **Plain JSON Array** (5 entries) | Event audit trail |
| `/api/incidents/99999999/history/` | GET | Non-existent ID | `404 Not Found` | Error `{ "detail": "No Incident matches the given query." }` | Sub-endpoint 404 |
| `/api/incidents/{id}/attachments/` | GET | ID: `12` | `200 OK` | **Plain JSON Array** (1 entry) | Attachment metadata |
| `/api/incidents/{id}/attachments/` | GET | ID: `11` | `200 OK` | **Plain JSON Array** (0 entries) | Empty attachment array |
| `/api/incidents/99999999/attachments/` | GET | Non-existent ID | `404 Not Found` | Error `{ "detail": "No Incident matches the given query." }` | Sub-endpoint 404 |
| `/api/incidents/` | OPTIONS | None | `200 OK` | Metadata Dictionary | Full DRF field schema |

---

## 3. Envelope vs Plain Array Verdicts

### Verdict 1: List Endpoint Envelope
- **Endpoint**: `GET /api/incidents/`
- **Verdict**: **DRF Paginated Envelope**
- **Structure**:
  ```json
  {
    "count": 12,
    "next": null,
    "previous": null,
    "results": [ /* Incident[] */ ]
  }
  ```

### Verdict 2: Incident History Sub-Endpoint
- **Endpoint**: `GET /api/incidents/{id}/history/`
- **Verdict**: **Plain JSON Array** (`PimsIncidentHistory[]`)
- **Structure**:
  ```json
  [
    {
      "id": 212,
      "event_type": "updated",
      "event_type_label": "Actualizado",
      "changed_at": "2026-11-07T08:22:48.633106Z",
      "actor": "anon-user",
      "changed_by": 14,
      "changed_by_name": "anon-user",
      "description": "Incidente actualizado",
      "recipients_snapshot": null
    }
  ]
  ```
- **Note**: NOT enclosed in `{ count, next, previous, results }`. Consumers must parse as array or use `normalizeArrayResponse()`.

### Verdict 3: Incident Attachments Sub-Endpoint
- **Endpoint**: `GET /api/incidents/{id}/attachments/`
- **Verdict**: **Plain JSON Array** (`PimsIncidentAttachment[]`)
- **Structure**:
  ```json
  [
    {
      "id": 10,
      "file": "https://example.com/media/tenants/example/incidents/bundle_tVxdutt.json.txt",
      "file_name": "bundle.json.txt",
      "uploaded_at": "2026-11-05T20:16:45.026030Z",
      "uploaded_by": 14,
      "uploaded_by_name": "anon-user"
    }
  ]
  ```
- **Note**: NOT enclosed in `{ count, next, previous, results }`. Consumers must parse as array or use `normalizeArrayResponse()`.

### Verdict 4: Embedded vs Sub-Endpoint Consistency
- List items from `GET /api/incidents/` and detail items from `GET /api/incidents/{id}/` already embed `history` and `attachments`.
- Equality check (`JSON.stringify(incident.history) === JSON.stringify(historyEndpoint)`) confirmed: **100% identical data and key set**.
- Both embedded and sub-endpoint items contain identical fields.

---

## 4. Full Field Inventory & Schema Specifications

Across all 12 incidents in production, the serializer produces 57 top-level keys. Both list and detail representations contain the exact same union of keys.

### 4.1 Incident Entity Fields

| Field Name | DRF Serializer Type | Required (POST) | Read-Only | Null Count (12 items) | Observed Sample Value |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `integer` | No | **Yes** | 0/12 | `12` |
| `incident_code` | `string` | No | **Yes** | 0/12 | `"INC-012"` |
| `title` | `string` | **Yes** | No | 0/12 | `"Incidente de prueba de acceso no autorizado"` |
| `description` | `string` | No | No | 9/12 | `"Reporte de intento de acceso no autorizado..."` |
| `incident_type` | `choice` | **Yes** | No | 0/12 | `"OT"`, `"PH"`, `"UA"` |
| `status` | `choice` | No | No | 0/12 | `"C"` (11), `"P"` (1) |
| `severity` | `choice` | No | No | 0/12 | `"L"` (10), `"H"` (2) |
| `impact` | `choice` | No | No | 1/12 | `"L"`, `"M"`, `"H"`, `"V"` |
| `incident_date` | `date` | **Yes** | No | 0/12 | `"2026-11-05"` |
| `incident_time` | `time` | No | No | 10/12 | `"14:30:00"` |
| `detection_date` | `date` | No | No | 10/12 | `"2026-11-05"` |
| `detection_time` | `time` | No | No | 10/12 | `"14:35:00"` |
| `resolved_date` | `date` | No | No | 0/12 | `"2026-11-05"` |
| `involves_personal_data` | `boolean` | No | No | 0/12 | `true` |
| `reported_by` | `string` | No | No | 10/12 | `"ANON_REPORTER"` |
| `assigned_to` | `string` | No | No | 11/12 | `"ANON_ASSIGNEE"` |
| `affected_treatment` | `string` | No | No | 10/12 | `"Gestión de cuentas institucionales"` |
| `compromised_system` | `string` | No | No | 10/12 | `"Equipo de laboratorio"` |
| `affected_url` | `string` | No | No | 11/12 | `"http://sistema.example.net/login"` |
| `evidence_refs` | `string` | No | No | 10/12 | `"Reporte directo;DEADLINE_MISSED_72H"` |
| `num_affected_subjects` | `integer` | No | No | 10/12 | `350` |
| `affected_data_types` | `array` | No | No | 0/12 (empty `[]`) | `["names", "email", "credentials"]` |
| `security_measures_adopted` | `array` | No | No | 0/12 (empty `[]`) | `["encrypt_transit", "mfa", "rbac"]` |
| `affected_cid` | `array` | No | No | 0/12 | `["C"]`, `["C", "I"]` |
| `measure_updated_registry` | `choice` (`Y/N/U`) | No | No | 10/12 | `"Y"` |
| `measure_new_security` | `choice` (`Y/N/U`) | No | No | 10/12 | `"Y"` |
| `measure_improved_policies` | `choice` (`Y/N/U`) | No | No | 10/12 | `"Y"` |
| `measure_considered_resolved` | `choice` (`Y/N/U`) | No | No | 0/12 | `"Y"` |
| `measure_reported_authorities` | `choice` (`Y/N/U`) | No | No | 10/12 | `"N"` |
| `actions` | `nested array` | No | No | 0/12 | `PimsIncidentAction[]` |
| `actions_count` | `integer` | No | **Yes** | 0/12 | `1`, `10`, `11` |
| `attachments` | `nested array` | No | **Yes** | 0/12 | `PimsIncidentAttachment[]` |
| `attachments_count` | `integer` | No | **Yes** | 0/12 | `0`, `1`, `2` |
| `history` | `nested array` | No | **Yes** | 0/12 | `PimsIncidentHistory[]` |
| `created_at` | `datetime` | No | **Yes** | 0/12 | `"2026-11-05T19:28:44.090459Z"` |
| `created_by` | `integer` | No | **Yes** | 0/12 | `14` |
| `updated_at` | `datetime` | No | **Yes** | 0/12 | `"2026-11-07T08:22:48.626591Z"` |
| `updated_by` | `integer` | No | **Yes** | 0/12 | `14` |

### 4.2 Contact, Representative, & Legal Entity Fields

| Field Name | DRF Serializer Type | Null Count (12 items) | Description / Role |
| :--- | :--- | :--- | :--- |
| `dpo_contact_name` | `string` | 10/12 | Data Protection Officer contact name |
| `dpo_contact_email` | `email` | 10/12 | Data Protection Officer email (`anon-dpo@example.com`) |
| `dpo_contact_phone` | `string` | 10/12 | Data Protection Officer telephone number |
| `rep_first_name` | `string` | 10/12 | Legal representative given name(s) |
| `rep_last_name_p` | `string` | 10/12 | Legal representative paternal surname |
| `rep_last_name_m` | `string` | 10/12 | Legal representative maternal surname |
| `rep_position` | `string` | 10/12 | Legal representative official title/position |
| `rep_phone` | `string` | 10/12 | Legal representative phone number |
| `rep_email` | `email` | 10/12 | Legal representative email (`anon-rep@example.com`) |
| `rep_document_number` | `string` | 10/12 | Identity document number (DNI / Carnet) |
| `rep_document_expiry` | `date` | 10/12 | Identity document expiration date |
| `entity_type` | `choice` (`R/U`) | 10/12 | Entity classification: `R` (Privada), `U` (Pública) |
| `entity_ruc` | `string` | 10/12 | Tax identification number (RUC) |
| `entity_name` | `string` | 10/12 | Legal entity corporate name |
| `entity_phone` | `string` | 11/12 | Entity primary contact telephone |
| `entity_extension` | `string` | 11/12 | Entity telephone extension |
| `entity_department` | `choice` | 10/12 | Peruvian department (e.g. `Arequipa`, `Lima`) |
| `entity_province` | `string` | 10/12 | Entity province |
| `entity_district` | `string` | 10/12 | Entity district |

---

### 4.3 Nested `actions[]` Item Schema

Total actions observed across all live incidents: **31 actions**.

| Field Name | Type | Required | Nullable | Observed Choices / Format |
| :--- | :--- | :--- | :--- | :--- |
| `action_type` | `choice` | **Yes** | No | `C` ("Contención"), `A` ("Análisis"), `R` ("Resolución") |
| `responsible` | `string` | No | No | Max length 150 chars (e.g., `"live-smoke"`, `"ANON_RESPONSIBLE"`) |
| `action_date` | `date` | No | No | Format `YYYY-MM-DD` |
| `description` | `string` | **Yes** | No | Detailed action description |
| `evidence` | `string` | No | **Yes** | Evidence text, cite, or `null` |
| `position` | `integer` | No | No | Ordering index (0, 1, 2...) |

---

### 4.4 `history[]` Item Schema (Sub-Endpoint & Embedded)

Total history events observed on Incident 11: 68 entries; on Incident 1: 95 entries.

| Field Name | Type | Nullable | Description / Observed Values |
| :--- | :--- | :--- | :--- |
| `id` | `integer` | No | Unique history event primary key |
| `event_type` | `choice` | No | `"created"`, `"updated"`, `"notified"` |
| `event_type_label` | `string` | No | Display string: `"Creado"`, `"Actualizado"`, `"Notificación enviada"` |
| `changed_at` | `datetime` | No | ISO 8601 timestamp with microsecond precision |
| `actor` | `string` | No | Username of executing actor |
| `changed_by` | `integer` | No | Foreign key ID of executing user |
| `changed_by_name` | `string` | No | Username / display name |
| `description` | `string` | No | Event summary (e.g., `"Incidente actualizado"`) |
| `recipients_snapshot` | `string` | **Yes** | Notification recipient address(es) if notified, else `null` |

---

### 4.5 `attachments[]` Item Schema (Sub-Endpoint & Embedded)

| Field Name | Type | Nullable | Description / Observed Values |
| :--- | :--- | :--- | :--- |
| `id` | `integer` | No | Primary key of attachment |
| `file` | `string` | No | Media URL (e.g. `https://example.com/media/tenants/.../bundle.json.txt`) |
| `file_name` | `string` | No | Original filename with extension (`"bundle.json.txt"`, `"...png"`) |
| `uploaded_at` | `datetime` | No | ISO 8601 upload timestamp |
| `uploaded_by` | `integer` | No | Foreign key ID of uploader |
| `uploaded_by_name` | `string` | No | Username of uploader |

---

## 5. Observed Catalog and Enum Values

### 5.1 Status (`status`)
| Code | Display Name | Observed Live Count | Description |
| :--- | :--- | :--- | :--- |
| `O` | Abierto | 0 | Open incident (allowed choice in OPTIONS schema) |
| `P` | En proceso | 1 (`INC-011`) | In-process incident |
| `C` | Cerrado | 11 (`INC-001`..`INC-010`, `INC-012`) | Closed incident |

### 5.2 Severity (`severity`)
| Code | Display Name | Observed Live Count | Description |
| :--- | :--- | :--- | :--- |
| `L` | Baja | 10 | Low severity |
| `M` | Media | 0 | Medium severity (valid filter, returns 0) |
| `H` | Alta | 2 (`INC-001`, `INC-011`) | High severity |
| `C` | Crítica | 0 | Critical severity (allowed in OPTIONS schema) |

### 5.3 Incident Type (`incident_type`)
| Code | Display Name | Observed Live Count |
| :--- | :--- | :--- |
| `UA` | Acceso no autorizado | 1 (`INC-001`) |
| `DL` | Fuga o pérdida de datos | 0 |
| `MW` | Malware o ransomware | 0 |
| `PH` | Phishing o ingeniería social | 1 (`INC-011`) |
| `DS` | Denegación de servicio | 0 |
| `HE` | Error humano | 0 |
| `DV` | Robo o pérdida de dispositivo | 0 |
| `OT` | Otro | 10 (`INC-002`..`INC-010`, `INC-012`) |

### 5.4 Impact (`impact`)
- `L`: Bajo
- `M`: Medio
- `H`: Alto
- `V`: Muy alto

### 5.5 Action Types (`action_type`)
- `C`: Contención (Observed in live incidents)
- `A`: Análisis (Observed in live incidents)
- `R`: Resolución (Observed in live incidents)

### 5.6 Measures Adoption (`measure_*`)
- `Y`: Sí
- `N`: No
- `U`: Desconocido

---

## 6. Query Parameter Matrix & Filter Behaviors

| Parameter | Tested Input | HTTP Status | Observed Response Behavior |
| :--- | :--- | :--- | :--- |
| `search` | `search=INC` | `200 OK` | Matches `title`, `incident_code`, etc. Returns 12 results |
| `search` | `search=nonexistent_xyz` | `200 OK` | Returns empty `results: []`, `count: 0` |
| `status` | `status=C` | `200 OK` | Filters to 11 closed incidents |
| `status` | `status=P` | `200 OK` | Filters to 1 in-process incident |
| `status` | `status=INVALID_CODE` | `400 Bad Request` | Returns `{ "status": ["Escoja una opción válida. INVALID_CODE no es una de las opciones disponibles."] }` |
| `severity` | `severity=L` | `200 OK` | Filters to 10 low-severity incidents |
| `severity` | `severity=H` | `200 OK` | Filters to 2 high-severity incidents |
| `severity` | `severity=M` | `200 OK` | Valid choice; returns 0 results |
| `severity` | `severity=INVALID_SEV` | `400 Bad Request` | Returns `{ "severity": ["Escoja una opción válida. INVALID_SEV no es una de las opciones disponibles."] }` |
| `incident_type` | `incident_type=OT` | `200 OK` | Returns 10 results |
| `incident_type` | `incident_type=PH` | `200 OK` | Returns 1 result |
| `incident_type` | `incident_type=UA` | `200 OK` | Returns 1 result |
| `incident_type` | `incident_type=INVALID` | `400 Bad Request` | Returns `{ "incident_type": ["Escoja una opción válida. INVALID no es una de las opciones disponibles."] }` |
| `page` | `page=1` | `200 OK` | Standard page 1 |
| `page` | `page=999999` | `404 Not Found` | Returns `{ "detail": "Página inválida." }` |
| `page` | `page=abc` | `404 Not Found` | Returns `{ "detail": "Página inválida." }` |
| `page` | `page=0` | `404 Not Found` | Returns `{ "detail": "Página inválida." }` |
| `page_size` | `page_size=2` | `200 OK` | Returns 2 items with `next` pagination link |
| `page_size` | `page_size=1000` | `200 OK` | Returns all 12 items without error |
| `page_size` | `page_size=0`, `page_size=-1`, `page_size=abc` | `200 OK` | Ignored by DRF; falls back to default pagination |

---

## 7. Error Cases & Response Shapes

### 7.1 Numeric 404 on Detail
- **Request**: `GET /api/incidents/99999999/`
- **HTTP Status**: `404 Not Found`
- **Response Body**:
  ```json
  {
    "detail": "No Incident matches the given query."
  }
  ```

### 7.2 Non-Existent Code Lookup
- **Request**: `GET /api/incidents/INC-012/`
- **HTTP Status**: `404 Not Found`
- **Response Body**:
  ```json
  {
    "detail": "No encontrado."
  }
  ```
- **Architectural Implication**: The SDK cannot call `/api/incidents/{code}/` directly. It must invoke `resolveIncident(idOrCode)` to search by `search={code}` and extract the numeric ID.

### 7.3 Out-of-Range Page 404
- **Request**: `GET /api/incidents/?page=999999`
- **HTTP Status**: `404 Not Found`
- **Response Body**:
  ```json
  {
    "detail": "Página inválida."
  }
  ```

### 7.4 Non-Existent Incident History 404
- **Request**: `GET /api/incidents/99999999/history/`
- **HTTP Status**: `404 Not Found`
- **Response Body**:
  ```json
  {
    "detail": "No Incident matches the given query."
  }
  ```

### 7.5 Non-Existent Incident Attachments 404
- **Request**: `GET /api/incidents/99999999/attachments/`
- **HTTP Status**: `404 Not Found`
- **Response Body**:
  ```json
  {
    "detail": "No Incident matches the given query."
  }
  ```

### 7.6 Field Validation 400 Bad Request
- **Request**: `GET /api/incidents/?status=FOO&severity=BAR`
- **HTTP Status**: `400 Bad Request`
- **Response Body**:
  ```json
  {
    "status": [
      "Escoja una opción válida. FOO no es una de las opciones disponibles."
    ],
    "severity": [
      "Escoja una opción válida. BAR no es una de las opciones disponibles."
    ]
  }
  ```

---

## 8. Deviations from Specification (`docs/PIMS-SDK-SPEC.md` §2.3)

The following deviations were identified between the live API ground truth and `docs/PIMS-SDK-SPEC.md` §2.3:

| # | Feature / Field | Written Spec (`docs/PIMS-SDK-SPEC.md` §2.3) | Live Production Reality (`https://unsa.27k.pe`) | Severity / Action Required |
| :- | :--- | :--- | :--- | :--- |
| 1 | `status` enum choices | Spec defines `"P" \| "C"` (`P`=Pendiente, `C`=Cerrado) | Live schema defines choices `O` ("Abierto"), `P` ("En proceso"), `C` ("Cerrado"). In live data, only `C` and `P` are populated. | **Update SDK types**: Add `"O"` to `IncidentStatus`. |
| 2 | `severity` enum choices | Spec defines `"L" \| "M" \| "H"` | Live schema defines choices `L` ("Baja"), `M` ("Media"), `H` ("Alta"), `C` ("Crítica"). | **Update SDK types**: Add `"C"` to `IncidentSeverity`. |
| 3 | `impact` field | Spec lists `impact: string` | Live schema defines `impact` as a choice field with enum values `L` (Bajo), `M` (Medio), `H` (Alto), `V` (Muy alto). It is also nullable. | **Update SDK types**: Type `impact?: "L" \| "M" \| "H" \| "V" \| null`. |
| 4 | Identifier property | Spec mentions `POST /api/incidents/ (G4- write guard on incident_code / code)` | Responses return solely `incident_code` (and numeric `id`). `code` is **never present**. Additionally, `incident_code` is `read_only: true` on POST (auto-generated as `INC-xxx`). | **Update SDK types**: Remove `code?: string` from response models. |
| 5 | Detail code lookup | Spec implies resolver helper resolves `idOrCode` | `GET /api/incidents/{code}/` fails with 404 (`{"detail":"No encontrado."}`). The server does not support code slugs in URL. | **Implement in SDK**: `resolveIncident(idOrCode)` must perform a list query (`?search={code}`) to find numeric `id` before requesting detail. |
| 6 | Embedded List vs Detail | Spec notes embedded `attachments` and `history` on incident items | Both list items (`GET /api/incidents/`) and detail items (`GET /api/incidents/{id}/`) return the exact same 57 keys, including embedded `history`, `attachments`, `actions_count`, and `attachments_count`. | **SDK Optimization**: Client can use list results directly without forcing individual detail fetches when embedded data suffices. |
| 7 | `history` item schema | Legacy mock types assumed `{ id, incident_id, action, details, timestamp, performed_by }` | Live history items contain `{ id, event_type, event_type_label, changed_at, actor, changed_by, changed_by_name, description, recipients_snapshot }`. | **Update SDK types**: Completely replace `PimsIncidentHistory` interface. |
| 8 | `attachments` item schema | Legacy mock types assumed `{ id, incident_id, file, filename, file_size_bytes, uploaded_at, uploaded_by }` | Live attachment items contain `{ id, file, file_name, uploaded_at, uploaded_by, uploaded_by_name }`. Notice `file_name` with underscore. | **Update SDK types**: Completely replace `PimsIncidentAttachment` interface. |
| 9 | `actions` item schema | Spec lists `{ action_type, responsible, action_date, description, evidence, position }` | Matches live keys, but `action_type` is an enum (`C`, `A`, `R`), `evidence` is nullable, and `responsible` and `action_date` are optional. | **Update SDK types**: Refine nullability and action_type enum in `PimsIncidentAction`. |
| 10 | Extended Regulatory Fields | Spec only mentions basic DPO and rep contacts | Live entity contains 20+ additional fields for Peruvian Personal Data Protection Law (Ley 29733) compliance (`entity_ruc`, `entity_department`, `affected_data_types`, `measure_*`, `affected_cid`). | **Update SDK types**: Add optional compliance fields to `PimsIncident`. |

---

## 9. Conclusion & Actionable SDK Roadmap

1. **Update `packages/pims-adapter/types.ts`**:
   - Align `PimsIncident`, `PimsIncidentAction`, `PimsIncidentHistory`, and `PimsIncidentAttachment` to the verified live shapes.
   - Remove deprecated mock fields (`code`, `action_description`, `performed_by`, `filename`).
2. **Implement `resolveIncident(idOrCode)`**:
   - Ensure numeric strings or numbers go straight to `/api/incidents/{id}/`.
   - String codes (e.g. `INC-001`, `G4-INC-001`) must search via `/api/incidents/?search={code}` and match `incident_code` exactly to resolve the numeric ID.
3. **Fixture Synchronization**:
   - `packages/pims-adapter/fixtures/incidents.json` has been updated with an exact live anonymized snapshot containing `list`, `detail`, `history`, and `attachments`.
