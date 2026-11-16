#import "../../molds/incident-register/mold.typ": mold

#let data = (
  code: "G4-REG-INC-01",
  version: "3.0",
  date: "2025-10-28",
  title: "Registro Oficial de Incidentes de Privacidad (SGPI)",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
  era: "v3",
  era-name: "Periodos 2019 – 2025 (Recertificación Multisede ISO/IEC 27701:2025)",
  organization-name: "la Universidad Nacional de San Agustín de Arequipa (UNSA)",
  scope-summary: "los procesos de Admisión y Planillas descentralizadas en los Campus Centrales de Arequipa, Filial Camaná (RR 0142-2025) y Filial El Pedregal - Majes (RR 0143-2025)",
  owner-role: "Oficial de Seguridad de la Información (OSI / DPO)",
  validity: "2026-10-28",
  references: (
    "ISO/IEC 27701:2025 — Cláusulas 8.1, 7.5.1, Controles A.3.11, A.3.12 y Guía B.3.12",
    "Ley N° 29733 — Ley de Protección de Datos Personales del Perú y su Reglamento",
    "Ley N° 30220 — Ley Universitaria del Perú",
    "G4-PRC-INC-01 — Procedimiento Institucional de Respuesta a Incidentes de Privacidad",
    "G4-REG-CAPA-01 — Registro de No Conformidades y Acciones Correctivas",
  ),
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
  ),
  summary-metrics: (
    total: "7",
    contained-rate: "100%",
    notified-principals: "2",
    notified-regulator: "1",
    no-risk-residual: "4",
  ),
  incident-rows: (
    (
      id: "G4-INC-2019-001",
      detection: "2019-05-14 08:30",
      severity: "MEDIO",
      category: "Confidencialidad / Papel impreso",
      affected: "18 postulantes ordinarios",
      containment: "Destrucción certificada en microcorte de listado físico.",
      notification-status: "EVALUADO_NO_REQUIERE",
      notification-detail: "(Sin fuga externa)."
    ),
    (
      id: "G4-INC-2019-002",
      detection: "2019-09-22 14:15",
      severity: "ALTO",
      category: "Confidencialidad / Correo masivo",
      affected: "42 docentes Facultad de Sociales",
      containment: "Recall en Exchange y borrado confirmado por destinatarios.",
      notification-status: "NOTIFICADO_TITULARES",
      notification-detail: "(Comunicación individual preventiva)."
    ),
    (
      id: "G4-INC-2022-001",
      detection: "2022-03-18 11:00",
      severity: "CRÍTICO",
      category: "Acceso no autorizado / IDOR Web",
      affected: "1,240 postulantes inscritos online",
      containment: "Hotfix en backend; rotación JWT masiva y bloqueo de IP.",
      notification-status: "NOTIFICADO_AUTORIDAD_ANPDP",
      notification-detail: "(Reporte formal a ANPD y aviso preventivo)."
    ),
    (
      id: "G4-INC-2022-002",
      detection: "2022-07-05 16:40",
      severity: "BAJO",
      category: "Disponibilidad / Fallo backup BD",
      affected: "0 (Sin impacto directo)",
      containment: "Ejecución manual de réplica; hash SHA-256 verificado.",
      notification-status: "EVALUADO_NO_REQUIERE",
      notification-detail: "(Evento operacional interno)."
    ),
    (
      id: "G4-INC-2025-001",
      detection: "2025-04-12 09:20",
      severity: "ALTO",
      category: "Confidencialidad / Sustracción laptop",
      affected: "115 postulantes Filial Camaná",
      containment: "Bloqueo y borrado remoto vía MDM Intune; disco cifrado BitLocker XTS-AES 256 verificado por TPM.",
      notification-status: "EVALUADO_NO_REQUIERE",
      notification-detail: "(Cifrado impidió exfiltración de PII; sin riesgo residual para los titulares)."
    ),
    (
      id: "G4-INC-2025-002",
      detection: "2025-08-20 15:10",
      severity: "MEDIO",
      category: "Integridad / Error sincronización",
      affected: "48 trabajadores Filial El Pedregal",
      containment: "Pausa preventiva de dispersión bancaria; conciliación telemática contra padrón Sisgedo.",
      notification-status: "NOTIFICADO_TITULARES",
      notification-detail: "(Aviso transparente y rectificación sin perjuicio patrimonial)."
    ),
    (
      id: "G4-INC-2025-003",
      detection: "2025-11-03 10:05",
      severity: "BAJO",
      category: "Confidencialidad / Intento Phishing",
      affected: "0 (Ataque frustrado)",
      containment: "Bloqueo perimetral de dominios maliciosos en firewall y concientización a operadores.",
      notification-status: "EVALUADO_NO_REQUIERE",
      notification-detail: "(Intento bloqueado por defensas perimetrales)."
    ),
  ),
  capa-links: (
    (code: "G4-CAPA-2025-01", desc: "Auditoría de cumplimiento de enrolamiento MDM y cifrado BitLocker en todas las filiales."),
    (code: "G4-CAPA-2025-02", desc: "Implementación de validación de doble firma digital en lotes de dispersión bancaria."),
  )
)

#mold(data)
