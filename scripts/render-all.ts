#!/usr/bin/env bun
/**
 * scripts/render-all.ts
 *
 * Renderizador integral de artefactos del SGPI UNSA (Grupo 4).
 * Compila TODOS los invocadores de versión Typst (G4-*.typ) a PDF
 * y ejecuta los 3 generadores XLSX normativos (Registro B.3.12, Apéndice 1, Apéndice 2).
 *
 * Salidas estructuradas en:
 *   corpus_mirror/<code>/v<n>.<ext>
 *   corpus_mirror/<code>/manifest.json (SHA-256, mold fuente, versión, fecha)
 *
 * Salida no-cero inmediata con archivo y línea ante cualquier error de Typst.
 * CERO llamadas a PIMS.
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { generateIncidentXlsx } from "../molds/incident-register/generate.ts";
import { generateAssessmentXlsx } from "../molds/incident-risks/generate-assessment.ts";
import { generateTreatmentXlsx } from "../molds/incident-risks/generate-treatment.ts";

const REPO_ROOT = path.resolve(__dirname, "..");
const CORPUS_DIR = path.join(REPO_ROOT, "corpus_mirror");

interface CallerInfo {
  filePath: string;
  code: string;
  version: string;
  versionNum: number;
  date: string;
  title: string;
}

interface ManifestFileEntry {
  filename: string;
  file_path: string;
  format: "pdf" | "xlsx";
  sha256: string;
  size_bytes: number;
  source_mold: string;
}

interface ManifestVersion {
  version: string;
  pims_version: string;
  version_num: number;
  date: string;
  source_mold: string;
  mold_path: string;
  filename: string;
  file_path: string;
  sha256: string;
  files: ManifestFileEntry[];
}

interface DocManifest {
  code: string;
  pims_doc_id: string;
  title: string;
  latest_version: string;
  updated_at: string;
  versions: ManifestVersion[];
}

function resolveTypstBinary(): { bin: string; prefixArgs: string[] } {
  // 1. Check system typst
  const sysCheck = spawnSync("typst", ["--version"], { encoding: "utf-8" });
  if (sysCheck.status === 0) {
    return { bin: "typst", prefixArgs: [] };
  }

  // 2. Check nix run nixpkgs#typst
  const nixCheck = spawnSync("nix", ["run", "nixpkgs#typst", "--", "--version"], { encoding: "utf-8" });
  if (nixCheck.status === 0) {
    return { bin: "nix", prefixArgs: ["run", "nixpkgs#typst", "--"] };
  }

  throw new Error("FATAL: Neither system 'typst' nor 'nix run nixpkgs#typst' is available in environment.");
}

function parseCallerFile(filePath: string): CallerInfo {
  const content = fs.readFileSync(filePath, "utf-8");

  const codeMatch = content.match(/code:\s*"([^"]+)"/);
  const versionMatch = content.match(/version:\s*"([^"]+)"/);
  const dateMatch = content.match(/date:\s*"([0-9]{4}-[0-9]{2}-[0-9]{2})"/);
  const titleMatch = content.match(/title:\s*"([^"]+)"/);

  if (!codeMatch || !versionMatch || !dateMatch) {
    throw new Error(`Incomplete metadata in ${filePath}: code=${codeMatch?.[1]}, version=${versionMatch?.[1]}, date=${dateMatch?.[1]}`);
  }

  const code = codeMatch[1];
  const version = versionMatch[1];
  const date = dateMatch[1];
  const title = titleMatch ? titleMatch[1] : code;
  const versionNum = parseInt(version.split(".")[0], 10) || 1;

  return {
    filePath,
    code,
    version,
    versionNum,
    date,
    title
  };
}

function findVersionCallers(dir: string): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "common" && entry.name !== "node_modules" && entry.name !== ".git") {
        results.push(...findVersionCallers(fullPath));
      }
    } else if (entry.isFile() && entry.name.startsWith("G4-") && entry.name.endsWith(".typ")) {
      results.push(fullPath);
    }
  }

  return results.sort();
}

function calculateFileSha256(filePath: string): { sha256: string; size: number } {
  const buffer = fs.readFileSync(filePath);
  const hash = createHash("sha256").update(buffer).digest("hex");
  return { sha256: hash, size: buffer.length };
}

function getCategoryForCode(code: string): string {
  const map: Record<string, string> = {
    "G4-ALC-01": "Alcance del SGPI",
    "G4-POL-01": "Política de Privacidad",
    "G4-RSK-INC-01": "Gestión de Riesgos",
    "G4-MET-RSK-01": "Metodología de Riesgos",
    "G4-PLN-RSK-01": "Plan de Tratamiento de Riesgos",
    "G4-SOA-01": "Declaración de Aplicabilidad",
    "G4-OBJ-01": "Objetivos de Privacidad",
    "G4-PRC-DOC-01": "Control de Información Documentada",
    "G4-CAP-INC-01": "Capacitación y Concienciación",
    "G4-REG-CAP-01": "Registro de Capacitación",
    "G4-PRC-INC-01": "Respuesta a Incidentes",
    "G4-REG-INC-01": "Registro de Incidentes y Brechas",
    "G4-PRG-AUD-01": "Programa de Auditoría",
    "G4-REP-AUD-01": "Informe de Auditoría",
    "G4-ACT-REV-01": "Revisión por la Dirección",
    "G4-PRC-CAPA-01": "Mejora y Acciones Correctivas",
    "G4-REG-CAPA-01": "Registro de Acciones Correctivas",
    "G4-IDX-01": "Índice Maestro de Auditoría"
  };
  return map[code] ?? "Gestión de Privacidad";
}

async function main(): Promise<void> {
  console.log("================================================================================");
  console.log("  RENDER-ALL — Compilación de Artefactos SGPI UNSA (Typst PDF + OpenXML XLSX)");
  console.log("================================================================================");

  const typst = resolveTypstBinary();
  console.log(`[render-all] Typst runtime resuelto: ${typst.bin} ${typst.prefixArgs.join(" ")}`);

  if (!fs.existsSync(CORPUS_DIR)) {
    fs.mkdirSync(CORPUS_DIR, { recursive: true });
  }

  const callerFiles = findVersionCallers(path.join(REPO_ROOT, "corpus_g4_src"));
  console.log(`[render-all] Invocadores de versión detectados: ${callerFiles.length}`);

  let pdfSuccessCount = 0;
  let xlsxSuccessCount = 0;
  const docsMap = new Map<string, { title: string; versions: Map<number, ManifestVersion> }>();

  // 1. Compilación de todos los archivos Typst a PDF
  for (const callerPath of callerFiles) {
    const callerRel = path.relative(REPO_ROOT, callerPath);
    const info = parseCallerFile(callerPath);
    const docDir = path.join(CORPUS_DIR, info.code);

    if (!fs.existsSync(docDir)) {
      fs.mkdirSync(docDir, { recursive: true });
    }

    const pdfFilename = `v${info.versionNum}.pdf`;
    const pdfPath = path.join(docDir, pdfFilename);
    const pdfRel = path.relative(REPO_ROOT, pdfPath);

    process.stdout.write(`[render-all] Compilando ${callerRel} -> ${pdfRel}... `);

    const typstArgs = [
      ...typst.prefixArgs,
      "compile",
      "--root",
      REPO_ROOT,
      callerPath,
      pdfPath
    ];

    const result = spawnSync(typst.bin, typstArgs, {
      cwd: REPO_ROOT,
      encoding: "utf-8"
    });

    if (result.status !== 0) {
      console.log("FAILED!");
      console.error(`\n[render-all] ERROR CRÍTICO DE COMPILACIÓN TYPST EN: ${callerRel}`);
      console.error("==================== DETALLE DE ERROR TYPST ====================");
      console.error(result.stderr || result.stdout);
      console.error("================================================================\n");
      process.exit(result.status || 1);
    }

    const { sha256, size } = calculateFileSha256(pdfPath);
    pdfSuccessCount++;
    console.log(`OK (${(size / 1024).toFixed(1)} KB, SHA: ${sha256.substring(0, 8)})`);

    if (!docsMap.has(info.code)) {
      docsMap.set(info.code, {
        title: info.title,
        versions: new Map<number, ManifestVersion>()
      });
    }

    const docEntry = docsMap.get(info.code)!;
    const versionEntry: ManifestVersion = {
      version: info.version,
      pims_version: info.version,
      version_num: info.versionNum,
      date: info.date,
      source_mold: callerRel,
      mold_path: callerRel,
      filename: pdfFilename,
      file_path: pdfRel,
      sha256,
      files: [
        {
          filename: pdfFilename,
          file_path: pdfRel,
          format: "pdf",
          sha256,
          size_bytes: size,
          source_mold: callerRel
        }
      ]
    };

    docEntry.versions.set(info.versionNum, versionEntry);
  }

  // 2. Ejecución de los 3 generadores XLSX normativos
  console.log("\n[render-all] Generando artefactos tabulares normativos (XLSX)...");

  // 2a. Generador de Incidentes B.3.12 (G4-REG-INC-01: v1, v2, v3)
  const regCode = "G4-REG-INC-01";
  const regDocDir = path.join(CORPUS_DIR, regCode);
  const regVersions: Array<{ verNum: number; verScope: "v1" | "v2" | "v3" }> = [
    { verNum: 1, verScope: "v1" },
    { verNum: 2, verScope: "v2" },
    { verNum: 3, verScope: "v3" }
  ];

  for (const { verNum, verScope } of regVersions) {
    const xlsxFilename = `v${verNum}.xlsx`;
    const xlsxPath = path.join(regDocDir, xlsxFilename);
    generateIncidentXlsx(xlsxPath, verScope);
    const { sha256, size } = calculateFileSha256(xlsxPath);
    xlsxSuccessCount++;

    const docEntry = docsMap.get(regCode);
    if (docEntry && docEntry.versions.has(verNum)) {
      const v = docEntry.versions.get(verNum)!;
      v.files.push({
        filename: xlsxFilename,
        file_path: path.relative(REPO_ROOT, xlsxPath),
        format: "xlsx",
        sha256,
        size_bytes: size,
        source_mold: "molds/incident-register/generate.ts"
      });
    }
  }

  // 2b. Generador de Evaluación de Riesgos Apéndice 1 (G4-RSK-INC-01: v1, v2, v3)
  const rskCode = "G4-RSK-INC-01";
  const rskDocDir = path.join(CORPUS_DIR, rskCode);
  const rskVersions: Array<{ verNum: number; verScope: "v1" | "v2" | "v3" }> = [
    { verNum: 1, verScope: "v1" },
    { verNum: 2, verScope: "v2" },
    { verNum: 3, verScope: "v3" }
  ];

  for (const { verNum, verScope } of rskVersions) {
    const xlsxFilename = `v${verNum}.xlsx`;
    const xlsxPath = path.join(rskDocDir, xlsxFilename);
    generateAssessmentXlsx(xlsxPath, verScope);
    const { sha256, size } = calculateFileSha256(xlsxPath);
    xlsxSuccessCount++;

    const docEntry = docsMap.get(rskCode);
    if (docEntry && docEntry.versions.has(verNum)) {
      const v = docEntry.versions.get(verNum)!;
      v.files.push({
        filename: xlsxFilename,
        file_path: path.relative(REPO_ROOT, xlsxPath),
        format: "xlsx",
        sha256,
        size_bytes: size,
        source_mold: "molds/incident-risks/generate-assessment.ts"
      });
    }
  }

  // 2c. Generador de Tratamiento de Riesgos Apéndice 2 (G4-PLN-RSK-01: v3)
  const plnCode = "G4-PLN-RSK-01";
  const plnDocDir = path.join(CORPUS_DIR, plnCode);
  const plnXlsxFilename = `v3.xlsx`;
  const plnXlsxPath = path.join(plnDocDir, plnXlsxFilename);
  generateTreatmentXlsx(plnXlsxPath, "v3");
  const { sha256: plnSha, size: plnSize } = calculateFileSha256(plnXlsxPath);
  xlsxSuccessCount++;

  const plnDocEntry = docsMap.get(plnCode);
  if (plnDocEntry && plnDocEntry.versions.has(3)) {
    const v = plnDocEntry.versions.get(3)!;
    v.files.push({
      filename: plnXlsxFilename,
      file_path: path.relative(REPO_ROOT, plnXlsxPath),
      format: "xlsx",
      sha256: plnSha,
      size_bytes: plnSize,
      source_mold: "molds/incident-risks/generate-treatment.ts"
    });
  }

  // 3. Generación y escritura de manifest.json por documento
  console.log("\n[render-all] Escribiendo manifest.json en cada carpeta de corpus_mirror/...");
  let manifestSuccessCount = 0;

  for (const [code, docData] of docsMap.entries()) {
    const docDir = path.join(CORPUS_DIR, code);
    const manifestPath = path.join(docDir, "manifest.json");

    const sortedVersions = Array.from(docData.versions.keys())
      .sort((a, b) => a - b)
      .map(k => docData.versions.get(k)!);

    const latestVersion = sortedVersions[sortedVersions.length - 1]?.version ?? "1.0";

    const manifest: DocManifest = {
      code,
      pims_doc_id: code,
      title: docData.title,
      latest_version: latestVersion,
      updated_at: new Date().toISOString(),
      versions: sortedVersions
    };

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
    manifestSuccessCount++;
  }

  // 4. Resumen final de entrega
  console.log("\n================================================================================");
  console.log("  RESUMEN DE RENDERING Y ARTEFACTOS GENERADOS");
  console.log("================================================================================");
  console.log(`  Documentos institucionales procesados: ${docsMap.size}`);
  console.log(`  Archivos PDF compilados via Typst:      ${pdfSuccessCount}`);
  console.log(`  Libros XLSX generados (B.3.12/Ap1/Ap2): ${xlsxSuccessCount}`);
  console.log(`  Manifiestos generados (manifest.json): ${manifestSuccessCount}`);
  console.log("================================================================================\n");

  const dirList = fs.readdirSync(CORPUS_DIR).sort();
  console.log(`Estructura en ${path.relative(REPO_ROOT, CORPUS_DIR)}/ (${dirList.length} directorios):`);
  for (const item of dirList) {
    const subPath = path.join(CORPUS_DIR, item);
    if (fs.statSync(subPath).isDirectory()) {
      const files = fs.readdirSync(subPath).sort();
      console.log(`  📁 ${item}: [${files.join(", ")}]`);
    }
  }

  console.log("\n[render-all] PROCESO COMPLETADO EXITOSAMENTE (CÓDIGO DE SALIDA 0).");
}

main().catch((err) => {
  console.error("[render-all] Error fatal inesperado:", err);
  process.exit(1);
});
