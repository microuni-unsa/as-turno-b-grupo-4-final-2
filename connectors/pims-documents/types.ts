/**
 * Document types and interfaces for the PIMS Documents connector.
 * Re-exports and extends base adapter definitions from packages/pims-adapter without duplicating logic.
 */

import type {
  AddDocumentVersionInput,
  CreateDocumentInput as AdapterCreateDocumentInput,
  DocumentStatusAPI,
  DocumentStatusUI,
  ListDocumentsParams,
  PimsAdapterConfig,
  PimsAuthTokens,
  PimsCredentials,
  PimsDocument,
  PimsDocumentRelated,
  PimsDocumentVersion,
} from "../../packages/pims-adapter/types";

// Re-export base types directly from packages/pims-adapter without duplicating logic
export type {
  AddDocumentVersionInput,
  DocumentStatusAPI,
  DocumentStatusUI,
  ListDocumentsParams,
  PimsAdapterConfig,
  PimsAuthTokens,
  PimsCredentials,
  PimsDocument,
  PimsDocumentRelated,
  PimsDocumentVersion,
};

// Maintain compatibility aliases for UI and API status
export type DocumentUiStatus = DocumentStatusUI;
export type DocumentApiStatus = DocumentStatusAPI;

// Extended connector record type enhancing base PimsDocument with UI-mapped status
export interface PimsDocumentRecord extends Omit<PimsDocument, "status"> {
  status: DocumentUiStatus;
  api_status: DocumentApiStatus;
}

// Extended connector version record extending PimsDocumentVersion
export interface PimsDocumentVersionRecord extends PimsDocumentVersion {
  created_at: string;
  created_by?: string;
}

// Connector input for document creation extending base adapter create input
export interface CreateDocumentInput extends Omit<AdapterCreateDocumentInput, "status" | "upload_file"> {
  status: DocumentUiStatus;
  fileBuffer: Buffer | Uint8Array;
  fileName: string;
}

// Connector input for new version creation
export interface NewVersionInput extends Omit<AddDocumentVersionInput, "file"> {
  documentId: number;
  fileBuffer: Buffer | Uint8Array;
  fileName: string;
  changeSummary: string;
}

// Filter parameters for listing documents with multi-tenant filtering
export interface ListDocumentsFilter extends ListDocumentsParams {
  codePrefix?: string;
  responsible?: string;
}

// Response structure for document approval endpoint
export interface ApproveDocumentResponse {
  id: number;
  status: DocumentUiStatus;
  approved_at: string;
  approved_by_name: string;
}

export interface PimsLoginCredentials {
  username: string;
  password?: string;
  passwordHandle?: string;
}
