#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
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
  )
)

= Objetivo
Establecer los procedimientos normalizados para identificar, contener, remediar y evaluar los incidentes de seguridad que afecten los datos personales (PII) bajo control de la UNSA, adaptados a la infraestructura digitalizada post-pandemia, conforme a ISO/IEC 27701:2025 Cláusula 8.1, Controles A.3.11, A.3.12 y Guías B.3.11 / B.3.12.

= Alcance Institucional (Versión 2.0 — Post-Pandemia)
1. *Proceso Misional*: Admisión en línea de Pregrado (`admision.unsa.edu.pe`), que comprende el registro digital de postulantes, carga de documentos escaneados, validación de identidad virtual y publicación de resultados.
2. *Proceso de Soporte*: Planillas de Remuneraciones operadas en modalidad híbrida y remota mediante acceso seguro VPN SSL corporativo.
3. *Sedes y Perímetro*: Campus Área de Ingenierías, Biomédicas y Sociales en Arequipa. Se formaliza la *exclusión de los archivos físicos históricos* pasivos del alcance operativo activo.
4. *Infraestructura Digital*: Aplicaciones web institucionales en clúster virtualizado, bases de datos PostgreSQL/Oracle institucionales y túneles de acceso remoto con autenticación multifactor (MFA).

= Base Normativa y Criterio Institucional de Notificación
- *ISO/IEC 27701:2025*: Cláusulas 8.1, 7.5.1, Controles A.3.11, A.3.12 y Guías B.3.11 / B.3.12.
- *Ley N° 29733 de Protección de Datos Personales del Perú*.

#callout(title: "AUTONOMÍA DE CRITERIO EN NOTIFICACIÓN DE BRECHAS", color: rgb("#0284c7"))[
  La calificación de procedencia de notificación ante la autoridad o titulares se sustenta en la Cláusula 8.1 y la Guía B.3.12, analizando si la brecha expuso PII no cifrada o con impacto adverso probable. Se ratifica que el plazo de 72 horas del RGPD europeo (Anexo D) no vincula operativamente al SGPI de la UNSA.
]

= Roles Actualizados del Equipo de Respuesta
- *CSIRT-UNSA (DUTIC)*: Monitoreo activo de logs de acceso web, detección de anomalías IDOR, inyecciones web y fuerza bruta.
- *Oficial de Seguridad / DPO*: Calificación legal-técnica del incidente, coordinación con la asesoría jurídica institucional y elaboración de informes para la ANPDP en caso de corresponder.
- *Administradores de Plataforma*: Despliegue de parches de emergencia (hotfixes) y revocación inmediata de sesiones web activas.

= Flujo de Respuesta ante Incidentes Digitales

== Detección y Monitoreo Automatizado
- Alertas generadas por el sistema SIEM institucional y analizadores de registros web ante anomalías de tráfico.
- Reportes manuales de usuarios postulantes o trabajadores vía correo `seguridad.informacion@unsa.edu.pe`.

== Clasificación de Incidentes en Entornos Digitales
#table(
  columns: (70pt, 95pt, 1fr, 70pt),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, left, left, center),
  table.header([*Nivel*], [*Criterio Digital*], [*Ejemplo Típico v2.0*], [*Tiempo Máx.*]),
  rag-tag("CRÍTICO"), [Exfiltración o acceso anómalo masivo vía fallas de aplicación web.], [Vulnerabilidad IDOR en API de admisión exponiendo certificados de 1,240 postulantes.], [45 minutos],
  rag-tag("ALTO"), [Compromiso de credencial con privilegios de administración o VPN.], [Cuenta comprometida de analista de planillas con acceso a base de datos salarial.], [2 horas],
  rag-tag("MEDIO"), [Denegación de servicio no destructiva o fallo temporal de réplica.], [Caída temporal del portal de inscripción por sobrecarga sin fuga de PII.], [6 horas],
  rag-tag("BAJO"), [Intentos masivos de autenticación fallida bloqueados por firewall.], [Ataque de diccionario contra portal institucional neutralizado por WAF.], [12 horas]
)

== Contención y Neutralización Lógica
1. *Bloqueo Inmediato*: Restricción de direcciones IP origen en el Web Application Firewall (WAF).
2. *Revocación de Credenciales*: Invalidación global de tokens JWT y reseteo forzoso de contraseñas de cuentas afectadas.
3. *Preservación Forense*: Volcado de registros de acceso del servidor web (Nginx/Apache), consultas a base de datos y memoria volátil sin reiniciar servicios.

== Evaluación y Notificación
Conforme a los criterios de la Guía B.3.12:
- Registro formal de: momento de conocimiento, descripción de PII concernida, vector explotado y acciones de mitigación adoptadas.
- Notificación formal a la ANPDP Perú si se confirma acceso indebido a información confidencial de postulantes o personal.

== Cierre y Trazabilidad CAPA (Cláusula 10.2)
Toda brecha digital se documenta en el Libro de Incidentes `G4-REG-INC-01` y desencadena una acción correctiva en `G4-REG-CAPA-01` con revisión de código seguro o fortalecimiento de controles WAF.
