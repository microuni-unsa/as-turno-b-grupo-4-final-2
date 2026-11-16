// mold.typ — Molde parametrizado para Gestión de Riesgos de Incidentes de Privacidad
// Artefactos: G4-RSK-INC-01 (v1, v2, v3), G4-MET-RSK-01 (v3), G4-PLN-RSK-01 (v3)
// Sistema de Gestión de Privacidad de la Información (SGPI) — ISO/IEC 27701:2025
// Cumple con el Contrato de Anatomía Documental de 15 Elementos

#import "../common/template.typ": doc-template, status-tag, rag-tag, callout, reference-docs, signature-block

// -------------------------------------------------------------------------
// 1. SUB-MOLDE: G4-MET-RSK-01 — Metodología de Evaluación y Tratamiento
// Estructura réplica del documento del instructor: Metodologia_de_evaluacion_y_tratamiento_de_riesgos_ES.docx
// -------------------------------------------------------------------------
#let render-methodology(data) = {
  let doc-title = data.at("title", default: "Metodología de Evaluación y Tratamiento de Riesgos de Privacidad")
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
  let scope-desc = data.at("scope-desc", default: "todos los procesos, activos de información y tratamientos de datos personales (PII) bajo el alcance del SGPI institucional")

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
      = Objetivo, alcance y usuarios
      El objetivo del presente documento es definir la metodología integral para identificar, evaluar y tratar los riesgos de seguridad de la información y privacidad en #org-name, así como establecer el umbral formal de riesgo aceptable institucional en estricta conformidad con las Cláusulas 6.1.2 y 6.1.3 de la norma internacional *ISO/IEC 27701:2025* (Segunda edición, PIMS independiente).

      La evaluación y el tratamiento de riesgos se aplican a #scope-desc; es decir, a todos los activos físicos, lógicos, humanos y procedimentales vinculados a la recolección, almacenamiento, procesamiento y transferencia de datos personales (PII).

      Los usuarios de este documento son todos los colaboradores, directores de unidades orgánicas, custodios de activos y dueños de riesgos de #org-name que participan en la planificación, operación, auditoría y mejora continua del SGPI.

      #callout(title: "ENFOQUE DUAL OBLIGATORIO DE PRIVACIDAD (CLÁUSULA 6.1.2)", color: rgb("#0284c7"))[
        A diferencia de los sistemas tradicionales ISO/IEC 27001, la gestión de riesgos del SGPI exige evaluar las consecuencias potenciales no solo para la organización (impacto financiero, operativo y reputacional), sino primordialmente para los titulares de los datos personales (*PII principals*), considerando la posible vulneración a sus derechos fundamentales, discriminación o afectación patrimonial.
      ]

      = Metodología de evaluación y tratamiento de riesgos

      == Evaluación de riesgos

      === El proceso
      La evaluación de riesgos se ejecuta formalmente a través del *Cuadro de Evaluación de Riesgos* (Apéndice 1). El proceso es coordinado y supervisado técnicamente por el #doc-owner. La identificación de activos, amenazas y vulnerabilidades es realizada por los respectivos propietarios de los activos de información, mientras que la valoración de consecuencias y probabilidades corresponde a los propietarios designados de cada riesgo.

      === Activos, vulnerabilidades y amenazas
      El primer paso en la evaluación es la identificación exhaustiva de todos los activos dentro del alcance del SGPI que puedan incidir sobre la confidencialidad, integridad, disponibilidad o privacidad de los datos personales. Los activos clasificados comprenden:
      - *Documentos y soportes físicos:* Expedientes de postulantes, padrones biométricos, boletas y legajos salariales.
      - *Sistemas y bases de datos:* Portal web de admisiones, sistemas de nómina, bases PostgreSQL y servicios de directorio.
      - *Equipamiento de TI y terminales:* Servidores centrales, firewalls, enlaces VPN, computadoras de escritorio y terminales portátiles en filiales regionales.
      - *Personal y operadores:* Personal de ventanilla, operadores de nómina, soporte técnico y docentes.
      - *Servicios externos:* Enlaces de telecomunicaciones, pasarelas de pago y servicios de custodia documental.

      Para cada activo identificado se determina su respectivo propietario institucional. Posteriormente, se asocian las amenazas y vulnerabilidades aplicables utilizando el catálogo institucional adaptado a privacidad, reconociendo que un activo puede estar expuesto a múltiples amenazas concurrentes.

      === Identificación de los propietarios de riesgos
      Para cada riesgo evaluado se designa formalmente a un *propietario del riesgo* (*risk owner*), correspondiente a la jefatura o dirección con autoridad y presupuesto suficiente para decidir e implementar medidas de tratamiento.

      === Consecuencias y probabilidad
      Identificados los escenarios de riesgo, se procede a estimar la consecuencia de su eventual materialización en una escala cualitativa y cuantitativa de tres niveles (0 a 2):

      #v(0.2cm)
      #table(
        columns: (80pt, 30pt, 1fr),
        fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
        stroke: 0.5pt + luma(190),
        align: (left, center, left),
        table.header([*Nivel de Consecuencia*], [*Valor*], [*Criterio Operacional y Afectación a Titulares / Organización*]),
        [*Baja consecuencia*], [0], [La pérdida de confidencialidad, integridad, disponibilidad o privacidad no genera perjuicio a los titulares ni afecta las finanzas, las obligaciones contractuales o el prestigio institucional.],
        [*Consecuencia moderada*], [1], [La materialización del riesgo ocasiona gastos de mitigación acotados, impacto operativo menor y consecuencias leves o moderadas sobre derechos de titulares sin daño patrimonial directo.],
        [*Alta consecuencia*], [2], [La materialización del riesgo produce consecuencias graves o irreversibles sobre los derechos de los titulares de datos personales (PII), pérdida de datos sensibles, paralización de servicios críticos o sanciones de la autoridad reguladora (ANPD).]
      )
      #v(0.2cm)

      Seguidamente, se estima la probabilidad de que una amenaza aproveche la vulnerabilidad identificada, considerando la robustez de las salvaguardas vigentes:

      #v(0.2cm)
      #table(
        columns: (80pt, 30pt, 1fr),
        fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
        stroke: 0.5pt + luma(190),
        align: (left, center, left),
        table.header([*Nivel de Probabilidad*], [*Valor*], [*Criterio de Frecuencia y Eficacia de Controles Existentes*]),
        [*Baja probabilidad*], [0], [Los controles de seguridad y privacidad existentes son eficaces y han brindado adecuada protección histórica. No es previsible la ocurrencia de nuevos incidentes.],
        [*Probabilidad moderada*], [1], [Los controles existentes son moderados y ofrecen protección básica. La ocurrencia de un incidente es factible bajo condiciones operacionales atípicas, aunque poco frecuente.],
        [*Alta probabilidad*], [2], [Los controles existentes son deficientes, inexistentes o ineficaces. Existe una alta probabilidad de materialización del incidente en el corto plazo.]
      )
      #v(0.2cm)

      El nivel de riesgo inherente se calcula sumando ambos parámetros:
      $ "Nivel de Riesgo" (R) = "Consecuencia" (0-2) + "Probabilidad" (0-2) $
      El valor resultante oscila entre 0 y 4 puntos.

      == Criterios para la aceptación de riesgos
      El umbral de aceptabilidad institucional del SGPI se define de la siguiente manera:
      - *Valores 0, 1 y 2:* Constituyen *Riesgos Aceptables*. No requieren tratamiento correctivo inmediato, quedando sujetos a monitoreo ordinario y mantenimiento de salvaguardas.
      - *Valores 3 y 4:* Constituyen *Riesgos No Aceptables*. Requieren tratamiento correctivo prioritario y mandatorio para reducirlos a niveles tolerables antes de la entrada en vigencia del ciclo operacional.

      == Tratamiento del riesgo
      El tratamiento de riesgos se ejecuta mediante el *Cuadro de Tratamiento de Riesgos* (Apéndice 2), trasladando automáticamente la totalidad de riesgos calificados con puntajes 3 y 4. Para cada riesgo no aceptable, el propietario del riesgo y el #doc-owner deben seleccionar una o más de las siguientes cuatro opciones estandarizadas:

      1. *Elección de controles de seguridad y privacidad:* Aplicación de salvaguardas técnicas, organizacionales y procedimentales seleccionadas del Anexo A de ISO/IEC 27701:2025 (Tablas A.1 y A.3).
      2. *Transferencia de riesgos a terceros:* Distribución del riesgo mediante contratos de servicios con encargados de tratamiento homologados o contratación de pólizas de seguros especializadas.
      3. *Evitar el riesgo:* Discontinuación, suspensión o modificación sustantiva de la actividad de tratamiento que genera el escenario de amenaza inaceptable.
      4. *Aceptación justificada del riesgo:* Opción restrictiva aplicable únicamente cuando los costos de mitigación superen con creces el daño potencial estimado, requiriendo autorización escrita expresa y motivada de la Alta Dirección.

      Al implementar la Opción 1, se reevalúan los valores residuales de consecuencia y probabilidad en el Cuadro de Tratamiento para certificar la efectividad de las medidas planificadas.

      == Revisiones periódicas de la evaluación y el tratamiento de riesgos
      Los propietarios de riesgos y el equipo de seguridad deben revisar periódicamente la vigencia de los riesgos y actualizar los cuadros correspondientes al menos *una vez al año*, o de manera extraordinaria ante:
      - Apertura o incorporación de nuevas sedes, filiales territoriales o dependencias académicas.
      - Cambios tecnológicos relevantes (migración a la nube, nuevas plataformas web o cambios en redes).
      - Reformas legales o regulatorias en el régimen de protección de datos personales.
      - Materialización de incidentes de seguridad de severidad media, alta o crítica.

      == Declaración de aplicabilidad y Plan de tratamiento del riesgo
      El #doc-owner documenta en la Declaración de Aplicabilidad (*SoA* - `G4-SOA-01`) la justificación de inclusión y el estado de implementación de los controles de las Tablas A.1 y A.3 de ISO/IEC 27701:2025, así como la exclusión fundada de la Tabla A.2.

      Asimismo, formula el Plan de Tratamiento de Riesgos (`G4-PLN-RSK-01`) con el cronograma y recursos para desplegar las medidas aprobadas por la Alta Dirección.

      == Informes
      Los resultados consolidados de cada ciclo de apreciación y tratamiento de riesgos se formalizan en el *Informe de Evaluación y Tratamiento de Riesgos* (`Apendice 3`, integrado en `G4-RSK-INC-01`). El seguimiento del plan se informa con periodicidad mensual a las direcciones involucradas.

      = Gestión de registros guardados en base a este documento
      Los registros generados por la aplicación de esta metodología se protegen conforme a los siguientes parámetros:

      #v(0.2cm)
      #table(
        columns: (110pt, 80pt, 85pt, 1fr, 55pt),
        fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
        stroke: 0.5pt + luma(190),
        align: (left, left, left, left, center),
        table.header([*Nombre del Registro*], [*Ubicación de Archivo*], [*Responsable de Custodia*], [*Controles de Protección*], [*Retención*]),
        [Cuadro de Evaluación de Riesgos (Apéndice 1)], [Repositorio PIMS / Servidor DUTIC], [#doc-owner], [Control de acceso por roles (RBAC) y respaldo diario], [Permanente],
        [Cuadro de Tratamiento de Riesgos (Apéndice 2)], [Repositorio PIMS / Servidor DUTIC], [#doc-owner], [Control de acceso por roles (RBAC) y respaldo diario], [Permanente],
        [Informe de Evaluación y Tratamiento (`G4-RSK-INC-01`)], [Gestor Documental Sisgedo / PIMS], [#doc-owner], [Documento PDF firmado digitalmente de solo lectura], [5 años],
        [Declaración de Aplicabilidad (`G4-SOA-01`)], [Repositorio PIMS institucional], [#doc-owner], [Integridad SHA-256 y versionado controlado], [5 años],
        [Plan de Tratamiento de Riesgos (`G4-PLN-RSK-01`)], [Repositorio PIMS institucional], [#doc-owner], [Control de versiones e integridad SHA-256], [5 años]
      )
      #v(0.3cm)

      = Apéndices
      - *Apéndice 1:* Cuadro de Evaluación de Riesgos (Catálogo de activos, amenazas, vulnerabilidades y valoración).
      - *Apéndice 2:* Cuadro de Tratamiento de Riesgos (Opciones seleccionadas, controles Anexo A y riesgo residual).
      - *Apéndice 3:* Formulario - Informe sobre Evaluación y Tratamiento de Riesgos de Privacidad.
    ]
  )
}

// -------------------------------------------------------------------------
// 2. SUB-MOLDE: G4-RSK-INC-01 — Matriz de Riesgos + Informe (Apéndices 1, 2, 3)
// Estructura integral: Informe Apéndice 3 + Tablas Apéndice 1 y 2
// -------------------------------------------------------------------------
#let render-matrix(data) = {
  let doc-title = data.at("title", default: "Matriz y Reporte de Evaluación de Riesgos de Incidentes de Privacidad")
  let doc-code = data.at("code", default: "G4-RSK-INC-01")
  let doc-ver = data.at("version", default: "1.0")
  let doc-date = data.at("date", default: "2019-04-15")
  let doc-conf = data.at("confidentiality", default: "CONFIDENCIAL - USO INTERNO UNSA")
  let doc-author = data.at("author", default: (:))
  let doc-reviewer = data.at("reviewer", default: (:))
  let doc-approver = data.at("approver", default: (:))
  let doc-history = data.at("history", default: ())
  let doc-validity = data.at("validity", default: "2020-04-15")
  let doc-refs = data.at("references", default: ())
  let doc-owner = data.at("owner-role", default: "Oficial de Seguridad de la Información (OSI / DPO)")
  let period-name = data.at("period-name", default: "Periodo Operacional")
  let scope-units = data.at("scope-units", default: "las unidades del alcance del SGPI")
  let time-eval = data.at("time-eval", default: "el periodo de evaluación")
  let time-treat = data.at("time-treat", default: "el periodo de tratamiento")
  let participants = data.at("participants", default: "el equipo técnico del SGPI")
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
    validity: doc-validity,
    references: doc-refs,
    owner-role: doc-owner,
    show-signature: true,
    [
      = Apéndice 3: Informe sobre Evaluación y Tratamiento de Riesgos

      == Objetivo, alcance y usuarios del informe
      El objetivo del presente informe es presentar el resumen detallado del proceso, los métodos aplicados y los resultados obtenidos durante la evaluación y el tratamiento de los riesgos de incidentes de privacidad y seguridad de la información en la institución para el #period-name.

      La evaluación se aplicó a todo el alcance del Sistema de Gestión de Privacidad de la Información (SGPI) en #scope-units. El presente documento está dirigido a la Alta Dirección, al #doc-owner, a los custodios de activos y a las comisiones de auditoría y mejora continua.

      == Proceso de evaluación y tratamiento de riesgos de la información y privacidad
      Todo el proceso de evaluación y tratamiento de riesgos ha sido realizado en estricta conformidad con el documento *Metodología de Evaluación y Tratamiento de Riesgos de Privacidad* (`G4-MET-RSK-01`), bajo los mandatos de las Cláusulas 6.1.2, 6.1.3, 8.2 y 8.3 de la norma internacional ISO/IEC 27701:2025.

      === Objetivo de la gestión de riesgos de privacidad
      El objetivo fundamental de la evaluación es identificar los activos que procesan datos personales (PII), las amenazas de vulneración y las fallas de seguridad asociadas, ponderando su impacto dual (titulares y universidad) para cuantificar los riesgos intolerables. El tratamiento busca establecer salvaguardas sistemáticas, eficaces y medibles para mitigar dichos riesgos a niveles plenamente tolerables.

      === Alcance y periodo de tiempo
      - *Alcance Organizacional y Geográfico:* #scope-units.
      - *Periodo de Evaluación de Riesgos:* Implementado durante #time-eval.
      - *Periodo de Formulación y Tratamiento:* Implementado durante #time-treat.

      === Participantes en el proceso y recolección de información
      El proceso fue liderado por #participants. La información técnica fue recabada mediante entrevistas con los custodios de bases de datos, auditorías de configuración de infraestructura de red y análisis forense de incidentes previos.

      === Breve resumen de la metodología aplicada
      1. Identificación y clasificación de activos que tratan PII (físicos, digitales y humanos).
      2. Mapeo de amenazas de privacidad e identificación de vulnerabilidades técnicas y operativas.
      3. Asignación formal de propietarios de activos y propietarios de riesgos.
      4. Valoración cuantitativa de consecuencias en escala de 0 a 2 (Baja, Moderada, Alta con afectación a derechos).
      5. Valoración de probabilidad en escala de 0 a 2 (Baja, Moderada, Alta).
      6. Cálculo del riesgo inherente ($R = "Consecuencia" + "Probabilidad"$ en escala de 0 a 4).
      7. Determinación del umbral: valores 0 a 2 son *Aceptables*; valores 3 y 4 son *No Aceptables*.
      8. Selección de controles de mitigación del Anexo A de ISO/IEC 27701:2025 (Tablas A.1 y A.3).
      9. Reevaluación del riesgo residual ($R_"res"$) y formalización de aceptación institucional.

      === Resumen de documentos utilizados
      - *Cuadro de Evaluación de Riesgos (Apéndice 1):* Detalla el inventario de activos, escenarios de amenaza, vulnerabilidades y niveles calculados de riesgo.
      - *Cuadro de Tratamiento de Riesgos (Apéndice 2):* Consolida los riesgos no aceptables, las opciones de tratamiento elegidas, los controles Anexo A y el nivel residual resultante.

      = Apéndice 1: Cuadro de Evaluación de Riesgos de Incidentes (#period-name)

      #v(0.2cm)
      #table(
        columns: (28pt, 80pt, 65pt, 85pt, 80pt, 60pt, 22pt, 22pt, 24pt, 1fr),
        fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
        stroke: 0.5pt + luma(190),
        align: (center, left, left, left, left, left, center, center, center, left),
        table.header([*ID*], [*Activo PII*], [*Custodio*], [*Amenaza*], [*Vulnerabilidad*], [*Dueño Riesgo*], [*C*], [*P*], [*R*], [*Controles Existentes*]),
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
      #v(0.3cm)

      = Apéndice 2: Cuadro de Tratamiento de Riesgos de Incidentes (#period-name)

      #v(0.2cm)
      #table(
        columns: (26pt, 85pt, 60pt, 36pt, 65pt, 1fr, 36pt, 45pt, 48pt),
        fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
        stroke: 0.5pt + luma(190),
        align: (center, left, left, center, left, left, center, center, center),
        table.header([*ID*], [*Escenario de Riesgo*], [*Dueño*], [*Antes (C+P=R)*], [*Opción*], [*Controles Anexo A y Medios*], [*Residual (C+P=R)*], [*Nivel*], [*Estado*]),
        ..treat-rows.map(r => (
          text(size: 7.5pt, weight: "bold")[#r.id],
          text(size: 7pt)[#r.scenario],
          text(size: 7pt)[#r.risk-owner],
          text(size: 7pt, weight: "bold", fill: rgb("#991b1b"))[#r.before-c+#r.before-p=#r.before-r],
          text(size: 7pt)[#r.option],
          text(size: 7pt)[#r.controls],
          text(size: 7pt, weight: "bold", fill: rgb("#166534"))[#r.after-c+#r.after-p=#r.after-r],
          rag-tag(r.rag),
          status-tag(r.status)
        )).flatten()
      )
      #v(0.3cm)

      = Formalización de Aceptación del Riesgo Residual (Cláusula 6.1.3g)
      Los Dueños de Riesgo institucionales y el Comité de Gobierno Digital y Privacidad certifican que la totalidad de los riesgos tratados alcanzan niveles residuales tolerables (puntajes 1 a 2, clasificados en zona Verde), formalizando la aprobación unánime de las medidas y la plena conformidad de los controles con la norma internacional ISO/IEC 27701:2025.
    ]
  )
}

// -------------------------------------------------------------------------
// 3. SUB-MOLDE: G4-PLN-RSK-01 — Plan de Tratamiento del Riesgo
// Estructura réplica del documento del instructor: Plan_de_tratamiento_del_riesgo_ES.docx (tabla de 7 columnas)
// -------------------------------------------------------------------------
#let render-plan(data) = {
  let doc-title = data.at("title", default: "Plan de Tratamiento de Riesgos de Privacidad")
  let doc-code = data.at("code", default: "G4-PLN-RSK-01")
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
  let intro-text = data.at("intro-text", default: "Para cumplir los objetivos del Sistema de Gestión de Privacidad de la Información (SGPI) bajo la norma ISO/IEC 27701:2025 (Cláusulas 6.1.3.f y 8.3), se planifican e implementan las siguientes actividades institucionales de tratamiento de riesgos:")
  let activities = data.at("activities", default: ())

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
      = Objetivos y Alcance del Plan de Tratamiento
      #intro-text

      #callout(title: "COMPROMISO DE ASIGNACIÓN DE RECURSOS (CLÁUSULA 6.1.3f)", color: rgb("#0284c7"))[
        La Alta Dirección y los directores de las dependencias involucradas garantizan la asignación oportuna de los recursos presupuestales, tecnológicos y de personal necesarios para la ejecución de cada actividad dentro de los plazos establecidos.
      ]

      = Matriz de Actividades del Plan de Tratamiento (Tabla de 7 Columnas)

      #v(0.2cm)
      #table(
        columns: (115pt, 80pt, 75pt, 65pt, 85pt, 80pt, 50pt),
        fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
        stroke: 0.5pt + luma(190),
        align: (left, left, left, center, left, left, center),
        table.header(
          [*Descripción de Actividades*],
          [*Recursos Generales y Financieros Necesarios*],
          [*Persona Responsable*],
          [*Plazos de Inicio y Finalización*],
          [*Programas de Capacitación y Concienciación*],
          [*Método para Evaluación de Resultados*],
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
      #v(0.4cm)

      = Seguimiento y Control de Eficacia
      La verificación del cumplimiento de este plan se realiza mediante revisiones técnicas bimensuales a cargo del #doc-owner, reportando los avances directamente al Comité de Gobierno Digital y Privacidad en conformidad con la Cláusula 9.1 de ISO/IEC 27701:2025.
    ]
  )
}

// -------------------------------------------------------------------------
// FUNCIÓN PRINCIPAL EXPORTADA: mold(data)
// Despacha automáticamente según el código documental indicado en data.code
// -------------------------------------------------------------------------
#let mold(data) = {
  let doc-code = data.at("code", default: "G4-RSK-INC-01")
  if doc-code == "G4-MET-RSK-01" {
    render-methodology(data)
  } else if doc-code == "G4-PLN-RSK-01" {
    render-plan(data)
  } else {
    render-matrix(data)
  }
}
