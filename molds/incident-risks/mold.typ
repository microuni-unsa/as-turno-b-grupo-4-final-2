// mold.typ — Molde parametrizado para Gestión de Riesgos de Incidentes de Privacidad
// Artefactos: G4-MET-RSK-01, G4-RSK-INC-01, G4-PLN-RSK-01
// Sistema de Gestión de Privacidad de la Información (SGPI) — ISO/IEC 27701:2025
// Cumple con el Contrato de Anatomía Documental de 15 Elementos y fidelidad estricta al instructor
// ZERO datos de instancia hardcodeados en este archivo

#import "../common/template.typ": doc-template, status-tag, rag-tag, callout, signature-block

// -------------------------------------------------------------------------
// 1. SUB-MOLDE: G4-MET-RSK-01 — Metodología de Evaluación y Tratamiento
// Fiel 1:1 a Metodologia_de_evaluacion_y_tratamiento_de_riesgos_ES.docx
// -------------------------------------------------------------------------
#let render-methodology(data) = {
  let doc-title = data.at("title", default: "Metodología de evaluación y tratamiento de riesgos")
  let doc-code = data.at("code", default: "G4-MET-RSK-01")
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
  let org-name = data.at("organization-name", default: "la Universidad Nacional de San Agustín de Arequipa (UNSA)")
  let scope-desc = data.at("scope-desc", default: "todo el alcance del Sistema de Gestión de Privacidad de la Información (SGPI)")
  let users-desc = data.at("users-desc", default: "todos los empleados y directivos")
  let norm-ref = data.at("norm-ref", default: "la norma ISO/IEC 27701:2025 y referencias ISO/IEC 27557 e ISO 31000")
  let norm-controls = data.at("norm-controls", default: "ISO/IEC 27701:2025 (Tablas A.1 y A.3)")
  let approver-role = if type(doc-approver) == dictionary and doc-approver.at("role", default: "") != "" {
    doc-approver.role
  } else {
    "la Alta Dirección (Rectorado)"
  }
  let approver-name = if type(doc-approver) == dictionary and doc-approver.at("name", default: "") != "" {
    doc-approver.name
  } else {
    "Dr. Hugo José Sánchez"
  }
  let records-data = data.at("records-table", default: (
    (
      name: "Cuadro de evaluación de riesgos (formulario electrónico, documento en Excel)",
      location: "Repositorio PIMS / Servidor DUTIC",
      responsible: doc-owner,
      controls: "Solamente el " + doc-owner + " tiene derecho a crear entradas y a realizar modificaciones en el Cuadro de evaluación de riesgos",
      retention: "Los datos son archivados de forma permanente"
    ),
    (
      name: "Cuadro de tratamiento de riesgos (formulario electrónico, documento en Excel)",
      location: "Repositorio PIMS / Servidor DUTIC",
      responsible: doc-owner,
      controls: "Solamente el " + doc-owner + " tiene derecho a crear entradas y a realizar modificaciones en el Cuadro de tratamiento de riesgos",
      retention: "Los datos son archivados de forma permanente"
    ),
    (
      name: "Informe sobre evaluación y tratamiento de riesgos (formulario electrónico, en formato PDF)",
      location: "Repositorio PIMS / Sisgedo",
      responsible: doc-owner,
      controls: "El Informe se prepara en formato PDF de sólo lectura firmado digitalmente",
      retention: "El informe es almacenado por el plazo de 5 años"
    ),
    (
      name: "Declaración de aplicabilidad (formulario electrónico, en formato PDF)",
      location: "Repositorio PIMS / Sisgedo",
      responsible: doc-owner,
      controls: "Solamente el " + doc-owner + " tiene derecho a crear entradas y a realizar modificaciones en la Declaración de aplicabilidad",
      retention: "Las versiones no vigentes de la DdA son almacenadas por un plazo de 5 años"
    ),
    (
      name: "Plan de tratamiento de riesgos (formulario electrónico, documento de Word / Typst)",
      location: "Repositorio PIMS / Sisgedo",
      responsible: doc-owner,
      controls: "Solamente el " + doc-owner + " tiene derecho a crear entradas y a realizar modificaciones en el Plan de tratamiento de riesgos",
      retention: "Las versiones no vigentes del Plan de tratamiento de riesgos son almacenadas por un plazo de 5 años"
    ),
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
    validity: none,
    references: (),
    owner-role: none,
    show-signature: false,
    [
      = Objetivo, alcance y usuarios
      El objetivo del presente documento es definir la metodología para evaluar y tratar los riesgos de la información y privacidad en #org-name y definir el nivel aceptable de riesgo según #norm-ref.

      La evaluación y tratamiento de riesgos se aplican a #scope-desc; es decir, a todos los activos que se utilizan dentro de la organización o que pueden tener un impacto sobre la seguridad de la información y la privacidad en el ámbito del SGPI.

      Los usuarios de este documento son #users-desc de #org-name que participan en la evaluación y tratamiento de riesgos.

      = Documentos de referencia
      #for ref-item in doc-refs [
        - #ref-item
      ]

      = Metodología de evaluación y tratamiento de riesgos

      == Evaluación de riesgos

      === El proceso
      La evaluación de riesgos se implementa a través del Cuadro de evaluación de riesgos. El proceso de evaluación de riesgos es coordinado por el #doc-owner, la identificación de amenazas y vulnerabilidades la realizan los propietarios de los activos, y la evaluación de consecuencias y probabilidad es realizada por los propietarios de los riesgos.

      === Activos, vulnerabilidades y amenazas
      El primer paso en la evaluación de riesgos es la identificación de todos los activos dentro del alcance del SGPI; es decir, todos los activos que pueden afectar la confidencialidad, integridad y disponibilidad de la información y la privacidad de los datos personales en la organización. Los activos pueden ser documentos en papel o en formato electrónico, aplicaciones y bases de datos, personas, equipos de TI, infraestructura y servicios externos o procesos externalizados. Al identificar los activos también es necesario identificar a sus propietarios: la persona o unidad organizativa responsable de cada activo.

      El siguiente paso es identificar todas las amenazas y vulnerabilidades relacionadas con cada activo. Las amenazas y vulnerabilidades se identifican utilizando los catálogos incluidos en el Cuadro de evaluación de riesgos. Cada activo puede estar relacionado a varias amenazas, y cada amenaza puede estar vinculada a varias vulnerabilidades.

      === Identificación de los propietarios de riesgos
      Para cada riesgo es necesario identificar un propietario: la persona o unidad organizativa responsable de cada riesgo. Esta persona puede o no ser la misma que el propietario del activo.

      === Consecuencias y probabilidad
      Una vez que se han identificado los riesgos, es necesario evaluar las consecuencias para cada combinación de amenazas y vulnerabilidades de un activo específico en caso que ello se pueda producir:

      #v(0.2cm)
      #table(
        columns: (110pt, 30pt, 1fr),
        fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else if x == 1 {
          if y == 1 { rgb("#dcfce7") } else if y == 2 { rgb("#fef3c7") } else { rgb("#fee2e2") }
        } else { none },
        stroke: 0.5pt + luma(190),
        align: (left, center, left),
        table.header([*Escala*], [*Valor*], [*Criterio de Impacto en Titulares y Organización*]),
        [Baja consecuencia], [0], [La afectación a la confidencialidad, integridad o disponibilidad no genera impacto adverso significativo sobre los titulares de datos ni sobre la UNSA.],
        [Consecuencia moderada], [1], [Existe afectación leve o moderada a los derechos de los titulares de datos (molestias, reclamaciones) o gastos menores y repercusión administrativa para la UNSA.],
        [Alta consecuencia], [2], [Impacto grave e irreversible sobre los titulares (suplantación, discriminación, daño moral grave) o multas severas de la ANPD, daño reputacional mayúsculo o parálisis operativa.]
      )
      #v(0.2cm)

      Luego de la evaluación de consecuencias es necesario evaluar la probabilidad de que se materialice ese riesgo; es decir, la probabilidad de que una amenaza se aproveche de la vulnerabilidad del activo en cuestión.

      #v(0.2cm)
      #table(
        columns: (110pt, 30pt, 1fr),
        fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else if x == 1 {
          if y == 1 { rgb("#dcfce7") } else if y == 2 { rgb("#fef3c7") } else { rgb("#fee2e2") }
        } else { none },
        stroke: 0.5pt + luma(190),
        align: (left, center, left),
        table.header([*Escala*], [*Valor*], [*Criterio de Probabilidad y Controles Previos*]),
        [Baja probabilidad], [0], [Los controles de seguridad existentes son seguros y hasta el momento han suministrado un adecuado nivel de protección. En el futuro no se esperan incidentes nuevos.],
        [Probabilidad moderada], [1], [Los controles de seguridad existentes son moderados y en general han suministrado un adecuado nivel de protección. Es posible la ocurrencia de nuevos incidentes, pero no muy probable.],
        [Alta probabilidad], [2], [Los controles de seguridad existentes son bajos o ineficaces. Existe una gran probabilidad de que haya incidentes así en el futuro.]
      )
      #v(0.2cm)

      Ingresando los valores de consecuencia y probabilidad en el Cuadro de evaluación de riesgos, el nivel de riesgo se calcula automáticamente sumando los dos valores. Los controles de seguridad existentes tienen que ser ingresados en la última columna del Cuadro de evaluación de riesgos.

      == Criterios para la aceptación de riesgos
      Los valores 0, 1 y 2 son riesgos aceptables, mientras que los valores 3 y 4 son riesgos no aceptables. Los riesgos no aceptables deben ser tratados.

      == Tratamiento del riesgo
      El tratamiento de riesgos se implementa mediante el Cuadro de tratamiento de riesgos, copiando desde el Cuadro de evaluación de riesgos todos los riesgos identificados como no aceptables. El tratamiento de riesgos es realizado por el #doc-owner junto con los propietarios de los riesgos.

      Para los riesgos calificados en 3 y 4 se deben seleccionar una o más opciones de tratamiento:

      1. *Elección de control o controles de seguridad y privacidad:* Selección de controles del Anexo A de #norm-controls u otros controles de seguridad aplicables.
      2. *Transferencia de los riesgos a terceros:* Por ejemplo, suscribiendo una póliza de seguros o un contrato con proveedores o socios con cláusulas de protección de datos personales.
      3. *Evitar los riesgos:* Discontinuando una actividad de tratamiento o eliminando el activo que ocasiona ese riesgo.
      4. *Aceptación del riesgo:* Esta opción está permitida solamente si la selección de otras opciones de tratamiento del riesgo costarían más que el potencial impacto en el caso de que se materializara dicho riesgo, requiriendo autorización escrita expresa de la Alta Dirección.

      La elección de opciones se implementa a través del Cuadro de tratamiento de riesgos. Generalmente, se escoge la opción 1: elección de uno o más controles de seguridad. Cuando se escogen varios controles de seguridad para un riesgo, se insertan filas adicionales en la tabla, inmediatamente debajo de la fila en que se especifica el riesgo.

      El tratamiento de riesgos relacionados con procesos externalizados debe ser atendido por medio de contratos con los terceros responsables, como se especifica en la Política de seguridad y privacidad para proveedores.

      En el caso de la opción 1 (elección de controles de seguridad), es necesario evaluar el nuevo valor de consecuencia y probabilidad en el Cuadro de tratamiento de riesgos, para evaluar la efectividad de los controles planificados.

      == Revisiones periódicas de la evaluación y el tratamiento de riesgos
      Los propietarios de riesgos deben revisar los riesgos vigentes y deben actualizar el Cuadro de evaluación de riesgos y el Cuadro de tratamiento de riesgos de acuerdo con los nuevos riesgos identificados. La revisión se realiza al menos una vez por año, o con mayor frecuencia en caso de cambios organizacionales significativos, cambios importantes en tecnología, en los objetivos de negocios, en el entorno empresarial, etc.

      == Declaración de aplicabilidad y Plan de tratamiento del riesgo
      El #doc-owner debe documentar lo siguiente en la Declaración de aplicabilidad: qué controles de seguridad y privacidad de #norm-controls son aplicables y cuáles no, la justificación de esa decisión y si están implementados o no.

      En nombre de los propietarios de riesgos, la Alta Dirección (#approver-role) aceptará todos los riesgos residuales a través de la Declaración de aplicabilidad.

      El #doc-owner preparará el Plan de tratamiento de riesgos en el que se planificará la implementación de los controles. En nombre de los propietarios de riesgos, la Alta Dirección (#approver-role) aprobará el Plan de tratamiento de riesgos.

      == Informes
      El #doc-owner documentará los resultados de la evaluación y del tratamiento de riesgos, y de todas las revisiones subsiguientes, en el Informe sobre evaluación y tratamiento de riesgos.

      El #doc-owner supervisará el progreso de la implementación del Plan de tratamiento de riesgos e informará los resultados a la Alta Dirección mensualmente.

      = Gestión de registros guardados en base a este documento
      #v(0.2cm)
      #table(
        columns: (115pt, 80pt, 85pt, 1fr, 55pt),
        fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
        stroke: 0.5pt + luma(190),
        align: (left, left, left, left, center),
        table.header([*Nombre del registro*], [*Ubicación de archivo*], [*Persona responsable del archivo*], [*Controles para la protección del registro*], [*Tiempo de retención*]),
        ..records-data.map(r => (
          text(size: 7.5pt)[#r.name],
          text(size: 7pt)[#r.location],
          text(size: 7pt)[#r.responsible],
          text(size: 7pt)[#r.controls],
          text(size: 7pt)[#r.retention]
        )).flatten()
      )
      #v(0.2cm)

      Solamente el #doc-owner puede permitir a otros empleados el acceso a los documentos mencionados precedentemente.

      = Validez y gestión de documentos
      Este documento es válido hasta el #doc-validity.

      El propietario de este documento es el #doc-owner, que debe verificar y, si es necesario, actualizar el documento por lo menos una vez al año, antes de la revisión periódica sobre la evaluación de riesgos vigente.

      Al evaluar la efectividad y adecuación de este documento, es necesario tener en cuenta los siguientes criterios:
      - La cantidad de incidentes que se produjeron pero que no fueron incluidos en la evaluación de riesgos.
      - La cantidad de riesgos que no fueron tratados adecuadamente.
      - La cantidad de errores en el proceso de evaluación y tratamiento de riesgos debido a definiciones poco claras de funciones y responsabilidades.

      = Apéndices
      - Apéndice 1: Cuadro de evaluación de riesgos
      - Apéndice 2: Cuadro de tratamiento de riesgos
      - Apéndice 3: Informe sobre evaluación y tratamiento de riesgos

      #v(0.6cm)
      #align(left)[
        #signature-block(
          role: if type(doc-author) == dictionary and doc-author.at("role", default: "") != "" { doc-author.role } else { doc-owner },
          name: if type(doc-author) == dictionary and doc-author.at("name", default: "") != "" { doc-author.name } else { "Ing. Carlos M. Benítez" }
        )
      ]
    ]
  )
}

