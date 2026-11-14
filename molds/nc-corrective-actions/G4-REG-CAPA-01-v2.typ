#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
  title: "Registro de No Conformidades y Acciones Correctivas (CAPA)",
  code: "G4-REG-CAPA-01",
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
      summary: "Emisión inicial aprobada para la certificación inicial ISO/IEC 27701:2019. Trazabilidad de hallazgos y acciones correctivas en sedes centrales Arequipa."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia: Incorporación de hallazgos derivados de auditorías de aplicaciones web, teletrabajo y pruebas de penetración en portal de admisión."
    ),
  )
)

= Propósito y Fundamento Normativo
Este registro consolida la trazabilidad de no conformidades y acciones correctivas del SGPI UNSA bajo las Cláusulas 9.2.2 y 10.2 de la norma ISO/IEC 27701:2025, extendiendo el seguimiento a la infraestructura tecnológica virtualizada post-pandemia.

= Cadena Histórica de Remediación (Periodos 2019 – 2022)

#table(
  columns: (55pt, 55pt, 1fr, 80pt, 50pt, 55pt, 80pt),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, center, left, left, center, center, left),
  table.header([*Hallazgo*], [*Código NC*], [*Causa Raíz y Acción Correctiva (CAPA)*], [*Dueño / Cargo*], [*Plazo*], [*Estado RAG*], [*Evidencia PIMS*]),
  
  [AUD-2019-H01],
  [NC-2019-01],
  [
    *Causa:* Falta de trituración física en admisión presencial.\
    *Acción:* Trituradoras de microcorte e instructivo de destrucción.
  ],
  [Dr. Walter Delgado\ (Dir. Admisión)],
  [2019-06-30],
  rag-tag("VERDE"),
  [#text(size: 6.5pt)[pims:G4-PRC-INC-01:v1:chunk:18-24]],

  [INC-2019-H02],
  [NC-2019-02],
  [
    *Causa:* Envío manual de planillas sin cifrado.\
    *Acción:* Reglas DLP en Exchange y tokens de cifrado.
  ],
  [Lic. Martha Córdova\ (Subdir. Personal)],
  [2019-10-31],
  rag-tag("VERDE"),
  [#text(size: 6.5pt)[pims:G4-REG-INC-01:v1:chunk:30-42]],

  [AUD-2022-H01],
  [NC-2022-01],
  [
    *Causa:* Falla IDOR en API backend de admisión virtual (`/ficha`).\
    *Acción:* Validación estricta de autorización de sesión JWT en endpoints y revisión SAST en pipeline CI/CD.
  ],
  [Mg. Lucía Valdivia\ (Directora DUTIC)],
  [2022-04-30],
  rag-tag("VERDE"),
  [#text(size: 6.5pt)[pims:G4-REG-INC-01:v2:chunk:45-60]],

  [INC-2022-H02],
  [NC-2022-02],
  [
    *Causa:* Script de réplica de bases de datos sin alerta proactiva ante timeout.\
    *Acción:* Agente de monitoreo Zabbix con notificación inmediata por canal seguro al administrador.
  ],
  [Ing. Marco Pinto\ (Admin. BD DUTIC)],
  [2022-08-31],
  rag-tag("VERDE"),
  [#text(size: 6.5pt)[pims:G4-REG-INC-01:v2:chunk:62-75]]
)

= Evaluación de Eficacia Institucional (Cláusula 10.2.e)
La revisión del Comité de Privacidad confirmó la eficacia de las medidas correctivas implementadas en la arquitectura web, evidenciando cero incidentes de fuga de información en los procesos de admisión 2022-II.
