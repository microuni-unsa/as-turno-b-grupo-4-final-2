// mold.typ — Molde parametrizado para la Política de Privacidad de la Información
// Artefacto: G4-POL-01 (v1.0, v2.0, v3.0)
// Norma de referencia: ISO/IEC 27701:2025 Cláusula 5.2 (Política de privacidad)
// Gramática del instructor: Objetivo/alcance/usuarios -> Documentos de referencia -> Secciones sustantivas -> Gestión de registros -> Validez y gestión -> Bloque de firma
// ZERO datos de instancia en este archivo.
// Example caller (staging):
//   #import "mold.typ": mold
//   #mold(data: (title: "...", code: "G4-XXX-01", version: "4.0", date: "...", history: (...), ...))
// NOTE: `data:` is a NAMED argument — positional `#mold((...))` fails to compile.

#import "../common/template.typ": doc-template

#let mold(data: (:), body: none) = {
  let title = data.at("title", default: "Política de Privacidad de la Información")
  let code = data.at("code", default: "G4-POL-01")
  let version = data.at("version", default: "1.0")
  let date = data.at("date", default: "")
  let confidentiality = data.at("confidentiality", default: "CONFIDENCIAL - USO INTERNO UNSA")
  let author = data.at("author", default: (:))
  let reviewer = data.at("reviewer", default: (:))
  let approver = data.at("approver", default: (:))
  let history = data.at("history", default: ())
  let references = data.at("references", default: (
    "Norma ISO/IEC 27701:2025, Cláusula 5.2 (Política de privacidad de la información).",
    "Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Ley Universitaria N° 30220.",
    "Determinación del Alcance del SGPI (G4-ALC-01).",
  ))
  let validity = data.at("validity", default: "2026-10-28")
  let owner-role = data.at("owner-role", default: "Oficial de Seguridad de la Información (OSI / DPO)")
  let short-title = data.at("short-title", default: none)

  let objective-text = data.at("objective_text", default: [
    El objetivo de esta política es formalizar el compromiso ineludible de la Alta Dirección de la Universidad Nacional de San Agustín de Arequipa (UNSA) con la protección, confidencialidad, integridad y uso legítimo de los datos personales tratados en sus actividades institucionales, de conformidad con la Cláusula 5.2 de la norma ISO/IEC 27701:2025 y la legislación peruana vigente (Ley N° 29733).
  ])

  let scope-text = data.at("scope_text", default: [
    Esta política es vinculante para todas las unidades académicas y administrativas, autoridades, personal docente, nodocente, estudiantes, postulantes, proveedores y terceros que realicen tratamiento de datos personales en los procesos de Admisión de Pregrado y Planilla de Remuneraciones, en todas las sedes institucionales de la UNSA.
  ])

  let users-text = data.at("users_text", default: [
    Los usuarios de este documento comprenden a la totalidad de la comunidad universitaria, colaboradores administrativos, analistas técnicos de DUTIC, directores de escuela y decanos, así como a las partes interesadas externas que interactúan con los bancos de datos de la institución.
  ])

  let records-data = data.at("records_management", default: (
    (
      name: "Resolución Rectoral de Aprobación de la Política de Privacidad",
      location: "Secretaría General / Repositorio PIMS digital",
      responsible: "Secretario General / Oficial de Seguridad (DPO)",
      controls: "Firma digital calificada y archivo inmutable con hash SHA-256.",
      retention: "Permanente"
    ),
    (
      name: "Registro de Difusión y Toma de Conciencia de la Política",
      location: "Subdirección de Personal / Repositorio digital SGPI",
      responsible: "Subdirección de Personal / RRHH",
      controls: "Control de acceso por roles y bitácora de confirmación en intranet.",
      retention: "5 años"
    ),
    (
      name: "Evidencia de Revisión Anual por la Alta Dirección",
      location: "Bóveda de gestión de actas SGPI / PIMS",
      responsible: "Oficial de Seguridad de la Información (OSI / DPO)",
      controls: "Restricción de lectura y respaldo periódico cifrado.",
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

    = Declaración de Compromiso de la Alta Dirección (Cláusula 5.2)
    #data.at("commitment_statement", default: "")

    = Principios Rectores de Protección de Datos Personales
    #let principles = data.at("principles", default: ())
    #for (idx, p) in principles.enumerate() [
      #text(weight: "bold")[#(idx + 1). #p.at("title"): ] #p.at("description") \
    ]

    = Compromisos de la Dirección y Directrices Estratégicas
    #let commitments = data.at("commitments", default: ())
    #for c in commitments [
      - #c
    ]

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
