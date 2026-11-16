#import "mold.typ": mold

#let data = (
  code: "G4-RSK-INC-01",
  version: "3.0",
  date: "2025-10-28",
  title: "Apéndice 3: Formulario - Informe sobre evaluación y tratamiento de riesgos",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
  organization-name: "la Universidad Nacional de San Agustín de Arequipa (UNSA)",
  period-name: "Periodo 2025 (Recertificación Multisede ISO/IEC 27701:2025)",
  scope-units: "Sedes Centrales Arequipa más Filial Camaná (RR 0142-2025) y Filial El Pedregal - Majes (RR 0143-2025). Procesos de Admisión y Planillas descentralizadas.",
  time-eval-start: "01/09/2025",
  time-eval-end: "10/10/2025",
  time-treat-start: "11/10/2025",
  time-treat-end: "24/10/2025",
  report-period: "el periodo del 25 al 28 de octubre de 2025",
  participants: "el Ing. Carlos M. Benítez (Oficial de Seguridad de la Información / DPO), con la colaboración de la Directora DUTIC y los coordinadores de Filial Camaná y Majes",
  owner-role: "Oficial de Seguridad de la Información (OSI / DPO)",
  validity: "2026-10-28",
  references: (
    "ISO/IEC 27701:2025 — Cláusulas 6.1.2, 6.1.3, 8.2 y 8.3",
    "ISO/IEC 27001:2022 / ISO/IEC 27002:2022 — Controles de seguridad y privacidad",
    "Ley N° 29733 — Ley de Protección de Datos Personales del Perú y su Reglamento",
    "G4-MET-RSK-01 — Metodología de evaluación y tratamiento de riesgos",
    "G4-PLN-RSK-01 — Plan de tratamiento del riesgo",
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
    role: "Rector de la Universidad Nacional de San Agustín de Arequipa / Presidente del Comité SGPI",
    date: "2025-10-28"
  ),
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Evaluación inicial de riesgos de privacidad para la certificación ISO/IEC 27701:2019. Escenarios de incidentes en sedes centrales Arequipa (Admisión y Planillas presenciales)."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Reestructuración post-pandemia COVID-19: adaptación a la virtualización integral de inscripciones de admisión y teletrabajo con VPN SSL en nóminas."
    ),
    (
      version: "3.0",
      date: "2025-10-28",
      author: "Ing. Carlos M. Benítez",
      summary: "Recertificación bajo ISO/IEC 27701:2025 (segunda edición independiente) e integración territorial multisede de Filial Camaná y Filial El Pedregal (Majes)."
    ),
  ),
  eval-rows: (
    (
      id: "R-01",
      asset: "Padrones físicos de postulantes (Custodia pasiva cerrada)",
      asset-owner: "Director de Admisión (Dr. Walter Delgado)",
      threat: "Sustracción o extravío de listados residuales con huellas y fotos",
      vuln: "Custodia precaria y descarte sin triturar en sedes",
      risk-owner: "Dr. Walter Delgado (Dir. Admisión)",
      cons: 2, prob: 1, risk: 3,
      existing-controls: "Custodia bajo llave en archivadores y revisión manual en puerta"
    ),
    (
      id: "R-02",
      asset: "Servidor de correo Exchange (Nóminas)",
      asset-owner: "Subdirectora de Personal (Lic. Martha Elena Córdova)",
      threat: "Divulgación indebida de boletas de pago por error de envío masivo",
      vuln: "Ausencia de reglas DLP en Exchange y boletas sin contraseña",
      risk-owner: "Lic. Martha Elena Córdova (Subdir. Personal)",
      cons: 2, prob: 1, risk: 3,
      existing-controls: "Envío por lotes y confirmación visual manual de destinatario"
    ),
    (
      id: "R-03",
      asset: "Data Center DUTIC (Pabellón Ingenierías)",
      asset-owner: "Directora DUTIC (Mg. Lucía Valdivia Paredes)",
      threat: "Acceso físico no autorizado a servidores y bases de datos",
      vuln: "Cerradura tradicional sin registro de auditoría biométrica",
      risk-owner: "Mg. Lucía Valdivia (Directora DUTIC)",
      cons: 2, prob: 1, risk: 3,
      existing-controls: "Cuaderno físico de visitas y control por vigilante de turno"
    ),
    (
      id: "R-04",
      asset: "Portal Web Admisión (admision.unsa.edu.pe)",
      asset-owner: "Directora DUTIC (Mg. Lucía Valdivia Paredes)",
      threat: "Explotación de fallas de autorización IDOR en API de expedientes",
      vuln: "Validación insuficiente de sesión y endpoints sin control de roles",
      risk-owner: "Mg. Lucía Valdivia (Directora DUTIC)",
      cons: 2, prob: 1, risk: 3,
      existing-controls: "Análisis SonarQube en pipeline CI/CD y tokens JWT RSA-4096"
    ),
    (
      id: "R-05",
      asset: "Túnel VPN SSL (Planillas / Teletrabajo)",
      asset-owner: "Subdirectora de Personal (Lic. Martha Elena Córdova)",
      threat: "Compromiso de credenciales VPN de operadores de nómina por phishing",
      vuln: "Cuentas de acceso remoto sin autenticación multifactor (MFA)",
      risk-owner: "Lic. Martha Elena Córdova (Subdir. Personal)",
      cons: 2, prob: 1, risk: 3,
      existing-controls: "Autenticación multifactor MFA/TOTP institucional mandatoria"
    ),
    (
      id: "R-06",
      asset: "Base de Datos PostgreSQL (DUTIC)",
      asset-owner: "Administrador de BD DUTIC (Ing. Marco Pinto)",
      threat: "Fallo o corrupción de respaldos nocturnos durante replicación",
      vuln: "Omisión de pruebas periódicas de restauración completa (DRP)",
      risk-owner: "Ing. Marco Pinto (Admin. BD DUTIC)",
      cons: 2, prob: 1, risk: 3,
      existing-controls: "Backups diarios diferenciales con script cron y cifrado AES-256"
    ),
    (
      id: "R-07",
      asset: "Laptops móviles de registro biométrico (Filial Camaná)",
      asset-owner: "Coordinador Filial Camaná (Dr. Marcos A. Cárdenas)",
      threat: "Sustracción física de laptop con padrones biométricos en traslado",
      vuln: "Disco local sin cifrado de hardware en tránsito y bloqueo débil",
      risk-owner: "Dr. Marcos A. Cárdenas (Coord. Filial Camaná)",
      cons: 2, prob: 1, risk: 3,
      existing-controls: "Contraseña de arranque en BIOS y candado Kensington básico"
    ),
    (
      id: "R-08",
      asset: "Túnel VPN IPSec (Filial El Pedregal - Majes)",
      asset-owner: "Subdirectora de Personal (Lic. Martha Elena Córdova)",
      threat: "Colisión o alteración de cuentas bancarias en sincronización de filial",
      vuln: "Falta de validación de doble firma digital antes del abono bancario",
      risk-owner: "Lic. Martha Elena Córdova (Subdir. Personal)",
      cons: 2, prob: 1, risk: 3,
      existing-controls: "Túnel IPSec estándar con autenticación pre-shared key (PSK)"
    ),
    (
      id: "R-09",
      asset: "Bandejas de correo institucional (Filiales y Sedes Centrales)",
      asset-owner: "Directora DUTIC (Mg. Lucía Valdivia Paredes)",
      threat: "Spear-phishing bancario dirigido a operadores de dispersión de fondos",
      vuln: "Filtrado permisivo en registros DNS sin política DMARC reject",
      risk-owner: "Ing. Carlos M. Benítez (OSI / DPO)",
      cons: 2, prob: 2, risk: 4,
      existing-controls: "Filtro antispam básico en pasarela de correo"
    )
  ),
  treat-rows: (
    (
      id: "R-01",
      asset: "Padrones físicos de postulantes (Custodia pasiva cerrada)",
      asset-owner: "Director de Admisión (Dr. Walter Delgado)",
      threat: "Sustracción o extravío de listados residuales con huellas y fotos",
      vuln: "Custodia precaria y descarte sin triturar en sedes",
      risk-owner: "Dr. Walter Delgado (Dir. Admisión)",
      before-c: 2, before-p: 1, before-r: 3,
      option: "1. Elección de controles",
      controls: "A.3.11, A.3.12 (Procedimiento respuesta) y A.3.19 (Mesa limpia y 8 trituradoras P-4 de microcorte en módulos)",
      after-c: 1, after-p: 0, after-r: 1,
      rag: "VERDE",
      status: "IMPLEMENTADO"
    ),
    (
      id: "R-02",
      asset: "Servidor de correo Exchange (Nóminas)",
      asset-owner: "Subdirectora de Personal (Lic. Martha Elena Córdova)",
      threat: "Divulgación indebida de boletas de pago por error de envío masivo",
      vuln: "Ausencia de reglas DLP en Exchange y boletas sin contraseña",
      risk-owner: "Lic. Martha Elena Córdova (Subdir. Personal)",
      before-c: 2, before-p: 1, before-r: 3,
      option: "1. Elección de controles",
      controls: "A.3.7 (Transferencia segura), A.3.26 (Cifrado PDF individual con DNI) y módulo DLP Exchange con bloqueo por patrones",
      after-c: 1, after-p: 0, after-r: 1,
      rag: "VERDE",
      status: "IMPLEMENTADO"
    ),
    (
      id: "R-03",
      asset: "Data Center DUTIC (Pabellón Ingenierías)",
      asset-owner: "Directora DUTIC (Mg. Lucía Valdivia Paredes)",
      threat: "Acceso físico no autorizado a servidores y bases de datos",
      vuln: "Cerradura tradicional sin registro de auditoría biométrica",
      risk-owner: "Mg. Lucía Valdivia (Directora DUTIC)",
      before-c: 2, before-p: 1, before-r: 3,
      option: "1. Elección de controles",
      controls: "A.3.4, A.3.9 (Cerradura biométrica con log de auditoría IP) y videovigilancia CCTV 24/7 con retención 90 días",
      after-c: 1, after-p: 0, after-r: 1,
      rag: "VERDE",
      status: "IMPLEMENTADO"
    ),
    (
      id: "R-04",
      asset: "Portal Web Admisión (admision.unsa.edu.pe)",
      asset-owner: "Directora DUTIC (Mg. Lucía Valdivia Paredes)",
      threat: "Explotación de fallas de autorización IDOR en API de expedientes",
      vuln: "Validación insuficiente de sesión y endpoints sin control de roles",
      risk-owner: "Mg. Lucía Valdivia (Directora DUTIC)",
      before-c: 2, before-p: 1, before-r: 3,
      option: "1. Elección de controles",
      controls: "A.3.10, A.3.23 (Validación JWT RSA-4096, análisis estático SAST SonarQube en CI/CD y validación estricta de pertenencia de sesión)",
      after-c: 1, after-p: 0, after-r: 1,
      rag: "VERDE",
      status: "IMPLEMENTADO"
    ),
    (
      id: "R-05",
      asset: "Túnel VPN SSL (Planillas / Teletrabajo)",
      asset-owner: "Subdirectora de Personal (Lic. Martha Elena Córdova)",
      threat: "Compromiso de credenciales VPN de operadores de nómina por phishing",
      vuln: "Cuentas de acceso remoto sin autenticación multifactor (MFA)",
      risk-owner: "Lic. Martha Elena Córdova (Subdir. Personal)",
      before-c: 2, before-p: 1, before-r: 3,
      option: "1. Elección de controles",
      controls: "A.3.8, A.3.23 (Autenticación multifactor MFA/TOTP institucional mandatoria para todo teletrabajo y VPN)",
      after-c: 1, after-p: 0, after-r: 1,
      rag: "VERDE",
      status: "IMPLEMENTADO"
    ),
    (
      id: "R-06",
      asset: "Base de Datos PostgreSQL (DUTIC)",
      asset-owner: "Administrador de BD DUTIC (Ing. Marco Pinto)",
      threat: "Fallo o corrupción de respaldos nocturnos durante replicación",
      vuln: "Omisión de pruebas periódicas de restauración completa (DRP)",
      risk-owner: "Ing. Marco Pinto (Admin. BD DUTIC)",
      before-c: 2, before-p: 1, before-r: 3,
      option: "1. Elección de controles",
      controls: "A.3.16, A.3.24 (Protocolo automatizado de respaldo con cifrado AES-256 y simulación trimestral de restauración DRP)",
      after-c: 1, after-p: 0, after-r: 1,
      rag: "VERDE",
      status: "IMPLEMENTADO"
    ),
    (
      id: "R-07",
      asset: "Laptops móviles de registro biométrico (Filial Camaná)",
      asset-owner: "Coordinador Filial Camaná (Dr. Marcos A. Cárdenas)",
      threat: "Sustracción física de laptop con padrones biométricos en traslado",
      vuln: "Disco local sin cifrado de hardware en tránsito y bloqueo débil",
      risk-owner: "Dr. Marcos A. Cárdenas (Coord. Filial Camaná)",
      before-c: 2, before-p: 1, before-r: 3,
      option: "1. Elección de controles",
      controls: "A.3.22 (Seguridad de terminales), A.3.26 (BitLocker XTS-AES 256 forzoso con chip TPM 2.0) y enrolamiento en MDM Microsoft Intune con borrado remoto",
      after-c: 1, after-p: 0, after-r: 1,
      rag: "VERDE",
      status: "IMPLEMENTADO"
    ),
    (
      id: "R-08",
      asset: "Túnel VPN IPSec (Filial El Pedregal - Majes)",
      asset-owner: "Subdirectora de Personal (Lic. Martha Elena Córdova)",
      threat: "Colisión o alteración de cuentas bancarias en sincronización de filial",
      vuln: "Falta de validación de doble firma digital antes del abono bancario",
      risk-owner: "Lic. Martha Elena Córdova (Subdir. Personal)",
      before-c: 2, before-p: 1, before-r: 3,
      option: "1. Elección de controles",
      controls: "A.3.7, A.3.14 (Transferencia y registros) y A.3.23 (Validación de doble firma digital tokenizada reconciliada con padrón firmado en Sisgedo)",
      after-c: 1, after-p: 0, after-r: 1,
      rag: "VERDE",
      status: "IMPLEMENTADO"
    ),
    (
      id: "R-09",
      asset: "Bandejas de correo institucional (Filiales y Sedes Centrales)",
      asset-owner: "Directora DUTIC (Mg. Lucía Valdivia Paredes)",
      threat: "Spear-phishing bancario dirigido a operadores de dispersión de fondos",
      vuln: "Filtrado permisivo en registros DNS sin política DMARC reject",
      risk-owner: "Ing. Carlos M. Benítez (OSI / DPO)",
      before-c: 2, before-p: 2, before-r: 4,
      option: "1. Elección de controles",
      controls: "A.3.17 (Taller en Academia UNSA) y A.3.28 (Políticas estrictas DMARC reject, DKIM y SPF institucional más simulación periódica)",
      after-c: 1, after-p: 0, after-r: 1,
      rag: "VERDE",
      status: "IMPLEMENTADO"
    )
  )
)

#mold(data)
