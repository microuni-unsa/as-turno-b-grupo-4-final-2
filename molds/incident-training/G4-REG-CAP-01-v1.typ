#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
  title: "Registro de Asistencia y Evaluación: Módulo de Incidentes",
  code: "G4-REG-CAP-01",
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
      summary: "Emisión inicial de registros de asistencia y evaluación para personal de Admisión y Planillas en sedes centrales Arequipa."
    ),
  )
)

= Ficha General de la Acción Formativa
- *Módulo Vinculado*: `G4-CAP-INC-01` (Respuesta a Incidentes de Privacidad — Pista 3 Implementadores).
- *Instructor*: Ing. Carlos M. Benítez (Oficial de Seguridad de la Información / DPO).
- *Fechas de Ejecución*: 22 al 25 de abril de 2019 (8 horas presenciales).
- *Lugar*: Auditorio de la Dirección Universitaria de TIC (Campus Ingenierías, Arequipa).

#callout(title: "EVIDENCIA DE ADQUISICIÓN DE COMPETENCIA (CLÁUSULA 7.2)", color: rgb("#0284c7"))[
  Conforme a la norma ISO/IEC 27701:2025 Cláusula 7.2, la eficacia de la capacitación se demuestra mediante la comparación cuantitativa entre la evaluación diagnóstica de entrada (Pre-test) y la evaluación final de suficiencia (Post-test), verificando la adquisición efectiva de habilidades prácticas en respuesta a incidentes.
]

= Registro Individualizado de Asistencia y Calificaciones (Edición 2019 — Sede Central)

#table(
  columns: (50pt, 120pt, 90pt, 50pt, 45pt, 45pt, 55pt),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, left, left, center, center, center, center),
  table.header([*DNI*], [*Apellidos y Nombres*], [*Dependencia / Cargo*], [*Asistencia*], [*Pre-Test*], [*Post-Test*], [*Condición*]),
  
  [29481920], [Cornejo Zegarra, Manuel], [Admisión - Vocal Pabellón], [100% (4/4)], [07 / 20], [17 / 20], status-tag("APROBADO"),
  [41209384], [Huamán Quispe, Rosa], [Planillas - Asistente], [100% (4/4)], [06 / 20], [18 / 20], status-tag("APROBADO"),
  [29740112], [Pinto Medina, Marco], [DUTIC - Administrador BD], [100% (4/4)], [09 / 20], [19 / 20], status-tag("APROBADO"),
  [40819273], [Vilca Carpio, Jorge], [Admisión - Operador Registro], [100% (4/4)], [08 / 20], [16 / 20], status-tag("APROBADO"),
  [29601928], [Gutiérrez Ramos, Elena], [Planillas - Analista Nómina], [100% (4/4)], [05 / 20], [17 / 20], status-tag("APROBADO")
)

= Resumen Estadístico de Eficacia Formativa
- *Participantes inscritos y evaluados:* 5
- *Promedio Diagnóstico Inicial (Pre-test):* 07.0 / 20 (Nivel inicial deficiente, acreditando la necesidad formativa).
- *Promedio de Suficiencia Final (Post-test):* 17.4 / 20 (Incremento de +10.4 puntos).
- *Tasa de Aprobación Institucional:* 100% (todos los participantes superaron el estándar mínimo de 14.0/20).
- *Conclusión del Oficial de Seguridad:* Se valida formalmente la eficacia del curso para la prevención de incidentes operacionales.
