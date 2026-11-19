#import "../../molds/incident-response-procedure/mold.typ": mold

#let data = (
  title: "Procedimiento de Respuesta a Incidentes de Privacidad",
  short-title: "Procedimiento de Respuesta a Incidentes",
  code: "G4-PRC-INC-01",
  version: "3.0",
  date: "2025-10-28",
  confidentiality: "Confidencial",
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
  validity: "2026-10-28",
  owner-role: "Oficial de Seguridad de la Información (OSI / DPO)",
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Emisión inicial aprobada para la certificación inicial ISO/IEC 27701:2019 del SGPI UNSA. Alcance restringido a sedes centrales Arequipa (Admisión y Planillas presenciales)."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización mayor post-pandemia: Incorporación de vectores web (portal admision.unsa.edu.pe), accesos lógicos remotos, teletrabajo administrativo vía VPN SSL y exclusión de archivos físicos históricos."
    ),
    (
      version: "3.0",
      date: "2025-10-28",
      author: "Ing. Carlos M. Benítez",
      summary: "Recertificación bajo ISO/IEC 27701:2025 (segunda edición, standalone PIMS): Expansión territorial a Filial Camaná y Filial El Pedregal (Majes), protocolos de respuesta descentralizados, gestión de terminales remotos (MDM/BitLocker) y enlaces VPN IPSec multisede."
    ),
  ),
  references: (
    "Norma Internacional ISO/IEC 27701:2025 Cláusula 8.1, Controles A.3.11, A.3.12 y Guías B.3.11, B.3.12.",
    "Ley N° 29733 de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).",
    "Resoluciones Rectorales N° 0142-2025-UNSA (Filial Camaná) y N° 0143-2025-UNSA (Filial El Pedregal - Majes).",
    "Política de Privacidad de la Información (G4-POL-01) y Matriz de Riesgos de Incidentes (G4-RSK-INC-01)."
  ),
  objective: [Definir y regular el proceso sistemático de gestión y respuesta integral ante eventos, incidentes de seguridad de la información y brechas de datos personales (PII) bajo control de la UNSA, garantizando la continuidad de los servicios y la protección de los derechos de los titulares de datos en todas las sedes institucionales, conforme a la norma *ISO/IEC 27701:2025 Cláusula 8.1, Controles A.3.11, A.3.12 y directrices de las Guías B.3.11 y B.3.12*.],
  scope: [Aplica de manera vinculante en: 1. *Procesos en Alcance*: Admisión de Pregrado Integral (inscripción web, verificación biométrica facial y dactilar presencial en Arequipa y filiales) y Planilla de Remuneraciones Multisede (personal docente y administrativo). 2. *Sedes Geográficas*: Sedes Centrales Arequipa (Campus Ingenierías, Biomédicas y Sociales), Filial Camaná (Av. Costanera s/n, RR 0142-2025) y Filial El Pedregal - Majes (Calle 4 s/n, RR 0143-2025). 3. *Infraestructura*: Nube privada híbrida, enlaces VPN IPSec cifrados sitio a sitio y terminales corporativos administrados bajo MDM (Microsoft Intune) con BitLocker XTS-AES 256.],
  users: [Directores de Admisión y Personal, Coordinadores de Filial en Camaná y Majes, Analistas de Nómina, Operadores Biométricos, Ingenieros de Soporte y miembros del Equipo CSIRT-UNSA.],
  normative_basis: [Rige bajo la norma ISO/IEC 27701:2025 Cláusula 8.1, Cláusula 7.5.1 / 7.5.3, Controles A.3.11/A.3.12 y Guías de implementación B.3.11 / B.3.12. La UNSA ejerce la función exclusiva de Responsable del Tratamiento de Datos Personales (PII Controller - Cl. 4.1).],
  notification_callout_title: "CRITERIO DE NOTIFICACIÓN ORGANIZACIONAL (GUÍA B.3.12)",
  notification_callout_body: [Conforme a la Cláusula 8.1 y la Guía B.3.12, los registros de brechas y las notificaciones hacia la autoridad administrativa nacional (ANPDP) o los titulares se determinan en función de la severidad intrínseca y la efectividad de las medidas de mitigación técnicas implementadas (ej. cifrado de discos XTS-AES 256 según A.3.26). NO aplica la regla foránea de notificación en 72 horas del RGPD europeo (Anexo D).],
  roles: (
    (
      role: "Comité SGPI / Rectorado",
      responsibility: "Dirección estratégica institucional, declaratoria de contingencia grave y vocería oficial ante medios y autoridades."
    ),
    (
      role: "Oficial de Seguridad / DPO",
      responsibility: "Liderazgo técnico y legal del incidente, determinación de procedencia de notificación regulatoria y articulación del registro G4-REG-INC-01."
    ),
    (
      role: "CSIRT-UNSA Central (DUTIC)",
      responsibility: "Operación 24/7 de monitoreo SIEM, contención perimetral, bloqueo remoto de terminales comprometidos y análisis forense digital."
    ),
    (
      role: "Coordinadores de Filial (Camaná / Majes)",
      responsibility: "Reporte inmediato al CSIRT de cualquier anomalía física o lógica en la sede descentralizada, aislamiento físico preliminar y custodia de equipos locales."
    ),
    (
      role: "Responsables de Proceso (Admisión y Planillas)",
      responsibility: "Evaluación del impacto operativo en el servicio, suspensión preventiva controlada de transacciones si existiere riesgo de corrupción de PII."
    )
  ),
  phase_detection: [Todo colaborador en Arequipa, Camaná o Majes que detecte un incidente debe comunicarlo dentro de los 30 minutos de conocido al canal oficial `csirt@unsa.edu.pe` o a la línea directa de contingencia. El canal genera un ticket con marca de tiempo precisa (`awareness_at`).],
  phase_triage_intro: [Clasificación estructurada de incidentes multisede según su severidad operativa y regulatoria:],
  severity_scale: (
    (
      level: "CRÍTICO",
      impact_criterion: "Compromiso masivo de PII o acceso no autorizado a la base central de datos.",
      typical_scenario: "Intrusión remota en base de datos central de admisión afectando postulantes de todas las sedes.",
      sla: "30 minutos"
    ),
    (
      level: "ALTO",
      impact_criterion: "Pérdida o sustracción de terminal móvil con datos PII en filiales.",
      typical_scenario: "Robo de laptop de registro biométrico en Filial Camaná durante proceso de admisión.",
      sla: "1 hora"
    ),
    (
      level: "MEDIO",
      impact_criterion: "Desincronización de base de datos entre filiales o errores de nómina local.",
      typical_scenario: "Colisión de datos bancarios de personal entre la VPN de Filial El Pedregal y la central.",
      sla: "4 horas"
    ),
    (
      level: "BAJO",
      impact_criterion: "Campaña de phishing o ataque perimetral bloqueado automáticamente.",
      typical_scenario: "Intento de suplantación bancaria por correo neutralizado en filtro perimetral sin víctimas.",
      sla: "8 horas"
    )
  ),
  phase_containment: [1. *Terminales Móviles y Filiales*: En caso de pérdida o robo de equipo en filial (ej. Camaná o Majes), el CSIRT ejecuta de inmediato el bloqueo y borrado remoto de credenciales vía MDM corporativo, validando la vigencia del cifrado de disco BitLocker XTS-AES 256. 2. *Redes y Enlaces VPN*: En caso de sospecha de tráfico malicioso en enlace inter-sedes, se aísla temporalmente el túnel IPSec de la filial afectada, enrutando por canal de contingencia seguro. 3. *Preservación Forense*: Extracción de bitácoras de firewall, logs de autenticación y preservación inalterable de evidencias conforme a ISO 19011:2026.],
  phase_evaluation_notification: [El DPO institucional elabora el dictamen de notificación considerando: 1. *Efectividad del Cifrado*: Si el dispositivo comprometido contaba con cifrado robusto no vulnerado (BitLocker), la probabilidad de daño a los titulares es calificada como nula, registrándose el estado como `EVALUADO_NO_REQUIERE` ante la ANPDP. 2. *Afectación Efectiva*: Si se acredita acceso no autorizado a datos sensibles o remunerativos, se formula notificación formal a la ANPDP Perú y se cursa comunicación directa a los titulares involucrados (`NOTIFICADO_TITULARES`).],
  phase_eradication: [Aislamiento definitivo del vector, remediación de brechas en terminales móviles vía MDM, regeneración de certificados VPN IPSec y rotación general de credenciales comprometidas.],
  phase_closure_capa: [Todo incidente atendido debe asentarse en el Registro `G4-REG-INC-01` (tanto en su formato Typst como en la matriz XLSX generada por script Bun). Asimismo, se abre formalmente la Solicitud de Acción Correctiva en `G4-REG-CAPA-01` bajo la Cláusula 10.2 para asegurar la erradicación definitiva de la causa raíz.],
  records_management: (
    (
      name: "Registro Oficial de Incidentes (G4-REG-INC-01 / XLSX)",
      custodian: "Equipo CSIRT-UNSA / DPO",
      location: "Repositorio PIMS GESTITEL (9 campos B.3.12)",
      retention: "10 años"
    ),
    (
      name: "Registro y Cadena de Acciones Correctivas (G4-REG-CAPA-01)",
      custodian: "Oficial de Seguridad / DPO",
      location: "Plataforma Institucional SGPI",
      retention: "5 años"
    ),
    (
      name: "Bitácora de Eventos SIEM y Reportes Forenses Multisede",
      custodian: "Líder CSIRT / DUTIC",
      location: "Almacenamiento Cifrado WORM DUTIC",
      retention: "5 años"
    )
  )
)

#mold(data: data)
