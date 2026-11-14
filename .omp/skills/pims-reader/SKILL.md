---
name: pims-reader
description: Standardized fast readers over PIMS REST API with G4-/responsible filtering, read-failure protocol with pgvector mirror fallback, and self-heal loop participation.
---

# PIMS Reader Skill (`pims-reader`)

Standardized, performant read interface connecting the agentic operator to the primary source of truth: the synthetic PIMS GESTITEL platform (`https://unsa.27k.pe`, tenant schema `unsa`).

## 1. Authentication Protocol
- **Endpoint**: `POST /business/login/`
- **Payload**: `{"username": "<PIMS_USER>", "password": "<PIMS_PASSWORD>"}`
- **Response**: `{"access": "<JWT_ACCESS_TOKEN>", "refresh": "<JWT_REFRESH_TOKEN>"}`
- **Header**: Attach `Authorization: Bearer <JWT_ACCESS_TOKEN>` to all subsequent REST queries.
- **Credential Governance**: Credentials must be resolved dynamically via the secrets sidecar handle (`secret:pims_credentials@v1`). Never hardcode or echo credentials in chat, transcripts, or logs.

## 2. Core Read Endpoints
- **Documents Catalog**:
  - `GET /api/documents/`: List all document headers.
  - `GET /api/documents/{id}/`: Retrieve document detail. Expected schema:
    ```json
    {
      "id": 101,
      "code": "G4-POL-001",
      "current_version": "1.0",
      "name": "Política General de Privacidad PII",
      "category": "politica",
      "status": "V",
      "responsible": "Turno B Grupo 4",
      "file": "/media/documents/G4-POL-001_v1.0.pdf",
      "approved_at": "2025-10-15T09:00:00Z",
      "approved_by_name": "Comité de Privacidad UNSA",
      "related_documents": [],
      "gap_requirements": ["ISO-27701:Cl.5.2"]
    }
    ```
  - `GET /api/documents/{id}/versions/`: Retrieve version history table and change summaries.
- **Incident & Governance Endpoints**:
  - `GET /api/incidents/`, `GET /api/incidents/{id}/`: Incident records, containment actions, notifications.
  - `GET /api/audits/`, `GET /api/audits/{id}/`: Audit programmes, non-conformities (NC), corrective action status.
  - `GET /api/risk-evaluations/`: Risk assessment rows and treatment plans under Cl. 6.1.2/6.1.3.

## 3. Mandatory Shared Tenant Filtering
- **Shared Schema Context**: The GESTITEL instance is shared with other groups. Records from multiple teams co-exist in the database.
- **Deterministic Filter**:
  - Filter all document and incident lists where `code` starts with `G4-` (case-sensitive).
  - Filter all records where `responsible` or group metadata matches `Turno B Grupo 4` or `grupob4`.
  - Records belonging to other groups must be excluded silently from result sets and never revealed or modified.

## 4. Read-Failure Protocol (Deterministic 3-Step Sequence)
If any REST call to PIMS fails (HTTP 4xx/5xx, network timeout, connection reset):
1. **Report the Exact Failure**:
   State clearly to the user which endpoint failed, the HTTP status code, and the error reason:
   > *"Aviso: Fallo al consultar `GET /api/documents/{id}/` [HTTP 502 Bad Gateway / Connection Timeout]."*
2. **Answer From the pgvector Mirror**:
   Immediately query the local PostgreSQL pgvector mirror cache (`corpus_mirror` vector table) using the cosine distance operator (`<=>`) against the query embedding.
3. **Explicitly Label the Source**:
   Prepend the response with:
   > `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]`
   Explicitly remind the operator that the mirror is a cache and PIMS remains the primary source of truth.

## 5. Participation in Self-Heal Loop
When repeated read failures or unexpected response schema drifts occur:
1. **Read-Only Probes First**:
   Execute lightweight, non-mutating HTTP probes (`HEAD`, `OPTIONS`, or minimal `GET /api/documents/?limit=1`) to diagnose connectivity, routing, or authentication token validity.
2. **Notify Connector Builder**:
   Relay diagnostic logs to `connector-builder` to trigger a background diagnostic subagent.
3. **Uninterrupted Mirror Service**:
   Continue answering all operator questions using the pgvector mirror while the background repair proceeds.
