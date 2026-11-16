#import "../common/template.typ": doc-template, status-tag, rag-tag, callout, reference-docs, signature-block

#let mold(data: (:), body: none) = {
  let title = data.at("title", default: "Informe de Auditoría Interna del SGPI")
  let code = data.at("code", default: "G4-REP-AUD-01")
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
    = Datos Generales de la Auditoría
    #let gen = data.at("general_data", default: (:))
    #if "audit_code" in gen [ - *Código de Auditoría:* `#gen.audit_code` \ ]
    #if "normative_ref" in gen [ - *Norma de Referencia:* #gen.normative_ref \ ]
    #if "execution_dates" in gen [ - *Fechas de Ejecución:* #gen.execution_dates \ ]
    #if "audit_team" in gen [ - *Equipo Auditor:* #gen.audit_team \ ]
    #if "audited_areas" in gen [ - *Áreas Auditadas:* #gen.audited_areas \ ]

    = Resumen Ejecutivo
    #data.at("executive_summary", default: "")

    = Cuadro Resumen de Hallazgos
    #v(3pt)
    #table(
      columns: (70pt, 80pt, 1fr, 80pt, 70pt),
      fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
      stroke: 0.5pt + luma(190),
      align: (center, left, left, center, center),
      table.header([*Hallazgo*], [*Tipo*], [*Descripción del Hallazgo y Evidencia*], [*Proceso / Sede*], [*Estado CAPA*]),
      ..data.at("findings", default: ()).map(row => (
        text(size: 8pt)[#row.at("id")],
        rag-tag(row.at("tag", default: "VERDE")),
        text(size: 7.5pt)[#row.at("description")],
        text(size: 7.5pt)[#row.at("process_site")],
        text(size: 7.5pt)[#row.at("capa_status")]
      )).flatten()
    )

    = Conclusión y Dictamen del Auditor Líder
    #data.at("conclusion", default: "")

    #if body != none { body }
  ]
}
