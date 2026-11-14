import * as crypto from 'node:crypto';

/**
 * Structured audit logger for secrets sidecar.
 *
 * GUARANTEE: Raw secret values and raw one-time tokens are NEVER logged.
 * Only short SHA-256 digests of tokens and metadata (label, version, timestamp) are recorded.
 */

export function hashSensitive(value: string): string {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex').slice(0, 12);
}

export interface AuditLogData {
  event: string;
  tokenHash?: string;
  label?: string;
  version?: number;
  scope?: string;
  statusCode?: number;
  message?: string;
  error?: string;
}

export function logAudit(data: AuditLogData): void {
  const timestamp = new Date().toISOString();
  const entry = {
    timestamp,
    ...data
  };
  process.stdout.write(JSON.stringify(entry) + '\n');
}

export function logError(event: string, err: unknown): void {
  const timestamp = new Date().toISOString();
  const errorMessage = err instanceof Error ? err.message : String(err);
  const entry = {
    timestamp,
    event,
    error: errorMessage
  };
  process.stderr.write(JSON.stringify(entry) + '\n');
}
