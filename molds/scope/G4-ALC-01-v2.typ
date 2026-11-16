#import "mold.typ": mold

#let data = (
  title: "Determinación del Alcance del SGPI",
  code: "G4-ALC-01",
  version: "2.0",
  date: "2022-09-10",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
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
    "Norma ISO/IEC 27701:2019, Cláusula 4.3 (Determinación del alcance del SGPI).",
    "Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Ley Universitaria N° 30220.",
    "Política de Privacidad de la Información de la UNSA (G4-POL-01).",
    "Procedimiento de Control de Información Documentada (G4-PRC-DOC-01).",
  ),
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Emisión inicial de la definición de alcance para la certificación ISO/IEC 27701:2019. Límites físicos: Sedes centrales Arequipa. Procesos: Admisión y Planillas."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia: Reducción del perímetro físico activo, migración digital a portal web (admision.unsa.edu.pe), teletrabajo y exclusión de archivos físicos históricos."
    ),
  ),
  objective_text: [Conforme a las Cláusulas 4.3 y 4.4 de la norma ISO/IEC 27701:2025 y Ley N° 29733, el presente documento actualiza los límites operativos del SGPI de la UNSA tras la aceleración digital post-pandemia, concentrando los esfuerzos de control en los flujos telemáticos y reduciendo la exposición de activos físicos.],
  scope_summary_text: [El alcance abarca la plataforma web institucional de inscripción `admision.unsa.edu.pe`, la recepción de legajos digitales, y el teletrabajo seguro del personal de planillas mediante túneles VPN SSL con MFA en las sedes centrales de Arequipa.],
  users_text: [Destinado a directores de unidad, personal de admisión virtual, analistas de remuneraciones, especialistas de soporte de DUTIC y auditores del SGPI.],
  role_determination: [La UNSA ratifica su función como *Responsable del Tratamiento de Datos Personales (PII Controller)*, determinando la finalidad y condiciones del tratamiento en sus canales digitales.],
  admission_process: (
    title: "Admisión Virtual de Pregrado",
    description: [Comprende la inscripción en línea mediante la plataforma institucional `admision.unsa.edu.pe`, la recepción de documentos académicos digitalizados en formato PDF, la autenticación remota del postulante y la publicación digital de cuadros de méritos.],
    responsible: "Dirección General de Admisión.",
    data_treated: "Datos personales, DNI escaneado, certificados digitalizados, fotografías digitales y credenciales de acceso.",
    key_assets: "Servidores web en clúster virtualizado DUTIC, base de datos PostgreSQL institucional y pasarela de pago digital con el Banco de la Nación."
  ),
  payroll_process: (
    title: "Planilla de Remuneraciones en Teletrabajo",
    description: [Comprende el procesamiento de haberes, cálculo previsional y emisión de boletas de pago electrónicas firmadas digitalmente mediante trámites en Sisgedo, ejecutado por analistas bajo modalidad mixta y teletrabajo.],
    responsible: "Subdirección de Personal y Remuneraciones.",
    data_treated: "Datos remunerativos, bancarios, aportes previsionales y registros de teletrabajo.",
    key_assets: "Túneles VPN SSL institucionales con MFA y servidor de archivos con cifrado en reposo."
  ),
  main_campuses: (
    (name: "Campus Área de Ingenierías", description: "Infraestructura tecnológica central DUTIC y servidores virtualizados."),
    (name: "Campus Área de Biomédicas", description: "Oficinas administrativas adaptadas con estaciones seguras."),
    (name: "Campus Área de Sociales", description: "Pabellones académicos con conectividad lógica restringida.")
  ),
  filiales: (),
  tech_infrastructure: (
    "Redes lógicas corporativas, clúster virtualizado DUTIC, túneles VPN SSL con MFA y estaciones móviles autorizadas.",
  ),
  exclusions: (
    "Archivos Físicos Históricos: Se formaliza la exclusión de los legajos de papel pasivos anteriores al año 2020 resguardados en el Archivo Central.",
    "Procesos de Admisión Extraordinaria Presencial Excepcional fuera de la plataforma web."
  )
)

#mold(data: data)
