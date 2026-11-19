#import "../../molds/objectives/mold.typ": mold

#let data = (
  title: "Tabla de Objetivos de Privacidad de la Información",
  code: "G4-OBJ-01",
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
    "Norma ISO/IEC 27701:2019 / ISO/IEC 27001:2013 Cláusula 6.2 (Objetivos de privacidad y seguridad).",
    "Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Política de Privacidad de la Información de la UNSA (G4-POL-01).",
    "Determinación del Alcance del SGPI (G4-ALC-01).",
  ),
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Establecimiento inicial de objetivos de privacidad para el proceso de certificación ISO/IEC 27701:2019 en sedes centrales Arequipa."
    ),
  ),
  objective_text: [El presente documento establece los objetivos de privacidad de la información y la planificación para alcanzarlos en la Universidad Nacional de San Agustín de Arequipa (UNSA), de conformidad con la Cláusula 6.2 de la norma internacional ISO/IEC 27701 y la Ley N° 29733.],
  scope_text: [Aplica a los tratamientos de datos personales en los procesos de Admisión Ordinaria presencial y Planilla de Remuneraciones en las sedes centrales de Arequipa.],
  users_text: [Destinado a autoridades universitarias, jefes de departamento, Dirección de Admisión, Subdirección de Personal, DUTIC y operadores del SGPI.],
  alignment: [Los objetivos han sido formulados para operacionalizar los compromisos de la Política de Privacidad (`G4-POL-01`), garantizando la confidencialidad en ventanillas de atención y la protección de los legajos de postulantes y trabajadores.],
  objectives: (
    (
      id: "OBJ-1",
      objective: "Garantizar la custodia y destrucción segura de padrones impresos con datos PII.",
      kpi: "100% de listas de postulantes con destrucción certificada tras publicación.",
      action: "Adquisición de trituradoras de microcorte e implementación de actas de eliminación.",
      responsible: "Dr. Walter Delgado (Dir. Admisión)",
      term: "Semestral (2019)",
      status: "VIGENTE"
    ),
    (
      id: "OBJ-2",
      objective: "Asegurar la atención oportuna de solicitudes de derechos ARCO en mesa de partes.",
      kpi: "100% de expedientes ARCO tramitados dentro de los plazos de la Ley 29733.",
      action: "Libro de registro físico y protocolo de derivación inmediata al Oficial de Seguridad.",
      responsible: "Ing. Carlos Benítez (OSI / DPO)",
      term: "Continuo",
      status: "VIGENTE"
    ),
    (
      id: "OBJ-3",
      objective: "Capacitar al personal administrativo en deberes de reserva y protección de datos.",
      kpi: "Mayor a 90% de colaboradores de admisión y planillas capacitados formalmente.",
      action: "Talleres presenciales en Auditorio de Sociales y firmas de compromiso de confidencialidad.",
      responsible: "Lic. Martha Córdova (Subdir. Personal)",
      term: "Anual (Nov 2019)",
      status: "VIGENTE"
    ),
    (
      id: "OBJ-4",
      objective: "Fortalecer el control de acceso físico al Centro de Cómputo de DUTIC.",
      kpi: "0 accesos no autorizados registrados en bitácora física de sala de servidores.",
      action: "Instalación de lector biométrico de huella y registro electrónico de visitantes.",
      responsible: "Mg. Lucía Valdivia (Directora DUTIC)",
      term: "Trimestral",
      status: "VIGENTE"
    )
  ),
  monitoring: [El avance de los objetivos es evaluado semestralmente por el Oficial de Seguridad y reportado al Rectorado en las sesiones del Comité SGPI.]
)

#mold(data: data)
