#import "template.typ": doc-template, status-tag, rag-tag, callout

#show: doc-template.with(
  title: "Registro de No Conformidades y Acciones Correctivas (CAPA)",
  code: "G4-REG-CAPA-01",
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
      summary: "Emisión inicial aprobada para la certificación inicial ISO/IEC 27701:2019. Trazabilidad de hallazgos y acciones correctivas en sedes centrales Arequipa."
    ),
    (
      version: "2.0",
      date: "2022-09-10",
      author: "Ing. Carlos M. Benítez",
      summary: "Actualización post-pandemia: Incorporación de hallazgos derivados de auditorías de aplicaciones web, teletrabajo y pruebas de penetración en portal de admisión."
    ),
    (
      version: "3.0",
      date: "2025-10-28",
      author: "Ing. Carlos M. Benítez",
      summary: "Recertificación bajo ISO/IEC 27701:2025 (segunda edición): Cadena CAPA multisede integrando Filial Camaná y Filial El Pedregal (Majes), gestión MDM de laptops y controles anti-phishing."
    ),
  )
)

= Propósito y Fundamento Normativo
Este registro consolida la trazabilidad integral de hallazgos, no conformidades y acciones correctivas del SGPI UNSA bajo las Cláusulas 9.2.2 y 10.2 de la norma ISO/IEC 27701:2025, abarcando las sedes centrales de Arequipa y las filiales regionales descentralizadas de Camaná y El Pedregal.

= Cadena Consolidada de Remediación (Periodos 2019 – 2025)

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
    *Causa:* Falla IDOR en API backend de admisión virtual.\
    *Acción:* Validación estricta JWT en endpoints y SAST continuo.
  ],
  [Mg. Lucía Valdivia\ (Directora DUTIC)],
  [2022-04-30],
  rag-tag("VERDE"),
  [#text(size: 6.5pt)[pims:G4-REG-INC-01:v2:chunk:45-60]],

  [INC-2022-H02],
  [NC-2022-02],
  [
    *Causa:* Timeout en réplica de base de datos sin alarma.\
    *Acción:* Monitor Zabbix con alertas SMS al administrador.
  ],
  [Ing. Marco Pinto\ (Admin. BD DUTIC)],
  [2022-08-31],
  rag-tag("VERDE"),
  [#text(size: 6.5pt)[pims:G4-REG-INC-01:v2:chunk:62-75]],

  [INC-2025-H01],
  [NC-2025-01],
  [
    *Causa:* Inexistencia de verificación forzosa de BitLocker en laptops de filiales previo a su traslado.\
    *Acción:* Política MDM centralizada que bloquea puertos USB y exige TPM 2.0 y BitLocker XTS-AES 256 en todo terminal de filial.
  ],
  [Dr. Marcos Cárdenas\ (Coord. Filial Camaná)],
  [2025-05-30],
  rag-tag("VERDE"),
  [#text(size: 6.5pt)[pims:G4-REG-INC-01:v3:chunk:78-95]],

  [INC-2025-H02],
  [NC-2025-02],
  [
    *Causa:* Transmisión directa de cambios de cuentas bancarias sin reconciliación hash contra Sisgedo.\
    *Acción:* Implementación de protocolo de doble firma digital y validación hash antes del lote bancario mensual.
  ],
  [Lic. Martha Córdova\ (Subdir. Personal)],
  [2025-09-30],
  rag-tag("VERDE"),
  [#text(size: 6.5pt)[pims:G4-REG-INC-01:v3:chunk:98-112]],

  [AUD-2025-H03],
  [NC-2025-03],
  [
    *Causa:* Vulnerabilidad humana ante campañas sofisticadas de spear-phishing en operadores de nóminas de filiales.\
    *Acción:* Módulo intensivo de simulación de phishing y examen práctico obligatorio en la Academia UNSA.
  ],
  [Ing. Carlos M. Benítez\ (OSI / DPO)],
  [2025-12-15],
  rag-tag("AMARILLO"),
  [#text(size: 6.5pt)[pims:G4-CAP-INC-01:v3:chunk:50-70]]
)

= Análisis Estadístico de Acciones Correctivas
- *Acciones Implementadas y Verificadas (Verde):* 6 de 7 (85.7%)
- *Acciones En Proceso dentro de plazo (Ámbar):* 1 de 7 (14.3% - NC-2025-03 con límite 2025-12-15)
- *Acciones Vencidas o No Atendidas (Rojo):* 0 (0%)
- *Índice de Eficacia Global del SGPI:* Conforme según umbral de revisión de la Dirección (Cláusula 9.3).
