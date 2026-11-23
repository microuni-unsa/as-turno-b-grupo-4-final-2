# @pims/pims-adapter

Typed, bun-compatible TypeScript client for **GESTITEL PIMS** (`https://unsa.27k.pe`, schema: `unsa`).

Designed for high-reliability agentic workflows, featuring:
- **Zero build step required**: runs natively in Bun or modern Node.js runtimes.
- **Write-only tenant guard (`G4-`)**: enforces the `G4-` prefix on all writes while reading the full PIMS tenant uniformly across all groups/entities (no read-side filtering).
- **Uniform response normalization**: `normalizePaginatedResponse` and `normalizeArrayResponse` handle both DRF `{ count, results }` envelopes and plain JSON arrays.
- **Fail-safe read protocols**: typed error classes carrying failed endpoints and HTTP statuses for instant fallback to the local mirror.
- **Deterministic state handling**: exhaustive switch mappers for UI <-> API statuses with zero silent defaults.
- **Zero hardcoded credentials or arbitrary URLs**: credentials resolved strictly from environment variables or secrets handles; production base URL declared once in `config.ts`.

---

## 1. Endpoint Map Table

| Module | Method | Endpoint | Description & Tenant Guard |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/business/login/` | Obtains JWT pair `{access, refresh}`. Credentials from env/secrets. |
| **Auth** | `POST` | `/business/token/refresh/` | Rotates access token via `{refresh: token}`. |
| **Documents** | `POST` | `/api/documents/` | Multipart upload (`code`, `name`, `category`, `status`, `responsible`, `upload_file`). **Guard: code must start with `G4-`; explicit `.pdf` `fileName` required.** |
| **Documents** | `POST` | `/api/documents/{id}/versions/` | Uploads new document version (`file`, `change_summary`). **Guard: explicit `.pdf` `fileName` required.** |
| **Documents** | `GET` | `/api/documents/` | Lists all PIMS documents uniformly (array or paginated envelope). |
| **Documents** | `GET` | `/api/documents/{id}/` | Fetches document detail without read-side group filtering. |
| **Documents** | `GET` | `/api/documents/{id}/versions/` | Lists all historical versions of a document (normalizes plain array or paginated envelope). |
| **Documents** | `POST` | `/api/documents/{id}/approve/` | Approves a document (note: `grupob4` receives RBAC 403 unless executed by administrator). |
| **Incidents** | `GET` | `/api/incidents/` | Lists all PIMS incidents uniformly (`INC-001`, `G4-...`, etc.). |
| **Incidents** | `GET` | `/api/incidents/{id}/` | Fetches single incident detail uniformly. |
| **Incidents** | `POST` | `/api/incidents/` | Creates incident. **Guard: enforces `G4-` code prefix.** |
| **Incidents** | `PATCH` | `/api/incidents/{id}/` | Updates incident. **Guard: enforces `G4-` code prefix if code provided.** |
| **Incidents** | `DELETE` | `/api/incidents/{id}/` | Deletes incident. |
| **Incidents** | `GET` | `/api/incidents/{id}/history/` | Fetches audit trail of events for an incident. |
| **Incidents** | `GET` | `/api/incidents/{id}/attachments/` | Lists attachments for an incident. |
| **Incidents** | `POST` | `/api/incidents/{id}/attachments/` | Uploads attachment. **Guard: checks format (`png,tif,bmp,pdf,doc,docx,txt`) and ≤ 10MB limit.** |
| **Reads** | `GET` | `/api/audits/` | Lists all audit records uniformly (`AUD-2026-001`..`003`, etc.). |
| **Reads** | `GET` | `/api/audits/{id}/` | Fetches audit detail uniformly. |
| **Reads** | `GET` | `/api/risk-evaluations/` | Lists risk evaluations. |
| **Reads** | `GET` | `/api/risk-evaluations/catalogs/` | Retrieves threats and vulnerability catalogs. |
| **Reads** | `GET` | `/api/risk-evaluations/eligible-assets/`| Lists assets eligible for risk assessment. |
| **Reads** | `GET` | `/api/assets/` | Lists organizational assets. |
| **Reads** | `GET` | `/api/dashboard/?tab={tab}` | Fetches dashboard KPI counters. |
| **Reads** | `GET` | `/api/annex-a-controls/meta/` | Retrieves Annex-A ISO 27001/27701 controls metadata. |
| **Reads** | `GET` | `/api/trainings/` | **EXPECTED 403**: Handled as typed `PimsTrainingsForbiddenError`. Training records live as uploaded documents. |
| **Reads** | `GET` | `/api/system-catalogs/` | **EXPECTED 403**: Handled as typed `PimsTrainingsForbiddenError`. |

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

## 5. Bidirectional Document Status Mapping

Maps UI human-readable labels to GESTITEL 1-character API enum codes using exhaustive switch statements:

| UI Status | API Code | Description |
| :--- | :---: | :--- |
| `borrador` | `B` | Draft document |
| `en_revision` | `R` | Under review |
| `vigente` | `V` | Active / in effect |
| `obsoleto` | `O` | Deprecated / superseded |

Any invalid status throws `DocumentStatusMappingError`.

---

## 6. Read Failure Protocol & 403-Trainings Handling

All read errors throw `PimsReadFailureError` carrying:
- `endpoint`: string (e.g. `/api/documents/`)
- `status`: HTTP status code (e.g. 500, 502, 404)
- `details`: parsed response body or raw error text

This enables the calling agent to report the exact failure and seamlessly fall back to the local corpus mirror.

### Expected 403 on Trainings
Tenant `grupob4` does not have access to the `/api/trainings/` or `/api/system-catalogs/` table modules. When invoked, the adapter raises `PimsTrainingsForbiddenError` (a subclass of `PimsReadFailureError`). This is treated as **expected business logic** rather than an unexpected crash, instructing consumers that training records are stored as uploaded PDF documents in PIMS.

---

## 7. Fixture-Based Usage Example (Smoke Test Without Prod)

Consumers can verify adapter integrations without hitting production using the canned fixtures in `./fixtures/`:

```ts
import { PimsClient, mapDocumentStatusUIToAPI, PimsTrainingsForbiddenError } from "./index.ts";
import documentsFixture from "./fixtures/documents.json" with { type: "json" };
import incidentsFixture from "./fixtures/incidents.json" with { type: "json" };
import readsFixture from "./fixtures/reads.json" with { type: "json" };

