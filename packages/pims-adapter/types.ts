/**
 * Type definitions for GESTITEL PIMS Adapter.
 *
 * Strict live production types verified against https://unsa.27k.pe (schema: unsa)
 * based on ground-truth probes docs/probe/01-auth-documents.md through 05-discovery.md.
 */

// ==========================================
// Status & Category Enums & Mappings
// ==========================================

export type DocumentStatusUI =
  | "borrador"
  | "en_revision"
  | "vigente"
  | "obsoleto";

export type DocumentStatusAPI = "B" | "R" | "V" | "O";

export type DocumentCategory = "PO" | "PR" | "RE" | "IN";

export type IncidentSeverityAPI = "L" | "M" | "H" | "C";

export type IncidentStatusAPI = "O" | "P" | "C";

export type IncidentSeverity = IncidentSeverityAPI;

export type IncidentStatus = IncidentStatusAPI;

export type IncidentTypeCode =
  | "UA"
  | "DL"
  | "MW"
  | "PH"
  | "DS"
  | "HE"
  | "DV"
  | "OT";

export type IncidentImpactCode = "L" | "M" | "H" | "V";

export type AuditStatusAPI = "P" | "R" | "C";

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
// Documents Types (SPEC §2.2 + PROBE-01)
// ==========================================

export interface PimsDocumentRelated {
  id: number;
  code: string;
  name: string;
}

export interface PimsDocument {
  id: number;
  code: string;
  current_version: string;
  name: string;
  category: DocumentCategory;
  status: DocumentStatusAPI;
  responsible: string;
  file: string;
  approved_at: string | null;
  approved_by?: number | null;
  approved_by_name: string | null;
  related_documents: PimsDocumentRelated[];
  gap_requirements: string[];
  created_at?: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
  is_deleted?: boolean;
  deleted_at?: string | null;
  deleted_by?: number | null;
}

export interface CreateDocumentInput {
  code: string;
  name: string;
  category: DocumentCategory;
  status: DocumentStatusUI | DocumentStatusAPI;
  responsible: string;
  upload_file: Blob | Uint8Array | ArrayBuffer | File;
  fileName: string;
}

export interface PimsDocumentVersion {
  id: number;
  document: number;
  version: string;
  file: string;
  change_summary: string;
  created_at: string;
  created_by: number;
  created_by_name: string;
}

export interface AddDocumentVersionInput {
  file: Blob | Uint8Array | ArrayBuffer | File;
  change_summary: string;
  fileName: string;
}

export interface ListDocumentsParams {
  search?: string;
  category?: DocumentCategory;
  status?: DocumentStatusUI | DocumentStatusAPI;
  page?: number;
  page_size?: number;
}

// ==========================================
// Incidents Types (SPEC §2.3 + PROBE-02)
// ==========================================

export interface PimsIncidentAction {
  action_type: "C" | "A" | "R" | string;
  responsible?: string;
  action_date?: string;
  description: string;
  evidence?: string | null;
  position?: number;
}

export interface PimsIncidentHistory {
  id: number;
  event_type: string;
  event_type_label: string;
  changed_at: string;
  actor: string;
  changed_by: number;
  changed_by_name: string;
  description: string;
  recipients_snapshot: string | null;
}

export interface PimsIncidentAttachment {
  id: number;
  file: string;
  file_name: string;
  uploaded_at: string;
  uploaded_by: number;
  uploaded_by_name: string;
}

