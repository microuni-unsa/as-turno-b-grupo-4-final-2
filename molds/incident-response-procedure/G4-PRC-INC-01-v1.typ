#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
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
  )
)

= Objetivo
Establecer el marco estructurado y las directrices operativas obligatorias para planificar, detectar, clasificar, contener, investigar, notificar y documentar todo evento o incidente de seguridad que involucre o amenace datos personales (PII) bajo la responsabilidad de la Universidad Nacional de San Agustín de Arequipa (UNSA), de conformidad con la norma ISO/IEC 27701:2025 Cláusula 8.1, Controles A.3.11, A.3.12 y las directrices de las Guías B.3.11 y B.3.12.

= Alcance Institucional (Versión 1.0)
El presente procedimiento rige en los siguientes límites físicos y lógicos:
1. *Proceso Misional*: Admisión de Pregrado en modalidad presencial (inscripción ordinaria, CEPRUNSA, toma manual de biométricos y custodia física de padrones).
2. *Proceso de Soporte*: Liquidación y pago de Planillas de personal docente y administrativo en la Subdirección de Personal (Campus Central).
3. *Sedes Geográficas*: Exclusivamente en las sedes urbanas de la ciudad de Arequipa:
   - Campus Área de Ingenierías (Av. Independencia s/n).
   - Campus Área de Biomédicas (Av. Alcides Carrión s/n).
   - Campus Área de Sociales (Av. Virgen del Pilar s/n).
4. *Infraestructura Tecnológica*: Servidores on-premise en el centro de datos principal de DUTIC, redes cableadas institucionales y estaciones de trabajo locales.

= Base Normativa y Criterios Operativos
- *ISO/IEC 27701:2025*: Cláusula 8.1 (Planificación y control operacional), Cláusula 7.5 (Información documentada), Control A.3.11 (Planificación de incidentes), Control A.3.12 (Respuesta a incidentes de PII) y Guías B.3.11 / B.3.12.
- *Ley N° 29733*: Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).
- *Rol Institucional (Cl. 4.1)*: La UNSA actúa unívocamente como *Responsable del Tratamiento de Datos Personales (PII Controller)*.

#callout(title: "CRITERIO DE NOTIFICACIÓN ORGANIZACIONAL (GUÍA B.3.12)", color: rgb("#0284c7"))[
  Conforme a la Guía B.3.12, la obligación de notificación se determina mediante una evaluación objetiva del riesgo sobre los derechos de los titulares. No rige la regla externa de notificación en 72 horas del RGPD europeo, dado que el Anexo D de la norma ISO constituye un mapeo informativo que no impone obligaciones operativas a la UNSA.
]

= Roles y Responsabilidades
#table(
  columns: (120pt, 1fr),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (left, left),
  table.header([*Rol / Instancia*], [*Responsabilidad Principal en Incidentes*]),
  [Comité SGPI / Rectorado], [Aprobación de la política, asignación de recursos y autorización de comunicaciones públicas ante crisis mayores.],
  [Oficial de Seguridad / DPO], [Coordinar el procedimiento de respuesta, liderar el triage de severidad, calificar si existe brecha PII y definir la notificación regulatoria.],
  [Equipo CSIRT-UNSA (DUTIC)], [Ejecutar acciones técnicas inmediatas de contención, aislamiento de redes, preservación de evidencias y erradicación del vector.],
  [Dirección de Admisión], [Custodiar los padrones de postulantes y reportar de inmediato anomalías en el manejo de expedientes o fichas impresas.],
  [Subdirección de Personal], [Garantizar la reserva de los archivos de remuneraciones y reportar incidentes de filtración interna o errores en boletas.],
  [Colaboradores y Docentes], [Reportar inmediatamente al CSIRT cualquier sospecha de incidente o pérdida de documentos con datos personales.]
)

= Ciclo de Vida de Respuesta a Incidentes de Privacidad

== Detección y Reporte Inmediato
Cualquier miembro de la comunidad universitaria que identifique una anomalía debe reportarla dentro de los primeros 60 minutos de conocida a través de la mesa de ayuda de DUTIC (`soporte@unsa.edu.pe`) o telefónicamente al anexo interno del DPO. La notificación inicial debe registrar:
- Fecha, hora y ubicación física del suceso.
- Datos personales presuntamente expuestos (nombres, DNI, notas, sueldos).
- Persona que reporta y descripción concisa de lo observado.

