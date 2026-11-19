// mold-rep.typ — Molde parametrizado para el Informe de Auditoría Interna del SGPI
// Artefacto: G4-REP-AUD-01 (v1.0, v2.0, v3.0)
// Norma de referencia: ISO/IEC 27701:2025 Cláusula 9.2.2 e ISO 19011:2026
// Gramática del instructor: Objetivo/alcance/usuarios -> Documentos de referencia -> Secciones sustantivas -> Gestión de registros -> Validez y gestión -> Bloque de firma
// ZERO datos de instancia en este archivo.

#import "../common/template.typ": doc-template

#let mold(data: (:), body: none) = {
  let title = data.at("title", default: "Informe de Auditoría Interna del SGPI")
  let short-title = data.at("short-title", default: data.at("short_title", default: none))
  let code = data.at("code", default: "G4-REP-AUD-01")
  let version = data.at("version", default: "1.0")
  let date = data.at("date", default: "")
  let confidentiality = data.at("confidentiality", default: "CONFIDENCIAL - USO INTERNO UNSA")
  let author = data.at("author", default: (:))
  let reviewer = data.at("reviewer", default: (:))
  let approver = data.at("approver", default: (:))
  let history = data.at("history", default: ())
  let references = data.at("references", default: (
    "Norma ISO/IEC 27701:2025, Cláusula 9.2 (Auditoría interna).",
    "Norma ISO 19011:2026 (Directrices para la auditoría de los sistemas de gestión).",
    "Programa Anual de Auditorías Internas del SGPI (G4-PRG-AUD-01).",
    "Procedimiento de No Conformidades y Acciones Correctivas (G4-PRC-CAPA-01).",
  ))
  let validity = data.at("validity", default: "2026-10-28")
  let owner-role = data.at("owner-role", default: "Auditor Líder del SGPI / OSI")

  let objective-text = data.at("objective_text", default: [
    El objetivo de este informe es documentar fehacientemente los resultados, hallazgos, evidencias objetivas y conclusiones derivados de la ejecución de la auditoría interna del SGPI en la Universidad Nacional de San Agustín de Arequipa (UNSA), de conformidad con la Cláusula 9.2.2 de ISO/IEC 27701:2025 y las directrices de ISO 19011:2026.
  ])

  let scope-text = data.at("scope_text", default: [
    La auditoría evaluó los procesos de Admisión de Pregrado y Planilla de Remuneraciones, la infraestructura de DUTIC y los controles de privacidad y seguridad física y lógica en las sedes y filiales de la UNSA contempladas en el alcance de la versión.
  ])

  let users-text = data.at("users_text", default: [
    Dirigido al Rectorado, Comité de Gobierno Digital y Privacidad, Oficial de Seguridad de la Información (OSI / DPO), líderes de los procesos auditados, y a los auditores externos de certificación.
  ])

  let records-data = data.at("records_management", default: (
    (
      name: "Informe Final de Auditoría Interna Firmado",
      location: "Bóveda digital PIMS institucional y archivo de Secretaría Técnica",
      responsible: "Auditor Líder del SGPI",
      controls: "Firma digital calificada y archivo inmutable con hash SHA-256.",
      retention: "5 años"
    ),
    (
      name: "Cédulas de Hallazgos y Evidencias de Auditoría",
      location: "Repositorio digital PIMS / Módulo Auditorías",
      responsible: "Auditor Líder / Equipo Auditor",
      controls: "Acceso restringido RBAC y respaldo cifrado AES-256.",
      retention: "5 años"
    ),
    (
      name: "Planes de Acción Correctiva Vinculados (CAPA)",
      location: "Módulo CAPA PIMS (G4-REG-CAPA-01)",
      responsible: "Oficial de Seguridad de la Información (OSI / DPO)",
      controls: "Trazabilidad de cierre y validación de eficacia.",
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

    = Datos Generales de la Auditoría
    #let gen = data.at("general_data", default: (:))
    #if "audit_code" in gen [ - *Código de Auditoría:* #gen.audit_code \ ]
    #if "normative_ref" in gen [ - *Norma de Referencia:* #gen.normative_ref \ ]
    #if "execution_dates" in gen [ - *Fechas de Ejecución:* #gen.execution_dates \ ]
    #if "audit_team" in gen [ - *Equipo Auditor:* #gen.audit_team \ ]
    #if "audited_areas" in gen [ - *Áreas Auditadas:* #gen.audited_areas \ ]

    = Resumen Ejecutivo de la Evaluación
    #data.at("executive_summary", default: "")

    = Cuadro Resumen de Hallazgos y Evidencias
    #v(3pt)
    #table(
      columns: (70pt, 80pt, 1fr, 80pt, 70pt),
      fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
      stroke: 0.5pt + luma(190),
      align: (center, left, left, center, center),
      table.header([*Hallazgo*], [*Tipo*], [*Descripción del Hallazgo y Evidencia*], [*Proceso / Sede*], [*Estado CAPA*]),
      ..data.at("findings", default: ()).map(row => (
        [#row.at("id")],
        [*#row.at("tag", default: "VERDE")*],
        [#row.at("description")],
        [#row.at("process_site")],
        [#row.at("capa_status")]
      )).flatten()
    )

    = Conclusión y Dictamen del Auditor Líder
    #data.at("conclusion", default: "")

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
