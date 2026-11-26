import { createHmac, randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  DEFAULT_WEB_PORT,
  DEFAULT_WEB_PUBLIC_URL,
} from "../shared/constants.ts";
import type { BrandingConfig, BrandingStarterPrompt } from "../shared/protocol.ts";

export interface ServerConfig {
  projectRoot: string;
  port: number;
  publicUrl: string;
  rwToken: string;
  roToken: string | null;
  devNoAuth: boolean;
  cookieSecret: string;
  uploadsDir: string;
  secretsStoreDir: string;
  corpusMirrorDir: string;
  sessionsDir: string;
  webDistDir: string;
  brandingPath: string;
  agentModel: string | null;
  agentEnvVar: string | null;
  agentApiKey: string | null;
  databaseUrl: string | null;
  pimsBaseUrl: string | null;
  softRequestBudget: number;
}

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
const DEFAULT_SOFT_REQUEST_BUDGET = 150;
const COOKIE_SECRET_HMAC_DOMAIN = "pimsai-web-cookie-secret-v1";

function readOptionalEnv(env: Record<string, string | undefined>, key: string): string | null {
  const raw = env[key];
  if (raw === undefined) {
    return null;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parsePort(env: Record<string, string | undefined>): number {
  const raw = readOptionalEnv(env, "WEB_PORT") ?? readOptionalEnv(env, "PORT");
  if (raw === null) {
    return DEFAULT_WEB_PORT;
  }
  if (!/^\d+$/.test(raw)) {
    throw new Error(`Invalid web port '${raw}': expected integer between 1 and 65535`);
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`Invalid web port '${raw}': must be between 1 and 65535`);
  }
  return parsed;
}

function stripTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, "");
}

