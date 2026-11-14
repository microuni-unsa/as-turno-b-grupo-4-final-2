#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
  title: "Declaración de Aplicabilidad del SGPI (SoA)",
  code: "G4-SOA-01",
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
      summary: "Emisión inicial de la Declaración de Aplicabilidad (SoA) para la certificación ISO/IEC 27701:2019. Alcance: Sedes Arequipa (Admisión y Planillas presenciales)."
    ),
  )
)

= Propósito y Fundamento Normativo
La presente Declaración de Aplicabilidad (Statement of Applicability - SoA) documenta formalmente los controles de seguridad y privacidad necesarios para el Sistema de Gestión de Privacidad de la Información (SGPI) de la UNSA, en estricto cumplimiento de la Cláusula 6.1.3.e y la Introducción del Anexo A de la norma ISO/IEC 27701:2025.

= Determinación del Rol Institucional (Cláusula 4.1)
En virtud del análisis de contexto institucional desarrollado bajo la Cláusula 4.1, la Universidad Nacional de San Agustín de Arequipa (UNSA) actúa de manera privativa y unívoca como *Responsable del Tratamiento de Datos Personales (PII Controller)*, dado que determina de forma autónoma los fines, medios y bases de legitimación para el procesamiento de datos personales en sus procesos misionales de Admisión y de soporte de Planillas de Remuneraciones.

#callout(title: "CRITERIO DE EXCLUSIÓN NORMATIVA DE LA TABLA A.2 (CLÁUSULA 6.1.3e)", color: rgb("#0284c7"))[
  Conforme a la Cláusula 6.1.3.e y las directrices normativas del Anexo A, la totalidad de los controles contenidos en la Tabla A.2 ("Controles para Encargados del Tratamiento / PII Processors", controles A.2.2.2 a A.2.5.9) han sido determinados como NO APLICABLES (EXCLUIDOS), debido a que la UNSA no actúa como prestador de servicios de tratamiento por cuenta de terceros ni asume el rol de Encargado en los procesos bajo el alcance del SGPI.
]

= Controles de Profundidad Vertical (Incidentes y Derechos de Titulares)

== Control A.3.11 — Planificación y preparación de incidentes de seguridad (PII)
- *Estado:* #status-tag("IMPLEMENTADO")
- *Justificación Profunda (Cl. 6.1.3e / Anexo B.3.11):*
  La UNSA ha establecido y formalizado el Procedimiento Institucional de Respuesta a Incidentes de Privacidad (`G4-PRC-INC-01`), definiendo el Equipo de Respuesta CSIRT-UNSA bajo la coordinación del Oficial de Seguridad de la Información (DPO). Se establecen canales formales para el reporte rápido (primeros 60 minutos), roles institucionales en admisiones y planillas, y directrices para registrar eventos y brechas en `G4-REG-INC-01`. Los umbrales de notificación hacia la autoridad administrativa (ANPDP) y los titulares se rigen por la evaluación objetiva de impacto institucional y riesgo para los derechos fundamentales (Cláusula 8.1 / Guía B.3.12), sin sujeción a la regla de 72 horas del RGPD europeo.

== Control A.3.12 — Respuesta a incidentes de seguridad de la información
- *Estado:* #status-tag("IMPLEMENTADO")
- *Justificación Profunda (Cl. 6.1.3e / Anexo B.3.12):*
  La respuesta operativa se ejecuta de manera protocolizada ante la confirmación de una brecha que involucre PII. El procedimiento incluye contención inmediata (trituración física de listas impresas, desconexión de red o revocación de accesos), preservación forense de evidencias bajo cadena de custodia documentada, evaluación de daño y apertura mandatoria de acciones correctivas en `G4-REG-CAPA-01` bajo la Cláusula 10.2. Se mantiene un libro histórico de incidentes para fines de auditoría y análisis de causa raíz.

== Control A.1.2.9 — Registros relacionados con el tratamiento de PII (ROPA / RAT)
- *Estado:* #status-tag("IMPLEMENTADO")
- *Justificación Profunda (Cl. 6.1.3e / Anexo B.1.2.9):*
  La Universidad ha construido y mantiene actualizado el Registro de Actividades de Tratamiento (RAT / ROPA-equivalent) para los procesos de Admisión y Planillas. El registro documenta para cada flujo: identidad y contacto del responsable (UNSA), categorías de titulares (postulantes, docentes, personal administrativo), tipos de datos personales y sensibles (biométricos, salariales, de salud ocupacional), finalidades estatutarias, base de legalidad (Ley Universitaria 30220 y consentimiento informado), destinatarios de transferencias legítimas (Sunedu, MEF, Essalud) y plazos obligatorios de retención conforme al marco archivístico nacional.

