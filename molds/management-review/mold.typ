#import "../common/template.typ": doc-template, status-tag, rag-tag, callout, reference-docs, signature-block

#let mold(data: (:), body: none) = {
  let title = data.at("title", default: "Acta de Revisión por la Dirección del SGPI")
  let code = data.at("code", default: "G4-ACT-REV-01")
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
    = Datos de la Sesión y Asistencia
    #let sess = data.at("session_data", default: (:))
    #if "date_time" in sess [ - *Fecha y Hora:* #sess.date_time \ ]
    #if "place" in sess [ - *Lugar:* #sess.place \ ]
    #if "presides" in sess [ - *Preside:* #sess.presides \ ]
    #if "attendees" in sess [
      - *Miembros Asistentes:*
      #for (idx, att) in sess.attendees.enumerate() [
        \ #h(1em) #(idx + 1). #att
      ]
    ]

    = Revisión de Entradas de la Dirección (Cláusula 9.3.2)
    #data.at("inputs_intro", default: "")
    #let inputs = data.at("review_inputs", default: ())
    #for (idx, inp) in inputs.enumerate() [
      #text(weight: "bold")[#(idx + 1). #inp.at("title"): ] #inp.at("content") \
    ]

    = Decisiones y Salidas de la Revisión por la Dirección (Cláusula 9.3.3)
    #data.at("outputs_intro", default: "")
    #let decisions = data.at("decisions", default: ())
    #for (idx, dec) in decisions.enumerate() [
      #text(weight: "bold")[#(idx + 1). #dec.at("title"): ] #dec.at("content") \
    ]

    #v(0.2cm)
    #data.at("closing_text", default: "")

    #if body != none { body }
  ]
}
