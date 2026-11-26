import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import type {
  AgentRunState,
  AuthRole,
  ChatMessageView,
  ExtensionUiQuestion,
  ExtensionUiRequestView,
  ExtensionUiResponsePayload,
  LiveSessionSnapshot,
  MessagePart,
  PendingSecretRequestPublic,
  PublishedFileSummary,
  QueueStateView,
  ServerWsMessage,
  SessionStatsView,
  SessionSummary,
  SubagentStatus,
  SubagentView,
  ThinkingPart,
  TodoItemStatus,
  TodoPhaseView,
  ToolCallPart,
  UploadedFileRecord,
} from "../../shared/protocol.ts";
import { encodeRpcFrame, RpcFrameDecoder, RpcFramingError } from "./rpc-framing.ts";

export interface OmpBridgeOptions {
  projectRoot: string;
  port: number;
  sessionsDir: string;
  softRequestBudget: number;
  agentModel: string | null;
  agentEnvVar: string | null;
  agentApiKey: string | null;
  ompCommand?: string[];
  requestTimeoutMs?: number;
  maxRestartAttempts?: number;
  onBroadcast: (message: ServerWsMessage) => void;
}

export interface SendPromptInput {
  message: string;
  attachments?: UploadedFileRecord[];
  images?: Array<{ mimeType: string; data: string }>;
  streamingBehavior?: "steer" | "followUp";
}

export class OmpRpcError extends Error {
  readonly command: string;
  readonly code: string | undefined;

  constructor(command: string, message: string, code?: string) {
    super(message);
    this.name = "OmpRpcError";
    this.command = command;
    this.code = code;
  }
}

