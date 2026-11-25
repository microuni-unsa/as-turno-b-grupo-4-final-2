// mold.typ — Molde universal para adaptación de documentos arbitrarios o multi-equipo
// Permite generar versiones institucionales G4- a partir de cualquier PDF de PIMS
// (Word, Google Docs, LaTeX u otros equipos) cuya estructura no encaje en los 13 moldes específicos.
// ZERO datos de instancia institucional en este archivo.
//
// Uso típico:
//   #import "mold.typ": mold
//   #mold(data: (
//     title: "...",
//     short-title: "...",
//     code: "G4-XXX-01",
//     version: "2.0",
//     date: "2026-11-25",
//     confidentiality: "Confidencial",
//     author: (name: "...", role: "..."),
//     reviewer: (name: "...", role: "..."),
//     approver: (name: "...", role: "..."),
//     history: ((date: "...", version: "2.0", author: "...", summary: "..."),),
//     references: ("...",),
//     validity: "2027-11-25",
//     owner-role: "...",
//     show-signature: true,
//     sections: (
//       (
//         heading: "Objetivo y alcance",
//         content: [Texto en bloques Typst. Contacto: csirt\@unsa.edu.pe],
//         subsections: (
//           (heading: "Subsección", content: [Detalle o #table(...)]),
//         ),
//       ),
//     ),
//   ))[
//     // Opcional: contenido directo en cuerpo (p. ej. secciones adicionales o #page(flipped: true)[#table(...)])
//   ]
//
// NOTA IMPORTANTE SOBRE `@`: Dentro de bloques de contenido `[...]` en Typst, `@` inicia una referencia/cita.
// Toda dirección de correo o arroba literal DEBE escaparse como `\@` (ej. `csirt\@unsa.edu.pe`).

#import "../common/template.typ": doc-template, default-confidentiality, non-empty-str

#let render-section(sec, level: 1) = {
  assert(type(sec) == dictionary, message: "Cada elemento de `sections` debe ser un diccionario.")

  let sec-heading = sec.at("heading", default: none)
  let sec-content = sec.at("content", default: none)
  let sub-sections = sec.at("subsections", default: ())
  let is-landscape = sec.at("landscape", default: false)
  assert(type(is-landscape) == bool, message: "El campo `landscape` de una sección debe ser booleano.")

  let parts = ()
  if non-empty-str(sec-heading) {
    parts.push(heading(level: level)[#sec-heading])
  }
  if sec-content != none {
    parts.push([#sec-content])
  }
  if sub-sections != none {
    assert(type(sub-sections) == array, message: "El campo `subsections` debe ser un arreglo.")
    for sub in sub-sections {
      parts.push(render-section(sub, level: level + 1))
    }
  }

  let rendered = if parts.len() > 0 { parts.join() } else { [] }
  if is-landscape {
    page(flipped: true)[#rendered]
  } else {
    rendered
  }
}

#let mold(data: (:), ..args) = {
  assert(type(data) == dictionary, message: "El parámetro `data` debe ser un diccionario.")
  let pos-args = args.pos()
  let named-args = args.named()
  assert(pos-args.len() <= 1, message: "Como máximo se admite un bloque posicional `body`.")
  for k in named-args.keys() {
    assert(k == "body", message: "Parámetro nombrado no soportado en `mold`: " + k)
  }
  assert(
    not (pos-args.len() == 1 and "body" in named-args),
    message: "No pase `body` de forma posicional y nombrada simultáneamente."
  )
  let body = if pos-args.len() == 1 {
    pos-args.at(0)
  } else {
    named-args.at("body", default: none)
  }

  let title = data.at("title", default: "")
  let short-title = data.at("short-title", default: data.at("short_title", default: none))
  let code = data.at("code", default: "")
  let version = data.at("version", default: "")
  let date = data.at("date", default: "")
  let raw-conf = data.at("confidentiality", default: default-confidentiality)
  let confidentiality = if non-empty-str(raw-conf) { raw-conf } else { default-confidentiality }
  let author = data.at("author", default: (:))
  let reviewer = data.at("reviewer", default: (:))
  let approver = data.at("approver", default: (:))
  let history = data.at("history", default: ())
  let references = data.at("references", default: ())
  let raw-validity = data.at("validity", default: none)
  let validity = if non-empty-str(raw-validity) { raw-validity } else { none }
  let raw-owner-role = data.at("owner-role", default: data.at("owner_role", default: none))
  let owner-role = if non-empty-str(raw-owner-role) { raw-owner-role } else { none }
  let show-signature = data.at("show-signature", default: data.at("show_signature", default: true))
  let sections = data.at("sections", default: ())

  let rendered-sections = if sections != none {
    assert(type(sections) == array, message: "El campo `data.sections` debe ser un arreglo.")
    let items = ()
    for sec in sections {
      items.push(render-section(sec, level: 1))
    }
    if items.len() > 0 { items.join() } else { [] }
  } else {
    []
  }

  let combined-body = if body != none {
    rendered-sections + [#body]
  } else {
    rendered-sections
  }

  doc-template(
    title: title,
    short-title: short-title,
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
    show-signature: show-signature,
    combined-body,
  )
}
