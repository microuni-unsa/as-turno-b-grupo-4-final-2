// mold-prc-capa.typ — Molde parametrizado para Procedimiento para Medidas Correctivas
// Cumple con ISO/IEC 27701:2025 Cláusula 10.2 (No conformidad y acción correctiva), Control A.3.16,
// y replica la estructura exacta del formato oficial del instructor "Procedimiento para medidas correctivas".
// CERO datos de instancia institucional en este archivo.

#import "../common/template.typ": doc-template

#let mold-prc-capa(
  metadata: (:),
  references: (),
  scope-text: none,
  users-text: none,
  steps-table-data: (),
  records-table-data: (),
  ..sink
) = {
  show: doc-template.with(
    title: metadata.at("title", default: "Procedimiento para medidas correctivas"),
    short-title: metadata.at("short-title", default: none),
    code: metadata.at("code", default: "G4-PRC-CAPA-01"),
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

    El objetivo de este procedimiento es describir todas las actividades relacionadas con la iniciación, implementación y mantenimiento de registros de correcciones, como también de medidas correctivas.

    #(if scope-text != none { scope-text } else [
      Este procedimiento se aplica a todas las actividades implementadas dentro del Sistema de Gestión de Privacidad de la Información (SGPI) de la Universidad Nacional de San Agustín de Arequipa (UNSA), de conformidad con la norma ISO/IEC 27701:2025 y la Ley N° 29733 de Protección de Datos Personales del Perú.
    ])

    #(if users-text != none { users-text } else [
      Los usuarios de este documento son todos los empleados de la Universidad Nacional de San Agustín de Arequipa (UNSA) incluidos dentro del alcance del SGPI.
    ])

    = Documentos de referencia

    #(if references.len() > 0 {
      for ref-item in references [
        - #ref-item
      ]
    } else [
      - Norma ISO/IEC 27701:2025, Cláusula 10.1 (Mejora continua) y 10.2 (No conformidad y acción correctiva).
      - Norma ISO 19011:2018 / 2026, Directrices para la auditoría de los sistemas de gestión.
      - Política de Privacidad de la Información de la UNSA (G4-POL-01).
      - Procedimiento para auditoría interna del SGPI (G4-PRC-AUD-01).
      - Procedimiento de Respuesta a Incidentes de Privacidad (G4-PRC-INC-01).
    ])

    = Correcciones y medidas correctivas

    == No conformidades y correcciones
    Una no-conformidad es todo incumplimiento de los requerimientos de las normas, documentación interna, reglamentos, obligaciones contractuales y de otra clase dentro del SGPI. Las no conformidades pueden ser identificadas durante una auditoría interna o externa, en base a resultados de la revisión por parte de la dirección, luego de incidentes de seguridad o brechas de datos personales (PII), durante el transcurso normal de las operaciones o en cualquier otra situación.

    Un empleado que detecta una no conformidad debe tomar acciones inmediatamente para controlarla, contenerla y corregirla y para contener sus consecuencias. Si un empleado no es responsable de esa no conformidad debe transmitir la información sobre ella a una persona responsable que pueda corregirla.

    == Medidas correctivas
    La persona responsable debe evaluar la necesidad de eliminar el origen de la no conformidad y evitar su recurrencia tomando medidas correctivas. La principal diferencia es que las medidas correctivas eliminan la causa de una no-conformidad, mientras que la corrección se enfoca solamente en controlar la no-conformidad y en atender las consecuencias directas.

    Una medida correctiva puede ser iniciada por cualquier empleado o, cuando sea pertinente, por cualquier titular de datos, cliente, proveedor o socio de la organización. Una medida correctiva puede demandar cambios sobre cualquier documento, proceso o acuerdo dentro del marco del SGPI.

    == Implementación de medidas correctivas
    Una medida correctiva se implementa de la siguiente forma:

    #table(
      columns: (1fr, 170pt),
      fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
      stroke: 0.5pt + luma(190),
      align: (left, left),
      table.header([*Paso*], [*Persona responsable de la implementación*]),
      ..(if steps-table-data.len() > 0 {
        steps-table-data.map(step => (
          [#step.action],
          [#step.responsible]
        )).flatten()
      } else {
        (
          [1. Revisión de la no conformidad], [Cualquiera con una función dentro del SGPI],
          [2. Determinación de la causa de la no-conformidad], [Persona responsable del área donde se ha identificado la no-conformidad],
          [3. Identificar si la no conformidad ya existía], [Persona responsable del área donde se ha identificado la no-conformidad],
          [4. Evaluación de la necesidad de tomar acciones para eliminar la no-conformidad], [Persona responsable del área donde se ha identificado la no-conformidad],
          [5. Determinación de las acciones necesarias para eliminar las causas de la no-conformidad y para asegurar que no se produzca nuevamente], [Persona responsable del área donde se ha identificado la no-conformidad],
          [6. Implementación de las acciones planificadas], [Persona a cargo de la implementación, designada por la persona responsable],
          [7. Revisión para determinar si la medida tomada logró eliminar las causas de la no-conformidad], [Oficial de Seguridad de la Información (OSI) / DPO],
          [8. Informar a todas las personas involucradas que se ha implementado la medida correctiva], [Persona a cargo de la implementación, designada por la persona responsable],
          [9. Realizar cambios al SGPI, si fuera necesario.], [La persona que está a cargo de coordinar el SGPI (Oficial de Seguridad / DPO).]
        )
      })
    )

    Cada uno de los pasos anteriores debe quedar registrado en el formulario de medidas correctivas.

    = Gestión de registros guardados en base a este documento

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
          [Formulario para medidas correctivas],
          [Repositorio central PIMS institucional (GESTITEL)],
          [Oficial de Seguridad de la Información (OSI) / DPO],
          [Una vez que se han registrado todos los datos, se debe bloquear cualquier agregado o edición.],
          [3 años]
        )
      })
    )

    = Validez y gestión de documentos

    Este documento es válido hasta el #(if metadata.at("validity", default: none) != none { metadata.validity } else { metadata.at("date", default: "") }).

    El propietario de este documento es el #(if metadata.at("owner-role", default: none) != none { metadata.owner-role } else { "Oficial de Seguridad de la Información (OSI) / DPO" }), que debe verificar, y si es necesario actualizar, el documento por lo menos una vez al año.

    Al evaluar la efectividad y adecuación de este documento, es necesario tener en cuenta los siguientes criterios:
    - Cantidad de medidas correctivas iniciadas
    - Cantidad de medidas correctivas incompletas
    - Cantidad de medidas correctivas tomadas sin haber sido registradas en un formulario designado

    = Apéndices
    - Apéndice: Formulario para medidas correctivas (G4-REG-CAPA-01)
  ]
}
