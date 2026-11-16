// Invocador de versión v3.0 para G4-CAP-INC-01 (Plan y Módulo Formativo de Incidentes)
// SGPI UNSA — Recertificación ISO/IEC 27701:2025 (Segunda edición, 28 de octubre de 2025)

#import "mold-cap.typ": mold-cap

#show: mold-cap.with(
  metadata: (
    title: "Plan y Módulo Formativo: Respuesta a Incidentes de Privacidad",
    code: "G4-CAP-INC-01",
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
        summary: "Emisión inicial del módulo formativo para el personal de Admisión y Planillas en sedes centrales Arequipa."
      ),
      (
        version: "2.0",
        date: "2022-09-10",
        author: "Ing. Carlos M. Benítez",
        summary: "Actualización post-pandemia incorporando seguridad web, teletrabajo y sesiones en Aula Virtual."
      ),
      (
        version: "3.0",
        date: "2025-10-28",
        author: "Ing. Carlos M. Benítez",
        summary: "MAYOR_CAP :: Recertificación bajo ISO/IEC 27701:2025 :: Extensión a Filiales Camaná y El Pedregal (Majes), entrenamiento en seguridad de dispositivos móviles (MDM/BitLocker), prevención de spear-phishing y enlace CSIRT multisede."
      ),
    ),
    validity: "2026-10-28",
    owner-role: "Oficial de Seguridad de la Información (OSI / DPO)"
  ),
  references: (
    "Norma Internacional ISO/IEC 27701:2025, Cláusula 7.2 (Competencia) y 7.3 (Toma de conciencia).",
    "Norma Internacional ISO/IEC 27701:2025, Control A.3.17 y Guías B.3.17 y B.3.11.",
    "Ley N° 29733 de Protección de Datos Personales del Perú y D.S. 003-2013-JUS.",
    "Política de Privacidad de la Información (G4-POL-01).",
    "Procedimiento de Respuesta a Incidentes de Privacidad (G4-PRC-INC-01).",
    "Resoluciones Rectorales N° 0142-2025 y N° 0143-2025 (Filiales Camaná y Majes)."
  ),
  intro-text: [
    Este plan se aplica al personal de Admisión y Planillas de la UNSA en las Sedes Centrales de Arequipa y en las Filiales Regionales de Camaná (RR N° 0142-2025) y El Pedregal - Majes (RR N° 0143-2025), garantizando competencias uniformes en toda la red universitaria.
  ],
  competence-rows: (
    (
      role: "Coordinador de Filial Regional",
      required-knowledge: "Gestión de terminales móviles, enlace directo CSIRT y activación de contención regional.",
      training-needed: "Módulo Híbrido Multisede de Incidentes G4-CAP-INC-01 (8h).",
      evidence-record: "G4-REG-CAP-01-v3",
      achieved: "APROBADO",
      skills-gained: "Bloqueo remoto MDM y reporte estructurado en menos de 60 minutos."
    ),
    (
      role: "Operador de Admisión Descentralizada",
      required-knowledge: "Cifrado BitLocker XTS-AES 256 en laptops y custodia de documentos de postulantes.",
      training-needed: "Módulo Híbrido Multisede de Incidentes G4-CAP-INC-01 (8h).",
      evidence-record: "G4-REG-CAP-01-v3",
      achieved: "APROBADO",
      skills-gained: "Verificación de TPM 2.0 y prevención de fugas por puertos USB."
    ),
    (
      role: "Operador de Planillas en Filiales",
      required-knowledge: "Identificación de ataques de spear-phishing y verificación de cambios de cuentas bancarias.",
      training-needed: "Módulo Híbrido Multisede de Incidentes G4-CAP-INC-01 (8h).",
      evidence-record: "G4-REG-CAP-01-v3",
      achieved: "APROBADO",
      skills-gained: "Validación de hash en Sisgedo y doble factor en trámites bancarios."
    ),
    (
      role: "Analista de Seguridad SOC / CSIRT-UNSA",
      required-knowledge: "Gestión forense de brechas bajo B.3.12 y coordinación con la ANPD.",
      training-needed: "Entrenamiento Avanzado en Gestión de Brechas PII (16h).",
      evidence-record: "G4-REG-CAP-01-v3",
      achieved: "APROBADO",
      skills-gained: "Notificaciones regulatorias y determinación de impacto en titulares."
    )
  ),
  calendar-data: (
    (method: "Día informativo de privacidad multisede", m1: "", m2: "", m3: "X", m4: "", m5: "", m6: "", m7: "", m8: "", m9: "", m10: "X", m11: "", m12: ""),
    (method: "Capacitación habitual descentralizada", m1: "", m2: "", m3: "", m4: "", m5: "X", m6: "", m7: "", m8: "", m9: "", m10: "", m11: "X", m12: ""),
    (method: "Simulacros de spear-phishing", m1: "", m2: "", m3: "", m4: "X", m5: "", m6: "", m7: "", m8: "X", m9: "", m10: "", m11: "X", m12: ""),
    (method: "Cápsulas formativas en Aula Virtual", m1: "X", m2: "X", m3: "X", m4: "X", m5: "X", m6: "X", m7: "X", m8: "X", m9: "X", m10: "X", m11: "X", m12: "X"),
    (method: "Talleres prácticos de respuesta a brechas", m1: "", m2: "", m3: "", m4: "", m5: "", m6: "X", m7: "", m8: "", m9: "", m10: "", m11: "X", m12: "")
  ),
  responsibilities: (
    coordinator: "Oficial de Seguridad de la Información / DPO (Ing. Carlos M. Benítez)",
    registrar: "Subdirectora de Personal / Recursos Humanos (Lic. Martha Elena Córdova)",
    evaluator: "Oficial de Seguridad de la Información / DPO (Ing. Carlos M. Benítez)",
    custodian: "Oficial de Seguridad de la Información / DPO (Ing. Carlos M. Benítez)",
    archive-location: "repositorio PIMS institucional GESTITEL (https://unsa.27k.pe)",
    retention: "3 años"
  ),
  module-sessions: (
    (
      session-num: "Sesión 1",
      topic: "Norma ISO/IEC 27701:2025 y Brechas PII",
      content: "Estructura de la norma independiente, rol de Responsable del Tratamiento y taxonomía de brechas bajo Guía B.3.12 aplicada al entorno universitario multisede.",
      hours: "2 horas"
    ),
    (
      session-num: "Sesión 2",
      topic: "Seguridad de Terminales y Filiales Regionales",
      content: "Protocolos de protección para laptops en Camaná y Majes: BitLocker XTS-AES 256, bloqueo remoto MDM, uso de túneles VPN IPSec y reporte inmediato ante extravío.",
      hours: "2 horas"
    ),
    (
      session-num: "Sesión 3",
      topic: "Defensa contra Ingeniería Social y Phishing",
      content: "Reconocimiento de ataques de spear-phishing dirigidos a personal de nóminas y admisión, verificación de remitentes y reporte al CSIRT-UNSA.",
      hours: "2 horas"
    ),
    (
      session-num: "Sesión 4",
      topic: "Taller de Simulación y Evaluación Integral",
      content: "Ejercicio práctico multisede de reporte de incidente en filial, diligenciamiento del registro G4-REG-INC-01 y evaluación post-test individual.",
      hours: "2 horas"
    )
  )
)
