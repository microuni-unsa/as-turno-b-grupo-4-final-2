// Template institucional para los moldes Typst 0.15 del SGPI UNSA - Turno B Grupo 4
// Cumple estrictamente con la anatomía SPEC 6.1 y los requisitos de ISO/IEC 27701:2025

#let status-tag(status) = {
  let bg = rgb("#e2e8f0")
  let fg = rgb("#334155")
  if status == "VIGENTE" or status == "CERRADA" or status == "IMPLEMENTADO" or status == "BAJO" or status == "APROBADO" {
    bg = rgb("#dcfce7")
    fg = rgb("#166534")
  } else if status == "OBSOLETO" or status == "ABIERTA" or status == "ALTO" or status == "CRITICO" or status == "RECHAZADO" {
    bg = rgb("#fee2e2")
    fg = rgb("#991b1b")
  } else if status == "EN_REVISION" or status == "EN_CURSO" or status == "MEDIO" or status == "BORRADOR" {
    bg = rgb("#fef3c7")
    fg = rgb("#92400e")
  }
  box(fill: bg, radius: 3pt, inset: (x: 5pt, y: 2.5pt))[
    #text(fill: fg, weight: "bold", size: 7.5pt)[#status]
  ]
}

#let rag-tag(level) = {
  let bg = rgb("#e2e8f0")
  let fg = rgb("#334155")
  let label = level
  if level == "RED" or level == "ROJO" or level == "CRÍTICO" {
    bg = rgb("#fee2e2")
    fg = rgb("#991b1b")
    label = "ROJO"
  } else if level == "AMBER" or level == "AMARILLO" or level == "MEDIO" {
    bg = rgb("#fef3c7")
    fg = rgb("#92400e")
    label = "ÁMBAR"
  } else if level == "GREEN" or level == "VERDE" or level == "BAJO" {
    bg = rgb("#dcfce7")
    fg = rgb("#166534")
    label = "VERDE"
  }
  box(fill: bg, radius: 3pt, inset: (x: 6pt, y: 2.5pt))[
    #text(fill: fg, weight: "bold", size: 7.5pt)[#label]
  ]
}

#let callout(title: "NOTA NORMATIVA", color: rgb("#0284c7"), body) = {
  block(
    width: 100%,
    stroke: (left: 3pt + color),
    fill: rgb("#f8fafc"),
    inset: (left: 10pt, y: 7pt, right: 8pt),
    radius: (right: 3pt),
    [
      #text(weight: "bold", size: 8.5pt, fill: color)[#title]\
      #v(2pt)
      #text(size: 8.5pt, fill: luma(60))[#body]
    ]
  )
}

#let doc-template(
  title: "",
  code: "",
  version: "",
  date: "",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
  author: (:),
  reviewer: (:),
  approver: (:),
  history: (),
  body
) = {
  set page(
    paper: "a4",
    margin: (top: 3cm, bottom: 2.5cm, left: 2.5cm, right: 2.5cm),
    header: [
      #grid(
        columns: (1fr, auto),
        align(left)[
          #text(weight: "bold", size: 8pt, fill: rgb("#0a2540"))[UNIVERSIDAD NACIONAL DE SAN AGUSTÍN DE AREQUIPA]\
          #text(fill: luma(80), size: 7pt)[SISTEMA DE GESTIÓN DE PRIVACIDAD DE LA INFORMACIÓN (SGPI - ISO/IEC 27701:2025)]
        ],
        align(right)[
          #text(weight: "bold", size: 8.5pt)[#code | v#version]\
          #text(fill: rgb("#b30000"), size: 7pt, weight: "bold")[#confidentiality]
        ]
      )
      #v(1pt)
      #line(length: 100%, stroke: 0.5pt + luma(180))
    ],
    footer: context [
      #line(length: 100%, stroke: 0.5pt + luma(180))
      #v(1pt)
      #grid(
        columns: (1fr, auto),
        align(left)[
          #text(size: 7.5pt, fill: luma(100))[SGPI-UNSA Grupo 4 | Documento Institucional Controlado | Estado: Vigente]
        ],
        align(right)[
          #text(size: 7.5pt, fill: luma(100))[Página #counter(page).display("1 de 1", both: true)]
        ]
      )
    ]
  )

  set text(font: "Liberation Sans", size: 9.5pt, lang: "es")
  set par(justify: true, leading: 0.65em)
  set heading(numbering: "1.1.")

  // Title Box
  v(0.3cm)
  align(center)[
    #text(size: 15pt, weight: "bold", fill: rgb("#0a2540"))[#title]\
    #v(4pt)
    #text(size: 9.5pt, weight: "medium", fill: luma(90))[
      Código: #text(weight: "bold")[#code] | Versión: #text(weight: "bold")[#version] | Fecha de Emisión: #text(weight: "bold")[#date]
    ]
  ]
  v(0.4cm)

  // Control de firmas institucional
  block(width: 100%, stroke: 0.5pt + luma(180), radius: 3pt, inset: 8pt)[
    #text(weight: "bold", size: 8.5pt, fill: rgb("#0a2540"))[Cuadro de Aprobación Institucional:]
    #v(4pt)
    #grid(
      columns: (1fr, 1fr, 1fr),
      gutter: 8pt,
      [
        #text(size: 8pt, weight: "bold")[Elaborado por:]\
        #text(size: 8pt)[#author.name]\
        #text(size: 7pt, fill: luma(90))[#author.role]\
        #text(size: 7pt, fill: luma(90))[Fecha: #author.date]
      ],
      [
        #text(size: 8pt, weight: "bold")[Revisado por:]\
        #text(size: 8pt)[#reviewer.name]\
        #text(size: 7pt, fill: luma(90))[#reviewer.role]\
        #text(size: 7pt, fill: luma(90))[Fecha: #reviewer.date]
      ],
      [
        #text(size: 8pt, weight: "bold")[Aprobado por:]\
        #text(size: 8pt)[#approver.name]\
        #text(size: 7pt, fill: luma(90))[#approver.role]\
        #text(size: 7pt, fill: luma(90))[Fecha: #approver.date]
      ]
    )
  ]

  v(0.3cm)
  // Historial de Revisiones
  text(weight: "bold", size: 8.5pt, fill: rgb("#0a2540"))[Historial de Revisiones del Documento:]
  v(3pt)
  table(
    columns: (42pt, 58pt, 115pt, 1fr),
    fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
    stroke: 0.5pt + luma(190),
    align: (center, center, left, left),
    table.header([*Versión*], [*Fecha*], [*Responsable / Rol*], [*Resumen de Cambios y Justificación*]),
    ..history.map(row => (
      text(size: 7.5pt, weight: "bold")[#row.version],
      text(size: 7.5pt)[#row.date],
      text(size: 7.5pt)[#row.author],
      text(size: 7.5pt)[#row.summary]
    )).flatten()
  )

  v(0.3cm)
  outline(title: "Índice de Contenidos", indent: 1.2em)
  pagebreak()

  body
}
