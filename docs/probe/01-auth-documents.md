# Live PIMS Probe Report: Authentication & Documents

> **Probe Date**: 2026-11-23  
> **Target Environment**: Live Production GESTITEL PIMS API (`https://unsa.27k.pe`)  
> **Schema Header**: `X-PIMS-Schema: unsa`  
> **Tenant / Authenticated User**: `grupob4`  
> **Scope**: Authentication (`/business/login/`, `/business/token/refresh/`), Documents (`/api/documents/`, `/api/documents/{id}/`, `/api/documents/{id}/versions/`), Media Download (`/media/...`), Approval endpoint status.  
> **Mode**: Read-Only (no mutating POST/PATCH/PUT/DELETE against `/api/*`).

---

## 1. Executive Summary & Verdict Matrix

| Endpoint | HTTP Method | Response Type / Envelope Verdict | Status Codes Observed | Key Deviation from Spec §2.1–§2.2 |
| :--- | :--- | :--- | :--- | :--- |
| `/business/login/` | `POST` | Single JSON Object | `200 OK`, `400 Bad Request`, `401 Unauthorized` | Response returns additional `user` object with detailed permissions & flags. |
| `/business/token/refresh/` | `POST` | Single JSON Object | `200 OK`, `400 Bad Request`, `401 Unauthorized` | None (`{ "access": string }` matches spec). |
| `/api/documents/` | `GET` | **DRF Paginated Envelope** (`{ count, next, previous, results }`) | `200 OK`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found` | Extends model with DRF audit / soft-delete fields (`approved_by`, `created_at`, `created_by`, `updated_at`, `updated_by`, `is_deleted`, `deleted_at`, `deleted_by`). `file` is always absolute HTTPS URL. |
| `/api/documents/{id}/` | `GET` | **Single JSON Object** (Non-envelope) | `200 OK`, `401 Unauthorized`, `404 Not Found` | Exactly mirrors list item shape (including the 8 audit fields). Zero shape diff from list items. |
| `/api/documents/{id}/versions/` | `GET` | **Plain JSON Array** (`[...]`) | `200 OK`, `401 Unauthorized`, `404 Not Found` | Ordered descending by version/creation. Field name is `created_by_name` (matches spec §2.2). |
| `/media/tenants/unsa/documents/...` | `GET` | Binary PDF (`application/pdf`) | `200 OK`, `401 Unauthorized`, `404 Not Found` | Protected media endpoint; requires `Authorization: Bearer <token>`. Fails under HTTP/2 on nginx (stalls); requires HTTP/1.1 negotiation. |
| `/api/documents/{id}/approve/` | `POST` | *Out of Scope (Mutating)* | `403 Forbidden` (Known RBAC) | Mutating endpoint; omitted from live probing per read-only safety rules. User lacks approval permission (`aprobar: false`). |

---

## 2. Authentication Probing

### 2.1 Endpoint: `POST /business/login/`

- **Purpose**: Exchange username and password credentials for JWT access/refresh token pair and user profile.
- **Request Headers**:
  - `Content-Type: application/json`
  - `X-PIMS-Schema: unsa` *(optional during login; user tenant schema is embedded in JWT claims)*
- **Request Body Shape**:
  ```ts
  {
    username: string,
    password: string
  }
  ```

#### Response Shape: Success (`200 OK`)
- **Verdict**: Single JSON Object.
- **Tokens Observed**:
  - `access`: String (JWT format, 316 characters).
  - `refresh`: String (JWT format, 317 characters).
- **Field Inventory**:
  | Key | Type | Nullable | Description / Observed Value |
  | :--- | :--- | :--- | :--- |
  | `refresh` | `string` | No | JWT refresh token (HS256) |
  | `access` | `string` | No | JWT access token (HS256) |
  | `user` | `object` | No | Authenticated user profile and RBAC permissions |
  | `user.id` | `number` | No | User ID (e.g. `14`) |
  | `user.username` | `string` | No | Username (e.g. `"grupob4"`) |
  | `user.is_platform_admin` | `boolean`| No | Platform administrator flag (`false`) |
  | `user.platform_role` | `null` / `string` | Yes | Platform role (`null`) |
  | `user.must_change_password` | `boolean` | No | Force password change flag (`false`) |
  | `user.permissions` | `array` | No | Array of module permissions |
  | `user.permissions[].modulo` | `string` | No | Module name (e.g. `"Documentos"`, `"Incidentes"`) |
  | `user.permissions[].ver` | `boolean` | No | Read permission |
  | `user.permissions[].crear` | `boolean` | No | Create permission |
  | `user.permissions[].editar` | `boolean` | No | Edit permission |
  | `user.permissions[].eliminar` | `boolean` | No | Delete permission |
  | `user.permissions[].aprobar` | `boolean` | No | Approval permission (`false` for `"Documentos"`) |

#### Error Cases Observed
1. **Wrong Password Probe (`401 Unauthorized`)**:
   - Request: Valid username with incorrect password.
   - Status: `401 Unauthorized`
   - Response Body:
     ```json
     {
       "error": "Credenciales inválidas"
     }
     ```
2. **Missing Credentials Probe (`400 Bad Request`)**:
   - Request: Empty JSON `{}`.
   - Status: `400 Bad Request`
   - Response Body:
     ```json
     {
       "error": "Por favor provea username y password"
     }
     ```

---

### 2.2 Endpoint: `POST /business/token/refresh/`

- **Purpose**: Exchange a valid refresh JWT for a fresh access JWT.
- **Request Headers**:
  - `Content-Type: application/json`
  - `X-PIMS-Schema: unsa`
- **Request Body Shape**:
  ```ts
  {
    refresh: string
  }
  ```

#### Response Shape: Success (`200 OK`)
- **Verdict**: Single JSON Object.
- **Field Inventory**:
  | Key | Type | Nullable | Description / Observed Value |
  | :--- | :--- | :--- | :--- |
  | `access` | `string` | No | Fresh JWT access token (HS256, length 316) |

#### Error Cases Observed
1. **Invalid Refresh Token Probe (`401 Unauthorized`)**:
   - Request: Refresh payload containing malformed/invalid token string.
   - Status: `401 Unauthorized`
   - Response Body:
     ```json
     {
       "detail": "Token is invalid",
       "code": "token_not_valid"
     }
     ```
2. **Missing Refresh Token Body (`400 Bad Request`)**:
   - Request: Empty JSON `{}`.
   - Status: `400 Bad Request`
   - Response Body:
     ```json
     {
       "refresh": [
         "Este campo es requerido."
       ]
     }
     ```

---

## 3. Documents Collection: `GET /api/documents/`

### 3.1 Envelope & Key Inventory
- **Verdict**: **DRF Paginated Envelope** (`{ count, next, previous, results }`).
- **Default Pagination**:
  - Total records observed: `18` (all 18 returned in single page when default page size is applied).
  - `next`: `null` (or pagination URL when `page_size < count`).
  - `previous`: `null`.
- **Full Key Inventory (Union of all 18 documents)**:

| Field Name | Type | Nullable | Observed Values / Format | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `number` | No | `1` .. `18` | Primary key integer |
| `code` | `string` | No | `"G4-IDX-01"`, `"G4-POL-01"`, `"G4-PRC-INC-01"` | Document unique business code |
| `current_version` | `string` | No | `"3.00"`, `"4.00"` | Fixed 2-decimal place string representation |
| `name` | `string` | No | Title string (e.g. `"Política de Privacidad de la Información"`) | Document title |
| `category` | `string` | No | `"PO"`, `"PR"`, `"RE"`, `"IN"` | Document classification code |
| `status` | `string` | No | `"R"` | Lifecycle status code |
| `responsible` | `string` | No | `"Ing. Carlos M. Benítez"` | Document owner / responsible person |
| `approved_at` | `string` | Yes | `null` | ISO 8601 timestamp of approval |
| `approved_by` | `number` | Yes | `null` | Approving user ID |
| `approved_by_name` | `string` | Yes | `null` | Approving user display name |
| `related_documents` | `array` | No | `[]` | Array of related document summaries |
| `gap_requirements` | `array` | No | `[]` | Array of gap requirement strings |
| `file` | `string` | No | `"https://unsa.27k.pe/media/tenants/unsa/documents/v3_he1bRSM.pdf"` | Absolute HTTPS URL to active PDF |
| `created_at` | `string` | No | ISO 8601 timestamp (e.g. `"2026-11-19T22:17:31.657316Z"`) | Audit timestamp |
| `created_by` | `number` | No | `14` | Creator user ID |
| `updated_at` | `string` | No | ISO 8601 timestamp (e.g. `"2026-11-20T16:42:48.495347Z"`) | Update timestamp |
| `updated_by` | `number` | No | `14` | Updater user ID |
| `is_deleted` | `boolean` | No | `false` | Soft-delete flag |
| `deleted_at` | `string` | Yes | `null` | Soft-delete timestamp |
| `deleted_by` | `number` | Yes | `null` | Soft-delete user ID |

### 3.2 Observed Enum Values & Formats
1. **`category` Codes**:
   - `"PO"`: Política (e.g. `G4-POL-01`, `G4-OBJ-01`, `G4-SOA-01`, `G4-ALC-01`).
   - `"PR"`: Procedimiento / Plan / Metodología (e.g. `G4-PRC-INC-01`, `G4-PRC-CAPA-01`, `G4-PRC-DOC-01`, `G4-PLN-RSK-01`, `G4-MET-RSK-01`).
   - `"RE"`: Registro / Reporte / Acta (e.g. `G4-REG-INC-01`, `G4-REG-CAPA-01`, `G4-REG-CAP-01`, `G4-REP-AUD-01`, `G4-ACT-REV-01`, `G4-RSK-INC-01`).
   - `"IN"`: Instructivo / Índice (e.g. `G4-IDX-01`).
2. **`status` Codes**:
   - `"R"`: En Revisión (all 18 live documents currently in revision state).
   - Valid choices supported by API filter: `"B"` (Borrador), `"R"` (En Revisión), `"V"` (Vigente), `"O"` (Obsoleto).
3. **`current_version` Format**:
   - Always formatted as a decimal string with 2 fractional digits: `"3.00"`, `"4.00"`.
   - Never returned as a raw integer or numeric float.
4. **`file` URL Format**:
   - Absolute URL: `https://unsa.27k.pe/media/tenants/unsa/documents/<filename>.pdf`.
   - Never a relative path like `/media/...`.

