---
name: incident-ops
description: Query all live PIMS incidents and audit findings without G4- read filtering, compute verified RAG operational tables with deduplicated Findings vs Actions counts, enforce a two-turn human confirmation gate on incident writes, and cross-offer summons-dispatch.
---

# Skill: incident-ops

Consulta y gestión operativa de incidentes, hallazgos de auditoría, no conformidades y acciones correctivas con clasificación semafórica **Rojo / Ámbar / Verde** bajo criterios estrictos de verificación auditada, más compuerta humana de dos turnos para escrituras de incidentes.

## 1. Trigger Patterns

- "¿Cuál es el estado de los incidentes y no conformidades?"
- "Muestra el semáforo de acciones correctivas."
- "¿Qué acciones están vencidas o pendientes?"
- "Revisa el cumplimiento de auditorías e incidentes en PIMS."
- "Registra / actualiza / adjunta evidencia al incidente `G4-...`."

## 2. Step Protocol

1. **Lectura Uniforme en PIMS en Vivo + RAG (`bun scripts/pims.ts`)**:
   - Consultar **todos** los incidentes y auditorías del sistema (sin filtrar por `G4-` en lectura):
     - `bun scripts/pims.ts incidents list [--status P|C] [--severity L|M|H] [--search ...] [--compact|--json]` (`INC-001`..`INC-012`, `G4-...`, etc.; campos reales: `incident_code`, `title`, `status: "P"|"C"`, `severity: "L"|"M"|"H"`, `impact`, `dpo_contact_name`, `dpo_contact_email`, `dpo_contact_phone`, `rep_email`, `actions[]`, `attachments[]`).
     - `bun scripts/pims.ts incidents get <id_or_code> --include-emails [--with-history] [--compact|--json]` para obtener detalles y contactos directos. Nota: `--json` omite `history` por defecto; pasar `--with-history` explícitamente cuando se requiera auditar la traza histórica completa.
     - `bun scripts/pims.ts audits list --dedupe [--compact|--json]` (`AUD-2026-001`..`003`, `audit_code`, `name`, `lead_auditor`, `progress`, `findings[].{classification, description, evidence, position, actions[]}`).
     - `bun scripts/pims.ts audits get <id_or_code> --dedupe [--open-only] [--overdue-only] [--compact|--json]`.
   - Complementar verificando el sustento normativo y documental en el espejo local: `bun scripts/rag-query.ts "<tema/código>"`. Para consultar el texto completo extraído de un documento de respaldo, utilizar `bun scripts/pims.ts mirror read <código>` (verificando también si la fecha de vigencia `validity` del documento citado ya expiró frente a la fecha actual).
   - **Nota de Evidencia de Capacitación**: Recordar que `/api/trainings/` retorna HTTP 403 para `grupob4`; las evidencias de capacitación viven en documentos subidos `G4-REG-CAP-*` / `G4-PRG-CAP-*`.

2. **Deduplicación Determinista y Conteos Separados (`Findings` vs `Actions`)**:
   - Algunos registros de auditoría (como `AUD-2026-003`) contienen hallazgos/acciones clonados en la respuesta de PIMS.
   - Utilizar `--dedupe` en `bun scripts/pims.ts audits list --dedupe` o `bun scripts/pims.ts audits get <id_or_code> --dedupe`, que aplica deduplicación determinista por clave compuesta `(classification, description, action_plan, responsible)`.
   - **Regla de Reporte Exacto**: Informar **por separado** los conteos exactos de **`Findings`** (hallazgos únicos vs totales brutos) y **`Actions`** (acciones correctivas únicas vs totales), sin confundir ni sumar ambas métricas (ej. *"5 hallazgos únicos (Findings) y 5 acciones correctivas (Actions) de 30 entradas registradas en `AUD-2026-003`"*).

