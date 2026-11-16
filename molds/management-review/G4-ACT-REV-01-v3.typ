#import "mold.typ": mold

#let data = (
  title: "Acta de Revisión por la Dirección del SGPI",
  code: "G4-ACT-REV-01",
  version: "3.0",
  date: "2025-10-28",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
  author: (
    name: "Ing. Carlos M. Benítez",
    role: "Secretario Técnico / Oficial de Seguridad (OSI)",
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
      summary: "Emisión de la primera acta de revisión por la dirección para certificación inicial ISO/IEC 27701:2019."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Revisión post-pandemia evaluando la migración digital y teletrabajo."
    ),
    (
      version: "3.0",
      date: "2025-10-28",
      author: "Ing. Carlos M. Benítez",
      summary: "Recertificación bajo ISO/IEC 27701:2025 (segunda edición): Sesión extraordinaria aprobando la incorporación de Filiales Camaná y Majes."
    ),
  ),
  session_data: (
    date_time: "28 de octubre de 2025, 10:00 a 13:00 horas.",
    place: "Sala del Consejo Universitario (Rectorado) y conexión telemática segura.",
    presides: "Dr. Hugo José Sánchez (Rector de la UNSA).",
    attendees: (
      "Dr. Luis Cuadros Paz (Vicerrector Académico).",
      "Mg. Lucía Valdivia Paredes (Directora Universitaria de TIC - DUTIC).",
      "Dr. Walter Delgado Manrique (Director General de Admisión).",
      "Lic. Martha Elena Córdova (Subdirectora de Personal y Remuneraciones).",
      "Dr. Marcos A. Cárdenas (Coordinador Filial Camaná).",
      "Dr. Roberto Zúñiga Vera (Coordinador Filial El Pedregal - Majes).",
      "Ing. Carlos M. Benítez (Oficial de Seguridad de la Información / DPO - Secretario Técnico)."
    )
  ),
  inputs_intro: [El Secretario Técnico expone los puntos obligatorios requeridos por la norma ISO/IEC 27701:2025:],
  review_inputs: (
    (
      title: "Estado de Acciones de Revisiones Previas (9.3.2.a)",
      content: [Las acciones derivadas de la revisión 2024 fueron ejecutadas al 100%, incluyendo la adquisición de licencias MDM y renovación de cortafuegos perimetrales.]
    ),
    (
      title: "Cambios en Cuestiones Externas e Internas (9.3.2.b)",
      content: [Incorporación territorial formal de las Filiales de Camaná y El Pedregal (Resoluciones Rectorales 0142 y 0143-2025-UNSA) y adopción del estándar standalone ISO/IEC 27701:2025.]
    ),
    (
      title: "Desempeño de Privacidad y Tendencias (9.3.2.c)",
      content: [6 de 7 acciones correctivas cerradas eficazmente en `G4-REG-CAPA-01` (1 en curso: `NC-2025-03`); 100% de cumplimiento en KPIs de derechos ARCO y 96.2% de cobertura de capacitación en `G4-CAP-INC-01`; informe `G4-REP-AUD-01` concluye conformidad del SGPI; 3 incidentes gestionados en `G4-REG-INC-01` contenidos sin daño a titulares.]
    ),
    (
      title: "Retroalimentación de Titulares (9.3.2.d)",
      content: [Cero reclamos fundados interpuestos ante la Autoridad Nacional de Protección de Datos Personales (ANPDP Perú).]
    ),
    (
      title: "Eficacia en Gestión de Riesgos (9.3.2.e)",
      content: [Matriz `G4-RSK-INC-01` actualizada manteniendo todos los riesgos residuales en niveles aceptables (zona verde).]
    )
  ),
  outputs_intro: [Tras deliberación, el Comité de Gobierno Digital y Privacidad acordó unánimemente:],
  decisions: (
    (
      title: "Aprobación de Documentos Clave del SGPI",
      content: [Se aprueban formalmente las versiones 3.0 de la Política (`G4-POL-01`), Alcance (`G4-ALC-01`), Declaración de Aplicabilidad (`G4-SOA-01`) y Procedimiento de Incidentes (`G4-PRC-INC-01`).]
    ),
    (
      title: "Asignación de Recursos Presupuestales 2026",
      content: [Se autoriza una partida presupuestal de S/. 180,000 para el fortalecimiento de los enlaces de fibra óptica y equipamiento de seguridad en las filiales Camaná y Majes.]
    ),
    (
      title: "Autorización de Auditoría Externa de Recertificación",
      content: [Se instruye al DPO coordinar la auditoría de Fase 1 con el ente certificador internacional para noviembre de 2025.]
    )
  ),
  closing_text: [Siendo las 13:00 horas, se dio por concluida la sesión, firmando los miembros en señal de conformidad.]
)

#mold(data: data)
