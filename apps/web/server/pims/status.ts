import { SQL } from "bun";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { PIMS_STATUS_CACHE_TTL_MS } from "../../shared/constants.ts";
import type {
  MirrorCitationExcerpt,
  MirrorDocSummary,
  MirrorDocVersionSummary,
  PimsSystemStatus,
} from "../../shared/protocol.ts";

export interface PimsStatusServiceOptions {
  corpusMirrorDir: string;
  databaseUrl: string | null;
  pimsBaseUrl: string | null;
  agentModel: string | null;
  softRequestBudget: number;
}

export class MirrorResourceError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = "MirrorResourceError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

const SAFE_DOC_CODE_REGEX = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const SAFE_VERSION_REGEX = /^v?\d+(?:\.\d+)?$/i;
const LINES_SPEC_REGEX = /^(?:lines?:)?L?(\d+)(?:\s*-\s*L?(\d+))?$/i;
const PIMS_CHECK_TIMEOUT_MS = 4_000;
const DB_CHECK_TIMEOUT_MS = 3_000;
const MAX_EXCERPT_LINES = 400;

function assertSafeDocCode(docCode: string): string {
  const trimmed = docCode.trim();
  if (
    trimmed.length === 0 ||
    trimmed === "." ||
    trimmed === ".." ||
    !SAFE_DOC_CODE_REGEX.test(trimmed) ||
    trimmed.includes("..")
  ) {
    throw new MirrorResourceError(400, "INVALID_DOC_CODE", `Invalid document code '${docCode}'`);
  }
  return trimmed;
}

function resolveInsideRoot(rootDir: string, ...segments: string[]): string {
  const resolvedRoot = path.resolve(rootDir);
  const resolvedTarget = path.resolve(resolvedRoot, ...segments);
  if (resolvedTarget !== resolvedRoot && !resolvedTarget.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new MirrorResourceError(400, "PATH_TRAVERSAL", "Resolved path escapes corpus mirror root");
  }
  return resolvedTarget;
}

function normalizeVersionCandidates(rawVersion: string): string[] {
  const cleaned = rawVersion.trim().replace(/^v/i, "");
  if (!SAFE_VERSION_REGEX.test(cleaned)) {
    throw new MirrorResourceError(
      400,
      "INVALID_VERSION",
      `Invalid document version '${rawVersion}'`,
    );
  }
  const num = Number(cleaned);
  if (!Number.isFinite(num) || num < 0) {
    throw new MirrorResourceError(
      400,
      "INVALID_VERSION",
      `Invalid document version '${rawVersion}'`,
    );
  }

  const candidates = new Set<string>();
  candidates.add(cleaned);
  candidates.add(num.toFixed(2));
  candidates.add(num.toFixed(1));
  if (Number.isInteger(num)) {
    candidates.add(String(num));
  } else if (Math.abs(num - Math.round(num)) < 1e-9) {
    candidates.add(String(Math.round(num)));
  }
  return [...candidates];
}

