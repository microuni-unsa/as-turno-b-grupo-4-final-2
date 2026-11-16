#import "../../molds/scope/mold.typ": mold

#let data = (
  title: "Determinación del Alcance del SGPI",
  code: "G4-ALC-01",
  version: "1.0",
  date: "2019-04-15",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
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
  owner-role: "Oficial de Seguridad de la Información (OSI / DPO)",
  references: (
    "Norma ISO/IEC 27701:2019 / ISO/IEC 27001:2013, Cláusula 4.3 (Determinación del alcance del SGPI).",
    "Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Ley Universitaria N° 30220.",
    "Política de Privacidad de la Información de la UNSA (G4-POL-01).",
  ),
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Emisión inicial de la definición de alcance para la certificación ISO/IEC 27701:2019. Límites físicos: Sedes centrales Arequipa. Procesos: Admisión y Planillas."
    ),
  ),
  objective_text: [El presente documento formaliza los límites organizacionales, geográficos y tecnológicos del Sistema de Gestión de Privacidad de la Información (SGPI) de la Universidad Nacional de San Agustín de Arequipa (UNSA), en cumplimiento de las Cláusulas 4.3 y 4.4 de la norma ISO/IEC 27701:2025 y la Ley N° 29733.],
  scope_summary_text: [El alcance comprende los procesos de Admisión Ordinaria presencial y Planilla de Remuneraciones en las tres áreas centrales de Arequipa (Ingenierías, Biomédicas y Sociales), abarcando servidores locales on-premise en el centro de datos de DUTIC.],
  users_text: [Destinado a autoridades universitarias, Dirección General de Admisión, Subdirección de Personal, DUTIC y personal administrativo y docente involucrado en el SGPI.],
  role_determination: [En aplicación de la Cláusula 4.1, la UNSA determina su función exclusiva como *Responsable del Tratamiento de Datos Personales (PII Controller)* para la totalidad de las actividades comprendidas en este alcance.],
  admission_process: (
    title: "Admisión de Pregrado",
    description: [Comprende la convocatoria, inscripción presencial, validación de requisitos académicos, captura biométrica en ventanilla, aplicación de exámenes ordinarios y publicación de listas de postulantes admitidos a los programas de pregrado de la UNSA.],
    responsible: "Dirección General de Admisión.",
    categories: "Postulantes, padres o apoderados (en caso de menores de edad) y vocales evaluadores.",
    data_treated: "Nombres, DNI, dirección, historial académico escolar, huella dactilar, fotografía y notas."
  ),
  payroll_process: (
    title: "Planilla de Remuneraciones",
    description: [Comprende el cálculo, retención de tributos y aportes de ley, liquidación y pago mensual de sueldos y beneficios del personal docente y no docente de la Universidad.],
    responsible: "Subdirección de Personal y Remuneraciones (Dirección General de Administración).",
    categories: "Docentes ordinarios, docentes contratados y servidores administrativos bajo regímenes DL 276, DL 1057 (CAS) y Ley 30220.",
    data_treated: "Nombres, DNI, cuentas bancarias de abono, aportes a AFP/ONP, descuentos judiciales y evaluaciones de desempeño."
  ),
  main_campuses: (
    (name: "Campus Área de Ingenierías", description: "Av. Independencia s/n con Paucarpata (Data Center principal de DUTIC y servidores centrales)."),
    (name: "Campus Área de Biomédicas", description: "Av. Alcides Carrión s/n (Oficinas de apoyo de admisión)."),
    (name: "Campus Área de Sociales", description: "Av. Virgen del Pilar s/n (Pabellones de aplicación de exámenes).")
  ),
  filiales: (),
  tech_infrastructure: (
    "Servidores on-premise en el centro de datos de DUTIC (Campus Ingenierías), redes LAN cableadas, base de datos local.",
  ),
  exclusions: (
    "Se excluyen los procesos de admisión de posgrado y convenios internacionales, por encontrarse en fase preliminar de diseño documental.",
    "Se excluyen los servicios tercerizados de comedor y transporte universitario, los cuales no acceden a las bases de datos de admisión ni planillas.",
    "Archivos físicos y legajos anteriores a 2018 resguardados en archivo pasivo."
  )
)

#mold(data: data)
