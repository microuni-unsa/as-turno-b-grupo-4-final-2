/**
 * Authentication module for GESTITEL PIMS.
 *
 * SPEC §3.1:
 * POST /business/login/ {username, password} -> {access, refresh} JWT
 * Refresh flow via POST /business/token/refresh/
 *
 * Implements:
 * - Persistent multi-tenant disk JWT cache keyed by `${baseUrl}|${schema}|${username}`
 *   with atomic temp-file writes and mode 0o600 permissions.
 * - Local JWT `exp` decoding and skew-aware reuse/refresh.
 * - Deterministic HTTP 429 Retry-After / DRF body backoff & bounded retries.
 * - Explicit `status: 0` and `endpoint` on network refusals.
 *
 * CRITICAL SECURITY REQUIREMENT:
 * Credentials and JWT tokens must NEVER be hardcoded, printed, or logged.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { PIMS_CONFIG } from "./config.ts";
import { PimsAuthError } from "./errors.ts";
import type {
  PimsAdapterConfig,
  PimsAuthTokens,
  PimsCredentials,
} from "./types.ts";

export interface CachedTokenEntry {
  access: string;
  refresh: string;
  baseUrl: string;
  username: string;
  schema: string;
  cachedAt: string;
}

type TokenCacheMap = Record<string, CachedTokenEntry>;

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
 * Locally decodes a JWT payload (middle segment via base64url) and returns numeric `exp`.
 * Returns `null` explicitly if the token format, base64url encoding, JSON payload, or `exp` claim is invalid.
 */
export function decodeJwtExp(token: string): number | null {
  if (typeof token !== "string" || token.trim() === "") {
    return null;
  }

  const segments = token.split(".");
  if (segments.length !== 3) {
    return null;
  }

  const payloadSegment = segments[1];
  if (!payloadSegment || !/^[A-Za-z0-9_-]+$/.test(payloadSegment)) {
    return null;
  }

  let decodedJson: string;
  try {
    decodedJson = Buffer.from(payloadSegment, "base64url").toString("utf-8");
  } catch (err) {
    if (err instanceof Error) {
      return null;
    }
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(decodedJson);
  } catch (err) {
    if (err instanceof SyntaxError) {
      return null;
    }
    return null;
  }

  if (typeof parsed !== "object" || parsed === null || !("exp" in parsed)) {
    return null;
  }

  const exp = (parsed as { exp?: unknown }).exp;
  if (typeof exp !== "number" || !Number.isFinite(exp)) {
    return null;
  }

  return exp;
}

/**
 * Checks whether a JWT is syntactically valid and has remaining lifetime beyond `skewSeconds`.
 */
export function isJwtFresh(
  token: string,
  skewSeconds: number = PIMS_CONFIG.JWT_EXPIRY_SKEW_SECONDS,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): boolean {
  const exp = decodeJwtExp(token);
  if (exp === null) {
    return false;
  }
  return exp - nowSeconds > skewSeconds;
}

/**
 * Parses rate-limit wait duration (in seconds) from HTTP `Retry-After` header
 * or DRF Spanish/English throttle messages, capped at `MAX_RATE_LIMIT_WAIT_SECONDS`.
 */
