#import "../../molds/policy/mold.typ": mold

#let data = (
  title: "Política de Privacidad de la Información",
  code: "G4-POL-01",
  version: "1.0",
  date: "2019-04-15",
  confidentiality: "Confidencial",
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
  validity: "2020-04-15",
  owner-role: "Oficial de Seguridad de la Información (OSI / DPO)",
  references: (
    "Norma ISO/IEC 27701:2019 / ISO/IEC 27001:2013 Cláusula 5.2 (Política de privacidad y seguridad).",
    "Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Ley Universitaria N° 30220.",
    "Determinación del Alcance del SGPI (G4-ALC-01).",
  ),
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Emisión inicial de la Política de Privacidad de la Información para la certificación ISO/IEC 27701:2019. Alcance: Sedes centrales Arequipa."
    ),
  ),
  objective_text: [El objetivo de esta política es formalizar el compromiso ineludible de la Alta Dirección de la Universidad Nacional de San Agustín de Arequipa (UNSA) con la protección, confidencialidad, integridad y uso legítimo de los datos personales tratados en sus actividades institucionales, de conformidad con la Cláusula 5.2 de la norma ISO/IEC 27701 y la legislación peruana vigente (Ley N° 29733).],
  scope_text: [Esta política es vinculante para todas las dependencias académicas y administrativas en las sedes centrales de Arequipa (Ingenierías, Biomédicas y Sociales), abarcando los procesos de Admisión Ordinaria presencial y Planilla de Remuneraciones.],
  users_text: [Destinado a autoridades universitarias, docentes, trabajadores administrativos, personal de admisión y mesa de partes, así como a los postulantes y titulares de datos personales.],
  commitment_statement: [La Alta Dirección de la *Universidad Nacional de San Agustín de Arequipa (UNSA)*, en su calidad de *Responsable del Tratamiento de Datos Personales (PII Controller)*, asume el compromiso prioritario de garantizar la confidencialidad, integridad, disponibilidad y uso legítimo de los datos personales tratados en sus procesos misionales y de soporte, en estricto cumplimiento del marco legal peruano (*Ley N° 29733*) y el estándar internacional *ISO/IEC 27701:2019*.],
  principles: (
    (
      title: "Legalidad y Licitud",
      description: [Todo tratamiento de datos personales de postulantes, estudiantes, docentes y trabajadores se sustenta en bases legales legítimas conforme a la Ley Universitaria 30220 y el consentimiento informado.]
    ),
    (
      title: "Finalidad Determinada",
      description: [Los datos recabados en ventanillas de admisión y planillas se utilizan exclusivamente para los fines académicos y laborales expresamente autorizados.]
    ),
    (
      title: "Proporcionalidad y Calidad",
      description: [Se limita la recolección de información a los datos estrictamente necesarios, garantizando su exactitud y actualización periódica.]
    ),
    (
      title: "Seguridad y Confidencialidad",
      description: [Se implementan medidas de seguridad física y lógica en el Centro de Datos de DUTIC y archivos de ventanilla para prevenir accesos indebidos o pérdidas.]
    ),
    (
      title: "Garantía de Derechos ARCO",
      description: [Se establecen mecanismos claros a través de Mesa de Partes para que los titulares puedan ejercer sus derechos de acceso, rectificación, cancelación y oposición.]
    ),
  ),
  commitments: (
    [Asignar los recursos necesarios para mantener la infraestructura y seguridad del SGPI en las sedes centrales de Arequipa.],
    [Capacitar periódicamente al personal administrativo y de ventanilla en deberes de reserva y protección de datos personales.],
    [Ejecutar revisiones anuales del sistema de gestión y auditorías internas bajo normas internacionales.]
  )
)

#mold(data: data)
