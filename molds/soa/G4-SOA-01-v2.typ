#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
  title: "Declaración de Aplicabilidad del SGPI (SoA)",
  code: "G4-SOA-01",
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
  history: (
    (
      version: "1.0",
      date: "2019-04-15",
      author: "Ing. Carlos M. Benítez",
      summary: "Emisión inicial de la Declaración de Aplicabilidad (SoA) para la certificación ISO/IEC 27701:2019. Alcance: Sedes Arequipa (Admisión y Planillas presenciales)."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia: Reconfiguración de controles para la virtualización integral de admisiones (admision.unsa.edu.pe), teletrabajo con VPN y exclusión de archivos físicos históricos."
    ),
  )
)

= Propósito y Fundamento Normativo
La presente Declaración de Aplicabilidad (SoA) documenta formalmente los controles seleccionados para el SGPI de la UNSA bajo la Cláusula 6.1.3.e y la Introducción del Anexo A de la norma ISO/IEC 27701:2025, adaptados a la infraestructura digital y teletrabajo post-pandemia.

= Determinación del Rol Institucional (Cláusula 4.1)
La UNSA ratifica su condición exclusiva de *Responsable del Tratamiento de Datos Personales (PII Controller)*, definiendo autónomamente los fines y medios del tratamiento de postulantes y colaboradores en sus plataformas digitales.

#callout(title: "EXCLUSIÓN NORMATIVA DE LA TABLA A.2 (CLÁUSULA 6.1.3e)", color: rgb("#0284c7"))[
  Se ratifica la exclusión fundada de la totalidad de controles de la Tabla A.2 (A.2.2.2 a A.2.5.9), dado que la UNSA no actúa como Encargado del Tratamiento para terceros.
]

= Controles de Profundidad Vertical (Incidentes y Derechos de Titulares)

== Control A.3.11 — Planificación y preparación de incidentes de seguridad (PII)
- *Estado:* #status-tag("IMPLEMENTADO")
- *Justificación Profunda (Cl. 6.1.3e / Anexo B.3.11):*
  La UNSA ha reconfigurado el Procedimiento Institucional de Respuesta a Incidentes (`G4-PRC-INC-01`) para responder a las amenazas derivadas de la digitalización forzada post-pandemia. Se asignan responsabilidades operativas al equipo CSIRT-UNSA dentro de DUTIC para monitorear en tiempo real los registros del Web Application Firewall (WAF) y las conexiones remotas VPN SSL de los analistas de planillas. Se implementan canales automatizados de alerta temprana ante intentos de inyección web, denegación de servicio o anomalías de autorización en el portal `admision.unsa.edu.pe`. Conforme a la Guía B.3.11 y la Cláusula 8.1, los criterios y plazos de notificación regulatoria hacia la ANPDP y los titulares se basan estrictamente en la evaluación objetiva del riesgo residual para los derechos de las personas, ratificando la no aplicación del plazo foráneo de 72 horas del RGPD europeo (Anexo D).

== Control A.3.12 — Respuesta a incidentes de seguridad de la información
- *Estado:* #status-tag("IMPLEMENTADO")
- *Justificación Profunda (Cl. 6.1.3e / Anexo B.3.12):*
  La respuesta técnica se ejecuta de manera automatizada y estandarizada ante incidentes en plataformas web o accesos remotos. Ante la confirmación de una brecha que involucre datos personales (PII breach conforme a B.3.12 Nota 1), se aplican contenciones inmediatas: bloqueo de direcciones IP en el WAF, invalidación masiva de tokens JWT efímeros, reseteo forzoso de contraseñas de cuentas administrativas y preservación forense de registros del servidor web (Nginx) y de base de datos bajo estricta cadena de custodia digital sin reinicio de servicios. Cada incidente se asienta obligatoriamente en el Libro de Incidentes `G4-REG-INC-01` y desencadena la apertura de una Solicitud de Acción Correctiva en `G4-REG-CAPA-01` (Cláusula 10.2).

