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
  - `mold.typ`: Molde parametrizado con cero datos hardcodeados de instancia institucional. Importa `"../common/template.typ"` y contiene la estructura integral reestructurada a la **gramática documental canónica del instructor** (Objetivo/alcance/usuarios → Documentos de referencia → body → Gestión de registros → Validez y gestión → signature).
  - Invocadores de Versión Delgados (3 archivos exactos):
    - `G4-SOA-01-v1.typ`: Declaración de aplicabilidad para periodo 2019 (v1.0).
    - `G4-SOA-01-v2.typ`: Declaración de aplicabilidad para periodo 2022 (v2.0).
    - `G4-SOA-01-v3.typ`: Declaración de aplicabilidad para periodo 2025 (v3.0).
  - Cero copias locales de `template.typ`.
  - Cero marcadores sin resolver (`[cargo]`, `[nombre]`, `[fecha]`, `TODO`).

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

---

## 5. Nota de Fidelidad Visual y Mapeo Estructural 1:1

### G4-SOA-01 (Declaración de Aplicabilidad - SoA)
- **Plantilla Fuente**: Reestructurada según la gramática procedimental canónica del instructor (documentos del SGPI UNSA).
- **Desviaciones estructurales**: Cero (0).

| Sección Canónica del Instructor | Sección en Molde Typst (`mold.typ`) | Estado de Fidelidad |
|---|---|---|
| Carátula / Metadatos de control | Carátula institucional con metadatos de control (Tabla 1 de 6 filas) | Idéntico 1:1 (`doc-template`) |
| Historial de modificaciones | Historial de Revisiones del Documento (Tabla 2 de 4 col) | Idéntico 1:1 (`doc-template`) |
| Tabla de contenido | Índice de Contenidos analítico dinámico | Idéntico 1:1 (`outline`) |
| 1. Objetivo, alcance y usuarios | `= Objetivo, alcance y usuarios` (con subsecciones 1.1 Objetivo, 1.2 Alcance y 1.3 Usuarios) | Idéntico 1:1 (gramática del instructor) |
| 2. Documentos de referencia | `= Documentos de referencia` (normas y políticas institucionales) | Idéntico 1:1 (gramática del instructor) |
| 3. Declaración de aplicabilidad | `= Declaración de aplicabilidad` | Idéntico 1:1 (gramática del instructor) |
| 3.1 Criterio de evaluación y estructura | `== Criterio de evaluación y estructura de controles` (exclusión A.2 + profundidad vertical A.3.11, A.3.12, A.1.2.9, A.1.3.7, A.1.3.10) | Estándar ISO 27701 Cl. 6.1.3.e |
| 3.2 Tabla A.1: Controles Responsables | `== Tabla A.1 — Controles para Responsables del Tratamiento (PII Controllers)` (31 controles) | Idéntico 1:1 (31 controles) |
| 3.3 Tabla A.2: Controles Encargados | `== Tabla A.2 — Controles para Encargados del Tratamiento (PII Processors)` (18 controles excluidos con justificación) | Idéntico 1:1 (18 controles) |
| 3.4 Tabla A.3: Controles Seguridad | `== Tabla A.3 — Controles de Seguridad de la Información con Enfoque de Privacidad` (29 controles) | Idéntico 1:1 (29 controles) |
| 3.5 Resumen de aplicabilidad | `== Resumen de aplicabilidad de controles` (60 implementados, 18 excluidos) | Idéntico 1:1 |
| 4. Gestión de registros guardados en base a este documento | `= Gestión de registros guardados en base a este documento` (Tabla 5 de 5 col) | Idéntico 1:1 (gramática del instructor) |
| 5. Validez y gestión de documentos | `= Validez y gestión de documentos` (vigencia, propietario y 3 criterios de efectividad) | Idéntico 1:1 (gramática del instructor) |
| Bloque de firma ([cargo] / [nombre] / [firma]) | Bloque formal de firma del Rector / Presidente del Comité SGPI | Idéntico 1:1 (gramática del instructor) |
