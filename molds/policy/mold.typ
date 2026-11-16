#import "../common/template.typ": status-tag, rag-tag, callout

#let mold(data: (:), body: none) = {
  let org-name = data.at("org_name", default: "")
  let org-subtitle = data.at("org_subtitle", default: "SISTEMA DE GESTIÓN DE PRIVACIDAD DE LA INFORMACIÓN (SGPI - ISO/IEC 27701:2025)")
  let code = data.at("code", default: "G4-POL-01")
  let version = data.at("version", default: "3.0")
  let date = data.at("date", default: "")
  let confidentiality = data.at("confidentiality", default: "CONFIDENCIAL - USO INTERNO")
  let footer-note = data.at("footer_note", default: "Política Institucional Oficial | Aprobada por Resolución Rectoral")
  let author = data.at("author", default: (:))
  let reviewer = data.at("reviewer", default: (:))
  let approver = data.at("approver", default: (:))
  let title = data.at("title", default: "POLÍTICA DE PRIVACIDAD DE LA INFORMACIÓN")

  set page(
    paper: "a4",
    margin: (top: 2.2cm, bottom: 2cm, left: 2.2cm, right: 2.2cm),
    header: [
      #grid(
        columns: (1fr, auto),
        align(left)[
          #text(weight: "bold", size: 8pt, fill: rgb("#0a2540"))[#org-name]\
          #text(fill: luma(80), size: 7pt)[#org-subtitle]
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
          #text(size: 7pt, fill: luma(100))[#code | #footer-note]
        ],
        align(right)[
          #text(size: 7pt, fill: luma(100))[Página #counter(page).display("1 de 1", both: true)]
        ]
      )
    ]
  )

  set text(font: "Liberation Sans", size: 8.8pt, lang: "es")
  set par(justify: true, leading: 0.55em)

  v(-0.2cm)
  align(center)[
    #text(size: 13pt, weight: "bold", fill: rgb("#0a2540"))[#title]\
    #v(2pt)
    #text(size: 8.5pt, weight: "medium", fill: luma(90))[
      Código: #text(weight: "bold")[#code] | Versión: #text(weight: "bold")[#version] | Fecha de Aprobación: #text(weight: "bold")[#date]
    ]
  ]
  v(0.1cm)

  [= Declaración de Compromiso de la Alta Dirección (Cláusula 5.2)]
  data.at("commitment_statement", default: "")

  [= Principios Rectores de Protección de Datos]
  let principles = data.at("principles", default: ())
  for (idx, p) in principles.enumerate() [
    #text(weight: "bold")[#(idx + 1). #p.at("title"): ] #p.at("description") \
  ]

  [= Compromisos de la Dirección]
  let commitments = data.at("commitments", default: ())
  for c in commitments [
    - #c
  ]

  v(0.15cm)
  block(width: 100%, stroke: 0.5pt + luma(180), radius: 3pt, inset: 6pt)[
    #grid(
      columns: (1fr, 1fr, 1fr),
      gutter: 8pt,
      [
        #text(size: 7.5pt, weight: "bold")[Elaborado por:]\
        #text(size: 7.5pt)[#author.at("name", default: "")]\
        #text(size: 6.5pt, fill: luma(90))[#author.at("role", default: "")]\
        #text(size: 6.5pt, fill: luma(90))[Fecha: #author.at("date", default: "")]
      ],
      [
        #text(size: 7.5pt, weight: "bold")[Revisado por:]\
        #text(size: 7.5pt)[#reviewer.at("name", default: "")]\
        #text(size: 6.5pt, fill: luma(90))[#reviewer.at("role", default: "")]\
        #text(size: 6.5pt, fill: luma(90))[Fecha: #reviewer.at("date", default: "")]
      ],
      [
        #text(size: 7.5pt, weight: "bold")[Aprobado por:]\
        #text(size: 7.5pt)[#approver.at("name", default: "")]\
        #text(size: 6.5pt, fill: luma(90))[#approver.at("role", default: "")]\
        #text(size: 6.5pt, fill: luma(90))[Fecha: #approver.at("date", default: "")]
      ]
    )
  ]

  if body != none { body }
}
