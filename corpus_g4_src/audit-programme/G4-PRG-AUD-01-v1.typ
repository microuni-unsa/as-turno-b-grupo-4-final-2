#import "../../molds/audit-programme/mold-prg.typ": mold

#let data = (
  title: "Programa Anual de Auditorías Internas del SGPI",
  code: "G4-PRG-AUD-01",
  version: "1.0",
  date: "2019-04-15",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
  author: (
    name: "Ing. Carlos M. Benítez",
    role: "Auditor Líder / Oficial de Seguridad (OSI)",
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
    "Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Política de Privacidad de la Información de la UNSA (G4-POL-01).",
    "Determinación del Alcance del SGPI (G4-ALC-01).",
  ),
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Emisión del primer programa anual de auditorías para la certificación inicial ISO/IEC 27701:2019 en sedes centrales Arequipa."
    ),
  ),
  objective_text: [El objetivo de este documento es planificar y calendarizar las auditorías internas del SGPI en la Universidad Nacional de San Agustín de Arequipa (UNSA), de conformidad con la Cláusula 9.2 de ISO/IEC 27701 y las directrices de ISO 19011.],
  scope_text: [Aplica a la verificación de los procesos presenciales de Admisión Ordinaria y Planilla de Remuneraciones en las tres áreas centrales de Arequipa (Ingenierías, Biomédicas y Sociales).],
  users_text: [Destinado al Comité SGPI, Auditor Líder, equipo auditor interno, Dirección de Admisión, Subdirección de Personal y DUTIC.],
  objectives: (
    [Verificar la conformidad del SGPI frente a los requisitos de ISO/IEC 27701:2019 y la legislación peruana de protección de datos.],
    [Evaluar la eficacia del control físico sobre los padrones impresos de admisión y los expedientes salariales.],
    [Identificar no conformidades y oportunidades de mejora para preparar la auditoría de certificación de Fase 1.]
  ),
  scope_and_criteria: [
    - *Alcance Organizacional:* Admisión Ordinaria y Planillas en Sedes Centrales Arequipa.
    - *Criterios de Auditoría:* Norma ISO/IEC 27701:2019, Ley N° 29733, Política G4-POL-01 y Procedimiento G4-PRC-DOC-01.
  ],
  schedule: (
    (
      cycle: "AUD-2019-01",
      process_site: "Admisión Central (Campus Arequipa)",
      clauses_controls: "Cl. 4, 5, 8.1 / A.7.2, A.8.1 (Ventanillas de inscripción, padrones físicos y biometría dactilar).",
      auditors: "Ing. Carlos Benítez (Auditor Líder)",
      date: "Mayo 2019",
      status: "CERRADA"
    ),
    (
      cycle: "AUD-2019-02",
      process_site: "Planillas Central (Campus Arequipa)",
      clauses_controls: "Cl. 6.1, 7.5 / A.8.2, A.8.3 (Cálculo de haberes, archivo físico y dispersión bancaria).",
      auditors: "Lic. Rosa Huamán (Auditora Interna)",
      date: "Junio 2019",
      status: "CERRADA"
    ),
    (
      cycle: "AUD-2019-03",
      process_site: "Centro de Cómputo DUTIC (Campus Ingenierías)",
      clauses_controls: "Cl. 7.5, 8.1 / A.9.1, A.11.1 (Controles de acceso a sala de servidores y copias de seguridad).",
      auditors: "Ing. Carlos Benítez / Ing. Marco Pinto",
      date: "Octubre 2019",
      status: "CERRADA"
    )
  ),
  methods: [
    - Muestreo representativo de expedientes físicos de postulantes y legajos laborales.
    - Inspección visual de medidas de seguridad física en ventanillas de archivo.
    - Entrevistas con operadores de mesa de partes y analistas de planillas.
  ]
)

#mold(data: data)
