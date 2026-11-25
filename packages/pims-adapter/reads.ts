/**
 * Reads module for GESTITEL PIMS.
 *
 * Implements uniform read operations across:
 * - Audits (GET /api/audits/, GET /api/audits/{id}/)
 * - Audit resolution (resolveAudit by ID or audit_code)
 * - Audit findings deduplication (dedupeAuditFindings)
 * - Action closure verification (isActionClosedVerified)
 * - Risk evaluations (GET /api/risk-evaluations/)
 * - Risk catalogs (GET /api/risk-evaluations/catalogs/)
 * - Assets (GET /api/assets/)
 * - Eligible assets (GET /api/risk-evaluations/eligible-assets/)
 * - Dashboard KPIs (GET /api/dashboard/?tab={tab})
 * - Annex-A controls metadata (GET /api/annex-a-controls/meta/)
 * - Trainings & System Catalogs (403 handled as EXPECTED typed error, not crash)
 *
 * SPEC §3.1 / §13 Note:
 * Tenant state has trainings/system-catalogs returning 403 for grupob4 as expected.
 * Training records live as uploaded documents in PIMS.
 */

import type { AuthManager } from "./auth.ts";
import { PIMS_CONFIG } from "./config.ts";
import {
  PimsNotFoundError,
  PimsReadFailureError,
  PimsTrainingsForbiddenError,
} from "./errors.ts";
import { normalizePaginatedResponse } from "./normalize.ts";
import type {
  ListAuditsParams,
  PaginatedEligibleAssetsResult,
  PaginatedResult,
  PimsAdapterConfig,
  PimsAnnexAControlsMeta,
  PimsAsset,
  PimsAudit,
  PimsAuditFinding,
  PimsAuditFindingAction,
  PimsDashboardKpis,
  PimsEligibleAsset,
  PimsRiskCatalogResponse,
  PimsRiskEvaluation,
} from "./types.ts";

