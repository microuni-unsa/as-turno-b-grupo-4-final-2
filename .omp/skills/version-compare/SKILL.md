# Skill: version-compare (SPEC 9.1)

Procedimiento de comparación estructural y análisis evolutivo entre versiones arbitrarias de cualquier documento del PIMS.

## 1. Trigger Patterns

Se activa ante solicitudes que demanden contrastar versiones de documentos, identificar cambios históricos o explicar la justificación técnica de modificaciones:
- "¿Qué cambió entre la v1 y la v2 del procedimiento de incidentes?"
- "Compara la versión 1 y versión 3 de la política G4-POL-001."
- "Diferencias estructurales entre v1 y v2 del registro de incidentes."
- "¿Por qué se modificó la sección de filiales en la última versión?"
- "Muestra la evolución del documento G4-PRC-INC-001."

## 2. Step Protocol

1. **Aislamiento Multi-Tenant (Filtro G4 Obligatorio)**:
   - Validar que el código del documento posea el prefijo obligatorio `G4-` o que el metadato `responsible` corresponda al Grupo 4 en el esquema compartido de GESTITEL (`unsa`).
   - Herramienta: `pims_adapter.documents.get(code="G4-...")` o `pims_adapter.documents.list(code_prefix="G4-")`.
   - Si el documento no pertenece al namespace `G4-`, abortar inmediatamente la operación.

2. **Inspección de Versiones Disponibles en PIMS**:
   - Consultar el historial de versiones registradas en la API de GESTITEL:
     `pims_adapter.documents.get_versions(doc_id="<pims_doc_id>")`
   - Extraer las versiones requeridas ($v_A$ y $v_B$).
   - Si alguna versión solicitada no existe, ejecutar la rama de fallo controlada (indicar cuál falta y comparar las existentes).

3. **Descarga y Resolución de Artefactos**:
   - Descargar ambas versiones directamente desde PIMS:
     - `pims_adapter.documents.download(doc_id="<pims_doc_id>", version="<v_A>", target_path="corpus_mirror/<doc_id>/v<v_A>.pdf")`
     - `pims_adapter.documents.download(doc_id="<pims_doc_id>", version="<v_B>", target_path="corpus_mirror/<doc_id>/v<v_B>.pdf")`
   - Validar integridad de chunks y SHA-256 contrastando con el manifiesto local de `corpus_mirror`.

4. **Diferenciación Estructural**:
   - Ejecutar el motor de diff estructural del RAG mirror:
     `rag_mirror.diff(file_a="corpus_mirror/<doc_id>/v<v_A>.pdf", file_b="corpus_mirror/<doc_id>/v<v_B>.pdf", mode="structural")`
   - Mapear adiciones, eliminaciones y modificaciones de cláusulas, secciones normativas (ISO/IEC 27701:2025) y controles del SoA.

5. **Extracción y Narración de Racionales (Historial + RAFA)**:
   - Extraer el campo `change_summary` y la tabla de control de cambios del documento en PIMS (`approved_by`, `approved_at`, `why`).
   - Consultar el registro de prompts RAFA (Rol, Alcance, Formato, Ámbito) asociado al mold en `molds/<category>/<doc_code>.rafa.json`.
   - Sintetizar la narrativa contextual:
     - v1 (2019): Certificación inicial.
     - v2 (2022): Reducción de alcance post-pandemia.
     - v3 (2025): Expansión a filiales Camaná y Pedregal y recertificación standalone ISO/IEC 27701:2025.

6. **Publicación del Informe Visual**:
   - Compilar el reporte comparativo en HTML/PDF interactivo.
   - Desplegar el servicio temporal en la red interna de Traefik bajo un slug único:
     `files_sidecar.publish(content=diff_report_html, slug="diff-<doc_id>-v<v_A>-v<v_B>-<timestamp>")`
   - Servir en `https://diff-<doc_id>-v<v_A>-v<v_B>-<timestamp>.pimsai.mistercricro8.top:444`.
   - Concluir la respuesta obligatoriamente con la convención de enlace.

## 3. Failure Branches

- **Versión Faltante en PIMS**:
  - Si la versión solicitada (ej. $v_3$) no existe en PIMS: explicitar taxativamente cuál falta y proceder con la comparación de las versiones disponibles.
  - Formato: `"La versión v3 no existe en PIMS para G4-PRC-INC-001. Versiones registradas en PIMS: v1 (2019), v2 (2022). Procediendo a comparar v1 vs v2."`
- **Falla de Conectividad o API PIMS (500/502/Timeout)**:
  - Reportar el error exacto: `"Error al invocar GET /api/documents/{id}/versions/: 502 Bad Gateway"`.
  - Recurrir inmediatamente a la réplica local de `corpus_mirror` y base vectorial `pgvector`:
    `rag_mirror.query(doc_id="<pims_doc_id>", versions=["<v_A>", "<v_B>"])`
  - Rotular explícitamente en la respuesta que los datos provienen de la réplica local en caché y no de PIMS en vivo.
- **Colisión o Violación Multi-Tenant**:
  - Si la consulta intenta acceder a documentos de otros grupos (sin prefijo `G4-` o con otro responsable):
    `"Acceso denegado: El documento solicitado no pertenece al espacio de trabajo G4 en el tenant compartido."`
- **Límite de Presupuesto Alcanzado (Loan Profile Degraded-at-Cap)**:
  - Si se alcanza el límite de `task.softRequestBudget` o la cuota en perfil loan:
    - La recuperación de datos permanece activa: metadatos de versiones, listados e índices en PIMS y réplica local continúan funcionando.
    - La generación de texto, síntesis narrativa y reportes nuevos se pausa inmediatamente.
    - Mensaje de contacto obligatorio:
      `"Límite de presupuesto de tokens alcanzado en perfil loan. La recuperación continúa activa, pero la generación está pausada. Contacte al equipo Turno B Grupo 4 para ampliación de cuota."`

## 4. Response Shape

```markdown
### Comparación Estructural: [Código Documento] (v[A] vs v[B])
**Documento**: G4-PRC-INC-001 - Procedimiento de Gestión de Incidentes de Privacidad  
**Tenant**: UNSA (Filtro G4 verificado)  
**Estado PIMS**: v[A] (Obsoleto) | v[B] (Vigente)

| Sección / Cláusula | Versión [A] | Versión [B] | Tipo de Cambio | Racional Técnico (Historial / RAFA) |
|---|---|---|---|---|
| Cl. 8.1 - Alcance territorial | Sede Central San Agustín | + Filiales Camaná y Pedregal | Modificación mayor | Expansión recertificación 2025 |
| A.3.11 - Notificación brechas | Plazo genérico | Procedimiento formal sin 72h GDPR | Alineación ISO | Exclusión explícita de GDPR en PIMS |

#### Racional Evolutivo
[Narrativa fundamentada en la tabla de control de cambios de PIMS y contexto RAFA]

resultado aquí: https://diff-g4-prc-inc-001-v1-v2-a7f9.pimsai.mistercricro8.top:444
```
