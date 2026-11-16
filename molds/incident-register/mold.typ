// mold.typ — Molde parametrizado para el Registro Oficial de Incidentes de Privacidad
// Artefacto: G4-REG-INC-01 (v1.0, v2.0, v3.0 Typst shells)
// Norma de referencia: ISO/IEC 27701:2025 Cláusula 8.1, Control A.3.12 y Guía B.3.12 (9 campos obligatorios)
// Gramática del instructor: Objetivo/alcance/usuarios -> Documentos de referencia -> Secciones sustantivas -> Gestión de registros -> Validez y gestión -> Bloque de firma
// ZERO datos de instancia en este archivo. Typst shell que apunta al libro de registros XLSX oficial.

#import "../common/template.typ": doc-template, status-tag, rag-tag, callout, reference-docs, signature-block

#let mold(data) = {
  let doc-title = data.at("title", default: "Registro Oficial de Incidentes de Privacidad (SGPI)")
  let doc-code = data.at("code", default: "G4-REG-INC-01")
  let doc-ver = data.at("version", default: "1.0")
  let doc-date = data.at("date", default: "")
  let doc-conf = data.at("confidentiality", default: "CONFIDENCIAL - USO INTERNO UNSA")
  let doc-author = data.at("author", default: (:))
  let doc-reviewer = data.at("reviewer", default: (:))
  let doc-approver = data.at("approver", default: (:))
  let doc-history = data.at("history", default: ())
  let doc-validity = data.at("validity", default: "2026-10-28")
  let doc-refs = data.at("references", default: (
    "Norma ISO/IEC 27701:2025, Cláusula 8.1, Control A.3.12 y Guías B.3.11, B.3.12.",
    "Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Procedimiento de Respuesta a Incidentes de Privacidad (G4-PRC-INC-01).",
    "Procedimiento para Medidas Correctivas (G4-PRC-CAPA-01).",
  ))
  let doc-owner = data.at("owner-role", default: "Oficial de Seguridad de la Información (OSI / DPO)")
  let org-name = data.at("organization-name", default: "la Universidad Nacional de San Agustín de Arequipa (UNSA)")
  let scope-summary = data.at("scope-summary", default: "todos los procesos de Admisión y Planillas en sedes centrales y filiales regionales")
  let era-name = data.at("era-name", default: "Periodo Institucional")
  let summary-metrics = data.at("summary-metrics", default: (:))
  let incident-rows = data.at("incident-rows", default: ())
  let capa-links = data.at("capa-links", default: ())

  let objective-text = data.at("objective_text", default: [
    El objetivo de este documento es establecer y formalizar la carátula, especificación técnica y resumen institucional del *Registro Oficial de Incidentes de Privacidad y Brechas de PII* de la Universidad Nacional de San Agustín de Arequipa (UNSA), de conformidad con la Cláusula 8.1, el Control A.3.12 y las directrices forenses de la Guía B.3.12 de la norma internacional ISO/IEC 27701:2025.
  ])

  let scope-text = data.at("scope_text", default: [
    Abarca el registro sistemático de todos los eventos de seguridad y presuntas brechas que afecten datos personales tratados en los procesos de Admisión de Pregrado y Planilla de Remuneraciones en las sedes y filiales de la UNSA contempladas en la versión correspondiente.
  ])

  let users-text = data.at("users_text", default: [
    Destinado al Equipo de Respuesta a Incidentes (CSIRT-UNSA), Oficial de Seguridad de la Información (OSI / DPO), Dirección Universitaria de TIC (DUTIC), Rectorado y a los auditores de certificación.
  ])

  let records-data = data.at("records_management", default: (
    (
      name: "Libro Maestro de Registro de Incidentes (G4-REG-INC-01-registros.xlsx)",
      location: "Bóveda digital PIMS institucional y repositorio seguro DUTIC",
      responsible: "Oficial de Seguridad de la Información (OSI / DPO)",
      controls: "Firma digital calificada, bloqueo de edición posterior e integridad SHA-256.",
      retention: "10 años"
    ),
    (
      name: "Expedientes Forenses y Actas de Contención por Incidente",
      location: "Servidor seguro WORM DUTIC / SGPI-CSIRT-Evidence",
      responsible: "Líder Técnico CSIRT-UNSA",
      controls: "Cadena de custodia forense, cifrado AES-256 y control de acceso estricto.",
      retention: "5 años"
    ),
    (
      name: "Notificaciones a la Autoridad (ANPD) y Titulares",
      location: "Repositorio digital PIMS / Módulo Notificaciones",
      responsible: "Oficial de Seguridad / DPO",
      controls: "Acuse de recibo formal y resguardo con valor probatorio legal.",
      retention: "10 años"
    )
  ))

  doc-template(
    title: doc-title,
    code: doc-code,
    version: doc-ver,
    date: doc-date,
    confidentiality: doc-conf,
    author: doc-author,
    reviewer: doc-reviewer,
    approver: doc-approver,
    history: doc-history,
    references: (),
    validity: doc-validity,
    owner-role: doc-owner,
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
    #for ref in doc-refs [
      - #ref
    ]

    = Estructura y Campos Obligatorios del Registro Forense (Guía B.3.12)
    Conforme a lo estipulado en la Guía B.3.12 de ISO/IEC 27701:2025, ante la ocurrencia de cualquier evento que afecte datos personales, debe mantenerse un registro documentado con información suficiente para proveer informes regulatorios o forenses, estructurado en nueve (9) campos taxativos:

    1. *Descripción del incidente:* Detalle pormenorizado del vector de exposición, causa raíz o fallo operacional que originó el evento.
    2. *Período de tiempo:* Cronología fehaciente indicando fecha y hora de inicio del evento, detección formal por el CSIRT, contención y cierre.
    3. *Consecuencias del incidente:* Impacto potencial o materializado sobre la organización y sobre los derechos y libertades de los titulares de datos personales.
    4. *Nombre del informante / reportante:* Identidad de la persona, sistema automatizado o entidad externa que detectó y notificó inicialmente el incidente.
    5. *A quién se informó el incidente:* Registro formal de las instancias notificadas (CSIRT institucional, DPO, directores de área y Rectorado).
    6. *Medidas adoptadas para resolver el incidente:* Acciones inmediatas de contención, erradicación y recuperación, consignando expresamente la persona a cargo y los datos recuperados.
    7. *Afectación específica sobre la PII:* Constatación explícita sobre si el incidente resultó en:
      - *Indisponibilidad* (*unavailability*)
      - *Pérdida* (*loss*)
      - *Divulgación no autorizada* (*disclosure*)
      - *Alteración no autorizada* (*alteration*) de los datos personales.
    8. *Descripción de la PII comprometida:* Categorías de datos (identificatorios, académicos, laborales, financieros o biométricos/sensibles), estimación del número de titulares concernidos y volumen de registros.
    9. *Medidas de notificación ejecutadas:* Detalle de las notificaciones cursadas a la autoridad de control (ANPD), a los titulares afectados o a terceros corresponsables, o justificación motivada de improcedencia de notificación.

    #callout(title: "DELIMITACIÓN NORMATIVA DE NOTIFICACIÓN DE BRECHAS (GUÍA B.3.12)", color: rgb("#0284c7"))[
      Conforme a la Cláusula 8.1 y las directrices normativas de la Guía B.3.12, los umbrales y plazos de notificación hacia la Autoridad Nacional de Protección de Datos Personales (ANPD) y hacia los titulares son determinados objetivamente por la institución mediante la evaluación del riesgo residual y la efectividad de las salvaguardas técnicas (como el cifrado robusto de datos A.3.26). En estricto rigor normativo, el plazo genérico de 72 horas del Reglamento General de Protección de Datos europeo (RGPD) constituye exclusivamente información documental de referencia (Anexo D) y no rige como obligación en este SGPI.
    ]

    = Resumen Ejecutivo del Libro de Registro (#era-name)
    #v(0.2cm)
    #table(
      columns: (68pt, 68pt, 55pt, 85pt, 85pt, 1fr),
      fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
      stroke: 0.5pt + luma(190),
      align: (center, center, center, left, left, left),
      table.header([*ID Incidente*], [*Detección*], [*Severidad*], [*Categoría*], [*Titulares Concernidos*], [*Contención y Notificación*]),
      ..incident-rows.map(row => (
        text(size: 7.5pt, weight: "bold")[#row.id],
        text(size: 7pt)[#row.detection],
        rag-tag(row.severity),
        text(size: 7pt)[#row.category],
        text(size: 7pt)[#row.affected],
        [
          #text(size: 7pt)[*Contención:* #row.containment]\
          #text(size: 7pt)[*Notificación:* #status-tag(row.notification-status) #row.notification-detail]
        ]
      )).flatten()
    )
    #v(0.3cm)

    == Indicadores de Desempeño Operacional y Cadena CAPA
    - *Total de incidentes registrados en #era-name:* #summary-metrics.at("total", default: "0")
    - *Incidentes contenidos y resueltos eficazmente:* #summary-metrics.at("contained-rate", default: "100%")
    - *Incidentes que requirieron notificación a titulares:* #summary-metrics.at("notified-principals", default: "0")
    - *Incidentes que requirieron notificación regulatoria a la ANPD:* #summary-metrics.at("notified-regulator", default: "0")
    - *Incidentes contenidos sin riesgo residual para los titulares:* #summary-metrics.at("no-risk-residual", default: "0")
    - *Expedientes de Acciones Correctivas vinculados:*
      #if capa-links.len() > 0 [
        #for clink in capa-links [
          - `#clink.code`: #clink.desc (registrado formalmente en `G4-REG-CAPA-01` bajo la Cláusula 10.2).
        ]
      ] else [
        - No se registraron incidentes mayores que requirieran apertura de acciones correctivas en este periodo.
      ]

    = Referencia al Artefacto Operativo Definitivo (Libro XLSX)
    Conforme a los requerimientos de auditoría forense de la Cláusula 8.1 y la protección de registros del Control A.3.14, la base transaccional exhaustiva y detallada de cada evento —incluyendo los registros horarios de conexión, volcados de tráfico, actas de trituración física, hashes de integridad forense SHA-256 y certificados de borrado remoto— se gestiona y custodia de manera inmutable en la hoja de cálculo OpenXML:

    #align(center)[
      #block(
        width: 90%,
        fill: rgb("#f8fafc"),
        stroke: 1pt + rgb("#0284c7"),
        radius: 4pt,
        inset: 10pt,
        [
          #text(weight: "bold", size: 9pt, fill: rgb("#0a2540"))[Archivo Electrónico Oficial de Registro Forense y Regulatorio:]\
          #v(2pt)
          #text(font: "Liberation Mono", size: 8.5pt, weight: "bold", fill: rgb("#0284c7"))[G4-REG-INC-01-registros.xlsx]\
          #v(2pt)
          #text(size: 7.5pt, fill: luma(80))[
            Generado y sincronizado por el generador institucional scriptado (`generate.ts`)\
            Almacenamiento seguro bajo control de acceso RBAC del DPO | Integridad SHA-256 verificada
          ]
        ]
      )
    ]

    Este documento Typst constituye la representación formal institucional para revisión por la dirección y auditorías de certificación de Fase 1 y Fase 2, garantizando la perfecta sincronía entre la gobernanza documental y el dataset técnico de incidentes.

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
