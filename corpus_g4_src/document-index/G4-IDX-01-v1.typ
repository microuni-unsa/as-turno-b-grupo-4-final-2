#import "../../molds/document-index/mold.typ": mold

#let data = (
  title: "Mapa e Índice Maestro de Documentos (Auditor's Map)",
  code: "G4-IDX-01",
  version: "1.0",
  date: "2019-04-15",
  confidentiality: "Confidencial",
  author: (
    name: "Ing. Carlos M. Benítez",
    role: "Oficial de Seguridad de la Información (OSI / DPO)",
    date: "2019-04-10"
  ),
  reviewer: (
    name: "Mg. Lucía Valdivia Paredes",
    role: "Directora Universitaria de TIC (DUTIC)",
    date: "2019-04-12"
  ),
  approver: (
    name: "Dr. Rohel Sánchez Sánchez",
    role: "Rector - Presidente del Comité SGPI",
    date: "2019-04-15"
  ),
  validity: "2020-04-15",
  owner-role: "Secretaría Técnica del SGPI / DPO",
  references: (
    "Norma ISO/IEC 27701:2019 / ISO/IEC 27001:2013, Cláusula 7.5 (Información documentada).",
    "Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Procedimiento para Control de Documentos y Registros (G4-PRC-DOC-01).",
    "Política de Privacidad de la Información de la UNSA (G4-POL-01).",
    "Determinación del Alcance del SGPI (G4-ALC-01).",
  ),
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Emisión inicial del mapa documental para la certificación inicial ISO/IEC 27701:2019 en sedes centrales Arequipa."
    ),
  ),
  objective_text: [El presente documento constituye la guía maestra de navegación para auditores de certificación (Fase 1 y Fase 2) e inspectores internos. Establece el inventario estructurado de los 18 artefactos documentales del SGPI de la Universidad Nacional de San Agustín de Arequipa (UNSA), organizados rigurosamente por orden de cláusulas normativas 4 a 10.],
  scope_text: [Aplica a la totalidad de la información documentada del SGPI para los procesos presenciales de Admisión Ordinaria y Planilla de Remuneraciones en las Sedes Centrales de Arequipa (Ingenierías, Biomédicas y Sociales).],
  users_text: [Destinado al equipo auditor de certificación, auditores internos, DPO, Rectorado y custodios de información documentada.],
  purpose: [La arquitectura documental del SGPI ha sido diseñada, codificada y estructurada siguiendo la secuencia estándar de cláusulas normativas de alto nivel de ISO (4 Contexto, 5 Liderazgo, 6 Planificación, 7 Apoyo, 8 Operación, 9 Evaluación del Desempeño y 10 Mejora), facilitando la revisión sistemática por parte del equipo auditor en el proceso de certificación.],
  callout_title: "ORDEN DE AUDITORÍA DE FASE 1 (CLÁUSULAS 4 A 10)",
  callout_body: [Los 18 artefactos normativos del SGPI se auditan en secuencia correlativa desde el Contexto (Cláusula 4) hasta la Mejora Continua (Cláusula 10), garantizando que no existan vacíos de control ni lagunas en la información documentada requerida por la norma.],
  documents: (
    (
      clause: "Cl. 4.1 / 4.3 / 4.4",
      code: "G4-ALC-01",
      title: "Determinación del Alcance del SGPI (Admisión Central y Planillas)",
      version: "1.0",
      custodian: "Oficial de Seguridad / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 5.1 / 5.2 / 5.3",
      code: "G4-POL-01",
      title: "Política de Privacidad de la Información (Ejecutiva)",
      version: "1.0",
      custodian: "Alta Dirección / Rectorado",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 6.1.1 / 6.1.2 / 8.2",
      code: "G4-RSK-INC-01",
      title: "Matriz de Riesgos de Incidentes de Privacidad",
      version: "1.0",
      custodian: "Oficial de Seguridad / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 6.1.2",
      code: "G4-MET-RSK-01",
      title: "Metodología de Gestión del Riesgo de Privacidad",
      version: "1.0",
      custodian: "Oficial de Seguridad / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 6.1.3 f, g / 8.3",
      code: "G4-PLN-RSK-01",
      title: "Plan de Tratamiento de Riesgos de Privacidad",
      version: "1.0",
      custodian: "Oficial de Seguridad / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 6.1.3 e / 4.1",
      code: "G4-SOA-01",
      title: "Declaración de Aplicabilidad del SGPI (SoA)",
      version: "1.0",
      custodian: "Oficial de Seguridad / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 6.2 / 9.1",
      code: "G4-OBJ-01",
      title: "Tabla de Objetivos de Privacidad de la Información",
      version: "1.0",
      custodian: "Oficial de Seguridad / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 7.5.1 / 7.5.2 / 7.5.3",
      code: "G4-PRC-DOC-01",
      title: "Procedimiento de Control de Información Documentada y Versionado",
      version: "1.0",
      custodian: "Secretaría Técnica SGPI / DUTIC",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 7.2 / 7.3 / A.3.17",
      code: "G4-CAP-INC-01",
      title: "Módulo Formativo: Respuesta a Incidentes de Privacidad",
      version: "1.0",
      custodian: "Academia SGPI / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 7.2 / 7.5.3",
      code: "G4-REG-CAP-01",
      title: "Registro de Asistencia y Evaluación Módulo Incidentes",
      version: "1.0",
      custodian: "Subdirección de Personal / RRHH",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 8.1 / A.3.11 / A.3.12",
      code: "G4-PRC-INC-01",
      title: "Procedimiento de Respuesta a Incidentes de Privacidad",
      version: "1.0",
      custodian: "Líder CSIRT-UNSA / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 8.1 / B.3.12",
      code: "G4-REG-INC-01",
      title: "Registro Oficial y Bitácora de Incidentes de Privacidad",
      version: "1.0",
      custodian: "Equipo CSIRT-UNSA / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 9.2.1 / 9.2.2",
      code: "G4-PRG-AUD-01",
      title: "Programa Anual de Auditorías Internas del SGPI",
      version: "1.0",
      custodian: "Auditor Líder SGPI",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 9.2.2",
      code: "G4-REP-AUD-01",
      title: "Informe de Auditoría Interna del SGPI",
      version: "1.0",
      custodian: "Auditor Líder SGPI",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 9.3.1 / 9.3.2 / 9.3.3",
      code: "G4-ACT-REV-01",
      title: "Acta de Revisión por la Dirección del SGPI",
      version: "1.0",
      custodian: "Comité SGPI / Rectorado",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 10.1 / 10.2",
      code: "G4-PRC-CAPA-01",
      title: "Procedimiento de No Conformidades y Acciones Correctivas",
      version: "1.0",
      custodian: "Oficial de Seguridad / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 10.2",
      code: "G4-REG-CAPA-01",
      title: "Registro y Cadena de Acciones Correctivas (CAPA)",
      version: "1.0",
      custodian: "Oficial de Seguridad / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 7.5.1 / 7.5.2 / 7.5.3",
      code: "G4-IDX-01",
      title: "Mapa e Índice Maestro de Documentos del SGPI (Auditor's Map)",
      version: "1.0",
      custodian: "Secretaría Técnica SGPI / DPO",
      status: "VIGENTE"
    )
  ),
  truth_traceability: [Todos los 18 documentos enumerados se encuentran formalizados en el archivo físico y digital del SGPI bajo custodia de la Secretaría Técnica y DUTIC, con control de acceso por roles.]
)

#mold(data: data)
