#import "../../molds/audit-programme/mold-prg.typ": mold

#let data = (
  title: "Programa Anual de Auditorías Internas del SGPI",
  short-title: "Programa Anual de Auditorías Internas",
  code: "G4-PRG-AUD-01",
  version: "3.0",
  date: "2025-10-28",
  confidentiality: "Confidencial",
  author: (
    name: "Ing. Carlos M. Benítez",
    role: "Auditor Líder / Oficial de Seguridad (OSI)",
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
  owner-role: "Auditor Líder del SGPI / OSI",
  references: (
    "Norma ISO/IEC 27701:2025, Cláusula 9.2 (Auditoría interna, segunda edición).",
    "Norma ISO 19011:2026 (Directrices para la auditoría de los sistemas de gestión).",
    "Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Resoluciones Rectorales N° 0142-2025 y N° 0143-2025-UNSA (Filiales Camaná y Majes).",
    "Política de Privacidad de la Información de la UNSA (G4-POL-01).",
    "Determinación del Alcance del SGPI (G4-ALC-01).",
  ),
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Emisión del primer programa anual de auditorías para la certificación ISO/IEC 27701:2019."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia incorporando auditorías de seguridad en aplicaciones web y teletrabajo."
    ),
    (
      version: "3.0",
      date: "2025-10-28",
      author: "Ing. Carlos M. Benítez",
      summary: "Recertificación bajo ISO/IEC 27701:2025: Extensión del programa a Filial Camaná y Filial El Pedregal (Majes) bajo ISO 19011:2026."
    ),
  ),
  objective_text: [Establecer y planificar el Programa Anual de Auditorías Internas para evaluar la conformidad, eficacia y madurez del SGPI de la UNSA, de conformidad con la Cláusula 9.2 de la norma ISO/IEC 27701:2025 y las directrices metodológicas de la norma ISO 19011:2026.],
  scope_text: [Abarca los procesos de Admisión de Pregrado Integral y Planilla de Remuneraciones Multisede en las Sedes Centrales de Arequipa y en las Filiales Descentralizadas de Camaná y El Pedregal (Majes).],
  users_text: [Destinado al Comité SGPI, Auditor Líder, equipo auditor de sistemas, coordinadores de filial y auditores externos de certificación.],
  objectives: (
    [Verificar si el SGPI es conforme con los requisitos propios de la UNSA y los requisitos normativos de ISO/IEC 27701:2025 (Cláusulas 4 a 10 y Anexo A).],
    [Evaluar la eficacia operacional en los procesos misionales de Admisión y de soporte de Planillas en campus centrales y filiales descentralizadas.],
    [Identificar oportunidades de mejora continua y verificar la eficacia de las acciones correctivas previas (`G4-REG-CAPA-01`).]
  ),
  scope_and_criteria: [
    - *Alcance Organizacional:* Admisión Pregrado y Planillas de Remuneraciones en Sedes Arequipa, Filial Camaná y Filial El Pedregal (Majes).
    - *Criterios de Auditoría:* Norma ISO/IEC 27701:2025, Ley N° 29733 de Protección de Datos Personales de Perú, Políticas institucionales (`G4-POL-01`) y Procedimientos operativos (`G4-PRC-INC-01`, `G4-PRC-DOC-01`).
  ],
  schedule: (
    (
      cycle: "AUD-01",
      process_site: "Admisión Central (Campus Arequipa)",
      clauses_controls: "Cl. 4, 5, 8.1 / A.1.2.9, A.1.3.7, A.1.4.2 (Captura biométrica y padrones).",
      auditors: "Ing. Carlos Benítez (Auditor Líder)",
      date: "Mayo 2025",
      status: "CERRADA"
    ),
    (
      cycle: "AUD-02",
      process_site: "Planillas Central (Campus Arequipa)",
      clauses_controls: "Cl. 6.1, 7.5 / A.3.7, A.3.9, A.3.26 (Dispersión bancaria y cifrado).",
      auditors: "Lic. Rosa Huamán (Auditora Interna)",
      date: "Junio 2025",
      status: "CERRADA"
    ),
    (
      cycle: "AUD-03",
      process_site: "Filial Camaná (Sede Descentralizada)",
      clauses_controls: "Cl. 8.1, A.3.11, A.3.22 (Seguridad terminales móviles y admisiones filial).",
      auditors: "Ing. Carlos Benítez / Ing. Marco Pinto",
      date: "Octubre 2025",
      status: "CERRADA"
    ),
    (
      cycle: "AUD-04",
      process_site: "Filial El Pedregal (Sede Descentralizada)",
      clauses_controls: "Cl. 8.1, A.3.7, A.3.12 (Sincronización nómina VPN y respuesta local).",
      auditors: "Ing. Carlos Benítez / Mg. Lucía Valdivia",
      date: "Noviembre 2025",
      status: "EN_CURSO"
    )
  ),
  methods: [
    - Se aplicará muestreo estadístico representativo sobre expedientes de admisión y nóminas salariales.
    - Pruebas técnicas de verificación de cifrado de disco BitLocker y configuración de firewalls de filial.
    - Los resultados se consolidan formalmente en el Informe de Auditoría Interna (`G4-REP-AUD-01`).
  ]
)

#mold(data: data)
