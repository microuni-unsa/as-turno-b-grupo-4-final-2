#import "../../molds/policy/mold.typ": mold

#let data = (
  title: "Política de Privacidad de la Información",
  short-title: "Política de Privacidad",
  code: "G4-POL-01",
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
  owner-role: "Oficial de Seguridad de la Información (OSI / DPO)",
  references: (
    "Norma ISO/IEC 27701:2019 Cláusula 5.2 (Política de privacidad de la información).",
    "Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Ley Universitaria N° 30220.",
    "Determinación del Alcance del SGPI (G4-ALC-01).",
    "Procedimiento de Control de Información Documentada (G4-PRC-DOC-01).",
  ),
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Emisión inicial de la Política de Privacidad de la Información para la certificación ISO/IEC 27701:2019. Alcance: Sedes centrales Arequipa."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia: Incorporación de directrices de seguridad para plataformas web (admision.unsa.edu.pe), teletrabajo y firma digital."
    ),
  ),
  objective_text: [El objetivo de esta política es formalizar el compromiso ineludible de la Alta Dirección de la Universidad Nacional de San Agustín de Arequipa (UNSA) con la protección, confidencialidad, integridad y uso legítimo de los datos personales tratados en sus plataformas virtuales y actividades en teletrabajo, de conformidad con la Cláusula 5.2 de la norma ISO/IEC 27701 y la Ley N° 29733.],
  scope_text: [Esta política rige para todos los procesos digitales de Admisión Virtual de Pregrado y Planilla de Remuneraciones en modalidad de teletrabajo en las sedes centrales de Arequipa, abarcando servidores web, bases de datos en la nube institucional y conexiones remotas VPN.],
  users_text: [Aplicable a la comunidad universitaria, postulantes a través del portal web institucional, servidores públicos en teletrabajo, personal técnico de DUTIC y operadores del sistema Sisgedo.],
  commitment_statement: [La Alta Dirección de la *Universidad Nacional de San Agustín de Arequipa (UNSA)*, ratificando su calidad de *Responsable del Tratamiento de Datos Personales (PII Controller)*, asume el compromiso ineludible de fortalecer la ciberseguridad y la privacidad en los servicios digitales universitarios, adaptando sus procesos al estándar *ISO/IEC 27701:2019* y a la Ley N° 29733.],
  principles: (
    (
      title: "Legalidad y Transparencia Digital",
      description: [Los avisos de privacidad y cláusulas de consentimiento se publican de forma clara, accesible y previa en la plataforma web institucional.]
    ),
    (
      title: "Minimización y Necesidad",
      description: [En las inscripciones virtuales solo se recaban los documentos escaneados e información indispensables para verificar la condición del postulante.]
    ),
    (
      title: "Seguridad en Teletrabajo y Canales Lógicos",
      description: [Es obligatorio el empleo de autenticación multifactor (MFA), túneles VPN SSL cifrados y software antimalware administrado en toda estación utilizada para procesar planillas o admisiones.]
    ),
    (
      title: "Confidencialidad y Retención Limitada",
      description: [Los datos personales en soporte digital cuentan con controles de acceso basados en roles y se conservan únicamente durante los plazos establecidos en las directivas institucionales.]
    ),
    (
      title: "Ejercicio Digital de Derechos ARCO",
      description: [Se implementa la recepción y atención expedita de solicitudes ARCO a través de la Mesa de Partes Digital de la Universidad.]
    ),
  ),
  commitments: (
    [Proveer equipamiento seguro, licencias de cifrado y enlaces de alta disponibilidad para el trabajo remoto y la plataforma web de admisión.],
    [Capacitar al personal en riesgos telemáticos, prevención de phishing y seguridad en la nube.],
    [Monitorear de forma continua la seguridad perimetral y ejecutar auditorías de vulnerabilidades en los sistemas web.]
  )
)

#mold(data: data)
