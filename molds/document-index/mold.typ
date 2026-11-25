// mold.typ — Molde parametrizado para el Mapa e Índice Maestro de Documentos (Auditor's Map)
// Artefacto: G4-IDX-01 (v1.0, v2.0, v3.0)
// Norma de referencia: ISO/IEC 27701:2025 Cláusula 7.5 (7.5.1, 7.5.2, 7.5.3) y Auditor's Map 4->10
// Gramática del instructor: Objetivo/alcance/usuarios -> Documentos de referencia -> Secciones sustantivas -> Gestión de registros -> Validez y gestión -> Bloque de firma
// ZERO datos de instancia en este archivo.
// Example caller (staging):
//   #import "mold.typ": mold
//   #mold(data: (title: "...", code: "G4-XXX-01", version: "4.0", date: "...", history: (...), ...))
// NOTE: `data:` is a NAMED argument — positional `#mold((...))` fails to compile.

#import "../common/template.typ": doc-template, default-confidentiality

#let mold(data: (:), body: none) = {
  let title = data.at("title", default: "Mapa e Índice Maestro de Documentos (Auditor's Map)")
  let short-title = data.at("short-title", default: data.at("short_title", default: none))
  let code = data.at("code", default: "G4-IDX-01")
  let version = data.at("version", default: "1.0")
  let date = data.at("date", default: "")
  let confidentiality = data.at("confidentiality", default: default-confidentiality)
  let author = data.at("author", default: (:))
  let reviewer = data.at("reviewer", default: (:))
  let approver = data.at("approver", default: (:))
  let history = data.at("history", default: ())
  let references = data.at("references", default: (
    "Norma ISO/IEC 27701:2025, Cláusula 7.5 (Información documentada: 7.5.1, 7.5.2 y 7.5.3).",
    "Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Procedimiento para Control de Documentos y Registros (G4-PRC-DOC-01).",
    "Política de Privacidad de la Información de la UNSA (G4-POL-01).",
    "Determinación del Alcance del SGPI (G4-ALC-01).",
  ))
  let validity = data.at("validity", default: "2026-10-28")
  let owner-role = data.at("owner-role", default: "Secretaría Técnica del SGPI / DPO")

  let objective-text = data.at("objective_text", default: [
    El objetivo de este documento es proveer el inventario maestro consolidado de la información documentada del Sistema de Gestión de Privacidad de la Información (SGPI) de la Universidad Nacional de San Agustín de Arequipa (UNSA), organizado estrictamente conforme a la secuencia de Cláusulas 4 a 10 de la norma internacional ISO/IEC 27701:2025, sirviendo como mapa de navegación para auditores de certificación e inspectores internos.
  ])

  let scope-text = data.at("scope_text", default: [
    Abarca la totalidad de los dieciocho (18) artefactos documentales normativos del SGPI que regulan los procesos del par mandatorio institucional compuesto por Admisión de Pregrado y Planilla de Remuneraciones en las sedes y filiales autorizadas de la UNSA.
  ])

  let users-text = data.at("users_text", default: [
    Dirigido al equipo de auditores externos de certificación (Fase 1 y Fase 2), auditores internos bajo ISO 19011:2026, Rectorado, Comité de Gobierno Digital y Privacidad, Oficial de Seguridad de la Información (OSI / DPO) y custodios designados de la información documentada.
  ])

  let records-data = data.at("records_management", default: (
    (
      name: "Índice Maestro de Información Documentada Publicado",
      location: "Repositorio digital PIMS institucional (unsa.27k.pe) y bóveda DUTIC",
      responsible: "Secretaría Técnica del SGPI / DPO",
      controls: "Firma digital calificada, control criptográfico SHA-256 e inmutabilidad de registros.",
      retention: "Permanente"
    ),
    (
      name: "Bitácora de Altas, Bajas y Transición de Versiones Documentales",
      location: "Módulo de Auditoría PIMS / Base de Datos SGPI",
      responsible: "Oficial de Seguridad de la Información (OSI / DPO)",
      controls: "Registro automático de auditoría con fecha/hora y usuario responsable.",
      retention: "5 años"
    ),
    (
      name: "Fichas de Control de Archivo y Custodia Documental",
      location: "Archivo Central SGPI / Servidor DUTIC",
      responsible: "Secretaría Técnica del SGPI / DUTIC",
      controls: "Control de acceso basado en roles (RBAC) y respaldos diarios cifrados.",
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

    = Directrices de Navegación y Secuencia de Auditoría (Cláusulas 4 a 10)
    #data.at("purpose", default: "")

    #if "callout_title" in data and "callout_body" in data [
      #let lead = str(data.callout_title).trim()
      #let lead-str = if lead.ends-with(":") { lead } else { lead + ":" }
      *#lead-str* #data.callout_body
    ]

    #page(flipped: true)[
      = Inventario Maestro de Documentos por Cláusula Normativa
      #v(3pt)
      #table(
        columns: (80pt, 80pt, 1fr, 45pt, 140pt, 85pt),
        fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
        stroke: 0.5pt + luma(190),
        align: (center, center, left, center, left, center),
        table.header([*Cláusula ISO*], [*Código*], [*Título del Documento Institucional*], [*Ver.*], [*Responsable / Custodio*], [*Estado PIMS*]),
        ..data.at("documents", default: ()).map(doc => (
          [#doc.at("clause")],
          [*#doc.at("code")*],
          [#doc.at("title")],
          [#doc.at("version")],
          [#doc.at("custodian")],
          [*#doc.at("status", default: "VIGENTE")*]
        )).flatten()
      )
    ]

    = Trazabilidad con el Repositorio de la Verdad (PIMS GESTITEL)
    #data.at("truth_traceability", default: [
      Todos los 18 documentos enumerados se encuentran cargados en el PIMS institucional bajo el esquema `unsa` en `https://unsa.27k.pe`. Las versiones anteriores se conservan en estado `obsoleto` para consulta retrospectiva ("máquina del tiempo") con sus respectivos códigos de verificación hash SHA-256.
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
