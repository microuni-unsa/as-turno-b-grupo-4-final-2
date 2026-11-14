/**
 * Typed error definitions for the connectors runtime and security boundary.
 */

export class ConnectorRuntimeError extends Error {
  public readonly code: string;

  constructor(message: string, code: string = "CONNECTOR_RUNTIME_ERROR") {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class SecretHandleFormatError extends ConnectorRuntimeError {
  constructor(invalidHandle: string) {
    super(
      `Invalid secret handle format: '${invalidHandle}'. Expected format: 'secret:<name>@<v>'`,
      "SECRET_HANDLE_FORMAT_ERROR"
    );
  }
}

export class SecretNotFoundError extends ConnectorRuntimeError {
  constructor(name: string, version: number) {
    super(
      `Secret not found in registry: '${name}' at version ${version}`,
      "SECRET_NOT_FOUND_ERROR"
    );
  }
}

export class SecretExpiredError extends ConnectorRuntimeError {
  constructor(token: string) {
    super(
      `Secret request session with token '${token}' has expired or is invalid.`,
      "SECRET_EXPIRED_ERROR"
    );
  }
}

export class SecretSecurityError extends ConnectorRuntimeError {
  constructor(reason: string) {
    super(
      `Security boundary violation: ${reason}`,
      "SECRET_SECURITY_VIOLATION"
    );
  }
}

export class ConnectorRegistrationError extends ConnectorRuntimeError {
  constructor(reason: string) {
    super(
      `Connector registration failed: ${reason}`,
      "CONNECTOR_REGISTRATION_ERROR"
    );
  }
}
