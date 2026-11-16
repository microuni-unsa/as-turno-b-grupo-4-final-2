// mold.typ — Molde parametrizado para la Declaración de Aplicabilidad (SoA)
// Artefacto: G4-SOA-01 (v1, v2, v3)
// Sistema de Gestión de Privacidad de la Información (SGPI) — ISO/IEC 27701:2025
// Cumple con el Contrato de Anatomía Documental de 15 Elementos y Cláusula 6.1.3.e

#import "../common/template.typ": doc-template, status-tag, rag-tag, callout, reference-docs, signature-block

#let get-deep-a311(era) = {
  if era == "v1" [
    La institución ha establecido y formalizado el Procedimiento Institucional de Respuesta a Incidentes de Privacidad (`G4-PRC-INC-01`), definiendo el Equipo de Respuesta CSIRT bajo la coordinación del Oficial de Seguridad de la Información (DPO). Se establecen canales formales para el reporte rápido (primeros 60 minutos), roles institucionales en admisiones y planillas, y directrices para registrar eventos y brechas en `G4-REG-INC-01`. Los umbrales de notificación hacia la autoridad administrativa (ANPD) y los titulares se rigen por la evaluación objetiva de impacto institucional y riesgo para los derechos fundamentales (Cláusula 8.1 / Guía B.3.12), sin sujeción a la regla de 72 horas del RGPD europeo.
  ] else if era == "v2" [
    Se ha reconfigurado el Procedimiento Institucional de Respuesta a Incidentes (`G4-PRC-INC-01`) para responder a las amenazas derivadas de la digitalización post-pandemia. Se asignan responsabilidades operativas al equipo CSIRT dentro de DUTIC para monitorear en tiempo real los registros del Web Application Firewall (WAF) y las conexiones remotas VPN SSL de los analistas de planillas. Se implementan canales automatizados de alerta temprana ante intentos de inyección web, denegación de servicio o anomalías de autorización en el portal `admision.unsa.edu.pe`. Conforme a la Guía B.3.11 y la Cláusula 8.1, los criterios y plazos de notificación regulatoria hacia la ANPD y los titulares se basan estrictamente en la evaluación objetiva del riesgo residual para los derechos de las personas, ratificando la no aplicación del plazo foráneo de 72 horas del RGPD europeo (Anexo D).
  ] else [
    Bajo la norma independiente ISO/IEC 27701:2025, la institución opera el Procedimiento de Respuesta a Incidentes `G4-PRC-INC-01` bajo un esquema multisede integrado que abarca el campus central y las sedes descentralizadas de Filial Camaná y Filial El Pedregal (Majes). Se definen roles locales: los coordinadores de filial actúan como primeros respondedores con facultades de aislamiento físico preliminar y reporte obligatorio en menos de 30 minutos al CSIRT central. Se cuenta con directivas técnicas obligatorias para terminales móviles y estaciones de trabajo en filiales, exigiendo chip TPM 2.0, cifrado de disco BitLocker XTS-AES 256 forzoso y enrolamiento en la plataforma MDM (Microsoft Intune) con capacidades de bloqueo y borrado remoto de credenciales (A.3.22/A.3.26). La determinación de notificación de brechas ante la ANPD y los titulares se fundamenta en la evaluación técnica de riesgo residual y la efectividad del cifrado conforme a la Cláusula 8.1 y la Guía B.3.12, ratificando la no aplicación del reloj de 72 horas del RGPD europeo (Anexo D).
  ]
}

#let get-deep-a312(era) = {
  if era == "v1" [
    La respuesta operativa se ejecuta de manera protocolizada ante la confirmación de una brecha que involucre PII. El procedimiento incluye contención inmediata (trituración física de listas impresas, desconexión de red o revocación de accesos), preservación forense de evidencias bajo cadena de custodia documentada, evaluación de daño y apertura mandatoria de acciones correctivas en `G4-REG-CAPA-01` bajo la Cláusula 10.2. Se mantiene un libro histórico de incidentes para fines de auditoría y análisis de causa raíz.
  ] else if era == "v2" [
    La respuesta técnica se ejecuta de manera automatizada y estandarizada ante incidentes en plataformas web o accesos remotos. Ante la confirmación de una brecha que involucre datos personales (PII breach conforme a B.3.12 Nota 1), se aplican contenciones inmediatas: bloqueo de direcciones IP en el WAF, invalidación masiva de tokens JWT efímeros, reseteo forzoso de contraseñas de cuentas administrativas y preservación forense de registros del servidor web (Nginx) y de base de datos bajo estricta cadena de custodia digital sin reinicio de servicios. Cada incidente se asienta obligatoriamente en el Libro de Incidentes `G4-REG-INC-01` y desencadena la apertura de una Solicitud de Acción Correctiva en `G4-REG-CAPA-01` (Cláusula 10.2).
  ] else [
    El protocolo de respuesta técnica incluye procedimientos específicos para escenarios multisede: aislamiento preventivo de túneles VPN IPSec entre filiales y el centro de datos ante detección de tráfico anómalo, borrado seguro remoto inmediato de equipos móviles sustraídos en filiales y validación de hash SHA-256 en bases de datos descentralizadas. La totalidad de los incidentes se asienta en el Libro de Incidentes `G4-REG-INC-01` (y su generador scriptado Bun `generate.ts`) conservando los campos obligatorios de la Guía B.3.12 (descripción, período de tiempo, nombre del reportero, persona reportada, medidas de resolución y datos recuperados). Todo incidente categorizado como medio, alto o crítico alimenta automáticamente la apertura de acciones correctivas en el registro `G4-REG-CAPA-01` bajo la Cláusula 10.2.
  ]
}

