/**
 * Unified PIMS Client and Adapter.
 *
 * Combines Auth, Documents, Incidents, and Reads modules into a cohesive client.
 * Bun-compatible with zero build step required.
 */

import { AuthManager } from "./auth.ts";
import { PIMS_CONFIG } from "./config.ts";
import { DocumentsModule } from "./documents.ts";
import { IncidentsModule } from "./incidents.ts";
import { ReadsModule } from "./reads.ts";
import type {
  AddDocumentVersionInput,
  CreateDocumentInput,
  CreateIncidentInput,
  ListAuditsParams,
  ListDocumentsParams,
  ListIncidentsParams,
  PaginatedResult,
  PimsAdapterConfig,
  PimsAnnexAControlsMeta,
  PimsAsset,
  PimsAudit,
  PimsAuthTokens,
  PimsCredentials,
  PimsDashboardKpis,
  PimsDocument,
  PimsDocumentVersion,
  PimsIncident,
  PimsIncidentAttachment,
  PimsIncidentHistory,
  PimsRiskCatalogResponse,
  PimsRiskEvaluation,
  UpdateIncidentInput,
} from "./types.ts";

export class PimsClient {
  readonly auth: AuthManager;
  readonly documents: DocumentsModule;
  readonly incidents: IncidentsModule;
  readonly reads: ReadsModule;
  readonly baseUrl: string;
  readonly schema: string;

  constructor(config: PimsAdapterConfig = {}) {
    this.baseUrl = (config.baseUrl ?? PIMS_CONFIG.DEFAULT_BASE_URL).replace(
      /\/+$/,
      "",
    );
    this.schema = config.schema ?? PIMS_CONFIG.DEFAULT_SCHEMA;

    this.auth = new AuthManager(config);
    this.documents = new DocumentsModule(this.auth, config);
    this.incidents = new IncidentsModule(this.auth, config);
    this.reads = new ReadsModule(this.auth, config);
  }

  // --- Auth Shortcuts ---
  async login(credentials?: PimsCredentials): Promise<PimsAuthTokens> {
    return this.auth.login(credentials);
  }

  async refreshToken(token?: string): Promise<string> {
    return this.auth.refreshToken(token);
  }

  setTokens(access: string, refresh?: string): void {
    this.auth.setTokens(access, refresh);
  }

  // --- Documents Shortcuts (SPEC §3.1) ---
  async createDocument(input: CreateDocumentInput): Promise<PimsDocument> {
    return this.documents.createDocument(input);
  }

  async addDocumentVersion(
    id: number,
    input: AddDocumentVersionInput,
  ): Promise<PimsDocumentVersion> {
    return this.documents.addDocumentVersion(id, input);
  }

  async listDocuments(
    params?: ListDocumentsParams,
  ): Promise<PaginatedResult<PimsDocument>> {
    return this.documents.listDocuments(params);
  }

  async getDocument(id: number): Promise<PimsDocument> {
    return this.documents.getDocument(id);
  }

  async getDocumentVersions(id: number): Promise<PimsDocumentVersion[]> {
    return this.documents.getDocumentVersions(id);
  }

  async approveDocument(id: number): Promise<PimsDocument> {
    return this.documents.approveDocument(id);
  }

  // --- Incidents Shortcuts ---
  async listIncidents(
    params?: ListIncidentsParams,
  ): Promise<PaginatedResult<PimsIncident>> {
    return this.incidents.listIncidents(params);
  }

  async getIncident(id: number): Promise<PimsIncident> {
    return this.incidents.getIncident(id);
  }

  async createIncident(input: CreateIncidentInput): Promise<PimsIncident> {
    return this.incidents.createIncident(input);
  }

  async updateIncident(
    id: number,
    input: UpdateIncidentInput,
  ): Promise<PimsIncident> {
    return this.incidents.updateIncident(id, input);
  }

  async deleteIncident(id: number): Promise<void> {
    return this.incidents.deleteIncident(id);
  }

  async getIncidentHistory(id: number): Promise<PimsIncidentHistory[]> {
    return this.incidents.getIncidentHistory(id);
  }

  async getIncidentAttachments(id: number): Promise<PimsIncidentAttachment[]> {
    return this.incidents.getIncidentAttachments(id);
  }

  async uploadIncidentAttachment(
    id: number,
    file: Blob | Uint8Array | ArrayBuffer | File,
    fileName: string,
  ): Promise<PimsIncidentAttachment[]> {
    return this.incidents.uploadIncidentAttachment(id, file, fileName);
  }

  // --- Reads Shortcuts ---
  async listAudits(
    params?: ListAuditsParams,
  ): Promise<PaginatedResult<PimsAudit>> {
    return this.reads.listAudits(params);
  }

  async getAudit(id: number): Promise<PimsAudit> {
    return this.reads.getAudit(id);
  }

  async listRiskEvaluations(): Promise<PaginatedResult<PimsRiskEvaluation>> {
    return this.reads.listRiskEvaluations();
  }

  async getRiskCatalogs(): Promise<PimsRiskCatalogResponse> {
    return this.reads.getRiskCatalogs();
  }

  async listAssets(): Promise<PaginatedResult<PimsAsset>> {
    return this.reads.listAssets();
  }

  async getEligibleAssets(): Promise<PaginatedResult<Partial<PimsAsset>>> {
    return this.reads.getEligibleAssets();
  }

  async getDashboardKpis(tab?: string): Promise<PimsDashboardKpis> {
    return this.reads.getDashboardKpis(tab);
  }

  async getAnnexAControlsMeta(): Promise<PimsAnnexAControlsMeta> {
    return this.reads.getAnnexAControlsMeta();
  }

  async getTrainings(): Promise<never> {
    return this.reads.getTrainings();
  }

  async getSystemCatalogs(): Promise<never> {
    return this.reads.getSystemCatalogs();
  }
}

export { PimsClient as PimsAdapter };
