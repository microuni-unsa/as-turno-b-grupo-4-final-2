---
name: incident-ops
description: Query all live PIMS incidents and audit findings without G4- read filtering, compute verified RAG operational tables with deduplicated audit rows, and cross-offer summons-dispatch.
---

# Skill: incident-ops

Consulta y gestión operativa de incidentes, hallazgos de auditoría, no conformidades y acciones correctivas con clasificación semafórica **Rojo / Ámbar / Verde** bajo criterios estrictos de verificación auditada.

## 1. Trigger Patterns

- "¿Cuál es el estado de los incidentes y no conformidades?"
- "Muestra el semáforo de acciones correctivas."
- "¿Qué acciones están vencidas o pendientes?"
- "Revisa el cumplimiento de auditorías e incidentes en PIMS."

## 2. Step Protocol

1. **Lectura Uniforme en PIMS en Vivo + RAG (`packages/pims-adapter/client.ts`)**:
   - Consultar **todos** los incidentes y auditorías del sistema (sin filtrar por `G4-` en lectura):
     - `client.listIncidents({ page_size: 200 })` (`INC-001`..`INC-012`, `G4-...`, etc.; campos reales: `incident_code`, `title`, `status: "P"|"C"`, `severity: "L"|"M"|"H"`, `impact`, `dpo_contact_email`, `rep_email`, `actions[]`).
     - `client.listAudits({ page_size: 200 })` (`AUD-2026-001`..`003`, `audit_code`, `name`, `findings[].{classification, description, evidence, position, actions[]}`).
   - Complementar verificando el sustento normativo y documental en el espejo local: `bun scripts/rag-query.ts "<tema/código>"`.

2. **Deduplicación Determinista de Hallazgos Clonados (`AUD-2026-003`)**:
   - Algunos registros de auditoría (como `AUD-2026-003`) contienen hallazgos/acciones clonados en la respuesta de PIMS.
   - Deduplicar en memoria por clave compuesta `(classification, description, action_plan, responsible)` y reportar explícitamente ambos conteos cuando existan duplicados (ej. *"5 hallazgos únicos de 30 entradas registradas en `AUD-2026-003`"*).

3. **Clasificación Semafórica Estrica (Cero Falsos Verdes)**:
   Evaluar cada acción frente a la fecha actual real:
   - **🔴 ROJO (Vencido / Crítico)**: `is_overdue === true`, o `due_date < hoy` con `status !== "C"`, o incidente `status === "P"` con severidad `"H"` vencida / sin contención.
     - Acción recomendada: Reunión urgente de 5 minutos / escalamiento formal.
   - **🟡 ÁMBAR (Pendiente / En curso / Evidencia incompleta)**: `status !== "C"`, `progress < 100`, `closed_at === null`, o acción reportada cerrada **sin** `evidence` verificable.
     - Acción recomendada: Seguimiento a las 10:00 h (recursos, plazos, evidencia).
   - **🟢 VERDE (Cerrado y Verificado — Regla Estricta)**:
     - **SOLO** se clasifica `🟢 VERDE` cuando se cumplen simultáneamente **todas** las condiciones:
       1. `status === "C"` (o incidente `"C"`)
       2. `progress === 100`
       3. `closed_at !== null` (fecha de cierre real)
       4. Existe evidencia documental no vacía verificable (`evidence` o cita `pims:...`).
     - **PROHIBIDO** clasificar una fila con `status: "P"`, `progress: 0` o `closed_at: null` como `🟢 VERDE`.

4. **Enlace Proactivo con `summons-dispatch`**:
   - Para las filas Rojas o Ámbar identificadas, indicar los correos de contacto reales si existen (`dpo_contact_email`, `rep_email`) y ofrecer preparar los borradores de notificación con `summons-dispatch`.

5. **Publicación de Entregable (`files-sidecar`)**:
   - Si se genera dashboard HTML/PDF/Markdown, publicar vía `POST http://pimsai-files-sidecar:3000/api/publish` y entregar URL exacto:
     `https://files.pimsai.mistercricro8.top:444/p/<slug>`
   - Concluir con: `resultado aquí: https://files.pimsai.mistercricro8.top:444/p/<slug>`.

## 3. Failure Branches

- **PIMS No Disponible**: Reportar endpoint + HTTP status, responder desde `bun scripts/rag-query.ts` y anteponer `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]`.
- **Escrituras de Incidentes**: Recordar que solo la creación/edición (`POST /api/incidents/`, `PATCH /api/incidents/{id}/`) exige prefijo `G4-` y autorización explícita humana.
