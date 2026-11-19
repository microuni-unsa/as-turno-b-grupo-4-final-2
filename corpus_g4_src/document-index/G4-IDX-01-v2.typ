#import "../../molds/document-index/mold.typ": mold

#let data = (
  title: "Mapa e Índice Maestro de Documentos (Auditor's Map)",
  code: "G4-IDX-01",
  version: "2.0",
  date: "2022-09-10",
  confidentiality: "Confidencial",
  author: (
    name: "Ing. Carlos M. Benítez",
    role: "Oficial de Seguridad de la Información (OSI / DPO)",
    date: "2022-09-02"
  ),
  reviewer: (
    name: "Mg. Lucía Valdivia Paredes",
    role: "Directora Universitaria de TIC (DUTIC)",
    date: "2022-09-05"
  ),
  approver: (
    name: "Dr. Hugo José Sánchez",
    role: "Rector - Presidente del Comité SGPI",
    date: "2022-09-10"
  ),
  validity: "2023-09-10",
  owner-role: "Secretaría Técnica del SGPI / DPO",
  references: (
    "Norma ISO/IEC 27701:2019, Cláusula 7.5 (Información documentada).",
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
      summary: "Emisión inicial del mapa documental para la certificación inicial ISO/IEC 27701:2019."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia de la arquitectura documental tras la virtualización de admisiones y teletrabajo con firma digital."
    ),
  ),
  objective_text: [El presente documento actualiza la guía maestra de navegación para auditores de certificación e inspectores internos tras la transición digital post-pandemia. Mantiene los 18 artefactos normativos del SGPI de la Universidad Nacional de San Agustín de Arequipa (UNSA) en estricto orden de Cláusulas 4 a 10.],
  scope_text: [Abarca la información documentada del SGPI que regula la plataforma institucional de Admisión Virtual de Pregrado (`admision.unsa.edu.pe`) y el teletrabajo seguro para Planilla de Remuneraciones en las Sedes Centrales de Arequipa.],
  users_text: [Destinado al equipo de auditoría externa, auditores internos, DPO, Rectorado, jefes de unidad y administradores de sistemas.],
  purpose: [La arquitectura documental del SGPI refleja la adaptación tecnológica a canales virtuales y trabajo remoto, manteniendo la secuencia estándar de cláusulas normativas de ISO (4 a 10) para una trazabilidad exhaustiva en auditorías de seguimiento.],
  callout_title: "ORDEN DE AUDITORÍA POST-PANDEMIA (CLÁUSULAS 4 A 10)",
  callout_body: [Los 18 artefactos normativos del SGPI articulan las salvaguardas de seguridad lógica, conectividad VPN SSL con MFA y firma digital electrónica en Sisgedo, cubriendo integralmente el ciclo de vida documental.],
  documents: (
    (
      clause: "Cl. 4.1 / 4.3 / 4.4",
      code: "G4-ALC-01",
      title: "Determinación del Alcance del SGPI (Admisión Virtual y Planillas Remotas)",
      version: "2.0",
      custodian: "Oficial de Seguridad / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 5.1 / 5.2 / 5.3",
      code: "G4-POL-01",
      title: "Política de Privacidad de la Información (Ejecutiva Digital)",
      version: "2.0",
      custodian: "Alta Dirección / Rectorado",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 6.1.1 / 6.1.2 / 8.2",
      code: "G4-RSK-INC-01",
      title: "Matriz de Riesgos de Incidentes de Privacidad (Enfoque Web y Remoto)",
      version: "2.0",
      custodian: "Oficial de Seguridad / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 6.1.2",
      code: "G4-MET-RSK-01",
      title: "Metodología de Gestión del Riesgo de Privacidad",
      version: "2.0",
      custodian: "Oficial de Seguridad / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 6.1.3 f, g / 8.3",
      code: "G4-PLN-RSK-01",
      title: "Plan de Tratamiento de Riesgos de Privacidad",
      version: "2.0",
      custodian: "Oficial de Seguridad / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 6.1.3 e / 4.1",
      code: "G4-SOA-01",
      title: "Declaración de Aplicabilidad del SGPI (SoA)",
      version: "2.0",
      custodian: "Oficial de Seguridad / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 6.2 / 9.1",
      code: "G4-OBJ-01",
      title: "Tabla de Objetivos de Privacidad de la Información",
      version: "2.0",
      custodian: "Oficial de Seguridad / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 7.5.1 / 7.5.2 / 7.5.3",
      code: "G4-PRC-DOC-01",
      title: "Procedimiento de Control de Información Documentada y Versionado",
      version: "2.0",
      custodian: "Secretaría Técnica SGPI / DUTIC",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 7.2 / 7.3 / A.3.17",
      code: "G4-CAP-INC-01",
      title: "Módulo Formativo: Respuesta a Incidentes de Privacidad",
      version: "2.0",
      custodian: "Academia SGPI / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 7.2 / 7.5.3",
      code: "G4-REG-CAP-01",
      title: "Registro de Asistencia y Evaluación Módulo Incidentes",
      version: "2.0",
      custodian: "Subdirección de Personal / RRHH",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 8.1 / A.3.11 / A.3.12",
      code: "G4-PRC-INC-01",
      title: "Procedimiento de Respuesta a Incidentes de Privacidad",
      version: "2.0",
      custodian: "Líder CSIRT-UNSA / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 8.1 / B.3.12",
      code: "G4-REG-INC-01",
      title: "Registro Oficial y Bitácora de Incidentes de Privacidad",
      version: "2.0",
      custodian: "Equipo CSIRT-UNSA / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 9.2.1 / 9.2.2",
      code: "G4-PRG-AUD-01",
      title: "Programa Anual de Auditorías Internas del SGPI",
      version: "2.0",
      custodian: "Auditor Líder SGPI",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 9.2.2",
      code: "G4-REP-AUD-01",
      title: "Informe de Auditoría Interna del SGPI",
      version: "2.0",
      custodian: "Auditor Líder SGPI",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 9.3.1 / 9.3.2 / 9.3.3",
      code: "G4-ACT-REV-01",
      title: "Acta de Revisión por la Dirección del SGPI",
      version: "2.0",
      custodian: "Comité SGPI / Rectorado",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 10.1 / 10.2",
      code: "G4-PRC-CAPA-01",
      title: "Procedimiento de No Conformidades y Acciones Correctivas",
      version: "2.0",
      custodian: "Oficial de Seguridad / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 10.2",
      code: "G4-REG-CAPA-01",
      title: "Registro y Cadena de Acciones Correctivas (CAPA)",
      version: "2.0",
      custodian: "Oficial de Seguridad / DPO",
      status: "VIGENTE"
    ),
    (
      clause: "Cl. 7.5.1 / 7.5.2 / 7.5.3",
      code: "G4-IDX-01",
      title: "Mapa e Índice Maestro de Documentos del SGPI (Auditor's Map)",
      version: "2.0",
      custodian: "Secretaría Técnica SGPI / DPO",
      status: "VIGENTE"
    )
  ),
  truth_traceability: [Todos los 18 documentos enumerados se encuentran gestionados digitalmente en el repositorio PIMS de la UNSA, con firma electrónica calificada e inmutabilidad de bitácoras.]
)

#mold(data: data)
