#import "../common/template.typ": doc-template, status-tag, rag-tag, callout, reference-docs, signature-block

#let mold(data: (:), body: none) = {
  let title = data.at("title", default: "Programa Anual de Auditorías Internas del SGPI")
  let code = data.at("code", default: "G4-PRG-AUD-01")
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
    = Propósito y Fundamento Normativo
    #data.at("purpose", default: "")

    = Objetivos del Programa de Auditoría
    #let objectives = data.at("objectives", default: ())
    #for (idx, obj) in objectives.enumerate() [
      #(idx + 1). #obj \
    ]

    = Alcance y Criterios de Auditoría
    #data.at("scope_and_criteria", default: "")

    = Cronograma y Asignación de Recursos
    #v(3pt)
    #table(
      columns: (40pt, 85pt, 1fr, 75pt, 65pt, 55pt),
      fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
      stroke: 0.5pt + luma(190),
      align: (center, left, left, left, center, center),
      table.header([*Ciclo*], [*Proceso / Sede*], [*Cláusulas y Controles Foco*], [*Equipo Auditor*], [*Mes / Fecha*], [*Estado*]),
      ..data.at("schedule", default: ()).map(row => (
        text(size: 8pt)[#row.at("cycle")],
        text(size: 8pt)[#row.at("process_site")],
        text(size: 7.5pt)[#row.at("clauses_controls")],
        text(size: 7.5pt)[#row.at("auditors")],
        text(size: 7.5pt)[#row.at("date")],
        status-tag(row.at("status", default: "VIGENTE"))
      )).flatten()
    )

    = Métodos de Auditoría y Reporte (ISO 19011:2026)
    #data.at("methods", default: "")

    #if body != none { body }
  ]
}
