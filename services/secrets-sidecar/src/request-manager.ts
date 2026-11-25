import * as crypto from 'node:crypto';
import { CONFIG } from './config.js';
import { SecretRequestRecord, CreateRequestInput, CreateRequestResponse, PollResponse } from './types.js';
import {
  SecretTokenInvalidOrExpiredError,
  SecretRequestExpiredError,
  SecretValidationError
} from './errors.js';
import { hashSensitive, logAudit } from './logger.js';
import { SecretsStoreManager } from './store.js';

function canonicalizeSecretHandle(handle: string): string {
  const match = CONFIG.HANDLE_REGEX.exec(handle);
  if (!match || !match[1] || !match[2]) {
    return handle;
  }
  return `${CONFIG.HANDLE_PREFIX}${match[1]}@v${match[2]}`;
}

export class SecretRequestManager {
  private requestsByHash = new Map<string, SecretRequestRecord>();
  private requestsByHandle = new Map<string, SecretRequestRecord>();
  private waitersByHash = new Map<string, Set<() => void>>();
  private storeManager: SecretsStoreManager;

  constructor(storeManager: SecretsStoreManager) {
    this.storeManager = storeManager;
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
      const tokenHash = crypto.createHash('sha256').update(pollHandleOrToken, 'utf8').digest('hex');
      record = this.requestsByHash.get(tokenHash);
    }

    if (!record) {
      record = this.requestsByHandle.get(pollHandleOrToken);
    }

    if (!record) {
      const match = CONFIG.HANDLE_REGEX.exec(pollHandleOrToken);
      if (match && match[1] && match[2]) {
        const canonical = `${CONFIG.HANDLE_PREFIX}${match[1]}@v${match[2]}`;
        const legacy = `${CONFIG.HANDLE_PREFIX}${match[1]}@${match[2]}`;
        record = this.requestsByHandle.get(canonical) ?? this.requestsByHandle.get(legacy);
      }
    }

