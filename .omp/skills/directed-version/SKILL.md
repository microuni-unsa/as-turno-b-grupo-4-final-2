---
name: directed-version
description: Generate controlled new versions of PIMS documents via parameterized Typst mold copy-then-fill staging, aligning PDF versions with live PIMS integers and halting for human approval before upload.
---

# Skill: directed-version

Ejecución controlada de nuevas versiones documentales (`G4-*`) mediante **Copy-Then-Fill** desacoplado sobre moldes Typst parametrizados (`molds/`), alineación numérica con el servidor PIMS, vista previa previa y **compuerta obligatoria de aprobación humana** antes de escribir en PIMS en vivo.

## 1. Trigger Patterns

- "Actualiza el documento `<G4-...>` para incluir `<cambio>`."
- "Genera una nueva versión de `<documento>`."
- "Corrige o añade `<sección/dato>` en `<G4-...>`."

## 2. Step Protocol

1. **Verificación de Prefijo de Escritura (`G4-`)**:
   - Toda escritura documental en PIMS exige código que comience con `G4-` (`assertG4WriteCode`). Rechazar cualquier mutación sin `G4-`.

2. **Lectura del Estado Real en PIMS + Contenido Actual**:
   - Consultar en PIMS vía CLI unificado (`bun scripts/pims.ts`):
     - `bun scripts/pims.ts docs list` (o `bun scripts/pims.ts docs list --search <code_or_name>` / `--compact`) → resolver `doc.id`, `doc.code`, `doc.name`, `doc.status`, `doc.current_version`.
     - `bun scripts/pims.ts docs versions <id_or_code>` → inspeccionar historial real (`version`, `file`, `change_summary`, `created_at`).
   - **Alineación Numérica PIMS vs PDF**:
     - PIMS asigna automáticamente versiones enteras secuenciales (`"1.00"`, `"2.00"`, `"3.00"`, `"4.00"`...) al llamar a `POST /api/documents/{id}/versions/`.
     - Calcular la siguiente versión entera (`nextMajor = Math.floor(maxLiveVersion) + 1`, ej. si la última en PIMS es `"3.00"`, la siguiente será `v4.0` en PDF / `"4.00"` en PIMS).
     - Estampar portada, pie de página y fila de historial del PDF con **`"4.0"`** (o `"v4.0"`) para que el PDF coincida con la versión en PIMS, especificando la naturaleza real del cambio (menor vs mayor) al inicio de `change_summary` (`MENOR :: ...` o `MAYOR :: ...`).
   - Obtener el texto vigente real del documento para reconstruir sus datos actuales sin depender de `corpus_g4_src/` (no desplegado en runtime):
     - Usar `bun scripts/pims.ts mirror read <doc.code> [--ver <v>]` o leer `CORPUS_MIRROR_DIR/<doc.code>/v<ver>.txt` (o búsqueda semántica con `bun scripts/rag-query.ts "<consulta>"`).

3. **Inspección de Contrato del Molde y `RAFA.md` Silencioso**:
   - Identificar `molds/<category>/` correspondiente y **leer directamente `molds/<category>/mold*.typ`** para verificar:
     - El archivo exacto (`mold.typ`, `mold-cap.typ`, `mold-reg-cap.typ`, `mold-prg.typ`, `mold-rep.typ`, `mold-prc-capa.typ`, `mold-reg-capa.typ`).
     - El símbolo exportado exacto (`#let mold(...)`, `#let mold-cap(...)`, etc.) y su firma posicional vs nombrada (`mold(data)` vs `mold(data: (:))` vs parámetros individuales en `molds/document-control/mold.typ`).
     - Las claves exactas del diccionario de datos (`title`, `code`, `version`, `date`, `author`, `reviewer`, `approver`, `history`, secciones, etc.).
   - Si existe `molds/<category>/RAFA.md`, leerlo **silenciosamente** como guía estructural interna; **NUNCA citar ni mencionar `RAFA.md` ni archivos `molds/` en mensajes al usuario**.

4. **Staging Aislado (Copia Completa incluyendo `molds/common/`)**:
   - Crear `/tmp/pims-staging/<doc.code>-v<nextMajor>/`.
   - Copiar `molds/common/` a `/tmp/pims-staging/common/` y copiar `molds/<category>/*.typ` a `/tmp/pims-staging/<doc.code>-v<nextMajor>/` (porque `mold*.typ` importa `../common/template.typ`).
   - **Prohibición**: Jamás editar archivos dentro de `molds/` en su lugar ni editar PDFs manualmente.