export interface PimsIncident {
  id: number;
  incident_code: string;
  title: string;
  description?: string | null;
  incident_type?: IncidentTypeCode;
  status: IncidentStatusAPI;
  severity: IncidentSeverityAPI;
  impact?: IncidentImpactCode | string | null;
  incident_date?: string;
  incident_time?: string | null;
  detection_date?: string | null;
  detection_time?: string | null;
  resolved_date?: string | null;
  involves_personal_data?: boolean;
  reported_by?: string | null;
  assigned_to?: string | null;
  responsible?: string;
  affected_treatment?: string | null;
  compromised_system?: string | null;
  affected_url?: string | null;
  evidence_refs?: string | null;
  num_affected_subjects?: number | null;
  affected_data_types?: string[];
  security_measures_adopted?: string[];
  affected_cid?: string[];
  measure_updated_registry?: "Y" | "N" | "U" | string | null;
  measure_new_security?: "Y" | "N" | "U" | string | null;
  measure_improved_policies?: "Y" | "N" | "U" | string | null;
  measure_considered_resolved?: "Y" | "N" | "U" | string | null;
  measure_reported_authorities?: "Y" | "N" | "U" | string | null;
  actions?: PimsIncidentAction[];
  actions_count?: number;
  attachments?: PimsIncidentAttachment[];
  attachments_count?: number;
  history?: PimsIncidentHistory[];
  created_at?: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
  dpo_contact_name?: string | null;
  dpo_contact_email?: string | null;
  dpo_contact_phone?: string | null;
  rep_first_name?: string | null;
  rep_last_name_p?: string | null;
  rep_last_name_m?: string | null;
  rep_position?: string | null;
  rep_phone?: string | null;
  rep_email?: string | null;
  rep_document_number?: string | null;
  rep_document_expiry?: string | null;
  entity_type?: "R" | "U" | string | null;
  entity_ruc?: string | null;
  entity_name?: string | null;
  entity_phone?: string | null;
  entity_extension?: string | null;
  entity_department?: string | null;
  entity_province?: string | null;
  entity_district?: string | null;
}

export interface CreateIncidentInput {
  incident_code: string;
  /** @deprecated Legacy alias for incident_code; prefer incident_code. */
  code?: string;
  title: string;
  description?: string;
  incident_type?: IncidentTypeCode;
  incident_date: string;
  status?: IncidentStatusAPI;
  severity?: IncidentSeverityAPI;
  impact?: IncidentImpactCode | string;
  responsible?: string;
  involves_personal_data?: boolean;
  actions?: PimsIncidentAction[];
  dpo_contact_name?: string;
  dpo_contact_email?: string;
  dpo_contact_phone?: string;
  rep_email?: string;
}

export interface UpdateIncidentInput {
  incident_code?: string;
  /** @deprecated Legacy alias for incident_code; prefer incident_code. */
  code?: string;
  title?: string;
  description?: string;
  incident_type?: IncidentTypeCode;
  incident_date?: string;
  status?: IncidentStatusAPI;
  severity?: IncidentSeverityAPI;
  impact?: IncidentImpactCode | string;
  responsible?: string;
  involves_personal_data?: boolean;
  actions?: PimsIncidentAction[];
  dpo_contact_name?: string;
  dpo_contact_email?: string;
  dpo_contact_phone?: string;
  rep_email?: string;
}

export interface ListIncidentsParams {
  search?: string;
  status?: IncidentStatusAPI;
  severity?: IncidentSeverityAPI;
  incident_type?: IncidentTypeCode | string;
  page?: number;
  page_size?: number;
}

// ==========================================
// Audits Types (SPEC §2.4 + PROBE-03)
// ==========================================

export interface PimsAuditFindingAction {
  action_plan: string;
  responsible: string;
  due_date: string;
  status: string;
  progress: number | null;
  closed_at: string | null;
  position: number;
  is_overdue: boolean;
}

export interface PimsAuditFinding {
  classification: string;
  description: string;
  evidence: string | null;
  position: number;
  actions: PimsAuditFindingAction[];
}

export interface PimsAudit {
  id: number;
  audit_code: string;
  audit_type: string;
  name: string;
  scope?: string | null;
  objective?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  lead_auditor?: string | null;
  audit_team?: string | null;
  involved_areas?: string | null;
  status: string;
  progress: number;
  checklist?: unknown[];
  findings: PimsAuditFinding[];
  findings_count?: number;
  created_at?: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
}

export interface ListAuditsParams {
  search?: string;
  status?: AuditStatusAPI;
  page?: number;
  page_size?: number;
}

// ==========================================
// Risks Types (SPEC §2.5 + PROBE-04)
// ==========================================

