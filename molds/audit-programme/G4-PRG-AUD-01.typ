#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
  title: "Programa Anual de Auditorías Internas del SGPI",
  code: "G4-PRG-AUD-01",
  version: "3.0",
  date: "2025-10-28",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
  author: (
    name: "Ing. Carlos M. Benítez",
    role: "Auditor Líder / Oficial de Seguridad (OSI)",
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
      summary: "Emisión del primer programa anual de auditorías para la certificación ISO/IEC 27701:2019."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia incorporando auditorías de seguridad en aplicaciones web y teletrabajo."
    ),
    (
      version: "3.0",
      date: "2025-10-28",
      author: "Ing. Carlos M. Benítez",
      summary: "Recertificación bajo ISO/IEC 27701:2025: Extensión del programa a Filial Camaná y Filial El Pedregal (Majes) bajo ISO 19011:2026."
    ),
  )
)

= Propósito y Fundamento Normativo
Establecer y planificar el Programa Anual de Auditorías Internas para evaluar la conformidad, eficacia y madurez del SGPI de la UNSA, de conformidad con la Cláusula 9.2 de la norma ISO/IEC 27701:2025 y las directrices metodológicas de la norma ISO 19011:2026.

= Objetivos del Programa de Auditoría
1. Verificar si el SGPI es conforme con los requisitos propios de la UNSA y los requisitos normativos de ISO/IEC 27701:2025 (Cláusulas 4 a 10 y Anexo A).
2. Evaluar la eficacia operacional en los procesos misionales de Admisión y de soporte de Planillas en campus centrales y filiales descentralizadas.
3. Identificar oportunidades de mejora continua y verificar la eficacia de las acciones correctivas previas (`G4-REG-CAPA-01`).

= Alcance y Criterios de Auditoría
- *Alcance Organizacional:* Admisión Pregrado y Planillas de Remuneraciones en Sedes Arequipa, Filial Camaná y Filial El Pedregal (Majes).
- *Criterios de Auditoría:* Norma ISO/IEC 27701:2025, Ley N° 29733 de Protección de Datos Personales de Perú, Políticas institucionales (`G4-POL-01`) y Procedimientos operativos (`G4-PRC-INC-01`, `G4-PRC-DOC-01`).

= Cronograma y Asignación de Recursos (Periodo 2025 – 2026)

#table(
  columns: (40pt, 85pt, 1fr, 75pt, 65pt, 55pt),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, left, left, left, center, center),
  table.header([*Ciclo*], [*Proceso / Sede*], [*Cláusulas y Controles Foco*], [*Equipo Auditor*], [*Mes / Fecha*], [*Estado*]),
  
  [AUD-01],
  [Admisión Central\ (Campus Arequipa)],
  [Cl. 4, 5, 8.1 / A.1.2.9, A.1.3.7, A.1.4.2 (Captura biométrica y padrones).],
  [Ing. Carlos Benítez\ (Auditor Líder)],
  [Mayo 2025],
  status-tag("CERRADA"),

  [AUD-02],
  [Planillas Central\ (Campus Arequipa)],
  [Cl. 6.1, 7.5 / A.3.7, A.3.9, A.3.26 (Dispersión bancaria y cifrado).],
  [Lic. Rosa Huamán\ (Auditora Interna)],
  [Junio 2025],
  status-tag("CERRADA"),

  [AUD-03],
  [Filial Camaná\ (Sede Descentralizada)],
  [Cl. 8.1, A.3.11, A.3.22 (Seguridad terminales móviles y admisiones filial).],
  [Ing. Carlos Benítez\ Ing. Marco Pinto],
  [Octubre 2025],
  status-tag("CERRADA"),

  [AUD-04],
  [Filial El Pedregal\ (Sede Descentralizada)],
  [Cl. 8.1, A.3.7, A.3.12 (Sincronización nómina VPN y respuesta local).],
  [Ing. Carlos Benítez\ Mg. Lucía Valdivia],
  [Noviembre 2025],
  status-tag("EN_CURSO")
)

= Métodos de Auditoría y Reporte (ISO 19011:2026)
- Se aplicará muestreo estadístico representativo sobre expedientes de admisión y nóminas salariales.
- Pruebas técnicas de verificación de cifrado de disco BitLocker y configuración de firewalls de filial.
- Los resultados se consolidan formalmente en el Informe de Auditoría Interna (`G4-REP-AUD-01`).
