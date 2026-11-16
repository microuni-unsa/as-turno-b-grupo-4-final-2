// Invocador de versión v1.0 para G4-REG-CAP-01 (Registro de Asistencia y Evaluación)
// SGPI UNSA — Certificación inicial ISO/IEC 27701:2019 (15 de abril de 2019)

#import "mold-reg-cap.typ": mold-reg-cap

#show: mold-reg-cap.with(
  metadata: (
    title: "Registro de Asistencia y Evaluación",
    code: "G4-REG-CAP-01",
    version: "1.0",
    date: "2019-04-15",
    confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
    author: (
      name: "Ing. Carlos M. Benítez",
      role: "Oficial de Seguridad de la Información (OSI / DPO)",
      date: "2019-04-10"
    ),
    reviewer: (
      name: "Mg. Lucía Valdivia Paredes",
      role: "Directora Universitaria de TIC (DUTIC)",
      date: "2019-04-12"
    ),
    approver: (
      name: "Dr. Rohel Sánchez Sánchez",
      role: "Rector - Presidente del Comité SGPI",
      date: "2019-04-15"
    ),
    history: (
      (
        version: "1.0",
        date: "2019-04-15",
        author: "Ing. Carlos M. Benítez",
        summary: "Emisión inicial de registros de asistencia y evaluación para personal de Admisión y Planillas en sedes centrales Arequipa."
      ),
    ),
    validity: "2020-04-15",
    owner-role: "Oficial de Seguridad de la Información (OSI / DPO)"
  ),
  references: (
    "Norma Internacional ISO/IEC 27701:2025, Cláusula 7.2 (Competencia).",
    "Norma Internacional ISO/IEC 27701:2025, Control A.3.17 y Guía B.3.17.",
    "Plan y Módulo Formativo de Incidentes (G4-CAP-INC-01-v1).",
    "Procedimiento de Respuesta a Incidentes de Privacidad (G4-PRC-INC-01)."
  ),
  course-info: (
    module-ref: "G4-CAP-INC-01-v1 (Respuesta a Incidentes de Privacidad — Pista 3 Implementadores)",
    instructor: "Ing. Carlos M. Benítez (Oficial de Seguridad de la Información / DPO)",
    dates: "22 al 25 de abril de 2019",
    location: "Presencial — Auditorio de la DUTIC (Campus Ingenierías, Arequipa)",
    hours: "8 horas pedagógicas teórico-prácticas presenciales"
  ),
  table-columns: (50pt, 120pt, 90pt, 50pt, 45pt, 45pt, 55pt),
  table-headers: ([*DNI*], [*Apellidos y Nombres*], [*Dependencia / Cargo*], [*Asistencia*], [*Pre-Test*], [*Post-Test*], [*Condición*]),
  attendees: (
    (dni: "29481920", name: "Cornejo Zegarra, Manuel", role-unit: "Admisión - Vocal Pabellón", attendance: "100% (4/4)", pre-test: "07 / 20", post-test: "17 / 20", status: "APROBADO"),
    (dni: "41209384", name: "Huamán Quispe, Rosa", role-unit: "Planillas - Asistente", attendance: "100% (4/4)", pre-test: "06 / 20", post-test: "18 / 20", status: "APROBADO"),
    (dni: "29740112", name: "Pinto Medina, Marco", role-unit: "DUTIC - Administrador BD", attendance: "100% (4/4)", pre-test: "09 / 20", post-test: "19 / 20", status: "APROBADO"),
    (dni: "40819273", name: "Vilca Carpio, Jorge", role-unit: "Admisión - Operador Registro", attendance: "100% (4/4)", pre-test: "08 / 20", post-test: "16 / 20", status: "APROBADO"),
    (dni: "29601928", name: "Gutiérrez Ramos, Elena", role-unit: "Planillas - Analista Nómina", attendance: "100% (4/4)", pre-test: "05 / 20", post-test: "17 / 20", status: "APROBADO")
  ),
  statistics: (
    total-evaluated: "5 participantes",
    pre-average: "07.0 / 20 (Nivel inicial deficiente, acreditando necesidad de formación)",
    post-average: "17.4 / 20 (Nivel satisfactorio)",
    delta: "+10.4 puntos de incremento formativo",
    pass-rate: "100% (todos superaron la nota mínima aprobatoria de 14.0/20)",
    conclusion: "Se valida formalmente la eficacia del módulo para la prevención de incidentes operacionales y cumplimiento de la Cláusula 7.2."
  )
)