    return record;
  }

  /**
   * Creates a new secret request, generating a 5-minute single-use token.
   */
  public async createRequest(input: CreateRequestInput): Promise<CreateRequestResponse> {
    if (!input.label || typeof input.label !== 'string') {
      throw new SecretValidationError('Label is required and must be a string.');
    }

    const cleanLabel = this.storeManager.sanitizeLabel(input.label);
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token, 'utf8').digest('hex');
    const id = crypto.randomUUID();

    const ttlMs =
      typeof input.ttlMs === 'number' && Number.isFinite(input.ttlMs) && input.ttlMs > 0
        ? input.ttlMs
        : CONFIG.TOKEN_EXPIRY_MS;

    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + ttlMs);

    const record: SecretRequestRecord = {
      id,
      token,
      tokenHash,
      label: cleanLabel,
      scope: input.scope || 'global',
      createdBy: input.createdBy || 'agent',
      createdAt,
      expiresAt,
      status: 'pending'
    };

    this.requestsByHash.set(tokenHash, record);

    logAudit({
      event: 'secret_request_created',
      tokenHash: hashSensitive(token),
      label: cleanLabel,
      scope: record.scope
    });

    const url = `${CONFIG.BASE_URL}/s/${token}`;

    return {
      token,
      url,
      expiresAt: expiresAt.toISOString(),
      pollHandle: tokenHash
    };
  }

  /**
   * Retrieves a pending request for the web form.
   * If token is invalid, expired, or used, throws SecretTokenInvalidOrExpiredError
   * with a uniform message to avoid leaking if the label existed.
   */
  public getRequestForPaste(token: string): SecretRequestRecord {
    const tokenHash = crypto.createHash('sha256').update(token, 'utf8').digest('hex');
    const record = this.requestsByHash.get(tokenHash);

    if (!record) {
      throw new SecretTokenInvalidOrExpiredError();
    }

    if (Date.now() > record.expiresAt.getTime()) {
      record.status = 'expired';
      this.notifyWaiters(record.tokenHash);
      throw new SecretTokenInvalidOrExpiredError();
    }

    if (record.status !== 'pending') {
      throw new SecretTokenInvalidOrExpiredError();
    }

    return record;
  }

  /**
   * Submits the secret value:
   * 1. Validates token (uniform error on replay or expiry).
   * 2. Encrypts value using age to agent volume store.
   * 3. Invalidates the token immediately.
   * 4. Updates record status to submitted with canonical handle `secret:<name>@v<n>`.
   * 5. Wakes any long-poll waiters immediately.
   */
  public async submitSecret(token: string, secretValue: string): Promise<string> {
    const tokenHash = crypto.createHash('sha256').update(token, 'utf8').digest('hex');
    const record = this.requestsByHash.get(tokenHash);

    if (!record) {
      throw new SecretTokenInvalidOrExpiredError();
    }

    if (Date.now() > record.expiresAt.getTime()) {
      record.status = 'expired';
      this.notifyWaiters(record.tokenHash);
      throw new SecretTokenInvalidOrExpiredError();
    }

    if (record.status !== 'pending') {
      throw new SecretTokenInvalidOrExpiredError();
    }

    if (!secretValue || secretValue.trim().length === 0) {
      throw new SecretValidationError('Secret value cannot be empty.');
    }

    // Encrypt and store
    const rawHandle = await this.storeManager.storeSecret(
      record.label,
      secretValue,
      record.createdBy,
      record.scope
    );
    const handle = canonicalizeSecretHandle(rawHandle);

    // Invalidate token immediately
    record.status = 'submitted';
    record.handle = handle;
    record.token = ''; // Clear token from memory
    this.requestsByHandle.set(handle, record);

    logAudit({
      event: 'secret_token_consumed',
      tokenHash: hashSensitive(token),
      label: record.label
    });

    this.notifyWaiters(record.tokenHash);

    return handle;
  }

  /**
   * Polls the status of a secret request immediately (non-blocking).
   * - Poll before submit: returns { status: 'pending', handle: null }
   * - Poll after expiry: throws SecretRequestExpiredError
   * - Poll after submit: returns { status: 'submitted', handle: 'secret:<name>@v<n>' }
   */
  public pollStatus(pollHandleOrToken: string): PollResponse {
    const record = this.resolveRecord(pollHandleOrToken);

    if (!record) {
      throw new SecretTokenInvalidOrExpiredError('Secret request not found or expired.');
    }

    if (Date.now() > record.expiresAt.getTime() && record.status === 'pending') {
      record.status = 'expired';
    }

    if (record.status === 'expired') {
      throw new SecretRequestExpiredError();
    }

    if (record.status === 'pending') {
      return {
        status: 'pending',
        handle: null
      };
    }

    return {
      status: 'submitted',
      handle: record.handle ? canonicalizeSecretHandle(record.handle) : null
    };
  }

  /**
   * Long-polls the status of a secret request up to `timeoutMs` while pending.
   * Resolves immediately upon submission, rejects with SecretRequestExpiredError upon expiry,
   * or resolves with `{ status: 'pending', handle: null }` when timeout elapses.
   */
  public async waitForStatus(
    pollHandleOrToken: string,
    timeoutMs: number,
    signal?: AbortSignal
  ): Promise<PollResponse> {
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
      throw new SecretValidationError('Wait timeout must be a positive duration.');
    }

    const initial = this.pollStatus(pollHandleOrToken);
    if (initial.status !== 'pending') {
      return initial;
    }

    const record = this.resolveRecord(pollHandleOrToken);
    if (!record) {
      throw new SecretTokenInvalidOrExpiredError('Secret request not found or expired.');
    }

    if (signal?.aborted) {
      const abortErr = new Error('Wait aborted');
      abortErr.name = 'AbortError';
      throw abortErr;
    }

    const remainingExpiryMs = Math.max(0, record.expiresAt.getTime() - Date.now()) + 1;
    const effectiveWaitMs = Math.min(timeoutMs, remainingExpiryMs);

    return new Promise<PollResponse>((resolve, reject) => {
      let settled = false;
      let timer: ReturnType<typeof setTimeout> | null = null;

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
        const abortErr = new Error('Wait aborted');
        abortErr.name = 'AbortError';
        reject(abortErr);
      };

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
          signal.removeEventListener('abort', onAbort);
        }
      };

      let waiters = this.waitersByHash.get(record.tokenHash);
      if (!waiters) {
        waiters = new Set();
        this.waitersByHash.set(record.tokenHash, waiters);
      }
      waiters.add(onNotify);

      if (signal) {
        signal.addEventListener('abort', onAbort, { once: true });
      }

      timer = setTimeout(onNotify, effectiveWaitMs);
    });
  }
}