export interface PimsRiskEvaluation {
  id: number;
  risk_code: string;
  risk_owner?: string | null;
  period?: number | null;
  period_name?: string;
  period_status?: string;
  is_locked?: boolean;
  carried_from?: number | null;
  carried_from_code?: string | null;
  carried_from_period?: string | null;
  is_carried?: boolean;
  threat_code?: string | null;
  threat?: string | null;
  vulnerability_code?: string | null;
  vulnerability?: string | null;
  description: string;
  controlled_probability: number;
  controlled_impact: number;
  controlled_score?: number | string;
  controlled_severity?: string;
  response_strategy?: "M" | "A" | "T" | "E" | string | null;
  residual_probability?: number | null;
  residual_impact?: number | null;
  residual_score?: number | string | null;
  residual_severity?: string | null;
  reduction?: number | string | null;
  is_effective?: "P" | "Y" | "N" | string | null;
  verification_date?: string | null;
  verified_by?: string | null;
  evidence?: string | null;
  observations?: string | null;
  status?: "O" | "T" | "C" | string;
  assets?: number[];
  treatments?: unknown[];
  assets_count?: number;
  is_data_privacy?: boolean;
  requires_treatment?: boolean;
  pending_treatment?: boolean;
  review_status?: string;
  created_at?: string;
  created_by?: number;
  updated_at?: string;
  updated_by?: number;
}

export interface PimsRiskPeriod {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  status: string;
  is_active: boolean;
}

export interface PimsRiskCatalogItem {
  code: string;
  label: string;
  category: string | null;
  subtype: string | null;
}

export interface PimsAppraisalBand {
  name: string;
  color_code: string;
  min_value: string;
  max_value: string;
}

export interface PimsProcessOption {
  code: string;
  name: string;
}

export interface PimsComplianceStandard {
  code: string;
  label: string;
  short_label: string;
}

export interface PimsCatalogAnnexAControl {
  code: string;
  name: string;
  group_code: string;
  group_name: string;
  applicable_role: string;
  description: string;
  source_standard: string;
}

export interface PimsActiveMatrix {
  dimension: number;
  risk_ranges: Record<string, { min: number; max: number }>;
}

export interface PimsRiskCatalogResponse {
  periods: PimsRiskPeriod[];
  current_period: PimsRiskPeriod | null;
  threats: PimsRiskCatalogItem[];
  vulnerabilities: PimsRiskCatalogItem[];
  control_types: PimsRiskCatalogItem[];
  security_measure_types: PimsRiskCatalogItem[];
  estimated_times: PimsRiskCatalogItem[];
  asset_categories: PimsRiskCatalogItem[];
  asset_classifications: PimsRiskCatalogItem[];
  appraisal_bands: PimsAppraisalBand[];
  process_options: PimsProcessOption[];
  compliance_standard: PimsComplianceStandard;
  annex_a_controls: PimsCatalogAnnexAControl[];
  applicable_annex_a_controls: PimsCatalogAnnexAControl[];
  active_matrix: PimsActiveMatrix;
  risk_treatment_levels: string[];
  risk_treatment_levels_label: string;
  asset_scope_label: string;
}

// ==========================================
// Assets Types (SPEC §2.5 + PROBE-04)
// ==========================================

export interface PimsEligibleAsset {
  code: string;
  name: string;
  category: string;
  classification: string;
  process: string;
  process_code: string;
  location: string;
  confidentiality: string;
  integrity: string;
  availability: string;
  asset_value: string;
  appraisal_band: {
    label: string;
    color_code: string;
  };
  is_data_asset: boolean;
}

export interface PaginatedEligibleAssetsResult extends PaginatedResult<PimsEligibleAsset> {
  scope_label?: string;
}

export interface PimsAssetAppraisalBand {
  label: string;
  color_code: string;
}

