import { createHash, randomBytes, randomUUID } from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {
  SECRETS_HANDLE_PREFIX,
  SECRETS_HANDLE_REGEX,
  SECRET_TOKEN_TTL_MS,
} from "../../shared/constants.ts";
import { AgeEncryptor, AgeEncryptionError } from "./age.ts";
import { SecretsRegistryRepository } from "./registry.ts";

export { AgeEncryptionError };

const LABEL_REGEX = /^[a-zA-Z0-9_\-.]+$/;
const DEFAULT_SCOPE = "global";
const DEFAULT_CREATED_BY = "instructor";

export class SecretsServiceError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string = "SECRETS_SERVICE_ERROR", statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class SecretTokenInvalidOrExpiredError extends SecretsServiceError {
  constructor(message: string = "The submission token is invalid, expired, or already used.") {
    super(message, "TOKEN_INVALID_OR_EXPIRED", 400);
  }
}

export class SecretRequestExpiredError extends SecretsServiceError {
  constructor(message: string = "Secret request has expired without submission.") {
    super(message, "REQUEST_EXPIRED", 410);
  }
}

export class SecretPollTimeoutError extends SecretsServiceError {
  constructor(message: string = "Polling timed out waiting for secret submission.") {
    super(message, "POLL_TIMEOUT", 408);
  }
}

export class SecretValidationError extends SecretsServiceError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
  }
}

export type SecretStatus = "pending" | "submitted" | "expired";

export interface SecretRequestRecord {
  id: string;
  token: string;
  tokenHash: string;
  label: string;
  scope: string;
  createdBy: string;
  createdAt: Date;
  expiresAt: Date;
  status: SecretStatus;
  handle?: string;
}

export interface SecretMetadataItem {
  name: string;
  version: number;
  handle: string;
  scope: string;
  createdBy: string;
  createdAt: string;
}

export interface PendingSecretRequestPublic {
  requestId: string;
  tokenHash: string;
  label: string;
  scope: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  status: "pending";
}

export interface SecretRequestCreatedEvent extends PendingSecretRequestPublic {
  token: string;
}

export interface SecretRequestResolvedEvent {
  tokenHash: string;
  label: string;
  handle: string;
  scope: string;
}

export interface StoreSecretDirectInput {
  label: string;
  secretValue: string;
  scope?: string;
  createdBy?: string;
}

export interface StoreSecretDirectResult {
  handle: string;
  name: string;
  version: number;
  scope: string;
  createdAt: string;
  createdBy: string;
}

export interface CreateSecretRequestInput {
  label: string;
  scope?: string;
  createdBy?: string;
  ttlMs?: number;
}

export interface CreateSecretRequestResult {
  requestId: string;
  token: string;
  url: string;
  expiresAt: string;
  pollHandle: string;
  label: string;
  scope: string;
  mode: "webapp-inline";
}

export interface PollSecretStatusResult {
  status: SecretStatus;
  handle: string | null;
}

export interface SecretsServiceOptions {
  storeDir: string;
  databaseUrl?: string | null;
  publicBaseUrl: string;
  tokenTtlMs?: number;
  recipientKey?: string;
  onRequestCreated?: (req: SecretRequestCreatedEvent) => void;
  onRequestResolved?: (evt: SecretRequestResolvedEvent) => void;
}

function canonicalizeSecretHandle(handle: string): string {
  const match = SECRETS_HANDLE_REGEX.exec(handle);
  if (!match || !match[1] || !match[2]) {
    return handle;
  }
  return `${SECRETS_HANDLE_PREFIX}${match[1]}@v${match[2]}`;
}

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function normalizeOptionalString(
  value: string | undefined,
  fallback: string,
  fieldName: string,
): string {
  if (value === undefined) {
    return fallback;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new SecretValidationError(`${fieldName} cannot be empty.`);
  }
  return trimmed;
}

/**
 * Manages age-encrypted secrets, version metadata, one-time inline request tokens,
 * and long-poll resolution state.
 */
export class SecretsService {
  public readonly storeDir: string;
  private readonly publicBaseUrl: string;
  private readonly tokenTtlMs: number;
  private readonly ageEncryptor: AgeEncryptor;
  private readonly registryRepo: SecretsRegistryRepository;
  private readonly onRequestCreated?: (req: SecretRequestCreatedEvent) => void;
  private readonly onRequestResolved?: (evt: SecretRequestResolvedEvent) => void;

  private readonly requestsByHash = new Map<string, SecretRequestRecord>();
  private readonly requestsByHandle = new Map<string, SecretRequestRecord>();
  private readonly waitersByHash = new Map<string, Set<() => void>>();
  private readonly inFlightSubmits = new Set<string>();

