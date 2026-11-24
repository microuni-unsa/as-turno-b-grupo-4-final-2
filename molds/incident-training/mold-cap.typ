// mold-cap.typ — Molde parametrizado para Plan de Capacitación y Concienciación
// Cumple con ISO/IEC 27701:2025 Cláusulas 7.2 (Competencia), 7.3 (Toma de conciencia), Control A.3.17,
// y replica la estructura exacta del formato oficial del instructor "Plan de capacitación y concienciación"
// (tabla de competencias de 6 columnas, calendario anual de 13 columnas, bloque de 4 responsabilidades y retención).
// CERO datos de instancia institucional en este archivo.
// Example caller (staging):
//   #import "mold-cap.typ": mold-cap
//   #mold-cap(metadata: (title: "...", code: "G4-CAP-INC-01", version: "4.0", ...), references: (...), competence-rows: (...), calendar-data: (...), responsibilities: (...))
// NOTE: all params NAMED; `metadata:` carries title/code/version/date/history/author/reviewer/approver.

#import "../common/template.typ": doc-template

#let mold-cap(
  metadata: (:),
  references: (),
  competence-rows: (),
  calendar-data: (),
  responsibilities: (:),
  ..sink
) = {
  show: doc-template.with(
    title: metadata.at("title", default: "Plan de capacitación y concienciación"),
    short-title: metadata.at("short-title", default: none),
    code: metadata.at("code", default: "G4-CAP-INC-01"),
    version: metadata.at("version", default: "3.0"),
    date: metadata.at("date", default: "2025-10-28"),
    confidentiality: metadata.at("confidentiality", default: "CONFIDENCIAL - USO INTERNO UNSA"),
    author: metadata.at("author", default: (name: "", role: "", date: "")),
    reviewer: metadata.at("reviewer", default: (name: "", role: "", date: "")),
    approver: metadata.at("approver", default: (name: "", role: "", date: "")),
    history: metadata.at("history", default: ()),
    validity: none,
    references: (),
    owner-role: none,
    show-signature: true,
  )

  [
    Con el objetivo de preparar a ese personal para que pueda cumplir una función en la seguridad de la información y la protección de datos personales (PII), se debe llevar a cabo la siguiente capacitación:

    #v(0.2cm)
    #table(
      columns: (80pt, 1.15fr, 85pt, 65pt, 68pt, 1.1fr),
      fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
      stroke: 0.5pt + luma(190),
      align: (left, left, left, left, center, left),
      table.header(
        [*Cargo o nombre*],
        [*Conocimientos y habilidades necesarias para la privacidad y protección de PII*],
        [*Qué capacitación es necesaria*],
        [*Registro de implementación de capacitación necesaria*],
        [*¿Se han logrado los objetivos de la capacitación?*],
        [*Conocimientos, habilidades y experiencia logrados*]
      ),
      ..competence-rows.map(row => (
        [*#row.at("role", default: "")*],
        [#row.at("required-knowledge", default: "")],
        [#row.at("training-needed", default: "")],
        [#row.at("evidence-record", default: "")],
        [*#row.at("achieved", default: "SÍ")*],
        [#row.at("skills-gained", default: "")]
      )).flatten()
    )

    #v(0.3cm)
    Para que el personal comprenda la importancia de la gestión de la seguridad de la información y de su propio aporte al SGPI, y para que acepte las políticas y planes y comprenda las consecuencias de violar las normas de seguridad de la información y privacidad, se deben aplicar los siguientes métodos de concienciación: día informativo de la privacidad, artículos en Intranet, boletín informativo, reuniones, E-learning, mensajes de correo electrónico internos, grabaciones en vídeo, simulacro de respuesta a incidentes / brechas de datos.

    La implementación de capacitación y concienciación está programada de la siguiente forma:

    #v(0.2cm)
    #table(
      columns: (1fr, 18pt, 18pt, 18pt, 18pt, 18pt, 18pt, 18pt, 18pt, 18pt, 18pt, 18pt, 18pt),
      fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
      stroke: 0.5pt + luma(190),
      align: (left, center, center, center, center, center, center, center, center, center, center, center, center),
      table.header(
        [*Método de concienciación*],
        [*E*], [*F*], [*M*], [*A*], [*M*], [*J*], [*J*], [*A*], [*S*], [*O*], [*N*], [*D*]
      ),
      ..calendar-data.map(item => (
        [#item.at("method", default: "")],
        [#item.at("m1", default: "")],
        [#item.at("m2", default: "")],
        [#item.at("m3", default: "")],
        [#item.at("m4", default: "")],
        [#item.at("m5", default: "")],
        [#item.at("m6", default: "")],
        [#item.at("m7", default: "")],
        [#item.at("m8", default: "")],
        [#item.at("m9", default: "")],
        [#item.at("m10", default: "")],
        [#item.at("m11", default: "")],
        [#item.at("m12", default: "")]
      )).flatten()
    )

    #v(0.4cm)
    = Responsabilidades

    - El #responsibilities.at("coordinator", default: "Oficial de Seguridad de la Información (OSI) / DPO") es responsable de coordinar toda la capacitación y concienciación.
    - El #responsibilities.at("registrar", default: "Subdirector de Personal / Recursos Humanos") es el responsable de llevar los registros de toda la capacitación.
    - El #responsibilities.at("evaluator", default: "Oficial de Seguridad de la Información (OSI) / DPO") es el responsable de evaluar el logro de los objetivos de capacitación.
    - El #responsibilities.at("custodian", default: "Oficial de Seguridad de la Información (OSI) / DPO") es el responsable de este plan, archivado en #responsibilities.at("archive-location", default: "repositorio institucional PIMS (GESTITEL) y bóveda DUTIC"); y esta persona tiene un derecho exclusivo para editar y modificar el documento; este registro se debe guardar por #responsibilities.at("retention", default: "3 años").
  ]
}
