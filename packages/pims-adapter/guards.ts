/**
 * Shared-tenant write guard for GESTITEL PIMS.
 *
 * GESTITEL operates under a shared multi-tenant database schema where multiple groups
 * coexist. Reads operate uniformly across all PIMS records (no read-side filtering);
 * all write operations (POST/PATCH/PUT) MUST strictly enforce the 'G4-' code prefix.
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