---

## 4. Query Parameter Matrix (`/api/documents/`)

| Parameter | Probe Query | Status | Count / Results Behavior | Notes / Error Shape |
| :--- | :--- | :--- | :--- | :--- |
| `search` (exact code) | `?search=G4-POL-01` | `200 OK` | `count: 1` (`G4-POL-01`) | Exact case match works. |
| `search` (partial code) | `?search=POL` | `200 OK` | `count: 1` (`G4-POL-01`) | Substring code match works. |
| `search` (lowercase code) | `?search=pol` | `200 OK` | `count: 1` (`G4-POL-01`) | Case-insensitive substring match. |
| `search` (name substring) | `?search=Auditor` | `200 OK` | `count: 3` (`G4-IDX-01`, `G4-REP-AUD-01`, `G4-PRG-AUD-01`) | Substring matches on `name`. |
| `search` (responsible) | `?search=Carlos` | `200 OK` | `count: 18` (all matching items) | Substring matches on `responsible`. |
| `search` (non-matching) | `?search=NONEXISTENT_XYZ` | `200 OK` | `count: 0`, `results: []` | Clean empty array returned. |
| `category` (valid) | `?category=PO` | `200 OK` | `count: 4` (`G4-OBJ-01`, `G4-SOA-01`, `G4-POL-01`, `G4-ALC-01`) | Exact code filter. |
| `category` (lowercase) | `?category=po` | `200 OK` | `count: 0`, `results: []` | Case-sensitive; does not throw 400. |
| `category` (UI name) | `?category=Política` | `200 OK` | `count: 0`, `results: []` | UI string not recognized as code. |
| `category` (invalid code) | `?category=XYZ` | `200 OK` | `count: 0`, `results: []` | CharField filter returns 0 records. |
| `status` (valid code) | `?status=R` | `200 OK` | `count: 18` (all items) | Exact choice filter matches. |
| `status` (valid code) | `?status=B` | `200 OK` | `count: 0`, `results: []` | Choice valid, zero rows in DB. |
| `status` (lowercase) | `?status=r` | `400 Bad Request` | N/A | `{"status":["Escoja una opción válida. r no es una de las opciones disponibles."]}` |
| `status` (UI string) | `?status=En%20Revisi%C3%B3n` | `400 Bad Request` | N/A | `{"status":["Escoja una opción válida. En Revisión no es una de las opciones disponibles."]}` |
| `status` (invalid code) | `?status=XYZ` | `400 Bad Request` | N/A | `{"status":["Escoja una opción válida. XYZ no es una de las opciones disponibles."]}` |
| `page_size` | `?page_size=5` | `200 OK` | `count: 18`, `results.length: 5` | Properly restricts page size. `next` provided. |
| `page` & `page_size` | `?page=2&page_size=5` | `200 OK` | `count: 18`, `results.length: 5` | Returns items 6–10. `next` & `previous` provided. |
| `page` (out of range) | `?page=100&page_size=5` | `404 Not Found` | N/A | `{"detail":"Página inválida."}` |
| `page` (zero) | `?page=0` | `404 Not Found` | N/A | `{"detail":"Página inválida."}` |
| `page` (negative) | `?page=-1` | `404 Not Found` | N/A | `{"detail":"Página inválida."}` |
| `page` (non-numeric) | `?page=abc` | `404 Not Found` | N/A | `{"detail":"Página inválida."}` |
| `page_size` (large) | `?page_size=1000` | `200 OK` | `count: 18`, `results.length: 18` | Returns all records without error. |
| `page_size` (zero/negative)| `?page_size=0` / `-1` | `200 OK` | `count: 18`, `results.length: 18` | Treated as unpaginated / full fetch. |

