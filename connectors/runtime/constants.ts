/**
 * Centralized operational parameters and constants for connectors and runtime.
 * Strictly adheres to zero repeated cross-file literals rule.
 */

export const PIMSAI_BASE_DOMAIN = "pimsai.mistercricro8.top";

export const SECRETS_SIDECAR_DOMAIN = "secrets.pimsai.mistercricro8.top";

export const SECRETS_TOKEN_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const SECRETS_HANDLE_PREFIX = "secret:";

export const SECRETS_HANDLE_REGEX = /^secret:([a-zA-Z0-9_.-]+)@v?([0-9]+)$/;

export const DEFAULT_CONNECTOR_SKILL_PATH = ".omp/skills/connectors/SKILL.md";

export const DEFAULT_DOCUMENTS_CODE_PREFIX = "G4-";

export const MAX_DOCUMENT_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB cap per SPEC 3.1

export const SUMMONS_DISPATCH_CONFIRMATION_PHRASE = "envíalo";

export const ALLOWED_DOCUMENT_EXTENSIONS = [".pdf"] as const;

export const ALLOWED_ATTACHMENT_EXTENSIONS = [
  ".png",
  ".tif",
  ".bmp",
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
] as const;
