#import "../../molds/incident-register/mold.typ": mold

#let data = (
  code: "G4-REG-INC-01",
  version: "2.0",
  date: "2022-09-10",
  title: "Registro Oficial de Incidentes de Privacidad (SGPI)",
  confidentiality: "Confidencial",
  era: "v2",
  era-name: "Periodos 2019 – 2022 (Virtualización Post-Pandemia)",
  organization-name: "la Universidad Nacional de San Agustín de Arequipa (UNSA)",
  scope-summary: "los procesos virtuales de Admisión vía admision.unsa.edu.pe y soporte de Planillas con teletrabajo y VPN",
  owner-role: "Oficial de Seguridad de la Información (OSI / DPO)",
  validity: "2023-09-10",
  references: (
    "ISO/IEC 27701:2025 — Cláusulas 8.1, 7.5.1, Controles A.3.11, A.3.12 y Guía B.3.12",
    "Ley N° 29733 — Ley de Protección de Datos Personales del Perú y su Reglamento",
    "G4-PRC-INC-01 — Procedimiento Institucional de Respuesta a Incidentes de Privacidad",
    "G4-REG-CAPA-01 — Registro de No Conformidades y Acciones Correctivas",
  ),
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
      summary: "Emisión inicial del formato de registro para la certificación inicial ISO/IEC 27701:2019. Alcance: Sedes Arequipa (Admisión y Planilla presencial)."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización mayor post-pandemia: Incorporación de campos para incidentes en plataformas web (admision.unsa.edu.pe), accesos lógicos y teletrabajo de personal."
    ),
  ),
  summary-metrics: (
    total: "4",
    contained-rate: "100%",
    notified-principals: "1",
    notified-regulator: "1",
    no-risk-residual: "2",
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
      notification-detail: "(Sin fuga ni afectación externa)."
    ),
    (
      id: "G4-INC-2019-002",
      detection: "2019-09-22 14:15",
      severity: "ALTO",
      category: "Confidencialidad / Correo masivo",
      affected: "42 docentes Facultad de Sociales",
      containment: "Recall en Exchange y confirmación escrita de borrado.",
      notification-status: "NOTIFICADO_TITULARES",
      notification-detail: "(Comunicación individual preventiva)."
    ),
    (
      id: "G4-INC-2022-001",
      detection: "2022-03-18 11:00",
      severity: "CRÍTICO",
      category: "Acceso no autorizado / IDOR Web",
      affected: "1,240 postulantes inscritos online",
      containment: "Hotfix en backend en 45 min; rotación masiva de tokens JWT y bloqueo IP en WAF.",
      notification-status: "NOTIFICADO_AUTORIDAD_ANPDP",
      notification-detail: "(Reporte formal motivado ante la ANPD y aviso preventivo)."
    ),
    (
      id: "G4-INC-2022-002",
      detection: "2022-07-05 16:40",
      severity: "BAJO",
      category: "Disponibilidad / Fallo backup BD",
      affected: "0 titulares (Sin impacto directo)",
      containment: "Ejecución manual de réplica; verificación de hash SHA-256.",
      notification-status: "EVALUADO_NO_REQUIERE",
      notification-detail: "(Evento operacional interno sin afectación a PII)."
    ),
  ),
  capa-links: (
    (code: "G4-CAPA-2022-01", desc: "Auditoría de seguridad y análisis SAST en API backend del portal web de admisión."),
    (code: "G4-CAPA-2022-02", desc: "Monitoreo automatizado con agente Zabbix de réplicas y almacenamiento NAS en DUTIC."),
  )
)

#mold(data)