interface PendingRpcRequest {
  command: string;
  resolve: (data: unknown) => void;
  reject: (err: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

interface OptimisticUserRecord {
  sentText: string;
  rawText: string;
  attachments?: UploadedFileRecord[];
  messageViewId: string;
}

const DEFAULT_RPC_TIMEOUT_MS = 30_000;
const READY_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_RESTART_ATTEMPTS = 3;
const INTRO_BANNER_PREFIX = "UNSA PIMS — OPERADOR AGÉNTICO";

const UI_DIALOG_METHODS = new Set<ExtensionUiRequestView["method"]>([
  "confirm",
  "select",
  "input",
  "editor",
  "ask",
  "form",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mapTodoStatus(rawStatus: unknown): TodoItemStatus {
  switch (rawStatus) {
    case "pending":
      return "pending";
    case "in_progress":
      return "in_progress";
    case "completed":
    case "done":
      return "done";
    case "abandoned":
    case "blocked":
      return "blocked";
    default:
      throw new Error(`Unsupported todo item status: ${String(rawStatus)}`);
  }
}

function mapTodoPhases(rawPhases: unknown): TodoPhaseView[] {
  if (!Array.isArray(rawPhases)) {
    return [];
  }
  const result: TodoPhaseView[] = [];
  for (const rawPhase of rawPhases) {
    if (!isRecord(rawPhase)) {
      continue;
    }
    const phaseName =
      typeof rawPhase.name === "string"
        ? rawPhase.name
        : typeof rawPhase.phase === "string"
          ? rawPhase.phase
          : "Todos";
    const rawTasks = Array.isArray(rawPhase.tasks)
      ? rawPhase.tasks
      : Array.isArray(rawPhase.items)
        ? rawPhase.items
        : [];
    const items: TodoPhaseView["items"] = [];
    for (const rawTask of rawTasks) {
      if (!isRecord(rawTask)) {
        continue;
      }
      const text =
        typeof rawTask.content === "string"
          ? rawTask.content
          : typeof rawTask.text === "string"
            ? rawTask.text
            : "";
      if (text.length === 0) {
        continue;
      }
      const status = mapTodoStatus(rawTask.status ?? "pending");
      const reason = typeof rawTask.reason === "string" ? rawTask.reason : undefined;
      items.push(reason !== undefined ? { text, status, reason } : { text, status });
    }
    result.push({ phase: phaseName, items });
  }
  return result;
}

function mapSubagentStatus(raw: unknown): SubagentStatus {
  switch (raw) {
    case "running":
    case "started":
    case "active":
      return "running";
    case "completed":
    case "done":
    case "succeeded":
      return "completed";
    case "failed":
    case "error":
      return "failed";
    case "aborted":
    case "cancelled":
    case "canceled":
      return "aborted";
    default:
      return "running";
  }
}

function extractTextFromContentArray(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }
  if (!Array.isArray(content)) {
    return "";
  }
  const chunks: string[] = [];
  for (const block of content) {
    if (!isRecord(block)) {
      continue;
    }
    if (block.type === "text" && typeof block.text === "string") {
      chunks.push(block.text);
    }
  }
  return chunks.join("\n");
}

function formatAttachmentPromptHeader(attachments: UploadedFileRecord[]): string {
  const lines = [
    "[Archivos adjuntos preservados por el operador]",
    ...attachments.map(
      (att) =>
        `- Archivo: ${att.fileName} | Ruta: ${att.preservedPath} | Tamaño: ${att.sizeBytes} bytes | SHA-256: ${att.sha256}`,
    ),
    "(Contexto informativo: consulta o confirma con el operador antes de vectorizar o subir cambios a PIMS.)",
  ];
  return lines.join("\n");
}

function formatToolResultOutput(result: unknown): string {
  if (typeof result === "string") {
    return result;
  }
  if (!isRecord(result)) {
    return result === undefined || result === null ? "" : JSON.stringify(result);
  }
  const textFromContent = extractTextFromContentArray(result.content);
  if (textFromContent.length > 0) {
    return textFromContent;
  }
  if (typeof result.output === "string") {
    return result.output;
  }
  if (typeof result.text === "string") {
    return result.text;
  }
  if (typeof result.error === "string") {
    return result.error;
  }
  return JSON.stringify(result);
}

function parseTimestampMs(raw: unknown, fallback: number): number {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }
  if (typeof raw === "string") {
    const ms = Date.parse(raw);
    if (Number.isFinite(ms)) {
      return ms;
    }
  }
  return fallback;
}

export class OmpBridge {
  private readonly options: OmpBridgeOptions;
  private readonly requestTimeoutMs: number;
  private readonly maxRestartAttempts: number;
  private readonly decoder = new RpcFrameDecoder();

  private proc: Bun.Subprocess<"pipe", "pipe", "pipe"> | null = null;
  private startPromise: Promise<void> | null = null;
  private stopping = false;
  private restartAttempts = 0;
  private nextReqId = 0;
  private nextLocalMsgId = 0;

  private readyResolve: (() => void) | null = null;
  private readyReject: ((err: Error) => void) | null = null;
  private readonly pendingRequests = new Map<string, PendingRpcRequest>();
  private readonly pendingOptimisticUsers: OptimisticUserRecord[] = [];

  private activeSessionId: string | null = null;
  private activeSessionFile: string | null = null;
  private messages: ChatMessageView[] = [];
  private todos: TodoPhaseView[] = [];
  private readonly subagentsMap = new Map<string, SubagentView>();
  private readonly pendingUiMap = new Map<string, ExtensionUiRequestView>();
  private queue: QueueStateView = { steering: [], followUp: [] };
  private runState: AgentRunState = {
    isRunning: false,
    phase: "idle",
    activeToolName: null,
    ompConnected: false,
    lastError: null,
  };
  private stats: SessionStatsView;

  constructor(options: OmpBridgeOptions) {
    this.options = options;
    this.requestTimeoutMs = options.requestTimeoutMs ?? DEFAULT_RPC_TIMEOUT_MS;
    this.maxRestartAttempts = options.maxRestartAttempts ?? DEFAULT_MAX_RESTART_ATTEMPTS;
    this.stats = {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      contextPercent: 0,
      contextWindow: 0,
      costUsd: 0,
      turnCount: 0,
      softRequestBudget: options.softRequestBudget,
      model: options.agentModel,
      thinkingLevel: null,
    };
  }

  async start(): Promise<void> {
    if (this.proc !== null && this.runState.ompConnected) {
      return;
    }
    if (this.startPromise !== null) {
      return this.startPromise;
    }

    this.stopping = false;
    this.startPromise = this.spawnAndInitialize()
      .then(() => {
        this.restartAttempts = 0;
      })
      .finally(() => {
        this.startPromise = null;
      });
    return this.startPromise;
  }

  async ensureStarted(): Promise<void> {
    if (this.proc !== null && this.runState.ompConnected) {
      return;
    }
    if (this.startPromise !== null) {
      return this.startPromise;
    }
    if (this.restartAttempts >= this.maxRestartAttempts) {
      throw new Error(
        `omp RPC bridge exceeded max restart attempts (${this.maxRestartAttempts}); last error: ${this.runState.lastError ?? "unknown"}`,
      );
    }
    this.restartAttempts += 1;
    await this.start();
  }

  async stop(): Promise<void> {
    this.stopping = true;
    const proc = this.proc;
    this.proc = null;

    if (this.readyReject !== null) {
      this.readyReject(new Error("OmpBridge stopped before ready frame"));
      this.readyResolve = null;
      this.readyReject = null;
    }

    this.rejectAllPending("OmpBridge stopped");

    if (proc !== null) {
      try {
        proc.stdin.end();
      } catch {
        // Stdin may already be closed.
      }
      try {
        await Promise.race([
          proc.exited,
          new Promise<void>((resolve) => {
            setTimeout(() => {
              try {
                proc.kill();
              } catch {
                // Process may have exited concurrently.
              }
              resolve();
            }, 3_000);
          }),
        ]);
      } catch {
        // Ignore teardown race.
      }
    }

    this.decoder.reset();
    this.updateRunState({
      isRunning: false,
      phase: "idle",
      activeToolName: null,
      ompConnected: false,
    });
  }

  public getPendingUiRequest(id: string): ExtensionUiRequestView | undefined {
    return this.pendingUiMap.get(id);
  }

  public getActiveSessionTitle(): string | null {
    if (this.activeSessionFile !== null && existsSync(this.activeSessionFile)) {
      const parsed = this.parseSessionFileSummary(this.activeSessionFile);
      if (parsed !== null) {
        return parsed.title;
      }
    }
    for (const msg of this.messages) {
      if (msg.role === "user") {
        for (const part of msg.parts) {
          if (part.type === "text" && part.text.trim().length > 0) {
            return part.text.trim().replace(/\s+/g, " ").slice(0, 80);
          }
        }
      }
    }
    return this.activeSessionId;
  }

  getSnapshot(
    role: AuthRole,
    pendingSecretRequests: PendingSecretRequestPublic[],
  ): LiveSessionSnapshot {
    return {
      role,
      activeSessionId: this.activeSessionId,
      activeSessionFile: this.activeSessionFile,
      messages: this.messages.map((m) => ({
        ...m,
        parts: m.parts.map((p) => ({ ...p })),
        ...(m.attachments ? { attachments: [...m.attachments] } : {}),
        ...(m.publishedFiles ? { publishedFiles: [...m.publishedFiles] } : {}),
      })),
      runState: { ...this.runState },
      todos: this.todos.map((p) => ({
        phase: p.phase,
        items: p.items.map((item) => ({ ...item })),
      })),
      subagents: [...this.subagentsMap.values()],
      pendingUiRequests: [...this.pendingUiMap.values()],
      pendingSecretRequests: [...pendingSecretRequests],
      queue: {
        steering: [...this.queue.steering],
        followUp: [...this.queue.followUp],
      },
      stats: { ...this.stats },
    };
  }

  async sendPrompt(input: SendPromptInput): Promise<void> {
    await this.ensureStarted();

    const trimmedMsg = input.message.trim();
    const hasAttachments = Array.isArray(input.attachments) && input.attachments.length > 0;
    const hasImages = Array.isArray(input.images) && input.images.length > 0;

    if (trimmedMsg.length === 0 && !hasAttachments && !hasImages) {
      throw new Error("Prompt message cannot be empty without attachments or images");
    }

    let finalText = input.message;
    if (hasAttachments && input.attachments !== undefined) {
      const header = formatAttachmentPromptHeader(input.attachments);
      finalText = trimmedMsg.length > 0 ? `${header}\n\n${input.message}` : header;
    }

    const optimisticParts: MessagePart[] = [];
    if (trimmedMsg.length > 0) {
      optimisticParts.push({
        type: "text",
        id: `local_txt_${++this.nextLocalMsgId}`,
        text: input.message,
      });
    }
    if (hasImages && input.images !== undefined) {
      for (const img of input.images) {
        optimisticParts.push({
          type: "image",
          mimeType: img.mimeType,
          data: img.data,
        });
      }
    }

    const optimisticId = `local_user_${++this.nextLocalMsgId}`;
    const optimisticMsg: ChatMessageView = {
      id: optimisticId,
      role: "user",
      timestamp: Date.now(),
      parts: optimisticParts,
      ...(hasAttachments ? { attachments: [...input.attachments!] } : {}),
    };

    if (input.streamingBehavior === undefined) {
      this.pendingOptimisticUsers.push({
        sentText: finalText,
        rawText: input.message,
        attachments: input.attachments,
        messageViewId: optimisticId,
      });
      this.messages.push(optimisticMsg);
      this.options.onBroadcast({ type: "message_upsert", message: optimisticMsg });
    } else if (hasAttachments) {
      // Queued messages will arrive later when dequeued; preserve attachment lookup for reconciliation.
      this.pendingOptimisticUsers.push({
        sentText: finalText,
        rawText: input.message,
        attachments: input.attachments,
        messageViewId: "",
      });
    }

    const payload: Record<string, unknown> = {
      message: finalText,
    };
    if (hasImages && input.images !== undefined) {
      payload.images = input.images.map((img) => ({
        type: "image",
        mimeType: img.mimeType,
        data: img.data,
      }));
    }
    if (input.streamingBehavior !== undefined) {
      payload.streamingBehavior = input.streamingBehavior;
    }

    await this.sendCommand("prompt", payload);
  }

  async abort(): Promise<void> {
    await this.ensureStarted();
    await this.sendCommand("abort");
  }

  async newSession(): Promise<void> {
    await this.ensureStarted();
    await this.sendCommand("new_session");
    this.pendingUiMap.clear();
    this.subagentsMap.clear();
    this.pendingOptimisticUsers.length = 0;
    await this.hydrateFullSessionState();
    this.options.onBroadcast({
      type: "session_changed",
      snapshot: this.getSnapshot("rw", []),
    });
  }

  async switchSession(sessionPath: string): Promise<void> {
    await this.ensureStarted();
    if (sessionPath.trim().length === 0) {
      throw new Error("sessionPath must not be empty");
    }
    await this.sendCommand("switch_session", { sessionPath });
    this.pendingUiMap.clear();
    this.subagentsMap.clear();
    this.pendingOptimisticUsers.length = 0;
    await this.hydrateFullSessionState();
    this.options.onBroadcast({
      type: "session_changed",
      snapshot: this.getSnapshot("rw", []),
    });
  }

  respondExtensionUi(id: string, response: ExtensionUiResponsePayload): void {
    if (this.proc === null || !this.runState.ompConnected) {
      throw new Error("omp process is not connected");
    }
    if (!this.pendingUiMap.has(id)) {
      throw new Error(`No pending extension UI request with id '${id}'`);
    }
    this.pendingUiMap.delete(id);
    this.writeFrame({
      type: "extension_ui_response",
      id,
      ...response,
    });
    this.options.onBroadcast({ type: "ui_request_cancelled", id });
  }

  async setThinkingLevel(level: string): Promise<void> {
    await this.ensureStarted();
    await this.sendCommand("set_thinking_level", { level });
    await this.refreshStateAndStats();
  }

  async compact(customInstructions?: string): Promise<void> {
    await this.ensureStarted();
    const payload =
      customInstructions !== undefined && customInstructions.trim().length > 0
        ? { customInstructions }
        : undefined;
    await this.sendCommand("compact", payload, 120_000);
    await this.refreshStateAndStats();
  }

  async exportHtml(): Promise<{ html: string; filename: string }> {
    await this.ensureStarted();
    const tempDir = mkdtempSync(path.join(os.tmpdir(), "pimsai-omp-export-"));
    const tempOutput = path.join(tempDir, "session-export.html");
    try {
      const result = await this.sendCommand<Record<string, unknown> | undefined>("export_html", {
        outputPath: tempOutput,
      });
      const resolvedPath =
        isRecord(result) && typeof result.path === "string" ? result.path : tempOutput;
      if (!existsSync(resolvedPath)) {
        throw new Error(`export_html did not produce output file at '${resolvedPath}'`);
      }
      const html = readFileSync(resolvedPath, "utf8");
      const baseId = this.activeSessionId ?? "session";
      return {
        html,
        filename: `${baseId}.html`,
      };
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  }

  listSessions(): SessionSummary[] {
    if (!existsSync(this.options.sessionsDir)) {
      return [];
    }
    const entries = readdirSync(this.options.sessionsDir, { withFileTypes: true });
    const summaries: SessionSummary[] = [];

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".jsonl")) {
        continue;
      }
      const filePath = path.join(this.options.sessionsDir, entry.name);
      const parsed = this.parseSessionFileSummary(filePath);
      if (parsed !== null) {
        summaries.push(parsed);
      }
    }

    return summaries.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  attachPublishedFile(file: PublishedFileSummary): string | null {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const msg = this.messages[i];
      if (msg.role === "assistant") {
        const existing = msg.publishedFiles ?? [];
        if (!existing.some((f) => f.slug === file.slug)) {
          msg.publishedFiles = [...existing, file];
          this.options.onBroadcast({ type: "message_upsert", message: msg });
        }
        return msg.id;
      }
    }
    return null;
  }

