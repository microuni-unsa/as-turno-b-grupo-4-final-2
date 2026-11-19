#import "../../molds/audit-programme/mold-rep.typ": mold

#let data = (
  title: "Informe de Auditoría Interna del SGPI",
  short-title: "Informe de Auditoría Interna del SGPI",
  code: "G4-REP-AUD-01",
  version: "3.0",
  date: "2025-10-28",
  confidentiality: "Confidencial",
  author: (
    name: "Ing. Carlos M. Benítez",
    role: "Auditor Líder del SGPI",
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
  validity: "2026-10-28",
  owner-role: "Auditor Líder del SGPI / OSI",
  references: (
    "Norma ISO/IEC 27701:2025, Cláusula 9.2 (Auditoría interna, segunda edición).",
    "Norma ISO 19011:2026 (Directrices para la auditoría de los sistemas de gestión).",
    "Programa Anual de Auditorías Internas del SGPI (G4-PRG-AUD-01).",
    "Procedimiento de No Conformidades y Acciones Correctivas (G4-PRC-CAPA-01).",
    "Resoluciones Rectorales N° 0142-2025 y N° 0143-2025-UNSA (Filiales Camaná y Majes).",
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
    (
      version: "3.0",
      date: "2025-10-28",
      author: "Ing. Carlos M. Benítez",
      summary: "Recertificación bajo ISO/IEC 27701:2025: Informe consolidado multisede abarcando Filial Camaná y Filial El Pedregal (Majes)."
    ),
  ),
  objective_text: [El objetivo de este informe es documentar fehacientemente los resultados, hallazgos, evidencias objetivas y conclusiones derivados de la ejecución de la auditoría interna del SGPI en la Universidad Nacional de San Agustín de Arequipa (UNSA), de conformidad con la Cláusula 9.2.2 de ISO/IEC 27701:2025 y las directrices de ISO 19011:2026.],
  scope_text: [La auditoría evaluó los procesos de Admisión de Pregrado Integral y Planilla de Remuneraciones Multisede en las Sedes Centrales de Arequipa y en las Filiales Descentralizadas de Camaná y El Pedregal (Majes), así como la infraestructura de DUTIC y las estaciones portátiles de enrolamiento.],
  users_text: [Dirigido al Rectorado, Comité SGPI, Directora de DUTIC, Directores de Admisión y Personal, Coordinadores de Filiales y auditores externos de certificación.],
  general_data: (
    audit_code: "AUD-2025-CICLO2",
    normative_ref: "ISO/IEC 27701:2025 (Segunda edición) e ISO 19011:2026.",
    execution_dates: "15 al 22 de octubre de 2025.",
    audit_team: "Ing. Carlos M. Benítez (Auditor Líder), Ing. Marco Pinto (Auditor Técnico).",
    audited_areas: "Dirección General de Admisión, Subdirección de Personal, DUTIC, Filial Camaná y Filial El Pedregal."
  ),
  executive_summary: [La auditoría interna constató que el SGPI de la UNSA se encuentra adecuadamente implementado y mantenido en sus sedes centrales de Arequipa y en las filiales incorporadas en 2025. Se verificó un alto grado de compromiso de los responsables de proceso y una efectiva respuesta técnica ante incidentes de privacidad bajo la Guía B.3.12.],
  findings: (
    (
      id: "H-2025-01",
      tag: "VERDE",
      description: "Conformidad destacada: Implementación rigurosa de BitLocker XTS-AES 256 y enrolamiento MDM Intune en terminales móviles de Filial Camaná.",
      process_site: "Admisión (Filial Camaná)",
      capa_status: "Conforme"
    ),
    (
      id: "H-2025-02",
      tag: "VERDE",
      description: "Conformidad destacada: Cifrado en reposo y tránsito en lotes de dispersión bancaria y conciliación contra Sisgedo.",
      process_site: "Planillas (Sede Central)",
      capa_status: "Conforme"
    ),
    (
      id: "H-2025-03",
      tag: "AMARILLO",
      description: "Observación: Necesidad de reforzar simulaciones prácticas de phishing ante vectores de ingeniería social dirigidos a operadores de filiales.",
      process_site: "Planillas / Filiales (Camaná / Majes)",
      capa_status: "En curso (NC-2025-03)"
    )
  ),
  conclusion: [Se dictamina que el Sistema de Gestión de Privacidad de la Información (SGPI) de la UNSA cumple sustancialmente con los requisitos de la norma ISO/IEC 27701:2025 y se encuentra *listo para la auditoría externa de recertificación (Fase 1 y Fase 2)*. El hallazgo observado ha sido formalmente canalizado a través del registro `G4-REG-CAPA-01` con fecha de cierre en diciembre de 2025.]
)

#mold(data: data)