  constructor(options: SecretsServiceOptions) {
    if (!options.storeDir || options.storeDir.trim().length === 0) {
      throw new SecretValidationError("storeDir is required.");
    }
    if (!options.publicBaseUrl || options.publicBaseUrl.trim().length === 0) {
      throw new SecretValidationError("publicBaseUrl is required.");
    }
    if (
      options.tokenTtlMs !== undefined &&
      (!Number.isFinite(options.tokenTtlMs) || options.tokenTtlMs <= 0)
    ) {
      throw new SecretValidationError("tokenTtlMs must be a positive number.");
    }

    this.storeDir = path.resolve(options.storeDir.trim());
    this.publicBaseUrl = options.publicBaseUrl.trim().replace(/\/+$/, "");
    this.tokenTtlMs = options.tokenTtlMs ?? SECRET_TOKEN_TTL_MS;
    this.onRequestCreated = options.onRequestCreated;
    this.onRequestResolved = options.onRequestResolved;

    this.ageEncryptor = new AgeEncryptor({
      keysDir: path.join(this.storeDir, "keys"),
      recipientKey: options.recipientKey,
    });

    this.registryRepo = new SecretsRegistryRepository({
      storeDir: this.storeDir,
      databaseUrl:
        options.databaseUrl === null
          ? null
          : (options.databaseUrl ?? process.env.DATABASE_URL ?? null),
    });
  }

  public async initialize(): Promise<void> {
    await fs.mkdir(this.storeDir, { recursive: true });
    await this.ageEncryptor.initialize();
    await this.registryRepo.initialize();
  }

  public async close(): Promise<void> {
    await this.registryRepo.close();
  }

  public sanitizeLabel(label: string): string {
    if (typeof label !== "string") {
      throw new SecretValidationError("Label is required and must be a string.");
    }
    const trimmed = label.trim();
    if (
      !trimmed ||
      !LABEL_REGEX.test(trimmed) ||
      trimmed === "." ||
      trimmed === ".." ||
      trimmed.includes("..")
    ) {
      throw new SecretValidationError(
        `Invalid secret label: "${label}". Only alphanumeric characters, dashes, dots, and underscores are allowed.`,
      );
    }
    return trimmed;
  }

  public getSecretFilePath(label: string, version: number): string {
    const cleanLabel = this.sanitizeLabel(label);
    return path.join(this.storeDir, "secrets", cleanLabel, `v${version}.age`);
  }

  public async listSecrets(): Promise<{
    secrets: SecretMetadataItem[];
    pending: PendingSecretRequestPublic[];
  }> {
    this.pruneExpiredRequests();

    const entries = await this.registryRepo.listAllEntries();
    const secrets: SecretMetadataItem[] = entries.map((entry) => ({
      name: entry.name,
      version: entry.version,
      handle: `${SECRETS_HANDLE_PREFIX}${entry.name}@v${entry.version}`,
      scope: entry.scope,
      createdBy: entry.created_by,
      createdAt: entry.created_at.toISOString(),
    }));

    const pending: PendingSecretRequestPublic[] = [];
    for (const record of this.requestsByHash.values()) {
      if (record.status !== "pending") {
        continue;
      }
      pending.push({
        requestId: record.id,
        tokenHash: record.tokenHash,
        label: record.label,
        scope: record.scope,
        createdBy: record.createdBy,
        createdAt: record.createdAt.toISOString(),
        expiresAt: record.expiresAt.toISOString(),
        status: "pending",
      });
    }

    pending.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

    return { secrets, pending };
  }

  public listPendingForRole(
    role: "rw" | "ro",
  ): Array<PendingSecretRequestPublic & { token: string }> {
    this.pruneExpiredRequests();

    const pending: Array<PendingSecretRequestPublic & { token: string }> = [];
    for (const record of this.requestsByHash.values()) {
      if (record.status !== "pending") {
        continue;
      }
      pending.push({
        requestId: record.id,
        tokenHash: record.tokenHash,
        label: record.label,
        scope: record.scope,
        createdBy: record.createdBy,
        createdAt: record.createdAt.toISOString(),
        expiresAt: record.expiresAt.toISOString(),
        status: "pending",
        token: role === "rw" ? record.token : "",
      });
    }

    pending.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    return pending;
  }

