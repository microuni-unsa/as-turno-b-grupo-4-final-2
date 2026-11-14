# Skill: audit-chain (SPEC 9.6)

Trazabilidad exhaustiva y determinista de la cadena de auditoría (Hallazgo → No Conformidad → Acción Correctiva → Evidencia Documental) con citación exacta y verificable a nivel de líneas en PIMS ("ChatGPT can't do this proof").

## 1. Trigger Patterns

Se activa ante solicitudes para rastrear o auditar el sustento documental de desvíos, no conformidades o planes de acción correctiva:
- "Explica el hallazgo FND-002 y muestra su evidencia."
- "¿Dónde está la evidencia que sustenta la no conformidad G4-NC-001?"
- "Rastrea la cadena de auditoría desde el hallazgo hasta el documento en PIMS."
- "Demuestra que la acción correctiva de incidentes tiene sustento auditable."
- "¿Cómo se justifica el cierre del hallazgo de autenticación en admisión?"

## 2. Step Protocol

1. **Aislamiento Multi-Tenant (Filtro G4 Obligatorio)**:
   - Comprobar que el identificador del hallazgo, NC o acción contenga el prefijo `G4-` y corresponda a registros asignados al Grupo 4 en el esquema compartido `unsa`:
     `pims_adapter.audits.get_finding(finding_id="G4-FND-...")`
     `pims_adapter.incidents.get_chain(prefix="G4-")`
   - Si el registro pertenece a otro grupo o carece de prefijo `G4-`, denegar el acceso inmediatamente.

2. **Reconstrucción Integral de la Cadena de Auditoría**:
   - Mapear secuencialmente los eslabones:
     - **Hallazgo (`G4-FND-xxx`)**: Identificador de la observación, cláusula normativa (ej. ISO/IEC 27701:2025 Cl. 8.1, A.3.11, Cl. 9.2.2) y descripción del auditor.
     - **No Conformidad (`G4-NC-xxx`)**: Clasificación (Mayor / Menor / Observación) y análisis de causa raíz.
     - **Acción Correctiva (`G4-ACT-xxx`)**: Medida de tratamiento, responsable asignado (Grupo 4), plazo de ejecución (`deadline`) y estado de aprobación.

3. **Localización y Extracción de Evidencia en Réplica PIMS (pgvector)**:
   - Localizar el fragmento documental asociado en la base vectorial:
     `rag_mirror.query(filter={"code": "<doc_code>", "version": "<version>"}, query="<evidence_criteria>")`
   - Extraer la cita textual exacta (verbatim quote) y las coordenadas exactas de líneas y fragmento.

4. **Citación Exacta Determinista (Formato Normativo Obligatorio)**:
   - Construir la cita obligatoria en el formato estricto:
     `pims:<doc_id>:v<version>:chunk:lines`
     Ejemplo: `pims:G4-PRC-INC-001:v2:chunk-04:L12-L28`
   - Incorporar el hash criptográfico SHA-256 del fragmento verificado en el manifiesto de `corpus_mirror` como prueba de inalterabilidad ("ChatGPT can't do this").

5. **Publicación de la Ficha de Evidencia**:
   - Generar la ficha de trazabilidad auditable en HTML interactivo con enlaces a los visores de PIMS.
   - Desplegar el servicio temporal en contenedor Traefik bajo un slug único:
     `files_sidecar.publish(content=audit_chain_html, slug="chain-<finding_id>-<timestamp>")`
   - Servir en `https://chain-<finding_id>-<timestamp>.pimsai.mistercricro8.top`.
   - Concluir obligatoriamente la respuesta con la convención: `"resultado aquí: link"`.

## 3. Failure Branches

- **Registro Ajeno al Tenant G4**:
  - Si el hallazgo pertenece a otro grupo del tenant compartido:
    `"Acceso denegado: El hallazgo solicitado no pertenece al grupo G4 en el tenant compartido de GESTITEL."`
- **Cadena Rota o Evidencia Faltante en PIMS**:
  - Si una acción correctiva no tiene asociado un documento o versión en PIMS:
    `"Cadena de auditoría rota: La acción correctiva G4-ACT-002 no cuenta con un documento de sustento vinculado en PIMS. Estado clasificado como Observación Pendiente."`
- **Falla en Conexión a PIMS en Vivo**:
  - Si la API de GESTITEL no responde:
    - Recuperar la cadena desde la réplica local pgvector: `rag_mirror.get_chain(finding_id="<id>")`.
    - Indicar con claridad: `"Consulta resuelta desde la réplica local de auditoría (pgvector). Estado de sincronización: 2026-11-13."`
- **Límite de Presupuesto Alcanzado (Loan Profile Degraded-at-Cap)**:
  - Si se alcanza el límite de `task.softRequestBudget` o la cuota en perfil loan:
    - La recuperación de datos permanece activa: consulta de registros, tablas y citas exactas `pims:...` preindexadas continúa funcionando sin interrupción.
    - La generación de análisis profundos y redacción de argumentos extendidos se pausa inmediatamente.
    - Mensaje de contacto obligatorio:
      `"Límite de presupuesto de tokens alcanzado en perfil loan. La recuperación continúa activa, pero la generación analítica está pausada. Contacte al equipo Turno B Grupo 4 para ampliación de cuota."`

## 4. Response Shape

```markdown
### Cadena de Trazabilidad de Auditoría: G4-FND-002
**Norma de Referencia**: ISO/IEC 27701:2025 Cl. 8.1 / Control A.3.11  
**Tenant**: UNSA (Filtrado estricto Grupo 4 verificado)

#### 1. Hallazgo de Auditoría
- **ID**: `G4-FND-002`
- **Descripción**: Falta de procedimiento específico para notificación y registro de brechas en filiales periféricas (Camaná y Pedregal).

#### 2. No Conformidad
- **ID**: `G4-NC-002`
- **Severidad**: Menor
- **Causa Raíz**: Alcance v2 del PIMS restringido a sede central post-pandemia; no se adaptó el flujo operativo tras reapertura de filiales en 2025.

#### 3. Acción Correctiva
- **ID**: `G4-ACT-002`
- **Responsable**: Lucía Flores (Coordinadora de Filiales - G4)
- **Plazo**: 2026-11-30
- **Estado**: En revisión / Conforme

#### 4. Evidencia Documental Verificable ("ChatGPT can't do this")
- **Cita Canónica**: `pims:G4-PRC-INC-001:v2:chunk-04:L12-L28`
- **SHA-256 Fragmento**: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- **Texto Verbatim Extraído de PIMS**:
  > *"Sección 4.3: En las filiales de Camaná y Pedregal, el responsable de sede notificará de inmediato al Oficial de Privacidad del PII Controller (UNSA) cualquier incidente que comprometa datos personales de postulantes o personal docente..."*

resultado aquí: https://chain-g4-fnd-002-9c1a.pimsai.mistercricro8.top
```
