# Evidencia RAFA: Determinación del Alcance del SGPI (G4-ALC-01)

## 1. R — Rol
- **Agente / Autor**: Coordinador del SGPI y Oficial de Seguridad de la Información / DPO (`Ing. Carlos M. Benítez`).
- **Revisores y Aprobadores**: Directora Universitaria de TIC (`DUTIC - Mg. Lucía Valdivia`) y Rector / Comité de Gobierno Digital y Privacidad (`Dr. Rohel Sánchez` en 2019 / `Dr. Hugo José Sánchez` en 2022 y 2025).

## 2. A — Alcance
- **Par Mandatorio de Procesos (SPEC 6.3)**:
  - *Proceso Misional*: Admisión de Pregrado (convocatoria ordinaria, CEPRUNSA, modalidades descentralizadas).
  - *Proceso de Soporte*: Planilla de Remuneraciones (personal docente y administrativo).
- **Variantes de Evolución Territorial y Tecnológica**:
  - `v1.0 (2019-04-15)`: Sedes centrales Arequipa (Campus Ingenierías, Biomédicas y Sociales), soporte on-premise y procesos presenciales. Exclusión: archivos físicos pre-2018.
  - `v2.0 (2022-09-10)`: Contracción post-pandemia; exclusión formal de legajos físicos pasivos históricos anteriores a 2020 y concentración en admisiones virtuales (`admision.unsa.edu.pe`) y teletrabajo vía VPN SSL con MFA.
  - `v3.0 (2025-10-28)`: Expansión multisede incorporando Filial Camaná (RR 0142-2025) y Filial El Pedregal - Majes (RR 0143-2025) bajo ISO/IEC 27701:2025, enlaces VPN IPSec cifrados, MDM con BitLocker XTS-AES 256 y nube híbrida.

## 3. F — Formato y Gramática del Instructor
- **Gramática de Documento Aplicada**:
  - `1. Objetivo, alcance y usuarios` (Subsecciones 1.1 Objetivo, 1.2 Alcance, 1.3 Usuarios).
  - `2. Documentos de referencia` (Normas ISO 27701, Ley 29733, Ley 30220, Políticas institucionales).
  - `3. Determinación del Rol Institucional (Cláusula 4.1)` (UNSA como PII Controller exclusivo).
  - `4. Par Mandatorio de Procesos en Alcance` (Admisión y Planillas con sus atributos).
  - `5. Perímetro Geográfico e Infraestructura Tecnológica` (Sedes centrales, filiales y tecnología).
  - `6. Exclusiones Justificadas`.
  - `7. Gestión de registros guardados en base a este documento` (Tabla formal de 5 columnas: Nombre, Ubicación, Responsable, Controles, Tiempo de retención).
  - `8. Validez y gestión de documentos` (Vigencia, propietario del documento y 3 criterios de efectividad).
  - `9. Bloque de firma institucional al cierre` (Cargo, Nombre, raya y [firma]).
- **Arquitectura Desacoplada (Contrato SPEC 2.1)**:
  - Molde parametrizado puro: `mold.typ` con importación centralizada desde `../common/template.typ` (cero datos de instancia hardcodeados).
  - Invocadores de versión delgados: `G4-ALC-01-v1.typ`, `G4-ALC-01-v2.typ`, `G4-ALC-01-v3.typ` (~50 líneas cada uno).
- **Lista de Verificación de Gramática**:
  - [x] Objetivo, alcance y usuarios presente y estructurado.
  - [x] Documentos de referencia presente con normativa actualizada.
  - [x] Gestión de registros con tabla de 5 columnas presente.
  - [x] Validez y gestión de documentos presente con criterios de efectividad.
  - [x] Bloque de firmas institucional al cierre presente.
  - [x] Cero marcadores o corchetes pendientes.

## 4. A — Ámbito y Criterio Normativo
- **Cláusulas ISO/IEC 27701:2025**:
  - Cláusula 4.3: Determinación del alcance del sistema de gestión de privacidad de la información.
  - Cláusula 4.4: Sistema de gestión de privacidad de la información.
  - Cláusula 4.1: Determinación de la función (UNSA = PII Controller exclusivo).
- **Consistencia Institucional**: Trazabilidad con las Resoluciones Rectorales N° 0142-2025 y 0143-2025-UNSA archivadas en `university-facts/`.
