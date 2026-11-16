#import "../common/template.typ": doc-template, status-tag, rag-tag, callout, reference-docs, signature-block

#let mold(data: (:), body: none) = {
  let title = data.at("title", default: "Tabla de Objetivos de Privacidad de la Información (SGPI)")
  let code = data.at("code", default: "G4-OBJ-01")
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

    = Alineamiento con la Política de Privacidad (Cláusula 5.2)
    #data.at("alignment", default: "")

    = Matriz de Objetivos de Privacidad y Plan de Acción
    #v(3pt)
    #table(
      columns: (35pt, 110pt, 85pt, 70pt, 80pt, 50pt, 45pt),
      fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
      stroke: 0.5pt + luma(190),
      align: (center, left, left, left, left, center, center),
      table.header([*N°*], [*Objetivo de Privacidad*], [*Indicador / Meta (KPI)*], [*Qué se Hará / Recursos*], [*Responsable*], [*Plazo*], [*Estado*]),
      ..data.at("objectives", default: ()).map(obj => (
        text(size: 8pt)[#obj.at("id")],
        text(size: 8pt)[#obj.at("objective")],
        text(size: 7.5pt)[#obj.at("kpi")],
        text(size: 7.5pt)[#obj.at("action")],
        text(size: 7.5pt)[#obj.at("responsible")],
        text(size: 7.5pt)[#obj.at("term")],
        status-tag(obj.at("status", default: "VIGENTE"))
      )).flatten()
    )

    = Mecanismo de Seguimiento y Evaluación de Resultados (Cláusula 9.1)
    #data.at("monitoring", default: "")

    #if body != none { body }
  ]
}
