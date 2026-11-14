/**
 * Typed errors for secrets sidecar service and client.
 */

export class SecretsSidecarError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string = 'SECRETS_SIDECAR_ERROR', statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class SecretTokenInvalidOrExpiredError extends SecretsSidecarError {
  constructor(message: string = 'The submission token is invalid, expired, or already used.') {
    super(message, 'TOKEN_INVALID_OR_EXPIRED', 400);
  }
}

export class SecretRequestExpiredError extends SecretsSidecarError {
  constructor(message: string = 'Secret request has expired without submission.') {
    super(message, 'REQUEST_EXPIRED', 410);
  }
}

export class SecretPollTimeoutError extends SecretsSidecarError {
  constructor(message: string = 'Polling timed out waiting for secret submission.') {
    super(message, 'POLL_TIMEOUT', 408);
  }
}

export class SecretValidationError extends SecretsSidecarError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class AgeEncryptionError extends SecretsSidecarError {
  constructor(message: string) {
    super(message, 'AGE_ENCRYPTION_ERROR', 500);
  }
}
