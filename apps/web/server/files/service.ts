import { createHash, randomBytes } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  DEFAULT_PUBLISH_TTL_SECONDS,
  EXTENDED_PUBLISH_MIME_MAP,
  MAX_UPLOAD_BYTES,
  MIME_TYPE_MAP,
  SUPPORTED_UPLOAD_EXTENSIONS,
  type SupportedUploadExtension,
} from "../../shared/constants.ts";

const PUBLISHED_DIR_NAME = "_published";
const UPLOADS_META_DIR_NAME = "_uploads_meta";
const UPLOAD_META_SUFFIX = ".upload.json";
const PUBLISH_META_SUFFIX = ".meta.json";
const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

export class FilesServiceError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export interface ParseResult {
  format: SupportedUploadExtension;
  extractedTextPreview: string;
  metadata: Record<string, unknown>;
  parsedAt: number;
}

export interface UploadedFileRecord {
  id: string;
  fileName: string;
  extension: SupportedUploadExtension;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  preservedPath: string;
  uploadedAt: string;
  previewSummary: string;
  url: string;
  downloadUrl: string;
}

export interface PublishedFileMetadata {
  slug: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  createdAt: number;
  expiresAt: number;
}

export interface PublishedFileSummary {
  slug: string;
  filename: string;
  url: string;
  download_url: string;
  relative_url: string;
  relative_download_url: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
  expires_at: string;
}

export interface PublishDeliverableResult extends PublishedFileSummary {
  status: "published";
}

export interface SaveUploadInput {
  fileName: string;
  mimeType?: string;
  buffer: Buffer;
}

export interface PublishDeliverableInput {
  slug?: string;
  filename?: string;
  content?: string;
  content_base64?: string;
  file_path?: string;
  content_type?: string;
  ttl_seconds?: number;
}

export interface FilesServiceOptions {
  uploadsDir: string;
  publicBaseUrl: string;
  onPublished?: (item: PublishedFileSummary) => void;
}

function writeFileAtomicSync(targetPath: string, data: string | Buffer): void {
  const tempPath = `${targetPath}.tmp.${process.pid}.${randomBytes(4).toString("hex")}`;
  fs.writeFileSync(tempPath, data);
  fs.renameSync(tempPath, targetPath);
}

function sanitizeSlug(rawSlug: string): string {
  const safeSlug = rawSlug.trim().replace(/[^a-zA-Z0-9._-]/g, "-");
  if (!safeSlug || safeSlug === "." || safeSlug === ".." || safeSlug.includes("..")) {
    throw new FilesServiceError(
      `Slug inválido: "${rawSlug}"`,
      400,
      "INVALID_SLUG",
    );
  }
  return safeSlug;
}

/**
 * Parses and validates file content using magic-byte checks per extension.
 * Fails fast with FilesServiceError on invalid content.
 */
