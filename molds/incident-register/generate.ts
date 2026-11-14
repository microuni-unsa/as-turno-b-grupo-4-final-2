#!/usr/bin/env bun
/**
 * molds/incident-register/generate.ts
 *
 * Generador scriptado de libro XLSX para el Registro de Incidentes de Privacidad (SGPI UNSA).
 * Estándar normativo: ISO/IEC 27701:2025 Cláusula 8.1 + 7.5.1 y Guía B.3.12 (Breach records).
 * NOTA CRÍTICA DE ALCANCE: Criterios de notificación determinados por la organización bajo Cl. 8.1/7.5.1.
 * NO APLICA reloj arbitrario de 72 horas (GDPR Art. 33 es dato de referencia, no norma operativa).
 *
 * Ejecución con Bun:
 *   bun molds/incident-register/generate.ts [archivo_salida.xlsx]
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as zlib from "node:zlib";

interface IncidentRecord {
  incident_id: string;
  version_scope: "v1 (2019)" | "v2 (2022)" | "v3 (2025)";
  awareness_at: string;
  severity: "CRÍTICO" | "ALTO" | "MEDIO" | "BAJO";
  categories: string;
  principals_affected: string;
  reporter_name: string;
  reported_to: string;
  pii_compromised_description: string;
  containment: string;
  data_recovered: string;
  consequences: string;
  notification_state: string;
  status: "CERRADA" | "EN_SEGUIMIENTO" | "CONTENIDA";
  corrective_action_ref: string;
}

const SYNTHETIC_INCIDENTS: IncidentRecord[] = [
  // Era v1: 2019 Certificación inicial (Sedes centrales Arequipa, admisiones y planillas presenciales)
  {
    incident_id: "G4-INC-2019-001",
    version_scope: "v1 (2019)",
    awareness_at: "2019-05-14T08:30:00-05:00",
    severity: "MEDIO",
    categories: "CONFIDENCIALIDAD / DIVULGACIÓN_FÍSICA",
    principals_affected: "18 postulantes ordinarios",
    reporter_name: "Lic. Manuel Cornejo (Vocal de Pabellón Ingenierías)",
    reported_to: "Ing. Carlos M. Benítez (OSI / DPO)",
    pii_compromised_description: "Listado impreso con nombres completos, DNI y resultados preliminares expuesto en mesa de recepción.",
    containment: "Retiro inmediato del documento impreso, destrucción en trituradora certificada y emisión de memorando a vocales.",
    data_recovered: "100% de las hojas físicas recuperadas; no hubo copias digitales ni difusión externa.",
    consequences: "Exposición momentánea de datos identificativos sin perjuicio patrimonial ni discriminatorio a postulantes.",
    notification_state: "EVALUADO_NO_REQUIERE (Criterio Cl. 8.1: Riesgo residual insignificante, no hubo fuga externa; no procede notificación regulatoria)",
    status: "CERRADA",
    corrective_action_ref: "G4-CAPA-2019-01"
  },
  {
    incident_id: "G4-INC-2019-002",
    version_scope: "v1 (2019)",
    awareness_at: "2019-09-22T14:15:00-05:00",
    severity: "ALTO",
    categories: "CONFIDENCIALIDAD / ERROR_ENVÍO_CORREO",
    principals_affected: "42 docentes de la Facultad de Ciencias Histórico Sociales",
    reporter_name: "Téc. Rosa Huamán (Asistente de Planillas)",
    reported_to: "Lic. Martha Elena Córdova (Subdirectora de Personal)",
    pii_compromised_description: "Envío accidental de consolidado de boletas de pago por correo masivo sin copia oculta ni clave de cifrado.",
    containment: "Bloqueo preventivo de la bandeja de salida en servidor Exchange, recall de mensajes y solicitud formal de borrado a los destinatarios.",
    data_recovered: "39 de 42 destinatarios confirmaron borrado de correo y confirmaron no haber descargado el archivo.",
    consequences: "Divulgación cruzada de importes remunerativos y descuentos de ley entre colegas de la misma facultad.",
    notification_state: "NOTIFICADO_TITULARES_INTERNOS (Comunicación directa y transparente a los 42 docentes con medidas de mitigación)",
    status: "CERRADA",
    corrective_action_ref: "G4-CAPA-2019-02"
  },

  // Era v2: 2022 Post-pandemia (Migración digital forzada, reducción de alcance físico, Sisgedo y teletrabajo)
  {
    incident_id: "G4-INC-2022-001",
    version_scope: "v2 (2022)",
    awareness_at: "2022-03-18T11:00:00-05:00",
    severity: "CRÍTICO",
    categories: "ACCESO_NO_AUTORIZADO / VULNERABILIDAD_PORTAL_WEB",
    principals_affected: "1,240 postulantes inscritos en línea",
    reporter_name: "Equipo de Monitoreo SOC-DUTIC",
    reported_to: "Ing. Carlos M. Benítez (OSI / DPO)",
    pii_compromised_description: "Falla de autorización IDOR en endpoint /api/postulante/ficha permitía visualizar certificados de estudios y DNI escaneados.",
    containment: "Parche de emergencia en backend desplegado en 45 minutos; rotación de tokens JWT y revocación de sesiones anónimas.",
    data_recovered: "Registros de base de datos intactos; auditoría de access logs confirmó 12 accesos anómalos externos.",
    consequences: "Visualización no autorizada de metadatos de postulantes por una IP externa automatizada.",
    notification_state: "NOTIFICADO_AUTORIDAD_ANPDP (Notificación formal a la ANPDP Perú según procedimiento institucional sin límite de 72h + comunicado preventivo)",
    status: "CERRADA",
    corrective_action_ref: "G4-CAPA-2022-01"
  },
  {
    incident_id: "G4-INC-2022-002",
    version_scope: "v2 (2022)",
    awareness_at: "2022-07-05T16:40:00-05:00",
    severity: "BAJO",
    categories: "DISPONIBILIDAD / FALLO_BACKUP_TEMPORAL",
    principals_affected: "0 (Sin impacto directo a derechos de titulares)",
    reporter_name: "Ing. Marco Pinto (Administrador de BD DUTIC)",
    reported_to: "Mg. Lucía Valdivia Paredes (Directora DUTIC)",
    pii_compromised_description: "Fallo en la replicación nocturna de la base de datos de planillas de docentes hacia el almacenamiento secundario.",
    containment: "Reejecución manual del script de respaldo diferencial; verificación de suma de verificación SHA-256.",
    data_recovered: "100% de la réplica sincronizada exitosamente.",
    consequences: "Retraso de 6 horas en la disponibilidad del snapshot de respaldo; sin pérdida ni fuga de datos.",
    notification_state: "EVALUADO_NO_REQUIERE (Evento operativo interno resuelto; no constituye violación de privacidad de PII)",
    status: "CERRADA",
    corrective_action_ref: "G4-CAPA-2022-02"
  },

  // Era v3: 2025 Recertificación ISO/IEC 27701:2025 + Filiales Camaná y El Pedregal (Majes)
  {
    incident_id: "G4-INC-2025-001",
    version_scope: "v3 (2025)",
    awareness_at: "2025-04-12T09:20:00-05:00",
    severity: "ALTO",
    categories: "CONFIDENCIALIDAD / ROBO_DISPOSITIVO_TERMINAL",
    principals_affected: "115 postulantes de la Filial Camaná",
    reporter_name: "Dr. Marcos A. Cárdenas (Coordinador Filial Camaná)",
    reported_to: "Ing. Carlos M. Benítez (OSI / DPO)",
    pii_compromised_description: "Sustracción de laptop de registro biométrico durante el proceso de admisión descentralizado en Camaná.",
    containment: "Bloqueo remoto inmediato vía MDM corporativo; borrado seguro remoto activado; confirmación de cifrado BitLocker XTS-AES 256.",
    data_recovered: "Dispositivo no recuperado físicamente; datos cifrados inaccesibles sin llave TPM institucional.",
    consequences: "Pérdida material del equipo; riesgo mínimo de exfiltración de PII gracias a política de cifrado de punto final A.3.22/A.3.26.",
    notification_state: "EVALUADO_NO_REQUIERE (Cifrado robusto verificado técnicamente; el robo no generó acceso ilegítimo a PII según B.3.12)",
    status: "CERRADA",
    corrective_action_ref: "G4-CAPA-2025-01"
  },
  {
    incident_id: "G4-INC-2025-002",
    version_scope: "v3 (2025)",
    awareness_at: "2025-08-20T15:10:00-05:00",
    severity: "MEDIO",
    categories: "INTEGRIDAD / ERROR_SINCRONIZACION_FILIAL",
    principals_affected: "48 trabajadores de la Filial El Pedregal (Majes)",
    reporter_name: "Lic. Martha Elena Córdova (Subdirectora de Personal)",
    reported_to: "Mg. Lucía Valdivia Paredes (Directora DUTIC)",
    pii_compromised_description: "Discrepancia en cuentas bancarias de abono por colisión de registros entre VPN local de Majes y servidor central de planillas.",
    containment: "Pausa preventiva de la transferencia bancaria automática; reconciliación contra padrón firmado en Sisgedo.",
    data_recovered: "Datos de cuentas rectificados antes de la ejecución de abonos; cero transferencias erróneas.",
    consequences: "Retraso de 24 horas en el pago a personal de la filial; integridad de datos plenamente restablecida.",
    notification_state: "NOTIFICADO_TITULARES_INTERNOS (Aviso informativo a los trabajadores de la filial sobre ajuste de cronograma)",
    status: "CERRADA",
    corrective_action_ref: "G4-CAPA-2025-02"
  },
  {
    incident_id: "G4-INC-2025-003",
    version_scope: "v3 (2025)",
    awareness_at: "2025-11-03T10:05:00-05:00",
    severity: "BAJO",
    categories: "CONFIDENCIALIDAD / INTENTO_PHISHING_PLANILLAS",
    principals_affected: "0 (Ataque frustrado)",
    reporter_name: "Ing. Carlos M. Benítez (OSI / DPO)",
    reported_to: "Comité de Gobierno Digital y Privacidad",
    pii_compromised_description: "Campaña de spear-phishing suplantando al Banco de la Nación dirigida a operadores de nómina de sedes Arequipa y filiales.",
    containment: "Aislamiento de enlaces maliciosos en firewall de borde, bloqueo de dominio atacante y alerta preventiva a todo el personal.",
    data_recovered: "Ningún usuario introdujo credenciales institucionales.",
    consequences: "Incremento de métrica de detección preventiva; sin compromiso de datos personales ni credenciales.",
    notification_state: "EVALUADO_NO_REQUIERE (Incidente frustrado sin brecha de información de privacidad)",
    status: "CERRADA",
    corrective_action_ref: "G4-CAPA-2025-03"
  }
];

// -------------------------------------------------------------
// PURE TYPESCRIPT STANDALONE ZIP & OPENXML BUILDER (NO NPM DEPS)
// -------------------------------------------------------------

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSheetXml(records: IncidentRecord[]): string {
  const headers = [
    "ID Incidente",
    "Versión / Alcance",
    "Fecha/Hora Detección (awareness_at)",
    "Severidad",
    "Categorías del Incidente",
    "Titulares Afectados (principals_affected)",
    "Reportado Por",
    "Reportado A",
    "Descripción de PII Comprometida",
    "Acciones de Contención (containment)",
    "Datos Recuperados",
    "Consecuencias / Impacto",
    "Estado de Notificación (notification_state)",
    "Estado Operativo",
    "Ref. Acción Correctiva (CAPA)"
  ];

  let rowsXml = `<row r="1" spans="1:${headers.length}">`;
  headers.forEach((h, idx) => {
    const colRef = String.fromCharCode(65 + idx) + "1";
    rowsXml += `<c r="${colRef}" t="inlineStr"><is><t>${escapeXml(h)}</t></is></c>`;
  });
  rowsXml += `</row>`;

  records.forEach((r, rIdx) => {
    const rowNum = rIdx + 2;
    const values = [
      r.incident_id,
      r.version_scope,
      r.awareness_at,
      r.severity,
      r.categories,
      r.principals_affected,
      r.reporter_name,
      r.reported_to,
      r.pii_compromised_description,
      r.containment,
      r.data_recovered,
      r.consequences,
      r.notification_state,
      r.status,
      r.corrective_action_ref
    ];

    rowsXml += `<row r="${rowNum}" spans="1:${values.length}">`;
    values.forEach((val, cIdx) => {
      let colLetters = "";
      if (cIdx < 26) {
        colLetters = String.fromCharCode(65 + cIdx);
      } else {
        colLetters = String.fromCharCode(64 + Math.floor(cIdx / 26)) + String.fromCharCode(65 + (cIdx % 26));
      }
      const cellRef = `${colLetters}${rowNum}`;
      rowsXml += `<c r="${cellRef}" t="inlineStr"><is><t>${escapeXml(val)}</t></is></c>`;
    });
    rowsXml += `</row>`;
  });

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews>
    <sheetView tabSelected="1" workbookViewId="0"/>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <sheetData>
    ${rowsXml}
  </sheetData>
</worksheet>`;
}

function buildWorkbookXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Incidentes SGPI UNSA" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;
}

function buildWorkbookRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
}

function buildStylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1">
    <font><name val="Calibri"/><sz val="11"/></font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1">
    <border><left/><right/><top/><bottom/></border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
  </cellXfs>
</styleSheet>`;
}

function buildContentTypesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;
}

function buildPackageRelsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
}

interface ZipEntry {
  path: string;
  data: Buffer;
}

function createZipArchive(entries: ZipEntry[]): Buffer {
  const localHeaders: Buffer[] = [];
  const centralHeaders: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const pathBuf = Buffer.from(entry.path, "utf-8");
    const uncompressedData = entry.data;
    const uncompressedSize = uncompressedData.length;
    const crc = zlib.crc32(uncompressedData);
    const compressedData = zlib.deflateRawSync(uncompressedData);
    const compressedSize = compressedData.length;

    // Local file header (30 bytes + name length)
    const localHeader = Buffer.alloc(30 + pathBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // signature
    localHeader.writeUInt16LE(20, 4);         // version needed to extract
    localHeader.writeUInt16LE(0, 6);          // flags
    localHeader.writeUInt16LE(8, 8);          // compression method: Deflate
    localHeader.writeUInt16LE(0, 10);         // mod time
    localHeader.writeUInt16LE(0, 12);         // mod date
    localHeader.writeUInt32LE(crc, 14);       // crc-32
    localHeader.writeUInt32LE(compressedSize, 18);
    localHeader.writeUInt32LE(uncompressedSize, 22);
    localHeader.writeUInt16LE(pathBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);         // extra field length
    pathBuf.copy(localHeader, 30);

    localHeaders.push(localHeader);
    localHeaders.push(compressedData);

    // Central directory file header (46 bytes + name length)
    const centralHeader = Buffer.alloc(46 + pathBuf.length);
    centralHeader.writeUInt32LE(0x02014b50, 0); // signature
    centralHeader.writeUInt16LE(20, 4);          // version made by
    centralHeader.writeUInt16LE(20, 6);          // version needed
    centralHeader.writeUInt16LE(0, 8);           // flags
    centralHeader.writeUInt16LE(8, 10);          // compression method
    centralHeader.writeUInt16LE(0, 12);          // mod time
    centralHeader.writeUInt16LE(0, 14);          // mod date
    centralHeader.writeUInt32LE(crc, 16);        // crc-32
    centralHeader.writeUInt32LE(compressedSize, 20);
    centralHeader.writeUInt32LE(uncompressedSize, 24);
    centralHeader.writeUInt16LE(pathBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);          // extra field length
    centralHeader.writeUInt16LE(0, 32);          // comment length
    centralHeader.writeUInt16LE(0, 34);          // disk number start
    centralHeader.writeUInt16LE(0, 36);          // internal attributes
    centralHeader.writeUInt32LE(0, 38);          // external attributes
    centralHeader.writeUInt32LE(offset, 42);     // relative offset of local header
    pathBuf.copy(centralHeader, 46);

    centralHeaders.push(centralHeader);

    offset += localHeader.length + compressedData.length;
  }

  const centralDirOffset = offset;
  let centralDirSize = 0;
  for (const ch of centralHeaders) {
    centralDirSize += ch.length;
  }

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);                 // signature
  eocd.writeUInt16LE(0, 4);                          // disk number
  eocd.writeUInt16LE(0, 6);                          // central dir disk
  eocd.writeUInt16LE(entries.length, 8);             // num entries on this disk
  eocd.writeUInt16LE(entries.length, 10);            // total entries
  eocd.writeUInt32LE(centralDirSize, 12);            // size of central dir
  eocd.writeUInt32LE(centralDirOffset, 16);          // offset of central dir
  eocd.writeUInt16LE(0, 20);                         // comment length

  return Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
}

export function generateIncidentXlsx(outputPath?: string): string {
  const targetPath = outputPath || path.join(__dirname, "G4-REG-INC-01-registros.xlsx");

  const entries: ZipEntry[] = [
    { path: "[Content_Types].xml", data: Buffer.from(buildContentTypesXml(), "utf-8") },
    { path: "_rels/.rels", data: Buffer.from(buildPackageRelsXml(), "utf-8") },
    { path: "xl/_rels/workbook.xml.rels", data: Buffer.from(buildWorkbookRelsXml(), "utf-8") },
    { path: "xl/workbook.xml", data: Buffer.from(buildWorkbookXml(), "utf-8") },
    { path: "xl/styles.xml", data: Buffer.from(buildStylesXml(), "utf-8") },
    { path: "xl/worksheets/sheet1.xml", data: Buffer.from(buildSheetXml(SYNTHETIC_INCIDENTS), "utf-8") }
  ];

  const zipBuffer = createZipArchive(entries);
  fs.writeFileSync(targetPath, zipBuffer);
  console.log(`OK: Registro XLSX de incidentes generado exitosamente en: ${targetPath}`);
  console.log(`     Total de incidentes históricos sintetizados: ${SYNTHETIC_INCIDENTS.length} (v1/v2/v3)`);
  return targetPath;
}

if (import.meta.main) {
  const customOutput = process.argv[2];
  generateIncidentXlsx(customOutput);
}
