import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { URL } from 'node:url';

// ============================================================================
// CONSTANTS & CONFIGURATION (Centralized, No Repeated Cross-File Literals)
// ============================================================================

/** Traefik Host string for the upload sidecar service */
export const TRAEFIK_HOST = 'files.pimsai.mistercricro8.top';
export const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || `https://${TRAEFIK_HOST}:444`).replace(/\/$/, '');

/** Default token expiry: 5 minutes */
export const DEFAULT_TOKEN_EXPIRY_MINUTES = 5;
export const DEFAULT_TOKEN_EXPIRY_SECONDS = DEFAULT_TOKEN_EXPIRY_MINUTES * 60; // 300 seconds
export const DEFAULT_TOKEN_EXPIRY_MS = DEFAULT_TOKEN_EXPIRY_MINUTES * 60 * 1000; // 5 min
export const TOKEN_EXPIRY_DEFAULT = DEFAULT_TOKEN_EXPIRY_MS;

/** Default poll timeout: 5 minutes */
export const DEFAULT_POLL_TIMEOUT_MINUTES = 5;
export const DEFAULT_POLL_TIMEOUT_SECONDS = DEFAULT_POLL_TIMEOUT_MINUTES * 60; // 300 seconds
export const DEFAULT_POLL_TIMEOUT_MS = DEFAULT_POLL_TIMEOUT_MINUTES * 60 * 1000; // 5 min
export const POLL_TIMEOUT_DEFAULT = DEFAULT_POLL_TIMEOUT_MS;
export const MAX_POLL_WAIT_SECONDS = 300;

/** Maximum allowed upload size: 50MB cap */
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 52,428,800 bytes (50 MB)

/** Default HTTP Port */
export const DEFAULT_PORT = 3000;

/** Supported file extensions */
export const SUPPORTED_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'txt',
  'xlsx',
  'png'
] as const;

export type SupportedExtension = typeof SUPPORTED_EXTENSIONS[number];

/** Supported MIME types */
export const MIME_TYPE_MAP: Record<SupportedExtension, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  png: 'image/png'
};

/** Directory for preserved uploaded files */
export const PRESERVED_UPLOADS_DIR = path.join(process.cwd(), 'data', 'preserved_uploads');
export const PUBLISHED_DIR = path.join(PRESERVED_UPLOADS_DIR, '_published');
export const DEFAULT_PUBLISH_TTL_SECONDS = 3600; // 1 hour

// Ensure preservation & publish directories exist
if (!fs.existsSync(PRESERVED_UPLOADS_DIR)) {
  fs.mkdirSync(PRESERVED_UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(PUBLISHED_DIR)) {
  fs.mkdirSync(PUBLISHED_DIR, { recursive: true });
}

// ============================================================================
// DOMAIN TYPES & INTERFACES
// ============================================================================

export type UploadFlow = 'upload-and-read' | 'directed-version' | 'cascade-evidence';

export type SessionStatus =
  | 'minted'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'expired';

export type FailureStage = 'upload' | 'parse' | 'pims_upload' | 'poll';

export interface PreservedFileRecord {
  originalName: string;
  extension: SupportedExtension;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  preservedPath: string;
  uploadedAt: number;
}

export interface ParseResult {
  format: SupportedExtension;
  extractedTextPreview?: string;
  metadata: Record<string, unknown>;
  parsedAt: number;
}

export interface PimsAckResult {
  pims_doc_id: string | number;
  version: string | number;
  placement: string;
}

export interface FailureDetail {
  stage: FailureStage;
  errorCode: string;
  errorMessage: string;
  preservedFilePath?: string;
  canRetry: boolean;
  failedAt: number;
}

export interface UploadSession {
  token: string;
  createdAt: number;
  expiresAt: number;
  status: SessionStatus;
  flow: UploadFlow;
  uploadToPims: boolean;
  targetDocId?: string | number;
  changeSummary?: string;
  documentMetadata: {
    code?: string;
    name?: string;
    category?: string;
    status?: 'B' | 'R' | 'V' | 'O';
    responsible?: string;
  };
  file?: PreservedFileRecord;
  parseResult?: ParseResult;
  pimsAck?: PimsAckResult;
  failure?: FailureDetail;
}

// ============================================================================
// PIMS ADAPTER INTERFACE & HTTP CLIENT (Zero Secrets in Code)
// ============================================================================

export interface PimsCreateDocumentParams {
  code: string;
  name: string;
  category: string;
  status: 'B' | 'R' | 'V' | 'O';
  responsible: string;
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
}

export interface PimsCreateVersionParams {
  documentId: string | number;
  fileBuffer: Buffer;
  fileName: string;
  changeSummary: string;
  mimeType: string;
}

/**
 * PIMS Adapter Documents Interface
 * Matches the specification in docs/SPEC.md §3.1 & §8.1
 */
export interface PimsAdapterDocumentsInterface {
  createDocument(params: PimsCreateDocumentParams): Promise<PimsAckResult>;
  createVersion(params: PimsCreateVersionParams): Promise<PimsAckResult>;
}

/**
 * Implementation of PimsAdapterDocumentsInterface using the GESTITEL API.
 * Reads environment variables strictly at runtime. No hardcoded credentials.
 */
export class HttpPimsDocumentsAdapter implements PimsAdapterDocumentsInterface {
  private readonly baseUrl: string;
  private readonly tenantSchema: string;

  constructor(options?: { baseUrl?: string; tenantSchema?: string }) {
    this.baseUrl = options?.baseUrl || process.env.PIMS_BASE_URL || 'https://unsa.27k.pe';
    this.tenantSchema = options?.tenantSchema || process.env.PIMS_TENANT_SCHEMA || 'unsa';
  }

  private async getAuthToken(): Promise<string> {
    const directJwt = process.env.PIMS_JWT_TOKEN;
    if (directJwt && directJwt.trim().length > 0) {
      return directJwt.trim();
    }

    const username = process.env.PIMS_USERNAME;
    const password = process.env.PIMS_PASSWORD;

    if (!username || !password) {
      throw new Error(
        'PIMS authentication configuration missing: either PIMS_JWT_TOKEN or PIMS_USERNAME + PIMS_PASSWORD must be set in environment'
      );
    }

    const loginUrl = new URL('/business/login/', this.baseUrl).toString();
    const response = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Schema': this.tenantSchema
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`PIMS login failed with HTTP ${response.status}: ${errText}`);
    }

    const data = (await response.json()) as { access?: string };
    if (!data.access) {
      throw new Error('PIMS login response did not contain access token');
    }

    return data.access;
  }

  async createDocument(params: PimsCreateDocumentParams): Promise<PimsAckResult> {
    const token = await this.getAuthToken();
    const endpoint = new URL('/api/documents/', this.baseUrl).toString();

    const formData = new FormData();
    formData.append('code', params.code);
    formData.append('name', params.name);
    formData.append('category', params.category);
    formData.append('status', params.status);
    formData.append('responsible', params.responsible);

    const blob = new Blob([new Uint8Array(params.fileBuffer)], { type: params.mimeType });
    formData.append('upload_file', blob, params.fileName);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-Schema': this.tenantSchema
      },
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`PIMS POST /api/documents/ failed with HTTP ${response.status}: ${errText}`);
    }

    const json = (await response.json()) as {
      id?: string | number;
      code?: string;
      current_version?: string | number;
    };

    const docId = json.id ?? params.code;
    const version = json.current_version ?? '1.0';
    const placement = `${this.tenantSchema}/documents/${params.code}`;

    return {
      pims_doc_id: docId,
      version: version,
      placement: placement
    };
  }

  async createVersion(params: PimsCreateVersionParams): Promise<PimsAckResult> {
    const token = await this.getAuthToken();
    const endpoint = new URL(`/api/documents/${params.documentId}/versions/`, this.baseUrl).toString();

    const formData = new FormData();
    formData.append('change_summary', params.changeSummary);

    const blob = new Blob([new Uint8Array(params.fileBuffer)], { type: params.mimeType });
    formData.append('file', blob, params.fileName);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-Schema': this.tenantSchema
      },
      body: formData
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(
        `PIMS POST /api/documents/${params.documentId}/versions/ failed with HTTP ${response.status}: ${errText}`
      );
    }

    const json = (await response.json()) as {
      id?: string | number;
      version?: string | number;
      current_version?: string | number;
    };

    const version = json.version ?? json.current_version ?? '2.0';
    const placement = `${this.tenantSchema}/documents/${params.documentId}/v${version}`;

    return {
      pims_doc_id: params.documentId,
      version: version,
      placement: placement
    };
  }
}

