# Evidencia RAFA: Gestión de Riesgos de Incidentes de Privacidad (G4-MET-RSK-01, G4-RSK-INC-01, G4-PLN-RSK-01)

## 1. R — Rol (Role)
- **Agente / Especialista**: Gestor Líder de Riesgos de Privacidad del SGPI y Oficial de Seguridad de la Información / DPO (`Ing. Carlos M. Benítez`).
- **Revisores y Aprobadores**:
  - Revisor Técnico: Directora Universitaria de Tecnologías de la Información y Comunicación (`DUTIC - Mg. Lucía Valdivia Paredes`).
  - Dueños de Riesgo Institucionales: Director General de Admisión (`Dr. Walter Delgado Manrique`) y Subdirectora de Personal (`Lic. Martha Elena Córdova`).
  - Aprobador Institucional: Rector y Presidente del Comité de Gobierno Digital y Privacidad (`Dr. Rohel Sánchez Sánchez` en 2019 / `Dr. Hugo José Sánchez` en 2022 y 2025).

## 2. A — Alcance (Scope)
- **Perímetro Operacional**: Proceso Misional de Admisión (Ordinario, CEPRUNSA, filiales descentralizadas) y Proceso de Apoyo de Planillas de Remuneraciones (personal docente y administrativo).
- **Alcance Geográfico y Temporal**:
  - `v1.0 (2019-04-15)`: Sedes Centrales Arequipa (Áreas de Ingenierías, Biomédicas y Sociales). Enfoque en custodia de padrones impresos con huellas/fotos, seguridad perimetral de Data Center DUTIC y boletas físicas/correo masivo.
  - `v2.0 (2022-09-10)`: Sedes Centrales Arequipa en contexto post-pandemia. Virtualización integral vía portal web `admision.unsa.edu.pe`, teletrabajo con VPN SSL y respaldos automatizados de bases de datos PostgreSQL.
  - `v3.0 (2025-10-28)`: Expansión multisede a Filial Camaná (RR 0142-2025) y Filial El Pedregal - Majes (RR 0143-2025). Riesgos en terminales móviles con TPM 2.0 y MDM (Intune), sincronización de haberes mediante túneles VPN IPSec IKEv2 y mitigación de spear-phishing bancario con DMARC.

## 3. F — Formato (Format)
- **Arquitectura de Carpeta Desacoplada**:
  - `mold.typ`: Molde puro parametrizado con cero datos hardcodeados de instancia UNSA. Importa `"../common/template.typ"` y exporta la función principal `mold(data)` que despacha automáticamente según `data.code`:
    - `G4-MET-RSK-01`: Metodología réplica fiel 1:1 de `Metodologia_de_evaluacion_y_tratamiento_de_riesgos_ES.docx` (9 páginas de referencia).
    - `G4-RSK-INC-01`: Reporte Apéndice 3 (`Apendice_3_Informe_sobre_evaluacion_y_tratamiento_ES.docx`) + Cuadro de Evaluación Apéndice 1 (layout Excel de 10 columnas) + Cuadro de Tratamiento Apéndice 2 (layout Excel de 14 columnas con cabecera de 2 niveles).
    - `G4-PLN-RSK-01`: Plan de Tratamiento del Riesgo con tabla estandarizada de 7 columnas según `Plan_de_tratamiento_del_riesgo_ES.docx`.
  - **Invocadores Delgados de Versión (9 archivos exactos)**:
    - `G4-MET-RSK-01-v1.typ`: Metodología v1.0 (2019-04-15).
    - `G4-MET-RSK-01-v2.typ`: Metodología v2.0 (2022-09-10).
    - `G4-MET-RSK-01-v3.typ`: Metodología v3.0 (2025-10-28).
    - `G4-RSK-INC-01-v1.typ`: Matriz y Reporte de Evaluación v1.0 (2019-04-15).
    - `G4-RSK-INC-01-v2.typ`: Matriz y Reporte de Evaluación v2.0 (2022-09-10).
    - `G4-RSK-INC-01-v3.typ`: Matriz y Reporte de Evaluación v3.0 (2025-10-28).
    - `G4-PLN-RSK-01-v1.typ`: Plan de Tratamiento v1.0 (2019-04-15).
    - `G4-PLN-RSK-01-v2.typ`: Plan de Tratamiento v2.0 (2022-09-10).
    - `G4-PLN-RSK-01-v3.typ`: Plan de Tratamiento v3.0 (2025-10-28).
  - Cero copias locales de `template.typ`.
  - Cero marcadores sin resolver (`[cargo]`, `[nombre]`, `[fecha]`, `TODO`).

