#import "../../molds/policy/mold.typ": mold

#let data = (
  title: "Política de Privacidad de la Información",
  code: "G4-POL-01",
  version: "3.0",
  date: "2025-10-28",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
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
  validity: "2026-10-28",
  owner-role: "Oficial de Seguridad de la Información (OSI / DPO)",
  references: (
    "Norma ISO/IEC 27701:2025 Cláusula 5.2 (Política de privacidad de la información, segunda edición).",
    "Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Ley Universitaria N° 30220.",
    "Resoluciones Rectorales N° 0142-2025 y N° 0143-2025-UNSA (Filiales Camaná y El Pedregal).",
    "Determinación del Alcance del SGPI (G4-ALC-01).",
    "Procedimiento de Control de Información Documentada (G4-PRC-DOC-01).",
  ),
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Emisión inicial de la Política de Privacidad de la Información para la certificación ISO/IEC 27701:2019. Alcance: Sedes centrales Arequipa."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia: Incorporación de directrices de seguridad para plataformas web (admision.unsa.edu.pe), teletrabajo y firma digital."
    ),
    (
      version: "3.0",
      date: "2025-10-28",
      author: "Ing. Carlos M. Benítez",
      summary: "Recertificación bajo ISO/IEC 27701:2025 (segunda edición, standalone PIMS): Expansión a filiales regionales (Camaná y El Pedregal), directrices de nube híbrida y fortalecimiento de CSIRT."
    ),
  ),
  objective_text: [El objetivo de esta política es formalizar el compromiso ineludible de la Alta Dirección de la Universidad Nacional de San Agustín de Arequipa (UNSA) con la protección, confidencialidad, integridad y uso legítimo de los datos personales tratados en sus actividades institucionales, de conformidad con la Cláusula 5.2 de la norma ISO/IEC 27701:2025 y la legislación peruana vigente (Ley N° 29733).],
  scope_text: [Esta política es vinculante para todas las dependencias académicas y administrativas en las Sedes Centrales de Arequipa y en las Filiales Descentralizadas de Camaná y El Pedregal (Majes), cubriendo los procesos de Admisión de Pregrado y Planilla de Remuneraciones en todas sus modalidades.],
  users_text: [Aplicable a la comunidad universitaria, docentes, estudiantes, postulantes, servidores administrativos, directores de filial, analistas de DUTIC y terceros con acceso a los bancos de datos institucionales.],
  commitment_statement: [La Alta Dirección de la *Universidad Nacional de San Agustín de Arequipa (UNSA)*, en su calidad de *Responsable del Tratamiento de Datos Personales (PII Controller - Cl. 4.1)*, asume el compromiso ineludible de garantizar la confidencialidad, integridad, disponibilidad y uso legítimo de los datos personales tratados en sus procesos misionales y de soporte, en estricto cumplimiento del marco legal peruano (*Ley N° 29733*) y el estándar internacional *ISO/IEC 27701:2025 (Segunda edición)*.],
  principles: (
    (
      title: "Legalidad y Legitimidad",
      description: [Todo tratamiento de datos de postulantes, estudiantes, docentes y trabajadores se sustenta en bases jurídicas legítimas determinadas por la Ley Universitaria 30220, la relación contractual o el consentimiento libre, previo, expreso e informado.]
    ),
    (
      title: "Finalidad Determinada",
      description: [La recopilación de PII se restringe estrictamente a los propósitos explícitos y legítimos autorizados, prohibiéndose su comercialización o cesión no informada.]
    ),
    (
      title: "Proporcionalidad y Minimización (Privacy by Default)",
      description: [Se recaba la cantidad mínima de datos personales necesaria para satisfacer la finalidad perseguida, aplicando desidentificación y supresión oportuna.]
    ),
    (
      title: "Seguridad Técnica y Organizativa Multisede",
      description: [Se adoptan medidas técnicas avanzadas (cifrado AES-256, autenticación multifactor, túneles IPSec, MDM institucional con BitLocker XTS-AES 256 y auditoría continua) para prevenir accesos no autorizados, pérdidas o brechas de seguridad en campus y filiales.]
    ),
    (
      title: "Garantía de Derechos ARCO",
      description: [Se asegura a todos los titulares la disponibilidad de mecanismos expeditos, transparentes y gratuitos para el ejercicio de sus derechos de Acceso, Rectificación, Cancelación y Oposición en todas las sedes.]
    ),
  ),
  commitments: (
    [Proveer los recursos humanos, tecnológicos y financieros indispensables para la eficaz operación del SGPI en sedes centrales y filiales descentralizadas (Camaná y El Pedregal).],
    [Mantener activo y capacitado de forma permanente al Equipo de Respuesta a Incidentes (CSIRT-UNSA) bajo la Guía B.3.12 y los controles de ISO/IEC 27701:2025.],
    [Impulsar la mejora continua del SGPI mediante auditorías periódicas bajo ISO 19011:2026 y revisiones semestrales por la Dirección.]
  )
)

#mold(data: data)
