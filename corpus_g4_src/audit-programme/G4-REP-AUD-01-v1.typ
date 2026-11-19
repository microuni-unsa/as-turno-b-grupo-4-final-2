#import "../../molds/audit-programme/mold-rep.typ": mold

#let data = (
  title: "Informe de Auditoría Interna del SGPI",
  short-title: "Informe de Auditoría Interna del SGPI",
  code: "G4-REP-AUD-01",
  version: "1.0",
  date: "2019-04-15",
  confidentiality: "Confidencial",
  author: (
    name: "Ing. Carlos M. Benítez",
    role: "Auditor Líder del SGPI",
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
  owner-role: "Auditor Líder del SGPI / OSI",
  references: (
    "Norma ISO/IEC 27701:2019 / ISO/IEC 27001:2013 Cláusula 9.2 (Auditoría interna).",
    "Norma ISO 19011:2018 (Directrices para la auditoría de los sistemas de gestión).",
    "Programa Anual de Auditorías Internas del SGPI (G4-PRG-AUD-01).",
    "Procedimiento de No Conformidades y Acciones Correctivas (G4-PRC-CAPA-01).",
  ),
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Emisión inicial del informe de auditoría interna para la certificación inicial ISO/IEC 27701:2019."
    ),
  ),
  objective_text: [El objetivo de este informe es documentar los resultados, hallazgos y dictamen de conformidad de la auditoría interna inicial del SGPI en la Universidad Nacional de San Agustín de Arequipa (UNSA), de conformidad con la Cláusula 9.2 de ISO/IEC 27701 y las directrices de ISO 19011.],
  scope_text: [Abarcó los procesos presenciales de Admisión Ordinaria y Planilla de Remuneraciones, el Centro de Datos de DUTIC y las oficinas administrativas en las sedes centrales de Arequipa.],
  users_text: [Destinado al Rectorado, Comité SGPI, jefes de unidad auditada y al organismo certificador externo para la auditoría de Fase 1.],
  general_data: (
    audit_code: "AUD-2019-CICLO1",
    normative_ref: "ISO/IEC 27701:2019 / ISO/IEC 27001:2013 e ISO 19011:2018.",
    execution_dates: "02 al 08 de abril de 2019.",
    audit_team: "Ing. Carlos M. Benítez (Auditor Líder), Lic. Rosa Huamán (Auditora de Procesos).",
    audited_areas: "Dirección General de Admisión, Subdirección de Personal y Remuneraciones, y Centro de Datos DUTIC."
  ),
  executive_summary: [La auditoría interna constató que el SGPI de la UNSA se encuentra adecuadamente estructurado y en proceso satisfactorio de maduración. Se verificó el cumplimiento de las salvaguardas de confidencialidad en la captura de datos de postulantes y en el archivo de legajos salariales, recomendándose la formalización del procedimiento de trituración física.],
  findings: (
    (
      id: "H-2019-01",
      tag: "VERDE",
      description: "Conformidad destacada: Control biométrico dactilar en ventanillas de admisión y verificación de identidad.",
      process_site: "Admisión (Campus Arequipa)",
      capa_status: "Conforme"
    ),
    (
      id: "H-2019-02",
      tag: "AMARILLO",
      description: "Observación: Reforzar el rotulado de confidencialidad y control de llaves en archivadores de la Subdirección de Personal.",
      process_site: "Planillas (Sede Central)",
      capa_status: "En curso (CAPA-2019-01)"
    ),
    (
      id: "H-2019-03",
      tag: "VERDE",
      description: "Conformidad: Control estricto de acceso físico y bitácora en la sala de servidores de DUTIC.",
      process_site: "Centro de Datos (Ingenierías)",
      capa_status: "Conforme"
    )
  ),
  conclusion: [Se dictamina que el Sistema de Gestión de Privacidad de la Información (SGPI) de la UNSA cumple con los requisitos normativos aplicables y se encuentra *apto para afrontar la auditoría externa de certificación de Fase 1*. Las observaciones han sido incorporadas en el plan de acciones correctivas `G4-REG-CAPA-01`.]
)

#mold(data: data)
