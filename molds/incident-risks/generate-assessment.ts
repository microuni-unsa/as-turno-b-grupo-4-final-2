#!/usr/bin/env bun
/**
 * molds/incident-risks/generate-assessment.ts
 *
 * Generador scriptado de libro XLSX para el Cuadro de Evaluación de Riesgos de Privacidad (SGPI UNSA).
 * Estructura fiel al Apéndice 1 oficial del estándar:
 * - Hoja 1: "Cuadro de evaluación de riesgos" (Layout exacto Apéndice 1)
 * - Hoja 2: "Categorías" (Catálogo de activos de información y PII adaptado a privacidad)
 * - Hoja 3: "Amenazas" (Catálogo de amenazas a la privacidad ISO/IEC 27701:2025)
 * - Hoja 4: "Vulnerabilidades" (Catálogo de vulnerabilidades de privacidad ISO/IEC 27701:2025)
 *
 * Zero dependencias npm externas: utiliza OpenXML y compresión DEFLATE nativa Bun / Node.
 *
 * Ejecución con Bun:
 *   bun molds/incident-risks/generate-assessment.ts [archivo_salida.xlsx] [version]
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as zlib from "node:zlib";

export interface RiskEvaluationRow {
  id: string;
  asset: string;
  asset_owner: string;
  threat: string;
  vuln: string;
  risk_owner: string;
  cons: number;
  prob: number;
  risk: number;
  existing_controls: string;
  version_scope?: string;
}

export const SYNTHETIC_EVAL_ROWS: RiskEvaluationRow[] = [
  // v1 (2019)
  {
    id: "R-01",
    asset: "Padrones físicos de postulantes (Admisión presencial)",
    asset_owner: "Director de Admisión (Dr. Walter Delgado)",
    threat: "Sustracción o extravío de listados residuales con huellas y fotos",
    vuln: "Custodia precaria y descarte sin triturar en sedes",
    risk_owner: "Dr. Walter Delgado (Dir. Admisión)",
    cons: 2, prob: 1, risk: 3,
    existing_controls: "Custodia bajo llave en archivadores y revisión manual en puerta",
    version_scope: "v1 (2019)"
  },
  {
    id: "R-02",
    asset: "Servidor de correo Exchange (Nóminas)",
    asset_owner: "Subdirectora de Personal (Lic. Martha Elena Córdova)",
    threat: "Divulgación indebida de boletas de pago por error de envío masivo",
    vuln: "Ausencia de reglas DLP en Exchange y boletas sin contraseña",
    risk_owner: "Lic. Martha Elena Córdova (Subdir. Personal)",
    cons: 2, prob: 1, risk: 3,
    existing_controls: "Envío por lotes y confirmación visual manual de destinatario",
    version_scope: "v1 (2019)"
  },
  {
    id: "R-03",
    asset: "Data Center DUTIC (Pabellón Ingenierías)",
    asset_owner: "Directora DUTIC (Mg. Lucía Valdivia Paredes)",
    threat: "Acceso físico no autorizado a servidores y bases de datos",
    vuln: "Cerradura tradicional sin registro de auditoría biométrica",
    risk_owner: "Mg. Lucía Valdivia (Directora DUTIC)",
    cons: 2, prob: 1, risk: 3,
    existing_controls: "Cuaderno físico de visitas y control por vigilante de turno",
    version_scope: "v1 (2019)"
  },

  // v2 (2022)
  {
    id: "R-04",
    asset: "Portal Web Admisión (admision.unsa.edu.pe)",
    asset_owner: "Directora DUTIC (Mg. Lucía Valdivia Paredes)",
    threat: "Explotación de fallas de autorización IDOR en API de expedientes",
    vuln: "Validación insuficiente de sesión y endpoints sin control de roles",
    risk_owner: "Mg. Lucía Valdivia (Directora DUTIC)",
    cons: 2, prob: 1, risk: 3,
    existing_controls: "Análisis SonarQube en pipeline CI/CD y tokens JWT RSA-4096",
    version_scope: "v2 (2022)"
  },
  {
    id: "R-05",
    asset: "Túnel VPN SSL (Planillas / Teletrabajo)",
    asset_owner: "Subdirectora de Personal (Lic. Martha Elena Córdova)",
    threat: "Compromiso de credenciales VPN de operadores de nómina por phishing",
    vuln: "Cuentas de acceso remoto sin autenticación multifactor (MFA)",
    risk_owner: "Lic. Martha Elena Córdova (Subdir. Personal)",
    cons: 2, prob: 1, risk: 3,
    existing_controls: "Contraseñas complejas de 12 caracteres y rotación trimestral",
    version_scope: "v2 (2022)"
  },
  {
    id: "R-06",
    asset: "Base de Datos PostgreSQL (DUTIC)",
    asset_owner: "Administrador de BD DUTIC (Ing. Marco Pinto)",
    threat: "Fallo o corrupción de respaldos nocturnos durante replicación",
    vuln: "Omisión de pruebas periódicas de restauración completa (DRP)",
    risk_owner: "Ing. Marco Pinto (Admin. BD DUTIC)",
    cons: 2, prob: 1, risk: 3,
    existing_controls: "Backups diarios diferenciales con script cron",
    version_scope: "v2 (2022)"
  },

  // v3 (2025)
  {
    id: "R-07",
    asset: "Laptops móviles de registro biométrico (Filial Camaná)",
    asset_owner: "Coordinador Filial Camaná (Dr. Marcos A. Cárdenas)",
    threat: "Sustracción física de laptop con padrones biométricos en traslado",
    vuln: "Disco local sin cifrado de hardware en tránsito y bloqueo débil",
    risk_owner: "Dr. Marcos A. Cárdenas (Coord. Filial Camaná)",
    cons: 2, prob: 1, risk: 3,
    existing_controls: "Contraseña de arranque en BIOS y candado Kensington básico",
    version_scope: "v3 (2025)"
  },
  {
    id: "R-08",
    asset: "Túnel VPN IPSec (Filial El Pedregal - Majes)",
    asset_owner: "Subdirectora de Personal (Lic. Martha Elena Córdova)",
    threat: "Colisión o alteración de cuentas bancarias en sincronización de filial",
    vuln: "Falta de validación de doble firma digital antes del abono bancario",
    risk_owner: "Lic. Martha Elena Córdova (Subdir. Personal)",
    cons: 2, prob: 1, risk: 3,
    existing_controls: "Túnel IPSec estándar con autenticación pre-shared key (PSK)",
    version_scope: "v3 (2025)"
  },
  {
    id: "R-09",
    asset: "Bandejas de correo institucional (Filiales y Sedes Centrales)",
    asset_owner: "Directora DUTIC (Mg. Lucía Valdivia Paredes)",
    threat: "Spear-phishing bancario dirigido a operadores de dispersión de fondos",
    vuln: "Filtrado permisivo en registros DNS sin política DMARC reject",
    risk_owner: "Ing. Carlos M. Benítez (OSI / DPO)",
    cons: 2, prob: 2, risk: 4,
    existing_controls: "Filtro antispam básico en pasarela de correo",
    version_scope: "v3 (2025)"
  }
];

export const PRIVACY_CATEGORIES = [
  ["Categorías de activos de información y PII", null, null],
  [null, null, null],
  ["Los siguientes son activos de información y datos personales (PII) bajo el alcance del SGPI de la UNSA.", null, null],
  ["Esta lista clasifica los activos relevantes para la confidencialidad, integridad, disponibilidad y privacidad (ISO/IEC 27701:2025).", null, null],
  [null, null, null],
  ["Personas (Titulares de PII y Operadores)", null, null],
  [null, "Postulantes a admisión de pregrado y posgrado (PII principals)", null],
  [null, "Docentes ordinarios y contratados de sedes centrales y filiales", null],
  [null, "Personal administrativo y de servicios de la universidad", null],
  [null, "Alta dirección y miembros del Comité de Gobierno Digital y Privacidad", null],
  [null, "Oficial de Seguridad de la Información y Delegado de Protección de Datos (OSI / DPO)", null],
  [null, "Operadores y analistas de planillas y recursos humanos", null],
  [null, "Personal de soporte técnico, redes y bases de datos de DUTIC", null],
  [null, "Proveedores y contratistas con acceso a infraestructura o datos (encargados)", null],
  [null, null, null],
  ["Aplicaciones y bases de datos", null, null],
  [null, "Portal web de admisión de pregrado (admision.unsa.edu.pe)", null],
  [null, "Sistema Integrado de Gestión Documental y Firma Digital (Sisgedo)", null],
  [null, "Base de datos PostgreSQL institucional de planillas y nóminas", null],
  [null, "Módulo de Prevención de Fuga de Datos (DLP) en servidor de correo", null],
  [null, "Sistema de Gestión de Privacidad de la Información (GESTITEL PIMS / unsa.27k.pe)", null],
  [null, "Plataforma de Aula Virtual y Academia de Capacitación SGPI", null],
  [null, null, null],
  ["Documentación y soportes de información (Físicos y Digitales)", null, null],
  [null, "Padrones y fichas de inscripción de postulantes con datos biométricos", null],
  [null, "Boletas electrónicas y resúmenes de pago de haberes", null],
  [null, "Registro oficial y bitácora de incidentes de privacidad (G4-REG-INC-01)", null],
  [null, "Declaración de Aplicabilidad de controles de privacidad (G4-SOA-01)", null],
  [null, "Matriz y reportes de evaluación y tratamiento de riesgos (G4-RSK-INC-01 / G4-PLN-RSK-01)", null],
  [null, "Contratos, convenios y acuerdos de confidencialidad con proveedores", null],
  [null, "Actas de sesiones del Comité SGPI y revisiones por la dirección", null],
  [null, null, null],
  ["TI, comunicaciones y equipamiento de procesamiento", null, null],
  [null, "Servidores de base de datos y clústeres de aplicaciones en Data Center", null],
  [null, "Laptops corporativas de registro biométrico en filiales Camaná y Majes", null],
  [null, "Estaciones de trabajo de operadores de planillas en Subdirección de Personal", null],
  [null, "Routers perimetrales y firewalls con terminación VPN IPSec / SSL", null],
  [null, "Dispositivos de almacenamiento secundario NAS para copias de seguridad", null],
  [null, "Lectores biométricos autónomos y cámaras de videovigilancia CCTV", null],
  [null, "Trituradoras de papel certificadas con nivel de seguridad DIN P-4", null],
  [null, null, null],
  ["Infraestructura física", null, null],
  [null, "Data Center principal de DUTIC en Pabellón de Ingenierías", null],
  [null, "Oficinas de la Dirección de Admisión en Sedes Centrales Arequipa", null],
  [null, "Módulos de admisión y aulas de examen en Filial Camaná (RR 0142-2025)", null],
  [null, "Oficinas administrativas en Filial El Pedregal - Majes (RR 0143-2025)", null],
  [null, "Bóveda de archivo documental de recursos humanos y planillas", null],
  [null, null, null],
  ["Servicios tercerizados y vínculos externos", null, null],
  [null, "Servicio de dispersión bancaria y pasarela de pago (Banco de la Nación)", null],
  [null, "Enlaces dedicados de telecomunicaciones entre sedes Arequipa y filiales", null],
  [null, "Servicio de nube y correo corporativo institucional", null],
  [null, "Entidad supervisora: Autoridad Nacional de Protección de Datos Personales (ANPD)", null]
];

export const PRIVACY_THREATS = [
  ["Catálogo de amenazas a la privacidad de la información (ISO/IEC 27701)", null],
  [null, null],
  ["La siguiente es la lista de amenazas normativas y operativas adaptadas al contexto de protección de PII.", null],
  ["Alineado con los controles de las Tablas A.1 y A.3 de ISO/IEC 27701:2025 y Ley N° 29733.", null],
  [null, null],
  [null, "Divulgación accidental de PII por error de envío de correo masivo"],
  [null, "Exposición de listados físicos con DNI y puntajes en recepción pública"],
  [null, "Explotación de vulnerabilidades de autorización web (IDOR / Broken Access Control)"],
  [null, "Ataques de ingeniería social y spear-phishing bancario dirigidos a operadores de nómina"],
  [null, "Sustracción física o robo de laptops móviles con plantillas biométricas"],
  [null, "Acceso físico no autorizado a consolas y servidores en Data Center"],
  [null, "Colisión o corrupción de datos de cuentas bancarias en enlaces de red de filiales"],
  [null, "Intercepción o espionaje de tráfico en tránsito en redes inalámbricas públicas"],
  [null, "Fallo de integridad o retraso en la disponibilidad de respaldos de bases de datos"],
  [null, "Descarte de documentación impresa con PII sin destrucción mecánica (mesa limpia)"],
  [null, "Uso indebido de privilegios administrativos para exportación masiva de padrones"],
  [null, "Infección de estaciones de trabajo con malware o ransomware secuestrador de datos"],
  [null, "Fuga de datos personales por personal saliente o contratistas sin acuerdo de reserva"],
  [null, "Tratamiento de PII para finalidades no consentidas por los postulantes o docentes"],
  [null, "Incumplimiento de plazos de atención de derechos ARCO de titulares de datos"],
  [null, "Omisión de notificación de brechas de privacidad a la autoridad competente (ANPD)"],
  [null, "Falla en los vínculos de telecomunicaciones entre sedes centrales y filiales regionales"],
  [null, "Indisponibilidad del portal de admisión durante cierres de convocatoria"],
  [null, "Suplantación de identidad de postulantes en exámenes de admisión presencial"],
  [null, "Alteración no autorizada de historiales académicos o laborales en bases de datos"],
  [null, "Transferencia transfronteriza no autorizada de datos personales a servicios de nube no homologados"],
  [null, "Acceso no autorizado mediante reutilización de credenciales comprometidas en filtraciones externas"]
];

export const PRIVACY_VULNERABILITIES = [
  ["Catálogo de vulnerabilidades de privacidad (ISO/IEC 27701)", null],
  [null, null],
  ["La siguiente es la lista institucional de debilidades técnicas, físicas y organizativas.", null],
  ["Cada escenario de riesgo se vincula a una vulnerabilidad específica para determinar su mitigación.", null],
  [null, null],
  [null, "Ausencia de autenticación multifactor (MFA/TOTP) en accesos remotos y túneles VPN"],
  [null, "Discos locales de laptops de filiales sin cifrado de hardware BitLocker / TPM 2.0"],
  [null, "Falta de herramientas de prevención de fuga de datos (DLP) en plataformas de correo"],
  [null, "Validación insuficiente de sesión en endpoints de consulta de información personal"],
  [null, "Inexistencia de políticas DMARC reject, DKIM y SPF en registros DNS institucionales"],
  [null, "Carencia de trituradoras de microcorte P-4 en áreas de atención presencial de admisión"],
  [null, "Ausencia de cerraduras biométricas con registro auditable en salas de servidores"],
  [null, "Omisión de pruebas periódicas de restauración de copias de seguridad de bases de datos"],
  [null, "Falta de doble firma digital y validación telemática en archivos de dispersión salarial"],
  [null, "Contraseñas por defecto o no rotadas en dispositivos de telecomunicaciones"],
  [null, "Capacitación insuficiente del personal en detección y reporte rápido de brechas de PII"],
  [null, "Falta de segregación de funciones entre desarrollo, pruebas y producción"],
  [null, "Permisos permisivos de lectura en carpetas compartidas de red institucional"],
  [null, "Dispositivos móviles personales (BYOD) utilizados sin control de gestión MDM corporativo"],
  [null, "Registros de eventos (logs) no centralizados ni protegidos contra alteración"],
  [null, "Claves criptográficas almacenadas en texto plano en repositorios de código"],
  [null, "Inexistencia de acuerdos de nivel de servicio (SLA) de seguridad con proveedores de conectividad"],
  [null, "Políticas de privacidad y cláusulas de consentimiento desactualizadas o ambiguas"],
  [null, "Protocolos de retención y eliminación segura de archivos pasivos no implementados"]
];

// -------------------------------------------------------------
// PURE TYPESCRIPT STANDALONE OPENXML MULTI-SHEET BUILDER
// -------------------------------------------------------------

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getColRef(colIdx: number): string {
  let s = "";
  let c = colIdx;
  while (c >= 0) {
    s = String.fromCharCode(65 + (c % 26)) + s;
    c = Math.floor(c / 26) - 1;
  }
  return s;
}

interface SheetDef {
  name: string;
  rows: (string | number | null)[][];
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

    const localHeader = Buffer.alloc(30 + pathBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(8, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressedSize, 18);
    localHeader.writeUInt32LE(uncompressedSize, 22);
    localHeader.writeUInt16LE(pathBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);
    pathBuf.copy(localHeader, 30);

    localHeaders.push(localHeader);
    localHeaders.push(compressedData);

    const centralHeader = Buffer.alloc(46 + pathBuf.length);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(8, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressedSize, 20);
    centralHeader.writeUInt32LE(uncompressedSize, 24);
    centralHeader.writeUInt16LE(pathBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    pathBuf.copy(centralHeader, 46);

    centralHeaders.push(centralHeader);
    offset += localHeader.length + compressedData.length;
  }

  const centralDirOffset = offset;
  let centralDirSize = 0;
  for (const ch of centralHeaders) {
    centralDirSize += ch.length;
  }

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDirSize, 12);
  eocd.writeUInt32LE(centralDirOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localHeaders, ...centralHeaders, eocd]);
}

export function buildMultiSheetXlsx(sheets: SheetDef[]): Buffer {
  const entries: ZipEntry[] = [];

  let overrides = "";
  sheets.forEach((_, idx) => {
    overrides += `  <Override PartName="/xl/worksheets/sheet${idx + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>\n`;
  });

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
${overrides}  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;
  entries.push({ path: "[Content_Types].xml", data: Buffer.from(contentTypesXml, "utf-8") });

  const pkgRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
  entries.push({ path: "_rels/.rels", data: Buffer.from(pkgRelsXml, "utf-8") });

  let wbRels = "";
  sheets.forEach((_, idx) => {
    wbRels += `  <Relationship Id="rId${idx + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${idx + 1}.xml"/>\n`;
  });
  wbRels += `  <Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>\n`;

  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${wbRels}</Relationships>`;
  entries.push({ path: "xl/_rels/workbook.xml.rels", data: Buffer.from(workbookRelsXml, "utf-8") });

  let sheetsXml = "";
  sheets.forEach((s, idx) => {
    sheetsXml += `    <sheet name="${escapeXml(s.name)}" sheetId="${idx + 1}" r:id="rId${idx + 1}"/>\n`;
  });

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
${sheetsXml}  </sheets>
</workbook>`;
  entries.push({ path: "xl/workbook.xml", data: Buffer.from(workbookXml, "utf-8") });

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font><name val="Calibri"/><sz val="11"/></font>
    <font><name val="Calibri"/><sz val="11"/><b/></font>
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
  <cellXfs count="2">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0"/>
  </cellXfs>
</styleSheet>`;
  entries.push({ path: "xl/styles.xml", data: Buffer.from(stylesXml, "utf-8") });

  sheets.forEach((s, sIdx) => {
    let rowsXml = "";
    s.rows.forEach((row, rIdx) => {
      const rowNum = rIdx + 1;
      let cellsXml = "";
      row.forEach((val, cIdx) => {
        if (val === null || val === undefined) return;
        const colRef = getColRef(cIdx);
        const cellRef = `${colRef}${rowNum}`;
        if (typeof val === "number") {
          cellsXml += `<c r="${cellRef}"><v>${val}</v></c>`;
        } else {
          cellsXml += `<c r="${cellRef}" t="inlineStr"><is><t>${escapeXml(String(val))}</t></is></c>`;
        }
      });
      rowsXml += `    <row r="${rowNum}">${cellsXml}</row>\n`;
    });

    const worksheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews>
    <sheetView tabSelected="${sIdx === 0 ? "1" : "0"}" workbookViewId="0"/>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <sheetData>
${rowsXml}  </sheetData>
</worksheet>`;
    entries.push({ path: `xl/worksheets/sheet${sIdx + 1}.xml`, data: Buffer.from(worksheetXml, "utf-8") });
  });

  return createZipArchive(entries);
}

export function generateAssessmentXlsx(outputPath?: string, targetVersion?: "v1" | "v2" | "v3" | "all"): string {
  const targetPath = outputPath || path.join(__dirname, "G4-RSK-INC-01-evaluacion.xlsx");

  let rowsToInclude: RiskEvaluationRow[];
  if (targetVersion === "v1") {
    rowsToInclude = SYNTHETIC_EVAL_ROWS.filter(r => r.version_scope === "v1 (2019)");
  } else if (targetVersion === "v2") {
    rowsToInclude = SYNTHETIC_EVAL_ROWS.filter(r => r.version_scope === "v1 (2019)" || r.version_scope === "v2 (2022)");
  } else {
    rowsToInclude = SYNTHETIC_EVAL_ROWS;
  }

  // Exact headers matching Apéndice 1 Cuadro de evaluación de riesgos
  const mainSheetRows: (string | number | null)[][] = [
    ["Cuadro de evaluación de riesgos", null, "Implementado desde el 2025-10-28 hasta el 2026-10-28", null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null],
    [
      "No",
      "Nombre del activo",
      "Propietario del activo",
      "Amenaza",
      "Vulnerabilidad",
      "Propietario del riesgo",
      "Consecuencia",
      "Probabilidad",
      "Riesgo",
      "Controles existentes"
    ],
    ...rowsToInclude.map(r => [
      r.id,
      r.asset,
      r.asset_owner,
      r.threat,
      r.vuln,
      r.risk_owner,
      r.cons,
      r.prob,
      r.risk,
      r.existing_controls
    ])
  ];

  const sheets: SheetDef[] = [
    {
      name: "Cuadro de evaluación de riesgos",
      rows: mainSheetRows
    },
    {
      name: "Categorías",
      rows: PRIVACY_CATEGORIES
    },
    {
      name: "Amenazas",
      rows: PRIVACY_THREATS
    },
    {
      name: "Vulnerabilidades",
      rows: PRIVACY_VULNERABILITIES
    }
  ];

  const zipBuffer = buildMultiSheetXlsx(sheets);
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  fs.writeFileSync(targetPath, zipBuffer);
  console.log(`OK: Cuadro de Evaluación de Riesgos XLSX generado exitosamente en: ${targetPath}`);
  console.log(`     Total de filas de evaluación: ${rowsToInclude.length} | 4 hojas completas (Apéndice 1)`);
  return targetPath;
}

if (import.meta.main) {
  const customOutput = process.argv[2];
  const customVersion = process.argv[3] as "v1" | "v2" | "v3" | "all" | undefined;
  generateAssessmentXlsx(customOutput, customVersion);
}
