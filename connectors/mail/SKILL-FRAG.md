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

In compliance with SPEC 2 & SPEC 9:
- Citing PIMS document chunks requires format:  
  `pims:<doc_id>:v<version>:chunk:lines`  
  Example: `pims:101:v1:chunk:15-28`
- Citation is verified before draft creation.

---

## 4. Authentication & Secrets Handles

- Mail credentials (SMTP user/pass or API keys) MUST NEVER be passed as plaintext.
- Must use handles: `secret:smtp_creds@v1` or `secret:sendgrid_key@v1`.
- If credentials are not present, trigger Secrets Sidecar (`SPEC 4.3`):
  `https://secrets.pimsai.mistercricro8.top/s/<token>`

---

## 5. Failure Modes & Recovery

| Failure Signature | Probable Cause | Action |
| :--- | :--- | :--- |
| `SUMMONS_APPROVAL_REQUIRED` | Missing or incorrect confirmation phrase | Ask the user explicitly: "¿Deseas proceder con el envío? Responde 'envíalo' para autorizar el despacho." |
| `MAIL_DRAFT_NOT_FOUND` | Invalid or expired draft ID | Re-generate draft via `createDraftSummons`. |
| `MAIL_DELIVERY_ERROR` | SMTP server connection refused or bad recipient | Check SMTP server status or verify recipient email domain. |
| `AUTH_ERROR` | Stale SMTP password | Rotate secret handle via `secrets.request('smtp_creds')`. |