#### Error Case Shapes for `/api/documents/`
1. **Unauthenticated Probe (`401 Unauthorized`)**:
   - Status: `401 Unauthorized`
   - Body: `{"detail":"Las credenciales de autenticación no se proveyeron."}`
2. **Invalid Token Probe (`401 Unauthorized`)**:
   - Status: `401 Unauthorized`
   - Body:
     ```json
     {
       "detail": "El token dado no es valido para ningun tipo de token",
       "code": "token_not_valid",
       "messages": [
         {
           "token_class": "AccessToken",
           "token_type": "access",
           "message": "Token is invalid"
         }
       ]
     }
     ```
3. **Invalid Status Code (`400 Bad Request`)**:
   - Status: `400 Bad Request`
   - Body:
     ```json
     {
       "status": [
         "Escoja una opción válida. XYZ no es una de las opciones disponibles."
       ]
     }
     ```
4. **Invalid Page Number (`404 Not Found`)**:
   - Status: `404 Not Found`
   - Body:
     ```json
     {
       "detail": "Página inválida."
     }
     ```

---

## 5. Document Detail: `GET /api/documents/{id}/`

### 5.1 Shape Comparison: Detail vs List Items
- **Verdict**: **Single JSON Object** (Non-envelope).
- **Key Parity**: Detail endpoint returns **identical 20 keys** as list items:
  `["id", "code", "current_version", "name", "category", "status", "responsible", "approved_at", "approved_by", "approved_by_name", "related_documents", "gap_requirements", "file", "created_at", "created_by", "updated_at", "updated_by", "is_deleted", "deleted_at", "deleted_by"]`.
