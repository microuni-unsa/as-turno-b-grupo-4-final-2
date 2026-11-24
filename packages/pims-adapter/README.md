# @pims/pims-adapter

Typed, bun-compatible TypeScript client for **GESTITEL PIMS** (`https://unsa.27k.pe`, schema: `unsa`).

Designed for high-reliability agentic workflows, featuring:
- **Zero build step required**: runs natively in Bun or modern Node.js runtimes.
- **Write-only tenant guard (`G4-`)**: enforces the `G4-` prefix on all writes while reading the full PIMS tenant uniformly across all groups/entities (no read-side filtering).
- **Uniform response normalization**: `normalizePaginatedResponse` and `normalizeArrayResponse` handle both DRF `{ count, results }` envelopes and plain JSON arrays.
- **Fail-safe read protocols**: typed error classes carrying failed endpoints and HTTP statuses for instant fallback to the local mirror.
- **Deterministic state handling**: exhaustive switch mappers for UI <-> API statuses with zero silent defaults.
- **Zero hardcoded credentials or arbitrary URLs**: credentials resolved strictly from environment variables or secrets handles; production base URL declared once in `config.ts`.
- **Strict live production schemas**: 100% verified against live production endpoints via probes `01` through `05`.

---

## 1. Endpoint Map Table

| Module | Method | Endpoint | Description & Tenant Guard |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/business/login/` | Obtains JWT pair `{access, refresh}` and user profile. Credentials from env/secrets. |
| **Auth** | `POST` | `/business/token/refresh/` | Rotates access token via `{refresh: token}`. |
| **Documents** | `POST` | `/api/documents/` | Multipart upload (`code`, `name`, `category`, `status`, `responsible`, `upload_file`). **Guard: code must start with `G4-`; explicit `.pdf` `fileName` required; category in `PO\|PR\|RE\|IN`.** |
| **Documents** | `POST` | `/api/documents/{id}/versions/` | Uploads new document version (`file`, `change_summary`). **Guard: explicit `.pdf` `fileName` required.** |
| **Documents** | `GET` | `/api/documents/` | Lists all PIMS documents uniformly (DRF paginated envelope `{ count, next, previous, results }`). |
| **Documents** | `GET` | `/api/documents/{id}/` | Fetches document detail without read-side group filtering. |
| **Documents** | `GET` | `/api/documents/{id}/versions/` | Lists historical versions of a document (plain JSON array `PimsDocumentVersion[]`). |
| **Documents** | `POST` | `/api/documents/{id}/approve/` | Approves a document. **Note**: `grupob4` lacks `aprobar` RBAC permission (`HTTP 403`); throws `PimsApprovalForbiddenError` directing to UI approval. |
| **Incidents** | `GET` | `/api/incidents/` | Lists all PIMS incidents uniformly (`INC-001`..`INC-012`, DRF paginated envelope). |
| **Incidents** | `GET` | `/api/incidents/{id}/` | Fetches single incident detail uniformly (accepts numeric `id`). |
| **Incidents** | `POST` | `/api/incidents/` | Creates incident. **Guard: enforces `G4-` code prefix on `incident_code`.** |
| **Incidents** | `PATCH` | `/api/incidents/{id}/` | Updates incident. **Guard: enforces `G4-` code prefix if code provided.** |
| **Incidents** | `DELETE` | `/api/incidents/{id}/` | Deletes incident. |
| **Incidents** | `GET` | `/api/incidents/{id}/history/` | Fetches audit trail of events for an incident (plain JSON array `PimsIncidentHistory[]`). |
| **Incidents** | `GET` | `/api/incidents/{id}/attachments/` | Lists attachments for an incident (plain JSON array `PimsIncidentAttachment[]`). |
| **Incidents** | `POST` | `/api/incidents/{id}/attachments/` | Uploads attachment. **Guard: checks format (`png,tif,bmp,pdf,doc,docx,txt`) and ≤ 10MB limit.** |
| **Audits** | `GET` | `/api/audits/` | Lists all audit records uniformly (`AUD-2026-001`..`003`, DRF paginated envelope with embedded findings & actions). |
| **Audits** | `GET` | `/api/audits/{id}/` | Fetches audit detail uniformly (accepts numeric `id`). |
| **Risks** | `GET` | `/api/risk-evaluations/` | Lists risk evaluations (DRF paginated envelope). |
| **Risks** | `GET` | `/api/risk-evaluations/catalogs/` | Retrieves risk catalogs (18 top-level keys: periods, threats, vulnerabilities, active_matrix, etc.). |
| **Risks** | `GET` | `/api/risk-evaluations/eligible-assets/`| Lists assets eligible for risk assessment (envelope includes `scope_label`). |
| **Assets** | `GET` | `/api/assets/` | Lists organizational assets (DRF paginated envelope, 50 fields per asset). |
| **Assets** | `GET` | `/api/assets/{id}/` | Fetches asset detail uniformly (accepts numeric `id`). |
| **Dashboard** | `GET` | `/api/dashboard/?tab={tab}` | Fetches dashboard summary KPI cards, semaphores, and historical series. |
| **Annex-A** | `GET` | `/api/annex-a-controls/meta/` | Retrieves Annex-A ISO 27001/27701 controls metadata (`standard`, `groups`, `roles`, `sources`, `has_law_29733`). |
| **Trainings** | `GET` | `/api/trainings/` | **EXPECTED 403**: Handled as typed `PimsTrainingsForbiddenError`. Training records live as uploaded documents (`G4-REG-CAP-*`). |
| **System Catalogs** | `GET` | `/api/system-catalogs/` | System catalogs collection (returns 10 active catalog definitions). |

---

## 2. Authentication Flow

Credentials are **NEVER** stored or hardcoded in the codebase. The `AuthManager` resolves credentials following this strict precedence:

1. Explicit credentials passed to `client.login({ username, password })` or constructor.
2. Environment variables: `PIMS_USERNAME` and `PIMS_PASSWORD`.
3. Secret handles: `SECRET_<handle>_USER` and `SECRET_<handle>_PASS` per SPEC §4.3.
4. If no valid credentials exist, it immediately throws `PimsAuthError("NO_CREDENTIALS_FOUND")`.

```ts
import { AuthManager } from "./auth.ts";

