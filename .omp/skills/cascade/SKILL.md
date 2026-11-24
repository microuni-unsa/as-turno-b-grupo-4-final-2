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
   - Consultar todos los documentos vivos en PIMS (`bun scripts/pims.ts docs list --compact`) y escanear texto completo en el espejo local:
     - `bun scripts/rag-query.ts "<palabras clave del hecho>" --limit 20`
     - Revisar textos íntegros en `CORPUS_MIRROR_DIR/<doc.code>/v<n>.txt` o vía `bun scripts/pims.ts mirror read <doc.code>` (nunca depender de `corpus_g4_src/`).
   - Identificar claramente:
     - Documentos `G4-*` impactados (candidatos a nueva versión, especificando cambio menor vs mayor).
     - Documentos **NO** afectados y su justificación técnica.

3. **Compuerta 1 — Aprobación del Lote Propuesto (compilar+preview)**:
   - Presentar matriz al usuario: `Código | Título | Versión PIMS Actual -> Siguiente | Tipo (MENOR/MAYOR) | Impacto`.
   - **Detenerse** hasta que el usuario apruebe el lote (`"procede"` o subconjunto ajustado). Esta aprobación autoriza compilar y publicar previews — NUNCA subir a PIMS.

4. **Compilación Copy-Then-Fill por Documento Aprobado + Compuerta 2 (subida)**:
   - Para cada documento aprobado:
     - Seguir el protocolo `directed-version` paso a paso:
       1. Verificar versiones en PIMS (`bun scripts/pims.ts docs versions <id_or_code>`) para alinear versión PDF con siguiente entero de PIMS (ej. `"3.00"` -> PDF `"4.0"` / PIMS `"4.00"`).
       2. Leer texto completo vigente (`bun scripts/pims.ts mirror read <doc.code>` o `CORPUS_MIRROR_DIR/<doc.code>/v<n>.txt`), inspeccionar firma exacta en `molds/<category>/mold*.typ`, y consultar `molds/<category>/RAFA.md` **silenciosamente (nunca mencionarlo)**.
       3. Copiar `molds/common/` a `/tmp/pims-staging/common/` y `molds/<category>/*.typ` a `/tmp/pims-staging/<doc.code>-v<next>/`.
       4. Redactar invocador nuevo incorporando el hecho universitario, historial de revisiones actualizado y compilar con `typst compile`.
   - Publicar vistas previas o paquete compilado vía `bun scripts/pims.ts publish --slug <slug> --file <path>` (retorna `https://files.pimsai.mistercricro8.top:444/p/<slug>`) y **DETENERSE de nuevo**: la compuerta de preview es SEPARADA de la compuerta de subida. Solo subir tras SEGUNDA confirmación explícita que nombre documento+versión (`"confirmo subida de G4-XXX v4.00"` o equivalente).

5. **Carga a PIMS, Sincronización y Reporte Final**:
   - Subir con `bun scripts/pims.ts docs add-version <id_or_code> --file <path.pdf> --file-name <name.pdf> --summary "..." --confirm` (solo códigos `G4-`, `--file-name` explícito obligatorio).
   - Ejecutar `bun scripts/pims.ts mirror sync` para actualizar `CORPUS_MIRROR_DIR/<doc.code>/` (`v<n>.pdf` + `v<n>.txt`) y `pimsai-db`.
   - Entregar informe final con delivery link vía `bun scripts/pims.ts publish --slug <slug> --file <path>` (`https://files.pimsai.mistercricro8.top:444/p/<slug>`) con enlaces y SHA-256.

## 3. Failure Branches

- **Usuario Excluye Documentos**: Reajustar el lote sin tocar los excluidos.
- **Error Parcial en Carga**: Registrar exactamente qué documento falló (endpoint + HTTP status) sin perder los demás ni silenciar errores.
- **PIMS No Disponible**: Si PIMS no responde, consultar el espejo pgvector vía `bun scripts/rag-query.ts "<consulta>"` o `bun scripts/pims.ts mirror read <doc.code>` anteponiendo `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]`.
