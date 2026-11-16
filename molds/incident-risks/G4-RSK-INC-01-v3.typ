#import "mold.typ": mold

#let data = (
  code: "G4-RSK-INC-01",
  version: "3.0",
  date: "2025-10-28",
  title: "Matriz y Reporte de Evaluación de Riesgos de Incidentes de Privacidad",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
  period-name: "Periodo 2025 (Recertificación Multisede ISO/IEC 27701:2025)",
  scope-units: "Sedes Centrales Arequipa más Filial Camaná (RR 0142-2025) y Filial El Pedregal - Majes (RR 0143-2025). Procesos de Admisión y Planillas descentralizadas.",
  time-eval: "el periodo del 01 de septiembre al 10 de octubre de 2025",
  time-treat: "el periodo del 11 al 24 de octubre de 2025",
  participants: "el Ing. Carlos M. Benítez (OSI / DPO), la Mg. Lucía Valdivia Paredes (Directora DUTIC) y los coordinadores de Filial Camaná y Majes",
  validity: "2026-10-28",
  references: (
    "ISO/IEC 27701:2025 — Cláusulas 6.1.2, 6.1.3, 8.2 y 8.3",
    "ISO/IEC 27001:2022 / ISO/IEC 27002:2022 — Controles de seguridad y privacidad",
    "Ley N° 29733 — Ley de Protección de Datos Personales del Perú y su Reglamento",
    "G4-MET-RSK-01 — Metodología de Evaluación y Tratamiento de Riesgos de Privacidad",
    "G4-PLN-RSK-01 — Plan de Tratamiento de Riesgos de Privacidad",
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
      summary: "Evaluación inicial de riesgos de privacidad para la certificación ISO/IEC 27701:2019. Escenarios de incidentes en sedes centrales Arequipa (Admisión y Planillas presenciales)."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia: Incorporación de riesgos cibernéticos en portal web de admisiones, teletrabajo con VPN y copias de seguridad remotas."
    ),
    (
      version: "3.0",
      date: "2025-10-28",
      author: "Ing. Carlos M. Benítez",
      summary: "Recertificación bajo ISO/IEC 27701:2025 (segunda edición, standalone PIMS): Matriz multisede integrando Filial Camaná y Filial El Pedregal (Majes), riesgos en terminales móviles (MDM) y spear-phishing bancario."
    ),
  ),
  eval-rows: (
    (
      id: "R-01",
      asset: "Padrones físicos de admisión",
      asset-owner: "Dir. de Admisión",
      threat: "Sustracción o extravío de listados residuales",
      vuln: "Descarte sin triturar",
      risk-owner: "Dr. Walter Delgado",
      cons: 2, prob: 0, risk: 2,
      existing-controls: "Trituradoras P-4 y custodia bajo llave"
    ),
    (
      id: "R-02",
      asset: "Boletas electrónicas (Nóminas)",
      asset-owner: "Subdir. de Personal",
      threat: "Divulgación indebida por correo",
      vuln: "Fallo en reglas de envío",
      risk-owner: "Lic. Martha Elena Córdova",
      cons: 2, prob: 0, risk: 2,
      existing-controls: "Cifrado automático de PDF con DNI y DLP"
    ),
    (
      id: "R-03",
      asset: "Data Center DUTIC",
      asset-owner: "Directora DUTIC",
      threat: "Acceso físico no autorizado a servidores",
      vuln: "Fallo de biometría",
      risk-owner: "Mg. Lucía Valdivia",
      cons: 2, prob: 0, risk: 2,
      existing-controls: "Cerradura biométrica y videovigilancia CCTV"
    ),
    (
      id: "R-04",
      asset: "Portal Web Admisión (`admision.unsa`)",
      asset-owner: "Directora DUTIC",
      threat: "Explotación de fallas IDOR en API",
      vuln: "Validación insuficiente de sesión",
      risk-owner: "Mg. Lucía Valdivia",
      cons: 2, prob: 0, risk: 2,
      existing-controls: "Análisis SonarQube en CI/CD y tokens JWT RSA-4096"
    ),
    (
      id: "R-05",
      asset: "Túnel VPN SSL (Planillas / Remoto)",
      asset-owner: "Subdir. de Personal",
      threat: "Phishing de credenciales VPN",
      vuln: "Cuentas sin MFA",
      risk-owner: "Lic. Martha Elena Córdova",
      cons: 2, prob: 0, risk: 2,
      existing-controls: "MFA/TOTP institucional obligatorio"
    ),
    (
      id: "R-06",
      asset: "Base de Datos PostgreSQL (DUTIC)",
      asset-owner: "Admin. BD DUTIC",
      threat: "Corrupción de respaldos nocturnos",
      vuln: "Falta de prueba de restauración",
      risk-owner: "Ing. Marco Pinto",
      cons: 2, prob: 0, risk: 2,
      existing-controls: "Backups con verificación hash SHA-256 en NAS"
    ),
    (
      id: "R-07",
      asset: "Laptops móviles (Filial Camaná)",
      asset-owner: "Coord. Filial Camaná",
      threat: "Sustracción física de laptop con padrones biométricos",
      vuln: "Disco local sin cifrado de hardware en tránsito",
      risk-owner: "Dr. Marcos Cárdenas",
      cons: 2, prob: 1, risk: 3,
      existing-controls: "Contraseña de BIOS y candado Kensington básico"
    ),
    (
      id: "R-08",
      asset: "Túnel VPN IPSec (Filial El Pedregal)",
      asset-owner: "Subdir. de Personal",
      threat: "Colisión o alteración de cuentas bancarias en sincronización",
      vuln: "Falta de validación de doble firma digital antes del abono",
      risk-owner: "Lic. Martha Elena Córdova",
      cons: 2, prob: 1, risk: 3,
      existing-controls: "Túnel IPSec estándar con autenticación pre-shared key"
    ),
    (
      id: "R-09",
      asset: "Bandejas de correo (Filiales y Central)",
      asset-owner: "Directora DUTIC",
      threat: "Spear-phishing bancario a operadores de planillas",
      vuln: "Filtrado permisivo en registros DNS del dominio",
      risk-owner: "Ing. Carlos M. Benítez",
      cons: 2, prob: 2, risk: 4,
      existing-controls: "Filtro antispam estándar sin política DMARC reject"
    ),
  ),
  treat-rows: (
    (
      id: "R-07",
      scenario: "Robo de laptop con padrones biométricos en Filial Camaná",
      risk-owner: "Dr. Marcos Cárdenas",
      before-c: 2, before-p: 1, before-r: 3,
      option: "Opción 1: Controles",
      controls: "A.3.22 (Seguridad de terminales), A.3.26 (BitLocker XTS-AES 256 forzoso con TPM 2.0) y enrolamiento en MDM Microsoft Intune con borrado remoto",
      after-c: 1, after-p: 0, after-r: 1,
      rag: "VERDE",
      status: "IMPLEMENTADO"
    ),
    (
      id: "R-08",
      scenario: "Alteración de cuentas de abono en Filial El Pedregal",
      risk-owner: "Lic. Martha Elena Córdova",
      before-c: 2, before-p: 1, before-r: 3,
      option: "Opción 1: Controles",
      controls: "A.3.7, A.3.14 (Transferencia y registros) y A.3.23 (Validación de doble firma digital tokenizada reconciliada con Sisgedo)",
      after-c: 1, after-p: 0, after-r: 1,
      rag: "VERDE",
      status: "IMPLEMENTADO"
    ),
    (
      id: "R-09",
      scenario: "Spear-phishing suplantando bancos a personal de planillas",
      risk-owner: "Ing. Carlos M. Benítez",
      before-c: 2, before-p: 2, before-r: 4,
      option: "Opción 1: Controles",
      controls: "A.3.17 (Taller en Academia UNSA) y A.3.28 (Políticas estrictas DMARC reject, DKIM y SPF institucional)",
      after-c: 1, after-p: 0, after-r: 1,
      rag: "VERDE",
      status: "IMPLEMENTADO"
    ),
  )
)

#mold(data)
