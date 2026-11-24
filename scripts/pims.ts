#!/usr/bin/env bun
/**
 * scripts/pims.ts
 *
 * Unified CLI for GESTITEL PIMS covering all 20 subcommands specified in docs/PIMS-SDK-SPEC.md §3:
 * Live reads, gated writes (G4- write isolation, --confirm requirement), mirror sync/read delegation,
 * structural PDF diffs, and sidecar publishing.
 */

import { createHash } from "node:crypto";
import { accessSync, constants, existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { PimsClient } from "../packages/pims-adapter/client.ts";
import {
  DocumentStatusMappingError,
  PimsAttachmentFormatError,
  PimsAttachmentSizeError,
  PimsNotFoundError,
  PimsReadFailureError,
  PimsValidationError,
  TenantGuardViolationError,
} from "../packages/pims-adapter/errors.ts";
import { assertG4WriteCode } from "../packages/pims-adapter/guards.ts";
import { assertIncidentAttachment } from "../packages/pims-adapter/incidents.ts";
import type {
  CreateDocumentInput,
  CreateIncidentInput,
  DocumentCategory,
  DocumentStatusAPI,
  DocumentStatusUI,
  IncidentSeverityAPI,
  IncidentStatusAPI,
  IncidentTypeCode,
  UpdateIncidentInput,
} from "../packages/pims-adapter/types.ts";
import { compareVersions } from "../packages/rag-mirror/diff.ts";
import { matchDocumentVersion } from "../packages/rag-mirror/mirror.ts";
import type { PimsDocumentFetcher } from "../packages/rag-mirror/types.ts";
import { MailConnectorClient } from "../connectors/mail/client.ts";

const HELP_TEXT = `GESTITEL PIMS Unified CLI (all 21 subcommands)

Usage:
  bun scripts/pims.ts <command> [subcommand] [flags]

Global Flags:
  --json          Machine-readable structured JSON output
  --compact       Token-efficient table / summary format
  --confirm       Execute live mutation against PIMS (defaults to dry-run)
  --dry-run       Explicitly request dry-run simulation (exits code 2)
  -h, --help      Show this help message and exit

Subcommands (20 operations per SPEC §3):
  1. docs list [--search <q>] [--category PO|PR|RE|IN] [--status B|R|V|O]
  2. docs get <id_or_code>
  3. docs versions <id_or_code>
  4. docs download <id_or_code> [--ver <v>] [--out <path>]
  5. docs create --code G4-... --name ... --category PO|PR|RE|IN --status B|R|V|O --responsible ... --file <path.pdf> --file-name <name.pdf>
  6. docs add-version <id_or_code> --file <path.pdf> --file-name <name.pdf> --summary <summary>
  7. incidents list [--status O|P|C] [--severity L|M|H|C] [--search <q>]
  8. incidents get <id_or_code> [--include-emails]
  9. incidents create --code G4-... --title ... --description ... --severity L|M|H|C --status O|P|C [--incident-type ...]
     incidents update <id_or_code> [--code ...] [--title ...] [--description ...] [--severity ...] [--status ...]
  10. incidents attach <id_or_code> --file <path> [--file-name <name>]
  11. audits list [--dedupe]
  12. audits get <id_or_code> [--dedupe] [--overdue-only] [--open-only]
  13. risks list
      risks catalogs
      risks eligible-assets
  14. assets list
  15. dashboard [--tab summary]
  16. annex-a meta
  17. mirror sync [--loop --interval 300] [--force [--code <doc.code>] [--confirm]]
  18. mirror read <code_or_id> [--ver <v>]
  19. diff <code_or_id> --from <v1> --to <v2> [--full]
  20. publish --slug <slug> --file <path> [--filename <name>]
  21. mail draft --finding <id> --title <t> --severity red|amber|green --to-name <n> --to <email> --deadline <date> --evidence <cite> --actions <summary>
      mail get --id <draftId> | mail list | mail update-recipient --id <draftId> --to <email> [--to-name <n>]
      mail dispatch --id <draftId> --phrase envíalo --confirm

Examples:
  bun scripts/pims.ts docs list --compact
  bun scripts/pims.ts docs get G4-POL-01 --json
  bun scripts/pims.ts docs download G4-POL-01 --ver 3.00 --out ./G4-POL-01_v3.00.pdf
  bun scripts/pims.ts docs create --code G4-POL-99 --name "Pol" --category PO --status B --responsible "dpo" --file doc.pdf --file-name G4-POL-99_v1.0.pdf --confirm
  bun scripts/pims.ts incidents list --status P --severity H
  bun scripts/pims.ts incidents get INC-001 --include-emails
  bun scripts/pims.ts audits list --dedupe --compact
  bun scripts/pims.ts audits get AUD-2026-001 --open-only
  bun scripts/pims.ts risks list --compact
  bun scripts/pims.ts assets list --compact
  bun scripts/pims.ts dashboard --tab summary
  bun scripts/pims.ts annex-a meta
  bun scripts/pims.ts mirror sync --loop --interval 300
  bun scripts/pims.ts mirror read G4-POL-01 --ver 3.00
  bun scripts/pims.ts diff G4-POL-01 --from 1.00 --to 3.00
  bun scripts/pims.ts publish --slug preview-pol --file ./doc.pdf
`;

interface ParsedCli {
  globals: {
    json: boolean;
    compact: boolean;
    confirm: boolean;
    dryRun: boolean;
    help: boolean;
  };
  positionals: string[];
  options: Record<string, string | boolean>;
}

function parseArgs(args: string[]): ParsedCli {
  const result: ParsedCli = {
    globals: {
      json: false,
      compact: false,
      confirm: false,
      dryRun: false,
      help: false,
    },
    positionals: [],
    options: {},
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "-h" || arg === "--help") {
      result.globals.help = true;
    } else if (arg === "--json") {
      result.globals.json = true;
    } else if (arg === "--compact") {
      result.globals.compact = true;
    } else if (arg === "--confirm") {
      result.globals.confirm = true;
    } else if (arg === "--dry-run") {
      result.globals.dryRun = true;
    } else if (arg.startsWith("--")) {
      const eqIdx = arg.indexOf("=");
      if (eqIdx !== -1) {
        const key = arg.slice(2, eqIdx);
        const val = arg.slice(eqIdx + 1);
        result.options[key] = val;
      } else {
        const key = arg.slice(2);
        const nextArg = args[i + 1];
        if (nextArg !== undefined && !nextArg.startsWith("-")) {
          result.options[key] = nextArg;
          i++;
        } else {
          result.options[key] = true;
        }
      }
    } else {
      result.positionals.push(arg);
    }
  }

  return result;
}

