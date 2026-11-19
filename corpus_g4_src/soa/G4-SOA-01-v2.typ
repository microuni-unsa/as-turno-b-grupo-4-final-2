#import "../../molds/soa/mold.typ": mold

#let data = (
  code: "G4-SOA-01",
  version: "2.0",
  date: "2022-09-10",
  title: "Declaración de Aplicabilidad del SGPI (SoA)",
  confidentiality: "Confidencial",
  era: "v2",
  organization-name: "la Universidad Nacional de San Agustín de Arequipa (UNSA)",
  purpose-desc: "documenta formalmente los controles seleccionados para el SGPI bajo la Cláusula 6.1.3.e, adaptados a la infraestructura digital y teletrabajo post-pandemia",
  role-desc: "ratifica su condición exclusiva de Responsable del Tratamiento de Datos Personales (PII Controller), definiendo autónomamente los fines y medios en sus plataformas web y enlaces VPN",
  owner-role: "Oficial de Seguridad de la Información (OSI / DPO)",
  validity: "2023-09-10",
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
      summary: "Emisión inicial de la Declaración de Aplicabilidad (SoA) para la certificación ISO/IEC 27701:2019. Alcance: Sedes Arequipa (Admisión y Planillas presenciales)."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia: Reconfiguración de controles para la virtualización integral de admisiones (admision.unsa.edu.pe), teletrabajo con VPN y exclusión de archivos físicos históricos."
    ),
  ),
)

#mold(data)
