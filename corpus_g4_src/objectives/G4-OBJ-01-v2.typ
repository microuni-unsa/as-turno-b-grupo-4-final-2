#import "../../molds/objectives/mold.typ": mold

#let data = (
  title: "Tabla de Objetivos de Privacidad de la Información",
  code: "G4-OBJ-01",
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
    "Norma ISO/IEC 27701:2019 Cláusula 6.2 (Objetivos de privacidad y planificación).",
    "Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Política de Privacidad de la Información de la UNSA (G4-POL-01).",
    "Determinación del Alcance del SGPI (G4-ALC-01).",
    "Procedimiento de Control de Información Documentada (G4-PRC-DOC-01).",
  ),
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Establecimiento inicial de objetivos de privacidad para el proceso de certificación ISO/IEC 27701:2019 en sedes centrales Arequipa."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia: Incorporación de métricas de seguridad web (admision.unsa.edu.pe), teletrabajo y firma digital."
    ),
  ),
  objective_text: [El presente documento actualiza los objetivos de privacidad de la información y su plan de consecución en la Universidad Nacional de San Agustín de Arequipa (UNSA), de conformidad con la Cláusula 6.2 de ISO/IEC 27701 y la Ley N° 29733, adaptando las metas al entorno digital y teletrabajo post-pandemia.],
  scope_text: [Abarca las operaciones telemáticas del portal de Admisión Virtual de Pregrado y el procesamiento de Planilla de Remuneraciones en modalidad de teletrabajo en las sedes centrales de Arequipa.],
  users_text: [Destinado a directores de unidad académica y administrativa, analistas de desarrollo web de DUTIC, operadores de teletrabajo de personal y auditores del SGPI.],
  alignment: [Los objetivos operacionalizan los compromisos de la Política de Privacidad (`G4-POL-01`), priorizando la mitigación de vulnerabilidades web, el cifrado de canales telemáticos y la gestión digital de derechos de los titulares.],
  objectives: (
    (
      id: "OBJ-1",
      objective: "Mitigar vulnerabilidades lógicas y de autorización en el portal de admisión web.",
      kpi: "0 vulnerabilidades críticas o altas (OWASP Top 10) en producción de admision.unsa.edu.pe.",
      action: "Escaneos quincenales de seguridad y pruebas de penetración antes de cada proceso ordinario.",
      responsible: "Mg. Lucía Valdivia (Directora DUTIC)",
      term: "Continuo (2022-2023)",
      status: "VIGENTE"
    ),
    (
      id: "OBJ-2",
      objective: "Garantizar la seguridad de las conexiones de teletrabajo para el cálculo de planillas.",
      kpi: "100% de operadores de planillas accediendo mediante VPN SSL corporativa con MFA.",
      action: "Despliegue de certificados de usuario y token OTP institucional en dispositivos autorizados.",
      responsible: "Ing. Carlos Benítez (OSI / DPO)",
      term: "Semestral",
      status: "VIGENTE"
    ),
    (
      id: "OBJ-3",
      objective: "Optimizar la atención telemática de derechos ARCO vía Mesa de Partes Digital.",
      kpi: "100% de solicitudes ARCO atendidas en plazos legales sin requerir comparecencia física.",
      action: "Integración del formulario virtual en el portal Sisgedo con firma electrónica del titular.",
      responsible: "Ing. Carlos Benítez (OSI / DPO)",
      term: "Permanente",
      status: "VIGENTE"
    ),
    (
      id: "OBJ-4",
      objective: "Capacitar a colaboradores remotos en prevención de phishing y seguridad de endpoints.",
      kpi: "Mayor a 92% de personal en teletrabajo capacitado en el aula virtual institucional.",
      action: "Módulo virtual interactivo de ciberseguridad y simulacros controlados de correo fraudulento.",
      responsible: "Lic. Martha Córdova (Subdir. Personal)",
      term: "Anual (Nov 2022)",
      status: "VIGENTE"
    )
  ),
  monitoring: [El seguimiento se realiza de forma trimestral mediante paneles de control telemáticos de DUTIC y se presenta formalmente en la Revisión por la Dirección (Cláusula 9.3).]
)

#mold(data: data)