export interface PimsSystemCatalog {
  id: number;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DedupeAuditFindingsResult {
  uniqueFindingsCount: number;
  uniqueActionsCount: number;
  originalActionsCount: number;
  findings: PimsAuditFinding[];
}

/**
 * Deduplicates audit findings using a deterministic composite key:
 * (classification, description, action_plan, responsible).
 *
 * Flattens finding×action pairs, dedupes pairs by composite key,
 * and regroups findings preserving first-seen order.
 * Findings with zero actions are keyed as (classification, description, "", "").
 *
 * Pure function: does not mutate the input audit object.
 */
export function dedupeAuditFindings(
  audit: PimsAudit,
): DedupeAuditFindingsResult {
  if (!audit?.findings || audit.findings.length === 0) {
    return {
      uniqueFindingsCount: 0,
      uniqueActionsCount: 0,
      originalActionsCount: 0,
      findings: [],
    };
  }

  interface FindingActionPair {
    finding: PimsAuditFinding;
    action: PimsAuditFindingAction | null;
    key: string;
  }

  // 1. Flatten finding×action pairs
  const pairs: FindingActionPair[] = [];
  for (const finding of audit.findings) {
    const classification = finding.classification ?? "";
    const description = finding.description ?? "";

    if (!finding.actions || finding.actions.length === 0) {
      const key = JSON.stringify([classification, description, "", ""]);
      pairs.push({ finding, action: null, key });
    } else {
      for (const action of finding.actions) {
        const actionPlan = action.action_plan ?? "";
        const responsible = action.responsible ?? "";
        const key = JSON.stringify([
          classification,
          description,
          actionPlan,
          responsible,
        ]);
        pairs.push({ finding, action, key });
      }
    }
  }

  const originalActionsCount = pairs.length;

  // 2. Deduplicate pairs preserving first-seen order
  const seenKeys = new Set<string>();
  const dedupedPairs: FindingActionPair[] = [];
  for (const pair of pairs) {
    if (!seenKeys.has(pair.key)) {
      seenKeys.add(pair.key);
      dedupedPairs.push(pair);
    }
  }

  const uniqueActionsCount = dedupedPairs.length;

  // 3. Regroup findings preserving first-seen order
  const findingGroups = new Map<
    string,
    {
      finding: PimsAuditFinding;
      actions: PimsAuditFindingAction[];
    }
  >();

  for (const pair of dedupedPairs) {
    const findingKey = JSON.stringify([
      pair.finding.classification ?? "",
      pair.finding.description ?? "",
    ]);

    let group = findingGroups.get(findingKey);
    if (!group) {
      group = {
        finding: pair.finding,
        actions: [],
      };
      findingGroups.set(findingKey, group);
    }

    if (pair.action !== null) {
      group.actions.push(pair.action);
    }
  }

  const regroupedFindings: PimsAuditFinding[] = [];
  let findingPosition = 0;

  for (const group of findingGroups.values()) {
    const actions: PimsAuditFindingAction[] = group.actions.map(
      (action, actionIndex) => ({
        ...action,
        position: actionIndex,
      }),
    );

    regroupedFindings.push({
      ...group.finding,
      position: findingPosition++,
      actions,
    });
  }

  return {
    uniqueFindingsCount: regroupedFindings.length,
    uniqueActionsCount,
    originalActionsCount,
    findings: regroupedFindings,
  };
}

/**
 * Evaluates whether an audit action is closed and verified.
 * Returns true ONLY when:
 * 1. action.status === "C"
 * 2. action.progress === 100
 * 3. action.closed_at != null
 * 4. evidence is non-empty (from parameter findingEvidence, parent finding object, or action-level evidence)
 *
 * Pure function: prevents false-green reporting on open or unverified actions.
 */
export function isActionClosedVerified(
  action: PimsAuditFindingAction,
  findingEvidence?: PimsAuditFinding | string | null,
): boolean {
  if (!action) {
    return false;
  }

  // 1. Status check: must be "C" (Closed)
  if (action.status !== "C") {
    return false;
  }

  // 2. Progress check: must be 100
  if (action.progress !== 100) {
    return false;
  }

  // 3. Closed timestamp check: must be non-null and defined
  if (action.closed_at === null || action.closed_at === undefined) {
    return false;
  }

  // 4. Evidence check: must be non-empty string
  let evidenceStr: string | null | undefined = null;
  if (typeof findingEvidence === "string") {
    evidenceStr = findingEvidence;
  } else if (
    findingEvidence &&
    typeof findingEvidence === "object" &&
    "evidence" in findingEvidence
  ) {
    evidenceStr = findingEvidence.evidence;
  } else if ("evidence" in (action as unknown as Record<string, unknown>)) {
    const actEvidence = (action as unknown as Record<string, unknown>).evidence;
    if (typeof actEvidence === "string") {
      evidenceStr = actEvidence;
    }
  }

  if (typeof evidenceStr !== "string" || evidenceStr.trim().length === 0) {
    return false;
  }

  return true;
}

export class ReadsModule {
  private readonly baseUrl: string;
  private readonly schema: string;
  private readonly auth: AuthManager;
  private readonly timeoutMs: number;
  private readonly fetchFn: typeof fetch;

  constructor(auth: AuthManager, config: PimsAdapterConfig = {}) {
    this.auth = auth;
    this.baseUrl = (config.baseUrl ?? PIMS_CONFIG.DEFAULT_BASE_URL).replace(
      /\/+$/,
      "",
    );
    this.schema = config.schema ?? PIMS_CONFIG.DEFAULT_SCHEMA;
    this.timeoutMs = config.timeoutMs ?? PIMS_CONFIG.DEFAULT_TIMEOUT_MS;
    this.fetchFn = config.fetchFn ?? globalThis.fetch.bind(globalThis);
  }

