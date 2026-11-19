#import "../../molds/management-review/mold.typ": mold

#let data = (
  title: "Acta de Revisión por la Dirección del SGPI",
  short-title: "Acta de Revisión por la Dirección",
  code: "G4-ACT-REV-01",
  version: "1.0",
  date: "2019-04-15",
  confidentiality: "Confidencial",
  author: (
    name: "Ing. Carlos M. Benítez",
    role: "Secretario Técnico / Oficial de Seguridad (OSI)",
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
  owner-role: "Oficial de Seguridad de la Información (OSI / DPO)",
  references: (
    "Norma ISO/IEC 27701:2019 / ISO/IEC 27001:2013 Cláusula 9.3 (Revisión por la dirección).",
    "Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Política de Privacidad de la Información de la UNSA (G4-POL-01).",
    "Informe de Auditoría Interna del SGPI (G4-REP-AUD-01).",
  ),
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Emisión de la primera acta de revisión por la dirección para certificación inicial ISO/IEC 27701:2019 en sedes centrales Arequipa."
    ),
  ),
  objective_text: [El objetivo de este documento es formalizar la revisión inicial del SGPI por parte de la Alta Dirección de la Universidad Nacional de San Agustín de Arequipa (UNSA), de conformidad con la Cláusula 9.3 de ISO/IEC 27701.],
  scope_text: [Aplica a la evaluación de los procesos presenciales de Admisión Ordinaria y Planilla de Remuneraciones en las tres áreas centrales de Arequipa (Ingenierías, Biomédicas y Sociales).],
  users_text: [Destinado al Rectorado, Comité SGPI, directores de área y auditores de certificación.],
  session_data: (
    date_time: "15 de abril de 2019, 09:00 a 12:00 horas.",
    place: "Sala de Sesiones de Rectorado (Sede Central Calle Santa Catalina).",
    presides: "Dr. Rohel Sánchez Sánchez (Rector de la UNSA).",
    attendees: (
      "Dr. Rohel Sánchez Sánchez (Rector de la UNSA).",
      "Dra. Ana María Gutiérrez Valdivia (Vicerrectora Académica).",
      "Mg. Lucía Valdivia Paredes (Directora Universitaria de TIC - DUTIC).",
      "Dr. Walter Delgado Manrique (Director General de Admisión).",
      "Lic. Martha Elena Córdova (Subdirectora de Personal y Remuneraciones).",
      "Ing. Carlos M. Benítez (Oficial de Seguridad de la Información / DPO - Secretario Técnico)."
    )
  ),
  inputs_intro: [El Secretario Técnico expone los puntos mandatorios requeridos para la certificación inicial del SGPI:],
  review_inputs: (
    (
      title: "Contexto Institucional y Alcance (9.3.2.a)",
      content: [Se formaliza el alcance en los campus centrales de Arequipa y la función de la UNSA como Responsable del Tratamiento (PII Controller).]
    ),
    (
      title: "Resultados de Auditorías Internas (9.3.2.c)",
      content: [El informe `G4-REP-AUD-01` constata conformidad sustancial en la captura biométrica dactilar y custodia de padrones impresos.]
    ),
    (
      title: "Evaluación de Riesgos de Privacidad (9.3.2.e)",
      content: [Se presenta la matriz inicial de riesgos, identificando controles prioritarios en trituración física de papel y control de accesos al Centro de Datos DUTIC.]
    ),
    (
      title: "Retroalimentación y Cumplimiento Legal (9.3.2.d)",
      content: [Cero quejas registradas ante la Autoridad Nacional de Protección de Datos Personales (ANPD).]
    )
  ),
  outputs_intro: [Habiendo evaluado las exposiciones, el Comité acordó unánimemente:],
  decisions: (
    (
      title: "Aprobación del Marco Documental Inicial",
      content: [Se aprueban formalmente las versiones 1.0 de la Política (`G4-POL-01`), Alcance (`G4-ALC-01`), Objetivos (`G4-OBJ-01`) y Procedimiento de Documentos (`G4-PRC-DOC-01`).]
    ),
    (
      title: "Asignación Presupuestal de Implementación",
      content: [Se aprueba la adquisición de trituradoras de microcorte de alta seguridad y lectores biométricos para el Centro de Datos DUTIC.]
    ),
    (
      title: "Convocatoria a Auditoría de Certificación Externa",
      content: [Se autoriza al DPO coordinar la auditoría externa de Fase 1 con el ente certificador acreditado.]
    )
  ),
  closing_text: [Siendo las 12:00 horas, se dio por finalizada la sesión de revisión por la dirección, firmando las autoridades en señal de plena conformidad.]
)

#mold(data: data)