function handleDryRun(
  action: string,
  endpoint: string,
  method: string,
  fields: Record<string, unknown>,
  fileInfo: { name: string; size_bytes: number; sha256: string } | null,
  isJson: boolean,
): never {
  if (isJson) {
    const payload = {
      dry_run: true,
      action,
      endpoint,
      method,
      fields,
      ...(fileInfo !== null ? { file: fileInfo } : {}),
      message: "Planned mutation. Pass --confirm to execute.",
    };
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log(`[DRY-RUN] Planned mutation: ${action}`);
    console.log(`Endpoint: ${method} ${endpoint}`);
    console.log(`Fields:`);
    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined) {
        console.log(`  ${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`);
      }
    }
    if (fileInfo !== null) {
      console.log(`File:`);
      console.log(`  name: ${fileInfo.name}`);
      console.log(`  size_bytes: ${fileInfo.size_bytes}`);
      console.log(`  sha256: ${fileInfo.sha256}`);
    }
    console.log(`Confirmation required: Pass --confirm to execute live mutation.`);
  }
  process.exit(2);
}

function assertPdfFileName(fileName: unknown, context: string): string {
  if (typeof fileName !== "string" || fileName.trim() === "") {
    throw new PimsValidationError(
      "fileName",
      `${context} requires a non-empty PDF filename (e.g. 'G4-POL-01_v4.0.pdf').`,
    );
  }
  const clean = fileName.trim().toLowerCase();
  if (!clean.endsWith(".pdf")) {
    throw new PimsValidationError(
      "fileName",
      `${context} requires a filename ending with .pdf (received: "${fileName}").`,
    );
  }
  return fileName.trim();
}

function printTable(headers: string[], rows: string[][]): void {
  const colWidths = headers.map((h, i) => {
    let max = h.length;
    for (const row of rows) {
      const cell = row[i] ?? "";
      if (cell.length > max) max = cell.length;
    }
    return max;
  });

  const headerLine = headers.map((h, i) => h.padEnd(colWidths[i])).join("  ");
  const sepLine = colWidths.map((w) => "-".repeat(w)).join("  ");
  console.log(headerLine);
  console.log(sepLine);
  for (const row of rows) {
    const line = row.map((cell, i) => (cell ?? "").padEnd(colWidths[i])).join("  ");
    console.log(line);
  }
}

