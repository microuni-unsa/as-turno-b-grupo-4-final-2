# Evidencia RAFA: Procedimiento y Registros de No Conformidades y Acciones Correctivas (G4-PRC-CAPA-01 / G4-REG-CAPA-01)

## 1. R — Rol
- **Agente / Autor**: Auditor Líder del SGPI y Responsable de Mejora Continua de la UNSA (`Ing. Carlos M. Benítez - OSI/DPO`).
- **Revisores y Aprobadores**: Directora Universitaria de TIC (`DUTIC - Mg. Lucía Valdivia Paredes`) y Rector / Presidente del Comité SGPI (`Dr. Hugo José Sánchez`).

## 2. A — Alcance
- **Alcance Operativo**: Cadena completa de remediación originada por auditorías internas (Cl. 9.2), incidentes operacionales de privacidad y brechas de PII (Cl. 8.1 y A.3.12) y revisiones de la dirección (Cl. 9.3) en los procesos de Admisión y Planillas.
- **Variantes de Evolución Territorial y Tecnológica**:
  - `v1.0 (2019)`: Sedes centrales Arequipa; hallazgos vinculados a custodia física de padrones impresos de admisión y errores de correo en planillas. Estados: 100% CERRADA (Verde).
  - `v2.0 (2022)`: Sedes centrales Arequipa; hallazgos en pruebas de penetración web (vulnerabilidad IDOR en portal de admisión virtual) y auditoría de copias de respaldo en teletrabajo. Estados: 75% CERRADA (Verde) y 25% EN_SEGUIMIENTO (Ámbar).
  - `v3.0 (2025)`: Sedes centrales Arequipa + Filiales Camaná (RR N° 0142-2025) y El Pedregal - Majes (RR N° 0143-2025); procedimiento formal nuevo (`G4-PRC-CAPA-01-v3`), hallazgos de gestión de dispositivos móviles (MDM/BitLocker), integridad de interfaces bancarias y defensas anti spear-phishing en filiales. Estados: 85.7% CERRADA (Verde) y 14.3% EN_SEGUIMIENTO (Ámbar).

## 3. F — Formato
- **Arquitectura de Doble Molde Parametrizado**:
  1. `mold-prc-capa.typ`: Molde puro para el procedimiento normativo de no conformidades y acciones correctivas. Replica fielmente las secciones del documento base del instructor (`Procedimiento_para_medidas_correctivas_ES.docx`): Objetivo, alcance y usuarios; Documentos de referencia; Correcciones y medidas correctivas (distinción formal, contención inmediata y erradicación de causa raíz); Implementación de medidas correctivas (tabla de 9 pasos y responsabilidades); Gestión de registros (tabla de 5 columnas); y Validez y gestión de documentos.
  2. `mold-reg-capa.typ`: Molde puro para el registro y formularios individuales de remediación. Incorpora la tabla consolidada de cadena Finding → NC → Causa y CAPA → Dueño → Plazo → Semáforo RAG → Evidencia PIMS, y replica de forma exacta la totalidad de los campos del formulario oficial del instructor (`Apendice_Formulario_para_medidas_correctivas_ES.docx`): Descripción, Fuente de identificación, Persona que identificó, Causa raíz, No conformidad similar previa, Decisión obligatoria SÍ/NO, Plan de acción, Partes informadas, Aprobador, Responsable, Fechas límites y efectivas de implementación, Evaluación de eficacia y Cambios documentales al SGPI.
- **Invocadores Delgados de Versión (~30 líneas)**:
  - Procedimiento: `G4-PRC-CAPA-01-v3.typ` (caller v3.0 formal de la nueva edición 2025).
  - Registros de Evidencia: `G4-REG-CAPA-01-v1.typ`, `G4-REG-CAPA-01-v2.typ` y `G4-REG-CAPA-01-v3.typ`.

## 4. A — Ámbito y Criterio Normativo
- **Cláusulas ISO/IEC 27701:2025**:
  - Cláusula 10.1: Mejora continua de la idoneidad, adecuación y eficacia del SGPI.
  - Cláusula 10.2: No conformidad y acción correctiva (reaccionar ante la no conformidad, controlarla, corregirla y hacer frente a las consecuencias; evaluar la necesidad de acciones para eliminar sus causas de raíz; determinar e implementar las acciones necesarias; revisar la eficacia de las acciones tomadas; realizar cambios en el SGPI si es necesario; y conservar información documentada auditable como evidencia).
  - Control A.3.16 y Guía B.3.16: Mecanismos estructurados para la gestión de la mejora, análisis de causa raíz y seguimiento de efectividad.
- **Trazabilidad Forense e Integración PIMS**: Enlace directo y correlación estricta entre los identificadores de incidentes registrados en `G4-REG-INC-01`, los informes de auditoría `G4-REP-AUD-01` y los fragmentos inmutables del repositorio institucional (`pims:<doc_id>:v<version>:chunk:<lines>`).
