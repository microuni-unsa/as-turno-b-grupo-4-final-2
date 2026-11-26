---
name: directed-version
description: Generate controlled new versions of PIMS documents (including cross-team and arbitrary non-Typst PDF adaptation via molds/generic) using pdftotext -layout / OCR extraction, copy-then-fill Typst staging, strict compile quality checklist, and two-gate human approval before PIMS upload.
---

# Skill: directed-version

Ejecución controlada de nuevas versiones documentales (`G4-*`) —incluyendo la digestión y adaptación de documentos PDF externos o de otros grupos (`G1-`, `G2-`, `G3-`)— mediante extracción íntegra de PDF (`pdftotext -layout` / OCR), **Copy-Then-Fill** sobre moldes Typst parametrizados (`molds/` o `molds/generic/mold.typ`), alineación numérica con PIMS, lista de verificación de compilación y **compuerta obligatoria de aprobación humana** antes de escribir en PIMS en vivo.

## 1. Trigger Patterns

- "Actualiza el documento `<G4-...>` para incluir `<cambio>`."
- "Genera una nueva versión de `<documento>`."
- "Corrige o añade `<sección/dato>` en `<G4-...>`."
- "Toma `<G1-/G2-/G3-... o PDF externo>` y genera una nueva versión adaptada para Grupo 4."

## 2. Step Protocol

1. **Verificación de Prefijo de Escritura (`G4-`) y Aislamiento de Tenant**:
   - Toda escritura documental en PIMS exige código que comience con `G4-` (`assertG4WriteCode`).
   - Si la solicitud apunta originalmente a un código de otro grupo (`G1-`, `G2-`, `G3-`) o a un PDF externo subido, **explicar claramente al usuario** la regla de aislamiento en el tenant compartido (que las escrituras de Grupo 4 solo pueden publicarse bajo un código `G4-` sin sobrescribir documentos de otros grupos) y ejecutar el Protocolo de Adaptación Cross-Team (§3).

2. **Lectura del Estado Real en PIMS + Extracción 100% desde PDF (`pdftotext -layout` / OCR)**:
   - Consultar en PIMS vía CLI unificado (`bun scripts/pims.ts`):
     - `bun scripts/pims.ts docs list [--search <code_or_name>] [--compact]` → resolver `doc.id`, `doc.code`, `doc.name`, `doc.status`, `doc.current_version`.
     - `bun scripts/pims.ts docs versions <id_or_code>` → inspeccionar historial real (`version`, `file`, `change_summary`, `created_at`).
   - **Alineación Numérica PIMS vs PDF**:
     - PIMS asigna automáticamente versiones enteras secuenciales (`"1.00"`, `"2.00"`, `"3.00"`, `"4.00"`...) al llamar a `POST /api/documents/{id}/versions/`.
     - Calcular la siguiente versión entera (`nextMajor = Math.floor(maxLiveVersion) + 1`, ej. si la última en PIMS es `"3.00"`, la siguiente será `v4.0` en PDF / `"4.00"` en PIMS; si es un documento nuevo `G4-`, será `v1.0` en PDF / `"1.00"` en PIMS).
     - Estampar portada, pie de página y fila de historial del PDF con **`"4.0"`** (o `"1.0"` si es creación) para que el PDF coincida con la versión en PIMS, especificando menor vs mayor al inicio de `change_summary` (`MENOR :: ...` o `MAYOR :: ...`).
   - **Extracción del Texto Fuente (Cero Suposición de Typst en PDFs Origen)**:
     - Nunca asumir que el PDF de origen fue compilado con Typst ni depender de `corpus_g4_src/` (no desplegado en runtime) ni leer bytes crudos `%PDF-`.
     - Extraer el texto estructurado completo vía `bun scripts/pims.ts mirror read <doc.code> [--ver <v>]`, leyendo `CORPUS_MIRROR_DIR/<doc.code>/v<ver>.txt`, o descargando el PDF (`bun scripts/pims.ts docs download <id_or_code> --ver <v> --out /tmp/src.pdf`) y ejecutando `pdftotext -layout -nopgbrk /tmp/src.pdf -`.
     - Si el PDF es escaneado (sin capa de texto extraíble), convertir páginas con `pdftoppm -png -r 200 /tmp/src.pdf /tmp/page` y extraer texto con `tesseract /tmp/page-*.png stdout -l spa+eng`.

