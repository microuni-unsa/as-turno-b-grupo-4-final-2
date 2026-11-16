# Evidencia RAFA y Nota de Fidelidad: Procedimiento para Control de Documentos y Registros (G4-PRC-DOC-01)

## 1. R — Rol
- **Agente / Autor**: Administrador del Sistema Documental y Oficial de Seguridad de la Información / DPO (`Ing. Carlos M. Benítez`).
- **Revisores y Aprobadores**: Directora Universitaria de TIC (`DUTIC - Mg. Lucía Valdivia Paredes`) y Rector / Presidente del Comité SGPI (`Dr. Rohel Sánchez Sánchez` en v1; `Dr. Hugo José Sánchez` en v2 y v3).

## 2. A — Alcance
- **Alcance Institucional**: De aplicación estricta a toda la información documentada del SGPI de la UNSA (políticas, procedimientos, registros, declaraciones, actas e informes) en sedes centrales Arequipa (Ingenierías, Biomédicas y Sociales) y filiales regionales descentralizadas de Camaná (RR N° 0142-2025) y El Pedregal - Majes (RR N° 0143-2025).
- **Variantes de Evolución Territorial y Ciclo de Vida**:
  - `v1.0 (2019-04-15)`: Sedes centrales Arequipa; emisión inicial para certificación ISO/IEC 27701:2019; procesos presenciales de Admisión y Planillas.
  - `v2.0 (2022-09-10)`: Sedes centrales Arequipa; incorporación del repositorio documental digital y firma digital en Sisgedo; virtualización de admisión y teletrabajo de nóminas.
  - `v3.0 (2025-10-28)`: Sedes centrales + Filiales Camaná (RR N° 0142-2025) y El Pedregal - Majes (RR N° 0143-2025); recertificación bajo ISO/IEC 27701:2025; repositorio PIMS GESTITEL y moldes Typst 0.15.

## 3. F — Formato
- **Arquitectura de Molde Parametrizado (`mold.typ`)**:
  - Función Typst 0.15 pura y parametrizada (`#let mold(...)`), con CERO datos de instancia institucionales hardcodeados.
  - Réplica fiel del orden y títulos de secciones verbatim del instructor (`Procedimiento_para_control_de_documentos_y_registros_ES.docx`):
    - 1. Objetivo, alcance y usuarios (sin sub-splits inventados de nivel 2).
    - 2. Documentos de referencia (actualizados a ISO/IEC 27701:2025 Cl. 7.5.1, 7.5.2, 7.5.3 y Controles A.3.14, A.1.4.8, A.1.4.9).
    - 3. Control de documentos internos:
      - 3.1 Formato de los documentos (título verbatim del instructor; dentro se pliega la regla tipográfica Liberation Sans, la taxonomía G4 y los 15 elementos de anatomía).
      - 3.2 Aprobación de documentos.
      - 3.3 Publicación y distribución de documentos; retiro de circulación (3.3.1 Confidencialidad más baja, 3.3.2 Mayor confidencialidad con distribución vía PIMS GESTITEL).
      - 3.4 Actualizaciones de documentos (dentro se pliega la regla de ciclo de vida menor/mayor, inmutabilidad PIMS / "máquina del tiempo" y convención change_summary).
      - 3.5 Control de registros (los 5 campos obligatorios del estándar).
    - 4. Documentos externos (mesa de partes y correo entrante).
    - 5. Gestión de registros guardados en base a este documento (tabla de 5 columnas del instructor).
    - 6. Validez y gestión de documentos (criterios de efectividad verbatim del instructor y firma institucional).
- **Invocadores Delgados de Versión (3 callers en total)**:
  - `G4-PRC-DOC-01-v1.typ`: Emisión inicial 2019-04-15.
  - `G4-PRC-DOC-01-v2.typ`: Actualización post-pandemia 2022-09-10.
  - `G4-PRC-DOC-01-v3.typ`: Recertificación ISO/IEC 27701:2025 2025-10-28.

## 4. A — Ámbito y Criterio Normativo
- **Cláusulas ISO/IEC 27701:2025**:
  - Cláusula 7.5.1: Generalidades de la información documentada del SGPI.
  - Cláusula 7.5.2: Creación y actualización (identificación unívoca, taxonomía `G4-`, formato institucional, revisión y aprobación formal).
  - Cláusula 7.5.3: Control de la información documentada (disponibilidad, protección de confidencialidad e integridad, almacenamiento, control de versiones, preservación histórica e inmutabilidad en PIMS).
- **Controles y Guías Asociadas**:
  - Controles A.3.14 (Protección de registros), A.1.4.8 (Retención) y A.1.4.9 (Disposición segura).
  - Guías B.3.14 (Conservación obligatoria de versiones históricas / máquina del tiempo), B.1.4.8 y B.1.4.9.

## 5. Nota de Fidelidad Visual (Fidelity Note)
- Se eliminó el título inventado "Formato y taxonomía de los documentos" retornando al título verbatim del instructor "3.1. Formato de los documentos".
- La taxonomía G4, los 15 elementos de anatomía, las reglas de ciclo de vida y la política de preservación PIMS se integraron armónicamente dentro de las secciones correspondientes del documento fuente sin crear capítulos ajenos a la plantilla.
- Eliminados los sub-splits de nivel 2 en "Objetivo, alcance y usuarios".
- El documento coincide 1:1 con `Procedimiento_para_control_de_documentos_y_registros_ES.docx` (`docs/templates-render/procedimiento-para-control-de-documentos-y-registros/p01.png`-`p08.png`).
