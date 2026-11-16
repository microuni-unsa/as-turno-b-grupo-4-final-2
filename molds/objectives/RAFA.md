# Evidencia RAFA: Objetivos de Privacidad de la Información (G4-OBJ-01)

## 1. R — Rol
- **Agente / Autor**: Responsable de Planificación y Gestión de Métricas del SGPI (`Ing. Carlos M. Benítez - OSI/DPO`).
- **Revisores y Aprobadores**: Directora Universitaria de TIC (`DUTIC - Mg. Lucía Valdivia`) y Rector / Comité de Gobierno Digital y Privacidad (`Dr. Hugo José Sánchez`).

## 2. A — Alcance
- **Alcance Operativo**: Objetivos medibles aplicables a los procesos de Admisión y Planillas en las sedes urbanas de Arequipa (Ingenierías, Biomédicas, Sociales) y filiales regionales de Camaná (RR 0142-2025) y El Pedregal (Majes, RR 0143-2025).

## 3. F — Formato
- **Arquitectura Desacoplada (Contrato SPEC 2.1)**:
  - Molde parametrizado puro: `mold.typ` con importación centralizada desde `../common/template.typ` (cero datos de instancia hardcodeados).
  - Invocador de versión delgado: `G4-OBJ-01-v3.typ` (~50 líneas) que define la matriz institucional de objetivos de la versión 3.0.
  - Matriz formal de objetivos de privacidad, indicadores clave de desempeño (KPIs), recursos requeridos, responsables, plazos de ejecución y metodología de medición y evaluación.

## 4. A — Ámbito y Criterio Normativo
- **Cláusulas ISO/IEC 27701:2025**:
  - Cláusula 6.2: Objetivos de privacidad y planificación para alcanzarlos (alineados con la política 5.2, medibles, monitoreados, comunicados, actualizados y conservados como información documentada).
  - Cláusula 9.1: Seguimiento, medición, análisis y evaluación del desempeño.
  - Controles A.3.16 y guías B.3.16.
- **Enfoque de Medición**: Medición cuantitativa del desempeño del sistema para la revisión por la dirección (Cl. 9.3).