  public async storeSecretDirect(
    input: StoreSecretDirectInput,
  ): Promise<StoreSecretDirectResult> {
    if (!input.secretValue || input.secretValue.trim().length === 0) {
      throw new SecretValidationError("Secret value cannot be empty.");
    }

    const cleanLabel = this.sanitizeLabel(input.label);
    const scope = normalizeOptionalString(input.scope, DEFAULT_SCOPE, "scope");
    const createdBy = normalizeOptionalString(
      input.createdBy,
      DEFAULT_CREATED_BY,
      "createdBy",
    );

    const version = await this.registryRepo.getNextVersion(cleanLabel);
    const targetFilePath = this.getSecretFilePath(cleanLabel, version);
    await this.ageEncryptor.encryptToFile(input.secretValue, targetFilePath);

    const createdAt = new Date();
    await this.registryRepo.insertEntry({
      name: cleanLabel,
      version,
      created_at: createdAt,
      created_by: createdBy,
      scope,
    });

    const handle = `${SECRETS_HANDLE_PREFIX}${cleanLabel}@v${version}`;
    return {
      handle,
      name: cleanLabel,
      version,
      scope,
      createdAt: createdAt.toISOString(),
      createdBy,
    };
  }

  public async createRequest(
    input: CreateSecretRequestInput,
  ): Promise<CreateSecretRequestResult> {
    const cleanLabel = this.sanitizeLabel(input.label);
    const scope = normalizeOptionalString(input.scope, DEFAULT_SCOPE, "scope");
    const createdBy = normalizeOptionalString(input.createdBy, "agent", "createdBy");

    let ttlMs: number;
    if (input.ttlMs === undefined) {
      ttlMs = this.tokenTtlMs;
    } else if (typeof input.ttlMs === "number" && Number.isFinite(input.ttlMs) && input.ttlMs > 0) {
      ttlMs = input.ttlMs;
    } else {
      throw new SecretValidationError("ttlMs must be a positive number.");
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = sha256Hex(token);
    const requestId = randomUUID();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + ttlMs);

    const record: SecretRequestRecord = {
      id: requestId,
      token,
      tokenHash,
      label: cleanLabel,
      scope,
      createdBy,
      createdAt,
      expiresAt,
      status: "pending",
    };

    this.requestsByHash.set(tokenHash, record);

    if (this.onRequestCreated) {
      this.onRequestCreated({
        requestId,
        token,
        tokenHash,
        label: cleanLabel,
        scope,
        createdBy,
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
        status: "pending",
      });
    }

    return {
      requestId,
      token,
      url: `${this.publicBaseUrl}/?secret_token=${token}`,
      expiresAt: expiresAt.toISOString(),
      pollHandle: tokenHash,
      label: cleanLabel,
      scope,
      mode: "webapp-inline",
    };
  }

  public getRequestForPaste(token: string): SecretRequestRecord {
    const tokenHash = sha256Hex(token);
    const record = this.requestsByHash.get(tokenHash);

    if (!record) {
      throw new SecretTokenInvalidOrExpiredError();
    }

    if (Date.now() > record.expiresAt.getTime()) {
      record.status = "expired";
      record.token = "";
      this.notifyWaiters(record.tokenHash);
      throw new SecretTokenInvalidOrExpiredError();
    }

    if (record.status !== "pending") {
      throw new SecretTokenInvalidOrExpiredError();
    }

    return record;
  }

  public async submitSecret(token: string, secretValue: string): Promise<string> {
    const tokenHash = sha256Hex(token);
    const record = this.requestsByHash.get(tokenHash);

    if (!record) {
      throw new SecretTokenInvalidOrExpiredError();
    }

    if (Date.now() > record.expiresAt.getTime()) {
      record.status = "expired";
      record.token = "";
      this.notifyWaiters(record.tokenHash);
      throw new SecretTokenInvalidOrExpiredError();
    }

    if (record.status !== "pending" || this.inFlightSubmits.has(tokenHash)) {
      throw new SecretTokenInvalidOrExpiredError();
    }

    if (!secretValue || secretValue.trim().length === 0) {
      throw new SecretValidationError("Secret value cannot be empty.");
    }

    this.inFlightSubmits.add(tokenHash);
    let stored: StoreSecretDirectResult;
    try {
      stored = await this.storeSecretDirect({
        label: record.label,
        secretValue,
        scope: record.scope,
        createdBy: record.createdBy,
      });
    } finally {
      this.inFlightSubmits.delete(tokenHash);
    }

    const handle = canonicalizeSecretHandle(stored.handle);
    record.status = "submitted";
    record.handle = handle;
    record.token = "";
    this.requestsByHandle.set(handle, record);

    this.notifyWaiters(record.tokenHash);

    if (this.onRequestResolved) {
      this.onRequestResolved({
        tokenHash: record.tokenHash,
        label: record.label,
        handle,
        scope: record.scope,
      });
    }

    return handle;
  }

