#import "mold.typ": mold

#let data = (
  code: "G4-RSK-INC-01",
  version: "2.0",
  date: "2022-09-10",
  title: "Matriz y Reporte de Evaluación de Riesgos de Incidentes de Privacidad",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
  period-name: "Periodo 2022 (Virtualización Post-Pandemia)",
  scope-units: "Sedes Centrales Arequipa. Admisión 100% digital vía admision.unsa.edu.pe y teletrabajo con VPN para Planillas.",
  time-eval: "el periodo del 01 de agosto al 25 de agosto de 2022",
  time-treat: "el periodo del 26 de agosto al 05 de septiembre de 2022",
  participants: "el Ing. Carlos M. Benítez (OSI / DPO), la Mg. Lucía Valdivia Paredes (Directora DUTIC) y coordinadores técnicos",
  validity: "2023-09-10",
  references: (
    "ISO/IEC 27701:2025 — Cláusulas 6.1.2, 6.1.3, 8.2 y 8.3",
    "Ley N° 29733 — Ley de Protección de Datos Personales del Perú y su Reglamento",
    "G4-MET-RSK-01 — Metodología de Evaluación y Tratamiento de Riesgos de Privacidad",
    "G4-SOA-01 — Declaración de Aplicabilidad del SGPI",
  ),
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
      threat: "Divulgación indebida por correo electrónico",
      vuln: "Fallo en reglas de envío",
      risk-owner: "Lic. Martha Elena Córdova",
      cons: 2, prob: 0, risk: 2,
      existing-controls: "Cifrado automático de PDF con DNI y DLP"
    ),
    (
      id: "R-03",
      asset: "Data Center DUTIC",
      asset-owner: "Directora DUTIC",
      threat: "Acceso no autorizado a servidores",
      vuln: "Fallo de biometría",
      risk-owner: "Mg. Lucía Valdivia",
      cons: 2, prob: 0, risk: 2,
      existing-controls: "Cerradura biométrica y videovigilancia CCTV"
    ),
    (
      id: "R-04",
      asset: "Portal Web Admisión (`admision.unsa`)",
      asset-owner: "Directora DUTIC",
      threat: "Falla IDOR en API exponiendo expedientes digitales",
      vuln: "Validación insuficiente en endpoint REST",
      risk-owner: "Mg. Lucía Valdivia",
      cons: 2, prob: 2, risk: 4,
      existing-controls: "Validación de sesión básica por cookie"
    ),
    (
      id: "R-05",
      asset: "Túnel VPN SSL (Planillas / Remoto)",
      asset-owner: "Subdir. de Personal",
      threat: "Suplantación de identidad por phishing de credenciales",
      vuln: "Autenticación de un solo factor (usuario y clave)",
      risk-owner: "Lic. Martha Elena Córdova",
      cons: 2, prob: 1, risk: 3,
      existing-controls: "Contraseña compleja cambiada cada 90 días"
    ),
    (
      id: "R-06",
      asset: "Base de Datos PostgreSQL (DUTIC)",
      asset-owner: "Admin. BD DUTIC",
      threat: "Corrupción o pérdida por fallo en scripts de backup",
      vuln: "Sin verificación automática de hash SHA-256",
      risk-owner: "Ing. Marco Pinto",
      cons: 2, prob: 1, risk: 3,
      existing-controls: "Copia nocturna cron en disco local del servidor"
    ),
  ),
  treat-rows: (
    (
      id: "R-04",
      scenario: "Explotación de fallas IDOR en API backend de admisión",
      risk-owner: "Mg. Lucía Valdivia",
      before-c: 2, before-p: 2, before-r: 4,
      option: "Opción 1: Controles",
      controls: "A.3.27, A.3.28 (Análisis SAST SonarQube en CI/CD) y A.3.23 (Tokens JWT efímeros firmados con RSA-4096)",
      after-c: 1, after-p: 0, after-r: 1,
      rag: "VERDE",
      status: "IMPLEMENTADO"
    ),
    (
      id: "R-05",
      scenario: "Phishing de credenciales VPN en teletrabajo de planillas",
      risk-owner: "Lic. Martha Elena Córdova",
      before-c: 2, before-p: 1, before-r: 3,
      option: "Opción 1: Controles",
      controls: "A.3.23 (MFA/TOTP obligatorio en cliente VPN) y A.3.17 (Taller de concientización en Aula Virtual)",
      after-c: 1, after-p: 0, after-r: 1,
      rag: "VERDE",
      status: "IMPLEMENTADO"
    ),
    (
      id: "R-06",
      scenario: "Fallo o alteración de copias de respaldo de base de datos",
      risk-owner: "Ing. Marco Pinto",
      before-c: 2, before-p: 1, before-r: 3,
      option: "Opción 1: Controles",
      controls: "A.3.24 (Backups automáticos con verificación hash SHA-256 en NAS independiente) y A.3.25 (Agente Zabbix)",
      after-c: 1, after-p: 0, after-r: 1,
      rag: "VERDE",
      status: "IMPLEMENTADO"
    ),
  )
)

#mold(data)
