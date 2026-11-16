// mold-prc-capa.typ — Molde parametrizado para Procedimiento de No Conformidades y Acciones Correctivas
// Cumple con ISO/IEC 27701:2025 Cláusula 10.2 (No conformidad y acción correctiva), Control A.3.16,
// y replica la estructura del formato oficial del instructor "Procedimiento para medidas correctivas".
// CERO datos de instancia institucional en este archivo.

#import "../common/template.typ": doc-template, status-tag, rag-tag, callout

#let mold-prc-capa(
  metadata: (:),
  references: (),
  scope-text: none,
  users-text: none,
  steps-table-data: (),
  records-table-data: ()
) = {
  show: doc-template.with(
    title: metadata.at("title", default: "Procedimiento para Medidas Correctivas"),
    code: metadata.at("code", default: "G4-PRC-CAPA-01"),
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
    El objetivo de este procedimiento es describir todas las actividades relacionadas con la iniciación, implementación, seguimiento y mantenimiento de registros de correcciones, así como de medidas correctivas implementadas para subsanar no conformidades dentro del Sistema de Gestión de Privacidad de la Información (SGPI), en estricto cumplimiento de la Cláusula 10.2 y el Control A.3.16 de la norma internacional ISO/IEC 27701:2025.

    == Alcance
    #(if scope-text != none { scope-text } else [
      Este procedimiento se aplica a todas las actividades, procesos, dependencias organizacionales, sedes y filiales territoriales comprendidas dentro del alcance del SGPI, así como a las relaciones operativas con encargados del tratamiento y proveedores que procesen datos personales vinculados a la institución.
    ])

    == Usuarios
    #(if users-text != none { users-text } else [
      Los usuarios de este documento son todos los colaboradores, funcionarios, operadores de datos personales, líderes de procesos y auditores internos con responsabilidades operativas en el marco del SGPI.
    ])

    = Correcciones y medidas correctivas

    == No conformidades y correcciones
    Una no conformidad es todo incumplimiento o desvío respecto a los requisitos normativos de ISO/IEC 27701:2025, la legislación de protección de datos personales, la documentación interna del sistema de gestión (políticas, procedimientos, instructivos), requisitos contractuales y compromisos reglamentarios institucionales.

    Las no conformidades pueden ser identificadas a través de diversas fuentes operativas:
    - Hallazgos derivados de auditorías internas (Cláusula 9.2) o auditorías externas de certificación.
    - Resultados de la revisión por la dirección (Cláusula 9.3).
    - Reportes e investigaciones forenses posteriores a incidentes de seguridad de la información y brechas de PII (Cláusula 8.1 y Guía B.3.12).
    - Reclamaciones legítimas de titulares de datos en ejercicio de derechos ARCO.
    - Desviaciones observadas en el transcurso normal de las operaciones y controles rutinarios.

    Cualquier colaborador que detecte una no conformidad debe tomar de inmediato acciones de corrección inicial para controlarla, contener su propagación y mitigar sus consecuencias directas. En caso de que el colaborador que detecta la anomalía no tenga competencia sobre el área afectada, debe transmitirla de inmediato al responsable directo del proceso correspondiente y al Oficial de Seguridad de la Información / DPO.

    == Medidas correctivas
    La persona responsable debe evaluar formalmente la necesidad de eliminar el origen o causa raíz de la no conformidad con el propósito de evitar de forma definitiva su recurrencia.

    #callout(title: "DIFERENCIA ENTRE CORRECCIÓN Y MEDIDA CORRECTIVA", color: rgb("#0284c7"))[
      La distinción fundamental radica en su alcance y propósito estructural:
      - La *corrección* (o contención inmediata) se enfoca exclusivamente en atender los efectos y consecuencias directas del desvío en el corto plazo.
      - La *medida correctiva* (CAPA) ataca y elimina la causa raíz subyacente que originó el desvío, garantizando que la situación no vuelva a producirse en el futuro.
    ]

    Una medida correctiva puede ser iniciada por cualquier colaborador o surgir a solicitud de usuarios, titulares de datos personales, proveedores o auditores. La ejecución de una medida correctiva puede exigir modificaciones sobre procedimientos, infraestructura tecnológica, controles de seguridad o acuerdos de tratamiento de datos personales en el SGPI.

    == Implementación de medidas correctivas
    La gestión e implementación de una medida correctiva se desarrolla a través de la siguiente secuencia estructurada de pasos y asignación de responsabilidades:

    #table(
      columns: (1fr, 170pt),
      fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
      stroke: 0.5pt + luma(190),
      align: (left, left),
      table.header([*Paso Metodológico*], [*Persona Responsable de la Implementación*]),
      ..(if steps-table-data.len() > 0 {
        steps-table-data.map(step => (
          [#step.action],
          [#step.responsible]
        )).flatten()
      } else {
        (
          [*Paso 1: Revisión y registro de la no conformidad*\
          Recepción formal del reporte de hallazgo o incidente y descripción fáctica del desvío.],
          [Cualquier colaborador con función en el SGPI o persona que detecta el hallazgo],

          [*Paso 2: Determinación de la causa raíz de la no conformidad*\
          Análisis causal estructurado (metodología de 5 Porqués, diagrama de Ishikawa o árbol de fallas).],
          [Persona responsable del área donde se ha identificado la no conformidad],

          [*Paso 3: Identificación de no conformidades similares*\
          Verificación de si desvíos análogos ya existían o podrían presentarse en otras áreas o filiales.],
          [Persona responsable del área en coordinación con el Oficial de Seguridad / DPO],

          [*Paso 4: Evaluación de la necesidad de tomar acciones correctivas*\
          Decisión formal (SÍ / NO) analizando criticidad, impacto en titulares y probabilidad de repetición.],
          [Persona responsable del área y Oficial de Seguridad de la Información],

          [*Paso 5: Formulación del plan de acción correctiva*\
          Determinación de acciones específicas, recursos, cronograma y persona a cargo de la implementación.],
          [Persona responsable del área donde se identificó la no conformidad],

          [*Paso 6: Implementación de las acciones planificadas*\
          Ejecución material de los cambios técnicos, organizacionales o documentales aprobados.],
          [Persona a cargo de la implementación, designada por la persona responsable],

          [*Paso 7: Revisión y evaluación de la eficacia de la medida tomada*\
          Verificación empírica transcurrido el periodo de observación para comprobar la eliminación de la causa raíz (Cl. 10.2.d).],
          [Oficial de Seguridad de la Información (OSI / DPO)],

          [*Paso 8: Notificación y comunicación institucional*\
          Informar a todas las partes interesadas y colaboradores involucrados sobre el cierre de la medida.],
          [Persona a cargo de la implementación y Oficial de Seguridad],

          [*Paso 9: Ajustes estructurales al SGPI y documentación*\
          Actualización de procedimientos, SoA, matrices de riesgo o programas si fuera necesario (Cl. 10.2.e).],
          [Oficial de Seguridad de la Información (OSI / DPO) / Secretaría Técnica]
        )
      })
    )

    Cada uno de los pasos anteriores debe quedar debidamente registrado en el formulario correspondiente de medidas correctivas.

    = Gestión de registros guardados en base a este documento
    Los registros generados a partir de la aplicación de este procedimiento se gestionan conforme a los lineamientos de la Cláusula 7.5.3:

    #table(
      columns: (130pt, 85pt, 85pt, 1fr, 55pt),
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
          [Registro y Formulario de Medidas Correctivas (G4-REG-CAPA-01)],
          [Repositorio central PIMS institucional (GESTITEL)],
          [Oficial de Seguridad de la Información (OSI / DPO)],
          [Bloqueo de edición posterior al cierre, control de acceso por roles (RBAC) y bitácora de auditoría inmutable.],
          [3 años],
          [Evidencias documentales de verificación de eficacia],
          [Bóveda digital del SGPI y servidor DUTIC],
          [Oficial de Seguridad de la Información (OSI / DPO)],
          [Respaldo cifrado diario y protección contra sobrescritura.],
          [3 años]
        )
      })
    )

    = Apéndices
    - *Apéndice Único*: Formulario para Registro de Medidas Correctivas (`G4-REG-CAPA-01`).
  ]
}
