#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
  title: "Registro de No Conformidades y Acciones Correctivas (CAPA)",
  code: "G4-REG-CAPA-01",
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
      summary: "Emisión inicial aprobada para la certificación inicial ISO/IEC 27701:2019. Trazabilidad de hallazgos y acciones correctivas en sedes centrales Arequipa."
    ),
  )
)

= Propósito y Fundamento Normativo
Este registro formaliza la cadena completa de tratamiento ante desvíos e incidentes del Sistema de Gestión de Privacidad de la Información (SGPI) de la UNSA, en estricto cumplimiento de las Cláusulas 9.2.2 (Programa de auditoría interna) y 10.2 (No conformidades y acciones correctivas) de la norma ISO/IEC 27701:2025.

= Estructura de la Cadena de Remediación
Toda acción correctiva sigue la secuencia metodológica trazable:
1. *Hallazgo (`Finding`)*: Origen identificado en auditoría interna (Cl. 9.2.2) o derivado del reporte de incidentes (Cl. 8.1 / `G4-REG-INC-01`).
2. *No Conformidad (`NC`)*: Incumplimiento clasificado respecto a requisitos de la norma o procedimientos institucionales.
3. *Análisis de Causa Raíz*: Determinación de los factores que permitieron la ocurrencia del desvío (metodología 5 Porqués / Ishikawa).
4. *Acción Correctiva (`CAPA`)*: Medida estructural para eliminar la causa y prevenir su recurrencia.
5. *Seguimiento RAG*: Indicador semáforo (Rojo = Pendiente/Vencida, Ámbar = En Proceso, Verde = Implementada y Eficaz).
6. *Evidencia PIMS*: Identificador unívoco del registro o archivo en el PIMS institucional (`pims:<doc_id>:v<version>:chunk:<lines>`).

= Cadena de Hallazgos y Acciones Correctivas (Periodo 2019)

#table(
  columns: (55pt, 55pt, 1fr, 80pt, 50pt, 55pt, 80pt),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + luma(190),
  align: (center, center, left, left, center, center, left),
  table.header([*Hallazgo*], [*Código NC*], [*Causa Raíz y Acción Correctiva (CAPA)*], [*Dueño / Cargo*], [*Plazo*], [*Estado RAG*], [*Evidencia PIMS*]),
  
  [AUD-2019-H01],
  [NC-2019-01],
  [
    *Causa:* Ausencia de protocolo de destrucción inmediata de borradores impresos de admisión.\
    *Acción:* Instalación de trituradoras de microcorte en puertas de admisión e instructivo obligatorio.
  ],
  [Dr. Walter Delgado\ (Dir. Admisión)],
  [2019-06-30],
  rag-tag("VERDE"),
  [#text(size: 6.5pt)[pims:G4-PRC-INC-01:v1:chunk:18-24]],

  [INC-2019-H02],
  [NC-2019-02],
  [
    *Causa:* Envío manual de planillas docentes sin validación de listas de distribución ni cifrado.\
    *Acción:* Configuración de reglas DLP en servidor Exchange y firma de confidencialidad de operadores.
  ],
  [Lic. Martha Córdova\ (Subdir. Personal)],
  [2019-10-31],
  rag-tag("VERDE"),
  [#text(size: 6.5pt)[pims:G4-REG-INC-01:v1:chunk:30-42]]
)

= Verificación de Eficacia (Cláusula 10.2.e)
La eficacia de las acciones `NC-2019-01` y `NC-2019-02` fue formalmente constatada por el Oficial de Seguridad en la auditoría de seguimiento de diciembre de 2019, verificando cero recurrencias en manipulación física de datos de postulantes y eliminación de errores de correo masivo.
