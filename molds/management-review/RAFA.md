# Evidencia RAFA: Acta de Revisión por la Dirección del SGPI (G4-ACT-REV-01)

## 1. R — Rol
- **Agente / Autor**: Secretario Técnico del Comité SGPI y Oficial de Seguridad de la Información / DPO (`Ing. Carlos M. Benítez`).
- **Revisores y Aprobadores**: Directora Universitaria de TIC (`DUTIC - Mg. Lucía Valdivia`) y Rector / Comité de Gobierno Digital y Privacidad (`Dr. Rohel Sánchez` en 2019 / `Dr. Hugo José Sánchez` en 2022 y 2025).

## 2. A — Alcance
- **Par Mandatorio de Procesos (SPEC 6.3)**:
  - *Proceso Misional*: Admisión de Pregrado.
  - *Proceso de Soporte*: Planilla de Remuneraciones.
- **Variantes de Evolución Temporal (3 Callers: v1, v2, v3)**:
  - `v1.0 (2019-04-15)`: Sesión de revisión inicial para certificación ISO/IEC 27701:2019 en sedes centrales Arequipa. Presidida por el Dr. Rohel Sánchez Sánchez.
  - `v2.0 (2022-09-10)`: Sesión extraordinaria post-pandemia evaluando la virtualización de admisiones (`admision.unsa.edu.pe`), teletrabajo con VPN/MFA y boletas electrónicas.
  - `v3.0 (2025-10-28)`: Sesión ordinaria de recertificación ISO/IEC 27701:2025 (segunda edición), aprobando la integración territorial de Filial Camaná y Filial El Pedregal (Majes) y presupuesto de fibra óptica.

## 3. F — Formato y Gramática del Instructor
- **Gramática de Documento Aplicada**:
  - `1. Objetivo, alcance y usuarios` (Subsecciones 1.1 Objetivo, 1.2 Alcance, 1.3 Usuarios).
  - `2. Documentos de referencia` (Normas ISO 27701 Cl. 9.3, Ley 29733, G4-POL-01, G4-REP-AUD-01, G4-REG-CAPA-01).
  - `3. Datos de la Sesión y Asistencia` (Fecha, lugar, presidencia y lista de miembros asistentes).
  - `4. Revisión de Entradas de la Dirección (Cláusula 9.3.2)` (Acciones previas, cuestiones externas/internas, desempeño, retroalimentación y riesgos).
  - `5. Decisiones y Salidas de la Revisión por la Dirección (Cláusula 9.3.3)` (Aprobación de versiones, asignación presupuestal y auditoría externa).
  - `6. Gestión de registros guardados en base a este documento` (Tabla formal de 5 columnas: Nombre, Ubicación, Responsable, Controles, Tiempo de retención).
  - `7. Validez y gestión de documentos` (Vigencia, propietario del documento y 3 criterios de efectividad).
  - `8. Bloque de firma institucional al cierre` (Cargo, Nombre, raya y [firma]).
- **Arquitectura Desacoplada (Contrato SPEC 2.1)**:
  - Molde parametrizado puro: `mold.typ` con importación centralizada desde `../common/template.typ` (cero datos de instancia hardcodeados).
  - Invocadores de versión delgados: `G4-ACT-REV-01-v1.typ`, `G4-ACT-REV-01-v2.typ`, `G4-ACT-REV-01-v3.typ` (~50 líneas cada uno).
- **Lista de Verificación de Gramática**:
  - [x] Objetivo, alcance y usuarios presente y estructurado.
  - [x] Documentos de referencia presente con normativa actualizada.
  - [x] Gestión de registros con tabla de 5 columnas presente.
  - [x] Validez y gestión de documentos presente con criterios de efectividad.
  - [x] Bloque de firmas institucional al cierre presente.
  - [x] Cero marcadores o corchetes pendientes en los 3 callers.

## 4. A — Ámbito y Criterio Normativo
- **Cláusulas ISO/IEC 27701:2025**:
  - Cláusula 9.3: Revisión por la dirección (9.3.1 Generalidades, 9.3.2 Entradas de la revisión, 9.3.3 Salidas de la revisión).
  - Cláusula 5.1: Liderazgo y compromiso de la alta dirección.
  - Cláusula 10.1 y 10.2: Mejora continua y no conformidad/CAPA.
