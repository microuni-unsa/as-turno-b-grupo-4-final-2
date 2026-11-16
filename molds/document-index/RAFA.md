# Evidencia RAFA: Mapa e Índice Maestro de Documentos (G4-IDX-01)

## 1. R — Rol
- **Agente / Autor**: Administrador del SGPI y Responsable de Cumplimiento Normativo (`Ing. Carlos M. Benítez - OSI/DPO`).
- **Revisor Institucional**: Directora Universitaria de TIC (`DUTIC - Mg. Lucía Valdivia Paredes`).
- **Aprobador Institucional**: Rector de la UNSA y Presidente del Comité SGPI (`Dr. Hugo José Sánchez`).
- **Destinatarios**: Auditores de Certificación de Fase 1 y Fase 2, Alta Dirección Universitaria y Comité SGPI.

## 2. A — Alcance
- **Alcance**: Índice completo de toda la base documental de 18 códigos del SGPI de la UNSA en los procesos de Admisión y Planillas en sedes centrales Arequipa (Ingenierías, Biomédicas, Sociales) y filiales regionales de Camaná (RR 0142-2025) y El Pedregal (Majes, RR 0143-2025).

## 3. F — Formato
- **Arquitectura Desacoplada (Contrato SPEC 2.1)**:
  - Molde parametrizado puro: `mold.typ` con importación centralizada desde `../common/template.typ` (cero datos de instancia hardcodeados).
  - Invocador de versión delgado: `G4-IDX-01-v3.typ` (~130 líneas) mapeando exhaustivamente los 18 documentos del sistema.
  - Tabla estructurada de inventario en orden estricto de cláusulas ISO 4 → 10, con códigos `G4-`, versiones vigentes, custodios/responsables y estados PIMS.

## 4. A — Ámbito y Criterio Normativo
- **Norma Base**: ISO/IEC 27701:2025 (Segunda edición, octubre 2025).
- **Enfoque de Auditor de Fase 1**: Los auditores examinan el sistema de gestión interrogando cláusula por cláusula (4 a 10). Este mapa proporciona la correlación unívoca e inmediata entre cada requisito normativo y los 18 artefactos documentales institucionales de la UNSA, incluyendo los nuevos códigos `G4-MET-RSK-01`, `G4-PLN-RSK-01` y `G4-PRC-CAPA-01`.
- **Cláusulas**: Cláusula 7.5 (7.5.1, 7.5.2, 7.5.3 - Control de información documentada), Controles A.3.14 y Guías B.3.14.