## 4. A — Ámbito y Criterio Normativo (Normative Context)
- **Estándar Rector**: ISO/IEC 27701:2025 (Segunda edición, octubre 2025, PIMS independiente).
- **Cláusulas Normativas Específicas**:
  - *Cláusula 6.1.2 (Evaluación de riesgos de privacidad)*: Mandato de evaluar el impacto dual, considerando las consecuencias directas sobre los titulares de datos (*PII principals*).
  - *Cláusula 6.1.3 (Tratamiento de riesgos de privacidad)*: Selección de controles de Tablas A.1 y A.3, exclusión fundada de Tabla A.2, y formulación del Plan de Tratamiento (6.1.3.f).
  - *Cláusulas 8.2 y 8.3 (Operación)*: Retención de información documentada de resultados de evaluación y tratamiento.
- **Parámetros Cuantitativos Estandarizados del Instructor**:
  - Escala de Consecuencia (0 a 2): 0 = Baja, 1 = Moderada, 2 = Alta (afectación severa a titulares o sanciones ANPD).
  - Escala de Probabilidad (0 a 2): 0 = Baja, 1 = Moderada, 2 = Alta.
  - Cálculo de Riesgo: $R = "Consecuencia" + "Probabilidad"$ (rango 0 a 4).
  - Umbral de Aceptabilidad: 0 a 2 = Aceptable (Verde); 3 y 4 = No Aceptable (requiere tratamiento obligatorio).
  - Cuatro opciones canónicas de tratamiento: 1. Elección de controles ISO 27701 Anexo A; 2. Transferencia a terceros; 3. Evitar el riesgo; 4. Aceptación formal justificada por Alta Dirección.
- **Marco Legal Nacional**: Ley N° 29733 (Ley de Protección de Datos Personales del Perú), su Reglamento (D.S. 003-2013-JUS) y Ley Universitaria N° 30220.

---

## 5. Nota de Fidelidad Visual y Mapeo Estructural 1:1

### A) G4-MET-RSK-01 (Metodología de evaluación y tratamiento de riesgos)
- **Plantilla Fuente**: `Metodologia_de_evaluacion_y_tratamiento_de_riesgos_ES.docx` (`metodologia-de-evaluacion-y-tratamiento-de-riesgos`, 9 páginas).
- **Desviaciones estructurales**: Cero (0).

| Sección Fuente Instructor | Sección en Molde Typst (`render-methodology`) | Estado de Fidelidad |
|---|---|---|
| Portada / Metadatos (Tabla 1) | Carátula institucional con metadatos de control (Tabla 1 de 6 filas) | Idéntico 1:1 (`doc-template`) |
| Historial de modificaciones (Tabla 2) | Historial de Revisiones del Documento (Tabla 2 de 4 col) | Idéntico 1:1 (`doc-template`) |
| Tabla de contenido | Índice de Contenidos analítico dinámico | Idéntico 1:1 (`outline`) |
| 1. Objetivo, alcance y usuarios | `= Objetivo, alcance y usuarios` | Idéntico 1:1 (verbatim) |
| 2. Documentos de referencia | `= Documentos de referencia` | Idéntico 1:1 (verbatim) |
| 3. Metodología de evaluación y tratamiento de riesgos | `= Metodología de evaluación y tratamiento de riesgos` | Idéntico 1:1 (verbatim) |
| 3.1. Evaluación de riesgos | `== Evaluación de riesgos` | Idéntico 1:1 (verbatim) |
| 3.1.1. El proceso | `=== El proceso` | Idéntico 1:1 (verbatim) |
| 3.1.2. Activos, vulnerabilidades y amenazas | `=== Activos, vulnerabilidades y amenazas` | Idéntico 1:1 (verbatim) |
| 3.1.3. Identificación de los propietarios de riesgos | `=== Identificación de los propietarios de riesgos` | Idéntico 1:1 (verbatim) |
| 3.1.4. Consecuencias y probabilidad | `=== Consecuencias y probabilidad` (Tablas 3 y 4 de 3×3) | Idéntico 1:1 (verbatim) |
| 3.2. Criterios para la aceptación de riesgos | `== Criterios para la aceptación de riesgos` | Idéntico 1:1 (verbatim) |
| 3.3. Tratamiento del riesgo | `== Tratamiento del riesgo` (4 opciones canónicas) | Idéntico 1:1 (verbatim) |
| 3.4. Revisiones periódicas de la evaluación y el tratamiento | `== Revisiones periódicas de la evaluación y el tratamiento de riesgos` | Idéntico 1:1 (verbatim) |
| 3.5. Declaración de aplicabilidad y Plan de tratamiento | `== Declaración de aplicabilidad y Plan de tratamiento del riesgo` | Idéntico 1:1 (verbatim) |
| 3.6. Informes | `== Informes` | Idéntico 1:1 (verbatim) |
| 4. Gestión de registros guardados en base a este documento | `= Gestión de registros guardados en base a este documento` (Tabla 5 de 5 col) | Idéntico 1:1 (verbatim) |
| 5. Validez y gestión de documentos | `= Validez y gestión de documentos` (con 3 criterios de efectividad) | Idéntico 1:1 (verbatim) |
| 6. Apéndices | `= Apéndices` (Apéndice 1, 2 y 3) | Idéntico 1:1 (verbatim) |
| Bloque de firma ([cargo] / [nombre] / [firma]) | Bloque formal de firma institucional | Idéntico 1:1 (verbatim) |

