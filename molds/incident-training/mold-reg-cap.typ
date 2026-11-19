// mold-reg-cap.typ — Molde parametrizado para Registro de Asistencia y Evaluación de Competencias
// Cumple con ISO/IEC 27701:2025 Cláusula 7.2 (Competencia), Control A.3.17 y Guía B.3.17.
// CERO datos de instancia institucional en este archivo.

#import "../common/template.typ": doc-template

#let mold-reg-cap(
  metadata: (:),
  references: (),
  course-info: (:),
  table-columns: (52pt, 115pt, 100pt, 45pt, 40pt, 40pt, 50pt),
  table-headers: ([*DNI*], [*Apellidos y Nombres*], [*Dependencia / Cargo*], [*Asist.*], [*Pre*], [*Post*], [*Condición*]),
  attendees: (),
  statistics: (:),
  ..sink
) = {
  show: doc-template.with(
    title: metadata.at("title", default: "Registro de Asistencia y Evaluación"),
    short-title: metadata.at("short-title", default: none),
    code: metadata.at("code", default: "G4-REG-CAP-01"),
    version: metadata.at("version", default: "3.0"),
    date: metadata.at("date", default: "2025-10-28"),
    confidentiality: metadata.at("confidentiality", default: "CONFIDENCIAL - USO INTERNO UNSA"),
    author: metadata.at("author", default: (name: "", role: "", date: "")),
    reviewer: metadata.at("reviewer", default: (name: "", role: "", date: "")),
    approver: metadata.at("approver", default: (name: "", role: "", date: "")),
    history: metadata.at("history", default: ()),
    validity: none,
    references: (),
    owner-role: none,
    show-signature: true,
  )

  [
    = Ficha General de la Acción Formativa

    #table(
      columns: (140pt, 1fr),
      stroke: 0.5pt + luma(190),
      fill: (col, row) => if col == 0 { rgb("#f8fafc") } else { none },
      inset: (x: 8pt, y: 5pt),
      align: (left, left),
      [*Módulo Formativo Vinculado:*], [#course-info.at("module-ref", default: "G4-CAP-INC-01 (Capacitación en Privacidad e Incidentes)")],
      [*Instructor Principal:*], [#course-info.at("instructor", default: "Oficial de Seguridad de la Información (OSI) / DPO")],
      [*Fechas y Periodo de Ejecución:*], [#course-info.at("dates", default: "")],
      [*Modalidad y Sedes Conectadas:*], [#course-info.at("location", default: "")],
      [*Carga Horaria Acreditada:*], [#course-info.at("hours", default: "8 horas pedagógicas")]
    )

    = Registro Individualizado de Asistencia y Calificaciones

    #table(
      columns: table-columns,
      fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
      stroke: 0.5pt + luma(190),
      align: (center, left, left, center, center, center, center),
      table.header(..table-headers),
      ..attendees.map(a => (
        [#a.at("dni", default: "")],
        [*#a.at("name", default: "")*],
        [#a.at("role-unit", default: "")],
        [#a.at("attendance", default: "100%")],
        [#a.at("pre-test", default: "-")],
        [*#a.at("post-test", default: "-")*],
        [*#a.at("status", default: "APROBADO")*]
      )).flatten()
    )

    = Resumen Estadístico de Eficacia Formativa

    - *Total de Participantes Evaluados:* #statistics.at("total-evaluated", default: "0")
    - *Promedio Diagnóstico de Entrada (Pre-test):* #statistics.at("pre-average", default: "00.0 / 20")
    - *Promedio de Suficiencia de Salida (Post-test):* #statistics.at("post-average", default: "00.0 / 20")
    - *Incremento Cuantitativo de Competencia:* #statistics.at("delta", default: "+0.0 puntos")
    - *Tasa de Aprobación Institucional:* #statistics.at("pass-rate", default: "100%")
    - *Conclusión del Oficial de Seguridad / DPO:* #statistics.at("conclusion", default: "Se valida formalmente la eficacia de la capacitación para la mitigación de riesgos de incidentes.")
  ]
}
