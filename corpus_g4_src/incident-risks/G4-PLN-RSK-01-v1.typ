#import "../../molds/incident-risks/mold.typ": mold

#let data = (
  code: "G4-PLN-RSK-01",
  version: "1.0",
  date: "2019-04-15",
  title: "Plan de tratamiento del riesgo",
  short-title: "Plan de tratamiento del riesgo",
  confidentiality: "Confidencial",
  owner-role: "Oficial de Seguridad de la Información (OSI / DPO)",
  intro-text: "Para cumplir los objetivos del Sistema de Gestión de Privacidad de la Información (SGPI) de la UNSA y reducir los riesgos sobre los titulares de datos a niveles aceptables, es necesario realizar las siguientes actividades:",
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
    role: "Rector de la Universidad Nacional de San Agustín de Arequipa / Presidente del Comité SGPI",
    date: "2019-04-15"
  ),
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Formulación inicial del plan de tratamiento de riesgos de privacidad para la certificación ISO/IEC 27701:2019 en sedes centrales Arequipa."
    ),
  ),
  activities: (
    (
      desc: "Despliegue de trituradoras de microcorte P-4 y protocolo de mesa limpia en módulos de admisión presencial.",
      resources: "Presupuesto operativo DUTIC / 8 equipos de microcorte",
      responsible: "Dr. Walter Delgado (Dir. Admisión)",
      schedule: "2019-05-01 a 2019-06-15",
      training: "Taller presencial sobre manejo seguro de residuos documentales de postulantes",
      eval-method: "Inspecciones aleatorias de mesa limpia y actas de destrucción",
      status: "IMPLEMENTADO"
    ),
    (
      desc: "Implementación de script automatizado de cifrado PDF para boletas salariales y reglas DLP en Exchange.",
      resources: "Servidor DUTIC / Licenciamiento de módulo de seguridad",
      responsible: "Lic. Martha Elena Córdova (Subdir. Personal)",
      schedule: "2019-05-15 a 2019-07-30",
      training: "Capacitación a analistas de remuneraciones en cifrado de nóminas",
      eval-method: "Muestreo mensual de boletas emitidas y registros de bloqueo DLP",
      status: "IMPLEMENTADO"
    ),
    (
      desc: "Instalación de lector biométrico autónomo y registro foliado de accesos al Data Center DUTIC.",
      resources: "Hardware biométrico IP y cámara de videovigilancia CCTV",
      responsible: "Mg. Lucía Valdivia (Directora DUTIC)",
      schedule: "2019-05-01 a 2019-06-30",
      training: "Inducción al personal de seguridad y operadores de infraestructura",
      eval-method: "Auditoría semestral de bitácora biométrica cruzada con cámaras",
      status: "IMPLEMENTADO"
    ),
  )
)

#mold(data)
