# Evidencia RAFA: Procedimiento de Control de Información Documentada (G4-PRC-DOC-01)

## 1. R — Rol
- **Agente / Autor**: Administrador del Sistema Documental y Oficial de Seguridad de la Información / DPO (`Ing. Carlos M. Benítez`).
- **Revisores y Aprobadores**: Directora Universitaria de TIC (`DUTIC - Mg. Lucía Valdivia Paredes`) y Rector / Presidente del Comité SGPI (`Dr. Hugo José Sánchez`).

## 2. A — Alcance
- **Alcance Institucional**: De aplicación estricta a toda la información documentada del SGPI de la UNSA (políticas, procedimientos, registros, declaraciones, actas e informes) en sedes centrales Arequipa (Ingenierías, Biomédicas y Sociales) y filiales regionales descentralizadas de Camaná (RR N° 0142-2025) y El Pedregal - Majes (RR N° 0143-2025).

## 3. F — Formato
- **Arquitectura de Molde Parametrizado (`mold.typ`)**:
  - Función Typst 0.15 pura y parametrizada (`#let mold(...)`), con CERO datos de instancia institucionales hardcodeados.
  - Réplica fiel del orden de secciones del formato oficial del instructor (`Procedimiento_para_control_de_documentos_y_registros_ES.docx`): Objetivo, alcance y usuarios; Documentos de referencia; Control de documentos internos (formato/taxonomía, aprobación, publicación/distribución, actualizaciones/ciclo de vida, control de registros); Documentos externos; Gestión de registros (tabla de 5 columnas); y Validez y gestión de documentos.
  - Integración de los 15 elementos de Anatomía Documental (SPEC 6.1) y Taxonomía `G4-`.
  - Importación centralizada exclusiva desde `../common/template.typ`.
- **Invocador Delgado de Versión (`G4-PRC-DOC-01.typ`)**:
  - Archivo de configuración ligero (~30 líneas) que inyecta los datos canónicos de la versión v3.0 (2025-10-28) correspondientes a la recertificación bajo ISO/IEC 27701:2025.

## 4. A — Ámbito y Criterio Normativo
- **Cláusulas ISO/IEC 27701:2025**:
  - Cláusula 7.5.1: Generalidades de la información documentada del SGPI.
  - Cláusula 7.5.2: Creación y actualización (identificación unívoca, taxonomía `G4-`, formato institucional, revisión y aprobación formal).
  - Cláusula 7.5.3: Control de la información documentada (disponibilidad, protección de confidencialidad e integridad, almacenamiento, control de versiones, preservación histórica e inmutabilidad en PIMS).
- **Controles y Guías Asociadas**:
  - Controles A.3.14 (Protección de registros), A.1.4.8 (Retención) y A.1.4.9 (Disposición segura).
  - Guías B.3.14 (Conservación obligatoria de versiones históricas / máquina del tiempo), B.1.4.8 y B.1.4.9.
- **Trazabilidad PIMS**: Regla estricta de inmutabilidad en el repositorio GESTITEL (`https://unsa.27k.pe`), obligatoriedad de la convención estructurada del `change_summary` y prohibición de eliminación de versiones precedentes.