#let get-deep-a129(era) = {
  if era == "v1" [
    La Universidad ha construido y mantiene actualizado el Registro de Actividades de Tratamiento (RAT / ROPA-equivalent) para los procesos de Admisión y Planillas. El registro documenta para cada flujo: identidad y contacto del responsable, categorías de titulares (postulantes, docentes, personal administrativo), tipos de datos personales y sensibles (biométricos, salariales, de salud ocupacional), finalidades estatutarias, base de legalidad (Ley Universitaria 30220 y consentimiento informado), destinatarios de transferencias legítimas (Sunedu, MEF, Essalud) y plazos obligatorios de retención conforme al marco archivístico nacional.
  ] else if era == "v2" [
    El Registro de Actividades de Tratamiento (RAT / ROPA-equivalent) ha sido reestructurado para documentar los flujos 100% digitales: expedientes escaneados en PDF, certificados de estudios digitalizados, fotografías para el carné universitario y cuentas de correo institucionales. Para el proceso de soporte de planillas, se inventarían los accesos remotos de operadores vía VPN y las transferencias telemáticas de dispersión bancaria hacia entidades financieras. Se formaliza jurídicamente en el alcance la exclusión de los legajos de papel pasivos históricos cerrados al año 2020.
  ] else [
    El inventario consolidado del Registro de Actividades de Tratamiento (RAT / ROPA-equivalent) incorpora la totalidad de tratamientos desarrollados en el campus central y las filiales regionales. En Admisión: inscripción web, toma de huella dactilar y fotografía en Camaná y Majes, y publicación de listas de ingresantes. En Planillas: gestión de cuentas bancarias descentralizadas de docentes y administrativos de filiales, retenciones tributarias (Sunat) y transferencias bancarias mediante el Sistema Integrado de Administración Financiera (SIAF-SP). Se detallan para cada actividad las bases legales estatutarias (Ley 30220), los plazos de conservación según tablas de retención aprobadas y las salvaguardas de cifrado aplicadas.
  ]
}

#let get-deep-a137(era) = {
  if era == "v1" [
    Se dispone de directivas y formularios accesibles para garantizar el ejercicio efectivo de los derechos ARCO (Acceso, Rectificación, Cancelación y Oposición) reconocidos en la Ley 29733 y el estándar ISO 27701. Postulantes y colaboradores pueden ingresar sus peticiones presencialmente en Mesa de Partes Central o mediante el sistema de gestión documentaria Sisgedo. El procedimiento define plazos máximos perentorios de atención y los supuestos excepcionales de improcedencia legal (ej. conservación obligatoria de registros de notas por mandato universitario).
  ] else if era == "v2" [
    La Universidad ha integrado el ejercicio telemático de los derechos ARCO en su plataforma de Mesa de Partes Virtual (Sisgedo). Postulantes y trabajadores pueden solicitar el acceso a sus datos, la rectificación de información bancaria o académica inexacta, o la supresión de antecedentes no obligatorios mediante formularios web autenticados digitalmente. Se garantizan mecanismos transparentes para informar a los solicitantes sobre la base de datos involucrada y los plazos perentorios de resolución.
  ] else [
    Se garantiza a los titulares de datos personales (postulantes y trabajadores de Arequipa, Camaná y Majes) el ejercicio accesible y equitativo de los derechos ARCO reconocidos en la Ley 29733 e ISO 27701. Se habilitan módulos presenciales de atención en las coordinaciones de Filial Camaná y Filial El Pedregal, integrados electrónicamente a la Mesa de Partes Central mediante el sistema Sisgedo. El procedimiento prohíbe exigir requisitos adicionales gravosos y garantiza canales telemáticos para postulantes de zonas rurales.
  ]
}

#let get-deep-a1310(era) = {
  if era == "v1" [
    La Oficina de Seguridad y Privacidad (OSI/DPO) es la unidad responsable de instruir la atención de solicitudes de titulares. Se aplica verificación rigurosa de identidad del solicitante previo a la entrega de copias de PII (Control A.1.3.9), se realiza seguimiento en Sisgedo y se emite pronunciamiento fundado en un plazo no mayor a 10 días hábiles para acceso y 5 días para rectificación o supresión.
  ] else if era == "v2" [
    La gestión y resolución de solicitudes ARCO se encuentra regulada por una directiva institucional estandarizada operada por el DPO. El sistema Sisgedo asigna un código de expediente unívoco con alertas automatizadas a los 5 y 8 días hábiles, garantizando la emisión de resolución motivada firmada digitalmente dentro de los plazos legales (10 días hábiles para acceso y 5 días hábiles para rectificación o cancelación).
  ] else [
    La tramitación de solicitudes de titulares opera bajo supervisión directa del Oficial de Seguridad de la Información (DPO). Se implementa un protocolo estricto de autenticación fehaciente de la identidad del solicitante para evitar suplantaciones previo a la entrega de copias de PII (Control A.1.3.9). Los plazos de ley (10 días hábiles para acceso y 5 días hábiles para rectificación, cancelación u oposición) son monitoreados mediante semáforos en Sisgedo, emitiéndose resoluciones rectorales o directales motivadas con firma digital con valor legal pleno.
  ]
}

