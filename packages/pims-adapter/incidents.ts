/**
 * Incidents module for GESTITEL PIMS.
 *
 * Implements:
 * - CRUD operations:
 *   - listIncidents (GET /api/incidents/)
 *   - getIncident (GET /api/incidents/{id}/)
 *   - resolveIncident (resolves by numeric ID or exact incident_code match)
 *   - createIncident (POST /api/incidents/ with G4- code prefix enforcement)
 *   - updateIncident (PATCH /api/incidents/{id}/)
 *   - deleteIncident (DELETE /api/incidents/{id}/ with tenant isolation guard)
 * - Incident history:
 *   - getIncidentHistory (GET /api/incidents/{id}/history/)
 * - Incident attachments:
 *   - getIncidentAttachments (GET /api/incidents/{id}/attachments/)
 *   - uploadIncidentAttachment (POST /api/incidents/{id}/attachments/)
 *     - Client-side validation: png, tif, bmp, pdf, doc, docx, txt formats
 *     - Client-side validation: ~10MB cap
 */

import type { AuthManager } from "./auth.ts";
import { PIMS_CONFIG } from "./config.ts";
import {
  PimsAttachmentFormatError,
  PimsAttachmentSizeError,
  PimsNotFoundError,
  PimsReadFailureError,
  PimsValidationError,
  PimsWriteFailureError,
} from "./errors.ts";
import { assertG4IncidentOwnership, assertG4WriteCode } from "./guards.ts";
import {
  normalizeArrayResponse,
  normalizePaginatedResponse,
} from "./normalize.ts";
import type {
  CreateIncidentInput,
  IncidentTypeCode,
  ListIncidentsParams,
  PaginatedResult,
  PimsAdapterConfig,
  PimsIncident,
  PimsIncidentAttachment,
  PimsIncidentHistory,
  UpdateIncidentInput,
} from "./types.ts";

/**
 * Validates incident_type against the explicit PIMS allowed set.
 * Throws PimsValidationError listing all valid codes when missing or invalid.
 */
export function assertValidIncidentType(
  incidentType: unknown,
): IncidentTypeCode {
  const allowed = PIMS_CONFIG.ALLOWED_INCIDENT_TYPES as readonly string[];
  if (typeof incidentType !== "string" || !allowed.includes(incidentType)) {
    throw new PimsValidationError(
      "incident_type",
      `Incident requires a valid incident_type. Allowed codes: ${allowed.join(", ")} (received: "${String(incidentType ?? "")}").`,
    );
  }
  return incidentType as IncidentTypeCode;
}

/**
 * Ensures incident title carries the G4- prefix for Group 4 ownership tracking,
 * since GESTITEL auto-generates INC-NNN on POST and ignores custom incident_code.
 */
export function ensureG4IncidentTitle(code: string, title: string): string {
  if (typeof title !== "string" || title.trim() === "") {
    throw new PimsValidationError(
      "title",
      "Incident requires a non-empty title.",
    );
  }
  const trimmedTitle = title.trim();
  if (trimmedTitle.startsWith(PIMS_CONFIG.GROUP_CODE_PREFIX)) {
    return trimmedTitle;
  }
  return `${code}: ${trimmedTitle}`;
}

/**
 * Validates an incident attachment against allowed formats and the 10MB size cap.
 */
export function assertIncidentAttachment(
  fileName: string,
  sizeBytes: number,
): void {
  if (!fileName || fileName.trim() === "") {
    throw new PimsValidationError(
      "fileName",
      "Attachment filename must not be empty",
    );
  }

  const cleanName = fileName.trim().toLowerCase();
  const ext = cleanName.includes(".") ? cleanName.split(".").pop() : "";

  const allowed =
    PIMS_CONFIG.FORMATS_MAP.incidentAttachments.allowedExtensions as readonly string[];

  if (!ext || !allowed.includes(ext)) {
    throw new PimsAttachmentFormatError(fileName, ext ?? "unknown", allowed);
  }

  if (sizeBytes > PIMS_CONFIG.MAX_ATTACHMENT_SIZE_BYTES) {
    throw new PimsAttachmentSizeError(
      fileName,
      sizeBytes,
      PIMS_CONFIG.MAX_ATTACHMENT_SIZE_BYTES,
    );
  }
}

export class IncidentsModule {
  private readonly baseUrl: string;
  private readonly schema: string;
  private readonly auth: AuthManager;
  private readonly timeoutMs: number;
  private readonly fetchFn: typeof fetch;

