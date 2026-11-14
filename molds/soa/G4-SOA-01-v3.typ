#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
  title: "Declaración de Aplicabilidad del SGPI (SoA)",
  code: "G4-SOA-01",
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
      summary: "Emisión inicial de la Declaración de Aplicabilidad (SoA) para la certificación ISO/IEC 27701:2019. Alcance: Sedes Arequipa (Admisión y Planillas presenciales)."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia: Reconfiguración de controles para la virtualización integral de admisiones (admision.unsa.edu.pe), teletrabajo con VPN y exclusión de archivos físicos históricos."
    ),
    (
      version: "3.0",
      date: "2025-10-28",
      author: "Ing. Carlos M. Benítez",
      summary: "Recertificación bajo ISO/IEC 27701:2025 (segunda edición, standalone PIMS): Expansión territorial multisede integrando Filial Camaná y Filial El Pedregal (Majes), gestión MDM de terminales y enlaces IPSec."
    ),
  )
)

= Propósito y Fundamento Normativo
La presente Declaración de Aplicabilidad (SoA) constituye el documento formal exigido por la Cláusula 6.1.3.e y la Introducción del Anexo A de la norma internacional independiente *ISO/IEC 27701:2025 (Segunda edición, octubre 2025)*, reflejando el estado de implementación de controles para la UNSA, sus campus centrales y sus filiales descentralizadas.

= Determinación del Rol Institucional (Cláusula 4.1)
En aplicación de la Cláusula 4.1, la UNSA determina que actúa de manera privativa y excluyente como *Responsable del Tratamiento de Datos Personales (PII Controller)* para la totalidad de las operaciones de tratamiento en los procesos de Admisión (Arequipa y filiales) y Planillas de Remuneraciones.

#callout(title: "EXCLUSIÓN FORMAL Y FUNDADA DE LA TABLA A.2 (CLÁUSULA 6.1.3e)", color: rgb("#0284c7"))[
  Conforme a la Cláusula 6.1.3.e y la Introducción del Anexo A, la totalidad de los controles de la Tabla A.2 ("Controles para Encargados del Tratamiento / PII Processors", controles A.2.2.2 a A.2.5.9) se declaran formalmente como EXCLUIDOS, en virtud de que la UNSA no actúa como Encargado del Tratamiento para terceros.
]

= Controles de Profundidad Vertical (Incidentes y Derechos de Titulares)

== Control A.3.11 — Planificación y preparación de incidentes de seguridad (PII)
- *Estado:* #status-tag("IMPLEMENTADO")
- *Justificación Profunda (Cl. 6.1.3e / Anexo B.3.11):*
  Bajo la norma independiente ISO/IEC 27701:2025, la UNSA opera el Procedimiento de Respuesta a Incidentes `G4-PRC-INC-01` bajo un esquema multisede integrado que abarca el campus central de Arequipa y las sedes descentralizadas de Filial Camaná y Filial El Pedregal (Majes). Se definen roles locales: los coordinadores de filial actúan como primeros respondedores con facultades de aislamiento físico preliminar y reporte obligatorio en menos de 30 minutos al CSIRT-UNSA central. Se cuenta con directivas técnicas obligatorias para terminales móviles y estaciones de trabajo en filiales, exigiendo chip TPM 2.0, cifrado de disco BitLocker XTS-AES 256 forzoso y enrolamiento en la plataforma MDM (Microsoft Intune) con capacidades de bloqueo y borrado remoto de credenciales (A.3.22/A.3.26). La determinación de notificación de brechas ante la ANPDP y los titulares se fundamenta en la evaluación técnica de riesgo residual y la efectividad del cifrado conforme a la Cláusula 8.1 y la Guía B.3.12, ratificando la no aplicación del reloj de 72 horas del RGPD europeo (Anexo D).

== Control A.3.12 — Respuesta a incidentes de seguridad de la información
- *Estado:* #status-tag("IMPLEMENTADO")
- *Justificación Profunda (Cl. 6.1.3e / Anexo B.3.12):*
  El protocolo de respuesta técnica incluye procedimientos específicos para escenarios multisede: aislamiento preventivo de túneles VPN IPSec entre filiales y el centro de datos ante detección de tráfico anómalo, borrado seguro remoto inmediato de equipos móviles sustraídos en filiales y validación de hash SHA-256 en bases de datos descentralizadas. La totalidad de los incidentes se asienta en el Libro de Incidentes `G4-REG-INC-01` (y su generador scriptado Bun `generate.ts`) conservando los campos obligatorios de la Guía B.3.12 (descripción, período de tiempo, nombre del reportero, persona reportada, medidas de resolución y datos recuperados). Todo incidente categorizado como medio, alto o crítico alimenta automáticamente la apertura de acciones correctivas en el registro `G4-REG-CAPA-01` bajo la Cláusula 10.2.

