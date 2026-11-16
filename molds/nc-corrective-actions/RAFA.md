# Evidencia RAFA y Nota de Fidelidad: Procedimiento y Registros de No Conformidades y Acciones Correctivas (G4-PRC-CAPA-01 / G4-REG-CAPA-01)

## 1. R — Rol
- **Agente / Autor**: Oficial de Seguridad de la Información y Delegado de Protección de Datos (`Ing. Carlos M. Benítez - OSI/DPO`).
- **Revisores y Aprobadores**: Directora Universitaria de TIC (`DUTIC - Mg. Lucía Valdivia Paredes`) y Rector / Presidente del Comité SGPI (`Dr. Rohel Sánchez Sánchez` en v1; `Dr. Hugo José Sánchez` en v2 y v3).

## 2. A — Alcance
- **Alcance Operativo**: Cadena completa de remediación originada por auditorías internas (Cl. 9.2), incidentes operacionales de privacidad y brechas de PII (Cl. 8.1 y A.3.12) y revisiones de la dirección (Cl. 9.3) en los procesos de Admisión y Planillas de la UNSA.
- **Variantes de Evolución Territorial y Tecnológica**:
  - `v1.0 (2019-04-15)`: Sedes centrales Arequipa (Ingenierías, Biomédicas, Sociales); procesos presenciales de Admisión y Planillas; hallazgos vinculados a custodia física de padrones impresos de admisión y errores de correo en planillas. Estados: 100% CERRADA (Verde).
  - `v2.0 (2022-09-10)`: Sedes centrales Arequipa; virtualización de admisiones (`admision.unsa.edu.pe`) y teletrabajo de nóminas; hallazgos en pruebas de penetración web (vulnerabilidad IDOR en portal de admisión virtual) y auditoría de copias de respaldo en teletrabajo.
  - `v3.0 (2025-10-28)`: Sedes centrales Arequipa + Filiales Camaná (RR N° 0142-2025) y El Pedregal - Majes (RR N° 0143-2025); recertificación bajo ISO/IEC 27701:2025 (Segunda edición); hallazgos de gestión de dispositivos móviles (MDM/BitLocker), integridad de interfaces bancarias y defensas anti spear-phishing en filiales.

## 3. F — Formato
- **Arquitectura de Doble Molde Parametrizado (Zero Instance Data)**:
  1. `mold-prc-capa.typ`: Molde puro para el procedimiento normativo de medidas correctivas. Replica fielmente las secciones verbatim del instructor (`Procedimiento_para_medidas_correctivas_ES.docx`):
     - 1. Objetivo, alcance y usuarios (sin sub-splits inventados de nivel 2).
     - 2. Documentos de referencia (actualizados a ISO/IEC 27701:2025 Cl. 10.1/10.2).
     - 3. Correcciones y medidas correctivas (3.1 No conformidades y correcciones, 3.2 Medidas correctivas, 3.3 Implementación de medidas correctivas con tabla de 9 pasos).
     - 4. Gestión de registros guardados en base a este documento (tabla de 5 columnas del instructor).
     - 5. Validez y gestión de documentos (criterios verbatim de efectividad y vigencia).
     - 6. Apéndices (referencia a G4-REG-CAPA-01).
  2. `mold-reg-capa.typ`: Molde puro para el formulario de medidas correctivas. Replica de forma idéntica las 12 filas del formulario oficial del instructor (`Apendice_Formulario_para_medidas_correctivas_ES.docx`):
     - Fila 1: Medida correctiva nro.____
     - Fila 2: Descripción de la no-conformidad:
     - Fila 3: No-conformidad identificada en / Nombre de la persona / Firma
     - Fila 4: Causa de la no-conformidad:
     - Fila 5: Si ya existe una no conformidad similar, indique aquí su Medida correctiva Nro.:
     - Fila 6: ¿Es necesario tomar medidas correctivas? SÍ - NO (marcar con un círculo)
     - Fila 7: Medida correctiva a implementar:
     - Fila 8: ¿Quién debe estar informado sobre la medida implementada?:
     - Fila 9: Aprobado por / Fecha límite para la implementación / Persona responsable de la implementación
     - Fila 10: Medida correctiva implementada el / Firma
     - Fila 11: Efectividad de la medida implementada revisada el / Firma
     - Fila 12: Si es necesario realizar cambios al documento, especifíquelos aquí: / Firma
     - RAG state se visualiza exclusivamente como un tag discreto en el encabezado/efectividad, sin reestructuración ni tablas agregadas.
- **Invocadores de Versión Delgados (6 callers en total)**:
  - Procedimiento: `G4-PRC-CAPA-01-v1.typ`, `G4-PRC-CAPA-01-v2.typ`, `G4-PRC-CAPA-01-v3.typ`.
  - Registros de Evidencia: `G4-REG-CAPA-01-v1.typ`, `G4-REG-CAPA-01-v2.typ`, `G4-REG-CAPA-01-v3.typ`.

## 4. A — Ámbito y Criterio Normativo
- **Cláusulas ISO/IEC 27701:2025**:
  - Cláusula 10.1: Mejora continua de la idoneidad, adecuación y eficacia del SGPI.
  - Cláusula 10.2: No conformidad y acción correctiva (reaccionar, contener, erradicar causa raíz, verificar efectividad, conservar registros).
  - Control A.3.16 y Guía B.3.16: Mecanismos para la gestión de la mejora, análisis de causa raíz y seguimiento de efectividad.
- **Trazabilidad Forense e Integración PIMS**: Enlace y correlación con incidentes registrados en `G4-REG-INC-01` e informes de auditoría `G4-REP-AUD-01`.

## 5. Nota de Fidelidad Visual (Fidelity Note)
- Eliminadas todas las secciones inventadas previas: "Propósito y Fundamento Normativo", "Estructura Metodológica de la Cadena de Remediación", "Evaluación Global de Eficacia Institucional", sub-splits `== Objetivo / == Alcance / == Usuarios`.
- El procedimiento coincide 1:1 en secciones, orden y columnas con `Procedimiento_para_medidas_correctivas_ES.docx` (`docs/templates-render/procedimiento-para-medidas-correctivas/p01.png`-`p06.png`).
- El formulario coincide 1:1 en las 12 filas y campos con `Apendice_Formulario_para_medidas_correctivas_ES.docx` (`docs/templates-render/apendice-formulario-para-medidas-correctivas/p01.png`-`p02.png`).
