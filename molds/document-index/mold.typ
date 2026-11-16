#import "../common/template.typ": doc-template, status-tag, rag-tag, callout, reference-docs, signature-block

#let mold(data: (:), body: none) = {
  let title = data.at("title", default: "Mapa e Índice Maestro de Documentos (Auditor's Map)")
  let code = data.at("code", default: "G4-IDX-01")
  let version = data.at("version", default: "3.0")
  let date = data.at("date", default: "")
  let confidentiality = data.at("confidentiality", default: "CONFIDENCIAL - USO INTERNO UNSA")
  let author = data.at("author", default: (:))
  let reviewer = data.at("reviewer", default: (:))
  let approver = data.at("approver", default: (:))
  let history = data.at("history", default: ())
  let references = data.at("references", default: ())
  let validity = data.at("validity", default: none)
  let owner-role = data.at("owner-role", default: none)

  doc-template(
    title: title,
    code: code,
    version: version,
    date: date,
    confidentiality: confidentiality,
    author: author,
    reviewer: reviewer,
    approver: approver,
    history: history,
    references: references,
    validity: validity,
    owner-role: owner-role,
  )[
    = Propósito del Mapa de Auditoría
    #data.at("purpose", default: "")

    #if "callout_title" in data and "callout_body" in data [
      #callout(title: data.callout_title, color: rgb("#0284c7"))[
        #data.callout_body
      ]
    ]

    = Inventario Maestro de Documentos por Cláusula Normativa
    #v(3pt)
    #table(
      columns: (65pt, 65pt, 1fr, 35pt, 85pt, 50pt),
      fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
      stroke: 0.5pt + luma(190),
      align: (center, center, left, center, left, center),
      table.header([*Cláusula ISO*], [*Código*], [*Título del Documento Institucional*], [*Ver.*], [*Responsable / Custodio*], [*Estado PIMS*]),
      ..data.at("documents", default: ()).map(doc => (
        text(size: 7.5pt)[#doc.at("clause")],
        text(size: 8pt, weight: "bold")[#doc.at("code")],
        text(size: 7.5pt)[#doc.at("title")],
        text(size: 7.5pt)[#doc.at("version")],
        text(size: 7.5pt)[#doc.at("custodian")],
        status-tag(doc.at("status", default: "VIGENTE"))
      )).flatten()
    )

    = Trazabilidad con el Repositorio de la Verdad (PIMS GESTITEL)
    #data.at("truth_traceability", default: "")

    #if body != none { body }
  ]
}
