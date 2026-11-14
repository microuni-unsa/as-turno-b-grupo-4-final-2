#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
  title: "Módulo Formativo: Respuesta a Incidentes de Privacidad",
  code: "G4-CAP-INC-01",
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
      summary: "Emisión inicial del módulo formativo para el personal de Admisión y Planillas en sedes centrales Arequipa (certificación ISO/IEC 27701:2019)."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia: Migración a entorno virtual vía Aula Virtual UNSA, incorporación de módulos de seguridad web, gestión de accesos remotos y teletrabajo seguro."
    ),
    (
      version: "3.0",
      date: "2025-10-28",
      author: "Ing. Carlos M. Benítez",
      summary: "Recertificación bajo ISO/IEC 27701:2025 (segunda edición): Extensión a Filiales Camaná y El Pedregal (Majes), entrenamiento en seguridad de dispositivos móviles (MDM/BitLocker), prevención de spear-phishing y enlace CSIRT multisede."
    ),
  )
)

= Justificación y Contexto Multisede 2025
Con la entrada en vigencia de la norma independiente ISO/IEC 27701:2025 y la formalización operativa de las filiales regionales de Camaná y El Pedregal (Majes), la UNSA fortalece la capacitación obligatoria para asegurar que los operadores descentralizados cuenten con idénticas competencias en la prevención, detección y reporte de incidentes que el personal de la sede central, satisfaciendo los requisitos de las Cláusulas 7.2, 7.3 y el Control A.3.17.

= Estructura Curricular Multisede (Versión 3.0)
- *Duración total*: 8 horas pedagógicas teórico-prácticas.
- *Modalidad*: Híbrida (talleres presenciales en campus Arequipa, Camaná y El Pedregal con sesiones centralizadas vía videoconferencia de alta definición).
- *Público objetivo*: Coordinadores de filial, encargados de mesas de admisión regional, operadores de planillas descentralizadas y enlaces técnicos locales.

#table(
  columns: (50pt, 120pt, 1fr, 60pt),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, left, left, center),
  table.header([*Sesión*], [*Tema Principal*], [*Contenido Detallado y Práctico*], [*Horas*]),
  [Sesión 1], [Norma ISO/IEC 27701:2025 y Brechas PII], [Estructura de la nueva norma independiente, rol de Responsable del Tratamiento y taxonomía de brechas bajo Guía B.3.12 aplicadas al entorno universitario multisede.], [2 horas],
  [Sesión 2], [Seguridad de Terminales y Filiales Regionales], [Protocolos de protección para laptops de admisión en filiales: BitLocker XTS-AES 256, bloqueo remoto MDM, uso de túneles VPN IPSec y reporte inmediato ante sustracción física.], [2 horas],
  [Sesión 3], [Defensa contra Ingeniería Social y Phishing], [Reconocimiento de ataques de spear-phishing dirigidos a personal de nóminas y admisión, verificación de remitentes y reporte al CSIRT-UNSA.], [2 horas],
  [Sesión 4], [Taller de Simulación y Evaluación Integral], [Ejercicio práctico multisede de reporte de incidente en filial, diligenciamiento del registro `G4-REG-INC-01` y evaluación post-test individual.], [2 horas]
)

= Medición Cuantitativa de Eficacia (Cláusula 7.2)
- *Prueba Diagnóstica (Pre-test)*: 10 ítems para identificar vacíos de conocimiento iniciales por sede.
- *Prueba de Suficiencia (Post-test)*: 20 ítems de opción múltiple y resolución de casos de respuesta a incidentes.
- *Criterio de Acreditación*: Nota mínima aprobatoria de 14.0/20. Los puntajes consolidados se asientan en el Registro Oficial `G4-REG-CAP-01`, evidenciando el incremento sustantivo del nivel de competencia exigido por los auditores de certificación.