== Control A.1.2.9 — Registros relacionados con el tratamiento de PII (ROPA / RAT)
- *Estado:* #status-tag("IMPLEMENTADO")
- *Justificación Profunda (Cl. 6.1.3e / Anexo B.1.2.9):*
  El Registro de Actividades de Tratamiento (RAT / ROPA-equivalent) ha sido completamente reestructurado para documentar los flujos 100% digitales: expedientes escaneados en PDF, certificados de estudios digitalizados, fotografías para el carné universitario y cuentas de correo institucionales `@unsa.edu.pe`. Para el proceso de soporte de planillas, se inventarían los accesos remotos de operadores vía VPN y las transferencias telemáticas de dispersión bancaria hacia el Banco de la Nación. Se formaliza jurídicamente en el alcance la exclusión de los legajos de papel pasivos históricos cerrados al año 2020.

== Control A.1.3.7 — Acceso, rectificación o supresión de PII (ARCO / DSR)
- *Estado:* #status-tag("IMPLEMENTADO")
- *Justificación Profunda (Cl. 6.1.3e / Anexo B.1.3.7):*
  La Universidad ha integrado el ejercicio telemático de los derechos ARCO en su plataforma de Mesa de Partes Virtual (Sisgedo). Postulantes y trabajadores pueden solicitar el acceso a sus datos, la rectificación de información bancaria o académica inexacta, o la supresión de antecedentes no obligatorios mediante formularios web autenticados digitalmente. Se garantizan mecanismos transparentes para informar a los solicitantes sobre la base de datos involucrada y los plazos perentorios de resolución.

== Control A.1.3.10 — Tramitación y respuesta a solicitudes de titulares
- *Estado:* #status-tag("IMPLEMENTADO")
- *Justificación Profunda (Cl. 6.1.3e / Anexo B.1.3.10):*
  La gestión y resolución de solicitudes ARCO se encuentra regulada por una directiva institucional estandarizada operada por el DPO. El sistema Sisgedo asigna un código de expediente unívoco con alertas automatizadas a los 5 y 8 días hábiles, garantizando la emisión de resolución motivada firmada digitalmente dentro de los plazos legales (10 días hábiles para acceso y 5 días hábiles para rectificación o cancelación).

= Esqueleto Completo de la Declaración de Aplicabilidad

