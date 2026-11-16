#import "mold.typ": mold

#let data = (
  title: "Tabla de Objetivos de Privacidad de la Información (SGPI)",
  code: "G4-OBJ-01",
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
    "Norma ISO/IEC 27701:2025, Cláusula 6.2 (Objetivos de privacidad y planificación, segunda edición).",
    "Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Resoluciones Rectorales N° 0142-2025 y N° 0143-2025-UNSA (Filiales Camaná y Majes).",
    "Política de Privacidad de la Información de la UNSA (G4-POL-01).",
    "Determinación del Alcance del SGPI (G4-ALC-01).",
    "Procedimiento de Control de Información Documentada (G4-PRC-DOC-01).",
  ),
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Establecimiento inicial de objetivos de privacidad para el proceso de certificación ISO/IEC 27701:2019 en sedes Arequipa."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia: Incorporación de métricas de seguridad web y teletrabajo."
    ),
    (
      version: "3.0",
      date: "2025-10-28",
      author: "Ing. Carlos M. Benítez",
      summary: "Recertificación ISO/IEC 27701:2025: Actualización de metas cuantitativas e integración de indicadores multisede (Camaná y Majes)."
    ),
  ),
  objective_text: [El presente documento establece los objetivos de privacidad de la información y la planificación para alcanzarlos en la Universidad Nacional de San Agustín de Arequipa (UNSA), de conformidad con la Cláusula 6.2 de la norma internacional ISO/IEC 27701:2025 y la Ley N° 29733.],
  scope_text: [Aplica a todos los tratamientos de datos personales en los procesos de Admisión de Pregrado Integral y Planilla de Remuneraciones Multisede en las Sedes Centrales de Arequipa y Filiales Descentralizadas de Camaná y El Pedregal (Majes).],
  users_text: [Destinado a autoridades universitarias, Directores de Admisión y Personal, Coordinadores de Filial, Directora de DUTIC, Oficial de Seguridad / DPO y auditores del SGPI.],
  alignment: [Los objetivos han sido formulados para operacionalizar los compromisos de la Política de Privacidad (`G4-POL-01`), garantizando la protección efectiva de los datos personales tratados en los procesos de Admisión y Planillas en todas las sedes institucionales.],
  objectives: (
    (
      id: "OBJ-1",
      objective: "Optimizar la capacidad de contención rápida ante incidentes de privacidad.",
      kpi: "Tiempo Medio de Contención (MTTC) menor a 60 min en incidentes críticos.",
      action: "Monitoreo SIEM 24/7 y protocolos CSIRT multisede actualizados.",
      responsible: "Ing. Carlos Benítez (OSI / DPO)",
      term: "Continuo (2025-2026)",
      status: "VIGENTE"
    ),
    (
      id: "OBJ-2",
      objective: "Garantizar la atención oportuna y eficaz de derechos ARCO.",
      kpi: "100% de solicitudes atendidas dentro del plazo de ley (10d acceso, 5d rect.).",
      action: "Módulo de alertas en Sisgedo y mesa de partes digital en filiales.",
      responsible: "Ing. Carlos Benítez (OSI / DPO)",
      term: "Semestral",
      status: "VIGENTE"
    ),
    (
      id: "OBJ-3",
      objective: "Asegurar la competencia técnica del personal que trata datos PII.",
      kpi: "Mayor a 95% de personal aprobado (>= 14/20) en módulo G4-CAP-INC-01.",
      action: "Talleres híbridos anuales y plataforma en Aula Virtual UNSA.",
      responsible: "Lic. Martha Córdova (Subdir. Personal)",
      term: "Anual (Nov 2025)",
      status: "VIGENTE"
    ),
    (
      id: "OBJ-4",
      objective: "Cerrar eficazmente las no conformidades identificadas.",
      kpi: "Mayor a 90% de acciones correctivas cerradas en plazo en G4-REG-CAPA-01.",
      action: "Seguimiento bimensual de causa raíz con dueños de proceso.",
      responsible: "Mg. Lucía Valdivia (Directora DUTIC)",
      term: "Trimestral",
      status: "VIGENTE"
    ),
    (
      id: "OBJ-5",
      objective: "Garantizar el cifrado de datos en terminales móviles de filiales.",
      kpi: "100% de laptops de Camaná y Majes con BitLocker XTS-AES 256 activo.",
      action: "Políticas GPO y verificación periódica en MDM Intune.",
      responsible: "Dr. Marcos Cárdenas (Coord. Camaná)",
      term: "Permanente",
      status: "VIGENTE"
    )
  ),
  monitoring: [El avance y logro de los objetivos de privacidad es evaluado trimestralmente por el Oficial de Seguridad y presentado como insumo obligatorio en la Revisión por la Dirección (Cláusula 9.3 / `G4-ACT-REV-01`).]
)

#mold(data: data)