export function parseUploadedFile(
  extension: SupportedUploadExtension,
  buffer: Buffer,
  originalName: string,
): ParseResult {
  const now = Date.now();

  switch (extension) {
    case "txt": {
      const textContent = buffer.toString("utf-8");
      const lines = textContent.split(/\r?\n/);
      return {
        format: "txt",
        extractedTextPreview: textContent.slice(0, 500),
        metadata: {
          lineCount: lines.length,
          characterCount: textContent.length,
          encoding: "utf-8",
        },
        parsedAt: now,
      };
    }

    case "pdf": {
      const header = buffer.subarray(0, 8).toString("ascii");
      if (!header.startsWith("%PDF-")) {
        throw new FilesServiceError(
          `Archivo '${originalName}' inválido: cabecera PDF faltante o corrupta (esperado '%PDF-')`,
          422,
          "INVALID_MAGIC_BYTES",
        );
      }
      const pdfVersion = header.trim();
      const contentStr = buffer.toString("latin1");
      const pageMatches = contentStr.match(/\/Type\s*\/Page\b/g);
      const estimatedPages = pageMatches ? pageMatches.length : 1;

      return {
        format: "pdf",
        extractedTextPreview: `[PDF Document ${pdfVersion}, ~${estimatedPages} páginas]`,
        metadata: {
          pdfVersion,
          estimatedPages,
          byteLength: buffer.length,
        },
        parsedAt: now,
      };
    }

    case "png": {
      const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      if (buffer.length < 24 || !buffer.subarray(0, 8).equals(pngMagic)) {
        throw new FilesServiceError(
          `Archivo '${originalName}' inválido: no es una imagen PNG válida (cabecera corrupta)`,
          422,
          "INVALID_MAGIC_BYTES",
        );
      }
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);

      return {
        format: "png",
        extractedTextPreview: `[Imagen PNG ${width}x${height} px]`,
        metadata: {
          width,
          height,
          colorType: buffer[25],
          byteLength: buffer.length,
        },
        parsedAt: now,
      };
    }

    case "docx": {
      const zipMagic = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
      if (buffer.length < 30 || !buffer.subarray(0, 4).equals(zipMagic)) {
        throw new FilesServiceError(
          `Archivo '${originalName}' inválido: no es un contenedor OOXML DOCX válido (ZIP corrupto)`,
          422,
          "INVALID_MAGIC_BYTES",
        );
      }
      const zipContent = buffer.toString("latin1");
      if (!zipContent.includes("word/document.xml")) {
        throw new FilesServiceError(
          `Archivo '${originalName}' no es un documento de Word (DOCX) válido: falta word/document.xml`,
          422,
          "INVALID_MAGIC_BYTES",
        );
      }

      return {
        format: "docx",
        extractedTextPreview: "[Documento Word DOCX estructurado]",
        metadata: {
          container: "OOXML/ZIP",
          hasMainDocument: true,
          byteLength: buffer.length,
        },
        parsedAt: now,
      };
    }

    case "xlsx": {
      const zipMagic = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
      if (buffer.length < 30 || !buffer.subarray(0, 4).equals(zipMagic)) {
        throw new FilesServiceError(
          `Archivo '${originalName}' inválido: no es un libro de Excel XLSX válido (ZIP corrupto)`,
          422,
          "INVALID_MAGIC_BYTES",
        );
      }
      const zipContent = buffer.toString("latin1");
      if (!zipContent.includes("xl/workbook.xml") && !zipContent.includes("[Content_Types].xml")) {
        throw new FilesServiceError(
          `Archivo '${originalName}' no es una hoja de cálculo XLSX válida: falta xl/workbook.xml`,
          422,
          "INVALID_MAGIC_BYTES",
        );
      }

      return {
        format: "xlsx",
        extractedTextPreview: "[Libro de Excel XLSX estructurado]",
        metadata: {
          container: "OOXML/ZIP",
          hasWorkbook: true,
          byteLength: buffer.length,
        },
        parsedAt: now,
      };
    }

    case "doc": {
      const oleMagic = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
      if (buffer.length < 512 || !buffer.subarray(0, 8).equals(oleMagic)) {
        throw new FilesServiceError(
          `Archivo '${originalName}' inválido: no es un documento OLE CFBF (.doc) válido`,
          422,
          "INVALID_MAGIC_BYTES",
        );
      }

      return {
        format: "doc",
        extractedTextPreview: "[Documento Word binario legacy .doc]",
        metadata: {
          container: "OLE_CFBF",
          byteLength: buffer.length,
        },
        parsedAt: now,
      };
    }

    default: {
      const exhaustiveCheck: never = extension;
      throw new FilesServiceError(
        `Extensión no soportada: ${exhaustiveCheck}`,
        415,
        "UNSUPPORTED_FORMAT",
      );
    }
  }
}

/**
 * Manages persisted user uploads and TTL-bound published deliverables on disk.
 */
export class FilesService {
  public readonly uploadsDir: string;
  public readonly publishedDir: string;
  public readonly uploadsMetaDir: string;
  private readonly publicBaseUrl: string;
  private readonly onPublished?: (item: PublishedFileSummary) => void;

