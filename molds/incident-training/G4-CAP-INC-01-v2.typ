#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
  title: "Módulo Formativo: Respuesta a Incidentes de Privacidad",
  code: "G4-CAP-INC-01",
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
      summary: "Emisión inicial del módulo formativo para el personal de Admisión y Planillas en sedes centrales Arequipa (certificación ISO/IEC 27701:2019)."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia: Migración a entorno virtual vía Aula Virtual UNSA, incorporación de módulos de seguridad web, gestión de accesos remotos y teletrabajo seguro."
    ),
  )
)

= Justificación y Adaptación Post-Pandemia
La digitalización integral de las admisiones universitarias y el régimen de teletrabajo implementado en la Subdirección de Personal exigen actualizar las competencias del personal conforme a las Cláusulas 7.2, 7.3 y el Control A.3.17 de la norma ISO/IEC 27701:2025. El módulo se reorienta hacia la detección y mitigación de amenazas en plataformas digitales y canales web.

= Estructura Curricular del Módulo Virtualizado (Versión 2.0)
- *Duración total*: 8 horas cronológicas (4 sesiones sincrónicas vía Google Meet institucional + actividades asincrónicas en Aula Virtual UNSA).
- *Público objetivo*: Operadores de la plataforma `admision.unsa.edu.pe`, personal de soporte de DUTIC y analistas de planillas.

#table(
  columns: (50pt, 120pt, 1fr, 60pt),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, left, left, center),
  table.header([*Sesión*], [*Tema Principal*], [*Contenido Detallado y Práctico*], [*Horas*]),
  [Sesión 1], [Amenazas Web y Brechas en Admisión Digital], [Vectores de ataque web típicos: IDOR, phishing dirigido a postulantes, robo de sesiones JWT y brechas según Guía B.3.12.], [2 horas],
  [Sesión 2], [Seguridad en Teletrabajo y VPN], [Configuración segura del cliente VPN SSL corporativo, uso obligatorio de MFA y política de escritorio y pantalla limpios en trabajo remoto.], [2 horas],
  [Sesión 3], [Reporte y Trazabilidad de Evidencia Digital], [Captura de registros de auditoría, bitácoras de servidor web, llenado del registro `G4-REG-INC-01` y preservación forense de capturas de pantalla.], [2 horas],
  [Sesión 4], [Simulación Práctica en Aula Virtual], [Simulacro en línea de intento de acceso no autorizado y evaluación virtual automatizada con banco de preguntas aleatorizado.], [2 horas]
)

= Evaluación y Trazabilidad del Aprendizaje (Cláusula 7.2)
- *Pre-test diagnóstico en línea*: Evaluación de 10 preguntas previa al inicio de la primera sesión.
- *Post-test de suficiencia*: Examen de 20 preguntas con casos prácticos sobre análisis de incidentes de privacidad.
- *Umbral de Aprobación*: Calificación igual o mayor a 14.0/20. Aquellos participantes que no alcancen la nota mínima deben participar en un taller de reforzamiento obligatorio para garantizar la competencia requerida por la norma.
