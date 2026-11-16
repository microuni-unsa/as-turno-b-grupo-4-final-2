#import "../../molds/management-review/mold.typ": mold

#let data = (
  title: "Acta de Revisión por la Dirección del SGPI",
  code: "G4-ACT-REV-01",
  version: "2.0",
  date: "2022-09-10",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
  author: (
    name: "Ing. Carlos M. Benítez",
    role: "Secretario Técnico / Oficial de Seguridad (OSI)",
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
  owner-role: "Oficial de Seguridad de la Información (OSI / DPO)",
  references: (
    "Norma ISO/IEC 27701:2019 Cláusula 9.3 (Revisión por la dirección).",
    "Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Política de Privacidad de la Información de la UNSA (G4-POL-01).",
    "Informe de Auditoría Interna del SGPI (G4-REP-AUD-01).",
    "Registro de Acciones Correctivas del SGPI (G4-REG-CAPA-01).",
  ),
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Emisión de la primera acta de revisión por la dirección para certificación inicial ISO/IEC 27701:2019."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Revisión post-pandemia evaluando la migración digital a portal web (admision.unsa.edu.pe), teletrabajo y firma digital."
    ),
  ),
  objective_text: [El objetivo de este documento es registrar la revisión extraordinaria del SGPI tras la adaptación institucional post-pandemia, conforme a la Cláusula 9.3 de ISO/IEC 27701 y la Ley N° 29733.],
  scope_text: [Abarca la evaluación de la plataforma institucional de Admisión Virtual de Pregrado y la gestión de Planillas en modalidad de teletrabajo en las sedes centrales de Arequipa.],
  users_text: [Destinado al Rectorado, Comité SGPI, directores de unidad académica y técnica, y auditores de seguimiento.],
  session_data: (
    date_time: "10 de setiembre de 2022, 10:00 a 12:30 horas.",
    place: "Sala de Consejo Universitario y enlace virtual telemático.",
    presides: "Dr. Hugo José Sánchez (Rector de la UNSA).",
    attendees: (
      "Dr. Hugo José Sánchez (Rector de la UNSA).",
      "Dr. Luis Enrique Cuadros Paz (Vicerrector Académico).",
      "Mg. Lucía Valdivia Paredes (Directora Universitaria de TIC - DUTIC).",
      "Dr. Walter Delgado Manrique (Director General de Admisión).",
      "Lic. Martha Elena Córdova (Subdirectora de Personal y Remuneraciones).",
      "Ing. Carlos M. Benítez (Oficial de Seguridad de la Información / DPO - Secretario Técnico)."
    )
  ),
  inputs_intro: [El Secretario Técnico expone los puntos mandatorios evaluados durante el período de adaptación tecnológica post-pandemia:],
  review_inputs: (
    (
      title: "Adaptación del Alcance y Cuestiones Externas (9.3.2.b)",
      content: [Contracción formal del perímetro físico, migración digital a `admision.unsa.edu.pe` y exclusión de archivos pasivos anteriores a 2020.]
    ),
    (
      title: "Desempeño y Resultados de Auditorías (9.3.2.c)",
      content: [El informe `G4-REP-AUD-01` constata la eficacia de los túneles VPN SSL y MFA para teletrabajo, y el cierre de la no conformidad sobre tokens JWT.]
    ),
    (
      title: "Gestión de Incidentes de Privacidad (9.3.2.c)",
      content: [Tratamiento eficaz de incidente web `G4-INC-2022-001` (hotfix backend en 4 horas, sin exfiltración masiva, notificado preventivamente a ANPD).]
    ),
    (
      title: "Eficacia en Gestión de Riesgos Lógicos (9.3.2.e)",
      content: [Actualización de la matriz de riesgos priorizando controles OWASP Top 10 y cifrado en tránsito HTTPS/TLS 1.3.]
    )
  ),
  outputs_intro: [Concluida la revisión, el Comité de Gobierno Digital y Privacidad acordó:],
  decisions: (
    (
      title: "Aprobación de Versiones 2.0 del SGPI",
      content: [Se formalizan las versiones 2.0 de la Política (`G4-POL-01`), Alcance (`G4-ALC-01`), Objetivos (`G4-OBJ-01`) y SoA (`G4-SOA-01`).]
    ),
    (
      title: "Fortalecimiento de la Plataforma Web DUTIC",
      content: [Se autoriza la adquisición de un Web Application Firewall (WAF) dedicado y licencias de escaneo continuo de vulnerabilidades.]
    ),
    (
      title: "Mantenimiento del Teletrabajo Seguro",
      content: [Se ratifica la obligatoriedad del uso de VPN corporativa y token MFA institucional para todo tratamiento remoto de datos personales.]
    )
  ),
  closing_text: [Siendo las 12:30 horas, se dio por levantada la sesión de revisión por la dirección, suscribiendo los presentes en señal de conformidad.]
)

#mold(data: data)