== Triage y Clasificación Formal
El DPO junto al líder del CSIRT efectúan el análisis de gravedad según la Nota 1 de la Guía B.3.12:
- *Evento de Seguridad*: Cualquier suceso observable en sistemas o instalaciones que no implique compromiso real o potencial de PII (ej. escaneo de puertos bloqueado por firewall).
- *Incidente de Privacidad*: Suceso adverso que amenaza la confidencialidad, integridad o disponibilidad de bases de datos de admisión o planillas.
- *Brecha de Datos Personales (PII Breach)*: Incidente confirmado que resulta en la destrucción, pérdida, alteración, divulgación o acceso no autorizado a datos personales identificables.

#table(
  columns: (70pt, 90pt, 1fr, 70pt),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, left, left, center),
  table.header([*Nivel*], [*Criterio de Impacto*], [*Ejemplo Típico v1.0*], [*Tiempo Máx. Contención*]),
  rag-tag("CRÍTICO"), [Compromiso masivo de PII sensible (>1,000 titulares) o daño inminente a derechos.], [Robo de padrón impreso con huellas y notas de admisión general.], [1 hora],
  rag-tag("ALTO"), [Exposición de datos financieros o remunerativos de personal (>20 titulares).], [Envío erróneo de planillas salariales por correo electrónico masivo.], [4 horas],
  rag-tag("MEDIO"), [Exposición acotada de PII general sin datos bancarios (menos de 20 titulares).], [Listado de postulantes olvidado temporalmente en aula sin custodia.], [12 horas],
  rag-tag("BAJO"), [Fallo técnico interno sin acceso indebido de terceros.], [Retraso operativo en generación de backups sin pérdida de datos.], [24 horas]
)

== Contención Inmediata y Preservación de Evidencias
1. *Aislamiento*: Desconectar equipos de red física comprometidos o retirar inmediatamente documentos en papel de la vista pública.
2. *Cadena de Custodia*: Registrar el inventario de hojas retiradas, discos duros intervenidos o bitácoras de sistema con sello temporal y firma de los custodios.
3. *Prohibición de Alteración*: Queda terminantemente prohibido reiniciar o formatear servidores implicados sin antes haber extraído las imágenes forenses o volcados de memoria.

== Evaluación de Impacto y Protocolo de Notificación
El DPO conduce una evaluación de impacto considerando:
1. La naturaleza de los datos (datos identificativos vs. datos sensibles o biométricos).
2. Si los datos se encontraban protegidos mediante mecanismos que impidan su lectura a personas no autorizadas (ej. trituración inmediata o cifrado).
3. La probabilidad real de daño patrimonial o discriminación para los titulares.

*Determinación del Estado de Notificación (`notification_state`)*:
- *EVALUADO_NO_REQUIERE*: Cuando el riesgo residual para los titulares sea insignificante (ej. lista recuperada y destruida de inmediato).
- *NOTIFICADO_AUTORIDAD_ANPDP*: Cuando exista riesgo razonable de perjuicio grave a postulantes o trabajadores, formalizándose ante la Dirección General de Protección de Datos Personales (MINJUSDH).
- *NOTIFICADO_TITULARES*: Comunicación directa y transparente a las personas afectadas indicando las medidas de mitigación recomendadas.

== Erradicación y Recuperación
- Aplicación de parches de configuración, cambios obligatorios de contraseñas de acceso y destrucción física certificada de material impreso expuesto.
- Validación por parte de DUTIC de que la operación ha vuelto al estado seguro antes de autorizar el reinicio normal de actividades.

== Cierre y Apertura de Cadena CAPA (Cláusula 10.2)
Todo incidente calificado como Alto o Crítico desencadena obligatoriamente la emisión de una Solicitud de Acción Correctiva (SAC) en el registro `G4-REG-CAPA-01`, con designación de responsable, fecha límite de implementación y análisis de causa raíz.
