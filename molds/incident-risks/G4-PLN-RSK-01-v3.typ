#import "mold.typ": mold

#let data = (
  code: "G4-PLN-RSK-01",
  version: "3.0",
  date: "2025-10-28",
  title: "Plan de Tratamiento de Riesgos de Privacidad",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
  owner-role: "Oficial de Seguridad de la Información (OSI / DPO)",
  intro-text: "Para cumplir los objetivos del Sistema de Gestión de Privacidad de la Información (SGPI) bajo la norma ISO/IEC 27701:2025 (Cláusulas 6.1.3.f y 8.3), la Universidad Nacional de San Agustín de Arequipa (UNSA) formula e implementa las siguientes actividades de tratamiento de riesgos de privacidad en sus sedes centrales de Arequipa y filiales regionales de Camaná y El Pedregal (Majes):",
  validity: "2026-10-28",
  references: (
    "ISO/IEC 27701:2025 — Cláusulas 6.1.3.f, 6.1.3.g y 8.3",
    "ISO/IEC 27001:2022 — Cláusula 6.1.3 y Anexo A",
    "Ley N° 29733 — Ley de Protección de Datos Personales del Perú y su Reglamento",
    "G4-MET-RSK-01 — Metodología de Evaluación y Tratamiento de Riesgos de Privacidad",
    "G4-RSK-INC-01 — Matriz y Reporte de Evaluación de Riesgos de Incidentes",
    "G4-SOA-01 — Declaración de Aplicabilidad del SGPI",
  ),
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
    role: "Rector - Presidente del Comité SGPI",
    date: "2025-10-28"
  ),
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Formulación inicial del plan de tratamiento de riesgos para la certificación ISO/IEC 27701:2019 en sedes centrales Arequipa."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia del plan de tratamiento para actividades de admisión virtual, accesos remotos y respaldo de bases de datos."
    ),
    (
      version: "3.0",
      date: "2025-10-28",
      author: "Ing. Carlos M. Benítez",
      summary: "Recertificación bajo ISO/IEC 27701:2025: Plan multisede integrando Filial Camaná (RR 0142-2025), Filial El Pedregal (RR 0143-2025), gestión MDM y protección de enlaces VPN."
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
      eval-method: "Porcentaje de cuentas de teletrabajo con MFA habilitado (meta: 100%)",
      status: "IMPLEMENTADO"
    ),
    (
      desc: "Configuración de respaldos automáticos en clúster secundario NAS con verificación de integridad SHA-256.",
      resources: "Almacenamiento secundario NAS 24TB y scripts de verificación",
      responsible: "Ing. Marco Pinto (Admin. BD DUTIC)",
      schedule: "2025-11-01 a 2025-12-30",
      training: "Taller especializado en recuperación ante desastres (DRP)",
      eval-method: "Prueba trimestral de restauración completa de backup sin discrepancia",
      status: "IMPLEMENTADO"
    ),
    (
      desc: "Enrolamiento de terminales portátiles de Filial Camaná en Microsoft Intune (MDM) con cifrado BitLocker XTS-AES 256.",
      resources: "Licencias Microsoft 365 Education A5 y chips TPM 2.0 en laptops",
      responsible: "Dr. Marcos Cárdenas (Coord. Filial Camaná)",
      schedule: "2025-11-01 a 2026-02-15",
      training: "Capacitación a operadores de filial en políticas de equipos móviles",
      eval-method: "Tablero Intune confirmando cifrado activo y capacidad de borrado",
      status: "IMPLEMENTADO"
    ),
    (
      desc: "Implementación de enlace VPN IPSec IKEv2 y validación de doble firma digital tokenizada para nóminas de Filial El Pedregal.",
      resources: "Routers de borde con soporte IPSec y tokens criptográficos",
      responsible: "Lic. Martha Elena Córdova (Subdir. Personal)",
      schedule: "2025-12-01 a 2026-03-15",
      training: "Instrucción sobre firma digital de archivos de dispersión bancaria",
      eval-method: "Conciliación telemática sin discrepancias contra padrón Sisgedo",
      status: "IMPLEMENTADO"
    ),
    (
      desc: "Configuración perimetral de registros DMARC reject, DKIM y SPF institucional, más simulación periódica de spear-phishing.",
      resources: "Servidores DNS y plataforma de simulación de ciberataques",
      responsible: "Ing. Carlos M. Benítez (OSI / DPO)",
      schedule: "2025-11-01 a 2026-01-31",
      training: "Campaña masiva de concientización sobre ingeniería social bancaria",
      eval-method: "Tasa de clics en campañas de simulación controlada (meta: < 3%)",
      status: "IMPLEMENTADO"
    ),
  )
)

#mold(data)
