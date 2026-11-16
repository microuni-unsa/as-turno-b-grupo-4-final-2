// mold-cap.typ — Molde parametrizado para Plan y Módulo Formativo de Capacitación y Concienciación
// Cumple con ISO/IEC 27701:2025 Cláusulas 7.2 (Competencia), 7.3 (Toma de conciencia), Control A.3.17,
// Guías B.3.17 y B.3.11, y replica la estructura del formato oficial del instructor
// "Plan de capacitación y concienciación" (tabla de competencias de 6 columnas, calendario anual y bloque de 4 responsabilidades).
// CERO datos de instancia institucional en este archivo.

#import "../common/template.typ": doc-template, status-tag, rag-tag, callout

#let mold-cap(
  metadata: (:),
  references: (),
  intro-text: none,
  tracks-summary: none,
  competence-rows: (),
  calendar-data: (),
  responsibilities: (:),
  module-sessions: (),
  evaluation-rules: none,
  ..sink
) = {
  show: doc-template.with(
    title: metadata.at("title", default: "Plan y Módulo Formativo: Respuesta a Incidentes de Privacidad"),
    code: metadata.at("code", default: "G4-CAP-INC-01"),
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
    = Objetivo, alcance y fundamentación normativa

    == Objetivo
    El presente documento establece el plan estructurado de formación, desarrollo de competencias y concienciación en privacidad de la información y seguridad de los datos personales. Su propósito central es preparar al personal institucional para desempeñar con competencia técnica sus funciones en el Sistema de Gestión de Privacidad de la Información (SGPI) y responder con máxima celeridad y eficacia ante eventos de seguridad y brechas que involucren datos personales (PII), conforme a las Cláusulas 7.2 (Competencia), 7.3 (Toma de conciencia) y el Control A.3.17 de la norma internacional ISO/IEC 27701:2025.

    == Alcance
    #(if intro-text != none { intro-text } else [
      Este plan abarca a la totalidad de funcionarios, directivos, docentes, personal administrativo, operadores de sistemas de información, coordinadores de filiales descentralizadas y enlaces técnicos involucrados en el tratamiento de datos personales en los procesos incluidos en el alcance del SGPI.
    ])

    = Arquitectura Curricular de la Academia de Privacidad
    #(if tracks-summary != none { tracks-summary } else [
      El programa institucional de formación se articula a través de cuatro pistas formativas complementarias:
      - *Pista 1: Sensibilización General en Privacidad (8 horas)*: Dirigida a toda la comunidad universitaria sobre derechos ARCO, confidencialidad y principios rectores de protección de datos personales.
      - *Pista 2: Interpretación de la Norma ISO/IEC 27701 (8 horas)*: Análisis de las cláusulas normativas de alto nivel, política, contexto y responsabilidades del Responsable del Tratamiento (PII Controller).
      - *Pista 3: Implementadores y Gestión Operativa de Formatos (16 horas)*: Capacitación técnica aplicada sobre el diligenciamiento diario de registros, dentro de la cual se inserta como eje prioritario el presente *Módulo Profundo de Respuesta a Incidentes de Privacidad (8 horas)*.
      - *Pista 4: Formación de Auditores Internos de Privacidad (16 horas)*: Técnicas y criterios de auditoría de conformidad con la norma ISO 19011.
    ])

    = Matriz Institucional de Competencias en Privacidad e Incidentes
    Con el objetivo de preparar al personal clave para que pueda cumplir sus responsabilidades en la protección de datos personales y en la respuesta ante incidentes, se establece la siguiente matriz de competencias de seis columnas:

    #table(
      columns: (70pt, 85pt, 80pt, 70pt, 50pt, 1fr),
      fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
      stroke: 0.5pt + luma(190),
      align: (left, left, left, left, center, left),
      table.header(
        [*Cargo o función*],
        [*Conocimientos y habilidades necesarias*],
        [*Qué capacitación es necesaria*],
        [*Registro de implementación*],
        [*¿Objetivos logrados?*],
        [*Conocimientos y habilidades alcanzados*]
      ),
      ..competence-rows.map(row => (
        text(size: 7.5pt, weight: "bold")[#row.role],
        text(size: 7.5pt)[#row.required-knowledge],
        text(size: 7.5pt)[#row.training-needed],
        text(size: 7.5pt)[#row.evidence-record],
        status-tag(row.achieved),
        text(size: 7.5pt)[#row.skills-gained]
      )).flatten()
    )

    = Métodos de Concienciación y Calendario Anual de Ejecución
    Para que el personal comprenda la trascendencia de la privacidad de la información, asuma su contribución activa a la eficacia del SGPI y conozca las implicancias disciplinarias y legales del incumplimiento normativo, se ejecutan métodos diversos de concienciación conforme al siguiente calendario anual:

    #table(
      columns: (120pt, 15pt, 15pt, 15pt, 15pt, 15pt, 15pt, 15pt, 15pt, 15pt, 15pt, 15pt, 15pt),
      fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
      stroke: 0.5pt + luma(190),
      align: (left, center, center, center, center, center, center, center, center, center, center, center, center),
      table.header(
        [*Método de Concienciación*],
        [*E*], [*F*], [*M*], [*A*], [*M*], [*J*], [*J*], [*A*], [*S*], [*O*], [*N*], [*D*]
      ),
      ..calendar-data.map(item => (
        text(size: 7.5pt)[#item.method],
        text(size: 7pt)[#item.at("m1", default: "")],
        text(size: 7pt)[#item.at("m2", default: "")],
        text(size: 7pt)[#item.at("m3", default: "")],
        text(size: 7pt)[#item.at("m4", default: "")],
        text(size: 7pt)[#item.at("m5", default: "")],
        text(size: 7pt)[#item.at("m6", default: "")],
        text(size: 7pt)[#item.at("m7", default: "")],
        text(size: 7pt)[#item.at("m8", default: "")],
        text(size: 7pt)[#item.at("m9", default: "")],
        text(size: 7pt)[#item.at("m10", default: "")],
        text(size: 7pt)[#item.at("m11", default: "")],
        text(size: 7pt)[#item.at("m12", default: "")]
      )).flatten()
    )

    = Asignación de Responsabilidades del Plan
    De conformidad con el estándar institucional, las responsabilidades para la gestión de este plan se distribuyen según las siguientes disposiciones:
    1. *Coordinación general*: El #responsibilities.at("coordinator", default: "Oficial de Seguridad de la Información (OSI / DPO)") es responsable de coordinar toda la capacitación, entrenamientos y actividades de concienciación del SGPI.
    2. *Mantenimiento de registros*: El #responsibilities.at("registrar", default: "Subdirector de Personal / Recursos Humanos") es el responsable de custodiar y llevar los registros de asistencia y acreditación de toda la capacitación.
    3. *Evaluación de eficacia*: El #responsibilities.at("evaluator", default: "Oficial de Seguridad de la Información (OSI / DPO)") es el responsable de evaluar objetivamente el logro de los objetivos de capacitación y la adquisición de competencias.
    4. *Custodia y administración del plan*: El #responsibilities.at("custodian", default: "Oficial de Seguridad de la Información (OSI / DPO)") es el responsable de este plan, archivado en el #responsibilities.at("archive-location", default: "repositorio digital PIMS institucional y bóveda DUTIC"); esta persona tiene derecho exclusivo para editar y actualizar este documento, debiendo conservarse este registro por un periodo mínimo de #responsibilities.at("retention", default: "3 años").

    = Estructura Curricular del Módulo de Incidentes (8 horas pedagógicas)
    El módulo especializado en respuesta a incidentes de privacidad se desarrolla en cuatro sesiones teórico-prácticas intensivas:

    #table(
      columns: (52pt, 120pt, 1fr, 50pt),
      fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
      stroke: 0.5pt + luma(190),
      align: (center, left, left, center),
      table.header([*Sesión*], [*Tema Principal*], [*Contenido Detallado y Práctico*], [*Duración*]),
      ..module-sessions.map(s => (
        text(size: 7.5pt, weight: "bold")[#s.session-num],
        text(size: 7.5pt, weight: "bold")[#s.topic],
        text(size: 7.5pt)[#s.content],
        text(size: 7.5pt)[#s.hours]
      )).flatten()
    )

    = Mecanismo de Evaluación y Medición de Eficacia (Cláusula 7.2)
    #(if evaluation-rules != none { evaluation-rules } else [
      Para verificar de manera cuantificable la adquisición efectiva de competencia técnica exigida por la Cláusula 7.2 de ISO/IEC 27701:2025, se aplica un esquema doble de evaluación:
      1. *Prueba Diagnóstica de Entrada (Pre-test)*: Instrumento inicial de 10 preguntas para determinar la línea base de conocimiento del participante.
      2. *Prueba de Suficiencia de Salida (Post-test)*: Instrumento evaluativo final de 20 preguntas (escala vigesimal 0 a 20) con resolución de casos simulados de incidentes.
      - *Criterio de Acreditación*: Calificación mínima aprobatoria de 14.0 / 20 y asistencia mínima al 100% de las sesiones. Los resultados individuales se formalizan en el registro `G4-REG-CAP-01`.
    ])
  ]
}
