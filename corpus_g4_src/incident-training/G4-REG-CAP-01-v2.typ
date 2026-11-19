// Invocador de versión v2.0 para G4-REG-CAP-01 (Registro de Asistencia y Evaluación)
// SGPI UNSA — Actualización post-pandemia ISO/IEC 27701:2019 (10 de septiembre de 2022)

#import "../../molds/incident-training/mold-reg-cap.typ": mold-reg-cap

#show: mold-reg-cap.with(
  metadata: (
    title: "Registro de Asistencia y Evaluación",
    code: "G4-REG-CAP-01",
    version: "2.0",
    date: "2022-09-10",
    confidentiality: "Confidencial",
    author: (
      name: "Ing. Carlos M. Benítez",
      role: "Oficial de Seguridad de la Información (OSI / DPO)",
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
    ),
    validity: "2023-09-10",
    owner-role: "Oficial de Seguridad de la Información (OSI / DPO)"
  ),
  references: (
    "Norma Internacional ISO/IEC 27701:2025, Cláusula 7.2 (Competencia).",
    "Norma Internacional ISO/IEC 27701:2025, Control A.3.17 y Guía B.3.17.",
    "Plan y Módulo Formativo de Incidentes (G4-CAP-INC-01-v2).",
    "Procedimiento de Respuesta a Incidentes de Privacidad (G4-PRC-INC-01)."
  ),
  course-info: (
    module-ref: "G4-CAP-INC-01-v2 (Respuesta a Incidentes de Privacidad — Entorno Virtual)",
    instructor: "Ing. Carlos M. Benítez (Oficial de Seguridad de la Información / DPO)",
    dates: "12 al 16 de septiembre de 2022",
    location: "Virtual — Aula Virtual Moodle UNSA y sesiones sincrónicas Google Meet",
    hours: "8 horas cronológicas (4 sincrónicas + 4 asincrónicas)"
  ),
  table-columns: (50pt, 120pt, 90pt, 50pt, 45pt, 45pt, 55pt),
  table-headers: ([*DNI*], [*Apellidos y Nombres*], [*Dependencia / Cargo*], [*Asistencia*], [*Pre-Test*], [*Post-Test*], [*Condición*]),
  attendees: (
    (dni: "29481920", name: "Cornejo Zegarra, Manuel", role-unit: "Admisión - Soporte Web", attendance: "100% (4/4)", pre-test: "08 / 20", post-test: "18 / 20", status: "APROBADO"),
    (dni: "41209384", name: "Huamán Quispe, Rosa", role-unit: "Planillas - Teletrabajo", attendance: "100% (4/4)", pre-test: "07 / 20", post-test: "19 / 20", status: "APROBADO"),
    (dni: "29740112", name: "Pinto Medina, Marco", role-unit: "DUTIC - Admin. Servidores", attendance: "100% (4/4)", pre-test: "10 / 20", post-test: "20 / 20", status: "APROBADO"),
    (dni: "40819273", name: "Vilca Carpio, Jorge", role-unit: "Admisión - Validador Digital", attendance: "100% (4/4)", pre-test: "06 / 20", post-test: "17 / 20", status: "APROBADO"),
    (dni: "29601928", name: "Gutiérrez Ramos, Elena", role-unit: "Planillas - Auditora Nómina", attendance: "100% (4/4)", pre-test: "07 / 20", post-test: "18 / 20", status: "APROBADO"),
    (dni: "43910284", name: "Mendoza Salas, Carlos", role-unit: "DUTIC - Analista SOC", attendance: "100% (4/4)", pre-test: "09 / 20", post-test: "19 / 20", status: "APROBADO")
  ),
  statistics: (
    total-evaluated: "6 participantes acreditados",
    pre-average: "07.8 / 20",
    post-average: "18.5 / 20 (Nivel sobresaliente)",
    delta: "+10.7 puntos de incremento formativo",
    pass-rate: "100% (todos superaron la nota mínima de 14.0/20)",
    conclusion: "Cumplimiento total de la competencia técnica exigida por la Cláusula 7.2 en gestión de incidentes digitales, seguridad web y teletrabajo."
  )
)
