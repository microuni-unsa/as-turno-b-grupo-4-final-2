# Evidencia RAFA: Tabla de Objetivos de Privacidad de la Información (G4-OBJ-01)

## 1. R — Rol
- **Agente / Autor**: Coordinador del SGPI y Oficial de Seguridad de la Información / DPO (`Ing. Carlos M. Benítez`).
- **Revisores y Aprobadores**: Directora Universitaria de TIC (`DUTIC - Mg. Lucía Valdivia`) y Rector / Comité de Gobierno Digital y Privacidad (`Dr. Rohel Sánchez` en 2019 / `Dr. Hugo José Sánchez` en 2022 y 2025).

## 2. A — Alcance
- **Par Mandatorio de Procesos (SPEC 6.3)**:
  - *Proceso Misional*: Admisión de Pregrado.
  - *Proceso de Soporte*: Planilla de Remuneraciones.
- **Variantes de Evolución Temporal**:
  - `v1.0 (2019-04-15)`: Adopción inicial de ISO/IEC 27701:2019 en sedes centrales Arequipa. Metas centradas en trituración certificada de padrones y registro presencial ARCO.
  - `v2.0 (2022-09-10)`: Adaptación digital post-pandemia. Metas centradas en seguridad web (OWASP Top 10 en admision.unsa.edu.pe), teletrabajo con VPN/MFA y mesa de partes digital.
  - `v3.0 (2025-10-28)`: Recertificación ISO/IEC 27701:2025 con metas cuantitativas multisede (Camaná y El Pedregal), MTTC < 60 min, capacitación >95% y cifrado BitLocker 100%.

## 3. F — Formato y Gramática del Instructor
- **Gramática de Documento Aplicada**:
  - `1. Objetivo, alcance y usuarios` (Subsecciones 1.1 Objetivo, 1.2 Alcance, 1.3 Usuarios).
  - `2. Documentos de referencia` (Normas ISO 27701, Ley 29733, G4-POL-01, G4-ALC-01).
  - `3. Alineamiento Estratégico con la Política de Privacidad (Cláusula 5.2)`.
  - `4. Matriz de Objetivos de Privacidad y Plan de Acción (Cláusula 6.2)` (Tabla con N°, Objetivo, KPI, Qué se hará, Responsable, Plazo, Estado).
  - `5. Mecanismo de Seguimiento, Medición y Evaluación de Resultados (Cláusula 9.1)`.
  - `6. Gestión de registros guardados en base a este documento` (Tabla formal de 5 columnas: Nombre, Ubicación, Responsable, Controles, Tiempo de retención).
  - `7. Validez y gestión de documentos` (Vigencia, propietario del documento y 3 criterios de efectividad).
  - `8. Bloque de firma institucional al cierre` (Cargo, Nombre, raya y [firma]).
- **Arquitectura Desacoplada (Contrato SPEC 2.1)**:
  - Molde parametrizado puro: `mold.typ` con importación centralizada desde `../common/template.typ` (cero datos de instancia hardcodeados).
  - Invocadores de versión delgados: `G4-OBJ-01-v1.typ`, `G4-OBJ-01-v2.typ`, `G4-OBJ-01-v3.typ` (~50 líneas cada uno).
- **Lista de Verificación de Gramática**:
  - [x] Objetivo, alcance y usuarios presente y estructurado.
  - [x] Documentos de referencia presente con normativa actualizada.
  - [x] Gestión de registros con tabla de 5 columnas presente.
  - [x] Validez y gestión de documentos presente con criterios de efectividad.
  - [x] Bloque de firmas institucional al cierre presente.
  - [x] Cero marcadores o corchetes pendientes.

## 4. A — Ámbito y Criterio Normativo
- **Cláusulas ISO/IEC 27701:2025**:
  - Cláusula 6.2: Objetivos de privacidad de la información y planificación para alcanzarlos.
  - Cláusula 9.1: Seguimiento, medición, análisis y evaluación.
  - Cláusula 5.2: Política de privacidad de la información.
  - Ley N° 29733 de Protección de Datos Personales (Perú).