== Control A.1.2.9 — Registros relacionados con el tratamiento de PII (ROPA / RAT)
- *Estado:* #status-tag("IMPLEMENTADO")
- *Justificación Profunda (Cl. 6.1.3e / Anexo B.1.2.9):*
  El inventario consolidado del Registro de Actividades de Tratamiento (RAT / ROPA-equivalent) incorpora la totalidad de tratamientos desarrollados en el campus central y las filiales regionales. En Admisión: inscripción web, toma de huella dactilar y fotografía en Camaná y Majes, y publicación de listas de ingresantes. En Planillas: gestión de cuentas bancarias descentralizadas de docentes y administrativos de filiales, retenciones tributarias (Sunat) y transferencias bancarias mediante el Sistema Integrado de Administración Financiera (SIAF-SP). Se detallan para cada actividad las bases legales estatutarias (Ley 30220), los plazos de conservación según tablas de retención aprobadas y las salvaguardas de cifrado aplicadas.

== Control A.1.3.7 — Acceso, rectificación o supresión de PII (ARCO / DSR)
- *Estado:* #status-tag("IMPLEMENTADO")
- *Justificación Profunda (Cl. 6.1.3e / Anexo B.1.3.7):*
  Se garantiza a los titulares de datos personales (postulantes y trabajadores de Arequipa, Camaná y Majes) el ejercicio accesible y equitativo de los derechos ARCO reconocidos en la Ley 29733 e ISO 27701. Se habilitan módulos presenciales de atención en las coordinaciones de Filial Camaná y Filial El Pedregal, integrados electrónicamente a la Mesa de Partes Central mediante el sistema Sisgedo. El procedimiento prohíbe exigir requisitos adicionales gravosos y garantiza canales telemáticos para postulantes de zonas rurales.

== Control A.1.3.10 — Tramitación y respuesta a solicitudes de titulares
- *Estado:* #status-tag("IMPLEMENTADO")
- *Justificación Profunda (Cl. 6.1.3e / Anexo B.1.3.10):*
  La tramitación de solicitudes de titulares opera bajo supervisión directa del Oficial de Seguridad de la Información (DPO). Se implementa un protocolo estricto de autenticación fehaciente de la identidad del solicitante para evitar suplantaciones previo a la entrega de copias de PII (Control A.1.3.9). Los plazos de ley (10 días hábiles para acceso y 5 días hábiles para rectificación, cancelación u oposición) son monitoreados mediante semáforos en Sisgedo, emitiéndose resoluciones rectorales o directales motivadas con firma digital con valor legal pleno.

= Esqueleto Completo de la Declaración de Aplicabilidad

