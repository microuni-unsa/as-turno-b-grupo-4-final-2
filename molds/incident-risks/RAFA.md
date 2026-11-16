# Evidencia RAFA: Gestión de Riesgos de Incidentes de Privacidad (G4-RSK-INC-01, G4-MET-RSK-01, G4-PLN-RSK-01)

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
  - `mold.typ`: Molde puro parametrizado con cero datos hardcodeados de instancia UNSA. Importa `"../common/template.typ"` y exporta la función principal `mold(data)` que despacha automáticamente la renderización según `data.code`:
    - `G4-MET-RSK-01`: Metodología réplica del documento del instructor `Metodologia_de_evaluacion_y_tratamiento_de_riesgos_ES.docx`.
    - `G4-RSK-INC-01`: Matriz de Evaluación (Apéndice 1 XLSX layout), Tratamiento (Apéndice 2 XLSX layout) e Informe de Evaluación y Tratamiento (Apéndice 3 DOCX layout).
    - `G4-PLN-RSK-01`: Plan de Tratamiento del Riesgo con tabla estandarizada de 7 columnas según `Plan_de_tratamiento_del_riesgo_ES.docx`.
  - **Invocadores Delgados de Versión (~30 líneas cada uno)**:
    - `G4-RSK-INC-01-v1.typ`: Invocador para periodo 2019 (v1.0).
    - `G4-RSK-INC-01-v2.typ`: Invocador para periodo 2022 (v2.0).
    - `G4-RSK-INC-01-v3.typ`: Invocador para periodo 2025 (v3.0).
    - `G4-MET-RSK-01-v3.typ`: Invocador de metodología multisede 2025 (v3.0).
    - `G4-PLN-RSK-01-v3.typ`: Invocador del plan de tratamiento de 9 actividades 2025 (v3.0).
  - Cero copias locales de `template.typ` (eliminada copia/symlink local per contrato).

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
