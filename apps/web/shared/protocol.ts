export type AuthRole = "rw" | "ro";

export interface BrandingStarterPrompt {
  id?: string;
  title: string;
  clause: string;
  badge?: string;
  description?: string;
  prompt: string;
}

export interface BrandingConfig {
  appName: string;
  subtitle: string;
  shortBadge: string;
  primaryColor: string;
  accentColor: string;
  defaultTheme: "dark" | "light";
  starterPrompts: BrandingStarterPrompt[];
}

export interface UploadedFileRecord {
  id: string;
  fileName: string;
  extension: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  preservedPath: string;
  uploadedAt: number;
  previewSummary: string;
  url: string;
  downloadUrl: string;
}

export interface PublishedFileSummary {
  slug: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  createdAt: number;
  expiresAt: number;
  url: string;
  downloadUrl: string;
}

export interface SecretMetadataItem {
  name: string;
  version: number;
  handle: string;
  createdAt: string;
  createdBy: string;
  scope: string;
}

export interface PendingSecretRequestPublic {
  requestId: string;
  token: string;
  label: string;
  scope: string;
  createdAt: string;
  expiresAt: string;
}

export interface ToolCallPart {
  type: "tool_call";
  toolCallId: string;
  toolName: string;
  args: unknown;
  argsRaw?: string;
  status: "streaming" | "running" | "completed" | "error";
  output: string;
  isError?: boolean;
  startedAt: number;
  completedAt?: number;
}

export interface ThinkingPart {
  type: "thinking";
  id: string;
  text: string;
  isStreaming: boolean;
  startedAt: number;
  completedAt?: number;
}

export interface TextPart {
  type: "text";
  id: string;
  text: string;
}

export interface ImagePart {
  type: "image";
  mimeType: string;
  data: string;
}

export type MessagePart = ThinkingPart | TextPart | ToolCallPart | ImagePart;

export interface ChatMessageView {
  id: string;
  role: "user" | "assistant" | "system";
  timestamp: number;
  parts: MessagePart[];
  isStreaming?: boolean;
  attachments?: UploadedFileRecord[];
  publishedFiles?: PublishedFileSummary[];
}

export type TodoItemStatus = "pending" | "in_progress" | "done" | "blocked";

export interface TodoItemView {
  text: string;
  status: TodoItemStatus;
  reason?: string;
}

export interface TodoPhaseView {
  phase: string;
  items: TodoItemView[];
}

export type SubagentStatus = "running" | "completed" | "failed" | "aborted";

export interface SubagentView {
  id: string;
  name?: string;
  agent?: string;
  status: SubagentStatus;
  summary?: string;
  updatedAt: number;
}

export interface ExtensionUiQuestionOption {
  label: string;
  description?: string;
  preview?: string;
}

export interface ExtensionUiQuestion {
  id: string;
  question: string;
  header?: string;
  options: ExtensionUiQuestionOption[];
  multi?: boolean;
  recommended?: number;
}

export interface ExtensionUiRequestView {
  id: string;
  method: "confirm" | "select" | "input" | "editor" | "ask" | "form";
  title?: string;
  message?: string;
  placeholder?: string;
  secret?: boolean;
  options?: string[];
  optionDetails?: Array<{ description?: string }>;
  selectionMarker?: "radio" | "checkbox";
  checkedIndices?: number[];
  questions?: ExtensionUiQuestion[];
  html?: string;
  timeout?: number;
  createdAt: number;
}

export type ExtensionUiResponsePayload =
  | { value: string }
  | { confirmed: boolean }
  | { cancelled: true; timedOut?: boolean }
  | {
      answers: Array<{
        id: string;
        selectedOptions: string[];
        customInput?: string;
      }>;
    }
  | { data: Record<string, string | number | string[]> };

export interface SessionSummary {
  id: string;
  filePath: string;
  title: string;
  updatedAt: number;
  messageCount: number;
  isActive: boolean;
}

export interface SessionStatsView {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  contextPercent: number;
  contextWindow: number;
  costUsd: number;
  turnCount: number;
  softRequestBudget: number;
  model: string | null;
  thinkingLevel: string | null;
}

export interface QueueStateView {
  steering: string[];
  followUp: string[];
}

export type AgentRunPhase =
  | "idle"
  | "thinking"
  | "tool"
  | "responding"
  | "compacting"
  | "retrying";

export interface AgentRunState {
  isRunning: boolean;
  phase: AgentRunPhase;
  activeToolName: string | null;
  ompConnected: boolean;
  lastError: string | null;
}

export interface LiveSessionSnapshot {
  role: AuthRole;
  activeSessionId: string | null;
  activeSessionFile: string | null;
  messages: ChatMessageView[];
  runState: AgentRunState;
  todos: TodoPhaseView[];
  subagents: SubagentView[];
  pendingUiRequests: ExtensionUiRequestView[];
  pendingSecretRequests: PendingSecretRequestPublic[];
  queue: QueueStateView;
  stats: SessionStatsView;
}

export type ClientWsMessage =
  | {
      type: "prompt";
      message: string;
      attachments?: UploadedFileRecord[];
      images?: Array<{ mimeType: string; data: string }>;
      streamingBehavior?: "steer" | "followUp";
    }
  | { type: "abort" }
  | { type: "new_session" }
  | { type: "switch_session"; sessionPath: string }
  | {
      type: "extension_ui_response";
      id: string;
      response: ExtensionUiResponsePayload;
    }
  | { type: "set_thinking_level"; level: string }
  | { type: "compact" };

export type ServerWsMessage =
  | { type: "init_snapshot"; snapshot: LiveSessionSnapshot }
  | { type: "message_upsert"; message: ChatMessageView }
  | { type: "agent_state"; runState: AgentRunState }
  | { type: "todos_updated"; todos: TodoPhaseView[] }
  | { type: "subagents_updated"; subagents: SubagentView[] }
  | { type: "queue_updated"; queue: QueueStateView }
  | { type: "stats_updated"; stats: SessionStatsView }
  | { type: "session_changed"; snapshot: LiveSessionSnapshot }
  | {
      type: "file_published";
      file: PublishedFileSummary;
      messageId: string | null;
    }
  | {
      type: "secret_request_created";
      request: PendingSecretRequestPublic;
    }
  | {
      type: "secret_request_resolved";
      tokenHash: string;
      label: string;
      handle: string;
    }
  | { type: "ui_request"; request: ExtensionUiRequestView }
  | { type: "ui_request_cancelled"; id: string }
  | {
      type: "notice";
      level: "info" | "warn" | "error";
      text: string;
      timestamp: number;
    }
  | { type: "error"; code: string; message: string };

export interface PimsSystemStatus {
  dbOk: boolean;
  pimsReachable: boolean;
  mirrorDocCount: number;
  agentModel: string | null;
  softRequestBudget: number;
  checkedAt: number;
}

export interface MirrorDocVersionSummary {
  version: string;
  hasPdf: boolean;
  hasText: boolean;
  date?: string;
  sha256?: string;
  sizeBytes?: number;
}

export interface MirrorDocSummary {
  code: string;
  title: string;
  latestVersion: string | null;
  updatedAt: string | null;
  versions: MirrorDocVersionSummary[];
}

export interface MirrorCitationExcerpt {
  docCode: string;
  version: string;
  title: string;
  startLine: number;
  endLine: number;
  totalLines: number;
  lines: Array<{ lineNumber: number; text: string }>;
  text: string;
  pdfAvailable: boolean;
}