#let get-a1-table(era) = {
  let j-fines = if era == "v1" { "Las finalidades de admisión y nómina están documentadas en bases de concurso y directivas." } else if era == "v2" { "Finalidades digitales de inscripción y teletrabajo publicadas en la web institucional." } else { "Finalidades aprobadas por Consejo Universitario para admisiones central y filiales descentralizadas." }
  let j-base = if era == "v1" { "Tratamiento sustentado en Ley Universitaria 30220, relación contractual laboral y consentimiento." } else if era == "v2" { "Cumplimiento legal universitario y relación laboral en modalidad mixta o presencial." } else { "Cumplimiento de la Ley 30220 y estatuto institucional en sedes centrales y filiales regionales." }
  let j-cons-det = if era == "v1" { "Formularios de inscripción y contratos incluyen cláusulas explícitas de consentimiento informado." } else if era == "v2" { "Casillas de verificación obligatorias no marcadas previamente en portal web de admisión." } else { "Mecanismos de consentimiento informado en plataforma virtual y módulos presenciales de filial." }
  let j-cons-rec = if era == "v1" { "Custodia de consentimientos firmados física y digitalmente en legajos de admisión y RRHH." } else if era == "v2" { "Trazabilidad digital con registro de dirección IP y marca de tiempo en base de datos." } else { "Custodia centralizada digital con firma electrónica y sellado de tiempo de auditoría." }
  let j-pia = if era == "v1" { "EIP conducidas previo a modificaciones significativas en el procesamiento biométrico." } else if era == "v2" { "EIP previa al lanzamiento del portal virtual de admisiones e inscripciones online." } else { "EIP específica conducida previa a la apertura de las filiales Camaná y Majes." }
  let j-proc = if era == "v1" { "Contratos con proveedores de software o servicios externos incluyen cláusulas de privacidad." } else if era == "v2" { "Adendas de seguridad y confidencialidad con proveedores de infraestructura en la nube." } else { "Cláusulas contractuales de privacidad con proveedores de conectividad, telecomunicaciones y nube." }
  let j-joint = if era == "v1" { "Acuerdos interinstitucionales formales con Sunedu y MEF definen responsabilidades compartidas." } else if era == "v2" { "Convenios de interoperabilidad digital con Sunedu, RENIEC y bancos pagadores." } else { "Convenios de interoperabilidad con Reniec, Sunedu y Banco de la Nación para filiales." }
  let j-ropa = if era == "v1" { "Registro profundo ROPA/RAT documentado en inventario de tratamiento de datos personales." } else if era == "v2" { "Inventario ROPA adaptado a procesos 100% digitales y teletrabajo de personal." } else { "Registro profundo RAT/ROPA consolidado abarcando Arequipa y filiales regionales." }
  let j-obl = if era == "v1" { "Mapeo y cumplimiento de directivas legales peruanas de protección de datos personales." } else if era == "v2" { "Términos y condiciones adaptados a la Ley 29733 en entornos virtuales universitarios." } else { "Cumplimiento de principios de la Ley 29733 en todas las dependencias y filiales." }
  let j-info-prev = if era == "v1" { "Políticas de privacidad visibles en ventanillas de admisión y fichas de matrícula." } else if era == "v2" { "Aviso de privacidad desplegado en portada del portal admision.unsa.edu.pe." } else { "Cartillas y avisos de privacidad visibles en portales y sedes descentralizadas de filiales." }
  let j-info-sum = if era == "v1" { "Cláusulas informativas sobre identidad del responsable y finalidad del tratamiento." } else if era == "v2" { "Información accesible sobre derechos del titular en todas las pantallas de captura." } else { "Avisos unificados de privacidad multisede con canales de contacto directos con el DPO." }
  let j-mod-cons = if era == "v1" { "Canal formal para revocar consentimiento para finalidades no obligatorias." } else if era == "v2" { "Formulario en línea para gestionar preferencias de comunicación institucional." } else { "Mecanismo digital y presencial en filiales para modificar o revocar consentimientos facultativos." }
  let j-obj-proc = if era == "v1" { "Mecanismo expedito para manifestar oposición ante tratamientos basados en interés legítimo." } else if era == "v2" { "Opción de baja automatizada en comunicaciones informativas no esenciales." } else { "Procedimiento formal para atender oposiciones fundamentadas en el sistema Sisgedo." }
  let j-arco = if era == "v1" { "Directiva de atención de derechos ARCO con plazos y formatos estandarizados." } else if era == "v2" { "Mesa de Partes Virtual con formulario especializado para derechos ARCO." } else { "Módulos de atención ARCO en filiales regionales integrados telemáticamente a Mesa de Partes." }
  let j-notif-3rd = if era == "v1" { "Protocolo para comunicar rectificaciones a entidades receptoras de datos de personal." } else if era == "v2" { "Canales telemáticos para notificar rectificaciones de datos a Reniec y Sunedu." } else { "Notificación protocolizada de actualizaciones de datos a entidades bancarias y de supervisión." }
  let j-copy = if era == "v1" { "Entrega certificada de constancias de notas, boletas o padrones a petición de parte." } else if era == "v2" { "Descarga segura de constancias y boletas firmadas digitalmente desde el portal." } else { "Emisión de copias electrónicas autenticadas de expedientes y registros académicos." }
  let j-req = if era == "v1" { "Procedimiento reglado con registro de trazabilidad en el sistema Sisgedo." } else if era == "v2" { "Seguimiento automatizado de solicitudes con alertas de vencimiento en Sisgedo." } else { "Supervisión directa del DPO sobre la atención de peticiones en los plazos legales peruanos." }
  let j-auto-dec = if era == "v1" { "La calificación de exámenes de admisión cuenta con auditoría y revisión humana de reclamos." } else if era == "v2" { "Procesamiento algorítmico de puntajes sujeto a validación por comisión veedora docente." } else { "Auditoría algorítmica independiente del procesamiento de resultados de admisión multisede." }
  let j-lim-coll = if era == "v1" { "Solo se recaban datos estrictamente indispensables para la matrícula o liquidación salarial." } else if era == "v2" { "Eliminación de campos innecesarios en formularios web de registro de postulantes." } else { "Principio de necesidad aplicado estrictamente en fichas de inscripción central y filiales." }
  let j-lim-proc = if era == "v1" { "Prohibición estricta de utilizar datos de postulantes o nóminas para fines de marketing o lucro." } else if era == "v2" { "Restricción de acceso a datos solo para fines directamente autorizados por ley." } else { "Gobernanza de datos que prohíbe el uso secundario de PII sin nuevo consentimiento o base legal." }
  let j-acc-qual = if era == "v1" { "Campañas periódicas de actualización de datos de personal y validación RENIEC." } else if era == "v2" { "Validación en tiempo real de DNI mediante servicio web de interoperabilidad." } else { "Reconciliación semestral de legajos de personal y padrones de filiales con bases oficiales." }
  let j-min-obj = if era == "v1" { "Eliminación de campos innecesarios en las fichas de inscripción de postulantes." } else if era == "v2" { "Políticas de minimización que restringen la recolección de datos sensibles a lo indispensable." } else { "Objetivos institucionales de minimización auditados anualmente por el Comité SGPI." }
  let j-deid = if era == "v1" { "Disociación estadística de resultados académicos para estudios de investigación pedagógica." } else if era == "v2" { "Seudonimización de identificadores en reportes estadísticos y tableros analíticos." } else { "Anonimización irreversible de series históricas de admisión con fines de investigación científica." }
  let j-temp = if era == "v1" { "Purga automática de archivos temporales de carga y escaneos de expedientes a los 30 días." } else if era == "v2" { "Scripts programados para borrado seguro de cachés y cargas web temporales a las 24 horas." } else { "Eliminación segura inmediata de archivos temporales en servidores de admisión y terminales móviles." }
  let j-ret = if era == "v1" { "Tabla de retención documental alineada a las normas del Archivo General de la Nación." } else if era == "v2" { "Calendario de conservación digital aprobado para registros académicos y laborales." } else { "Cronograma de retención multisede con plazos perentorios y custodia de series esenciales." }
  let j-disp = if era == "v1" { "Protocolos de baja y destrucción física certificada con trituradoras de microcorte." } else if era == "v2" { "Descarte seguro de soportes ópticos y magnéticos obsoletos con certificado de destrucción." } else { "Protocolos de baja segura de terminales y destrucción certificada de documentos en filiales." }
  let j-trans = if era == "v1" { "Uso de protocolos seguros (HTTPS, TLS 1.3) y cifrado en transferencias de nómina a bancos." } else if era == "v2" { "Cifrado obligatorio en tránsito para todas las comunicaciones web y conexiones VPN." } else { "Canales VPN IPSec IKEv2 y TLS 1.3 forzoso para transferencias de datos entre filiales y sede." }
  let j-trans-basis = if era == "v1" { "Contratos de adhesión a servicios en la nube con cláusulas contractuales tipo." } else if era == "v2" { "Bases jurídicas verificadas para servicios de correo institucional en la nube." } else { "Contratos marco con salvaguardas de transferencia internacional para nube educativa." }
  let j-trans-ctry = if era == "v1" { "Inventario de proveedores en la nube y centros de datos en el extranjero." } else if era == "v2" { "Registro formal de jurisdicciones internacionales donde operan los servidores en la nube." } else { "Documentación formal de ubicaciones de centros de datos en cumplimiento de la Ley 29733." }
  let j-rec-trans = if era == "v1" { "Bitácora formal de lotes de información remitidos al MEF, Sunedu y bancos." } else if era == "v2" { "Registro telemático de transferencias masivas a entidades de supervisión gubernamental." } else { "Trazabilidad completa de transferencias interinstitucionales con hash de integridad." }
  let j-rec-disc = if era == "v1" { "Control de oficios de requerimiento judicial o policial atendidos por la Asesoría Legal." } else if era == "v2" { "Registro centralizado de requerimientos de información emitidos por autoridades competentes." } else { "Bitácora de divulgaciones legales obligatorias bajo custodia de la Oficina de Asesoría Legal." }

  (
    ("A.1.2.2", "Identificación de finalidades", j-fines),
    ("A.1.2.3", "Base jurídica del tratamiento", j-base),
    ("A.1.2.4", "Determinación de consentimiento", j-cons-det),
    ("A.1.2.5", "Obtención y registro de consentimiento", j-cons-rec),
    ("A.1.2.6", "Evaluación de impacto de privacidad", j-pia),
    ("A.1.2.7", "Contratos con encargados (procesadores)", j-proc),
    ("A.1.2.8", "Corresponsables del tratamiento", j-joint),
    ("A.1.2.9", "Registros de actividades de tratamiento", j-ropa),
    ("A.1.3.2", "Obligaciones con titulares de PII", j-obl),
    ("A.1.3.3", "Información previa al tratamiento", j-info-prev),
    ("A.1.3.4", "Suministro de información al titular", j-info-sum),
    ("A.1.3.5", "Modificación o revocación del consentimiento", j-mod-cons),
    ("A.1.3.6", "Mecanismo de oposición al tratamiento", j-obj-proc),
    ("A.1.3.7", "Acceso, rectificación o supresión (ARCO)", j-arco),
    ("A.1.3.8", "Notificación de cambios a terceros", j-notif-3rd),
    ("A.1.3.9", "Copia de PII tratada", j-copy),
    ("A.1.3.10", "Atención de solicitudes de titulares", j-req),
    ("A.1.3.11", "Decisiones individuales automatizadas", j-auto-dec),
    ("A.1.4.2", "Limitación de la recopilación", j-lim-coll),
    ("A.1.4.3", "Limitación del tratamiento", j-lim-proc),
    ("A.1.4.4", "Exactitud y calidad de los datos", j-acc-qual),
    ("A.1.4.5", "Objetivos de minimización de PII", j-min-obj),
    ("A.1.4.6", "Desidentificación y supresión", j-deid),
    ("A.1.4.7", "Archivos temporales", j-temp),
    ("A.1.4.8", "Plazos de conservación de PII", j-ret),
    ("A.1.4.9", "Disposición y eliminación de PII", j-disp),
    ("A.1.4.10", "Controles de transmisión de PII", j-trans),
    ("A.1.5.2", "Bases de transferencias internacionales", j-trans-basis),
    ("A.1.5.3", "Países y organismos destinatarios", j-trans-ctry),
    ("A.1.5.4", "Registro de transferencias de PII", j-rec-trans),
    ("A.1.5.5", "Registro de divulgaciones a terceros", j-rec-disc),
  )
}

