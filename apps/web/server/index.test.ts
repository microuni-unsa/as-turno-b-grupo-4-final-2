import { afterEach, describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import { tmpdir } from "node:os";
import * as path from "node:path";
import type {
  AgentRunState as SharedAgentRunState,
  AuthRole,
  ChatMessageView as SharedChatMessageView,
  ExtensionUiRequestView as SharedExtensionUiRequestView,
  ExtensionUiResponsePayload as SharedExtensionUiResponsePayload,
  LiveSessionSnapshot as SharedLiveSessionSnapshot,
  PendingSecretRequestPublic as SharedPendingSecretRequestPublic,
  PublishedFileSummary as SharedPublishedFileSummary,
  ServerWsMessage as SharedServerWsMessage,
  SessionSummary as SharedSessionSummary,
} from "../shared/protocol.ts";
import type { ServerConfig } from "./config.ts";
import { createWebApp, seedMemorySummaryIfNeeded, type WebBridgeLike } from "./index.ts";
import { OmpBridge, type SendPromptInput } from "./omp/bridge.ts";
import { encodeRpcFrame } from "./omp/rpc-framing.ts";
import {
  fromFrontendUiResponse,
  toFrontendMessage,
  toFrontendMirrorDoc,
  toFrontendMirrorExcerpt,
  toFrontendPublishedFile,
  toFrontendRunState,
  toFrontendSessionSummary,
  toFrontendSubagents,
  toFrontendTodos,
  toFrontendUiRequest,
} from "./wire-adapter.ts";

const RW_TOKEN = "rw-test-token-alpha-123456";
const RO_TOKEN = "ro-test-token-beta-654321";
const COOKIE_SECRET = "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789";

const tempDirs: string[] = [];
const activeCleanups: Array<() => Promise<void> | void> = [];
const savedPath = process.env.PATH;

function resolveAgeBinDir(): string {
  const direct = Bun.which("age");
  const directKeygen = Bun.which("age-keygen");
  if (direct && directKeygen) {
    return path.dirname(direct);
  }
  const nix = Bun.which("nix");
  if (!nix) {
    throw new Error("Neither age nor nix found in PATH");
  }
  const res = Bun.spawnSync([nix, "build", "nixpkgs#age", "--no-link", "--print-out-paths"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  if (res.exitCode !== 0) {
    throw new Error(`Failed to resolve nixpkgs#age: ${Buffer.from(res.stderr).toString("utf8")}`);
  }
  return path.join(Buffer.from(res.stdout).toString("utf8").trim(), "bin");
}

const ageBinDir = resolveAgeBinDir();

function createTempDir(prefix: string): string {
  const dir = fs.mkdtempSync(path.join(tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

class StubBridge implements WebBridgeLike {
  public readonly prompts: SendPromptInput[] = [];
  public readonly uiResponses: Array<{ id: string; response: SharedExtensionUiResponsePayload }> = [];
  public readonly thinkingLevels: string[] = [];
  public readonly switchedPaths: string[] = [];
  public readonly attachedFiles: SharedPublishedFileSummary[] = [];
  public aborted = false;
  public compacted = false;
  public newSessionCount = 0;

  public activeSessionId: string | null = "sess-001";
  public activeSessionFile: string | null = "/tmp/sess-001.jsonl";
  public activeSessionTitle: string | null = "Sesión de Prueba PIMS";
  public messages: SharedChatMessageView[] = [
    {
      id: "msg_asst_1",
      role: "assistant",
      timestamp: 1_700_000_000_000,
      parts: [{ type: "text", id: "p1", text: "Respuesta inicial de prueba" }],
      isStreaming: false,
    },
  ];
  public pendingUiMap = new Map<string, SharedExtensionUiRequestView>();
  public runState: SharedAgentRunState = {
    isRunning: false,
    phase: "idle",
    activeToolName: null,
    ompConnected: true,
    lastError: null,
  };

  private readonly onBroadcast: (msg: SharedServerWsMessage) => void;

  constructor(onBroadcast: (msg: SharedServerWsMessage) => void) {
    this.onBroadcast = onBroadcast;
  }

  async start(): Promise<void> {}
  async stop(): Promise<void> {}

  getSnapshot(
    role: AuthRole,
    pendingSecretRequests: SharedPendingSecretRequestPublic[],
  ): SharedLiveSessionSnapshot {
    return {
      role,
      activeSessionId: this.activeSessionId,
      activeSessionFile: this.activeSessionFile,
      messages: this.messages.map((m) => ({ ...m, parts: [...m.parts] })),
      runState: { ...this.runState },
      todos: [
        {
          phase: "Fase 1",
          items: [
            { text: "Verificar alcance", status: "done" },
            { text: "Revisar hallazgos", status: "in_progress" },
          ],
        },
      ],
      subagents: [
        {
          id: "sub_1",
          name: "auditor",
          status: "completed",
          summary: "Completado",
          updatedAt: 1_700_000_001_000,
        },
      ],
      pendingUiRequests: [...this.pendingUiMap.values()],
      pendingSecretRequests,
      queue: { steering: [], followUp: [] },
      stats: {
        inputTokens: 120,
        outputTokens: 80,
        totalTokens: 200,
        contextPercent: 4.5,
        contextWindow: 128000,
        costUsd: 0.002,
        turnCount: 1,
        softRequestBudget: 150,
        model: "test-model",
        thinkingLevel: "medium",
      },
    };
  }

  getActiveSessionTitle(): string | null {
    return this.activeSessionTitle;
  }

  getPendingUiRequest(id: string): SharedExtensionUiRequestView | undefined {
    return this.pendingUiMap.get(id);
  }

  async sendPrompt(input: SendPromptInput): Promise<void> {
    this.prompts.push(input);
  }

  async abort(): Promise<void> {
    this.aborted = true;
  }

  async newSession(): Promise<void> {
    this.newSessionCount += 1;
    this.activeSessionId = `sess-new-${this.newSessionCount}`;
    this.activeSessionFile = `/tmp/${this.activeSessionId}.jsonl`;
    this.activeSessionTitle = "Nueva sesión";
    this.messages = [];
    this.onBroadcast({
      type: "session_changed",
      snapshot: this.getSnapshot("rw", []),
    });
  }

  async switchSession(sessionPath: string): Promise<void> {
    this.switchedPaths.push(sessionPath);
    this.activeSessionId = "sess-switched";
    this.activeSessionFile = sessionPath;
    this.onBroadcast({
      type: "session_changed",
      snapshot: this.getSnapshot("rw", []),
    });
  }

  respondExtensionUi(id: string, response: SharedExtensionUiResponsePayload): void {
    if (!this.pendingUiMap.has(id)) {
      throw new Error(`No pending UI request '${id}'`);
    }
    this.pendingUiMap.delete(id);
    this.uiResponses.push({ id, response });
    this.onBroadcast({ type: "ui_request_cancelled", id });
  }

  async setThinkingLevel(level: string): Promise<void> {
    this.thinkingLevels.push(level);
  }

  async compact(): Promise<void> {
    this.compacted = true;
  }

  async exportHtml(): Promise<{ html: string; filename: string }> {
    return {
      html: "<html><body><h1>Exported Session</h1></body></html>",
      filename: `${this.activeSessionId ?? "session"}.html`,
    };
  }

  listSessions(): SharedSessionSummary[] {
    return [
      {
        id: "sess-001",
        filePath: "/tmp/sess-001.jsonl",
        title: "Sesión de Prueba PIMS",
        updatedAt: 1_700_000_000_000,
        messageCount: 2,
        isActive: true,
      },
    ];
  }

  attachPublishedFile(file: SharedPublishedFileSummary): string | null {
    this.attachedFiles.push(file);
    const target = this.messages[this.messages.length - 1];
    if (!target) {
      return null;
    }
    target.publishedFiles = [...(target.publishedFiles ?? []), file];
    return target.id;
  }
}

function buildTestFixtures() {
  process.env.PATH = `${ageBinDir}:${savedPath ?? ""}`;

  const rootDir = createTempDir("pimsai-web-e2e-");
  const uploadsDir = path.join(rootDir, "uploads");
  const secretsStoreDir = path.join(rootDir, "secrets");
  const corpusMirrorDir = path.join(rootDir, "corpus_mirror");
  const sessionsDir = path.join(rootDir, "sessions");
  const webDistDir = path.join(rootDir, "dist");
  const brandingPath = path.join(rootDir, "branding.json");

  fs.mkdirSync(sessionsDir, { recursive: true });
  fs.mkdirSync(path.join(webDistDir, "assets"), { recursive: true });
  fs.writeFileSync(
    path.join(webDistDir, "index.html"),
    "<!doctype html><html><body><div id=\"root\">SPA</div></body></html>",
  );
  fs.writeFileSync(
    path.join(webDistDir, "assets", "app.js"),
    "console.log('pimsai-spa');",
  );

  // Create corpus mirror fixture
  const docDir = path.join(corpusMirrorDir, "G4-ALC-01");
  fs.mkdirSync(docDir, { recursive: true });
  fs.writeFileSync(
    path.join(docDir, "manifest.json"),
    JSON.stringify({
      title: "Alcance del SGPI Grupo 4",
      latest_version: "3.00",
      updated_at: "2026-11-01T12:00:00Z",
      versions: [{ pims_version: "3.00" }],
    }),
  );
  fs.writeFileSync(
    path.join(docDir, "v3.00.txt"),
    "Línea 1: Alcance del SGPI UNSA\nLínea 2: Responsable de Tratamiento PII\nLínea 3: Cláusula 4.1",
  );
  fs.writeFileSync(
    path.join(docDir, "v3.00.pdf"),
    "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF\n",
  );

  fs.writeFileSync(
    brandingPath,
    JSON.stringify({
      appName: "UNSA PIMS Test",
      subtitle: "ISO 27701:2025",
      shortBadge: "ISO 27701",
      primaryColor: "#7A1C2E",
      accentColor: "#C59B27",
      defaultTheme: "dark",
      starterPrompts: [
        {
          id: "p1",
          title: "Starter 1",
          clause: "Cl. 4.1",
          badge: "Cl. 4.1",
          description: "Desc",
          prompt: "Analiza el alcance",
        },
      ],
    }),
  );

  const config: ServerConfig = {
    projectRoot: rootDir,
    port: 0,
    publicUrl: "https://demo.pimsai.mistercricro8.top:444",
    rwToken: RW_TOKEN,
    roToken: RO_TOKEN,
    devNoAuth: false,
    cookieSecret: COOKIE_SECRET,
    uploadsDir,
    secretsStoreDir,
    corpusMirrorDir,
    sessionsDir,
    webDistDir,
    brandingPath,
    agentModel: "test/model-v1",
    agentEnvVar: null,
    agentApiKey: null,
    databaseUrl: null,
    pimsBaseUrl: null,
    softRequestBudget: 150,
  };

  return { rootDir, config };
}

async function startTestServer(options?: {
  resolveRemoteIp?: (req: Request, env: unknown) => string | null;
}) {
  const { rootDir, config } = buildTestFixtures();
  let stub!: StubBridge;

  const webApp = createWebApp({
    config,
    skipMemorySeed: true,
    resolveRemoteIp: options?.resolveRemoteIp,
    bridge: (onBroadcast) => {
      stub = new StubBridge(onBroadcast);
      return stub;
    },
  });

  await webApp.secretsService.initialize();

  const server = Bun.serve({
    port: 0,
    hostname: "127.0.0.1",
    fetch: webApp.app.fetch,
    websocket: webApp.websocket,
  });

  const baseUrl = `http://127.0.0.1:${server.port}`;
  const wsBaseUrl = `ws://127.0.0.1:${server.port}`;

  activeCleanups.push(async () => {
    server.stop(true);
    await webApp.stop();
  });

  return { rootDir, config, webApp, stub, server, baseUrl, wsBaseUrl };
}

class WsTestClient {
  private readonly ws: WebSocket;
  private readonly queue: Array<Record<string, unknown>> = [];
  private readonly waiters: Array<(msg: Record<string, unknown>) => void> = [];
  public readonly openPromise: Promise<void>;

  constructor(url: string, headers: Record<string, string>) {
    this.ws = new WebSocket(url, { headers } as never);
    this.openPromise = new Promise<void>((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
    });
    this.ws.onmessage = (evt) => {
      const parsed = JSON.parse(String(evt.data)) as Record<string, unknown>;
      const waiter = this.waiters.shift();
      if (waiter) {
        waiter(parsed);
      } else {
        this.queue.push(parsed);
      }
    };
  }

  async nextMessage(timeoutMs: number = 3000): Promise<Record<string, unknown>> {
    const queued = this.queue.shift();
    if (queued) {
      return queued;
    }
    return new Promise<Record<string, unknown>>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timed out waiting for WS message after ${timeoutMs}ms`));
      }, timeoutMs);
      this.waiters.push((msg) => {
        clearTimeout(timer);
        resolve(msg);
      });
    });
  }

  send(payload: unknown): void {
    this.ws.send(JSON.stringify(payload));
  }

  close(): void {
    this.ws.close();
  }
}

afterEach(async () => {
  while (activeCleanups.length > 0) {
    const fn = activeCleanups.pop();
    if (fn) {
      await fn();
    }
  }
  process.env.PATH = savedPath;
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("wire-adapter", () => {
  test("maps DTOs deterministically to exact frontend protocol contract", () => {
    const pub = toFrontendPublishedFile({
      slug: "informe-soa",
      filename: "informe-soa.html",
      url: "https://demo.pimsai.mistercricro8.top:444/api/files/informe-soa",
      download_url: "https://demo.pimsai.mistercricro8.top:444/api/files/informe-soa?download=1",
      relative_url: "/api/files/informe-soa",
      relative_download_url: "/api/files/informe-soa?download=1",
      content_type: "text/html; charset=utf-8",
      size_bytes: 2048,
      created_at: "2026-11-25T10:00:00.000Z",
      expires_at: "2026-11-25T11:00:00.000Z",
    });
    expect(pub).toEqual({
      slug: "informe-soa",
      fileName: "informe-soa.html",
      extension: "html",
      mimeType: "text/html; charset=utf-8",
      sizeBytes: 2048,
      publishedAt: "2026-11-25T10:00:00.000Z",
      expiresAt: "2026-11-25T11:00:00.000Z",
      url: "/api/files/informe-soa",
      downloadUrl: "/api/files/informe-soa?download=1",
    });

    expect(
      toFrontendRunState(
        {
          isRunning: true,
          phase: "responding",
          activeToolName: null,
          ompConnected: true,
          lastError: null,
        },
        "high",
      ),
    ).toEqual({
      status: "streaming",
      activeToolName: null,
      error: null,
      thinkingLevel: "high",
    });

    expect(
      toFrontendRunState({
        isRunning: false,
        phase: "idle",
        activeToolName: null,
        ompConnected: false,
        lastError: "boom",
      }),
    ).toEqual({
      status: "error",
      activeToolName: null,
      error: "boom",
      thinkingLevel: null,
    });

    const msg = toFrontendMessage({
      id: "m1",
      role: "assistant",
      timestamp: 1000,
      parts: [
        { type: "thinking", id: "t1", text: "hmm", isStreaming: false, startedAt: 100, completedAt: 350 },
        {
          type: "tool_call",
          toolCallId: "tc1",
          toolName: "read",
          args: { path: "a.txt" },
          status: "completed",
          output: "ok",
          startedAt: 200,
          completedAt: 500,
        },
        { type: "text", id: "tx1", text: "Parte A" },
        { type: "text", id: "tx2", text: "Parte B" },
      ],
    });
    expect(msg.createdAt).toBe(1000);
    expect(msg.text).toBe("Parte A\n\nParte B");
    expect(msg.parts[0]).toEqual({
      type: "thinking",
      text: "hmm",
      isStreaming: false,
      durationMs: 250,
    });
    expect(msg.parts[1]).toEqual({
      type: "tool_call",
      id: "tc1",
      toolName: "read",
      args: { path: "a.txt" },
      output: "ok",
      status: "success",
      startedAt: 200,
      endedAt: 500,
      durationMs: 300,
    });

    expect(
      toFrontendTodos([
        {
          phase: "Auditoría",
          items: [
            { text: "A", status: "done" },
            { text: "B", status: "blocked" },
          ],
        },
      ]),
    ).toEqual([
      {
        id: "phase_0",
        name: "Auditoría",
        tasks: [
          { id: "task_0_0", content: "A", status: "completed" },
          { id: "task_0_1", content: "B", status: "cancelled" },
        ],
      },
    ]);

    expect(
      toFrontendSubagents([
        { id: "s1", agent: "helper", status: "aborted", summary: "stop", updatedAt: 42 },
      ]),
    ).toEqual([
      { id: "s1", name: "helper", status: "error", task: "stop", startedAt: 42 },
    ]);

    expect(
      toFrontendUiRequest({
        id: "ui1",
        method: "select",
        options: ["A", "B"],
        optionDetails: [{ description: "First" }, {}],
        createdAt: 123,
      }),
    ).toEqual({
      id: "ui1",
      kind: "select",
      title: "Confirmación requerida",
      options: [{ label: "A", value: "A", description: "First" }, "B"],
      createdAt: 123,
    });

    expect(fromFrontendUiResponse("confirm", true)).toEqual({ confirmed: true });
    expect(fromFrontendUiResponse("confirm", false)).toEqual({ confirmed: false });
    expect(fromFrontendUiResponse("select", "optA")).toEqual({ value: "optA" });
    expect(fromFrontendUiResponse("input", null)).toEqual({ cancelled: true });
    expect(fromFrontendUiResponse("form", { host: "pims", tls: true })).toEqual({
      data: { host: "pims", tls: "true" },
    });

    expect(
      toFrontendSessionSummary({
        id: "s1",
        filePath: "/tmp/s1.jsonl",
        title: "Title",
        updatedAt: Date.parse("2026-11-25T00:00:00.000Z"),
        messageCount: 4,
        isActive: true,
      }),
    ).toEqual({
      id: "s1",
      filePath: "/tmp/s1.jsonl",
      title: "Title",
      messageCount: 4,
      createdAt: "2026-11-25T00:00:00.000Z",
      updatedAt: "2026-11-25T00:00:00.000Z",
      isActive: true,
    });

    expect(
      toFrontendMirrorDoc({
        code: "G4-ALC-01",
        title: "Alcance",
        latestVersion: "3.00",
        updatedAt: null,
        versions: [{ version: "3.00", hasPdf: true, hasText: true }],
      }),
    ).toEqual({
      code: "G4-ALC-01",
      versions: ["3.00"],
      latestVersion: "3.00",
      hasPdf: true,
      hasText: true,
    });

    expect(
      toFrontendMirrorExcerpt({
        docCode: "G4-ALC-01",
        version: "3.00",
        title: "Alcance",
        startLine: 1,
        endLine: 2,
        totalLines: 10,
        lines: [],
        text: "L1\nL2",
        pdfAvailable: true,
      }),
    ).toEqual({
      doc: "G4-ALC-01",
      version: "3.00",
      startLine: 1,
      endLine: 2,
      totalLines: 10,
      text: "L1\nL2",
    });
  });
});

describe("seedMemorySummaryIfNeeded", () => {
  test("syncs memory_summary.md using cmp -s semantics", () => {
    const projectRoot = createTempDir("mem-proj-");
    const homeDir = createTempDir("mem-home-");
    const seedDir = path.join(projectRoot, ".omp", "memory-seed");
    fs.mkdirSync(seedDir, { recursive: true });
    const seedPath = path.join(seedDir, "memory_summary.md");
    fs.writeFileSync(seedPath, "# Seed v1\n");

    expect(seedMemorySummaryIfNeeded(projectRoot, homeDir)).toBe(true);
    const dstPath = path.join(homeDir, ".omp", "agent", "memories", "--app--", "memory_summary.md");
    expect(fs.readFileSync(dstPath, "utf8")).toBe("# Seed v1\n");

    // Second run with identical contents returns false
    expect(seedMemorySummaryIfNeeded(projectRoot, homeDir)).toBe(false);

    // Updating seed triggers copy
    fs.writeFileSync(seedPath, "# Seed v2\n");
    expect(seedMemorySummaryIfNeeded(projectRoot, homeDir)).toBe(true);
    expect(fs.readFileSync(dstPath, "utf8")).toBe("# Seed v2\n");
  });
});

describe("OmpBridge custom extension messages", () => {
  test("skips startup banner custom message and projects mas ayuda as assistant", async () => {
    const rootDir = createTempDir("omp-bridge-custom-");
    const sessionsDir = path.join(rootDir, "sessions");
    fs.mkdirSync(sessionsDir, { recursive: true });
    const sessionFile = path.join(sessionsDir, "s1.jsonl");
    fs.writeFileSync(
      sessionFile,
      JSON.stringify({ type: "session", id: "s1" }) +
        "\n" +
        JSON.stringify({ type: "title", title: "Sesión Custom" }) +
        "\n",
    );

    const scriptPath = path.join(rootDir, "fake-omp.ts");
    fs.writeFileSync(
      scriptPath,
      `
import { createInterface } from "node:readline";
const write = (obj: unknown) => process.stdout.write(JSON.stringify(obj) + "\\n");
write({ type: "ready", protocolVersion: 2 });
const rl = createInterface({ input: process.stdin });
rl.on("line", (line) => {
  const req = JSON.parse(line);
  if (req.type === "negotiate_protocol") {
    write({ type: "response", id: req.id, command: req.type, success: true, data: { protocolVersion: 2 } });
  } else if (req.type === "set_subagent_subscription") {
    write({ type: "response", id: req.id, command: req.type, success: true, data: {} });
  } else if (req.type === "get_state") {
    write({ type: "response", id: req.id, command: req.type, success: true, data: { sessionId: "s1", sessionFile: ${JSON.stringify(sessionFile)}, isStreaming: false } });
  } else if (req.type === "get_session_stats") {
    write({ type: "response", id: req.id, command: req.type, success: true, data: { tokens: { input: 0, output: 0, total: 0 } } });
  } else if (req.type === "get_messages_page") {
    write({
      type: "response",
      id: req.id,
      command: req.type,
      success: true,
      data: {
        messages: [
          { id: "c1", role: "custom", display: true, content: "UNSA PIMS — OPERADOR AGÉNTICO DEL SGPI (GRUPO 4)\\nBanner" },
          { id: "c2", role: "custom", display: false, content: "Hidden internal note" },
          { id: "c3", role: "custom", display: true, content: "# Guía Operativa Completa\\nContenido útil" }
        ],
        nextCursor: null
      }
    });
  } else if (req.type === "prompt") {
    write({ type: "response", id: req.id, command: req.type, success: true, data: {} });
    write({
      type: "message_end",
      messageId: "live_banner",
      message: { role: "custom", display: true, content: "UNSA PIMS — OPERADOR AGÉNTICO DEL SGPI" }
    });
    write({
      type: "message_end",
      messageId: "live_help",
      message: { role: "custom", display: true, content: "## Ayuda en vivo" }
    });
  }
});
`,
    );

    const broadcasts: SharedServerWsMessage[] = [];
    const bridge = new OmpBridge({
      projectRoot: rootDir,
      port: 8082,
      sessionsDir,
      softRequestBudget: 150,
      agentModel: null,
      agentEnvVar: null,
      agentApiKey: null,
      ompCommand: [process.execPath, "run", scriptPath],
      onBroadcast: (msg) => broadcasts.push(msg),
    });

    activeCleanups.push(() => bridge.stop());

    await bridge.start();
    const initialSnap = bridge.getSnapshot("rw", []);
    expect(initialSnap.messages.length).toBe(1);
    expect(initialSnap.messages[0].id).toBe("c3");
    expect(initialSnap.messages[0].role).toBe("assistant");
    expect(initialSnap.messages[0].isStreaming).toBe(false);
    expect(bridge.getActiveSessionTitle()).toBe("Sesión Custom");

    await bridge.sendPrompt({ message: "mas ayuda" });
    await new Promise((r) => setTimeout(r, 120));

    const snapAfter = bridge.getSnapshot("rw", []);
    expect(snapAfter.messages.map((m) => m.id)).toContain("live_help");
    expect(snapAfter.messages.map((m) => m.id)).not.toContain("live_banner");
    const liveHelp = snapAfter.messages.find((m) => m.id === "live_help");
    expect(liveHelp?.role).toBe("assistant");
    expect(liveHelp?.isStreaming).toBe(false);

    // Ensure encodeRpcFrame import is used and valid
    expect(encodeRpcFrame({ ok: true }).endsWith("\n")).toBe(true);
  });
});

describe("Unified HTTP & WebSocket Server E2E", () => {
  test("public routes, auth login/logout, auth gate, and RO restrictions", async () => {
    const { baseUrl } = await startTestServer();

    // Health GET & HEAD
    const healthRes = await fetch(`${baseUrl}/health`);
    expect(healthRes.status).toBe(200);
    expect((await healthRes.json()).status).toBe("ok");

    const healthHead = await fetch(`${baseUrl}/healthz`, { method: "HEAD" });
    expect(healthHead.status).toBe(200);

    // Branding
    const brandingRes = await fetch(`${baseUrl}/api/branding`);
    expect(brandingRes.status).toBe(200);
    const branding = await brandingRes.json();
    expect(branding.appName).toBe("UNSA PIMS Test");
    expect(branding.starterPrompts).toHaveLength(1);

    // Unauthenticated /api/auth/me and /api/sessions
    const meUnauth = await fetch(`${baseUrl}/api/auth/me`);
    expect(await meUnauth.json()).toEqual({
      authenticated: false,
      role: null,
      authEnabled: true,
    });
    expect((await fetch(`${baseUrl}/api/sessions`)).status).toBe(401);
    expect((await fetch(`${baseUrl}/api/files`)).status).toBe(401);
    expect((await fetch(`${baseUrl}/api/secrets`)).status).toBe(401);
    expect((await fetch(`${baseUrl}/api/status`)).status).toBe(401);
    expect((await fetch(`${baseUrl}/api/mirror/docs`)).status).toBe(401);
    expect((await fetch(`${baseUrl}/ws`)).status).toBe(401);

    // Login bad token
    const badLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "wrong-token" }),
    });
    expect(badLogin.status).toBe(401);

    // Login RW & verify Set-Cookie works on subsequent requests
    const rwLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: RW_TOKEN }),
    });
    expect(rwLogin.status).toBe(200);
    expect(await rwLogin.json()).toEqual({ role: "rw" });
    const rwSetCookie = rwLogin.headers.get("set-cookie");
    expect(rwSetCookie).toContain("pimsai_session=");
    const rwCookiePair = rwSetCookie!.split(";")[0]!;

    const meRw = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: rwCookiePair },
    });
    expect(await meRw.json()).toEqual({
      authenticated: true,
      role: "rw",
      authEnabled: true,
    });

    // Logout clears cookie
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, { method: "POST" });
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.headers.get("set-cookie")).toContain("Max-Age=0");

    // RO token restrictions
    const roHeaders = { Authorization: `Bearer ${RO_TOKEN}` };
    expect((await fetch(`${baseUrl}/api/sessions`, { headers: roHeaders })).status).toBe(200);

    const roExport = await fetch(`${baseUrl}/api/sessions/export`, {
      method: "POST",
      headers: roHeaders,
    });
    expect(roExport.status).toBe(200);
    expect((await roExport.json()).html).toContain("Exported Session");

    const roStatus = await fetch(`${baseUrl}/api/status`, { headers: roHeaders });
    expect(roStatus.status).toBe(200);
    expect((await roStatus.json()).ompConnected).toBe(true);

    // RO blocked from write APIs
    const roUpload = await fetch(`${baseUrl}/api/uploads`, {
      method: "POST",
      headers: roHeaders,
      body: new FormData(),
    });
    expect(roUpload.status).toBe(403);
    expect((await roUpload.json()).error).toBe("FORBIDDEN_READ_ONLY");

    const roCreateSecret = await fetch(`${baseUrl}/api/secrets`, {
      method: "POST",
      headers: { ...roHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ label: "x", secretValue: "y" }),
    });
    expect(roCreateSecret.status).toBe(403);

    const roSubmitSecret = await fetch(`${baseUrl}/api/secrets/submit/abc`, {
      method: "POST",
      headers: { ...roHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ secretValue: "y" }),
    });
    expect(roSubmitSecret.status).toBe(403);

    // SPA static + fallback + API 404
    const assetRes = await fetch(`${baseUrl}/assets/app.js`);
    expect(assetRes.status).toBe(200);
    expect(await assetRes.text()).toContain("pimsai-spa");

    const spaFallback = await fetch(`${baseUrl}/conversations/123`);
    expect(spaFallback.status).toBe(200);
    expect(await spaFallback.text()).toContain("SPA");

    const missingApi = await fetch(`${baseUrl}/api/unknown-route`, { headers: roHeaders });
    expect(missingApi.status).toBe(404);
  });

  test("loopback guard blocks non-loopback callers on /internal/*", async () => {
    let simulatedIp: string | null = "10.0.0.42";
    const { baseUrl } = await startTestServer({
      resolveRemoteIp: () => simulatedIp,
    });

    const blockedPublish = await fetch(`${baseUrl}/internal/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: "test", filename: "a.txt", content: "hi" }),
    });
    expect(blockedPublish.status).toBe(403);
    expect((await blockedPublish.json()).error).toBe("FORBIDDEN_INTERNAL");

    simulatedIp = null;
    const blockedNullIp = await fetch(`${baseUrl}/internal/secrets/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: "api_key" }),
    });
    expect(blockedNullIp.status).toBe(403);

    simulatedIp = "127.0.0.1";
    const allowedPublish = await fetch(`${baseUrl}/internal/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: "test-ok", filename: "a.txt", content: "hi" }),
    });
    expect(allowedPublish.status).toBe(201);
  });

  test("file upload, internal publish, GET/HEAD inline/download, HTML CSP, and mirror endpoints", async () => {
    const { baseUrl, wsBaseUrl, stub } = await startTestServer();
    const rwHeaders = { Authorization: `Bearer ${RW_TOKEN}` };

    const wsRw = new WsTestClient(`${wsBaseUrl}/ws`, rwHeaders);
    await wsRw.openPromise;
    const initMsg = await wsRw.nextMessage();
    expect(initMsg.type).toBe("init_snapshot");

    // Upload txt file as RW
    const fd = new FormData();
    fd.append("file", new File(["evidencia PIMS v1"], "evidencia.txt", { type: "text/plain" }));
    const uplRes = await fetch(`${baseUrl}/api/uploads`, {
      method: "POST",
      headers: rwHeaders,
      body: fd,
    });
    expect(uplRes.status).toBe(201);
    const uplJson = await uplRes.json();
    expect(uplJson.fileName).toBe("evidencia.txt");
    expect(uplJson.url).toBe(`/api/uploads/${uplJson.id}`);

    // GET & HEAD uploaded file
    const getUpl = await fetch(`${baseUrl}${uplJson.url}`, { headers: rwHeaders });
    expect(getUpl.status).toBe(200);
    expect(await getUpl.text()).toBe("evidencia PIMS v1");

    const headUpl = await fetch(`${baseUrl}${uplJson.downloadUrl}`, {
      method: "HEAD",
      headers: rwHeaders,
    });
    expect(headUpl.status).toBe(200);
    expect(headUpl.headers.get("content-disposition")).toContain("attachment;");

    // Internal publish HTML deliverable -> triggers file_published WS event & attaches to message
    const pubRes = await fetch(`${baseUrl}/internal/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: "reporte-g4",
        filename: "reporte-g4.html",
        content: "<html><body><h1>Reporte</h1></body></html>",
      }),
    });
    expect(pubRes.status).toBe(201);
    const pubJson = await pubRes.json();
    expect(pubJson.relative_url).toBe("/api/files/reporte-g4");
    expect(stub.attachedFiles.length).toBe(1);

    const wsFileEvent = await wsRw.nextMessage();
    expect(wsFileEvent.type).toBe("file_published");
    expect((wsFileEvent.file as Record<string, unknown>).url).toBe("/api/files/reporte-g4");
    expect(wsFileEvent.messageId).toBe("msg_asst_1");

    // Inline HTML has sandbox CSP; download=1 does not
    const htmlInline = await fetch(`${baseUrl}/api/files/reporte-g4`, { headers: rwHeaders });
    expect(htmlInline.status).toBe(200);
    expect(htmlInline.headers.get("content-security-policy")).toBe("sandbox allow-scripts");
    expect(htmlInline.headers.get("content-disposition")).toContain("inline;");

    const htmlHead = await fetch(`${baseUrl}/api/files/reporte-g4`, {
      method: "HEAD",
      headers: rwHeaders,
    });
    expect(htmlHead.status).toBe(200);
    expect(htmlHead.headers.get("content-length")).toBeTruthy();

    const htmlDownload = await fetch(`${baseUrl}/api/files/reporte-g4?download=1`, {
      headers: rwHeaders,
    });
    expect(htmlDownload.status).toBe(200);
    expect(htmlDownload.headers.get("content-disposition")).toContain("attachment;");
    expect(htmlDownload.headers.get("content-security-policy")).toBeNull();

    // GET /api/files lists both
    const listFiles = await (await fetch(`${baseUrl}/api/files`, { headers: rwHeaders })).json();
    expect(listFiles.published).toHaveLength(1);
    expect(listFiles.uploads).toHaveLength(1);

    // Mirror endpoints
    const mirrorDocs = await (
      await fetch(`${baseUrl}/api/mirror/docs`, { headers: rwHeaders })
    ).json();
    expect(mirrorDocs.docs).toEqual([
      {
        code: "G4-ALC-01",
        versions: ["3.00"],
        latestVersion: "3.00",
        hasPdf: true,
        hasText: true,
      },
    ]);

    const excerpt = await (
      await fetch(`${baseUrl}/api/mirror/excerpt?doc=G4-ALC-01&ver=3&lines=L1-L2`, {
        headers: rwHeaders,
      })
    ).json();
    expect(excerpt).toEqual({
      doc: "G4-ALC-01",
      version: "3.00",
      startLine: 1,
      endLine: 2,
      totalLines: 3,
      text: "Línea 1: Alcance del SGPI UNSA\nLínea 2: Responsable de Tratamiento PII",
    });

    const pdfGet = await fetch(`${baseUrl}/api/mirror/download/G4-ALC-01?ver=3`, {
      headers: rwHeaders,
    });
    expect(pdfGet.status).toBe(200);
    expect(pdfGet.headers.get("content-type")).toBe("application/pdf");
    expect(await pdfGet.text()).toContain("%PDF-1.4");

    const pdfHead = await fetch(`${baseUrl}/api/mirror/download/G4-ALC-01?download=1`, {
      method: "HEAD",
      headers: rwHeaders,
    });
    expect(pdfHead.status).toBe(200);
    expect(pdfHead.headers.get("content-disposition")).toContain("attachment;");

    wsRw.close();
  });

  test("secrets direct, inline request, long-poll, RO token masking, and WS commands", async () => {
    const { baseUrl, wsBaseUrl, stub } = await startTestServer();
    const rwHeaders = { Authorization: `Bearer ${RW_TOKEN}` };
    const roHeaders = { Authorization: `Bearer ${RO_TOKEN}` };

    const wsRw = new WsTestClient(`${wsBaseUrl}/ws`, rwHeaders);
    const wsRo = new WsTestClient(`${wsBaseUrl}/ws`, roHeaders);
    await Promise.all([wsRw.openPromise, wsRo.openPromise]);

    const rwInit = await wsRw.nextMessage();
    const roInit = await wsRo.nextMessage();
    expect(rwInit.type).toBe("init_snapshot");
    expect(roInit.type).toBe("init_snapshot");

    // Direct secret creation as RW
    const directRes = await fetch(`${baseUrl}/api/secrets`, {
      method: "POST",
      headers: { ...rwHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ label: "pims_admin_pass", secretValue: "s3cr3t-v1", scope: "pims" }),
    });
    expect(directRes.status).toBe(201);
    expect((await directRes.json()).handle).toBe("secret:pims_admin_pass@v1");

    // Internal inline secret request -> RW WS gets token, RO WS gets token: ""
    const reqRes = await fetch(`${baseUrl}/internal/secrets/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: "smtp_password", scope: "mail" }),
    });
    expect(reqRes.status).toBe(201);
    const reqJson = await reqRes.json();

    const rwCreatedEvt = await wsRw.nextMessage();
    const roCreatedEvt = await wsRo.nextMessage();
    expect(rwCreatedEvt.type).toBe("secret_request_created");
    expect((rwCreatedEvt.request as Record<string, unknown>).token).toBe(reqJson.token);
    expect(roCreatedEvt.type).toBe("secret_request_created");
    expect((roCreatedEvt.request as Record<string, unknown>).token).toBe("");

    // GET /api/secrets masks pending token for RO, includes token for RW
    const rwList = await (await fetch(`${baseUrl}/api/secrets`, { headers: rwHeaders })).json();
    const roList = await (await fetch(`${baseUrl}/api/secrets`, { headers: roHeaders })).json();
    expect(rwList.pending[0].token).toBe(reqJson.token);
    expect(roList.pending[0].token).toBe("");

    // Personalized session_changed also masks token for RO
    wsRw.send({ type: "new_session" });
    const rwSessChanged = await wsRw.nextMessage();
    const roSessChanged = await wsRo.nextMessage();
    expect(rwSessChanged.type).toBe("session_changed");
    expect(roSessChanged.type).toBe("session_changed");
    const rwPendingInSnap = (
      (rwSessChanged.snapshot as Record<string, unknown>).pendingSecretRequests as Array<
        Record<string, unknown>
      >
    )[0];
    const roPendingInSnap = (
      (roSessChanged.snapshot as Record<string, unknown>).pendingSecretRequests as Array<
        Record<string, unknown>
      >
    )[0];
    expect(rwPendingInSnap.token).toBe(reqJson.token);
    expect(roPendingInSnap.token).toBe("");

    // Start long-poll BEFORE submitting secret
    const pollPromise = fetch(
      `${baseUrl}/internal/secrets/poll/${encodeURIComponent(reqJson.pollHandle)}?wait=true&timeout=5`,
    );

    // Submit secret via RW endpoint
    const submitRes = await fetch(`${baseUrl}/api/secrets/submit/${encodeURIComponent(reqJson.token)}`, {
      method: "POST",
      headers: { ...rwHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ secretValue: "smtp-pass-999" }),
    });
    expect(submitRes.status).toBe(200);
    const submitJson = await submitRes.json();
    expect(submitJson).toEqual({ status: "submitted", handle: "secret:smtp_password@v1" });

    const pollRes = await pollPromise;
    expect(pollRes.status).toBe(200);
    expect(await pollRes.json()).toEqual({
      status: "submitted",
      handle: "secret:smtp_password@v1",
    });

    const rwResolved = await wsRw.nextMessage();
    const roResolved = await wsRo.nextMessage();
    expect(rwResolved.type).toBe("secret_request_resolved");
    expect(roResolved.type).toBe("secret_request_resolved");

    // Expired secret request returns 410 on poll
    const expReqRes = await fetch(`${baseUrl}/internal/secrets/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: "short_lived", ttlMs: 20 }),
    });
    const expReq = await expReqRes.json();
    await wsRw.nextMessage();
    await wsRo.nextMessage();
    await new Promise((r) => setTimeout(r, 40));

    const expPoll = await fetch(
      `${baseUrl}/internal/secrets/poll/${encodeURIComponent(expReq.pollHandle)}`,
    );
    expect(expPoll.status).toBe(410);

    // RO WS command rejection
    wsRo.send({ type: "prompt", message: "intruso" });
    const roErr = await wsRo.nextMessage();
    expect(roErr.type).toBe("error");
    expect(roErr.code).toBe("FORBIDDEN_READ_ONLY");

    // RW WS commands: prompt, abort, switch_session, set_thinking_level, compact, extension_ui_response
    stub.pendingUiMap.set("ui-confirm-1", {
      id: "ui-confirm-1",
      method: "confirm",
      title: "Confirmar",
      createdAt: Date.now(),
    });
    wsRw.send({ type: "extension_ui_response", id: "ui-confirm-1", response: true });
    const uiCancelled = await wsRw.nextMessage();
    expect(uiCancelled).toEqual({ type: "ui_request_cancelled", id: "ui-confirm-1" });
    expect(stub.uiResponses[0]).toEqual({ id: "ui-confirm-1", response: { confirmed: true } });

    wsRw.send({ type: "prompt", message: "Hola PIMS" });
    wsRw.send({ type: "set_thinking_level", level: "high" });
    wsRw.send({ type: "compact" });
    wsRw.send({ type: "abort" });
    wsRw.send({ type: "switch_session", sessionPath: "/tmp/other.jsonl" });

    const rwSwitched = await wsRw.nextMessage();
    expect(rwSwitched.type).toBe("session_changed");
    expect(stub.prompts.some((p) => p.message === "Hola PIMS")).toBe(true);
    expect(stub.thinkingLevels).toEqual(["high"]);
    expect(stub.compacted).toBe(true);
    expect(stub.aborted).toBe(true);
    expect(stub.switchedPaths).toEqual(["/tmp/other.jsonl"]);

    wsRw.close();
    wsRo.close();
  });
});
