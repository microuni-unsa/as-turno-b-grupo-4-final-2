---
name: audit-chain
description: Trace complete finding -> NC -> corrective action -> verified RAG citation chains across all live PIMS audits and incidents without G4- read filtering, reporting separate Findings vs Actions counts, strict consistent traffic lights, and real UTC timestamp slugs.
---

# Skill: audit-chain

Trazabilidad determinista de la cadena completa de auditoría (**Hallazgo → No Conformidad → Acción Correctiva → Evidencia Documental Verificada**) combinando datos vivos de PIMS y citas exactas en el espejo RAG.

## 1. Trigger Patterns

- "Explica el hallazgo `<X>` y muestra su evidencia."
- "Rastrea la cadena de auditoría desde `<AUD-2026-...>` / `<INC-...>` hasta los documentos en PIMS."
- "¿Dónde está la evidencia documental que respalda la acción correctiva?"
- "Verifica si `<hallazgo/NC>` tiene cierre y sustento en PIMS."

## 2. Step Protocol

1. **Lectura Uniforme en PIMS en Vivo (`bun scripts/pims.ts`)**:
   - Obtener todos los registros sin filtro `G4-` de lectura:
     - `bun scripts/pims.ts audits list [--dedupe] [--compact|--json]`
     - `bun scripts/pims.ts audits get <id_or_code> [--dedupe] [--overdue-only] [--open-only] [--compact|--json]` (campos reales: `audit_code`, `name`, `lead_auditor`, `progress`, `findings[].{classification, description, evidence, position, actions[].{action_plan, responsible, due_date, status, progress, closed_at, is_overdue}}`).
     - `bun scripts/pims.ts incidents list [--status P|C] [--severity L|M|H] [--compact|--json]` / `bun scripts/pims.ts incidents get <id_or_code> [--include-emails] [--with-history] [--compact|--json]` (cuando el hallazgo o acción derive de un incidente `INC-xxx` o `G4-...`).
   - Aplicar deduplicación nativa con `--dedupe` ante hallazgos clonados (p. ej. `AUD-2026-003`), y reportar **por separado** los conteos exactos de **`Findings`** y **`Actions`** devueltos por el CLI (nunca mezclar ni igualar ambos conteos sin verificar).

2. **Reconstrucción de la Cadena y Verificación Semafórica Estricta**:
   - Encadenar: `Auditoría/Incidente -> Hallazgo (clasificación y descripción) -> Acción Correctiva (responsable, due_date, status, progress, closed_at, is_overdue) -> Campo evidence -> Documento/Cita PIMS`.
   - **Consistencia Semafórica Estricta (Semántica `isActionClosedVerified`)**:
     - Usar `bun scripts/pims.ts audits get <id_or_code> --open-only` o `--overdue-only` para filtrar acciones no conformes o no cerradas.
     - Un eslabón, incidente o acción se clasifica **`🟢 VERDE` ÚNICAMENTE** si cumple simultáneamente:
       1. `status === "C"` (estado cerrado)
       2. `progress === 100` (progreso al 100%)
       3. `closed_at !== null` (fecha de cierre real registrada)
       4. Posee evidencia documental no vacía y verificable en `evidence` o cita documental `pims:<doc.code>:v<version>:<chunk_id>:<lines>`
       5. Ninguna CAPA u otro hallazgo vinculado en la cadena permanece abierto ni carente de evidencia (ej.: si `INC-001` figura en cadena con una CAPA abierta en `AUD-2026-002` o sin evidencia documental verificable, mantener estrictamente **`🟡 ÁMBAR`** o **`🔴 ROJO`** según vencimiento — **JAMÁS `🟢 VERDE`**).
     - Si `progress < 100`, `status !== "C"`, `closed_at === null` o falta evidencia, clasificar como **`🔴 ROJO`** (si vencido/crítico) o **`🟡 ÁMBAR`** (pendiente/evidencia incompleta), nunca verde.

3. **Localización de Evidencia Verbatim (`scripts/pims.ts mirror read` / `scripts/rag-query.ts`)**:
   - Para texto completo extraído del documento respaldatorio:
     - `bun scripts/pims.ts mirror read <doc.code> [--ver <v>]`
   - Para búsqueda semántica de conceptos y normativas en el espejo vectorial:
     - `bun scripts/rag-query.ts "<términos clave del hallazgo>"`
   - Citar exactamente usando la coordenada canónica:
     `pims:<doc.code>:v<version>:<chunk_id>:<lines>` (ej. `pims:G4-SOA-01:v4.00:5:L114-L133`).
   - Verificar también la fecha de vigencia (`validity`) de los documentos citados como evidencia y señalar si alguno está vencido frente a la fecha actual.
   - Si en PIMS el campo `evidence` está vacío y no existe documento respaldatorio, reportar la brecha de auditoría explícitamente (`Evidencia faltante / Brecha abierta`).
   - **Nota de Evidencias de Capacitación**: `/api/trainings/` retorna HTTP 403 para `grupob4`; las evidencias de capacitación viven en documentos subidos `G4-REG-CAP-*` / `G4-PRG-CAP-*` (e.g., `G4-REG-CAP-01`, `G4-PRG-CAP-01`).

4. **Publicación de Ficha de Evidencia (`files-sidecar`) — OBLIGATORIA**:
   - Generar SIEMPRE la ficha de evidencia (HTML o Markdown en español ejecutivo limpio, sin rutas ni comandos internos: cadena hallazgo→NC→acción→evidencia con citas `pims:`) y publicarla vía `bun scripts/pims.ts publish --slug <slug> --file <path> [--filename <name>]`:
     `https://files.pimsai.mistercricro8.top:444/p/<slug>`
   - **Convención de slug con timestamp UTC real de shell (PROHIBIDO inventar horas fijas)**:
     `SLUG="audit-chain-<audit_slug>-$(date -u +%Y%m%d-%H%M)"`
   - Responder inline el veredicto + cerrar obligatoriamente con: `resultado aquí: https://files.pimsai.mistercricro8.top:444/p/<slug>`.

## 3. Failure Branches

- **Cadena Incompleta / Sin Evidencia**: Indicar qué eslabón carece de evidencia o cierre verificable; jamás inventar citas `pims:...`.
- **PIMS No Disponible**: Reportar endpoint + HTTP status devuelto por `pims.ts`, reconstruir desde `bun scripts/pims.ts mirror read <doc.code>` y `bun scripts/rag-query.ts "<términos>"`, y rotular `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]`.
