import path from "node:path";
import type {
  AgentRunState as FrontendAgentRunState,
  BrandingConfig as FrontendBrandingConfig,
  ChatMessagePart as FrontendChatMessagePart,
  ChatMessageView as FrontendChatMessageView,
  ExtensionUiRequestView as FrontendExtensionUiRequestView,
  LiveSessionSnapshot as FrontendLiveSessionSnapshot,
  MirrorDocSummary as FrontendMirrorDocSummary,
  MirrorExcerptResponse as FrontendMirrorExcerptResponse,
  PendingSecretRequestPublic as FrontendPendingSecretRequestPublic,
  PublishedFileSummary as FrontendPublishedFileSummary,
  ServerWsMessage as FrontendServerWsMessage,
  SessionStatsView as FrontendSessionStatsView,
  SessionSummary as FrontendSessionSummary,
  SubagentView as FrontendSubagentView,
  TodoItemView as FrontendTodoItemView,
  TodoPhaseView as FrontendTodoPhaseView,
  ToolCallStatus as FrontendToolCallStatus,
  UploadedFileRecord as FrontendUploadedFileRecord,
} from "../client/src/types/protocol.ts";
import type {
  AgentRunState as SharedAgentRunState,
  AuthRole,
  BrandingConfig as SharedBrandingConfig,
  ChatMessageView as SharedChatMessageView,
  ExtensionUiRequestView as SharedExtensionUiRequestView,
  ExtensionUiResponsePayload as SharedExtensionUiResponsePayload,
  LiveSessionSnapshot as SharedLiveSessionSnapshot,
  MessagePart as SharedMessagePart,
  MirrorCitationExcerpt as SharedMirrorCitationExcerpt,
  MirrorDocSummary as SharedMirrorDocSummary,
  PendingSecretRequestPublic as SharedPendingSecretRequestPublic,
  PublishedFileSummary as SharedPublishedFileSummary,
  ServerWsMessage as SharedServerWsMessage,
  SessionStatsView as SharedSessionStatsView,
  SessionSummary as SharedSessionSummary,
  SubagentView as SharedSubagentView,
  TodoItemStatus as SharedTodoItemStatus,
  TodoPhaseView as SharedTodoPhaseView,
  ToolCallPart as SharedToolCallPart,
  UploadedFileRecord as SharedUploadedFileRecord,
} from "../shared/protocol.ts";
import type {
  PublishedFileSummary as FilesServicePublishedFileSummary,
  UploadedFileRecord as FilesServiceUploadedFileRecord,
} from "./files/service.ts";
import type {
  PendingSecretRequestPublic as SecretsServicePendingPublic,
  SecretRequestCreatedEvent,
} from "./secrets/service.ts";

export type BackendPublishedFileInput =
  | FilesServicePublishedFileSummary
  | SharedPublishedFileSummary;

export type BackendUploadedFileInput =
  | FilesServiceUploadedFileRecord
  | SharedUploadedFileRecord;

export type BackendPendingSecretInput =
  | (SecretsServicePendingPublic & { token: string })
  | SecretRequestCreatedEvent
  | SharedPendingSecretRequestPublic;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractRelativeUrl(rawUrl: string, fallback: string): string {
  if (rawUrl.startsWith("/")) {
    return rawUrl;
  }
  try {
    const parsed = new URL(rawUrl);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return fallback;
  }
}

export function toSharedPublishedFile(
  item: FilesServicePublishedFileSummary,
): SharedPublishedFileSummary {
  const createdAt = Date.parse(item.created_at);
  const expiresAt = Date.parse(item.expires_at);
  return {
    slug: item.slug,
    filename: item.filename,
    contentType: item.content_type,
    sizeBytes: item.size_bytes,
    createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
    expiresAt: Number.isFinite(expiresAt) ? expiresAt : Date.now(),
    url: item.relative_url,
    downloadUrl: item.relative_download_url,
  };
}