  constructor(options: FilesServiceOptions) {
    if (!options.uploadsDir || options.uploadsDir.trim().length === 0) {
      throw new FilesServiceError("uploadsDir es obligatorio", 500, "INVALID_CONFIG");
    }
    if (!options.publicBaseUrl || options.publicBaseUrl.trim().length === 0) {
      throw new FilesServiceError("publicBaseUrl es obligatorio", 500, "INVALID_CONFIG");
    }

    this.uploadsDir = path.resolve(options.uploadsDir.trim());
    this.publishedDir = path.join(this.uploadsDir, PUBLISHED_DIR_NAME);
    this.uploadsMetaDir = path.join(this.uploadsDir, UPLOADS_META_DIR_NAME);
    this.publicBaseUrl = options.publicBaseUrl.trim().replace(/\/+$/, "");
    this.onPublished = options.onPublished;

    fs.mkdirSync(this.uploadsDir, { recursive: true });
    fs.mkdirSync(this.publishedDir, { recursive: true });
    fs.mkdirSync(this.uploadsMetaDir, { recursive: true });
  }

  public parseUploadedFile(
    extension: SupportedUploadExtension,
    buffer: Buffer,
    originalName: string,
  ): ParseResult {
    return parseUploadedFile(extension, buffer, originalName);
  }

  public saveUpload(input: SaveUploadInput): UploadedFileRecord {
    const rawName = typeof input.fileName === "string" ? input.fileName.trim() : "";
    const baseName = path.basename(rawName);
    if (!rawName || !baseName || baseName === "." || baseName === "..") {
      throw new FilesServiceError(
        "El nombre del archivo no puede estar vacío",
        400,
        "INVALID_FILENAME",
      );
    }

    if (input.buffer.length > MAX_UPLOAD_BYTES) {
      throw new FilesServiceError(
        `El tamaño del archivo (${input.buffer.length} bytes) excede el límite máximo de ${MAX_UPLOAD_BYTES} bytes (50 MB)`,
        413,
        "PAYLOAD_TOO_LARGE",
      );
    }

    const rawExt = path.extname(baseName).replace(/^\./, "").toLowerCase();
    if (!SUPPORTED_UPLOAD_EXTENSIONS.includes(rawExt as SupportedUploadExtension)) {
      throw new FilesServiceError(
        `Extensión '.${rawExt}' no soportada. Formatos aceptados: ${SUPPORTED_UPLOAD_EXTENSIONS.join(", ")}`,
        415,
        "UNSUPPORTED_FORMAT",
      );
    }

    const extension = rawExt as SupportedUploadExtension;
    const parseResult = this.parseUploadedFile(extension, input.buffer, baseName);

    const sha256 = createHash("sha256").update(input.buffer).digest("hex");
    const id = `upl_${randomBytes(12).toString("hex")}`;
    const safeName = baseName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const preservedPath = path.join(this.uploadsDir, `${id}_${safeName}`);

    writeFileAtomicSync(preservedPath, input.buffer);

    const mimeType =
      input.mimeType && input.mimeType.trim().length > 0
        ? input.mimeType.trim()
        : MIME_TYPE_MAP[extension];

    const record: UploadedFileRecord = {
      id,
      fileName: baseName,
      extension,
      mimeType,
      sizeBytes: input.buffer.length,
      sha256,
      preservedPath,
      uploadedAt: new Date().toISOString(),
      previewSummary: parseResult.extractedTextPreview,
      url: `/api/uploads/${id}`,
      downloadUrl: `/api/uploads/${id}?download=1`,
    };

    const metaPath = path.join(this.uploadsMetaDir, `${id}${UPLOAD_META_SUFFIX}`);
    writeFileAtomicSync(metaPath, JSON.stringify(record, null, 2));

    return record;
  }

