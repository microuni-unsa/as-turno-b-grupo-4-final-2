# Skill: cascade (SPEC 9.8)

Gestión del impacto institucional en cascada derivado de hechos universitarios (university facts) mediante el flujo desacoplado copy-then-fill de moldes parametrizados: registro fechado y con fuente, escaneo de impacto sobre el corpus documental, propuesta de lote de modificación, compuerta de aprobación, ejecución de re-versionado y reporte de documentos modificados y no afectados.

## 1. Trigger Patterns

Se activa ante cambios normativos, institucionales, organizacionales o de infraestructura en la UNSA que impactan transversalmente en múltiples documentos del PIMS:
- "La UNSA aprobó la creación de la filial Pedregal; actualiza los documentos afectados."
- "Se modificó el Estatuto Universitario y el organigrama del Vicerrectorado Académico."
- "Cambió la autoridad de privacidad y el responsable de admisión."
- "Evalúa el impacto de la incorporación del nuevo centro de cómputo en el sistema de gestión."
- "Aplica el cambio institucional X en cascada sobre toda la documentación."

## 2. Step Protocol

1. **Registro del Hecho Universitario (University Fact)**:
   - Crear un registro formal, fechado y con fuente oficial en `university-facts/<fact_slug>.json`:
     ```json
     {
       "fact_id": "FACT-2026-004",
       "date": "2026-11-13",
       "source": "Resolución de Consejo Universitario N° 1042-2026-CU-UNSA",
       "title": "Apertura operativa de Filial Pedregal",
       "scope_impact": ["admision", "incidentes", "recursos_humanos"]
     }
     ```

2. **Aislamiento Multi-Tenant (Filtro G4 Obligatorio)**:
   - Toda búsqueda y escaneo de impacto se restringe rigurosamente a documentos que porten el prefijo `G4-` o estén bajo la custodia del Grupo 4 en el esquema compartido `unsa`:
     `pims_adapter.documents.list(code_prefix="G4-")`

3. **Escaneo de Impacto Transversal**:
   - Ejecutar un análisis de tres vías:
     a) Búsqueda en registro PIMS: `pims_registry.search(keywords=["filial", "pedregal", "sedes"])`.
     b) Búsqueda de literales y parámetros en invocadores de versión y moldes locales: `grep -rn -i "sede central\|filiales" corpus_g4_src/ molds/`.
     c) Búsqueda semántica en réplica vectorial: `rag_mirror.query("filiales sedes descentralizadas alcance geográfico")`.
   - Identificar candidatos a modificación y documentos no afectados.

4. **Propuesta del Lote de Remake (Compuerta de Aprobación Humana)**:
   - Presentar al usuario una matriz estructurada con:
     - Documentos propuestos para re-versionado con su justificación técnica individual y tipo de versión (1.x menor / 2.x o 3.x mayor).
     - Lista explícita de documentos escaneados que **NO** requieren cambios y el porqué.
   - **Regla obligatoria**: Detener la ejecución hasta que el usuario apruebe explícitamente el lote propuesto (ej. "procede", "aprobado", o ajustes al conjunto).

5. **Ejecución de Versionado por Documento (Flujo Copy-Then-Fill)**:
   - Tras recibir la aprobación explícita del usuario, ejecutar el protocolo copy-then-fill de `directed-version` para cada documento del lote aprobado:
     a) **Localizar molde e invocador**: Ubicar el archivo de molde parametrizado `molds/<category>/mold.typ`, el último invocador de versión `corpus_g4_src/<category>/<doc_code>-v<prev>.typ` y la ficha RAFA (`molds/<category>/RAFA.md`). Leer la versión vigente real desde `corpus_mirror/<doc_id>/manifest.json` (para evitar regresiones de versión en singletons).
     b) **Copia a Staging**: Copiar `mold.typ` desde `molds/` y el invocador vigente desde `corpus_g4_src/` a un directorio de trabajo aislado: `cp molds/<category>/mold.typ corpus_g4_src/<category>/<doc_code>-v<prev>.typ /tmp/pims-staging/<doc_code>-v<new_version>/`.
        - **Prohibición Estricta**: Queda terminantemente prohibido mutar `molds/` en su lugar (in-place) para datos de instancia (`molds/` contiene solo plantillas; los invocadores residen en `corpus_g4_src/`). NUNCA editar la prosa de `mold.typ` para hechos de instancia.
     c) **Redacción del nuevo invocador con Diccionario de Datos**: Escribir un NUEVO invocador delgado `G4-XXX-v<new_version>.typ` (~30 líneas) en staging que importe `mold.typ` (`#import "mold.typ": mold`) y defina el diccionario de datos institucional `#let data = (...)`, incorporando el impacto del hecho universitario (sedes, filiales, autoridades, alcance o procesos) y agregando la nueva fila obligatoria en el historial de revisiones con su `change_summary` estructurado.
     d) **Compilación y Renderizado Determinista**: Compilar reproduciblemente desde staging:
        - Para Typst: `typst compile --root . /tmp/pims-staging/<doc_code>-v<new_version>/<doc_code>-v<new_version>.typ /tmp/pims-staging/<doc_code>-v<new_version>/<doc_code>_v<new_version>.pdf`.
        - Para artefactos tabulares XLSX (ej. `incident-register`): ejecutar `bun run generate.ts` desde staging.
        - **Prohibición**: Queda terminantemente prohibido editar a mano los archivos PDF o binarios renderizados.
     e) **Registro en Espejo Local (`corpus_mirror/`)**: Guardar el PDF/XLSX compilado en `corpus_mirror/<doc_id>/v<new_version>.<ext>` y actualizar `manifest.json` con el nuevo hash criptográfico SHA-256 y metadatos de chunking.
     f) **Carga en PIMS como Nueva Versión**: Subir a PIMS vía `POST /api/documents/{id}/versions/` enviando el PDF generado y el `change_summary` estructurado de 3 partes (`TIPO_CAMBIO :: Razón :: Modificaciones :: Impacto`).
     g) **Re-Ingesta Vectorial RAG**: Ejecutar la ingesta inmediata en `pimsai-db` (`chunks` + `pims_registry` con SHA-256 por chunk y mistral-embed 1024-dim).
   - **Regla del ciclo de vida e inmutabilidad**: Las versiones anteriores quedan en estado `obsoleto` (`O`) en PIMS y se conservan descargables en `corpus_mirror/` (preservación histórica / "time-machine"). Las eliminaciones definitivas (*true deletes*) solo se admiten en casos excepcionales de contaminación de datos o erratas críticas debidamente registradas en bitácora.

