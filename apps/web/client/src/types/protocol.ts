/**
 * Exact REST & WebSocket contract shared with the UNSA PIMS Agentic Operator backend.
 */

export type UserRole = "rw" | "ro";

export type ThemeMode = "dark" | "light";

export interface StarterPromptConfig {
  id: string;
  title: string;
  badge: string;
  description?: string;
  prompt: string;
}

export interface BrandingConfig {
  appName: string;
  subtitle: string;
  shortBadge: string;
  primaryColor: string;
  accentColor: string;
  defaultTheme: ThemeMode;
  starterPrompts: StarterPromptConfig[];
}

export interface AuthMeResponse {
  authenticated: boolean;
  role: UserRole | null;
  authEnabled: boolean;
}

export interface AuthLoginResponse {
  role: UserRole;
}

export interface SessionSummary {
  id: string;
  filePath: string;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface SessionsListResponse {
  activeSessionId: string | null;
  activeSessionFile: string | null;
  sessions: SessionSummary[];
}

export interface SessionExportResponse {
  html: string;
  filename: string;
}

export interface UploadedFileRecord {
  id: string;
  fileName: string;
  extension: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  preservedPath: string;
  uploadedAt: string | number;
  previewSummary?: string | null;
  url: string;
  downloadUrl: string;
}

export interface PublishedFileSummary {
  slug: string;
  fileName: string;
  extension?: string;
  mimeType: string;
  sizeBytes: number;
  publishedAt: string | number;
  expiresAt?: string | number | null;
  url: string;
  downloadUrl: string;
  messageId?: string | null;
}

export interface FilesListResponse {
  published: PublishedFileSummary[];
  uploads: UploadedFileRecord[];
}

export interface SecretMetadataItem {
  handle: string;
  name: string;
  version: number;
  scope: string;
  createdAt: string;
  createdBy: string;
}

export interface PendingSecretRequestPublic {
  token: string;
  tokenHash: string;
  label: string;
  scope: string;
  createdAt: string;
  expiresAt: string;
  status: "pending" | "submitted" | "expired";
  url?: string;
}

export interface SecretsListResponse {
  secrets: SecretMetadataItem[];
  pending: PendingSecretRequestPublic[];
}

export interface CreateSecretResponse {
  handle: string;
  name: string;
  version: number;
  scope: string;
  createdAt: string;
  createdBy: string;
}

export interface SubmitSecretResponse {
  status: "submitted";
  handle: string;
}

export interface SystemStatusResponse {
  dbOk: boolean;
  pimsReachable: boolean;
  mirrorDocCount: number;
  agentModel: string | null;
  softRequestBudget: number;
  ompConnected: boolean;
  checkedAt: string;
}

export interface MirrorDocSummary {
  code: string;
  versions: string[];
  latestVersion: string;
  hasPdf: boolean;
  hasText: boolean;
}

export interface MirrorDocsResponse {
  docs: MirrorDocSummary[];
}

export interface MirrorExcerptResponse {
  doc: string;
  version: string;
  startLine: number;
  endLine: number;
  totalLines: number;
  text: string;
}

// ============================================================================
// LIVE SESSION & TRACE TYPES
// ============================================================================

export type AgentRunStatus = "idle" | "running" | "streaming" | "waiting_input" | "error";

export interface AgentRunState {
  status: AgentRunStatus;
  activeToolName?: string | null;
  startedAt?: number | null;
  error?: string | null;
  thinkingLevel?: string | null;
}

export type ToolCallStatus = "pending" | "running" | "success" | "error";

export interface TextMessagePart {
  type: "text";
  text: string;
}

export interface ThinkingMessagePart {
  type: "thinking";
  text: string;
  isStreaming?: boolean;
  durationMs?: number;
}

export interface ToolCallMessagePart {
  type: "tool_call";
  id: string;
  toolName: string;
  args: Record<string, unknown>;
  output?: string;
  status: ToolCallStatus;
  startedAt?: number;
  endedAt?: number;
  durationMs?: number;
  isError?: boolean;
}

export interface ImageMessagePart {
  type: "image";
  url?: string;
  data?: string;
  mimeType: string;
  fileName?: string;
}

export type ChatMessagePart =
  | TextMessagePart
  | ThinkingMessagePart
  | ToolCallMessagePart
  | ImageMessagePart;

export interface ChatMessageView {
  id: string;
  role: "user" | "assistant" | "system";
  createdAt: number;
  text: string;
  parts: ChatMessagePart[];
  attachments?: UploadedFileRecord[];
  publishedFiles?: PublishedFileSummary[];
  isStreaming?: boolean;
  model?: string | null;
  stopReason?: string | null;
}

export interface TodoItemView {
  id: string;
  content: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
}

export interface TodoPhaseView {
  id: string;
  name: string;
  tasks: TodoItemView[];
}

export interface SubagentView {
  id: string;
  name: string;
  status: "running" | "completed" | "error";
  task?: string;
  startedAt?: number;
  endedAt?: number;
}

export interface QueueStateView {
  steering: string[];
  followUp: string[];
}

export interface SessionStatsView {
  totalTokens: number;
  inputTokens?: number;
  outputTokens?: number;
  contextPercent: number;
  contextWindow?: number;
  costUsd?: number;
  turnCount?: number;
}

export type ExtensionUiKind =
  | "confirm"
  | "select"
  | "input"
  | "editor"
  | "ask"
  | "form";

export interface ExtensionUiField {
  key: string;
  label: string;
  type?: "text" | "password" | "textarea" | "select" | "boolean";
  placeholder?: string;
  required?: boolean;
  options?: Array<string | { label: string; value: string }>;
  defaultValue?: string | boolean;
}

export interface ExtensionUiRequestView {
  id: string;
  kind: ExtensionUiKind;
  title: string;
  message?: string;
  options?: Array<string | { label: string; value: string; description?: string }>;
  placeholder?: string;
  defaultValue?: string;
  secret?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  fields?: ExtensionUiField[];
  createdAt: number;
}

export interface LiveSessionSnapshot {
  sessionId: string | null;
  sessionFile: string | null;
  sessionTitle: string | null;
  messages: ChatMessageView[];
  runState: AgentRunState;
  todos: TodoPhaseView[];
  subagents: SubagentView[];
  queue: QueueStateView;
  stats: SessionStatsView | null;
  pendingUiRequests: ExtensionUiRequestView[];
  pendingSecretRequests: PendingSecretRequestPublic[];
  publishedFiles: PublishedFileSummary[];
}

export interface NoticeMessage {
  id: string;
  level: "info" | "warn" | "error";
  text: string;
  timestamp: number;
}

export type ServerWsMessage =
  | { type: "init_snapshot"; snapshot: LiveSessionSnapshot }
  | { type: "message_upsert"; message: ChatMessageView }
  | { type: "agent_state"; runState: AgentRunState }
  | { type: "todos_updated"; todos: TodoPhaseView[] }
  | { type: "subagents_updated"; subagents: SubagentView[] }
  | { type: "queue_updated"; queue: QueueStateView }
  | { type: "stats_updated"; stats: SessionStatsView }
  | { type: "session_changed"; snapshot: LiveSessionSnapshot }
  | { type: "file_published"; file: PublishedFileSummary; messageId: string | null }
  | { type: "secret_request_created"; request: PendingSecretRequestPublic }
  | { type: "secret_request_resolved"; tokenHash: string; label: string; handle: string }
  | { type: "ui_request"; request: ExtensionUiRequestView }
  | { type: "ui_request_cancelled"; id: string }
  | { type: "notice"; level: "info" | "warn" | "error"; text: string; timestamp: number }
  | { type: "error"; code: string; message: string };

export interface PromptImagePayload {
  data: string;
  mimeType: string;
  fileName?: string;
}

export type ClientWsMessage =
  | {
      type: "prompt";
      message: string;
      attachments?: UploadedFileRecord[];
      images?: PromptImagePayload[];
      streamingBehavior?: "steer" | "followUp";
    }
  | { type: "abort" }
  | { type: "new_session" }
  | { type: "switch_session"; sessionPath: string }
  | { type: "extension_ui_response"; id: string; response: unknown }
  | { type: "set_thinking_level"; level: string }
  | { type: "compact" };

export type PreviewTarget =
  | {
      kind: "file";
      title: string;
      fileName: string;
      mimeType: string;
      url: string;
      downloadUrl: string;
      sizeBytes?: number;
    }
  | {
      kind: "citation";
      raw: string;
      doc: string;
      version: string;
      chunkId: string;
      lines: string;
    };
