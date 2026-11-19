#import "../../molds/soa/mold.typ": mold

#let data = (
  code: "G4-SOA-01",
  version: "1.0",
  date: "2019-04-15",
  title: "Declaración de Aplicabilidad del SGPI (SoA)",
  confidentiality: "Confidencial",
  era: "v1",
  organization-name: "la Universidad Nacional de San Agustín de Arequipa (UNSA)",
  purpose-desc: "documenta formalmente los controles de seguridad y privacidad necesarios para la certificación inicial del SGPI bajo ISO/IEC 27701:2019 en sedes centrales Arequipa",
  role-desc: "actúa de manera privativa y unívoca como Responsable del Tratamiento de Datos Personales (PII Controller), determinando de forma autónoma los fines y medios del tratamiento en los procesos presenciales de Admisión y Planillas",
  owner-role: "Oficial de Seguridad de la Información (OSI / DPO)",
  validity: "2020-04-15",
  references: (
    "ISO/IEC 27701:2025 — Cláusula 6.1.3.e, Tablas A.1, A.2 y A.3",
    "ISO/IEC 27001:2022 / ISO/IEC 27002:2022 — Controles de seguridad de la información",
    "Ley N° 29733 — Ley de Protección de Datos Personales del Perú y su Reglamento",
    "G4-POL-01 — Política de Privacidad de la Información de la UNSA",
    "G4-MET-RSK-01 — Metodología de Evaluación y Tratamiento de Riesgos de Privacidad",
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
      summary: "Emisión inicial de la Declaración de Aplicabilidad (SoA) para la certificación ISO/IEC 27701:2019. Alcance: Sedes Arequipa (Admisión y Planillas presenciales)."
    ),
  ),
)

#mold(data)