== Control A.1.3.7 — Acceso, rectificación o supresión de PII (ARCO / DSR)
- *Estado:* #status-tag("IMPLEMENTADO")
- *Justificación Profunda (Cl. 6.1.3e / Anexo B.1.3.7):*
  Se dispone de directivas y formularios accesibles para garantizar el ejercicio efectivo de los derechos ARCO (Acceso, Rectificación, Cancelación y Oposición) reconocidos en la Ley 29733 y el estándar ISO 27701. Postulantes y colaboradores pueden ingresar sus peticiones presencialmente en Mesa de Partes Central o mediante el sistema de gestión documentaria Sisgedo. El procedimiento define plazos máximos perentorios de atención y los supuestos excepcionales de improcedencia legal (ej. conservación obligatoria de registros de notas por mandato universitario).

== Control A.1.3.10 — Tramitación y respuesta a solicitudes de titulares
- *Estado:* #status-tag("IMPLEMENTADO")
- *Justificación Profunda (Cl. 6.1.3e / Anexo B.1.3.10):*
  La Oficina de Seguridad y Privacidad (OSI/DPO) es la unidad responsable de instruir la atención de solicitudes de titulares. Se aplica verificación rigurosa de identidad del solicitante previo a la entrega de copias de PII (Control A.1.3.9), se realiza seguimiento en Sisgedo y se emite pronunciamiento fundado en un plazo no mayor a 10 días hábiles para acceso y 5 días para rectificación o supresión.

= Esqueleto Completo de la Declaración de Aplicabilidad

