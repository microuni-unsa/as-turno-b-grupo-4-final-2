#import "mold.typ": mold

#let data = (
  title: "Procedimiento de Respuesta a Incidentes de Privacidad",
  code: "G4-PRC-INC-01",
  version: "2.0",
  date: "2022-09-10",
  confidentiality: "CONFIDENCIAL - USO INTERNO UNSA",
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
  validity: "2023-09-10",
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
  ),
  references: (
    "Norma Internacional ISO/IEC 27701:2025 Cláusula 8.1, Controles A.3.11, A.3.12 y Guías B.3.11, B.3.12.",
    "Ley N° 29733 de Protección de Datos Personales del Perú y D.S. 003-2013-JUS.",
    "Política de Privacidad de la Información (G4-POL-01) y Procedimiento de Control Documental (G4-PRC-DOC-01)."
  ),
  objective: [Establecer los procedimientos normalizados para identificar, contener, remediar y evaluar los incidentes de seguridad que afecten los datos personales (PII) bajo control de la UNSA, adaptados a la infraestructura digitalizada post-pandemia, conforme a ISO/IEC 27701:2025 Cláusula 8.1, Controles A.3.11, A.3.12 y Guías B.3.11 / B.3.12.],
  scope: [Aplica a los canales digitales del SGPI: Proceso Misional de Admisión Virtual (`admision.unsa.edu.pe`) y Proceso de Soporte de Planillas operado en modalidad mixta y teletrabajo mediante acceso VPN SSL corporativo con MFA. Se formaliza la exclusión de archivos físicos históricos pasivos resguardados en Archivo Central.],
  users: [Operadores de plataformas web de admisión, analistas de planillas en teletrabajo, administradores de sistemas DUTIC y equipo CSIRT-UNSA.],
  normative_basis: [Rige bajo la norma ISO/IEC 27701:2025 Cláusula 8.1 y Controles A.3.11/A.3.12. La UNSA ejerce el rol exclusivo de PII Controller (Cl. 4.1) sobre sus plataformas digitales y servidores en clúster virtualizado.],
  notification_callout_title: "AUTONOMÍA DE CRITERIO EN NOTIFICACIÓN DE BRECHAS",
  notification_callout_body: [La calificación de procedencia de notificación ante la autoridad administrativa o los titulares se sustenta en la Cláusula 8.1 y la Guía B.3.12, analizando si la brecha expuso PII no cifrada o con impacto adverso probable. Se ratifica que el plazo foráneo de 72 horas del RGPD europeo (Anexo D) no vincula operativamente al SGPI de la UNSA.],
  roles: (
    (
      role: "Comité SGPI / Rectorado",
      responsibility: "Aprobación de directivas de ciberseguridad, declaratoria de contingencia digital y asignación de fondos extraordinarios."
    ),
    (
      role: "Oficial de Seguridad / DPO",
      responsibility: "Calificación legal-técnica de brechas digitales, emisión de dictámenes de notificación para la ANPDP y coordinación con asesoría jurídica."
    ),
    (
      role: "CSIRT-UNSA (DUTIC)",
      responsibility: "Monitoreo activo de logs web, detección de anomalías IDOR, inyecciones SQL, fuerza bruta y mitigación perimetral vía WAF."
    ),
    (
      role: "Administradores de Plataforma Web",
      responsibility: "Despliegue de parches de emergencia (hotfixes), revocación de tokens JWT y reseteo forzoso de sesiones comprometidas."
    ),
    (
      role: "Usuarios de Admisión y Planillas",
      responsibility: "Cumplimiento estricto de directivas de teletrabajo seguro, reporte inmediato de correos maliciosos y no compartir credenciales VPN."
    )
  ),
  phase_detection: [Monitoreo automatizado continuo mediante alertas generadas por el SIEM institucional y analizadores de registros web ante anomalías de tráfico en `admision.unsa.edu.pe`, complementado por reportes directos al buzón `seguridad.informacion@unsa.edu.pe`.],
  phase_triage_intro: [Clasificación de eventos e incidentes conforme a la Guía B.3.12 y los vectores digitales de la era post-pandemia:],
  severity_scale: (
    (
      level: "CRÍTICO",
      impact_criterion: "Exfiltración o acceso anómalo masivo vía fallas de aplicación web.",
      typical_scenario: "Vulnerabilidad IDOR en API de admisión exponiendo certificados de 1,240 postulantes.",
      sla: "45 minutos"
    ),
    (
      level: "ALTO",
      impact_criterion: "Compromiso de credencial con privilegios de administración o VPN.",
      typical_scenario: "Cuenta comprometida de analista de planillas con acceso a base de datos salarial.",
      sla: "2 horas"
    ),
    (
      level: "MEDIO",
      impact_criterion: "Denegación de servicio no destructiva o fallo temporal de réplica.",
      typical_scenario: "Caída temporal del portal de inscripción por sobrecarga sin fuga de PII.",
      sla: "6 horas"
    ),
    (
      level: "BAJO",
      impact_criterion: "Intentos masivos de autenticación fallida bloqueados por firewall.",
      typical_scenario: "Ataque de diccionario contra portal institucional neutralizado por WAF.",
      sla: "12 horas"
    )
  ),
  phase_containment: [1. *Bloqueo Inmediato*: Restricción de direcciones IP origen en el Web Application Firewall (WAF). 2. *Revocación de Credenciales*: Invalidación global de tokens JWT y reseteo forzoso de credenciales de cuentas afectadas. 3. *Preservación Forense*: Volcado de registros de acceso del servidor web (Nginx/Apache), consultas a base de datos y memoria volátil sin reiniciar servicios.],
  phase_evaluation_notification: [El DPO aplica los criterios de la Guía B.3.12: registro de fecha/hora de conocimiento, categorías de PII afectadas, vector y efectividad de cifrado. Se resuelve el estado de notificación (`EVALUADO_NO_REQUIERE`, `NOTIFICADO_AUTORIDAD_ANPDP` o `NOTIFICADO_TITULARES`).],
  phase_eradication: [Revisión de código fuente para subsanar vulnerabilidades OWASP Top 10, actualización de reglas WAF y auditoría de integridad en base de datos PostgreSQL institucional.],
  phase_closure_capa: [Toda brecha digital se documenta en el Libro de Incidentes `G4-REG-INC-01` y desencadena una acción correctiva en `G4-REG-CAPA-01` con revisión de código seguro y fortalecimiento de controles lógicos.],
  records_management: (
    (
      name: "Libro Digital de Incidentes (G4-REG-INC-01)",
      custodian: "Oficial de Seguridad / DPO",
      location: "Repositorio PIMS GESTITEL",
      retention: "5 años"
    ),
    (
      name: "Registro de Acciones Correctivas (G4-REG-CAPA-01)",
      custodian: "Oficial de Seguridad / DPO",
      location: "Plataforma Sisgedo / SGPI",
      retention: "5 años"
    ),
    (
      name: "Registros SIEM y Auditoría WAF",
      custodian: "Administrador de Redes DUTIC",
      location: "Servidor Central de Logs Cifrado",
      retention: "3 años"
    )
  )
)

#mold(data: data)
