#!/usr/bin/env bun
/**
 * molds/incident-register/generate.ts
 *
 * Generador scriptado de libro XLSX para el Registro Oficial de Incidentes de Privacidad (SGPI UNSA).
 * Estándar normativo: ISO/IEC 27701:2025 Cláusula 8.1 + 7.5.1 y Guía B.3.12 (Campos obligatorios de brechas de PII).
 * NOTA CRÍTICA DE ALCANCE: Criterios de notificación determinados por la organización bajo Cl. 8.1/7.5.1.
 * NO APLICA reloj arbitrario de 72 horas (GDPR Art. 33 es dato informativo de referencia en Anexo D, no norma operativa en Perú).
 *
 * Columnas reescritas conforme a la Guía B.3.12 (Páginas 49-50 ISO 27701:2025):
 * 1.  ID Incidente (Código unívoco G4)
 * 2.  Versión / Alcance Temporal (v1 2019, v2 2022, v3 2025)
 * 3.  Severidad
 * 4.  Categoría del Incidente
 * 5.  Descripción del Incidente (B.3.12 #1)
 * 6.  Período de Tiempo [Inicio - Detección - Cierre] (B.3.12 #2)
 * 7.  Consecuencias e Impacto (B.3.12 #3)
 * 8.  Nombre del Informante / Reportante (B.3.12 #4)
 * 9.  A Quién se Informó el Incidente (B.3.12 #5)
 * 10. Medidas de Resolución y Contención (B.3.12 #6a)
 * 11. Responsable de la Resolución [Person in Charge] (B.3.12 #6b)
 * 12. Datos Recuperados [Data Recovered] (B.3.12 #6c)
 * 13. Afectación Específica PII: Indisponibilidad / Pérdida / Divulgación / Alteración (B.3.12 #7)
 * 14. Descripción de la PII Comprometida (B.3.12 #8a)
 * 15. Titulares y Volumen Afectado (B.3.12 #8b)
 * 16. Medidas de Notificación Ejecutadas [Titulares / ANPD] (B.3.12 #9)
 * 17. Estado Operativo
 * 18. Ref. Acción Correctiva (CAPA)
 *
 * Ejecución con Bun:
 *   bun molds/incident-register/generate.ts [archivo_salida.xlsx] [version]
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as zlib from "node:zlib";

export interface IncidentRecordB312 {
  incident_id: string;
  version_scope: "v1 (2019)" | "v2 (2022)" | "v3 (2025)";
  severity: "CRÍTICO" | "ALTO" | "MEDIO" | "BAJO";
  categories: string;
  description: string;
  time_period: string;
  consequences: string;
  reporter_name: string;
  reported_to: string;
  steps_taken: string;
  person_in_charge: string;
  data_recovered: string;
  pii_impact_fact: string;
  pii_compromised_description: string;
  principals_affected: string;
  notification_measures: string;
  status: "CERRADA" | "EN_SEGUIMIENTO" | "CONTENIDA";
  corrective_action_ref: string;
}

export const SYNTHETIC_INCIDENTS_B312: IncidentRecordB312[] = [
  // Era v1: 2019 Certificación inicial (Sedes centrales Arequipa, admisiones y planillas presenciales)
  {
    incident_id: "G4-INC-2019-001",
    version_scope: "v1 (2019)",
    severity: "MEDIO",
    categories: "CONFIDENCIALIDAD / DIVULGACIÓN_FÍSICA",
    description: "Listado impreso con nombres completos, DNI y puntajes preliminares expuesto sin custodia sobre mesa de recepción del Pabellón de Ingenierías durante examen ordinario.",
    time_period: "Inicio: 2019-05-14T08:15:00-05:00 | Detección: 2019-05-14T08:30:00-05:00 | Contención: 2019-05-14T08:45:00-05:00 | Cierre: 2019-05-15T12:00:00-05:00",
    consequences: "Exposición momentánea de datos identificativos ante postulantes y acompañantes en sala de espera; sin perjuicio económico ni discriminación.",
    reporter_name: "Lic. Manuel Cornejo (Vocal de Pabellón Ingenierías)",
    reported_to: "Ing. Carlos M. Benítez (OSI / DPO)",
    steps_taken: "Retiro inmediato del listado físico de la mesa pública, traslado bajo custodia y trituración certificada en equipo de microcorte P-4. Instrucción verbal a vocales de puerta.",
    person_in_charge: "Lic. Manuel Cornejo (Vocal de Pabellón) / Ing. Carlos M. Benítez (DPO)",
    data_recovered: "100% de las hojas físicas (3 folios) recuperadas intactas sin duplicación ni fotografías.",
    pii_impact_fact: "DIVULGACIÓN (Temporal, soporte físico en papel; sin pérdida ni alteración)",
    pii_compromised_description: "Datos identificativos básicos: Nombres, apellidos, DNI, código de postulante y puntaje preliminar.",
    principals_affected: "18 postulantes ordinarios a carreras de Ingenierías",
    notification_measures: "EVALUADO_NO_REQUIERE (Criterio Cl. 8.1 / B.3.12: Riesgo residual insignificante tras recuperación total inmediata; no procede notificación a ANPD ni a titulares).",
    status: "CERRADA",
    corrective_action_ref: "G4-CAPA-2019-01"
  },
  {
    incident_id: "G4-INC-2019-002",
    version_scope: "v1 (2019)",
    severity: "ALTO",
    categories: "CONFIDENCIALIDAD / ERROR_ENVÍO_CORREO",
    description: "Envío accidental de consolidado de boletas de pago por correo electrónico masivo a lista de distribución general de docentes sin copia oculta (BCC) ni clave de cifrado en archivo adjunto.",
    time_period: "Inicio: 2019-09-22T14:10:00-05:00 | Detección: 2019-09-22T14:15:00-05:00 | Contención: 2019-09-22T14:40:00-05:00 | Cierre: 2019-09-25T17:00:00-05:00",
    consequences: "Divulgación cruzada de importes salariales, descuentos de ley y número de cuenta bancaria entre colegas docentes de la Facultad de Ciencias Histórico Sociales.",
    reporter_name: "Téc. Rosa Huamán (Asistente de Planillas)",
    reported_to: "Lic. Martha Elena Córdova (Subdirectora de Personal) / Ing. Carlos M. Benítez (DPO)",
    steps_taken: "Bloqueo preventivo de la cola de salida en servidor Exchange, comando de recall de mensaje y solicitud formal escrita a receptores para eliminación sin descarga.",
    person_in_charge: "Téc. Rosa Huamán (Planillas) / Ing. Marco Pinto (DUTIC)",
    data_recovered: "39 de 42 receptores confirmaron por escrito borrado definitivo; servidor Exchange purgó 28 copias no abiertas.",
    pii_impact_fact: "DIVULGACIÓN (Datos económicos y laborales compartidos internamente)",
    pii_compromised_description: "Boletas de pago completas: nombres, DNI, cargo docente, remuneración bruta, aportes AFP/ONP y número de cuenta bancaria.",
    principals_affected: "42 docentes ordinarios de la Facultad de Ciencias Histórico Sociales",
    notification_measures: "NOTIFICADO_TITULARES_INTERNOS (Comunicación individual vía correo institucional a los 42 docentes con disculpas institucionales y medidas preventivas adoptadas).",
    status: "CERRADA",
    corrective_action_ref: "G4-CAPA-2019-02"
  },

  // Era v2: 2022 Post-pandemia (Migración digital forzada, reducción de alcance físico, Sisgedo y teletrabajo)
  {
    incident_id: "G4-INC-2022-001",
    version_scope: "v2 (2022)",
    severity: "CRÍTICO",
    categories: "ACCESO_NO_AUTORIZADO / VULNERABILIDAD_PORTAL_WEB",
    description: "Vulnerabilidad IDOR (Insecure Direct Object Reference) en endpoint /api/postulante/ficha del portal admision.unsa.edu.pe permitía descargar certificados de secundaria y DNI escaneados alterando el parámetro id.",
    time_period: "Inicio: 2022-03-17T22:00:00-05:00 | Detección: 2022-03-18T11:00:00-05:00 | Contención: 2022-03-18T11:45:00-05:00 | Cierre: 2022-03-24T18:00:00-05:00",
    consequences: "Exposición potencial de documentos oficiales de postulantes inscritos vía web durante proceso de admisión virtual post-pandemia.",
    reporter_name: "Equipo de Monitoreo SOC-DUTIC",
    reported_to: "Ing. Carlos M. Benítez (OSI / DPO) / Mg. Lucía Valdivia (Directora DUTIC)",
    steps_taken: "Despliegue de parche de emergencia en controlador Spring Boot validando coincidencia de sesión JWT con id del recurso; invalidación masiva de tokens activos.",
    person_in_charge: "Ing. Carlos M. Benítez (OSI/DPO) / Ing. Marco Pinto (DUTIC)",
    data_recovered: "Base de datos íntegra; análisis forense de access logs determinó acceso no autorizado a únicamente 12 expedientes por una IP externa.",
    pii_impact_fact: "DIVULGACIÓN (Acceso indebido a archivos digitales escaneados)",
    pii_compromised_description: "DNI escaneado, certificado de estudios secundarios, domicilio y fotografía digital de postulantes.",
    principals_affected: "1,240 inscritos en el padrón web (12 expedientes descargados externamente)",
    notification_measures: "NOTIFICADO_AUTORIDAD_ANPD (Notificación formal a la ANPD Perú según procedimiento institucional sin reloj arbitrario de 72h + notificación directa con recomendaciones a los 12 titulares afectados).",
    status: "CERRADA",
    corrective_action_ref: "G4-CAPA-2022-01"
  },
  {
    incident_id: "G4-INC-2022-002",
    version_scope: "v2 (2022)",
    severity: "BAJO",
    categories: "DISPONIBILIDAD / FALLO_BACKUP_TEMPORAL",
    description: "Fallo en la sincronización nocturna programada de la base de datos PostgreSQL de nóminas docentes hacia el almacenamiento secundario institucional por timeout de enlace de red.",
    time_period: "Inicio: 2022-07-05T03:00:00-05:00 | Detección: 2022-07-05T07:30:00-05:00 | Contención: 2022-07-05T08:15:00-05:00 | Cierre: 2022-07-05T10:00:00-05:00",
    consequences: "Ventana de backup retrasada en 5 horas; sin afectación a operaciones de cálculo de planilla ni perjuicio a los derechos de los titulares.",
    reporter_name: "Ing. Marco Pinto (Administrador de BD DUTIC)",
    reported_to: "Mg. Lucía Valdivia Paredes (Directora DUTIC)",
    steps_taken: "Reejecución manual del script pg_dump con compresión paralela, verificación de suma hash SHA-256 en almacenamiento destino y ajuste de timeout en cron job.",
    person_in_charge: "Ing. Marco Pinto (Admin BD)",
    data_recovered: "100% de la réplica sincronizada exitosamente; base primaria se mantuvo operando con total disponibilidad.",
    pii_impact_fact: "INDISPONIBILIDAD (Temporal en copia de respaldo; cero pérdida o fuga de PII)",
    pii_compromised_description: "Registros históricos de planillas docentes de sedes Arequipa (sin pérdida ni fuga de datos).",
    principals_affected: "0 (Incidente de infraestructura técnica interna)",
    notification_measures: "EVALUADO_NO_REQUIERE (Evento operativo interno resuelto sin afectación a datos ni titulares; no constituye brecha reportable bajo B.3.12).",
    status: "CERRADA",
    corrective_action_ref: "G4-CAPA-2022-02"
  },

  // Era v3: 2025 Recertificación ISO/IEC 27701:2025 + Filiales Camaná y El Pedregal (Majes)
  {
    incident_id: "G4-INC-2025-001",
    version_scope: "v3 (2025)",
    severity: "ALTO",
    categories: "CONFIDENCIALIDAD / ROBO_DISPOSITIVO_TERMINAL",
    description: "Sustracción de laptop corporativa asignada al módulo de registro biométrico durante el proceso de admisión descentralizado en la sede de la Filial Camaná.",
    time_period: "Inicio: 2025-04-12T09:10:00-05:00 | Detección: 2025-04-12T09:20:00-05:00 | Contención: 2025-04-12T09:35:00-05:00 | Cierre: 2025-04-16T14:00:00-05:00",
    consequences: "Pérdida material del equipo informático; denuncia policial formulada ante Comisaría de Camaná; riesgo nulo de fuga de PII por controles criptográficos.",
    reporter_name: "Dr. Marcos A. Cárdenas (Coordinador Filial Camaná)",
    reported_to: "Ing. Carlos M. Benítez (OSI / DPO)",
    steps_taken: "Bloqueo remoto de credenciales de usuario vía Microsoft Entra ID; emisión de orden de borrado seguro remoto vía Microsoft Intune (MDM); verificación de cifrado BitLocker XTS-AES 256 con chip TPM 2.0.",
    person_in_charge: "Dr. Marcos A. Cárdenas (Filial Camaná) / Ing. Carlos M. Benítez (OSI/DPO)",
    data_recovered: "Dispositivo físico no recuperado; confirmación pericial de que el disco cifrado es ilegible sin llave institucional TPM.",
    pii_impact_fact: "PÉRDIDA (Pérdida material del equipo; PII inaccesible por cifrado robusto de hardware)",
    pii_compromised_description: "Plantillas biométricas (minucias dactilares) y fotos de postulantes de la Filial Camaná almacenadas localmente.",
    principals_affected: "115 postulantes inscritos en Filial Camaná",
    notification_measures: "EVALUADO_NO_REQUIERE (Cifrado robusto verificado técnicamente según Guía B.3.12 y estándar ISO 27701; no existió acceso inteligible a PII; informe interno al Comité SGPI).",
    status: "CERRADA",
    corrective_action_ref: "G4-CAPA-2025-01"
  },
  {
    incident_id: "G4-INC-2025-002",
    version_scope: "v3 (2025)",
    severity: "MEDIO",
    categories: "INTEGRIDAD / ERROR_SINCRONIZACION_FILIAL",
    description: "Discrepancia en números de cuenta bancaria para abonos salariales generada por colisión de registros entre archivo local de la Filial El Pedregal (Majes) y el servidor central de planillas.",
    time_period: "Inicio: 2025-08-20T14:30:00-05:00 | Detección: 2025-08-20T15:10:00-05:00 | Contención: 2025-08-20T15:45:00-05:00 | Cierre: 2025-08-22T11:00:00-05:00",
    consequences: "Postergación de 24 horas en la transferencia bancaria electrónica a trabajadores de la filial; cero pérdidas patrimoniales y cero pagos erróneos.",
    reporter_name: "Lic. Martha Elena Córdova (Subdirectora de Personal)",
    reported_to: "Mg. Lucía Valdivia Paredes (Directora DUTIC)",
    steps_taken: "Suspensión de la pasarela de dispersión automática con el Banco de la Nación; conciliación manual telemática contra padrón original firmado en Sisgedo; retransmisión con hash SHA-256 validado.",
    person_in_charge: "Lic. Martha Elena Córdova (Personal) / Ing. Marco Pinto (DUTIC)",
    data_recovered: "100% de los números de cuenta rectificados y validados antes de procesar el pago.",
    pii_impact_fact: "ALTERACIÓN (Desfase de integridad detectado y rectificado antes de la dispersión bancaria)",
    pii_compromised_description: "Nombres, DNI, montos remunerativos netos y códigos CCI de trabajadores de la Filial El Pedregal.",
    principals_affected: "48 docentes y administrativos de la Filial El Pedregal (Majes)",
    notification_measures: "NOTIFICADO_TITULARES_INTERNOS (Boletín informativo interno remitido a los 48 servidores explicando ajuste de cronograma bancario por control de seguridad).",
    status: "CERRADA",
    corrective_action_ref: "G4-CAPA-2025-02"
  },
  {
    incident_id: "G4-INC-2025-003",
    version_scope: "v3 (2025)",
    severity: "BAJO",
    categories: "CONFIDENCIALIDAD / INTENTO_PHISHING_PLANILLAS",
    description: "Campaña de spear-phishing suplantando la imagen corporativa del Banco de la Nación, remitida a correos institucionales de operadores de remuneraciones de sedes centrales y filiales para capturar credenciales de banca electrónica.",
    time_period: "Inicio: 2025-11-03T09:40:00-05:00 | Detección: 2025-11-03T10:05:00-05:00 | Contención: 2025-11-03T10:25:00-05:00 | Cierre: 2025-11-04T16:00:00-05:00",
    consequences: "Sin consecuencias operativas ni fuga de información; incremento de alertas preventivas en el SOC y fortalecimiento de filtros de correo.",
    reporter_name: "Ing. Carlos M. Benítez (OSI / DPO)",
    reported_to: "Comité de Gobierno Digital y Privacidad",
    steps_taken: "Bloqueo perimetral del dominio atacante en servidor de correo y firewall corporativo; revocación de enlaces maliciosos; emisión de alerta de seguridad en portal institucional; inspección de buzones.",
    person_in_charge: "Ing. Carlos M. Benítez (OSI/DPO)",
    data_recovered: "Ningún operador ingresó credenciales institucionales ni descargó adjuntos maliciosos.",
    pii_impact_fact: "AMENAZA_FRUSTRADA (Sin indisponibilidad, pérdida, divulgación ni alteración de PII)",
    pii_compromised_description: "Cuentas de correo electrónico institucional de personal de planilla (destinatarios del ataque).",
    principals_affected: "0 (Cero titulares comprometidos; ciberataque contenido en borde)",
    notification_measures: "EVALUADO_NO_REQUIERE (Intento frustrado sin vulneración de datos personales; no procede reporte regulatorio ante la ANPD).",
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

function getColRef(colIdx: number): string {
  let s = "";
  let c = colIdx;
  while (c >= 0) {
    s = String.fromCharCode(65 + (c % 26)) + s;
    c = Math.floor(c / 26) - 1;
  }
  return s;
}

export const B312_COLUMN_HEADERS: string[] = [
  "ID Incidente",
  "Versión / Alcance (Era)",
  "Severidad",
  "Categoría del Incidente",
  "1. Descripción del Incidente (B.3.12 #1)",
  "2. Período de Tiempo [Inicio - Detección - Cierre] (B.3.12 #2)",
  "3. Consecuencias e Impacto (B.3.12 #3)",
  "4. Informante / Reportante (B.3.12 #4)",
  "5. A Quién se Informó (B.3.12 #5)",
  "6a. Medidas de Resolución y Contención (B.3.12 #6a)",
  "6b. Responsable de la Resolución [Person in Charge] (B.3.12 #6b)",
  "6c. Datos Recuperados [Data Recovered] (B.3.12 #6c)",
  "7. Afectación PII: Indisponibilidad / Pérdida / Divulgación / Alteración (B.3.12 #7)",
  "8a. Descripción de PII Comprometida (B.3.12 #8a)",
  "8b. Titulares y Volumen Afectado (B.3.12 #8b)",
  "9. Medidas de Notificación Ejecutadas [Titulares / ANPD] (B.3.12 #9)",
  "Estado Operativo",
  "Ref. Acción Correctiva (CAPA)"
];

function incidentToRow(r: IncidentRecordB312): (string | number)[] {
  return [
    r.incident_id,
    r.version_scope,
    r.severity,
    r.categories,
    r.description,
    r.time_period,
    r.consequences,
    r.reporter_name,
    r.reported_to,
    r.steps_taken,
    r.person_in_charge,
    r.data_recovered,
    r.pii_impact_fact,
    r.pii_compromised_description,
    r.principals_affected,
    r.notification_measures,
    r.status,
    r.corrective_action_ref
  ];
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

export function buildWorkbookBuffer(sheets: SheetDef[]): Buffer {
  const entries: ZipEntry[] = [];

  // Content types
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

  // Package rels
  const pkgRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
  entries.push({ path: "_rels/.rels", data: Buffer.from(pkgRelsXml, "utf-8") });

  // Workbook rels
  let wbRels = "";
  sheets.forEach((_, idx) => {
    wbRels += `  <Relationship Id="rId${idx + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${idx + 1}.xml"/>\n`;
  });
  wbRels += `  <Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>\n`;

  const workbookRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${wbRels}</Relationships>`;
  entries.push({ path: "xl/_rels/workbook.xml.rels", data: Buffer.from(workbookRelsXml, "utf-8") });

  // Workbook xml
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

  // Styles xml
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

  // Worksheets xml
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

export function generateIncidentXlsx(outputPath?: string, targetVersion?: "v1" | "v2" | "v3" | "all"): string {
  const targetPath = outputPath || path.join(__dirname, "G4-REG-INC-01-registros.xlsx");

  let recordsToInclude: IncidentRecordB312[];
  if (targetVersion === "v1") {
    recordsToInclude = SYNTHETIC_INCIDENTS_B312.filter(r => r.version_scope === "v1 (2019)");
  } else if (targetVersion === "v2") {
    recordsToInclude = SYNTHETIC_INCIDENTS_B312.filter(r => r.version_scope === "v1 (2019)" || r.version_scope === "v2 (2022)");
  } else {
    recordsToInclude = SYNTHETIC_INCIDENTS_B312;
  }

  const v1Records = SYNTHETIC_INCIDENTS_B312.filter(r => r.version_scope === "v1 (2019)");
  const v2Records = SYNTHETIC_INCIDENTS_B312.filter(r => r.version_scope === "v2 (2022)");
  const v3Records = SYNTHETIC_INCIDENTS_B312.filter(r => r.version_scope === "v3 (2025)");

  const sheets: SheetDef[] = [
    {
      name: targetVersion === "v1" ? "Registro Incidentes B.3.12 (2019)" : "Registro Consolidado B.3.12",
      rows: [
        B312_COLUMN_HEADERS,
        ...recordsToInclude.map(incidentToRow)
      ]
    },
    {
      name: "Era v1 (2019)",
      rows: [
        B312_COLUMN_HEADERS,
        ...v1Records.map(incidentToRow)
      ]
    }
  ];

  if (targetVersion === "v2" || targetVersion === "v3" || targetVersion === "all" || !targetVersion) {
    sheets.push({
      name: "Era v2 (2022)",
      rows: [
        B312_COLUMN_HEADERS,
        ...v2Records.map(incidentToRow)
      ]
    });
  }

  if (targetVersion === "v3" || targetVersion === "all" || !targetVersion) {
    sheets.push({
      name: "Era v3 (2025)",
      rows: [
        B312_COLUMN_HEADERS,
        ...v3Records.map(incidentToRow)
      ]
    });
  }

  const zipBuffer = buildWorkbookBuffer(sheets);
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  fs.writeFileSync(targetPath, zipBuffer);
  console.log(`OK: Registro XLSX B.3.12 generado exitosamente en: ${targetPath}`);
  console.log(`     Total de incidentes incluidos: ${recordsToInclude.length} (Filtro: ${targetVersion ?? "todos"})`);
  return targetPath;
}

if (import.meta.main) {
  const customOutput = process.argv[2];
  const customVersion = process.argv[3] as "v1" | "v2" | "v3" | "all" | undefined;
  generateIncidentXlsx(customOutput, customVersion);
}