// ============================================================================
// IN-MEMORY SESSION STORE (No listing endpoint exposed)
// ============================================================================

export const sessionStore = new Map<string, UploadSession>();

const sessionWaiters = new Map<string, Set<() => void>>();

export function notifySessionWaiters(token: string): void {
  const waiters = sessionWaiters.get(token);
  if (!waiters || waiters.size === 0) {
    return;
  }
  const callbacks = Array.from(waiters);
  sessionWaiters.delete(token);
  for (const cb of callbacks) {
    cb();
  }
}

function isTerminalSessionStatus(status: SessionStatus): boolean {
  return status === 'completed' || status === 'failed' || status === 'expired';
}

function waitForSessionTerminal(
  session: UploadSession,
  waitMs: number,
  signal?: AbortSignal
): Promise<void> {
  if (isTerminalSessionStatus(session.status)) {
    return Promise.resolve();
  }
  if (signal?.aborted) {
    const abortErr = new Error('Wait aborted');
    abortErr.name = 'AbortError';
    return Promise.reject(abortErr);
  }

  return new Promise<void>((resolve, reject) => {
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      const waiters = sessionWaiters.get(session.token);
      if (waiters) {
        waiters.delete(onNotify);
        if (waiters.size === 0) {
          sessionWaiters.delete(session.token);
        }
      }
      if (signal) {
        signal.removeEventListener('abort', onAbort);
      }
    };

    const onNotify = () => {
      if (settled) {
        return;
      }
      if (
        !isTerminalSessionStatus(session.status) &&
        Date.now() <= session.expiresAt &&
        Date.now() - session.createdAt < DEFAULT_POLL_TIMEOUT_MS
      ) {
        return;
      }
      settled = true;
      cleanup();
      resolve();
    };

    const onTimeout = () => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve();
    };

    const onAbort = () => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      const abortErr = new Error('Wait aborted');
      abortErr.name = 'AbortError';
      reject(abortErr);
    };

    let waiters = sessionWaiters.get(session.token);
    if (!waiters) {
      waiters = new Set();
      sessionWaiters.set(session.token, waiters);
    }
    waiters.add(onNotify);

    if (signal) {
      signal.addEventListener('abort', onAbort, { once: true });
    }

    timer = setTimeout(onTimeout, Math.max(1, waitMs));
  });
}

/**
 * Mint a new upload session with explicit 5-min default expiration.
 */
export function mintUploadSession(options?: {
  flow?: UploadFlow;
  uploadToPims?: boolean;
  expiryMs?: number;
  targetDocId?: string | number;
  changeSummary?: string;
  metadata?: {
    code?: string;
    name?: string;
    category?: string;
    status?: 'B' | 'R' | 'V' | 'O';
    responsible?: string;
  };
}): { session: UploadSession; uploadUrl: string; announcedMessage: string } {
  const token = `tok_${crypto.randomBytes(24).toString('hex')}`;
  const now = Date.now();
  const expiryMs = options?.expiryMs ?? DEFAULT_TOKEN_EXPIRY_MS;
  const expiresAt = now + expiryMs;
  const expiryMinutes = Math.round(expiryMs / 60000);
  const flow = options?.flow ?? 'upload-and-read';
  const uploadToPims = options?.uploadToPims ?? (flow === 'directed-version');

  const session: UploadSession = {
    token,
    createdAt: now,
    expiresAt,
    status: 'minted',
    flow,
    uploadToPims,
    targetDocId: options?.targetDocId,
    changeSummary: options?.changeSummary,
    documentMetadata: {
      code: options?.metadata?.code,
      name: options?.metadata?.name,
      category: options?.metadata?.category,
      status: options?.metadata?.status ?? 'B',
      responsible: options?.metadata?.responsible ?? 'Instructor G4'
    }
  };

  sessionStore.set(token, session);

  const uploadUrl = `${PUBLIC_BASE_URL}/upload/${token}`;
  const announcedMessage = `Sube tu archivo a través del siguiente enlace web seguro: ${uploadUrl} (Enlace de un solo uso, expira en ${expiryMinutes} minutos).`;

  return { session, uploadUrl, announcedMessage };
}

// ============================================================================
// FILE VALIDATION & PARSING (pdf, doc, docx, txt, xlsx, png)
// ============================================================================

/**
 * Parse and validate file content based on extension.
 * Fails fast and deterministically if content format is invalid.
 */
