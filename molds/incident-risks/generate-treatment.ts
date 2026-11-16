#!/usr/bin/env bun
/**
 * molds/incident-risks/generate-treatment.ts
 *
 * Generador scriptado de libro XLSX para el Cuadro de Tratamiento de Riesgos de Privacidad (SGPI UNSA).
 * Estructura fiel al Apéndice 2 oficial del estándar:
 * - Hoja 1: "Cuadro tratamiento riesgos" (Layout exacto Apéndice 2: activos + valores antes + tratamiento + valores después)
 * - Hoja 2: "Opciones" (Opciones normativas para el tratamiento de riesgos)
 * - Hoja 3: "Controles" (Controles completos de ISO/IEC 27701:2025 Tablas A.1 y A.3)
 *
 * Zero dependencias npm externas: utiliza OpenXML y compresión DEFLATE nativa Bun / Node.
 *
 * Ejecución con Bun:
 *   bun molds/incident-risks/generate-treatment.ts [archivo_salida.xlsx] [version]
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as zlib from "node:zlib";

export interface RiskTreatmentRow {
  id: string;
  asset: string;
  asset_owner: string;
  threat: string;
  vuln: string;
  risk_owner: string;
  before_c: number;
  before_p: number;
  before_r: number;
  option: string;
  controls_implementation: string;
  after_c: number;
  after_p: number;
  after_r: number;
  version_scope?: string;
}

export const SYNTHETIC_TREATMENT_ROWS: RiskTreatmentRow[] = [
  // v1 (2019)
  {
    id: "R-01",
    asset: "Padrones físicos de postulantes (Admisión presencial)",
    asset_owner: "Director de Admisión (Dr. Walter Delgado)",
    threat: "Sustracción o extravío de listados residuales con huellas y fotos",
    vuln: "Custodia precaria y descarte sin triturar en sedes",
    risk_owner: "Dr. Walter Delgado (Dir. Admisión)",
    before_c: 2, before_p: 1, before_r: 3,
    option: "1. Elección de controles",
    controls_implementation: "A.3.11, A.3.12 (Procedimiento respuesta) y A.3.19 (Mesa limpia y 8 trituradoras P-4 de microcorte en módulos)",
    after_c: 1, after_p: 0, after_r: 1,
    version_scope: "v1 (2019)"
  },
  {
    id: "R-02",
    asset: "Servidor de correo Exchange (Nóminas)",
    asset_owner: "Subdirectora de Personal (Lic. Martha Elena Córdova)",
    threat: "Divulgación indebida de boletas de pago por error de envío masivo",
    vuln: "Ausencia de reglas DLP en Exchange y boletas sin contraseña",
    risk_owner: "Lic. Martha Elena Córdova (Subdir. Personal)",
    before_c: 2, before_p: 1, before_r: 3,
    option: "1. Elección de controles",
    controls_implementation: "A.3.7 (Transferencia segura), A.3.26 (Cifrado PDF individual con DNI) y módulo DLP Exchange con bloqueo por patrones",
    after_c: 1, after_p: 0, after_r: 1,
    version_scope: "v1 (2019)"
  },
  {
    id: "R-03",
    asset: "Data Center DUTIC (Pabellón Ingenierías)",
    asset_owner: "Directora DUTIC (Mg. Lucía Valdivia Paredes)",
    threat: "Acceso físico no autorizado a servidores y bases de datos",
    vuln: "Cerradura tradicional sin registro de auditoría biométrica",
    risk_owner: "Mg. Lucía Valdivia (Directora DUTIC)",
    before_c: 2, before_p: 1, before_r: 3,
    option: "1. Elección de controles",
    controls_implementation: "A.3.4, A.3.9 (Cerradura biométrica con log de auditoría IP) y videovigilancia CCTV 24/7 con retención 90 días",
    after_c: 1, after_p: 0, after_r: 1,
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
    before_c: 2, before_p: 1, before_r: 3,
    option: "1. Elección de controles",
    controls_implementation: "A.3.10, A.3.23 (Validación JWT RSA-4096, análisis estático SAST SonarQube en CI/CD y validación estricta de pertenencia de sesión)",
    after_c: 1, after_p: 0, after_r: 1,
    version_scope: "v2 (2022)"
  },
  {
    id: "R-05",
    asset: "Túnel VPN SSL (Planillas / Teletrabajo)",
    asset_owner: "Subdirectora de Personal (Lic. Martha Elena Córdova)",
    threat: "Compromiso de credenciales VPN de operadores de nómina por phishing",
    vuln: "Cuentas de acceso remoto sin autenticación multifactor (MFA)",
    risk_owner: "Lic. Martha Elena Córdova (Subdir. Personal)",
    before_c: 2, before_p: 1, before_r: 3,
    option: "1. Elección de controles",
    controls_implementation: "A.3.8, A.3.23 (Autenticación multifactor MFA/TOTP institucional mandatoria para todo teletrabajo y VPN)",
    after_c: 1, after_p: 0, after_r: 1,
    version_scope: "v2 (2022)"
  },
  {
    id: "R-06",
    asset: "Base de Datos PostgreSQL (DUTIC)",
    asset_owner: "Administrador de BD DUTIC (Ing. Marco Pinto)",
    threat: "Fallo o corrupción de respaldos nocturnos durante replicación",
    vuln: "Omisión de pruebas periódicas de restauración completa (DRP)",
    risk_owner: "Ing. Marco Pinto (Admin. BD DUTIC)",
    before_c: 2, before_p: 1, before_r: 3,
    option: "1. Elección de controles",
    controls_implementation: "A.3.14, A.3.24 (Copias automáticas en almacenamiento secundario NAS con verificación de integridad hash SHA-256 y simulacro semestral de restauración)",
    after_c: 1, after_p: 0, after_r: 1,
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
    before_c: 2, before_p: 1, before_r: 3,
    option: "1. Elección de controles",
    controls_implementation: "A.3.22 (Seguridad de terminales), A.3.26 (BitLocker XTS-AES 256 forzoso con chip TPM 2.0) y enrolamiento en MDM Microsoft Intune con borrado remoto",
    after_c: 1, after_p: 0, after_r: 1,
    version_scope: "v3 (2025)"
  },
  {
    id: "R-08",
    asset: "Túnel VPN IPSec (Filial El Pedregal - Majes)",
    asset_owner: "Subdirectora de Personal (Lic. Martha Elena Córdova)",
    threat: "Colisión o alteración de cuentas bancarias en sincronización de filial",
    vuln: "Falta de validación de doble firma digital antes del abono bancario",
    risk_owner: "Lic. Martha Elena Córdova (Subdir. Personal)",
    before_c: 2, before_p: 1, before_r: 3,
    option: "1. Elección de controles",
    controls_implementation: "A.3.7, A.3.14 (Transferencia y registros) y A.3.23 (Validación de doble firma digital tokenizada reconciliada con padrón firmado en Sisgedo)",
    after_c: 1, after_p: 0, after_r: 1,
    version_scope: "v3 (2025)"
  },
  {
    id: "R-09",
    asset: "Bandejas de correo institucional (Filiales y Sedes Centrales)",
    asset_owner: "Directora DUTIC (Mg. Lucía Valdivia Paredes)",
    threat: "Spear-phishing bancario dirigido a operadores de dispersión de fondos",
    vuln: "Filtrado permisivo en registros DNS sin política DMARC reject",
    risk_owner: "Ing. Carlos M. Benítez (OSI / DPO)",
    before_c: 2, before_p: 2, before_r: 4,
    option: "1. Elección de controles",
    controls_implementation: "A.3.17 (Taller en Academia UNSA) y A.3.28 (Políticas estrictas DMARC reject, DKIM y SPF institucional más simulación periódica)",
    after_c: 1, after_p: 0, after_r: 1,
    version_scope: "v3 (2025)"
  }
];

export const TREATMENT_OPTIONS = [
  ["Opciones para el tratamiento de riesgos de privacidad"],
  [null],
  ["1. Elección de controles (Mitigación mediante salvaguardas ISO/IEC 27701:2025)"],
  ["2. Transferencia de riesgos a terceros (Pólizas de seguro / Acuerdos contractuales)"],
  ["3. Evitar el riesgo (Cese de la actividad o eliminación del activo vulnerable)"],
  ["4. Aceptación del riesgo (Aprobación formal por la Alta Dirección cuando el riesgo residual es tolerable)"]
];

export const ISO_27701_CONTROLS = [
  ["Controles de acuerdo a las Tablas A.1 y A.3 de la norma ISO/IEC 27701:2025", null, null, null, null],
  [null, null, null, null, null],
  ["--- TABLA A.1: CONTROLES PARA RESPONSABLES DEL TRATAMIENTO (PII CONTROLLERS - 31 CONTROLES) ---", null, null, null, null],
  ["A.1.1.1", "Comprensión de la organización y de su contexto", "PII Controller", "Obligatorio", "Contexto de privacidad y partes interesadas"],
  ["A.1.1.2", "Determinación de roles y responsabilidades", "PII Controller", "Obligatorio", "Designación formal de DPO y comités"],
  ["A.1.1.3", "Evaluación de riesgos de privacidad de la información", "PII Controller", "Obligatorio", "Metodología de riesgo de impacto a titulares"],
  ["A.1.1.4", "Declaración de aplicabilidad (SoA)", "PII Controller", "Obligatorio", "Justificación de controles A.1 y A.3"],
  ["A.1.2.1", "Identificación de bases legales y propósitos", "PII Controller", "Obligatorio", "Fundamento de ley para admisiones y planillas"],
  ["A.1.2.2", "Identificación y documentación de propósitos", "PII Controller", "Obligatorio", "Finalidades explícitas y legítimas"],
  ["A.1.2.3", "Consulta y consentimiento de titulares de PII", "PII Controller", "Obligatorio", "Mecanismos de consentimiento libre e informado"],
  ["A.1.2.4", "Evaluación de impacto en la privacidad (PIA / EIPD)", "PII Controller", "Obligatorio", "Evaluaciones previas para datos sensibles"],
  ["A.1.2.5", "Limitación de la recolección de PII", "PII Controller", "Obligatorio", "Minimización estricta de datos recabados"],
  ["A.1.2.6", "Limitación del tratamiento de PII", "PII Controller", "Obligatorio", "Tratamiento restringido a finalidades autorizadas"],
  ["A.1.2.7", "Exactitud y calidad de la PII", "PII Controller", "Obligatorio", "Mantenimiento y rectificación de datos"],
  ["A.1.2.8", "Criterios de minimización de PII", "PII Controller", "Obligatorio", "Reducción de campos obligatorios en formularios"],
  ["A.1.2.9", "Registros de actividades de tratamiento (RoPA)", "PII Controller", "Obligatorio", "Inventario institucional de bancos de datos"],
  ["A.1.3.1", "Determinación de obligaciones hacia los titulares", "PII Controller", "Obligatorio", "Mapeo de derechos ARCO bajo Ley 29733"],
  ["A.1.3.2", "Suministro de información a los titulares de PII", "PII Controller", "Obligatorio", "Avisos de privacidad en portales y sedes"],
  ["A.1.3.3", "Suministro de mecanismos para modificar o retirar consentimiento", "PII Controller", "Obligatorio", "Canales accesibles de revocación"],
  ["A.1.3.4", "Mecanismos de atención de objeciones y derechos ARCO", "PII Controller", "Obligatorio", "Flujo procedimental con plazos normativos"],
  ["A.1.3.5", "Acceso a la PII por los titulares", "PII Controller", "Obligatorio", "Expedición de copias de datos personales"],
  ["A.1.3.6", "Rectificación y supresión de PII", "PII Controller", "Obligatorio", "Actualización o borrado seguro de legajos"],
  ["A.1.3.7", "Información a terceros sobre rectificación o supresión", "PII Controller", "Obligatorio", "Notificación a corresponsables y bancos"],
  ["A.1.3.8", "Provisión de copia de PII tratada", "PII Controller", "Obligatorio", "Portabilidad y entrega en formatos estructurados"],
  ["A.1.4.1", "Privacidad por diseño y por defecto", "PII Controller", "Obligatorio", "Integración de requisitos en desarrollo de software"],
  ["A.1.4.2", "Anonimización y seudonimización", "PII Controller", "Obligatorio", "Técnicas criptográficas y disociación de datos"],
  ["A.1.4.3", "Transmisión de PII mediante canales seguros", "PII Controller", "Obligatorio", "Cifrado TLS 1.3 y VPN IPSec en tránsito"],
  ["A.1.4.4", "Restricción de uso de PII en pruebas", "PII Controller", "Obligatorio", "Prohibición de datos reales en staging"],
  ["A.1.4.5", "Retención y eliminación segura de PII", "PII Controller", "Obligatorio", "Tablas de retención y borrado certificado"],
  ["A.1.4.6", "Disposición final de soportes de almacenamiento", "PII Controller", "Obligatorio", "Desmagnetización y destrucción física"],
  ["A.1.4.7", "Políticas para el uso de dispositivos móviles (BYOD)", "PII Controller", "Obligatorio", "Gestión MDM y directivas de terminales"],
  ["A.1.4.8", "Control de información documentada de privacidad", "PII Controller", "Obligatorio", "Versionado inmutable en repositorio PIMS"],
  ["A.1.4.9", "Preservación histórica de políticas ('Máquina del tiempo')", "PII Controller", "Obligatorio", "Conservación de versiones obsoletas descargables"],
  ["A.1.5.1", "Identificación de bases legales para transferencias de PII", "PII Controller", "Obligatorio", "Convenios de encargo de tratamiento"],
  ["A.1.5.2", "Transferencias transfronterizas de PII", "PII Controller", "Obligatorio", "Garantías de nivel adecuado según ANPD"],
  ["A.1.5.3", "Registros de transferencias de PII", "PII Controller", "Obligatorio", "Bitácora de destinatarios y finalidades"],
  ["A.1.5.4", "Notificación de transferencias no autorizadas", "PII Controller", "Obligatorio", "Procedimiento ante fugas a terceros"],
  ["A.1.5.5", "Divulgación a autoridades y entidades gubernamentales", "PII Controller", "Obligatorio", "Protocolo ante requerimientos judiciales o fiscales"],
  [null, null, null, null, null],
  ["--- TABLA A.3: CONTROLES DE SEGURIDAD PARA RESPONSABLES Y ENCARGADOS (29 CONTROLES) ---", null, null, null, null],
  ["A.3.1", "Políticas de seguridad de la información y privacidad", "Ambos", "Obligatorio", "Directrices aprobadas por el Rectorado"],
  ["A.3.2", "Revisión de políticas a intervalos planificados", "Ambos", "Obligatorio", "Revisión anual obligatoria o ante cambios mayores"],
  ["A.3.3", "Segregación de funciones operativas y de control", "Ambos", "Obligatorio", "Separación entre administradores y auditores"],
  ["A.3.4", "Control de acceso físico a instalaciones de procesamiento", "Ambos", "Obligatorio", "Biometría y CCTV en Data Center DUTIC"],
  ["A.3.5", "Clasificación y etiquetado de la información", "Ambos", "Obligatorio", "Rotulado Confidencial - Uso Interno UNSA"],
  ["A.3.6", "Etiquetado de soportes y medios físicos con PII", "Ambos", "Obligatorio", "Identificación visible de archivadores"],
  ["A.3.7", "Transferencia segura de información", "Ambos", "Obligatorio", "Túneles cifrados y validación telemática"],
  ["A.3.8", "Gestión de identidades y ciclo de vida de usuarios", "Ambos", "Obligatorio", "Aprovisionamiento y desaprovisionamiento ágil"],
  ["A.3.9", "Derechos de acceso basados en roles (RBAC)", "Ambos", "Obligatorio", "Mínimo privilegio en bases de datos"],
  ["A.3.10", "Seguridad en acuerdos con proveedores de TIC", "Ambos", "Obligatorio", "Cláusulas de auditoría y confidencialidad"],
  ["A.3.11", "Planificación y preparación para la gestión de incidentes", "Ambos", "Obligatorio", "Constitución formal del CSIRT-UNSA"],
  ["A.3.12", "Respuesta y mitigación de incidentes de privacidad", "Ambos", "Obligatorio", "Procedimiento G4-PRC-INC-01 y bitácora B.3.12"],
  ["A.3.13", "Cumplimiento de requisitos legales y regulatorios", "Ambos", "Obligatorio", "Alineamiento con Ley 29733 y directivas ANPD"],
  ["A.3.14", "Protección de registros e inmutabilidad de bitácoras", "Ambos", "Obligatorio", "Suma criptográfica SHA-256 en repositorio"],
  ["A.3.15", "Revisión independiente de la seguridad (Auditorías)", "Ambos", "Obligatorio", "Programa de auditoría interna ISO 19011"],
  ["A.3.16", "Cumplimiento de políticas y normas técnicas", "Ambos", "Obligatorio", "Monitoreo continuo y cadena CAPA (Cl. 10.2)"],
  ["A.3.17", "Concienciación, educación y formación periódica", "Ambos", "Obligatorio", "Módulo obligatorio 8h en Academia SGPI"],
  ["A.3.18", "Acuerdos de confidencialidad y no divulgación (NDA)", "Ambos", "Obligatorio", "Suscripción por personal y contratistas"],
  ["A.3.19", "Política de escritorio limpio y pantalla bloqueada", "Ambos", "Obligatorio", "Trituradoras P-4 y bloqueo a 5 minutos"],
  ["A.3.20", "Gestión de soportes extraíbles de almacenamiento", "Ambos", "Obligatorio", "Restricción de memorias USB en nóminas"],
  ["A.3.21", "Eliminación o reutilización segura de equipos", "Ambos", "Obligatorio", "Sobreescritura segura DoD 5220.22-M"],
  ["A.3.22", "Protección de dispositivos de punto final (Endpoints)", "Ambos", "Obligatorio", "Cifrado BitLocker XTS-AES 256 y MDM Intune"],
  ["A.3.23", "Autenticación segura y multifactor (MFA/TOTP)", "Ambos", "Obligatorio", "Segundo factor obligatorio en accesos remotos"],
  ["A.3.24", "Copias de seguridad de la información (Backups)", "Ambos", "Obligatorio", "Respaldos diarios inmutables con prueba DRP"],
  ["A.3.25", "Registro de eventos, trazabilidad y logging centralizado", "Ambos", "Obligatorio", "Logs SIEM sincronizados por protocolo NTP"],
  ["A.3.26", "Uso de controles criptográficos robustos", "Ambos", "Obligatorio", "Estándares AES-256 y RSA-4096 institucionales"],
  ["A.3.27", "Gestión de vulnerabilidades técnicas y parches", "Ambos", "Obligatorio", "Escaneos periódicos y ciclo de parches en CI/CD"],
  ["A.3.28", "Seguridad en redes de comunicaciones institucionales", "Ambos", "Obligatorio", "Políticas DMARC, DKIM, SPF y segmentación VLAN"],
  ["A.3.29", "Seguridad en desarrollo y ciclo de vida de aplicaciones", "Ambos", "Obligatorio", "Lineamientos OWASP Top 10 en DUTIC"]
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

export function generateTreatmentXlsx(outputPath?: string, targetVersion?: "v1" | "v2" | "v3" | "all"): string {
  const targetPath = outputPath || path.join(__dirname, "G4-PLN-RSK-01-tratamiento.xlsx");

  let rowsToInclude: RiskTreatmentRow[];
  if (targetVersion === "v1") {
    rowsToInclude = SYNTHETIC_TREATMENT_ROWS.filter(r => r.version_scope === "v1 (2019)");
  } else if (targetVersion === "v2") {
    rowsToInclude = SYNTHETIC_TREATMENT_ROWS.filter(r => r.version_scope === "v1 (2019)" || r.version_scope === "v2 (2022)");
  } else {
    rowsToInclude = SYNTHETIC_TREATMENT_ROWS;
  }

  // Exact headers matching Apéndice 2 Cuadro tratamiento riesgos
  const mainSheetRows: (string | number | null)[][] = [
    ["Cuadro de tratamiento de riesgos", null, "Implementado desde el 2025-10-28 hasta el 2026-10-28", null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [
      "Activos / amenazas / vulnerabilidades", null, null, null, null, null,
      "Valores antes del tratamiento", null, null,
      "Tratamiento del riesgo", null,
      "Valores después del tratamiento", null, null
    ],
    [
      "Cantidad",
      "Nombre del activo",
      "Propietario del activo",
      "Amenaza",
      "Vulnerabilidad",
      "Propietario del riesgo",
      "Consecuencia",
      "Probabilidad",
      "Riesgo",
      "Elección de opciones",
      "Medios de implementación",
      "Consecuencia",
      "Probabilidad",
      "Riesgo"
    ],
    ...rowsToInclude.map(r => [
      r.id,
      r.asset,
      r.asset_owner,
      r.threat,
      r.vuln,
      r.risk_owner,
      r.before_c,
      r.before_p,
      r.before_r,
      r.option,
      r.controls_implementation,
      r.after_c,
      r.after_p,
      r.after_r
    ])
  ];

  const sheets: SheetDef[] = [
    {
      name: "Cuadro tratamiento riesgos",
      rows: mainSheetRows
    },
    {
      name: "Opciones",
      rows: TREATMENT_OPTIONS
    },
    {
      name: "Controles",
      rows: ISO_27701_CONTROLS
    }
  ];

  const zipBuffer = buildMultiSheetXlsx(sheets);
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  fs.writeFileSync(targetPath, zipBuffer);
  console.log(`OK: Cuadro de Tratamiento de Riesgos XLSX generado exitosamente en: ${targetPath}`);
  console.log(`     Total de filas de tratamiento: ${rowsToInclude.length} | 3 hojas completas (Apéndice 2)`);
  return targetPath;
}

if (import.meta.main) {
  const customOutput = process.argv[2];
  const customVersion = process.argv[3] as "v1" | "v2" | "v3" | "all" | undefined;
  generateTreatmentXlsx(customOutput, customVersion);
}