== Tabla A.1 — Controles para Responsables del Tratamiento (PII Controllers)
#table(
  columns: (55pt, 130pt, 65pt, 1fr),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, left, center, left),
  table.header([*Control*], [*Título del Control*], [*Estado*], [*Justificación de Inclusión (1 línea)*]),
  [A.1.2.2], [Identificación de finalidades], status-tag("IMPLEMENTADO"), [Finalidades aprobadas por Consejo Universitario para admisiones central y filiales.],
  [A.1.2.3], [Base jurídica del tratamiento], status-tag("IMPLEMENTADO"), [Cumplimiento de la Ley 30220 y estatuto institucional en todas las sedes.],
  [A.1.2.4], [Determinación de consentimiento], status-tag("IMPLEMENTADO"), [Mecanismos de consentimiento informado en plataforma virtual y módulos de filial.],
  [A.1.2.5], [Obtención y registro de consentimiento], status-tag("IMPLEMENTADO"), [Custodia centralizada digital con firma electrónica y sellado de tiempo.],
  [A.1.2.6], [Evaluación de impacto de privacidad], status-tag("IMPLEMENTADO"), [EIP específica conducida previa a la apertura de las filiales Camaná y Majes.],
  [A.1.2.7], [Contratos con encargados (procesadores)], status-tag("IMPLEMENTADO"), [Cláusulas contractuales de privacidad con proveedores de conectividad y nube.],
  [A.1.2.8], [Corresponsables del tratamiento], status-tag("IMPLEMENTADO"), [Convenios de interoperabilidad con Reniec, Sunedu y Banco de la Nación.],
  [A.1.2.9], [Registros de actividades de tratamiento], status-tag("IMPLEMENTADO"), [Registro profundo RAT/ROPA consolidado abarcando Arequipa y filiales regionales.],
  [A.1.3.2], [Obligaciones con titulares de PII], status-tag("IMPLEMENTADO"), [Cumplimiento de principios de la Ley 29733 en todas las dependencias.],
  [A.1.3.3], [Información previa al tratamiento], status-tag("IMPLEMENTADO"), [Cartillas y avisos de privacidad visibles en portales y sedes descentralizadas.],
  [A.1.3.4], [Suministro de información al titular], status-tag("IMPLEMENTADO"), [Notificaciones automáticas en trámite de inscripción y boletas mensuales.],
  [A.1.3.5], [Modificación o revocación del consentimiento], status-tag("IMPLEMENTADO"), [Procedimiento reglado en línea y presencial para retiro de consentimientos.],
  [A.1.3.6], [Mecanismo de oposición al tratamiento], status-tag("IMPLEMENTADO"), [Canal formal para formular oposición justificada ante tratamientos facultativos.],
  [A.1.3.7], [Acceso, rectificación o supresión (ARCO)], status-tag("IMPLEMENTADO"), [Atención integral de derechos ARCO en sedes Arequipa, Camaná y Majes.],
  [A.1.3.8], [Notificación de cambios a terceros], status-tag("IMPLEMENTADO"), [Sincronización de rectificaciones de datos con MEF y entidades previsionales.],
  [A.1.3.9], [Copia de PII tratada], status-tag("IMPLEMENTADO"), [Expedición gratuita de copias de datos personales a petición fehaciente del titular.],
  [A.1.3.10], [Atención de solicitudes de titulares], status-tag("IMPLEMENTADO"), [Gestión y respuesta documentada en Sisgedo bajo control del DPO.],
  [A.1.3.11], [Decisiones individuales automatizadas], status-tag("IMPLEMENTADO"), [Procesamiento con supervisión humana y auditoría colegiada de resultados.],
  [A.1.4.2], [Limitación de la recopilación], status-tag("IMPLEMENTADO"), [Recolección de datos estrictamente proporcional a las carreras de cada filial.],
  [A.1.4.3], [Limitación del tratamiento], status-tag("IMPLEMENTADO"), [Tratamiento circunscrito a la gestión académica y laboral universitaria.],
  [A.1.4.4], [Exactitud y calidad de los datos], status-tag("IMPLEMENTADO"), [Revalidación anual de legajos y consulta en tiempo real a servicios oficiales.],
  [A.1.4.5], [Objetivos de minimización de PII], status-tag("IMPLEMENTADO"), [Eliminación de copias físicas redundantes mediante archivo digital seguro.],
  [A.1.4.6], [Desidentificación y supresión], status-tag("IMPLEMENTADO"), [Anonimización de datos de postulantes tras la culminación del ciclo académico.],
  [A.1.4.7], [Archivos temporales], status-tag("IMPLEMENTADO"), [Políticas automáticas de borrado de archivos temporales en laptops y servidores.],
  [A.1.4.8], [Plazos de conservación de PII], status-tag("IMPLEMENTADO"), [Tablas de retención documental formalizadas ante el Comité de Archivo Central.],
  [A.1.4.9], [Disposición y eliminación de PII], status-tag("IMPLEMENTADO"), [Destrucción física y lógica certificada conforme a directivas de AGN y DUTIC.],
  [A.1.4.10], [Controles de transmisión de PII], status-tag("IMPLEMENTADO"), [Túneles VPN IPSec sitio a sitio con cifrado robusto entre Arequipa y filiales.],
  [A.1.5.2], [Bases de transferencias internacionales], status-tag("IMPLEMENTADO"), [Garantías contractuales estándar con proveedores de servicios en la nube.],
  [A.1.5.3], [Países y organismos destinatarios], status-tag("IMPLEMENTADO"), [Mapeo de jurisdicciones extranjeras donde operan los servidores de respaldo.],
  [A.1.5.4], [Registro de transferencias de PII], status-tag("IMPLEMENTADO"), [Bitácora formal de lotes de información transferidos a entidades del Estado.],
  [A.1.5.5], [Registro de divulgaciones a terceros], status-tag("IMPLEMENTADO"), [Control unificado de requerimientos judiciales y administrativos en Sisgedo.]
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
  [A.3.3], [Políticas de seguridad y privacidad], status-tag("IMPLEMENTADO"), [Política institucional `G4-POL-01` de alcance multisede aprobada por Rectorado.],
  [A.3.4], [Roles y responsabilidades de seguridad], status-tag("IMPLEMENTADO"), [Asignación formal a coordinadores de filial y comités de privacidad locales.],
  [A.3.5], [Clasificación de la información], status-tag("IMPLEMENTADO"), [Esquema estandarizado de clasificación aplicado en campus Arequipa y filiales.],
  [A.3.6], [Etiquetado de la información], status-tag("IMPLEMENTADO"), [Etiquetado digital y físico de expedientes en todas las dependencias.],
  [A.3.7], [Transferencia de información], status-tag("IMPLEMENTADO"), [Túneles VPN IPSec encriptados para sincronización intersedes y doble firma.],
  [A.3.8], [Gestión de identidades], status-tag("IMPLEMENTADO"), [Directorio corporativo unificado con cuentas institucionales `@unsa.edu.pe`.],
  [A.3.9], [Derechos de acceso], status-tag("IMPLEMENTADO"), [Asignación de perfiles RBAC estrictos y revisión trimestral de accesos.],
  [A.3.10], [Acuerdos con proveedores], status-tag("IMPLEMENTADO"), [Auditoría periódica de cumplimiento de cláusulas de privacidad en contratos.],
  [A.3.11], [Planificación y preparación ante incidentes], status-tag("IMPLEMENTADO"), [Procedimiento multisede `G4-PRC-INC-01` y equipo CSIRT bajo Guía B.3.11.],
  [A.3.12], [Respuesta a incidentes de seguridad], status-tag("IMPLEMENTADO"), [Protocolos de contingencia local en filiales, registro `G4-REG-INC-01` y CAPA.],
  [A.3.13], [Requisitos legales y regulatorios], status-tag("IMPLEMENTADO"), [Monitoreo continuo de cambios legislativos en protección de datos personales.],
  [A.3.14], [Protección de registros], status-tag("IMPLEMENTADO"), [Almacenamiento seguro WORM de bitácoras y registros de admisión en DUTIC.],
  [A.3.15], [Revisión independiente de seguridad], status-tag("IMPLEMENTADO"), [Auditorías periódicas de certificación externa por entidad internacional.],
  [A.3.16], [Cumplimiento con políticas y normas], status-tag("IMPLEMENTADO"), [Programa permanente de auditoría interna bajo directrices ISO 19011:2026.],
  [A.3.17], [Concientización, educación y formación], status-tag("IMPLEMENTADO"), [Capacitación multisede obligatoria `G4-CAP-INC-01` con registro `G4-REG-CAP-01`.],
  [A.3.18], [Acuerdos de confidencialidad (NDA)], status-tag("IMPLEMENTADO"), [Acuerdos de reserva firmados por todo el personal de Arequipa y filiales.],
  [A.3.19], [Escritorio y pantalla limpios], status-tag("IMPLEMENTADO"), [Inspecciones físicas inopinadas de escritorio y pantalla limpia en sedes.],
  [A.3.20], [Gestión de soportes de almacenamiento], status-tag("IMPLEMENTADO"), [Control centralizado y registro de medios de almacenamiento extraíbles.],
  [A.3.21], [Disposición segura de equipos], status-tag("IMPLEMENTADO"), [Desmagnetización y destrucción física de soportes magnéticos obsoletos.],
  [A.3.22], [Seguridad en dispositivos de usuario], status-tag("IMPLEMENTADO"), [Enrolamiento en MDM Microsoft Intune con políticas GPO y EDR activo.],
  [A.3.23], [Autenticación segura], status-tag("IMPLEMENTADO"), [MFA forzoso en todas las aplicaciones web, VPN y correo institucional.],
  [A.3.24], [Copias de seguridad de información], status-tag("IMPLEMENTADO"), [Estrategia 3-2-1 con copias locales y réplica cifrada en nube híbrida.],
  [A.3.25], [Registro de eventos (Logging)], status-tag("IMPLEMENTADO"), [Plataforma SIEM centralizada correlacionando eventos de todas las sedes.],
  [A.3.26], [Uso de criptografía], status-tag("IMPLEMENTADO"), [BitLocker XTS-AES 256 en laptops de filial y cifrado TLS 1.3 en tránsito.],
  [A.3.27], [Ciclo de vida de desarrollo seguro], status-tag("IMPLEMENTADO"), [Pruebas DAST y SAST automatizadas en el ciclo de vida del software.],
  [A.3.28], [Requisitos de seguridad en aplicaciones], status-tag("IMPLEMENTADO"), [Filtros perimetrales WAF e inspección de correo DMARC/SPF/DKIM.],
  [A.3.29], [Arquitectura e ingeniería de sistemas seguros], status-tag("IMPLEMENTADO"), [Arquitectura Zero Trust para accesos inter-sedes y segmentación de red.],
  [A.3.30], [Desarrollo externalizado], status-tag("IMPLEMENTADO"), [Supervisión de código fuente y pruebas de aceptación de seguridad por DUTIC.],
  [A.3.31], [Información de prueba], status-tag("IMPLEMENTADO"), [Protocolo obligatorio de anonimización previo al uso de datos en entornos QA.]
)