export function parseUploadedFile(
  extension: SupportedExtension,
  buffer: Buffer,
  originalName: string
): ParseResult {
  const now = Date.now();

  switch (extension) {
    case 'txt': {
      const textContent = buffer.toString('utf-8');
      const lines = textContent.split(/\r?\n/);
      return {
        format: 'txt',
        extractedTextPreview: textContent.slice(0, 500),
        metadata: {
          lineCount: lines.length,
          characterCount: textContent.length,
          encoding: 'utf-8'
        },
        parsedAt: now
      };
    }

    case 'pdf': {
      // PDF header must begin with %PDF-
      const header = buffer.subarray(0, 8).toString('ascii');
      if (!header.startsWith('%PDF-')) {
        throw new Error(`Archivo '${originalName}' inválido: cabecera PDF faltante o corrupta (esperado '%PDF-')`);
      }
      const pdfVersion = header.trim();
      const contentStr = buffer.toString('latin1');
      const pageMatches = contentStr.match(/\/Type\s*\/Page\b/g);
      const estimatedPages = pageMatches ? pageMatches.length : 1;

      return {
        format: 'pdf',
        extractedTextPreview: `[PDF Document ${pdfVersion}, ~${estimatedPages} páginas]`,
        metadata: {
          pdfVersion,
          estimatedPages,
          byteLength: buffer.length
        },
        parsedAt: now
      };
    }

    case 'png': {
      // PNG header magic: 89 50 4E 47 0D 0A 1A 0A
      const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      if (buffer.length < 24 || !buffer.subarray(0, 8).equals(pngMagic)) {
        throw new Error(`Archivo '${originalName}' inválido: no es una imagen PNG válida (cabecera corrupta)`);
      }
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);

      return {
        format: 'png',
        extractedTextPreview: `[Imagen PNG ${width}x${height} px]`,
        metadata: {
          width,
          height,
          colorType: buffer[25],
          byteLength: buffer.length
        },
        parsedAt: now
      };
    }

    case 'docx': {
      // DOCX is a ZIP container: magic bytes PK\x03\x04
      const zipMagic = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
      if (buffer.length < 30 || !buffer.subarray(0, 4).equals(zipMagic)) {
        throw new Error(`Archivo '${originalName}' inválido: no es un contenedor OOXML DOCX válido (ZIP corrupto)`);
      }
      const zipContent = buffer.toString('latin1');
      if (!zipContent.includes('word/document.xml')) {
        throw new Error(`Archivo '${originalName}' no es un documento de Word (DOCX) válido: falta word/document.xml`);
      }

      return {
        format: 'docx',
        extractedTextPreview: `[Documento Word DOCX estructurado]`,
        metadata: {
          container: 'OOXML/ZIP',
          hasMainDocument: true,
          byteLength: buffer.length
        },
        parsedAt: now
      };
    }

    case 'xlsx': {
      // XLSX is a ZIP container: magic bytes PK\x03\x04
      const zipMagic = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
      if (buffer.length < 30 || !buffer.subarray(0, 4).equals(zipMagic)) {
        throw new Error(`Archivo '${originalName}' inválido: no es un libro de Excel XLSX válido (ZIP corrupto)`);
      }
      const zipContent = buffer.toString('latin1');
      if (!zipContent.includes('xl/workbook.xml') && !zipContent.includes('[Content_Types].xml')) {
        throw new Error(`Archivo '${originalName}' no es una hoja de cálculo XLSX válida: falta xl/workbook.xml`);
      }

      return {
        format: 'xlsx',
        extractedTextPreview: `[Libro de Excel XLSX estructurado]`,
        metadata: {
          container: 'OOXML/ZIP',
          hasWorkbook: true,
          byteLength: buffer.length
        },
        parsedAt: now
      };
    }

    case 'doc': {
      // Legacy DOC is OLE CFBF: D0 CF 11 E0 A1 B1 1A E1
      const oleMagic = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
      if (buffer.length < 512 || !buffer.subarray(0, 8).equals(oleMagic)) {
        throw new Error(`Archivo '${originalName}' inválido: no es un documento OLE CFBF (.doc) válido`);
      }

      return {
        format: 'doc',
        extractedTextPreview: `[Documento Word binario legacy .doc]`,
        metadata: {
          container: 'OLE_CFBF',
          byteLength: buffer.length
        },
        parsedAt: now
      };
    }

    default: {
      const exhaustiveCheck: never = extension;
      throw new Error(`Extensión no soportada: ${exhaustiveCheck}`);
    }
  }
}

// ============================================================================
// PROCESSING PIPELINE (Parse -> PIMS Upload -> Preserved for Retry on Failure)
// ============================================================================

export async function processUploadedSession(
  session: UploadSession,
  fileBuffer: Buffer,
  adapter: PimsAdapterDocumentsInterface
): Promise<void> {
  if (!session.file) {
    throw new Error('No hay archivo asociado a la sesión para procesar');
  }

  session.status = 'processing';

  // ----------------------------------------------------
  // STAGE 2: PARSE
  // ----------------------------------------------------
  let parseResult: ParseResult;
  try {
    parseResult = parseUploadedFile(session.file.extension, fileBuffer, session.file.originalName);
    session.parseResult = parseResult;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    session.status = 'failed';
    session.failure = {
      stage: 'parse',
      errorCode: 'PARSE_FAILED',
      errorMessage: errorMsg,
      preservedFilePath: session.file.preservedPath,
      canRetry: true,
      failedAt: Date.now()
    };
    return;
  }

  // ----------------------------------------------------
  // STAGE 3: PIMS UPLOAD (Only when explicitly requested)
  // ----------------------------------------------------
  if (!session.uploadToPims) {
    session.status = 'completed';
    session.failure = undefined;
    return;
  }

  try {
    let ack: PimsAckResult;
    if (session.flow === 'directed-version' && session.targetDocId) {
      ack = await adapter.createVersion({
        documentId: session.targetDocId,
        fileBuffer: fileBuffer,
        fileName: session.file.originalName,
        changeSummary: session.changeSummary || 'Actualización de versión dirigida vía files-sidecar',
        mimeType: session.file.mimeType
      });
    } else {
      const docCode =
        session.documentMetadata.code ||
        `G4-DOC-${Date.now().toString(36).toUpperCase()}`;
      const docName = session.documentMetadata.name || session.file.originalName;
      if (!session.documentMetadata.category) {
        throw new Error('PIMS upload requested without a valid document category in metadata.category');
      }

      ack = await adapter.createDocument({
        code: docCode,
        name: docName,
        category: session.documentMetadata.category,
        status: session.documentMetadata.status || 'B',
        responsible: session.documentMetadata.responsible || 'Instructor G4',
        fileBuffer: fileBuffer,
        fileName: session.file.originalName,
        mimeType: session.file.mimeType
      });
    }

    session.pimsAck = ack;
    session.status = 'completed';
    session.failure = undefined;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    session.status = 'failed';
    session.failure = {
      stage: 'pims_upload',
      errorCode: 'PIMS_UPLOAD_FAILED',
      errorMessage: errorMsg,
      preservedFilePath: session.file.preservedPath,
      canRetry: true,
      failedAt: Date.now()
    };
  }
}

// ============================================================================
// MULTIPART FORM PARSER (Native zero-dependency RFC 7578 compliant)
// ============================================================================

interface ParsedMultipart {
  fileName: string;
  mimeType: string;
  data: Buffer;
}