- **Key Differences**: Zero structural differences between `GET /api/documents/{id}/` and items inside `GET /api/documents/` `results`.

### 5.2 Error Cases Observed
1. **Numeric ID Not Found (`404 Not Found`)**:
   - Query: `GET /api/documents/999999/`
   - Status: `404 Not Found`
   - Response Body:
     ```json
     {
       "detail": "No Document matches the given query."
     }
     ```
2. **Non-numeric ID Format (`404 Not Found`)**:
   - Query: `GET /api/documents/abc/`
   - Status: `404 Not Found`
   - Response Body:
     ```json
     {
       "detail": "No encontrado."
     }
     ```
3. **Missing Auth Header (`401 Unauthorized`)**:
   - Status: `401 Unauthorized`
   - Response Body: `{"detail":"Las credenciales de autenticación no se proveyeron."}`

---

## 6. Document Versions: `GET /api/documents/{id}/versions/`

### 6.1 Verdict & Structure
- **Verdict**: **Plain JSON Array** (`PimsDocumentVersion[]`).
- **Ordering**: **Descending** by version and creation date (newest version first, e.g. `4.00` → `3.00` → `2.00` → `1.00`).
- **Item Key Inventory**:

| Field Name | Type | Nullable | Example / Observed Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `number` | No | `55` | Version primary key |
| `document` | `number` | No | `11` | Foreign key to document ID |
| `version` | `string` | No | `"4.00"`, `"3.00"`, `"2.00"`, `"1.00"` | Version decimal string |
| `file` | `string` | No | `"https://unsa.27k.pe/media/tenants/unsa/documents/version.pdf"` | Absolute URL to version PDF |
| `change_summary`| `string` | No | `"MENOR :: Formalización operativa..."` | Version changelog |
| `created_at` | `string` | No | `"2026-11-23T04:36:40.942753Z"` | Version upload timestamp |
| `created_by` | `number` | No | `14` | Uploader user ID |
| `created_by_name`| `string`| No | `"grupob4"` | Uploader username |

