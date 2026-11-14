#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
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
  )
)

= Datos Generales de la Auditoría
- *Código de Auditoría:* `AUD-2025-CICLO2`
- *Norma de Referencia:* ISO/IEC 27701:2025 (Segunda edición) e ISO 19011:2026.
- *Fechas de Ejecución:* 15 al 22 de octubre de 2025.
- *Equipo Auditor:* Ing. Carlos M. Benítez (Auditor Líder), Ing. Marco Pinto (Auditor Técnico).
- *Áreas Auditadas:* Dirección General de Admisión, Subdirección de Personal, DUTIC, Filial Camaná y Filial El Pedregal.

= Resumen Ejecutivo
La auditoría interna constató que el SGPI de la UNSA se encuentra adecuadamente implementado y mantenido en sus sedes centrales de Arequipa y en las filiales incorporadas en 2025. Se verificó un alto grado de compromiso de los responsables de proceso y una efectiva respuesta técnica ante incidentes de privacidad bajo la Guía B.3.12.

= Cuadro Resumen de Hallazgos

#table(
  columns: (70pt, 80pt, 1fr, 80pt, 70pt),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, left, left, center, center),
  table.header([*Hallazgo*], [*Tipo*], [*Descripción del Hallazgo y Evidencia*], [*Proceso / Sede*], [*Estado CAPA*]),
  
  [H-2025-01],
  rag-tag("VERDE"),
  [Conformidad destacada: Implementación rigurosa de BitLocker y MDM en terminales de Camaná.],
  [Admisión\ (Filial Camaná)],
  [Conforme],

  [H-2025-02],
  rag-tag("VERDE"),
  [Conformidad destacada: Cifrado en reposo y tránsito en lotes de dispersión bancaria.],
  [Planillas\ (Sede Central)],
  [Conforme],

  [H-2025-03],
  rag-tag("AMARILLO"),
  [Observación: Necesidad de reforzar simulaciones prácticas de phishing ante ataques sofisticados en operadores de filiales.],
  [Planillas / Filiales\ (Camaná / Majes)],
  [#status-tag("EN_CURSO")\ `NC-2025-03`]
)

= Conclusión y Dictamen del Auditor Líder
Se dictamina que el Sistema de Gestión de Privacidad de la Información (SGPI) de la UNSA cumple sustancialmente con los requisitos de la norma ISO/IEC 27701:2025 y se encuentra *listo para la auditoría externa de recertificación (Fase 1 y Fase 2)*. El hallazgo observado ha sido formalmente canalizado a través del registro `G4-REG-CAPA-01` con fecha de cierre en diciembre de 2025.
