/**
 * Types and interfaces for connector runtime, secrets handles, and registration.
 */

export type SecretHandle = `secret:${string}@v${number}` | `secret:${string}@${number}`;

export interface SecretRegistryEntry {
  name: string;
  version: number;
  createdAt: string;
  createdBy: string;
  scope: string;
  ciphertext: string;
}

export type SecretRequestStatus = "pending" | "submitted" | "expired";

export interface SecretRequestSession {
  token: string;
  label: string;
  scope: string;
  url: string;
  expiresAt: string;
  status: SecretRequestStatus;
  handle?: string;
}

export interface DockerEnvInjection {
  envVar: string;
  flag: string;
  getResolvedValue: () => string;
}

export interface AuthHeaderResolution {
  Authorization: string;
}

export type AuthScheme = "Bearer" | "Basic" | "Custom";

export interface RegisterConnectorOptions {
  connectorDir: string;
  skillPath?: string;
  overwrite?: boolean;
}

export interface RegistrationResult {
  connectorName: string;
  skillPath: string;
  fragmentAppended: boolean;
  endpointsCount: number;
  registeredAt: string;
}

export interface ConnectorEndpointSummary {
  endpoint: string;
  method: string;
  authRequired: boolean;
  description: string;
}