// 1. Status Mapping Verification
const apiCode = mapDocumentStatusUIToAPI("vigente");
console.log("Mapped status:", apiCode); // Output: "V"

// 2. Initialize Client with Mock Fetch or Custom Base
const client = new PimsClient({
  fetchFn: async (url, init) => {
    const urlStr = url.toString();
    if (urlStr.includes("/api/documents/")) {
      return new Response(JSON.stringify(documentsFixture.list), { status: 200 });
    }
    if (urlStr.includes("/api/incidents/")) {
      return new Response(JSON.stringify(incidentsFixture.list), { status: 200 });
    }
    if (urlStr.includes("/api/trainings/")) {
      return new Response(JSON.stringify(readsFixture.trainings_403), { status: 403 });
    }
    return new Response(JSON.stringify({}), { status: 200 });
  },
});

// Set fixture token
client.setTokens("mock-jwt-access-token", "mock-jwt-refresh-token");

// 3. Smoke Test Documents List
const docs = await client.listDocuments();
console.log(`Loaded ${docs.results.length} Group 4 documents:`);
for (const doc of docs.results) {
  console.log(`- [${doc.code}] ${doc.name} (v${doc.current_version}) status=${doc.status}`);
}

// 4. Smoke Test Trainings Expected 403
try {
  await client.getTrainings();
} catch (err) {
  if (err instanceof PimsTrainingsForbiddenError) {
    console.log("Verified expected 403 on trainings:", err.message);
  } else {
    throw err;
  }
}
```
