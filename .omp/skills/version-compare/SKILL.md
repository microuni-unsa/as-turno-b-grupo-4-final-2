---
name: version-compare
description: Structural comparison and multi-version evolution analysis of live PIMS PDFs via extracted text diff (pdftotext -layout) and version history, silently informed by RAFA without citing internal files, always publishing an inline unified web app report with real UTC timestamps.
---

# Skill: version-compare

Comparación estructural y análisis evolutivo entre versiones reales de cualquier documento en el PIMS en vivo (`https://unsa.27k.pe`), leyendo todas las versiones disponibles de forma uniforme (sin filtro `G4-` en lectura) y publicando siempre el informe comparativo o de evolución en la consola web unificada.

## 1. Trigger Patterns

- "¿Qué cambió entre la v1 y la v3 de `G4-POL-01`?"
- "Compara versiones del procedimiento de incidentes."
- "¿Por qué se modificó `<sección>` en la última versión?"
- "Muestra la evolución histórica y diferencias de `<documento>`."

## 2. Step Protocol

1. **Lectura Uniforme y Resolución en PIMS en Vivo**:
   - Usar `bun scripts/pims.ts docs list [--search ...] [--compact|--json]` para listar o buscar documentos — sin filtrar fuera documentos ajenos a `G4-`.
   - Resolver identificador o código (`code`) del documento solicitado y consultar su historial de versiones real en PIMS:
     `bun scripts/pims.ts docs versions <id_or_code> [--compact|--json]` (retorna arreglo con `id`, `document`, `version`, `file`, `change_summary`, `created_at`, `created_by`, `created_by_name`).
   - Para inspeccionar metadatos detallados del documento: `bun scripts/pims.ts docs get <id_or_code> [--compact|--json]`.

2. **Comparación Estructural de Versiones (Texto Extraído de PDFs Reales)**:
   - **Prohibición**: No asumir que `corpus_g4_src/` existe en el contenedor runtime ni que el PDF fue generado con Typst, y jamás decodificar binarios `.pdf` directamente como UTF-8.
   - Ejecutar la comparación directa mediante la herramienta canónica:
     `bun scripts/pims.ts diff <code_or_id> --from <v1> --to <v2>`
     (Para análisis evolutivo o línea de tiempo multiversión `v1 → v2 → v3 → ...`, ejecutar diffs consecutivos entre cada par de versiones y consolidar el texto extraído con `pdftotext -layout -nopgbrk` / `bun scripts/pims.ts mirror read <code_or_id> --ver <v>`).
   - Si se requiere descargar el PDF binario para inspección o OCR (en PDFs escaneados): `bun scripts/pims.ts docs download <id_or_code> [--ver <v>] [--out <path>]`.

3. **Síntesis de Racional con Historial Real + `RAFA.md` Silencioso**:
   - Extraer `change_summary` de `bun scripts/pims.ts docs versions <id_or_code>`, la tabla interna de Control de Cambios extraída del propio PDF y la fecha de vigencia (`validity`); señalar explícitamente si la fecha de vigencia de la versión evaluada ya expiró frente a la fecha actual.
   - Citar fragmentos con el formato canónico `pims:<doc.code>:v<version>:<chunk_id>:<lines>` cuando se respalde con texto del espejo.
   - Si existe `molds/<category>/RAFA.md`, **leerlo únicamente como guía interna silenciosa** para comprender la evolución normativa esperada del tipo de documento.
   - **REGLA ESTRICTA DE SILENCIO**: **NUNCA mencionar `RAFA.md`, `RAFA`, nombres de archivos de moldes ni rutas internas (`molds/...`, `corpus_g4_src/`, `scripts/`) en la respuesta al usuario ni en el informe publicado.** Atribuir toda explicación exclusivamente al historial registrado en PIMS, tabla de revisiones del documento y cláusulas ISO/IEC 27701:2025.
   - **Nota de Evidencia de Capacitación**: `/api/trainings/` retorna HTTP 403 para `grupob4`; las evidencias de capacitación viven en documentos `G4-REG-CAP-*` / `G4-PRG-CAP-*`.

4. **Publicación de Informe Visual (Consola Web Unificada) — OBLIGATORIA (Diffs y Evoluciones Multiversión)**:
   - Generar **SIEMPRE** el informe (HTML o Markdown en español ejecutivo limpio; PDF solo si el usuario lo pide) tanto para comparaciones puntuales (`vX` vs `vY`) como para **TODAS las consultas de evolución multiversión o línea de tiempo** (`v1 → v2 → v3...`), y publicarlo mediante `bun scripts/pims.ts publish --slug <slug> --file <path> [--filename <name>]`:
     `https://demo.pimsai.mistercricro8.top:444/api/files/<slug>` (el chat muestra automáticamente la tarjeta inline **Vista previa / Descargar**).
   - **Convención de slug con timestamp UTC real de shell (PROHIBIDO inventar horas fijas)**:
     `SLUG="version-compare-<code_slug>-$(date -u +%Y%m%d-%H%M)"`
     (Jamás usar timestamps ficticios como `1200`, `0555` o `1430`).
   - Responder inline un resumen ejecutivo en español + cerrar con la línea exacta: `resultado aquí: https://demo.pimsai.mistercricro8.top:444/api/files/<slug>`.
   - **Nunca** usar `https://<slug>.pimsai.mistercricro8.top:444` directamente para entregas de archivos estáticos; la ruta correcta de entregables publicados en la consola web es siempre `https://demo.pimsai.mistercricro8.top:444/api/files/<slug>`.

## 3. Failure Branches

- **Versión Faltante**: Indicar taxativamente las versiones realmente presentes en `bun scripts/pims.ts docs versions <id_or_code>` y proponer comparar las disponibles.
- **PIMS No Disponible**: Reportar endpoint y HTTP status exactos devueltos por `scripts/pims.ts`; ejecutar comparación alternativa leyendo el texto extraído desde el espejo local:
  `bun scripts/pims.ts mirror read <code_or_id> --ver <v1>` y `bun scripts/pims.ts mirror read <code_or_id> --ver <v2>` (o `CORPUS_MIRROR_DIR/<doc.code>/v<ver>.txt`) complementado con búsqueda semántica `bun scripts/rag-query.ts "<query>"`, etiquetando `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]`.
