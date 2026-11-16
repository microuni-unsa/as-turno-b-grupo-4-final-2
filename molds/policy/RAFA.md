# Evidencia RAFA: Política de Privacidad de la Información (G4-POL-01)

## 1. R — Rol
- **Agente / Autor**: Oficial de Seguridad de la Información / DPO (`Ing. Carlos M. Benítez`) en representación de la Alta Dirección Universitaria.
- **Revisor Institucional**: Directora Universitaria de TIC (`DUTIC - Mg. Lucía Valdivia Paredes`).
- **Aprobador Institucional**: Rector de la UNSA y Presidente del Comité SGPI (`Dr. Hugo José Sánchez`).

## 2. A — Alcance
- **Alcance Institucional**: De aplicación obligatoria y transversal para toda la Universidad Nacional de San Agustín de Arequipa (UNSA), abarcando los procesos de Admisión y Planillas en sus campus urbanos de Arequipa (Ingenierías, Biomédicas, Sociales) y filiales regionales de Camaná (RR 0142-2025) y El Pedregal - Majes (RR 0143-2025).

## 3. F — Formato
- **Arquitectura Desacoplada (Contrato SPEC 2.1)**:
  - Molde parametrizado puro: `mold.typ` con importación centralizada desde `../common/template.typ` (cero datos de instancia hardcodeados).
  - Invocador de versión delgado: `G4-POL-01-v3.typ` (~35 líneas) que pasa el diccionario de datos de la versión 3.0.
  - Formato ejecutivo conciso de una sola página (1-pager), con diseño formal institucional, cuadro de principios rectores, compromisos de la dirección y bloque de firmas tripartito.

## 4. A — Ámbito y Criterio Normativo
- **Cláusulas ISO/IEC 27701:2025**:
  - Cláusula 5.1: Liderazgo y compromiso.
  - Cláusula 5.2: Política de privacidad (apropiada al propósito y contexto, proporciona marco para objetivos, compromiso de cumplimiento de requisitos aplicables y mejora continua, disponible como información documentada, comunicada dentro de la organización y disponible para partes interesadas).
  - Cláusula 5.3: Roles, responsabilidades y autoridades en la organización.
  - Controles A.3.3 (Políticas de seguridad y privacidad) y guías B.3.3, B.3.14.
- **Legislación Nacional**: Ley N° 29733 de Protección de Datos Personales del Perú y Ley Universitaria 30220.
