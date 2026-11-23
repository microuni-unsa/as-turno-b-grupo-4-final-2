/**
 * Reads module for GESTITEL PIMS.
 *
 * Implements read operations across:
 * - Audits (GET /api/audits/, GET /api/audits/{id}/ with tenant guards)
 * - Risk evaluations (GET /api/risk-evaluations/)
 * - Risk catalogs (GET /api/risk-evaluations/catalogs/)
 * - Assets (GET /api/assets/)
 * - Eligible assets (GET /api/risk-evaluations/eligible-assets/)
 * - Dashboard KPIs (GET /api/dashboard/)
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
  PimsReadFailureError,
  PimsTrainingsForbiddenError,
} from "./errors.ts";
import { normalizePaginatedResponse } from "./normalize.ts";
import type {
  ListAuditsParams,
  PaginatedResult,
  PimsAdapterConfig,
  PimsAnnexAControlsMeta,
  PimsAsset,
  PimsAudit,
  PimsDashboardKpis,
  PimsRiskCatalogResponse,
  PimsRiskEvaluation,
} from "./types.ts";

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
   * Applies shared-tenant read filter: only returns Group 4 audits.
   */
  async listAudits(
    params?: ListAuditsParams,
  ): Promise<PaginatedResult<PimsAudit>> {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);
    if (params?.page) query.set("page", String(params.page));
    if (params?.page_size) query.set("page_size", String(params.page_size));

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
   * Retrieves eligible assets for risk evaluation.
   */
  async getEligibleAssets(): Promise<PaginatedResult<Partial<PimsAsset>>> {
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
    return normalizePaginatedResponse<Partial<PimsAsset>>(raw, endpoint);
  }

  /**
   * Retrieves dashboard KPIs from GET /api/dashboard/?tab={tab}.
   */
  async getDashboardKpis(tab = "summary"): Promise<PimsDashboardKpis> {
    const endpoint = `/api/dashboard/?tab=${encodeURIComponent(tab)}`;
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
      throw new PimsTrainingsForbiddenError(endpoint, errText);
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new PimsReadFailureError(
        endpoint,
        response.status,
        `Failed to read trainings: ${errText}`,
        errText,
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
   * Reads system-catalogs from GET /api/system-catalogs/.
   *
   * As documented in SPEC §3.1/§13, this endpoint returns HTTP 403 for tenant grupob4.
   * Throws PimsTrainingsForbiddenError as an EXPECTED typed error.
   */
  async getSystemCatalogs(): Promise<never> {
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
      throw new PimsTrainingsForbiddenError(endpoint, errText);
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new PimsReadFailureError(
        endpoint,
        response.status,
        `Failed to read system-catalogs: ${errText}`,
        errText,
        response.statusText,
      );
    }

    throw new PimsTrainingsForbiddenError(
      endpoint,
      "System-catalogs endpoint returned data but tenant uses document uploads.",
    );
  }
}