export function parseMultipartBody(
  bodyBuffer: Buffer,
  contentTypeHeader: string
): ParsedMultipart {
  const boundaryMatch = contentTypeHeader.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!boundaryMatch) {
    throw new Error('Cabecera Content-Type inválida: falta el parámetro boundary');
  }

  const boundary = boundaryMatch[1] || boundaryMatch[2];
  const boundaryDelimiter = Buffer.from(`--${boundary}`);
  const crlfcrlf = Buffer.from('\r\n\r\n');

  let startIndex = bodyBuffer.indexOf(boundaryDelimiter);
  if (startIndex === -1) {
    throw new Error('Delimitador de multipart boundary no encontrado en el cuerpo de la petición');
  }

  while (startIndex !== -1) {
    const partStart = startIndex + boundaryDelimiter.length;
    // Check if closing boundary --boundary--
    if (bodyBuffer.subarray(partStart, partStart + 2).toString() === '--') {
      break;
    }

    const nextIndex = bodyBuffer.indexOf(boundaryDelimiter, partStart);
    if (nextIndex === -1) {
      break;
    }

    const partBuffer = bodyBuffer.subarray(partStart, nextIndex);
    const headerEndIndex = partBuffer.indexOf(crlfcrlf);
    if (headerEndIndex !== -1) {
      const headerText = partBuffer.subarray(0, headerEndIndex).toString('utf-8');
      const bodyDataWithTrailingCrlf = partBuffer.subarray(headerEndIndex + 4);
      // Remove trailing \r\n before next boundary
      const fileData = bodyDataWithTrailingCrlf.subarray(
        0,
        bodyDataWithTrailingCrlf.length - 2
      );

      const dispositionMatch = headerText.match(
        /Content-Disposition:\s*form-data;\s*name="([^"]+)";\s*filename="([^"]+)"/i
      );

      if (dispositionMatch) {
        const rawFilename = dispositionMatch[2];
        const contentTypeMatch = headerText.match(/Content-Type:\s*([^\r\n]+)/i);
        const mimeType = contentTypeMatch ? contentTypeMatch[1].trim() : 'application/octet-stream';

        return {
          fileName: path.basename(rawFilename),
          mimeType,
          data: fileData
        };
      }
    }

    startIndex = nextIndex;
  }

  throw new Error("No se encontró el campo 'file' o 'upload_file' con un archivo válido en el formulario");
}

// ============================================================================
// HTML WEB FORM RENDERER (Web UI for Instructor)
// ============================================================================

export function renderUploadHtml(session: UploadSession): string {
  const remainingSeconds = Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000));
  const remainingMinutes = Math.floor(remainingSeconds / 60);
  const remainingSecsMod = remainingSeconds % 60;

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Subida de Documento — UNSA PIMS Sidecar</title>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #38bdf8;
      --accent-hover: #0284c7;
      --danger: #ef4444;
      --success: #22c55e;
      --border: #334155;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background-color: var(--bg); color: var(--text); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
    .card { background-color: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; max-width: 580px; width: 100%; padding: 2rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4); }
    .header { margin-bottom: 1.5rem; }
    .badge { display: inline-block; background-color: #0369a1; color: #e0f2fe; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.75rem; }
    h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
    p.sub { color: var(--text-muted); font-size: 0.95rem; line-height: 1.4; }
    .timer-box { background-color: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; padding: 0.75rem 1rem; margin: 1.25rem 0; display: flex; align-items: center; justify-content: space-between; font-size: 0.9rem; }
    .timer-count { font-weight: 700; color: var(--accent); font-family: monospace; font-size: 1.1rem; }
    .dropzone { border: 2px dashed var(--border); border-radius: 8px; padding: 2.5rem 1.5rem; text-align: center; cursor: pointer; transition: border-color 0.2s, background-color 0.2s; margin-bottom: 1.25rem; }
    .dropzone:hover, .dropzone.dragover { border-color: var(--accent); background-color: rgba(56, 189, 248, 0.05); }
    .dropzone p { color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem; }
    .dropzone input[type="file"] { display: none; }
    .file-selected { display: none; background-color: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; font-size: 0.9rem; color: #86efac; word-break: break-all; }
    .btn { width: 100%; background-color: var(--accent); color: #0f172a; border: none; padding: 0.85rem; border-radius: 8px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: background-color 0.2s; }
    .btn:hover:not(:disabled) { background-color: var(--accent-hover); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .formats-note { font-size: 0.8rem; color: var(--text-muted); text-align: center; margin-top: 1rem; }
    .status-msg { margin-top: 1.25rem; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.9rem; display: none; }
    .status-error { background-color: rgba(239, 68, 68, 0.15); border: 1px solid var(--danger); color: #fca5a5; display: block; }
    .status-success { background-color: rgba(34, 197, 94, 0.15); border: 1px solid var(--success); color: #86efac; display: block; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge">Flujo: ${session.flow}</span>
      <h1>UNSA PIMS — Subida Segura</h1>
      <p class="sub">Este enlace es de <strong>un solo uso</strong>. Permite enviar archivos de forma segura al agente${session.uploadToPims ? ' y registrarlos en PIMS' : ''}.</p>
    </div>

    <div class="timer-box">
      <span>Tiempo restante para subir:</span>
      <span class="timer-count" id="countdown">${String(remainingMinutes).padStart(2, '0')}:${String(remainingSecsMod).padStart(2, '0')}</span>
    </div>

    <form id="uploadForm" enctype="multipart/form-data">
      <div class="dropzone" id="dropzone">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent);"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <p><strong>Haz clic aquí</strong> o arrastra tu archivo a esta zona</p>
        <p>Límite máximo: 50 MB</p>
        <input type="file" id="fileInput" name="file" accept=".pdf,.doc,.docx,.txt,.xlsx,.png" required />
      </div>

      <div class="file-selected" id="fileSelected"></div>

      <button type="submit" class="btn" id="submitBtn" disabled>Subir Archivo</button>
    </form>

    <div id="statusBox" class="status-msg"></div>

    <div class="formats-note">
      Formatos soportados: <strong>PDF, DOC, DOCX, TXT, XLSX, PNG</strong> (capacidad 50 MB)
    </div>
  </div>

  <script>
    let remainingSeconds = ${remainingSeconds};
    const countdownEl = document.getElementById('countdown');
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const fileSelected = document.getElementById('fileSelected');
    const submitBtn = document.getElementById('submitBtn');
    const uploadForm = document.getElementById('uploadForm');
    const statusBox = document.getElementById('statusBox');

    const timer = setInterval(() => {
      remainingSeconds--;
      if (remainingSeconds <= 0) {
        clearInterval(timer);
        countdownEl.innerText = '00:00 (EXPIRADO)';
        submitBtn.disabled = true;
        showStatus('El token ha expirado. Este enlace ya no es válido para subidas.', 'status-error');
      } else {
        const m = Math.floor(remainingSeconds / 60);
        const s = remainingSeconds % 60;
        countdownEl.innerText = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
      }
    }, 1000);

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        handleFileSelect();
      }
    });

    fileInput.addEventListener('change', handleFileSelect);

    function handleFileSelect() {
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        if (file.size > ${MAX_FILE_SIZE_BYTES}) {
          showStatus('El archivo supera el límite máximo permitido de 50 MB (' + (file.size / (1024*1024)).toFixed(2) + ' MB)', 'status-error');
          submitBtn.disabled = true;
          fileSelected.style.display = 'none';
          return;
        }
        fileSelected.innerText = 'Archivo seleccionado: ' + file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
        fileSelected.style.display = 'block';
        submitBtn.disabled = false;
        statusBox.style.display = 'none';
      }
    }

    function showStatus(text, className) {
      statusBox.className = 'status-msg ' + className;
      statusBox.innerText = text;
      statusBox.style.display = 'block';
    }

    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!fileInput.files || !fileInput.files[0]) return;

      submitBtn.disabled = true;
      submitBtn.innerText = 'Subiendo y procesando...';
      showStatus('Transfiriendo archivo...', 'status-success');

      const formData = new FormData();
      formData.append('file', fileInput.files[0]);

      try {
        const res = await fetch('/upload/${session.token}', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();
        if (!res.ok || data.status === 'error' || data.status === 'failed') {
          const msg = data.message || ('Error en etapa ' + (data.stage || 'desconocida'));
          showStatus('Error: ' + msg, 'status-error');
          submitBtn.innerText = 'Reintentar Subida';
          submitBtn.disabled = false;
        } else {
          if (data.upload_to_pims && data.pims_doc_id) {
            showStatus('¡Subida completada con éxito! Identificador PIMS: ' + data.pims_doc_id + ' (versión: ' + data.version + ', ubicación: ' + data.placement + ')', 'status-success');
            submitBtn.innerText = 'Archivo Ingestado';
          } else {
            showStatus('¡Archivo recibido con éxito! (' + data.file_name + ', ' + (data.file_size / 1024).toFixed(1) + ' KB). El agente ya puede leerlo.', 'status-success');
            submitBtn.innerText = 'Archivo Enviado';
          }
          clearInterval(timer);
        }
      } catch (err) {
        showStatus('Error de conexión al enviar el archivo: ' + err.message, 'status-error');
        submitBtn.innerText = 'Reintentar Subida';
        submitBtn.disabled = false;
      }
    });
  </script>
