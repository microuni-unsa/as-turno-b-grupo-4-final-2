#!/usr/bin/env bun
/**
 * scripts/upload-pims-truth.ts
 *
 * Planificador y ejecutor de carga de documentos de verdad a GESTITEL PIMS (https://unsa.27k.pe).
 *
 * MODO SEGURO POR DEFECTO: DRY-RUN (no realiza llamadas de red a PIMS a menos que se invoque con --live).
 * En modo dry-run:
 * - Lee los manifiestos de corpus_mirror/
 * - Valida el prefijo estricto G4- (aislamiento multi-inquilino)
 * - Planifica la secuencia exacta de llamadas POST:
 *     Creación inicial (v1 PDF + XLSX si aplica)
 *     -> Nueva versión v2 con change_summary estructurado
 *     -> Nueva versión v3 con change_summary estructurado
 *     -> Aprobación formal (v3 vigente, v1/v2 obsoleto)
 * - Imprime el resumen tabular detallado (endpoints, campos, archivos, tamaños y hashes)
 * - Termina con código 0.
 *
 * Credenciales estrictamente desde variables de entorno (PIMS_USERNAME, PIMS_PASSWORD, PIMS_BASE_URL, PIMS_SCHEMA).
 * NUNCA imprime secretos ni tokens en pantalla ni en logs.
 */

import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { PimsClient } from "../packages/pims-adapter/client.ts";
import { assertG4WriteCode } from "../packages/pims-adapter/guards.ts";
import type { DocumentCategory, DocumentStatusAPI } from "../packages/pims-adapter/types.ts";
import { RAG_CONFIG } from "../packages/rag-mirror/config.ts";
import type { CorpusMirrorManifest } from "../packages/rag-mirror/types.ts";

const REPO_ROOT = path.resolve(__dirname, "..");
const CORPUS_DIR = RAG_CONFIG.CORPUS_MIRROR_DIR;

// Orden canónico de cláusulas ISO/IEC 27701:2025 (4 -> 10)
const NORMATIVE_DOC_ORDER: string[] = [
  "G4-ALC-01",     // Cl. 4 Contexto / Alcance
  "G4-POL-01",     // Cl. 5 Liderazgo / Política
  "G4-RSK-INC-01", // Cl. 6 Planificación / Evaluación de Riesgos (Apéndice 1)
  "G4-MET-RSK-01", // Cl. 6 Planificación / Metodología de Riesgos
  "G4-PLN-RSK-01", // Cl. 6 Planificación / Tratamiento de Riesgos (Apéndice 2)
  "G4-SOA-01",     // Cl. 6 Planificación / Declaración de Aplicabilidad
  "G4-OBJ-01",     // Cl. 6 Planificación / Objetivos de Privacidad
  "G4-PRC-DOC-01", // Cl. 7 Apoyo / Control de Información Documentada
  "G4-CAP-INC-01", // Cl. 7 Apoyo / Módulo de Capacitación
  "G4-REG-CAP-01", // Cl. 7 Apoyo / Registro de Capacitación
  "G4-PRC-INC-01", // Cl. 8 Operación / Procedimiento de Incidentes
  "G4-REG-INC-01", // Cl. 8 Operación / Registro de Incidentes B.3.12 (XLSX)
  "G4-PRG-AUD-01", // Cl. 9 Evaluación / Programa de Auditorías Internas
  "G4-REP-AUD-01", // Cl. 9 Evaluación / Informe de Auditoría Interna
  "G4-ACT-REV-01", // Cl. 9 Evaluación / Acta de Revisión por la Dirección
  "G4-PRC-CAPA-01",// Cl. 10 Mejora / Procedimiento No Conformidades
  "G4-REG-CAPA-01",// Cl. 10 Mejora / Registro de Acciones Correctivas
  "G4-IDX-01"      // Cl. 7/8/9 Auditor's Map (Índice Maestro)
];

const CATEGORY_MAP: Record<string, string> = {
  "G4-ALC-01": "PO",
  "G4-POL-01": "PO",
  "G4-RSK-INC-01": "RE",
  "G4-MET-RSK-01": "PR",
  "G4-PLN-RSK-01": "PR",
  "G4-SOA-01": "PO",
  "G4-OBJ-01": "PO",
  "G4-PRC-DOC-01": "PR",
  "G4-CAP-INC-01": "PR",
  "G4-REG-CAP-01": "RE",
  "G4-PRC-INC-01": "PR",
  "G4-REG-INC-01": "RE",
  "G4-PRG-AUD-01": "PR",
  "G4-REP-AUD-01": "RE",
  "G4-ACT-REV-01": "RE",
  "G4-PRC-CAPA-01": "PR",
  "G4-REG-CAPA-01": "RE",
  "G4-IDX-01": "IN"
};

