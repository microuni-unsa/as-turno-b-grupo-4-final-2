#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
  title: "Registro de Asistencia y Evaluación: Módulo de Incidentes",
  code: "G4-REG-CAP-01",
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
      summary: "Emisión inicial de registros de asistencia y evaluación para personal de Admisión y Planillas en sedes centrales Arequipa."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia: Registro de asistencia y evaluación virtual sincrónica/asincrónica en Aula Virtual UNSA."
    ),
  )
)

= Ficha General de la Acción Formativa
- *Módulo Vinculado*: `G4-CAP-INC-01` (Respuesta a Incidentes de Privacidad — Pista 3 Implementadores).
- *Instructor*: Ing. Carlos M. Benítez (Oficial de Seguridad de la Información / DPO).
- *Fechas de Ejecución*: 12 al 16 de septiembre de 2022 (8 horas virtuales).
- *Plataforma*: Aula Virtual UNSA (Moodle institucional) y sesiones sincrónicas Google Meet.

= Registro de Participantes y Calificaciones (Edición 2022 — Entorno Virtual)

#table(
  columns: (50pt, 120pt, 90pt, 50pt, 45pt, 45pt, 55pt),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, left, left, center, center, center, center),
  table.header([*DNI*], [*Apellidos y Nombres*], [*Dependencia / Cargo*], [*Asistencia*], [*Pre-Test*], [*Post-Test*], [*Condición*]),
  
  [29481920], [Cornejo Zegarra, Manuel], [Admisión - Soporte Web], [100% (4/4)], [08 / 20], [18 / 20], status-tag("APROBADO"),
  [41209384], [Huamán Quispe, Rosa], [Planillas - Teletrabajo], [100% (4/4)], [07 / 20], [19 / 20], status-tag("APROBADO"),
  [29740112], [Pinto Medina, Marco], [DUTIC - Admin. Servidores], [100% (4/4)], [10 / 20], [20 / 20], status-tag("APROBADO"),
  [40819273], [Vilca Carpio, Jorge], [Admisión - Validador Digital], [100% (4/4)], [06 / 20], [17 / 20], status-tag("APROBADO"),
  [29601928], [Gutiérrez Ramos, Elena], [Planillas - Auditora Nómina], [100% (4/4)], [07 / 20], [18 / 20], status-tag("APROBADO"),
  [43910284], [Mendoza Salas, Carlos], [DUTIC - Analista SOC], [100% (4/4)], [09 / 20], [19 / 20], status-tag("APROBADO")
)

= Resumen Estadístico de Eficacia Formativa
- *Total de Participantes Acreditados:* 6
- *Promedio Diagnóstico Inicial (Pre-test):* 07.8 / 20
- *Promedio de Suficiencia Final (Post-test):* 18.5 / 20 (Incremento de +10.7 puntos).
- *Conclusión:* Cumplimiento total de la competencia técnica exigida por la Cláusula 7.2 en gestión de incidentes digitales y teletrabajo.