async function handleDocs(parsed: ParsedCli): Promise<void> {
  const sub = parsed.positionals[1] ?? "";
  const client = new PimsClient();
  const isJson = parsed.globals.json;
  const isCompact = parsed.globals.compact;
  const isConfirm = parsed.globals.confirm && !parsed.globals.dryRun;

  switch (sub) {
    case "list": {
      const search = typeof parsed.options.search === "string" ? parsed.options.search : undefined;
      const category = typeof parsed.options.category === "string" ? (parsed.options.category as DocumentCategory) : undefined;
      const status = typeof parsed.options.status === "string" ? (parsed.options.status as DocumentStatusAPI) : undefined;
      const page = typeof parsed.options.page === "string" ? Number.parseInt(parsed.options.page, 10) : undefined;
      const pageSize = typeof parsed.options["page-size"] === "string" ? Number.parseInt(parsed.options["page-size"], 10) : undefined;

      const res = await client.listDocuments({ search, category, status, page, page_size: pageSize });

      if (isJson) {
        console.log(JSON.stringify(res, null, 2));
      } else if (isCompact) {
        const rows = res.results.map((d) => [
          d.code,
          d.status,
          d.category,
          d.current_version,
          d.responsible,
          d.name.length > 40 ? `${d.name.slice(0, 37)}...` : d.name,
        ]);
        printTable(["CODE", "STATUS", "CAT", "VER", "RESPONSIBLE", "NAME"], rows);
      } else {
        console.log(`Found ${res.count} documents (showing ${res.results.length}):`);
        for (const d of res.results) {
          console.log(`  [${d.code}] (${d.status}) v${d.current_version} [${d.category}] ${d.name} (${d.responsible})`);
        }
      }
      break;
    }

    case "get": {
      const idOrCode = parsed.positionals[2];
      if (!idOrCode) {
        throw new PimsValidationError("id_or_code", "docs get requires <id_or_code>");
      }
      const doc = await client.resolveDocument(idOrCode);
      if (isJson) {
        console.log(JSON.stringify(doc, null, 2));
      } else if (isCompact) {
        console.log(`${doc.code} | v${doc.current_version} | Status:${doc.status} | Cat:${doc.category} | Resp:${doc.responsible} | ${doc.name}`);
      } else {
        console.log(`Document ${doc.code} (ID: ${doc.id}):`);
        console.log(`  Name: ${doc.name}`);
        console.log(`  Category: ${doc.category}`);
        console.log(`  Status: ${doc.status}`);
        console.log(`  Current Version: ${doc.current_version}`);
        console.log(`  Responsible: ${doc.responsible}`);
        console.log(`  File: ${doc.file}`);
        console.log(`  Approved At: ${doc.approved_at ?? "None"}`);
        console.log(`  Approved By: ${doc.approved_by_name ?? "None"}`);
      }
      break;
    }

    case "versions": {
      const idOrCode = parsed.positionals[2];
      if (!idOrCode) {
        throw new PimsValidationError("id_or_code", "docs versions requires <id_or_code>");
      }
      const doc = await client.resolveDocument(idOrCode);
      const versions = await client.getDocumentVersions(doc.id);
      if (isJson) {
        console.log(JSON.stringify(versions, null, 2));
      } else if (isCompact) {
        const rows = versions.map((v) => [
          v.version,
          v.created_at ? v.created_at.slice(0, 10) : "",
          v.created_by_name || String(v.created_by),
          v.change_summary.length > 50 ? `${v.change_summary.slice(0, 47)}...` : v.change_summary,
        ]);
        printTable(["VER", "DATE", "AUTHOR", "SUMMARY"], rows);
      } else {
        console.log(`Versions for document ${doc.code} (${versions.length} versions):`);
        for (const v of versions) {
          console.log(`  v${v.version} (${v.created_at}) by ${v.created_by_name}: ${v.change_summary}`);
        }
      }
      break;
    }

    case "download": {
      const idOrCode = parsed.positionals[2];
      if (!idOrCode) {
        throw new PimsValidationError("id_or_code", "docs download requires <id_or_code>");
      }
      const doc = await client.resolveDocument(idOrCode);
      const targetVer = typeof parsed.options.ver === "string" ? parsed.options.ver : undefined;

      let fileUrl = doc.file;
      let effectiveVer = doc.current_version;

      if (targetVer !== undefined) {
        const versions = await client.getDocumentVersions(doc.id);
        const match = versions.find((v) => matchDocumentVersion(v.version, targetVer));
        if (!match) {
          throw new PimsNotFoundError("DocumentVersion", `${doc.code} version ${targetVer}`);
        }
        fileUrl = match.file;
        effectiveVer = match.version;
      }

      const pdfBytes = await client.downloadDocumentPdf(fileUrl);
      const defaultOut = `${doc.code}_v${effectiveVer}.pdf`;
      const outPath = typeof parsed.options.out === "string" ? parsed.options.out : defaultOut;

      writeFileSync(outPath, pdfBytes);

      if (isJson) {
        console.log(JSON.stringify({ ok: true, code: doc.code, version: effectiveVer, path: outPath, size_bytes: pdfBytes.byteLength }, null, 2));
      } else {
        console.log(`Downloaded ${doc.code} v${effectiveVer} to ${outPath} (${pdfBytes.byteLength} bytes)`);
      }
      break;
    }

    case "create": {
      const code = typeof parsed.options.code === "string" ? parsed.options.code : "";
      assertG4WriteCode(code, "Document");

      const name = typeof parsed.options.name === "string" ? parsed.options.name : "";
      if (name.trim() === "") {
        throw new PimsValidationError("name", "Document creation requires --name");
      }

      const category = typeof parsed.options.category === "string" ? (parsed.options.category as DocumentCategory) : undefined;
      if (!category) {
        throw new PimsValidationError("category", "Document creation requires --category PO|PR|RE|IN");
      }

      const status = typeof parsed.options.status === "string" ? (parsed.options.status as DocumentStatusAPI) : "B";
      const responsible = typeof parsed.options.responsible === "string" ? parsed.options.responsible : "";
      if (responsible.trim() === "") {
        throw new PimsValidationError("responsible", "Document creation requires --responsible");
      }

      const rawFileName = parsed.options["file-name"] ?? parsed.options.filename;
      const fileName = assertPdfFileName(rawFileName, "Document creation");

      const filePath = typeof parsed.options.file === "string" ? parsed.options.file : "";
      if (!filePath || !existsSync(filePath)) {
        throw new PimsValidationError("file", `Document upload file not found: ${filePath}`);
      }

      const fileBytes = readFileSync(filePath);
      const sha256 = createHash("sha256").update(fileBytes).digest("hex");
      const stat = statSync(filePath);

      const endpoint = "/api/documents/";
      const fields = { code, name, category, status, responsible };
      const fileInfo = { name: fileName, size_bytes: stat.size, sha256 };

      if (!isConfirm) {
        handleDryRun("docs create", endpoint, "POST", fields, fileInfo, isJson);
      }

      const input: CreateDocumentInput = {
        code,
        name,
        category,
        status,
        responsible,
        upload_file: fileBytes,
        fileName,
      };

      const created = await client.createDocument(input);
      if (isJson) {
        console.log(JSON.stringify(created, null, 2));
      } else {
        console.log(`Document created successfully: ${created.code} (ID: ${created.id})`);
      }
      break;
    }

    case "add-version": {
      const idOrCode = parsed.positionals[2];
      if (!idOrCode) {
        throw new PimsValidationError("id_or_code", "docs add-version requires <id_or_code>");
      }

      const rawFileName = parsed.options["file-name"] ?? parsed.options.filename;
      const fileName = assertPdfFileName(rawFileName, "Version creation");

      const summary = typeof parsed.options.summary === "string" ? parsed.options.summary : "";
      if (summary.trim() === "") {
        throw new PimsValidationError("change_summary", "Version creation requires non-empty --summary");
      }

      const filePath = typeof parsed.options.file === "string" ? parsed.options.file : "";
      if (!filePath || !existsSync(filePath)) {
        throw new PimsValidationError("file", `Version file not found: ${filePath}`);
      }

      const fileBytes = readFileSync(filePath);
      const sha256 = createHash("sha256").update(fileBytes).digest("hex");
      const stat = statSync(filePath);

      const endpoint = `/api/documents/${idOrCode}/versions/`;
      const fields = { change_summary: summary };
      const fileInfo = { name: fileName, size_bytes: stat.size, sha256 };

      if (!isConfirm) {
        handleDryRun("docs add-version", endpoint, "POST", fields, fileInfo, isJson);
      }

      const doc = await client.resolveDocument(idOrCode);
      const versionResult = await client.addDocumentVersion(doc.id, {
        file: fileBytes,
        fileName,
        change_summary: summary,
      });

      if (isJson) {
        console.log(JSON.stringify(versionResult, null, 2));
      } else {
        console.log(`Version added successfully to ${doc.code}: v${versionResult.version}`);
      }
      break;
    }

    default:
      console.error(`Error: Unknown docs subcommand "${sub}".`);
      console.error(HELP_TEXT);
      process.exit(2);
  }
}

