// Invocador de versión v3.0 para G4-REG-CAPA-01 (Registro de No Conformidades y Acciones Correctivas)
// SGPI UNSA — Recertificación ISO/IEC 27701:2025 (Segunda edición, 28 de octubre de 2025)

#import "mold-reg-capa.typ": mold-reg-capa

#show: mold-reg-capa.with(
  metadata: (
    title: "Registro de No Conformidades y Acciones Correctivas (CAPA)",
    code: "G4-REG-CAPA-01",
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
        summary: "Emisión inicial aprobada para la certificación inicial ISO/IEC 27701:2019 en sedes centrales Arequipa."
      ),
      (
        version: "2.0",
        date: "2022-09-10",
        author: "Ing. Carlos M. Benítez",
        summary: "Actualización post-pandemia incorporando incidentes en canales digitales y teletrabajo."
      ),
      (
        version: "3.0",
        date: "2025-10-28",
        author: "Ing. Carlos M. Benítez",
        summary: "MAYOR_CAPA :: Recertificación bajo ISO/IEC 27701:2025 :: Cadena CAPA multisede integrando Filial Camaná y Filial El Pedregal (Majes), gestión MDM de laptops y controles anti-phishing."
      ),
    ),
    validity: "2026-10-28",
    owner-role: "Oficial de Seguridad de la Información (OSI / DPO)"
  ),
  references: (
    "Norma Internacional ISO/IEC 27701:2025, Cláusula 10.2 (No conformidad y acción correctiva).",
    "Procedimiento de No Conformidades y Acciones Correctivas (G4-PRC-CAPA-01).",
    "Procedimiento de Respuesta a Incidentes de Privacidad (G4-PRC-INC-01).",
    "Informe de Auditoría Interna Multisede SGPI (G4-REP-AUD-01-v3)."
  ),
  period-label: "Periodos Consolidados 2019 – 2025 (Multisede Central y Filiales)",
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
      cause: "Falla IDOR en API backend de admisión virtual (/ficha).",
      action: "Validación estricta JWT en endpoints y SAST continuo en CI/CD.",
      owner: "Mg. Lucía Valdivia (Directora DUTIC)",
      deadline: "2022-04-30",
      rag-status: "VERDE",
      evidence-link: "pims:G4-REG-INC-01:v2:chunk:45-60"
    ),
    (
      finding-id: "INC-2022-H02",
      nc-id: "NC-2022-02",
      cause: "Timeout en réplica de base de datos sin alarma proactiva.",
      action: "Monitor Zabbix con alertas SMS al administrador y reinicio automático.",
      owner: "Ing. Marco Pinto (Admin. BD DUTIC)",
      deadline: "2022-09-30",
      rag-status: "VERDE",
      evidence-link: "pims:G4-REG-INC-01:v2:chunk:62-75"
    ),
    (
      finding-id: "INC-2025-H01",
      nc-id: "NC-2025-01",
      cause: "Inexistencia de verificación forzosa de BitLocker en laptops de filiales previo a su traslado.",
      action: "Política MDM centralizada que bloquea puertos USB y exige TPM 2.0 y cifrado BitLocker XTS-AES 256.",
      owner: "Dr. Marcos Cárdenas (Coord. Filial Camaná)",
      deadline: "2025-05-30",
      rag-status: "VERDE",
      evidence-link: "pims:G4-REG-INC-01:v3:chunk:78-95"
    ),
    (
      finding-id: "INC-2025-H02",
      nc-id: "NC-2025-02",
      cause: "Transmisión directa de cambios de cuentas bancarias sin reconciliación hash contra Sisgedo.",
      action: "Implementación de protocolo de doble firma digital y validación hash antes del lote bancario mensual.",
      owner: "Lic. Martha Córdova (Subdir. Personal)",
      deadline: "2025-09-30",
      rag-status: "VERDE",
      evidence-link: "pims:G4-REG-INC-01:v3:chunk:98-112"
    ),
    (
      finding-id: "AUD-2025-H03",
      nc-id: "NC-2025-03",
      cause: "Vulnerabilidad humana ante campañas sofisticadas de spear-phishing en operadores de nóminas de filiales.",
      action: "Módulo intensivo de simulación de phishing y examen práctico obligatorio en la Academia UNSA (G4-CAP-INC-01).",
      owner: "Ing. Carlos M. Benítez (OSI / DPO)",
      deadline: "2025-12-15",
      rag-status: "AMARILLO",
      evidence-link: "pims:G4-CAP-INC-01:v3:chunk:50-70"
    ),
  ),
  form-records: (
    (
      capa-id: "CAPA-2025-01",
      finding-id: "INC-2025-H01",
      nc-id: "NC-2025-01",
      description: "Desplazamiento de dos laptops de admisión hacia Filial Camaná sin validación de cifrado completo de disco.",
      source: "Inspección de Seguridad DUTIC en Filiales (Cláusula 8.1 / Control A.3.11)",
      identified-by: "Ing. Carlos M. Benítez (OSI / DPO)",
      root-cause: "Ausencia de política MDM de enrolamiento previo para equipos portátiles asignados a sedes descentralizadas.",
      similar-nc: "No registra antecedente en sedes descentralizadas (expansión territorial 2025).",
      need-action: "SÍ",
      action-plan: "Desplegar política de grupo MDM obligatoria que bloquea arranque sin TPM 2.0 y aplica BitLocker XTS-AES 256 en todo equipo institucional.",
      informed-parties: "Coordinación Filial Camaná, Filial Majes y Soporte Técnico DUTIC.",
      approved-by: "Dr. Hugo José Sánchez (Rector)",
      responsible: "Dr. Marcos Cárdenas López (Coordinador Filial Camaná) / DUTIC",
      deadline: "2025-05-30",
      implemented-date: "2025-05-22",
      effectiveness-date: "2025-09-15",
      rag-status: "VERDE",
      effectiveness-notes: "Auditoría remota confirma 100% de terminales de Camaná y Majes debidamente cifrados y monitoreados en consola MDM. Estado: CERRADA.",
      system-changes: "Actualización de política de dispositivos móviles en G4-POL-01 y SoA control A.3.11."
    ),
    (
      capa-id: "CAPA-2025-02",
      finding-id: "INC-2025-H02",
      nc-id: "NC-2025-02",
      description: "Recepción de solicitud de actualización de cuenta bancaria vía correo simple sin validación criptográfica en Sisgedo.",
      source: "Auditoría de Procesos de Nómina (Cláusula 9.2)",
      identified-by: "Lic. Martha Elena Córdova (Subdirectora de Personal)",
      root-cause: "Inexistencia de flujo forzoso de cotejo de integridad previo a la remisión de la interfaz al Banco de la Nación.",
      similar-nc: "Ref. NC-2019-02 (mismo proceso de planillas, nuevo vector operacional).",
      need-action: "SÍ",
      action-plan: "Establecer trámite digital en Sisgedo con token Reniec y generación de hash SHA-256 para validación por el tesorero antes de la dispersión de fondos.",
      informed-parties: "Subdirección de Personal, Dirección General de Administración y Tesorería.",
      approved-by: "Dr. Hugo José Sánchez (Rector)",
      responsible: "Lic. Martha Elena Córdova (Subdirectora de Personal)",
      deadline: "2025-09-30",
      implemented-date: "2025-09-18",
      effectiveness-date: "2025-10-20",
      rag-status: "VERDE",
      effectiveness-notes: "Validación de planillas de setiembre y octubre ejecutadas al 100% mediante protocolo de doble firma y hash conforme. Estado: CERRADA.",
      system-changes: "Modificación de instructivo de interfaz bancaria en G4-PRC-DOC-01."
    ),
    (
      capa-id: "CAPA-2025-03",
      finding-id: "AUD-2025-H03",
      nc-id: "NC-2025-03",
      description: "Tres operadores de admisión y planillas en filiales ingresaron credenciales en ejercicio simulado de spear-phishing.",
      source: "Prueba Controlada de Concienciación SGPI (Cláusula 7.3 y Control A.3.17)",
      identified-by: "Ing. Carlos M. Benítez (OSI / DPO)",
      root-cause: "Falta de familiarización con vectores de suplantación dirigidos y ausencia de capacitación presencial en filiales.",
      similar-nc: "No registra antecedente en personal de filiales regionales.",
      need-action: "SÍ",
      action-plan: "Ejecutar taller híbrido de reforzamiento anti-phishing (G4-CAP-INC-01) y exigir aprobación con nota mínima de 14/20.",
      informed-parties: "Coordinadores de Filial Camaná y Majes, Dirección de Admisión y DUTIC.",
      approved-by: "Dr. Hugo José Sánchez (Rector)",
      responsible: "Ing. Carlos M. Benítez (Oficial de Seguridad / DPO)",
      deadline: "2025-12-15",
      implemented-date: "2025-11-07",
      effectiveness-date: "2025-12-15",
      rag-status: "AMARILLO",
      effectiveness-notes: "Taller impartido del 3 al 7 de noviembre de 2025; simulación de re-evaluación programada para la primera semana de diciembre. Estado: EN_SEGUIMIENTO.",
      system-changes: "Actualización del calendario de concienciación en G4-CAP-INC-01."
    )
  ),
  effectiveness-summary: (
    total: "7",
    closed: "6 (85.7% - CERRADAS)",
    in-progress: "1 (14.3% - EN_SEGUIMIENTO / NC-2025-03)",
    open: "0 (0%)",
    effectiveness-rate: "85.7% cerrado / 100% bajo control",
    conclusion: "El SGPI de la UNSA demuestra un alto nivel de madurez y eficacia correctiva (85.7% de acciones cerradas satisfactoriamente y 14.3% en seguimiento riguroso sin desvíos de plazo)."
  )
)
