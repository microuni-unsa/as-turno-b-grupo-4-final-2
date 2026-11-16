// Invocador de versión v1.0 para G4-REG-CAPA-01 (Registro de No Conformidades y Acciones Correctivas)
// SGPI UNSA — Certificación inicial ISO/IEC 27701:2019 (15 de abril de 2019)

#import "../../molds/nc-corrective-actions/mold-reg-capa.typ": mold-reg-capa

#show: mold-reg-capa.with(
  metadata: (
    title: "Apéndice: Formulario para medidas correctivas",
    code: "G4-REG-CAPA-01",
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
        summary: "Emisión inicial aprobada para la certificación inicial ISO/IEC 27701:2019. Trazabilidad de hallazgos y acciones correctivas en sedes centrales Arequipa."
      ),
    ),
    validity: "2020-04-15",
    owner-role: "Oficial de Seguridad de la Información (OSI / DPO)"
  ),
  references: (
    "Norma Internacional ISO/IEC 27701:2025, Cláusula 10.2 (No conformidad y acción correctiva).",
    "Procedimiento de No Conformidades y Acciones Correctivas (G4-PRC-CAPA-01).",
    "Procedimiento de Respuesta a Incidentes de Privacidad (G4-PRC-INC-01).",
    "Informe de Auditoría Interna Inicial SGPI (G4-REP-AUD-01-v1)."
  ),
  period-label: "Periodo Inicial 2019 — Sedes Centrales Arequipa",
  capa-chain-rows: (
    (
      finding-id: "AUD-2019-H01",
      nc-id: "NC-2019-01",
      cause: "Ausencia de protocolo formal de destrucción inmediata de borradores impresos de padrones de admisión.",
      action: "Instalación de trituradoras de microcorte en puertas de admisión e instructivo de destrucción inmediata obligatoria.",
      owner: "Dr. Walter Delgado (Dir. Admisión)",
      deadline: "2019-06-30",
      rag-status: "VERDE",
      evidence-link: "pims:G4-PRC-INC-01:v1:chunk:18-24"
    ),
    (
      finding-id: "INC-2019-H02",
      nc-id: "NC-2019-02",
      cause: "Envío manual de planillas docentes sin validación de listas de distribución ni cifrado en tránsito.",
      action: "Configuración de reglas de prevención de fuga de datos (DLP) en servidor Exchange y entrega de tokens seguros.",
      owner: "Lic. Martha Córdova (Subdir. Personal)",
      deadline: "2019-10-31",
      rag-status: "VERDE",
      evidence-link: "pims:G4-REG-INC-01:v1:chunk:30-42"
    ),
  ),
  form-records: (
    (
      capa-id: "CAPA-2019-01",
      finding-id: "AUD-2019-H01",
      nc-id: "NC-2019-01",
      description: "Disposición inadecuada de hojas borrador con datos personales de postulantes en tachos comunes de pabellón de admisión.",
      source: "Auditoría Interna Inicial SGPI (Cláusula 9.2)",
      identified-by: "Ing. Carlos M. Benítez (Auditor Líder)",
      root-cause: "Carencia de trituradoras operativas en las aulas de registro y falta de capacitación sobre descarte seguro de PII física.",
      similar-nc: "No registra antecedente previo (certificación inicial 2019).",
      need-action: "SÍ",
      action-plan: "Adquirir 6 trituradoras de microcorte nivel DIN P-4, publicar instructivo en puertas y capacitar a vocales de mesa.",
      informed-parties: "Comisión Permanente de Admisión, DUTIC y personal de vigilancia.",
      approved-by: "Dr. Rohel Sánchez Sánchez (Rector)",
      responsible: "Dr. Walter Delgado Manrique (Director General de Admisión)",
      deadline: "2019-06-30",
      implemented-date: "2019-06-20",
      effectiveness-date: "2019-12-10",
      rag-status: "VERDE",
      effectiveness-notes: "Verificación en campo por auditoría de seguimiento: 100% de borradores triturados, cero material residual en tachos. Estado: CERRADA.",
      system-changes: "Actualización del Procedimiento de Admisión e inclusión de requisito de destrucción en G4-PRC-DOC-01."
    ),
    (
      capa-id: "CAPA-2019-02",
      finding-id: "INC-2019-H02",
      nc-id: "NC-2019-02",
      description: "Remisión por correo electrónico de archivo plano con nómina de haberes a lista de distribución no autorizada.",
      source: "Reporte de Incidente Operacional (Libro de Incidentes G4-REG-INC-01)",
      identified-by: "Lic. Martha Elena Córdova (Subdirectora de Personal)",
      root-cause: "Autocompletado erróneo de direcciones en cliente de correo y ausencia de políticas DLP en servidor institucional.",
      similar-nc: "No registra antecedente previo.",
      need-action: "SÍ",
      action-plan: "Implementar filtros DLP en Exchange para detectar patrones de DNI/sueldos y exigir confirmación en doble paso.",
      informed-parties: "Subdirección de Personal, DUTIC y Comité de Privacidad.",
      approved-by: "Dr. Rohel Sánchez Sánchez (Rector)",
      responsible: "Lic. Martha Elena Córdova / Mg. Lucía Valdivia (DUTIC)",
      deadline: "2019-10-31",
      implemented-date: "2019-10-15",
      effectiveness-date: "2019-12-15",
      rag-status: "VERDE",
      effectiveness-notes: "Pruebas de envío simulado bloqueadas exitosamente por el servidor de correo. Cero fugas reportadas. Estado: CERRADA.",
      system-changes: "Formalización de directiva de uso seguro de correo electrónico en G4-POL-01."
    )
  ),
  effectiveness-summary: (
    total: "2",
    closed: "2 (100% - CERRADAS)",
    in-progress: "0 (0%)",
    open: "0 (0%)",
    effectiveness-rate: "100%",
    conclusion: "Se constata el cierre formal y la eficacia de la totalidad de acciones correctivas del periodo inicial 2019, satisfaciendo la Cláusula 10.2."
  )
)