async function handleIncidents(parsed: ParsedCli): Promise<void> {
  const sub = parsed.positionals[1] ?? "";
  const client = new PimsClient();
  const isJson = parsed.globals.json;
  const isCompact = parsed.globals.compact;
  const isConfirm = parsed.globals.confirm && !parsed.globals.dryRun;

  switch (sub) {
    case "list": {
      const search = typeof parsed.options.search === "string" ? parsed.options.search : undefined;
      const status = typeof parsed.options.status === "string" ? (parsed.options.status as IncidentStatusAPI) : undefined;
      const severity = typeof parsed.options.severity === "string" ? (parsed.options.severity as IncidentSeverityAPI) : undefined;
      const incidentType = typeof parsed.options["incident-type"] === "string" ? parsed.options["incident-type"] : undefined;
      const page = typeof parsed.options.page === "string" ? Number.parseInt(parsed.options.page, 10) : undefined;
      const pageSize = typeof parsed.options["page-size"] === "string" ? Number.parseInt(parsed.options["page-size"], 10) : undefined;

      const res = await client.listIncidents({ search, status, severity, incident_type: incidentType, page, page_size: pageSize });

      if (isJson) {
        console.log(JSON.stringify(res, null, 2));
      } else if (isCompact) {
        const rows = res.results.map((inc) => [
          inc.incident_code,
          inc.status,
          inc.severity,
          inc.incident_date ?? "",
          inc.title.length > 40 ? `${inc.title.slice(0, 37)}...` : inc.title,
        ]);
        printTable(["CODE", "STATUS", "SEV", "DATE", "TITLE"], rows);
      } else {
        console.log(`Found ${res.count} incidents (showing ${res.results.length}):`);
        for (const inc of res.results) {
          console.log(`  [${inc.incident_code}] (${inc.status}/${inc.severity}) ${inc.title}`);
        }
      }
      break;
    }

    case "get": {
      const idOrCode = parsed.positionals[2];
      if (!idOrCode) {
        throw new PimsValidationError("id_or_code", "incidents get requires <id_or_code>");
      }
      const inc = await client.resolveIncident(idOrCode);
      const includeEmails = Boolean(parsed.options["include-emails"]);

      const sanitized = { ...inc };
      if (!includeEmails) {
        delete sanitized.dpo_contact_email;
        delete sanitized.rep_email;
      }

      if (isJson) {
        console.log(JSON.stringify(sanitized, null, 2));
      } else if (isCompact) {
        const actions = inc.actions ?? [];
        const withEvidence = actions.filter((a) => (a.evidence ?? "").trim() !== "").length;
        console.log(`${inc.incident_code} | Status:${inc.status} | Sev:${inc.severity} | ${inc.title}`);
        console.log(`  Actions:${actions.length} Evidence:${withEvidence}/${actions.length} Resolved:${inc.resolved_date ?? "-"} Assigned:${inc.assigned_to ?? "-"}`);
        if (includeEmails) console.log(`  DPO:${inc.dpo_contact_email ?? "-"} Rep:${inc.rep_email ?? "-"}`);
      } else {
        console.log(`Incident ${inc.incident_code} (ID: ${inc.id}):`);
        console.log(`  Title: ${inc.title}`);
        console.log(`  Status: ${inc.status}`);
        console.log(`  Severity: ${inc.severity}`);
        console.log(`  Incident Date: ${inc.incident_date ?? "None"}`);
        console.log(`  Description: ${inc.description ?? "None"}`);
        if (includeEmails) {
          console.log(`  DPO Email: ${inc.dpo_contact_email ?? "None"}`);
          console.log(`  Rep Email: ${inc.rep_email ?? "None"}`);
        }
      }
      break;
    }

    case "create": {
      const code = typeof parsed.options.code === "string" ? parsed.options.code : "";
      assertG4WriteCode(code, "Incident");

      const title = typeof parsed.options.title === "string" ? parsed.options.title : "";
      if (title.trim() === "") {
        throw new PimsValidationError("title", "Incident creation requires --title");
      }

      const description = typeof parsed.options.description === "string" ? parsed.options.description : "";
      const severity = typeof parsed.options.severity === "string" ? (parsed.options.severity as IncidentSeverityAPI) : "M";
      const status = typeof parsed.options.status === "string" ? (parsed.options.status as IncidentStatusAPI) : "P";
      const incidentType = typeof parsed.options["incident-type"] === "string" ? (parsed.options["incident-type"] as IncidentTypeCode) : undefined;
      const incidentDate = typeof parsed.options["incident-date"] === "string" ? parsed.options["incident-date"] : new Date().toISOString().slice(0, 10);
      const responsible = typeof parsed.options.responsible === "string" ? parsed.options.responsible : undefined;
      const impact = typeof parsed.options.impact === "string" ? parsed.options.impact : undefined;

      const endpoint = "/api/incidents/";
      const fields = {
        incident_code: code,
        title,
        description,
        severity,
        status,
        incident_type: incidentType,
        incident_date: incidentDate,
        responsible,
        impact,
      };

      if (!isConfirm) {
        handleDryRun("incidents create", endpoint, "POST", fields, null, isJson);
      }

      const input: CreateIncidentInput = {
        incident_code: code,
        title,
        description,
        severity,
        status,
        incident_type: incidentType,
        incident_date: incidentDate,
        responsible,
        impact,
      };

      const created = await client.createIncident(input);
      if (isJson) {
        console.log(JSON.stringify(created, null, 2));
      } else {
        console.log(`Incident created successfully: ${created.incident_code} (ID: ${created.id})`);
      }
      break;
    }

    case "update": {
      const idOrCode = parsed.positionals[2];
      if (!idOrCode) {
        throw new PimsValidationError("id_or_code", "incidents update requires <id_or_code>");
      }

      const code = typeof parsed.options.code === "string" ? parsed.options.code : undefined;
      if (code !== undefined) {
        assertG4WriteCode(code, "Incident");
      }

      const title = typeof parsed.options.title === "string" ? parsed.options.title : undefined;
      const description = typeof parsed.options.description === "string" ? parsed.options.description : undefined;
      const severity = typeof parsed.options.severity === "string" ? (parsed.options.severity as IncidentSeverityAPI) : undefined;
      const status = typeof parsed.options.status === "string" ? (parsed.options.status as IncidentStatusAPI) : undefined;
      const incidentType = typeof parsed.options["incident-type"] === "string" ? (parsed.options["incident-type"] as IncidentTypeCode) : undefined;
      const incidentDate = typeof parsed.options["incident-date"] === "string" ? parsed.options["incident-date"] : undefined;
      const responsible = typeof parsed.options.responsible === "string" ? parsed.options.responsible : undefined;
      const impact = typeof parsed.options.impact === "string" ? parsed.options.impact : undefined;

      const endpoint = `/api/incidents/${idOrCode}/`;
      const fields = {
        ...(code !== undefined ? { incident_code: code } : {}),
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(severity !== undefined ? { severity } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(incidentType !== undefined ? { incident_type: incidentType } : {}),
        ...(incidentDate !== undefined ? { incident_date: incidentDate } : {}),
        ...(responsible !== undefined ? { responsible } : {}),
        ...(impact !== undefined ? { impact } : {}),
      };

      if (!isConfirm) {
        handleDryRun("incidents update", endpoint, "PATCH", fields, null, isJson);
      }

      const inc = await client.resolveIncident(idOrCode);
      const updateInput: UpdateIncidentInput = {
        ...fields,
      };

      const updated = await client.updateIncident(inc.id, updateInput);
      if (isJson) {
        console.log(JSON.stringify(updated, null, 2));
      } else {
        console.log(`Incident updated successfully: ${updated.incident_code} (ID: ${updated.id})`);
      }
      break;
    }

    case "attach": {
      const idOrCode = parsed.positionals[2];
      if (!idOrCode) {
        throw new PimsValidationError("id_or_code", "incidents attach requires <id_or_code>");
      }

      const filePath = typeof parsed.options.file === "string" ? parsed.options.file : "";
      if (!filePath || !existsSync(filePath)) {
        throw new PimsValidationError("file", `Attachment file not found: ${filePath}`);
      }

      const rawFileName = parsed.options["file-name"] ?? parsed.options.filename;
      const fileName = typeof rawFileName === "string" && rawFileName.trim() !== "" ? rawFileName.trim() : basename(filePath);

      const fileBytes = readFileSync(filePath);
      const stat = statSync(filePath);

      // Validate format and size client-side via SDK
      assertIncidentAttachment(fileName, stat.size);

      const sha256 = createHash("sha256").update(fileBytes).digest("hex");
      const endpoint = `/api/incidents/${idOrCode}/attachments/`;
      const fileInfo = { name: fileName, size_bytes: stat.size, sha256 };

      if (!isConfirm) {
        handleDryRun("incidents attach", endpoint, "POST", {}, fileInfo, isJson);
      }

      const inc = await client.resolveIncident(idOrCode);
      const attachmentResult = await client.uploadIncidentAttachment(inc.id, fileBytes, fileName);

      if (isJson) {
        console.log(JSON.stringify(attachmentResult, null, 2));
      } else {
        console.log(`Attachment uploaded successfully to incident ${inc.incident_code}`);
      }
      break;
    }

    default:
      console.error(`Error: Unknown incidents subcommand "${sub}".`);
      console.error(HELP_TEXT);
      process.exit(2);
  }
}

async function handleAudits(parsed: ParsedCli): Promise<void> {
  const sub = parsed.positionals[1] ?? "";
  const client = new PimsClient();
  const isJson = parsed.globals.json;
  const isCompact = parsed.globals.compact;

  switch (sub) {
    case "list": {
      const dedupe = Boolean(parsed.options.dedupe);
      const search = typeof parsed.options.search === "string" ? parsed.options.search : undefined;
      const res = await client.listAudits({ search });

      let results = res.results;
      if (dedupe) {
        results = results.map((audit) => {
          if (audit.findings && audit.findings.length > 0) {
            const d = client.dedupeAuditFindings(audit);
            return {
              ...audit,
              findings: d.findings,
              findings_count: d.dedupedCount,
            };
          }
          return audit;
        });
      }

      if (isJson) {
        console.log(JSON.stringify({ ...res, results }, null, 2));
      } else if (isCompact) {
        const rows = results.map((a) => [
          a.audit_code,
          a.status,
          `${a.progress}%`,
          String(a.findings_count ?? a.findings?.length ?? 0),
          a.name.length > 40 ? `${a.name.slice(0, 37)}...` : a.name,
        ]);
        printTable(["CODE", "STATUS", "PROG", "FINDINGS", "NAME"], rows);
      } else {
        console.log(`Found ${res.count} audits (showing ${results.length}):`);
        for (const a of results) {
          console.log(`  [${a.audit_code}] (${a.status}) Progress:${a.progress}% Findings:${a.findings_count ?? a.findings?.length ?? 0} - ${a.name}`);
        }
      }
      break;
    }

    case "get": {
      const idOrCode = parsed.positionals[2];
      if (!idOrCode) {
        throw new PimsValidationError("id_or_code", "audits get requires <id_or_code>");
      }

      let audit = await client.resolveAudit(idOrCode);
      const dedupe = Boolean(parsed.options.dedupe);
      const overdueOnly = Boolean(parsed.options["overdue-only"]);
      const openOnly = Boolean(parsed.options["open-only"]);

      if (dedupe) {
        const d = client.dedupeAuditFindings(audit);
        audit = {
          ...audit,
          findings: d.findings,
          findings_count: d.dedupedCount,
        };
      }

      if (overdueOnly || openOnly) {
        const filteredFindings = audit.findings
          .map((f) => {
            const actions = (f.actions || []).filter((action) => {
              if (openOnly && client.isActionClosedVerified(action, f)) {
                return false;
              }
              if (overdueOnly && !action.is_overdue) {
                return false;
              }
              return true;
            });
            return { ...f, actions };
          })
          .filter((f) => f.actions.length > 0);

        audit = {
          ...audit,
          findings: filteredFindings,
          findings_count: filteredFindings.length,
        };
      }

      if (isJson) {
        console.log(JSON.stringify(audit, null, 2));
      } else if (isCompact) {
        const findings = audit.findings ?? [];
        const allActions = findings.flatMap((f) => f.actions ?? []);
        const overdue = allActions.filter((a) => a.is_overdue).length;
        const open = allActions.filter((a) => a.status !== "C").length;
        const noEvidence = findings.filter((f) => (f.evidence ?? "").trim() === "").length;
        const nextDue = allActions.filter((a) => a.status !== "C").map((a) => a.due_date).sort()[0] ?? "-";
        console.log(`${audit.audit_code} | Status:${audit.status} | Progress:${audit.progress}% | Findings:${audit.findings_count ?? findings.length} | ${audit.name}`);
        console.log(`  Actions:${allActions.length} Open:${open} Overdue:${overdue} FindingsNoEvidence:${noEvidence} NextDue:${nextDue}`);
      } else {
        console.log(`Audit ${audit.audit_code} (ID: ${audit.id}):`);
        console.log(`  Name: ${audit.name}`);
        console.log(`  Type: ${audit.audit_type}`);
        console.log(`  Status: ${audit.status}`);
        console.log(`  Progress: ${audit.progress}%`);
        console.log(`  Findings count: ${audit.findings_count ?? audit.findings?.length ?? 0}`);
        for (const f of audit.findings || []) {
          console.log(`    - [${f.classification}] ${f.description}`);
          for (const act of f.actions || []) {
            console.log(`      * Action: ${act.action_plan} (Resp: ${act.responsible}, Status: ${act.status}, Progress: ${act.progress}%, Overdue: ${act.is_overdue})`);
          }
        }
      }
      break;
    }

    default:
      console.error(`Error: Unknown audits subcommand "${sub}".`);
      console.error(HELP_TEXT);
      process.exit(2);
  }
}

async function handleRisks(parsed: ParsedCli): Promise<void> {
  const sub = parsed.positionals[1] ?? "list";
  const client = new PimsClient();
  const isJson = parsed.globals.json;
  const isCompact = parsed.globals.compact;

  switch (sub) {
    case "list": {
      const res = await client.listRiskEvaluations();
      if (isJson) {
        console.log(JSON.stringify(res, null, 2));
      } else if (isCompact) {
        const rows = res.results.map((r) => [
          r.risk_code,
          r.controlled_severity ?? "",
          r.residual_severity ?? "-",
          r.status ?? "O",
          r.description.length > 40 ? `${r.description.slice(0, 37)}...` : r.description,
        ]);
        printTable(["CODE", "CTRL_SEV", "RES_SEV", "STATUS", "DESCRIPTION"], rows);
      } else {
        console.log(`Found ${res.count} risk evaluations (showing ${res.results.length}):`);
        for (const r of res.results) {
          console.log(`  [${r.risk_code}] Controlled:${r.controlled_severity} Residual:${r.residual_severity ?? "-"} Status:${r.status ?? "O"} - ${r.description}`);
        }
      }
      break;
    }

    case "catalogs": {
      const catalogs = await client.getRiskCatalogs();
      if (isJson) {
        console.log(JSON.stringify(catalogs, null, 2));
      } else if (isCompact) {
        console.log(`Periods: ${catalogs.periods?.length ?? 0} | Threats: ${catalogs.threats?.length ?? 0} | Vulnerabilities: ${catalogs.vulnerabilities?.length ?? 0} | Control Types: ${catalogs.control_types?.length ?? 0} | Annex A Controls: ${catalogs.annex_a_controls?.length ?? 0}`);
      } else {
        console.log(`Risk Catalogs:`);
        console.log(`  Periods: ${catalogs.periods?.length ?? 0}`);
        console.log(`  Threats: ${catalogs.threats?.length ?? 0}`);
        console.log(`  Vulnerabilities: ${catalogs.vulnerabilities?.length ?? 0}`);
        console.log(`  Control Types: ${catalogs.control_types?.length ?? 0}`);
        console.log(`  Annex A Controls: ${catalogs.annex_a_controls?.length ?? 0}`);
      }
      break;
    }

    case "eligible-assets": {
      const res = await client.getEligibleAssets();
      if (isJson) {
        console.log(JSON.stringify(res, null, 2));
      } else if (isCompact) {
        const rows = res.results.map((a) => [
          a.code,
          a.appraisal_band?.label ?? "-",
          a.asset_value ?? "-",
          a.process ?? "-",
          a.name.length > 40 ? `${a.name.slice(0, 37)}...` : a.name,
        ]);
        printTable(["CODE", "BAND", "VALUE", "PROCESS", "NAME"], rows);
      } else {
        console.log(`Eligible Assets: ${res.count} total`);
        for (const a of res.results) {
          console.log(`  [${a.code}] Band:${a.appraisal_band?.label ?? "-"} Value:${a.asset_value} - ${a.name}`);
        }
      }
      break;
    }

    default:
      console.error(`Error: Unknown risks subcommand "${sub}".`);
      console.error(HELP_TEXT);
      process.exit(2);
  }
}

async function handleAssets(parsed: ParsedCli): Promise<void> {
  const sub = parsed.positionals[1] ?? "list";
  const client = new PimsClient();
  const isJson = parsed.globals.json;
  const isCompact = parsed.globals.compact;

  if (sub !== "list") {
    console.error(`Error: Unknown assets subcommand "${sub}".`);
    console.error(HELP_TEXT);
    process.exit(2);
  }

  const res = await client.listAssets();
  if (isJson) {
    console.log(JSON.stringify(res, null, 2));
  } else if (isCompact) {
    const rows = res.results.map((a) => [
      a.code,
      a.appraisal_band?.label ?? "-",
      a.asset_value ?? "-",
      a.owner ?? "-",
      a.name.length > 40 ? `${a.name.slice(0, 37)}...` : a.name,
    ]);
    printTable(["CODE", "BAND", "VALUE", "OWNER", "NAME"], rows);
  } else {
    console.log(`Found ${res.count} assets:`);
    for (const a of res.results) {
      console.log(`  [${a.code}] Band:${a.appraisal_band?.label ?? "-"} Value:${a.asset_value} Owner:${a.owner} - ${a.name}`);
    }
  }
}

async function handleDashboard(parsed: ParsedCli): Promise<void> {
  const client = new PimsClient();
  const isJson = parsed.globals.json;
  const isCompact = parsed.globals.compact;
  const tab = typeof parsed.options.tab === "string" ? parsed.options.tab : "summary";

  const res = await client.getDashboardKpis(tab);
  if (isJson) {
    console.log(JSON.stringify(res, null, 2));
  } else if (isCompact) {
    const rows = res.kpis.map((k) => [
      k.key,
      k.status,
      k.value !== null ? `${k.value}${k.unit}` : "-",
      k.target !== null ? `${k.target}${k.unit}` : "-",
      k.label.length > 40 ? `${k.label.slice(0, 37)}...` : k.label,
    ]);
    printTable(["KEY", "STATUS", "VALUE", "TARGET", "LABEL"], rows);
  } else {
    console.log(`Dashboard KPIs (tab: ${res.tab}):`);
    for (const k of res.kpis) {
      console.log(`  ${k.label} [${k.key}]: ${k.value ?? "N/A"}${k.unit} (Target: ${k.target ?? "N/A"}${k.unit}, Status: ${k.status})`);
    }
  }
}

async function handleAnnexA(parsed: ParsedCli): Promise<void> {
  const sub = parsed.positionals[1] ?? "meta";
  const client = new PimsClient();
  const isJson = parsed.globals.json;
  const isCompact = parsed.globals.compact;

  if (sub !== "meta") {
    console.error(`Error: Unknown annex-a subcommand "${sub}".`);
    console.error(HELP_TEXT);
    process.exit(2);
  }

  const res = await client.getAnnexAControlsMeta();
  if (isJson) {
    console.log(JSON.stringify(res, null, 2));
  } else if (isCompact) {
    const groupSummary = res.groups.map((g) => `${g.code}(${g.count})`).join(", ");
    console.log(`Standard: ${res.standard.label} | Total: ${res.standard.total_controls} | Law 29733: ${res.has_law_29733 ? "Yes" : "No"} | Groups: ${groupSummary}`);
  } else {
    console.log(`Annex A Controls Metadata:`);
    console.log(`  Standard: ${res.standard.label} (${res.standard.code})`);
    console.log(`  Total controls: ${res.standard.total_controls}`);
    console.log(`  Has Law 29733 controls: ${res.has_law_29733 ? "Yes" : "No"}`);
    console.log(`  Groups:`);
    for (const g of res.groups) {
      console.log(`    - ${g.code}: ${g.name} (${g.count} controls)`);
    }
  }
}

async function handleMirror(parsed: ParsedCli): Promise<void> {
  const sub = parsed.positionals[1] ?? "";
  const repoRoot = resolve(__dirname, "..");

  if (sub === "sync") {
    const syncArgs = ["scripts/sync-pims-truth.ts"];
    if (parsed.options.loop) syncArgs.push("--loop");
    if (parsed.options.interval) syncArgs.push("--interval", String(parsed.options.interval));
    if (parsed.options.force) syncArgs.push("--force");
    if (parsed.options.code) syncArgs.push("--code", String(parsed.options.code));
    if (parsed.globals.confirm) syncArgs.push("--confirm");
    const proc = Bun.spawnSync(["bun", ...syncArgs], {
      cwd: repoRoot,
      env: process.env,
      stdio: ["inherit", "inherit", "inherit"],
    });
    process.exit(proc.exitCode ?? 0);
  } else if (sub === "read") {
    const codeOrId = parsed.positionals[2];
    if (!codeOrId) {
      throw new PimsValidationError("code_or_id", "mirror read requires <code_or_id>");
    }

    const readArgs = ["scripts/rag-query.ts", "--full", "--doc", codeOrId];
    const targetVer = parsed.options.ver ?? parsed.options.version;
    if (typeof targetVer === "string") {
      readArgs.push("--version", targetVer);
    }
    if (parsed.globals.json) {
      readArgs.push("--json");
    }

    const proc = Bun.spawnSync(["bun", ...readArgs], {
      cwd: repoRoot,
      env: process.env,
      stdio: ["inherit", "inherit", "inherit"],
    });
    process.exit(proc.exitCode ?? 0);
  } else {
    console.error(`Error: Unknown mirror subcommand "${sub}".`);
    console.error(HELP_TEXT);
    process.exit(2);
  }
}

async function handleDiff(parsed: ParsedCli): Promise<void> {
  const codeOrId = parsed.positionals[1];
  const fromVer = typeof parsed.options.from === "string" ? parsed.options.from : undefined;
  const toVer = typeof parsed.options.to === "string" ? parsed.options.to : undefined;

  if (!codeOrId || !fromVer || !toVer) {
    throw new PimsValidationError("diff", "diff requires <code_or_id> --from <v1> --to <v2>");
  }

  const client = new PimsClient();
  const fetcher: PimsDocumentFetcher = async (pimsDocId: string, version: string) => {
    const doc = await client.resolveDocument(pimsDocId);
    const versions = await client.getDocumentVersions(doc.id);
    const match = versions.find((v) => matchDocumentVersion(v.version, version));

    let fileUrl = doc.file;
    let filename = `${doc.code}_v${version}.pdf`;
    if (match && match.file) {
      fileUrl = match.file;
      const parts = match.file.split("/");
      filename = parts[parts.length - 1] || filename;
    }

    const content = await client.downloadDocumentPdf(fileUrl);
    return {
      pims_doc_id: String(doc.id),
      code: doc.code,
      pims_version: version,
      status: doc.status,
      filename,
      content,
      supersedes: null,
    };
  };

  const diffResult = await compareVersions(codeOrId, fromVer, toVer, { fetcher });

  if (parsed.globals.json) {
    console.log(JSON.stringify(diffResult, null, 2));
  } else {
    console.log(`Document Diff: ${diffResult.pims_doc_id} (v${diffResult.version_a} -> v${diffResult.version_b})`);
    console.log(`Diff Stats:`);
    console.log(`  Chunks: +${diffResult.stats.chunks_added} added, -${diffResult.stats.chunks_removed} removed, ~${diffResult.stats.chunks_modified} modified, =${diffResult.stats.chunks_unchanged} unchanged`);
    console.log(`  Lines:  +${diffResult.stats.lines_added} added, -${diffResult.stats.lines_removed} removed`);
    if (diffResult.line_diffs && diffResult.line_diffs.length > 0) {
      const showFull = parsed.options.full === true || parsed.options.full === "true";
      const shown = showFull ? diffResult.line_diffs : diffResult.line_diffs.slice(0, 40);
      console.log(showFull ? `\nLine Changes (${shown.length} total):` : `\nLine Changes (showing up to 40 changes):`);
      for (const d of shown) {
        const prefix = d.type === "added" ? "+" : d.type === "removed" ? "-" : " ";
        console.log(`${prefix} ${d.text}`);
      }
      if (!showFull && diffResult.line_diffs.length > 40) {
        console.log(`... and ${diffResult.line_diffs.length - 40} more line differences (re-run with --full)`);
      }
    }
  }
}

async function handlePublish(parsed: ParsedCli): Promise<void> {
  const slug = typeof parsed.options.slug === "string" ? parsed.options.slug.trim() : "";
  const filePath = typeof parsed.options.file === "string" ? parsed.options.file.trim() : "";
  const rawFileName = parsed.options.filename ?? parsed.options["file-name"];
  const filename = typeof rawFileName === "string" && rawFileName.trim() !== "" ? rawFileName.trim() : undefined;

  if (slug === "" || filePath === "") {
    throw new PimsValidationError("publish", "publish requires --slug <slug> and --file <path>");
  }

  if (!existsSync(filePath)) {
    throw new PimsValidationError("file", `File to publish not found: ${filePath}`);
  }

  const fileBytes = readFileSync(filePath);
  const content_base64 = fileBytes.toString("base64");
  const effectiveFileName = filename ?? basename(filePath);

  const sidecarBase = (process.env.FILES_SIDECAR_URL || "http://pimsai-files-sidecar:3000").replace(/\/+$/, "");
  const publishUrl = `${sidecarBase}/api/publish`;

  const response = await fetch(publishUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slug,
      filename: effectiveFileName,
      content_base64,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new PimsReadFailureError("/api/publish", response.status, `Publish failed: ${errText}`);
  }

  const result = (await response.json()) as { url: string; [key: string]: unknown };
  if (parsed.globals.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(result.url);
  }
}

async function handleMail(parsed: ParsedCli): Promise<void> {
  const sub = parsed.positionals[1] ?? "";
  const mail = new MailConnectorClient();
  const isJson = parsed.globals.json;
  const out = (v: unknown) => console.log(isJson ? JSON.stringify(v, null, 2) : typeof v === "string" ? v : JSON.stringify(v));

  const opt = (k: string): string | undefined => {
    const v = parsed.options[k];
    return typeof v === "string" && v.trim() !== "" ? v : undefined;
  };
  const req = (k: string): string => {
    const v = opt(k);
    if (v === undefined) throw new PimsValidationError(k, `mail ${sub} requires --${k} <value>`);
    return v;
  };

  switch (sub) {
    case "draft": {
      const severity = req("severity");
      if (severity !== "red" && severity !== "amber" && severity !== "green") {
        throw new PimsValidationError("severity", "mail draft requires --severity red|amber|green");
      }
      const draft = await mail.createDraftSummons({
        findingId: req("finding"),
        nonConformityTitle: req("title"),
        severity,
        recipientName: req("to-name"),
        recipientEmail: req("to"),
        deadlineDate: req("deadline"),
        evidenceCitation: req("evidence"),
        correctiveActionSummary: req("actions"),
      });
      if (isJson) out(draft);
      else {
        console.log(`draftId: ${draft.draftId} [${draft.status}]`);
        console.log(`To: ${draft.recipientName} <${draft.recipientEmail}>`);
        console.log(`Subject: ${draft.subject}`);
        console.log(`Compuerta de Despacho Activa: Escribe 'envíalo' para autorizar el envío (mail dispatch --id ${draft.draftId} --phrase envíalo --confirm).`);
      }
      break;
    }
    case "get": {
      out(await mail.getDraft(req("id")));
      break;
    }
    case "list": {
      const drafts = await mail.listDrafts();
      if (isJson) out(drafts);
      else for (const d of drafts) console.log(`${d.draftId} [${d.status}] ${d.findingId} → ${d.recipientEmail}`);
      break;
    }
    case "update-recipient": {
      out(await mail.updateDraftRecipient(req("id"), req("to"), opt("to-name")));
      break;
    }
    case "dispatch": {
      if (opt("phrase") !== "envíalo") {
        throw new PimsValidationError("phrase", `mail dispatch requires --phrase envíalo (literal approval word)`);
      }
      if (!parsed.globals.confirm) {
        throw new PimsValidationError("confirm", "mail dispatch requires --confirm (real SMTP send)");
      }
      out(await mail.dispatchSummons(req("id"), "envíalo"));
      break;
    }
    default:
      throw new PimsValidationError("mail", "mail requires <draft|get|list|update-recipient|dispatch> (see --help)");
  }
}


function isExecutable(filePath: string): boolean {
  try {
    accessSync(filePath, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function resolvePdftotextPath(): string | null {
  if (process.env.PDFTOTEXT_BIN && isExecutable(process.env.PDFTOTEXT_BIN)) {
    return process.env.PDFTOTEXT_BIN;
  }

  const pathDirs = (process.env.PATH || "").split(":");
  for (const dir of pathDirs) {
    if (!dir) continue;
    const candidate = join(dir, "pdftotext");
    if (isExecutable(candidate)) {
      return candidate;
    }
  }

  if (existsSync("/nix/store")) {
    try {
      const entries = readdirSync("/nix/store", { withFileTypes: true });
      const candidates: { path: string; mtimeMs: number; ctimeMs: number }[] = [];
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.includes("-poppler-utils-")) {
          const binPath = join("/nix/store", entry.name, "bin", "pdftotext");
          if (isExecutable(binPath)) {
            try {
              const st = statSync(binPath);
              candidates.push({ path: binPath, mtimeMs: st.mtimeMs, ctimeMs: st.ctimeMs });
            } catch {
              // ignore
            }
          }
        }
      }
      if (candidates.length > 0) {
        candidates.sort(
          (a, b) => b.mtimeMs - a.mtimeMs || b.ctimeMs - a.ctimeMs || b.path.localeCompare(a.path),
        );
        return candidates[0].path;
      }
    } catch {
      // ignore
    }
  }

  return null;
}

function ensurePdftotext(): void {
  const resolved = resolvePdftotextPath();
  if (resolved) {
    process.env.PDFTOTEXT_BIN = resolved;
    const binDir = dirname(resolved);
    const currentPath = process.env.PATH || "";
    if (!currentPath.split(":").includes(binDir)) {
      process.env.PATH = `${binDir}:${currentPath}`;
    }

    const origSpawnSync = Bun.spawnSync.bind(Bun);
    (Bun as unknown as { spawnSync: typeof Bun.spawnSync }).spawnSync = function (cmd: any, options?: any) {
      let resolvedCmd = cmd;
      if (Array.isArray(cmd) && cmd[0] === "pdftotext" && process.env.PDFTOTEXT_BIN) {
        resolvedCmd = [process.env.PDFTOTEXT_BIN, ...cmd.slice(1)];
      }
      return origSpawnSync(resolvedCmd, {
        ...options,
        env: options?.env ?? process.env,
      });
    };
  } else {
    console.error("Hint: pdftotext was not found in PATH or /nix/store. Please install poppler-utils or set PDFTOTEXT_BIN.");
  }
}

async function main(): Promise<void> {
  const parsed = parseArgs(Bun.argv.slice(2));

  if (parsed.globals.help || parsed.positionals.length === 0) {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  const command = parsed.positionals[0];

  if (command === "mirror" || command === "diff") {
    ensurePdftotext();
  }

  switch (command) {
    case "docs":
      await handleDocs(parsed);
      break;
    case "incidents":
      await handleIncidents(parsed);
      break;
    case "audits":
      await handleAudits(parsed);
      break;
    case "risks":
      await handleRisks(parsed);
      break;
    case "assets":
      await handleAssets(parsed);
      break;
    case "dashboard":
      await handleDashboard(parsed);
      break;
    case "annex-a":
      await handleAnnexA(parsed);
      break;
    case "mirror":
      await handleMirror(parsed);
      break;
    case "diff":
      await handleDiff(parsed);
      break;
    case "publish":
      await handlePublish(parsed);
      break;
    case "mail":
      await handleMail(parsed);
      break;
    default:
      console.error(`Error: Unknown command "${command}".`);
      console.error(HELP_TEXT);
      process.exit(2);
  }
}

main().catch((err: unknown) => {
  const isJson = Bun.argv.includes("--json");
  const fallbackHint = "Use pgvector mirror via bun scripts/rag-query.ts and prefix answer with [FUENTE: Cache local pgvector mirror (PIMS no disponible)]";

  if (isJson) {
    const errName = err instanceof Error ? err.name : "Error";
    const endpoint = err && typeof err === "object" && "endpoint" in err ? (err as { endpoint: unknown }).endpoint : null;
    const status = err && typeof err === "object" && "status" in err ? (err as { status: unknown }).status : (errName === "PimsNotFoundError" ? 404 : (errName === "PimsValidationError" || errName === "TenantGuardViolationError" ? 400 : 500));
    const message = err instanceof Error ? err.message : String(err);

    const errorPayload = {
      ok: false,
      error: errName,
      endpoint,
      status,
      message,
      fallback_hint: fallbackHint,
    };
    console.error(JSON.stringify(errorPayload, null, 2));
  } else {
    console.error(err instanceof Error ? err.message : String(err));
  }
  process.exit(1);
});
