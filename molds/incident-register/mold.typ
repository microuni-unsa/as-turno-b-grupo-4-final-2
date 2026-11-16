// mold.typ — Molde parametrizado para el Registro Oficial de Incidentes de Privacidad
// Artefacto: G4-REG-INC-01 (v1, v2, v3 Typst shells)
// Sistema de Gestión de Privacidad de la Información (SGPI) — ISO/IEC 27701:2025
// Cumple con Cláusula 8.1, Cláusula 7.5.1, Control A.3.12 y Guía B.3.12 (9 campos obligatorios)

#import "../common/template.typ": doc-template, status-tag, rag-tag, callout, reference-docs, signature-block

#let mold(data) = {
  let doc-title = data.at("title", default: "Registro Oficial de Incidentes de Privacidad (SGPI)")
  let doc-code = data.at("code", default: "G4-REG-INC-01")
  let doc-ver = data.at("version", default: "3.0")
  let doc-date = data.at("date", default: "2025-10-28")
  let doc-conf = data.at("confidentiality", default: "CONFIDENCIAL - USO INTERNO UNSA")
  let doc-author = data.at("author", default: (:))
  let doc-reviewer = data.at("reviewer", default: (:))
  let doc-approver = data.at("approver", default: (:))
  let doc-history = data.at("history", default: ())
  let doc-validity = data.at("validity", default: "2026-10-28")
  let doc-refs = data.at("references", default: ())
  let doc-owner = data.at("owner-role", default: "Oficial de Seguridad de la Información (OSI / DPO)")
  let era = data.at("era", default: "v3")
  let org-name = data.at("organization-name", default: "la Universidad Nacional de San Agustín de Arequipa (UNSA)")
  let scope-summary = data.at("scope-summary", default: "todos los procesos de Admisión y Planillas en sedes centrales y filiales regionales")
  let era-name = data.at("era-name", default: "Periodo Operacional")
  let summary-metrics = data.at("summary-metrics", default: (:))
  let incident-rows = data.at("incident-rows", default: ())
  let capa-links = data.at("capa-links", default: ())

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
    validity: doc-validity,
    references: doc-refs,
    owner-role: doc-owner,
    show-signature: true,
    [
      = Propósito y Criterio Operacional
      Este documento constituye la carátula y especificación técnica del *Registro Oficial de Incidentes de Privacidad* del SGPI en #org-name, en cumplimiento estricto de las Cláusulas 8.1 (Planificación y control operacional) y 7.5.1 (Información documentada) de la norma internacional independiente *ISO/IEC 27701:2025*, así como de los Controles A.3.11, A.3.12 y las directrices de la Guía B.3.12.

      El registro abarca #scope-summary, asegurando la trazabilidad forense, la evaluación de impacto y la determinación fundamentada de la necesidad de notificación regulatoria o comunicación directa a los titulares de datos personales (*PII principals*).

      #callout(title: "DELIMITACIÓN NORMATIVA DE NOTIFICACIÓN DE BRECHAS (GUÍA B.3.12)", color: rgb("#0284c7"))[
        Conforme a la Cláusula 8.1 y las directrices normativas de la Guía B.3.12, los umbrales y plazos de notificación hacia la Autoridad Nacional de Protección de Datos Personales (ANPD) y hacia los titulares son determinados objetivamente por la institución mediante la evaluación del riesgo residual y la efectividad de las salvaguardas técnicas (como el cifrado robusto de datos A.3.26). En estricto rigor normativo, el plazo genérico de 72 horas del Reglamento General de Protección de Datos europeo (RGPD) constituye exclusivamente información documental de referencia (Anexo D) y no rige como obligación en este SGPI.
      ]

      = Estructura y Campos Obligatorios del Registro Forense (Guía B.3.12)
      Conforme a lo estipulado en la Guía B.3.12 de ISO/IEC 27701:2025, ante la ocurrencia de cualquier evento que afecte datos personales, debe mantenerse un registro documentado con información suficiente para proveer informes regulatorios o forenses, estructurado en nueve (9) campos taxativos:

      1. *Descripción del incidente:* Detalle pormenorizado del vector de exposición, causa raíz o fallo operacional que originó el evento.
      2. *Período de tiempo:* Cronología fehaciente indicando fecha y hora de inicio del evento, detección formal por el CSIRT, contención y cierre.
      3. *Consecuencias del incidente:* Impacto potencial o materializado sobre la organización y sobre los derechos y libertades de los titulares de datos personales.
      4. *Nombre del informante / reportante:* Identidad de la persona, sistema automatizado o entidad externa que detectó y notificó inicialmente el incidente.
      5. *A quién se informó el incidente:* Registro formal de las instancias notificadas (CSIRT institucional, DPO, directores de área y Rectorado).
      6. *Medidas adoptadas para resolver el incidente:* Acciones inmediatas de contención, erradicación y recuperación, *consignando expresamente la persona a cargo y los datos recuperados*.
      7. *Afectación específica sobre la PII:* Constatación explícita sobre si el incidente resultó en:
        - *Indisponibilidad* (*unavailability*)
        - *Pérdida* (*loss*)
        - *Divulgación no autorizada* (*disclosure*)
        - *Alteración no autorizada* (*alteration*) de los datos personales.
      8. *Descripción de la PII comprometida:* Categorías de datos (identificatorios, académicos, laborales, financieros o biométricos/sensibles), estimación del número de titulares concernidos y volumen de registros.
      9. *Medidas de notificación ejecutadas:* Detalle de las notificaciones cursadas a la autoridad de control (ANPD), a los titulares afectados o a terceros corresponsables, o justificación motivada de improcedencia de notificación.

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

      = Puntero Normativo al Registro Técnico Electrónico (`G4-REG-INC-01-registros.xlsx`)
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
            #text(family: "Liberation Mono", size: 8.5pt, weight: "bold", fill: rgb("#0284c7"))[G4-REG-INC-01-registros.xlsx]\
            #v(2pt)
            #text(size: 7.5pt, fill: luma(80))[
              Generado y sincronizado por el generador institucional scriptado (`generate.ts`)\
              Almacenamiento seguro bajo control de acceso RBAC del DPO | Integridad SHA-256 verificada
            ]
          ]
        )
      ]

      Este documento Typst constituye la representación formal institucional para revisión por la dirección y auditorías de certificación de Fase 1 y Fase 2, garantizando la perfecta sincronía entre la gobernanza documental y el dataset técnico de incidentes.
    ]
  )
}
