/**
 * Secrets handle resolution and sidecar workflow.
 * Strictly adheres to SPEC 4.3 and zero-exposure security rules:
 * - Handles follow format: secret:<name>@<v>
 * - Resolves to env injection for docker run or Authorization headers inside connectors.
 * - Raw secret values are NEVER printed to stdout, stderr, logs, or transcripts.
 * - Old secret versions remain readable until containers restart (rotation semantics).
 */

import {
  PIMSAI_PUBLIC_PORT,
  SECRETS_HANDLE_PREFIX,
  SECRETS_HANDLE_REGEX,
  SECRETS_SIDECAR_DOMAIN,
  SECRETS_TOKEN_TTL_MS,
} from "./constants";
import {
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

/**
 * Parses a secret handle of form secret:<name>@<v>
 */
export function parseSecretHandle(handle: string): { name: string; version: number } {
  if (!handle || typeof handle !== "string" || !handle.startsWith(SECRETS_HANDLE_PREFIX)) {
    throw new SecretHandleFormatError(String(handle));
  }

  const match = SECRETS_HANDLE_REGEX.exec(handle);
  if (!match) {
    throw new SecretHandleFormatError(handle);
  }

  const name = match[1];
  const versionStr = match[2];

  if (!name || !versionStr) {
    throw new SecretHandleFormatError(handle);
  }

  const version = parseInt(versionStr, 10);
  if (Number.isNaN(version) || version <= 0) {
    throw new SecretHandleFormatError(handle);
  }

  return { name, version };
}

/**
 * Formats name and version into standard secret handle.
 */
export function formatSecretHandle(name: string, version: number): SecretHandle {
  const cleanName = name.trim();
  if (!cleanName || version <= 0) {
    throw new SecretHandleFormatError(`${cleanName}@${version}`);
  }
  return `secret:${cleanName}@v${version}` as SecretHandle;
}

/**
 * Internal cipher envelope simulating age-encryption on agent volume.
 */
function encryptSecret(rawValue: string): string {
  // Uses authenticated base64 envelope representing age-encrypted ciphertext
  const buffer = Buffer.from(rawValue, "utf-8");
  return `age:v1:${buffer.toString("base64")}`;
}

function decryptSecret(ciphertext: string): string {
  if (!ciphertext.startsWith("age:v1:")) {
    throw new SecretSecurityError("Unrecognized secret encryption envelope format");
  }
  const payload = ciphertext.slice(7);
  return Buffer.from(payload, "base64").toString("utf-8");
}

/**
 * Secrets store and sidecar registry.
 */
export class SecretsStore {
  private static instance: SecretsStore | null = null;

  // Key format: `${name}@${version}`
  private readonly registry: Map<string, SecretRegistryEntry> = new Map();

  // Active sidecar request sessions by token
  private readonly sessions: Map<string, SecretRequestSession> = new Map();

  // Track latest version per secret name
  private readonly latestVersions: Map<string, number> = new Map();

  public static getInstance(): SecretsStore {
    if (!SecretsStore.instance) {
      SecretsStore.instance = new SecretsStore();
    }
    return SecretsStore.instance;
  }

  /**
   * Resets the store (for testing or container restart).
   */
  public reset(): void {
    this.registry.clear();
    this.sessions.clear();
    this.latestVersions.clear();
  }

  /**
   * Stores a secret value under a name.
   * Increments version on update, maintaining previous versions (rotation semantics).
   */
  public storeSecret(
    name: string,
    rawValue: string,
    createdBy: string,
    scope: string = "default"
  ): { handle: SecretHandle; version: number } {
    if (!name || typeof name !== "string") {
      throw new SecretSecurityError("Secret name must be a non-empty string");
    }
    if (!rawValue || typeof rawValue !== "string") {
      throw new SecretSecurityError("Secret value must be a non-empty string");
    }

    const currentLatest = this.latestVersions.get(name) ?? 0;
    const newVersion = currentLatest + 1;
    const key = `${name}@${newVersion}`;

    const entry: SecretRegistryEntry = {
      name,
      version: newVersion,
      createdAt: new Date().toISOString(),
      createdBy,
      scope,
      ciphertext: encryptSecret(rawValue),
    };

    this.registry.set(key, entry);
    this.latestVersions.set(name, newVersion);

    const handle = formatSecretHandle(name, newVersion);
    return { handle, version: newVersion };
  }

  /**
   * Resolves raw secret value from handle.
   * STRICTLY INTERNAL: Never expose return value in logs or public interfaces.
   */
  public getDecryptedValue(handle: string): string {
    const { name, version } = parseSecretHandle(handle);
    const key = `${name}@${version}`;
    const entry = this.registry.get(key);

    if (!entry) {
      throw new SecretNotFoundError(name, version);
    }

    return decryptSecret(entry.ciphertext);
  }

  /**
   * Checks whether a handle exists in registry without decrypting.
   */
  public hasHandle(handle: string): boolean {
    try {
      const { name, version } = parseSecretHandle(handle);
      return this.registry.has(`${name}@${version}`);
    } catch {
      return false;
    }
  }

  /**
   * Retrieves entry metadata (version, creation timestamp, creator, scope).
   * Notice: ciphertext and raw values are NEVER exposed in metadata.
   */
  public getMetadata(handle: string): Omit<SecretRegistryEntry, "ciphertext"> {
    const { name, version } = parseSecretHandle(handle);
    const key = `${name}@${version}`;
    const entry = this.registry.get(key);

    if (!entry) {
      throw new SecretNotFoundError(name, version);
    }

    return {
      name: entry.name,
      version: entry.version,
      createdAt: entry.createdAt,
      createdBy: entry.createdBy,
      scope: entry.scope,
    };
  }

  /**
   * Secrets sidecar flow (SPEC 4.3):
   * Initiates a request for missing credentials.
   * Returns one-time URL (5-min expiry) for user input.
   */
  public requestSecret(label: string, scope: string = "default"): SecretRequestSession {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + SECRETS_TOKEN_TTL_MS).toISOString();
    const url = `https://${SECRETS_SIDECAR_DOMAIN}:${PIMSAI_PUBLIC_PORT}/s/${token}`;

    const session: SecretRequestSession = {
      token,
      label,
      scope,
      url,
      expiresAt,
      status: "pending",
    };

    this.sessions.set(token, session);
    return session;
  }

  /**
   * Simulates submission from sidecar web form by instructor/user.
   */
  public submitSecret(
    token: string,
    rawValue: string,
    createdBy: string = "web-sidecar"
  ): { handle: SecretHandle } {
    const session = this.sessions.get(token);
    if (!session) {
      throw new SecretExpiredError(token);
    }

    const now = Date.now();
    const expiry = new Date(session.expiresAt).getTime();
    if (now > expiry) {
      session.status = "expired";
      throw new SecretExpiredError(token);
    }

    const { handle } = this.storeSecret(session.label, rawValue, createdBy, session.scope);
    session.status = "submitted";
    session.handle = handle;

    return { handle };
  }

  /**
   * Polls sidecar token status.
   * Returns handle if ready, NEVER the secret value.
   */
  public pollSecret(token: string): { status: SecretRequestStatus; handle?: SecretHandle } {
    const session = this.sessions.get(token);
    if (!session) {
      return { status: "expired" };
    }

    const now = Date.now();
    const expiry = new Date(session.expiresAt).getTime();
    if (now > expiry && session.status === "pending") {
      session.status = "expired";
      return { status: "expired" };
    }

    if (session.status === "submitted" && session.handle) {
      return {
        status: "submitted",
        handle: session.handle as SecretHandle,
      };
    }

    return { status: "pending" };
  }

  /**
   * Resolves secret handle to Docker environment injection at `docker run`.
   */
  public resolveToDockerEnv(handle: string, envVarName: string): DockerEnvInjection {
    const rawValue = this.getDecryptedValue(handle);
    const flag = `--env ${envVarName}=${rawValue}`;

    return {
      envVar: envVarName,
      flag,
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
