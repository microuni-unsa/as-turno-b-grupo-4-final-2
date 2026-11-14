#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
  title: "Módulo Formativo: Respuesta a Incidentes de Privacidad",
  code: "G4-CAP-INC-01",
  version: "1.0",
  date: "2019-04-15",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
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
      summary: "Emisión inicial del módulo formativo para el personal de Admisión y Planillas en sedes centrales Arequipa (certificación ISO/IEC 27701:2019)."
    ),
  )
)

= Justificación y Marco Normativo
El desarrollo de competencias en privacidad constituye un pilar indispensable para la eficacia del Sistema de Gestión de Privacidad de la Información (SGPI) de la UNSA. Conforme a las Cláusulas 7.2 (Competencia), 7.3 (Toma de conciencia) y el Control A.3.17 de la norma ISO/IEC 27701:2025, la organización debe asegurar que el personal que opera con datos personales reciba capacitación específica orientada a prevenir y responder ante incidentes de privacidad.

= Arquitectura Curricular de la Academia de Privacidad UNSA
El plan institucional de capacitación se articula en cuatro pistas formativas complementarias:
1. *Pista 1: Sensibilización General en Privacidad (8 horas)*: Dirigida a toda la comunidad universitaria sobre derechos ARCO, confidencialidad y principios rectores de la Ley 29733.
2. *Pista 2: Interpretación de la Norma ISO/IEC 27701 (8 horas)*: Análisis de las cláusulas de alto nivel, política, contexto y responsabilidades del Responsable del Tratamiento (PII Controller).
3. *Pista 3: Implementadores y Gestión Operativa de Formatos (16 horas)*: Capacitación técnica enfocada en el diligenciamiento riguroso de registros diarios, donde se inserta de forma prioritaria el presente *Módulo Profundo de Respuesta a Incidentes de Privacidad (8 horas)*.
4. *Pista 4: Auditores Internos de Privacidad (16 horas)*: Técnicas de auditoría interna basadas en las directrices de la norma ISO 19011:2026.

= Estructura Curricular del Módulo de Incidentes (Versión 1.0)
- *Duración total*: 8 horas pedagógicas teórico-prácticas.
- *Modalidad*: Presencial en el Auditorio del Área de Ingenierías (Campus Central Arequipa).
- *Público objetivo*: Vocales de pabellón de admisión, analistas de planillas y operadores de mesas de partes.

#table(
  columns: (50pt, 120pt, 1fr, 60pt),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, left, left, center),
  table.header([*Sesión*], [*Tema Principal*], [*Contenido Detallado y Práctico*], [*Horas*]),
  [Sesión 1], [Identificación de Eventos y Brechas PII], [Diferenciación entre evento operativo e incidente con compromiso de datos conforme a Guía B.3.12. Reconocimiento de PII en padrones de admisión.], [2 horas],
  [Sesión 2], [Protocolos de Contención Inmediata], [Medidas de aislamiento físico, trituración de impresiones erróneas y revocación de accesos en red local. Reporte de los primeros 60 minutos.], [2 horas],
  [Sesión 3], [Diligenciamiento de Registros], [Llenado práctico del Libro de Incidentes `G4-REG-INC-01` y análisis de causa raíz para acciones correctivas `G4-REG-CAPA-01`.], [2 horas],
  [Sesión 4], [Simulacro y Evaluación de Competencias], [Ejercicio práctico de simulación de extravío de listado de postulantes y aplicación de evaluación escrita individual post-test.], [2 horas]
)

= Mecanismo de Evaluación y Medición de Eficacia (Cláusula 7.2)
Para constatar objetivamente la adquisición de competencias exigida por los auditores del SGPI, se aplica un esquema doble:
1. *Evaluación Diagnóstica Inicial (Pre-test)*: Cuestionario de entrada de 10 preguntas para medir el nivel de partida.
2. *Evaluación de Competencia Final (Post-test)*: Cuestionario de salida de 20 preguntas (escala vigesimal 0 a 20).
- *Criterio de Aprobación*: Nota mínima de 14.0/20 y asistencia al 100% de las sesiones. Los resultados individuales se asientan formalmente en el registro `G4-REG-CAP-01`.