#let get-a2-table() = {
  (
    ("A.2.2.2", "Acuerdo con el cliente", "Excluido: La entidad actúa exclusivamente como Responsable; no procesa PII por cuenta de clientes."),
    ("A.2.2.3", "Fines de la organización", "Excluido: La entidad determina sus propios fines y no opera bajo instrucciones de mandantes externos."),
    ("A.2.2.4", "Uso para marketing / publicidad", "Excluido: La institución no recibe datos de terceros para procesamiento publicitario."),
    ("A.2.2.5", "Instrucción legalmente infractora", "Excluido: Inaplicable; la institución no recibe instrucciones operacionales de clientes externos."),
    ("A.2.2.6", "Obligaciones hacia el cliente", "Excluido: Inaplicable por ausencia de contratos de prestación de servicios como encargado."),
    ("A.2.2.7", "Registros por cuenta de clientes", "Excluido: Los registros conservados son propios en calidad de Responsable del tratamiento."),
    ("A.2.3.2", "Asistencia al cliente ante titulares", "Excluido: La institución atiende directamente a sus propios titulares sin intermediación de clientes."),
    ("A.2.4.2", "Archivos temporales del procesador", "Excluido: No se procesan archivos de clientes terceros; se aplica A.1.4.7 para archivos propios."),
    ("A.2.4.3", "Devolución / destrucción al cliente", "Excluido: La institución no custodia PII de clientes sujeta a devolución al término de servicios."),
    ("A.2.4.4", "Transmisión de datos del procesador", "Excluido: Inaplicable; las transmisiones propias se gestionan bajo el control A.1.4.10."),
    ("A.2.5.2", "Transferencias entre jurisdicciones", "Excluido: Inaplicable; las transferencias propias se rigen por la categoría A.1.5."),
    ("A.2.5.3", "Países destinatarios del procesador", "Excluido: Inaplicable por no procesar datos por cuenta de terceros como encargado."),
    ("A.2.5.4", "Divulgaciones por cuenta de clientes", "Excluido: Inaplicable; las divulgaciones propias se gestionan conforme al control A.1.5.5."),
    ("A.2.5.5", "Notificación de requerimientos al cliente", "Excluido: La entidad atiende requerimientos judiciales directamente como responsable."),
    ("A.2.5.6", "Divulgaciones legalmente vinculantes", "Excluido: Inaplicable; se aplica el marco regulatorio general de las Tablas A.1 y A.3."),
    ("A.2.5.7", "Revelación de subcontratistas", "Excluido: Inaplicable; los proveedores externos se gestionan bajo A.1.2.7 y A.3.10."),
    ("A.2.5.8", "Contratación de subcontratistas", "Excluido: Inaplicable por no operar en calidad de encargado de tratamiento."),
    ("A.2.5.9", "Cambios en subcontratistas", "Excluido: Inaplicable por no operar en calidad de encargado de tratamiento."),
  )
}