== Tabla A.1 — Controles para Responsables del Tratamiento (PII Controllers)
#table(
  columns: (55pt, 130pt, 65pt, 1fr),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, left, center, left),
  table.header([*Control*], [*Título del Control*], [*Estado*], [*Justificación de Inclusión (1 línea)*]),
  [A.1.2.2], [Identificación de finalidades], status-tag("IMPLEMENTADO"), [Finalidades digitales de inscripción y teletrabajo publicadas en la web.],
  [A.1.2.3], [Base jurídica del tratamiento], status-tag("IMPLEMENTADO"), [Cumplimiento legal universitario y relación laboral en modalidad mixta.],
  [A.1.2.4], [Determinación de consentimiento], status-tag("IMPLEMENTADO"), [Casillas de verificación obligatorias no marcadas previamente en portal web.],
  [A.1.2.5], [Obtención y registro de consentimiento], status-tag("IMPLEMENTADO"), [Trazabilidad digital con registro de dirección IP y marca de tiempo.],
  [A.1.2.6], [Evaluación de impacto de privacidad], status-tag("IMPLEMENTADO"), [EIP previa al lanzamiento del portal virtual de admisiones.],
  [A.1.2.7], [Contratos con encargados (procesadores)], status-tag("IMPLEMENTADO"), [Adendas de seguridad con proveedores de infraestructura en la nube.],
  [A.1.2.8], [Corresponsables del tratamiento], status-tag("IMPLEMENTADO"), [Convenios de interoperabilidad digital con Sunedu y RENIEC.],
  [A.1.2.9], [Registros de actividades de tratamiento], status-tag("IMPLEMENTADO"), [Inventario ROPA adaptado a procesos 100% digitales y teletrabajo.],
  [A.1.3.2], [Obligaciones con titulares de PII], status-tag("IMPLEMENTADO"), [Términos y condiciones adaptados a la Ley 29733 en entornos virtuales.],
  [A.1.3.3], [Información previa al tratamiento], status-tag("IMPLEMENTADO"), [Aviso de privacidad desplegado antes de iniciar la inscripción en línea.],
  [A.1.3.4], [Suministro de información al titular], status-tag("IMPLEMENTADO"), [Comunicaciones automáticas por correo electrónico institucional.],
  [A.1.3.5], [Modificación o revocación del consentimiento], status-tag("IMPLEMENTADO"), [Panel de usuario en portal institucional para gestionar autorizaciones.],
  [A.1.3.6], [Mecanismo de oposición al tratamiento], status-tag("IMPLEMENTADO"), [Opción web para oponerse a envíos informativos no misionales.],
  [A.1.3.7], [Acceso, rectificación o supresión (ARCO)], status-tag("IMPLEMENTADO"), [Trámite digital en línea a través de Mesa de Partes Virtual Sisgedo.],
  [A.1.3.8], [Notificación de cambios a terceros], status-tag("IMPLEMENTADO"), [Actualización en línea con sistemas del Ministerio de Economía.],
  [A.1.3.9], [Copia de PII tratada], status-tag("IMPLEMENTADO"), [Descarga directa de certificados y boletas firmadas digitalmente.],
  [A.1.3.10], [Atención de solicitudes de titulares], status-tag("IMPLEMENTADO"), [Gestión reglada y trazable mediante tickets en Sisgedo.],
  [A.1.3.11], [Decisiones individuales automatizadas], status-tag("IMPLEMENTADO"), [Auditoría de algoritmos de orden de mérito con verificación colegiada.],
  [A.1.4.2], [Limitación de la recopilación], status-tag("IMPLEMENTADO"), [Validación de formularios web que impide campos innecesarios.],
  [A.1.4.3], [Limitación del tratamiento], status-tag("IMPLEMENTADO"), [Reglas estrictas de consulta en base de datos limitadas a roles autorizados.],
  [A.1.4.4], [Exactitud y calidad de los datos], status-tag("IMPLEMENTADO"), [Validación en tiempo real contra servicio web de RENIEC.],
  [A.1.4.5], [Objetivos de minimización de PII], status-tag("IMPLEMENTADO"), [Sustitución de copias físicas de DNI por validación biométrica en línea.],
  [A.1.4.6], [Desidentificación y supresión], status-tag("IMPLEMENTADO"), [Borrado lógico y anonimización de postulantes no admitidos tras proceso.],
  [A.1.4.7], [Archivos temporales], status-tag("IMPLEMENTADO"), [Cronjobs diarios de limpieza de archivos temporales de carga en servidores.],
  [A.1.4.8], [Plazos de conservación de PII], status-tag("IMPLEMENTADO"), [Reglas automáticas de retención de base de datos según normativa AGN.],
  [A.1.4.9], [Disposición y eliminación de PII], status-tag("IMPLEMENTADO"), [Baja lógica segura con sobreescritura de sectores en almacenamiento SAN.],
  [A.1.4.10], [Controles de transmisión de PII], status-tag("IMPLEMENTADO"), [Cifrado TLS 1.3 forzoso en todas las rutas web y conexiones API.],
  [A.1.5.2], [Bases de transferencias internacionales], status-tag("IMPLEMENTADO"), [Cláusulas contractuales tipo con proveedores de nube Google Workspace.],
  [A.1.5.3], [Países y organismos destinatarios], status-tag("IMPLEMENTADO"), [Registro formal de sedes de centros de datos de nube corporativa.],
  [A.1.5.4], [Registro de transferencias de PII], status-tag("IMPLEMENTADO"), [Bitácora automatizada de interoperabilidad hacia entidades públicas.],
  [A.1.5.5], [Registro de divulgaciones a terceros], status-tag("IMPLEMENTADO"), [Registro de oficios de requerimiento judicial atendidos por Sisgedo.]
)

