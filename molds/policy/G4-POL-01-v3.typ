#import "mold.typ": mold

#let data = (
  org_name: "UNIVERSIDAD NACIONAL DE SAN AGUSTÍN DE AREQUIPA",
  org_subtitle: "SISTEMA DE GESTIÓN DE PRIVACIDAD DE LA INFORMACIÓN (SGPI - ISO/IEC 27701:2025)",
  code: "G4-POL-01",
  version: "3.0",
  date: "2025-10-28",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
  footer_note: "SGPI-UNSA Grupo 4 | Política Institucional Oficial | Aprobada por Resolución Rectoral",
  title: "POLÍTICA DE PRIVACIDAD DE LA INFORMACIÓN",
  author: (
    name: "Ing. Carlos M. Benítez",
    role: "Oficial de Seguridad / DPO",
    date: "2025-10-20"
  ),
  reviewer: (
    name: "Mg. Lucía Valdivia Paredes",
    role: "Directora DUTIC",
    date: "2025-10-24"
  ),
  approver: (
    name: "Dr. Hugo José Sánchez",
    role: "Rector - Presidente SGPI",
    date: "2025-10-28"
  ),
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
      title: "Seguridad Técnica y Organizativa",
      description: [Se adoptan medidas técnicas avanzadas (cifrado AES-256, autenticación multifactor, túneles IPSec, MDM institucional y auditoría continua) para prevenir accesos no autorizados, pérdidas o brechas de seguridad.]
    ),
    (
      title: "Garantía de Derechos ARCO",
      description: [Se asegura a todos los titulares la disponibilidad de mecanismos expeditos, transparentes y gratuitos para el ejercicio de sus derechos de Acceso, Rectificación, Cancelación y Oposición.]
    ),
  ),
  commitments: (
    [Proveer los recursos humanos, tecnológicos y financieros indispensables para la eficaz operación del SGPI en sedes centrales y filiales descentralizadas (Camaná y El Pedregal).],
    [Mantener activo y capacitado de forma permanente al Equipo de Respuesta a Incidentes (CSIRT-UNSA) bajo la Guía B.3.12.],
    [Impulsar la mejora continua del SGPI mediante auditorías periódicas bajo ISO 19011:2026 y revisiones semestrales por la Dirección.]
  )
)

#mold(data: data)
