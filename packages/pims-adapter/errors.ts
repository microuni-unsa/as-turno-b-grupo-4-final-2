/**
 * Typed error hierarchy for GESTITEL PIMS Adapter.
 *
 * Supports explicit read failure protocols, tenant guard enforcements,
 * and predictable, deterministic error handling.
 */

export class PimsBaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PimsBaseError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when a read operation against PIMS fails (HTTP error, connection reset, etc.).
 * Carries the exact endpoint and status so downstream consumers/agents can report
 * precisely what failed and cleanly fall back to the local mirror.
 */
export class PimsReadFailureError extends PimsBaseError {
  readonly endpoint: string;
  readonly status: number;
  readonly statusText?: string;
  readonly details?: unknown;

  constructor(
    endpoint: string,
    status: number,
    message: string,
    details?: unknown,
    statusText?: string,
  ) {
    super(`PIMS read failed at ${endpoint} (HTTP ${status}): ${message}`);
    this.name = "PimsReadFailureError";
    this.endpoint = endpoint;
    this.status = status;
    this.statusText = statusText;
    this.details = details;
  }
}

/**
 * Thrown when a write operation (POST/PATCH/PUT/DELETE) against PIMS fails.
 * Carries exact endpoint and status so consumers and CLI report "PIMS write failed at ...".
 */
export class PimsWriteFailureError extends PimsBaseError {
  readonly endpoint: string;
  readonly status: number;
  readonly statusText?: string;
  readonly details?: unknown;

  constructor(
    endpoint: string,
    status: number,
    message: string,
    details?: unknown,
    statusText?: string,
  ) {
    super(`PIMS write failed at ${endpoint} (HTTP ${status}): ${message}`);
    this.name = "PimsWriteFailureError";
    this.endpoint = endpoint;
    this.status = status;
    this.statusText = statusText;
    this.details = details;
  }
}

/**
 * Typed error indicating that access to trainings or system-catalogs was rejected with HTTP 403.
 * As documented in SPEC §3.1/13, this is an EXPECTED condition for tenant grupob4
 * (training records live as uploaded documents in PIMS, not as database module rows).
 */
export class PimsTrainingsForbiddenError extends PimsReadFailureError {
  constructor(endpoint: string, details?: unknown) {
    super(
      endpoint,
      403,
      "Access to trainings/system-catalogs is forbidden (HTTP 403) for grupob4 as expected. Training records live as uploaded documents in PIMS.",
      details,
      "Forbidden",
    );
    this.name = "PimsTrainingsForbiddenError";
  }
}

/**
 * Thrown when attempting to approve a document (POST /api/documents/{id}/approve/)
 * returns HTTP 403 due to RBAC permissions.
 * As documented in SPEC §2.2 and PROBE-01, user grupob4 lacks 'aprobar' permission
 * (aprobar: false). Document approvals must be performed via the PIMS web UI
 * by an authorized administrator.
 */
export class PimsApprovalForbiddenError extends PimsReadFailureError {
  constructor(endpoint = "/api/documents/{id}/approve/", details?: unknown) {
    super(
      endpoint,
      403,
      "Document approval is forbidden (HTTP 403) for grupob4 per RBAC policy. Approvals must be executed in the PIMS web UI by an authorized administrator.",
      details,
      "Forbidden",
    );
    this.name = "PimsApprovalForbiddenError";
  }
}

/**
 * Thrown when an operation violates multi-tenant isolation rules:
 * - A write lacks the mandatory 'G4-' code prefix.
 * - A read/update attempts to touch or mutate records owned by other groups.
 */
export class TenantGuardViolationError extends PimsBaseError {
  readonly code?: string;
  readonly responsible?: string;

  constructor(message: string, code?: string, responsible?: string) {
    super(message);
    this.name = "TenantGuardViolationError";
    this.code = code;
    this.responsible = responsible;
  }
}

/**
 * Thrown when an invalid document status is supplied to the bidirectional mapper.
 */
export class DocumentStatusMappingError extends PimsBaseError {
  readonly invalidValue: string;

