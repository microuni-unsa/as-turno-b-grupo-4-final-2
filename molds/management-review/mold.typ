// mold.typ — Molde parametrizado para el Acta de Revisión por la Dirección del SGPI
// Artefacto: G4-ACT-REV-01 (v1.0, v2.0, v3.0)
// Norma de referencia: ISO/IEC 27701:2025 Cláusula 9.3 (Revisión por la dirección)
// Gramática del instructor: Objetivo/alcance/usuarios -> Documentos de referencia -> Secciones sustantivas -> Gestión de registros -> Validez y gestión -> Bloque de firma
// ZERO datos de instancia en este archivo.

#import "../common/template.typ": doc-template

#let mold(data: (:), body: none) = {
  let title = data.at("title", default: "Acta de Revisión por la Dirección del SGPI")
  let short-title = data.at("short-title", default: data.at("short_title", default: none))
  let code = data.at("code", default: "G4-ACT-REV-01")
  let version = data.at("version", default: "1.0")
  let date = data.at("date", default: "")
  let confidentiality = data.at("confidentiality", default: "CONFIDENCIAL - USO INTERNO UNSA")
  let author = data.at("author", default: (:))
  let reviewer = data.at("reviewer", default: (:))
  let approver = data.at("approver", default: (:))
  let history = data.at("history", default: ())
  let references = data.at("references", default: (
    "Norma ISO/IEC 27701:2025, Cláusula 9.3 (Revisión por la dirección: 9.3.1, 9.3.2 y 9.3.3).",
    "Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Política de Privacidad de la Información de la UNSA (G4-POL-01).",
    "Informe de Auditoría Interna del SGPI (G4-REP-AUD-01).",
    "Registro de Acciones Correctivas del SGPI (G4-REG-CAPA-01).",
  ))
  let validity = data.at("validity", default: "2026-10-28")
  let owner-role = data.at("owner-role", default: "Oficial de Seguridad de la Información (OSI / DPO)")

  let objective-text = data.at("objective_text", default: [
    El objetivo de este documento es formalizar y registrar la revisión periódica del Sistema de Gestión de Privacidad de la Información (SGPI) por parte de la Alta Dirección de la Universidad Nacional de San Agustín de Arequipa (UNSA), asegurando su conveniencia, adecuación y eficacia continuas de conformidad con la Cláusula 9.3 de la norma ISO/IEC 27701:2025.
  ])

  let scope-text = data.at("scope_text", default: [
    Abarca el análisis integral de todas las entradas normativas (desempeño de privacidad, auditorías, incidentes, riesgos y recursos) y la determinación de decisiones y salidas estratégicas para los procesos de Admisión de Pregrado y Planilla de Remuneraciones en las sedes de la UNSA.
  ])

  let users-text = data.at("users_text", default: [
    Dirigido al Rector de la UNSA, vicerrectores, Directora de DUTIC, directores de los procesos en alcance, Oficial de Seguridad / DPO y miembros del Comité de Gobierno Digital y Privacidad.
  ])

  let records-data = data.at("records_management", default: (
    (
      name: "Acta Oficial de Revisión por la Dirección Firmada",
      location: "Bóveda digital PIMS institucional y Secretaría General",
      responsible: "Secretario Técnico del SGPI / DPO",
      controls: "Firma digital calificada de todos los participantes y archivo inmutable.",
      retention: "Permanente"
    ),
    (
      name: "Lista de Asistencia y Matriz de Compromisos Directivos",
      location: "Repositorio digital PIMS / Módulo Dirección",
      responsible: "Secretaría Técnica del SGPI",
      controls: "Control de acceso por roles (RBAC) y bitácora de seguimiento.",
      retention: "5 años"
    ),
    (
      name: "Acuerdos Resolutivos de Asignación Presupuestal para el SGPI",
      location: "Dirección General de Administración (DGA) / PIMS",
      responsible: "Director General de Administración",
      controls: "Firma digital y registro presupuestal en el SIAF institucional.",
      retention: "5 años"
    )
  ))

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
    references: (),
    validity: validity,
    owner-role: owner-role,
    show-signature: true,
  )[
    = Objetivo, alcance y usuarios

    == Objetivo
    #objective-text

    == Alcance
    #scope-text

    == Usuarios
    #users-text

    = Documentos de referencia
    #for ref in references [
      - #ref
    ]

    = Datos de la Sesión y Asistencia
    #let sess = data.at("session_data", default: (:))
    #if "date_time" in sess [ - *Fecha y Hora:* #sess.date_time \ ]
    #if "place" in sess [ - *Lugar:* #sess.place \ ]
    #if "presides" in sess [ - *Preside:* #sess.presides \ ]
    #if "attendees" in sess [
      - *Miembros Asistentes:*
        #enum(..sess.attendees)
    ]

    = Revisión de Entradas de la Dirección (Cláusula 9.3.2)
    #data.at("inputs_intro", default: [
      En cumplimiento de la Cláusula 9.3.2 de la norma ISO/IEC 27701:2025, el Secretario Técnico expone los siguientes elementos de entrada obligatorios:
    ])
    #let inputs = data.at("review_inputs", default: ())
    #for (idx, inp) in inputs.enumerate() [
      #text(weight: "bold")[#(idx + 1). #inp.at("title"): ] #inp.at("content") \
    ]

    = Decisiones y Salidas de la Revisión por la Dirección (Cláusula 9.3.3)
    #data.at("outputs_intro", default: [
      Tras el análisis deliberativo de las entradas, el Comité de Gobierno Digital y Privacidad adoptó por unanimidad las siguientes decisiones y compromisos de salida:
    ])
    #let decisions = data.at("decisions", default: ())
    #for (idx, dec) in decisions.enumerate() [
      #text(weight: "bold")[#(idx + 1). #dec.at("title"): ] #dec.at("content") \
    ]

    #v(0.2cm)
    #data.at("closing_text", default: "")

    = Gestión de registros guardados en base a este documento
    #table(
      columns: (120pt, 100pt, 90pt, 1fr, 60pt),
      fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
      stroke: 0.5pt + luma(190),
      align: (left, left, left, left, center),
      table.header(
        [*Nombre del registro*],
        [*Ubicación de archivo*],
        [*Persona responsable del archivo*],
        [*Controles para la protección del registro*],
        [*Tiempo de retención*]
      ),
      ..records-data.map(row => (
        [*#row.at("name")*],
        [#row.at("location")],
        [#row.at("responsible")],
        [#row.at("controls")],
        [#row.at("retention")]
      )).flatten()
    )

    #if body != none { body }
  ]
}
