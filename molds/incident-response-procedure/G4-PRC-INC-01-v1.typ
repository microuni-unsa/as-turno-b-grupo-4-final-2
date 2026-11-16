#import "mold.typ": mold

#let data = (
  title: "Procedimiento de Respuesta a Incidentes de Privacidad",
  code: "G4-PRC-INC-01",
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
      summary: "Emisión inicial aprobada para la certificación inicial ISO/IEC 27701:2019 del SGPI UNSA. Alcance restringido a sedes centrales Arequipa (Admisión y Planillas presenciales)."
    ),
  ),
  references: (
    "Norma Internacional ISO/IEC 27701:2025 Cláusula 8.1, Controles A.3.11, A.3.12 y Guías B.3.11, B.3.12.",
    "Ley N° 29733 de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Ley Universitaria N° 30220.",
    "Política de Privacidad de la Información (G4-POL-01) y Alcance del SGPI (G4-ALC-01)."
  ),
  objective: [Establecer el marco estructurado y las directrices operativas obligatorias para planificar, detectar, clasificar, contener, investigar, notificar y documentar todo evento o incidente de seguridad que involucre o amenace datos personales (PII) bajo la responsabilidad de la Universidad Nacional de San Agustín de Arequipa (UNSA), de conformidad con la norma ISO/IEC 27701:2025 Cláusula 8.1, Controles A.3.11, A.3.12 y directrices de las Guías B.3.11 y B.3.12.],
  scope: [Rige en los límites institucionales de la certificación inicial 2019: Proceso Misional de Admisión Ordinaria presencial (expedientes físicos, huella dactilar manual y padrones en papel) y Proceso de Soporte de Planillas de Remuneraciones en la Subdirección de Personal, circunscrito exclusivamente a los Campus de Ingenierías, Biomédicas y Sociales en la ciudad de Arequipa.],
  users: [Personal administrativo y directivo de la Dirección General de Admisión, analistas de la Subdirección de Personal, operadores del Data Center DUTIC y todos los miembros del CSIRT-UNSA.],
  normative_basis: [La gestión operativa de incidentes de privacidad se sustenta en la norma ISO/IEC 27701:2025 Cláusula 8.1 (Planificación y control operacional), Cláusula 7.5 (Control de información documentada) y Controles A.3.11/A.3.12. La UNSA ejerce el rol exclusivo de Responsable del Tratamiento de Datos Personales (PII Controller - Cl. 4.1).],
  notification_callout_title: "CRITERIO DE NOTIFICACIÓN ORGANIZACIONAL (GUÍA B.3.12)",
  notification_callout_body: [Conforme a la Guía B.3.12 y la Cláusula 8.1, la obligación de notificación se determina mediante una evaluación objetiva del riesgo sobre los derechos de los titulares. No rige la regla externa de notificación en 72 horas del RGPD europeo (Anexo D), dado que el marco aplicable es la Ley N° 29733 de Perú y los criterios institucionales internos.],
  roles: (
    (
      role: "Comité SGPI / Rectorado",
      responsibility: "Aprobación de la política, asignación presupuestal y autorización de comunicaciones públicas ante contingencias mayores."
    ),
    (
      role: "Oficial de Seguridad / DPO",
      responsibility: "Liderar el procedimiento de respuesta, efectuar el triage de severidad, calificar si existe brecha PII y definir la procedencia de notificación regulatoria."
    ),
    (
      role: "Equipo CSIRT-UNSA (DUTIC)",
      responsibility: "Ejecutar acciones técnicas inmediatas de contención física y lógica, aislamiento de redes, preservación de evidencias forenses y erradicación del vector."
    ),
    (
      role: "Dirección de Admisión",
      responsibility: "Custodiar los padrones de postulantes y reportar de inmediato anomalías en el manejo de expedientes físicos o fichas de inscripción."
    ),
    (
      role: "Subdirección de Personal",
      responsibility: "Garantizar la reserva de los archivos de remuneraciones y reportar incidentes de filtración interna o errores en boletas salariales."
    ),
    (
      role: "Colaboradores y Docentes",
      responsibility: "Reportar inmediatamente al CSIRT cualquier sospecha de incidente, extravío de documentos o acceso no autorizado a datos personales."
    )
  ),
  phase_detection: [Cualquier miembro de la comunidad universitaria que identifique una anomalía debe reportarla dentro de los primeros 60 minutos de conocida a través de la mesa de ayuda de DUTIC (`soporte@unsa.edu.pe`) o telefónicamente al anexo interno del DPO. La notificación inicial genera un ticket formal con marca de tiempo precisa (`awareness_at`) y detalle de los datos presuntamente comprometidos.],
  phase_triage_intro: [El DPO junto al líder del CSIRT efectúan el análisis de gravedad según la Nota 1 de la Guía B.3.12, distinguiendo entre Evento de Seguridad, Incidente de Privacidad y Brecha de Datos Personales (PII Breach):],
  severity_scale: (
    (
      level: "CRÍTICO",
      impact_criterion: "Compromiso masivo de PII sensible (>1,000 titulares) o daño inminente a derechos.",
      typical_scenario: "Robo de padrón impreso con huellas y notas de admisión general.",
      sla: "1 hora"
    ),
    (
      level: "ALTO",
      impact_criterion: "Exposición de datos financieros o remunerativos de personal (>20 titulares).",
      typical_scenario: "Envío erróneo de planillas salariales por correo masivo.",
      sla: "4 horas"
    ),
    (
      level: "MEDIO",
      impact_criterion: "Exposición acotada de PII general sin datos bancarios (<20 titulares).",
      typical_scenario: "Listado de postulantes olvidado temporalmente en aula sin custodia.",
      sla: "12 horas"
    ),
    (
      level: "BAJO",
      impact_criterion: "Fallo técnico interno sin acceso indebido de terceros.",
      typical_scenario: "Retraso operativo en generación de backups sin pérdida de datos.",
      sla: "24 horas"
    )
  ),
  phase_containment: [1. *Aislamiento*: Desconectar equipos de red física cableada comprometidos o retirar inmediatamente documentos en papel de la vista pública. 2. *Cadena de Custodia*: Registrar el inventario de hojas retiradas, discos duros intervenidos o bitácoras de sistema con sello temporal y firma de los custodios. 3. *Prohibición de Alteración*: Prohibición terminante de reiniciar o formatear servidores implicados sin antes haber extraído las imágenes forenses.],
  phase_evaluation_notification: [El DPO conduce la evaluación de impacto analizando la naturaleza de los datos y las medidas de protección. Se determina el estado de notificación (`notification_state`): *EVALUADO_NO_REQUIERE* (riesgo residual insignificante), *NOTIFICADO_AUTORIDAD_ANPDP* (riesgo razonable de perjuicio grave, notificando a la Dirección General de Protección de Datos Personales del Minjusdh) o *NOTIFICADO_TITULARES* (comunicación directa a personas afectadas indicando medidas de mitigación).],
  phase_eradication: [Aplicación de parches de configuración, cambios obligatorios de contraseñas de acceso y destrucción física certificada de material impreso expuesto. Validación técnica de DUTIC de que la operación ha vuelto al estado seguro antes de autorizar el reinicio normal.],
  phase_closure_capa: [Todo incidente calificado como Alto o Crítico desencadena obligatoriamente la emisión de una Solicitud de Acción Correctiva (SAC) en el registro `G4-REG-CAPA-01` bajo la Cláusula 10.2, documentando el análisis de causa raíz y el plan de mitigación definitiva.],
  records_management: (
    (
      name: "Libro Oficial de Registro de Incidentes (G4-REG-INC-01)",
      custodian: "Oficial de Seguridad / DPO",
      location: "Archivo de Seguridad DUTIC / PIMS GESTITEL",
      retention: "5 años"
    ),
    (
      name: "Solicitudes de Acción Correctiva (G4-REG-CAPA-01)",
      custodian: "Oficial de Seguridad / DPO",
      location: "Repositorio Institucional SGPI",
      retention: "5 años"
    ),
    (
      name: "Bitácoras e Informes Periciales Forenses",
      custodian: "Líder Técnico CSIRT-UNSA",
      location: "Almacenamiento Cifrado DUTIC",
      retention: "3 años"
    )
  )
)

#mold(data: data)
