// Template institucional para los moldes Typst 0.15 del SGPI UNSA - Turno B Grupo 4
// Cumple con el contrato de 15 elementos, ISO/IEC 27701:2025 y el formato del instructor

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

#let format-person(p) = {
  if type(p) == dictionary {
    let n = p.at("name", default: "")
    let r = p.at("role", default: "")
    if n != "" and r != "" [ #n (#r) ] else if n != "" [ #n ] else if r != "" [ #r ] else []
  } else if p != none {
    [#p]
  } else {
    []
  }
}

#let reference-docs(items) = {
  if items != none and items != () and items.len() > 0 {
    heading(level: 1)[Documentos de referencia]
    for item in items [
      - #item
    ]
  }
}

#let signature-block(role: none, name: none) = {
  let display-role = if role != none { role } else { "Rector - Presidente del Comité SGPI" }
  let display-name = if name != none { name } else { "Dr. Hugo José Sánchez" }
  block(width: 220pt, breakable: false)[
    #text(size: 8.5pt, weight: "bold")[#display-role]\
    #v(2pt)
    #text(size: 8.5pt)[#display-name]\
    #v(1.2cm)
    #line(length: 100%, stroke: 0.5pt + luma(120))\
    #v(2pt)
    #text(size: 7.5pt, fill: luma(90))[Firma]
  ]
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
  validity: none,
  references: (),
  owner-role: none,
  show-signature: true,
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

  // 1. Tabla de Control Documental (Header Table estilo instructor: Código / Versión / Fecha / Elaborado por / Revisado por / Aprobado por / Nivel de confidencialidad)
  v(0.2cm)
  table(
    columns: (135pt, 1fr),
    stroke: 0.5pt + luma(180),
    fill: (col, row) => if col == 0 { rgb("#f1f5f9") } else { none },
    inset: (x: 8pt, y: 4.5pt),
    align: (left, left),
    [*Código:*], [#code],
    [*Versión:*], [#version],
    [*Fecha de la versión:*], [#date],
    [*Elaborado por:*], [#format-person(author)],
    ..(if reviewer != (:) and reviewer != none and (type(reviewer) != dictionary or reviewer.at("name", default: "") != "") {
      (
        [*Revisado por:*],
        [#format-person(reviewer)]
      )
    } else { () }),
    [*Aprobado por:*], [#format-person(approver)],
    [*Nivel de confidencialidad:*], [#confidentiality],
  )
  v(0.3cm)

  // 2. Título Institucional
  align(center)[
    #text(size: 15pt, weight: "bold", fill: rgb("#0a2540"))[#title]\
    #v(4pt)
    #text(size: 9.5pt, weight: "medium", fill: luma(90))[
      Código: #text(weight: "bold")[#code] | Versión: #text(weight: "bold")[#version] | Fecha de Emisión: #text(weight: "bold")[#date]
    ]
  ]
  v(0.3cm)

  // 3. Cuadro de Aprobación Institucional
  block(width: 100%, stroke: 0.5pt + luma(180), radius: 3pt, inset: 8pt)[
    #text(weight: "bold", size: 8.5pt, fill: rgb("#0a2540"))[Cuadro de Aprobación Institucional:]
    #v(4pt)
    #grid(
      columns: (1fr, 1fr, 1fr),
      gutter: 8pt,
      [
        #text(size: 8pt, weight: "bold")[Elaborado por:]\
        #text(size: 8pt)[#(if type(author) == dictionary { author.at("name", default: "") } else { str(author) })]\
        #text(size: 7pt, fill: luma(90))[#(if type(author) == dictionary { author.at("role", default: "") } else { "" })]\
        #text(size: 7pt, fill: luma(90))[Fecha: #(if type(author) == dictionary { author.at("date", default: "") } else { "" })]
      ],
      [
        #text(size: 8pt, weight: "bold")[Revisado por:]\
        #text(size: 8pt)[#(if type(reviewer) == dictionary { reviewer.at("name", default: "") } else { str(reviewer) })]\
        #text(size: 7pt, fill: luma(90))[#(if type(reviewer) == dictionary { reviewer.at("role", default: "") } else { "" })]\
        #text(size: 7pt, fill: luma(90))[Fecha: #(if type(reviewer) == dictionary { reviewer.at("date", default: "") } else { "" })]
      ],
      [
        #text(size: 8pt, weight: "bold")[Aprobado por:]\
        #text(size: 8pt)[#(if type(approver) == dictionary { approver.at("name", default: "") } else { str(approver) })]\
        #text(size: 7pt, fill: luma(90))[#(if type(approver) == dictionary { approver.at("role", default: "") } else { "" })]\
        #text(size: 7pt, fill: luma(90))[Fecha: #(if type(approver) == dictionary { approver.at("date", default: "") } else { "" })]
      ]
    )
  ]

  v(0.3cm)
  // 4. Historial de Revisiones del Documento
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
  // 5. Índice de Contenidos con salto de página antes del cuerpo
  outline(title: "Índice de Contenidos", indent: 1.2em)
  pagebreak()

  // 6. Sección opcional: Documentos de Referencia
  if references != none and references != () and references.len() > 0 {
    heading(level: 1)[Documentos de referencia]
    for ref-item in references [
      - #ref-item
    ]
    v(0.3cm)
  }

  // 7. Cuerpo del documento
  body

  // 8. Sección opcional: Validez y gestión de documentos
  if validity != none or owner-role != none {
    v(0.4cm)
    heading(level: 1)[Validez y gestión de documentos]
    let val-date = if validity != none and validity != "" { validity } else { date }
    let val-owner = if owner-role != none and owner-role != "" {
      owner-role
    } else if type(author) == dictionary and author.at("role", default: "") != "" {
      author.role
    } else {
      "Oficial de Seguridad de la Información (OSI / DPO)"
    }

    [
      Este documento es válido hasta el #val-date.

      El propietario de este documento es el #val-owner, que debe verificar, y si es necesario actualizar, el documento por lo menos una vez al año.

      Al evaluar la efectividad y adecuación de este documento, es necesario tener en cuenta los siguientes criterios:
      - Cantidad de documentos obsoletos o desactualizados.
      - Cantidad de documentos que no han sido distribuidos a los empleados para los que estaban destinados.
      - Cantidad de documentos para los que no se lleva un registro o que no están archivados adecuadamente.
    ]
  }

  // 9. Bloque de firma institucional al cierre (patrón instructor [cargo] [nombre] ___ [firma])
  if show-signature {
    v(0.6cm)
    let sig-role = if owner-role != none and owner-role != "" {
      owner-role
    } else if type(approver) == dictionary and approver.at("role", default: "") != "" {
      approver.role
    } else if type(author) == dictionary and author.at("role", default: "") != "" {
      author.role
    } else {
      "Rector - Presidente del Comité SGPI"
    }
    let sig-name = if type(approver) == dictionary and approver.at("name", default: "") != "" {
      approver.name
    } else if type(author) == dictionary and author.at("name", default: "") != "" {
      author.name
    } else {
      "Dr. Hugo José Sánchez"
    }

    align(left)[
      #block(width: 220pt, breakable: false)[
        #text(size: 8.5pt, weight: "bold")[#sig-role]\
        #v(2pt)
        #text(size: 8.5pt)[#sig-name]\
        #v(1.2cm)
        #line(length: 100%, stroke: 0.5pt + luma(120))\
        #v(2pt)
        #text(size: 7.5pt, fill: luma(90))[Firma]
      ]
    ]
  }
}
