#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
  title: "Registro de Asistencia y Evaluación: Módulo de Incidentes",
  code: "G4-REG-CAP-01",
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
      summary: "Emisión inicial de registros de asistencia y evaluación para personal de Admisión y Planillas en sedes centrales Arequipa."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia: Registro de asistencia y evaluación virtual sincrónica/asincrónica en Aula Virtual UNSA."
    ),
    (
      version: "3.0",
      date: "2025-10-28",
      author: "Ing. Carlos M. Benítez",
      summary: "Recertificación bajo ISO/IEC 27701:2025 (segunda edición): Registro multisede incorporando operadores de Filial Camaná y Filial El Pedregal (Majes)."
    ),
  )
)

= Ficha General de la Acción Formativa Multisede
- *Módulo Vinculado*: `G4-CAP-INC-01` (Respuesta a Incidentes de Privacidad — Pista 3 Implementadores).
- *Instructor Principal*: Ing. Carlos M. Benítez (Oficial de Seguridad de la Información / DPO).
- *Fechas de Ejecución*: 03 al 07 de noviembre de 2025 (8 horas híbridas).
- *Sedes Conectadas*: Campus Central Arequipa, Filial Camaná (Av. Costanera s/n) y Filial El Pedregal (Calle 4 s/n).

= Registro Consolidado Multisede de Asistencia y Calificaciones (Edición 2025)

#table(
  columns: (48pt, 115pt, 100pt, 45pt, 40pt, 40pt, 50pt),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, left, left, center, center, center, center),
  table.header([*DNI*], [*Apellidos y Nombres*], [*Sede / Dependencia / Cargo*], [*Asist.*], [*Pre*], [*Post*], [*Condición*]),
  
  [29481920], [Cornejo Zegarra, Manuel], [Arequipa - Admisión Central], [100%], [09/20], [19/20], status-tag("APROBADO"),
  [41209384], [Huamán Quispe, Rosa], [Arequipa - Planillas Central], [100%], [08/20], [18/20], status-tag("APROBADO"),
  [29740112], [Pinto Medina, Marco], [Arequipa - DUTIC Infraestructura], [100%], [11/20], [20/20], status-tag("APROBADO"),
  [45892019], [Cárdenas López, Marcos], [Filial Camaná - Coordinador Sede], [100%], [06/20], [18/20], status-tag("APROBADO"),
  [46102938], [Zúñiga Vera, Roberto], [Filial El Pedregal - Enlace Técnico], [100%], [07/20], [19/20], status-tag("APROBADO"),
  [42819204], [Barriga Díaz, Claudia], [Filial Camaná - Operadora Admisión], [100%], [05/20], [17/20], status-tag("APROBADO"),
  [44901827], [Salas Paredes, Fernando], [Filial El Pedregal - Operador Planillas], [100%], [06/20], [18/20], status-tag("APROBADO")
)

= Resumen Estadístico de Eficacia Formativa Multisede
- *Total de Participantes Evaluados:* 7 (100% personal clave en sedes Arequipa y filiales descentralizadas).
- *Promedio Diagnóstico de Entrada (Pre-test):* 07.4 / 20
- *Promedio de Suficiencia de Salida (Post-test):* 18.4 / 20 (Incremento de +11.0 puntos).
- *Conclusión del Auditor Líder:* Queda demostrada la competencia técnica uniforme en las tres sedes universitarias para la detección, contención inmediata y reporte de incidentes conforme a las Cláusulas 7.2 y 7.3 de la norma ISO/IEC 27701:2025.
