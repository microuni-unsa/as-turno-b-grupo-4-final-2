#import "../../molds/incident-risks/mold.typ": mold

#let data = (
  code: "G4-PLN-RSK-01",
  version: "2.0",
  date: "2022-09-10",
  title: "Plan de tratamiento del riesgo",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
  owner-role: "Oficial de Seguridad de la Información (OSI / DPO)",
  intro-text: "Para cumplir los objetivos del Sistema de Gestión de Privacidad de la Información (SGPI) de la UNSA y reducir los riesgos sobre los titulares de datos a niveles aceptables, es necesario realizar las siguientes actividades:",
  author: (
    name: "Ing. Carlos M. Benítez",
    role: "Oficial de Seguridad de la Información (OSI / DPO)",
    date: "2022-09-02"
  ),
  reviewer: (
    name: "Mg. Lucía Valdivia Paredes",
    role: "Directora Universitaria de TIC (DUTIC)",
    date: "2022-09-06"
  ),
  approver: (
    name: "Dr. Hugo José Sánchez",
    role: "Rector de la Universidad Nacional de San Agustín de Arequipa / Presidente del Comité SGPI",
    date: "2022-09-10"
  ),
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Formulación inicial del plan de tratamiento de riesgos de privacidad para la certificación ISO/IEC 27701:2019 en sedes centrales Arequipa."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia COVID-19: actividades de tratamiento para el portal web de admisión, teletrabajo con MFA y respaldos de bases de datos."
    ),
  ),
  activities: (
    (
      desc: "Despliegue de trituradoras de microcorte P-4 y protocolo de mesa limpia en módulos de atención presencial.",
      resources: "Presupuesto operativo DUTIC / 8 equipos de microcorte",
      responsible: "Dr. Walter Delgado (Dir. Admisión)",
      schedule: "2022-09-15 a 2022-10-30",
      training: "Taller presencial sobre manejo seguro de residuos documentales de postulantes",
      eval-method: "Inspecciones aleatorias de mesa limpia y actas de destrucción",
      status: "IMPLEMENTADO"
    ),
    (
      desc: "Implementación de script automatizado de cifrado PDF para boletas salariales y reglas DLP en Exchange.",
      resources: "Servidor DUTIC / Licenciamiento de módulo de seguridad",
      responsible: "Lic. Martha Elena Córdova (Subdir. Personal)",
      schedule: "2022-09-20 a 2022-11-15",
      training: "Capacitación a analistas de remuneraciones en cifrado de nóminas",
      eval-method: "Muestreo mensual de boletas emitidas y registros de bloqueo DLP",
      status: "IMPLEMENTADO"
    ),
    (
      desc: "Instalación de lector biométrico autónomo y registro foliado de accesos al Data Center DUTIC.",
      resources: "Hardware biométrico IP y cámara de videovigilancia CCTV",
      responsible: "Mg. Lucía Valdivia (Directora DUTIC)",
      schedule: "2022-09-15 a 2022-10-31",
      training: "Inducción al personal de seguridad y operadores de infraestructura",
      eval-method: "Auditoría semestral de bitácora biométrica cruzada con cámaras",
      status: "IMPLEMENTADO"
    ),
    (
      desc: "Integración de escaneos estáticos SAST (SonarQube) en pipeline CI/CD y tokens JWT efímeros en portal de admisión.",
      resources: "Servidor CI/CD institucional y licencias SonarQube",
      responsible: "Mg. Lucía Valdivia (Directora DUTIC)",
      schedule: "2022-10-01 a 2022-12-15",
      training: "Curso de desarrollo seguro OWASP Top 10 para programadores de DUTIC",
      eval-method: "Reportes automatizados de vulnerabilidades sin hallazgos críticos",
      status: "IMPLEMENTADO"
    ),
    (
      desc: "Despliegue mandatorio de autenticación multifactor (MFA/TOTP) en cliente VPN para teletrabajo de nómina.",
      resources: "Servidor de autenticación institucional y tokens móviles",
      responsible: "Lic. Martha Elena Córdova (Subdir. Personal)",
      schedule: "2022-09-20 a 2022-11-10",
      training: "Guía rápida interactiva en Aula Virtual sobre activación de MFA",
      eval-method: "Auditoría de conexiones activas con 100% de cumplimiento MFA",
      status: "IMPLEMENTADO"
    ),
    (
      desc: "Automatización de copias de seguridad PostgreSQL con cifrado AES-256 y pruebas trimestrales de restauración DRP.",
      resources: "Almacenamiento SAN secundario y scripts de validación",
      responsible: "Ing. Marco Pinto (Admin. BD DUTIC)",
      schedule: "2022-10-01 a 2022-11-30",
      training: "Entrenamiento en procedimientos de recuperación de desastres DRP",
      eval-method: "Acta de simulación de restauración en ambiente de pruebas",
      status: "IMPLEMENTADO"
    ),
  )
)

#mold(data)