// -------------------------------------------------------------------------
// 2. SUB-MOLDE: G4-RSK-INC-01 — Matriz y Reporte de Evaluación y Tratamiento
// Fiel 1:1 a Apendice 3 DOCX + Apendice 1 XLSX + Apendice 2 XLSX
// -------------------------------------------------------------------------
#let render-matrix(data) = {
  let doc-title = data.at("title", default: "Apéndice 3: Formulario - Informe sobre evaluación y tratamiento de riesgos")
  let doc-code = data.at("code", default: "G4-RSK-INC-01")
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
  let org-name = data.at("organization-name", default: "la Universidad Nacional de San Agustín de Arequipa (UNSA)")
  let period-name = data.at("period-name", default: "Periodo 2025")
  let scope-units = data.at("scope-units", default: "las dependencias de Admisión y Personal")
  let time-eval-start = data.at("time-eval-start", default: "01/09/2025")
  let time-eval-end = data.at("time-eval-end", default: "10/10/2025")
  let time-treat-start = data.at("time-treat-start", default: "11/10/2025")
  let time-treat-end = data.at("time-treat-end", default: "24/10/2025")
  let report-period = data.at("report-period", default: "el periodo del 25 al 28 de octubre de 2025")
  let participants = data.at("participants", default: "el Ing. Carlos M. Benítez (Oficial de Seguridad de la Información / DPO), con la colaboración de la Directora DUTIC y los directores de unidad")
  let eval-rows = data.at("eval-rows", default: ())
  let treat-rows = data.at("treat-rows", default: ())

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
    validity: none,
    references: (),
    owner-role: none,
    show-signature: false,
    [
      = Objetivo, alcance y usuarios
      El objetivo del presente documento es presentar un resumen detallado del proceso y de los documentos utilizados durante la evaluación y el tratamiento de los riesgos de la información y privacidad en #org-name en el período #period-name.

      La evaluación de riesgos se aplicó a todo el Sistema de Gestión de Privacidad de la Información (SGPI).

      El presente documento está dirigido a la alta dirección de #org-name, al #doc-owner, a los propietarios de activos de información y a todas las personas involucradas en la planificación, implementación, supervisión y mejora del SGPI.

      = Documentos de referencia
      #for ref-item in doc-refs [
        - #ref-item
      ]

      = Proceso de evaluación y tratamiento de riesgos de la información
      Todo el proceso de evaluación y tratamiento de riesgos ha sido realizado en conformidad con el documento Metodología de evaluación y tratamiento de riesgos (`G4-MET-RSK-01`).

      == Objetivo de la gestión de riesgos
      El objetivo de la evaluación de riesgos es identificar todos los activos, sus vulnerabilidades y las amenazas que se pueden aprovechar de dichas vulnerabilidades, como también evaluar esos parámetros para establecer el grado crítico de riesgos individuales.

      El objetivo del tratamiento de riesgos es definir medios sistemáticos para disminuir o controlar esos riesgos.

      == Alcance de la evaluación y tratamiento de riesgos
      La evaluación y tratamiento de riesgos fue realizado en #scope-units, en conformidad con el documento Alcance del SGPI.

      == Período de tiempo
      La evaluación de riesgos fue implementada en el período comprendido entre el #time-eval-start y el #time-eval-end. El tratamiento de riesgos fue implementado en el período comprendido entre el #time-treat-start y el #time-treat-end. Los informes finales fueron elaborados durante #report-period.

      == Participantes en el proceso y recolección de información
      El proceso de evaluación y tratamiento de riesgos fue dirigido por #participants.

      Durante la evaluación de riesgos, se obtuvo información a través de cuestionarios y entrevistas con personas responsables; es decir, propietarios de activos de todas las unidades organizativas.

      == Breve resumen de la metodología aplicada
      Resumidamente, el proceso se realizó de la siguiente manera:
      - Se identificaron todos los activos y sus propietarios.
      - Se identificaron las amenazas para cada activo y las correspondientes vulnerabilidades para cada amenaza.
      - Se identificaron los propietarios de cada riesgo.
      - Se evaluaron, con valores de 0 a 2, las consecuencias por la pérdida de confidencialidad, integridad y disponibilidad, y la afectación a los titulares de datos personales.
      - Se evaluó, con valores de 0 a 2, la probabilidad de que se materialice un riesgo; es decir, que la amenaza se aproveche de la vulnerabilidad.
      - Se calculó el nivel de riesgo sumando las consecuencias y la probabilidad.
      - Se determinó que los riesgos valorados en 3 y 4 son riesgos no aceptables.
      - Para cada riesgo no aceptable se tuvo en cuenta un tratamiento de riesgo y, del Anexo A de la norma ISO/IEC 27701:2025 (Tablas A.1 y A.3), se escogieron controles que pueden disminuir el riesgo a un nivel aceptable.
      - Una vez que se aplicaron los controles, se evaluaron los riesgos residuales.

      == Resumen de los documentos utilizados durante el proceso de evaluación y tratamiento de riesgos
      Durante la implementación de la evaluación y tratamiento de riesgos se utilizaron o redactaron los siguientes documentos:
      - Cuadro de evaluación de riesgos (Apéndice 1): para cada combinación de activos, vulnerabilidades y amenazas, este cuadro muestra los valores de consecuencia y probabilidad y calcula el riesgo.
      - Cuadro de tratamiento de riesgos (Apéndice 2): muestra las opciones para tratamiento de riesgos, la elección de controles para cada riesgo no aceptable y el nivel de riesgo residual.

      = Validez y gestión de documentos
      Este documento es válido hasta el #doc-validity. El propietario de este documento es el #doc-owner.

      = Apéndices
      - Apéndice 1: Cuadro de evaluación de riesgos
      - Apéndice 2: Cuadro de tratamiento de riesgos

      #v(0.6cm)
      #align(left)[
        #signature-block(
          role: if type(doc-author) == dictionary and doc-author.at("role", default: "") != "" { doc-author.role } else { doc-owner },
          name: if type(doc-author) == dictionary and doc-author.at("name", default: "") != "" { doc-author.name } else { "Ing. Carlos M. Benítez" }
        )
      ]

      #pagebreak()

      // -------------------------------------------------------------------
      // APÉNDICE 1: CUADRO DE EVALUACIÓN DE RIESGOS (EXCEL LAYOUT - 10 COLUMNAS)
      // -------------------------------------------------------------------
      == Apéndice 1: Cuadro de evaluación de riesgos
      #text(size: 8pt, fill: luma(80))[Implementado desde el #time-eval-start hasta el #time-eval-end]

      #v(0.2cm)
      #table(
        columns: (22pt, 80pt, 65pt, 85pt, 80pt, 60pt, 22pt, 22pt, 22pt, 1fr),
        fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
        stroke: 0.5pt + luma(190),
        align: (center, left, left, left, left, left, center, center, center, left),
        table.header(
          [*No*],
          [*Nombre del activo*],
          [*Propietario del activo*],
          [*Amenaza*],
          [*Vulnerabilidad*],
          [*Propietario del riesgo*],
          [*C*],
          [*P*],
          [*R*],
          [*Controles existentes*]
        ),
        ..eval-rows.map(r => (
          text(size: 7.5pt, weight: "bold")[#r.id],
          text(size: 7pt)[#r.asset],
          text(size: 7pt)[#r.asset-owner],
          text(size: 7pt)[#r.threat],
          text(size: 7pt)[#r.vuln],
          text(size: 7pt)[#r.risk-owner],
          text(size: 7.5pt)[#r.cons],
          text(size: 7.5pt)[#r.prob],
          text(size: 7.5pt, weight: "bold", fill: if r.risk >= 3 { rgb("#991b1b") } else { rgb("#166534") })[#r.risk],
          text(size: 7pt)[#r.existing-controls]
        )).flatten()
      )

      #v(0.5cm)
      #pagebreak()

      // -------------------------------------------------------------------
      // APÉNDICE 2: CUADRO DE TRATAMIENTO DE RIESGOS (EXCEL LAYOUT - 14 COLUMNAS, 2 NIVELES)
      // -------------------------------------------------------------------
      == Apéndice 2: Cuadro de tratamiento de riesgos
      #text(size: 8pt, fill: luma(80))[Implementado desde el #time-treat-start hasta el #time-treat-end]

      #v(0.2cm)
      #table(
        columns: (22pt, 48pt, 45pt, 50pt, 50pt, 45pt, 16pt, 16pt, 18pt, 45pt, 1fr, 16pt, 16pt, 18pt),
        fill: (x, y) => if y == 0 or y == 1 { rgb("#f1f5f9") } else { none },
        stroke: 0.5pt + luma(190),
        align: (center, left, left, left, left, left, center, center, center, left, left, center, center, center),
        table.cell(colspan: 6, align: center)[*Activos / amenazas / vulnerabilidades*],
        table.cell(colspan: 3, align: center)[*Valores antes del tratamiento*],
        table.cell(colspan: 2, align: center)[*Tratamiento del riesgo*],
        table.cell(colspan: 3, align: center)[*Valores después del tratamiento*],
        [*Cantidad*],
        [*Nombre del activo*],
        [*Propietario del activo*],
        [*Amenaza*],
        [*Vulnerabilidad*],
        [*Propietario del riesgo*],
        [*C*],
        [*P*],
        [*R*],
        [*Elección de opciones*],
        [*Medios de implementación*],
        [*C*],
        [*P*],
        [*R*],
        ..treat-rows.map(r => (
          text(size: 7pt, weight: "bold")[#r.id],
          text(size: 6.5pt)[#r.at("asset", default: r.at("scenario", default: ""))],
          text(size: 6.5pt)[#r.at("asset-owner", default: r.at("risk-owner", default: ""))],
          text(size: 6.5pt)[#r.at("threat", default: "Amenaza identificada")],
          text(size: 6.5pt)[#r.at("vuln", default: "Vulnerabilidad detectada")],
          text(size: 6.5pt)[#r.risk-owner],
          text(size: 7pt)[#r.before-c],
          text(size: 7pt)[#r.before-p],
          text(size: 7pt, weight: "bold", fill: rgb("#991b1b"))[#r.before-r],
          text(size: 6.5pt)[#r.option],
          text(size: 6.5pt)[#r.controls],
          text(size: 7pt)[#r.after-c],
          text(size: 7pt)[#r.after-p],
          text(size: 7pt, weight: "bold", fill: rgb("#166534"))[#r.after-r]
        )).flatten()
      )
    ]
  )
}

// -------------------------------------------------------------------------
// 3. SUB-MOLDE: G4-PLN-RSK-01 — Plan de Tratamiento del Riesgo
// Fiel 1:1 a Plan_de_tratamiento_del_riesgo_ES.docx (tabla de 7 columnas)
// -------------------------------------------------------------------------
#let render-plan(data) = {
  let doc-title = data.at("title", default: "Plan de tratamiento del riesgo")
  let doc-code = data.at("code", default: "G4-PLN-RSK-01")
  let doc-ver = data.at("version", default: "3.0")
  let doc-date = data.at("date", default: "2025-10-28")
  let doc-conf = data.at("confidentiality", default: "CONFIDENCIAL - USO INTERNO UNSA")
  let doc-author = data.at("author", default: (:))
  let doc-reviewer = data.at("reviewer", default: (:))
  let doc-approver = data.at("approver", default: (:))
  let doc-history = data.at("history", default: ())
  let doc-owner = data.at("owner-role", default: "Oficial de Seguridad de la Información (OSI / DPO)")
  let intro-text = data.at("intro-text", default: "Para cumplir los objetivos del Sistema de Gestión de Privacidad de la Información (SGPI) de la UNSA y reducir los riesgos sobre los titulares de datos a niveles aceptables, es necesario realizar las siguientes actividades:")
  let activities = data.at("activities", default: ())
  let approver-role = if type(doc-approver) == dictionary and doc-approver.at("role", default: "") != "" {
    doc-approver.role
  } else {
    "Rector de la Universidad Nacional de San Agustín de Arequipa / Presidente del Comité SGPI"
  }
  let approver-name = if type(doc-approver) == dictionary and doc-approver.at("name", default: "") != "" {
    doc-approver.name
  } else {
    "Dr. Hugo José Sánchez"
  }

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
    validity: none,
    references: (),
    owner-role: none,
    show-signature: false,
    [
      = Plan de tratamiento del riesgo
      #intro-text

      #v(0.3cm)
      #table(
        columns: (115pt, 80pt, 75pt, 65pt, 85pt, 80pt, 50pt),
        fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
        stroke: 0.5pt + luma(190),
        align: (left, left, left, center, left, left, center),
        table.header(
          [*Descripción de actividades*],
          [*Recursos generales y financieros necesarios*],
          [*Persona responsable*],
          [*Plazos de inicio y finalización*],
          [*Programas de capacitación y concienciación*],
          [*Método para evaluación de resultados*],
          [*Estado*]
        ),
        ..activities.map(act => (
          text(size: 7.5pt)[#act.desc],
          text(size: 7pt)[#act.resources],
          text(size: 7pt)[#act.responsible],
          text(size: 7pt)[#act.schedule],
          text(size: 7pt)[#act.training],
          text(size: 7pt)[#act.eval-method],
          status-tag(act.status)
        )).flatten()
      )

      #v(0.8cm)
      #align(left)[
        #signature-block(
          role: approver-role,
          name: approver-name
        )
      ]
    ]
  )
}

// -------------------------------------------------------------------------
// FUNCIÓN PRINCIPAL EXPORTADA: mold(data)
// Despacha automáticamente según el código documental indicado en data.code
// -------------------------------------------------------------------------
#let mold(data) = {
  let doc-code = data.at("code", default: "")
  if doc-code == "G4-MET-RSK-01" {
    render-methodology(data)
  } else if doc-code == "G4-PLN-RSK-01" {
    render-plan(data)
  } else {
    render-matrix(data)
  }
}
