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

1. **Lectura Uniforme en PIMS en Vivo + RAG (`bun scripts/pims.ts`)**:
   - Consultar **todos** los incidentes y auditorías del sistema (sin filtrar por `G4-` en lectura):
     - `bun scripts/pims.ts incidents list [--status P|C] [--severity L|M|H] [--search ...] [--compact|--json]` (`INC-001`..`INC-012`, `G4-...`, etc.; campos reales: `incident_code`, `title`, `status: "P"|"C"`, `severity: "L"|"M"|"H"`, `impact`, `dpo_contact_name`, `dpo_contact_email`, `dpo_contact_phone`, `rep_email`, `actions[]`, `attachments[]`, `history[]`).
     - `bun scripts/pims.ts incidents get <id_or_code> --include-emails [--compact|--json]` para obtener detalles y contactos directos.
     - `bun scripts/pims.ts audits list --dedupe [--compact|--json]` (`AUD-2026-001`..`003`, `audit_code`, `name`, `lead_auditor`, `progress`, `findings[].{classification, description, evidence, position, actions[]}`).
     - `bun scripts/pims.ts audits get <id_or_code> --dedupe [--open-only] [--overdue-only] [--compact|--json]`.
   - Complementar verificando el sustento normativo y documental en el espejo local: `bun scripts/rag-query.ts "<tema/código>"`. Para consultar el texto completo extraído de un documento de respaldo, utilizar `bun scripts/pims.ts mirror read <código>`.
   - **Nota de Evidencia de Capacitación**: Recordar que `/api/trainings/` retorna HTTP 403 para `grupob4`; las evidencias de capacitación viven en documentos subidos `G4-REG-CAP-*` / `G4-PRG-CAP-*`.

2. **Deduplicación Determinista de Hallazgos Clonados (`AUD-2026-003`)**:
   - Algunos registros de auditoría (como `AUD-2026-003`) contienen hallazgos/acciones clonados en la respuesta de PIMS.
   - Utilizar el parámetro `--dedupe` en `bun scripts/pims.ts audits list --dedupe` o `bun scripts/pims.ts audits get <id_or_code> --dedupe`, que aplica deduplicación determinista por clave compuesta `(classification, description, action_plan, responsible)` y reporta explícitamente ambos conteos cuando existan duplicados (ej. *"5 hallazgos únicos de 30 entradas registradas en `AUD-2026-003`"*).

3. **Clasificación Semafórica Estricta (Cero Falsos Verdes)**:
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
   - Para las filas Rojas o Ámbar identificadas, indicar los correos de contacto reales obtenidos con `--include-emails` (`dpo_contact_email`, `rep_email`) y ofrecer preparar los borradores de notificación con `summons-dispatch`.

5. **Publicación de Entregable (`files-sidecar`) — OBLIGATORIA**:
   - Generar SIEMPRE el tablero semafórico como dashboard (HTML o Markdown) y publicarlo mediante `bun scripts/pims.ts publish --slug <slug> --file <path> [--filename <name>]`:
     `https://files.pimsai.mistercricro8.top:444/p/<slug>`
   - Convención de slug: `incident-ops-<yyyymmdd-hhmm>`. Responder inline el resumen RAG + concluir con: `resultado aquí: https://files.pimsai.mistercricro8.top:444/p/<slug>`.

## 3. Failure Branches & Incident Writes

- **PIMS No Disponible**: Reportar endpoint + HTTP status devuelto por `scripts/pims.ts`, responder desde `bun scripts/pims.ts mirror read <código>` y/o búsqueda semántica `bun scripts/rag-query.ts "<tema>"`, anteponiendo `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]`.
- **Escrituras de Incidentes**: Mutaciones de incidentes ejecutadas mediante `bun scripts/pims.ts incidents create ... --confirm` o `bun scripts/pims.ts incidents update <id_or_code> ... --confirm`. Se aplica estrictamente la compuerta de aislamiento de tenant `G4-`: el código del incidente DEBE iniciar con el prefijo `G4-` (`assertG4WriteCode`), fallando antes de cualquier llamada HTTP si no cumple el prefijo, y requiere confirmación explícita humana (`--confirm`; por defecto corre en modo seguro `--dry-run`).
