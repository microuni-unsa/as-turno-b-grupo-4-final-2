# Mail Connector Skill Fragment

> **Connector Type:** SMTP / Mail API Dispatcher  
> **Key Behavioral Flow:** Non-Conformity Summons Sending (SPEC 9 item 2)  
> **Confirmation Guard:** Strict two-phase gate (`draft` → explicit `"envíalo"` → `dispatch`)

---

## 1. Action Map

| Action / Method | Channel | Auth Required | Parameters / Payload | Return Shape | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `createDraftSummons` | Internal | Yes (`secret:<name>@<v>`) | `{ findingId, nonConformityTitle, severity, recipientName, recipientEmail, deadlineDate, evidenceCitation, correctiveActionSummary }` | `DraftSummonsRecord` | Creates a formatted audit summons in `draft` status. Emits preview to the user. |
| `dispatchSummons` | SMTP / API | Yes (`secret:<name>@<v>`) | `draftId: string, confirmationPhrase: "envíalo"` | `DispatchSummonsResult` | Dispatches the summons email. Strictly rejects execution unless confirmation is `"envíalo"`. |
| `sendGenericMail` | SMTP / API | Yes (`secret:<name>@<v>`) | `{ to, subject, body, isHtml? }` | `SendGenericMailResult` | Direct dispatch for automated system alerts or notifications. |

---

## 2. Two-Phase Summons Protocol (SPEC 9 Item 2)

```
[NC / Corrective Chain Query]
          │
          ▼
[Red / Amber / Green Table (Owner, Deadline, Citation)]
          │
          ▼
[Step 1: createDraftSummons] ───► Emits Draft Preview in Chat
          │
          ▼
   User Review Gate
          │
          ├── Anything else ───► Refuses dispatch (status remains draft)
          │
          ▼
   User says "envíalo"
          │
          ▼
[Step 2: dispatchSummons] ───► Authenticated SMTP Dispatch via Secret Handle
```

---

## 3. Evidence Citation Format

- Citing PIMS document chunks requires format: `pims:<doc_id>:v<version>:chunk:lines` (e.g. `pims:G4-PRC-INC-01:v3.00:chunk-0:lines:1-18`).
- Citing live audit/incident records accepts `audit:<audit_code>:<finding>` or `incident:<incident_code>`.
- When an open audit finding genuinely lacks uploaded evidence, pass an explicit note beginning with `Sin evidencia` instead of fabricating a citation.

---

## 4. Gmail SMTP Configuration & Credential Security

- Real dispatch runs through **Gmail SMTP via `nodemailer`** (`SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_SECURE=false`).
- `MailConnectorClient` resolves credentials cleanly in-process from `SMTP_USERNAME` + `SMTP_PASSWORD` (Google App Password) OR a `SecretsStore` handle (`secret:<name>@<v>`). Drafts persist at `MAIL_DRAFTS_PATH` (`/tmp/pims-mail-drafts.json`).
- **Recipient Email Resolution**: Check PIMS incident fields (`dpo_contact_email`, `rep_email`) first; for audit findings whose `responsible` has no email stored in PIMS, ask the user for the recipient email before calling `createDraftSummons`.
- Mail credentials MUST NEVER be echoed or printed to stdout/logs.
- If credentials are not present and external input is required, trigger `secrets-sidecar`:
  `https://secrets.pimsai.mistercricro8.top:444/s/<token>`

---

## 5. Failure Modes & Recovery

| Failure Signature | Probable Cause | Action |
| :--- | :--- | :--- |
| `SUMMONS_APPROVAL_REQUIRED` | Missing or incorrect confirmation phrase | Ask the user explicitly: "¿Deseas proceder con el envío? Responde 'envíalo' para autorizar el despacho." |
| `MAIL_DRAFT_NOT_FOUND` | Invalid or expired draft ID | Re-generate draft via `createDraftSummons`. |
| `MAIL_DELIVERY_ERROR` | SMTP server connection refused or bad recipient | Check SMTP server status or verify recipient email domain. |
| `AUTH_ERROR` | Stale SMTP password | Rotate secret handle via `secrets.request('smtp_creds')`. |
