// mold.typ — Molde parametrizado para el Procedimiento de Respuesta a Incidentes de Privacidad
// Artefacto: G4-PRC-INC-01 (v1.0, v2.0, v3.0)
// Norma de referencia: ISO/IEC 27701:2025 Cláusula 8.1, Controles A.3.11, A.3.12 y Guías B.3.11, B.3.12
// Gramática del instructor: Objetivo/alcance/usuarios -> Documentos de referencia -> Secciones sustantivas -> Gestión de registros -> Validez y gestión -> Bloque de firma
// ZERO datos de instancia en este archivo. Mantiene la profundidad técnica requerida (fases, roles, severidad, categorías, criterios de notificación organizacionales, sin reloj de 72h).

#import "../common/template.typ": doc-template, status-tag, rag-tag, callout, reference-docs, signature-block

#let mold(data: (:), body: none) = {
  let title = data.at("title", default: "Procedimiento de Respuesta a Incidentes de Privacidad")
  let code = data.at("code", default: "G4-PRC-INC-01")
  let version = data.at("version", default: "1.0")
  let date = data.at("date", default: "")
  let confidentiality = data.at("confidentiality", default: "CONFIDENCIAL - USO INTERNO UNSA")
  let author = data.at("author", default: (:))
  let reviewer = data.at("reviewer", default: (:))
  let approver = data.at("approver", default: (:))
  let history = data.at("history", default: ())
  let references = data.at("references", default: (
    "Norma Internacional ISO/IEC 27701:2025 Cláusula 8.1, Controles A.3.11, A.3.12 y Guías B.3.11, B.3.12.",
    "Ley N° 29733 de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Ley Universitaria N° 30220.",
    "Política de Privacidad de la Información (G4-POL-01) y Alcance del SGPI (G4-ALC-01).",
    "Procedimiento para Medidas Correctivas (G4-PRC-CAPA-01).",
  ))
  let validity = data.at("validity", default: "2026-10-28")
  let owner-role = data.at("owner-role", default: "Oficial de Seguridad de la Información (OSI / DPO)")

  let records-data = data.at("records_management", default: (
    (
      name: "Libro Oficial de Registro de Incidentes (G4-REG-INC-01)",
      location: "Archivo de Seguridad DUTIC / Repositorio PIMS",
      responsible: "Oficial de Seguridad de la Información (OSI / DPO)",
      controls: "Control de acceso RBAC, inmutabilidad de bitácoras y respaldo diario cifrado.",
      retention: "5 años"
    ),
    (
      name: "Solicitudes de Acción Correctiva (G4-REG-CAPA-01)",
      location: "Repositorio Institucional SGPI / PIMS",
      responsible: "Oficial de Seguridad de la Información (OSI / DPO)",
      controls: "Firma digital y seguimiento formal de cierre de no conformidades.",
      retention: "5 años"
    ),
    (
      name: "Bitácoras e Informes Periciales Forenses",
      location: "Servidor seguro DUTIC / Bóveda Cifrada",
      responsible: "Líder Técnico CSIRT-UNSA",
      controls: "Cadena de custodia forense, hash SHA-256 y restricción estricta de lectura.",
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
    #data.at("objective", default: "")

    == Alcance
    #data.at("scope", default: "")

    == Usuarios
    #data.at("users", default: "")

    = Documentos de referencia
    #for ref in references [
      - #ref
    ]

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
        text(size: 7.5pt)[#row.at("location", default: row.at("location", default: ""))],
        text(size: 7.5pt)[#row.at("responsible", default: row.at("custodian", default: ""))],
        text(size: 7.5pt)[#row.at("controls", default: "Control de acceso por roles (RBAC), firma digital y respaldo cifrado.")],
        text(size: 7.5pt)[#row.at("retention")]
      )).flatten()
    )

    #if body != none { body }
  ]
}
