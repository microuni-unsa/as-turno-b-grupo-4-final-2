// Invocador de versión v2.0 para G4-PRC-CAPA-01 (Procedimiento para Medidas Correctivas)
// SGPI UNSA — Actualización post-pandemia ISO/IEC 27701:2019 (10 de septiembre de 2022)

#import "mold-prc-capa.typ": mold-prc-capa

#show: mold-prc-capa.with(
  metadata: (
    title: "Procedimiento para medidas correctivas",
    code: "G4-PRC-CAPA-01",
    version: "2.0",
    date: "2022-09-10",
    confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
    author: (
      name: "Ing. Carlos M. Benítez",
      role: "Oficial de Seguridad de la Información (OSI / DPO)",
      date: "2022-09-02"
    ),
    reviewer: (
      name: "Mg. Lucía Valdivia Paredes",
      role: "Directora Universitaria de TIC (DUTIC)",
      date: "2022-09-05"
    ),
    approver: (
      name: "Dr. Hugo José Sánchez",
      role: "Rector - Presidente del Comité SGPI",
      date: "2022-09-10"
    ),
    history: (
      (
        version: "1.0",
        date: "2019-04-15",
        author: "Ing. Carlos M. Benítez",
        summary: "Emisión inicial aprobada para la certificación inicial ISO/IEC 27701:2019 en sedes centrales Arequipa."
      ),
      (
        version: "2.0",
        date: "2022-09-10",
        author: "Ing. Carlos M. Benítez",
        summary: "Actualización post-pandemia incorporando incidentes en canales digitales, teletrabajo y auditorías de seguridad web."
      ),
    ),
    validity: "2023-09-10",
    owner-role: "Oficial de Seguridad de la Información (OSI / DPO)"
  ),
  references: (
    "Norma Internacional ISO/IEC 27701:2025, Cláusula 10.2 (No conformidad y acción correctiva).",
    "Norma Internacional ISO/IEC 27001:2022, Cláusula 10.1 y 10.2.",
    "Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Política de Privacidad de la Información de la UNSA (G4-POL-01).",
    "Procedimiento de Respuesta a Incidentes de Privacidad (G4-PRC-INC-01).",
    "Procedimiento para auditoría interna del SGPI (G4-PRC-AUD-01).",
    "Apéndice: Formulario para medidas correctivas (G4-REG-CAPA-01)."
  ),
  scope-text: [
    Este procedimiento aplica a todas las no conformidades identificadas en los procesos digitalizados de Admisión (portal web institucional) y Planilla de Remuneraciones en modalidad de teletrabajo e híbrida en las Sedes Centrales de Arequipa (Campus Ingenierías, Biomédicas y Sociales), excluyendo legajos pasivos físicos anteriores al 2020.
  ],
  users-text: [
    Los usuarios de este documento son el personal del Rectorado, DUTIC, la Oficina de Seguridad de la Información / DPO, la Dirección General de Admisión, la Subdirección de Personal / RRHH y los operadores de datos en plataformas web del SGPI.
  ]
)