export function parseRateLimitWaitSeconds(
  response: Response,
  bodyText: string,
  attempt: number,
): number {
  const maxWait = PIMS_CONFIG.MAX_RATE_LIMIT_WAIT_SECONDS;
  const retryAfter = response.headers.get("Retry-After");

  if (retryAfter !== null && retryAfter.trim() !== "") {
    const trimmed = retryAfter.trim();
    if (/^\d+(?:\.\d+)?$/.test(trimmed)) {
      const parsed = Number.parseFloat(trimmed);
      return Math.max(0, Math.min(parsed, maxWait));
    }

    const parsedDateMs = Date.parse(trimmed);
    if (Number.isFinite(parsedDateMs)) {
      const deltaSeconds = Math.max(
        0,
        Math.ceil((parsedDateMs - Date.now()) / 1000),
      );
      return Math.min(deltaSeconds, maxWait);
    }
  }

  const spanishMatch = /disponible\s+en\s+(\d+(?:\.\d+)?)\s+segundos?/i.exec(
    bodyText,
  );
  if (spanishMatch) {
    const parsed = Number.parseFloat(spanishMatch[1]);
    return Math.max(0, Math.min(parsed, maxWait));
  }

  const englishMatch = /available\s+in\s+(\d+(?:\.\d+)?)\s+seconds?/i.exec(
    bodyText,
  );
  if (englishMatch) {
    const parsed = Number.parseFloat(englishMatch[1]);
    return Math.max(0, Math.min(parsed, maxWait));
  }

  const fallbackMs =
    PIMS_CONFIG.DEFAULT_RETRY_BACKOFF_MS[attempt] ??
    PIMS_CONFIG.DEFAULT_RETRY_BACKOFF_MS[
      PIMS_CONFIG.DEFAULT_RETRY_BACKOFF_MS.length - 1
    ];
  return Math.max(0, Math.min(fallbackMs / 1000, maxWait));
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isValidCachedEntry(
  raw: unknown,
  expectedBaseUrl: string,
  expectedSchema: string,
  expectedUsername: string,
): raw is CachedTokenEntry {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return false;
  }
  const obj = raw as Record<string, unknown>;
  return (
    typeof obj.access === "string" &&
    obj.access.length > 0 &&
    typeof obj.refresh === "string" &&
    obj.refresh.length > 0 &&
    obj.baseUrl === expectedBaseUrl &&
    obj.schema === expectedSchema &&
    obj.username === expectedUsername &&
    typeof obj.cachedAt === "string"
  );
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

  if (typeof import.meta?.url === "string" && import.meta.url.startsWith("file:")) {
    const fileUrl = new URL(import.meta.url);
    const fileDir = path.dirname(fileUrl.pathname);
    candidatePaths.push(path.resolve(fileDir, "../../.env"));
    candidatePaths.push(path.resolve(fileDir, "../../../.env"));
  }

  if (typeof process.cwd === "function") {
    candidatePaths.push(path.resolve(process.cwd(), ".env"));
  }

  for (const envPath of candidatePaths) {
    if (!fs.existsSync(envPath)) {
      continue;
    }
    const stat = fs.statSync(envPath);
    if (!stat.isFile()) {
      continue;
    }
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
}

export class AuthManager {
  private readonly baseUrl: string;
  private readonly schema: string;
  private readonly timeoutMs: number;
  private readonly fetchFn: typeof fetch;
  private readonly sleepFn: (ms: number) => Promise<void>;
  private readonly tokenCachePath: string;

  private credentials?: PimsCredentials;
  private secretHandle?: string;
  private accessToken: string | null = null;
  private refreshTokenVal: string | null = null;
  private activeUsername: string | null = null;

  constructor(config: PimsAdapterConfig = {}) {
    this.baseUrl = (config.baseUrl ?? PIMS_CONFIG.DEFAULT_BASE_URL).replace(
      /\/+$/,
      "",
    );
    this.schema = config.schema ?? PIMS_CONFIG.DEFAULT_SCHEMA;
    this.timeoutMs = config.timeoutMs ?? PIMS_CONFIG.DEFAULT_TIMEOUT_MS;
    this.fetchFn = config.fetchFn ?? globalThis.fetch.bind(globalThis);
    this.sleepFn = config.sleepFn ?? defaultSleep;
    this.tokenCachePath =
      config.tokenCachePath ??
      (typeof process !== "undefined"
        ? process.env?.PIMS_TOKEN_CACHE_PATH
        : undefined) ??
      PIMS_CONFIG.TOKEN_CACHE_PATH;
    this.credentials = config.credentials;
    this.secretHandle = config.secretHandle;
  }

  private buildCacheKey(username: string): string {
    return `${this.baseUrl}|${this.schema}|${username}`;
  }

  private resolveUsernameOnly(): string | null {
    if (this.credentials?.username) {
      return this.credentials.username;
    }

    let envUser =
      typeof process !== "undefined" && process.env?.PIMS_USERNAME
        ? process.env.PIMS_USERNAME
        : undefined;

    if (!envUser) {
      loadEnvSilently();
      envUser =
        typeof process !== "undefined" && process.env?.PIMS_USERNAME
          ? process.env.PIMS_USERNAME
          : undefined;
    }

    if (envUser) {
      return envUser;
    }

    if (this.secretHandle && typeof process !== "undefined") {
      const handleUser = process.env?.[`SECRET_${this.secretHandle}_USER`];
      if (handleUser) {
        return handleUser;
      }
    }

    return this.activeUsername;
  }

  private readCacheMap(): { map: TokenCacheMap; corrupted: boolean } {
    if (!fs.existsSync(this.tokenCachePath)) {
      return { map: {}, corrupted: false };
    }

    let rawContent: string;
    try {
      rawContent = fs.readFileSync(this.tokenCachePath, "utf-8");
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        return { map: {}, corrupted: false };
      }
      const message = err instanceof Error ? err.message : String(err);
      throw new PimsAuthError(
        `Failed to read token cache at ${this.tokenCachePath}: ${message}`,
        "CACHE_READ_ERROR",
      );
    }

    if (rawContent.trim() === "") {
      return { map: {}, corrupted: false };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch (err) {
      if (err instanceof SyntaxError) {
        return { map: {}, corrupted: true };
      }
      const message = err instanceof Error ? err.message : String(err);
      throw new PimsAuthError(
        `Failed to parse token cache at ${this.tokenCachePath}: ${message}`,
        "CACHE_PARSE_ERROR",
      );
    }

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { map: {}, corrupted: true };
    }

    return { map: parsed as TokenCacheMap, corrupted: false };
  }

  private writeCacheMapAtomically(map: TokenCacheMap): void {
    const dir = path.dirname(this.tokenCachePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    }

    const tempPath = `${this.tokenCachePath}.tmp.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
    try {
      fs.writeFileSync(tempPath, JSON.stringify(map, null, 2), {
        encoding: "utf-8",
        mode: 0o600,
      });
      fs.chmodSync(tempPath, 0o600);
      fs.renameSync(tempPath, this.tokenCachePath);
    } catch (err) {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      const message = err instanceof Error ? err.message : String(err);
      throw new PimsAuthError(
        `Failed to write token cache atomically: ${message}`,
        "CACHE_WRITE_ERROR",
      );
    }
  }

  private persistCacheEntry(
    username: string,
    access: string,
    refresh: string,
  ): void {
    const { map } = this.readCacheMap();
    const key = this.buildCacheKey(username);
    map[key] = {
      access,
      refresh,
      baseUrl: this.baseUrl,
      username,
      schema: this.schema,
      cachedAt: new Date().toISOString(),
    };
    this.writeCacheMapAtomically(map);
  }

  private removeCacheEntry(username: string): void {
    if (!fs.existsSync(this.tokenCachePath)) {
      return;
    }
    const { map, corrupted } = this.readCacheMap();
    const key = this.buildCacheKey(username);
    if (corrupted) {
      this.writeCacheMapAtomically({});
      return;
    }
    if (key in map) {
      delete map[key];
      this.writeCacheMapAtomically(map);
    }
  }

  /**
   * Resolves credentials strictly from explicitly supplied values,
   * environment variables, or secrets handle. Never defaults to hardcoded strings.
   * Precedence: explicit credentials > config credentials > process.env > silent .env > secret handle.
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

    let envUser =
      typeof process !== "undefined" && process.env?.PIMS_USERNAME
        ? process.env.PIMS_USERNAME
        : undefined;
    let envPass =
      typeof process !== "undefined" && process.env?.PIMS_PASSWORD
        ? process.env.PIMS_PASSWORD
        : undefined;

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
   * Executes an auth POST request with bounded HTTP 429 Retry-After backoff
   * and explicit status: 0 network failure reporting.
   */
  private async postWithRateLimitRetry(
    url: string,
    payload: Record<string, string>,
    operation: "login" | "refresh",
    secretsToRedact: Array<string | undefined | null>,
  ): Promise<Response> {
    const maxRetries = PIMS_CONFIG.MAX_RATE_LIMIT_RETRIES;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      let response: Response;
      try {
        response = await this.fetchFn(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-PIMS-Schema": this.schema,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } catch (err) {
        clearTimeout(timeoutId);
        if (err instanceof PimsAuthError) {
          throw err;
        }
        const message = err instanceof Error ? err.message : String(err);
        const sanitizedMessage = sanitizeError(message, secretsToRedact);
        const reasonCode =
          operation === "login"
            ? "LOGIN_NETWORK_ERROR"
            : "REFRESH_NETWORK_ERROR";
        throw new PimsAuthError(
          `Network error during ${operation}: ${sanitizedMessage}`,
          reasonCode,
          { status: 0, endpoint: url },
        );
      }
      clearTimeout(timeoutId);

      if (response.status === 429) {
        const bodyText = await response.text();
        if (attempt < maxRetries) {
          const waitSeconds = parseRateLimitWaitSeconds(
            response,
            bodyText,
            attempt,
          );
          await this.sleepFn(waitSeconds * 1000);
          continue;
        }

        const sanitizedErr = sanitizeError(bodyText, secretsToRedact);
        const reasonCode =
          operation === "login" ? "HTTP_429" : "REFRESH_HTTP_429";
        throw new PimsAuthError(
          `PIMS ${operation} rate-limited with HTTP 429 after ${maxRetries} retries: ${sanitizedErr}`,
          reasonCode,
          { status: 429, endpoint: url },
        );
      }

      return response;
    }

    throw new PimsAuthError(
      `PIMS ${operation} exhausted retry loop unexpectedly.`,
      operation === "login" ? "HTTP_429" : "REFRESH_HTTP_429",
      { status: 429, endpoint: url },
    );
  }

  /**
   * Performs POST /business/login/
   * Returns { access, refresh } JWT pair and persists them to disk cache.
   */
  async login(explicitCredentials?: PimsCredentials): Promise<PimsAuthTokens> {
    const creds = this.resolveCredentials(explicitCredentials);
    const url = `${this.baseUrl}/business/login/`;

    const response = await this.postWithRateLimitRetry(
      url,
      { username: creds.username, password: creds.password },
      "login",
      [creds.password],
    );

    if (!response.ok) {
      const errText = await response.text();
      const sanitizedErr = sanitizeError(errText, [creds.password]);
      throw new PimsAuthError(
        `PIMS login failed with HTTP ${response.status}: ${sanitizedErr}`,
        `HTTP_${response.status}`,
        { status: response.status, endpoint: url },
      );
    }

    let data: Record<string, unknown>;
    try {
      data = (await response.json()) as Record<string, unknown>;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new PimsAuthError(
        `Malformed JSON from /business/login/: ${sanitizeError(msg, [creds.password])}`,
        "INVALID_TOKEN_RESPONSE",
        { status: response.status, endpoint: url },
      );
    }

    if (
      typeof data.access !== "string" ||
      typeof data.refresh !== "string" ||
      !data.access ||
      !data.refresh
    ) {
      throw new PimsAuthError(
        "Malformed response from /business/login/: missing access or refresh token",
        "INVALID_TOKEN_RESPONSE",
        { status: response.status, endpoint: url },
      );
    }

    this.accessToken = data.access;
    this.refreshTokenVal = data.refresh;
    this.activeUsername = creds.username;
    this.persistCacheEntry(creds.username, data.access, data.refresh);

    return {
      access: this.accessToken,
      refresh: this.refreshTokenVal,
    };
  }

  /**
   * Performs refresh flow: POST /business/token/refresh/ with { refresh }
   * Returns newly minted access token string and updates disk cache if username is known.
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
    const response = await this.postWithRateLimitRetry(
      url,
      { refresh },
      "refresh",
      [refresh, this.accessToken],
    );

    if (!response.ok) {
      const errText = await response.text();
      const activeToken = this.accessToken;
      this.accessToken = null;
      this.refreshTokenVal = null;
      const sanitizedErr = sanitizeError(errText, [refresh, activeToken]);
      throw new PimsAuthError(
        `Token refresh failed with HTTP ${response.status}: ${sanitizedErr}`,
        `REFRESH_HTTP_${response.status}`,
        { status: response.status, endpoint: url },
      );
    }

    let data: Record<string, unknown>;
    try {
      data = (await response.json()) as Record<string, unknown>;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new PimsAuthError(
        `Malformed JSON from /business/token/refresh/: ${sanitizeError(msg, [refresh, this.accessToken])}`,
        "INVALID_REFRESH_RESPONSE",
        { status: response.status, endpoint: url },
      );
    }

    if (typeof data.access !== "string" || !data.access) {
      throw new PimsAuthError(
        "Malformed response from /business/token/refresh/: missing access token",
        "INVALID_REFRESH_RESPONSE",
        { status: response.status, endpoint: url },
      );
    }

    this.accessToken = data.access;
    if (typeof data.refresh === "string" && data.refresh) {
      this.refreshTokenVal = data.refresh;
    } else if (tokenToUse) {
      this.refreshTokenVal = tokenToUse;
    }

    const username = this.resolveUsernameOnly();
    if (username && this.refreshTokenVal) {
      this.persistCacheEntry(username, this.accessToken, this.refreshTokenVal);
    }

    return this.accessToken;
  }

  /**
   * Returns a valid access token:
   * 1. Reuse in-memory access token if JWT `exp - now > JWT_EXPIRY_SKEW_SECONDS`.
   * 2. Attempt in-memory refresh token if available.
   * 3. Check persistent disk cache for `${baseUrl}|${schema}|${username}`; reuse if fresh,
   *    refresh if expired, or reject corrupted entries.
   * 4. Perform full POST /business/login/ only if no valid refresh works.
   */
  async getValidAccessToken(): Promise<string> {
    if (this.accessToken !== null) {
      if (isJwtFresh(this.accessToken)) {
        return this.accessToken;
      }
      this.accessToken = null;
    }

    const username = this.resolveUsernameOnly();

    if (this.refreshTokenVal !== null) {
      try {
        return await this.refreshToken(this.refreshTokenVal);
      } catch (err) {
        if (
          err instanceof PimsAuthError &&
          (err.status === 429 || err.status === 0)
        ) {
          throw err;
        }
        this.refreshTokenVal = null;
        if (username !== null) {
          this.removeCacheEntry(username);
        }
      }
    }

    if (username !== null) {
      const cacheKey = this.buildCacheKey(username);
      const { map, corrupted } = this.readCacheMap();
      if (corrupted) {
        this.writeCacheMapAtomically({});
      } else {
        const entry = map[cacheKey];
        if (entry !== undefined) {
          if (
            !isValidCachedEntry(entry, this.baseUrl, this.schema, username) ||
            decodeJwtExp(entry.access) === null
          ) {
            this.removeCacheEntry(username);
          } else if (isJwtFresh(entry.access)) {
            this.accessToken = entry.access;
            this.refreshTokenVal = entry.refresh;
            this.activeUsername = username;
            return entry.access;
          } else {
            this.activeUsername = username;
            this.refreshTokenVal = entry.refresh;
            try {
              return await this.refreshToken(entry.refresh);
            } catch (err) {
              if (
                err instanceof PimsAuthError &&
                (err.status === 429 || err.status === 0)
              ) {
                throw err;
              }
              this.removeCacheEntry(username);
            }
          }
        }
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
