# Skill: directed-version (SPEC 9.7)

Ejecución de directivas de modificación y generación de nuevas versiones controladas de documentos del PIMS mediante el flujo desacoplado copy-then-fill de moldes parametrizados, aplicando la regla estricta de versionado (1.x / 2.x / 3.x), renderizado reproducible mediante Typst/XLSX, registro en PIMS, re-indexación vectorial e informe de diff.

## 1. Trigger Patterns

Se activa ante instrucciones del usuario para modificar, actualizar o crear una nueva versión de un documento existente:
- "Actualiza el procedimiento de incidentes para incluir la filial Camaná."
- "Agrega el flujo de notificación a la autoridad de privacidad en G4-PRC-INC-001."
- "Crea una nueva versión del manual de respuesta con los nuevos roles."
- "Modifica el alcance de la política de retención para añadir nómina docente."
- "Ajusta las definiciones del procedimiento según la norma ISO/IEC 27701:2025."

## 2. Step Protocol

1. **Aislamiento Multi-Tenant (Filtro G4 Obligatorio)**:
   - Validar que el código del documento posea el prefijo obligatorio `G4-` antes de cualquier procesamiento:
     `pims_adapter.documents.get(code="G4-...")`
   - Queda prohibida la modificación de documentos que no pertenezcan al espacio del Grupo 4 en el esquema compartido `unsa`.

2. **Descarga de Estado Actual y Localización de Molde e Invocador**:
   - Descargar la versión vigente actual desde PIMS:
     `pims_adapter.documents.download(doc_id="<pims_doc_id>", target_path="corpus_mirror/<doc_id>/v_current.pdf")`
   - Leer la versión vigente real desde `corpus_mirror/<doc_id>/manifest.json` (para evitar regresiones de versión en singletons).
   - Localizar en `molds/<category>/`:
     - El molde Typst parametrizado: `molds/<category>/mold.typ` (función pura `mold` que contiene la prosa y diseño con cero datos de instancia hardcodeados).
     - El último invocador de versión: `molds/<category>/<doc_code>-v<prev>.typ` (archivo delgado con diccionario de datos).
     - La ficha RAFA de ingeniería de prompts: `molds/<category>/RAFA.md`.
   - *Axioma de Fuente de Verdad*: Los moldes locales son plantillas de generación; el registro oficial siempre reside en PIMS.

3. **Aplicación de la Regla de Versionado (1.x vs 2.x/3.x)**:
   - Evaluar taxativamente la naturaleza del cambio:
     - **Incremento Menor (`1.x`, `2.x`)**: Aplica a correcciones tipográficas, precisiones de redacción, actualización de nombres de cargos sin cambio funcional, aclaraciones de alcance o ajustes menores que no alteran los límites de los procesos (ej. pasar de v1.0 a v1.1, o de v2.0 a v2.1).
     - **Incremento Mayor (`2.0`, `3.0`)**: Aplica obligatoriamente a cambios estructurales mayores en el sistema de gestión: v1.0 (certificación inicial 2019), v2.0 (virtualización y post-pandemia 2022), v3.0 (recertificación ISO/IEC 27701:2025 y expansión a filiales Camaná y El Pedregal).
   - Registrar la justificación del tipo de incremento en el resumen de cambios.

4. **Copia a Staging Aislado (Aislamiento Total de `molds/`)**:
   - Crear el directorio de trabajo temporal para la nueva versión: `/tmp/pims-staging/<doc_code>-v<new_version>/`.
   - Copiar `mold.typ` y el último invocador de versión hacia el directorio de staging:
     `cp molds/<category>/mold.typ molds/<category>/<doc_code>-v<prev>.typ /tmp/pims-staging/<doc_code>-v<new_version>/`
   - **Regla de Prohibición Estricta**: Queda terminantemente prohibido mutar `molds/` en su lugar (in-place) para datos de instancia. NUNCA editar `mold.typ` en su lugar para datos de instancia.

