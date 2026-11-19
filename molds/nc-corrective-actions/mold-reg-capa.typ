// mold-reg-capa.typ — Molde parametrizado para Formulario de Medidas Correctivas (Registro)
// Cumple con ISO/IEC 27701:2025 Cláusula 10.2, Control A.3.16, y replica rigurosamente las 12 filas del
// formato oficial del instructor "Apéndice Formulario para medidas correctivas".
// CERO datos de instancia institucional en este archivo.

#import "../common/template.typ": doc-template

#let render-capa-12row-form(item) = {
  let is-yes = item.at("need-action", default: "SÍ") == "SÍ" or item.at("need-action", default: "SÍ") == "SI"
  let need-circle = if is-yes [
    #text(weight: "bold", fill: rgb("#166534"))[( X ) SÍ] #h(14pt) (   ) NO
  ] else [
    (   ) SÍ #h(14pt) #text(weight: "bold", fill: rgb("#991b1b"))[( X ) NO]
  ]

  let rag = item.at("rag-status", default: none)
  let status-badge = if rag != none { h(8pt) + [*#rag*] } else { [] }

  table(
    columns: (1.2fr, 1.2fr, 0.8fr),
    stroke: 0.5pt + luma(170),
    fill: (col, row) => if row == 0 { rgb("#f1f5f9") } else { none },
    inset: (x: 8pt, y: 5pt),
    align: (left, left, left),

    // Fila 1: Medida correctiva nro.____
    table.cell(colspan: 3)[
      *Medida correctiva nro. #item.at("capa-id", default: "_____")* #status-badge
    ],

    // Fila 2: Descripción de la no-conformidad:
    table.cell(colspan: 3)[
      *Descripción de la no-conformidad:*\
      #v(2pt)
      #item.at("description", default: "")
    ],

    // Fila 3: 3 columnas (No-conformidad identificada en | Nombre de la persona | Firma)
    [
      *No-conformidad identificada en:*\
      #v(2pt)
      #item.at("source", default: "")
    ],
    [
      *Nombre de la persona que identificó la no-conformidad:*\
      #v(2pt)
      #item.at("identified-by", default: "")
    ],
    [
      *Firma:*\
      #v(2pt)
      #text(fill: luma(90))[#item.at("identifier-signature", default: "Firma registrada en PIMS")]
    ],

    // Fila 4: Causa de la no-conformidad:
    table.cell(colspan: 3)[
      *Causa de la no-conformidad:*\
      #v(2pt)
      #item.at("root-cause", default: item.at("cause", default: ""))
    ],

    // Fila 5: Si ya existe una no conformidad similar, indique aquí su Medida correctiva Nro.:
    table.cell(colspan: 3)[
      *Si ya existe una no conformidad similar, indique aquí su Medida correctiva Nro.:*\
      #v(2pt)
      #item.at("similar-nc", default: "No registra")
    ],

    // Fila 6: ¿Es necesario tomar medidas correctivas? SÍ - NO (marcar con un círculo)
    table.cell(colspan: 3)[
      *¿Es necesario tomar medidas correctivas? SÍ - NO (marcar con un círculo)*\
      #v(3pt)
      #need-circle
    ],

    // Fila 7: Medida correctiva a implementar:
    table.cell(colspan: 3)[
      *Medida correctiva a implementar:*\
      #v(2pt)
      #item.at("action-plan", default: item.at("action", default: ""))
    ],

    // Fila 8: ¿Quién debe estar informado sobre la medida implementada?:
    table.cell(colspan: 3)[
      *¿Quién debe estar informado sobre la medida implementada?:*\
      #v(2pt)
      #item.at("informed-parties", default: "")
    ],

    // Fila 9: 3 columnas (Aprobado por | Fecha límite para la implementación | Persona responsable)
    [
      *Aprobado por:*\
      #v(2pt)
      #item.at("approved-by", default: "")
    ],
    [
      *Fecha límite para la implementación:*\
      #v(2pt)
      #item.at("deadline", default: "")
    ],
    [
      *Persona responsable de la implementación:*\
      #v(2pt)
      #item.at("responsible", default: item.at("owner", default: ""))
    ],

    // Fila 10: 2 columnas (Medida correctiva implementada el | Firma)
    table.cell(colspan: 2)[
      *Medida correctiva implementada el:* #item.at("implemented-date", default: "")
    ],
    [
      *Firma:*\
      #v(2pt)
      #text(fill: luma(90))[#item.at("implementer-signature", default: "Firma registrada en PIMS")]
    ],

    // Fila 11: 2 columnas (Efectividad de la medida implementada revisada el | Firma)
    table.cell(colspan: 2)[
      *Efectividad de la medida implementada revisada el:* #item.at("effectiveness-date", default: "")
      #(if item.at("effectiveness-notes", default: "") != "" [\
        #v(2pt)
        #text(style: "italic")[#item.at("effectiveness-notes")]
      ])
    ],
    [
      *Firma:*\
      #v(2pt)
      #text(fill: luma(90))[#item.at("reviewer-signature", default: "Firma registrada en PIMS")]
    ],

    // Fila 12: 2 columnas (Si es necesario realizar cambios al documento... | Firma)
    table.cell(colspan: 2)[
      *Si es necesario realizar cambios al documento, especifíquelos aquí:*\
      #v(2pt)
      #item.at("system-changes", default: "No requiere cambios.")
    ],
    [
      *Firma:*\
      #v(2pt)
      #text(fill: luma(90))[#item.at("custodian-signature", default: "Firma registrada en PIMS")]
    ]
  )
}

#let mold-reg-capa(
  metadata: (:),
  references: (),
  form-records: (),
  records: (),
  ..sink
) = {
  let all-records = if records.len() > 0 { records } else { form-records }

  show: doc-template.with(
    title: metadata.at("title", default: "Apéndice: Formulario para medidas correctivas"),
    short-title: metadata.at("short-title", default: none),
    code: metadata.at("code", default: "G4-REG-CAPA-01"),
    version: metadata.at("version", default: "3.0"),
    date: metadata.at("date", default: "2025-10-28"),
    confidentiality: metadata.at("confidentiality", default: "CONFIDENCIAL - USO INTERNO UNSA"),
    author: metadata.at("author", default: (name: "", role: "", date: "")),
    reviewer: metadata.at("reviewer", default: (name: "", role: "", date: "")),
    approver: metadata.at("approver", default: (name: "", role: "", date: "")),
    history: metadata.at("history", default: ()),
    validity: none,
    references: (),
    owner-role: none,
    show-signature: false,
  )

  [
    #for (idx, item) in all-records.enumerate() [
      #if idx > 0 {
        pagebreak()
      }
      #render-capa-12row-form(item)
    ]
  ]
}