3. **Clasificación Semafórica Estricta (Cero Falsos Verdes)**:
   Evaluar cada acción frente a la fecha actual real:
   - **🔴 ROJO (Vencido / Crítico)**: `is_overdue === true`, o `due_date < hoy` con `status !== "C"`, o incidente `status === "P"` con severidad `"H"` vencida / sin contención.
     - Acción recomendada: Reunión urgente de 5 minutos / escalamiento formal.
   - **🟡 ÁMBAR (Pendiente / En curso / Evidencia incompleta)**: `status !== "C"`, `progress < 100`, `closed_at === null`, o acción reportada cerrada **sin** `evidence` verificable (o vinculada a una CAPA aún abierta en auditoría).
     - Acción recomendada: Seguimiento a las 10:00 h (recursos, plazos, evidencia).
   - **🟢 VERDE (Cerrado y Verificado — Regla Estricta)**:
     - **SOLO** se clasifica `🟢 VERDE` cuando se cumplen simultáneamente **todas** las condiciones:
       1. `status === "C"` (o incidente `"C"`)
       2. `progress === 100`
       3. `closed_at !== null` (fecha de cierre real)
       4. Existe evidencia documental no vacía verificable (`evidence` o cita `pims:<doc.code>:v<version>:<chunk_id>:<lines>`).
     - **PROHIBIDO** clasificar una fila con `status: "P"`, `progress: 0`, `closed_at: null` o evidencia faltante como `🟢 VERDE`.

4. **Enlace Proactivo con Notificaciones de Seguimiento**:
   - Para las filas Rojas o Ámbar identificadas, indicar los correos de contacto reales obtenidos con `--include-emails` (`dpo_contact_email`, `rep_email`) y ofrecer en español ejecutivo preparar los borradores de notificación de seguimiento (sin mencionar nombres internos de skills ni comandos CLI).

5. **Publicación de Entregable (Consola Web Unificada) — OBLIGATORIA**:
   - Generar SIEMPRE el tablero semafórico como dashboard (HTML o Markdown, en español ejecutivo limpio sin rutas ni comandos internos) y publicarlo mediante `bun scripts/pims.ts publish --slug <slug> --file <path> [--filename <name>]`:
     `https://demo.pimsai.mistercricro8.top:444/api/files/<slug>` (el chat muestra automáticamente la tarjeta inline **Vista previa / Descargar**).
   - Convención de slug con timestamp UTC real de shell: `incident-ops-$(date -u +%Y%m%d-%H%M)`. Responder inline el resumen + concluir con: `resultado aquí: https://demo.pimsai.mistercricro8.top:444/api/files/<slug>`.

## 3. Escrituras de Incidentes — Compuerta Humana Obligatoria de 2 Turnos

Toda creación, actualización o adjunto de incidente (`incidents create`, `incidents update`, `incidents attach`) exige código y título con prefijo **`G4-`** (`assertG4WriteCode`) y **compuerta de 2 turnos**:
- **Turno 1 (Simulación `--dry-run` + Vista Previa + HALT)**:
  - Ejecutar el comando con `--dry-run` (sin `--confirm`):
    `bun scripts/pims.ts incidents create --code G4-... --title "G4-..." --description "..." --severity L|M|H|C --status O|P|C --incident-type <tipo> --involves-personal-data <true|false> --dry-run`
    (o `incidents update <id_or_code> ... --dry-run` / `incidents attach <id_or_code> --file <path> --dry-run`).
  - Mostrar al usuario el payload completo en español ejecutivo —incluyendo obligatoriamente `--incident-type`, `--involves-personal-data` y el título/código con prefijo `G4-`— y **DETENERSE** solicitando confirmación explícita que nombre el código del incidente. **JAMÁS** pasar `--confirm` en el Turno 1.
- **Turno 2 (`--confirm` Solo Tras Autorización Explícita Nominal)**:
  - Únicamente después de que el usuario confirme explícitamente nombrando el incidente (ej. `"confirmo crear G4-INC-..."` o `"confirmo actualizar G4-INC-..."`), ejecutar el mismo comando sustituyendo `--dry-run` por `--confirm`.

## 4. Failure Branches

- **PIMS No Disponible**: Reportar endpoint + HTTP status devuelto por `scripts/pims.ts`, responder desde `bun scripts/pims.ts mirror read <código>` y/o búsqueda semántica `bun scripts/rag-query.ts "<tema>"`, anteponiendo `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]`.
- **Código o Título sin `G4-`**: Abortar antes de cualquier mutación (`TenantGuardViolationError`) y solicitar código válido con prefijo `G4-`.
