// mold.typ — Molde parametrizado para la Determinación del Alcance del SGPI
// Artefacto: G4-ALC-01 (v1.0, v2.0, v3.0)
// Norma de referencia: ISO/IEC 27701:2025 Cláusulas 4.1, 4.3 y 4.4
// Gramática del instructor: Objetivo/alcance/usuarios -> Documentos de referencia -> Secciones sustantivas -> Gestión de registros -> Validez y gestión -> Bloque de firma
// ZERO datos de instancia en este archivo.

#import "../common/template.typ": doc-template

#let mold(data: (:), body: none) = {
  let title = data.at("title", default: "Determinación del Alcance del SGPI")
  let code = data.at("code", default: "G4-ALC-01")
  let version = data.at("version", default: "1.0")
  let date = data.at("date", default: "")
  let confidentiality = data.at("confidentiality", default: "CONFIDENCIAL - USO INTERNO UNSA")
  let author = data.at("author", default: (:))
  let reviewer = data.at("reviewer", default: (:))
  let approver = data.at("approver", default: (:))
  let history = data.at("history", default: ())
  let references = data.at("references", default: (
    "Norma ISO/IEC 27701:2025, Cláusulas 4.1, 4.3 y 4.4 (Contexto de la organización y alcance).",
    "Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Ley Universitaria N° 30220.",
    "Política de Privacidad de la Información de la UNSA (G4-POL-01).",
  ))
  let validity = data.at("validity", default: "2026-10-28")
  let owner-role = data.at("owner-role", default: "Oficial de Seguridad de la Información (OSI / DPO)")
  let short-title = data.at("short-title", default: none)

  let objective-text = data.at("objective_text", default: [
    El objetivo de este documento es definir formalmente los límites organizacionales, geográficos, operativos y tecnológicos del Sistema de Gestión de Privacidad de la Información (SGPI) de la Universidad Nacional de San Agustín de Arequipa (UNSA), de conformidad con las Cláusulas 4.3 y 4.4 de la norma internacional ISO/IEC 27701:2025 y la Ley N° 29733.
  ])

  let scope-summary-text = data.at("scope_summary_text", default: [
    El alcance del SGPI comprende los tratamientos de datos personales efectuados en el marco del par mandatorio institucional compuesto por el proceso misional de Admisión de Pregrado y el proceso de soporte de Planilla de Remuneraciones, incluyendo los activos lógicos, infraestructura física y canales de atención de las sedes académicas y administrativas especificadas en este documento.
  ])

  let users-text = data.at("users_text", default: [
    Los usuarios de este documento son el Rectorado, el Comité de Privacidad y Gobierno Digital, la Dirección General de Admisión, la Subdirección de Personal y Remuneraciones, la Dirección Universitaria de Tecnologías de la Información y Comunicación (DUTIC), el Oficial de Seguridad de la Información (OSI / DPO), los coordinadores de sede y filiales, y todos los operadores involucrados en el tratamiento de datos personales en la UNSA.
  ])

  let records-data = data.at("records_management", default: (
    (
      name: "Acta de Aprobación del Alcance del SGPI",
      location: "Bóveda digital PIMS institucional y archivo DUTIC",
      responsible: "Oficial de Seguridad de la Información (OSI / DPO)",
      controls: "Control de acceso basado en roles (RBAC), firma digital y respaldo cifrado AES-256.",
      retention: "Permanente"
    ),
    (
      name: "Registro de Revisión Periódica del Perímetro Institucional",
      location: "Repositorio digital PIMS / Módulo Auditoría",
      responsible: "Secretaría Técnica del SGPI / DPO",
      controls: "Trazabilidad inmutable de bitácoras y firma con certificado institucional.",
      retention: "5 años"
    ),
    (
      name: "Inventario de Activos y Límites de Procesos en Alcance",
      location: "Servidor seguro DUTIC / SGPI-Scope",
      responsible: "Directora Universitaria de TIC (DUTIC)",
      controls: "Autenticación multifactor (MFA), auditoría de descargas e integridad SHA-256.",
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
    #scope-summary-text

    == Usuarios
    #users-text

    = Documentos de referencia
    #for ref in references [
      - #ref
    ]

    = Determinación del Rol Institucional (Cláusula 4.1)
    #data.at("role_determination", default: [
      En estricto cumplimiento de la Cláusula 4.1 de la norma ISO/IEC 27701:2025, la UNSA determina su función unívoca y exclusiva como *Responsable del Tratamiento de Datos Personales (PII Controller)* para la totalidad de las actividades, bancos de datos y flujos de información comprendidos en este alcance institucional.
    ])

    = Par Mandatorio de Procesos en Alcance

    == Proceso Misional: #data.admission_process.at("title", default: "Admisión de Pregrado")
    #data.admission_process.at("description", default: "")
    - *Responsable del Proceso:* #data.admission_process.at("responsible", default: "")
    #if "categories" in data.admission_process [
      - *Categorías de Titulares:* #data.admission_process.at("categories")
    ]
    #if "population" in data.admission_process [
      - *Población Impactada:* #data.admission_process.at("population")
    ]
    - *Datos Tratados:* #data.admission_process.at("data_treated", default: "")
    #if "key_assets" in data.admission_process [
      - *Activos Clave:* #data.admission_process.at("key_assets")
    ]

    == Proceso de Soporte: #data.payroll_process.at("title", default: "Planilla de Remuneraciones")
    #data.payroll_process.at("description", default: "")
    - *Responsable del Proceso:* #data.payroll_process.at("responsible", default: "")
    #if "categories" in data.payroll_process [
      - *Categorías de Titulares:* #data.payroll_process.at("categories")
    ]
    #if "population" in data.payroll_process [
      - *Población Impactada:* #data.payroll_process.at("population")
    ]
    - *Datos Tratados:* #data.payroll_process.at("data_treated", default: "")
    #if "key_assets" in data.payroll_process [
      - *Activos Clave:* #data.payroll_process.at("key_assets")
    ]

    = Perímetro Geográfico e Infraestructura Tecnológica

    #if "main_campuses" in data and data.main_campuses.len() > 0 [
      == Sedes Centrales
      #for campus in data.main_campuses [
        - *#campus.at("name")*: #campus.at("description")
      ]
    ]

    #if "filiales" in data and data.filiales.len() > 0 [
      == Filiales Descentralizadas Regionales
      #for filial in data.filiales [
        - *#filial.at("name")*: #filial.at("description")
      ]
    ]

    #if "tech_infrastructure" in data and data.tech_infrastructure.len() > 0 [
      == Infraestructura Tecnológica
      #for item in data.tech_infrastructure [
        - #item
      ]
    ]

    = Exclusiones Justificadas
    #for excl in data.at("exclusions", default: ()) [
      - #excl
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