  public pollStatus(pollHandleOrToken: string): PollSecretStatusResult {
    const record = this.resolveRecord(pollHandleOrToken);

    if (!record) {
      throw new SecretTokenInvalidOrExpiredError("Secret request not found or expired.");
    }

    if (Date.now() > record.expiresAt.getTime() && record.status === "pending") {
      record.status = "expired";
      record.token = "";
    }

    switch (record.status) {
      case "expired":
        throw new SecretRequestExpiredError();

      case "pending":
        return {
          status: "pending",
          handle: null,
        };

      case "submitted":
        return {
          status: "submitted",
          handle: record.handle ? canonicalizeSecretHandle(record.handle) : null,
        };

      default: {
        const exhaustive: never = record.status;
        throw new SecretsServiceError(
          `Unexpected secret request status: ${exhaustive}`,
          "INVALID_STATE",
          500,
        );
      }
    }
  }

  public async waitForStatus(
    pollHandleOrToken: string,
    timeoutMs: number,
    signal?: AbortSignal,
  ): Promise<PollSecretStatusResult> {
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
      throw new SecretValidationError("Wait timeout must be a positive duration.");
    }

    const initial = this.pollStatus(pollHandleOrToken);
    if (initial.status !== "pending") {
      return initial;
    }

    const record = this.resolveRecord(pollHandleOrToken);
    if (!record) {
      throw new SecretTokenInvalidOrExpiredError("Secret request not found or expired.");
    }

    if (signal?.aborted) {
      const abortErr = new Error("Wait aborted");
      abortErr.name = "AbortError";
      throw abortErr;
    }

    const remainingExpiryMs = Math.max(0, record.expiresAt.getTime() - Date.now()) + 1;
    const effectiveWaitMs = Math.min(timeoutMs, remainingExpiryMs);

    return new Promise<PollSecretStatusResult>((resolve, reject) => {
      let settled = false;
      let timer: ReturnType<typeof setTimeout> | null = null;

      const cleanup = () => {
        if (timer !== null) {
          clearTimeout(timer);
          timer = null;
        }
        const waiters = this.waitersByHash.get(record.tokenHash);
        if (waiters) {
          waiters.delete(onNotify);
          if (waiters.size === 0) {
            this.waitersByHash.delete(record.tokenHash);
          }
        }
        if (signal) {
          signal.removeEventListener("abort", onAbort);
        }
      };

      const onNotify = () => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        try {
          resolve(this.pollStatus(pollHandleOrToken));
        } catch (err) {
          reject(err);
        }
      };

      const onAbort = () => {
        if (settled) {
          return;
        }
        settled = true;
        cleanup();
        const abortErr = new Error("Wait aborted");
        abortErr.name = "AbortError";
        reject(abortErr);
      };

      let waiters = this.waitersByHash.get(record.tokenHash);
      if (!waiters) {
        waiters = new Set();
        this.waitersByHash.set(record.tokenHash, waiters);
      }
      waiters.add(onNotify);

      if (signal) {
        signal.addEventListener("abort", onAbort, { once: true });
      }

      timer = setTimeout(onNotify, effectiveWaitMs);
    });
  }

  private pruneExpiredRequests(): void {
    const now = Date.now();
    for (const record of this.requestsByHash.values()) {
      if (record.status === "pending" && now > record.expiresAt.getTime()) {
        record.status = "expired";
        record.token = "";
        this.notifyWaiters(record.tokenHash);
      }
    }
  }

  private notifyWaiters(tokenHash: string): void {
    const waiters = this.waitersByHash.get(tokenHash);
    if (!waiters || waiters.size === 0) {
      return;
    }
    const callbacks = Array.from(waiters);
    this.waitersByHash.delete(tokenHash);
    for (const cb of callbacks) {
      cb();
    }
  }

  private resolveRecord(pollHandleOrToken: string): SecretRequestRecord | undefined {
    let record = this.requestsByHash.get(pollHandleOrToken);

    if (!record) {
      const tokenHash = sha256Hex(pollHandleOrToken);
      record = this.requestsByHash.get(tokenHash);
    }

    if (!record) {
      record = this.requestsByHandle.get(pollHandleOrToken);
    }

    if (!record) {
      const match = SECRETS_HANDLE_REGEX.exec(pollHandleOrToken);
      if (match && match[1] && match[2]) {
        const canonical = `${SECRETS_HANDLE_PREFIX}${match[1]}@v${match[2]}`;
        const legacy = `${SECRETS_HANDLE_PREFIX}${match[1]}@${match[2]}`;
        record = this.requestsByHandle.get(canonical) ?? this.requestsByHandle.get(legacy);
      }
    }

    return record;
  }
}
