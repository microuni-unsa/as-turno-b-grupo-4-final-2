# Evidencia RAFA: Procedimiento de Respuesta a Incidentes de Privacidad (G4-PRC-INC-01)

## 1. R — Rol
- **Agente / Autor**: Oficial de Seguridad de la Información / DPO y Líder del CSIRT-UNSA (`Ing. Carlos M. Benítez`).
- **Revisores y Aprobadores**: Directora Universitaria de TIC (`DUTIC - Mg. Lucía Valdivia`) y Rector / Comité de Gobierno Digital y Privacidad (`Dr. Rohel Sánchez` en 2019 / `Dr. Hugo José Sánchez` en 2022 y 2025).

## 2. A — Alcance
- **Par Mandatorio de Procesos (SPEC 6.3)**:
  - *Proceso Misional*: Admisión de Pregrado.
  - *Proceso de Soporte*: Planilla de Remuneraciones.
- **Variantes de Evolución Temporal (3 Callers: v1, v2, v3)**:
  - `v1.0 (2019-04-15)`: Respuesta ante incidentes físicos (padrones impresos, ventanillas, robo de expedientes) en sedes centrales Arequipa.
  - `v2.0 (2022-09-10)`: Respuesta ante incidentes digitales en plataforma web (`admision.unsa.edu.pe`), tokens JWT, accesos remotos y teletrabajo.
  - `v3.0 (2025-10-28)`: Protocolos de respuesta multisede con terminales portátiles de enrolamiento (Camaná y Majes), enlaces VPN IPSec, MDM Intune con BitLocker XTS-AES 256 y SIEM corporativo.

## 3. F — Formato y Gramática del Instructor
- **Gramática de Documento Aplicada**:
  - `1. Objetivo, alcance y usuarios` (Subsecciones 1.1 Objetivo, 1.2 Alcance, 1.3 Usuarios).
  - `2. Documentos de referencia` (Normas ISO 27701 Cl. 8.1, Controles A.3.11/A.3.12, Guías B.3.11/B.3.12, Ley 29733, G4-POL-01, G4-ALC-01, G4-PRC-CAPA-01).
  - `3. Base Normativa y Criterio Institucional de Notificación` (Delimitación rigurosa de criterios de notificación basados en riesgo para los titulares, sin aplicación automática del reloj de 72 horas del RGPD europeo).
  - `4. Estructura Organizativa y Responsabilidades ante Incidentes` (Tabla de roles institucionales).
  - `5. Ciclo de Vida y Fases Operativas de Respuesta a Incidentes` (Fase 1: Detección, Fase 2: Triage y Escala de Severidad con SLAs, Fase 3: Contención Forense, Fase 4: Evaluación y Notificación B.3.12, Fase 5: Erradicación, Fase 6: Cierre y CAPA Cl. 10.2).
  - `6. Gestión de registros guardados en base a este documento` (Tabla formal de 5 columnas: Nombre, Ubicación, Responsable, Controles, Tiempo de retención).
  - `7. Validez y gestión de documentos` (Vigencia, propietario del documento y 3 criterios de efectividad).
  - `8. Bloque de firma institucional al cierre` (Cargo, Nombre, raya y [firma]).
- **Arquitectura Desacoplada (Contrato SPEC 2.1)**:
  - Molde parametrizado puro: `mold.typ` con importación centralizada desde `../common/template.typ` (cero datos de instancia hardcodeados).
  - Invocadores de versión delgados: `G4-PRC-INC-01-v1.typ`, `G4-PRC-INC-01-v2.typ`, `G4-PRC-INC-01-v3.typ` (~100 líneas cada uno).
- **Lista de Verificación de Gramática**:
  - [x] Objetivo, alcance y usuarios presente y estructurado.
  - [x] Documentos de referencia presente con normativa actualizada.
  - [x] Gestión de registros con tabla de 5 columnas presente.
  - [x] Validez y gestión de documentos presente con criterios de efectividad.
  - [x] Bloque de firmas institucional al cierre presente.
  - [x] Cero marcadores o corchetes pendientes en los 3 callers.

## 4. A — Ámbito y Criterio Normativo
- **Cláusulas ISO/IEC 27701:2025**:
  - Cláusula 8.1: Planificación y control operacional.
  - Controles A.3.11 (Gestión de eventos de seguridad de la información) y A.3.12 (Respuesta a incidentes de seguridad relacionados con PII).
  - Guías B.3.11 y B.3.12: Directrices forenses, notificación institucional fundamentada y delimitación frente al RGPD europeo (desmitificación del reloj de 72 horas).
  - Cláusula 10.2: No conformidad y acción correctiva (trazabilidad con G4-REG-CAPA-01).
