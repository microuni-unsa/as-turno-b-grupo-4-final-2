// Template institucional para los moldes Typst 0.15 del SGPI UNSA - Turno B Grupo 4
// Cumple con el contrato de 15 elementos, ISO/IEC 27701:2025 y el formato del instructor
// Actualizado con las 6 correcciones de estandarización visual y tipografía Carlito 11pt (Word 1.15)

#let default-confidentiality = "Confidencial"
#let default-approver-role = "Rector - Presidente del Comité SGPI"
#let default-approver-name = "Dr. Hugo José Sánchez"
#let default-owner-role = "Oficial de Seguridad de la Información (OSI / DPO)"

#let non-empty-str(val) = val != none and val != "" and val != []

#let format-person(p) = {
  if type(p) == dictionary {
    let n = p.at("name", default: "")
    let r = p.at("role", default: "")
    let has-n = non-empty-str(n)
    let has-r = non-empty-str(r)
    if has-n and has-r [ #n (#r) ] else if has-n [ #n ] else if has-r [ #r ] else []
  } else if non-empty-str(p) {
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
  let display-role = if non-empty-str(role) { role } else { default-approver-role }
  let display-name = if non-empty-str(name) { name } else { default-approver-name }
  block(width: 220pt, breakable: false)[
    #text(weight: "bold")[#display-role]\
    #v(2pt)
    #text()[#display-name]\
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
  confidentiality: default-confidentiality,
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
    margin: (top: 2.2cm, bottom: 2.2cm, left: 2.5cm, right: 2.5cm),
    header: context {
      if counter(page).get().first() > 1 {
        set par(leading: 0.3em, spacing: 0.5em)
        set block(above: 0pt, below: 0pt)
        grid(
          columns: (1fr, auto),
          align: (left + bottom, right + bottom),
          text(weight: "bold", fill: rgb("#0a2540"))[UNIVERSIDAD NACIONAL DE SAN AGUSTÍN DE AREQUIPA],
          text(fill: rgb("#b30000"), weight: "bold")[#confidentiality]
        )
        v(2.5pt)
        line(length: 100%, stroke: 0.5pt + luma(180))
      }
    },
    footer: context {
      if counter(page).get().first() > 1 {
        set par(leading: 0.3em, spacing: 0.5em)
        set block(above: 0pt, below: 0pt)
        line(length: 100%, stroke: 0.5pt + luma(180))
        v(2.5pt)
        grid(
          columns: (1fr, 150pt, 100pt),
          align: (left + bottom, center + bottom, right + bottom),
          box(width: 100%, clip: true)[#text(fill: luma(100))[#doc-display-name]],
          text(fill: luma(100))[ver. #version del #date],
          text(fill: luma(100))[Página #counter(page).display("1 de 1", both: true)]
        )
      }
    }
  )

  set text(font: "Carlito", size: 11pt, lang: "es")
  // 1.5x espaciado vertical: pitch = 7.06 + 11×leading ≈ 19.0pt (1.5× P1), 1.8em par spacing
  set par(justify: true, leading: 1.085em, spacing: 1.8em)
  set heading(numbering: "1.1.")
  show heading: set block(above: 1.8em, below: 1.05em)
  set list(spacing: 0.975em)
  set enum(spacing: 0.975em)
  show list: set block(above: 0.5em, below: 0.5em)
  show enum: set block(above: 0.5em, below: 0.5em)

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

  let has-reviewer = (
    type(reviewer) == dictionary
      and (non-empty-str(reviewer.at("name", default: "")) or non-empty-str(reviewer.at("role", default: "")))
  ) or (type(reviewer) == str and reviewer != "") or (type(reviewer) == content and reviewer != [])

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
    ..if has-reviewer { ([*Revisado por:*], [#format-person(reviewer)]) } else { () },
    [*Aprobado por:*], [#format-person(approver)],
    [*Nivel de confidencialidad:*], [#confidentiality],
  )

  pagebreak()

  // ==========================================
  // PÁGINA 2: HISTORIAL Y TABLA DE CONTENIDOS
  // ==========================================
  text(weight: "bold", fill: rgb("#0a2540"))[Historial de Revisiones del Documento:]
  v(3pt)
  table(
    columns: (65pt, 45pt, 115pt, 1fr),
    fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
    stroke: 0.5pt + luma(190),
    align: (center, center, left, left),
    table.header([*Fecha*], [*Versión*], [*Creado por*], [*Descripción de los cambios*]),
    ..history.map(row => (
      [#row.at("date", default: "")],
      text(weight: "bold")[#row.at("version", default: "")],
      [#row.at("author", default: "")],
      [#row.at("summary", default: "")]
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
  }

  // ==========================================
  // CUERPO DEL DOCUMENTO
  // ==========================================
  body

  // ==========================================
  // SECCIÓN OPCIONAL: VALIDEZ Y GESTIÓN
  // ==========================================
  if validity != none or owner-role != none {
    heading(level: 1)[Validez y gestión de documentos]
    let val-date = if validity != none and validity != "" { validity } else { date }
    let val-owner = if non-empty-str(owner-role) {
      owner-role
    } else if type(author) == dictionary and non-empty-str(author.at("role", default: "")) {
      author.role
    } else {
      default-owner-role
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
    let has-approver = type(approver) == dictionary and non-empty-str(approver.at("name", default: ""))
    let has-author = type(author) == dictionary and non-empty-str(author.at("name", default: ""))
    let (sig-role, sig-name) = if has-approver {
      let r = if non-empty-str(approver.at("role", default: "")) {
        approver.role
      } else {
        default-approver-role
      }
      (r, approver.name)
    } else if has-author {
      let r = if non-empty-str(author.at("role", default: "")) {
        author.role
      } else if non-empty-str(owner-role) {
        owner-role
      } else {
        default-owner-role
      }
      (r, author.name)
    } else {
      (default-approver-role, default-approver-name)
    }

    align(left)[
      #signature-block(role: sig-role, name: sig-name)
    ]
  }
}
