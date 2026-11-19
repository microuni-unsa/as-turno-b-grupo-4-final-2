// Invocador de versión v2.0 para G4-REG-CAPA-01 (Registro de No Conformidades y Acciones Correctivas)
// SGPI UNSA — Actualización post-pandemia ISO/IEC 27701:2019 (10 de septiembre de 2022)

#import "../../molds/nc-corrective-actions/mold-reg-capa.typ": mold-reg-capa

#show: mold-reg-capa.with(
  metadata: (
    title: "Apéndice: Formulario para medidas correctivas",
    short-title: "Formulario de Medidas Correctivas",
    code: "G4-REG-CAPA-01",
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
        summary: "Emisión inicial aprobada para la certificación inicial ISO/IEC 27701:2019 en sedes centrales Arequipa."
      ),
      (
        version: "2.0",
        date: "2022-09-10",
        author: "Ing. Carlos M. Benítez",
        summary: "Actualización post-pandemia: Incorporación de hallazgos derivados de auditorías de aplicaciones web, teletrabajo y pruebas de penetración en portal de admisión."
      ),
    ),
    validity: "2023-09-10",
    owner-role: "Oficial de Seguridad de la Información (OSI / DPO)"
  ),
  references: (
    "Norma Internacional ISO/IEC 27701:2025, Cláusula 10.2 (No conformidad y acción correctiva).",
    "Procedimiento de No Conformidades y Acciones Correctivas (G4-PRC-CAPA-01).",
    "Procedimiento de Respuesta a Incidentes de Privacidad (G4-PRC-INC-01).",
    "Informe de Auditoría Interna de Sistemas Web (G4-REP-AUD-01-v2)."
  ),
  period-label: "Periodos 2019 – 2022 (Transición Virtual y Post-Pandemia)",
  capa-chain-rows: (
    (
      finding-id: "AUD-2019-H01",
      nc-id: "NC-2019-01",
      cause: "Falta de trituración física en admisión presencial.",
      action: "Trituradoras de microcorte e instructivo de destrucción.",
      owner: "Dr. Walter Delgado (Dir. Admisión)",
      deadline: "2019-06-30",
      rag-status: "VERDE",
      evidence-link: "pims:G4-PRC-INC-01:v1:chunk:18-24"
    ),
    (
      finding-id: "INC-2019-H02",
      nc-id: "NC-2019-02",
      cause: "Envío manual de planillas sin cifrado.",
      action: "Reglas DLP en Exchange y tokens de cifrado.",
      owner: "Lic. Martha Córdova (Subdir. Personal)",
      deadline: "2019-10-31",
      rag-status: "VERDE",
      evidence-link: "pims:G4-REG-INC-01:v1:chunk:30-42"
    ),
    (
      finding-id: "AUD-2022-H01",
      nc-id: "NC-2022-01",
      cause: "Falla de referencia directa a objetos insegura (IDOR) en API backend de admisión virtual (/ficha).",
      action: "Validación estricta de autorización de sesión JWT en endpoints y revisión SAST en pipeline CI/CD.",
      owner: "Mg. Lucía Valdivia (Directora DUTIC)",
      deadline: "2022-04-30",
      rag-status: "VERDE",
      evidence-link: "pims:G4-REG-INC-01:v2:chunk:45-60"
    ),
    (
      finding-id: "INC-2022-H02",
      nc-id: "NC-2022-02",
      cause: "Script de sincronización de bases de datos de respaldo sin alerta proactiva ante timeout operacional.",
      action: "Implementación de monitoreo Zabbix con notificación SMS/correo inmediata y reinicio automático de túnel.",
      owner: "Ing. Marco Pinto (Admin. BD DUTIC)",
      deadline: "2022-09-30",
      rag-status: "AMARILLO",
      evidence-link: "pims:G4-REG-INC-01:v2:chunk:62-75"
    ),
  ),
  form-records: (
    (
      capa-id: "CAPA-2022-01",
      finding-id: "AUD-2022-H01",
      nc-id: "NC-2022-01",
      description: "Vulnerabilidad IDOR en endpoint /api/postulante/ficha que permitía consultar fichas cambiando el ID correlativo.",
      source: "Informe de Penetration Testing Web DUTIC (Cláusula 9.2)",
      identified-by: "Ing. Carlos M. Benítez (OSI / DPO)",
      root-cause: "Omisión de validación de identidad del titular autenticado contra el identificador de recurso en la capa de servicios.",
      similar-nc: "No registra antecedente en plataformas web (nueva arquitectura digital 2022).",
      need-action: "SÍ",
      action-plan: "Refactorizar controlador de acceso verificando que claims del JWT coincidan con el DNI solicitado, e incorporar escaneo SAST obligatorio en GitHub Actions.",
      informed-parties: "Equipo de Desarrollo DUTIC, Comisión de Admisión y Rectorado.",
      approved-by: "Dr. Hugo José Sánchez (Rector)",
      responsible: "Mg. Lucía Valdivia Paredes (Directora DUTIC)",
      deadline: "2022-04-30",
      implemented-date: "2022-04-22",
      effectiveness-date: "2022-08-15",
      rag-status: "VERDE",
      effectiveness-notes: "Prueba de re-test externa certifica bloqueo de intentos IDOR con código HTTP 403 Forbidden. Estado: CERRADA.",
      system-changes: "Inclusión de política de desarrollo seguro y validación de endpoints en G4-SOA-01."
    ),
    (
      capa-id: "CAPA-2022-02",
      finding-id: "INC-2022-H02",
      nc-id: "NC-2022-02",
      description: "Interrupción no notificada en réplica secundaria de nóminas por timeout en enlace de red durante teletrabajo.",
      source: "Reporte de Incidente Operacional (G4-REG-INC-01-v2)",
      identified-by: "Lic. Martha Elena Córdova (Subdirectora de Personal)",
      root-cause: "Falta de agente de telemetría y monitoreo activo en servidores de replicación fuera del horario laboral.",
      similar-nc: "No registra antecedente.",
      need-action: "SÍ",
      action-plan: "Configurar sondas Zabbix cada 5 minutos sobre el demonio de replicación con escalamiento automático vía webhook seguro.",
      informed-parties: "Área de Infraestructura DUTIC y Subdirección de Personal.",
      approved-by: "Dr. Hugo José Sánchez (Rector)",
      responsible: "Ing. Marco Pinto Medina (Administrador de Bases de Datos DUTIC)",
      deadline: "2022-09-30",
      implemented-date: "2022-08-31",
      effectiveness-date: "2022-11-30",
      rag-status: "AMARILLO",
      effectiveness-notes: "Medida técnica desplegada el 31-ago-2022; actualmente en periodo de observación de 90 días para auditar fiabilidad de alertas. Estado: EN_SEGUIMIENTO.",
      system-changes: "Actualización de la ficha técnica de monitoreo en G4-PRC-DOC-01."
    )
  ),
  effectiveness-summary: (
    total: "4",
    closed: "3 (75% - CERRADAS)",
    in-progress: "1 (25% - EN_SEGUIMIENTO)",
    open: "0 (0%)",
    effectiveness-rate: "75% cerrado / 100% en control",
    conclusion: "El SGPI mantiene control riguroso de no conformidades con 3 acciones cerradas eficaces y 1 acción técnica en seguimiento dentro de cronograma."
  )
)
