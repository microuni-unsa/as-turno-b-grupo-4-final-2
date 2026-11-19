#import "../../molds/audit-programme/mold-prg.typ": mold

#let data = (
  title: "Programa Anual de Auditorías Internas del SGPI",
  short-title: "Programa Anual de Auditorías Internas",
  code: "G4-PRG-AUD-01",
  version: "2.0",
  date: "2022-09-10",
  confidentiality: "Confidencial",
  author: (
    name: "Ing. Carlos M. Benítez",
    role: "Auditor Líder / Oficial de Seguridad (OSI)",
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
  owner-role: "Auditor Líder del SGPI / OSI",
  references: (
    "Norma ISO/IEC 27701:2019 Cláusula 9.2 (Auditoría interna).",
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
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia incorporando auditorías técnicas de plataformas web (admision.unsa.edu.pe) y teletrabajo con VPN/MFA."
    ),
  ),
  objective_text: [El objetivo de este documento es planificar las auditorías internas del SGPI en la Universidad Nacional de San Agustín de Arequipa (UNSA), de conformidad con la Cláusula 9.2 de ISO/IEC 27701 e ISO 19011, enfocando los ciclos en la seguridad de aplicaciones web y teletrabajo post-pandemia.],
  scope_text: [Aplica a la verificación de la plataforma de Admisión Virtual de Pregrado y la gestión de Planillas en modalidad de teletrabajo en las sedes centrales de Arequipa.],
  users_text: [Destinado al Comité SGPI, Auditor Líder, equipo auditor de sistemas, analistas de DUTIC y operadores de procesos virtuales.],
  objectives: (
    [Verificar la conformidad de los controles lógicos implementados en el portal web de admisiones frente a ISO/IEC 27701.],
    [Evaluar la eficacia del túnel VPN SSL con MFA y la protección de datos en equipos de teletrabajo.],
    [Auditar la efectividad de los planes de contingencia y respaldos de bases de datos PostgreSQL.]
  ),
  scope_and_criteria: [
    - *Alcance Organizacional:* Admisión Virtual y Planillas en Teletrabajo en Sedes Centrales Arequipa.
    - *Criterios de Auditoría:* Norma ISO/IEC 27701:2019, Ley N° 29733, Procedimiento G4-PRC-INC-01 y estándares de seguridad web.
  ],
  schedule: (
    (
      cycle: "AUD-2022-01",
      process_site: "Portal Web Admisión (DUTIC / Admisión)",
      clauses_controls: "Cl. 8.1, A.12.1 / A.14.2 (Seguridad aplicativo web, protección de formularios y bases de datos).",
      auditors: "Ing. Carlos Benítez (Auditor Líder)",
      date: "Mayo 2022",
      status: "CERRADA"
    ),
    (
      cycle: "AUD-2022-02",
      process_site: "Planillas Teletrabajo (Subdirección Personal)",
      clauses_controls: "Cl. 6.1, 7.5 / A.6.2, A.9.4 (Conexiones remotas VPN SSL, MFA y firma electrónica Sisgedo).",
      auditors: "Lic. Rosa Huamán / Ing. Marco Pinto",
      date: "Junio 2022",
      status: "CERRADA"
    ),
    (
      cycle: "AUD-2022-03",
      process_site: "Infraestructura Cloud / Virtualizada DUTIC",
      clauses_controls: "Cl. 7.5, 8.1 / A.12.3, A.12.4 (Copias de respaldo cifradas y monitoreo de logs de firewall).",
      auditors: "Ing. Carlos Benítez (Auditor Líder)",
      date: "Octubre 2022",
      status: "CERRADA"
    )
  ),
  methods: [
    - Revisiones remotas y locales de configuraciones de seguridad en servidores web y firewalls.
    - Muestreo telemático de expedientes digitales de postulantes y boletas electrónicas en Sisgedo.
    - Entrevistas por videoconferencia y validación de autenticación de operadores en teletrabajo.
  ]
)

#mold(data: data)
