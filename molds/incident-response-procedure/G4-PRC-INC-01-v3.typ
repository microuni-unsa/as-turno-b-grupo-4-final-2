#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
  title: "Procedimiento de Respuesta a Incidentes de Privacidad",
  code: "G4-PRC-INC-01",
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
  )
)

= Objetivo
Definir y regular el proceso sistemático de gestión y respuesta integral ante eventos, incidentes de seguridad de la información y brechas de datos personales (PII) bajo control de la UNSA, garantizando la continuidad de los servicios y la protección de los derechos de los titulares de datos en todas las sedes institucionales, conforme a la norma *ISO/IEC 27701:2025 Cláusula 8.1, Controles A.3.11, A.3.12 y directrices de las Guías B.3.11 y B.3.12*.

= Alcance Institucional (Versión 3.0 — Recertificación Multisede)
1. *Procesos en Alcance*:
   - *Admisión (Proceso Misional)*: Inscripción web centralizada, captura y verificación biométrica presencial y descentralizada en Arequipa y filiales regionales.
   - *Planillas (Proceso de Soporte)*: Administración integral de remuneraciones, retenciones tributarias, aportes previsionales y cuentas bancarias de personal docente y administrativo en sedes centrales y filiales.
2. *Sedes Geográficas*:
   - *Sedes Centrales Arequipa*: Campus Área de Ingenierías, Campus Biomédicas y Campus Sociales.
   - *Filial Camaná*: Sede Descentralizada Camaná (Av. Costanera s/n), incorporada según Resolución Rectoral N° 0142-2025-UNSA.
   - *Filial El Pedregal (Majes)*: Sede Descentralizada Majes (Calle 4 s/n), incorporada según Resolución Rectoral N° 0143-2025-UNSA.
3. *Infraestructura*: Nube privada híbrida institucional, servidores locales en filiales enlazados vía túneles VPN IPSec cifrados, estaciones móviles corporativas administradas bajo plataforma de gestión de dispositivos (MDM).

= Base Normativa y Criterios Institucionales
- *ISO/IEC 27701:2025*: Cláusula 8.1 (Planificación y control operacional), Cláusula 7.5.1 / 7.5.3 (Control de información documentada), Controles A.3.11, A.3.12 y Guías de implementación B.3.11 / B.3.12.
- *Determinación del Rol Institucional*: PII Controller exclusivo (Cláusula 4.1).
- *Ley N° 29733*: Ley de Protección de Datos Personales del Perú.

#callout(title: "CRITERIO DE NOTIFICACIÓN ORGANIZACIONAL (GUÍA B.3.12)", color: rgb("#0284c7"))[
  Conforme a la Cláusula 8.1 y la Guía B.3.12, los registros de brechas y las notificaciones hacia la autoridad administrativa nacional (ANPDP) o los titulares se determinan en función de la severidad intrínseca y la efectividad de las medidas de mitigación técnicas implementadas (ej. cifrado de discos XTS-AES 256 según A.3.26). NO aplica la regla foránea de notificación en 72 horas del RGPD europeo (Anexo D).
]

= Estructura Organizativa Multisede ante Incidentes
#table(
  columns: (130pt, 1fr),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (left, left),
  table.header([*Instancia / Rol*], [*Competencias Multisede v3.0*]),
  [Comité SGPI / Rectorado], [Dirección estratégica institucional, declaratoria de contingencia grave y vocería oficial ante medios y autoridades.],
  [Oficial de Seguridad / DPO], [Liderazgo técnico y legal del incidente, determinación de procedencia de notificación regulatoria y articulación del registro `G4-REG-INC-01`.],
  [CSIRT-UNSA Central (DUTIC)], [Operación 24/7 de monitoreo SIEM, contención perimetral, bloqueo remoto de terminales comprometidos y análisis forense digital.],
  [Coordinadores de Filial (Camaná / Majes)], [Reporte inmediato al CSIRT de cualquier anomalía física o lógica en la sede descentralizada, aislamiento físico preliminar y custodia de equipos locales.],
  [Responsables de Proceso (Admisión y Planillas)], [Evaluación del impacto operativo en el servicio, suspensión preventiva controlada de transacciones si existiere riesgo de corrupción de PII.]
)

= Procedimiento Operativo Detallado

== Detección y Notificación Interna Rápida
- Todo colaborador en Arequipa, Camaná o Majes que detecte un incidente debe comunicarlo dentro de los 30 minutos de conocido al canal oficial `csirt@unsa.edu.pe` o a la línea directa de contingencia.
- El canal genera un ticket con marca de tiempo precisa (`awareness_at`).

== Clasificación de Incidentes Multisede
#table(
  columns: (65pt, 100pt, 1fr, 65pt),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, left, left, center),
  table.header([*Nivel*], [*Criterio de Impacto*], [*Escenario Típico Multisede v3.0*], [*SLA Contención*]),
  rag-tag("CRÍTICO"), [Compromiso masivo de PII o acceso no autorizado a la base central de datos.], [Intrusión remota en base de datos central de admisión afectando postulantes de todas las sedes.], [30 minutos],
  rag-tag("ALTO"), [Pérdida o sustracción de terminal móvil con datos PII en filiales.], [Robo de laptop de registro biométrico en Filial Camaná durante proceso de admisión.], [1 hora],
  rag-tag("MEDIO"), [Desincronización de base de datos entre filiales o errores de nómina local.], [Colisión de datos bancarios de personal entre la VPN de Filial El Pedregal y la central.], [4 horas],
  rag-tag("BAJO"), [Campaña de phishing o ataque perimetral bloqueado automáticamente.], [Intento de suplantación bancaria por correo neutralizado en filtro perimetral sin víctimas.], [8 horas]
)

== Protocolo de Contención y Preservación Forense
1. *Terminales Móviles y Filiales*: En caso de pérdida o robo de equipo en filial (ej. Camaná o Majes), el CSIRT ejecuta de inmediato el *bloqueo y borrado remoto de credenciales* vía MDM corporativo. Se valida la vigencia del cifrado de disco BitLocker XTS-AES 256.
2. *Redes y Enlaces VPN*: En caso de sospecha de tráfico malicioso en enlace inter-sedes, se aísla temporalmente el túnel IPSec de la filial afectada, enrutando temporalmente la gestión por canal de contingencia seguro.
3. *Preservación Forense*: Extracción de bitácoras de firewall, logs de autenticación y preservación inalterable de evidencias conforme a buenas prácticas de auditoría informática.

== Criterios para la Notificación Externa e Interna (Guía B.3.12)
El DPO institucional elabora el dictamen de notificación considerando:
1. *Efectividad del Cifrado*: Si el dispositivo comprometido contaba con cifrado robusto no vulnerado (BitLocker), la probabilidad de daño a los titulares es calificada como nula, registrándose el estado como `EVALUADO_NO_REQUIERE` ante la ANPDP.
2. *Afectación Efectiva*: Si se acredita acceso no autorizado a datos sensibles o remunerativos, se formula notificación formal a la ANPDP Perú y se cursa comunicación directa a los titulares involucrados (`NOTIFICADO_TITULARES`).

== Registro Institucional y Mejora Continua (CAPA)
Todo incidente atendido debe asentarse en el Registro `G4-REG-INC-01` (tanto en su formato Typst como en la matriz XLSX generada por script Bun). Asimismo, se abre formalmente la Solicitud de Acción Correctiva en `G4-REG-CAPA-01` para asegurar la erradicación definitiva de la causa raíz.
