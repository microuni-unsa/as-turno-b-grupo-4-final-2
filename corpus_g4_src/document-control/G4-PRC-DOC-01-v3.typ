// Invocador de versión v3.0 para G4-PRC-DOC-01 (Procedimiento para Control de Documentos y Registros)
// SGPI UNSA — Recertificación ISO/IEC 27701:2025 (28 de octubre de 2025)

#import "../../molds/document-control/mold.typ": mold

#show: mold.with(
  metadata: (
    title: "Procedimiento para control de documentos y registros",
    short-title: "Control de Documentos y Registros",
    code: "G4-PRC-DOC-01",
    version: "3.0",
    date: "2025-10-28",
    confidentiality: "Confidencial",
    author: (
      name: "Ing. Carlos M. Benítez",
      role: "Oficial de Seguridad de la Información (OSI / DPO)",
      date: "2025-10-20"
    ),
    reviewer: (
      name: "Mg. Lucía Valdivia Paredes",
      role: "Directora Universitaria de TIC (DUTIC)",
      date: "2025-10-24"
    ),
    approver: (
      name: "Dr. Hugo José Sánchez",
      role: "Rector - Presidente del Comité SGPI",
      date: "2025-10-28"
    ),
    history: (
      (
        version: "1.0",
        date: "2019-04-15",
        author: "Ing. Carlos M. Benítez",
        summary: "Emisión inicial aprobada para la certificación inicial ISO/IEC 27701:2019 del SGPI UNSA en sedes centrales Arequipa."
      ),
      (
        version: "2.0",
        date: "2022-09-10",
        author: "Ing. Carlos M. Benítez",
        summary: "Actualización para incorporar el repositorio documental electrónico, firma digital en Sisgedo y teletrabajo de nóminas."
      ),
      (
        version: "3.0",
        date: "2025-10-28",
        author: "Ing. Carlos M. Benítez",
        summary: "MAYOR_DOC :: Recertificación bajo ISO/IEC 27701:2025 (segunda edición) :: Formalización de reglas de versionado de moldes Typst 0.15, convención change_summary, repositorio PIMS GESTITEL y extensión territorial a Filiales Camaná y El Pedregal (Majes)."
      ),
    ),
    validity: "2026-10-28",
    owner-role: "Oficial de Seguridad de la Información (OSI / DPO)"
  ),
  references: (
    "Norma Internacional ISO/IEC 27701:2025, subcláusulas 7.5.1, 7.5.2 y 7.5.3 (Información documentada) y Controles A.3.14, A.1.4.8, A.1.4.9.",
    "Norma Internacional ISO/IEC 27001:2022, subcláusula 7.5 y Anexo A.8.28.",
    "Ley N° 29733, Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Política de Privacidad de la Información de la UNSA (G4-POL-01).",
    "Reglamento de Gestión Documental y Firma Digital de la UNSA (RR 0450-2021).",
    "Resoluciones Rectorales N° 0142-2025 y N° 0143-2025 (Incorporación de Filiales Camaná y Majes)."
  ),
  scope-text: [
    Este procedimiento se aplica a todos los documentos y registros del SGPI en soporte digital y físico vinculados a los procesos de Admisión y Planilla en las Sedes Centrales de Arequipa (Campus Ingenierías, Biomédicas y Sociales) y Filiales Regionales de Camaná y El Pedregal - Majes, excluyendo archivos físicos pasivos cerrados al 2020.
  ],
  users-text: [
    Los usuarios de este documento son todos los colaboradores, autoridades, directores de unidad, coordinadores de filial y personal técnico con responsabilidades en la creación, custodia y actualización de información documentada en el SGPI.
  ]
)