const auth = new AuthManager();

// Automatically reads process.env.PIMS_USERNAME and process.env.PIMS_PASSWORD
const tokens = await auth.login();
console.log("Access token obtained:", tokens.access);

// Refresh flow
const refreshedToken = await auth.refreshToken();
```

---

## 3. Shared-Tenant Guard Rules (Write-Only Enforcement)

The production GESTITEL instance uses a single shared database schema (`unsa`). To prevent accidental overwrites of records belonging to other student groups while allowing uniform full-system visibility:

1. **Write Guard (`G4-` Prefix)**:
   - Every creation or update specifying an entity code (`createDocument`, `createIncident`, `updateIncident`) must start with `G4-`.
   - If a code does not start with `G4-`, `TenantGuardViolationError` is thrown before any network request is sent.
2. **Explicit PDF File Names**:
   - `createDocument` and `addDocumentVersion` require an explicit non-empty `.pdf` `fileName` (or `File.name`) and fail fast with `PimsValidationError` rather than falling back to generic names like `version.pdf`.
3. **Uniform System-Wide Reads**:
   - `listDocuments()`, `getDocument(id)`, `listIncidents()`, `getIncident(id)`, `listAudits()`, and `getAudit(id)` normalize both plain JSON arrays and DRF paginated envelopes (`{ count, next, previous, results }`) and return the full PIMS view without `G4-` read-side filtering.

---

## 4. File Formats & Size Restrictions

| Module | Allowed Extensions | Allowed MIME Types | Size Cap | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Documents** | `.pdf` | `application/pdf` | — | Document body & versions |
| **Incident Attachments** | `.png`, `.tif`, `.bmp`, `.pdf`, `.doc`, `.docx`, `.txt` | Multi | **10 MB** client-side check | Incident evidence |
| **Tabular Import** | `.xlsx` | `application/vnd.openxmlformats...` | — | Scripted registers |

Client-side checks validate file extensions and byte sizes *before* generating multipart payloads, throwing `PimsAttachmentFormatError` or `PimsAttachmentSizeError`.

---

## 5. Live Production Enums & Status Mappings

### 5.1 Document Category (`DocumentCategory`)
| Code | Category Meaning | Examples |
| :---: | :--- | :--- |
| `PO` | Política | `G4-POL-01`, `G4-OBJ-01`, `G4-SOA-01`, `G4-ALC-01` |
| `PR` | Procedimiento / Plan / Metodología | `G4-PRC-INC-01`, `G4-PRC-CAPA-01`, `G4-PLN-RSK-01`, `G4-MET-RSK-01` |
| `RE` | Registro / Reporte / Acta | `G4-REG-INC-01`, `G4-REP-AUD-01`, `G4-REG-CAP-01`, `G4-ACT-REV-01` |
| `IN` | Instructivo / Índice | `G4-IDX-01` |

### 5.2 Document Status (`DocumentStatusAPI` & `DocumentStatusUI`)
Maps UI human-readable labels to GESTITEL 1-character API enum codes using exhaustive switch statements:

| UI Status (`DocumentStatusUI`) | API Code (`DocumentStatusAPI`) | Description |
| :--- | :---: | :--- |
| `borrador` | `B` | Borrador (Draft document) |
| `en_revision` | `R` | En Revisión (Under review — all 18 live documents) |
| `vigente` | `V` | Vigente (Active / in effect) |
| `obsoleto` | `O` | Obsoleto (Deprecated / superseded) |

### 5.3 Incident Enums (`IncidentStatusAPI` & `IncidentSeverityAPI`)
- **Status (`IncidentStatusAPI`)**: `"P"` (En proceso / Pendiente), `"C"` (Cerrado).
- **Severity (`IncidentSeverityAPI`)**: `"L"` (Baja), `"M"` (Media), `"H"` (Alta).
- **Impact**: `"L"` (Bajo), `"M"` (Medio), `"H"` (Alto), `"V"` (Muy alto).
- **Action Type**: `"C"` (Contención), `"A"` (Análisis), `"R"` (Resolución).

### 5.4 Audit Status (`AuditStatusAPI`)
- **Status (`AuditStatusAPI`)**: `"P"` (Planificada), `"R"` (En curso), `"C"` (Cerrada).

---

## 6. Read Failure Protocol & Typed 403 Handling

All read errors throw `PimsReadFailureError` carrying:
- `endpoint`: string (e.g. `/api/documents/`)
- `status`: HTTP status code (e.g. 500, 502, 404)
- `details`: parsed response body or raw error text

This enables calling agents to report the exact failure and seamlessly fall back to the local corpus mirror.

### Expected 403 on Trainings (`PimsTrainingsForbiddenError`)
Tenant `grupob4` lacks permissions to the `/api/trainings/` module. When invoked, the adapter raises `PimsTrainingsForbiddenError` (subclass of `PimsReadFailureError`), instructing consumers that training evidence lives in uploaded documents (`G4-REG-CAP-*` / `G4-PRG-CAP-*`).

### Expected 403 on Document Approval (`PimsApprovalForbiddenError`)
Endpoint `POST /api/documents/{id}/approve/` returns HTTP 403 Forbidden for `grupob4` per RBAC policy (`"aprobar": false`). The adapter raises `PimsApprovalForbiddenError` (subclass of `PimsReadFailureError`), directing administrators to complete approval in the PIMS web UI.

---

## 7. Canned Fixtures & Usage Examples

The adapter includes live-verified fixtures in `./fixtures/`:
- `documents.json`: Snapshot of `/api/documents/` DRF envelope and `/api/documents/{id}/versions/` plain array.
- `incidents.json`: Snapshot of `/api/incidents/` DRF envelope, detail object, `/history/` array, and `/attachments/` array.
- `audits.json`: Snapshot of `/api/audits/` DRF envelope with embedded findings and actions arrays.
- `reads.json`: Contains live snapshots of `riskEvaluations`, `catalogs` (18 keys), `eligibleAssets` (`scope_label`), `assets` (50 fields), `dashboard` (`tab=summary`), and `annexA` metadata.

### Smoke Test Without Production

```ts
import {
  PimsClient,
  mapDocumentStatusUIToAPI,
  PimsTrainingsForbiddenError,
  PimsApprovalForbiddenError,
} from "./index.ts";
import documentsFixture from "./fixtures/documents.json" with { type: "json" };
import incidentsFixture from "./fixtures/incidents.json" with { type: "json" };
import auditsFixture from "./fixtures/audits.json" with { type: "json" };
import readsFixture from "./fixtures/reads.json" with { type: "json" };