### 6.2 Multi-Version Verification
Probing document ID `11` (`G4-PRC-INC-01`) confirms 4 historical versions:
- `v4.00` (ID: 55, created `2026-11-23T04:36:40Z`)
- `v3.00` (ID: 33, created `2026-11-19T22:17:27Z`)
- `v2.00` (ID: 32, created `2026-11-19T22:17:27Z`)
- `v1.00` (ID: 31, created `2026-11-19T22:17:26Z`)

### 6.3 Error Cases Observed
1. **Numeric ID Not Found (`404 Not Found`)**:
   - Query: `GET /api/documents/999999/versions/`
   - Status: `404 Not Found`
   - Response Body:
     ```json
     {
       "detail": "No Document matches the given query."
     }
     ```
2. **Non-numeric ID Format (`404 Not Found`)**:
   - Query: `GET /api/documents/abc/versions/`
   - Status: `404 Not Found`
   - Response Body:
     ```json
     {
       "detail": "No encontrado."
     }
     ```

---

## 7. Media PDF Download

- **URL Tested**: `https://unsa.27k.pe/media/tenants/unsa/documents/v3_he1bRSM.pdf`
- **Network / Protocol Constraint**:
  - Direct HTTP/2 requests against `/media/` stall indefinitely on the nginx reverse proxy due to ALPN/flow-control configuration.
  - Clients **must negotiate HTTP/1.1** (`curl --http1.1` or configuring client fetch transport).

### 7.1 Probe With Authentication
- **Command**:
  ```sh
  curl -s -i --http1.1 \
    -H "Authorization: Bearer <access_jwt>" \
    -H "X-PIMS-Schema: unsa" \
    "https://unsa.27k.pe/media/tenants/unsa/documents/v3_he1bRSM.pdf"
  ```
- **Response Headers**:
  - `HTTP/1.1 200 OK`
  - `Content-Type: application/pdf`
  - `Content-Length: 613471`
  - `Accept-Ranges: bytes`
- **File Validation**:
  - Magic bytes verified: `%PDF-1.7` (valid PDF header).
  - Size verified: 613,471 bytes.

### 7.2 Probe Without Authentication
- **Command**:
  ```sh
  curl -s -i --http1.1 "https://unsa.27k.pe/media/tenants/unsa/documents/v3_he1bRSM.pdf"
  ```
- **Status**: `HTTP/1.1 401 Unauthorized`
- **Headers**:
  - `Content-Type: application/json`
  - `WWW-Authenticate: Bearer realm="api"`
- **Response Body**:
  ```json
  {
    "detail": "Las credenciales de autenticación no se proveyeron."
  }
  ```
