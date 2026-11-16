#import "mold.typ": mold

#let data = (
  code: "G4-RSK-INC-01",
  version: "1.0",
  date: "2019-04-15",
  title: "Matriz y Reporte de Evaluación de Riesgos de Incidentes de Privacidad",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
  period-name: "Periodo 2019 (Certificación Inicial SGPI)",
  scope-units: "Sedes Centrales Arequipa (Áreas de Ingenierías, Biomédicas y Sociales). Procesos presenciales de Admisión Ordinaria y Planilla de Remuneraciones.",
  time-eval: "el periodo del 01 de marzo al 05 de abril de 2019",
  time-treat: "el periodo del 06 al 14 de abril de 2019",
  participants: "el Ing. Carlos M. Benítez (OSI / DPO), la Mg. Lucía Valdivia Paredes (Directora DUTIC) y los directores de Admisión y Personal",
  validity: "2020-04-15",
  references: (
    "ISO/IEC 27701:2025 — Cláusulas 6.1.2, 6.1.3, 8.2 y 8.3",
    "ISO/IEC 27001:2022 / ISO/IEC 27002:2022 — Gestión de riesgos y controles de seguridad",
    "Ley N° 29733 — Ley de Protección de Datos Personales del Perú y su Reglamento",
    "G4-MET-RSK-01 — Metodología de Evaluación y Tratamiento de Riesgos de Privacidad",
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
    role: "Rector - Presidente del Comité SGPI",
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
      asset: "Padrones físicos de postulantes",
      asset-owner: "Dir. de Admisión",
      threat: "Extravío o sustracción de padrones con fotos y huellas",
      vuln: "Custodia precaria y descarte sin triturar",
      risk-owner: "Dr. Walter Delgado",
      cons: 2, prob: 1, risk: 3,
      existing-controls: "Custodia en archivador con llave y revisión manual en puerta"
    ),
    (
      id: "R-02",
      asset: "Servidor Exchange (Nóminas)",
      asset-owner: "Subdir. de Personal",
      threat: "Divulgación indebida de boletas de pago por error de envío masivo",
      vuln: "Ausencia de reglas DLP y boletas sin contraseña",
      risk-owner: "Lic. Martha Elena Córdova",
      cons: 2, prob: 1, risk: 3,
      existing-controls: "Envío manual por lotes y confirmación visual de destinatario"
    ),
    (
      id: "R-03",
      asset: "Data Center DUTIC (Ingenierías)",
      asset-owner: "Directora DUTIC",
      threat: "Ingreso no autorizado físico y alteración de servidores de BD",
      vuln: "Cerradura tradicional sin registro biométrico",
      risk-owner: "Mg. Lucía Valdivia",
      cons: 2, prob: 1, risk: 3,
      existing-controls: "Cuaderno físico de visitas y control por vigilante de turno"
    ),
  ),
  treat-rows: (
    (
      id: "R-01",
      scenario: "Sustracción o fuga de padrones físicos de admisión",
      risk-owner: "Dr. Walter Delgado",
      before-c: 2, before-p: 1, before-r: 3,
      option: "Opción 1: Controles",
      controls: "A.3.11, A.3.12 (Procedimiento respuesta) y A.3.19 (Mesa limpia y 8 trituradoras P-4 de microcorte)",
      after-c: 1, after-p: 0, after-r: 1,
      rag: "VERDE",
      status: "IMPLEMENTADO"
    ),
    (
      id: "R-02",
      scenario: "Divulgación masiva de boletas salariales por correo",
      risk-owner: "Lic. Martha Elena Córdova",
      before-c: 2, before-p: 1, before-r: 3,
      option: "Opción 1: Controles",
      controls: "A.3.7 (Transferencia segura), A.3.26 (Cifrado PDF individual con DNI) y módulo DLP Exchange",
      after-c: 1, after-p: 0, after-r: 1,
      rag: "VERDE",
      status: "IMPLEMENTADO"
    ),
    (
      id: "R-03",
      scenario: "Acceso físico no autorizado a servidores de BD",
      risk-owner: "Mg. Lucía Valdivia",
      before-c: 2, before-p: 1, before-r: 3,
      option: "Opción 1: Controles",
      controls: "A.3.4, A.3.9 (Cerradura biométrica con log de auditoría) y videovigilancia CCTV 24/7",
      after-c: 1, after-p: 0, after-r: 1,
      rag: "VERDE",
      status: "IMPLEMENTADO"
    ),
  )
)

#mold(data)
