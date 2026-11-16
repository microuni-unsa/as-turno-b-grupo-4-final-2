// mold.typ — Molde parametrizado para la Tabla de Objetivos de Privacidad de la Información
// Artefacto: G4-OBJ-01 (v1.0, v2.0, v3.0)
// Norma de referencia: ISO/IEC 27701:2025 Cláusula 6.2 (Objetivos de privacidad de la información y planificación para alcanzarlos)
// Gramática del instructor: Objetivo/alcance/usuarios -> Documentos de referencia -> Secciones sustantivas -> Gestión de registros -> Validez y gestión -> Bloque de firma
// ZERO datos de instancia en este archivo.

#import "../common/template.typ": doc-template, status-tag, rag-tag, callout, reference-docs, signature-block

#let mold(data: (:), body: none) = {
  let title = data.at("title", default: "Tabla de Objetivos de Privacidad de la Información")
  let code = data.at("code", default: "G4-OBJ-01")
  let version = data.at("version", default: "1.0")
  let date = data.at("date", default: "")
  let confidentiality = data.at("confidentiality", default: "CONFIDENCIAL - USO INTERNO UNSA")
  let author = data.at("author", default: (:))
  let reviewer = data.at("reviewer", default: (:))
  let approver = data.at("approver", default: (:))
  let history = data.at("history", default: ())
  let references = data.at("references", default: (
    "Norma ISO/IEC 27701:2025, Cláusula 6.2 (Objetivos de privacidad y planificación) y Cláusula 9.1 (Seguimiento y medición).",
    "Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Política de Privacidad de la Información de la UNSA (G4-POL-01).",
    "Determinación del Alcance del SGPI (G4-ALC-01).",
  ))
  let validity = data.at("validity", default: "2026-10-28")
  let owner-role = data.at("owner-role", default: "Oficial de Seguridad de la Información (OSI / DPO)")

  let objective-text = data.at("objective_text", default: [
    El objetivo de este documento es establecer y formalizar los objetivos medibles de privacidad de la información y los planes de acción para alcanzarlos en la Universidad Nacional de San Agustín de Arequipa (UNSA), en concordancia con la Cláusula 6.2 de la norma internacional ISO/IEC 27701:2025.
  ])

  let scope-text = data.at("scope_text", default: [
    Los objetivos aquí establecidos aplican a todos los tratamientos de datos personales comprendidos en el par mandatorio institucional de Admisión de Pregrado y Planilla de Remuneraciones, en todas las sedes y canales operativos autorizados de la UNSA.
  ])

  let users-text = data.at("users_text", default: [
    Los usuarios de este documento son el Rectorado, el Comité de Privacidad y Gobierno Digital, el Oficial de Seguridad de la Información (OSI / DPO), los dueños de proceso de Admisión y Personal, la Dirección Universitaria de TIC (DUTIC) y los auditores internos y externos del SGPI.
  ])

  let records-data = data.at("records_management", default: (
    (
      name: "Matriz Trimestral de Seguimiento de Objetivos de Privacidad (KPIs)",
      location: "Repositorio digital PIMS / Tablero de Control DUTIC",
      responsible: "Oficial de Seguridad de la Información (OSI / DPO)",
      controls: "Control de acceso RBAC, auditoría de actualización e inmutabilidad de registros.",
      retention: "5 años"
    ),
    (
      name: "Informes de Avance para la Revisión por la Dirección",
      location: "Bóveda de gestión documental SGPI / PIMS",
      responsible: "Secretaría Técnica del SGPI / DPO",
      controls: "Firma digital calificada y bloqueo de solo lectura tras presentación.",
      retention: "5 años"
    ),
    (
      name: "Evidencias de Cumplimiento de Acciones y Planes de Mitigación",
      location: "Servidor seguro DUTIC / SGPI-Objectives-Evidence",
      responsible: "Directora Universitaria de TIC (DUTIC)",
      controls: "Cifrado en reposo AES-256 y respaldos periódicos.",
      retention: "3 años"
    )
  ))

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

    = Alineamiento Estratégico con la Política de Privacidad (Cláusula 5.2)
    #data.at("alignment", default: [
      Los objetivos de privacidad han sido formulados en estricta coherencia con la Política de Privacidad (`G4-POL-01`), operacionalizando los compromisos de legalidad, minimización, seguridad multisede, atención de derechos ARCO y resiliencia ante incidentes en metas cuantitativas y verificables.
    ])

    = Matriz de Objetivos de Privacidad y Plan de Acción (Cláusula 6.2)
    #v(3pt)
    #table(
      columns: (35pt, 110pt, 85pt, 70pt, 80pt, 50pt, 45pt),
      fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
      stroke: 0.5pt + luma(190),
      align: (center, left, left, left, left, center, center),
      table.header([*N°*], [*Objetivo de Privacidad*], [*Indicador / Meta (KPI)*], [*Qué se Hará / Recursos*], [*Responsable*], [*Plazo*], [*Estado*]),
      ..data.at("objectives", default: ()).map(obj => (
        text(size: 8pt)[#obj.at("id")],
        text(size: 8pt)[#obj.at("objective")],
        text(size: 7.5pt)[#obj.at("kpi")],
        text(size: 7.5pt)[#obj.at("action")],
        text(size: 7.5pt)[#obj.at("responsible")],
        text(size: 7.5pt)[#obj.at("term")],
        status-tag(obj.at("status", default: "VIGENTE"))
      )).flatten()
    )

    = Mecanismo de Seguimiento, Medición y Evaluación de Resultados (Cláusula 9.1)
    #data.at("monitoring", default: [
      El grado de avance y efectividad en el logro de los objetivos de privacidad es monitoreado de forma continua por el Oficial de Seguridad de la Información (OSI / DPO), mediante revisiones trimestrales de indicadores. Los resultados consolidados constituyen insumos mandatorios para la Revisión por la Dirección (Cláusula 9.3 / `G4-ACT-REV-01`).
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
        text(size: 8pt, weight: "bold")[#row.at("name")],
        text(size: 7.5pt)[#row.at("location")],
        text(size: 7.5pt)[#row.at("responsible")],
        text(size: 7.5pt)[#row.at("controls")],
        text(size: 7.5pt)[#row.at("retention")]
      )).flatten()
    )

    #if body != none { body }
  ]
}