  private parseSessionFileSummary(filePath: string): SessionSummary | null {
    let raw: string;
    let mtimeMs: number;
    try {
      const st = statSync(filePath);
      mtimeMs = st.mtimeMs;
      raw = readFileSync(filePath, "utf8");
    } catch {
      return null;
    }

    let sessionId = path.basename(filePath, ".jsonl");
    let explicitTitle: string | null = null;
    let firstUserText: string | null = null;
    let messageCount = 0;

    const lines = raw.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length === 0) {
        continue;
      }
      let record: unknown;
      try {
        record = JSON.parse(trimmed);
      } catch {
        continue;
      }
      if (!isRecord(record)) {
        continue;
      }

      if (record.type === "session" && typeof record.id === "string") {
        sessionId = record.id;
      } else if (record.type === "title" && typeof record.title === "string") {
        const cleanTitle = record.title.trim();
        if (cleanTitle.length > 0) {
          explicitTitle = cleanTitle;
        }
      } else if (record.type === "session_info" && typeof record.name === "string") {
        const cleanName = record.name.trim();
        if (cleanName.length > 0) {
          explicitTitle = cleanName;
        }
      } else if (record.type === "message" && isRecord(record.message)) {
        const msgRole = record.message.role;
        if (msgRole === "user" || msgRole === "assistant") {
          messageCount += 1;
        }
        if (msgRole === "user" && firstUserText === null) {
          const text = extractTextFromContentArray(record.message.content).trim();
          if (text.length > 0) {
            firstUserText = text.replace(/\s+/g, " ").slice(0, 80);
          }
        }
      }
    }

    const title = explicitTitle ?? firstUserText ?? sessionId;
    return {
      id: sessionId,
      filePath,
      title,
      updatedAt: mtimeMs,
      messageCount,
      isActive:
        this.activeSessionFile !== null &&
        path.resolve(filePath) === path.resolve(this.activeSessionFile),
    };
  }

  private async spawnAndInitialize(): Promise<void> {
    this.decoder.reset();

    const argv = this.buildCommandArgv();
    const childEnv: Record<string, string | undefined> = {
      ...process.env,
      WEB_INTERNAL_URL: `http://127.0.0.1:${this.options.port}`,
    };
    if (
      this.options.agentEnvVar !== null &&
      this.options.agentApiKey !== null &&
      this.options.agentEnvVar.length > 0
    ) {
      childEnv[this.options.agentEnvVar] = this.options.agentApiKey;
    }

    const readyPromise = new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.readyReject !== null) {
          this.readyResolve = null;
          this.readyReject = null;
          reject(new Error(`Timed out waiting for omp ready frame after ${READY_TIMEOUT_MS}ms`));
        }
      }, READY_TIMEOUT_MS);

      this.readyResolve = () => {
        clearTimeout(timer);
        this.readyResolve = null;
        this.readyReject = null;
        resolve();
      };
      this.readyReject = (err: Error) => {
        clearTimeout(timer);
        this.readyResolve = null;
        this.readyReject = null;
        reject(err);
      };
    });

    const proc = Bun.spawn(argv, {
      cwd: this.options.projectRoot,
      env: childEnv,
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
    });
    this.proc = proc;

    this.consumeStdout(proc);
    this.consumeStderr(proc);
    this.watchExit(proc);

    await readyPromise;

    await this.sendCommand("negotiate_protocol", { protocolVersion: 2 });
    await this.sendCommand("set_subagent_subscription", { level: "progress" });
    await this.hydrateFullSessionState();

    this.updateRunState({
      ompConnected: true,
      lastError: null,
    });
  }

  private buildCommandArgv(): string[] {
    if (this.options.ompCommand !== undefined && this.options.ompCommand.length > 0) {
      return [...this.options.ompCommand];
    }
    const cmd = ["omp", "--mode", "rpc-ui"];
    if (this.options.agentModel !== null) {
      cmd.push("--model", this.options.agentModel);
    }
    return cmd;
  }

  private consumeStdout(proc: Bun.Subprocess<"pipe", "pipe", "pipe">): void {
    const reader = proc.stdout.getReader();
    void (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          if (value !== undefined && value.byteLength > 0) {
            const frames = this.decoder.feed(value);
            for (const frame of frames) {
              this.handleInboundFrame(frame);
            }
          }
        }
        this.decoder.assertCleanEnd();
      } catch (err: unknown) {
        const msg =
          err instanceof RpcFramingError
            ? `RPC framing error (${err.code}): ${err.message}`
            : err instanceof Error
              ? err.message
              : String(err);
        this.updateRunState({ lastError: msg });
        this.options.onBroadcast({
          type: "notice",
          level: "error",
          text: msg,
          timestamp: Date.now(),
        });
      } finally {
        reader.releaseLock();
      }
    })();
  }

  private consumeStderr(proc: Bun.Subprocess<"pipe", "pipe", "pipe">): void {
    const reader = proc.stderr.getReader();
    const textDecoder = new TextDecoder("utf-8", { fatal: false });
    void (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          if (value !== undefined && value.byteLength > 0) {
            const text = textDecoder.decode(value, { stream: true }).trim();
            if (text.length > 0) {
              console.error(`[omp-stderr] ${text}`);
            }
          }
        }
      } catch {
        // Stderr stream closed.
      } finally {
        reader.releaseLock();
      }
    })();
  }

  private watchExit(proc: Bun.Subprocess<"pipe", "pipe", "pipe">): void {
    void proc.exited.then((exitCode) => {
      if (this.proc === proc) {
        this.proc = null;
      }

      if (this.readyReject !== null) {
        this.readyReject(new Error(`omp exited with code ${exitCode} before ready`));
      }

      this.rejectAllPending(`omp exited unexpectedly with code ${exitCode}`);

      if (!this.stopping) {
        const errorText = `Agente omp desconectado (código ${exitCode}).`;
        this.updateRunState({
          isRunning: false,
          phase: "idle",
          activeToolName: null,
          ompConnected: false,
          lastError: errorText,
        });
        this.options.onBroadcast({
          type: "notice",
          level: "error",
          text: errorText,
          timestamp: Date.now(),
        });
      }
    });
  }

  private writeFrame(obj: unknown): void {
    if (this.proc === null) {
      throw new Error("Cannot write RPC frame: omp process is not running");
    }
    const line = encodeRpcFrame(obj);
    this.proc.stdin.write(line);
  }

  private sendCommand<T = unknown>(
    type: string,
    payload?: Record<string, unknown>,
    timeoutMs: number = this.requestTimeoutMs,
  ): Promise<T> {
    if (this.proc === null) {
      return Promise.reject(new Error(`Cannot send '${type}': omp process is not running`));
    }
    const id = `req_${++this.nextReqId}`;
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`RPC command '${type}' (${id}) timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      this.pendingRequests.set(id, {
        command: type,
        resolve: (data: unknown) => resolve(data as T),
        reject,
        timer,
      });

      try {
        this.writeFrame({ id, type, ...(payload ?? {}) });
      } catch (err: unknown) {
        clearTimeout(timer);
        this.pendingRequests.delete(id);
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  }

  private rejectAllPending(reason: string): void {
    for (const [id, pending] of this.pendingRequests) {
      clearTimeout(pending.timer);
      pending.reject(new Error(`${reason} (command: ${pending.command}, id: ${id})`));
    }
    this.pendingRequests.clear();
  }

  private async hydrateFullSessionState(): Promise<void> {
    const [stateData, statsData, rawMessages] = await Promise.all([
      this.sendCommand<Record<string, unknown>>("get_state"),
      this.sendCommand<Record<string, unknown>>("get_session_stats"),
      this.fetchAllMessages(),
    ]);

    this.applyStatePayload(stateData);
    this.applyStatsPayload(statsData);
    this.messages = this.hydrateMessagesFromRaw(rawMessages);
  }

  private async refreshStateAndStats(): Promise<void> {
    if (this.proc === null) {
      return;
    }
    try {
      const [stateData, statsData] = await Promise.all([
        this.sendCommand<Record<string, unknown>>("get_state"),
        this.sendCommand<Record<string, unknown>>("get_session_stats"),
      ]);
      this.applyStatePayload(stateData);
      this.applyStatsPayload(statsData);
      this.options.onBroadcast({ type: "stats_updated", stats: { ...this.stats } });
      this.options.onBroadcast({
        type: "todos_updated",
        todos: this.todos.map((p) => ({ phase: p.phase, items: [...p.items] })),
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.options.onBroadcast({
        type: "notice",
        level: "warn",
        text: `No se pudo refrescar estado de sesión: ${msg}`,
        timestamp: Date.now(),
      });
    }
  }

  private async fetchAllMessages(): Promise<unknown[]> {
    try {
      const all: unknown[] = [];
      let cursor: string | undefined;
      while (true) {
        const page = await this.sendCommand<Record<string, unknown>>(
          "get_messages_page",
          cursor !== undefined ? { cursor, limit: 100 } : { limit: 100 },
        );
        if (isRecord(page) && Array.isArray(page.messages)) {
          all.push(...page.messages);
        }
        const nextCursor =
          isRecord(page) && typeof page.nextCursor === "string" ? page.nextCursor : undefined;
        if (nextCursor === undefined || nextCursor.length === 0) {
          break;
        }
        cursor = nextCursor;
      }
      return all;
    } catch (err: unknown) {
      if (err instanceof OmpRpcError && err.code !== "session_busy" && err.code !== "stale_cursor") {
        // Fallback only to legacy get_messages when server rejects paged endpoint as unknown.
        const res = await this.sendCommand<Record<string, unknown>>("get_messages");
        if (isRecord(res) && Array.isArray(res.messages)) {
          return res.messages;
        }
      }
      const res = await this.sendCommand<Record<string, unknown>>("get_messages");
      if (isRecord(res) && Array.isArray(res.messages)) {
        return res.messages;
      }
      return [];
    }
  }

  private applyStatePayload(state: unknown): void {
    if (!isRecord(state)) {
      return;
    }
    this.activeSessionId =
      typeof state.sessionId === "string" ? state.sessionId : this.activeSessionId;
    this.activeSessionFile =
      typeof state.sessionFile === "string" ? state.sessionFile : null;

    if (isRecord(state.queuedMessages)) {
      this.queue = {
        steering: Array.isArray(state.queuedMessages.steering)
          ? state.queuedMessages.steering.filter((s): s is string => typeof s === "string")
          : [],
        followUp: Array.isArray(state.queuedMessages.followUp)
          ? state.queuedMessages.followUp.filter((s): s is string => typeof s === "string")
          : [],
      };
    }

    if (state.todoPhases !== undefined) {
      this.todos = mapTodoPhases(state.todoPhases);
    }

    const modelStr = this.extractModelName(state.model);
    if (modelStr !== null) {
      this.stats.model = modelStr;
    }
    if (typeof state.thinkingLevel === "string") {
      this.stats.thinkingLevel = state.thinkingLevel;
    }

    if (isRecord(state.contextUsage)) {
      if (typeof state.contextUsage.contextWindow === "number") {
        this.stats.contextWindow = state.contextUsage.contextWindow;
      }
      if (typeof state.contextUsage.percent === "number") {
        this.stats.contextPercent = state.contextUsage.percent;
      }
    }

    const isStreaming = state.isStreaming === true;
    const isCompacting = state.isCompacting === true;
    this.runState = {
      ...this.runState,
      isRunning: isStreaming || isCompacting,
      phase: isCompacting ? "compacting" : isStreaming ? "responding" : "idle",
      ompConnected: true,
    };
  }

  private applyStatsPayload(raw: unknown): void {
    if (!isRecord(raw)) {
      return;
    }
    const tokens = isRecord(raw.tokens) ? raw.tokens : null;
    if (tokens !== null) {
      if (typeof tokens.input === "number") {
        this.stats.inputTokens = tokens.input;
      }
      if (typeof tokens.output === "number") {
        this.stats.outputTokens = tokens.output;
      }
      if (typeof tokens.total === "number") {
        this.stats.totalTokens = tokens.total;
      } else {
        this.stats.totalTokens = this.stats.inputTokens + this.stats.outputTokens;
      }
    }
    if (typeof raw.cost === "number") {
      this.stats.costUsd = raw.cost;
    }
    if (typeof raw.assistantMessages === "number") {
      this.stats.turnCount = raw.assistantMessages;
    } else if (typeof raw.userMessages === "number") {
      this.stats.turnCount = raw.userMessages;
    }
    if (isRecord(raw.contextUsage)) {
      if (typeof raw.contextUsage.contextWindow === "number") {
        this.stats.contextWindow = raw.contextUsage.contextWindow;
      }
      if (typeof raw.contextUsage.percent === "number") {
        this.stats.contextPercent = raw.contextUsage.percent;
      }
    }
  }

  private extractModelName(modelObj: unknown): string | null {
    if (typeof modelObj === "string" && modelObj.length > 0) {
      return modelObj;
    }
    if (isRecord(modelObj)) {
      const provider = typeof modelObj.provider === "string" ? modelObj.provider : "";
      const id = typeof modelObj.id === "string" ? modelObj.id : "";
      if (provider.length > 0 && id.length > 0) {
        return `${provider}/${id}`;
      }
      if (id.length > 0) {
        return id;
      }
    }
    return null;
  }

  private resolveDisplayRole(
    msgObj: Record<string, unknown>,
  ): "user" | "assistant" | "system" | null {
    const role = msgObj.role;
    if (role === "user" || role === "assistant" || role === "system") {
      return role;
    }
    if (role === "custom") {
      if (msgObj.display !== true) {
        return null;
      }
      const text = extractTextFromContentArray(msgObj.content).trimStart();
      if (text.startsWith(INTRO_BANNER_PREFIX)) {
        return null;
      }
      return "assistant";
    }
    return null;
  }

  private hydrateMessagesFromRaw(rawMessages: unknown[]): ChatMessageView[] {
    const hydrated: ChatMessageView[] = [];
    for (let i = 0; i < rawMessages.length; i++) {
      const entry = rawMessages[i];
      if (!isRecord(entry)) {
        continue;
      }
      const msgObj = isRecord(entry.message) ? entry.message : entry;
      const role = msgObj.role;

      if (role === "toolResult") {
        this.applyToolResultToList(hydrated, msgObj);
        continue;
      }

      const displayRole = this.resolveDisplayRole(msgObj);
      if (displayRole === null) {
        continue;
      }

      const id =
        typeof entry.id === "string"
          ? entry.id
          : typeof entry.messageId === "string"
            ? entry.messageId
            : `hist_${i}`;
      const timestamp = parseTimestampMs(entry.timestamp ?? msgObj.timestamp, Date.now());
      const parts = this.convertContentToParts(msgObj.content, id, timestamp, false);
      hydrated.push({
        id,
        role: displayRole,
        timestamp,
        parts,
        isStreaming: false,
      });
    }
    return hydrated;
  }

  private convertContentToParts(
    content: unknown,
    msgId: string,
    timestamp: number,
    isStreaming: boolean,
    existingParts?: MessagePart[],
  ): MessagePart[] {
    if (typeof content === "string") {
      return content.length > 0
        ? [{ type: "text", id: `${msgId}_p0`, text: content }]
        : [];
    }
    if (!Array.isArray(content)) {
      return [];
    }

    const parts: MessagePart[] = [];
    for (let i = 0; i < content.length; i++) {
      const block = content[i];
      if (!isRecord(block)) {
        continue;
      }
      const existing = existingParts?.[i];
      if (block.type === "thinking") {
        const text = typeof block.thinking === "string" ? block.thinking : "";
        const prevThinking = existing?.type === "thinking" ? existing : null;
        parts.push({
          type: "thinking",
          id: prevThinking?.id ?? `${msgId}_think_${i}`,
          text,
          isStreaming: isStreaming && i === content.length - 1,
          startedAt: prevThinking?.startedAt ?? timestamp,
          ...(prevThinking?.completedAt !== undefined
            ? { completedAt: prevThinking.completedAt }
            : !isStreaming
              ? { completedAt: timestamp }
              : {}),
        });
      } else if (block.type === "text") {
        const text = typeof block.text === "string" ? block.text : "";
        const prevText = existing?.type === "text" ? existing : null;
        parts.push({
          type: "text",
          id: prevText?.id ?? `${msgId}_text_${i}`,
          text,
        });
      } else if (block.type === "toolCall" || block.type === "tool_use") {
        const toolCallId =
          typeof block.id === "string" ? block.id : `${msgId}_tool_${i}`;
        const toolName =
          typeof block.name === "string" ? block.name : "tool";
        const args = block.arguments ?? block.input ?? {};
        const prevTool =
          existing?.type === "tool_call" && existing.toolCallId === toolCallId
            ? existing
            : this.findToolCallPartInMessages(toolCallId);
        parts.push({
          type: "tool_call",
          toolCallId,
          toolName,
          args,
          ...(prevTool?.argsRaw !== undefined ? { argsRaw: prevTool.argsRaw } : {}),
          status: prevTool?.status ?? (isStreaming ? "streaming" : "completed"),
          output: prevTool?.output ?? "",
          ...(prevTool?.isError !== undefined ? { isError: prevTool.isError } : {}),
          startedAt: prevTool?.startedAt ?? timestamp,
          ...(prevTool?.completedAt !== undefined ? { completedAt: prevTool.completedAt } : {}),
        });
      } else if (block.type === "image") {
        const mimeType =
          typeof block.mimeType === "string" ? block.mimeType : "image/png";
        const data = typeof block.data === "string" ? block.data : "";
        if (data.length > 0) {
          parts.push({ type: "image", mimeType, data });
        }
      }
    }
    return parts;
  }

  private applyToolResultToList(list: ChatMessageView[], msgObj: Record<string, unknown>): void {
    const toolCallId = typeof msgObj.toolCallId === "string" ? msgObj.toolCallId : "";
    if (toolCallId.length === 0) {
      return;
    }
    const output = formatToolResultOutput(msgObj);
    const isError = msgObj.isError === true;
    const rawTs = msgObj.timestamp;
    const resultTimestamp =
      typeof rawTs === "number" && Number.isFinite(rawTs)
        ? rawTs
        : typeof rawTs === "string" && Number.isFinite(Date.parse(rawTs))
          ? Date.parse(rawTs)
          : undefined;

    for (let i = list.length - 1; i >= 0; i--) {
      const msg = list[i];
      for (const part of msg.parts) {
        if (part.type === "tool_call" && part.toolCallId === toolCallId) {
          part.status = isError ? "error" : "completed";
          part.isError = isError;
          part.output = output;
          if (part.completedAt === undefined && resultTimestamp !== undefined && resultTimestamp >= part.startedAt) {
            part.completedAt = resultTimestamp;
          }
          return;
        }
      }
    }
  }

  private findToolCallPartInMessages(toolCallId: string): ToolCallPart | null {
    for (let i = this.messages.length - 1; i >= 0; i--) {
      for (const part of this.messages[i].parts) {
        if (part.type === "tool_call" && part.toolCallId === toolCallId) {
          return part;
        }
      }
    }
    return null;
  }

  private handleInboundFrame(frame: Record<string, unknown>): void {
    const type = frame.type;
    if (typeof type !== "string") {
      return;
    }

    switch (type) {
      case "ready": {
        if (this.readyResolve !== null) {
          this.readyResolve();
        }
        return;
      }
      case "response": {
        this.handleResponseFrame(frame);
        return;
      }
      case "agent_start":
      case "turn_start": {
        this.updateRunState({
          isRunning: true,
          phase: "thinking",
          activeToolName: null,
          lastError: null,
        });
        return;
      }
      case "turn_end": {
        return;
      }
      case "agent_end": {
        const isTerminal = frame.isTerminal !== false;
        if (isTerminal) {
          this.updateRunState({
            isRunning: false,
            phase: "idle",
            activeToolName: null,
          });
          void this.refreshStateAndStats();
        }
        return;
      }
      case "session_settled": {
        this.updateRunState({
          isRunning: false,
          phase: "idle",
          activeToolName: null,
        });
        void this.refreshStateAndStats();
        return;
      }
      case "prompt_result": {
        if (frame.status === "error" && isRecord(frame.error) && typeof frame.error.message === "string") {
          this.updateRunState({ lastError: frame.error.message });
          this.options.onBroadcast({
            type: "notice",
            level: "error",
            text: frame.error.message,
            timestamp: Date.now(),
          });
        }
        return;
      }
      case "message_start": {
        this.handleMessageStart(frame);
        return;
      }
      case "message_update": {
        this.handleMessageUpdate(frame);
        return;
      }
      case "message_end": {
        this.handleMessageEnd(frame);
        return;
      }
      case "tool_execution_start": {
        this.handleToolExecutionStart(frame);
        return;
      }
      case "tool_execution_update":
      case "tool_stream_update": {
        this.handleToolExecutionUpdate(frame, type === "tool_stream_update");
        return;
      }
      case "tool_execution_end": {
        this.handleToolExecutionEnd(frame);
        return;
      }
      case "subagent_lifecycle":
      case "subagent_progress": {
        this.handleSubagentFrame(frame);
        return;
      }
      case "queue_update": {
        this.queue = {
          steering: Array.isArray(frame.steering)
            ? frame.steering.filter((s): s is string => typeof s === "string")
            : [],
          followUp: Array.isArray(frame.followUp)
            ? frame.followUp.filter((s): s is string => typeof s === "string")
            : [],
        };
        this.options.onBroadcast({ type: "queue_updated", queue: { ...this.queue } });
        return;
      }
      case "extension_ui_request": {
        this.handleExtensionUiRequest(frame);
        return;
      }
      case "auto_compaction_start":
      case "manual_compaction_start": {
        this.updateRunState({ isRunning: true, phase: "compacting" });
        this.options.onBroadcast({
          type: "notice",
          level: "info",
          text:
            type === "manual_compaction_start"
              ? "Compactando historial de sesión..."
              : "Compactación automática de contexto iniciada...",
          timestamp: Date.now(),
        });
        return;
      }
      case "auto_compaction_end":
      case "manual_compaction_end": {
        this.updateRunState({
          phase: this.runState.isRunning ? "thinking" : "idle",
        });
        const errMsg = typeof frame.errorMessage === "string" ? frame.errorMessage : null;
        this.options.onBroadcast({
          type: "notice",
          level: errMsg !== null && frame.skipped !== true ? "warn" : "info",
          text:
            errMsg !== null
              ? `Compactación finalizada: ${errMsg}`
              : "Compactación de contexto completada.",
          timestamp: Date.now(),
        });
        return;
      }
      case "auto_retry_start": {
        this.updateRunState({ isRunning: true, phase: "retrying" });
        const attempt = typeof frame.attempt === "number" ? ` (intento ${frame.attempt})` : "";
        this.options.onBroadcast({
          type: "notice",
          level: "warn",
          text: `Reintentando llamada al modelo${attempt}...`,
          timestamp: Date.now(),
        });
        return;
      }
      case "auto_retry_end": {
        this.updateRunState({
          phase: this.runState.isRunning ? "thinking" : "idle",
        });
        return;
      }
      case "retry_fallback_applied": {
        this.updateRunState({ isRunning: true, phase: "retrying" });
        const toModel = typeof frame.to === "string" ? frame.to : "modelo alternativo";
        this.options.onBroadcast({
          type: "notice",
          level: "warn",
          text: `Cambiando temporalmente a ${toModel} tras error del proveedor.`,
          timestamp: Date.now(),
        });
        return;
      }
      case "retry_fallback_succeeded": {
        this.updateRunState({
          phase: this.runState.isRunning ? "thinking" : "idle",
        });
        this.options.onBroadcast({
          type: "notice",
          level: "info",
          text: "Modelo alternativo respondió correctamente.",
          timestamp: Date.now(),
        });
        return;
      }
      case "notice": {
        const level =
          frame.level === "warn" || frame.level === "error" || frame.level === "info"
            ? frame.level
            : "info";
        const text =
          typeof frame.message === "string"
            ? frame.message
            : typeof frame.text === "string"
              ? frame.text
              : "";
        if (text.length > 0) {
          this.options.onBroadcast({
            type: "notice",
            level,
            text,
            timestamp: Date.now(),
          });
        }
        return;
      }
      case "extension_error":
      case "rpc_frame_error": {
        const text =
          typeof frame.error === "string"
            ? frame.error
            : typeof frame.message === "string"
              ? frame.message
              : `Error en evento RPC (${type})`;
        this.options.onBroadcast({
          type: "notice",
          level: "error",
          text,
          timestamp: Date.now(),
        });
        return;
      }
      case "model_changed":
      case "thinking_level_changed": {
        void this.refreshStateAndStats();
        return;
      }
      default: {
        // Other auxiliary omp frames (available_commands_update, cache_warming_*, etc.)
        return;
      }
    }
  }

  private handleResponseFrame(frame: Record<string, unknown>): void {
    const id = typeof frame.id === "string" ? frame.id : null;
    if (id === null) {
      return;
    }
    const pending = this.pendingRequests.get(id);
    if (pending === undefined) {
      return;
    }
    clearTimeout(pending.timer);
    this.pendingRequests.delete(id);

    if (frame.success === true) {
      pending.resolve(frame.data);
    } else {
      const command = typeof frame.command === "string" ? frame.command : pending.command;
      const errMsg = typeof frame.error === "string" ? frame.error : "Unknown RPC error";
      const code = typeof frame.code === "string" ? frame.code : undefined;
      pending.reject(new OmpRpcError(command, errMsg, code));
    }
  }

  private handleMessageStart(frame: Record<string, unknown>): void {
    const msgId =
      typeof frame.messageId === "string"
        ? frame.messageId
        : `msg_${++this.nextLocalMsgId}`;
    const rawMsg = isRecord(frame.message) ? frame.message : null;
    if (rawMsg === null) {
      return;
    }

    if (rawMsg.role === "toolResult") {
      this.applyToolResultToLiveMessage(rawMsg);
      return;
    }

    if (rawMsg.role === "user") {
      this.reconcileIncomingUserMessage(msgId, rawMsg, false);
      return;
    }

    const displayRole = this.resolveDisplayRole(rawMsg);
    if (displayRole === null || displayRole === "user") {
      return;
    }

    const isCustomDisplay = rawMsg.role === "custom";
    const isStreaming = displayRole === "assistant" && !isCustomDisplay;

    const timestamp = parseTimestampMs(rawMsg.timestamp, Date.now());
    const existing = this.messages.find((m) => m.id === msgId);
    if (existing !== undefined) {
      existing.isStreaming = isStreaming;
      this.options.onBroadcast({ type: "message_upsert", message: existing });
      return;
    }

    const view: ChatMessageView = {
      id: msgId,
      role: displayRole,
      timestamp,
      parts: this.convertContentToParts(rawMsg.content, msgId, timestamp, isStreaming),
      isStreaming,
    };
    this.messages.push(view);
    this.options.onBroadcast({ type: "message_upsert", message: view });
  }

  private handleMessageUpdate(frame: Record<string, unknown>): void {
    const msgId =
      typeof frame.messageId === "string"
        ? frame.messageId
        : `msg_${++this.nextLocalMsgId}`;
    const evt = isRecord(frame.assistantMessageEvent) ? frame.assistantMessageEvent : null;
    const rawMsg = isRecord(frame.message) ? frame.message : null;

    let msg = this.messages.find((m) => m.id === msgId);
    if (msg === undefined) {
      const role = rawMsg?.role === "system" ? "system" : "assistant";
      msg = {
        id: msgId,
        role,
        timestamp: Date.now(),
        parts: [],
        isStreaming: true,
      };
      this.messages.push(msg);
    }
    msg.isStreaming = true;

    const now = Date.now();
    if (evt !== null && isRecord(evt.partial) && Array.isArray(evt.partial.content)) {
      msg.parts = this.convertContentToParts(
        evt.partial.content,
        msgId,
        msg.timestamp,
        true,
        msg.parts,
      );
      this.syncPhaseFromEvent(evt.type);
    } else if (evt !== null) {
      this.applyDeltaEvent(msg, evt, now);
    }

    this.options.onBroadcast({ type: "message_upsert", message: msg });
  }

  private syncPhaseFromEvent(evtType: unknown): void {
    switch (evtType) {
      case "thinking_start":
      case "thinking_delta":
        if (this.runState.phase !== "tool" && this.runState.phase !== "thinking") {
          this.updateRunState({ isRunning: true, phase: "thinking" });
        }
        return;
      case "text_start":
      case "text_delta":
        if (this.runState.phase !== "tool" && this.runState.phase !== "responding") {
          this.updateRunState({ isRunning: true, phase: "responding" });
        }
        return;
      default:
        return;
    }
  }

  private applyDeltaEvent(
    msg: ChatMessageView,
    evt: Record<string, unknown>,
    now: number,
  ): void {
    const evtType = evt.type;
    const contentIndex =
      typeof evt.contentIndex === "number" && Number.isInteger(evt.contentIndex) && evt.contentIndex >= 0
        ? evt.contentIndex
        : msg.parts.length;

    switch (evtType) {
      case "start": {
        if (isRecord(evt.message) && Array.isArray(evt.message.content)) {
          msg.parts = this.convertContentToParts(
            evt.message.content,
            msg.id,
            msg.timestamp,
            true,
            msg.parts,
          );
        }
        return;
      }
      case "thinking_start": {
        const part: ThinkingPart = {
          type: "thinking",
          id: `${msg.id}_think_${contentIndex}`,
          text: "",
          isStreaming: true,
          startedAt: now,
        };
        msg.parts[contentIndex] = part;
        this.updateRunState({ isRunning: true, phase: "thinking" });
        return;
      }
      case "thinking_delta": {
        const delta = typeof evt.delta === "string" ? evt.delta : "";
        let part = msg.parts[contentIndex];
        if (part === undefined || part.type !== "thinking") {
          part = {
            type: "thinking",
            id: `${msg.id}_think_${contentIndex}`,
            text: "",
            isStreaming: true,
            startedAt: now,
          };
          msg.parts[contentIndex] = part;
        }
        part.text += delta;
        this.updateRunState({ isRunning: true, phase: "thinking" });
        return;
      }
      case "thinking_end": {
        let part = msg.parts[contentIndex];
        if (part === undefined || part.type !== "thinking") {
          part = {
            type: "thinking",
            id: `${msg.id}_think_${contentIndex}`,
            text: "",
            isStreaming: false,
            startedAt: now,
            completedAt: now,
          };
          msg.parts[contentIndex] = part;
        }
        if (typeof evt.content === "string") {
          part.text = evt.content;
        }
        part.isStreaming = false;
        part.completedAt = now;
        return;
      }
      case "text_start": {
        msg.parts[contentIndex] = {
          type: "text",
          id: `${msg.id}_text_${contentIndex}`,
          text: "",
        };
        this.updateRunState({ isRunning: true, phase: "responding" });
        return;
      }
      case "text_delta": {
        const delta = typeof evt.delta === "string" ? evt.delta : "";
        let part = msg.parts[contentIndex];
        if (part === undefined || part.type !== "text") {
          part = {
            type: "text",
            id: `${msg.id}_text_${contentIndex}`,
            text: "",
          };
          msg.parts[contentIndex] = part;
        }
        part.text += delta;
        this.updateRunState({ isRunning: true, phase: "responding" });
        return;
      }
      case "text_end": {
        let part = msg.parts[contentIndex];
        if (part === undefined || part.type !== "text") {
          part = {
            type: "text",
            id: `${msg.id}_text_${contentIndex}`,
            text: "",
          };
          msg.parts[contentIndex] = part;
        }
        if (typeof evt.content === "string") {
          part.text = evt.content;
        }
        return;
      }
      case "toolcall_start": {
        const block = isRecord(evt.block) ? evt.block : null;
        const toolCallId =
          typeof block?.id === "string"
            ? block.id
            : typeof evt.id === "string"
              ? evt.id
              : `${msg.id}_tool_${contentIndex}`;
        const toolName =
          typeof block?.name === "string"
            ? block.name
            : typeof evt.name === "string"
              ? evt.name
              : "tool";
        msg.parts[contentIndex] = {
          type: "tool_call",
          toolCallId,
          toolName,
          args: block?.arguments ?? {},
          argsRaw: "",
          status: "streaming",
          output: "",
          startedAt: now,
        };
        return;
      }
      case "toolcall_delta": {
        const delta = typeof evt.delta === "string" ? evt.delta : "";
        const part = msg.parts[contentIndex];
        if (part !== undefined && part.type === "tool_call") {
          part.argsRaw = `${part.argsRaw ?? ""}${delta}`;
        }
        return;
      }
      case "toolcall_end": {
        const tc = isRecord(evt.toolCall) ? evt.toolCall : null;
        const existing = msg.parts[contentIndex];
        const prevTool = existing?.type === "tool_call" ? existing : null;
        if (tc !== null) {
          const toolCallId =
            typeof tc.id === "string"
              ? tc.id
              : prevTool?.toolCallId ?? `${msg.id}_tool_${contentIndex}`;
          const toolName =
            typeof tc.name === "string" ? tc.name : prevTool?.toolName ?? "tool";
          msg.parts[contentIndex] = {
            type: "tool_call",
            toolCallId,
            toolName,
            args: tc.arguments ?? prevTool?.args ?? {},
            ...(prevTool?.argsRaw !== undefined ? { argsRaw: prevTool.argsRaw } : {}),
            status: prevTool?.status === "completed" || prevTool?.status === "error" ? prevTool.status : "running",
            output: prevTool?.output ?? "",
            ...(prevTool?.isError !== undefined ? { isError: prevTool.isError } : {}),
            startedAt: prevTool?.startedAt ?? now,
            ...(prevTool?.completedAt !== undefined ? { completedAt: prevTool.completedAt } : {}),
          };
        }
        return;
      }
      case "image_end": {
        const block = isRecord(evt.content) ? evt.content : null;
        if (block !== null && typeof block.data === "string") {
          msg.parts[contentIndex] = {
            type: "image",
            mimeType: typeof block.mimeType === "string" ? block.mimeType : "image/png",
            data: block.data,
          };
        }
        return;
      }
      default:
        return;
    }
  }

  private handleMessageEnd(frame: Record<string, unknown>): void {
    const msgId =
      typeof frame.messageId === "string"
        ? frame.messageId
        : `msg_${++this.nextLocalMsgId}`;
    const rawMsg = isRecord(frame.message) ? frame.message : null;
    if (rawMsg === null) {
      return;
    }

    if (rawMsg.role === "toolResult") {
      this.applyToolResultToLiveMessage(rawMsg);
      return;
    }

    if (rawMsg.role === "user") {
      this.reconcileIncomingUserMessage(msgId, rawMsg, true);
      return;
    }

    const displayRole = this.resolveDisplayRole(rawMsg);
    if (displayRole === null || displayRole === "user") {
      return;
    }

    const timestamp = parseTimestampMs(rawMsg.timestamp, Date.now());
    const existingIndex = this.messages.findIndex((m) => m.id === msgId);
    const existing = existingIndex >= 0 ? this.messages[existingIndex] : undefined;

    const parts = this.convertContentToParts(
      rawMsg.content,
      msgId,
      timestamp,
      false,
      existing?.parts,
    );

    const finalized: ChatMessageView = {
      id: msgId,
      role: displayRole,
      timestamp: existing?.timestamp ?? timestamp,
      parts,
      isStreaming: false,
      ...(existing?.attachments ? { attachments: existing.attachments } : {}),
      ...(existing?.publishedFiles ? { publishedFiles: existing.publishedFiles } : {}),
    };

    if (existingIndex >= 0) {
      this.messages[existingIndex] = finalized;
    } else {
      this.messages.push(finalized);
    }

    this.options.onBroadcast({ type: "message_upsert", message: finalized });
  }

  private reconcileIncomingUserMessage(
    msgId: string,
    rawMsg: Record<string, unknown>,
    isEnd: boolean,
  ): void {
    const incomingText = extractTextFromContentArray(rawMsg.content);
    const existingById = this.messages.find((m) => m.id === msgId);
    if (existingById !== undefined) {
      existingById.isStreaming = false;
      this.options.onBroadcast({ type: "message_upsert", message: existingById });
      return;
    }

    const optIdx = this.pendingOptimisticUsers.findIndex(
      (opt) => opt.sentText === incomingText || opt.rawText === incomingText,
    );
    if (optIdx >= 0) {
      const opt = this.pendingOptimisticUsers[optIdx];
      if (isEnd) {
        this.pendingOptimisticUsers.splice(optIdx, 1);
      }
      if (opt.messageViewId.length > 0) {
        const localView = this.messages.find((m) => m.id === opt.messageViewId);
        if (localView !== undefined) {
          localView.id = msgId;
          localView.isStreaming = false;
          this.options.onBroadcast({ type: "message_upsert", message: localView });
          return;
        }
      }
      const view: ChatMessageView = {
        id: msgId,
        role: "user",
        timestamp: parseTimestampMs(rawMsg.timestamp, Date.now()),
        parts:
          opt.rawText.trim().length > 0
            ? [{ type: "text", id: `${msgId}_txt`, text: opt.rawText }]
            : [],
        isStreaming: false,
        ...(opt.attachments ? { attachments: opt.attachments } : {}),
      };
      this.messages.push(view);
      this.options.onBroadcast({ type: "message_upsert", message: view });
      return;
    }

    const view: ChatMessageView = {
      id: msgId,
      role: "user",
      timestamp: parseTimestampMs(rawMsg.timestamp, Date.now()),
      parts: this.convertContentToParts(rawMsg.content, msgId, Date.now(), false),
      isStreaming: false,
    };
    this.messages.push(view);
    this.options.onBroadcast({ type: "message_upsert", message: view });
  }

  private applyToolResultToLiveMessage(rawMsg: Record<string, unknown>): void {
    const toolCallId = typeof rawMsg.toolCallId === "string" ? rawMsg.toolCallId : "";
    if (toolCallId.length === 0) {
      return;
    }
    const output = formatToolResultOutput(rawMsg);
    const isError = rawMsg.isError === true;

    for (let i = this.messages.length - 1; i >= 0; i--) {
      const msg = this.messages[i];
      for (const part of msg.parts) {
        if (part.type === "tool_call" && part.toolCallId === toolCallId) {
          part.status = isError ? "error" : "completed";
          part.isError = isError;
          if (output.length > 0 || part.output.length === 0) {
            part.output = output;
          }
          part.completedAt = part.completedAt ?? Date.now();
          this.options.onBroadcast({ type: "message_upsert", message: msg });
          return;
        }
      }
    }
  }

  private handleToolExecutionStart(frame: Record<string, unknown>): void {
    const toolCallId = typeof frame.toolCallId === "string" ? frame.toolCallId : "";
    const toolName = typeof frame.toolName === "string" ? frame.toolName : "tool";
    const args = frame.args ?? frame.arguments ?? {};

    this.updateRunState({
      isRunning: true,
      phase: "tool",
      activeToolName: toolName,
    });

    if (toolCallId.length === 0) {
      return;
    }

    for (let i = this.messages.length - 1; i >= 0; i--) {
      const msg = this.messages[i];
      for (const part of msg.parts) {
        if (part.type === "tool_call" && part.toolCallId === toolCallId) {
          part.status = "running";
          part.toolName = toolName;
          part.args = args;
          part.startedAt = part.startedAt || Date.now();
          this.options.onBroadcast({ type: "message_upsert", message: msg });
          return;
        }
      }
    }

    const latestAssistant = this.findOrCreateActiveAssistantMessage();
    latestAssistant.parts.push({
      type: "tool_call",
      toolCallId,
      toolName,
      args,
      status: "running",
      output: "",
      startedAt: Date.now(),
    });
    this.options.onBroadcast({ type: "message_upsert", message: latestAssistant });
  }

  private handleToolExecutionUpdate(frame: Record<string, unknown>, isStreamDelta: boolean): void {
    const toolCallId = typeof frame.toolCallId === "string" ? frame.toolCallId : "";
    if (toolCallId.length === 0) {
      return;
    }

    let chunkText = "";
    if (frame.partialResult !== undefined) {
      chunkText = formatToolResultOutput(frame.partialResult);
    } else if (typeof frame.delta === "string") {
      chunkText = frame.delta;
    } else if (typeof frame.chunk === "string") {
      chunkText = frame.chunk;
    } else if (typeof frame.text === "string") {
      chunkText = frame.text;
    }

    if (chunkText.length === 0) {
      return;
    }

    for (let i = this.messages.length - 1; i >= 0; i--) {
      const msg = this.messages[i];
      for (const part of msg.parts) {
        if (part.type === "tool_call" && part.toolCallId === toolCallId) {
          if (isStreamDelta && frame.partialResult === undefined) {
            part.output += chunkText;
          } else {
            part.output = chunkText;
          }
          part.status = "running";
          this.options.onBroadcast({ type: "message_upsert", message: msg });
          return;
        }
      }
    }
  }

  private handleToolExecutionEnd(frame: Record<string, unknown>): void {
    const toolCallId = typeof frame.toolCallId === "string" ? frame.toolCallId : "";
    const toolName = typeof frame.toolName === "string" ? frame.toolName : "";
    const isError = frame.isError === true;
    const output = formatToolResultOutput(frame.result);

    if (toolCallId.length > 0) {
      for (let i = this.messages.length - 1; i >= 0; i--) {
        const msg = this.messages[i];
        for (const part of msg.parts) {
          if (part.type === "tool_call" && part.toolCallId === toolCallId) {
            part.status = isError ? "error" : "completed";
            part.isError = isError;
            if (output.length > 0 || part.output.length === 0) {
              part.output = output;
            }
            part.completedAt = Date.now();
            this.options.onBroadcast({ type: "message_upsert", message: msg });
            break;
          }
        }
      }
    }

    if (this.runState.activeToolName === toolName || this.runState.phase === "tool") {
      this.updateRunState({
        phase: this.runState.isRunning ? "thinking" : "idle",
        activeToolName: null,
      });
    }
  }

  private handleSubagentFrame(frame: Record<string, unknown>): void {
    const id =
      typeof frame.subagentId === "string"
        ? frame.subagentId
        : typeof frame.id === "string"
          ? frame.id
          : null;
    if (id === null || id.length === 0) {
      return;
    }

    const existing = this.subagentsMap.get(id);
    const updated: SubagentView = {
      id,
      name:
        typeof frame.name === "string"
          ? frame.name
          : existing?.name,
      agent:
        typeof frame.agent === "string"
          ? frame.agent
          : existing?.agent,
      status:
        frame.status !== undefined
          ? mapSubagentStatus(frame.status)
          : existing?.status ?? "running",
      summary:
        typeof frame.summary === "string"
          ? frame.summary
          : typeof frame.message === "string"
            ? frame.message
            : existing?.summary,
      updatedAt: Date.now(),
    };

    this.subagentsMap.set(id, updated);
    this.options.onBroadcast({
      type: "subagents_updated",
      subagents: [...this.subagentsMap.values()],
    });
  }

  private handleExtensionUiRequest(frame: Record<string, unknown>): void {
    const method = frame.method;
    if (typeof method !== "string") {
      return;
    }

    if (method === "cancel") {
      const targetId = typeof frame.targetId === "string" ? frame.targetId : null;
      if (targetId !== null && this.pendingUiMap.delete(targetId)) {
        this.options.onBroadcast({ type: "ui_request_cancelled", id: targetId });
      }
      return;
    }

    if (method === "notify") {
      const level =
        frame.notifyType === "error" || frame.level === "error"
          ? "error"
          : frame.notifyType === "warning" || frame.notifyType === "warn" || frame.level === "warn"
            ? "warn"
            : "info";
      const text =
        typeof frame.message === "string"
          ? frame.message
          : typeof frame.title === "string"
            ? frame.title
            : "";
      if (text.length > 0) {
        this.options.onBroadcast({
          type: "notice",
          level,
          text,
          timestamp: Date.now(),
        });
      }
      return;
    }

    if (method === "open_url") {
      const targetUrl =
        typeof frame.launchUrl === "string"
          ? frame.launchUrl
          : typeof frame.url === "string"
            ? frame.url
            : "";
      if (targetUrl.length > 0) {
        this.options.onBroadcast({
          type: "notice",
          level: "info",
          text: `URL de autenticación disponible: ${targetUrl}`,
          timestamp: Date.now(),
        });
      }
      return;
    }

    if (
      method === "setWidget" ||
      method === "setStatus" ||
      method === "setTitle" ||
      method === "set_editor_text"
    ) {
      // Terminal-only presentation hints are intentionally ignored in web mode.
      return;
    }

    if (!UI_DIALOG_METHODS.has(method as ExtensionUiRequestView["method"])) {
      return;
    }

    const id = typeof frame.id === "string" ? frame.id : null;
    if (id === null) {
      return;
    }

    const view: ExtensionUiRequestView = {
      id,
      method: method as ExtensionUiRequestView["method"],
      ...(typeof frame.title === "string" ? { title: frame.title } : {}),
      ...(typeof frame.message === "string" ? { message: frame.message } : {}),
      ...(typeof frame.placeholder === "string" ? { placeholder: frame.placeholder } : {}),
      ...(typeof frame.secret === "boolean" ? { secret: frame.secret } : {}),
      ...(Array.isArray(frame.options)
        ? { options: frame.options.filter((o): o is string => typeof o === "string") }
        : {}),
      ...(Array.isArray(frame.optionDetails)
        ? {
            optionDetails: frame.optionDetails.map((d) =>
              isRecord(d) && typeof d.description === "string"
                ? { description: d.description }
                : {},
            ),
          }
        : {}),
      ...(frame.selectionMarker === "radio" || frame.selectionMarker === "checkbox"
        ? { selectionMarker: frame.selectionMarker }
        : {}),
      ...(Array.isArray(frame.checkedIndices)
        ? {
            checkedIndices: frame.checkedIndices.filter(
              (idx): idx is number => typeof idx === "number",
            ),
          }
        : {}),
      ...(Array.isArray(frame.questions)
        ? { questions: frame.questions as ExtensionUiQuestion[] }
        : {}),
      ...(typeof frame.html === "string" ? { html: frame.html } : {}),
      ...(typeof frame.timeout === "number" ? { timeout: frame.timeout } : {}),
      createdAt: Date.now(),
    };

    this.pendingUiMap.set(id, view);
    this.options.onBroadcast({ type: "ui_request", request: view });
  }

  private findOrCreateActiveAssistantMessage(): ChatMessageView {
    const last = this.messages[this.messages.length - 1];
    if (last !== undefined && last.role === "assistant" && last.isStreaming) {
      return last;
    }
    const created: ChatMessageView = {
      id: `local_asst_${++this.nextLocalMsgId}`,
      role: "assistant",
      timestamp: Date.now(),
      parts: [],
      isStreaming: true,
    };
    this.messages.push(created);
    return created;
  }

  private updateRunState(patch: Partial<AgentRunState>): void {
    this.runState = { ...this.runState, ...patch };
    this.options.onBroadcast({
      type: "agent_state",
      runState: { ...this.runState },
    });
  }
}
