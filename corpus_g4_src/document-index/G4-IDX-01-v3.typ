#import "../../molds/document-index/mold.typ": mold

#let data = (
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
  validity: "2026-10-28",
  owner-role: "Secretaría Técnica del SGPI / DPO",
  references: (
    "Norma ISO/IEC 27701:2025, Cláusula 7.5 (Información documentada: 7.5.1, 7.5.2 y 7.5.3, segunda edición).",
    "Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Resoluciones Rectorales N° 0142-2025 y N° 0143-2025-UNSA (Filiales Camaná y Majes).",
    "Procedimiento para Control de Documentos y Registros (G4-PRC-DOC-01).",
    "Política de Privacidad de la Información de la UNSA (G4-POL-01).",
    "Determinación del Alcance del SGPI (G4-ALC-01).",
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
      summary: "Recertificación bajo ISO/IEC 27701:2025: Reestructuración por orden de cláusulas 4 a 10 e incorporación de filiales descentralizadas y nuevos códigos de riesgo y mejora."
    ),
  ),
  objective_text: [El presente documento constituye la guía maestra de navegación para auditores de certificación (Fase 1 y Fase 2) e inspectores internos. Establece el mapeo riguroso y exhaustivo entre los requisitos de la norma internacional *ISO/IEC 27701:2025 (Segunda edición, octubre 2025)* y los 18 artefactos documentales vigentes del SGPI de la Universidad Nacional de San Agustín de Arequipa (UNSA).],
  scope_text: [Abarca el conjunto de información documentada del SGPI para los procesos de Admisión de Pregrado Integral y Planilla de Remuneraciones Multisede en las Sedes Centrales de Arequipa y Filiales de Camaná y El Pedregal (Majes).],
  users_text: [Dirigido al equipo de auditores externos, auditores internos bajo ISO 19011:2026, Rectorado, Comité SGPI, Directora de DUTIC y Oficial de Seguridad / DPO.],
  purpose: [La documentación del SGPI ha sido diseñada, codificada y estructurada siguiendo la secuencia estándar de cláusulas normativas de alto nivel de ISO (4 Contexto, 5 Liderazgo, 6 Planificación, 7 Apoyo, 8 Operación, 9 Evaluación del Desempeño y 10 Mejora), facilitando la revisión sistemática por parte del equipo auditor.],
  callout_title: "ORDEN DE AUDITORÍA DE FASE 1 (CLÁUSULAS 4 A 10)",
  callout_body: [Los 18 documentos del SGPI se estructuran en estricto orden de cláusulas 4 a 10, garantizando cobertura completa de requisitos normativos, evidencia de operación y control de registros.],
  documents: (
    (
      clause: "Cl. 4.1 / 4.3 / 4.4",
      code: "G4-ALC-01",
      title: "Determinación del Alcance del SGPI (Admisión Central y Filiales + Planillas)",
      version: "3.0",
      custodian: "Oficial de Seguridad / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 5.1 / 5.2 / 5.3",
      code: "G4-POL-01",
      title: "Política de Privacidad de la Información (Ejecutiva 1-Pager)",
      version: "3.0",
      custodian: "Alta Dirección / Rectorado",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 6.1.1 / 6.1.2 / 8.2",
      code: "G4-RSK-INC-01",
      title: "Matriz de Riesgos de Incidentes de Privacidad",
      version: "3.0",
      custodian: "Oficial de Seguridad / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 6.1.2",
      code: "G4-MET-RSK-01",
      title: "Metodología de Gestión del Riesgo de Privacidad (Criterios y Evaluación)",
      version: "3.0",
      custodian: "Oficial de Seguridad / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 6.1.3 f, g / 8.3",
      code: "G4-PLN-RSK-01",
      title: "Plan de Tratamiento de Riesgos de Privacidad",
      version: "3.0",
      custodian: "Oficial de Seguridad / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 6.1.3 e / 4.1",
      code: "G4-SOA-01",
      title: "Declaración de Aplicabilidad del SGPI (SoA - Tablas A.1, A.2 excluida, A.3)",
      version: "3.0",
      custodian: "Oficial de Seguridad / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 6.2 / 9.1",
      code: "G4-OBJ-01",
      title: "Tabla de Objetivos de Privacidad de la Información y Plan de Consecución",
      version: "3.0",
      custodian: "Oficial de Seguridad / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 7.5.1 / 7.5.2 / 7.5.3",
      code: "G4-PRC-DOC-01",
      title: "Procedimiento de Control de Información Documentada y Versionado",
      version: "3.0",
      custodian: "Secretaría Técnica SGPI / DUTIC",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 7.2 / 7.3 / A.3.17",
      code: "G4-CAP-INC-01",
      title: "Módulo Formativo: Respuesta a Incidentes de Privacidad (Syllabus 8h)",
      version: "3.0",
      custodian: "Academia SGPI / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 7.2 / 7.5.3",
      code: "G4-REG-CAP-01",
      title: "Registro de Asistencia y Evaluación (Pre/Post-Test) Módulo Incidentes",
      version: "3.0",
      custodian: "Subdirección de Personal / RRHH",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 8.1 / A.3.11 / A.3.12",
      code: "G4-PRC-INC-01",
      title: "Procedimiento de Respuesta a Incidentes de Privacidad (Guías B.3.11/B.3.12)",
      version: "3.0",
      custodian: "Líder CSIRT-UNSA / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 8.1 / B.3.12",
      code: "G4-REG-INC-01",
      title: "Registro Oficial y Bitácora de Incidentes de Privacidad y Brechas de PII",
      version: "3.0",
      custodian: "Equipo CSIRT-UNSA / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 9.2.1 / 9.2.2",
      code: "G4-PRG-AUD-01",
      title: "Programa Anual de Auditorías Internas del SGPI (ISO 19011:2026)",
      version: "3.0",
      custodian: "Auditor Líder SGPI",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 9.2.2",
      code: "G4-REP-AUD-01",
      title: "Informe de Auditoría Interna del SGPI (Hallazgos y Conformidad Multisede)",
      version: "3.0",
      custodian: "Auditor Líder SGPI",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 9.3.1 / 9.3.2 / 9.3.3",
      code: "G4-ACT-REV-01",
      title: "Acta de Revisión por la Dirección del SGPI (Entradas y Salidas Cl. 9.3)",
      version: "3.0",
      custodian: "Comité SGPI / Rectorado",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 10.1 / 10.2",
      code: "G4-PRC-CAPA-01",
      title: "Procedimiento de No Conformidades y Acciones Correctivas",
      version: "3.0",
      custodian: "Oficial de Seguridad / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 10.2",
      code: "G4-REG-CAPA-01",
      title: "Registro y Cadena de Acciones Correctivas (CAPA RAG / PIMS)",
      version: "3.0",
      custodian: "Oficial de Seguridad / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 7.5.1 / 7.5.2 / 7.5.3",
      code: "G4-IDX-01",
      title: "Mapa e Índice Maestro de Documentos del SGPI (Auditor's Map)",
      version: "3.0",
      custodian: "Secretaría Técnica SGPI / DPO",
      status: "VIGENTE"
    )
  ),
  truth_traceability: [Todos los 18 documentos enumerados se encuentran cargados en el PIMS institucional bajo el esquema `unsa` en `https://unsa.27k.pe`. Las versiones anteriores (`v1.0`, `v2.0`) se conservan en estado `obsoleto` para consulta retrospectiva con sus respectivos códigos de verificación hash SHA-256.]
)

#mold(data: data)
