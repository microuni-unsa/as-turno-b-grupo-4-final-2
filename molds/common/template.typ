// Template institucional para los moldes Typst 0.15 del SGPI UNSA - Turno B Grupo 4
// Cumple con el contrato de 15 elementos, ISO/IEC 27701:2025 y el formato del instructor
// Actualizado con las 6 correcciones de estandarización visual y tipografía Carlito 11pt (Word 1.15)

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
    #v(1.4cm)
    #line(length: 100%, stroke: 0.5pt + luma(120))
  ]
}

#let doc-template(
  title: "",
  short-title: none,
  code: "",
  version: "",
  date: "",
  confidentiality: "Confidencial",
  author: (:),
  reviewer: (:),
  approver: (:),
  history: (),
  validity: none,
  references: (),
  owner-role: none,
  show-signature: true,
  ..sink,
  body
) = {
  let doc-display-name = if short-title != none and short-title != "" { short-title } else { title }

  set page(
    paper: "a4",
    margin: (top: 3cm, bottom: 2.5cm, left: 2.5cm, right: 2.5cm),
    header: context {
      if counter(page).get().first() > 1 {
        grid(
          columns: (1fr, auto),
          align: (left + bottom, right + bottom),
          text(weight: "bold", size: 8pt, fill: rgb("#0a2540"))[UNIVERSIDAD NACIONAL DE SAN AGUSTÍN DE AREQUIPA],
          text(fill: rgb("#b30000"), size: 7.5pt, weight: "bold")[#confidentiality]
        )
        v(1pt)
        line(length: 100%, stroke: 0.5pt + luma(180))
      }
    },
    footer: context {
      if counter(page).get().first() > 1 {
        line(length: 100%, stroke: 0.5pt + luma(180))
        v(2pt)
        grid(
          columns: (1fr, auto, 1fr),
          align: (left + bottom, center + bottom, right + bottom),
          text(size: 7.5pt, fill: luma(100))[#doc-display-name],
          text(size: 7.5pt, fill: luma(100))[ver. #version del #date],
          text(size: 7.5pt, fill: luma(100))[Página #counter(page).display("1 de 1", both: true)]
        )
      }
    }
  )

  set text(font: "Carlito", size: 11pt, lang: "es")
  // 1.15 interlineado con fuente Carlito: 0.5084em leading produce exactamente 12.65pt baseline skip (1.15 * 11pt)
  set par(justify: true, leading: 0.5084em)
  set heading(numbering: "1.1.")
  show heading: set block(above: 1.2em, below: 0.7em)
  set list(spacing: 0.65em)
  set enum(spacing: 0.65em)

  // ==========================================
  // PÁGINA 1: PORTADA / CARÁTULA INSTITUCIONAL
  // ==========================================
  align(center)[
    #v(0.5cm)
    #image("logo-unsa.png", width: 3.5cm)
    #v(0.8cm)
    #text(size: 13pt, weight: "bold", fill: rgb("#0a2540"))[UNIVERSIDAD NACIONAL DE SAN AGUSTÍN DE AREQUIPA]\
    #v(0.6cm)
    #text(size: 16pt, weight: "bold", fill: rgb("#0a2540"))[#title]
    #v(1.0cm)
  ]

  table(
    columns: (135pt, 1fr),
    stroke: 0.5pt + luma(180),
    fill: (col, row) => if col == 0 { rgb("#f1f5f9") } else { none },
    inset: (x: 8pt, y: 5pt),
    align: (left, left),
    [*Código:*], [#code],
    [*Versión:*], [#version],
    [*Fecha de la versión:*], [#date],
    [*Creado por:*], [#format-person(author)],
    [*Aprobado por:*], [#format-person(approver)],
    [*Nivel de confidencialidad:*], [#confidentiality],
  )

  pagebreak()

  // ==========================================
  // PÁGINA 2: HISTORIAL Y TABLA DE CONTENIDOS
  // ==========================================
  text(weight: "bold", size: 9pt, fill: rgb("#0a2540"))[Historial de Revisiones del Documento:]
  v(3pt)
  table(
    columns: (65pt, 45pt, 115pt, 1fr),
    fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
    stroke: 0.5pt + luma(190),
    align: (center, center, left, left),
    table.header([*Fecha*], [*Versión*], [*Creado por*], [*Descripción de los cambios*]),
    ..history.map(row => (
      text(size: 8pt)[#row.at("date", default: "")],
      text(size: 8pt, weight: "bold")[#row.at("version", default: "")],
      text(size: 8pt)[#row.at("author", default: "")],
      text(size: 8pt)[#row.at("summary", default: "")]
    )).flatten()
  )

  v(0.4cm)
  outline(title: "Índice de Contenidos", indent: 1.2em)
  pagebreak()

  // ==========================================
  // SECCIÓN OPCIONAL: DOCUMENTOS DE REFERENCIA
  // ==========================================
  if references != none and references != () and references.len() > 0 {
    heading(level: 1)[Documentos de referencia]
    for ref-item in references [
      - #ref-item
    ]
    v(0.3cm)
  }

  // ==========================================
  // CUERPO DEL DOCUMENTO
  // ==========================================
  body

  // ==========================================
  // SECCIÓN OPCIONAL: VALIDEZ Y GESTIÓN
  // ==========================================
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

  // ==========================================
  // BLOQUE DE FIRMA INSTITUCIONAL AL CIERRE
  // ==========================================
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
        #v(1.4cm)
        #line(length: 100%, stroke: 0.5pt + luma(120))
      ]
    ]
  }
}
