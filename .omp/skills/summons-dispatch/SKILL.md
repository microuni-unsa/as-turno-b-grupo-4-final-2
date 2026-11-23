---
name: summons-dispatch
description: Draft NC/incident follow-up summons from live PIMS emails and RAG evidence using persisted drafts, strictly gating real Gmail SMTP dispatch behind explicit "envíalo" approval.
---

# Skill: summons-dispatch

Generación de borradores y despacho real controlado mediante **Gmail SMTP (`nodemailer`)** en `connectors/mail/client.ts` para notificar a responsables de incidentes o acciones correctivas de auditoría, con compuerta humana infranqueable (`"envíalo"`).

## 1. Trigger Patterns

- "Prepara las citaciones para los responsables en rojo / ámbar."
- "Redacta un correo de seguimiento para `<incidente / hallazgo / responsable>`."
- "envíalo" / "despacha el borrador `<draftId>`" (únicamente en respuesta a un borrador ya mostrado).

## 2. Step Protocol

1. **Lectura en PIMS en Vivo y Resolución Real de Correos (`packages/pims-adapter/client.ts`)**:
   - Consultar todos los incidentes y auditorías sin filtro `G4-`: `client.listIncidents({ page_size: 200 })` y `client.listAudits({ page_size: 200 })`.
   - Resolver direcciones de correo electrónico en orden estricto:
     - Para incidentes: usar `dpo_contact_email` (ej. `dpo@unsa.edu.pe`, `m.quispe@unsa.edu.pe`) y/o `rep_email`.
     - Para acciones de auditoría: `AUD-*` solo almacena el nombre en `responsible` sin correo electrónico; si no existe un correo oficial del responsable en PIMS, **pedir el correo destino al usuario** antes de crear el borrador o usar el destinatario que el usuario autorice explícitamente. Jamás inventar direcciones `@unsa.edu.pe`.
   - Resolver la cita de evidencia con `bun scripts/rag-query.ts` (`pims:...`), o si el ítem no tiene documento vinculado usar `audit:<audit_code>:<finding>` / `incident:<incident_code>` / `"Sin evidencia registrada en PIMS"`.

2. **Fase A — Creación del Borrador Persistido (NUNCA auto-enviar)**:
   - Usar `MailConnectorClient` (`connectors/mail/client.ts`):
     `await mail.createDraftSummons({ findingId, nonConformityTitle, severity, recipientName, recipientEmail, deadlineDate, evidenceCitation, correctiveActionSummary })`
   - El borrador se persiste automáticamente en `MAIL_DRAFTS_PATH` (`/tmp/pims-mail-drafts.json`), sobreviviendo entre turnos e invocaciones `bun`.
   - Mostrar al usuario: `draftId`, Destinatario y Correo real, Asunto, Severidad RAG, Evidencia y Cuerpo del mensaje.
   - **Detenerse** esperando confirmación explícita con la palabra exacta **`envíalo`**.

3. **Fase B — Despacho Real SMTP Tras Recibir `"envíalo"`**:
   - Cuando y **solo cuando** el usuario responda aprobando con `"envíalo"`, ejecutar:
     `await mail.dispatchSummons(draftId, "envíalo")`
   - `MailConnectorClient` autentica con Gmail SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD` leídos en proceso desde `process.env` — jamás impresos ni leyendo `.env`) y retorna el `messageId` real del servidor SMTP.

4. **Publicación Opcional de Bitácora (`files-sidecar`)**:
   - Si se publica bitácora HTML/PDF de despachos, usar `POST http://pimsai-files-sidecar:3000/api/publish` y devolver:
     `resultado aquí: https://files.pimsai.mistercricro8.top:444/p/<slug>`.

## 3. Failure Branches

- **Falta `"envíalo"`**: Cualquier respuesta distinta (`"ok"`, `"se ve bien"`) NO autoriza el envío (`SUMMONS_APPROVAL_REQUIRED`). Mantener borrador en estado `"draft"` y recordar que debe escribir `envíalo`.
- **Falta Correo del Destinatario**: Preguntar al usuario antes de emitir `createDraftSummons`.
- **Error SMTP (`MAIL_CONFIG_ERROR` / `MAIL_DELIVERY_ERROR`)**: Reportar el error sin exponer `SMTP_PASSWORD` ni variables del entorno.
