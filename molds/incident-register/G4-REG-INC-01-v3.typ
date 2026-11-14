#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
  title: "Registro Oficial de Incidentes de Privacidad (SGPI)",
  code: "G4-REG-INC-01",
  version: "3.0",
  date: "2025-10-28",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
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
      summary: "Emisión inicial del formato de registro para la certificación inicial ISO/IEC 27701:2019. Alcance: Sedes Arequipa (Admisión y Planilla presencial)."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización mayor post-pandemia: Incorporación de campos para incidentes en plataformas web (admision.unsa.edu.pe), accesos lógicos y teletrabajo de personal."
    ),
    (
      version: "3.0",
      date: "2025-10-28",
      author: "Ing. Carlos M. Benítez",
      summary: "Recertificación bajo ISO/IEC 27701:2025 (segunda edición): Integración de incidentes en Filial Camaná y Filial El Pedregal (Majes), vectores de terminales remotos y enlaces VPN."
    ),
  )
)

= Propósito y Criterio Operacional
Este documento consolida el registro de incidentes de privacidad de la información bajo la norma ISO/IEC 27701:2025 Cláusulas 8.1 y 7.5.1 y Guía B.3.12, cubriendo tanto los campus centrales de Arequipa como las filiales descentralizadas de Camaná y El Pedregal (Majes).

#callout(title: "CRITERIO DE NOTIFICACIÓN DE BRECHAS (GUÍA B.3.12)", color: rgb("#0284c7"))[
  Conforme a la Cláusula 8.1 y las directrices de la Guía B.3.12, la UNSA evalúa cada brecha de seguridad considerando la probabilidad de daño a los titulares y la efectividad del cifrado de datos (A.3.26). La notificación ante la autoridad administrativa y los titulares se ejecuta con base en este análisis objetivo de riesgo institucional, sin sujeción al plazo externo de 72 horas del RGPD europeo.
]

= Registro Consolidado Multisede (Periodos 2019 – 2025)

#table(
  columns: (45pt, 65pt, 50pt, 75pt, 95pt, 1fr),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, center, center, left, left, left),
  table.header([*ID*], [*Detección*], [*Severidad*], [*Categoría*], [*Titulares Afectados*], [*Contención y Notificación*]),
  
  [G4-INC-2019-001],
  [2019-05-14\ 08:30],
  rag-tag("MEDIO"),
  [Confidencialidad / Papel impreso],
  [18 postulantes ordinarios],
  [
    *Contención:* Destrucción física certificada.\
    *Notificación:* #status-tag("EVALUADO_NO_REQUIERE").
  ],

  [G4-INC-2019-002],
  [2019-09-22\ 14:15],
  rag-tag("ALTO"),
  [Confidencialidad / Correo masivo],
  [42 docentes Facultad de Sociales],
  [
    *Contención:* Recall en Exchange y borrado confirmado.\
    *Notificación:* #status-tag("NOTIFICADO_TITULARES").
  ],

  [G4-INC-2022-001],
  [2022-03-18\ 11:00],
  rag-tag("CRÍTICO"),
  [Acceso no autorizado / IDOR Web],
  [1,240 postulantes inscritos online],
  [
    *Contención:* Parche hotfix en backend; rotación JWT.\
    *Notificación:* #status-tag("NOTIFICADO_AUTORIDAD_ANPDP").
  ],

  [G4-INC-2022-002],
  [2022-07-05\ 16:40],
  rag-tag("BAJO"),
  [Disponibilidad / Fallo backup BD],
  [0 (Sin impacto directo)],
  [
    *Contención:* Ejecución manual de réplica; SHA-256 verificado.\
    *Notificación:* #status-tag("EVALUADO_NO_REQUIERE").
  ],

  [G4-INC-2025-001],
  [2025-04-12\ 09:20],
  rag-tag("ALTO"),
  [Confidencialidad / Robo de laptop],
  [115 postulantes Filial Camaná],
  [
    *Contención:* Bloqueo y borrado remoto MDM; disco cifrado BitLocker XTS-AES 256 verificado.\
    *Notificación:* #status-tag("EVALUADO_NO_REQUIERE") (Cifrado impidió exfiltración de PII).
  ],

  [G4-INC-2025-002],
  [2025-08-20\ 15:10],
  rag-tag("MEDIO"),
  [Integridad / Error sincronización],
  [48 trabajadores Filial El Pedregal],
  [
    *Contención:* Pausa preventiva de pagos bancarios; reconciliación contra padrón Sisgedo.\
    *Notificación:* #status-tag("NOTIFICADO_TITULARES") (Aviso transparente a trabajadores).
  ],

  [G4-INC-2025-003],
  [2025-11-03\ 10:05],
  rag-tag("BAJO"),
  [Confidencialidad / Intento Phishing],
  [0 (Ataque frustrado)],
  [
    *Contención:* Bloqueo perimetral de dominios y concientización a operadores.\
    *Notificación:* #status-tag("EVALUADO_NO_REQUIERE").
  ]
)

= Resumen de Desempeño Operacional y Cadena CAPA
Todos los incidentes del periodo 2025 han sido contenidos satisfactoriamente y cuentan con su respectivo expediente de causa raíz y acción correctiva registrado en `G4-REG-CAPA-01`.
