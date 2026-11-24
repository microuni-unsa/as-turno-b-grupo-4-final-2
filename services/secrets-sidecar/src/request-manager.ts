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

export class SecretRequestManager {
  private requestsByHash = new Map<string, SecretRequestRecord>();
  private requestsByHandle = new Map<string, SecretRequestRecord>();
  private storeManager: SecretsStoreManager;

  constructor(storeManager: SecretsStoreManager) {
    this.storeManager = storeManager;
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

    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + CONFIG.TOKEN_EXPIRY_MS);

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
   * 4. Updates record status to submitted with handle.
   */
  public async submitSecret(token: string, secretValue: string): Promise<string> {
    const tokenHash = crypto.createHash('sha256').update(token, 'utf8').digest('hex');
    const record = this.requestsByHash.get(tokenHash);

    if (!record) {
      throw new SecretTokenInvalidOrExpiredError();
    }

    if (Date.now() > record.expiresAt.getTime()) {
      record.status = 'expired';
      throw new SecretTokenInvalidOrExpiredError();
    }

    if (record.status !== 'pending') {
      throw new SecretTokenInvalidOrExpiredError();
    }

    if (!secretValue || secretValue.trim().length === 0) {
      throw new SecretValidationError('Secret value cannot be empty.');
    }

    // Encrypt and store
    const handle = await this.storeManager.storeSecret(
      record.label,
      secretValue,
      record.createdBy,
      record.scope
    );

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

    return handle;
  }

  /**
   * Polls the status of a secret request.
   * - Poll before submit: returns { status: 'pending', handle: null }
   * - Poll after expiry: throws SecretRequestExpiredError
   * - Poll after submit: returns { status: 'submitted', handle: 'secret:<name>@<v>' }
   */
  public pollStatus(pollHandleOrToken: string): PollResponse {
    let record = this.requestsByHash.get(pollHandleOrToken);

    // If caller passed raw token instead of tokenHash, compute hash
    if (!record) {
      const tokenHash = crypto.createHash('sha256').update(pollHandleOrToken, 'utf8').digest('hex');
      record = this.requestsByHash.get(tokenHash);
    }

    // If caller passed an opaque handle (secret:<name>@<v>), resolve post-submit record
    if (!record) {
      record = this.requestsByHandle.get(pollHandleOrToken);
    }

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
      handle: record.handle || null
    };
  }
}
