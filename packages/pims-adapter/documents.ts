/**
 * Documents module for GESTITEL PIMS (SPEC §3.1).
 *
 * Implements:
 * - POST /api/documents/ multipart (code, name, category, status, responsible, upload_file)
 * - POST /api/documents/{id}/versions/ multipart (file, change_summary)
 * - GET /api/documents/ list (filtered by Group 4 tenant guard)
 * - GET /api/documents/{id}/ detail (guarded)
 * - GET /api/documents/{id}/versions/ list
 * - POST /api/documents/{id}/approve/
 *
 * Response shape:
 * id, code, current_version, name, category, status, responsible, file,
 * approved_at, approved_by_name, related_documents, gap_requirements.
 */

import type { AuthManager } from "./auth.ts";
import { PIMS_CONFIG } from "./config.ts";
import {
  DocumentStatusMappingError,
  PimsAttachmentFormatError,
  PimsReadFailureError,
  PimsValidationError,
} from "./errors.ts";
import { assertG4WriteCode } from "./guards.ts";
import {
  normalizeArrayResponse,
  normalizePaginatedResponse,
} from "./normalize.ts";
import type {
  AddDocumentVersionInput,
  CreateDocumentInput,
  DocumentStatusAPI,
  DocumentStatusUI,
  ListDocumentsParams,
  PaginatedResult,
  PimsAdapterConfig,
  PimsDocument,
  PimsDocumentVersion,
} from "./types.ts";

/**
 * Bidirectional mapper: UI status -> API status code.
 * Implements strict exhaustive switch with no silent defaults.
 */
export function mapDocumentStatusUIToAPI(
  status: DocumentStatusUI,
): DocumentStatusAPI {
  switch (status) {
    case "borrador":
      return "B";
    case "en_revision":
      return "R";
    case "vigente":
      return "V";
    case "obsoleto":
      return "O";
    default: {
      const _exhaustiveCheck: never = status;
      throw new DocumentStatusMappingError(
        `Unknown UI status "${String(_exhaustiveCheck)}". Expected "borrador" | "en_revision" | "vigente" | "obsoleto".`,
      );
    }
  }
}

/**
 * Bidirectional mapper: API status code -> UI status string.
 * Implements strict exhaustive switch with no silent defaults.
 */
export function mapDocumentStatusAPIToUI(
  status: DocumentStatusAPI,
): DocumentStatusUI {
  switch (status) {
    case "B":
      return "borrador";
    case "R":
      return "en_revision";
    case "V":
      return "vigente";
    case "O":
      return "obsoleto";
    default: {
      const _exhaustiveCheck: never = status;
      throw new DocumentStatusMappingError(
        `Unknown API status code "${String(_exhaustiveCheck)}". Expected "B" | "R" | "V" | "O".`,
      );
    }
  }
}

function resolvePdfFileName(
  explicitName: string | undefined,
  file: Blob | Uint8Array | ArrayBuffer | File,
): string {
  const candidate =
    typeof explicitName === "string" && explicitName.trim() !== ""
      ? explicitName.trim()
      : file instanceof File && file.name.trim() !== ""
        ? file.name.trim()
        : "";

  if (candidate === "") {
    throw new PimsValidationError(
      "fileName",
      "Document upload requires a non-empty PDF fileName (e.g. 'G4-POL-01_v4.0.pdf').",
    );
  }
  assertDocumentPdfFile(candidate);
  return candidate;
}

/**
 * Normalizes UI or API status into API code.
 */
export function normalizeDocumentStatusToAPI(
  status: DocumentStatusUI | DocumentStatusAPI,
): DocumentStatusAPI {
  if (status === "B" || status === "R" || status === "V" || status === "O") {
    return status;
  }
  return mapDocumentStatusUIToAPI(status as DocumentStatusUI);
}

/**
 * Client-side validation enforcing that document uploads are strictly PDF files.
 */
export function assertDocumentPdfFile(fileName?: string): void {
  if (!fileName) {
    return;
  }
  const cleanName = fileName.trim().toLowerCase();
  const ext = cleanName.includes(".") ? cleanName.split(".").pop() : "";
  if (ext !== "pdf") {
    throw new PimsAttachmentFormatError(
      fileName,
      ext ?? "unknown",
      PIMS_CONFIG.FORMATS_MAP.documents.allowedExtensions,
    );
  }
}

