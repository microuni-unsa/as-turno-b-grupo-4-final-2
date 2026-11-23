---
name: cascade
description: Record UNSA university facts, scan all PIMS documents uniformly for cross-cutting impact, propose remake batches, render via copy-then-fill staging, and gate PIMS uploads on human approval.
---

# Skill: cascade

Evaluación y propagación controlada de cambios institucionales (*university facts*) a través de múltiples documentos del SGPI mediante **Copy-Then-Fill** sobre moldes parametrizados en staging, escaneo completo sobre PIMS y espejo RAG, y **compuerta de aprobación humana** previa a cualquier escritura en PIMS.

## 1. Trigger Patterns

- "La UNSA aprobó `<hecho universitario>`; evalúa y actualiza los documentos afectados."
- "Cambió `<autoridad / sede / reglamento / sistema>`; aplica el impacto en cascada."
- "Propón qué documentos del PIMS necesitan nueva versión por `<cambio>`."

## 2. Step Protocol

1. **Registro Fechado del Hecho Universitario**:
   - Registrar el nuevo hecho en `university-facts/<fact_slug>.json` (con `fact_id`, `date`, `source`, `title`, `scope_impact`).

2. **Escaneo de Impacto Uniforme (Sin Filtro `G4-` en Lectura)**:
   - Consultar todos los documentos vivos en PIMS (`client.listDocuments({ page_size: 200 })`) y escanear texto completo en el espejo local:
     - `bun scripts/rag-query.ts "<palabras clave del hecho>" --limit 20`
     - Revisar textos íntegros en `CORPUS_MIRROR_DIR/<doc.code>/v<n>.txt` o vía `bun scripts/rag-query.ts --full --doc <doc.code>` (nunca depender de `corpus_g4_src/`).
   - Identificar claramente:
     - Documentos `G4-*` impactados (candidatos a nueva versión, especificando cambio menor vs mayor).
     - Documentos **NO** afectados y su justificación técnica.

3. **Compuerta de Aprobación del Lote Propuesto**:
   - Presentar matriz al usuario: `Código | Título | Versión PIMS Actual -> Siguiente | Tipo (MENOR/MAYOR) | Impacto`.
   - **Detenerse** hasta que el usuario apruebe el lote (`"procede"` o subconjunto ajustado).

4. **Compilación Copy-Then-Fill por Documento Aprobado**:
   - Para cada documento aprobado:
     - Seguir el protocolo `directed-version` paso a paso:
       1. Verificar `client.getDocumentVersions(doc.id)` para alinear versión PDF con siguiente entero de PIMS (ej. `"3.00"` -> PDF `"4.0"` / PIMS `"4.00"`).
       2. Leer texto completo vigente (`CORPUS_MIRROR_DIR/<doc.code>/v<n>.txt` o PDF PIMS vía `extractNormalizedText`), inspeccionar firma exacta en `molds/<category>/mold*.typ`, y consultar `molds/<category>/RAFA.md` **silenciosamente (nunca mencionarlo)**.
       3. Copiar `molds/common/` a `/tmp/pims-staging/common/` y `molds/<category>/*.typ` a `/tmp/pims-staging/<doc.code>-v<next>/`.
       4. Redactar invocador nuevo incorporando el hecho universitario, historial de revisiones actualizado y compilar con `typst compile`.
   - Publicar vistas previas o paquete compilado vía `POST http://pimsai-files-sidecar:3000/api/publish` (`content_base64`) y confirmar autorización explícita antes de subir lotes a PIMS si los cambios son sustantivos.

5. **Carga a PIMS, Sincronización y Reporte Final**:
   - Subir con `client.documents.addDocumentVersion(doc.id, { file, fileName, change_summary })` (solo códigos `G4-`, `fileName` explícito obligatorio).
   - Ejecutar `bun scripts/sync-pims-truth.ts` para actualizar `CORPUS_MIRROR_DIR/<doc.code>/` (`v<n>.pdf` + `v<n>.txt`) y `pimsai-db`.
   - Entregar informe final vía `files-sidecar` (`https://files.pimsai.mistercricro8.top:444/p/<slug>`) con enlaces y SHA-256.

## 3. Failure Branches

- **Usuario Excluye Documentos**: Reajustar el lote sin tocar los excluidos.
- **Error Parcial en Carga**: Registrar exactamente qué documento falló (endpoint + HTTP status) sin perder los demás ni silenciar errores.
