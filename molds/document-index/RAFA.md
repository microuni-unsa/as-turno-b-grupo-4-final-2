# Evidencia RAFA: Mapa e Índice Maestro de Documentos (Auditor's Map — G4-IDX-01)

## 1. R — Rol
- **Agente / Autor**: Secretario Técnico del SGPI y Oficial de Seguridad de la Información / DPO (`Ing. Carlos M. Benítez`).
- **Revisores y Aprobadores**: Directora Universitaria de TIC (`DUTIC - Mg. Lucía Valdivia`) y Rector / Comité de Gobierno Digital y Privacidad (`Dr. Rohel Sánchez` en 2019 / `Dr. Hugo José Sánchez` en 2022 y 2025).

## 2. A — Alcance
- **Par Mandatorio de Procesos (SPEC 6.3)**:
  - *Proceso Misional*: Admisión de Pregrado.
  - *Proceso de Soporte*: Planilla de Remuneraciones.
- **Variantes de Evolución Temporal (3 Callers: v1, v2, v3)**:
  - `v1.0 (2019-04-15)`: Índice maestro inicial de 18 documentos para certificación ISO/IEC 27701:2019 en sedes centrales Arequipa.
  - `v2.0 (2022-09-10)`: Reestructuración de la arquitectura documental tras la virtualización post-pandemia y teletrabajo.
  - `v3.0 (2025-10-28)`: Auditor's Map bajo ISO/IEC 27701:2025 (segunda edición) incorporando filiales descentralizadas (Camaná y El Pedregal) y los 18 códigos en secuencia estricta 4 a 10.

## 3. F — Formato y Gramática del Instructor
- **Gramática de Documento Aplicada**:
  - `1. Objetivo, alcance y usuarios` (Subsecciones 1.1 Objetivo, 1.2 Alcance, 1.3 Usuarios).
  - `2. Documentos de referencia` (Normas ISO 27701 Cl. 7.5, Ley 29733, G4-PRC-DOC-01, G4-POL-01, G4-ALC-01).
  - `3. Directrices de Navegación y Secuencia de Auditoría (Cláusulas 4 a 10)`.
  - `4. Inventario Maestro de Documentos por Cláusula Normativa` (Tabla con Cláusula ISO, Código, Título, Versión, Custodio, Estado PIMS: los 18 códigos de G4-ALC-01 a G4-IDX-01 en orden de cláusulas 4 a 10).
  - `5. Trazabilidad con el Repositorio de la Verdad (PIMS GESTITEL en unsa.27k.pe)`.
  - `6. Gestión de registros guardados en base a este documento` (Tabla formal de 5 columnas: Nombre, Ubicación, Responsable, Controles, Tiempo de retención).
  - `7. Validez y gestión de documentos` (Vigencia, propietario del documento y 3 criterios de efectividad).
  - `8. Bloque de firma institucional al cierre` (Cargo, Nombre, raya y [firma]).
- **Arquitectura Desacoplada (Contrato SPEC 2.1)**:
  - Molde parametrizado puro: `mold.typ` con importación centralizada desde `../common/template.typ` (cero datos de instancia hardcodeados).
  - Invocadores de versión delgados: `G4-IDX-01-v1.typ`, `G4-IDX-01-v2.typ`, `G4-IDX-01-v3.typ` (~60 líneas cada uno).
- **Lista de Verificación de Gramática**:
  - [x] Objetivo, alcance y usuarios presente y estructurado.
  - [x] Documentos de referencia presente con normativa actualizada.
  - [x] Gestión de registros con tabla de 5 columnas presente.
  - [x] Validez y gestión de documentos presente con criterios de efectividad.
  - [x] Bloque de firmas institucional al cierre presente.
  - [x] Cero marcadores o corchetes pendientes en los 3 callers.

## 4. A — Ámbito y Criterio Normativo
- **Cláusulas ISO/IEC 27701:2025**:
  - Cláusula 7.5: Información documentada (7.5.1 Generalidades, 7.5.2 Creación y actualización, 7.5.3 Control de la información documentada).
  - Mapeo integral de requisitos para auditoría de Fase 1 (Cláusulas 4 a 10 correlativas).