== Tabla A.1 — Controles para Responsables del Tratamiento (PII Controllers)
#table(
  columns: (55pt, 130pt, 65pt, 1fr),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, left, center, left),
  table.header([*Control*], [*Título del Control*], [*Estado*], [*Justificación de Inclusión (1 línea)*]),
  [A.1.2.2], [Identificación de finalidades], status-tag("IMPLEMENTADO"), [Las finalidades de admisión y nómina están documentadas en bases de concurso y directivas.],
  [A.1.2.3], [Base jurídica del tratamiento], status-tag("IMPLEMENTADO"), [Tratamiento sustentado en Ley Universitaria 30220, relación contractual laboral y consentimiento.],
  [A.1.2.4], [Determinación de consentimiento], status-tag("IMPLEMENTADO"), [Formularios de inscripción y contratos incluyen cláusulas explícitas de consentimiento informado.],
  [A.1.2.5], [Obtención y registro de consentimiento], status-tag("IMPLEMENTADO"), [Custodia de consentimientos firmados física y digitalmente en legajos de admisión y RRHH.],
  [A.1.2.6], [Evaluación de impacto de privacidad], status-tag("IMPLEMENTADO"), [EIP conducidas previo a modificaciones significativas en el procesamiento biométrico.],
  [A.1.2.7], [Contratos con encargados (procesadores)], status-tag("IMPLEMENTADO"), [Contratos con proveedores de software o servicios externos incluyen cláusulas de privacidad.],
  [A.1.2.8], [Corresponsables del tratamiento], status-tag("IMPLEMENTADO"), [Acuerdos interinstitucionales formales con Sunedu y MEF definen responsabilidades compartidas.],
  [A.1.2.9], [Registros de actividades de tratamiento], status-tag("IMPLEMENTADO"), [Registro profundo ROPA/RAT documentado en inventario de tratamiento de datos personales.],
  [A.1.3.2], [Obligaciones con titulares de PII], status-tag("IMPLEMENTADO"), [Mapeo y cumplimiento de directivas legales peruanas de protección de datos personales.],
  [A.1.3.3], [Información previa al tratamiento], status-tag("IMPLEMENTADO"), [Políticas de privacidad visibles en ventanillas de admisión y fichas de matrícula.],
  [A.1.3.4], [Suministro de información al titular], status-tag("IMPLEMENTADO"), [Cláusulas informativas sobre identidad del responsable y finalidad del tratamiento.],
  [A.1.3.5], [Modificación o revocación del consentimiento], status-tag("IMPLEMENTADO"), [Canal formal para revocar consentimiento para finalidades no obligatorias.],
  [A.1.3.6], [Mecanismo de oposición al tratamiento], status-tag("IMPLEMENTADO"), [Mecanismo expedito para manifestar oposición ante tratamientos basados en interés legítimo.],
  [A.1.3.7], [Acceso, rectificación o supresión (ARCO)], status-tag("IMPLEMENTADO"), [Directiva de atención de derechos ARCO con plazos y formatos estandarizados.],
  [A.1.3.8], [Notificación de cambios a terceros], status-tag("IMPLEMENTADO"), [Protocolo para comunicar rectificaciones a entidades receptoras de datos de personal.],
  [A.1.3.9], [Copia de PII tratada], status-tag("IMPLEMENTADO"), [Entrega certificada de constancias de notas, boletas o padrones a petición de parte.],
  [A.1.3.10], [Atención de solicitudes de titulares], status-tag("IMPLEMENTADO"), [Procedimiento reglado con registro de trazabilidad en el sistema Sisgedo.],
  [A.1.3.11], [Decisiones individuales automatizadas], status-tag("IMPLEMENTADO"), [La calificación de exámenes de admisión cuenta con auditoría y revisión humana de reclamos.],
  [A.1.4.2], [Limitación de la recopilación], status-tag("IMPLEMENTADO"), [Solo se recaban datos estrictamente indispensables para la matrícula o liquidación salarial.],
  [A.1.4.3], [Limitación del tratamiento], status-tag("IMPLEMENTADO"), [Prohibición estricta de utilizar datos de postulantes o nóminas para fines de marketing o lucro.],
  [A.1.4.4], [Exactitud y calidad de los datos], status-tag("IMPLEMENTADO"), [Campañas periódicas de actualización de datos de personal y validación RENIEC.],
  [A.1.4.5], [Objetivos de minimización de PII], status-tag("IMPLEMENTADO"), [Eliminación de campos innecesarios en las fichas de inscripción de postulantes.],
  [A.1.4.6], [Desidentificación y supresión], status-tag("IMPLEMENTADO"), [Disociación estadística de resultados académicos para estudios de investigación pedagógica.],
  [A.1.4.7], [Archivos temporales], status-tag("IMPLEMENTADO"), [Purga automática de archivos temporales de carga y escaneos de expedientes a los 30 días.],
  [A.1.4.8], [Plazos de conservación de PII], status-tag("IMPLEMENTADO"), [Tabla de retención documental alineada a las normas del Archivo General de la Nación.],
  [A.1.4.9], [Disposición y eliminación de PII], status-tag("IMPLEMENTADO"), [Protocolos de baja y destrucción física certificada con trituradoras de microcorte.],
  [A.1.4.10], [Controles de transmisión de PII], status-tag("IMPLEMENTADO"), [Uso de protocolos seguros (HTTPS, TLS 1.3) y cifrado en transferencias de nómina a bancos.],
  [A.1.5.2], [Bases de transferencias internacionales], status-tag("IMPLEMENTADO"), [Contratos de adhesión a servicios en la nube con cláusulas contractuales tipo.],
  [A.1.5.3], [Países y organismos destinatarios], status-tag("IMPLEMENTADO"), [Inventario de proveedores en la nube y centros de datos en el extranjero.],
  [A.1.5.4], [Registro de transferencias de PII], status-tag("IMPLEMENTADO"), [Bitácora formal de lotes de información remitidos al MEF, Sunedu y bancos.],
  [A.1.5.5], [Registro de divulgaciones a terceros], status-tag("IMPLEMENTADO"), [Control de oficios de requerimiento judicial o policial atendidos por la Asesoría Legal.]
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
  [A.3.3], [Políticas de seguridad y privacidad], status-tag("IMPLEMENTADO"), [Política institucional `G4-POL-01` aprobada y publicada por el Consejo Universitario.],
  [A.3.4], [Roles y responsabilidades de seguridad], status-tag("IMPLEMENTADO"), [Asignación formal de funciones al DPO, directores de admisión, planillas y DUTIC.],
  [A.3.5], [Clasificación de la información], status-tag("IMPLEMENTADO"), [Esquema institucional: Pública, Interna, Confidencial (PII) y Secreta.],
  [A.3.6], [Etiquetado de la información], status-tag("IMPLEMENTADO"), [Rotulado explícito de confidencialidad en bases de datos y padrones de admisión.],
  [A.3.7], [Transferencia de información], status-tag("IMPLEMENTADO"), [Canales cifrados VPN e instructivos para entrega de lotes de información a bancos.],
  [A.3.8], [Gestión de identidades], status-tag("IMPLEMENTADO"), [Ciclo de vida de cuentas de usuario único centralizado en Directorio Activo institucional.],
  [A.3.9], [Derechos de acceso], status-tag("IMPLEMENTADO"), [Control de acceso basado en roles (RBAC) con revisión semestral de privilegios.],
  [A.3.10], [Acuerdos con proveedores], status-tag("IMPLEMENTADO"), [Términos de referencia con cláusulas de confidencialidad y auditoría técnica obligatoria.],
  [A.3.11], [Planificación y preparación ante incidentes], status-tag("IMPLEMENTADO"), [Procedimiento `G4-PRC-INC-01` y equipo CSIRT-UNSA operando bajo Guía B.3.11.],
  [A.3.12], [Respuesta a incidentes de seguridad], status-tag("IMPLEMENTADO"), [Protocolos de contención, análisis forense, registro `G4-REG-INC-01` y enlace CAPA.],
  [A.3.13], [Requisitos legales y regulatorios], status-tag("IMPLEMENTADO"), [Matriz legal de cumplimiento con Ley 29733, directivas ANPDP y Ley Universitaria.],
  [A.3.14], [Protección de registros], status-tag("IMPLEMENTADO"), [Respaldos protegidos contra borrado accidental, alteración o pérdida de integridad.],
  [A.3.15], [Revisión independiente de seguridad], status-tag("IMPLEMENTADO"), [Auditorías periódicas de certificación por entidad externa acreditada.],
  [A.3.16], [Cumplimiento con políticas y normas], status-tag("IMPLEMENTADO"), [Revisiones internas de cumplimiento conducidas por la Dirección de Calidad Universitaria.],
  [A.3.17], [Concientización, educación y formación], status-tag("IMPLEMENTADO"), [Módulo formativo `G4-CAP-INC-01` y registros de evaluación `G4-REG-CAP-01`.],
  [A.3.18], [Acuerdos de confidencialidad (NDA)], status-tag("IMPLEMENTADO"), [Firma obligatoria de compromisos de reserva para todo el personal con acceso a PII.],
  [A.3.19], [Escritorio y pantalla limpios], status-tag("IMPLEMENTADO"), [Directiva de bloqueo de terminales y resguardo de padrones físicos en armarios cerrados.],
  [A.3.20], [Gestión de soportes de almacenamiento], status-tag("IMPLEMENTADO"), [Control de memorias USB, cintas de backup y discos externos bajo inventario.],
  [A.3.21], [Disposición segura de equipos], status-tag("IMPLEMENTADO"), [Sobreescritura segura certificada (DoD 5220.22-M) previo a la baja de servidores y PC.],
  [A.3.22], [Seguridad en dispositivos de usuario], status-tag("IMPLEMENTADO"), [Antivirus corporativo administrado y bloqueo de privilegios de administrador local.],
  [A.3.23], [Autenticación segura], status-tag("IMPLEMENTADO"), [Políticas de contraseñas robustas, bloqueo por intentos y MFA en cuentas clave.],
  [A.3.24], [Copias de seguridad de información], status-tag("IMPLEMENTADO"), [Respaldos diarios incrementales y semanales completos con prueba de restauración.],
  [A.3.25], [Registro de eventos (Logging)], status-tag("IMPLEMENTADO"), [Servidor centralizado Syslog recopilando bitácoras de firewall, servidores y base de datos.],
  [A.3.26], [Uso de criptografía], status-tag("IMPLEMENTADO"), [Cifrado AES-256 en reposo para bases de datos y TLS 1.3 en comunicaciones de red.],
  [A.3.27], [Ciclo de vida de desarrollo seguro], status-tag("IMPLEMENTADO"), [Metodología DevSecOps con revisión de seguridad de código fuente previo al pase a prod.],
  [A.3.28], [Requisitos de seguridad en aplicaciones], status-tag("IMPLEMENTADO"), [Especificación de requerimientos de privacidad desde la etapa de diseño de software.],
  [A.3.29], [Arquitectura e ingeniería de sistemas seguros], status-tag("IMPLEMENTADO"), [Segmentación de redes en VLANs separadas para admisiones, nóminas y red general.],
  [A.3.30], [Desarrollo externalizado], status-tag("IMPLEMENTADO"), [Supervisión técnica directa de DUTIC sobre entregables de software de terceros.],
  [A.3.31], [Información de prueba], status-tag("IMPLEMENTADO"), [Datos anonimizados y sintéticos para entornos de prueba y desarrollo de software.]
)
