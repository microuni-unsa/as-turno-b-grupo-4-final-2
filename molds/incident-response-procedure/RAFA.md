# Evidencia RAFA: Procedimiento de Respuesta a Incidentes de Privacidad (G4-PRC-INC-01)

## 1. R — Rol
- **Agente / Autor**: Coordinador General de Respuesta a Incidentes (CSIRT-UNSA) y Oficial de Seguridad de la Información / DPO (`Ing. Carlos M. Benítez`).
- **Revisores y Aprobadores**: Dirección Universitaria de TIC (`DUTIC - Mg. Lucía Valdivia`) y Alta Dirección Universitaria (`Rectorado - Dr. Hugo José Sánchez`).

## 2. A — Alcance
- **Procesos en Alcance**:
  - Proceso Misional de Admisión (Pregrado Ordinario, CEPRUNSA, modalidades extraordinarias y filiales descentralizadas).
  - Proceso de Soporte de Planillas (Remuneraciones, aportes de ley, beneficios y deducciones del personal docente y no docente).
- **Alcance Geográfico y Tecnológico**:
  - `v1.0 (2019)`: Campus Central, Área de Ingenierías, Biomédicas y Sociales en la ciudad de Arequipa; servidores on-premise y registros físicos.
  - `v2.0 (2022)`: Sedes centrales Arequipa con digitalización integral de admisiones (`admision.unsa.edu.pe`), teletrabajo administrativo vía VPN y exclusión de archivos físicos históricos.
  - `v3.0 (2025)`: Sedes centrales Arequipa + Filial Camaná (Av. Costanera s/n) + Filial El Pedregal - Majes (Calle 4 s/n); nube privada híbrida y puntos finales móviles.

## 3. F — Formato
- **Documento Fuente**: Moldes Typst 0.15 (`G4-PRC-INC-01-v1.typ`, `G4-PRC-INC-01-v2.typ`, `G4-PRC-INC-01-v3.typ`).
- **Estructura Documental (SPEC 6.1)**:
  - Encabezado y pie formal institucional con numeración dinámica `#context counter(page).display("Página 1 de 1", both: true)`.
  - Cuadro tripartito de control de firmas (Elaboración, Revisión, Aprobación) con fechas de vigencia.
  - Tabla de historial de revisiones con justificación del cambio según versión (`change_summary`).
  - Índice analítico numerado (`outline`).
  - Fases del procedimiento: Detección, Clasificación (Evento vs Incidente vs Brecha PII según B.3.12 Nota 1), Contención y Erradicación, Preservación Forense, Protocolo de Notificación (evaluación fundada de riesgo residual sin regla 72h), Recuperación y Lecciones Aprendidas (cierre CAPA).

## 4. A — Ámbito y Criterio Normativo
- **Marco Normativo Primario**: ISO/IEC 27701:2025, Cláusula 8.1 (Control operacional), Control A.3.11 (Planificación y preparación), Control A.3.12 (Respuesta a incidentes de seguridad), Guía B.3.11 y Guía B.3.12 (Breach records and notification).
- **Criterio de Notificación**: Evaluación autónoma de riesgo para los derechos y libertades de los titulares de datos según la Cláusula 8.1 y la Ley N° 29733 de Protección de Datos Personales del Perú.
- **Principio Rector**: Ausencia absoluta de dependencia de los 72 horas del RGPD (Anexo D del estándar constituye mero mapeo documental, no exigencia operativa).
