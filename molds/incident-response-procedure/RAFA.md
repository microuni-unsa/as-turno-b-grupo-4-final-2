# Evidencia RAFA: Procedimiento de Respuesta a Incidentes de Privacidad (G4-PRC-INC-01)

## 1. R — Rol
- **Agente / Autor**: Coordinador General de Respuesta a Incidentes (CSIRT-UNSA) y Oficial de Seguridad de la Información / DPO (`Ing. Carlos M. Benítez`).
- **Revisores y Aprobadores**: Dirección Universitaria de TIC (`DUTIC - Mg. Lucía Valdivia`) y Alta Dirección Universitaria (`Dr. Rohel Sánchez` en 2019 / `Dr. Hugo José Sánchez` en 2022 y 2025).

## 2. A — Alcance
- **Procesos en Alcance**:
  - Proceso Misional de Admisión (Pregrado Ordinario, CEPRUNSA, modalidades descentralizadas).
  - Proceso de Soporte de Planillas (Remuneraciones, aportes de ley, beneficios y cuentas bancarias del personal docente y no docente).
- **Alcance Geográfico y Tecnológico**:
  - `v1.0 (2019-04-15)`: Sedes centrales Arequipa (Ingenierías, Biomédicas, Sociales); servidores on-premise y procesos presenciales con padrones en papel.
  - `v2.0 (2022-09-10)`: Sedes centrales Arequipa con digitalización integral de admisiones (`admision.unsa.edu.pe`), teletrabajo administrativo vía VPN SSL con MFA y exclusión de archivos físicos históricos pasivos.
  - `v3.0 (2025-10-28)`: Sedes centrales Arequipa + Filial Camaná (Av. Costanera s/n, RR 0142-2025) + Filial El Pedregal - Majes (Calle 4 s/n, RR 0143-2025); nube privada híbrida, túneles VPN IPSec cifrados y terminales móviles con MDM Intune y BitLocker XTS-AES 256.

## 3. F — Formato
- **Arquitectura Desacoplada (Contrato SPEC 2.1)**:
  - Molde parametrizado puro y profundo: `mold.typ` con importación centralizada desde `../common/template.typ` (cero datos de instancia hardcodeados).
  - Invocadores de versión delgados: `G4-PRC-INC-01-v1.typ`, `G4-PRC-INC-01-v2.typ`, `G4-PRC-INC-01-v3.typ` (~130-150 líneas cada uno).
- **Estructura Documental (Estilo Instructor / SPEC 6.1)**:
  - Objetivo, alcance institucional y usuarios destinatarios.
  - Documentos de referencia normativos e institucionales.
  - Base normativa, rol PII Controller (Cl. 4.1) y callout de autonomía de criterio en notificación.
  - Estructura organizativa y cuadro de responsabilidades ante incidentes.
  - Fases operativas completas: Detección (`awareness_at`), Clasificación y Escala de Severidad (Crítico, Alto, Medio, Bajo con SLAs), Contención y Preservación Forense, Criterios de Evaluación y Notificación según Guía B.3.12 (`notification_state`), Erradicación y Recuperación, y Cierre con Cadena CAPA (Cl. 10.2).
  - Gestión de registros guardados en base a este documento (G4-REG-INC-01 con 9 campos obligatorios de B.3.12 y G4-REG-CAPA-01).

## 4. A — Ámbito y Criterio Normativo
- **Marco Normativo Primario**: ISO/IEC 27701:2025, Cláusula 8.1 (Control operacional), Cláusula 7.5 (Información documentada), Control A.3.11 (Planificación y preparación), Control A.3.12 (Respuesta a incidentes de seguridad), Guía B.3.11 y Guía B.3.12 (Breach records and notification).
- **Criterio de Notificación Organizacional**: Evaluación autónoma de riesgo para los derechos y libertades de los titulares de datos según la Cláusula 8.1 y la Ley N° 29733 de Protección de Datos Personales del Perú.
- **Principio Rector**: Ausencia absoluta de dependencia de los 72 horas del RGPD (Anexo D del estándar constituye mero mapeo documental, no exigencia operativa aplicable a la UNSA).