  public publishDeliverable(input: PublishDeliverableInput): PublishDeliverableResult {
    const rawSlug =
      typeof input.slug === "string" && input.slug.trim().length > 0
        ? input.slug.trim()
        : `pub-${randomBytes(6).toString("hex")}`;
    const safeSlug = sanitizeSlug(rawSlug);

    let dataBuffer: Buffer;
    let fileName =
      typeof input.filename === "string" && input.filename.trim().length > 0
        ? path.basename(input.filename.trim())
        : safeSlug;

    if (typeof input.file_path === "string" && input.file_path.trim().length > 0) {
      const resolved = path.resolve(input.file_path.trim());
      if (!resolved.startsWith(this.uploadsDir + path.sep)) {
        throw new FilesServiceError(
          `file_path debe estar estrictamente dentro de ${this.uploadsDir}`,
          403,
          "FORBIDDEN_PATH",
        );
      }
      if (!fs.existsSync(resolved)) {
        throw new FilesServiceError(
          "Archivo no encontrado en file_path",
          404,
          "FILE_NOT_FOUND",
        );
      }
      const stat = fs.statSync(resolved);
      if (stat.size > MAX_UPLOAD_BYTES) {
        throw new FilesServiceError(
          "El archivo excede el límite de 50 MB",
          413,
          "PAYLOAD_TOO_LARGE",
        );
      }
      dataBuffer = fs.readFileSync(resolved);
      if (typeof input.filename !== "string" || input.filename.trim().length === 0) {
        fileName = path.basename(resolved);
      }
    } else if (typeof input.content_base64 === "string") {
      dataBuffer = Buffer.from(input.content_base64, "base64");
    } else if (typeof input.content === "string") {
      dataBuffer = Buffer.from(input.content, "utf-8");
    } else {
      throw new FilesServiceError(
        "Debe proporcionar content, content_base64 o file_path",
        400,
        "MISSING_CONTENT",
      );
    }

    if (dataBuffer.length > MAX_UPLOAD_BYTES) {
      throw new FilesServiceError(
        "El contenido excede el límite de 50 MB",
        413,
        "PAYLOAD_TOO_LARGE",
      );
    }

    const ext = path.extname(fileName).toLowerCase().replace(/^\./, "");
    const contentType =
      typeof input.content_type === "string" && input.content_type.trim().length > 0
        ? input.content_type.trim()
        : EXTENDED_PUBLISH_MIME_MAP[ext] ??
          (typeof input.content === "string" && input.content.trim().startsWith("<")
            ? "text/html; charset=utf-8"
            : "application/octet-stream");

    let ttlSeconds: number;
    if (input.ttl_seconds === undefined) {
      ttlSeconds = DEFAULT_PUBLISH_TTL_SECONDS;
    } else if (
      typeof input.ttl_seconds === "number" &&
      Number.isFinite(input.ttl_seconds) &&
      input.ttl_seconds > 0
    ) {
      ttlSeconds = input.ttl_seconds;
    } else {
      throw new FilesServiceError(
        "ttl_seconds debe ser un número positivo",
        400,
        "INVALID_TTL",
      );
    }

    const createdAtMs = Date.now();
    const expiresAtMs = createdAtMs + ttlSeconds * 1000;

    const meta: PublishedFileMetadata = {
      slug: safeSlug,
      filename: fileName,
      contentType,
      sizeBytes: dataBuffer.length,
      createdAt: createdAtMs,
      expiresAt: expiresAtMs,
    };

    const dataPath = path.join(this.publishedDir, `${safeSlug}.bin`);
    const metaPath = path.join(this.publishedDir, `${safeSlug}${PUBLISH_META_SUFFIX}`);
    writeFileAtomicSync(dataPath, dataBuffer);
    writeFileAtomicSync(metaPath, JSON.stringify(meta, null, 2));

    const summary = this.toPublishedSummary(meta);
    if (this.onPublished) {
      this.onPublished(summary);
    }

    return {
      status: "published",
      ...summary,
    };
  }

  public listPublished(): PublishedFileSummary[] {
    const entries = fs.readdirSync(this.publishedDir);
    const now = Date.now();
    const items: Array<{ createdAt: number; summary: PublishedFileSummary }> = [];

    for (const entry of entries) {
      if (!entry.endsWith(PUBLISH_META_SUFFIX)) {
        continue;
      }
      const metaPath = path.join(this.publishedDir, entry);
      const raw = fs.readFileSync(metaPath, "utf-8");
      const meta = JSON.parse(raw) as PublishedFileMetadata;
      const dataPath = path.join(this.publishedDir, `${meta.slug}.bin`);
      if (!fs.existsSync(dataPath)) {
        continue;
      }
      if (now > meta.expiresAt) {
        continue;
      }
      items.push({
        createdAt: meta.createdAt,
        summary: this.toPublishedSummary(meta),
      });
    }

    items.sort((a, b) => b.createdAt - a.createdAt);
    return items.map((item) => item.summary);
  }