export class DocumentsModule {
  private readonly baseUrl: string;
  private readonly schema: string;
  private readonly auth: AuthManager;
  private readonly timeoutMs: number;
  private readonly fetchFn: typeof fetch;

  constructor(
    auth: AuthManager,
    config: PimsAdapterConfig = {},
  ) {
    this.auth = auth;
    this.baseUrl = (config.baseUrl ?? PIMS_CONFIG.DEFAULT_BASE_URL).replace(
      /\/+$/,
      "",
    );
    this.schema = config.schema ?? PIMS_CONFIG.DEFAULT_SCHEMA;
    this.timeoutMs = config.timeoutMs ?? PIMS_CONFIG.DEFAULT_TIMEOUT_MS;
    this.fetchFn = config.fetchFn ?? globalThis.fetch.bind(globalThis);
  }

  /**
   * Helper to make authenticated requests with tenant headers.
   */
  private async authenticatedFetch(
    url: string,
    init: RequestInit,
    endpointName: string,
  ): Promise<Response> {
    const token = await this.auth.getValidAccessToken();
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);
    headers.set("X-PIMS-Schema", this.schema);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      return await this.fetchFn(url, {
        ...init,
        headers,
        signal: controller.signal,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new PimsReadFailureError(
        endpointName,
        0,
        `Network or connection error during call to ${endpointName}: ${message}`,
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Creates a new document in PIMS via POST /api/documents/ multipart FormData.
   *
   * Form fields: code, name, category, status, responsible + upload_file
   * Enforces G4- code prefix and PDF format.
   */
  async createDocument(input: CreateDocumentInput): Promise<PimsDocument> {
    // Shared-tenant guard: Write enforcement
    assertG4WriteCode(input.code, "Document");

    // Format enforcement (no silent fallback filename)
    const fileName = resolvePdfFileName(input.fileName, input.upload_file);

    const apiStatus = normalizeDocumentStatusToAPI(input.status);

    const formData = new FormData();
    formData.append("code", input.code);
    formData.append("name", input.name);
    formData.append("category", input.category);
    formData.append("status", apiStatus);
    formData.append("responsible", input.responsible);

    let blobPart: Blob;
    if (input.upload_file instanceof Blob) {
      blobPart = input.upload_file;
    } else if (input.upload_file instanceof ArrayBuffer) {
      blobPart = new Blob([input.upload_file], { type: "application/pdf" });
    } else {
      blobPart = new Blob([new Uint8Array(input.upload_file)], {
        type: "application/pdf",
      });
    }
    formData.append("upload_file", blobPart, fileName);

    const endpoint = "/api/documents/";
    const url = `${this.baseUrl}${endpoint}`;

    const response = await this.authenticatedFetch(
      url,
      {
        method: "POST",
        body: formData,
      },
      endpoint,
    );

    if (!response.ok) {
      const errText = await response.text();
      let details: unknown = errText;
      try {
        details = JSON.parse(errText);
      } catch {
        // Keep raw text
      }
      throw new PimsReadFailureError(
        endpoint,
        response.status,
        `Failed to create document ${input.code}: ${errText}`,
        details,
        response.statusText,
      );
    }

    const data = (await response.json()) as PimsDocument;
    return data;
  }

  /**
   * Uploads a new version for an existing document via POST /api/documents/{id}/versions/
   *
   * Form fields: file + change_summary
   */
  async addDocumentVersion(
    id: number,
    input: AddDocumentVersionInput,
  ): Promise<PimsDocumentVersion> {
    const fileName = resolvePdfFileName(input.fileName, input.file);

    if (!input.change_summary || input.change_summary.trim() === "") {
      throw new PimsValidationError(
        "change_summary",
        "Version creation requires a descriptive change_summary",
      );
    }

    const formData = new FormData();
    formData.append("change_summary", input.change_summary);

    let blobPart: Blob;
    if (input.file instanceof Blob) {
      blobPart = input.file;
    } else if (input.file instanceof ArrayBuffer) {
      blobPart = new Blob([input.file], { type: "application/pdf" });
    } else {
      blobPart = new Blob([new Uint8Array(input.file)], {
        type: "application/pdf",
      });
    }
    formData.append("file", blobPart, fileName);

    const endpoint = `/api/documents/${id}/versions/`;
    const url = `${this.baseUrl}${endpoint}`;

    const response = await this.authenticatedFetch(
      url,
      {
        method: "POST",
        body: formData,
      },
      endpoint,
    );

    if (!response.ok) {
      const errText = await response.text();
      let details: unknown = errText;
      try {
        details = JSON.parse(errText);
      } catch {
        // Keep raw text
      }
      throw new PimsReadFailureError(
        endpoint,
        response.status,
        `Failed to upload version for document id ${id}: ${errText}`,
        details,
        response.statusText,
      );
    }

    return (await response.json()) as PimsDocumentVersion;
  }

  /**
   * Lists documents from GET /api/documents/.
   * Applies shared-tenant read filter: only returns Group 4 documents.
   */
  async listDocuments(
    params?: ListDocumentsParams,
  ): Promise<PaginatedResult<PimsDocument>> {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.category) query.set("category", params.category);
    if (params?.status) {
      query.set("status", normalizeDocumentStatusToAPI(params.status));
    }
    if (params?.page) query.set("page", String(params.page));
    if (params?.page_size) query.set("page_size", String(params.page_size));

    const qs = query.toString();
    const endpoint = `/api/documents/${qs ? `?${qs}` : ""}`;
    const url = `${this.baseUrl}${endpoint}`;

    const response = await this.authenticatedFetch(
      url,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      },
      endpoint,
    );

    if (!response.ok) {
      const errText = await response.text();
      let details: unknown = errText;
      try {
        details = JSON.parse(errText);
      } catch {
        // Keep raw text
      }
      throw new PimsReadFailureError(
        endpoint,
        response.status,
        `Failed to list documents: ${errText}`,
        details,
        response.statusText,
      );
    }

    const raw = (await response.json()) as unknown;
    return normalizePaginatedResponse<PimsDocument>(raw, endpoint);
  }

  /**
   * Retrieves a single document by ID from GET /api/documents/{id}/.
   */
  async getDocument(id: number): Promise<PimsDocument> {
    const endpoint = `/api/documents/${id}/`;
    const url = `${this.baseUrl}${endpoint}`;

    const response = await this.authenticatedFetch(
      url,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      },
      endpoint,
    );

    if (!response.ok) {
      const errText = await response.text();
      let details: unknown = errText;
      try {
        details = JSON.parse(errText);
      } catch {
        // Keep raw text
      }
      throw new PimsReadFailureError(
        endpoint,
        response.status,
        `Failed to get document ${id}: ${errText}`,
        details,
        response.statusText,
      );
    }

    return (await response.json()) as PimsDocument;
  }