interface PlannedPostAction {
  docCode: string;
  docTitle: string;
  stepNum: number;
  totalStepsForDoc: number;
  actionType: "CREATE_DOCUMENT" | "ADD_VERSION" | "APPROVE_DOCUMENT";
  endpoint: string;
  method: "POST";
  formFields: Record<string, string>;
  attachedFile?: {
    filename: string;
    localPath: string;
    format: string;
    sizeBytes: number;
    sha256: string;
  };
  companionFiles?: Array<{
    filename: string;
    localPath: string;
    format: string;
    sizeBytes: number;
    sha256: string;
  }>;
  targetLifecycleState: "obsoleto" | "vigente";
}

function getChangeSummaryForVersion(versionNum: number, docCode: string): string {
  if (versionNum === 2) {
    return `MAYOR :: Adaptación post-pandemia 2022 :: Virtualización de inscripciones web y teletrabajo en nóminas :: Actualización de controles A.3.8, A.3.22, A.3.23 y túneles VPN`;
  }
  if (versionNum === 3) {
    return `MAYOR :: Recertificación ISO/IEC 27701:2025 y expansión territorial :: Incorporación de Filial Camaná y Filial El Pedregal (RR 0142/0143-2025) :: Actualización de controles A.3.11, A.3.12, A.3.26 y directivas MDM`;
  }
  return `MENOR :: Emisión formal aprobada para el SGPI UNSA :: Registro de documento inicial`;
}

function readAllManifests(): Map<string, CorpusMirrorManifest> {
  const manifests = new Map<string, CorpusMirrorManifest>();
  if (!fs.existsSync(CORPUS_DIR)) {
    throw new Error(`Directory ${CORPUS_DIR} not found. Run 'bun scripts/render-all.ts' first.`);
  }

  const entries = fs.readdirSync(CORPUS_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.startsWith("G4-")) {
      const manifestPath = path.join(CORPUS_DIR, entry.name, "manifest.json");
      if (fs.existsSync(manifestPath)) {
        const raw = fs.readFileSync(manifestPath, "utf-8");
        const parsed = JSON.parse(raw) as CorpusMirrorManifest;
        // Tenant guard
        assertG4WriteCode(parsed.code, "Manifest Validation");
        manifests.set(parsed.code, parsed);
      }
    }
  }

  return manifests;
}

