// mold.typ — Molde parametrizado para Procedimiento para Control de Documentos y Registros
// Cumple con ISO/IEC 27701:2025 Cláusula 7.5 (7.5.1, 7.5.2, 7.5.3), Controles A.3.14, A.1.4.8, A.1.4.9,
// y replica la estructura exacta del formato del instructor "Procedimiento para control de documentos y registros".
// CERO datos de instancia institucional en este archivo.

#import "../common/template.typ": doc-template, status-tag, rag-tag, callout

#let mold(
  metadata: (:),
  references: (),
  scope-text: none,
  users-text: none,
  taxonomy-data: (),
  anatomy-items: (),
  records-table-data: (),
  ..sink
) = {
  show: doc-template.with(
    title: metadata.at("title", default: "Procedimiento para control de documentos y registros"),
    code: metadata.at("code", default: "G4-PRC-DOC-01"),
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
    = Objetivo, alcance y usuarios

    El objetivo de este procedimiento es el de asegurar el control sobre la creación, aprobación, distribución, utilización y actualización de los documentos y registros (también denominada información documentada) utilizados en el Sistema de Gestión de Privacidad de la Información (SGPI) de la Universidad Nacional de San Agustín de Arequipa (UNSA), de conformidad con la norma ISO/IEC 27701:2025 y la Ley N° 29733 de Protección de Datos Personales del Perú.

    #(if scope-text != none { scope-text } else [
      Este procedimiento se aplica a todos los documentos y registros relacionados con el SGPI, independientemente de si los documentos y registros fueron creados dentro de la Universidad Nacional de San Agustín de Arequipa (UNSA) o si son de origen externo. Este procedimiento abarca a todos los documentos y registros almacenados de todas las formas posibles: papel, audio, vídeo, formato digital o electrónico.
    ])

    #(if users-text != none { users-text } else [
      Los usuarios de este documento son todos empleados de la Universidad Nacional de San Agustín de Arequipa (UNSA) incluidos dentro del alcance del SGPI.
    ])

    = Documentos de referencia

    #(if references.len() > 0 {
      for ref-item in references [
        - #ref-item
      ]
    } else [
      - Norma ISO/IEC 27701:2025, subcláusulas 7.5.1, 7.5.2 y 7.5.3 (Información documentada) y Controles A.3.14, A.1.4.8, A.1.4.9.
      - Norma ISO/IEC 27001:2022, subcláusula 7.5 y Anexo A.8.28.
      - Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).
      - Política de Privacidad de la Información de la UNSA (G4-POL-01).
      - Política de Clasificación y Manejo de Información y Datos Personales de la UNSA.
      - Reglamento de Gestión Documental y Firma Digital de la UNSA (RR 0450-2021).
    ])

    = Control de documentos internos

    Los documentos internos son todos documentos creados dentro de la organización.

    == Formato de los documentos
    El texto del documento se escribe utilizando fuente Liberation Sans (sustituto métrico idéntico y estándar libre de Calibri en entornos Linux y Typst 0.15), tamaño 11. Los títulos de capítulo se escriben con tamaño de fuente 14 y en negrita; mientras que para los títulos de capítulo nivel 2 se utiliza el tamaño de fuente 12 en negrita. Los títulos de capítulo nivel 3 se escriben con tamaño de fuente 11, en negrita y cursiva.

    El encabezado del documento incluye el nombre de la organización y el nivel de confidencialidad. El pie de página incluye el nombre del documento, la versión actual, la fecha del documento y la cantidad de páginas.

    Cada documento también debe definir a sus usuarios.

    Asimismo, cada artefacto documental se identifica de manera unívoca mediante la taxonomía estandarizada del SGPI de la UNSA:

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

    Todo documento generado debe incorporar los 15 elementos de anatomía documental obligatoria:
    #(if anatomy-items.len() > 0 {
      list(..anatomy-items)
    } else [
      - Código institucional unívoco con prefijo institucional.
      - Número de versión visible (X.Y).
      - Fecha de vigencia / aprobación formal (formato ISO YYYY-MM-DD).
      - Paginación dinámica continua ("Página X de Y").
      - Nivel de clasificación de seguridad en encabezado superior derecho.
      - Tabla de control documental en cabecera (Código, Versión, Fecha, Creado por, Revisado por, Aprobado por, Nivel de confidencialidad).
      - Cuadro de aprobación tripartito con roles, nombres y fechas.
      - Tabla de historial de revisiones con justificación detallada de cambios.
      - Índice analítico de contenidos con salto de página forzoso antes del cuerpo.
      - Sección de documentos de referencia.
      - Sección de validez y gestión de documentos con designación de custodio y criterios de efectividad.
      - Bloque formal de firma institucional al cierre.
      - Cero marcadores de posición sin resolver.
      - Arquitectura de moldes parametrizados desacoplados de los datos de versión.
      - Preservación inmutable de versiones en el repositorio PIMS institucional.
    ])

    == Aprobación de documentos
    Todos los documentos, ya sean documentos nuevos o nuevas versiones de documentos existentes, deben ser aprobados por el Rectorado / Dirección General de Administración (DGA) previa conformidad técnica del Oficial de Seguridad de la Información (OSI) / DPO.

    Los documentos son aprobados de la siguiente forma: El Oficial de Seguridad de la Información (OSI) / DPO revisará técnicamente el documento y lo remitirá al Rector / Presidente del Comité SGPI para su aprobación formal mediante firma digital o acto resolutivo en el sistema de trámite documentario institucional (Sisgedo).

    == Publicación y distribución de documentos; retiro de circulación

    === Documentos con el nivel de confidencialidad más bajo
    En el caso de los documentos a los cuales se permite el acceso de todos los empleados incluidos dentro del alcance del SGPI (o público en general), el Oficial de Seguridad de la Información / Secretaría Técnica del SGPI debe publicarlos en la Intranet y portal web institucional de la UNSA, con permisos de solo lectura. Cuando se publica un nuevo documento o una nueva versión del mismo, se debe informar por correo electrónico a todos los empleados indicados como usuarios del documento. Si es necesario entregar una versión impresa del documento a algunos empleados, esto es responsabilidad del Oficial de Seguridad de la Información.

    Si hay una versión anterior del documento, el Oficial de Seguridad de la Información debe retirarla de la carpeta de documentos vigentes y debe colocarla en la carpeta de documentos obsoletos. Si existen versiones anteriores de documentos impresos, el Oficial de Seguridad debe recolectar todos esos documentos y debe destruir todas las copias menos el original firmado, que debe ser debidamente archivado; a esos originales se les debe escribir "Obsoleto" con un marcador.

    === Documentos con mayor nivel de confidencialidad
    Los documentos que tienen un mayor nivel de confidencialidad, de acuerdo a lo especificado en la Política para manejo de información clasificada y datos personales, y cuya distribución es limitada, son publicados en el repositorio institucional digital PIMS (GESTITEL en `https://unsa.27k.pe`) por el propietario del documento con permisos de solo lectura y control de acceso basado en roles (RBAC). El propietario del documento debe enviar una notificación por correo electrónico sobre este documento a todas las personas de la lista de distribución autorizada.

    Si existe una versión anterior del documento, el propietario del documento debe cambiar su estado en el repositorio institucional a documentos obsoletos, a la cual pueden acceder sólo las personas especificadas en la lista de distribución del documento.

    == Actualizaciones de documentos
    La persona designada como propietaria del documento tiene la responsabilidad de actualizar el documento. Las actualizaciones se realizan conforme a la frecuencia definida para cada documento, pero, como mínimo, una vez por año.

    Todos los cambios del documento deben ser realizados dejando visibles las revisiones sobre la versión anterior, y deben ser detallados en la tabla "Historial de modificaciones".

    Al actualizar los documentos se aplican los siguientes criterios de ciclo de vida:
    - *Versiones menores (1.x, 2.x)*: Aplican ante correcciones tipográficas, precisiones de estilo, readecuación de referencias normativas o actualización de denominaciones de cargos sin alteración de funciones operativas. No alteran los límites de los procesos ni las obligaciones de control declaradas.
    - *Versiones mayores (2.0, 3.0)*: Aplican ante cambios estructurales en el sistema de gestión: incorporación o retiro de sedes o filiales territoriales en el alcance, modificaciones críticas en plataformas tecnológicas de tratamiento de datos personales, cambios normativos de fondo o reformulaciones sustanciales en el análisis de riesgos o en la Declaración de Aplicabilidad (SoA).
    - *Inmutabilidad y preservación histórica en PIMS ("Máquina del tiempo")*: En estricto cumplimiento del principio de trazabilidad retrospectiva y la Guía B.3.14 de ISO/IEC 27701:2025, las versiones precedentes de cualquier documento *nunca se eliminan* del repositorio PIMS institucional. Al aprobarse una nueva versión, las versiones anteriores pasan automáticamente al estado `obsoleto` (`O`), manteniéndose íntegras, inmutables y descargables con su suma de comprobación criptográfica (hash SHA-256) para fines de auditoría retrospectiva. Las eliminaciones físicas puras (`true deletes`) se reservan exclusivamente para erratas críticas o contaminación de datos entre entornos, requiriendo registro expreso en bitácora de auditoría.
    - *Convención obligatoria de Resumen de Cambios (change_summary)*: Al emitir y registrar una nueva versión, es mandatorio completar el campo `change_summary` estructurado bajo el siguiente patrón técnico:
      `TIPO_CAMBIO :: Razón normativa/organizacional :: Modificaciones específicas realizadas :: Impacto en controles SoA o procesos`.

    == Control de registros
    Cada documento interno en el SGPI debe definir cómo se deben administrar los registros generados a partir del uso de ese documento; es decir, debe especificar lo siguiente: (1) título del registro, (2) ubicación de archivo, (3) persona responsable del archivo, (4) controles para la protección del registro y (5) tiempo de retención.

    Los empleados de la organización pueden acceder a registros archivados solamente después de obtener un permiso de la persona designada como responsable del archivo de registros individuales. Si la sensibilidad de determinados registros requiere que el permiso de acceso sea concedido por otra persona, esto debe quedar establecido en el documento interno en cuestión, en el capítulo que detalla el control de registros.

    Los derechos de acceso y recuperación de registros son determinados por el propietario de los registros individuales. El Oficial de Seguridad de la Información (OSI) / DPO es el responsable de destruir todos los registros cuyo tiempo de retención haya vencido.

    = Documentos externos

    Cada documento externo que sea importante para la planificación y el funcionamiento del SGPI debe ser registrado en el registro de correo entrante (Mesa de Partes Digital / Trámite Documentario Sisgedo). El registro de correo entrante debe incluir la siguiente información: (1) número del documento, (2) remitente, (3) nombre del documento, (4) fecha de recepción, (5) nombre de la persona a quien ha sido enviado el documento.

    La persona que recibe el correo y los paquetes de encomiendas debe reenviarlos al Jefe de Mesa de Partes / Secretaría General, quien debe crear una entrada en el registro de correo entrante; la persona que recibe el correo electrónico debe enviar el documento en cuestión al Jefe de Mesa de Partes, que también debe ingresarlo en el registro de correo entrante. El Jefe de Mesa de Partes luego clasifica los documentos de acuerdo con la Política para manejo de información clasificada y determina a quién debe ser reenviado el documento.

    = Gestión de registros guardados en base a este documento

    #table(
      columns: (120pt, 95pt, 90pt, 1fr, 60pt),
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
          [Registro de correo entrante (Mesa de Partes Digital UNSA)],
          [Servidor DUTIC / Carpeta SGPI-Documentos / Sisgedo],
          [Jefe de Mesa de Partes / Secretaría General],
          [Solamente el Jefe de Mesa de Partes tiene derecho a crear entradas y a realizar modificaciones en el registro de correo entrante. Control de acceso por roles (RBAC) y bitácora de auditoría.],
          [5 años conforme a ley peruana]
        )
      })
    )

    Solamente el Jefe de Mesa de Partes / Secretaría General puede permitir el acceso al registro de correo entrante a otros empleados.

    = Validez y gestión de documentos

    Este documento es válido hasta el #(if metadata.at("validity", default: none) != none { metadata.validity } else { metadata.at("date", default: "") }).

    El propietario de este documento es el #(if metadata.at("owner-role", default: none) != none { metadata.owner-role } else { "Oficial de Seguridad de la Información (OSI / DPO)" }), que debe verificar, y si es necesario actualizar, el documento por lo menos una vez al año.

    Al evaluar la efectividad y adecuación de este documento, es necesario tener en cuenta los siguientes criterios:
    - Cantidad de documentos obsoletos o desactualizados
    - Cantidad de documentos que no han sido distribuidos a los empleados para los que estaban destinados
    - Cantidad de documentos para los que no se lleva un registro o que no están archivados adecuadamente
  ]
}