3. **Selección e Inspección de Contrato del Molde (`molds/<category>/` o `molds/generic/`)**:
   - Identificar `molds/<category>/` correspondiente cuando el documento encaje en un molde específico del SGPI, o usar **`molds/generic/mold.typ`** (envoltura universal sobre `doc-template` para secciones y tablas arbitrarias de cualquier documento).
   - **Leer directamente `molds/<category>/mold*.typ`** para verificar:
     - El archivo exacto (`mold.typ`, `mold-cap.typ`, `mold-reg-cap.typ`, `mold-prg.typ`, `mold-rep.typ`, `mold-prc-capa.typ`, `mold-reg-capa.typ`, o `molds/generic/mold.typ`).
     - El símbolo exportado exacto (`#let mold(...)`, etc.) y su firma posicional vs nombrada (`mold(data: (:))` vs `mold(data)`).
     - Las claves exactas del diccionario de datos (`title`, `code`, `version`, `date`, `author`, `reviewer`, `approver`, `history`, `references`, secciones, tablas).
   - Si existe `molds/<category>/RAFA.md`, leerlo **silenciosamente** como guía estructural interna; **NUNCA citar ni mencionar `RAFA.md` ni rutas internas `molds/` en mensajes al usuario ni en el PDF**.

4. **Staging Aislado (Copia Completa incluyendo `molds/common/`)**:
   - Crear `/tmp/pims-staging/<target_code>-v<nextMajor>/`.
   - Copiar `molds/common/` a `/tmp/pims-staging/common/` y copiar `molds/<category>/*.typ` (o `molds/generic/*.typ`) a `/tmp/pims-staging/<target_code>-v<nextMajor>/` (porque `mold*.typ` importa `../common/template.typ`).
   - **Prohibición**: Jamás editar archivos dentro de `molds/` en su lugar ni editar PDFs manualmente.

5. **Redacción del Invocador, Compilación y Lista de Verificación Typst**:
   - Redactar `/tmp/pims-staging/<target_code>-v<nextMajor>/<target_code>-v<nextMajor>.typ` importando el símbolo correcto del molde y poblando todos los datos vigentes extraídos más la modificación solicitada y la nueva fila en el cuadro de Control de Cambios.
   - Para cambios quirúrgicos en párrafos fijos (ej. SoA `get-deep-*`): preferir SIEMPRE el parámetro `deep_overrides:` del invocador antes que editar la copia del molde en staging.
   - Grounding de contenido: (1) fechas de sesión/eventos NUNCA futuras respecto a hoy salvo instrucción explícita; (2) nombres de personas SOLO desde `university-facts/` o PIMS en vivo, o marcados `[POR CONFIRMAR]`; (3) nombres canónicos (`Filial El Pedregal`, `Filial Camaná`).
   - Si aplica artefacto tabular XLSX (`incident-register` o `incident-risks`), invocar su script `generate*.ts` desde staging.
   - Compilar desde staging:
     `typst compile --root /tmp/pims-staging /tmp/pims-staging/<target_code>-v<nextMajor>/<target_code>-v<nextMajor>.typ /tmp/pims-staging/<target_code>-v<nextMajor>/<target_code>_v<nextMajor>.0.pdf`
   - **Checklist Obligatorio Pre-Publicación (Typst & Calidad)**:
     1. **Escapar `@` como `\@`** dentro de bloques de contenido `[...]` (correos electrónicos o menciones) para evitar errores de referencia Typst.
     2. **Poblar `reviewer` (`Revisado por`)** explícitamente desde `university-facts/organigrama.md` (junto con `author` y `approver`).
     3. **Verificar alineación de versión**: comprobar que la portada, pie de página y última fila de historial coinciden exactamente con el siguiente entero PIMS (`"4.0"` ↔ `"4.00"` o `"1.0"` ↔ `"1.00"`).
     4. **Auditar texto compilado con `pdftotext -layout`**: confirmar **cero** marcadores sin resolver (`TODO`, `[POR ...]`) y **cero** términos internos filtrados (`Typst`, `Bun`, `RAFA`, `molds/`).

6. **Publicación de Borrador y Compuerta Obligatoria de Aprobación Humana (STOP BEFORE PIMS WRITE)**:
   - Enviar el PDF compilado a la consola web vía CLI:
     `bun scripts/pims.ts publish --slug preview-<code_slug>-v<nextMajor> --file /tmp/pims-staging/<target_code>-v<nextMajor>/<target_code>_v<nextMajor>.0.pdf --filename <target_code>_v<nextMajor>.0.pdf`
   - Entregar al usuario en español ejecutivo:
     - Resumen de cambios, clasificación menor vs mayor, resumen de cambio propuesto, aclaración de trazabilidad `G4-` si aplica, y enlace de vista previa (tarjeta inline **Vista previa / Descargar** en el chat):
       `https://demo.pimsai.mistercricro8.top:444/api/files/preview-<code_slug>-v<nextMajor>`
   - **DETENERSE AQUÍ (Compuerta 2)**: NO subir a PIMS ni alterar el espejo oficial hasta recibir autorización explícita humana nombrando documento y versión (`"confirmo subida de G4-XXX v4.00"` o `"confirmo crear G4-XXX v1.00"`). Un `"procede"` genérico solo autoriza compilar y mostrar vista previa, nunca subir a PIMS.

