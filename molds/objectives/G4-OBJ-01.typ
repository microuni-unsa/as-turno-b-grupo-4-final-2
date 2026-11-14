#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
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
  )
)

= Propósito y Fundamento Normativo
El presente documento establece los objetivos de privacidad de la información y la planificación para alcanzarlos en la Universidad Nacional de San Agustín de Arequipa (UNSA), de conformidad con la Cláusula 6.2 de la norma internacional ISO/IEC 27701:2025.

= Alineamiento con la Política de Privacidad (Cláusula 5.2)
Los objetivos han sido formulados para operacionalizar los compromisos de la Política de Privacidad (`G4-POL-01`), garantizando la protección efectiva de los datos personales tratados en los procesos de Admisión y Planillas en todas las sedes institucionales.

= Matriz de Objetivos de Privacidad y Plan de Acción (Periodo 2025 – 2026)

#table(
  columns: (35pt, 110pt, 85pt, 70pt, 80pt, 50pt, 45pt),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, left, left, left, left, center, center),
  table.header([*N°*], [*Objetivo de Privacidad*], [*Indicador / Meta (KPI)*], [*Qué se Hará / Recursos*], [*Responsable*], [*Plazo*], [*Estado*]),
  
  [OBJ-1],
  [Optimizar la capacidad de contención rápida ante incidentes de privacidad.],
  [Tiempo Medio de Contención (MTTC) menor a 60 min en incidentes críticos.],
  [Monitoreo SIEM 24/7 y protocolos CSIRT multisede actualizados.],
  [Ing. Carlos Benítez\ (OSI / DPO)],
  [Continuo\ (2025-2026)],
  status-tag("VIGENTE"),

  [OBJ-2],
  [Garantizar la atención oportuna y eficaz de derechos ARCO.],
  [100% de solicitudes atendidas dentro del plazo de ley (10d acceso, 5d rect.).],
  [Módulo de alertas en Sisgedo y mesa de partes digital en filiales.],
  [Ing. Carlos Benítez\ (OSI / DPO)],
  [Semestral],
  status-tag("VIGENTE"),

  [OBJ-3],
  [Asegurar la competencia técnica del personal que trata datos PII.],
  [Mayor a 95% de personal aprobado (>= 14/20) en módulo `G4-CAP-INC-01`.],
  [Talleres híbridos anuales y plataforma en Aula Virtual UNSA.],
  [Lic. Martha Córdova\ (Subdir. Personal)],
  [Anual\ (Nov 2025)],
  status-tag("VIGENTE"),

  [OBJ-4],
  [Cerrar eficazmente las no conformidades identificadas.],
  [Mayor a 90% de acciones correctivas cerradas en plazo en `G4-REG-CAPA-01`.],
  [Seguimiento bimensual de causa raíz con dueños de proceso.],
  [Mg. Lucía Valdivia\ (Directora DUTIC)],
  [Trimestral],
  status-tag("VIGENTE"),

  [OBJ-5],
  [Garantizar el cifrado de datos en terminales móviles de filiales.],
  [100% de laptops de Camaná y Majes con BitLocker XTS-AES 256 activo.],
  [Políticas GPO y verificación periódica en MDM Intune.],
  [Dr. Marcos Cárdenas\ (Coord. Camaná)],
  [Permanente],
  status-tag("VIGENTE")
)

= Mecanismo de Seguimiento y Evaluación de Resultados (Cláusula 9.1)
El avance y logro de los objetivos de privacidad es evaluado trimestralmente por el Oficial de Seguridad y presentado como insumo obligatorio en la Revisión por la Dirección (Cláusula 9.3 / `G4-ACT-REV-01`).