  private async authenticatedFetch(
    url: string,
    init: RequestInit,
    endpointName: string,
  ): Promise<Response> {
    const token = await this.auth.getValidAccessToken();
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);
    headers.set("X-PIMS-Schema", this.schema);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      return await this.fetchFn(url, {
        ...init,
        headers,
        signal: controller.signal,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new PimsReadFailureError(
        endpointName,
        0,
        `Network or connection error during call to ${endpointName}: ${message}`,
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Lists audits from GET /api/audits/.
   * Uniform reads across all audits without read-side filtering.
   */
  async listAudits(
    params?: ListAuditsParams,
  ): Promise<PaginatedResult<PimsAudit>> {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);
    if (params?.page !== undefined) query.set("page", String(params.page));
    if (params?.page_size !== undefined) query.set("page_size", String(params.page_size));

    const qs = query.toString();
    const endpoint = `/api/audits/${qs ? `?${qs}` : ""}`;
    const url = `${this.baseUrl}${endpoint}`;

    const response = await this.authenticatedFetch(
      url,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      },
      endpoint,
    );

    if (!response.ok) {
      const errText = await response.text();
      let details: unknown = errText;
      try {
        details = JSON.parse(errText);
      } catch {
        // Keep raw text
      }
      throw new PimsReadFailureError(
        endpoint,
        response.status,
        `Failed to list audits: ${errText}`,
        details,
        response.statusText,
      );
    }

    const raw = (await response.json()) as unknown;
    return normalizePaginatedResponse<PimsAudit>(raw, endpoint);
  }

  /**
   * Retrieves a single audit by ID.
   */
  async getAudit(id: number): Promise<PimsAudit> {
    const endpoint = `/api/audits/${id}/`;
    const url = `${this.baseUrl}${endpoint}`;

    const response = await this.authenticatedFetch(
      url,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      },
      endpoint,
    );

    if (!response.ok) {
      const errText = await response.text();
      let details: unknown = errText;
      try {
        details = JSON.parse(errText);
      } catch {
        // Keep raw text
      }
      throw new PimsReadFailureError(
        endpoint,
        response.status,
        `Failed to get audit ${id}: ${errText}`,
        details,
        response.statusText,
      );
    }

    return (await response.json()) as PimsAudit;
  }

  /**
   * Resolves an audit by numeric ID or exact audit_code match.
   * If numeric, fetches directly via GET /api/audits/{id}/.
   * Otherwise searches by code and filters for an exact audit_code match.
   * Throws PimsNotFoundError on miss.
   */
  async resolveAudit(idOrCode: number | string): Promise<PimsAudit> {
    if (typeof idOrCode === "number") {
      return this.getAudit(idOrCode);
    }

    const trimmed = idOrCode.trim();
    if (/^\d+$/.test(trimmed)) {
      return this.getAudit(Number.parseInt(trimmed, 10));
    }

    const response = await this.listAudits({ search: trimmed });
    const exactMatches = response.results.filter(
      (audit) => audit.audit_code === trimmed,
    );

    if (exactMatches.length === 0) {
      throw new PimsNotFoundError("Audit", trimmed);
    }

    // Deterministic order: sort ascending by primary key id, taking first match
    exactMatches.sort((a, b) => a.id - b.id);
    return exactMatches[0];
  }

  /**
   * Deduplicates audit findings using a deterministic composite key:
   * (classification, description, action_plan, responsible).
   */
  dedupeAuditFindings(audit: PimsAudit): DedupeAuditFindingsResult {
    return dedupeAuditFindings(audit);
  }

  /**
   * Evaluates whether an audit action is closed and verified.
   */
  isActionClosedVerified(
    action: PimsAuditFindingAction,
    findingEvidence?: PimsAuditFinding | string | null,
  ): boolean {
    return isActionClosedVerified(action, findingEvidence);
  }

  /**
   * Lists risk evaluations from GET /api/risk-evaluations/.
   */
  async listRiskEvaluations(): Promise<PaginatedResult<PimsRiskEvaluation>> {
    const endpoint = "/api/risk-evaluations/";
    const url = `${this.baseUrl}${endpoint}`;

    const response = await this.authenticatedFetch(
      url,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      },
      endpoint,
    );

