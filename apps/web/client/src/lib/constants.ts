/**
 * Centralized frontend operational constants, routes, storage keys, and regexes.
 * Zero repeated cross-file literals.
 */

export const API_ENDPOINTS = {
  branding: "/api/branding",
  authMe: "/api/auth/me",
  authLogin: "/api/auth/login",
  authLogout: "/api/auth/logout",
  sessions: "/api/sessions",
  sessionsExport: "/api/sessions/export",
  uploads: "/api/uploads",
  files: "/api/files",
  fileBySlug: (slug: string, download = false) =>
    `/api/files/${encodeURIComponent(slug)}${download ? "?download=1" : ""}`,
  secrets: "/api/secrets",
  secretSubmit: (token: string) => `/api/secrets/submit/${encodeURIComponent(token)}`,
  status: "/api/status",
  mirrorDocs: "/api/mirror/docs",
  mirrorExcerpt: (doc: string, ver: string, lines: string) =>
    `/api/mirror/excerpt?doc=${encodeURIComponent(doc)}&ver=${encodeURIComponent(ver)}&lines=${encodeURIComponent(lines)}`,
  mirrorDownload: (code: string, ver?: string, download = false) => {
    const params = new URLSearchParams();
    if (ver) params.set("ver", ver);
    if (download) params.set("download", "1");
    const qs = params.toString();
    return `/api/mirror/download/${encodeURIComponent(code)}${qs ? `?${qs}` : ""}`;
  },
} as const;

export const WS_PATH = "/ws";

export const STORAGE_KEYS = {
  theme: "unsa-pims-theme",
  showTraces: "unsa-pims-show-traces",
} as const;

export const WS_RECONNECT_BASE_MS = 1000;
export const WS_RECONNECT_MAX_MS = 15000;
export const STATUS_POLL_INTERVAL_MS = 30000;
export const COPY_FEEDBACK_MS = 1800;

export const PIMSAI_BASE_DOMAIN = "pimsai.mistercricro8.top";
export const PIMSAI_PUBLIC_PORT = 444;
export const RESERVED_SUBDOMAIN_SLUGS = new Set(["demo", "files", "secrets"]);

/**
 * Matches canonical pims: citations in both formats:
 * - pims:G4-SOA-01:v4.00:5:L114-L133
 * - pims:G4-ALC-01:v3.00:chunk_5:lines:114-133
 */
export const PIMS_CITATION_REGEX = /pims:[A-Za-z0-9_-]+:v[0-9.]+:[^\s)\]\`,;]+/g;

/**
 * Matches relative deliverable links emitted by backend/agent markdown.
 */
export const DELIVERABLE_LINK_REGEX = /\/api\/files\/([A-Za-z0-9._-]+)(?:\?[^\s)]*)?/g;

/**
 * Matches spawned sibling service URLs on the live Traefik domain.
 */
export const EXTERNAL_SERVICE_URL_REGEX =
  /https:\/\/([a-z0-9-]+)\.pimsai\.mistercricro8\.top:444(?:\/[^\s)\]]*)?/gi;

export const DEFAULT_BRANDING = {
  appName: "UNSA PIMS — Operador Agéntico",
  subtitle: "ISO/IEC 27701:2025 · Turno B Grupo 4 (PII Controller)",
  shortBadge: "ISO 27701:2025",
  primaryColor: "#7A1C2E",
  accentColor: "#C59B27",
  defaultTheme: "dark" as const,
  starterPrompts: [],
};