7. **Ejecución Tras Aprobación Explícita (Upload + Re-ingesta + Diff)**:
   - Solo tras confirmación explícita nominal del usuario:
     - Para nueva versión de documento existente: `bun scripts/pims.ts docs add-version <G4-CODE> --file /tmp/pims-staging/<target_code>-v<nextMajor>/<target_code>_v<nextMajor>.0.pdf --file-name <target_code>_v<nextMajor>.0.pdf --summary "<change_summary>" --confirm` (siempre pasar `--file-name` explícito).
     - Para documento nuevo `G4-`: `bun scripts/pims.ts docs create --code <G4-CODE> --name "<nombre>" --category PO|PR|RE|IN --status B|R|V --responsible "<responsable>" --file <path.pdf> --file-name <target_code>_v1.0.pdf --confirm`.
     - Ejecutar `bun scripts/pims.ts mirror sync` para sincronizar el espejo local y la base vectorial con la nueva versión oficial.
     - Si es actualización de un documento existente, computar diff estructural con `bun scripts/pims.ts diff <G4-CODE> --from <vPrev> --to <vNext>` y publicar informe en `https://demo.pimsai.mistercricro8.top:444/api/files/<slug>`.

## 3. Protocolo de Adaptación Cross-Team / PDF Arbitrario No-Typst

Cuando el usuario solicite digerir o versionar un documento de otro grupo (`G1-`, `G2-`, `G3-`) o un PDF arbitrario subido externamente:
1. **Extracción Íntegra**: Extraer todo el texto con `bun scripts/pims.ts mirror read <source_code>` / `pdftotext -layout -nopgbrk` (o `pdftoppm -png` + `tesseract ... -l spa+eng` si es escaneado), sin depender de ningún código fuente original.
2. **Mapeo a Molde Compatible o Universal**: Si la estructura corresponde a un molde específico del SGPI, usar `molds/<category>/mold*.typ`; de lo contrario, usar **`molds/generic/mold.typ`** para preservar todas las secciones, subtítulos y tablas del documento fuente bajo la anatomía institucional UNSA.
3. **Código Destino `G4-` Trazable**:
   - Si existe una contraparte equivalente en Grupo 4 (ej. política o procedimiento homólogo), proponer actualizarla (`docs add-version <G4-CODE>`) o, si es un artefacto nuevo, asignar un nuevo código derivado `G4-...` (`docs create --code G4-...`).
   - Registrar explícitamente **`"Basado en <source> v<n>"`** tanto en la fila correspondiente del **Historial de Revisiones** como en la sección de **Documentos de referencia** (`references`).
4. **Explicación Clara de Aislamiento**: Informar al usuario en español claro por qué el documento resultante adopta código `G4-` (aislamiento del tenant compartido para no alterar registros de otros grupos) manteniendo trazabilidad explícita al documento fuente.
5. **Vista Previa y Compuerta 2**: Compilar pasando el Checklist de §2.5, publicar la vista previa vía `bun scripts/pims.ts publish` (tarjeta inline **Vista previa / Descargar** en la consola web) y **detenerse en la Compuerta 2** antes de cualquier escritura en PIMS.

## 4. Failure Branches

- **Código sin `G4-` en escritura**: Abortar inmediatamente (`TenantGuardViolationError`) y aplicar el Protocolo Cross-Team (§3) con destino `G4-`.
- **Error Typst**: Revisar primero `@` sin escapar (`\@`) y llaves del diccionario en `mold*.typ`; mostrar diagnóstico limpio sin exponer rutas internas y jamás subir un PDF fallido.
- **Usuario Rechaza o Pide Ajustes en Compuerta**: Ajustar invocador en `/tmp/pims-staging/...`, recompilar, revalidar Checklist, volver a publicar vista previa y pedir nueva confirmación nominal sin tocar PIMS en vivo.
- **PIMS No Disponible**: Si la lectura en vivo falla, leer texto desde el espejo local vía `bun scripts/pims.ts mirror read <doc.code>` o búsqueda semántica `bun scripts/rag-query.ts "<consulta>"` anteponiendo `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]`.
