#import "../common/template.typ": doc-template, status-tag, rag-tag, callout, reference-docs, signature-block

#let mold(data: (:), body: none) = {
  let title = data.at("title", default: "Procedimiento de Respuesta a Incidentes de Privacidad")
  let code = data.at("code", default: "G4-PRC-INC-01")
  let version = data.at("version", default: "")
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
    = Objetivo, Alcance y Usuarios

    == Objetivo
    #data.at("objective", default: "")

    == Alcance Institucional
    #data.at("scope", default: "")

    == Usuarios y Destinatarios del Documento
    #data.at("users", default: "")

    = Base Normativa y Criterio Institucional de Notificación
    #data.at("normative_basis", default: "")

    #callout(title: data.at("notification_callout_title", default: "CRITERIO DE NOTIFICACIÓN ORGANIZACIONAL (GUÍA B.3.12)"), color: rgb("#0284c7"))[
      #data.at("notification_callout_body", default: "")
    ]

    = Estructura Organizativa y Responsabilidades ante Incidentes
    #v(3pt)
    #table(
      columns: (130pt, 1fr),
      fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
      stroke: 0.5pt + luma(190),
      align: (left, left),
      table.header([*Instancia / Rol*], [*Competencias y Responsabilidades*]),
      ..data.at("roles", default: ()).map(r => (
        text(size: 8pt, weight: "bold")[#r.at("role")],
        text(size: 7.5pt)[#r.at("responsibility")]
      )).flatten()
    )

    = Ciclo de Vida y Fases Operativas de Respuesta a Incidentes

    == Fase 1: Detección, Reporte y Registro Inicial
    #data.at("phase_detection", default: "")

    == Fase 2: Triage, Categorías y Escala de Severidad
    #data.at("phase_triage_intro", default: "")
    #v(3pt)
    #table(
      columns: (65pt, 100pt, 1fr, 65pt),
      fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
      stroke: 0.5pt + luma(190),
      align: (center, left, left, center),
      table.header([*Nivel*], [*Criterio de Impacto*], [*Escenario Típico*], [*SLA Contención*]),
      ..data.at("severity_scale", default: ()).map(row => (
        rag-tag(row.at("level")),
        text(size: 7.5pt)[#row.at("impact_criterion")],
        text(size: 7.5pt)[#row.at("typical_scenario")],
        text(size: 7.5pt, weight: "bold")[#row.at("sla")]
      )).flatten()
    )

    == Fase 3: Contención Inmediata y Preservación Forense
    #data.at("phase_containment", default: "")

    == Fase 4: Evaluación de Impacto y Criterios de Notificación (Guía B.3.12)
    #data.at("phase_evaluation_notification", default: "")

    == Fase 5: Erradicación y Recuperación Segura
    #data.at("phase_eradication", default: "")

    == Fase 6: Cierre del Incidente y Mejora Continua (Cláusula 10.2)
    #data.at("phase_closure_capa", default: "")

    = Gestión de Registros Guardados en Base a este Documento
    #v(3pt)
    #table(
      columns: (110pt, 1fr, 80pt, 80pt),
      fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
      stroke: 0.5pt + luma(190),
      align: (left, left, left, left),
      table.header([*Nombre del Registro*], [*Custodio / Responsable*], [*Medio y Ubicación*], [*Tiempo de Retención*]),
      ..data.at("records_management", default: ()).map(row => (
        text(size: 7.5pt, weight: "bold")[#row.at("name")],
        text(size: 7.5pt)[#row.at("custodian")],
        text(size: 7.5pt)[#row.at("location")],
        text(size: 7.5pt)[#row.at("retention")]
      )).flatten()
    )

    #if body != none { body }
  ]
}
