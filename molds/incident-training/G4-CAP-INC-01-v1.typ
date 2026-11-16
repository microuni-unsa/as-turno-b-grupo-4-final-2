// Invocador de versión v1.0 para G4-CAP-INC-01 (Plan y Módulo Formativo de Incidentes)
// SGPI UNSA — Certificación inicial ISO/IEC 27701:2019 (15 de abril de 2019)

#import "mold-cap.typ": mold-cap

#show: mold-cap.with(
  metadata: (
    title: "Plan de capacitación y concienciación",
    code: "G4-CAP-INC-01",
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
        summary: "Emisión inicial del módulo formativo para el personal de Admisión y Planillas en sedes centrales Arequipa (certificación ISO/IEC 27701:2019)."
      ),
    ),
    validity: "2020-04-15",
    owner-role: "Oficial de Seguridad de la Información (OSI / DPO)"
  ),
  references: (
    "Norma Internacional ISO/IEC 27701:2025, Cláusula 7.2 (Competencia) y 7.3 (Toma de conciencia).",
    "Norma Internacional ISO/IEC 27701:2025, Control A.3.17 y Guía B.3.17 (Capacitación y toma de conciencia en privacidad).",
    "Ley N° 29733 de Protección de Datos Personales del Perú.",
    "Política de Privacidad de la Información (G4-POL-01).",
    "Procedimiento de Respuesta a Incidentes de Privacidad (G4-PRC-INC-01)."
  ),
  intro-text: [
    Este plan se aplica al personal operativo de los procesos presenciales de Admisión Ordinaria y Planilla de Remuneraciones en las Sedes Centrales de la UNSA en Arequipa (Campus Ingenierías, Biomédicas y Sociales).
  ],
  competence-rows: (
    (
      role: "Vocal de Pabellón de Admisión",
      required-knowledge: "Identificación de PII física en padrones de examen y custodia de listas impresas.",
      training-needed: "Módulo Presencial de Incidentes G4-CAP-INC-01 (8h).",
      evidence-record: "G4-REG-CAP-01-v1",
      achieved: "APROBADO",
      skills-gained: "Contención inmediata y entrega de material sobrante a trituración."
    ),
    (
      role: "Operador de Planillas de Personal",
      required-knowledge: "Manejo seguro de archivos de haberes y prevención de envíos erróneos de correo.",
      training-needed: "Módulo Presencial de Incidentes G4-CAP-INC-01 (8h).",
      evidence-record: "G4-REG-CAP-01-v1",
      achieved: "APROBADO",
      skills-gained: "Uso de tokens seguros y verificación de destinatarios DLP."
    ),
    (
      role: "Administrador de BD DUTIC",
      required-knowledge: "Detección de anomalías en tablas de PII y reporte forense bajo Guía B.3.12.",
      training-needed: "Taller Técnico Especializado CSIRT (8h).",
      evidence-record: "G4-REG-CAP-01-v1",
      achieved: "APROBADO",
      skills-gained: "Aislamiento de bases de datos y preservación de bitácoras."
    )
  ),
  calendar-data: (
    (method: "Día informativo de privacidad", m1: "", m2: "", m3: "", m4: "X", m5: "", m6: "", m7: "", m8: "", m9: "", m10: "", m11: "", m12: ""),
    (method: "Capacitación inicial obligatoria", m1: "", m2: "", m3: "", m4: "X", m5: "", m6: "", m7: "", m8: "", m9: "", m10: "", m11: "", m12: ""),
    (method: "Artículos en boletín institucional", m1: "", m2: "", m3: "X", m4: "", m5: "", m6: "X", m7: "", m8: "", m9: "X", m10: "", m11: "", m12: "X"),
    (method: "Reuniones de coordinación de área", m1: "", m2: "X", m3: "", m4: "", m5: "X", m6: "", m7: "", m8: "X", m9: "", m10: "", m11: "X", m12: ""),
    (method: "Talleres prácticos de simulación", m1: "", m2: "", m3: "", m4: "X", m5: "", m6: "", m7: "", m8: "", m9: "", m10: "X", m11: "", m12: "")
  ),
  responsibilities: (
    coordinator: "Oficial de Seguridad de la Información (Ing. Carlos M. Benítez)",
    registrar: "Subdirectora de Personal / Recursos Humanos (Lic. Martha Elena Córdova)",
    evaluator: "Oficial de Seguridad de la Información (Ing. Carlos M. Benítez)",
    custodian: "Oficial de Seguridad de la Información (Ing. Carlos M. Benítez)",
    archive-location: "repositorio institucional del SGPI y bóveda DUTIC",
    retention: "3 años"
  ),
  module-sessions: (
    (
      session-num: "Sesión 1",
      topic: "Identificación de Eventos y Brechas PII",
      content: "Diferenciación entre evento operativo e incidente con compromiso de datos personales según Guía B.3.12. Reconocimiento de PII en padrones impresos de admisión.",
      hours: "2 horas"
    ),
    (
      session-num: "Sesión 2",
      topic: "Protocolos de Contención Inmediata",
      content: "Medidas de aislamiento físico, trituración inmediata de borradores y revocación de accesos en red local. Reporte de los primeros 60 minutos al DPO.",
      hours: "2 horas"
    ),
    (
      session-num: "Sesión 3",
      topic: "Diligenciamiento de Registros Oficiales",
      content: "Llenado práctico de la bitácora de incidentes G4-REG-INC-01 y formulación de causa raíz para acciones correctivas G4-REG-CAPA-01.",
      hours: "2 horas"
    ),
    (
      session-num: "Sesión 4",
      topic: "Simulacro y Evaluación de Competencias",
      content: "Ejercicio práctico presencial de extravío simulado de listado de postulantes y aplicación de la evaluación escrita individual post-test.",
      hours: "2 horas"
    )
  )
)
