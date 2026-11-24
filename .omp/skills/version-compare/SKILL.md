---
name: version-compare
description: Structural comparison of live PIMS document versions using extracted PDF text (bun scripts/pims.ts diff) and PIMS version history, using RAFA.md silently without citing internal prompt files.
---

# Skill: version-compare

Comparación estructural y análisis evolutivo entre versiones reales de cualquier documento en el PIMS en vivo (`https://unsa.27k.pe`), leyendo todas las versiones disponibles de forma uniforme (sin filtro `G4-` en lectura).

## 1. Trigger Patterns

- "¿Qué cambió entre la v1 y la v3 de `G4-POL-01`?"
- "Compara versiones del procedimiento de incidentes."
- "¿Por qué se modificó `<sección>` en la última versión?"
- "Muestra la evolución y diferencias de `<documento>`."

## 2. Step Protocol

1. **Lectura Uniforme y Resolución en PIMS en Vivo**:
   - Usar `bun scripts/pims.ts docs list [--search ...] [--compact|--json]` para listar o buscar documentos — sin filtrar fuera documentos ajenos a `G4-`.
   - Resolver identificador o código (`code`) del documento solicitado y consultar su historial de versiones real en PIMS:
     `bun scripts/pims.ts docs versions <id_or_code> [--compact|--json]` (retorna arreglo con `id`, `document`, `version`, `file`, `change_summary`, `created_at`, `created_by`, `created_by_name`).
   - Para inspeccionar metadatos detallados del documento: `bun scripts/pims.ts docs get <id_or_code> [--compact|--json]`.

2. **Comparación Estructural de Versiones (Texto Extraído de PDFs Reales)**:
   - **Prohibición**: No asumir que `corpus_g4_src/` existe en el contenedor runtime ni decodificar binarios `.pdf` directamente como UTF-8.
   - Ejecutar la comparación directa mediante la herramienta canónica:
     `bun scripts/pims.ts diff <code_or_id> --from <v1> --to <v2>`
   - La herramienta extrae automáticamente el texto de los PDFs con `pdftotext` (nunca binario PDF en crudo) y computa las diferencias exactas línea por línea y bloque por bloque entre versiones.
   - Si se requiere descargar el PDF binario para inspección: `bun scripts/pims.ts docs download <id_or_code> [--ver <v>] [--out <path>]`.

3. **Síntesis de Racional con Historial Real + `RAFA.md` Silencioso**:
   - Extraer `change_summary` de `bun scripts/pims.ts docs versions <id_or_code>` y la tabla interna de Control de Cambios extraída del propio PDF.
   - Si existe `molds/<category>/RAFA.md`, **leerlo únicamente como guía interna silenciosa** para comprender la evolución normativa esperada del tipo de documento.
   - **REGLA ESTRICTA DE SILENCIO**: **NUNCA mencionar `RAFA.md`, `RAFA`, nombres de archivos de moldes ni rutas internas (`molds/...`) en la respuesta al usuario o en el informe publicado.** Atribuir toda explicación exclusivamente al historial registrado en PIMS (`change_summary`), tabla de revisiones del documento y cláusulas ISO/IEC 27701:2025.
   - **Nota de Evidencia de Capacitación**: `/api/trainings/` retorna HTTP 403 para `grupob4`; las evidencias de capacitación viven en documentos `G4-REG-CAP-*` / `G4-PRG-CAP-*`.

4. **Publicación de Informe Visual (`files-sidecar`) — OBLIGATORIA**:
   - Generar SIEMPRE el informe comparativo (HTML o Markdown preferido; PDF si el usuario lo pide) y publicarlo mediante `bun scripts/pims.ts publish --slug <slug> --file <path> [--filename <name>]`:
     `https://files.pimsai.mistercricro8.top:444/p/<slug>`
   - Convención de slug: `version-compare-<code_slug>-<yyyymmdd-hhmm>` (ej. `version-compare-g4-pol-01-20261123-1430`). Responder inline un resumen + cerrar con la línea exacta: `resultado aquí: https://files.pimsai.mistercricro8.top:444/p/<slug>`.
   - **Nunca** usar `https://<slug>.pimsai.mistercricro8.top:444` directamente para entregas de archivos estáticos; la ruta correcta de `files-sidecar` es siempre `https://files.pimsai.mistercricro8.top:444/p/<slug>`.

## 3. Failure Branches

- **Versión Faltante**: Indicar taxativamente las versiones realmente presentes en `bun scripts/pims.ts docs versions <id_or_code>` y proponer comparar las disponibles.
- **PIMS No Disponible**: Reportar endpoint y HTTP status exactos devueltos por `scripts/pims.ts`; ejecutar comparación alternativa leyendo el texto extraído desde el espejo local:
  `bun scripts/pims.ts mirror read <code_or_id> --ver <v1>` y `bun scripts/pims.ts mirror read <code_or_id> --ver <v2>` (o `CORPUS_MIRROR_DIR/<doc.code>/v<ver>.txt`) complementado con búsqueda semántica `bun scripts/rag-query.ts "<query>"`, etiquetando `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]`.
