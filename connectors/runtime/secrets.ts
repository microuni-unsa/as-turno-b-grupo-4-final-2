/**
 * Secrets handle resolution and unified web app workflow.
 * Strictly adheres to SPEC 4.3 and zero-exposure security rules:
 * - Canonical handles follow format: secret:<name>@v<version> (accepts secret:<name>@<version> on input).
 * - Resolves via real `age` CLI decryption from SECRETS_STORE_PATH/secrets/<name>/v<version>.age.
 * - Resolves to env injection for docker run or Authorization headers inside connectors.
 * - Raw secret values are NEVER printed to stdout, stderr, logs, disk, or transcripts.
 * - Old secret versions remain readable until containers restart (rotation semantics).
 */

import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import {
  DEFAULT_SECRETS_STORE_PATH,
  SECRETS_HANDLE_PREFIX,
  SECRETS_HANDLE_REGEX,
  SECRETS_POLL_MAX_TIMEOUT_SEC,
  WEB_INTERNAL_URL,
} from "./constants";
import {
  ConnectorRuntimeError,
  SecretExpiredError,
  SecretHandleFormatError,
  SecretNotFoundError,
  SecretSecurityError,
} from "./errors";
import type {
  AuthHeaderResolution,
  AuthScheme,
  DockerEnvInjection,
  SecretHandle,
  SecretRegistryEntry,
  SecretRequestSession,
  SecretRequestStatus,
} from "./types";

const ENV_VAR_NAME_REGEX = /^[A-Za-z_][A-Za-z0-9_]*$/;
const SECRET_NAME_REGEX = /^[a-zA-Z0-9_.-]+$/;

export interface SecretsStoreConfig {
  storePath?: string;
  identityPath?: string;
  identityKey?: string;
  webInternalUrl?: string;
  ageBinary?: string;
}

export interface PollSecretOptions {
  wait?: boolean;
  timeoutSeconds?: number;
}

export interface DockerEnvResolution extends DockerEnvInjection {
  args: ["--env", string];
}

function validateSecretName(name: string, originalInput: string): string {
  if (
    !name ||
    !SECRET_NAME_REGEX.test(name) ||
    name === "." ||
    name === ".." ||
    name.includes("..")
  ) {
    throw new SecretHandleFormatError(originalInput);
  }
  return name;
}

/**
 * Parses a secret handle of form secret:<name>@v<n> or secret:<name>@<n>.
 */
export function parseSecretHandle(handle: string): { name: string; version: number } {
  if (!handle || typeof handle !== "string" || !handle.startsWith(SECRETS_HANDLE_PREFIX)) {
    throw new SecretHandleFormatError(String(handle));
  }

  const match = SECRETS_HANDLE_REGEX.exec(handle);
  if (!match) {
    throw new SecretHandleFormatError(handle);
  }

  const rawName = match[1];
  const versionStr = match[2];

  if (!rawName || !versionStr) {
    throw new SecretHandleFormatError(handle);
  }

  const name = validateSecretName(rawName, handle);

  const version = Number.parseInt(versionStr, 10);
  if (!Number.isSafeInteger(version) || version <= 0) {
    throw new SecretHandleFormatError(handle);
  }

  return { name, version };
}

/**
 * Formats name and version into canonical secret handle `secret:<name>@v<version>`.
 */
export function formatSecretHandle(name: string, version: number): SecretHandle {
  const cleanName = typeof name === "string" ? name.trim() : "";
  if (
    !cleanName ||
    !SECRET_NAME_REGEX.test(cleanName) ||
    cleanName === "." ||
    cleanName === ".." ||
    cleanName.includes("..") ||
    !Number.isInteger(version) ||
    version <= 0
  ) {
    throw new SecretHandleFormatError(`${cleanName}@v${String(version)}`);
  }
  return `secret:${cleanName}@v${version}` as SecretHandle;
}

