/**
 * Type definitions for secrets sidecar.
 */

export type SecretStatus = 'pending' | 'submitted' | 'expired';

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

export interface SecretRegistryEntry {
  name: string;
  version: number;
  created_at: Date;
  created_by: string;
  scope: string;
}

export interface CreateRequestInput {
  label: string;
  scope?: string;
  createdBy?: string;
}

export interface CreateRequestResponse {
  token: string;
  url: string;
  expiresAt: string;
  pollHandle: string;
}

export interface PollResponse {
  status: SecretStatus;
  handle: string | null;
}