5. **Redacción del Nuevo Invocador con Diccionario de Datos (Copy-Then-Fill)**:
   - Redactar un NUEVO invocador delgado en staging: `/tmp/pims-staging/<doc_code>-v<new_version>/<doc_code>-v<new_version>.typ` (~30 líneas).
   - El nuevo invocador importa la función pura del molde (`#import "mold.typ": mold`) y define el diccionario de datos `#let data = (...)` pasando:
     - Metadatos de cabecera: código institucional (`G4-...`), nueva versión (`v<new_version>`), fecha de vigencia (`YYYY-MM-DD`), clasificación (`CONFIDENCIAL - USO INTERNO UNSA`).
     - Cuadro de control y firmas institucionales (Elaborado: Carlos M. Benítez / Revisado: Lucía Valdivia / Aprobado: Rector).
     - Nueva fila obligatoria en el historial de revisiones:
       `[Versión, Fecha (ISO 8601), Autor/Rol (G4), Resumen del Cambio (change_summary), Estado (Vigente)]`.
     - Parámetros sustantivos de la directiva (alcance territorial, procesos, cláusulas ISO/IEC 27701:2025).
     - Ejecución de regla de renderizado: `#show: mold.with(..data)`.
   - **Prohibición de Edición de Prosa**: La prosa de `mold.typ` NO se edita para datos de instancia; toda adaptación se canaliza exclusivamente mediante los parámetros del diccionario de datos. Ediciones a la prosa de `mold.typ` proceden ÚNICAMENTE ante cambios estructurales de la plantilla (requiriendo aprobación explícita del usuario y versionado del contrato del molde). Cero corchetes o marcadores pendientes (`TODO`, etc.).

6. **Compilación y Renderizado Determinista (Typst / XLSX)**:
   - Compilar el documento reproduciblemente desde el directorio de staging:
     - Documentos Typst: `typst compile --root . /tmp/pims-staging/<doc_code>-v<new_version>/<doc_code>-v<new_version>.typ /tmp/pims-staging/<doc_code>-v<new_version>/<doc_code>_v<new_version>.pdf`
     - Artefactos tabulares XLSX (ej. `incident-register`): compilar ejecutando el generador scriptado desde staging (`bun run generate.ts`).
   - Validar que el archivo generado cumpla estrictamente con los 15 elementos normativos de anatomía obligatoria (SPEC 6.1 Ampliado).
   - **Prohibición**: Queda terminantemente prohibido editar manualmente los archivos PDF o binarios renderizados.

7. **Registro Local en Espejo (`corpus_mirror/`)**:
   - Guardar el artefacto compilado en `corpus_mirror/<doc_id>/v<new_version>.<ext>`.
   - Actualizar `corpus_mirror/manifest.json` registrando `pims_doc_id`, `code`, `version`, `sha256`, `downloaded_at`, y `chunk_count`.

8. **Carga en PIMS como Nueva Versión (`change_summary`)**:
   - Subir el PDF compilado a la API de GESTITEL mediante:
     `pims_adapter.documents.create_version(doc_id="<pims_doc_id>", file="/tmp/pims-staging/<doc_code>-v<new_version>/<doc_code>_v<new_version>.pdf", change_summary="<resumen_cambio>")`
   - El campo `change_summary` DEBE cumplir con la convención de 3 partes de SPEC 6.1:
     `TIPO_CAMBIO :: Razón normativa/organizacional :: Modificaciones específicas realizadas :: Impacto en controles SoA o procesos`
   - **Regla de integridad e inmutabilidad**: Las versiones anteriores NUNCA se sobreescriben ni eliminan; pasan automáticamente a estado `obsoleto` (`O`) y se preservan descargables en PIMS y el espejo.

9. **Re-Indexación Inmediata en Conocimiento RAG (Mirror)**:
   - Ejecutar la ingesta inmediata:
     `rag_mirror.ingest(pims_doc_id="<pims_doc_id>", version="<new_version>", file_path="corpus_mirror/<doc_id>/v<new_version>.pdf")`
   - Fragmentar en chunks semánticos (250–500 tokens con 50 tokens de solape), computar embeddings mistral-embed (1024 dimensiones), registrar en `pgvector` con hash SHA-256 por fragmento y actualizar `pims_registry`.

