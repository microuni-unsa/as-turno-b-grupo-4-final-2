/**
 * Central configuration constants for GESTITEL PIMS Adapter.
 *
 * NOTE: Per architecture and security requirements, this is the SOLE location
 * where the default PIMS base URL is declared. Credentials must never be
 * hardcoded anywhere in the codebase.
 */

export const PIMS_CONFIG = {
  /**
   * Default Base URL for the GESTITEL PIMS production instance.
   * Overridable via PIMS_BASE_URL environment variable or constructor config.
   */
  DEFAULT_BASE_URL: "https://unsa.27k.pe",

  /**
   * Default multi-tenant database schema name.
   */
  DEFAULT_SCHEMA: "unsa",

  /**
   * Mandatory code prefix for Group 4 mutations.
   * Shared-tenant guard enforces this prefix on all write operations.
   */
  GROUP_CODE_PREFIX: "G4-",

  /**
   * Identifiers and responsible names assigned to Group 4.
   * Used for tenant isolation filtering on reads.
   */
  RESPONSIBLE_NAMES: [
    "Grupo 4",
    "grupob4",
    "G4",
    "Grupo 4 - Turno B",
    "Equipo 4",
  ] as const,

  /**
   * Default request timeout in milliseconds.
   */
  DEFAULT_TIMEOUT_MS: 30000,

  /**
   * Default maximum retry attempts for transient server failures.
   */
  DEFAULT_MAX_RETRIES: 3,

  /**
   * Default retry backoff timings in milliseconds.
   */
  DEFAULT_RETRY_BACKOFF_MS: [500, 1000, 2000] as const,

  /**
   * Maximum allowed file size for incident attachments (10 MB).
   */
  MAX_ATTACHMENT_SIZE_BYTES: 10 * 1024 * 1024,
  MAX_ATTACHMENT_SIZE_MB: 10,

  /**
   * Allowed file formats per module/endpoint.
   */
  FORMATS_MAP: {
    documents: {
      allowedExtensions: ["pdf"] as const,
      allowedMimeTypes: ["application/pdf"] as const,
      description: "Documents module accepts PDF files only for uploads and version bumps.",
    },
    incidentAttachments: {
      allowedExtensions: [
        "png",
        "tif",
        "bmp",
        "pdf",
        "doc",
        "docx",
        "txt",
      ] as const,
      maxSizeBytes: 10 * 1024 * 1024,
      maxSizeMb: 10,
      description: "Incident attachments accept png, tif, bmp, pdf, doc, docx, txt with a strict 10MB limit.",
    },
    tabularImport: {
      allowedExtensions: ["xlsx"] as const,
      allowedMimeTypes: [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ] as const,
      description: "Tabular register imports accept XLSX files only.",
    },
  },
} as const;

export type AllowedIncidentExtension =
  (typeof PIMS_CONFIG.FORMATS_MAP.incidentAttachments.allowedExtensions)[number];
export type AllowedDocumentExtension =
  (typeof PIMS_CONFIG.FORMATS_MAP.documents.allowedExtensions)[number];
export type AllowedTabularExtension =
  (typeof PIMS_CONFIG.FORMATS_MAP.tabularImport.allowedExtensions)[number];