5. **Redacción del Invocador y Compilación Reproducible**:
   - Redactar `/tmp/pims-staging/<doc.code>-v<nextMajor>/<doc.code>-v<nextMajor>.typ` importando el símbolo correcto del molde y poblando todos los datos vigentes extraídos del PIMS en vivo más la modificación solicitada y la nueva fila en el cuadro de Control de Cambios.
   - Para cambios quirúrgicos en párrafos era-fijos (ej. SoA `get-deep-*`): preferir SIEMPRE el parámetro `deep_overrides:` del invocador (`deep_overrides: (a129: [...], "a1-A.1.2.9": "...")`) antes que editar la copia del molde en staging. Editar lógica del molde (incluso en staging) es último recurso: frágil y propenso a errores de sintaxis.
   - Grounding de contenido (P2.4): (1) fechas de sesión/eventos NUNCA futuras respecto a hoy salvo que el usuario dé fecha explícita; (2) nombres de personas SOLO desde `university-facts/` o PIMS en vivo, o marcados `[POR CONFIRMAR]`; (3) nombres canónicos (`Filial El Pedregal`, no `Majes` suelto).
   - Si aplica artefacto tabular XLSX (ej. `incident-register` o `incident-risks`), invocar su script `generate*.ts` desde staging.
   - Compilar desde staging:
     `typst compile --root /tmp/pims-staging /tmp/pims-staging/<doc.code>-v<nextMajor>/<doc.code>-v<nextMajor>.typ /tmp/pims-staging/<doc.code>-v<nextMajor>/<doc.code>_v<nextMajor>.0.pdf`
   - Verificar con `pdftotext` que el PDF compilado no contiene marcadores vacíos y que portada, historial y bloque de firma coinciden.

6. **Publicación de Borrador y Compuerta Obligatoria de Aprobación Humana (STOP BEFORE PIMS WRITE)**:
   - Enviar el PDF compilado a `files-sidecar` vía CLI:
     `bun scripts/pims.ts publish --slug preview-<code_slug>-v<nextMajor> --file /tmp/pims-staging/<doc.code>-v<nextMajor>/<doc.code>_v<nextMajor>.0.pdf --filename <doc.code>_v<nextMajor>.0.pdf`
   - Entregar al usuario:
     - Resumen de cambios, tabla/razón menor vs mayor, `change_summary` propuesto (`TIPO :: Razón :: Modificaciones :: Impacto`) y enlace de vista previa:
       `https://files.pimsai.mistercricro8.top:444/p/preview-<code_slug>-v<nextMajor>`
   - **DETENERSE AQUÍ**: NO subir a PIMS ni alterar el espejo oficial hasta recibir autorización explícita humana para ejecutar la subida. La compuerta de preview es SEPARADA de la compuerta de subida: la confirmación debe nombrar documento+versión (`"confirmo subida de G4-XXX v4.00"` o equivalente); un `"procede"` genérico solo autoriza compilar+preview, nunca subir.

7. **Ejecución Tras Aprobación Explícita (Upload + Re-ingesta + Diff)**:
   - Solo tras confirmación explícita del usuario:
     - Invocar `bun scripts/pims.ts docs add-version <doc.code> --file /tmp/pims-staging/<doc.code>-v<nextMajor>/<doc.code>_v<nextMajor>.0.pdf --file-name <doc.code>_v<nextMajor>.0.pdf --summary "<change_summary>" --confirm` — **siempre pasar `--file-name` explícito** (nunca `"version.pdf"`).
     - Ejecutar `bun scripts/pims.ts mirror sync` para sincronizar el espejo local y la base vectorial con la nueva versión oficial.
     - Computar diff estructural entre versión previa y nueva sobre texto extraído con `bun scripts/pims.ts diff <doc.code> --from <vPrev> --to <vNext>` y publicar informe final vía `bun scripts/pims.ts publish --slug diff-<code_slug>-v<nextMajor> --file <diff_file>` en `https://files.pimsai.mistercricro8.top:444/p/<slug>`.

## 3. Failure Branches

- **Código sin `G4-`**: Abortar inmediatamente (`TenantGuardViolationError`).
- **Error Typst**: Mostrar error exacto de `typst compile`; jamás subir PDF incompleto.
- **Usuario Rechaza o Pide Ajustes en Compuerta**: Ajustar invocador en `/tmp/pims-staging/...`, recompilar, volver a publicar preview y pedir nueva confirmación sin tocar PIMS en vivo.
- **PIMS No Disponible**: Si la lectura en vivo falla, leer texto desde el espejo local vía `bun scripts/pims.ts mirror read <doc.code>` o búsqueda semántica `bun scripts/rag-query.ts "<consulta>"` anteponiendo `[FUENTE: Cache local pgvector mirror (PIMS no disponible)]`.
