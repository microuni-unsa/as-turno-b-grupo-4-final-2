# Evidencia RAFA: Registro Oficial de Incidentes de Privacidad (G4-REG-INC-01)

## 1. R — Rol (Role)
- **Agente / Especialista**: Custodio del Registro de Incidentes del SGPI y Especialista Forense en Privacidad de Datos de la UNSA.
- **Interlocutor Primario**: Oficial de Seguridad de la Información / DPO (`Ing. Carlos M. Benítez`) y Dirección Universitaria de Tecnologías de la Información y Comunicación (`DUTIC - Mg. Lucía Valdivia Paredes`).
- **Aprobador Institucional**: Rector y Presidente del Comité de Gobierno Digital y Privacidad (`Dr. Rohel Sánchez Sánchez` en 2019 / `Dr. Hugo José Sánchez` en 2022 y 2025).

## 2. A — Alcance (Scope)
- **Perímetro Operacional**: Proceso Misional de Admisión (Ordinaria, Virtual y Filiales Regionales) y Proceso de Apoyo de Planillas de Remuneraciones (personal docente y administrativo).
- **Variantes de Evolución Temporal**:
  - `v1.0 (2019-04-15)`: Sedes Centrales Arequipa (Áreas de Ingenierías, Biomédicas y Sociales). Incidentes en soportes de papel físico (padrones de examen) y desbordes en servidores de correo Exchange.
  - `v2.0 (2022-09-10)`: Sedes Centrales Arequipa en contexto post-pandemia. Incidentes web en plataforma `admision.unsa.edu.pe` (vulnerabilidad IDOR mitigada en 45 min) y contingencias de respaldo en bases de datos.
  - `v3.0 (2025-10-28)`: Expansión multisede a Filial Camaná (RR 0142-2025) y Filial El Pedregal - Majes (RR 0143-2025). Sustracción de laptops con cifrado BitLocker/TPM 2.0 y borrado remoto MDM (Intune), sincronización de haberes en túneles VPN y frustración de spear-phishing bancario.

## 3. F — Formato (Format)
- **Arquitectura de Carpeta Desacoplada**:
  - `mold.typ`: Molde parametrizado que define la carátula formal, metodología, resumen de desempeño operacional y puntero al registro técnico. Cero datos hardcodeados de instancia institucional. Importa `"../common/template.typ"` y exporta la función principal `mold(data)`.
  - Invocadores de Versión Delgados (~30 líneas cada uno):
    - `G4-REG-INC-01-v1.typ`: Registro institucional para periodo 2019 (v1.0).
    - `G4-REG-INC-01-v2.typ`: Registro institucional para periodo 2022 (v2.0).
    - `G4-REG-INC-01-v3.typ`: Registro institucional para periodo 2025 (v3.0).
  - Eliminación absoluta de la copia/symlink local `template.typ` per contrato de autoría.
  - **Generador Scriptado y Hoja de Cálculo OpenXML**:
    - `generate.ts`: Generador TypeScript para Bun (de propiedad exclusiva del pipeline) que compila y emite la hoja técnica `G4-REG-INC-01-registros.xlsx`.
    - Separación estricta: los archivos `.typ` actúan como Typst shells institucionales con puntero al archivo electrónico `.xlsx`.

## 4. A — Ámbito y Criterio Normativo (Normative Context)
- **Norma Base**: ISO/IEC 27701:2025 (Segunda edición, octubre 2025), Cláusula 8.1 (Planificación y control operacional), Cláusula 7.5.1 (Información documentada), Control A.3.11, Control A.3.12 y Guía de implementación B.3.12 (Breach records and reporting).
- **Mandato de los Nueve (9) Campos Obligatorios del Registro (Guía B.3.12)**:
  1. *Descripción del incidente* (vector de ataque y causa raíz).
  2. *Período de tiempo* (inicio, detección formal, contención y cierre).
  3. *Consecuencias del incidente* (impacto en la organización y titulares de PII).
  4. *Nombre del informante / reportante* (persona o sensor técnico).
  5. *A quién se informó el incidente* (CSIRT, DPO, DUTIC, Rectorado).
  6. *Medidas adoptadas para resolver el incidente* (consignando persona a cargo y datos recuperados).
  7. *Afectación específica sobre la PII* (indisponibilidad, pérdida, divulgación o alteración).
  8. *Descripción de la PII comprometida* (categorías, titulares y volumen de registros).
  9. *Medidas de notificación ejecutadas* (comunicación a titulares, reporte a la ANPD o justificación fundada de no requerimiento).
- **Delimitación de Notificación Regulatoria**:
  - Los umbrales de notificación hacia la Autoridad Nacional de Protección de Datos Personales (ANPD) y los titulares se sustentan objetivamente en la evaluación de riesgo residual de la Cláusula 8.1 y la efectividad del cifrado (A.3.26).
  - No resulta de aplicación la regla foránea de notificación universal de 72 horas del RGPD europeo (Anexo D informativo).
- **Articulación con el Sistema de Mejora (Cláusula 10.2)**:
  - Todo incidente categorizado con severidad media, alta o crítica se enlaza directamente a una Solicitud de Acción Correctiva en el registro `G4-REG-CAPA-01`.
