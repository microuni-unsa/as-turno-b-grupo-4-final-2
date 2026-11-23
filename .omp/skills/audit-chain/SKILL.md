---
name: audit-chain
description: Trace complete finding -> NC -> corrective action -> verified RAG citation chains across all live PIMS audits and incidents without G4- read filtering.
---

# Skill: audit-chain

Trazabilidad determinista de la cadena completa de auditoría (**Hallazgo → No Conformidad → Acción Correctiva → Evidencia Documental Verificada**) combinando datos vivos de PIMS y citas exactas a nivel de líneas y SHA-256 en el espejo RAG.

## 1. Trigger Patterns

- "Explica el hallazgo `<X>` y muestra su evidencia."
- "Rastrea la cadena de auditoría desde `<AUD-2026-...>` / `<INC-...>` hasta los documentos en PIMS."
- "¿Dónde está la evidencia documental que respalda la acción correctiva?"
- "Verifica si `<hallazgo/NC>` tiene cierre y sustento en PIMS."

## 2. Step Protocol

1. **Lectura Uniforme en PIMS en Vivo (`packages/pims-adapter/client.ts`)**:
   - Obtener todos los registros sin filtro `G4-` de lectura:
     - `client.listAudits({ page_size: 200 })` / `client.getAudit(id)` (campos reales: `audit_code`, `name`, `lead_auditor`, `progress`, `findings[].{classification, description, evidence, position, actions[].{action_plan, responsible, due_date, status, progress, closed_at, is_overdue}}`).
     - `client.listIncidents({ page_size: 200 })` (cuando el hallazgo o acción derive de un incidente `INC-xxx`).
   - Aplicar deduplicación por clave compuesta si existen hallazgos clonados (p. ej. `AUD-2026-003`).

2. **Reconstrucción de la Cadena y Verificación de Cierre**:
   - Encadenar: `Auditoría/Incidente -> Hallazgo (clasificación y descripción) -> Acción Correctiva (responsable, due_date, status, progress, closed_at, is_overdue) -> Campo evidence`.
   - Aplicar la regla estricta de verificación: un eslabón cerrado solo es conforme si `status === "C"`, `progress === 100`, `closed_at !== null`, y posee evidencia documental real.

3. **Localización de Evidencia Verbatim en RAG (`scripts/rag-query.ts`)**:
   - Buscar el respaldo normativo y procedimental en el espejo vectorial:
     - `bun scripts/rag-query.ts "<términos clave del hallazgo>"`
     - Escalado a lectura completa cuando se necesiten secciones contiguas: `bun scripts/rag-query.ts --full --doc <doc.code>`
   - Citar exactamente usando la coordenada canónica + SHA-256:
     `pims:<doc.code>:v<version>:<chunk_id>:lines:<l1>-<l2>`
   - Si en PIMS el campo `evidence` está vacío y no existe documento respaldatorio, reportar la brecha de auditoría explícitamente (`Evidencia faltante / Brecha abierta`).

4. **Publicación de Ficha de Evidencia (`files-sidecar`)**:
   - Cuando se genere informe HTML/PDF, publicar vía `POST http://pimsai-files-sidecar:3000/api/publish` (`content` o `content_base64`) y servir en:
     `https://files.pimsai.mistercricro8.top:444/p/<slug>`
   - Cerrar obligatoriamente con: `resultado aquí: https://files.pimsai.mistercricro8.top:444/p/<slug>`.

## 3. Failure Branches

- **Cadena Incompleta / Sin Evidencia**: Indicar qué eslabón carece de evidencia o cierre verificable; jamás inventar citas `pims:...`.
- **PIMS No Disponible**: Reportar endpoint + HTTP status, reconstruir desde `bun scripts/rag-query.ts` / `CORPUS_MIRROR_DIR`, y rotular `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]`.