- **Finding**: Static media files are gated behind Django REST Framework authentication middleware; anonymous access is strictly blocked.

### 7.3 Non-existent Media File Probe
- **Query**: `GET /media/tenants/unsa/documents/nonexistent_file_999.pdf`
- **Status**: `HTTP/1.1 404 Not Found` (served as standard nginx 404 HTML).

---

## 8. Document Approval: `POST /api/documents/{id}/approve/`

- **Endpoint**: `POST /api/documents/{id}/approve/`
- **Operational Scope**: **Out of Scope (Mutating)**.
- **Verification**: In accordance with probe rules (`READ-ONLY: only GET plus two auth POSTs. NEVER POST/PATCH/PUT/DELETE to /api/*`), no live HTTP requests were issued against this endpoint.
- **RBAC Analysis**: User permissions inspection in `POST /business/login/` reveals:
  ```json
  {"modulo": "Documentos", "ver": true, "crear": true, "editar": true, "eliminar": false, "aprobar": false}
  ```
  The user `grupob4` explicitly has `"aprobar": false`. Calling this endpoint will yield `HTTP 403 Forbidden` per RBAC configuration.

---

## 9. Comprehensive Spec Deviation Inventory

Comparison between `docs/PIMS-SDK-SPEC.md` §2.1–§2.2 and live API ground truth:

1. **Document Audit & Soft-Delete Fields**:
   - *Spec §2.2*: Enumerates 12 fields (`id`, `code`, `current_version`, `name`, `category`, `status`, `responsible`, `file`, `approved_at`, `approved_by_name`, `related_documents`, `gap_requirements`).
   - *Live Production*: Returns 20 fields. The 8 additional fields are `approved_by` (`number | null`), `created_at` (`string`), `created_by` (`number`), `updated_at` (`string`), `updated_by` (`number`), `is_deleted` (`boolean`), `deleted_at` (`string | null`), `deleted_by` (`number | null`).
2. **`approved_by` User Identifier**:
   - *Spec §2.2*: Only specifies `approved_by_name: string | null`.
   - *Live Production*: Provides both `approved_by: number | null` (relational user FK) and `approved_by_name: string | null`.
3. **Absolute vs Relative `file` URLs**:
   - *Spec §2.2*: States `file: string (URL or media path to latest PDF)`.
   - *Live Production*: Consistently delivers fully qualified absolute HTTPS URLs (`https://unsa.27k.pe/media/tenants/unsa/documents/...pdf`).
4. **Login Profile & Permission Payload**:
   - *Spec §2.1*: Specifies `{ "access": string, "refresh": string, ... }`.
   - *Live Production*: Returns an embedded `user` object containing `id`, `username`, `is_platform_admin`, `platform_role`, `must_change_password`, and an array of granular per-module permission descriptors (`permissions`).
5. **Strict Choice Validation on `status` Filter**:
   - *Spec §2.2*: Describes `status` filtering without noting choice backend validation behavior.
   - *Live Production*: Django REST Framework enforces strict validation on `status`. Any non-choice value (lowercase `?status=r`, UI string `?status=En Revisión`, or invalid token `?status=XYZ`) returns `HTTP 400 Bad Request` with `{"status":["Escoja una opción válida. ..."]}`. Conversely, `category` uses standard CharField filtering and returns an empty result set (`HTTP 200`, `count: 0`).
6. **Protected Media Storage Requirement**:
   - *Spec §2.2*: States `downloadDocumentPdf(urlOrPath) with Authorization + X-PIMS-Schema headers (same-origin media download or fallback signed URL handling)`.
   - *Live Production*: Media endpoint `/media/` enforces `Authorization: Bearer <token>` and returns `HTTP 401` if omitted. However, `X-PIMS-Schema` header is optional when Bearer token is present, as tenant schema is embedded directly in JWT claims (`"schema":"unsa"`).
7. **HTTP/2 Transport Stall on Media Downloads**:
   - *Spec §2.2*: Does not specify transport protocol requirements.
   - *Live Production*: Nginx hangs during HTTP/2 static media streaming. Adapter / SDK must enforce HTTP/1.1 transport for binary downloads.
