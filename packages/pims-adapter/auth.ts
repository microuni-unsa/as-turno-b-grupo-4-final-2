/**
 * Authentication module for GESTITEL PIMS.
 *
 * SPEC §3.1:
 * POST /business/login/ {username, password} -> {access, refresh} JWT
 * Refresh flow via POST /business/token/refresh/
 *
 * CRITICAL SECURITY REQUIREMENT:
 * Credentials must NEVER be hardcoded. They are loaded strictly from environment
 * variables (PIMS_USERNAME, PIMS_PASSWORD) or secrets handles.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { PIMS_CONFIG } from "./config.ts";
import { PimsAuthError, PimsReadFailureError } from "./errors.ts";
import type {
  PimsAdapterConfig,
  PimsAuthTokens,
  PimsCredentials,
} from "./types.ts";

/**
 * Sanitizes an error message or string so that sensitive tokens or passwords
 * are never leaked into errors, logs, or exception traces.
 */
function sanitizeError(
  message: string,
  secrets: Array<string | undefined | null>,
): string {
  let sanitized = message;
  for (const s of secrets) {
    if (s && typeof s === "string" && s.trim().length > 0) {
      sanitized = sanitized.replaceAll(s, "[REDACTED]");
    }
  }
  return sanitized;
}

/**
 * Quietly loads the repo-root .env file into process.env without producing any
 * stdout/stderr or logging credentials or tokens.
 * Only sets variables in process.env that are currently undefined.
 */
export function loadEnvSilently(): void {
  if (typeof process === "undefined" || !process.env) {
    return;
  }

  const candidatePaths: string[] = [];

  try {
    if (typeof import.meta !== "undefined" && import.meta.url) {
      const fileUrl = new URL(import.meta.url);
      const fileDir = path.dirname(fileUrl.pathname);
      candidatePaths.push(path.resolve(fileDir, "../../.env"));
      candidatePaths.push(path.resolve(fileDir, "../../../.env"));
    }
  } catch {
    // Ignore
  }

  try {
    candidatePaths.push(path.resolve(process.cwd(), ".env"));
  } catch {
    // Ignore
  }

  for (const envPath of candidatePaths) {
    try {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        const lines = content.split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;

          const eqIdx = trimmed.indexOf("=");
          if (eqIdx === -1) continue;

          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();

          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }

          if (process.env[key] === undefined) {
            process.env[key] = val;
          }
        }
        break;
      }
    } catch {
      // Quietly ignore
    }
  }
}

export class AuthManager {
  private readonly baseUrl: string;
  private readonly schema: string;
  private readonly timeoutMs: number;
  private readonly fetchFn: typeof fetch;

  private credentials?: PimsCredentials;
  private secretHandle?: string;
  private accessToken: string | null = null;
  private refreshTokenVal: string | null = null;

  constructor(config: PimsAdapterConfig = {}) {
    this.baseUrl = (config.baseUrl ?? PIMS_CONFIG.DEFAULT_BASE_URL).replace(
      /\/+$/,
      "",
    );
    this.schema = config.schema ?? PIMS_CONFIG.DEFAULT_SCHEMA;
    this.timeoutMs = config.timeoutMs ?? PIMS_CONFIG.DEFAULT_TIMEOUT_MS;
    this.fetchFn = config.fetchFn ?? globalThis.fetch.bind(globalThis);
    this.credentials = config.credentials;
    this.secretHandle = config.secretHandle;
  }

  /**
   * Resolves credentials strictly from explicitly supplied values,
   * environment variables, or secrets handle. Never defaults to hardcoded strings.
   * Precedence: explicit credentials > config credentials > process.env > silent .env fallback > secret handle.
   */
  private resolveCredentials(
    explicitCredentials?: PimsCredentials,
  ): PimsCredentials {
    if (explicitCredentials?.username && explicitCredentials?.password) {
      return explicitCredentials;
    }

    if (this.credentials?.username && this.credentials?.password) {
      return this.credentials;
    }

    // Attempt resolution from environment variables (process.env)
    let envUser =
      typeof process !== "undefined" && process.env?.PIMS_USERNAME
        ? process.env.PIMS_USERNAME
        : undefined;
    let envPass =
      typeof process !== "undefined" && process.env?.PIMS_PASSWORD
        ? process.env.PIMS_PASSWORD
        : undefined;

    // Silent .env fallback if unset in process.env
    if (!envUser || !envPass) {
      loadEnvSilently();
      envUser =
        typeof process !== "undefined" && process.env?.PIMS_USERNAME
          ? process.env.PIMS_USERNAME
          : undefined;
      envPass =
        typeof process !== "undefined" && process.env?.PIMS_PASSWORD
          ? process.env.PIMS_PASSWORD
          : undefined;
    }

    if (envUser && envPass) {
      return { username: envUser, password: envPass };
    }

    if (this.secretHandle) {
      // Secret handle resolution is wired through environment injection per SPEC §4.3
      const handleUser =
        typeof process !== "undefined" &&
        process.env?.[`SECRET_${this.secretHandle}_USER`]
          ? process.env[`SECRET_${this.secretHandle}_USER`]
          : undefined;
      const handlePass =
        typeof process !== "undefined" &&
        process.env?.[`SECRET_${this.secretHandle}_PASS`]
          ? process.env[`SECRET_${this.secretHandle}_PASS`]
          : undefined;
      if (handleUser && handlePass) {
        return { username: handleUser, password: handlePass };
      }
    }

    throw new PimsAuthError(
      "No PIMS credentials available. Credentials must be provided via PIMS_USERNAME & PIMS_PASSWORD environment variables, secrets handle, or explicitly supplied.",
      "NO_CREDENTIALS_FOUND",
    );
  }

