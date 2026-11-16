#import "../../molds/audit-programme/mold-rep.typ": mold

#let data = (
  title: "Informe de Auditoría Interna del SGPI",
  code: "G4-REP-AUD-01",
  version: "2.0",
  date: "2022-09-10",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
  author: (
    name: "Ing. Carlos M. Benítez",
    role: "Auditor Líder del SGPI",
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
  validity: "2023-09-10",
  owner-role: "Auditor Líder del SGPI / OSI",
  references: (
    "Norma ISO/IEC 27701:2019 Cláusula 9.2 (Auditoría interna).",
    "Norma ISO 19011:2018 (Directrices para la auditoría de los sistemas de gestión).",
    "Programa Anual de Auditorías Internas del SGPI (G4-PRG-AUD-01).",
    "Procedimiento de No Conformidades y Acciones Correctivas (G4-PRC-CAPA-01).",
  ),
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Emisión inicial del formato de informe para la certificación ISO/IEC 27701:2019."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia incorporando hallazgos de plataformas web y teletrabajo."
    ),
  ),
  objective_text: [El objetivo de este informe es documentar los resultados, hallazgos y dictamen de conformidad de la auditoría interna del SGPI en la Universidad Nacional de San Agustín de Arequipa (UNSA), de conformidad con la Cláusula 9.2 de ISO/IEC 27701 e ISO 19011, evaluando la transición digital y teletrabajo.],
  scope_text: [Abarcó la plataforma institucional `admision.unsa.edu.pe`, los accesos remotos por VPN SSL para nóminas y la infraestructura virtualizada de DUTIC en las sedes centrales de Arequipa.],
  users_text: [Destinado al Rectorado, Comité SGPI, directores de unidad, administradores de sistemas y auditores de seguimiento.],
  general_data: (
    audit_code: "AUD-2022-CICLO2",
    normative_ref: "ISO/IEC 27701:2019 e ISO 19011:2018.",
    execution_dates: "20 al 27 de agosto de 2022.",
    audit_team: "Ing. Carlos M. Benítez (Auditor Líder), Ing. Marco Pinto (Auditor de Ciberseguridad).",
    audited_areas: "Plataforma Web Admisión, Subdirección de Personal en Teletrabajo y Servidores DUTIC."
  ),
  executive_summary: [La auditoría interna verificó que la transición digital forzada por la emergencia sanitaria se consolidó con adecuadas medidas de protección. Los canales de teletrabajo cuentan con MFA obligatorio y las bases de datos PostgreSQL mantienen respaldos diarios cifrados, requiriéndose afinar las alertas de expiración de sesiones JWT.],
  findings: (
    (
      id: "H-2022-01",
      tag: "VERDE",
      description: "Conformidad destacada: Despliegue efectivo de túneles VPN SSL con doble factor de autenticación para planillas.",
      process_site: "Planillas (Teletrabajo)",
      capa_status: "Conforme"
    ),
    (
      id: "H-2022-02",
      tag: "AMARILLO",
      description: "Observación: Ajustar el tiempo de expiración de tokens JWT en el portal de admisión a un máximo de 15 minutos de inactividad.",
      process_site: "Portal Web Admisión",
      capa_status: "En curso (CAPA-2022-02)"
    ),
    (
      id: "H-2022-03",
      tag: "VERDE",
      description: "Conformidad: Proceso de firma digital calificada plenamente operativo en boletas electrónicas de pago.",
      process_site: "Planillas / Sisgedo",
      capa_status: "Conforme"
    )
  ),
  conclusion: [Se dictamina que el Sistema de Gestión de Privacidad de la Información (SGPI) de la UNSA mantiene su conformidad con los requisitos de la norma ISO/IEC 27701 y ha respondido satisfactoriamente a las exigencias de virtualización y trabajo remoto. Las acciones de mejora han sido programadas en `G4-REG-CAPA-01`.]
)

#mold(data: data)