export interface PimsAsset {
  id: number;
  process: string;
  process_name: string;
  appraisal_band: PimsAssetAppraisalBand;
  risk_eligible: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
  code: string;
  legacy_code: string | null;
  name: string;
  description: string;
  owner: string;
  custodians: string | null;
  location: string;
  is_data_asset: boolean;
  category: string;
  classification: string;
  usage_frequency: string | null;
  confidentiality: string;
  integrity: string;
  availability: string;
  cid_method: string;
  weight_confidentiality: string;
  weight_integrity: string;
  weight_availability: string;
  asset_value: string;
  purpose: string | null;
  data_categories: string[];
  role: string | null;
  pii_controls: string[];
  legal_basis: string | null;
  purpose_detail: string | null;
  collection_origin: string | null;
  collection_procedure: string | null;
  data_usage: string | null;
  retention_period: string | null;
  disposal_method: string | null;
  third_party_transfer: boolean;
  national_transfers: unknown[];
  cross_border_flow: boolean;
  international_flows: unknown[];
  times_compromised: number | null;
  processes_affected: string | null;
  loss_range: string | null;
  relevance: string;
  created_by: number;
  updated_by: number | null;
  deleted_by: number | null;
}

// ==========================================
// Dashboard Types (SPEC §2.5 + PROBE-04)
// ==========================================

export interface PimsDashboardKpiItem {
  key: string;
  label: string;
  domain: string;
  domain_label: string;
  description: string;
  value: number | null;
  unit: string;
  direction: string;
  target: number | null;
  warning: number | null;
  has_target: boolean;
  status: string;
  has_data: boolean;
  reason?: string | null;
  numerator?: number | null;
  denominator?: number | null;
  caption?: string;
  is_default_target?: boolean;
}

export interface PimsDashboardSemaphore {
  key: string;
  label: string;
  status: string;
  kpis_ok: number;
  kpis_total: number;
  detail: string;
}

export interface PimsDashboardSeriesPoint {
  month: string;
  value: number | null;
  has_data: boolean;
  captured_at: string;
}

export interface PimsDashboardSeriesLine {
  key: string;
  label: string;
  points: PimsDashboardSeriesPoint[];
}

export interface PimsDashboardSeries {
  months: string[];
  gap_after: string[];
  lines: PimsDashboardSeriesLine[];
  notice?: string;
}

export interface PimsDashboardTabItem {
  key: string;
  label: string;
}

export interface PimsDashboardRiskPeriod {
  id: number;
  name: string;
  status: string;
  is_active: boolean;
  is_locked: boolean;
}

export interface PimsDashboardChart {
  key: string;
  type: string;
  title: string;
  data: unknown;
}

export interface PimsDashboardKpis {
  tab: string;
  tabs: PimsDashboardTabItem[];
  generated_at: string;
  kpis: PimsDashboardKpiItem[];
  charts: PimsDashboardChart[];
  has_any_data: boolean;
  has_sgsi_data: boolean;
  empty_reason: string | null;
  message?: string;
  risk_period?: PimsDashboardRiskPeriod | null;
  semaphores?: PimsDashboardSemaphore[];
  series?: PimsDashboardSeries;
  global_notice?: string | null;
}

// ==========================================
// Annex-A Controls & Metadata (SPEC §2.5 + PROBE-04)
// ==========================================

export interface PimsAnnexAStandard {
  code: string;
  label: string;
  annex_label: string;
  total_controls: number;
  is_superseded: boolean;
}

export interface PimsAnnexAGroup {
  code: string;
  name: string;
  count: number;
}

/**
 * Category/group in Annex-A metadata.
 * Alias to PimsAnnexAGroup for backwards compatibility with existing callers.
 */
export type PimsAnnexACategory = PimsAnnexAGroup;

export interface PimsAnnexARole {
  code: string;
  label: string;
  count: number;
}

export interface PimsAnnexASource {
  code: string;
  label: string;
  count: number;
}

export interface PimsAnnexAControl {
  code: string;
  name: string;
  group_code: string;
  group_name: string;
  applicable_role: string;
  description: string;
  source_standard: string;
}

export interface PimsAnnexAControlsMeta {
  standard: PimsAnnexAStandard;
  groups: PimsAnnexAGroup[];
  roles: PimsAnnexARole[];
  sources: PimsAnnexASource[];
  has_law_29733: boolean;
}
