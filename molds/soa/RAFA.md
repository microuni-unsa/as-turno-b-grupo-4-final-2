# Evidencia RAFA: Declaración de Aplicabilidad - SoA (G4-SOA-01)

## 1. R — Rol (Role)
- **Agente / Autor**: Lead Implementer ISO/IEC 27701 y Oficial de Seguridad de la Información / DPO (`Ing. Carlos M. Benítez`).
- **Revisores y Aprobadores**:
  - Revisor Técnico: Directora Universitaria de TIC (`DUTIC - Mg. Lucía Valdivia Paredes`).
  - Aprobador Institucional: Rector y Presidente del Comité de Gobierno Digital y Privacidad (`Dr. Rohel Sánchez Sánchez` en 2019 / `Dr. Hugo José Sánchez` en 2022 y 2025).

## 2. A — Alcance (Scope)
- **Procesos en Alcance**: Proceso Misional de Admisión (Pregrado Ordinario, CEPRUNSA, filiales descentralizadas) y Proceso de Apoyo de Planillas de Remuneraciones (personal docente y administrativo).
- **Variantes de Evolución Territorial y Tecnológica**:
  - `v1.0 (2019-04-15)`: Sedes centrales Arequipa (Área de Ingenierías, Biomédicas y Sociales). Enfoque en infraestructura física on-premise, controles de acceso local y procesos presenciales de admisión y pago de haberes.
  - `v2.0 (2022-09-10)`: Sedes centrales Arequipa. Reconfiguración post-pandemia orientada a la virtualización integral de admisiones (`admision.unsa.edu.pe`), teletrabajo seguro con clientes VPN SSL, tokens JWT efímeros y exclusión formal de legajos físicos históricos.
  - `v3.0 (2025-10-28)`: Recertificación bajo la norma independiente ISO/IEC 27701:2025 (segunda edición, standalone PIMS). Expansión multisede incorporando Filial Camaná (RR 0142-2025) y Filial El Pedregal - Majes (RR 0143-2025), gestión de terminales con MDM (Microsoft Intune), TPM 2.0, cifrado BitLocker XTS-AES 256 forzoso y túneles VPN IPSec IKEv2.

## 3. F — Formato (Format)
- **Arquitectura de Carpeta Desacoplada**:
  - `mold.typ`: Molde parametrizado con cero datos hardcodeados de instancia institucional. Importa `"../common/template.typ"` y contiene la estructura integral, redacción técnica y catálogos de los 78 controles normativos de ISO/IEC 27701:2025.
  - Invocadores de Versión Delgados (~30 líneas cada uno):
    - `G4-SOA-01-v1.typ`: Declaración de aplicabilidad para periodo 2019 (v1.0).
    - `G4-SOA-01-v2.typ`: Declaración de aplicabilidad para periodo 2022 (v2.0).
    - `G4-SOA-01-v3.typ`: Declaración de aplicabilidad para periodo 2025 (v3.0).
  - Eliminación absoluta de la copia/symlink local `template.typ` per contrato de autoría.

## 4. A — Ámbito y Criterio Normativo (Normative Context)
- **Norma Base**: ISO/IEC 27701:2025 (Segunda edición, octubre 2025), Cláusula 6.1.3.e (Declaración de Aplicabilidad), Cláusula 4.1 (Determinación del Rol), Introducción del Anexo A, Tablas normativas A.1, A.2 y A.3, y Guías de implementación del Anexo B.
- **Inventario Exhaustivo de 78 Controles Evaluados**:
  - *Tabla A.1 (Controles para Responsables / PII Controllers - 31 controles)*: A.1.2.2 a A.1.5.5 evaluados en su totalidad como **APLICABLES / IMPLEMENTADOS**.
  - *Tabla A.2 (Controles para Encargados / PII Processors - 18 controles)*: A.2.2.2 a A.2.5.9 declarados formalmente como **EXCLUIDOS CON JUSTIFICACIÓN FUNDADA**, dado que la UNSA actúa de manera exclusiva como Responsable del tratamiento (Cl. 4.1) y no procesa datos por cuenta de terceros mandantes.
  - *Tabla A.3 (Controles de Seguridad de la Información Comunes - 29 controles)*: A.3.3 a A.3.31 evaluados en su totalidad como **APLICABLES / IMPLEMENTADOS**.
- **Justificaciones de Profundidad Vertical (Incidentes y Derechos de Titulares)**:
  - *Control A.3.11 (Planificación y preparación ante incidentes)*: Gobernanza CSIRT-UNSA, escalamiento < 30 min en filiales y delimitación de notificación sin sujeción al plazo foráneo de 72 horas del RGPD (B.3.11).
  - *Control A.3.12 (Respuesta a incidentes de seguridad)*: Contención técnica multisede, aislamiento de VPN, borrado remoto MDM, registro formal en `G4-REG-INC-01` con los 9 campos de B.3.12 y apertura mandatoria de CAPA (`G4-REG-CAPA-01`).
  - *Control A.1.2.9 (Registros de tratamiento - ROPA / RAT)*: Mapeo exhaustivo de flujos de datos de admisión y nómina con bases estatutarias (Ley 30220).
  - *Controles A.1.3.7 y A.1.3.10 (Derechos ARCO y atención de solicitudes)*: Tramitación formal vía Sisgedo con plazos de 10 días para acceso y 5 días para rectificación/cancelación bajo la Ley N° 29733.