  /**
   * Performs POST /business/login/
   * Returns { access, refresh } JWT pair and caches them locally.
   */
  async login(explicitCredentials?: PimsCredentials): Promise<PimsAuthTokens> {
    const creds = this.resolveCredentials(explicitCredentials);

    const url = `${this.baseUrl}/business/login/`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchFn(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-PIMS-Schema": this.schema,
        },
        body: JSON.stringify({
          username: creds.username,
          password: creds.password,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errText = await response.text();
        const sanitizedErr = sanitizeError(errText, [creds.password]);
        throw new PimsAuthError(
          `PIMS login failed with HTTP ${response.status}: ${sanitizedErr}`,
          `HTTP_${response.status}`,
        );
      }

      const data = (await response.json()) as Record<string, unknown>;
      if (
        typeof data.access !== "string" ||
        typeof data.refresh !== "string" ||
        !data.access ||
        !data.refresh
      ) {
        throw new PimsAuthError(
          "Malformed response from /business/login/: missing access or refresh token",
          "INVALID_TOKEN_RESPONSE",
        );
      }

      this.accessToken = data.access;
      this.refreshTokenVal = data.refresh;

      return {
        access: this.accessToken,
        refresh: this.refreshTokenVal,
      };
    } catch (err) {
      if (err instanceof PimsAuthError) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      const sanitizedMessage = sanitizeError(message, [creds.password]);
      throw new PimsAuthError(
        `Network error during login: ${sanitizedMessage}`,
        "LOGIN_NETWORK_ERROR",
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Performs refresh flow: POST /business/token/refresh/ with { refresh }
   * Returns newly minted access token string.
   */
  async refreshToken(tokenToUse?: string): Promise<string> {
    const refresh = tokenToUse ?? this.refreshTokenVal;
    if (!refresh) {
      throw new PimsAuthError(
        "Cannot refresh token: no refresh token available.",
        "MISSING_REFRESH_TOKEN",
      );
    }

    const url = `${this.baseUrl}/business/token/refresh/`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchFn(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-PIMS-Schema": this.schema,
        },
        body: JSON.stringify({ refresh }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errText = await response.text();
        const activeToken = this.accessToken;
        this.accessToken = null;
        this.refreshTokenVal = null;
        const sanitizedErr = sanitizeError(errText, [refresh, activeToken]);
        throw new PimsAuthError(
          `Token refresh failed with HTTP ${response.status}: ${sanitizedErr}`,
          `REFRESH_HTTP_${response.status}`,
        );
      }

      const data = (await response.json()) as Record<string, unknown>;
      if (typeof data.access !== "string" || !data.access) {
        throw new PimsAuthError(
          "Malformed response from /business/token/refresh/: missing access token",
          "INVALID_REFRESH_RESPONSE",
        );
      }

      this.accessToken = data.access;
      if (typeof data.refresh === "string" && data.refresh) {
        this.refreshTokenVal = data.refresh;
      }

      return this.accessToken;
    } catch (err) {
      if (err instanceof PimsAuthError) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      const sanitizedMessage = sanitizeError(message, [
        refresh,
        this.accessToken ?? undefined,
      ]);
      throw new PimsAuthError(
        `Network error during token refresh: ${sanitizedMessage}`,
        "REFRESH_NETWORK_ERROR",
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Returns an active access token, refreshing if necessary or executing initial login.
   */
  async getValidAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    if (this.refreshTokenVal) {
      try {
        return await this.refreshToken();
      } catch {
        // Fall back to login
      }
    }

    const tokens = await this.login();
    return tokens.access;
  }

  /**
   * Explicitly sets token values (e.g. from fixtures or test mocks).
   */
  setTokens(access: string, refresh?: string): void {
    this.accessToken = access;
    if (refresh !== undefined) {
      this.refreshTokenVal = refresh;
    }
  }

  getTokens(): { access: string | null; refresh: string | null } {
    return {
      access: this.accessToken,
      refresh: this.refreshTokenVal,
    };
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshTokenVal = null;
  }
}
