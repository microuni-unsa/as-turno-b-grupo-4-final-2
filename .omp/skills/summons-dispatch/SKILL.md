---
name: summons-dispatch
description: Draft NC/incident follow-up summons from live PIMS emails and RAG evidence using persisted drafts, printing the full verbatim email subject and body before gating real Gmail SMTP dispatch strictly on explicit "envíalo" approval.
---

# Skill: summons-dispatch

Generación de borradores y despacho real controlado mediante **Gmail SMTP (`nodemailer`)** en `connectors/mail/client.ts` para notificar a responsables de incidentes o acciones correctivas de auditoría, mostrando el asunto y cuerpo íntegros antes de la compuerta humana infranqueable (`"envíalo"`).

## 1. Trigger Patterns

- "Prepara las citaciones para los responsables en rojo / ámbar."
- "Redacta un correo de seguimiento para `<incidente / hallazgo / responsable>`."
- "envíalo" / "despacha el borrador `<draftId>`" (únicamente en respuesta a un borrador ya mostrado).

## 2. Step Protocol

1. **Lectura en PIMS en Vivo y Resolución Real de Correos**:
   - Consultar todos los incidentes y auditorías sin filtro `G4-`:
     - `bun scripts/pims.ts incidents list --json`
     - `bun scripts/pims.ts audits list --dedupe --json`
   - Resolver direcciones de correo electrónico en orden estricto:
     - Para incidentes: usar `bun scripts/pims.ts incidents get <id_or_code> --include-emails` para resolver `dpo_contact_email` (ej. `dpo@unsa.edu.pe`, `m.quispe@unsa.edu.pe`) y/o `rep_email`.
     - Para acciones de auditoría: `AUD-*` solo almacena el nombre en `responsible` sin correo electrónico; si no existe un correo oficial del responsable en PIMS, **pedir el correo destino al usuario** antes de crear el borrador o usar el destinatario que el usuario autorice explícitamente. Jamás inventar direcciones `@unsa.edu.pe`.
   - Resolver la cita de evidencia con `bun scripts/pims.ts mirror read <doc.code>` o búsqueda semántica `bun scripts/rag-query.ts "<consulta>"` usando formato canónico `pims:<doc.code>:v<version>:<chunk_id>:<lines>`, o si el ítem no tiene documento vinculado usar `audit:<audit_code>:<finding>` / `incident:<incident_code>` / `"Sin evidencia registrada en PIMS"`.

2. **Fase A — Creación del Borrador Persistido y Vista Previa Íntegra (NUNCA auto-enviar)**:
   - Usar el CLI canónico (NO leer `connectors/mail/client.ts`, NO `bun -e`):
     `bun scripts/pims.ts mail draft --finding <id> --title "<t>" --severity red|amber|green --to-name "<n>" --to <email> --deadline <YYYY-MM-DD> --evidence <cita> --actions "<resumen>"`
     y leer el borrador generado (`bun scripts/pims.ts mail get --id <draftId> --json`) para obtener el asunto y cuerpo exactos renderizados.
   - El borrador se persiste automáticamente en `MAIL_DRAFTS_PATH` (volumen persistente), sobreviviendo entre turnos, sesiones y reinicios.
   - NUNCA borrar el almacén de borradores (`rm` sobre el drafts store está prohibido); para pruebas usar `MAIL_DRAFTS_PATH=/tmp/test-*.json`.
   - Redirigir destinatario (solo antes del envío, NUNCA tras despachar): `bun scripts/pims.ts mail update-recipient --id <draftId> --to <email> [--to-name <n>]` (re-renderiza asunto/cuerpo, preserva el plan de acción).
   - **Mostrar al usuario en español ejecutivo (SIN resumir ni truncar el texto del correo)**:
     - Identificador de borrador (`draftId`), Destinatario y Correo real, Nivel de criticidad, Evidencia citada, **Asunto completo verbatim** y **Cuerpo completo verbatim** del correo electrónico exactamente como se enviará.
     - No exponer en la respuesta al usuario comandos CLI crudos ni rutas internas (`MAIL_DRAFTS_PATH`, `scripts/`).
   - **Detenerse** esperando confirmación explícita con la palabra exacta **`envíalo`**.

3. **Fase B — Despacho Real SMTP Tras Recibir `"envíalo"`**:
   - Cuando y **solo cuando** el usuario responda aprobando con `"envíalo"`, ejecutar:
     `bun scripts/pims.ts mail dispatch --id <draftId> --phrase envíalo --confirm`
   - El CLI autentica con Gmail SMTP (`SMTP_*` leídos en proceso desde `process.env` — jamás impresos ni leyendo `.env`) y retorna el `messageId` real del servidor SMTP.

4. **Publicación Opcional de Bitácora (Consola Web Unificada)**:
   - Si se publica bitácora HTML/PDF de despachos, usar `bun scripts/pims.ts publish --slug summons-$(date -u +%Y%m%d-%H%M) --file <path>` (muestra tarjeta inline **Vista previa / Descargar** en el chat) y devolver:
     `resultado aquí: https://demo.pimsai.mistercricro8.top:444/api/files/<slug>`.

## 3. Failure Branches

- **Falta `"envíalo"`**: Cualquier respuesta distinta (`"ok"`, `"se ve bien"`) NO autoriza el envío (`SUMMONS_APPROVAL_REQUIRED`). Mantener borrador en estado pendiente y recordar en español claro que debe escribir exactamente `envíalo`.
- **Falta Correo del Destinatario**: Preguntar al usuario antes de emitir el borrador.
- **PIMS No Disponible**: Si la consulta a incidentes o auditorías falla, recurrir al espejo local vía `bun scripts/pims.ts mirror read <doc.code>` o búsqueda semántica `bun scripts/rag-query.ts "<consulta>"`, anteponiendo `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]`.
- **Error SMTP (`MAIL_CONFIG_ERROR` / `MAIL_DELIVERY_ERROR`)**: Reportar el diagnóstico en español limpio sin exponer `SMTP_PASSWORD` ni variables del entorno.
