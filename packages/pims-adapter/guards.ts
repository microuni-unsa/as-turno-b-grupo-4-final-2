/**
 * Shared-tenant write guard for GESTITEL PIMS.
 *
 * GESTITEL operates under a shared multi-tenant database schema where multiple groups
 * coexist. Reads operate uniformly across all PIMS records (no read-side filtering);
 * all write operations (POST/PATCH/PUT) MUST strictly enforce the 'G4-' code prefix.
 */

import { PIMS_CONFIG } from "./config.ts";
import { TenantGuardViolationError } from "./errors.ts";
import type { PimsIncident } from "./types.ts";

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
 * Enforces Group 4 ownership on existing PIMS incidents before mutating or attaching.
 * Because GESTITEL ignores custom incident_code on POST and auto-assigns INC-NNN,
 * Group 4 incidents are owned iff incident_code starts with 'G4-' OR title starts with 'G4-'.
 */
export function assertG4IncidentOwnership(
  incident: Pick<PimsIncident, "id" | "incident_code" | "title">,
): void {
  const prefix = PIMS_CONFIG.GROUP_CODE_PREFIX;
  const code = typeof incident.incident_code === "string" ? incident.incident_code : "";
  const title = typeof incident.title === "string" ? incident.title : "";

  if (code.startsWith(prefix) || title.startsWith(prefix)) {
    return;
  }

  throw new TenantGuardViolationError(
    `Tenant guard rejection: Incident #${incident.id} (incident_code="${code}", title="${title}") is not owned by Group 4. Mutation requires incident_code or title starting with "${prefix}".`,
    code,
  );
}
