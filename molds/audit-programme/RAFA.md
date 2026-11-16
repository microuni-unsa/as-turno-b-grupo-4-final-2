# Evidencia RAFA: Programa e Informe de Auditoría Interna del SGPI (G4-PRG-AUD-01 / G4-REP-AUD-01)

## 1. R — Rol
- **Agente / Autor**: Auditor Líder del SGPI y Oficial de Seguridad de la Información / DPO (`Ing. Carlos M. Benítez`).
- **Revisores y Aprobadores**: Directora Universitaria de TIC (`DUTIC - Mg. Lucía Valdivia`) y Rector / Comité de Gobierno Digital y Privacidad (`Dr. Rohel Sánchez` en 2019 / `Dr. Hugo José Sánchez` en 2022 y 2025).

## 2. A — Alcance
- **Par Mandatorio de Procesos (SPEC 6.3)**:
  - *Proceso Misional*: Admisión de Pregrado.
  - *Proceso de Soporte*: Planilla de Remuneraciones.
- **Variantes de Evolución Temporal (6 Callers: PRG + REP × 3)**:
  - `v1.0 (2019-04-15)`: Auditoría interna inicial para certificación ISO/IEC 27701:2019 en sedes centrales Arequipa. Evaluación de padrones físicos, ventanillas y datacenter.
  - `v2.0 (2022-09-10)`: Auditoría post-pandemia evaluando la seguridad del portal web `admision.unsa.edu.pe`, teletrabajo seguro con VPN SSL/MFA y boletas electrónicas en Sisgedo.
  - `v3.0 (2025-10-28)`: Recertificación bajo ISO/IEC 27701:2025 (segunda edición) e ISO 19011:2026, abarcando auditorías presenciales y técnicas en Filial Camaná y Filial El Pedregal (Majes).

## 3. F — Formato y Gramática del Instructor
- **Gramática de Documento Aplicada (Tanto en mold-prg.typ como en mold-rep.typ)**:
  - `1. Objetivo, alcance y usuarios` (Subsecciones 1.1 Objetivo, 1.2 Alcance, 1.3 Usuarios).
  - `2. Documentos de referencia` (Normas ISO 27701, ISO 19011, Ley 29733, políticas y procedimientos internos).
  - `3. Secciones sustantivas`:
    - En PRG: Objetivos y Criterios del Programa, Cronograma y Recursos (tabla con Ciclo, Proceso/Sede, Cláusulas/Controles, Equipo Auditor, Mes/Fecha, Estado), Métodos y Directrices Operativas.
    - En REP: Datos Generales de la Auditoría, Resumen Ejecutivo, Cuadro Resumen de Hallazgos (tabla con Hallazgo, Tipo RAG, Descripción, Proceso/Sede, Estado CAPA), Conclusión y Dictamen.
  - `4. Gestión de registros guardados en base a este documento` (Tabla formal de 5 columnas: Nombre, Ubicación, Responsable, Controles, Tiempo de retención).
  - `5. Validez y gestión de documentos` (Vigencia, propietario del documento y 3 criterios de efectividad).
  - `6. Bloque de firma institucional al cierre` (Cargo, Nombre, raya y [firma]).
- **Arquitectura Desacoplada (Contrato SPEC 2.1)**:
  - Dos moldes parametrizados puros: `mold-prg.typ` y `mold-rep.typ` con importación centralizada desde `../common/template.typ`.
  - 6 invocadores de versión delgados:
    - `G4-PRG-AUD-01-v1.typ`, `G4-PRG-AUD-01-v2.typ`, `G4-PRG-AUD-01-v3.typ`
    - `G4-REP-AUD-01-v1.typ`, `G4-REP-AUD-01-v2.typ`, `G4-REP-AUD-01-v3.typ`
- **Lista de Verificación de Gramática**:
  - [x] Objetivo, alcance y usuarios presente y estructurado en ambos moldes.
  - [x] Documentos de referencia presente con normativa actualizada.
  - [x] Gestión de registros con tabla de 5 columnas presente en ambos moldes.
  - [x] Validez y gestión de documentos presente con criterios de efectividad.
  - [x] Bloque de firmas institucional al cierre presente.
  - [x] Cero marcadores o corchetes pendientes en los 6 callers.

## 4. A — Ámbito y Criterio Normativo
- **Cláusulas ISO/IEC 27701:2025**:
  - Cláusula 9.2: Auditoría interna (9.2.1 Generalidades y 9.2.2 Programa de auditoría interna).
  - Norma ISO 19011:2026: Directrices para la auditoría de los sistemas de gestión.
  - Cláusula 10.2: No conformidad y acción correctiva (trazabilidad con G4-REG-CAPA-01).
