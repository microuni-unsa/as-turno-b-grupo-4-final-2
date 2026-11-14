#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
  title: "Registro Oficial de Incidentes de Privacidad (SGPI)",
  code: "G4-REG-INC-01",
  version: "2.0",
  date: "2022-09-10",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
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
      summary: "Emisión inicial del formato de registro para la certificación inicial ISO/IEC 27701:2019. Alcance: Sedes Arequipa (Admisión y Planilla presencial)."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización mayor post-pandemia: Incorporación de campos para incidentes en plataformas web (admision.unsa.edu.pe), accesos lógicos y teletrabajo de personal."
    ),
  )
)

= Propósito y Criterio Operacional
Este registro contiene la trazabilidad integral de los eventos e incidentes de seguridad que involucran datos personales (PII) bajo la norma ISO/IEC 27701:2025 Cláusulas 8.1 y 7.5.1, integrando los vectores derivados de la virtualización de procesos institucionales.

#callout(title: "CRITERIO DE NOTIFICACIÓN ORGANIZACIONAL (GUÍA B.3.12)", color: rgb("#0284c7"))[
  La notificación a la autoridad regulatoria nacional (ANPDP) o a los titulares se realiza exclusivamente cuando la evaluación de impacto y riesgo residual determina afectación efectiva a los derechos de los titulares. No se adopta la regla de 72 horas del RGPD por constituir únicamente información documental de referencia (Anexo D).
]

= Estructura de Campos y Registro Forense
El registro incorpora métricas de contención en capa lógica, revocación de sesiones, rotación de credenciales y notificación según severidad.

= Libro Histórico de Incidentes (Periodos 2019 – 2022)

#table(
  columns: (45pt, 65pt, 50pt, 75pt, 95pt, 1fr),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, center, center, left, left, left),
  table.header([*ID*], [*Detección*], [*Severidad*], [*Categoría*], [*Titulares Afectados*], [*Contención y Notificación*]),
  
  [G4-INC-2019-001],
  [2019-05-14\ 08:30],
  rag-tag("MEDIO"),
  [Confidencialidad / Papel impreso],
  [18 postulantes ordinarios],
  [
    *Contención:* Destrucción certificada de listado.\
    *Notificación:* #status-tag("EVALUADO_NO_REQUIERE") (Sin fuga externa).
  ],

  [G4-INC-2019-002],
  [2019-09-22\ 14:15],
  rag-tag("ALTO"),
  [Confidencialidad / Correo masivo],
  [42 docentes Facultad de Sociales],
  [
    *Contención:* Recall en Exchange y borrado confirmado.\
    *Notificación:* #status-tag("NOTIFICADO_TITULARES") (Comunicación individual).
  ],

  [G4-INC-2022-001],
  [2022-03-18\ 11:00],
  rag-tag("CRÍTICO"),
  [Acceso no autorizado / IDOR Web],
  [1,240 postulantes inscritos online],
  [
    *Contención:* Parche hotfix en backend en 45 min; rotación de tokens JWT y bloqueo de IP anómalas.\
    *Notificación:* #status-tag("NOTIFICADO_AUTORIDAD_ANPDP") (Reporte oficial a ANPDP y aviso preventivo).
  ],

  [G4-INC-2022-002],
  [2022-07-05\ 16:40],
  rag-tag("BAJO"),
  [Disponibilidad / Fallo backup BD],
  [0 (Sin impacto directo)],
  [
    *Contención:* Ejecución manual de réplica; verificación de hash SHA-256.\
    *Notificación:* #status-tag("EVALUADO_NO_REQUIERE") (Incidente operacional interno).
  ]
)

= Acciones de Mejora Derivadas
Los incidentes del periodo 2022 originaron las acciones correctivas `G4-CAPA-2022-01` (auditoría de seguridad en API web de admisión) y `G4-CAPA-2022-02` (monitoreo automatizado de réplicas en DUTIC).