#let get-a3-table(era) = {
  let j-pol = if era == "v1" { "Política institucional aprobada y publicada formalmente para sedes centrales." } else if era == "v2" { "Política de privacidad actualizada para entornos virtuales y teletrabajo." } else { "Política institucional de privacidad alineada a ISO 27701:2025 y filiales regionales." }
  let j-roles = if era == "v1" { "Asignación formal de funciones al DPO, directores de admisión, planillas y DUTIC." } else if era == "v2" { "Roles actualizados para administración web, seguridad de endpoints y teletrabajo." } else { "Roles formalizados abarcando coordinadores y primeros respondedores en filiales regionales." }
  let j-class = if era == "v1" { "Esquema institucional: Pública, Interna, Confidencial (PII) y Secreta." } else if era == "v2" { "Clasificación con énfasis en expedientes digitales y credenciales de acceso remoto." } else { "Esquema institucional de clasificación aplicado homogéneamente en sede central y filiales." }
  let j-label = if era == "v1" { "Rotulado explícito de confidencialidad en bases de datos y padrones de admisión." } else if era == "v2" { "Marcado digital de confidencialidad en reportes PDF generados por sistemas internos." } else { "Etiquetado automatizado de confidencialidad en documentos, repositorios y bases de datos." }
  let j-transfer = if era == "v1" { "Canales cifrados e instructivos para entrega de lotes de información a bancos." } else if era == "v2" { "Conexiones cifradas TLS 1.3 y túneles VPN SSL para transferencias de nómina." } else { "Túneles VPN IPSec IKEv2 cifrados y reglas estrictas de transferencia intersedes." }
  let j-idm = if era == "v1" { "Ciclo de vida de cuentas centralizado en Directorio Activo institucional." } else if era == "v2" { "Gestión de identidades con revocación inmediata de accesos remotos al cese laboral." } else { "Identidad unificada multisede con aprovisionamiento automatizado y auditoría de cuentas." }
  let j-access = if era == "v1" { "Control de acceso basado en roles (RBAC) con revisión semestral de privilegios." } else if era == "v2" { "Principio de mínimo privilegio aplicado en bases de datos web y sistemas de planillas." } else { "Revisión trimestral de derechos de acceso y segregación de funciones entre sedes y filiales." }
  let j-supplier = if era == "v1" { "Términos de referencia con cláusulas de confidencialidad y auditoría técnica obligatoria." } else if era == "v2" { "Acuerdos de nivel de servicio y seguridad con proveedores de conectividad y hosting." } else { "Cláusulas estrictas de seguridad de la información y privacidad en contratos de proveedores." }
  let j-inc-plan = if era == "v1" { "Procedimiento institucional `G4-PRC-INC-01` y equipo CSIRT bajo Guía B.3.11." } else if era == "v2" { "Plan de incidentes adaptado a vectores web, teletrabajo y alertas automatizadas WAF." } else { "Plan multisede con roles de filial, tiempos de escalamiento y protocolo B.3.11." }
  let j-inc-resp = if era == "v1" { "Protocolos de contención, análisis forense, registro `G4-REG-INC-01` y enlace CAPA." } else if era == "v2" { "Contención en capa lógica, revocación de tokens JWT y registro forense de brechas." } else { "Respuesta coordinada con aislamiento de túneles VPN, borrado MDM y registro forense B.3.12." }
  let j-legal = if era == "v1" { "Matriz legal de cumplimiento con Ley 29733, directivas ANPD y Ley Universitaria." } else if era == "v2" { "Monitoreo constante de directivas de seguridad digital emitidas por la autoridad nacional." } else { "Matriz legal de requisitos de privacidad, resoluciones rectorales y normativa ANPD." }
  let j-rec-prot = if era == "v1" { "Respaldos protegidos contra borrado accidental, alteración o pérdida de integridad." } else if era == "v2" { "Almacenamiento de registros con permisos de solo lectura y copia de seguridad cifrada." } else { "Protección criptográfica e inmutabilidad de bitácoras de incidentes y registros del SGPI." }
  let j-ind-rev = if era == "v1" { "Auditorías periódicas de certificación por entidad externa acreditada." } else if era == "v2" { "Revisiones periódicas de seguridad informática por auditores independientes calificados." } else { "Programa anual de auditorías internas y auditoría externa independiente multisede." }
  let j-comp-rev = if era == "v1" { "Revisiones internas de cumplimiento conducidas por la Dirección de Calidad." } else if era == "v2" { "Evaluaciones técnicas de cumplimiento de directivas de teletrabajo y seguridad web." } else { "Inspecciones semestrales de cumplimiento de políticas en sede central y filiales regionales." }
  let j-aware = if era == "v1" { "Módulo formativo institucional y registros de evaluación en seguridad y privacidad." } else if era == "v2" { "Talleres virtuales obligatorios de concientización sobre phishing y trabajo remoto seguro." } else { "Capacitación continua a través de la Academia institucional con evaluación pre/post-test." }
  let j-nda = if era == "v1" { "Firma obligatoria de compromisos de confidencialidad para personal con acceso a PII." } else if era == "v2" { "Acuerdos de confidencialidad actualizados incorporando deberes en teletrabajo." } else { "Compromisos formales de reserva y no divulgación suscritos por todo el personal de filiales." }
  let j-clear = if era == "v1" { "Directiva de bloqueo de terminales y resguardo de padrones en archivadores con llave." } else if era == "v2" { "Bloqueo automático de pantalla tras inactividad y prohibición de anotación de claves." } else { "Política estricta de escritorio limpio para documentos físicos y pantalla limpia en terminales." }
  let j-media = if era == "v1" { "Control de memorias USB, cintas de respaldo y discos externos bajo inventario formal." } else if era == "v2" { "Restricción de puertos USB en estaciones de trabajo y custodia de discos externos." } else { "Gestión controlada de soportes removibles con cifrado forzoso e inventario centralizado." }
  let j-equip-disp = if era == "v1" { "Sobreescritura segura certificada (DoD 5220.22-M) previo a la baja de servidores y PC." } else if era == "v2" { "Protocolo de desmagnetización y destrucción física de discos duros dados de baja." } else { "Baja segura certificada de equipos informáticos con desmilitarización de soportes de PII." }
  let j-endpoint = if era == "v1" { "Antivirus corporativo administrado y bloqueo de privilegios de administrador local." } else if era == "v2" { "Protección de terminales remotos con antivirus centralizado y cortafuegos de host." } else { "Enrolamiento obligatorio en MDM (Intune) con cifrado BitLocker y capacidades de borrado." }
  let j-auth = if era == "v1" { "Políticas de contraseñas robustas, bloqueo por intentos y MFA en cuentas clave." } else if era == "v2" { "Autenticación multifactor obligatoria para conexiones VPN y administración de sistemas." } else { "MFA institucional generalizado, contraseñas robustas y autenticación biométrica en accesos." }
  let j-backup = if era == "v1" { "Respaldos diarios incrementales y semanales completos con prueba de restauración." } else if era == "v2" { "Copias de seguridad automáticas con hash SHA-256 verificado en servidor NAS secundario." } else { "Respaldos cifrados automáticos locales y remotos con pruebas trimestrales de restauración." }
  let j-log = if era == "v1" { "Servidor centralizado Syslog recopilando bitácoras de firewall, servidores y BD." } else if era == "v2" { "Registro centralizado de eventos de seguridad, accesos web y autenticaciones VPN." } else { "Sistema SIEM centralizado que correlaciona logs de sede central, filiales y servicios en la nube." }
  let j-crypto = if era == "v1" { "Cifrado AES-256 en reposo para bases de datos y TLS 1.3 en comunicaciones de red." } else if era == "v2" { "Cifrado robusto en reposo de bases salariales y certificados digitales SSL válidos." } else { "Criptografía avanzada: AES-256 en reposo, BitLocker por TPM 2.0 y canales VPN IPSec cifrados." }
  let j-sdlc = if era == "v1" { "Metodología DevSecOps con revisión de seguridad de código fuente previo al pase a prod." } else if era == "v2" { "Integración de análisis estático SAST en pipelines CI/CD de desarrollo institucional." } else { "Ciclo de desarrollo seguro formalizado con escaneo de dependencias y pruebas de seguridad." }
  let j-app-req = if era == "v1" { "Especificación de requerimientos de privacidad desde la etapa de diseño de software." } else if era == "v2" { "Requisitos de seguridad por defecto y por diseño en portales web de postulación." } else { "Especificación formal de requisitos de seguridad y privacidad en toda nueva aplicación." }
  let j-arch = if era == "v1" { "Segmentación de redes en VLANs separadas para admisiones, nóminas y red general." } else if era == "v2" { "Arquitectura de red defensiva con DMZ para servidores web y aislamiento de BD." } else { "Arquitectura de red de confianza cero (Zero Trust) y segmentación estricta intersedes." }
  let j-out-dev = if era == "v1" { "Supervisión técnica directa de DUTIC sobre entregables de software de terceros." } else if era == "v2" { "Cláusulas de entrega de código auditado en contratos de desarrollo externalizado." } else { "Revisión técnica de seguridad y pruebas de penetración sobre componentes externalizados." }
  let j-test-data = if era == "v1" { "Datos anonimizados y sintéticos para entornos de prueba y desarrollo de software." } else if era == "v2" { "Prohibición taxativa del uso de bases de datos de producción en entornos de testing." } else { "Generación automatizada de datasets sintéticos desprovistos de PII para entornos de prueba." }

  (
    ("A.3.3", "Políticas de seguridad y privacidad", j-pol),
    ("A.3.4", "Roles y responsabilidades de seguridad", j-roles),
    ("A.3.5", "Clasificación de la información", j-class),
    ("A.3.6", "Etiquetado de la información", j-label),
    ("A.3.7", "Transferencia de información", j-transfer),
    ("A.3.8", "Gestión de identidades", j-idm),
    ("A.3.9", "Derechos de acceso", j-access),
    ("A.3.10", "Acuerdos con proveedores", j-supplier),
    ("A.3.11", "Planificación y preparación ante incidentes", j-inc-plan),
    ("A.3.12", "Respuesta a incidentes de seguridad", j-inc-resp),
    ("A.3.13", "Requisitos legales y regulatorios", j-legal),
    ("A.3.14", "Protección de registros", j-rec-prot),
    ("A.3.15", "Revisión independiente de seguridad", j-ind-rev),
    ("A.3.16", "Cumplimiento con políticas y normas", j-comp-rev),
    ("A.3.17", "Concientización, educación y formación", j-aware),
    ("A.3.18", "Acuerdos de confidencialidad (NDA)", j-nda),
    ("A.3.19", "Escritorio y pantalla limpios", j-clear),
    ("A.3.20", "Gestión de soportes de almacenamiento", j-media),
    ("A.3.21", "Disposición segura de equipos", j-equip-disp),
    ("A.3.22", "Seguridad en dispositivos de usuario", j-endpoint),
    ("A.3.23", "Autenticación segura", j-auth),
    ("A.3.24", "Copias de seguridad de información", j-backup),
    ("A.3.25", "Registro de eventos (Logging)", j-log),
    ("A.3.26", "Uso de criptografía", j-crypto),
    ("A.3.27", "Ciclo de vida de desarrollo seguro", j-sdlc),
    ("A.3.28", "Requisitos de seguridad en aplicaciones", j-app-req),
    ("A.3.29", "Arquitectura e ingeniería de sistemas seguros", j-arch),
    ("A.3.30", "Desarrollo externalizado", j-out-dev),
    ("A.3.31", "Información de prueba", j-test-data),
  )
}

