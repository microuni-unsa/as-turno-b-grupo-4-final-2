#import "../../molds/incident-risks/mold.typ": mold

#let data = (
  code: "G4-RSK-INC-01",
  version: "1.0",
  date: "2019-04-15",
  title: "Apéndice 3: Formulario - Informe sobre evaluación y tratamiento de riesgos",
  short-title: "Informe evaluación y tratamiento (Ap. 3)",
  confidentiality: "Confidencial",
  organization-name: "la Universidad Nacional de San Agustín de Arequipa (UNSA)",
  period-name: "Periodo 2019 (Certificación Inicial SGPI)",
  scope-units: "Sedes Centrales Arequipa (Áreas de Ingenierías, Biomédicas y Sociales), abarcando los procesos presenciales de Admisión Ordinaria y Planilla de Remuneraciones",
  time-eval-start: "01/03/2019",
  time-eval-end: "05/04/2019",
  time-treat-start: "06/04/2019",
  time-treat-end: "14/04/2019",
  report-period: "el periodo del 10 al 15 de abril de 2019",
  participants: "el Ing. Carlos M. Benítez (Oficial de Seguridad de la Información / DPO), con la colaboración de la Directora DUTIC y los directores de Admisión y Personal",
  owner-role: "Oficial de Seguridad de la Información (OSI / DPO)",
  validity: "2020-04-15",
  references: (
    "ISO/IEC 27001:2013 — Capítulos 8.2 y 8.3",
    "ISO/IEC 27701:2019 — Capítulos 6.1.2, 6.1.3, 8.2 y 8.3",
    "Ley N° 29733 — Ley de Protección de Datos Personales del Perú y su Reglamento",
    "G4-MET-RSK-01 — Metodología de evaluación y tratamiento de riesgos",
    "G4-SOA-01 — Declaración de Aplicabilidad del SGPI",
  ),
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
      summary: "Evaluación inicial de riesgos de privacidad para la certificación ISO/IEC 27701:2019. Escenarios de incidentes en sedes centrales Arequipa (Admisión y Planillas presenciales)."
    ),
  ),
  eval-rows: (
    (
      id: "R-01",
      asset: "Padrones físicos de postulantes (Admisión presencial)",
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
  ),
  treat-rows: (
    (
      id: "R-01",
      asset: "Padrones físicos de postulantes (Admisión presencial)",
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
  )
)

#mold(data)