6. **Generación del Reporte de Cascada y Publicación**:
   - Consolidar el informe final discriminando documentos actualizados (con enlaces y hashes) frente a documentos que permanecieron intactos.
   - Publicar el reporte vía `files-sidecar`:
     `POST http://pimsai-files-sidecar:3000/api/publish` (`slug: "cascade-<fact_slug>-<timestamp>"`)
   - Servir en `https://files.pimsai.mistercricro8.top:444/p/cascade-<fact_slug>-<timestamp>`.
   - Concluir obligatoriamente la respuesta con: `"resultado aquí: link"`.

## 3. Failure Branches

- **Rechazo o Modificación del Lote Propuesto**:
  - Si el usuario excluye o añade documentos a la propuesta:
    `"Ajustando el lote según instrucciones: Documento G4-POL-002 excluido de la cascada. Esperando confirmación para el nuevo subconjunto."`
- **Falla Parcial Durante la Subida en Lote a PIMS**:
  - Si falla la subida de un documento específico: no detener los restantes. Registrar el error del documento fallido, continuar con el lote y reportar al final el desglose exacto (exitosos vs fallidos).
- **Solicitud de Eliminación Definitiva (True Delete)**:
  - Si se exige borrar una versión: verificar que corresponda a contaminación de datos o errata. Registrar en `logs/audit_deletes.log` con timestamp, usuario y justificación antes de llamar al endpoint de borrado.
- **Límite de Presupuesto Alcanzado (Loan Profile Degraded-at-Cap)**:
  - Si se alcanza el límite de `task.softRequestBudget` o la cuota en perfil loan:
    - La recuperación de datos permanece activa: el escaneo de impacto, lectura de hechos y listados de documentos continúan funcionando.
    - La regeneración masiva de documentos mediante copy-then-fill y las escrituras en PIMS se pausan de inmediato.
    - Mensaje de contacto obligatorio:
      `"Límite de presupuesto de tokens alcanzado en perfil loan. La recuperación continúa activa, pero la re-ejecución en cascada está pausada. Contacte al equipo Turno B Grupo 4 para ampliación de cuota."`

## 4. Response Shape

### Fase A: Propuesta de Impacto (Esperando Aprobación)
```markdown
### Propuesta de Impacto en Cascada: [ID Hecho Institucional]
**Hecho Registrado**: `university-facts/fact-2026-004.json`  
**Fuente**: Resolución de Consejo Universitario N° 1042-2026-CU-UNSA  
**Tenant**: GESTITEL `unsa` (Filtrado estricto Grupo 4)

#### Documentos Propuestos para Re-Versionado
| Código | Título | Versión Actual | Versión Propuesta | Tipo Incremento | Justificación del Impacto |
|---|---|---|---|---|---|
| G4-PRC-INC-001 | Procedimiento de Incidentes | v1.2 | v2.0 | 2.x (Mayor) | Nuevas vías de reporte y atención en Filial Pedregal |
| G4-MAN-ALC-001 | Manual de Alcance PIMS | v1.0 | v1.1 | 1.x (Menor) | Inclusión de Pedregal en el alcance físico evaluado |

#### Documentos Analizados NO Afectados
- `G4-POL-RET-001` (Política de Retención): Las políticas de retención de admisiones aplican de manera uniforme sin distinción geográfica.
- `G4-PRC-SEG-001` (Procedimiento de Respaldos): La infraestructura de servidores se centraliza en Sede Central San Agustín.

> ⚠️ **Compuerta de Aprobación**:  
> ¿Deseas aprobar la ejecución del lote para generar y cargar las nuevas versiones en PIMS? Responde 'procede' para iniciar.
```

### Fase B: Reporte Post-Ejecución
```markdown
### Reporte de Cascada Completado
Se ejecutó el re-versionado en PIMS y la re-indexación RAG mediante flujo copy-then-fill:
- ✅ `G4-PRC-INC-001`: v1.2 → **v2.0** (Registrado en PIMS, 18 chunks ingestados).
- ✅ `G4-MAN-ALC-001`: v1.0 → **v1.1** (Registrado en PIMS, 12 chunks ingestados).
- ℹ️ Versiones anteriores preservadas en PIMS como *obsoletas* (descargables).

resultado aquí: https://files.pimsai.mistercricro8.top:444/p/cascade-fact-2026-004-9a4f
```