  constructor(auth: AuthManager, config: PimsAdapterConfig = {}) {
    this.auth = auth;
    this.baseUrl = (config.baseUrl ?? PIMS_CONFIG.DEFAULT_BASE_URL).replace(
      /\/+$/,
      "",
    );
    this.schema = config.schema ?? PIMS_CONFIG.DEFAULT_SCHEMA;
    this.timeoutMs = config.timeoutMs ?? PIMS_CONFIG.DEFAULT_TIMEOUT_MS;
    this.fetchFn = config.fetchFn ?? globalThis.fetch.bind(globalThis);
  }

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
    const method = (init.method ?? "GET").toUpperCase();
    const isWrite =
      method === "POST" ||
      method === "PATCH" ||
      method === "PUT" ||
      method === "DELETE";

    try {
      return await this.fetchFn(url, {
        ...init,
        headers,
        signal: controller.signal,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (isWrite) {
        throw new PimsWriteFailureError(
          endpointName,
          0,
          `Network or connection error during call to ${endpointName}: ${message}`,
        );
      }
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
   * Lists incidents from GET /api/incidents/.
   * Uniform reads across all incidents without read-side filtering.
   */
  async listIncidents(
    params?: ListIncidentsParams,
  ): Promise<PaginatedResult<PimsIncident>> {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);
    if (params?.severity) query.set("severity", params.severity);
    if (params?.incident_type) query.set("incident_type", params.incident_type);
    if (params?.page !== undefined) query.set("page", String(params.page));
    if (params?.page_size !== undefined) query.set("page_size", String(params.page_size));

    const qs = query.toString();
    const endpoint = `/api/incidents/${qs ? `?${qs}` : ""}`;
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
        `Failed to list incidents: ${errText}`,
        details,
        response.statusText,
      );
    }

    const raw = (await response.json()) as unknown;
    return normalizePaginatedResponse<PimsIncident>(raw, endpoint);
  }

