/**
 * Type definitions for GESTITEL PIMS Adapter.
 */

// ==========================================
// Status Enums & Mappings
// ==========================================

export type DocumentStatusUI =
  | "borrador"
  | "en_revision"
  | "vigente"
  | "obsoleto";

export type DocumentStatusAPI = "B" | "R" | "V" | "O";

// ==========================================
// Common & Pagination
// ==========================================

export interface PaginatedResult<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface PimsAuthTokens {
  access: string;
  refresh: string;
}

export interface PimsCredentials {
  username: string;
  password: string;
}

export interface PimsAdapterConfig {
  baseUrl?: string;
  schema?: string;
  timeoutMs?: number;
  maxRetries?: number;
  credentials?: PimsCredentials;
  secretHandle?: string;
  fetchFn?: typeof fetch;
}

// ==========================================
// Documents Types (SPEC §3.1)
// ==========================================

export interface PimsDocumentRelated {
  id: number;
  code: string;
  name: string;
}

export interface PimsDocument {
  id: number;
  code: string;
  current_version: string | number;
  name: string;
  category: string;
  status: DocumentStatusAPI;
  responsible: string;
  file: string;
  approved_at: string | null;
  approved_by_name: string | null;
  related_documents: PimsDocumentRelated[];
  gap_requirements: string[];
}

export interface CreateDocumentInput {
  code: string;
  name: string;
  category: string;
  status: DocumentStatusUI | DocumentStatusAPI;
  responsible: string;
  upload_file: Blob | Uint8Array | ArrayBuffer | File;
  fileName: string;
}

export interface PimsDocumentVersion {
  id: number;
  document?: number;
  document_id?: number;
  version?: string;
  version_number?: number;
  file: string;
  change_summary: string;
  created_at?: string;
  uploaded_at?: string;
  created_by_name?: string;
  uploaded_by_name?: string;
}

export interface AddDocumentVersionInput {
  file: Blob | Uint8Array | ArrayBuffer | File;
  change_summary: string;
  fileName: string;
}

export interface ListDocumentsParams {
  search?: string;
  category?: string;
  status?: DocumentStatusUI | DocumentStatusAPI;
  page?: number;
  page_size?: number;
}

// ==========================================
// Incidents Types
// ==========================================

export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentStatus = "open" | "investigating" | "resolved" | "closed";

export interface PimsIncidentAction {
  id?: number;
  action_description: string;
  due_date: string;
  responsible: string;
  status?: string;
}

export interface PimsIncident {
  id: number;
  code?: string;
  incident_code?: string;
  title: string;
  description: string;
  severity: IncidentSeverity | "L" | "M" | "H";
  status: IncidentStatus | "P" | "C";
  impact?: string;
  incident_type?: string;
  incident_date?: string;
  assigned_to?: string;
  reported_by?: string;
  responsible?: string;
  dpo_contact_name?: string;
  dpo_contact_email?: string;
  dpo_contact_phone?: string;
  rep_email?: string;
  involves_personal_data?: boolean;
  actions?: PimsIncidentAction[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateIncidentInput {
  code: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status?: IncidentStatus;
  incident_type: string;
  incident_date: string;
  responsible: string;
  involves_personal_data: boolean;
  actions?: PimsIncidentAction[];
}

export interface UpdateIncidentInput {
  code?: string;
  title?: string;
  description?: string;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  incident_type?: string;
  incident_date?: string;
  responsible?: string;
  involves_personal_data?: boolean;
  actions?: PimsIncidentAction[];
}

export interface PimsIncidentHistory {
  id: number;
  incident_id: number;
  action: string;
  details: string;
  timestamp: string;
  performed_by: string;
}

export interface PimsIncidentAttachment {
  id: number;
  incident_id: number;
  file: string;
  filename: string;
  file_size_bytes: number;
  uploaded_at: string;
  uploaded_by?: string;
}

export interface ListIncidentsParams {
  search?: string;
  status?: string;
  severity?: string;
  incident_type?: string;
  page?: number;
  page_size?: number;
}

// ==========================================
// Reads Types (Audits, Risks, Catalogs, Assets, KPIs, Annex-A)
// ==========================================

export interface PimsAuditFinding {
  id: number;
  description: string;
  severity: string;
  non_conformity?: string;
  responsible?: string;
  evidence_cite?: string;
}

export interface PimsAudit {
  id: number;
  code?: string;
  audit_code?: string;
  title?: string;
  name?: string;
  audit_type?: string;
  status?: string;
  responsible?: string;
  lead_auditor?: string;
  start_date?: string;
  end_date?: string;
  audit_date?: string;
  progress?: number;
  findings_count?: number;
  scope?: string;
  findings?: PimsAuditFinding[];
}

export interface ListAuditsParams {
  search?: string;
  status?: string;
  page?: number;
  page_size?: number;
}

export interface PimsRiskEvaluation {
  id: number;
  code: string;
  title: string;
  asset_id?: number;
  asset_name?: string;
  threat?: string;
  vulnerability?: string;
  likelihood?: number;
  impact?: number;
  score?: number;
  level?: string;
  responsible?: string;
}

export interface PimsRiskCatalogCategory {
  id: number;
  name: string;
  description: string;
}

export interface PimsRiskCatalogThreat {
  id: number;
  name: string;
  category_id: number;
}

export interface PimsRiskCatalogVulnerability {
  id: number;
  name: string;
  category_id?: number;
}

export interface PimsRiskCatalogResponse {
  categories: PimsRiskCatalogCategory[];
  threats: PimsRiskCatalogThreat[];
  vulnerabilities: PimsRiskCatalogVulnerability[];
}

export interface PimsAsset {
  id: number;
  code: string;
  name: string;
  type: string;
  owner?: string;
  criticality?: string;
  location?: string;
}

export interface PimsDashboardKpis {
  summary: Record<string, unknown>;
  incidents_count: number;
  open_incidents_count: number;
  audits_count: number;
  documents_count: number;
  risks_count?: number;
}

export interface PimsAnnexAControl {
  id: string;
  category_id: string;
  title: string;
  description?: string;
  implemented: boolean;
}

export interface PimsAnnexACategory {
  id: string;
  title: string;
  count: number;
}

export interface PimsAnnexAControlsMeta {
  total_controls: number;
  categories: PimsAnnexACategory[];
  controls: PimsAnnexAControl[];
}
