/**
 * Centralized shared operational constants for apps/web.
 * Zero repeated cross-file literals.
 */

export const DEFAULT_WEB_PORT = 8082;

export const WEB_APP_DOMAIN = "demo.pimsai.mistercricro8.top";

export const PIMSAI_BASE_DOMAIN = "pimsai.mistercricro8.top";

export const PIMSAI_PUBLIC_PORT = 444;

export const DEFAULT_WEB_PUBLIC_URL = "https://demo.pimsai.mistercricro8.top:444";

export const DEFAULT_WEB_INTERNAL_URL = "http://127.0.0.1:8082";

export const AUTH_COOKIE_NAME = "pimsai_session";

export const AUTH_COOKIE_TTL_SECONDS = 60 * 60 * 12;

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export const DEFAULT_PUBLISH_TTL_SECONDS = 3600;

export const SECRET_TOKEN_TTL_MS = 5 * 60 * 1000;

export const SECRETS_POLL_MAX_TIMEOUT_SEC = 300;

export const SECRETS_HANDLE_PREFIX = "secret:";

export const SECRETS_HANDLE_REGEX = /^secret:([a-zA-Z0-9_.-]+)@v?([0-9]+)$/;

export const SUPPORTED_UPLOAD_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "txt",
  "xlsx",
  "png",
] as const;

export type SupportedUploadExtension = (typeof SUPPORTED_UPLOAD_EXTENSIONS)[number];

export const MIME_TYPE_MAP: Record<SupportedUploadExtension, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  png: "image/png",
};

export const EXTENDED_PUBLISH_MIME_MAP: Record<string, string> = {
  ...MIME_TYPE_MAP,
  html: "text/html; charset=utf-8",
  htm: "text/html; charset=utf-8",
  md: "text/markdown; charset=utf-8",
  json: "application/json; charset=utf-8",
  csv: "text/csv; charset=utf-8",
  svg: "image/svg+xml",
};

export const RESERVED_SLUGS = ["demo"] as const;

export const RPC_MAX_REASSEMBLED_BYTES = 64 * 1024 * 1024;

export const PIMS_STATUS_CACHE_TTL_MS = 60_000;