== Tabla A.2 — Controles para Encargados del Tratamiento (PII Processors - EXCLUIDOS)
#table(
  columns: (55pt, 130pt, 65pt, 1fr),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, left, center, left),
  table.header([*Control*], [*Título del Control*], [*Estado*], [*Justificación de Exclusión (Cl. 6.1.3e)*]),
  [A.2.2.2], [Acuerdo con el cliente], status-tag("OBSOLETO"), [Excluido: UNSA actúa exclusivamente como Responsable; no procesa PII por cuenta de clientes.],
  [A.2.2.3], [Fines de la organización], status-tag("OBSOLETO"), [Excluido: UNSA determina sus propios fines y no opera bajo instrucciones de clientes externos.],
  [A.2.2.4], [Uso para marketing / publicidad], status-tag("OBSOLETO"), [Excluido: La UNSA no recibe datos de terceros para procesamiento de publicidad o marketing.],
  [A.2.2.5], [Instrucción legalmente infractora], status-tag("OBSOLETO"), [Excluido: No aplica rol de Encargado que reciba instrucciones de clientes mandantes.],
  [A.2.2.6], [Obligaciones hacia el cliente], status-tag("OBSOLETO"), [Excluido: Inaplicable por ausencia de contratos de prestación de servicios como encargado.],
  [A.2.2.7], [Registros por cuenta de clientes], status-tag("OBSOLETO"), [Excluido: Los registros que conserva la UNSA son propios en calidad de Responsable.],
  [A.2.3.2], [Asistencia al cliente ante titulares], status-tag("OBSOLETO"), [Excluido: La UNSA atiende directamente a sus propios titulares sin intermediación de clientes.],
  [A.2.4.2], [Archivos temporales del procesador], status-tag("OBSOLETO"), [Excluido: No se procesan archivos de clientes terceros; se aplica A.1.4.7 para archivos propios.],
  [A.2.4.3], [Devolución / destrucción al cliente], status-tag("OBSOLETO"), [Excluido: La Universidad no recibe PII de clientes sujeta a devolución al término de un contrato.],
  [A.2.4.4], [Transmisión de datos del procesador], status-tag("OBSOLETO"), [Excluido: Inaplicable; la transmisión segura propia se gestiona bajo el control A.1.4.10.],
  [A.2.5.2], [Transferencias entre jurisdicciones], status-tag("OBSOLETO"), [Excluido: Inaplicable; las transferencias de la UNSA se rigen por la Tabla A.1.5.],
  [A.2.5.3], [Países destinatarios del procesador], status-tag("OBSOLETO"), [Excluido: Inaplicable por no procesar datos por cuenta de terceros como encargado.],
  [A.2.5.4], [Divulgaciones por cuenta de clientes], status-tag("OBSOLETO"), [Excluido: Inaplicable; las divulgaciones de la UNSA se gestionan conforme al control A.1.5.5.],
  [A.2.5.5], [Notificación de requerimientos al cliente], status-tag("OBSOLETO"), [Excluido: La UNSA atiende requerimientos judiciales directamente como responsable directo.],
  [A.2.5.6], [Divulgaciones legalmente vinculantes], status-tag("OBSOLETO"), [Excluido: Inaplicable; se aplica el marco general de la Tabla A.1 y A.3.],
  [A.2.5.7], [Revelación de subcontratistas], status-tag("OBSOLETO"), [Excluido: No aplica relación de cliente-procesador; proveedores se gestionan bajo A.1.2.7 y A.3.10.],
  [A.2.5.8], [Contratación de subcontratistas], status-tag("OBSOLETO"), [Excluido: Inaplicable por no operar como encargado de tratamiento.],
  [A.2.5.9], [Cambios en subcontratistas], status-tag("OBSOLETO"), [Excluido: Inaplicable por no operar como encargado de tratamiento.]
)