function resolveSessionsDir(
  env: Record<string, string | undefined>,
  projectRoot: string,
): string {
  const explicit = readOptionalEnv(env, "OMP_SESSIONS_DIR");
  if (explicit !== null) {
    return path.resolve(projectRoot, explicit);
  }

  const sessionsBase = path.join(os.homedir(), ".omp", "agent", "sessions");
  const normalizedNoHome = projectRoot
    .replace(/^\/home\/[^/]+\//, "")
    .replace(/^[/\\]+/, "")
    .replace(/[/\\]/g, "-");
  const normalizedFull = projectRoot
    .replace(/^[/\\]+/, "")
    .replace(/[/\\]/g, "-");

  const candidates = [
    `-${normalizedNoHome}`,
    `--${normalizedFull}--`,
    `-${normalizedFull}`,
    "--app--",
  ];

  for (const candidate of candidates) {
    const candidatePath = path.join(sessionsBase, candidate);
    if (existsSync(candidatePath)) {
      return candidatePath;
    }
  }

  if (projectRoot === "/app") {
    return path.join(sessionsBase, "--app--");
  }
  return path.join(sessionsBase, `--${normalizedFull}--`);
}

function readSoftRequestBudget(projectRoot: string): number {
  const configPath = path.join(projectRoot, ".omp", "config.yml");
  if (!existsSync(configPath)) {
    return DEFAULT_SOFT_REQUEST_BUDGET;
  }

  const content = readFileSync(configPath, "utf8");
  const match = /^\s*softRequestBudget\s*:\s*(\d+)\s*(?:#.*)?$/m.exec(content);
  if (match === null) {
    return DEFAULT_SOFT_REQUEST_BUDGET;
  }

  const parsed = Number.parseInt(match[1], 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(
      `Invalid task.softRequestBudget in ${configPath}: '${match[1]}' must be a positive integer`,
    );
  }
  return parsed;
}

function deriveCookieSecret(
  explicitSecret: string | null,
  rwToken: string,
  devNoAuth: boolean,
): string {
  if (explicitSecret !== null) {
    return explicitSecret;
  }
  if (rwToken.length > 0) {
    return createHmac("sha256", COOKIE_SECRET_HMAC_DOMAIN)
      .update(rwToken)
      .digest("hex");
  }
  if (devNoAuth) {
    return randomBytes(32).toString("hex");
  }
  throw new Error("Cannot derive cookieSecret without WEB_COOKIE_SECRET or WEB_RW_TOKEN");
}

export function loadServerConfig(
  env: Record<string, string | undefined> = process.env,
): ServerConfig {
  const projectRoot =
    readOptionalEnv(env, "PROJECT_ROOT") ??
    path.resolve(import.meta.dir, "../../..");

  const port = parsePort(env);
  const rawPublicUrl = readOptionalEnv(env, "WEB_PUBLIC_URL") ?? DEFAULT_WEB_PUBLIC_URL;
  const publicUrl = stripTrailingSlashes(rawPublicUrl);

  const devNoAuth = env.WEB_DEV_NO_AUTH === "1";
  const rwTokenRaw = readOptionalEnv(env, "WEB_RW_TOKEN");
  if (!devNoAuth && rwTokenRaw === null) {
    throw new Error(
      "Missing required WEB_RW_TOKEN environment variable (set WEB_DEV_NO_AUTH=1 only for local unauthenticated dev)",
    );
  }
  const rwToken = rwTokenRaw ?? "";

  const roToken = readOptionalEnv(env, "WEB_RO_TOKEN");
  if (roToken !== null && rwToken.length > 0 && roToken === rwToken) {
    throw new Error("WEB_RO_TOKEN must not equal WEB_RW_TOKEN");
  }

  const cookieSecret = deriveCookieSecret(
    readOptionalEnv(env, "WEB_COOKIE_SECRET"),
    rwToken,
    devNoAuth,
  );

  const uploadsDir = path.resolve(
    projectRoot,
    readOptionalEnv(env, "UPLOADS_DIR") ?? "data/preserved_uploads",
  );
  const secretsStoreDir = path.resolve(
    projectRoot,
    readOptionalEnv(env, "SECRETS_STORE_PATH") ?? "secrets",
  );
  const corpusMirrorDir =
    readOptionalEnv(env, "CORPUS_MIRROR_DIR") ?? "/var/lib/pimsai/corpus_mirror";
  const sessionsDir = resolveSessionsDir(env, projectRoot);
  const webDistDir = path.resolve(
    projectRoot,
    readOptionalEnv(env, "WEB_DIST_DIR") ?? "apps/web/client/dist",
  );
  const brandingPath = path.resolve(
    projectRoot,
    readOptionalEnv(env, "WEB_BRANDING_PATH") ?? "apps/web/branding.json",
  );

  return {
    projectRoot,
    port,
    publicUrl,
    rwToken,
    roToken,
    devNoAuth,
    cookieSecret,
    uploadsDir,
    secretsStoreDir,
    corpusMirrorDir,
    sessionsDir,
    webDistDir,
    brandingPath,
    agentModel: readOptionalEnv(env, "AGENT_MODEL"),
    agentEnvVar: readOptionalEnv(env, "AGENT_ENV_VAR"),
    agentApiKey: readOptionalEnv(env, "AGENT_API_KEY"),
    databaseUrl: readOptionalEnv(env, "DATABASE_URL"),
    pimsBaseUrl: readOptionalEnv(env, "PIMS_BASE_URL"),
    softRequestBudget: readSoftRequestBudget(projectRoot),
  };
}

function assertHexColor(value: string, fieldName: string): string {
  if (!HEX_COLOR_REGEX.test(value)) {
    throw new Error(
      `Invalid ${fieldName} '${value}': expected #RRGGBB hex color`,
    );
  }
  return value;
}

function assertTheme(value: string): "dark" | "light" {
  if (value === "dark" || value === "light") {
    return value;
  }
  throw new Error(
    `Invalid defaultTheme '${value}': expected 'dark' or 'light'`,
  );
}

function assertNonEmptyString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Branding config missing non-empty string field '${fieldName}'`);
  }
  return value.trim();
}

function validateStarterPrompts(raw: unknown): BrandingStarterPrompt[] {
  if (!Array.isArray(raw)) {
    throw new Error("Branding config field 'starterPrompts' must be an array");
  }
  return raw.map((item, idx) => {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      throw new Error(`Branding starterPrompts[${idx}] must be an object`);
    }
    const record = item as Record<string, unknown>;
    const rawClause =
      typeof record.clause === "string" && record.clause.trim().length > 0
        ? record.clause.trim()
        : typeof record.badge === "string" && record.badge.trim().length > 0
          ? record.badge.trim()
          : null;
    if (rawClause === null) {
      throw new Error(
        `Branding config missing non-empty string field 'starterPrompts[${idx}].clause' (or 'badge')`,
      );
    }
    const id =
      typeof record.id === "string" && record.id.trim().length > 0
        ? record.id.trim()
        : undefined;
    const badge =
      typeof record.badge === "string" && record.badge.trim().length > 0
        ? record.badge.trim()
        : rawClause;
    const description =
      typeof record.description === "string" && record.description.trim().length > 0
        ? record.description.trim()
        : undefined;
    return {
      ...(id !== undefined ? { id } : {}),
      title: assertNonEmptyString(record.title, `starterPrompts[${idx}].title`),
      clause: rawClause,
      badge,
      ...(description !== undefined ? { description } : {}),
      prompt: assertNonEmptyString(record.prompt, `starterPrompts[${idx}].prompt`),
    };
  });
}

export function loadBrandingConfig(
  config: Pick<ServerConfig, "brandingPath">,
  env: Record<string, string | undefined> = process.env,
): BrandingConfig {
  if (!existsSync(config.brandingPath)) {
    throw new Error(`Branding config file not found at '${config.brandingPath}'`);
  }

  let rawJson: unknown;
  try {
    rawJson = JSON.parse(readFileSync(config.brandingPath, "utf8"));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse branding config at '${config.brandingPath}': ${msg}`);
  }

  if (typeof rawJson !== "object" || rawJson === null || Array.isArray(rawJson)) {
    throw new Error(`Branding config at '${config.brandingPath}' must be a JSON object`);
  }

  const record = rawJson as Record<string, unknown>;
  const appName =
    readOptionalEnv(env, "WEB_APP_NAME") ??
    assertNonEmptyString(record.appName, "appName");
  const subtitle =
    readOptionalEnv(env, "WEB_APP_SUBTITLE") ??
    assertNonEmptyString(record.subtitle, "subtitle");
  const shortBadge = assertNonEmptyString(record.shortBadge, "shortBadge");

  const primaryColor = assertHexColor(
    readOptionalEnv(env, "WEB_PRIMARY_COLOR") ??
      assertNonEmptyString(record.primaryColor, "primaryColor"),
    "primaryColor",
  );
  const accentColor = assertHexColor(
    readOptionalEnv(env, "WEB_ACCENT_COLOR") ??
      assertNonEmptyString(record.accentColor, "accentColor"),
    "accentColor",
  );
  const defaultTheme = assertTheme(
    readOptionalEnv(env, "WEB_DEFAULT_THEME") ??
      assertNonEmptyString(record.defaultTheme, "defaultTheme"),
  );
  const starterPrompts = validateStarterPrompts(record.starterPrompts);

  return {
    appName,
    subtitle,
    shortBadge,
    primaryColor,
    accentColor,
    defaultTheme,
    starterPrompts,
  };
}