    if (!response.ok) {
      const errText = await response.text();
      let details: unknown = errText;
      try {
        details = JSON.parse(errText);
      } catch {
        // Keep raw text
      }
      throw new PimsReadFailureError(
        endpoint,
        response.status,
        `Failed to list risk evaluations: ${errText}`,
        details,
        response.statusText,
      );
    }

    const raw = (await response.json()) as unknown;
    return normalizePaginatedResponse<PimsRiskEvaluation>(raw, endpoint);
  }

  /**
   * Retrieves risk catalogs from GET /api/risk-evaluations/catalogs/.
   */
  async getRiskCatalogs(): Promise<PimsRiskCatalogResponse> {
    const endpoint = "/api/risk-evaluations/catalogs/";
    const url = `${this.baseUrl}${endpoint}`;

    const response = await this.authenticatedFetch(
      url,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      },
      endpoint,
    );

    if (!response.ok) {
      const errText = await response.text();
      let details: unknown = errText;
      try {
        details = JSON.parse(errText);
      } catch {
        // Keep raw text
      }
      throw new PimsReadFailureError(
        endpoint,
        response.status,
        `Failed to get risk catalogs: ${errText}`,
        details,
        response.statusText,
      );
    }

    return (await response.json()) as PimsRiskCatalogResponse;
  }

  /**
   * Lists assets from GET /api/assets/.
   */
  async listAssets(): Promise<PaginatedResult<PimsAsset>> {
    const endpoint = "/api/assets/";
    const url = `${this.baseUrl}${endpoint}`;

    const response = await this.authenticatedFetch(
      url,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      },
      endpoint,
    );

    if (!response.ok) {
      const errText = await response.text();
      let details: unknown = errText;
      try {
        details = JSON.parse(errText);
      } catch {
        // Keep raw text
      }
      throw new PimsReadFailureError(
        endpoint,
        response.status,
        `Failed to list assets: ${errText}`,
        details,
        response.statusText,
      );
    }

    const raw = (await response.json()) as unknown;
    return normalizePaginatedResponse<PimsAsset>(raw, endpoint);
  }

  /**
   * Retrieves eligible assets for risk evaluation from GET /api/risk-evaluations/eligible-assets/.
   */
  async getEligibleAssets(): Promise<PaginatedEligibleAssetsResult> {
    const endpoint = "/api/risk-evaluations/eligible-assets/";
    const url = `${this.baseUrl}${endpoint}`;

    const response = await this.authenticatedFetch(
      url,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      },
      endpoint,
    );

    if (!response.ok) {
      const errText = await response.text();
      let details: unknown = errText;
      try {
        details = JSON.parse(errText);
      } catch {
        // Keep raw text
      }
      throw new PimsReadFailureError(
        endpoint,
        response.status,
        `Failed to get eligible assets: ${errText}`,
        details,
        response.statusText,
      );
    }

    const raw = (await response.json()) as unknown;
    const paginated = normalizePaginatedResponse<PimsEligibleAsset>(
      raw,
      endpoint,
    );
    const scopeLabel =
      typeof raw === "object" && raw !== null && "scope_label" in raw
        ? String((raw as { scope_label?: unknown }).scope_label)
        : undefined;

    return {
      ...paginated,
      ...(scopeLabel !== undefined ? { scope_label: scopeLabel } : {}),
    };
  }

  /**
   * Retrieves dashboard KPIs from GET /api/dashboard/?tab={tab}.
   * Defaults tab to "summary".
   */
  async getDashboardKpis(tab = "summary"): Promise<PimsDashboardKpis> {
    const selectedTab = tab && tab.trim() !== "" ? tab.trim() : "summary";
    const endpoint = `/api/dashboard/?tab=${encodeURIComponent(selectedTab)}`;
    const url = `${this.baseUrl}${endpoint}`;

    const response = await this.authenticatedFetch(
      url,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      },
      endpoint,
    );

    if (!response.ok) {
      const errText = await response.text();
      let details: unknown = errText;
      try {
        details = JSON.parse(errText);
      } catch {
        // Keep raw text
      }
      throw new PimsReadFailureError(
        endpoint,
        response.status,
        `Failed to get dashboard KPIs: ${errText}`,
        details,
        response.statusText,
      );
    }

    return (await response.json()) as PimsDashboardKpis;
  }

  /**
   * Retrieves Annex-A controls metadata from GET /api/annex-a-controls/meta/.
   */
  async getAnnexAControlsMeta(): Promise<PimsAnnexAControlsMeta> {
    const endpoint = "/api/annex-a-controls/meta/";
    const url = `${this.baseUrl}${endpoint}`;

    const response = await this.authenticatedFetch(
      url,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      },
      endpoint,
    );

    if (!response.ok) {
      const errText = await response.text();
      let details: unknown = errText;
      try {
        details = JSON.parse(errText);
      } catch {
        // Keep raw text
      }
      throw new PimsReadFailureError(
        endpoint,
        response.status,
        `Failed to get Annex-A controls metadata: ${errText}`,
        details,
        response.statusText,
      );
    }

    return (await response.json()) as PimsAnnexAControlsMeta;
  }

  /**
   * Reads trainings from GET /api/trainings/.
   *
   * As documented in SPEC §3.1/§13, this endpoint returns HTTP 403 for tenant grupob4
   * because training records live as uploaded documents in PIMS.
   * This method catches 403 and throws PimsTrainingsForbiddenError as an EXPECTED
   * typed error rather than an unexpected crash.
   */
  async getTrainings(): Promise<never> {
    const endpoint = "/api/trainings/";
    const url = `${this.baseUrl}${endpoint}`;

    const response = await this.authenticatedFetch(
      url,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      },
      endpoint,
    );

    if (response.status === 403) {
      const errText = await response.text();
      let details: unknown = errText;
      try {
        details = JSON.parse(errText);
      } catch {
        // Keep raw text
      }
      throw new PimsTrainingsForbiddenError(endpoint, details);
    }

    if (!response.ok) {
      const errText = await response.text();
      let details: unknown = errText;
      try {
        details = JSON.parse(errText);
      } catch {
        // Keep raw text
      }
      throw new PimsReadFailureError(
        endpoint,
        response.status,
        `Failed to read trainings: ${errText}`,
        details,
        response.statusText,
      );
    }

    // Even if 200 is hypothetically returned, training records live as uploaded documents
    throw new PimsTrainingsForbiddenError(
      endpoint,
      "Trainings endpoint returned data but training records live as uploaded documents.",
    );
  }

  /**
   * Reads system catalogs from GET /api/system-catalogs/.
   * Returns a paginated result of system catalog definitions.
   * If a tenant lacks permission (HTTP 403), throws PimsTrainingsForbiddenError as expected.
   */
  async getSystemCatalogs(): Promise<PaginatedResult<PimsSystemCatalog>> {
    const endpoint = "/api/system-catalogs/";
    const url = `${this.baseUrl}${endpoint}`;

    const response = await this.authenticatedFetch(
      url,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      },
      endpoint,
    );

    if (response.status === 403) {
      const errText = await response.text();
      let details: unknown = errText;
      try {
        details = JSON.parse(errText);
      } catch {
        // Keep raw text
      }
      throw new PimsTrainingsForbiddenError(endpoint, details);
    }

    if (!response.ok) {
      const errText = await response.text();
      let details: unknown = errText;
      try {
        details = JSON.parse(errText);
      } catch {
        // Keep raw text
      }
      throw new PimsReadFailureError(
        endpoint,
        response.status,
        `Failed to read system-catalogs: ${errText}`,
        details,
        response.statusText,
      );
    }

    const raw = (await response.json()) as unknown;
    return normalizePaginatedResponse<PimsSystemCatalog>(raw, endpoint);
  }
}
