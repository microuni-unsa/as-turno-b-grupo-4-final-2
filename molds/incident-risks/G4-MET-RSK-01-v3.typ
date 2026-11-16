#import "mold.typ": mold

#let data = (
  code: "G4-MET-RSK-01",
  version: "3.0",
  date: "2025-10-28",
  title: "Metodología de Evaluación y Tratamiento de Riesgos de Privacidad",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
  organization-name: "la Universidad Nacional de San Agustín de Arequipa (UNSA)",
  scope-desc: "la totalidad de los procesos de Admisión (Pregrado Ordinario, CEPRUNSA, filiales regionales) y Planillas de Remuneraciones en las Sedes Centrales de Arequipa y Filiales Camaná y El Pedregal (Majes)",
  owner-role: "Oficial de Seguridad de la Información (OSI / DPO)",
  validity: "2026-10-28",
  references: (
    "ISO/IEC 27701:2025 — Cláusulas 6.1.2, 6.1.3, 8.2 y 8.3",
    "ISO/IEC 27001:2022 — Cláusulas 6.1.2, 6.1.3 y 8.2",
    "ISO/IEC 27002:2022 — Controles de seguridad de la información",
    "ISO/IEC 27557:2022 — Gestión de riesgos de privacidad en organizaciones",
    "ISO 31000:2018 — Gestión del riesgo — Directrices",
    "Ley N° 29733 — Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS)",
    "Ley N° 30220 — Ley Universitaria del Perú",
    "G4-POL-01 — Política de Privacidad de la Información de la UNSA",
    "G4-SOA-01 — Declaración de Aplicabilidad del SGPI",
    "G4-PRC-INC-01 — Procedimiento de Respuesta a Incidentes de Privacidad",
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
      summary: "Emisión inicial de la metodología de evaluación de riesgos para la certificación ISO/IEC 27701:2019 en sedes centrales Arequipa."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Adaptación de la metodología post-pandemia para escenarios de admisión web, accesos remotos y teletrabajo con VPN."
    ),
    (
      version: "3.0",
      date: "2025-10-28",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización bajo ISO/IEC 27701:2025 (segunda edición, standalone PIMS): Escala 0-2, integración territorial de filiales Camaná y Majes y enfoque dual de privacidad."
    ),
  ),
)

#mold(data)
