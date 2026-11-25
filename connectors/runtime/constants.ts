/**
 * Centralized operational parameters and constants for connectors and runtime.
 * Strictly adheres to zero repeated cross-file literals rule.
 */

export const PIMSAI_BASE_DOMAIN = "pimsai.mistercricro8.top";

export const PIMSAI_PUBLIC_PORT = 444;

export const SECRETS_SIDECAR_DOMAIN = "secrets.pimsai.mistercricro8.top";

export const SECRETS_SIDECAR_INTERNAL_URL = (
  process.env.SECRETS_SIDECAR_URL && process.env.SECRETS_SIDECAR_URL.trim().length > 0
    ? process.env.SECRETS_SIDECAR_URL.trim()
    : "http://pimsai-secrets-sidecar:3000"
).replace(/\/+$/, "");

export const DEFAULT_SECRETS_STORE_PATH =
  process.env.SECRETS_STORE_PATH && process.env.SECRETS_STORE_PATH.trim().length > 0
    ? process.env.SECRETS_STORE_PATH.trim()
    : "/app/secrets";

export const SECRETS_POLL_MAX_TIMEOUT_SEC = 300;

export const DEFAULT_SMTP_HOST = "smtp.gmail.com";

export const DEFAULT_SMTP_PORT = 587;

export const DEFAULT_MAIL_DRAFTS_PATH = "/tmp/pims-mail-drafts.json";

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