  constructor(invalidValue: string) {
    super(`Invalid document status value: "${invalidValue}"`);
    this.name = "DocumentStatusMappingError";
    this.invalidValue = invalidValue;
  }
}

/**
 * Thrown on authentication or token refresh failures.
 */
export class PimsAuthError extends PimsBaseError {
  readonly reasonCode: string;
  readonly status?: number;
  readonly endpoint?: string;

  constructor(
    message: string,
    reasonCode = "AUTH_FAILED",
    options?: { status?: number; endpoint?: string },
  ) {
    super(message);
    this.name = "PimsAuthError";
    this.reasonCode = reasonCode;
    if (options?.status !== undefined) {
      this.status = options.status;
    }
    if (options?.endpoint !== undefined) {
      this.endpoint = options.endpoint;
    }
  }
}

/**
 * Thrown when an uploaded file violates format restrictions (e.g. non-PDF for documents).
 */
export class PimsAttachmentFormatError extends PimsBaseError {
  readonly fileName: string;
  readonly extension: string;
  readonly allowedExtensions: readonly string[];

  constructor(
    fileName: string,
    extension: string,
    allowedExtensions: readonly string[],
  ) {
    super(
      `File format ".${extension}" of "${fileName}" is not permitted. Allowed extensions: ${allowedExtensions.join(", ")}`,
    );
    this.name = "PimsAttachmentFormatError";
    this.fileName = fileName;
    this.extension = extension;
    this.allowedExtensions = allowedExtensions;
  }
}

/**
 * Thrown when an attachment exceeds the client-side size cap (10 MB).
 */
export class PimsAttachmentSizeError extends PimsBaseError {
  readonly fileName: string;
  readonly sizeBytes: number;
  readonly maxSizeBytes: number;

  constructor(fileName: string, sizeBytes: number, maxSizeBytes: number) {
    const sizeMb = (sizeBytes / (1024 * 1024)).toFixed(2);
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(2);
    super(
      `Attachment "${fileName}" exceeds maximum size limit: ${sizeMb} MB > ${maxMb} MB`,
    );
    this.name = "PimsAttachmentSizeError";
    this.fileName = fileName;
    this.sizeBytes = sizeBytes;
    this.maxSizeBytes = maxSizeBytes;
  }
}

/**
 * Thrown when PIMS rejects input due to server-side schema or field validation.
 */
export class PimsValidationError extends PimsBaseError {
  readonly field: string;
  readonly errors: Record<string, unknown> | string[];

  constructor(
    field: string,
    message: string,
    errors: Record<string, unknown> | string[] = [],
  ) {
    super(`Validation failed on "${field}": ${message}`);
    this.name = "PimsValidationError";
    this.field = field;
    this.errors = errors;
  }
}

/**
 * Thrown when a requested resource is not found (HTTP 404).
 */
export class PimsNotFoundError extends PimsBaseError {
  readonly resource: string;
  readonly id: string | number;

  constructor(resource: string, id: string | number) {
    super(`Resource "${resource}" with id "${id}" was not found in PIMS.`);
    this.name = "PimsNotFoundError";
    this.resource = resource;
    this.id = id;
  }
}

/**
 * Thrown when a specific document version (or its PDF file) cannot be found.
 * Lists the document code, requested version, and all available version strings.
 */
export class PimsVersionNotFoundError extends PimsBaseError {
  readonly docCode: string;
  readonly requestedVersion: string;
  readonly availableVersions: string[];
  readonly status = 404;

  constructor(
    docCode: string,
    requestedVersion: string,
    availableVersions: string[],
  ) {
    const availStr =
      availableVersions.length > 0 ? availableVersions.join(", ") : "(none)";
    super(
      `Document "${docCode}" version "${requestedVersion}" not found or missing file. Available versions: ${availStr}`,
    );
    this.name = "PimsVersionNotFoundError";
    this.docCode = docCode;
    this.requestedVersion = requestedVersion;
    this.availableVersions = availableVersions;
  }
}
