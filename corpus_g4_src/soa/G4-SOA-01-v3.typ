#import "../../molds/soa/mold.typ": mold

#let data = (
  code: "G4-SOA-01",
  version: "3.0",
  date: "2025-10-28",
  title: "Declaración de Aplicabilidad del SGPI (SoA)",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
  era: "v3",
  organization-name: "la Universidad Nacional de San Agustín de Arequipa (UNSA)",
  purpose-desc: "constituye el documento formal exigido por la Cláusula 6.1.3.e y la Introducción del Anexo A de la norma internacional independiente ISO/IEC 27701:2025 (Segunda edición, octubre 2025), reflejando el estado de implementación multisede",
  role-desc: "determina de manera privativa y excluyente que actúa como Responsable del Tratamiento de Datos Personales (PII Controller) para la totalidad de operaciones en campus centrales y filiales descentralizadas de Camaná (RR 0142-2025) y El Pedregal - Majes (RR 0143-2025)",
  owner-role: "Oficial de Seguridad de la Información (OSI / DPO)",
  validity: "2026-10-28",
  references: (
    "ISO/IEC 27701:2025 — Cláusula 6.1.3.e, Tablas A.1, A.2 y A.3",
    "ISO/IEC 27001:2022 / ISO/IEC 27002:2022 — Controles de seguridad de la información",
    "Ley N° 29733 — Ley de Protección de Datos Personales del Perú y su Reglamento",
    "Ley N° 30220 — Ley Universitaria del Perú",
    "G4-POL-01 — Política de Privacidad de la Información de la UNSA",
    "G4-MET-RSK-01 — Metodología de Evaluación y Tratamiento de Riesgos de Privacidad",
    "G4-PLN-RSK-01 — Plan de Tratamiento de Riesgos de Privacidad",
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
      summary: "Emisión inicial de la Declaración de Aplicabilidad (SoA) para la certificación ISO/IEC 27701:2019. Alcance: Sedes Arequipa (Admisión y Planillas presenciales)."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia: Reconfiguración de controles para la virtualización integral de admisiones (admision.unsa.edu.pe), teletrabajo con VPN y exclusión de archivos físicos históricos."
    ),
    (
      version: "3.0",
      date: "2025-10-28",
      author: "Ing. Carlos M. Benítez",
      summary: "Recertificación bajo ISO/IEC 27701:2025 (segunda edición, standalone PIMS): Expansión territorial multisede integrando Filial Camaná y Filial El Pedregal (Majes), gestión MDM de terminales y enlaces IPSec."
    ),
  ),
)

#mold(data)