function parseVersionNumber(ver: string): number {
  const cleaned = ver.trim().replace(/^v/i, "");
  const num = Number.parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function parseLinesSpec(linesSpec: string): { startLine: number; endLine: number } {
  const trimmed = linesSpec.trim();
  const match = LINES_SPEC_REGEX.exec(trimmed);
  if (match === null) {
    throw new MirrorResourceError(
      400,
      "INVALID_LINES_SPEC",
      `Invalid lines spec '${linesSpec}': expected L114-L133, 114-133, or lines:114-133`,
    );
  }
  const startLine = Number.parseInt(match[1], 10);
  const endLine = match[2] !== undefined ? Number.parseInt(match[2], 10) : startLine;
  if (!Number.isInteger(startLine) || startLine < 1 || !Number.isInteger(endLine) || endLine < startLine) {
    throw new MirrorResourceError(
      400,
      "INVALID_LINES_RANGE",
      `Invalid line range '${linesSpec}': start must be >= 1 and end >= start`,
    );
  }
  if (endLine - startLine + 1 > MAX_EXCERPT_LINES) {
    throw new MirrorResourceError(
      400,
      "EXCERPT_TOO_LARGE",
      `Requested line range (${endLine - startLine + 1} lines) exceeds limit of ${MAX_EXCERPT_LINES} lines`,
    );
  }
  return { startLine, endLine };
}

function readManifestJson(docDir: string): Record<string, unknown> | null {
  const manifestPath = path.join(docDir, "manifest.json");
  if (!existsSync(manifestPath)) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

function buildDocSummary(docCode: string, docDir: string): MirrorDocSummary | null {
  let entries: string[];
  try {
    entries = readdirSync(docDir);
  } catch {
    return null;
  }

  const manifest = readManifestJson(docDir);
  const versionMap = new Map<string, MirrorDocVersionSummary>();

  if (manifest !== null && Array.isArray(manifest.versions)) {
    for (const item of manifest.versions) {
      if (typeof item !== "object" || item === null || Array.isArray(item)) {
        continue;
      }
      const rec = item as Record<string, unknown>;
      const rawVer =
        typeof rec.pims_version === "string"
          ? rec.pims_version
          : typeof rec.version === "string"
            ? rec.version
            : null;
      if (rawVer === null) {
        continue;
      }
      const ver = rawVer.replace(/^v/i, "");
      const candidates = normalizeVersionCandidates(ver);
      const hasPdf = candidates.some((c) => entries.includes(`v${c}.pdf`));
      const hasText = candidates.some((c) => entries.includes(`v${c}.txt`));

      let sizeBytes: number | undefined;
      if (Array.isArray(rec.files) && rec.files.length > 0) {
        const firstFile = rec.files[0] as Record<string, unknown>;
        if (typeof firstFile?.size_bytes === "number") {
          sizeBytes = firstFile.size_bytes;
        }
      }

      versionMap.set(ver, {
        version: ver,
        hasPdf,
        hasText,
        ...(typeof rec.date === "string" ? { date: rec.date } : {}),
        ...(typeof rec.sha256 === "string" ? { sha256: rec.sha256 } : {}),
        ...(sizeBytes !== undefined ? { sizeBytes } : {}),
      });
    }
  }

  for (const fileName of entries) {
    const match = /^v(\d+(?:\.\d+)?)\.(pdf|txt)$/i.exec(fileName);
    if (match === null) {
      continue;
    }
    const ver = match[1];
    const ext = match[2].toLowerCase();
    // Avoid creating duplicate entries if manifest already tracks same numeric version (e.g., 3.0 vs 3)
    const existingKey = [...versionMap.keys()].find(
      (k) => Math.abs(parseVersionNumber(k) - parseVersionNumber(ver)) < 1e-9,
    );
    const key = existingKey ?? ver;
    const prev = versionMap.get(key) ?? {
      version: key,
      hasPdf: false,
      hasText: false,
    };
    if (ext === "pdf") {
      prev.hasPdf = true;
    } else if (ext === "txt") {
      prev.hasText = true;
    }
    versionMap.set(key, prev);
  }

  if (versionMap.size === 0 && manifest === null) {
    return null;
  }

  const versions = [...versionMap.values()].sort(
    (a, b) => parseVersionNumber(a.version) - parseVersionNumber(b.version),
  );

  const title =
    manifest !== null && typeof manifest.title === "string" && manifest.title.trim().length > 0
      ? manifest.title.trim()
      : docCode;
  const latestVersion =
    manifest !== null && typeof manifest.latest_version === "string"
      ? manifest.latest_version.replace(/^v/i, "")
      : versions[versions.length - 1]?.version ?? null;
  const updatedAt =
    manifest !== null && typeof manifest.updated_at === "string"
      ? manifest.updated_at
      : null;

  return {
    code: docCode,
    title,
    latestVersion,
    updatedAt,
    versions,
  };
}

export class PimsStatusService {
  private readonly corpusMirrorDir: string;
  private readonly databaseUrl: string | null;
  private readonly pimsBaseUrl: string | null;
  private readonly agentModel: string | null;
  private readonly softRequestBudget: number;
  private cachedStatus: PimsSystemStatus | null = null;
  private inflightCheck: Promise<PimsSystemStatus> | null = null;

  constructor(options: PimsStatusServiceOptions) {
    this.corpusMirrorDir = path.resolve(options.corpusMirrorDir);
    this.databaseUrl = options.databaseUrl;
    this.pimsBaseUrl = options.pimsBaseUrl;
    this.agentModel = options.agentModel;
    this.softRequestBudget = options.softRequestBudget;
  }

  async getStatus(forceRefresh: boolean = false): Promise<PimsSystemStatus> {
    const now = Date.now();
    if (
      !forceRefresh &&
      this.cachedStatus !== null &&
      now - this.cachedStatus.checkedAt < PIMS_STATUS_CACHE_TTL_MS
    ) {
      return this.cachedStatus;
    }

    if (this.inflightCheck !== null) {
      return this.inflightCheck;
    }

    this.inflightCheck = this.computeStatus()
      .then((status) => {
        this.cachedStatus = status;
        return status;
      })
      .finally(() => {
        this.inflightCheck = null;
      });

    return this.inflightCheck;
  }

  listMirrorDocs(): MirrorDocSummary[] {
    if (!existsSync(this.corpusMirrorDir)) {
      return [];
    }

    const dirEntries = readdirSync(this.corpusMirrorDir, { withFileTypes: true });
    const docs: MirrorDocSummary[] = [];

    for (const entry of dirEntries) {
      if (!entry.isDirectory()) {
        continue;
      }
      if (!SAFE_DOC_CODE_REGEX.test(entry.name)) {
        continue;
      }
      const docDir = resolveInsideRoot(this.corpusMirrorDir, entry.name);
      const summary = buildDocSummary(entry.name, docDir);
      if (summary !== null) {
        docs.push(summary);
      }
    }

    return docs.sort((a, b) => a.code.localeCompare(b.code));
  }

  getCitationExcerpt(
    rawDocCode: string,
    rawVersion: string | null | undefined,
    linesSpec: string,
  ): MirrorCitationExcerpt {
    const docCode = assertSafeDocCode(rawDocCode);
    const docDir = resolveInsideRoot(this.corpusMirrorDir, docCode);
    if (!existsSync(docDir)) {
      throw new MirrorResourceError(
        404,
        "DOC_NOT_FOUND",
        `Document '${docCode}' not found in corpus mirror`,
      );
    }

    const summary = buildDocSummary(docCode, docDir);
    const targetVersionRaw =
      rawVersion !== null && rawVersion !== undefined && rawVersion.trim().length > 0
        ? rawVersion.trim()
        : summary?.latestVersion ?? null;

    if (targetVersionRaw === null) {
      throw new MirrorResourceError(
        404,
        "VERSION_NOT_FOUND",
        `No versions found for document '${docCode}'`,
      );
    }

    const { startLine, endLine } = parseLinesSpec(linesSpec);
    const candidates = normalizeVersionCandidates(targetVersionRaw);

    let resolvedTxtPath: string | null = null;
    let resolvedVersion = targetVersionRaw.replace(/^v/i, "");

    for (const candidate of candidates) {
      const candidatePath = resolveInsideRoot(docDir, `v${candidate}.txt`);
      if (existsSync(candidatePath) && statSync(candidatePath).isFile()) {
        resolvedTxtPath = candidatePath;
        resolvedVersion = candidate;
        break;
      }
    }

    if (resolvedTxtPath === null) {
      throw new MirrorResourceError(
        404,
        "TEXT_EXCERPT_NOT_FOUND",
        `Extracted text v${resolvedVersion}.txt not found in corpus mirror for '${docCode}'`,
      );
    }

    const rawText = readFileSync(resolvedTxtPath, "utf8");
    const allLines = rawText.replace(/\r\n?/g, "\n").split("\n");
    const totalLines = allLines.length;

    if (startLine > totalLines) {
      throw new MirrorResourceError(
        404,
        "LINE_OUT_OF_RANGE",
        `Requested start line ${startLine} exceeds total lines (${totalLines}) in ${docCode} v${resolvedVersion}`,
      );
    }

    const clampedEnd = Math.min(endLine, totalLines);
    const slice: Array<{ lineNumber: number; text: string }> = [];
    for (let lineNum = startLine; lineNum <= clampedEnd; lineNum++) {
      slice.push({
        lineNumber: lineNum,
        text: allLines[lineNum - 1] ?? "",
      });
    }

    const pdfAvailable = candidates.some((c) => {
      const p = resolveInsideRoot(docDir, `v${c}.pdf`);
      return existsSync(p) && statSync(p).isFile();
    });

    return {
      docCode,
      version: resolvedVersion,
      title: summary?.title ?? docCode,
      startLine,
      endLine: clampedEnd,
      totalLines,
      lines: slice,
      text: slice.map((item) => item.text).join("\n"),
      pdfAvailable,
    };
  }

  getMirrorPdfPath(
    rawDocCode: string,
    rawVersion?: string | null,
  ): { filePath: string; fileName: string; version: string } {
    const docCode = assertSafeDocCode(rawDocCode);
    const docDir = resolveInsideRoot(this.corpusMirrorDir, docCode);
    if (!existsSync(docDir)) {
      throw new MirrorResourceError(
        404,
        "DOC_NOT_FOUND",
        `Document '${docCode}' not found in corpus mirror`,
      );
    }

    const summary = buildDocSummary(docCode, docDir);
    const targetVersionRaw =
      rawVersion !== null && rawVersion !== undefined && rawVersion.trim().length > 0
        ? rawVersion.trim()
        : summary?.latestVersion ?? null;

    if (targetVersionRaw === null) {
      throw new MirrorResourceError(
        404,
        "VERSION_NOT_FOUND",
        `No versions found for document '${docCode}'`,
      );
    }

    const candidates = normalizeVersionCandidates(targetVersionRaw);
    for (const candidate of candidates) {
      const fileName = `v${candidate}.pdf`;
      const candidatePath = resolveInsideRoot(docDir, fileName);
      if (existsSync(candidatePath) && statSync(candidatePath).isFile()) {
        return {
          filePath: candidatePath,
          fileName: `${docCode}-${fileName}`,
          version: candidate,
        };
      }
    }

    throw new MirrorResourceError(
      404,
      "PDF_NOT_FOUND",
      `PDF v${targetVersionRaw.replace(/^v/i, "")}.pdf not found in corpus mirror for '${docCode}'`,
    );
  }

  private async computeStatus(): Promise<PimsSystemStatus> {
    const [dbOk, pimsReachable] = await Promise.all([
      this.checkDatabase(),
      this.checkPimsReachable(),
    ]);
    const mirrorDocCount = this.listMirrorDocs().length;
    return {
      dbOk,
      pimsReachable,
      mirrorDocCount,
      agentModel: this.agentModel,
      softRequestBudget: this.softRequestBudget,
      checkedAt: Date.now(),
    };
  }

  private async checkDatabase(): Promise<boolean> {
    if (this.databaseUrl === null) {
      return false;
    }
    let sql: SQL | null = null;
    try {
      sql = new SQL(this.databaseUrl);
      const queryPromise = sql`SELECT 1 AS ok`;
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("DB health check timeout")), DB_CHECK_TIMEOUT_MS);
      });
      await Promise.race([queryPromise, timeoutPromise]);
      return true;
    } catch {
      return false;
    } finally {
      if (sql !== null) {
        try {
          await sql.close({ timeout: 1 });
        } catch {
          // Connection already failed or closed; nothing to recover.
        }
      }
    }
  }

  private async checkPimsReachable(): Promise<boolean> {
    if (this.pimsBaseUrl === null) {
      return false;
    }
    try {
      const headRes = await fetch(this.pimsBaseUrl, {
        method: "HEAD",
        redirect: "manual",
        signal: AbortSignal.timeout(PIMS_CHECK_TIMEOUT_MS),
      });
      if (headRes.status === 405) {
        const getRes = await fetch(this.pimsBaseUrl, {
          method: "GET",
          redirect: "manual",
          signal: AbortSignal.timeout(PIMS_CHECK_TIMEOUT_MS),
        });
        return getRes.status < 500;
      }
      return headRes.status < 500;
    } catch {
      return false;
    }
  }
}