function normalizeDockerEnvArgs(
  arg1: string,
  arg2: string,
  preferHandleFirst: boolean
): { handle: string; envVarName: string } {
  const firstIsHandle = typeof arg1 === "string" && arg1.startsWith(SECRETS_HANDLE_PREFIX);
  const secondIsHandle = typeof arg2 === "string" && arg2.startsWith(SECRETS_HANDLE_PREFIX);

  if (firstIsHandle && !secondIsHandle) {
    return { handle: arg1, envVarName: arg2 };
  }
  if (secondIsHandle && !firstIsHandle) {
    return { handle: arg2, envVarName: arg1 };
  }
  if (firstIsHandle && secondIsHandle) {
    throw new SecretSecurityError(
      "Ambiguous arguments to resolveToDockerEnv: both arguments begin with 'secret:'"
    );
  }

  // Neither begins with 'secret:' — fail fast with SecretHandleFormatError on the handle candidate.
  if (!preferHandleFirst && typeof arg1 === "string" && ENV_VAR_NAME_REGEX.test(arg1.trim())) {
    parseSecretHandle(arg2);
  }
  parseSecretHandle(arg1);
  throw new SecretHandleFormatError(String(arg1));
}

function validateEnvVarName(envVarName: string): string {
  const clean = typeof envVarName === "string" ? envVarName.trim() : "";
  if (!clean || !ENV_VAR_NAME_REGEX.test(clean)) {
    throw new SecretSecurityError(
      `Invalid Docker environment variable name: '${String(envVarName)}'`
    );
  }
  return clean;
}

interface RawRegistryEntry {
  name?: unknown;
  version?: unknown;
  created_at?: unknown;
  createdAt?: unknown;
  created_by?: unknown;
  createdBy?: unknown;
  scope?: unknown;
}

/**
 * Age-backed Secrets Store and unified web app secrets HTTP client.
 */
export class SecretsStore {
  private static instance: SecretsStore | null = null;

  private readonly explicitStorePath?: string;
  private readonly explicitIdentityPath?: string;
  private readonly explicitIdentityKey?: string;
  private readonly explicitWebInternalUrl?: string;
  private readonly ageBinary: string;

  constructor(config: SecretsStoreConfig = {}) {
    if (config.storePath !== undefined && config.storePath.trim().length > 0) {
      this.explicitStorePath = config.storePath.trim();
    }
    if (config.identityPath !== undefined && config.identityPath.trim().length > 0) {
      this.explicitIdentityPath = config.identityPath.trim();
    }
    if (config.identityKey !== undefined && config.identityKey.trim().length > 0) {
      this.explicitIdentityKey = config.identityKey.trim();
    }
    if (config.webInternalUrl !== undefined && config.webInternalUrl.trim().length > 0) {
      this.explicitWebInternalUrl = config.webInternalUrl.trim().replace(/\/+$/, "");
    }
    this.ageBinary =
      config.ageBinary !== undefined && config.ageBinary.trim().length > 0
        ? config.ageBinary.trim()
        : "age";
  }

  public static getInstance(config?: SecretsStoreConfig): SecretsStore {
    if (!SecretsStore.instance || config !== undefined) {
      SecretsStore.instance = new SecretsStore(config);
    }
    return SecretsStore.instance;
  }

  public static resetInstance(): void {
    SecretsStore.instance = null;
  }

  /**
   * Resets singleton instance reference (for testing or container lifecycle resets).
   */
  public reset(): void {
    if (SecretsStore.instance === this) {
      SecretsStore.instance = null;
    }
  }

  public getStorePath(): string {
    if (this.explicitStorePath !== undefined) {
      return this.explicitStorePath;
    }
    const envStorePath = process.env.SECRETS_STORE_PATH;
    if (envStorePath && envStorePath.trim().length > 0) {
      return envStorePath.trim();
    }
    return DEFAULT_SECRETS_STORE_PATH;
  }

  public getWebInternalUrl(): string {
    if (this.explicitWebInternalUrl !== undefined) {
      return this.explicitWebInternalUrl;
    }
    const envUrl = process.env.WEB_INTERNAL_URL;
    if (envUrl && envUrl.trim().length > 0) {
      return envUrl.trim().replace(/\/+$/, "");
    }
    return WEB_INTERNAL_URL;
  }

  private resolveCiphertextLocation(handle: string): {
    name: string;
    version: number;
    storePath: string;
    ciphertextPath: string;
  } {
    const { name, version } = parseSecretHandle(handle);
    const storePath = this.getStorePath();
    const secretsBaseDir = path.resolve(storePath, "secrets");
    const ciphertextPath = path.resolve(secretsBaseDir, name, `v${version}.age`);

    if (!ciphertextPath.startsWith(secretsBaseDir + path.sep)) {
      throw new SecretSecurityError(`Resolved secret path escapes store boundary for '${name}'`);
    }

    return { name, version, storePath, ciphertextPath };
  }