  public listUploads(): UploadedFileRecord[] {
    const entries = fs.readdirSync(this.uploadsMetaDir);
    const records: UploadedFileRecord[] = [];

    for (const entry of entries) {
      if (!entry.endsWith(UPLOAD_META_SUFFIX)) {
        continue;
      }
      const metaPath = path.join(this.uploadsMetaDir, entry);
      const raw = fs.readFileSync(metaPath, "utf-8");
      const record = JSON.parse(raw) as UploadedFileRecord;
      if (!fs.existsSync(record.preservedPath)) {
        continue;
      }
      records.push(record);
    }

    records.sort((a, b) => Date.parse(b.uploadedAt) - Date.parse(a.uploadedAt));
    return records;
  }

  public getPublishedFile(slug: string): {
    meta: PublishedFileMetadata;
    filePath: string;
    sizeBytes: number;
  } {
    const safeSlug = sanitizeSlug(slug);
    const dataPath = path.join(this.publishedDir, `${safeSlug}.bin`);
    const metaPath = path.join(this.publishedDir, `${safeSlug}${PUBLISH_META_SUFFIX}`);

    if (!fs.existsSync(dataPath) || !fs.existsSync(metaPath)) {
      throw new FilesServiceError(
        "El enlace publicado no existe",
        404,
        "NOT_FOUND",
      );
    }

    const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8")) as PublishedFileMetadata;
    if (Date.now() > meta.expiresAt) {
      throw new FilesServiceError(
        "Este recurso publicado ha expirado",
        410,
        "EXPIRED",
      );
    }

    const sizeBytes = fs.statSync(dataPath).size;
    return {
      meta,
      filePath: dataPath,
      sizeBytes,
    };
  }

  public getUploadedFile(id: string): {
    record: UploadedFileRecord;
    filePath: string;
    sizeBytes: number;
  } {
    if (!id || !SAFE_ID_REGEX.test(id)) {
      throw new FilesServiceError(
        "ID de archivo subido inválido",
        400,
        "INVALID_UPLOAD_ID",
      );
    }

    const metaPath = path.join(this.uploadsMetaDir, `${id}${UPLOAD_META_SUFFIX}`);
    if (!fs.existsSync(metaPath)) {
      throw new FilesServiceError(
        "Archivo subido no encontrado",
        404,
        "UPLOAD_NOT_FOUND",
      );
    }

    const record = JSON.parse(fs.readFileSync(metaPath, "utf-8")) as UploadedFileRecord;
    if (!fs.existsSync(record.preservedPath)) {
      throw new FilesServiceError(
        "Archivo preservado en disco no encontrado",
        404,
        "UPLOAD_NOT_FOUND",
      );
    }

    const sizeBytes = fs.statSync(record.preservedPath).size;
    return {
      record,
      filePath: record.preservedPath,
      sizeBytes,
    };
  }

  private toPublishedSummary(meta: PublishedFileMetadata): PublishedFileSummary {
    const relativeUrl = `/api/files/${meta.slug}`;
    const relativeDownloadUrl = `${relativeUrl}?download=1`;
    return {
      slug: meta.slug,
      filename: meta.filename,
      url: `${this.publicBaseUrl}${relativeUrl}`,
      download_url: `${this.publicBaseUrl}${relativeDownloadUrl}`,
      relative_url: relativeUrl,
      relative_download_url: relativeDownloadUrl,
      content_type: meta.contentType,
      size_bytes: meta.sizeBytes,
      created_at: new Date(meta.createdAt).toISOString(),
      expires_at: new Date(meta.expiresAt).toISOString(),
    };
  }
}