export function toFrontendPublishedFile(
  item: BackendPublishedFileInput,
): FrontendPublishedFileSummary {
  const ext = path.extname(item.filename).replace(/^\./, "").toLowerCase();
  const isFilesServiceShape = "content_type" in item;
  const mimeType = isFilesServiceShape ? item.content_type : item.contentType;
  const sizeBytes = isFilesServiceShape ? item.size_bytes : item.sizeBytes;
  const publishedAt = isFilesServiceShape ? item.created_at : item.createdAt;
  const expiresAt = isFilesServiceShape ? item.expires_at : item.expiresAt;
  const fallbackUrl = `/api/files/${encodeURIComponent(item.slug)}`;
  const fallbackDownloadUrl = `${fallbackUrl}?download=1`;
  const url = isFilesServiceShape
    ? item.relative_url
    : extractRelativeUrl(item.url, fallbackUrl);
  const downloadUrl = isFilesServiceShape
    ? item.relative_download_url
    : extractRelativeUrl(item.downloadUrl, fallbackDownloadUrl);

  return {
    slug: item.slug,
    fileName: item.filename,
    ...(ext.length > 0 ? { extension: ext } : {}),
    mimeType,
    sizeBytes,
    publishedAt,
    expiresAt,
    url,
    downloadUrl,
  };
}

export function toFrontendUploadedFile(
  item: BackendUploadedFileInput,
): FrontendUploadedFileRecord {
  const baseUrl = `/api/uploads/${encodeURIComponent(item.id)}`;
  return {
    id: item.id,
    fileName: item.fileName,
    extension: item.extension,
    mimeType: item.mimeType,
    sizeBytes: item.sizeBytes,
    sha256: item.sha256,
    preservedPath: item.preservedPath,
    uploadedAt: item.uploadedAt,
    previewSummary: item.previewSummary ?? null,
    url: baseUrl,
    downloadUrl: `${baseUrl}?download=1`,
  };
}

export function toSharedUploadedFile(
  item: FrontendUploadedFileRecord,
): SharedUploadedFileRecord {
  let uploadedAtMs: number;
  if (typeof item.uploadedAt === "number" && Number.isFinite(item.uploadedAt)) {
    uploadedAtMs = item.uploadedAt;
  } else if (typeof item.uploadedAt === "string") {
    const parsed = Date.parse(item.uploadedAt);
    uploadedAtMs = Number.isFinite(parsed) ? parsed : Date.now();
  } else {
    uploadedAtMs = Date.now();
  }

  return {
    id: item.id,
    fileName: item.fileName,
    extension: item.extension,
    mimeType: item.mimeType,
    sizeBytes: item.sizeBytes,
    sha256: item.sha256,
    preservedPath: item.preservedPath,
    uploadedAt: uploadedAtMs,
    previewSummary: item.previewSummary ?? "",
    url: item.url,
    downloadUrl: item.downloadUrl,
  };
}

export function toFrontendRunState(
  runState: SharedAgentRunState,
  thinkingLevel?: string | null,
): FrontendAgentRunState {
  let status: FrontendAgentRunState["status"];
  if (runState.phase === "responding") {
    status = "streaming";
  } else if (runState.isRunning) {
    status = "running";
  } else if (runState.lastError !== null && !runState.ompConnected) {
    status = "error";
  } else {
    status = "idle";
  }

  return {
    status,
    activeToolName: runState.activeToolName,
    error: runState.lastError,
    thinkingLevel: thinkingLevel ?? null,
  };
}

function mapToolStatus(status: SharedToolCallPart["status"]): FrontendToolCallStatus {
  switch (status) {
    case "streaming":
      return "pending";
    case "running":
      return "running";
    case "completed":
      return "success";
    case "error":
      return "error";
    default: {
      const exhaustive: never = status;
      throw new Error(`Unsupported tool call status: ${String(exhaustive)}`);
    }
  }
}

function mapMessagePart(part: SharedMessagePart): FrontendChatMessagePart {
  switch (part.type) {
    case "thinking":
      return {
        type: "thinking",
        text: part.text,
        isStreaming: part.isStreaming,
        ...(part.completedAt !== undefined
          ? { durationMs: Math.max(0, part.completedAt - part.startedAt) }
          : {}),
      };
    case "tool_call":
      return {
        type: "tool_call",
        id: part.toolCallId,
        toolName: part.toolName,
        args: isRecord(part.args) ? part.args : { raw: part.args },
        output: part.output,
        status: mapToolStatus(part.status),
        startedAt: part.startedAt,
        ...(part.completedAt !== undefined
          ? {
              endedAt: part.completedAt,
              durationMs: Math.max(0, part.completedAt - part.startedAt),
            }
          : {}),
        ...(part.isError !== undefined ? { isError: part.isError } : {}),
      };
    case "text":
      return {
        type: "text",
        text: part.text,
      };
    case "image":
      return {
        type: "image",
        mimeType: part.mimeType,
        data: part.data,
      };
    default: {
      const exhaustive: never = part;
      throw new Error(`Unsupported message part type: ${JSON.stringify(exhaustive)}`);
    }
  }
}

