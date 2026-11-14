# Evidencia RAFA: Cadena de Hallazgos, No Conformidades y Acciones Correctivas (G4-REG-CAPA-01)

## 1. R — Rol
- **Agente / Autor**: Auditor Líder del SGPI y Responsable de Mejora Continua de la UNSA (`Ing. Carlos M. Benítez`).
- **Revisores y Aprobadores**: Directora Universitaria de TIC (`DUTIC - Mg. Lucía Valdivia`) y Comité de Gobierno Digital y Privacidad (`Dr. Hugo José Sánchez`).

## 2. A — Alcance
- **Alcance Operativo**: Cadena completa de remediación originada por auditorías internas (Cl. 9.2.2) e incidentes operacionales de privacidad (Cl. 8.1 y A.3.12) en los procesos de Admisión y Planillas.
- **Variantes de Evolución**:
  - `v1.0 (2019)`: Sedes centrales Arequipa; hallazgos vinculados a custodia física de padrones de admisión y errores de correo en planillas.
  - `v2.0 (2022)`: Sedes centrales Arequipa; hallazgos en pruebas de penetración web (IDOR en portal de admisión) y auditoría de copias de seguridad.
  - `v3.0 (2025)`: Sedes Arequipa + Filiales Camaná y El Pedregal (Majes); hallazgos de gestión de dispositivos móviles (MDM/BitLocker) y sincronización intersedes.

## 3. F — Formato
- **Moldes Typst 0.15**: `G4-REG-CAPA-01-v1.typ`, `G4-REG-CAPA-01-v2.typ`, `G4-REG-CAPA-01-v3.typ`.
- **Estructura de la Cadena (SPEC 6.2 #3)**:
  - Registro tabular con estados visuales RAG (Rojo = Abierta / Vencida, Ámbar = En Proceso, Verde = Cerrada y Verificada).
  - Campos obligatorios: ID de Hallazgo, Clasificación (NC Mayor, NC Menor, Observación), Causa Raíz, Acción Correctiva, Dueño / Responsable institucional, Fecha Límite improrrogable, Estado RAG y Enlaces de Evidencia PIMS (`pims:<doc_id>:v<version>:chunk:<lines>`).

## 4. A — Ámbito y Criterio Normativo
- **Cláusulas ISO/IEC 27701:2025**:
  - Cláusula 9.2.2: Programa de auditoría interna y resultados de evaluación.
  - Cláusula 10.2: No conformidades y acciones correctivas (reaccionar ante la no conformidad, evaluar la necesidad de acciones para eliminar causas raíz, implementar acciones, revisar su eficacia y conservar información documentada).
- **Integración con Incidentes**: Cierre sistemático de las brechas registradas en `G4-REG-INC-01` mediante acciones preventivas estructurales.