// 1. Status Mapping Verification
const apiCode = mapDocumentStatusUIToAPI("vigente");
console.log("Mapped status:", apiCode); // Output: "V"

// 2. Initialize Client with Mock Fetch
const client = new PimsClient({
  fetchFn: async (url, init) => {
    const urlStr = url.toString();
    if (urlStr.includes("/api/documents/1/approve/")) {
      return new Response(JSON.stringify({ detail: "Forbidden" }), { status: 403 });
    }
    if (urlStr.includes("/api/documents/")) {
      return new Response(JSON.stringify(documentsFixture.list), { status: 200 });
    }
    if (urlStr.includes("/api/incidents/")) {
      return new Response(JSON.stringify(incidentsFixture.list), { status: 200 });
    }
    if (urlStr.includes("/api/audits/")) {
      return new Response(JSON.stringify(auditsFixture), { status: 200 });
    }
    if (urlStr.includes("/api/trainings/")) {
      return new Response(JSON.stringify({ detail: "Forbidden" }), { status: 403 });
    }
    return new Response(JSON.stringify({}), { status: 200 });
  },
});

client.setTokens("mock-jwt-access-token", "mock-jwt-refresh-token");

// 3. Inspect Live Document Shapes
const docs = await client.listDocuments();
console.log(`Loaded ${docs.results.length} documents:`);
for (const doc of docs.results) {
  console.log(`- [${doc.code}] ${doc.name} (v${doc.current_version}) category=${doc.category} status=${doc.status}`);
}

// 4. Inspect Live Incident Shapes
const incidents = await client.listIncidents();
console.log(`Loaded ${incidents.results.length} incidents:`);
for (const inc of incidents.results) {
  console.log(`- [${inc.incident_code}] ${inc.title} severity=${inc.severity} status=${inc.status}`);
}

// 5. Inspect Live Audits Shapes
const audits = await client.listAudits();
console.log(`Loaded ${audits.results.length} audits:`);
for (const audit of audits.results) {
  console.log(`- [${audit.audit_code}] ${audit.name} status=${audit.status} findings=${audit.findings?.length ?? 0}`);
}

// 6. Verify Expected 403 Errors
try {
  await client.getTrainings();
} catch (err) {
  if (err instanceof PimsTrainingsForbiddenError) {
    console.log("Verified expected 403 on trainings:", err.message);
  }
}
```
