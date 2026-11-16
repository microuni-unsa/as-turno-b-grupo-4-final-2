#import "mold.typ": mold

#let data = (
  code: "G4-REG-INC-01",
  version: "1.0",
  date: "2019-04-15",
  title: "Registro Oficial de Incidentes de Privacidad (SGPI)",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
  era: "v1",
  era-name: "Periodo 2019 (Sedes Centrales Arequipa)",
  organization-name: "la Universidad Nacional de San Agustín de Arequipa (UNSA)",
  scope-summary: "los procesos presenciales de Admisión Ordinaria y Planilla de Remuneraciones en las Sedes Centrales de Arequipa (Ingenierías, Biomédicas y Sociales)",
  owner-role: "Oficial de Seguridad de la Información (OSI / DPO)",
  validity: "2020-04-15",
  references: (
    "ISO/IEC 27701:2025 — Cláusulas 8.1, 7.5.1, Controles A.3.11, A.3.12 y Guía B.3.12",
    "Ley N° 29733 — Ley de Protección de Datos Personales del Perú y su Reglamento",
    "G4-PRC-INC-01 — Procedimiento Institucional de Respuesta a Incidentes de Privacidad",
    "G4-REG-CAPA-01 — Registro de No Conformidades y Acciones Correctivas",
  ),
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
      summary: "Emisión inicial del formato de registro para la certificación inicial ISO/IEC 27701:2019. Alcance: Sedes Arequipa (Admisión y Planilla presencial)."
    ),
  ),
  summary-metrics: (
    total: "2",
    contained-rate: "100%",
    notified-principals: "1",
    notified-regulator: "0",
    no-risk-residual: "1",
  ),
  incident-rows: (
    (
      id: "G4-INC-2019-001",
      detection: "2019-05-14 08:30",
      severity: "MEDIO",
      category: "Confidencialidad / Papel impreso",
      affected: "18 postulantes ordinarios (Ingenierías)",
      containment: "Retiro inmediato de listado físico con DNI en puerta; trituración certificada en microcorte.",
      notification-status: "EVALUADO_NO_REQUIERE",
      notification-detail: "(Riesgo contenido de forma inmediata sin divulgación externa)."
    ),
    (
      id: "G4-INC-2019-002",
      detection: "2019-09-22 14:15",
      severity: "ALTO",
      category: "Confidencialidad / Correo masivo",
      affected: "42 docentes Facultad de Sociales",
      containment: "Recall en servidor Exchange; confirmación escrita de borrado por destinatarios no autorizados.",
      notification-status: "NOTIFICADO_TITULARES",
      notification-detail: "(Comunicación individual y transparente a los 42 docentes afectados)."
    ),
  ),
  capa-links: (
    (code: "G4-CAPA-2019-01", desc: "Instalación de trituradoras P-4 en accesos de admisión y política de mesa limpia."),
    (code: "G4-CAPA-2019-02", desc: "Despliegue de módulo DLP en servidor Exchange y cifrado automatizado de boletas."),
  )
)

#mold(data)
