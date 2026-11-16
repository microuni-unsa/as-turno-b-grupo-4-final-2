# Evidencia RAFA: Programa e Informe de Auditoría Interna (G4-PRG-AUD-01 / G4-REP-AUD-01)

## 1. R — Rol
- **Agente / Autor**: Auditor Líder del SGPI y Responsable de Aseguramiento de Calidad de la UNSA (`Ing. Carlos M. Benítez`).
- **Revisores y Aprobadores**: Directora Universitaria de TIC (`DUTIC - Mg. Lucía Valdivia`) y Rector / Comité de Gobierno Digital y Privacidad (`Dr. Hugo José Sánchez`).

## 2. A — Alcance
- **Alcance de Auditoría**: Procesos de Admisión de Pregrado y Planillas de Remuneraciones, cubriendo las sedes centrales de Arequipa (Ingenierías, Biomédicas, Sociales) y las sedes descentralizadas de Filial Camaná (RR 0142-2025) y Filial El Pedregal (Majes, RR 0143-2025).

## 3. F — Formato
- **Arquitectura Desacoplada (Contrato SPEC 2.1)**:
  - Dos moldes parametrizados puros: `mold-prg.typ` (Programa Anual) y `mold-rep.typ` (Informe de Auditoría) con importación centralizada desde `../common/template.typ` (cero datos de instancia hardcodeados).
  - Invocadores de versión delgados: `G4-PRG-AUD-01-v3.typ` (~55 líneas) y `G4-REP-AUD-01-v3.typ` (~50 líneas).
- **Programa Anual (`G4-PRG-AUD-01-v3.typ`)**: Estructura de programación multisede con frecuencia semestral, objetivos de auditoría, métodos (entrevista, muestreo de registros, prueba técnica), criterios de auditoría, asignación de equipo auditor y cronograma detallado.
- **Informe de Auditoría (`G4-REP-AUD-01-v3.typ`)**: Estructura formal de reporte con datos generales, resumen ejecutivo, desglose de hallazgos (Conformidades, Observaciones, No Conformidades con tags RAG), trazabilidad hacia `G4-REG-CAPA-01` y dictamen final de madurez del SGPI.

## 4. A — Ámbito y Criterio Normativo
- **Cláusulas ISO/IEC 27701:2025**:
  - Cláusula 9.2.1: Auditoría interna general (conforme a los requisitos propios y de la norma, implementado y mantenido eficazmente).
  - Cláusula 9.2.2: Programa de auditoría interna (planificar, establecer, implementar y mantener programas con frecuencia, métodos, responsabilidades y reportes conservados como información documentada).
  - Controles A.3.15, A.3.16 y guías B.3.15, B.3.16.
- **Directrices Metodológicas**: ISO 19011:2026 (Directrices para la auditoría de los sistemas de gestión).
- **Alimentación al Proceso de Mejora**: Los hallazgos del informe nutren directamente la Revisión por la Dirección (Cl. 9.3) y la apertura de acciones correctivas (Cl. 10.2 / `G4-REG-CAPA-01`).
