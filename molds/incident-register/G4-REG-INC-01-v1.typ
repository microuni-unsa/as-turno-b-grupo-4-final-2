#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
  title: "Registro Oficial de Incidentes de Privacidad (SGPI)",
  code: "G4-REG-INC-01",
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
      summary: "Emisión inicial del formato de registro para la certificación inicial ISO/IEC 27701:2019. Alcance: Sedes Arequipa (Admisión y Planilla presencial)."
    ),
  )
)

= Propósito y Criterio Operacional
Este documento constituye el registro formal de eventos e incidentes de seguridad que involucran datos personales (PII) en la Universidad Nacional de San Agustín de Arequipa (UNSA), en cumplimiento de las Cláusulas 8.1 y 7.5.1 de la norma ISO/IEC 27701:2025, así como las directrices de la Guía B.3.12.

#callout(title: "DELIMITACIÓN NORMATIVA DE NOTIFICACIÓN (GUÍA B.3.12)", color: rgb("#0284c7"))[
  Los umbrales y plazos de notificación a la Autoridad Nacional de Protección de Datos Personales (ANPDP) y a los titulares son determinados por la UNSA mediante criterios organizacionales de riesgo residual evaluados en el marco de la Cláusula 8.1. No resulta aplicable el plazo estricto de 72 horas establecido en normativas foráneas como el RGPD europeo.
]

= Campos Obligatorios del Registro (Guía B.3.12)
1. *Identificador único*: Código de correlativo institucional `G4-INC-AAAA-NNN`.
2. *Momento de conocimiento (`awareness_at`)*: Fecha y hora exacta en que el CSIRT-UNSA toma conocimiento formal del evento.
3. *Nivel de Severidad*: Categorización según matriz de impacto (Crítico, Alto, Medio, Bajo).
4. *Categoría*: Tipo de vulnerabilidad o vector de exposición (Confidencialidad, Integridad, Disponibilidad).
5. *Titulares afectados (`principals_affected`)*: Cantidad y segmento de personas naturales concernidas.
6. *Acciones de Contención (`containment`)*: Medidas inmediatas de aislamiento, neutralización y recuperación.
7. *Estado de Notificación (`notification_state`)*: Determinación fundada sobre la procedencia de notificación regulatoria o aviso a titulares.

= Libro de Registro de Incidentes (Periodo 2019 — Sede Central Arequipa)

#table(
  columns: (45pt, 70pt, 50pt, 75pt, 95pt, 1fr),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, center, center, left, left, left),
  table.header([*ID*], [*Detección*], [*Severidad*], [*Categoría*], [*Titulares Afectados*], [*Contención y Notificación*]),
  
  [G4-INC-2019-001],
  [2019-05-14\ 08:30],
  rag-tag("MEDIO"),
  [Confidencialidad / Papel impreso],
  [18 postulantes ordinarios (Ingenierías)],
  [
    *Contención:* Retiro de listado físico con DNI en puerta; trituración certificada.\
    *Notificación:* #status-tag("EVALUADO_NO_REQUIERE") (Riesgo contenido inmediatamente sin difusión pública).
  ],

  [G4-INC-2019-002],
  [2019-09-22\ 14:15],
  rag-tag("ALTO"),
  [Confidencialidad / Correo masivo],
  [42 docentes Facultad de Sociales],
  [
    *Contención:* Recall en servidor Exchange; confirmación escrita de borrado por destinatarios.\
    *Notificación:* #status-tag("NOTIFICADO_TITULARES") (Comunicación transparente a los 42 docentes afectados).
  ]
)

= Resumen de Estado de Cierre
- *Total de incidentes registrados en periodo 2019:* 2
- *Incidentes contenidos y cerrados:* 2 (100%)
- *Acciones correctivas vinculadas:* `G4-CAPA-2019-01` y `G4-CAPA-2019-02` (registradas en el sistema CAPA `G4-REG-CAPA-01`).
