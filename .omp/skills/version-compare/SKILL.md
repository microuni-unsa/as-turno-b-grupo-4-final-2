---
name: version-compare
description: Structural comparison of live PIMS document versions using extracted PDF text (packages/rag-mirror/diff.ts) and PIMS version history, using RAFA.md silently without citing internal prompt files.
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
   - Usar `PimsClient` (`packages/pims-adapter/client.ts`) para listar o buscar documentos (`listDocuments({ page_size: 200 })`) — sin filtrar fuera documentos ajenos a `G4-`.
   - Resolver `id` y código (`code`) del documento solicitado y consultar su historial real en PIMS:
     `client.getDocumentVersions(doc.id)` (retorna arreglo con `id`, `version`, `file`, `change_summary`, `created_at`, `created_by_name`).

2. **Obtención y Extracción de PDFs Reales desde PIMS (Nunca `corpus_g4_src/` ni UTF-8 sobre `%PDF-`)**:
   - **Prohibición**: No asumir que `corpus_g4_src/` existe en el contenedor runtime ni decodificar binarios `.pdf` directamente como UTF-8.
   - Descargar los PDFs reales desde `ver.file` de PIMS (con headers `Authorization: Bearer ${token}` y `X-PIMS-Schema: ${client.schema}`) o leer la copia sincronizada en `CORPUS_MIRROR_DIR/<doc.code>/` (`v<ver>.txt` / `v<ver>.pdf` extraído con `extractNormalizedText` de `packages/rag-mirror/pdf.ts`).
   - Guardar en `/tmp/diff-<doc.code>/` o usar `compareVersions(...)` de `packages/rag-mirror/diff.ts` con un `fetcher` conectado a `extractNormalizedText`, calculando diferencias exactas línea por línea y chunk por chunk (`vA` vs `vB`).

3. **Síntesis de Racional con Historial Real + `RAFA.md` Silencioso**:
   - Extraer `change_summary` de `GET /api/documents/{id}/versions/` y la tabla interna de Control de Cambios extraída del propio PDF.
   - Si existe `molds/<category>/RAFA.md`, **leerlo únicamente como guía interna silenciosa** para comprender la evolución normativa esperada del tipo de documento.
   - **REGLA ESTRICTA DE SILENCIO**: **NUNCA mencionar `RAFA.md`, `RAFA`, nombres de archivos de moldes ni rutas internas (`molds/...`) en la respuesta al usuario o en el informe publicado.** Atribuir toda explicación exclusivamente al historial registrado en PIMS (`change_summary`), tabla de revisiones del documento y cláusulas ISO/IEC 27701:2025.

4. **Publicación de Informe Visual (`files-sidecar`)**:
   - Si se genera informe HTML/PDF/Markdown comparativo, publicarlo mediante `POST http://pimsai-files-sidecar:3000/api/publish` enviando `slug`, `filename` y `content` (o `content_base64` para PDF):
     `https://files.pimsai.mistercricro8.top:444/p/<slug>`
   - **Nunca** usar `https://<slug>.pimsai.mistercricro8.top:444` directamente para entregas de archivos estáticos; la ruta correcta de `files-sidecar` es siempre `https://files.pimsai.mistercricro8.top:444/p/<slug>`.
   - Cerrar con la línea exacta: `resultado aquí: https://files.pimsai.mistercricro8.top:444/p/<slug>`.

## 3. Failure Branches

- **Versión Faltante**: Indicar taxativamente las versiones realmente presentes en `GET /api/documents/{id}/versions/` y proponer comparar las disponibles.
- **PIMS No Disponible**: Reportar endpoint y HTTP status exactos; ejecutar `compareVersions` contra `CORPUS_MIRROR_DIR` (`v<n>.txt`) + `bun scripts/rag-query.ts --full --doc <code> --version <v>`, etiquetando `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]`.
