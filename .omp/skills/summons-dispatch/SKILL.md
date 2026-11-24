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

1. **Lectura en PIMS en Vivo y Resolución Real de Correos**:
   - Consultar todos los incidentes y auditorías sin filtro `G4-`:
     - `bun scripts/pims.ts incidents list --json`
     - `bun scripts/pims.ts audits list --json`
   - Resolver direcciones de correo electrónico en orden estricto:
     - Para incidentes: usar `bun scripts/pims.ts incidents get <id_or_code> --include-emails` para resolver `dpo_contact_email` (ej. `dpo@unsa.edu.pe`, `m.quispe@unsa.edu.pe`) y/o `rep_email`.
     - Para acciones de auditoría: `AUD-*` solo almacena el nombre en `responsible` sin correo electrónico (en PIMS no existen correos para auditorías); si no existe un correo oficial del responsable en PIMS, **pedir el correo destino al usuario** antes de crear el borrador o usar el destinatario que el usuario autorice explícitamente. Jamás inventar direcciones `@unsa.edu.pe`.
   - Resolver la cita de evidencia con `bun scripts/pims.ts mirror read <doc.code>` o búsqueda semántica `bun scripts/rag-query.ts "<consulta>"` (`pims:...`), o si el ítem no tiene documento vinculado usar `audit:<audit_code>:<finding>` / `incident:<incident_code>` / `"Sin evidencia registrada en PIMS"`.

2. **Fase A — Creación del Borrador Persistido (NUNCA auto-enviar)**:
   - Usar el CLI canónico (NO leer `connectors/mail/client.ts`, NO `bun -e`):
     `bun scripts/pims.ts mail draft --finding <id> --title "<t>" --severity red|amber|green --to-name "<n>" --to <email> --deadline <YYYY-MM-DD> --evidence <cita> --actions "<resumen>"`
   - El borrador se persiste automáticamente en `MAIL_DRAFTS_PATH` (volumen persistente), sobreviviendo entre turnos, sesiones y reinicios.
   - NUNCA borrar el almacén de borradores (`rm` sobre el drafts store está prohibido); para pruebas usar `MAIL_DRAFTS_PATH=/tmp/test-*.json`.
   - Redirigir destinatario (solo `draft`, NUNCA dispatched): `bun scripts/pims.ts mail update-recipient --id <draftId> --to <email> [--to-name <n>]` (re-renderiza asunto/cuerpo, preserva el plan de acción).
   - Mostrar al usuario: `draftId`, Destinatario y Correo real, Asunto, Severidad RAG, Evidencia y Cuerpo del mensaje.
   - **Detenerse** esperando confirmación explícita con la palabra exacta **`envíalo`**.

3. **Fase B — Despacho Real SMTP Tras Recibir `"envíalo"`**:
   - Cuando y **solo cuando** el usuario responda aprobando con `"envíalo"`, ejecutar:
     `bun scripts/pims.ts mail dispatch --id <draftId> --phrase envíalo --confirm`
   - El CLI autentica con Gmail SMTP (`SMTP_*` leídos en proceso desde `process.env` — jamás impresos ni leyendo `.env`) y retorna el `messageId` real del servidor SMTP.

4. **Publicación Opcional de Bitácora (`files-sidecar`)**:
   - Si se publica bitácora HTML/PDF de despachos, usar `bun scripts/pims.ts publish --slug <slug> --file <path>` y devolver:
     `resultado aquí: https://files.pimsai.mistercricro8.top:444/p/<slug>`.

## 3. Failure Branches

- **Falta `"envíalo"`**: Cualquier respuesta distinta (`"ok"`, `"se ve bien"`) NO autoriza el envío (`SUMMONS_APPROVAL_REQUIRED`). Mantener borrador en estado `"draft"` y recordar que debe escribir `envíalo`.
- **Falta Correo del Destinatario**: Preguntar al usuario antes de emitir `createDraftSummons`.
- **PIMS No Disponible**: Si la consulta a incidentes o auditorías falla, recurrir al espejo local vía `bun scripts/pims.ts mirror read <doc.code>` o búsqueda semántica `bun scripts/rag-query.ts "<consulta>"`, anteponiendo `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]`.
- **Error SMTP (`MAIL_CONFIG_ERROR` / `MAIL_DELIVERY_ERROR`)**: Reportar el error sin exponer `SMTP_PASSWORD` ni variables del entorno.
