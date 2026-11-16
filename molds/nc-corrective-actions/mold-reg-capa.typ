// mold-reg-capa.typ — Molde parametrizado para Registro y Formularios de No Conformidades y Acciones Correctivas (CAPA)
// Cumple con ISO/IEC 27701:2025 Cláusula 10.2, Control A.3.16, y replica TODOS los campos del
// "Apéndice Formulario para medidas correctivas" del instructor más la tabla de cadena de remediación RAG.
// CERO datos de instancia institucional en este archivo.

#import "../common/template.typ": doc-template, status-tag, rag-tag, callout

#let mold-reg-capa(
  metadata: (:),
  references: (),
  intro-text: none,
  period-label: "Periodo Evaluado",
  capa-chain-rows: (),
  form-records: (),
  effectiveness-summary: (:),
  ..sink
) = {
  show: doc-template.with(
    title: metadata.at("title", default: "Registro de No Conformidades y Acciones Correctivas (CAPA)"),
    code: metadata.at("code", default: "G4-REG-CAPA-01"),
    version: metadata.at("version", default: "3.0"),
    date: metadata.at("date", default: "2025-10-28"),
    confidentiality: metadata.at("confidentiality", default: "CONFIDENCIAL - USO INTERNO UNSA"),
    author: metadata.at("author", default: (name: "", role: "", date: "")),
    reviewer: metadata.at("reviewer", default: (name: "", role: "", date: "")),
    approver: metadata.at("approver", default: (name: "", role: "", date: "")),
    history: metadata.at("history", default: ()),
    validity: metadata.at("validity", default: "2026-10-28"),
    references: references,
    owner-role: metadata.at("owner-role", default: "Oficial de Seguridad de la Información (OSI / DPO)"),
    show-signature: true,
  )

  [
    = Propósito y Fundamento Normativo
    #(if intro-text != none { intro-text } else [
      Este registro formaliza la cadena integral de hallazgos, no conformidades y acciones correctivas del Sistema de Gestión de Privacidad de la Información (SGPI), dando estricto cumplimiento a las Cláusulas 9.2.2 (Programa de auditoría interna) y 10.2 (No conformidad y acción correctiva) de la norma ISO/IEC 27701:2025. Provee evidencia auditable de la naturaleza de los desvíos, el análisis de causa raíz, las decisiones de remediación, los planes de acción ejecutados y la evaluación objetiva de su eficacia posterior.
    ])

    = Estructura Metodológica de la Cadena de Remediación
    Toda acción correctiva documentada sigue la secuencia operativa obligatoria:
    1. *Hallazgo (`Finding`)*: Origen identificado en auditoría interna o externa (Cl. 9.2), revisión por la dirección (Cl. 9.3) o derivado de la bitácora de incidentes y brechas de PII (Cl. 8.1 y Control A.3.12).
    2. *No Conformidad (`NC`)*: Desvío clasificado respecto a los requisitos normativos, procedimentales o legales aplicables.
    3. *Análisis de Causa Raíz*: Determinación técnica del origen del desvío empleando metodologías estructuradas (5 Porqués / Diagrama de Ishikawa).
    4. *Acción Correctiva (`CAPA`)*: Medida estructural planificada para erradicar la causa raíz y evitar su reaparición.
    5. *Seguimiento Semáforo (RAG)*: Estado de atención (Verde = Implementada y Eficaz / Cerrada; Ámbar = En Proceso / En Seguimiento dentro de plazo; Rojo = Vencida o No Atendida).
    6. *Evidencia PIMS*: Localizador unívoco del registro en el repositorio institucional.

    = Cadena Consolidada de Hallazgos y Acciones Correctivas (#period-label)

    #table(
      columns: (52pt, 52pt, 1fr, 75pt, 48pt, 55pt, 75pt),
      fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
      stroke: 0.5pt + luma(190),
      align: (center, center, left, left, center, center, left),
      table.header([*Hallazgo*], [*Código NC*], [*Causa Raíz y Acción Correctiva (CAPA)*], [*Dueño / Cargo*], [*Plazo*], [*Estado RAG*], [*Evidencia PIMS*]),
      ..capa-chain-rows.map(row => (
        text(size: 7.5pt, weight: "bold")[#row.finding-id],
        text(size: 7.5pt, weight: "bold")[#row.nc-id],
        [
          #text(size: 7.5pt)[*Causa:* #row.cause]\
          #text(size: 7.5pt)[*Acción:* #row.action]
        ],
        text(size: 7.5pt)[#row.owner],
        text(size: 7.5pt)[#row.deadline],
        rag-tag(row.rag-status),
        text(size: 6.5pt)[#row.evidence-link]
      )).flatten()
    )

    = Formularios de Medidas Correctivas (Apéndice Oficial)
    A continuación se documentan los formularios individuales correspondientes a las no conformidades tratadas en el periodo, replicando todos los campos requeridos por el estándar oficial:

    #for item in form-records [
      #v(0.3cm)
      #block(
        width: 100%,
        stroke: 0.5pt + luma(180),
        radius: 3pt,
        inset: 6pt,
        breakable: false,
        [
          #table(
            columns: (1fr),
            stroke: none,
            fill: rgb("#f1f5f9"),
            inset: 5pt,
            align: left,
            [#text(weight: "bold", size: 9pt)[Medida correctiva Nro.: #item.capa-id (Ref. #item.finding-id / #item.nc-id)]]
          )
          #v(2pt)
          #table(
            columns: (130pt, 1fr),
            stroke: 0.5pt + luma(190),
            fill: (col, row) => if col == 0 { rgb("#f8fafc") } else { none },
            inset: (x: 6pt, y: 4pt),
            align: (left, left),
            [*Descripción de la no conformidad:*], [#item.description],
            [*No conformidad identificada en:*], [#item.source],
            [*Identificada por:*], [#item.identified-by],
            [*Causa de la no conformidad:*], [#item.root-cause],
            [*¿Existe no conformidad similar previa?:*], [#item.similar-nc],
            [*¿Es necesario tomar medidas correctivas?:*], [
              #if item.need-action == "SÍ" or item.need-action == "SI" [
                #text(weight: "bold", fill: rgb("#166534"))[( X ) SÍ] #h(10pt) ( ) NO
              ] else [
                ( ) SÍ #h(10pt) #text(weight: "bold", fill: rgb("#991b1b"))[( X ) NO]
              ]
            ],
            [*Medida correctiva a implementar:*], [#item.action-plan],
            [*¿Quién debe ser informado?:*], [#item.informed-parties],
            [*Aprobado por:*], [#item.approved-by],
            [*Persona responsable de implementación:*], [#item.responsible],
            [*Fecha límite para implementación:*], [#item.deadline],
            [*Medida implementada el:*], [#item.implemented-date #h(15pt) _Firma registrada en PIMS_],
            [*Efectividad revisada el:*], [
              #item.effectiveness-date #h(10pt)
              #rag-tag(item.rag-status) \
              #text(size: 7.5pt)[#item.effectiveness-notes]
            ],
            [*Cambios al SGPI o documentos:*], [#item.system-changes]
          )
        ]
      )
    ]

    = Evaluación Global de Eficacia Institucional (Cláusula 10.2.d y 10.2.e)
    #(if effectiveness-summary != (:) [
      - *Total de No Conformidades Tratadas:* #effectiveness-summary.at("total", default: "0")
      - *Acciones Implementadas y Verificadas Eficaces (Verde):* #effectiveness-summary.at("closed", default: "0")
      - *Acciones En Proceso / En Seguimiento dentro de plazo (Ámbar):* #effectiveness-summary.at("in-progress", default: "0")
      - *Acciones Vencidas o No Atendidas (Rojo):* #effectiveness-summary.at("open", default: "0")
      - *Porcentaje de Eficacia Global:* #effectiveness-summary.at("effectiveness-rate", default: "100%")
      - *Conclusión de Auditoría:* #effectiveness-summary.at("conclusion", default: "Conforme con los criterios normativos de la Cláusula 10.2.")
    ] else [
      La revisión de las medidas implementadas demuestra el cierre oportuno de las desviaciones y la mitigación efectiva de los riesgos de privacidad asociados, no habiéndose detectado recurrencias en los periodos auditados.
    ])
  ]
}