</body>
</html>`;
}

// ============================================================================
// HTTP ROUTER & REQUEST HANDLERS
// ============================================================================

export function sendJson(
  res: http.ServerResponse,
  statusCode: number,
  payload: unknown,
  headOnly: boolean = false
): void {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store, no-cache, must-revalidate'
  });
  if (headOnly) {
    res.end();
  } else {
    res.end(body);
  }
}

export function sendHtml(
  res: http.ServerResponse,
  statusCode: number,
  html: string,
  headOnly: boolean = false
): void {
  res.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': Buffer.byteLength(html),
    'Cache-Control': 'no-store, no-cache, must-revalidate'
  });
  if (headOnly) {
    res.end();
  } else {
    res.end(html);
  }
}

/**
 * Main HTTP Request Dispatcher
 */
export async function handleRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  adapter: PimsAdapterDocumentsInterface
): Promise<void> {
  const reqUrl = req.url || '/';
  const parsedUrl = new URL(reqUrl, `http://${req.headers.host || TRAEFIK_HOST}`);
  const pathname = parsedUrl.pathname;
  const method = (req.method || 'GET').toUpperCase();

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400'
    });
    res.end();
    return;
  }

  // 1. Healthcheck (GET & HEAD)
  if ((method === 'GET' || method === 'HEAD') && (pathname === '/health' || pathname === '/healthz')) {
    sendJson(
      res,
      200,
      {
        status: 'ok',
        service: 'files-sidecar',
        host: TRAEFIK_HOST,
        timestamp: new Date().toISOString()
      },
      method === 'HEAD'
    );
    return;
  }

  // 2. Mint token endpoint: POST /api/mint or POST /mint
  if (method === 'POST' && (pathname === '/api/mint' || pathname === '/mint')) {
    let rawBody = '';
    req.on('data', (chunk) => {
      rawBody += chunk.toString();
    });

    req.on('end', () => {
      let payload: Record<string, unknown> = {};
      if (rawBody.trim().length > 0) {
        try {
          payload = JSON.parse(rawBody);
        } catch {
          sendJson(res, 400, {
            status: 'error',
            error: 'BAD_REQUEST',
            message: 'Cuerpo de petición JSON inválido'
          });
          return;
        }
      }

      const flow = (payload.flow as UploadFlow) || 'upload-and-read';
      const uploadToPims = typeof payload.upload_to_pims === 'boolean' ? payload.upload_to_pims : undefined;
      const targetDocId = payload.target_doc_id as string | number | undefined;
      const changeSummary = payload.change_summary as string | undefined;
      const metadata = payload.metadata as {
        code?: string;
        name?: string;
        category?: string;
        status?: 'B' | 'R' | 'V' | 'O';
        responsible?: string;
      } | undefined;

      const { session, uploadUrl, announcedMessage } = mintUploadSession({
        flow,
        uploadToPims,
        targetDocId,
        changeSummary,
        metadata
      });

      sendJson(res, 201, {
        token: session.token,
        upload_url: uploadUrl,
        expires_at: new Date(session.expiresAt).toISOString(),
        expires_in_seconds: Math.floor(DEFAULT_TOKEN_EXPIRY_MS / 1000),
        default_expiry_minutes: DEFAULT_TOKEN_EXPIRY_MINUTES,
        flow: session.flow,
        upload_to_pims: session.uploadToPims,
        announced_message: announcedMessage
      });
    });
    return;
  }

  // 3. Web form render: GET /upload/:token
  const uploadFormMatch = pathname.match(/^\/upload\/([^/]+)$/);
  if (method === 'GET' && uploadFormMatch) {
    const token = uploadFormMatch[1];
    const session = sessionStore.get(token);

    if (!session) {
      sendHtml(
        res,
        404,
        `<h1>404 — Enlace no encontrado</h1><p>El token proporcionado no existe o no es válido.</p>`
      );
      return;
    }

    const now = Date.now();
    if (now > session.expiresAt || session.status === 'expired') {
      session.status = 'expired';
      notifySessionWaiters(token);
      sendHtml(
        res,
        410,
        `<h1>410 — Enlace Expirado</h1><p>Este enlace de un solo uso expiró tras el límite de ${DEFAULT_TOKEN_EXPIRY_MINUTES} minutos.</p>`
      );
      return;
    }

    if (session.status === 'completed' || session.status === 'uploading' || session.status === 'processing') {
      sendHtml(
        res,
        409,
        `<h1>409 — Enlace Ya Utilizado</h1><p>Este enlace de un solo uso ya ha recibido un archivo y no puede reutilizarse.</p>`
      );
      return;
    }

    sendHtml(res, 200, renderUploadHtml(session));
    return;
  }

  // 4. File upload submission: POST /upload/:token
  if (method === 'POST' && uploadFormMatch) {
    const token = uploadFormMatch[1];
    const session = sessionStore.get(token);

    if (!session) {
      sendJson(res, 404, {
        status: 'error',
        stage: 'upload',
        error: 'TOKEN_NOT_FOUND',
        message: 'El token especificado no existe'
      });
      return;
    }

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - session.createdAt) / 1000);
    const limitSeconds = Math.floor(DEFAULT_TOKEN_EXPIRY_MS / 1000);

    // Race condition check: late arrival after timeout
    if (now > session.expiresAt || session.status === 'expired') {
      session.status = 'expired';
      notifySessionWaiters(token);
      sendJson(res, 410, {
        status: 'error',
        stage: 'upload',
        error: 'TOKEN_EXPIRED',
        message: 'Token de subida expirado antes de completar la recepción. No se aceptó ni ingestó el archivo.',
        elapsed_seconds: elapsedSeconds,
        limit_seconds: limitSeconds
      });
      return;
    }

    // Single-use check
    if (session.status !== 'minted') {
      sendJson(res, 409, {
        status: 'error',
        stage: 'upload',
        error: 'TOKEN_ALREADY_USED',
        message: `El token ya fue utilizado previamente (estado actual: ${session.status}).`
      });
      return;
    }

    // Mark as uploading immediately to prevent concurrent races
    session.status = 'uploading';

    const contentType = req.headers['content-type'] || '';
    const contentLength = parseInt(req.headers['content-length'] || '0', 10);

    // Guard: 50MB cap
    if (contentLength > MAX_FILE_SIZE_BYTES) {
      session.status = 'failed';
      session.failure = {
        stage: 'upload',
        errorCode: 'FILE_TOO_LARGE',
        errorMessage: `El tamaño del archivo (${contentLength} bytes) excede el límite máximo de ${MAX_FILE_SIZE_BYTES} bytes (50 MB)`,
        canRetry: false,
        failedAt: Date.now()
      };
      notifySessionWaiters(token);
      sendJson(res, 413, {
        status: 'failed',
        stage: 'upload',
        error: 'FILE_TOO_LARGE',
        message: session.failure.errorMessage
      });
      return;
    }

    const chunks: Buffer[] = [];
    let receivedBytes = 0;

    req.on('data', (chunk: Buffer) => {
      receivedBytes += chunk.length;
      if (receivedBytes > MAX_FILE_SIZE_BYTES) {
        req.destroy(new Error('MAX_FILE_SIZE_EXCEEDED'));
        return;
      }
      chunks.push(chunk);
    });

    req.on('error', (err: Error) => {
      session.status = 'failed';
      session.failure = {
        stage: 'upload',
        errorCode: 'UPLOAD_STREAM_ERROR',
        errorMessage: err.message,
        canRetry: false,
        failedAt: Date.now()
      };
      notifySessionWaiters(token);
      sendJson(res, 400, {
        status: 'failed',
        stage: 'upload',
        error: 'UPLOAD_STREAM_ERROR',
        message: err.message
      });
    });

    req.on('end', async () => {
      const bodyBuffer = Buffer.concat(chunks);

      let parsed: ParsedMultipart;
      try {
        if (contentType.includes('multipart/form-data')) {
          parsed = parseMultipartBody(bodyBuffer, contentType);
        } else {
          // Fallback direct raw binary upload with header filename
          const headerFilename = (req.headers['x-file-name'] as string) || 'document.pdf';
          parsed = {
            fileName: path.basename(headerFilename),
            mimeType: contentType || 'application/octet-stream',
            data: bodyBuffer
          };
        }
      } catch (parseErr: unknown) {
        const errorMsg = parseErr instanceof Error ? parseErr.message : String(parseErr);
        session.status = 'failed';
        session.failure = {
          stage: 'upload',
          errorCode: 'INVALID_MULTIPART',
          errorMessage: errorMsg,
          canRetry: false,
          failedAt: Date.now()
        };
        notifySessionWaiters(token);
        sendJson(res, 400, {
          status: 'failed',
          stage: 'upload',
          error: 'INVALID_MULTIPART',
          message: errorMsg
        });
        return;
      }

      // Validate extension
      const rawExt = path.extname(parsed.fileName).replace('.', '').toLowerCase();
      if (!SUPPORTED_EXTENSIONS.includes(rawExt as SupportedExtension)) {
        session.status = 'failed';
        session.failure = {
          stage: 'upload',
          errorCode: 'UNSUPPORTED_FORMAT',
          errorMessage: `Extensión '.${rawExt}' no soportada. Formatos aceptados: ${SUPPORTED_EXTENSIONS.join(', ')}`,
          canRetry: false,
          failedAt: Date.now()
        };
        notifySessionWaiters(token);
        sendJson(res, 415, {
          status: 'failed',
          stage: 'upload',
          error: 'UNSUPPORTED_FORMAT',
          message: session.failure.errorMessage
        });
        return;
      }

      const extension = rawExt as SupportedExtension;
      const sha256 = crypto.createHash('sha256').update(parsed.data).digest('hex');

      // Preserve file on disk for retry
      const safeToken = token.replace(/[^a-zA-Z0-9_-]/g, '');
      const safeFileName = `${safeToken}_${path.basename(parsed.fileName)}`;
      const preservedPath = path.join(PRESERVED_UPLOADS_DIR, safeFileName);
      fs.writeFileSync(preservedPath, parsed.data);

      session.file = {
        originalName: parsed.fileName,
        extension,
        mimeType: parsed.mimeType || MIME_TYPE_MAP[extension],
        sizeBytes: parsed.data.length,
        sha256,
        preservedPath,
        uploadedAt: Date.now()
      };

      // Process pipeline: Parse -> PIMS Upload
      await processUploadedSession(session, parsed.data, adapter);
      notifySessionWaiters(token);

      if (session.status === 'completed') {
        sendJson(res, 200, {
          status: 'completed',
          upload_to_pims: session.uploadToPims,
          pims_doc_id: session.pimsAck?.pims_doc_id ?? null,
          version: session.pimsAck?.version ?? null,
          placement: session.pimsAck?.placement ?? null,
          preserved_file_path: session.file.preservedPath,
          file_name: session.file.originalName,
          file_size: session.file.sizeBytes,
          sha256: session.file.sha256,
          flow: session.flow
        });
      } else {
        const failure = session.failure;
        sendJson(res, 502, {
          status: 'failed',
          stage: failure?.stage || 'parse',
          error: failure?.errorCode || 'PROCESSING_FAILED',
          message: failure?.errorMessage || 'Error durante el procesamiento',
          preserved_file_path: session.file.preservedPath,
          can_retry: true
        });
      }
    });
    return;
  }

  // 5. Polling endpoint: GET /poll/:token or GET /api/poll/:token (supports ?wait=true&timeout=<sec>)
  const pollMatch = pathname.match(/^\/(?:api\/)?poll\/([^/]+)$/);
  if (method === 'GET' && pollMatch) {
    const token = pollMatch[1];
    const session = sessionStore.get(token);

    if (!session) {
      sendJson(res, 404, {
        status: 'error',
        error: 'TOKEN_NOT_FOUND',
        message: 'El token especificado no existe'
      });
      return;
    }

    const waitParam = parsedUrl.searchParams.get('wait');
    if (
      waitParam !== null &&
      waitParam !== 'true' &&
      waitParam !== 'false' &&
      waitParam !== '1' &&
      waitParam !== '0'
    ) {
      sendJson(res, 400, {
        status: 'error',
        error: 'VALIDATION_ERROR',
        message: "El parámetro 'wait' debe ser 'true' o 'false'"
      });
      return;
    }
    const shouldWait = waitParam === 'true' || waitParam === '1';

    let requestedTimeoutSec: number | null = null;
    const rawTimeout = parsedUrl.searchParams.get('timeout');
    if (rawTimeout !== null) {
      const parsedTimeout = Number(rawTimeout);
      if (!Number.isFinite(parsedTimeout) || parsedTimeout <= 0) {
        sendJson(res, 400, {
          status: 'error',
          error: 'VALIDATION_ERROR',
          message: "El parámetro 'timeout' debe ser un número positivo de segundos"
        });
        return;
      }
      requestedTimeoutSec = Math.min(parsedTimeout, MAX_POLL_WAIT_SECONDS);
    }

    const limitMs = DEFAULT_POLL_TIMEOUT_MS;
    const initialNow = Date.now();
    const initialElapsedMs = initialNow - session.createdAt;
    const isInitiallyExpired = initialNow > session.expiresAt || initialElapsedMs >= limitMs;

    if (
      shouldWait &&
      !isInitiallyExpired &&
      (session.status === 'minted' || session.status === 'uploading' || session.status === 'processing')
    ) {
      const remainingSessionTtlMs = Math.max(
        0,
        Math.min(session.expiresAt - initialNow, session.createdAt + limitMs - initialNow)
      );
      const maxWaitMs = Math.min(
        (requestedTimeoutSec ?? MAX_POLL_WAIT_SECONDS) * 1000,
        remainingSessionTtlMs + 1
      );

      const abortController = new AbortController();
      const onDisconnect = () => {
        if (!res.writableEnded) {
          abortController.abort();
        }
      };
      req.on('close', onDisconnect);
      res.on('close', onDisconnect);

      try {
        await waitForSessionTerminal(session, maxWaitMs, abortController.signal);
      } catch (err: unknown) {
        if (abortController.signal.aborted && err instanceof Error && err.name === 'AbortError') {
          return;
        }
        throw err;
      } finally {
        req.off('close', onDisconnect);
        res.off('close', onDisconnect);
      }

      if (abortController.signal.aborted || res.writableEnded) {
        return;
      }
    }

    const now = Date.now();
    const elapsedMs = now - session.createdAt;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const limitSeconds = Math.floor(limitMs / 1000);

    // Expired poll check
    if (now > session.expiresAt || elapsedMs >= limitMs) {
      if (session.status === 'minted') {
        session.status = 'expired';
        notifySessionWaiters(token);
      }
      if (session.status === 'expired') {
        sendJson(res, 408, {
          status: 'timeout',
          error: 'POLL_TIMEOUT',
          stage: 'poll',
          message: `El tiempo de espera de consulta ha expirado tras ${elapsedSeconds}s (límite: ${limitSeconds}s).`,
          elapsed_seconds: elapsedSeconds,
          limit_seconds: limitSeconds,
          elapsed_ms: elapsedMs,
          limit_ms: limitMs
        });
        return;
      }
    }

    switch (session.status) {
      case 'minted': {
        sendJson(res, 200, {
          status: 'pending',
          token: session.token,
          message: 'Esperando subida del archivo por parte del usuario.',
          elapsed_seconds: elapsedSeconds,
          remaining_seconds: Math.max(0, limitSeconds - elapsedSeconds),
          limit_seconds: limitSeconds
        });
        return;
      }

      case 'uploading':
      case 'processing': {
        sendJson(res, 200, {
          status: 'processing',
          token: session.token,
          message: 'Archivo recibido, procesando parseo y envío a PIMS...',
          elapsed_seconds: elapsedSeconds
        });
        return;
      }

      case 'completed': {
        if (!session.file || (session.uploadToPims && !session.pimsAck)) {
          sendJson(res, 500, {
            status: 'error',
            error: 'CORRUPT_SESSION_STATE',
            message: 'Estado de sesión completado incompleto'
          });
          return;
        }

        sendJson(res, 200, {
          status: 'completed',
          upload_to_pims: session.uploadToPims,
          pims_doc_id: session.pimsAck?.pims_doc_id ?? null,
          version: session.pimsAck?.version ?? null,
          placement: session.pimsAck?.placement ?? null,
          preserved_file_path: session.file.preservedPath,
          file_name: session.file.originalName,
          size_bytes: session.file.sizeBytes,
          sha256: session.file.sha256,
          flow: session.flow,
          parsed_summary: session.parseResult?.extractedTextPreview
        });
        return;
      }

      case 'failed': {
        sendJson(res, 200, {
          status: 'failed',
          stage: session.failure?.stage || 'unknown',
          error: session.failure?.errorCode || 'FAILED',
          message: session.failure?.errorMessage || 'Ocurrió un error en el procesamiento',
          preserved_file_path: session.file?.preservedPath,
          can_retry: session.failure?.canRetry ?? false
        });
        return;
      }

      case 'expired': {
        sendJson(res, 408, {
          status: 'timeout',
          error: 'POLL_TIMEOUT',
          stage: 'poll',
          message: `El token de subida ha expirado tras ${elapsedSeconds}s (límite: ${limitSeconds}s).`,
          elapsed_seconds: elapsedSeconds,
          limit_seconds: limitSeconds,
          elapsed_ms: elapsedMs,
          limit_ms: limitMs
        });
        return;
      }

      default: {
        const exhaustiveCheck: never = session.status;
        throw new Error(`Estado de sesión no reconocido: ${exhaustiveCheck}`);
      }
    }
  }

  // 6. Retry endpoint: POST /retry/:token or POST /api/retry/:token
  const retryMatch = pathname.match(/^\/(?:api\/)?retry\/([^/]+)$/);
  if (method === 'POST' && retryMatch) {
    const token = retryMatch[1];
    const session = sessionStore.get(token);

    if (!session || !session.file || !session.file.preservedPath) {
      sendJson(res, 404, {
        status: 'error',
        error: 'PRESERVED_FILE_NOT_FOUND',
        message: 'No existe un archivo preservado para reintentar la operación'
      });
      return;
    }

    if (!fs.existsSync(session.file.preservedPath)) {
      sendJson(res, 410, {
        status: 'error',
        error: 'FILE_GONE',
        message: 'El archivo preservado en disco ya no se encuentra disponible'
      });
      return;
    }

    const fileBuffer = fs.readFileSync(session.file.preservedPath);
    await processUploadedSession(session, fileBuffer, adapter);
    notifySessionWaiters(token);

    if (session.status === 'completed' && session.pimsAck) {
      sendJson(res, 200, {
        status: 'completed',
        retried: true,
        pims_doc_id: session.pimsAck.pims_doc_id,
        version: session.pimsAck.version,
        placement: session.pimsAck.placement
      });
    } else {
      sendJson(res, 502, {
        status: 'failed',
        retried: true,
        stage: session.failure?.stage,
        error: session.failure?.errorCode,
        message: session.failure?.errorMessage,
        preserved_file_path: session.file.preservedPath,
        can_retry: true
      });
    }
    return;
  }

  // 7. Publish deliverable for user download/viewing: POST /api/publish or POST /publish
  if (method === 'POST' && (pathname === '/api/publish' || pathname === '/publish')) {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    req.on('data', (chunk: Buffer) => {
      totalBytes += chunk.length;
      if (totalBytes <= MAX_FILE_SIZE_BYTES) {
        chunks.push(chunk);
      }
    });
    req.on('end', () => {
      if (totalBytes > MAX_FILE_SIZE_BYTES) {
        sendJson(res, 413, { status: 'error', error: 'PAYLOAD_TOO_LARGE', message: 'El contenido excede el límite de 50 MB' });
        return;
      }

      let payload: Record<string, unknown> = {};
      try {
        payload = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
      } catch {
        sendJson(res, 400, { status: 'error', error: 'BAD_REQUEST', message: 'JSON inválido' });
        return;
      }

      const rawSlug = typeof payload.slug === 'string' && payload.slug.trim().length > 0
        ? payload.slug.trim()
        : `pub-${crypto.randomBytes(6).toString('hex')}`;
      const safeSlug = rawSlug.replace(/[^a-zA-Z0-9._-]/g, '-');

      let dataBuffer: Buffer;
      let fileName = typeof payload.filename === 'string' && payload.filename.trim().length > 0
        ? path.basename(payload.filename.trim())
        : safeSlug;

      if (typeof payload.file_path === 'string' && payload.file_path.trim().length > 0) {
        const resolved = path.resolve(payload.file_path.trim());
        const allowedBase = path.resolve(PRESERVED_UPLOADS_DIR);
        if (!resolved.startsWith(allowedBase + path.sep)) {
          sendJson(res, 403, {
            status: 'error',
            error: 'FORBIDDEN_PATH',
            message: `file_path debe estar dentro de ${PRESERVED_UPLOADS_DIR}`
          });
          return;
        }
        if (!fs.existsSync(resolved)) {
          sendJson(res, 404, { status: 'error', error: 'FILE_NOT_FOUND', message: 'Archivo no encontrado en file_path' });
          return;
        }
        dataBuffer = fs.readFileSync(resolved);
        if (typeof payload.filename !== 'string') {
          fileName = path.basename(resolved);
        }
      } else if (typeof payload.content_base64 === 'string') {
        dataBuffer = Buffer.from(payload.content_base64, 'base64');
      } else if (typeof payload.content === 'string') {
        dataBuffer = Buffer.from(payload.content, 'utf-8');
      } else {
        sendJson(res, 400, {
          status: 'error',
          error: 'MISSING_CONTENT',
          message: 'Debe proporcionar content, content_base64 o file_path'
        });
        return;
      }

      const ext = path.extname(fileName).toLowerCase().replace(/^\./, '');
      const extMimeMap: Record<string, string> = {
        ...MIME_TYPE_MAP,
        html: 'text/html; charset=utf-8',
        htm: 'text/html; charset=utf-8',
        md: 'text/markdown; charset=utf-8',
        json: 'application/json; charset=utf-8',
        csv: 'text/csv; charset=utf-8',
        svg: 'image/svg+xml'
      };
      const contentType = typeof payload.content_type === 'string' && payload.content_type.trim().length > 0
        ? payload.content_type.trim()
        : (extMimeMap[ext] || (typeof payload.content === 'string' && payload.content.trim().startsWith('<') ? 'text/html; charset=utf-8' : 'application/octet-stream'));

      const ttlSeconds = typeof payload.ttl_seconds === 'number' && payload.ttl_seconds > 0
        ? payload.ttl_seconds
        : DEFAULT_PUBLISH_TTL_SECONDS;
      const expiresAt = Date.now() + ttlSeconds * 1000;

      const dataPath = path.join(PUBLISHED_DIR, `${safeSlug}.bin`);
      const metaPath = path.join(PUBLISHED_DIR, `${safeSlug}.meta.json`);
      fs.writeFileSync(dataPath, dataBuffer);
      fs.writeFileSync(metaPath, JSON.stringify({
        slug: safeSlug,
        filename: fileName,
        contentType,
        sizeBytes: dataBuffer.length,
        expiresAt
      }));

      const publicUrl = `${PUBLIC_BASE_URL}/p/${safeSlug}`;
      sendJson(res, 201, {
        status: 'published',
        slug: safeSlug,
        url: publicUrl,
        download_url: `${publicUrl}?download=1`,
        content_type: contentType,
        size_bytes: dataBuffer.length,
        expires_at: new Date(expiresAt).toISOString()
      });
    });
    return;
  }

  // 8. Serve published deliverable: GET or HEAD /p/:slug
  const publishMatch = pathname.match(/^\/p\/([^/]+)$/);
  if ((method === 'GET' || method === 'HEAD') && publishMatch) {
    const isHead = method === 'HEAD';
    const safeSlug = decodeURIComponent(publishMatch[1]).replace(/[^a-zA-Z0-9._-]/g, '-');
    const dataPath = path.join(PUBLISHED_DIR, `${safeSlug}.bin`);
    const metaPath = path.join(PUBLISHED_DIR, `${safeSlug}.meta.json`);

    if (!fs.existsSync(dataPath) || !fs.existsSync(metaPath)) {
      sendHtml(res, 404, '<h1>404 — Recurso no encontrado</h1><p>El enlace publicado no existe.</p>', isHead);
      return;
    }

    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as {
      filename: string;
      contentType: string;
      sizeBytes: number;
      expiresAt: number;
    };

    if (Date.now() > meta.expiresAt) {
      sendHtml(res, 410, '<h1>410 — Enlace Expirado</h1><p>Este recurso publicado ha expirado.</p>', isHead);
      return;
    }

    const forceDownload = parsedUrl.searchParams.get('download') === '1';
    const disposition = forceDownload ? 'attachment' : 'inline';
    const fileSize = fs.statSync(dataPath).size;
    res.writeHead(200, {
      'Content-Type': meta.contentType,
      'Content-Length': fileSize,
      'Content-Disposition': `${disposition}; filename="${meta.filename.replace(/"/g, '')}"`,
      'Cache-Control': 'no-store'
    });
    if (isHead) {
      res.end();
    } else {
      const buf = fs.readFileSync(dataPath);
      res.end(buf);
    }
    return;
  }

  // 9. Explicitly reject any listing endpoints or unknown paths (No listing endpoint)
  sendJson(res, 404, {
    status: 'error',
    error: 'NOT_FOUND',
    message: 'Ruta no encontrada o listado no permitido en este servicio'
  });
}

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================

