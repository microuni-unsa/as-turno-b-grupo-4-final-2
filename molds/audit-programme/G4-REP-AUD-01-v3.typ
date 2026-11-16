#import "mold-rep.typ": mold

#let data = (
  title: "Informe de Auditoría Interna del SGPI",
  code: "G4-REP-AUD-01",
  version: "3.0",
  date: "2025-10-28",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
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
      description: "Conformidad destacada: Implementación rigurosa de BitLocker y MDM en terminales de Camaná.",
      process_site: "Admisión (Filial Camaná)",
      capa_status: "Conforme"
    ),
    (
      id: "H-2025-02",
      tag: "VERDE",
      description: "Conformidad destacada: Cifrado en reposo y tránsito en lotes de dispersión bancaria.",
      process_site: "Planillas (Sede Central)",
      capa_status: "Conforme"
    ),
    (
      id: "H-2025-03",
      tag: "AMARILLO",
      description: "Observación: Necesidad de reforzar simulaciones prácticas de phishing ante ataques sofisticados en operadores de filiales.",
      process_site: "Planillas / Filiales (Camaná / Majes)",
      capa_status: "En curso (NC-2025-03)"
    )
  ),
  conclusion: [Se dictamina que el Sistema de Gestión de Privacidad de la Información (SGPI) de la UNSA cumple sustancialmente con los requisitos de la norma ISO/IEC 27701:2025 y se encuentra *listo para la auditoría externa de recertificación (Fase 1 y Fase 2)*. El hallazgo observado ha sido formalmente canalizado a través del registro `G4-REG-CAPA-01` con fecha de cierre en diciembre de 2025.]
)

#mold(data: data)
