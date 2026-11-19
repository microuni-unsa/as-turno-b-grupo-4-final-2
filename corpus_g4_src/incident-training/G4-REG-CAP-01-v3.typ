// Invocador de versión v3.0 para G4-REG-CAP-01 (Registro de Asistencia y Evaluación)
// SGPI UNSA — Recertificación ISO/IEC 27701:2025 (Segunda edición, 28 de octubre de 2025)

#import "../../molds/incident-training/mold-reg-cap.typ": mold-reg-cap

#show: mold-reg-cap.with(
  metadata: (
    title: "Registro de Asistencia y Evaluación",
    short-title: "Registro de Asistencia y Evaluación",
    code: "G4-REG-CAP-01",
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
        summary: "Recertificación bajo ISO/IEC 27701:2025: Registro multisede incorporando operadores de Filial Camaná y Filial El Pedregal (Majes)."
      ),
    ),
    validity: "2026-10-28",
    owner-role: "Oficial de Seguridad de la Información (OSI / DPO)"
  ),
  references: (
    "Norma Internacional ISO/IEC 27701:2025, Cláusula 7.2 (Competencia).",
    "Norma Internacional ISO/IEC 27701:2025, Control A.3.17 y Guía B.3.17.",
    "Plan y Módulo Formativo de Incidentes (G4-CAP-INC-01-v3).",
    "Procedimiento de Respuesta a Incidentes de Privacidad (G4-PRC-INC-01)."
  ),
  course-info: (
    module-ref: "G4-CAP-INC-01-v3 (Respuesta a Incidentes de Privacidad Multisede)",
    instructor: "Ing. Carlos M. Benítez (Oficial de Seguridad de la Información / DPO)",
    dates: "03 al 07 de noviembre de 2025",
    location: "Híbrida — Campus Central Arequipa, Filial Camaná (Av. Costanera s/n) y Filial El Pedregal (Calle 4 s/n)",
    hours: "8 horas pedagógicas teórico-prácticas híbridas"
  ),
  table-columns: (48pt, 115pt, 100pt, 45pt, 40pt, 40pt, 50pt),
  table-headers: ([*DNI*], [*Apellidos y Nombres*], [*Sede / Dependencia / Cargo*], [*Asist.*], [*Pre*], [*Post*], [*Condición*]),
  attendees: (
    (dni: "29481920", name: "Cornejo Zegarra, Manuel", role-unit: "Arequipa - Admisión Central", attendance: "100%", pre-test: "09/20", post-test: "19/20", status: "APROBADO"),
    (dni: "41209384", name: "Huamán Quispe, Rosa", role-unit: "Arequipa - Planillas Central", attendance: "100%", pre-test: "08/20", post-test: "18/20", status: "APROBADO"),
    (dni: "29740112", name: "Pinto Medina, Marco", role-unit: "Arequipa - DUTIC Infraestructura", attendance: "100%", pre-test: "11/20", post-test: "20/20", status: "APROBADO"),
    (dni: "45892019", name: "Cárdenas López, Marcos", role-unit: "Filial Camaná - Coordinador Sede", attendance: "100%", pre-test: "06/20", post-test: "18/20", status: "APROBADO"),
    (dni: "46102938", name: "Zúñiga Vera, Roberto", role-unit: "Filial El Pedregal - Enlace Técnico", attendance: "100%", pre-test: "07/20", post-test: "19/20", status: "APROBADO"),
    (dni: "42819204", name: "Barriga Díaz, Claudia", role-unit: "Filial Camaná - Operadora Admisión", attendance: "100%", pre-test: "05/20", post-test: "17/20", status: "APROBADO"),
    (dni: "44901827", name: "Salas Paredes, Fernando", role-unit: "Filial El Pedregal - Operador Planillas", attendance: "100%", pre-test: "06/20", post-test: "18/20", status: "APROBADO")
  ),
  statistics: (
    total-evaluated: "7 participantes clave (100% personal clave en sedes Arequipa y filiales descentralizadas)",
    pre-average: "07.4 / 20",
    post-average: "18.4 / 20 (Nivel sobresaliente)",
    delta: "+11.0 puntos de incremento formativo",
    pass-rate: "100% (todos superaron la nota mínima de 14.0/20)",
    conclusion: "Queda demostrada la competencia técnica uniforme en las tres sedes universitarias para la detección, contención inmediata y reporte de incidentes conforme a las Cláusulas 7.2 y 7.3 de ISO/IEC 27701:2025."
  )
)
