// mold-prg.typ — Molde parametrizado para el Programa Anual de Auditorías Internas del SGPI
// Artefacto: G4-PRG-AUD-01 (v1.0, v2.0, v3.0)
// Norma de referencia: ISO/IEC 27701:2025 Cláusula 9.2 (Auditoría interna) e ISO 19011:2026
// Gramática del instructor: Objetivo/alcance/usuarios -> Documentos de referencia -> Secciones sustantivas -> Gestión de registros -> Validez y gestión -> Bloque de firma
// ZERO datos de instancia en este archivo.
// Example caller (staging):
//   #import "mold-prg.typ": mold
//   #mold(data: (title: "...", code: "G4-XXX-01", version: "4.0", date: "...", history: (...), ...))
// NOTE: `data:` is a NAMED argument — positional `#mold((...))` fails to compile.

#import "../common/template.typ": doc-template, default-confidentiality

#let mold(data: (:), body: none) = {
  let title = data.at("title", default: "Programa Anual de Auditorías Internas del SGPI")
  let short-title = data.at("short-title", default: data.at("short_title", default: none))
  let code = data.at("code", default: "G4-PRG-AUD-01")
  let version = data.at("version", default: "1.0")
  let date = data.at("date", default: "")
  let confidentiality = data.at("confidentiality", default: default-confidentiality)
  let author = data.at("author", default: (:))
  let reviewer = data.at("reviewer", default: (:))
  let approver = data.at("approver", default: (:))
  let history = data.at("history", default: ())
  let references = data.at("references", default: (
    "Norma ISO/IEC 27701:2025, Cláusula 9.2 (Auditoría interna).",
    "Norma ISO 19011:2026 (Directrices para la auditoría de los sistemas de gestión).",
    "Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Política de Privacidad de la Información de la UNSA (G4-POL-01).",
    "Determinación del Alcance del SGPI (G4-ALC-01).",
  ))
  let validity = data.at("validity", default: "2026-10-28")
  let owner-role = data.at("owner-role", default: "Auditor Líder del SGPI / OSI")

  let objective-text = data.at("objective_text", default: [
    El objetivo de este documento es planificar, establecer, implementar y mantener uno o varios programas anuales de auditoría interna en la Universidad Nacional de San Agustín de Arequipa (UNSA), de conformidad con la Cláusula 9.2 de ISO/IEC 27701:2025 y las directrices de ISO 19011:2026.
  ])

  let scope-text = data.at("scope_text", default: [
    El programa de auditoría abarca la totalidad de los requisitos normativos aplicables (Cláusulas 4 a 10 y Controles del Anexo A) en los procesos misionales de Admisión de Pregrado y de soporte de Planilla de Remuneraciones en las sedes y filiales de la UNSA.
  ])

  let users-text = data.at("users_text", default: [
    Destinado al Comité de Gobierno Digital y Privacidad, Auditor Líder y equipo de auditores internos, Oficial de Seguridad de la Información (OSI / DPO), líderes y dueños de los procesos auditados, y la Dirección Universitaria de TIC (DUTIC).
  ])

  let records-data = data.at("records_management", default: (
    (
      name: "Programa Anual de Auditorías Internas Aprobado",
      location: "Repositorio digital PIMS y Secretaría Técnica SGPI",
      responsible: "Auditor Líder del SGPI",
      controls: "Firma digital calificada y bloqueo de modificaciones tras aprobación.",
      retention: "5 años"
    ),
    (
      name: "Planes Específicos de Auditoría por Ciclo",
      location: "Bóveda digital PIMS / Módulo Auditorías",
      responsible: "Auditor Líder del SGPI",
      controls: "Control de acceso RBAC y trazabilidad de revisiones.",
      retention: "5 años"
    ),
    (
      name: "Listas de Verificación y Papeles de Trabajo",
      location: "Servidor seguro DUTIC / SGPI-Audit-WorkingPapers",
      responsible: "Equipo de Auditores Internos",
      controls: "Cifrado en reposo AES-256 y firma electrónica de los auditores.",
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

    = Objetivos y Criterios del Programa de Auditoría
    #let objectives = data.at("objectives", default: ())
    #for (idx, obj) in objectives.enumerate() [
      #text(weight: "bold")[#(idx + 1). ] #obj \
    ]
    #v(0.2cm)
    #data.at("scope_and_criteria", default: "")

    #page(flipped: true)[
      = Cronograma y Asignación de Recursos de Auditoría
      #v(3pt)
      #table(
        columns: (50pt, 120pt, 1fr, 120pt, 85pt, 75pt),
        fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
        stroke: 0.5pt + luma(190),
        align: (center, left, left, left, center, center),
        table.header([*Ciclo*], [*Proceso / Sede*], [*Cláusulas y Controles Foco*], [*Equipo Auditor*], [*Mes / Fecha*], [*Estado*]),
        ..data.at("schedule", default: ()).map(row => (
          [#row.at("cycle")],
          [#row.at("process_site")],
          [#row.at("clauses_controls")],
          [#row.at("auditors")],
          [#row.at("date")],
          [*#row.at("status", default: "VIGENTE")*]
        )).flatten()
      )
    ]

    = Métodos de Auditoría y Directrices Operativas (ISO 19011:2026)
    #data.at("methods", default: [
      Las auditorías se ejecutan aplicando métodos presenciales y remotos combinados (muestreo documental, entrevistas con operadores, inspección técnica de configuraciones y verificación de logs). Los auditores internos deben mantener independencia e imparcialidad respecto a los procesos auditados.
    ])

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