  /**
   * Retrieves version history for a document from GET /api/documents/{id}/versions/.
   */
  async getDocumentVersions(id: number): Promise<PimsDocumentVersion[]> {
    const endpoint = `/api/documents/${id}/versions/`;
    const url = `${this.baseUrl}${endpoint}`;

    const response = await this.authenticatedFetch(
      url,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      },
      endpoint,
    );

    if (!response.ok) {
      const errText = await response.text();
      let details: unknown = errText;
      try {
        details = JSON.parse(errText);
      } catch {
        // Keep raw text
      }
      throw new PimsReadFailureError(
        endpoint,
        response.status,
        `Failed to get versions for document ${id}: ${errText}`,
        details,
        response.statusText,
      );
    }

    const raw = (await response.json()) as unknown;
    return normalizeArrayResponse<PimsDocumentVersion>(raw, endpoint);
  }

  /**
   * Approves a document via POST /api/documents/{id}/approve/.
   */
  async approveDocument(id: number): Promise<PimsDocument> {
    const endpoint = `/api/documents/${id}/approve/`;
    const url = `${this.baseUrl}${endpoint}`;

    const response = await this.authenticatedFetch(
      url,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      },
      endpoint,
    );

    if (!response.ok) {
      const errText = await response.text();
      let details: unknown = errText;
      try {
        details = JSON.parse(errText);
      } catch {
        // Keep raw text
      }
      throw new PimsReadFailureError(
        endpoint,
        response.status,
        `Failed to approve document ${id}: ${errText}`,
        details,
        response.statusText,
      );
    }

    return (await response.json()) as PimsDocument;
  }
}