10. **Generación de Resumen de Diff y Publicación**:
    - Comparar estructuralmente la versión previa con la nueva:
      `rag_mirror.diff(file_a="corpus_mirror/<doc_id>/v_current.pdf", file_b="corpus_mirror/<doc_id>/v<new_version>.pdf")`
    - Publicar el reporte comparativo y artefacto mediante `files-sidecar`:
      `files_sidecar.publish(content=rendered_artifact, slug="doc-<doc_code>-v<new_version>-<timestamp>")`
    - Servir en `https://files.pimsai.mistercricro8.top:444/p/doc-<doc_code>-v<new_version>-<timestamp>`.
    - Concluir obligatoriamente la respuesta con: `"resultado aquí: link"`.

## 3. Failure Branches

- **Documento No Perteneciente al Tenant G4**:
  - Si el código carece de prefijo `G4-`:
    `"Operación rechazada: Solo se permite versionar documentos del Grupo 4 en el tenant compartido."`
- **Error de Compilación en Typst**:
  - Si Typst reporta error sintáctico: abortar la subida a PIMS, mostrar la línea de error del compilador y preservar el archivo fuente sin alterar el PIMS en vivo.
- **Falla en Endpoint de Subida de PIMS (400/500)**:
  - Notificar el error de la API: `"POST /api/documents/{id}/versions/ falló: 400 Bad Request - 'change_summary' requerido"`.
  - Guardar el artefacto compilado en la zona de staging local `corpus_mirror/staging/` para reintento.
- **Límite de Presupuesto Alcanzado (Loan Profile Degraded-at-Cap)**:
  - Si se alcanza el límite de `task.softRequestBudget` o la cuota en perfil loan:
    - La recuperación de datos permanece activa: lectura de versiones existentes, descarga de documentos y consultas de texto continúan funcionando.
    - La generación de nuevas versiones mediante copy-then-fill, modificación de invocadores y renderizado Typst se pausan de inmediato.
    - Mensaje de contacto obligatorio:
      `"Límite de presupuesto de tokens alcanzado en perfil loan. La recuperación continúa activa, pero la generación de versiones está pausada. Contacte al equipo Turno B Grupo 4 para ampliación de cuota."`

## 4. Response Shape

```markdown
### Nueva Versión Generada: G4-PRC-INC-001 (v2.0)
**Documento**: Procedimiento de Gestión de Incidentes de Privacidad  
**Tenant**: GESTITEL `unsa` (Grupo 4)  
**Tipo de Incremento**: **2.x (Mayor)** — Inclusión de filiales Camaná y Pedregal y formalización de flujos operativos de reporte.

#### 1. Ficha de Versionado
- **Versión Anterior**: v1.2 (Pasa a estado: *Obsoleto*, accesible para auditoría).
- **Nueva Versión en PIMS**: **v2.0** (Registrada con éxito en PIMS).
- **Resumen de Cambios (`change_summary`)**: Incorporación de sección 4.3 para notificación de brechas en sedes descentralizadas y matriz de escalamiento.

#### 2. Re-Indexación RAG
- **Estado de Ingesta**: ✅ Completado.
- **Chunks Vectorizados**: 18 fragmentos (pgvector / mistral-embed 1024-dim).
- **Integridad**: Manifiesto de `corpus_mirror` actualizado con SHA-256.

#### 3. Resumen de Diferencias Estructurales
- `+ Cláusula 4.3`: Flujo de reporte para Filial Camaná y Filial Pedregal.
- `~ Cláusula 7.1`: Tabla de responsables actualizada con coordinadores zonales.

resultado aquí: https://files.pimsai.mistercricro8.top:444/p/doc-g4-prc-inc-001-v2-0-8d14
```