export function toFrontendMessage(
  msg: SharedChatMessageView,
): FrontendChatMessageView {
  const text = msg.parts
    .filter((p): p is Extract<SharedMessagePart, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("\n\n");

  return {
    id: msg.id,
    role: msg.role,
    createdAt: msg.timestamp,
    text,
    parts: msg.parts.map(mapMessagePart),
    ...(msg.attachments !== undefined
      ? { attachments: msg.attachments.map(toFrontendUploadedFile) }
      : {}),
    ...(msg.publishedFiles !== undefined
      ? { publishedFiles: msg.publishedFiles.map(toFrontendPublishedFile) }
      : {}),
    ...(msg.isStreaming !== undefined ? { isStreaming: msg.isStreaming } : {}),
  };
}

function mapTodoStatus(
  status: SharedTodoItemStatus,
): FrontendTodoItemView["status"] {
  switch (status) {
    case "pending":
      return "pending";
    case "in_progress":
      return "in_progress";
    case "done":
      return "completed";
    case "blocked":
      return "cancelled";
    default: {
      const exhaustive: never = status;
      throw new Error(`Unsupported todo item status: ${String(exhaustive)}`);
    }
  }
}

export function toFrontendTodos(
  todos: SharedTodoPhaseView[],
): FrontendTodoPhaseView[] {
  return todos.map((phase, phaseIdx) => ({
    id: `phase_${phaseIdx}`,
    name: phase.phase,
    tasks: phase.items.map((item, itemIdx) => ({
      id: `task_${phaseIdx}_${itemIdx}`,
      content: item.text,
      status: mapTodoStatus(item.status),
    })),
  }));
}

function mapSubagentStatus(
  status: SharedSubagentView["status"],
): FrontendSubagentView["status"] {
  switch (status) {
    case "running":
      return "running";
    case "completed":
      return "completed";
    case "failed":
    case "aborted":
      return "error";
    default: {
      const exhaustive: never = status;
      throw new Error(`Unsupported subagent status: ${String(exhaustive)}`);
    }
  }
}

export function toFrontendSubagents(
  subagents: SharedSubagentView[],
): FrontendSubagentView[] {
  return subagents.map((sub) => ({
    id: sub.id,
    name: sub.name ?? sub.agent ?? sub.id,
    status: mapSubagentStatus(sub.status),
    ...(sub.summary !== undefined ? { task: sub.summary } : {}),
    startedAt: sub.updatedAt,
  }));
}

export function toFrontendStats(
  stats: SharedSessionStatsView,
): FrontendSessionStatsView {
  return {
    totalTokens: stats.totalTokens,
    inputTokens: stats.inputTokens,
    outputTokens: stats.outputTokens,
    contextPercent: stats.contextPercent,
    contextWindow: stats.contextWindow,
    costUsd: stats.costUsd,
    turnCount: stats.turnCount,
  };
}

export function toFrontendUiRequest(
  req: SharedExtensionUiRequestView,
): FrontendExtensionUiRequestView {
  let options: FrontendExtensionUiRequestView["options"];
  if (Array.isArray(req.options)) {
    options = req.options.map((opt, idx) => {
      const desc = req.optionDetails?.[idx]?.description;
      return desc !== undefined ? { label: opt, value: opt, description: desc } : opt;
    });
  }

  let message = req.message;
  if (
    message === undefined &&
    Array.isArray(req.questions) &&
    req.questions.length > 0
  ) {
    message = req.questions
      .map((q) => {
        const optLabels = q.options.map((o) => o.label).join(", ");
        return optLabels.length > 0 ? `${q.question} (${optLabels})` : q.question;
      })
      .join("\n");
  }

  return {
    id: req.id,
    kind: req.method,
    title: req.title ?? "Confirmación requerida",
    ...(message !== undefined ? { message } : {}),
    ...(options !== undefined ? { options } : {}),
    ...(req.placeholder !== undefined ? { placeholder: req.placeholder } : {}),
    ...(req.secret !== undefined ? { secret: req.secret } : {}),
    createdAt: req.createdAt,
  };
}

function coerceFormData(
  raw: Record<string, unknown>,
): Record<string, string | number | string[]> {
  const result: Record<string, string | number | string[]> = {};
  for (const [key, val] of Object.entries(raw)) {
    if (typeof val === "string" || typeof val === "number") {
      result[key] = val;
    } else if (typeof val === "boolean") {
      result[key] = val ? "true" : "false";
    } else if (Array.isArray(val) && val.every((item) => typeof item === "string")) {
      result[key] = val;
    } else {
      throw new Error(`Unsupported form field value type for key '${key}'`);
    }
  }
  return result;
}

export function fromFrontendUiResponse(
  method: SharedExtensionUiRequestView["method"],
  rawResponse: unknown,
  pendingReq?: SharedExtensionUiRequestView,
): SharedExtensionUiResponsePayload {
  if (rawResponse === null || rawResponse === undefined) {
    return { cancelled: true };
  }

  if (isRecord(rawResponse) && rawResponse.cancelled === true) {
    return typeof rawResponse.timedOut === "boolean"
      ? { cancelled: true, timedOut: rawResponse.timedOut }
      : { cancelled: true };
  }

  switch (method) {
    case "confirm": {
      if (typeof rawResponse === "boolean") {
        return { confirmed: rawResponse };
      }
      if (isRecord(rawResponse) && typeof rawResponse.confirmed === "boolean") {
        return { confirmed: rawResponse.confirmed };
      }
      throw new Error("Confirm UI response must be a boolean or { confirmed: boolean }");
    }

    case "select":
    case "input":
    case "editor": {
      if (typeof rawResponse === "string") {
        return { value: rawResponse };
      }
      if (isRecord(rawResponse) && typeof rawResponse.value === "string") {
        return { value: rawResponse.value };
      }
      throw new Error(`UI response for '${method}' must be a string or { value: string }`);
    }

    case "ask": {
      if (isRecord(rawResponse) && Array.isArray(rawResponse.answers)) {
        return {
          answers: rawResponse.answers as Array<{
            id: string;
            selectedOptions: string[];
            customInput?: string;
          }>,
        };
      }
      const textVal =
        typeof rawResponse === "string"
          ? rawResponse
          : isRecord(rawResponse) && typeof rawResponse.value === "string"
            ? rawResponse.value
            : null;
      if (textVal === null) {
        throw new Error("UI response for 'ask' must be a string, { value }, or { answers }");
      }
      if (pendingReq?.questions && pendingReq.questions.length > 0) {
        return {
          answers: pendingReq.questions.map((q) => ({
            id: q.id,
            selectedOptions: [],
            customInput: textVal,
          })),
        };
      }
      return { value: textVal };
    }

    case "form": {
      if (isRecord(rawResponse) && isRecord(rawResponse.data)) {
        return { data: coerceFormData(rawResponse.data) };
      }
      if (isRecord(rawResponse)) {
        return { data: coerceFormData(rawResponse) };
      }
      throw new Error("UI response for 'form' must be a record object or { data: ... }");
    }

    default: {
      const exhaustive: never = method;
      throw new Error(`Unsupported extension UI method: ${String(exhaustive)}`);
    }
  }
}

export function toFrontendPendingSecret(
  req: BackendPendingSecretInput,
  role: AuthRole,
): FrontendPendingSecretRequestPublic {
  return {
    token: role === "rw" ? req.token : "",
    tokenHash: "tokenHash" in req ? req.tokenHash : req.requestId,
    label: req.label,
    scope: req.scope,
    createdAt: req.createdAt,
    expiresAt: req.expiresAt,
    status: "pending",
  };
}

export function toFrontendSnapshot(
  bridgeSnapshot: SharedLiveSessionSnapshot,
  publishedFiles: BackendPublishedFileInput[],
  pendingSecretsForRole: BackendPendingSecretInput[],
  sessionTitle: string | null,
): FrontendLiveSessionSnapshot {
  const effectiveRole = bridgeSnapshot.role;
  return {
    sessionId: bridgeSnapshot.activeSessionId,
    sessionFile: bridgeSnapshot.activeSessionFile,
    sessionTitle,
    messages: bridgeSnapshot.messages.map(toFrontendMessage),
    runState: toFrontendRunState(
      bridgeSnapshot.runState,
      bridgeSnapshot.stats.thinkingLevel,
    ),
    todos: toFrontendTodos(bridgeSnapshot.todos),
    subagents: toFrontendSubagents(bridgeSnapshot.subagents),
    queue: {
      steering: [...bridgeSnapshot.queue.steering],
      followUp: [...bridgeSnapshot.queue.followUp],
    },
    stats: toFrontendStats(bridgeSnapshot.stats),
    pendingUiRequests: bridgeSnapshot.pendingUiRequests.map(toFrontendUiRequest),
    pendingSecretRequests: pendingSecretsForRole.map((req) =>
      toFrontendPendingSecret(req, effectiveRole),
    ),
    publishedFiles: publishedFiles.map(toFrontendPublishedFile),
  };
}

export function toFrontendSessionSummary(
  s: SharedSessionSummary,
): FrontendSessionSummary {
  const iso = new Date(s.updatedAt).toISOString();
  return {
    id: s.id,
    filePath: s.filePath,
    title: s.title,
    messageCount: s.messageCount,
    createdAt: iso,
    updatedAt: iso,
    isActive: s.isActive,
  };
}

export function toFrontendMirrorDoc(
  d: SharedMirrorDocSummary,
): FrontendMirrorDocSummary {
  return {
    code: d.code,
    versions: d.versions.map((v) => v.version),
    latestVersion: d.latestVersion ?? "",
    hasPdf: d.versions.some((v) => v.hasPdf),
    hasText: d.versions.some((v) => v.hasText),
  };
}

export function toFrontendMirrorExcerpt(
  e: SharedMirrorCitationExcerpt,
): FrontendMirrorExcerptResponse {
  return {
    doc: e.docCode,
    version: e.version,
    startLine: e.startLine,
    endLine: e.endLine,
    totalLines: e.totalLines,
    text: e.text,
  };
}

export function toFrontendBranding(
  b: SharedBrandingConfig,
): FrontendBrandingConfig {
  return {
    appName: b.appName,
    subtitle: b.subtitle,
    shortBadge: b.shortBadge,
    primaryColor: b.primaryColor,
    accentColor: b.accentColor,
    defaultTheme: b.defaultTheme,
    starterPrompts: b.starterPrompts.map((p, idx) => ({
      id: p.id ?? `starter_${idx}`,
      title: p.title,
      badge: p.badge ?? p.clause,
      ...(p.description !== undefined ? { description: p.description } : {}),
      prompt: p.prompt,
    })),
  };
}

export function toFrontendServerWsMessage(
  msg: Exclude<SharedServerWsMessage, { type: "init_snapshot" | "session_changed" | "secret_request_created" }>,
  thinkingLevel?: string | null,
): FrontendServerWsMessage {
  switch (msg.type) {
    case "message_upsert":
      return {
        type: "message_upsert",
        message: toFrontendMessage(msg.message),
      };
    case "agent_state":
      return {
        type: "agent_state",
        runState: toFrontendRunState(msg.runState, thinkingLevel),
      };
    case "todos_updated":
      return {
        type: "todos_updated",
        todos: toFrontendTodos(msg.todos),
      };
    case "subagents_updated":
      return {
        type: "subagents_updated",
        subagents: toFrontendSubagents(msg.subagents),
      };
    case "queue_updated":
      return {
        type: "queue_updated",
        queue: {
          steering: [...msg.queue.steering],
          followUp: [...msg.queue.followUp],
        },
      };
    case "stats_updated":
      return {
        type: "stats_updated",
        stats: toFrontendStats(msg.stats),
      };
    case "file_published":
      return {
        type: "file_published",
        file: toFrontendPublishedFile(msg.file),
        messageId: msg.messageId,
      };
    case "secret_request_resolved":
      return {
        type: "secret_request_resolved",
        tokenHash: msg.tokenHash,
        label: msg.label,
        handle: msg.handle,
      };
    case "ui_request":
      return {
        type: "ui_request",
        request: toFrontendUiRequest(msg.request),
      };
    case "ui_request_cancelled":
      return {
        type: "ui_request_cancelled",
        id: msg.id,
      };
    case "notice":
      return {
        type: "notice",
        level: msg.level,
        text: msg.text,
        timestamp: msg.timestamp,
      };
    case "error":
      return {
        type: "error",
        code: msg.code,
        message: msg.message,
      };
    default: {
      const exhaustive: never = msg;
      throw new Error(`Unsupported ServerWsMessage type: ${JSON.stringify(exhaustive)}`);
    }
  }
}
