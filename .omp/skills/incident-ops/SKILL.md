# Skill: incident-ops (SPEC 9.2)

Consulta y gestión operativa de la cadena de no conformidades, incidentes y acciones correctivas con clasificación semafórica (Rojo/Ámbar/Verde) orientada a la toma de decisiones según el estándar audit4.

## 1. Trigger Patterns

Se activa ante consultas sobre la salud operativa del sistema de gestión de incidentes, estado de no conformidades o seguimiento de acciones correctivas:
- "¿Cuál es el estado de los incidentes y no conformidades?"
- "Muestra el semáforo de acciones correctivas de incidentes."
- "¿Quiénes tienen acciones vencidas o pendientes en incidentes?"
- "Reporte de hallazgos de incidentes y evidencias asociadas."
- "Revisa el cumplimiento de compromisos tras la última auditoría."

## 2. Step Protocol

1. **Aislamiento Multi-Tenant (Filtro G4 Obligatorio)**:
   - Consultar la API de PIMS asegurando el filtrado estricto por prefijo `G4-` y nombres de responsables asignados al Grupo 4 en el esquema compartido `unsa`:
     `pims_adapter.incidents.list(code_prefix="G4-")`
     `pims_adapter.incidents.get_corrective_actions(code_prefix="G4-")`
   - Descartar cualquier registro perteneciente a otros grupos de trabajo para prevenir contaminación cruzada.

2. **Resolución de la Cadena Hallazgo → NC → Acción Correctiva**:
   - Reconstruir la trazabilidad operativa por cada incidente:
     - Hallazgo (`G4-FND-xxx`): Origen del desvío (ISO/IEC 27701:2025 Cl. 8.1, A.3.11, etc.).
     - No Conformidad (`G4-NC-xxx`): Descripción de la falla de control.
     - Acción Correctiva (`G4-ACT-xxx`): Tarea de mitigación asignada, responsable y fecha límite de levantamiento.
   - Contrastar la fecha de compromiso (`deadline`) frente a la fecha de evaluación actual y verificar el estado de la evidencia documental en PIMS.

3. **Clasificación Semafórica (Estándar audit4)**:
   - **Rojo (Vencido / Crítico)**:
     - Criterio: Plazo de implementación vencido sin evidencia adjunta o acción no atendida.
     - Objetivo operativo audit4: Convocatoria urgente a **reunión de 5 minutos** (apercibimiento por escrito / llamada de atención formal).
   - **Ámbar (En curso / Próximo a vencer)**:
     - Criterio: Acción en progreso, dentro de plazo o con observaciones intermedias por subsanar antes de la visita de auditoría externa.
     - Objetivo operativo audit4: **Reunión de seguimiento a las 10:00 h** (identificación de faltantes: recursos, proveedores, presupuesto o apoyo administrativo).
   - **Verde (Cerrado / Conforme)**:
     - Criterio: Acción ejecutada al 100%, verificada con evidencia documental registrada en PIMS.
     - Objetivo operativo audit4: **Invitación a almuerzo de reconocimiento** (felicitación formal y socialización de buenas prácticas).

4. **Extracción y Validación de Evidencia Documental**:
   - Verificar la existencia de enlaces a documentos en PIMS mediante cita estandarizada:
     `pims:<doc_id>:v<version>:chunk:lines`
   - Si no existe evidencia cargada, marcar la celda correspondiente como pendiente de sustento.

5. **Enlace Proactivo con Summons-Dispatch**:
   - Ofrecer la preparación inmediata de citaciones a través del skill `summons-dispatch` para los responsables de las filas Rojas o Ámbar identificadas.

6. **Publicación del Tablero Operativo**:
   - Generar el dashboard de control de incidentes.
   - Desplegar el servicio temporal en contenedor Traefik bajo un slug único:
     `files_sidecar.publish(content=dashboard_html, slug="incident-ops-<timestamp>")`
   - Servir en `https://incident-ops-<timestamp>.pimsai.mistercricro8.top`.
   - Concluir obligatoriamente con la convención: `"resultado aquí: link"`.

## 3. Failure Branches

- **Falla en API PIMS (500/503/Timeout)**:
  - Notificar el incidente técnico: `"Falla al consultar pims_adapter.incidents.list: Conexión rechazada por GESTITEL"`.
  - Consultar la réplica local pgvector:
    `rag_mirror.query(filter={"tenant": "G4", "type": "incident_action"})`
  - Rotular claramente en la respuesta que el semáforo se calcula sobre la réplica local en caché.
- **Registros Ajenos al Tenant G4**:
  - Si la API retorna incidentes de otros grupos, aplicar exclusión silenciosa y registrar advertencia interna. Si ningún registro pertenece a G4, responder: `"No se encontraron registros de incidentes o no conformidades para el grupo G4 en PIMS."`
- **Falta de Evidencia Vinculada**:
  - Si una acción marcada como cerrada carece de cita documental verificable, reclasificar automáticamente la fila a Ámbar con advertencia de auditoría.
- **Límite de Presupuesto Alcanzado (Loan Profile Degraded-at-Cap)**:
  - Si se alcanza el límite de `task.softRequestBudget` o cuota loan:
    - La recuperación de datos permanece activa: lectura de incidentes, estados y semáforos existentes desde PIMS o réplica local continúa funcionando.
    - La generación de análisis complejos y sugerencias de gestión se pausa inmediatamente.
    - Mensaje de contacto obligatorio:
      `"Límite de presupuesto de tokens alcanzado en perfil loan. La recuperación continúa activa, pero la generación está pausada. Contacte al equipo Turno B Grupo 4 para ampliación de cuota."`

## 4. Response Shape

```markdown
### Tablero Operativo de Incidentes y Acciones Correctivas (G4 - UNSA)
**Alcance**: Sistema de Gestión de Privacidad PIMS (ISO/IEC 27701:2025 Cl. 8.1 / 10.2)  
**Tenant**: GESTITEL `unsa` (Filtrado estricto Grupo 4)

| Semáforo | Hallazgo / NC | Acción Correctiva | Responsable (G4) | Vencimiento | Evidencia PIMS | Acción Operativa Recomendada (audit4) |
|---|---|---|---|---|---|---|
| 🔴 ROJO | G4-FND-001 / G4-NC-001 | Implementar doble factor en admisión | Carlos Mamani | 2026-10-15 (Vencido) | *Sin evidencia* | Reunión de 5 min (apercibimiento por escrito) |
| 🟡 ÁMBAR | G4-FND-002 / G4-NC-002 | Actualizar cláusula de cesión filiales | Lucía Flores | 2026-11-30 (17 días) | `pims:G4-PRC-INC-001:v2:chunk-04:L12-L28` | Reunión 10:00 h (seguimiento y recursos) |
| 🟢 VERDE | G4-FND-003 / G4-NC-003 | Capacitación en respuesta a brechas | Jorge Ramos | 2026-11-01 (Cerrado) | `pims:G4-REG-CAP-001:v1:chunk-01:L05-L40` | Invitación a almuerzo de reconocimiento |

#### Resumen Ejecutivo
- **Acciones Rojas**: 1 (Atención inmediata requerida).
- **Acciones Ámbar**: 1 (Monitoreo preventivo previo a auditoría externa).
- **Acciones Verdes**: 1 (Cerradas con evidencia documental íntegra).

¿Deseas que prepare el borrador de citaciones para los responsables en Rojo y Ámbar mediante el conector de correo?

resultado aquí: https://incident-ops-g4-live-8b2c.pimsai.mistercricro8.top
```
