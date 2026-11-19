#import "../../molds/incident-risks/mold.typ": mold

#let data = (
  code: "G4-PLN-RSK-01",
  version: "3.0",
  date: "2025-10-28",
  title: "Plan de tratamiento del riesgo",
  short-title: "Plan de tratamiento del riesgo",
  confidentiality: "Confidencial",
  owner-role: "Oficial de Seguridad de la Información (OSI / DPO)",
  intro-text: "Para cumplir los objetivos del Sistema de Gestión de Privacidad de la Información (SGPI) de la UNSA y reducir los riesgos sobre los titulares de datos a niveles aceptables, es necesario realizar las siguientes actividades:",
  author: (
    name: "Ing. Carlos M. Benítez",
    role: "Oficial de Seguridad de la Información (OSI / DPO)",
    date: "2025-10-20"
  ),
  reviewer: (
    name: "Mg. Lucía Valdivia Paredes",
    role: "Directora Universitaria de TIC (DUTIC)",
    date: "2025-10-24"
  ),
  approver: (
    name: "Dr. Hugo José Sánchez",
    role: "Rector de la Universidad Nacional de San Agustín de Arequipa / Presidente del Comité SGPI",
    date: "2025-10-28"
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
    (
      version: "3.0",
      date: "2025-10-28",
      author: "Ing. Carlos M. Benítez",
      summary: "Plan integral multisede bajo ISO/IEC 27701:2025: incorporación de salvaguardas para filiales Camaná y Majes, MDM Intune y DMARC reject."
    ),
  ),
  activities: (
    (
      desc: "Despliegue de trituradoras de microcorte P-4 y protocolo de mesa limpia en módulos de admisión.",
      resources: "Presupuesto operativo DUTIC / 8 equipos de microcorte",
      responsible: "Dr. Walter Delgado (Dir. Admisión)",
      schedule: "2025-11-01 a 2025-12-15",
      training: "Taller presencial sobre manejo seguro de residuos documentales",
      eval-method: "Inspecciones aleatorias de mesa limpia y actas de destrucción",
      status: "IMPLEMENTADO"
    ),
    (
      desc: "Implementación de script automatizado de cifrado PDF para boletas salariales y reglas DLP en Exchange.",
      resources: "Servidor DUTIC / Licenciamiento de módulo de seguridad",
      responsible: "Lic. Martha Elena Córdova (Subdir. Personal)",
      schedule: "2025-11-15 a 2026-01-30",
      training: "Capacitación a analistas de remuneraciones en cifrado de nóminas",
      eval-method: "Muestreo mensual de boletas emitidas y registros de bloqueo DLP",
      status: "IMPLEMENTADO"
    ),
    (
      desc: "Instalación de lector biométrico autónomo y registro foliado de accesos al Data Center DUTIC.",
      resources: "Hardware biométrico IP y cámara de videovigilancia CCTV",
      responsible: "Mg. Lucía Valdivia (Directora DUTIC)",
      schedule: "2025-11-01 a 2025-12-30",
      training: "Inducción al personal de seguridad y operadores de infraestructura",
      eval-method: "Auditoría semestral de bitácora biométrica cruzada con cámaras",
      status: "IMPLEMENTADO"
    ),
    (
      desc: "Integración de escaneos estáticos SAST (SonarQube) en pipeline CI/CD y tokens JWT efímeros en portal de admisión.",
      resources: "Servidor CI/CD GitLab institucional y herramientas DevSecOps",
      responsible: "Mg. Lucía Valdivia (Directora DUTIC)",
      schedule: "2025-12-01 a 2026-02-28",
      training: "Curso de desarrollo seguro OWASP API Security para programadores",
      eval-method: "Reportes de vulnerabilidades sin hallazgos críticos previo al pase a prod",
      status: "IMPLEMENTADO"
    ),
    (
      desc: "Despliegue mandatorio de autenticación multifactor (MFA/TOTP) en cliente VPN para teletrabajo de personal.",
      resources: "Servicio de autenticación institucional y tokens móviles",
      responsible: "Lic. Martha Elena Córdova (Subdir. Personal)",
      schedule: "2025-11-15 a 2026-01-15",
      training: "Guía rápida interactiva en Aula Virtual sobre activación de MFA",
      eval-method: "Porcentaje de cuentas de teletrabajo activas con MFA (Meta: 100%)",
      status: "IMPLEMENTADO"
    ),
    (
      desc: "Automatización de copias de seguridad PostgreSQL con cifrado AES-256 y simulación semestral de contingencia.",
      resources: "Almacenamiento en nube privada institucional y scripts bash verificados",
      responsible: "Ing. Marco Pinto (Admin. BD DUTIC)",
      schedule: "2025-11-01 a 2025-12-20",
      training: "Procedimiento de restauración ante desastres (DRP) en base de datos",
      eval-method: "Acta de prueba de restauración con verificación de integridad de datos",
      status: "IMPLEMENTADO"
    ),
    (
      desc: "Configuración de chip TPM 2.0, cifrado BitLocker XTS-AES 256 forzoso y enrolamiento en MDM Microsoft Intune para laptops en Filial Camaná.",
      resources: "Licencias Microsoft 365 A5 / Intune y soporte técnico de campo",
      responsible: "Dr. Marcos A. Cárdenas (Coord. Filial Camaná)",
      schedule: "2025-11-10 a 2025-12-30",
      training: "Taller sobre custodia física de terminales móviles y reporte de pérdidas",
      eval-method: "Panel centralizado MDM con 100% de dispositivos cifrados y conformes",
      status: "IMPLEMENTADO"
    ),
    (
      desc: "Implementación de túnel VPN IPSec IKEv2 con pre-shared key y doble firma digital para transferencias de nómina en Filial El Pedregal (Majes).",
      resources: "Firewall perimetral FortiGate en filial y enlace dedicado de datos",
      responsible: "Lic. Martha Elena Córdova (Subdir. Personal)",
      schedule: "2025-11-15 a 2026-01-20",
      training: "Instrucción a operadores descentralizados sobre validación de abonos",
      eval-method: "Monitoreo de tráfico VPN y conciliación contable sin discrepancias",
      status: "IMPLEMENTADO"
    ),
    (
      desc: "Despliegue de registros SPF, DKIM y política DMARC reject estricta en dominios institucionales unsa.edu.pe y campañas de phishing simulado.",
      resources: "Plataforma de simulación de ciberataques y configuración DNS",
      responsible: "Ing. Carlos M. Benítez (OSI / DPO)",
      schedule: "2025-11-01 a 2026-02-15",
      training: "Módulo interactivo obligatorio sobre detección de ingeniería social en Academia UNSA",
      eval-method: "Tasa de apertura y reporte de correos simulados (Meta: < 5% clics)",
      status: "IMPLEMENTADO"
    )
  )
)

#mold(data)