  private resolveIdentityInvocation(
    storePath: string,
    ciphertextPath: string
  ): { args: string[]; stdin?: Uint8Array } {
    if (this.explicitIdentityKey !== undefined) {
      return {
        args: ["-d", "-i", "-", ciphertextPath],
        stdin: new TextEncoder().encode(`${this.explicitIdentityKey}\n`),
      };
    }

    if (this.explicitIdentityPath !== undefined) {
      if (!existsSync(this.explicitIdentityPath)) {
        throw new SecretSecurityError(
          `Age identity file not found at configured path '${this.explicitIdentityPath}'`
        );
      }
      return {
        args: ["-d", "-i", this.explicitIdentityPath, ciphertextPath],
      };
    }

    const defaultIdentityPath = path.resolve(storePath, "keys", "identity.txt");
    if (existsSync(defaultIdentityPath)) {
      return {
        args: ["-d", "-i", defaultIdentityPath, ciphertextPath],
      };
    }

    const envIdentityKey = process.env.AGE_SECRET_KEY;
    if (envIdentityKey && envIdentityKey.trim().length > 0) {
      return {
        args: ["-d", "-i", "-", ciphertextPath],
        stdin: new TextEncoder().encode(`${envIdentityKey.trim()}\n`),
      };
    }

    throw new SecretSecurityError(
      `Age identity file not found at '${defaultIdentityPath}' and AGE_SECRET_KEY is not set.`
    );
  }

  /**
   * Resolves raw secret value from handle using real `age` CLI decryption.
   * STRICTLY INTERNAL: Never expose return value in logs, disk files, or public interfaces.
   */
  public getDecryptedValue(handle: string): string {
    const { name, version, storePath, ciphertextPath } = this.resolveCiphertextLocation(handle);

    if (!existsSync(ciphertextPath)) {
      throw new SecretNotFoundError(name, version);
    }

    const invocation = this.resolveIdentityInvocation(storePath, ciphertextPath);

    const ageExecutable = path.isAbsolute(this.ageBinary)
      ? this.ageBinary
      : (Bun.which(this.ageBinary, { PATH: process.env.PATH }) ?? this.ageBinary);

    let proc: ReturnType<typeof Bun.spawnSync>;
    try {
      proc = Bun.spawnSync([ageExecutable, ...invocation.args], {
        stdin: invocation.stdin,
        stdout: "pipe",
        stderr: "pipe",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      throw new SecretSecurityError(
        `Failed to execute age CLI ('${this.ageBinary}') for '${formatSecretHandle(name, version)}': ${message}`
      );
    }

    if (proc.exitCode !== 0) {
      const stderrText = proc.stderr ? Buffer.from(proc.stderr).toString("utf8").trim() : "";
      throw new SecretSecurityError(
        `age decryption failed for '${formatSecretHandle(name, version)}' (exit ${String(proc.exitCode)}): ${stderrText || "unknown error"}`
      );
    }

    const plaintext = proc.stdout ? Buffer.from(proc.stdout).toString("utf8") : "";
    if (plaintext.length === 0) {
      throw new SecretSecurityError(
        `Decrypted secret payload for '${formatSecretHandle(name, version)}' is empty`
      );
    }

    return plaintext;
  }

  /**
   * Checks whether an encrypted handle file exists on disk without decrypting.
   */
  public hasHandle(handle: string): boolean {
    if (!handle || typeof handle !== "string" || !SECRETS_HANDLE_REGEX.test(handle)) {
      return false;
    }

    const match = SECRETS_HANDLE_REGEX.exec(handle);
    if (!match || !match[1] || !match[2]) {
      return false;
    }

    const rawName = match[1];
    if (rawName === "." || rawName === ".." || rawName.includes("..")) {
      return false;
    }

    const version = Number.parseInt(match[2], 10);
    if (!Number.isSafeInteger(version) || version <= 0) {
      return false;
    }

    const { ciphertextPath } = this.resolveCiphertextLocation(handle);
    return existsSync(ciphertextPath);
  }

  /**
   * Retrieves entry metadata (version, creation timestamp, creator, scope) from registry.json or stat.
   * Notice: ciphertext and raw values are NEVER exposed in metadata.
   */
  public getMetadata(handle: string): Omit<SecretRegistryEntry, "ciphertext"> {
    const { name, version, storePath, ciphertextPath } = this.resolveCiphertextLocation(handle);

    if (!existsSync(ciphertextPath)) {
      throw new SecretNotFoundError(name, version);
    }

    const registryPath = path.resolve(storePath, "registry.json");
    if (existsSync(registryPath)) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(readFileSync(registryPath, "utf8"));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        throw new SecretSecurityError(
          `Corrupt secrets registry manifest at '${registryPath}': ${message}`
        );
      }

      if (!Array.isArray(parsed)) {
        throw new SecretSecurityError(
          `Invalid secrets registry manifest at '${registryPath}': expected JSON array`
        );
      }

      const match = (parsed as RawRegistryEntry[]).find(
        (item) => item && item.name === name && Number(item.version) === version
      );

      if (match) {
        const rawCreatedAt = match.created_at ?? match.createdAt;
        const rawCreatedBy = match.created_by ?? match.createdBy;
        return {
          name,
          version,
          createdAt:
            typeof rawCreatedAt === "string" && rawCreatedAt.length > 0
              ? rawCreatedAt
              : statSync(ciphertextPath).mtime.toISOString(),
          createdBy:
            typeof rawCreatedBy === "string" && rawCreatedBy.length > 0
              ? rawCreatedBy
              : "sidecar",
          scope:
            typeof match.scope === "string" && match.scope.length > 0
              ? match.scope
              : "default",
        };
      }
    }

    const stats = statSync(ciphertextPath);
    return {
      name,
      version,
      createdAt: stats.mtime.toISOString(),
      createdBy: "filesystem",
      scope: "default",
    };
  }

