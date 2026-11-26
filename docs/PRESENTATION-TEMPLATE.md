# Presentation Document: UNSA PIMS Agentic Operator Access Template

> **Target Audience**: Course Instructor / Lead Evaluator  
> **Normative Framework**: ISO/IEC 27701:2025 (PII Controller Role: Admission & Payroll Scope)  
> **Notice**: This document is an access and operational governance template. Placeholders marked `CHANGEME` or `[BLANK]` must be populated upon deployment. **Never commit real credentials, URLs, or authentication tokens to version control.**

---

## 1. Access Endpoints & Authentication Credentials

| Parameter | Specification | Evaluator Access Value |
|---|---|---|
| **Unified Web App URL (`:444`)** | UNSA PIMS Chat, File Uploads & Secrets Vault (primary) | `https://demo.pimsai.mistercricro8.top:444/` |
| **Optional `:443` Edge URL** | Cloudflare 443→444 proxy (optional / pending rule) | `https://demo.pimsai.mistercricro8.top/` |
| **Instructor Access Token (`WEB_RW_TOKEN`)** | Full read-write operator session token | `CHANGEME_WEB_RW_TOKEN` |
| **Observer Access Token (`WEB_RO_TOKEN`)** | Read-only session inspection (optional) | `CHANGEME_WEB_RO_TOKEN` |
| **Access Token Expiry** | Session validity window | `YYYY-MM-DD HH:MM UTC` (CHANGEME) |

---

## 2. Profile Matrix: Loan (Solo Evaluation) vs. Demo (Guided Session)

| Dimension | Guided Class Demo Profile | Solo Loan Evaluation Profile |
|---|---|---|
| **Intended User** | Instructor + Group 4 supervised in class | Instructor solo asynchronous inspection |
| **LLM Key Tier** | Group supervised production API key | Dedicated capped evaluation API key |
| **Budget Enforcement** | Flexible demonstration ceiling | Strict soft request cap (`task.softRequestBudget`) |
| **Request Allocation** | Shared across interactive behaviors | Restricted per-query allocation (anti-exhaustion) |
| **Session Model** | Unscripted interactive operator Q&A | Autonomous clause-by-clause evaluation |
| **Degraded State Trigger** | Manual intervention if rate-limited | Automated transition upon reaching request cap |
| **Generation Capability** | Active document & mold rendering (PDF/XLSX) | Renders active until cap; read-only fallback at cap |
| **RAG / Vector Retrieval** | Full access to pgvector mirror cache | Fully preserved at all times (never disabled) |
| **Credential Rotation** | Rotated post-session | Rotated automatically at token expiry |

---

## 3. Budget Limits & Degraded-at-Cap Operational Behavior

### 3.1 Soft Request Budget (`task.softRequestBudget`)
To ensure predictable latency, avoid runaway tool loops, and prevent a single complex request from consuming the entirety of the evaluation budget, the agent runtime enforces a soft request budget ceiling (`task.softRequestBudget`).

### 3.2 Degraded-at-Cap Policy (SPEC §10)
When the evaluation session reaches the designated soft request budget limit:
1. **Knowledge Retrieval Remains 100% Operational**:
   - The pgvector PIMS mirror cache remains fully active.
   - The instructor can continue querying existing document contents, audit findings, non-conformities (NC), corrective action status, and ISO/IEC 27701:2025 clause citations.
2. **Generative Writes Pause Gracefully**:
   - Live document compilation (`typst compile`), PIMS new-version creation (`POST /api/documents/{id}/versions/`), and external email dispatch are temporarily paused.
3. **Transparent Notification**:
   - Rather than returning a silent failure or broken stack trace, the agent emits an explicit notice:
     > *"Aviso de Límite de Evaluación: Se ha alcanzado el tope de presupuesto para generación activa de esta sesión. Las consultas de RAG, citas normativas y lectura de registros continúan plenamente operativas. Para reactivar la generación o solicitar recarga de cuota, comuníquese con el equipo responsable (Turno B Grupo 4)."*

---

## 4. Session Hygiene & Recommended Policy: `/new`

To ensure optimal performance and budget preservation:
- **Recommend running `/new` whenever the current topic of conversation or investigative thread is exhausted.**
- Running `/new`:
  - Clears conversational context overhead while preserving pgvector cache state.
  - Prevents token budget bloat from accumulating long multi-turn message histories.
  - Allows fresh routing and crisp focus when switching between clauses (e.g., from Cl. 8.1 Incident Response to Cl. 9.2 Internal Audit).
- To browse prior conversations or inspection logs without restarting, run `/resume` to open the session picker.

---

## 5. Security, Expiry & Rotation Notice

- **Zero Plaintext Credentials**: All credentials submitted via the inline encrypted password card or **Bóveda de Secretos** drawer are `age`-encrypted on the persistent agent volume. No passwords or private tokens exist in conversation history or source files.
- **Single-Use Secret Request Cards**: Inline secret request prompts inside the unified web app expire strictly after **5 minutes** (300 seconds); direct file uploads attach straight into the chat composer (up to 50 MB).
- **Session Expiry**: Access tokens (`WEB_RW_TOKEN` / `WEB_RO_TOKEN`) issued for this presentation template expire on `CHANGEME_EXPIRATION_TIMESTAMP`. Following expiry, web auth tokens and secret handles are automatically rotated and invalidated.
