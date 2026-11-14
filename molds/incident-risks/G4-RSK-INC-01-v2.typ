#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
  title: "Matriz y Plan de Tratamiento de Riesgos de Incidentes",
  code: "G4-RSK-INC-01",
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
      summary: "Evaluación inicial de riesgos de privacidad para la certificación ISO/IEC 27701:2019. Escenarios de incidentes en sedes centrales Arequipa (Admisión y Planillas presenciales)."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia: Incorporación de riesgos cibernéticos en portal web de admisiones, teletrabajo con VPN y copias de seguridad remotas."
    ),
  )
)

= Metodología de Evaluación y Criterios Actualizados
Se mantiene el criterio de estimación dual conforme a la Cláusula 6.1.2.c de la norma ISO/IEC 27701:2025, integrando los vectores derivados de la virtualización de servicios y acceso remoto por teletrabajo.

= Matriz de Evaluación de Riesgos de Incidentes Digitales (Periodo 2022)

#table(
  columns: (45pt, 1fr, 75pt, 30pt, 30pt, 45pt, 50pt),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, left, left, center, center, center, center),
  table.header([*ID*], [*Escenario de Riesgo de Incidente*], [*Activo / Proceso*], [*P*], [*IT*], [*R. Inh.*], [*Nivel*]),
  
  [R-04],
  [Explotación de fallas IDOR en API backend de admisión exponiendo documentos digitalizados.],
  [Portal Web Admisión\ (`admision.unsa`)],
  [4], [5], [20],
  rag-tag("ROJO"),

  [R-05],
  [Suplantación de identidad de personal de planillas en teletrabajo mediante phishing de credenciales VPN.],
  [Túnel VPN SSL\ (Planillas / Remoto)],
  [3], [5], [15],
  rag-tag("ROJO"),

  [R-06],
  [Corrupción o indisponibilidad de la base de datos salarial por fallo en scripts de respaldo nocturno.],
  [Base de Datos\ (PostgreSQL DUTIC)],
  [3], [4], [12],
  rag-tag("AMARILLO")
)

= Plan de Tratamiento de Riesgos Cibernéticos (Cláusula 6.1.3f)

#table(
  columns: (40pt, 1fr, 80pt, 85pt, 55pt, 45pt, 45pt),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, left, left, left, center, center, center),
  table.header([*Ref.*], [*Controles Aplicables (Anexo A)*], [*Dueño del Riesgo*], [*Recursos Requeridos*], [*Plazo*], [*R. Res.*], [*Estado*]),
  
  [R-04],
  [
    *A.3.27/A.3.28:* Ciclo de desarrollo seguro y análisis SAST en CI/CD.\
    *A.3.23:* Tokens JWT efímeros firmados con RSA-4096.
  ],
  [Mg. Lucía Valdivia\ (Directora DUTIC)],
  [Herramienta de análisis estático SonarQube y capacitación en OWASP Top 10.],
  [2022-04-30],
  [4],
  rag-tag("VERDE"),

  [R-05],
  [
    *A.3.23:* Autenticación multifactor (MFA) obligatoria en cliente VPN.\
    *A.3.17:* Capacitación en phishing para teletrabajo.
  ],
  [Lic. Martha Córdova\ (Subdir. Personal)],
  [Despliegue de TOTP institucional y taller en Aula Virtual UNSA.],
  [2022-05-31],
  [4],
  rag-tag("VERDE"),

  [R-06],
  [
    *A.3.24:* Copias de seguridad automáticas con hash SHA-256 verificado.\
    *A.3.25:* Monitoreo automatizado con agente Zabbix.
  ],
  [Ing. Marco Pinto\ (Admin. BD DUTIC)],
  [Almacenamiento secundario NAS en clúster independiente y script de prueba.],
  [2022-06-30],
  [3],
  rag-tag("VERDE")
)

= Declaración de Aceptación de Riesgos Residuales (Cláusula 6.1.3g)
El Comité de Gobierno Digital y Privacidad ratifica la eficacia de las medidas aplicadas, aprobando formalmente los niveles de riesgo residual alcanzados.
