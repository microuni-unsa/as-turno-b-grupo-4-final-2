# Skill: directed-version (SPEC 9.7)

Ejecución de directivas de modificación y generación de nuevas versiones controladas de documentos del PIMS, aplicando la regla estricta de versionado (1.x / 2.x), renderizado reproducible mediante Typst, registro en PIMS, re-indexación vectorial e informe de diff.

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

2. **Descarga de Estado Actual y Recuperación de Moldes**:
   - Descargar la versión vigente actual desde PIMS:
     `pims_adapter.documents.download(doc_id="<pims_doc_id>", target_path="corpus_mirror/<doc_id>/v_current.pdf")`
   - Recuperar el molde Typst fuente correspondiente en `molds/<category>/<doc_code>.typ` y su ficha RAFA asociada (`molds/<category>/<doc_code>.rafa.json`).
   - *Nota arquitectónica*: Los moldes `.typ` locales son plantillas de generación; el registro oficial siempre reside en PIMS.

3. **Aplicación de la Regla de Versionado (1.x vs 2.x)**:
   - Evaluar taxativamente la naturaleza del cambio:
     - **Incremento Menor (`1.x`)**: Aplica a ajustes de redacción, corrección de erratas, actualización de contactos, aclaraciones de alcance o ajustes menores que no alteran la arquitectura de procesos (ej. pasar de v1.0 a v1.1, o de v2.1 a v2.2).
     - **Incremento Mayor (`2.x`)**: Aplica a cambios estructurales mayores: incorporación o eliminación de procesos completos, reestructuración organizativa integral o apertura de nuevas filiales/sedes con obligaciones operativas nuevas (ej. pasar de v1.x a v2.0).
   - Registrar la justificación del tipo de incremento en el resumen de cambios.

4. **Modificación del Molde y Tabla de Historial**:
   - Aplicar la directiva en el contenido del archivo Typst (`.typ`).
   - Agregar una nueva fila obligatoria en la tabla de historial de versiones del documento:
     `[Versión, Fecha (ISO 8601), Autor/Rol (G4), Resumen del Cambio (change_summary), Estado (Borrador/Vigente)]`.
   - Resolver todos los corchetes o marcadores de posición pendientes.

5. **Compilación y Renderizado Determinista (Typst)**:
   - Compilar el documento reproduciblemente utilizando Typst CLI:
     `typst compile molds/<category>/<doc_code>.typ output/<doc_code>_v<new_version>.pdf`
   - Validar que el archivo PDF generado cumpla con los estándares visuales (membrete UNSA, numeración "Página X de Y", clasificación de confidencialidad).

6. **Carga en PIMS como NUEVA Versión**:
   - Subir el PDF compilado a la API de GESTITEL mediante el endpoint de versionado:
     `pims_adapter.documents.create_version(doc_id="<pims_doc_id>", file="output/<doc_code>_v<new_version>.pdf", change_summary="<resumen_cambio>")`
   - **Regla de integridad**: En PIMS las versiones anteriores NUNCA se sobreescriben ni eliminan; pasan automáticamente a estado `obsoleto` y permanecen descargables para auditorías retrospectivas ("time-machine").

7. **Re-Indexación en Conocimiento RAG (Mirror)**:
   - Ejecutar la ingesta inmediata:
     `rag_mirror.ingest(pims_doc_id="<pims_doc_id>", version="<new_version>", file_path="output/<doc_code>_v<new_version>.pdf")`
   - Fragmentar en chunks semánticos, computar embeddings (1024 dimensiones, compatible con mistral-embed), registrar en `pgvector` con hash SHA-256 por chunk y actualizar el manifiesto de `corpus_mirror`.

8. **Generación de Resumen de Diff y Publicación**:
   - Comparar estructuralmente la versión previa con la nueva:
     `rag_mirror.diff(file_a="corpus_mirror/<doc_id>/v_current.pdf", file_b="output/<doc_code>_v<new_version>.pdf")`
   - Desplegar el visor del documento y su comparativa en un contenedor Traefik bajo un slug fresco:
     `files_sidecar.publish(content=rendered_artifact, slug="doc-<doc_code>-v<new_version>-<timestamp>")`
   - Servir en `https://doc-<doc_code>-v<new_version>-<timestamp>.pimsai.mistercricro8.top`.
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
    - La generación de nuevas versiones, modificación de moldes y renderizado Typst se pausan de inmediato.
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

resultado aquí: https://doc-g4-prc-inc-001-v2-0-8d14.pimsai.mistercricro8.top
```
