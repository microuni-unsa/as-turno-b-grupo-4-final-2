/**
 * Shared response envelope normalizers for GESTITEL PIMS REST endpoints.
 *
 * Some DRF endpoints return paginated envelopes ({ count, next, previous, results })
 * while others (/versions/, /history/, /attachments/, or flat list views) return plain JSON arrays.
 */

import { PimsReadFailureError } from "./errors.ts";
import type { PaginatedResult } from "./types.ts";

/**
 * Normalizes either a DRF paginated envelope or a plain JSON array into PaginatedResult<T>.
 * Throws PimsReadFailureError explicitly if the payload shape is invalid.
 */
export function normalizePaginatedResponse<T>(
  raw: unknown,
  endpoint: string,
): PaginatedResult<T> {
  if (Array.isArray(raw)) {
    return {
      count: raw.length,
      next: null,
      previous: null,
      results: raw as T[],
    };
  }

  if (
    typeof raw === "object" &&
    raw !== null &&
    "results" in raw &&
    Array.isArray((raw as { results?: unknown }).results)
  ) {
    const envelope = raw as Partial<PaginatedResult<T>> & { results: T[] };
    return {
      count: typeof envelope.count === "number" ? envelope.count : envelope.results.length,
      next: envelope.next ?? null,
      previous: envelope.previous ?? null,
      results: envelope.results,
    };
  }

  throw new PimsReadFailureError(
    endpoint,
    500,
    `Malformed list payload from ${endpoint}: expected array or { results: [...] } envelope.`,
    raw,
  );
}

/**
 * Normalizes either a plain JSON array or a DRF paginated envelope into T[].
 * Throws PimsReadFailureError explicitly if the payload shape is invalid.
 */
export function normalizeArrayResponse<T>(raw: unknown, endpoint: string): T[] {
  if (Array.isArray(raw)) {
    return raw as T[];
  }

  if (
    typeof raw === "object" &&
    raw !== null &&
    "results" in raw &&
    Array.isArray((raw as { results?: unknown }).results)
  ) {
    return (raw as { results: T[] }).results;
  }

  throw new PimsReadFailureError(
    endpoint,
    500,
    `Malformed array payload from ${endpoint}: expected array or { results: [...] } envelope.`,
    raw,
  );
}