  /**
   * Retrieves a single incident by ID.
   */
  async getIncident(id: number): Promise<PimsIncident> {
    const endpoint = `/api/incidents/${id}/`;
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
        `Failed to get incident ${id}: ${errText}`,
        details,
        response.statusText,
      );
    }

    return (await response.json()) as PimsIncident;
  }

  /**
   * Resolves an incident by numeric ID or exact incident_code match.
   * If numeric, fetches directly via GET /api/incidents/{id}/.
   * Otherwise searches by code and filters for an exact incident_code match.
   * Throws PimsNotFoundError on miss.
   */
  async resolveIncident(idOrCode: number | string): Promise<PimsIncident> {
    if (typeof idOrCode === "number") {
      return this.getIncident(idOrCode);
    }

    const trimmed = idOrCode.trim();
    if (/^\d+$/.test(trimmed)) {
      return this.getIncident(Number.parseInt(trimmed, 10));
    }

    const response = await this.listIncidents({ search: trimmed });
    const exactMatches = response.results.filter(
      (incident) => incident.incident_code === trimmed,
    );

    if (exactMatches.length === 0) {
      throw new PimsNotFoundError("Incident", trimmed);
    }

    // Deterministic order: sort ascending by primary key id, taking first match
    exactMatches.sort((a, b) => a.id - b.id);
    return exactMatches[0];
  }

  /**
   * Creates a new incident via POST /api/incidents/.
   * Enforces G4- code prefix, mandatory incident_type validation,
   * involves_personal_data default (true), and G4- title prefixing.
   */
  async createIncident(input: CreateIncidentInput): Promise<PimsIncident> {
    // Shared-tenant guard: Write enforcement
    const code = input.incident_code ?? input.code ?? "";
    assertG4WriteCode(code, "Incident");
    const incidentType = assertValidIncidentType(input.incident_type);
    const title = ensureG4IncidentTitle(code, input.title);

    if (
      input.involves_personal_data !== undefined &&
      typeof input.involves_personal_data !== "boolean"
    ) {
      throw new PimsValidationError(
        "involves_personal_data",
        "involves_personal_data must be a boolean (true or false).",
      );
    }
    const involvesPersonalData = input.involves_personal_data ?? true;

    const endpoint = "/api/incidents/";
    const url = `${this.baseUrl}${endpoint}`;

    const { code: _legacyCode, ...rest } = input;
    const payload = {
      ...rest,
      incident_code: code,
      title,
      incident_type: incidentType,
      involves_personal_data: involvesPersonalData,
    };

    const response = await this.authenticatedFetch(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
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
      throw new PimsWriteFailureError(
        endpoint,
        response.status,
        `Failed to create incident ${code}: ${errText}`,
        details,
        response.statusText,
      );
    }

    return (await response.json()) as PimsIncident;
  }

  /**
   * Updates an incident via PATCH /api/incidents/{id}/.
   * Fetches existing incident and asserts Group 4 ownership BEFORE PATCH.
   * If code or incident_type is provided, validates them before network writes.
   */
  async updateIncident(
    id: number,
    input: UpdateIncidentInput,
  ): Promise<PimsIncident> {
    const codeToValidate = input.incident_code ?? input.code;
    if (codeToValidate !== undefined) {
      assertG4WriteCode(codeToValidate, "Incident");
    }
    if (input.incident_type !== undefined) {
      assertValidIncidentType(input.incident_type);
    }
    if (
      input.involves_personal_data !== undefined &&
      typeof input.involves_personal_data !== "boolean"
    ) {
      throw new PimsValidationError(
        "involves_personal_data",
        "involves_personal_data must be a boolean (true or false).",
      );
    }

    const existing = await this.getIncident(id);
    assertG4IncidentOwnership(existing);

    const endpoint = `/api/incidents/${id}/`;
    const url = `${this.baseUrl}${endpoint}`;

    const { code: _legacyCode, ...rest } = input;
    const payload = {
      ...rest,
      ...(codeToValidate !== undefined ? { incident_code: codeToValidate } : {}),
    };

    const response = await this.authenticatedFetch(
      url,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
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
      throw new PimsWriteFailureError(
        endpoint,
        response.status,
        `Failed to update incident ${id}: ${errText}`,
        details,
        response.statusText,
      );
    }

    return (await response.json()) as PimsIncident;
  }

  /**
   * Deletes an incident via DELETE /api/incidents/{id}/.
   * Fetches incident first to assert Group 4 tenant ownership.
   */
  async deleteIncident(id: number): Promise<void> {
    const incident = await this.getIncident(id);
    assertG4IncidentOwnership(incident);

    const endpoint = `/api/incidents/${id}/`;
    const url = `${this.baseUrl}${endpoint}`;

    const response = await this.authenticatedFetch(
      url,
      {
        method: "DELETE",
      },
      endpoint,
    );

    if (!response.ok && response.status !== 204) {
      const errText = await response.text();
      throw new PimsWriteFailureError(
        endpoint,
        response.status,
        `Failed to delete incident ${id}: ${errText}`,
        errText,
        response.statusText,
      );
    }
  }

  /**
   * Retrieves incident audit history from GET /api/incidents/{id}/history/.
   */
  async getIncidentHistory(id: number): Promise<PimsIncidentHistory[]> {
    const endpoint = `/api/incidents/${id}/history/`;
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
        `Failed to get history for incident ${id}: ${errText}`,
        details,
        response.statusText,
      );
    }

    const raw = (await response.json()) as unknown;
    return normalizeArrayResponse<PimsIncidentHistory>(raw, endpoint);
  }

  /**
   * Retrieves incident attachments from GET /api/incidents/{id}/attachments/.
   */
  async getIncidentAttachments(id: number): Promise<PimsIncidentAttachment[]> {
    const endpoint = `/api/incidents/${id}/attachments/`;
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
        `Failed to get attachments for incident ${id}: ${errText}`,
        details,
        response.statusText,
      );
    }

    const raw = (await response.json()) as unknown;
    return normalizeArrayResponse<PimsIncidentAttachment>(raw, endpoint);
  }

  /**
   * Uploads an attachment to an incident via POST /api/incidents/{id}/attachments/.
   * Performs client-side format and 10MB size limit validation before upload.
   */
  async uploadIncidentAttachment(
    id: number,
    file: Blob | Uint8Array | ArrayBuffer | File,
    fileName: string,
  ): Promise<PimsIncidentAttachment[]> {
    let byteLength: number;
    let blobPart: Blob;

    if (file instanceof Blob) {
      byteLength = file.size;
      blobPart = file;
    } else if (file instanceof ArrayBuffer) {
      byteLength = file.byteLength;
      blobPart = new Blob([file]);
    } else {
      byteLength = file.byteLength;
      blobPart = new Blob([new Uint8Array(file)]);
    }

    // Client-side format & 10MB size validation
    assertIncidentAttachment(fileName, byteLength);

    // Fetch existing incident and assert Group 4 ownership before uploading
    const existing = await this.getIncident(id);
    assertG4IncidentOwnership(existing);

    const formData = new FormData();
    formData.append("file", blobPart, fileName);

    const endpoint = `/api/incidents/${id}/attachments/`;
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
      throw new PimsWriteFailureError(
        endpoint,
        response.status,
        `Failed to upload attachment to incident ${id}: ${errText}`,
        details,
        response.statusText,
      );
    }

    const raw = (await response.json()) as unknown;
    if (Array.isArray(raw)) {
      return raw as PimsIncidentAttachment[];
    }
    return [raw as PimsIncidentAttachment];
  }
}
