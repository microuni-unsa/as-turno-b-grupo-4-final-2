// Invocador de versión v2.0 para G4-CAP-INC-01 (Plan y Módulo Formativo de Incidentes)
// SGPI UNSA — Actualización post-pandemia ISO/IEC 27701:2019 (10 de septiembre de 2022)

#import "mold-cap.typ": mold-cap

#show: mold-cap.with(
  metadata: (
    title: "Plan y Módulo Formativo: Respuesta a Incidentes de Privacidad",
    code: "G4-CAP-INC-01",
    version: "2.0",
    date: "2022-09-10",
    confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
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
        summary: "Emisión inicial del módulo formativo para el personal de Admisión y Planillas en sedes centrales Arequipa."
      ),
      (
        version: "2.0",
        date: "2022-09-10",
        author: "Ing. Carlos M. Benítez",
        summary: "Actualización post-pandemia: Migración a entorno virtual vía Aula Virtual UNSA, incorporación de módulos de seguridad web, gestión de accesos remotos y teletrabajo seguro."
      ),
    ),
    validity: "2023-09-10",
    owner-role: "Oficial de Seguridad de la Información (OSI / DPO)"
  ),
  references: (
    "Norma Internacional ISO/IEC 27701:2025, Cláusula 7.2 (Competencia) y 7.3 (Toma de conciencia).",
    "Norma Internacional ISO/IEC 27701:2025, Control A.3.17 y Guías B.3.17 y B.3.11.",
    "Ley N° 29733 de Protección de Datos Personales del Perú.",
    "Política de Privacidad de la Información (G4-POL-01).",
    "Procedimiento de Respuesta a Incidentes de Privacidad (G4-PRC-INC-01)."
  ),
  intro-text: [
    Este plan se aplica al personal técnico y administrativo que opera la admisión digital (portal `admision.unsa.edu.pe`) y el régimen de teletrabajo de nóminas en las Sedes Centrales de Arequipa.
  ],
  competence-rows: (
    (
      role: "Operador de Admisión Digital",
      required-knowledge: "Vectores web (IDOR, robo de sesión), protección de fichas digitales y autenticación MFA.",
      training-needed: "Módulo Virtual de Incidentes Web G4-CAP-INC-01 (8h).",
      evidence-record: "G4-REG-CAP-01-v2",
      achieved: "APROBADO",
      skills-gained: "Detección de accesos concurrentes anómalos y escalamiento al CSIRT."
    ),
    (
      role: "Analista de Planillas en Teletrabajo",
      required-knowledge: "Uso de túneles VPN SSL corporativos, política de escritorio limpio y cifrado de nóminas.",
      training-needed: "Módulo Virtual de Incidentes Web G4-CAP-INC-01 (8h).",
      evidence-record: "G4-REG-CAP-01-v2",
      achieved: "APROBADO",
      skills-gained: "Operación segura remota sin retención de datos en equipos personales."
    ),
    (
      role: "Administrador de Red y Servidores DUTIC",
      required-knowledge: "Monitoreo perimetral, respuesta a ataques DDoS y preservación forense de logs.",
      training-needed: "Entrenamiento Avanzado Forense Digital (8h).",
      evidence-record: "G4-REG-CAP-01-v2",
      achieved: "APROBADO",
      skills-gained: "Aislamiento de contenedores y trazabilidad de eventos bajo Guía B.3.12."
    )
  ),
  calendar-data: (
    (method: "E-learning en Aula Virtual Moodle", m1: "X", m2: "", m3: "X", m4: "", m5: "X", m6: "", m7: "X", m8: "", m9: "X", m10: "", m11: "X", m12: ""),
    (method: "Capacitación habitual teletrabajo", m1: "", m2: "", m3: "", m4: "", m5: "", m6: "", m7: "", m8: "", m9: "X", m10: "", m11: "", m12: ""),
    (method: "Mensajes de alerta por correo", m1: "X", m2: "X", m3: "X", m4: "X", m5: "X", m6: "X", m7: "X", m8: "X", m9: "X", m10: "X", m11: "X", m12: "X"),
    (method: "Cápsulas en vídeo institucional", m1: "", m2: "X", m3: "", m4: "", m5: "X", m6: "", m7: "", m8: "X", m9: "", m10: "", m11: "X", m12: ""),
    (method: "Simulacros de brecha web en línea", m1: "", m2: "", m3: "", m4: "", m5: "", m6: "X", m7: "", m8: "", m9: "X", m10: "", m11: "", m12: "")
  ),
  responsibilities: (
    coordinator: "Oficial de Seguridad de la Información (Ing. Carlos M. Benítez)",
    registrar: "Subdirectora de Personal / Recursos Humanos (Lic. Martha Elena Córdova)",
    evaluator: "Oficial de Seguridad de la Información (Ing. Carlos M. Benítez)",
    custodian: "Oficial de Seguridad de la Información (Ing. Carlos M. Benítez)",
    archive-location: "repositorio PIMS institucional y Aula Virtual DUTIC",
    retention: "3 años"
  ),
  module-sessions: (
    (
      session-num: "Sesión 1",
      topic: "Amenazas Web y Brechas en Admisión Digital",
      content: "Vectores de ataque web comunes: vulnerabilidades IDOR, spear-phishing a postulantes, secuestro de tokens JWT y tipificación de brechas bajo Guía B.3.12.",
      hours: "2 horas"
    ),
    (
      session-num: "Sesión 2",
      topic: "Seguridad en Teletrabajo y Red Privada VPN",
      content: "Configuración y verificación del cliente VPN SSL corporativo, autenticación multifactor (MFA) y política de escritorio y pantalla limpios en trabajo remoto.",
      hours: "2 horas"
    ),
    (
      session-num: "Sesión 3",
      topic: "Reporte y Trazabilidad de Evidencia Digital",
      content: "Captura de bitácoras de servidor web, llenado estructurado de la bitácora G4-REG-INC-01 y preservación forense de capturas de pantalla.",
      hours: "2 horas"
    ),
    (
      session-num: "Sesión 4",
      topic: "Simulación Práctica en Aula Virtual",
      content: "Simulacro automatizado en línea de intento de acceso no autorizado y aplicación de evaluación virtual con banco de preguntas aleatorizado.",
      hours: "2 horas"
    )
  )
)
