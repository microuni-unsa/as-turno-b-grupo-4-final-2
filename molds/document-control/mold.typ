// mold.typ — Molde parametrizado para Procedimiento de Control de Información Documentada
// Cumple con ISO/IEC 27701:2025 Cláusula 7.5 (7.5.1, 7.5.2, 7.5.3), Controles A.3.14, A.1.4.8, A.1.4.9,
// y sigue la estructura del formato del instructor "Procedimiento para control de documentos y registros".
// ZERO datos de instancia institucional en este archivo.

#import "../common/template.typ": doc-template, status-tag, rag-tag, callout

#let mold(
  metadata: (:),
  references: (),
  scope-text: none,
  users-text: none,
  taxonomy-data: (),
  anatomy-items: (),
  lifecycle-rules: (:),
  external-rules: (:),
  records-table-data: ()
) = {
  show: doc-template.with(
    title: metadata.at("title", default: "Procedimiento para Control de Documentos y Registros"),
    code: metadata.at("code", default: "G4-PRC-DOC-01"),
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
    = Objetivo, alcance y usuarios

    == Objetivo
    El objetivo de este procedimiento es el de asegurar el control riguroso sobre la creación, aprobación, codificación, distribución, utilización, actualización, conservación y disposición final de los documentos y registros (denominados conjuntamente como información documentada) utilizados en el Sistema de Gestión de Privacidad de la Información (SGPI), garantizando su idoneidad, confidencialidad, integridad y disponibilidad continua de conformidad con las Cláusulas 7.5.1, 7.5.2 y 7.5.3 de la norma internacional ISO/IEC 27701:2025.

    == Alcance
    #(if scope-text != none { scope-text } else [
      Este procedimiento se aplica a todos los documentos y registros relacionados con el SGPI, independientemente de si fueron creados dentro de la organización o si son de origen externo. Abarca a toda la información documentada almacenada en cualquier soporte físico, digital o electrónico, incluyendo archivos de bases de datos, código fuente de moldes de renderizado y registros transaccionales del repositorio institucional.
    ])

    == Usuarios
    #(if users-text != none { users-text } else [
      Los usuarios de este documento son todos los funcionarios, directivos, docentes, operadores administrativos y personal técnico con responsabilidades directas o indirectas en la operación de los procesos comprendidos dentro del alcance del SGPI.
    ])

    = Control de documentos internos

    == Formato y taxonomía de los documentos
    Todos los documentos del sistema de gestión deben elaborarse respetando la identidad institucional y la codificación estandarizada. Cada artefacto documental se identifica de manera unívoca mediante una convención de nomenclatura estructurada:

    #table(
      columns: (95pt, 1fr),
      fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
      stroke: 0.5pt + luma(190),
      align: (center, left),
      table.header([*Prefijo de Tipo*], [*Descripción y Naturaleza del Artefacto*]),
      ..(if taxonomy-data.len() > 0 {
        taxonomy-data.map(item => (
          text(weight: "bold")[#item.code],
          [#item.description]
        )).flatten()
      } else {
        (
          [G4-POL-XX], [Políticas institucionales de privacidad y directrices estratégicas de alto nivel.],
          [G4-ALC-XX], [Determinación de límites, perímetro y alcance del SGPI.],
          [G4-PRC-XX], [Procedimientos operativos, directivas de control y guías de ejecución.],
          [G4-REG-XX], [Registros de evidencia, bitácoras operacionales y formularios de incidentes/CAPA.],
          [G4-SOA-XX], [Declaración de aplicabilidad de controles de privacidad y seguridad (SoA).],
          [G4-PRG-XX], [Programas anuales de actividades (auditorías, capacitaciones).],
          [G4-REP-XX], [Informes formales de auditoría interna y reportes técnicos de evaluación.],
          [G4-ACT-XX], [Actas y minutas de comités y revisión por la dirección.],
          [G4-IDX-XX], [Índices maestros y mapas documentales de auditoría.]
        )
      })
    )

    Asimismo, todo documento generado debe incorporar sin excepción los elementos de la anatomía obligatoria:
    #(if anatomy-items.len() > 0 {
      list(..anatomy-items)
    } else [
      - Código institucional unívoco con prefijo institucional.
      - Número de versión semántica visible (X.Y).
      - Fecha de vigencia y aprobación formal (formato ISO YYYY-MM-DD).
      - Paginación dinámica continua ("Página X de Y").
      - Nivel de clasificación de seguridad en encabezado superior.
      - Tabla de control documental en cabecera (Código, Versión, Fecha, Elaborado por, Revisado por, Aprobado por, Nivel de confidencialidad).
      - Cuadro de aprobación tripartito con roles, nombres y fechas.
      - Tabla de historial de revisiones con justificación detallada de cambios.
      - Índice analítico de contenidos con salto de página forzoso antes del cuerpo.
      - Sección obligatoria de documentos de referencia.
      - Sección de validez y gestión de documentos con designación de custodio y criterios de adecuación.
      - Bloque formal de firmas al cierre.
      - Cero marcadores de posición sin resolver.
      - Arquitectura de moldes parametrizados desacoplados de los datos de versión.
    ])

    == Aprobación de documentos
    Todo documento interno del SGPI debe someterse a un ciclo formal tripartito previo a su entrada en vigencia:
    1. *Elaboración*: A cargo del autor técnico especialista, quien redacta el documento conforme a los requisitos normativos y operacionales.
    2. *Revisión*: A cargo de la jefatura o dirección técnica de supervisión, quien valida la coherencia técnica, la viabilidad operativa y la suficiencia de controles.
    3. *Aprobación*: A cargo de la máxima autoridad institucional o rectoral, quien formaliza la obligatoriedad del documento para toda la institución mediante acto resolutivo o firma de aprobación.

    Ningún documento surtirá efectos vinculantes sin contar con las firmas y fechas completas en el cuadro de aprobación institucional.

    == Publicación y distribución de documentos; retiro de circulación

    === Documentos con el nivel de confidencialidad más bajo
    Los documentos clasificados como de nivel público o uso general (tales como avisos de privacidad y resúmenes de políticas) pueden ser publicados libremente en el portal web institucional y carteleras físicas para el libre acceso de titulares y postulantes.

    === Documentos con mayor nivel de confidencialidad
    Los documentos rotulados como CONFIDENCIAL - USO INTERNO corresponden exclusivamente al personal autorizado del SGPI. Se distribuyen y consultan a través del repositorio digital institucional controlado. Queda prohibida la reproducción fotostática no autorizada o su remisión por canales de correo electrónico no cifrados. Cuando una versión es actualizada o retirada de circulación, la versión anterior pasa inmediatamente al estado de obsoleto en el repositorio central.

    == Actualizaciones de documentos y ciclo de vida

    === Versiones menores (1.x, 2.x)
    Se aplican ante correcciones tipográficas, precisiones de estilo, readecuación de referencias normativas o actualización de denominaciones de cargos sin alteración de funciones operativas. No alteran los límites de los procesos ni las obligaciones de control declaradas.

    === Versiones mayores (2.0, 3.0)
    Se aplican ante cambios estructurales en el sistema de gestión:
    - Incorporación o retiro de sedes o filiales territoriales en el alcance.
    - Modificaciones críticas en plataformas tecnológicas de tratamiento de datos personales.
    - Cambios normativos de fondo o adopción de nuevas ediciones de la norma internacional de referencia.
    - Reformulaciones sustanciales en el análisis de riesgos o en la Declaración de Aplicabilidad (SoA).

    === Inmutabilidad de versiones anteriores en PIMS ("Máquina del tiempo")
    #callout(title: "POLÍTICA INSTITUCIONAL DE PRESERVACIÓN HISTÓRICA", color: rgb("#0284c7"))[
      En estricto cumplimiento del principio de trazabilidad retrospectiva y la Guía B.3.14 de ISO/IEC 27701:2025, las versiones precedentes de cualquier documento *nunca se eliminan* del repositorio PIMS institucional. Al aprobarse una nueva versión, las versiones anteriores cambian automáticamente su estado a `obsoleto` (`O`), manteniéndose íntegras, inmutables y descargables con su correspondiente suma de comprobación criptográfica (hash SHA-256) para fines de auditoría retrospectiva. Las eliminaciones físicas puras (`true deletes`) se reservan con carácter restrictivo para erratas críticas o contaminación de datos entre entornos, requiriendo registro expreso en bitácora de auditoría.
    ]

    === Convención obligatoria de Resumen de Cambios (change_summary)
    Al emitir y registrar una nueva versión en el sistema documental, es mandatorio completar el campo `change_summary` estructurado bajo el siguiente patrón técnico:
    ```
    TIPO_CAMBIO :: Razón normativa/organizacional :: Modificaciones específicas realizadas :: Impacto en controles SoA o procesos
    ```
    Donde `TIPO_CAMBIO` se clasifica estrictamente en `MAYOR` (para revisiones 2.0, 3.0) o `MENOR` (para ajustes 1.x, 2.x).

    == Control de registros
    Cada proceso operativo del SGPI debe definir taxativamente los mecanismos de control sobre los registros que evidencian la conformidad con la norma, estableciendo su título, ubicación de almacenamiento, custodio responsable, salvaguardas de protección contra acceso indebido o alteración, y su plazo de retención legal y reglamentario.

    = Documentos externos
    Los documentos de origen externo que resulten pertinentes para la planificación y operación del SGPI (leyes, reglamentos de la autoridad de protección de datos, directivas de seguridad digital, normas técnicas y acuerdos contractuales con terceros) deben ser identificados, registrados y clasificados por la Secretaría Técnica del SGPI.

    Toda recepción de correspondencia externa formal vinculada a datos personales debe registrarse en la bitácora de documentos externos, indicando número de radicación, remitente, asunto, fecha de ingreso y destinatario asignado.

    = Gestión de registros guardados en base a este documento
    Los registros derivados de la aplicación de este procedimiento se gestionan conforme a la siguiente tabla maestra de custodia:

    #table(
      columns: (120pt, 90pt, 85pt, 1fr, 55pt),
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
      ..(if records-table-data.len() > 0 {
        records-table-data.map(r => (
          [#r.name],
          [#r.location],
          [#r.responsible],
          [#r.controls],
          [#r.retention]
        )).flatten()
      } else {
        (
          [Registro maestro de información documentada (Índice G4-IDX-01)],
          [Repositorio digital PIMS institucional y bóveda DUTIC],
          [Secretaría Técnica del SGPI / DPO],
          [Control de acceso basado en roles (RBAC), respaldo diario cifrado AES-256 e inmutabilidad de bitácoras.],
          [Permanente (5 años mín.)],
          [Registro de correo entrante y documentos externos],
          [Sistema de trámite documentario y repositorio PIMS],
          [Mesa de Partes Central / Oficial de Seguridad],
          [Autenticación multifactor (MFA), auditoría de descargas y firma digital de recepción.],
          [3 años],
          [Actas de aprobación y control de cambios documentales],
          [Bóveda de gestión documental y archivo digital DUTIC],
          [Oficial de Seguridad de la Información (OSI / DPO)],
          [Firma digital con certificado calificado, archivo de solo lectura tras aprobación.],
          [5 años]
        )
      })
    )
  ]
}