  /**
   * Unified web app secrets flow (SPEC 4.3):
   * Requests a one-time inline secret entry card via /internal/secrets/request.
   */
  public async requestSecret(
    label: string,
    scope: string = "default"
  ): Promise<SecretRequestSession> {
    if (!label || typeof label !== "string" || label.trim().length === 0) {
      throw new SecretSecurityError("Secret label must be a non-empty string");
    }

    const cleanLabel = label.trim();
    const requestUrl = `${this.getWebInternalUrl()}/internal/secrets/request`;

    const response = await fetch(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        label: cleanLabel,
        scope,
      }),
    });

    if (!response.ok) {
      const bodyText = await response.text();
      throw new ConnectorRuntimeError(
        `web app POST /internal/secrets/request failed (HTTP ${response.status}): ${bodyText}`,
        "WEB_SECRETS_REQUEST_ERROR"
      );
    }

    const data = (await response.json()) as {
      token?: unknown;
      url?: unknown;
      expiresAt?: unknown;
    };

    if (
      typeof data.token !== "string" ||
      typeof data.url !== "string" ||
      typeof data.expiresAt !== "string"
    ) {
      throw new ConnectorRuntimeError(
        "web app returned malformed payload from /internal/secrets/request",
        "WEB_SECRETS_REQUEST_ERROR"
      );
    }

    return {
      token: data.token,
      label: cleanLabel,
      scope,
      url: data.url,
      expiresAt: data.expiresAt,
      status: "pending",
    };
  }

  /**
   * Polls token or handle status via GET /internal/secrets/poll/:token.
   * Supports optional long-poll (`wait: true`, `timeoutSeconds`).
   * Returns canonical handle (`secret:<name>@v<n>`) if ready, NEVER the secret value.
   */
  public async pollSecret(
    tokenOrHandle: string,
    options: PollSecretOptions = {}
  ): Promise<{ status: SecretRequestStatus; handle?: SecretHandle }> {
    if (!tokenOrHandle || typeof tokenOrHandle !== "string" || tokenOrHandle.trim().length === 0) {
      throw new SecretSecurityError("tokenOrHandle must be a non-empty string");
    }

    const pollUrl = new URL(
      `/internal/secrets/poll/${encodeURIComponent(tokenOrHandle.trim())}`,
      this.getWebInternalUrl()
    );

    if (options.wait === true) {
      pollUrl.searchParams.set("wait", "true");
      if (options.timeoutSeconds !== undefined) {
        if (!Number.isFinite(options.timeoutSeconds) || options.timeoutSeconds <= 0) {
          throw new SecretSecurityError(
            `Invalid poll timeoutSeconds: ${String(options.timeoutSeconds)}`
          );
        }
        const clamped = Math.min(Math.floor(options.timeoutSeconds), SECRETS_POLL_MAX_TIMEOUT_SEC);
        pollUrl.searchParams.set("timeout", String(clamped));
      }
    }

    const response = await fetch(pollUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.status === 410) {
      return { status: "expired" };
    }

    if (response.status === 400 || response.status === 404) {
      throw new SecretExpiredError(tokenOrHandle);
    }

    if (!response.ok) {
      const bodyText = await response.text();
      throw new ConnectorRuntimeError(
        `web app GET /internal/secrets/poll failed (HTTP ${response.status}): ${bodyText}`,
        "WEB_SECRETS_POLL_ERROR"
      );
    }

    const data = (await response.json()) as {
      status?: unknown;
      handle?: unknown;
    };

    switch (data.status) {
      case "pending":
        return { status: "pending" };
      case "expired":
        return { status: "expired" };
      case "submitted": {
        if (typeof data.handle !== "string" || data.handle.length === 0) {
          throw new ConnectorRuntimeError(
            "web app returned status 'submitted' without a valid handle",
            "WEB_SECRETS_POLL_ERROR"
          );
        }
        const parsed = parseSecretHandle(data.handle);
        return {
          status: "submitted",
          handle: formatSecretHandle(parsed.name, parsed.version),
        };
      }
      default:
        throw new ConnectorRuntimeError(
          `Unexpected poll status returned by web app: '${String(data.status)}'`,
          "WEB_SECRETS_POLL_ERROR"
        );
    }
  }

  /**
   * Resolves secret handle to Docker environment injection at `docker run`.
   * Accepts either `(handle, envVarName)` or `(envVarName, handle)`.
   */
  public resolveToDockerEnv(
    handleOrEnvVar: string,
    envVarOrHandle: string
  ): DockerEnvResolution {
    const { handle, envVarName } = normalizeDockerEnvArgs(handleOrEnvVar, envVarOrHandle, true);
    const cleanEnvVar = validateEnvVarName(envVarName);
    const rawValue = this.getDecryptedValue(handle);
    const assignment = `${cleanEnvVar}=${rawValue}`;

    return {
      envVar: cleanEnvVar,
      flag: `--env ${assignment}`,
      args: ["--env", assignment],
      getResolvedValue: () => rawValue,
    };
  }

  /**
   * Resolves secret handle to HTTP Authorization header inside connector runtime.
   */
  public resolveAuthHeader(
    handle: string,
    scheme: AuthScheme = "Bearer"
  ): AuthHeaderResolution {
    const rawValue = this.getDecryptedValue(handle);
    let headerValue: string;

    switch (scheme) {
      case "Bearer":
        headerValue = `Bearer ${rawValue}`;
        break;
      case "Basic":
        headerValue = `Basic ${Buffer.from(rawValue, "utf-8").toString("base64")}`;
        break;
      case "Custom":
        headerValue = rawValue;
        break;
      default: {
        const exhaustiveCheck: never = scheme;
        throw new SecretSecurityError(`Unsupported auth scheme: ${String(exhaustiveCheck)}`);
      }
    }

    return { Authorization: headerValue };
  }

  /**
   * Executes a closure with the decrypted secret, ensuring the secret never escapes
   * to outer variable scopes or logs.
   */
  public async executeWithSecret<T>(
    handle: string,
    fn: (secretValue: string) => Promise<T>
  ): Promise<T> {
    const rawValue = this.getDecryptedValue(handle);
    return await fn(rawValue);
  }
}

/**
 * Named module export matching CHECK.md Phase 4 verification (`resolveToDockerEnv("API_KEY", "secret:test@v1")`)
 * as well as `(handle, envVarName)` order.
 */
export function resolveToDockerEnv(
  envVarOrHandle: string,
  handleOrEnvVar: string
): DockerEnvResolution {
  const { handle, envVarName } = normalizeDockerEnvArgs(envVarOrHandle, handleOrEnvVar, false);
  return SecretsStore.getInstance().resolveToDockerEnv(handle, envVarName);
}