== Tabla A.3 — Controles de Seguridad Comunes (Responsables y Encargados)
#table(
  columns: (55pt, 130pt, 65pt, 1fr),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, left, center, left),
  table.header([*Control*], [*Título del Control*], [*Estado*], [*Justificación de Inclusión (1 línea)*]),
  [A.3.3], [Políticas de seguridad y privacidad], status-tag("IMPLEMENTADO"), [Política institucional adaptada a entornos de teletrabajo y servicios web.],
  [A.3.4], [Roles y responsabilidades de seguridad], status-tag("IMPLEMENTADO"), [Funciones asignadas para administración de portales y túneles VPN.],
  [A.3.5], [Clasificación de la información], status-tag("IMPLEMENTADO"), [Etiquetado de repositorios en la nube y bases de datos digitales.],
  [A.3.6], [Etiquetado de la información], status-tag("IMPLEMENTADO"), [Marcas de agua en documentos descargables con datos de postulantes.],
  [A.3.7], [Transferencia de información], status-tag("IMPLEMENTADO"), [Túneles VPN SSL con cifrado robusto para acceso de teletrabajo.],
  [A.3.8], [Gestión de identidades], status-tag("IMPLEMENTADO"), [Federación de identidades mediante Google Workspace institucional.],
  [A.3.9], [Derechos de acceso], status-tag("IMPLEMENTADO"), [Principio de menor privilegio en paneles de administración web.],
  [A.3.10], [Acuerdos con proveedores], status-tag("IMPLEMENTADO"), [Acuerdos SLA y de confidencialidad con proveedores de hosting y conectividad.],
  [A.3.11], [Planificación y preparación ante incidentes], status-tag("IMPLEMENTADO"), [Monitoreo SIEM de eventos web y equipo CSIRT bajo Guía B.3.11.],
  [A.3.12], [Respuesta a incidentes de seguridad], status-tag("IMPLEMENTADO"), [Parches de emergencia hotfix, revocación JWT y registro `G4-REG-INC-01`.],
  [A.3.13], [Requisitos legales y regulatorios], status-tag("IMPLEMENTADO"), [Cumplimiento con directivas de gobierno digital y privacidad en línea.],
  [A.3.14], [Protección de registros], status-tag("IMPLEMENTADO"), [Bitácoras digitales inmutables con estampado cronológico.],
  [A.3.15], [Revisión independiente de seguridad], status-tag("IMPLEMENTADO"), [Pruebas periódicas de penetración web (pentesting) por terceros.],
  [A.3.16], [Cumplimiento con políticas y normas], status-tag("IMPLEMENTADO"), [Auditorías automáticas de configuración segura en servidores Nginx.],
  [A.3.17], [Concientización, educación y formación], status-tag("IMPLEMENTADO"), [Cursos virtuales sincrónicos en Aula Virtual UNSA (`G4-CAP-INC-01`).],
  [A.3.18], [Acuerdos de confidencialidad (NDA)], status-tag("IMPLEMENTADO"), [Firma digital de compromisos de reserva para personal en teletrabajo.],
  [A.3.19], [Escritorio y pantalla limpios], status-tag("IMPLEMENTADO"), [Directiva de bloqueo automático de sesión tras 5 minutos de inactividad.],
  [A.3.20], [Gestión de soportes de almacenamiento], status-tag("IMPLEMENTADO"), [Bloqueo de puertos USB en equipos asignados para teletrabajo.],
  [A.3.21], [Disposición segura de equipos], status-tag("IMPLEMENTADO"), [Protocolo de descarte seguro de discos en servidores retirados.],
  [A.3.22], [Seguridad en dispositivos de usuario], status-tag("IMPLEMENTADO"), [Antivirus corporativo con agente EDR administrado centralmente.],
  [A.3.23], [Autenticación segura], status-tag("IMPLEMENTADO"), [Autenticación multifactor (MFA) obligatoria para acceso a VPN y sistemas clave.],
  [A.3.24], [Copias de seguridad de información], status-tag("IMPLEMENTADO"), [Snapshots diarios automáticos en almacenamiento secundario con hash SHA-256.],
  [A.3.25], [Registro de eventos (Logging)], status-tag("IMPLEMENTADO"), [Consolidación de logs de acceso web y base de datos en ElasticSearch.],
  [A.3.26], [Uso de criptografía], status-tag("IMPLEMENTADO"), [Cifrado de base de datos en reposo y certificados TLS emitidos por CA reconocida.],
  [A.3.27], [Ciclo de vida de desarrollo seguro], status-tag("IMPLEMENTADO"), [Análisis SAST con SonarQube integrado en pipeline de despliegue continuo.],
  [A.3.28], [Requisitos de seguridad en aplicaciones], status-tag("IMPLEMENTADO"), [Implementación de Web Application Firewall (WAF) contra ataques web.],
  [A.3.29], [Arquitectura e ingeniería de sistemas seguros], status-tag("IMPLEMENTADO"), [Aislamiento de servicios backend en subredes privadas sin IP pública.],
  [A.3.30], [Desarrollo externalizado], status-tag("IMPLEMENTADO"), [Revisión estricta de código y pruebas de seguridad previo a recepción de software.],
  [A.3.31], [Información de prueba], status-tag("IMPLEMENTADO"), [Generación automatizada de datos sintéticos para pruebas de desarrollo.]
)