export function createServer(adapter?: PimsAdapterDocumentsInterface): http.Server {
  const pimsAdapter = adapter || new HttpPimsDocumentsAdapter();
  return http.createServer((req, res) => {
    handleRequest(req, res, pimsAdapter).catch((err: unknown) => {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (!res.headersSent) {
        sendJson(res, 500, {
          status: 'error',
          error: 'INTERNAL_SERVER_ERROR',
          message: errorMsg
        });
      }
    });
  });
}

// Automatically start when run directly
const isDirectExecution =
  process.argv[1] &&
  (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'));

if (isDirectExecution) {
  const port = parseInt(process.env.PORT || String(DEFAULT_PORT), 10);
  const server = createServer();
  server.listen(port, '0.0.0.0', () => {
    console.log(`[files-sidecar] Servidor escuchando en http://0.0.0.0:${port}`);
    console.log(`[files-sidecar] Host Traefik: ${TRAEFIK_HOST}`);
    console.log(`[files-sidecar] Expiración de token por defecto: ${DEFAULT_TOKEN_EXPIRY_MINUTES} min (${DEFAULT_TOKEN_EXPIRY_MS} ms)`);
    console.log(`[files-sidecar] Timeout de sondeo (poll) por defecto: ${DEFAULT_POLL_TIMEOUT_MINUTES} min (${DEFAULT_POLL_TIMEOUT_MS} ms)`);
  });
}
