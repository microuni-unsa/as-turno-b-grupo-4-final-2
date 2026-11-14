#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
  title: "Matriz y Plan de Tratamiento de Riesgos de Incidentes",
  code: "G4-RSK-INC-01",
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
      summary: "Evaluación inicial de riesgos de privacidad para la certificación ISO/IEC 27701:2019. Escenarios de incidentes en sedes centrales Arequipa (Admisión y Planillas presenciales)."
    ),
  )
)

= Metodología de Evaluación de Riesgos de Privacidad (Cláusula 6.1.2)
La gestión de riesgos del SGPI UNSA sigue un enfoque de doble impacto conforme a la Cláusula 6.1.2.c.1 de la norma ISO/IEC 27701:2025, evaluando tanto el impacto operacional y legal sobre la Universidad como las posibles consecuencias adversas sobre los derechos y libertades de los titulares de datos personales (PII principals).

== Criterios de Calificación
- *Probabilidad (P)*: Escala de 1 (Muy Rara) a 5 (Frecuente / Inminente).
- *Impacto Organizacional (IO)*: Escala de 1 (Insignificante) a 5 (Catastrófico institucional).
- *Impacto en Titulares de PII (IT)*: Escala de 1 (Leve incomodidad) a 5 (Daño patrimonial grave o discriminación).
- *Nivel de Riesgo Inherente*: $R = P times max("IO", "IT")$.
  - *Rojo (15 a 25)*: Riesgo Crítico / Inaceptable (requiere mitigación inmediata obligatoria).
  - *Ámbar (8 a 14)*: Riesgo Medio (requiere plan de tratamiento formal a corto plazo).
  - *Verde (1 a 7)*: Riesgo Bajo / Aceptable (sujeto a monitoreo periódico).

= Matriz de Evaluación de Riesgos de Incidentes (Periodo 2019)

#table(
  columns: (45pt, 1fr, 75pt, 30pt, 30pt, 45pt, 50pt),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, left, left, center, center, center, center),
  table.header([*ID*], [*Escenario de Riesgo de Incidente*], [*Activo / Proceso*], [*P*], [*IT*], [*R. Inh.*], [*Nivel*]),
  
  [R-01],
  [Extravío o sustracción de padrones impresos de admisión con DNI, fotos y huellas de postulantes.],
  [Padrones físicos\ (Admisión)],
  [3], [5], [15],
  rag-tag("ROJO"),

  [R-02],
  [Divulgación indebida de información salarial de personal docente por error de correo electrónico masivo.],
  [Servidor Exchange\ (Planillas)],
  [4], [4], [16],
  rag-tag("ROJO"),

  [R-03],
  [Ingreso no autorizado al centro de cómputo institucional y alteración de servidores de base de datos.],
  [Data Center DUTIC\ (Ingenierías)],
  [2], [4], [8],
  rag-tag("AMARILLO")
)

= Plan de Tratamiento de Riesgos de Incidentes (Cláusula 6.1.3f)
Conforme a la Cláusula 6.1.3.f, se formula el siguiente plan detallado para mitigar los riesgos identificados:

#table(
  columns: (40pt, 1fr, 80pt, 85pt, 55pt, 45pt, 45pt),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, left, left, left, center, center, center),
  table.header([*Ref.*], [*Controles Aplicables (Anexo A)*], [*Dueño del Riesgo*], [*Recursos Requeridos*], [*Plazo*], [*R. Res.*], [*Estado*]),
  
  [R-01],
  [
    *A.3.11/A.3.12:* Procedimiento de respuesta.\
    *A.3.19:* Política de mesa limpia y trituradoras de microcorte en puertas de admisión.
  ],
  [Dr. Walter Delgado\ (Dir. Admisión)],
  [Compra de 8 trituradoras de alta seguridad P-4 y capacitación.],
  [2019-06-30],
  [4],
  rag-tag("VERDE"),

  [R-02],
  [
    *A.3.7:* Reglas de transferencia segura.\
    *A.3.26:* Cifrado de archivos PDF de boletas y módulo DLP en servidor Exchange.
  ],
  [Lic. Martha Córdova\ (Subdir. Personal)],
  [Licenciamiento módulo DLP de correo y script de cifrado automático.],
  [2019-07-31],
  [4],
  rag-tag("VERDE"),

  [R-03],
  [
    *A.3.4:* Control de roles físicos.\
    *A.3.9:* Cerradura biométrica y bitácora física foliada de visitas al Data Center.
  ],
  [Mg. Lucía Valdivia\ (Directora DUTIC)],
  [Instalación de lector biométrico autónomo y cámara de videovigilancia.],
  [2019-05-31],
  [3],
  rag-tag("VERDE")
)

= Formalización de Aceptación del Riesgo Residual (Cláusula 6.1.3g)
Los Dueños de Riesgo institucionales y el Comité SGPI formalizan la aceptación de los niveles de riesgo residual alcanzados (todos clasificados en zona Verde: puntajes 3 a 4), declarándolos tolerables y conformes con el apetito de riesgo institucional.
