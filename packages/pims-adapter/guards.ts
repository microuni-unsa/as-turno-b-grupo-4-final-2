/**
 * Shared-tenant guards implementing isolation rules from SPEC §3.1 & §13.
 *
 * GESTITEL operates under a shared multi-tenant database schema where multiple groups
 * coexist. Our writes MUST strictly enforce the 'G4-' code prefix, and our reads
 * MUST filter and reject records belonging to foreign groups.
 */

import { PIMS_CONFIG } from "./config.ts";
import { TenantGuardViolationError } from "./errors.ts";

/**
 * Enforces that any entity write/creation code begins with the mandatory 'G4-' prefix.
 * Throws TenantGuardViolationError immediately if invalid.
 */
export function assertG4WriteCode(code: string, context = "Record"): void {
  if (typeof code !== "string" || code.trim() === "") {
    throw new TenantGuardViolationError(
      `Tenant guard rejection: ${context} write requires a non-empty code starting with "${PIMS_CONFIG.GROUP_CODE_PREFIX}".`,
      code,
    );
  }

  if (!code.startsWith(PIMS_CONFIG.GROUP_CODE_PREFIX)) {
    throw new TenantGuardViolationError(
      `Tenant guard rejection: ${context} write code "${code}" violates tenancy policy. Code must start with "${PIMS_CONFIG.GROUP_CODE_PREFIX}".`,
      code,
    );
  }
}

/**
 * Checks if a record belongs to Group 4 based on its code prefix or responsible assignment.
 */
export function isGroup4Record(record: {
  code?: string;
  responsible?: string;
}): boolean {
  if (
    typeof record.code === "string" &&
    record.code.startsWith(PIMS_CONFIG.GROUP_CODE_PREFIX)
  ) {
    return true;
  }

  if (typeof record.responsible === "string") {
    const respLower = record.responsible.toLowerCase();
    for (const name of PIMS_CONFIG.RESPONSIBLE_NAMES) {
      if (respLower.includes(name.toLowerCase())) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Filters a list of records to include ONLY those belonging to Group 4.
 */
export function filterGroup4Records<
  T extends { code?: string; responsible?: string },
>(records: T[]): T[] {
  return records.filter((rec) => isGroup4Record(rec));
}

/**
 * Asserts that a single fetched record belongs to Group 4.
 * If it belongs to another group, throws TenantGuardViolationError to prevent cross-tenant contamination.
 */
export function assertGroup4Record<
  T extends { code?: string; responsible?: string },
>(record: T, context = "Record"): T {
  if (!isGroup4Record(record)) {
    throw new TenantGuardViolationError(
      `Tenant guard access denied: ${context} (code: "${record.code ?? "unknown"}", responsible: "${record.responsible ?? "unknown"}") belongs to another group. Cross-tenant reads are prohibited.`,
      record.code,
      record.responsible,
    );
  }
  return record;
}