#let mold(data) = {
  let doc-title = data.at("title", default: "Declaración de Aplicabilidad del SGPI (SoA)")
  let doc-code = data.at("code", default: "G4-SOA-01")
  let doc-ver = data.at("version", default: "3.0")
  let doc-date = data.at("date", default: "2025-10-28")
  let doc-conf = data.at("confidentiality", default: "CONFIDENCIAL - USO INTERNO UNSA")
  let doc-author = data.at("author", default: (:))
  let doc-reviewer = data.at("reviewer", default: (:))
  let doc-approver = data.at("approver", default: (:))
  let doc-history = data.at("history", default: ())
  let doc-validity = data.at("validity", default: "2026-10-28")
  let doc-refs = data.at("references", default: ())
  let doc-owner = data.at("owner-role", default: "Oficial de Seguridad de la Información (OSI / DPO)")
  let era = data.at("era", default: "v3")
  let org-name = data.at("organization-name", default: "la Universidad Nacional de San Agustín de Arequipa (UNSA)")
  let purpose-desc = data.at("purpose-desc", default: "documenta formalmente los controles de seguridad y privacidad necesarios para el Sistema de Gestión de Privacidad de la Información (SGPI) institucional")
  let role-desc = data.at("role-desc", default: "actúa de manera privativa y unívoca como Responsable del Tratamiento de Datos Personales (PII Controller), determinando de forma autónoma los fines y medios del tratamiento en los procesos misionales de Admisión y de soporte de Planillas de Remuneraciones")
  let approver-role = if type(doc-approver) == dictionary and doc-approver.at("role", default: "") != "" {
    doc-approver.role
  } else {
    "Rector de la Universidad Nacional de San Agustín de Arequipa / Presidente del Comité SGPI"
  }
  let approver-name = if type(doc-approver) == dictionary and doc-approver.at("name", default: "") != "" {
    doc-approver.name
  } else {
    "Dr. Hugo José Sánchez"
  }

  doc-template(
    title: doc-title,
    code: doc-code,
    version: doc-ver,
    date: doc-date,
    confidentiality: doc-conf,
    author: doc-author,
    reviewer: doc-reviewer,
    approver: doc-approver,
    history: doc-history,
    validity: none,
    references: (),
    owner-role: none,
    show-signature: false,
    [
      = Objetivo, alcance y usuarios

      == Objetivo
      El objetivo del presente documento es definir la aplicabilidad y estado de implementación de los controles de seguridad de la información y privacidad de datos personales en #org-name. La presente Declaración de Aplicabilidad (*Statement of Applicability - SoA*) #purpose-desc, en estricto cumplimiento de la Cláusula 6.1.3.e y la Introducción normativa del Anexo A de la norma internacional *ISO/IEC 27701:2025* (Segunda edición, PIMS independiente).

      == Alcance
      En virtud del análisis formal del contexto organizacional y legal desarrollado bajo la Cláusula 4.1 de la norma, #org-name #role-desc, en el marco de la Ley Universitaria N° 30220 y la Ley N° 29733 de Protección de Datos Personales del Perú. La aplicabilidad de controles abarca todos los activos, canales de tratamiento, repositorios de bases de datos y personal comprendidos en el alcance del SGPI.

      == Usuarios
      Los usuarios de este documento son la Alta Dirección (Rectorado), los miembros del Comité de Gobierno Digital y Privacidad, el #doc-owner, el personal técnico de la Dirección Universitaria de TIC (DUTIC), los directores y responsables de los procesos de Admisión y Planillas, y los auditores internos y externos del SGPI.

      = Documentos de referencia
      #for ref-item in doc-refs [
        - #ref-item
      ]

      = Declaración de aplicabilidad

      == Criterio de evaluación y estructura de controles
      Conforme a la Cláusula 6.1.3.e y las directrices normativas del Anexo A de ISO/IEC 27701:2025, la totalidad de los dieciocho (18) controles contenidos en la Tabla A.2 (*Controles para Encargados del Tratamiento / PII Processors*, controles A.2.2.2 a A.2.5.9) han sido determinados como formalmente *EXCLUIDOS* de la presente Declaración de Aplicabilidad, en razón de que la institución actúa de manera privativa como Responsable del Tratamiento (*PII Controller*) y no presta servicios de tratamiento por cuenta de terceros ni opera bajo el mandato de encargada en los procesos bajo el alcance del SGPI.

      Por su parte, la totalidad de los treinta y un (31) controles de la Tabla A.1 (*Controles para Responsables del Tratamiento / PII Controllers*) y los veintinueve (29) controles de la Tabla A.3 (*Controles de Seguridad de la Información con Enfoque de Privacidad*) han sido evaluados como *APLICABLES E IMPLEMENTADOS* en el SGPI.

      === Controles con análisis de profundidad vertical (Incidentes y Derechos de Titulares)
      - *Control A.3.11 — Planificación y preparación de incidentes de seguridad (PII):*
        #get-deep-a311(era)
      - *Control A.3.12 — Respuesta a incidentes de seguridad de la información:*
        #get-deep-a312(era)
      - *Control A.1.2.9 — Registros relacionados con el tratamiento de PII (ROPA / RAT):*
        #get-deep-a129(era)
      - *Control A.1.3.7 — Acceso, rectificación o supresión de PII (ARCO / DSR):*
        #get-deep-a137(era)
      - *Control A.1.3.10 — Tramitación y respuesta a solicitudes de titulares:*
        #get-deep-a1310(era)

      == Tabla A.1 — Controles para Responsables del Tratamiento (PII Controllers) [31 Controles]
      #v(0.2cm)
      #table(
        columns: (52pt, 130pt, 68pt, 1fr),
        fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
        stroke: 0.5pt + luma(190),
        align: (center, left, center, left),
        table.header([*Control*], [*Título del Control*], [*Estado*], [*Justificación de Inclusión (Cl. 6.1.3e)*]),
        ..get-a1-table(era).map(row => (
          text(size: 7.5pt, weight: "bold")[#row.at(0)],
          text(size: 7.5pt)[#row.at(1)],
          status-tag("IMPLEMENTADO"),
          text(size: 7.5pt)[#row.at(2)]
        )).flatten()
      )
      #v(0.3cm)

      == Tabla A.2 — Controles para Encargados del Tratamiento (PII Processors) [18 Controles - EXCLUIDOS]
      #v(0.2cm)
      #table(
        columns: (52pt, 130pt, 68pt, 1fr),
        fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
        stroke: 0.5pt + luma(190),
        align: (center, left, center, left),
        table.header([*Control*], [*Título del Control*], [*Estado*], [*Justificación de Exclusión (Cl. 6.1.3e)*]),
        ..get-a2-table().map(row => (
          text(size: 7.5pt, weight: "bold")[#row.at(0)],
          text(size: 7.5pt)[#row.at(1)],
          status-tag("OBSOLETO"),
          text(size: 7.5pt)[#row.at(2)]
        )).flatten()
      )
      #v(0.3cm)

      == Tabla A.3 — Controles de Seguridad de la Información con Enfoque de Privacidad [29 Controles]
      #v(0.2cm)
      #table(
        columns: (52pt, 130pt, 68pt, 1fr),
        fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
        stroke: 0.5pt + luma(190),
        align: (center, left, center, left),
        table.header([*Control*], [*Título del Control*], [*Estado*], [*Justificación de Inclusión (Cl. 6.1.3e)*]),
        ..get-a3-table(era).map(row => (
          text(size: 7.5pt, weight: "bold")[#row.at(0)],
          text(size: 7.5pt)[#row.at(1)],
          status-tag("IMPLEMENTADO"),
          text(size: 7.5pt)[#row.at(2)]
        )).flatten()
      )
      #v(0.3cm)

      == Resumen de aplicabilidad de controles
      La presente Declaración de Aplicabilidad consolida la totalidad de los 78 controles normativos de la norma ISO/IEC 27701:2025:
      - *Tabla A.1 (Responsables / PII Controllers):* 31 controles evaluados como *APLICABLES / IMPLEMENTADOS*.
      - *Tabla A.2 (Encargados / PII Processors):* 18 controles formalmente *EXCLUIDOS CON JUSTIFICACIÓN FUNDADA*.
      - *Tabla A.3 (Seguridad con enfoque de privacidad):* 29 controles evaluados como *APLICABLES / IMPLEMENTADOS*.
      - *Total de controles vigentes implementados:* 60 controles activos en el SGPI institucional.

      = Gestión de registros guardados en base a este documento
      #v(0.2cm)
      #table(
        columns: (120pt, 90pt, 90pt, 1fr, 60pt),
        fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
        stroke: 0.5pt + luma(190),
        align: (left, left, left, left, center),
        table.header([*Nombre del registro*], [*Ubicación de archivo*], [*Persona responsable del archivo*], [*Controles para la protección del registro*], [*Tiempo de retención*]),
        [Declaración de aplicabilidad (formulario electrónico, documento en PDF / Typst)], [Repositorio PIMS / Sisgedo], [#doc-owner], [Control de acceso por roles (RBAC) e integridad SHA-256], [Permanente],
        [Evaluaciones y evidencias de aplicabilidad de controles], [Repositorio PIMS / Servidor DUTIC], [#doc-owner], [Control de acceso por roles (RBAC) y respaldo semanal], [5 años]
      )
      #v(0.2cm)

      Solamente el #doc-owner puede permitir a otros empleados el acceso a los registros mencionados precedentemente.

      = Validez y gestión de documentos
      Este documento es válido hasta el #doc-validity.

      El propietario de este documento es el #doc-owner, que debe verificar y, si es necesario, actualizar la Declaración de Aplicabilidad por lo menos una vez al año, antes de la revisión por la dirección y de las auditorías periódicas del SGPI.

      Al evaluar la efectividad y adecuación de este documento, es necesario tener en cuenta los siguientes criterios:
      - Cantidad de controles seleccionados cuya implementación no cuente con evidencia documental o técnica verificable.
      - Modificaciones en el marco legal (Ley 29733 / Ley 30220), directivas de la ANPD o en el alcance institucional del SGPI que no hayan sido incorporadas oportunamente.
      - Observaciones, oportunidades de mejora o no conformidades identificadas en auditorías internas o externas relativas a la selección o idoneidad de los controles.

      #v(0.8cm)
      #align(left)[
        #signature-block(
          role: approver-role,
          name: approver-name
        )
      ]
    ]
  )
}