function buildUploadPlan(manifests: Map<string, CorpusMirrorManifest>): PlannedPostAction[] {
  const plan: PlannedPostAction[] = [];

  // Ordenar documentos según el orden normativo canónico
  const orderedCodes = Array.from(manifests.keys()).sort((a, b) => {
    const idxA = NORMATIVE_DOC_ORDER.indexOf(a);
    const idxB = NORMATIVE_DOC_ORDER.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  for (const code of orderedCodes) {
    const manifest = manifests.get(code)!;
    const docTitle = manifest.versions[0]?.filename
      ? (manifest as any).title ?? code
      : code;
    const category = CATEGORY_MAP[code] ?? "RE";
    const responsible = "Ing. Carlos M. Benítez";

    const versions = [...manifest.versions].sort((a, b) => {
      const numA = parseInt(a.pims_version.split(".")[0], 10);
      const numB = parseInt(b.pims_version.split(".")[0], 10);
      return numA - numB;
    });

    if (versions.length === 0) continue;

    const isMultiVersion = versions.length > 1;

    // 1. CREATE_DOCUMENT (para la primera versión disponible)
    const firstVer = versions[0];
    const firstVerNum = parseInt(firstVer.pims_version.split(".")[0], 10);
    const docDir = path.join(CORPUS_DIR, code);

    // Buscar archivo PDF de primera versión
    const pdfPath = path.join(docDir, `v${firstVerNum}.pdf`);
    const pdfStat = fs.existsSync(pdfPath) ? fs.statSync(pdfPath) : null;
    const pdfHash = fs.existsSync(pdfPath)
      ? createHash("sha256").update(fs.readFileSync(pdfPath)).digest("hex")
      : "";

    // Buscar archivos complementarios (XLSX)
    const xlsxPath = path.join(docDir, `v${firstVerNum}.xlsx`);
    const companionFiles: Array<{ filename: string; localPath: string; format: string; sizeBytes: number; sha256: string }> = [];
    if (fs.existsSync(xlsxPath)) {
      const xBuffer = fs.readFileSync(xlsxPath);
      companionFiles.push({
        filename: `v${firstVerNum}.xlsx`,
        localPath: path.relative(REPO_ROOT, xlsxPath),
        format: "xlsx",
        sizeBytes: xBuffer.length,
        sha256: createHash("sha256").update(xBuffer).digest("hex")
      });
    }

    const totalSteps = isMultiVersion ? versions.length + 1 : 2;

    plan.push({
      docCode: code,
      docTitle,
      stepNum: 1,
      totalStepsForDoc: totalSteps,
      actionType: "CREATE_DOCUMENT",
      endpoint: "/api/documents/",
      method: "POST",
      formFields: {
        code,
        name: docTitle,
        category,
        status: isMultiVersion ? "O" : "V", // v1 histórica se crea como 'obsoleto'; si es única, se crea 'vigente'
        responsible
      },
      attachedFile: pdfStat ? {
        filename: `v${firstVerNum}.pdf`,
        localPath: path.relative(REPO_ROOT, pdfPath),
        format: "pdf",
        sizeBytes: pdfStat.size,
        sha256: pdfHash
      } : undefined,
      companionFiles,
      targetLifecycleState: isMultiVersion ? "obsoleto" : "vigente"
    });

    // 2. ADD_VERSION (para versiones subsecuentes: v2, v3)
    if (isMultiVersion) {
      for (let i = 1; i < versions.length; i++) {
        const ver = versions[i];
        const verNum = parseInt(ver.pims_version.split(".")[0], 10);
        const isLatest = (i === versions.length - 1);
        const verPdfPath = path.join(docDir, `v${verNum}.pdf`);
        const verPdfStat = fs.existsSync(verPdfPath) ? fs.statSync(verPdfPath) : null;
        const verPdfHash = fs.existsSync(verPdfPath)
          ? createHash("sha256").update(fs.readFileSync(verPdfPath)).digest("hex")
          : "";

        const verXlsxPath = path.join(docDir, `v${verNum}.xlsx`);
        const verCompanions: Array<{ filename: string; localPath: string; format: string; sizeBytes: number; sha256: string }> = [];
        if (fs.existsSync(verXlsxPath)) {
          const xBuffer = fs.readFileSync(verXlsxPath);
          verCompanions.push({
            filename: `v${verNum}.xlsx`,
            localPath: path.relative(REPO_ROOT, verXlsxPath),
            format: "xlsx",
            sizeBytes: xBuffer.length,
            sha256: createHash("sha256").update(xBuffer).digest("hex")
          });
        }

        const changeSummary = getChangeSummaryForVersion(verNum, code);

        plan.push({
          docCode: code,
          docTitle,
          stepNum: i + 1,
          totalStepsForDoc: totalSteps,
          actionType: "ADD_VERSION",
          endpoint: `/api/documents/{id}/versions/`,
          method: "POST",
          formFields: {
            change_summary: changeSummary
          },
          attachedFile: verPdfStat ? {
            filename: `v${verNum}.pdf`,
            localPath: path.relative(REPO_ROOT, verPdfPath),
            format: "pdf",
            sizeBytes: verPdfStat.size,
            sha256: verPdfHash
          } : undefined,
          companionFiles: verCompanions,
          targetLifecycleState: isLatest ? "vigente" : "obsoleto"
        });
      }
    }

    // 3. APPROVE_DOCUMENT (aprobación formal del documento en su versión final)
    plan.push({
      docCode: code,
      docTitle,
      stepNum: totalSteps,
      totalStepsForDoc: totalSteps,
      actionType: "APPROVE_DOCUMENT",
      endpoint: `/api/documents/{id}/approve/`,
      method: "POST",
      formFields: {},
      targetLifecycleState: "vigente"
    });
  }

  return plan;
}

function printDryRunSummary(plan: PlannedPostAction[], manifests: Map<string, CorpusMirrorManifest>): void {
  console.log("================================================================================");
  console.log("  PLAN DE CARGA DE DOCUMENTOS A GESTITEL PIMS — MODO DRY-RUN SEGURO");
  console.log("================================================================================");
  console.log(`  PIMS Base URL:   ${process.env.PIMS_BASE_URL || "https://unsa.27k.pe"}`);
  console.log(`  Esquema Tenant:  ${process.env.PIMS_SCHEMA || "unsa"} (Prefijo de inquilino: G4-)`);
  console.log(`  Modo Operativo:  DRY-RUN (Sin mutaciones en el servidor PIMS; flag --live no presente)`);
  console.log("================================================================================\n");

  let totalFiles = 0;
  let totalPdfFiles = 0;
  let totalXlsxFiles = 0;
  let totalBytes = 0;

  let currentDoc = "";
  for (const action of plan) {
    if (action.docCode !== currentDoc) {
      currentDoc = action.docCode;
      console.log(`\n📄 [${action.docCode}] ${action.docTitle}`);
      console.log(`   Categoría: "${action.formFields.category ?? CATEGORY_MAP[action.docCode]}" | Pasos totales: ${action.totalStepsForDoc}`);
    }

    console.log(`   -----------------------------------------------------------------------------`);
    console.log(`   Paso ${action.stepNum}/${action.totalStepsForDoc}: ${action.actionType}`);
    console.log(`     Endpoint: ${action.method} ${action.endpoint}`);

    if (Object.keys(action.formFields).length > 0) {
      console.log(`     Campos FormData:`);
      for (const [k, v] of Object.entries(action.formFields)) {
        if (k === "change_summary") {
          console.log(`       - ${k}: "${v.substring(0, 75)}..."`);
        } else {
          console.log(`       - ${k}: "${v}"`);
        }
      }
    }

    if (action.attachedFile) {
      const f = action.attachedFile;
      totalFiles++;
      totalPdfFiles++;
      totalBytes += f.sizeBytes;
      console.log(`     Archivo Adjunto Primario (PDF):`);
      console.log(`       - Archivo: ${f.filename} (${(f.sizeBytes / 1024).toFixed(1)} KB)`);
      console.log(`       - Ruta:    ${f.localPath}`);
      console.log(`       - SHA-256: ${f.sha256}`);
    }

    if (action.companionFiles && action.companionFiles.length > 0) {
      for (const c of action.companionFiles) {
        totalFiles++;
        totalXlsxFiles++;
        totalBytes += c.sizeBytes;
        console.log(`     Archivo Complementario Normativo (XLSX):`);
        console.log(`       - Archivo: ${c.filename} (${(c.sizeBytes / 1024).toFixed(1)} KB)`);
        console.log(`       - Ruta:    ${c.localPath}`);
        console.log(`       - SHA-256: ${c.sha256}`);
      }
    }

    console.log(`     Estado Resultante: [${action.targetLifecycleState.toUpperCase()}]`);
  }

  console.log("\n================================================================================");
  console.log("  RESUMEN TOTAL DE OPERACIONES PLANIFICADAS");
  console.log("================================================================================");
  console.log(`  Total documentos institucionales G4:  ${manifests.size}`);
  console.log(`  Total acciones POST planificadas:     ${plan.length}`);
  console.log(`  Total archivos físicos involucrados:  ${totalFiles} (${totalPdfFiles} PDFs + ${totalXlsxFiles} XLSX)`);
  console.log(`  Volumen total de transferencia:       ${(totalBytes / 1024).toFixed(1)} KB (${(totalBytes / (1024 * 1024)).toFixed(2)} MB)`);
  console.log("================================================================================");
  console.log("\n[upload-pims-truth] NOTAS DE CICLO DE VIDA Y ESTADOS EN PIMS:");
  console.log("  1. Inmutabilidad: Las versiones v1.0 y v2.0 nunca se eliminan; pasan automáticamente a 'obsoleto' (O).");
  console.log("  2. Estado Final: La última versión (v3.0) queda formalmente en estado 'vigente' (V) tras POST /approve/.");
  console.log("  3. Si la API de PIMS no cuenta con endpoint para marcar versiones anteriores explícitamente como");
  console.log("     'obsoleto', el sistema GESTITEL lo gestiona automáticamente al aprobar la versión más reciente.");
  console.log("     (Consulte docs/PIMS-UPLOAD-RUNBOOK.md para verificar el paso de control visual en la UI).");
  console.log("\n[upload-pims-truth] DRY-RUN CONCLUIDO SATISFACTORIAMENTE. NINGÚN DATO MODIFICADO EN PIMS (SALIDA 0).");
}

async function runLive(plan: PlannedPostAction[]): Promise<void> {
  const username = process.env.PIMS_USERNAME;
  const password = process.env.PIMS_PASSWORD;
  const baseUrl = process.env.PIMS_BASE_URL || "https://unsa.27k.pe";
  const schema = process.env.PIMS_SCHEMA || "unsa";

  if (!username || !password) {
    throw new Error("PIMS_USERNAME y PIMS_PASSWORD son obligatorios para la ejecución en vivo (--live).");
  }

  console.log(`[upload-pims-truth] Iniciando ejecución EN VIVO contra PIMS en ${baseUrl} (${schema})...`);
  const client = new PimsClient({ baseUrl, schema });
  await client.login({ username, password });
  console.log(`[upload-pims-truth] Autenticación exitosa en PIMS.`);

  const docIdCache = new Map<string, number>();
  const docVersionsCache = new Map<number, Set<string>>();

  // Cargar documentos y versiones ya existentes en PIMS para idempotencia
  const existingDocs = await client.documents.listDocuments({ page_size: 100 });
  for (const doc of existingDocs.results) {
    docIdCache.set(doc.code, doc.id);
    const existingVers = await client.documents.getDocumentVersions(doc.id);
    const verSet = new Set<string>();
    for (const v of existingVers) {
      if (v.version) verSet.add(v.version);
    }
    docVersionsCache.set(doc.id, verSet);
    console.log(`[live] Detectado documento existente: ${doc.code} (ID: ${doc.id}) con ${verSet.size} versiones.`);
  }

  for (const action of plan) {
    assertG4WriteCode(action.docCode, "Live Upload");

    if (action.actionType === "CREATE_DOCUMENT") {
      if (docIdCache.has(action.docCode)) {
        console.log(`[live] Documento ${action.docCode} ya registrado (ID: ${docIdCache.get(action.docCode)}). Omitiendo creación inicial.`);
        continue;
      }
      if (!action.attachedFile) {
        throw new Error(`Acción CREATE_DOCUMENT para ${action.docCode} carece de archivo adjunto.`);
      }
      const fullPath = path.resolve(REPO_ROOT, action.attachedFile.localPath);
      const fileBytes = fs.readFileSync(fullPath);

      console.log(`[live] Creando documento ${action.docCode} (${action.formFields.name})...`);
      const created = await client.documents.createDocument({
        code: action.docCode,
        name: action.formFields.name,
        category: action.formFields.category as DocumentCategory,
        status: action.formFields.status as DocumentStatusAPI,
        responsible: action.formFields.responsible,
        upload_file: fileBytes,
        fileName: action.attachedFile.filename
      });

      docIdCache.set(action.docCode, created.id);
      docVersionsCache.set(created.id, new Set(["1.00", "1.0", "1"]));
      console.log(`[live] Creado con ID: ${created.id}`);
    } else if (action.actionType === "ADD_VERSION") {
      const docId = docIdCache.get(action.docCode);
      if (!docId) {
        throw new Error(`ID no encontrado en caché para documento ${action.docCode}`);
      }

      // Comprobar si la versión ya existe para evitar duplicación
      const currentVers = docVersionsCache.get(docId) ?? new Set();
      const targetVerNum = action.stepNum; // step 2 = v2, step 3 = v3
      const targetVerStr = `${targetVerNum}.00`;
      if (currentVers.has(targetVerStr) || currentVers.has(`${targetVerNum}.0`)) {
        console.log(`[live] Versión v${targetVerNum} ya existe para ${action.docCode} (ID: ${docId}). Omitiendo.`);
        continue;
      }

      if (!action.attachedFile) {
        throw new Error(`Acción ADD_VERSION para ${action.docCode} carece de archivo adjunto.`);
      }
      const fullPath = path.resolve(REPO_ROOT, action.attachedFile.localPath);
      const fileBytes = fs.readFileSync(fullPath);

      console.log(`[live] Agregando versión para documento ${action.docCode} (ID: ${docId})...`);
      const versionResult = await client.documents.addDocumentVersion(docId, {
        file: fileBytes,
        change_summary: action.formFields.change_summary,
        fileName: action.attachedFile.filename
      });
      currentVers.add(targetVerStr);
      console.log(`[live] Versión agregada exitosamente (v${versionResult.version ?? targetVerNum}).`);
    } else if (action.actionType === "APPROVE_DOCUMENT") {
      // Orden del coordinador: Omitir llamadas a approve debido a 403 en grupob4
      console.log(`[live] Omitiendo aprobación API para ${action.docCode} (requiere paso manual en UI por administrador conforme a runbook Fase 6).`);
    }
  }

  console.log(`[upload-pims-truth] Ejecución en vivo finalizada con éxito.`);
}

async function main(): Promise<void> {
  const isLive = process.argv.includes("--live");

  const manifests = readAllManifests();
  if (manifests.size === 0) {
    console.error("[upload-pims-truth] Error: No se encontraron manifiestos en corpus_mirror/.");
    console.error("Ejecute primero: bun scripts/render-all.ts");
    process.exit(1);
  }

  const plan = buildUploadPlan(manifests);

  if (!isLive) {
    printDryRunSummary(plan, manifests);
    process.exit(0);
  } else {
    await runLive(plan);
  }
}

main().catch((err) => {
  console.error("[upload-pims-truth] Error:", err.message ?? err);
  process.exit(1);
});
