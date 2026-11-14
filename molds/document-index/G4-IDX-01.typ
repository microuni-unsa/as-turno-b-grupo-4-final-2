#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
  title: "Mapa e Índice Maestro de Documentos (Auditor's Map)",
  code: "G4-IDX-01",
  version: "3.0",
  date: "2025-10-28",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
  author: (
    name: "Ing. Carlos M. Benítez",
    role: "Oficial de Seguridad de la Información (OSI / DPO)",
    date: "2025-10-20"
  ),
  reviewer: (
    name: "Mg. Lucía Valdivia Paredes",
    role: "Directora Universitaria de TIC (DUTIC)",
    date: "2025-10-24"
  ),
  approver: (
    name: "Dr. Hugo José Sánchez",
    role: "Rector - Presidente del Comité SGPI",
    date: "2025-10-28"
  ),
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Emisión inicial del mapa documental para la certificación ISO/IEC 27701:2019."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización de la arquitectura documental tras la virtualización post-pandemia."
    ),
    (
      version: "3.0",
      date: "2025-10-28",
      author: "Ing. Carlos M. Benítez",
      summary: "Recertificación bajo ISO/IEC 27701:2025: Reestructuración por orden de cláusulas 4 a 10 e incorporación de filiales descentralizadas."
    ),
  )
)

= Propósito del Mapa de Auditoría
El presente documento constituye la guía maestra de navegación para auditores de certificación (Fase 1 y Fase 2) e inspectores internos. Establece el mapeo riguroso y exhaustivo entre los requisitos de la norma internacional *ISO/IEC 27701:2025 (Segunda edición, octubre 2025)* y los artefactos documentales vigentes del SGPI de la Universidad Nacional de San Agustín de Arequipa (UNSA).

#callout(title: "ORDEN DE AUDITORÍA DE FASE 1 (CLÁUSULAS 4 A 10)", color: rgb("#0284c7"))[
  La documentación del SGPI ha sido diseñada, codificada y estructurada siguiendo la secuencia estándar de cláusulas normativas de alto nivel de ISO (4 Contexto, 5 Liderazgo, 6 Planificación, 7 Apoyo, 8 Operación, 9 Evaluación del Desempeño y 10 Mejora), facilitando la revisión sistemática por parte del equipo auditor.
]

= Inventario Maestro de Documentos por Cláusula Normativa

#table(
  columns: (65pt, 65pt, 1fr, 35pt, 85pt, 50pt),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, center, left, center, left, center),
  table.header([*Cláusula ISO*], [*Código*], [*Título del Documento Institucional*], [*Ver.*], [*Responsable / Custodio*], [*Estado PIMS*]),
  
  // Cláusula 4
  [Cl. 4.1 / 4.3 / 4.4],
  [G4-ALC-01],
  [Determinación del Alcance del SGPI (Admisión Central y Filiales + Planillas).],
  [3.0],
  [Oficial de Seguridad / DPO],
  status-tag("VIGENTE"),

  // Cláusula 5
  [Cl. 5.1 / 5.2 / 5.3],
  [G4-POL-01],
  [Política de Privacidad de la Información (Ejecutiva 1-Pager).],
  [3.0],
  [Alta Dirección / Rectorado],
  status-tag("VIGENTE"),

  // Cláusula 6
  [Cl. 6.1.2 / 6.1.3],
  [G4-RSK-INC-01],
  [Matriz y Plan de Tratamiento de Riesgos de Incidentes de Privacidad.],
  [3.0],
  [Oficial de Seguridad / DPO],
  status-tag("VIGENTE"),

  [Cl. 6.1.3e / Anexo A],
  [G4-SOA-01],
  [Declaración de Aplicabilidad del SGPI (SoA - Tablas A.1, A.2 excluida, A.3).],
  [3.0],
  [Oficial de Seguridad / DPO],
  status-tag("VIGENTE"),

  [Cl. 6.2],
  [G4-OBJ-01],
  [Tabla de Objetivos de Privacidad de la Información y Plan de Consecución.],
  [3.0],
  [Oficial de Seguridad / DPO],
  status-tag("VIGENTE"),

  // Cláusula 7
  [Cl. 7.5.2 / 7.5.3],
  [G4-PRC-DOC-01],
  [Procedimiento de Control de Información Documentada y Versionado.],
  [3.0],
  [Secretaría Técnica SGPI],
  status-tag("VIGENTE"),

  [Cl. 7.2 / 7.3 / A.3.17],
  [G4-CAP-INC-01],
  [Módulo Formativo: Respuesta a Incidentes de Privacidad (Syllabus 8h).],
  [3.0],
  [Academia SGPI / DPO],
  status-tag("VIGENTE"),

  [Cl. 7.2 / 7.3 / A.3.17],
  [G4-REG-CAP-01],
  [Registro de Asistencia y Evaluación (Pre/Post-Test) Módulo Incidentes.],
  [3.0],
  [Subdirección de Personal],
  status-tag("VIGENTE"),

  // Cláusula 8
  [Cl. 8.1 / A.3.11 / A.3.12],
  [G4-PRC-INC-01],
  [Procedimiento de Respuesta a Incidentes de Privacidad (Guías B.3.11/B.3.12).],
  [3.0],
  [Líder CSIRT / DPO],
  status-tag("VIGENTE"),

  [Cl. 8.1 / B.3.12],
  [G4-REG-INC-01],
  [Registro Oficial de Incidentes de Privacidad (XLSX via generate.ts Bun).],
  [3.0],
  [Equipo CSIRT-UNSA],
  status-tag("VIGENTE"),

  // Cláusula 9
  [Cl. 9.2.1 / 9.2.2],
  [G4-PRG-AUD-01],
  [Programa Anual de Auditorías Internas del SGPI (ISO 19011:2026).],
  [3.0],
  [Auditor Líder SGPI],
  status-tag("VIGENTE"),

  [Cl. 9.2.2],
  [G4-REP-AUD-01],
  [Informe de Auditoría Interna del SGPI (Resumen y Hallazgos Multisede).],
  [3.0],
  [Auditor Líder SGPI],
  status-tag("VIGENTE"),

  [Cl. 9.3.1 / 9.3.2 / 9.3.3],
  [G4-ACT-REV-01],
  [Acta de Revisión por la Dirección del SGPI (Entradas y Salidas Cl. 9.3).],
  [3.0],
  [Comité SGPI / Rectorado],
  status-tag("VIGENTE"),

  // Cláusula 10
  [Cl. 10.1 / 10.2],
  [G4-REG-CAPA-01],
  [Registro de No Conformidades y Acciones Correctivas (Cadena CAPA RAG).],
  [3.0],
  [Oficial de Seguridad / DPO],
  status-tag("VIGENTE")
)

= Trazabilidad con el Repositorio de la Verdad (PIMS GESTITEL)
Todos los documentos enumerados se encuentran cargados en el PIMS institucional bajo el esquema `unsa` en `https://unsa.27k.pe`. Las versiones anteriores (`v1.0`, `v2.0`) se conservan en estado `obsoleto` para consulta retrospectiva con sus respectivos códigos de verificación hash SHA-256.