### B) G4-RSK-INC-01 (Matriz y Reporte de Evaluación y Tratamiento)
- **Plantillas Fuente**:
  - `Apendice_3_Informe_sobre_evaluacion_y_tratamiento_ES.docx` (Informe ejecutivo, 5 páginas).
  - `Apendice_1_Cuadro_de_evaluacion_de_riesgos_ES.xlsx` (Cuadro de evaluación, 10 columnas).
  - `Apendice_2_Cuadro_de_tratamiento_de_riesgos_ES.xlsx` (Cuadro de tratamiento, 14 columnas, 2 niveles).
- **Desviaciones estructurales**: Cero (0).

| Sección Fuente Instructor | Sección en Molde Typst (`render-matrix`) | Estado de Fidelidad |
|---|---|---|
| Título: Apéndice 3: Formulario - Informe... | Título formal de documento (`doc-template`) | Idéntico 1:1 |
| 1. Objetivo, alcance y usuarios | `= Objetivo, alcance y usuarios` | Idéntico 1:1 (verbatim) |
| 2. Documentos de referencia | `= Documentos de referencia` | Idéntico 1:1 (verbatim) |
| 3. Proceso de evaluación y tratamiento de riesgos... | `= Proceso de evaluación y tratamiento de riesgos de la información` | Idéntico 1:1 (verbatim) |
| 3.1. Objetivo de la gestión de riesgos | `== Objetivo de la gestión de riesgos` | Idéntico 1:1 (verbatim) |
| 3.2. Alcance de la evaluación y tratamiento de riesgos | `== Alcance de la evaluación y tratamiento de riesgos` | Idéntico 1:1 (verbatim) |
| 3.3. Período de tiempo | `== Período de tiempo` | Idéntico 1:1 (verbatim) |
| 3.4. Participantes en el proceso y recolección... | `== Participantes en el proceso y recolección de información` | Idéntico 1:1 (verbatim) |
| 3.5. Breve resumen de la metodología aplicada | `== Breve resumen de la metodología aplicada` (9 pasos) | Idéntico 1:1 (verbatim) |
| 3.6. Resumen de los documentos utilizados... | `== Resumen de los documentos utilizados durante el proceso...` | Idéntico 1:1 (verbatim) |
| 4. Validez y gestión de documentos | `= Validez y gestión de documentos` | Idéntico 1:1 (verbatim) |
| 5. Apéndices | `= Apéndices` | Idéntico 1:1 (verbatim) |
| Firma ejecutiva Apéndice 3 | Bloque de firma del Oficial de Seguridad / DPO | Idéntico 1:1 |
| Apéndice 1: Cuadro de evaluación de riesgos | `== Apéndice 1: Cuadro de evaluación de riesgos` | Matriz 10 col idéntica a XLSX |
| Apéndice 2: Cuadro de tratamiento de riesgos | `== Apéndice 2: Cuadro de tratamiento de riesgos` | Matriz 14 col con 2 niveles idéntica a XLSX |

### C) G4-PLN-RSK-01 (Plan de tratamiento del riesgo)
- **Plantilla Fuente**: `Plan_de_tratamiento_del_riesgo_ES.docx` (`plan-de-tratamiento-del-riesgo`, 2 páginas).
- **Desviaciones estructurales**: Cero (0).

| Elemento Fuente Instructor | Elemento en Molde Typst (`render-plan`) | Estado de Fidelidad |
|---|---|---|
| Título: Plan de tratamiento del riesgo | `= Plan de tratamiento del riesgo` | Idéntico 1:1 (verbatim) |
| Párrafo introductorio de actividades | Párrafo intro adaptado a ISO 27701 (SGPI UNSA) | Idéntico 1:1 (convertido según guía) |
| Tabla 1: Matriz de 7 columnas | Matriz de 7 columnas (Descripción, Recursos, Responsable, Plazos, Capacitación, Evaluación, Estado) | Idéntico 1:1 (mismo orden y columnas) |
| Bloque de firma ([cargo] / [nombre] / [firma]) | Bloque formal de firma del Rector / Presidente SGPI | Idéntico 1:1 |
