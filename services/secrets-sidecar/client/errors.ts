/**
 * Typed client errors for secrets management.
 */

export class SecretsClientError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;

  constructor(message: string, code: string = 'SECRETS_CLIENT_ERROR', statusCode?: number) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class SecretRequestExpiredError extends SecretsClientError {
  constructor(message: string = 'Secret request has expired without submission.') {
    super(message, 'REQUEST_EXPIRED', 410);
  }
}

export class SecretPollTimeoutError extends SecretsClientError {
  constructor(message: string = 'Polling timed out waiting for secret submission.') {
    super(message, 'POLL_TIMEOUT', 408);
  }
}

export class SecretTokenInvalidOrExpiredError extends SecretsClientError {
  constructor(message: string = 'The submission token is invalid, expired, or already used.') {
    super(message, 'TOKEN_INVALID_OR_EXPIRED', 400);
  }
}
