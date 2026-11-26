import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { getBunServer, serveStatic, upgradeWebSocket, websocket } from "@hono/bun";
import { Hono, type Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { WSContext, WSMessageReceive } from "hono/ws";
import type {
  ClientWsMessage as FrontendClientWsMessage,
  ServerWsMessage as FrontendServerWsMessage,
} from "../client/src/types/protocol.ts";
import { SECRETS_POLL_MAX_TIMEOUT_SEC } from "../shared/constants.ts";
import type {
  AuthRole,
  ExtensionUiRequestView as SharedExtensionUiRequestView,
  ExtensionUiResponsePayload as SharedExtensionUiResponsePayload,
  LiveSessionSnapshot as SharedLiveSessionSnapshot,
  PendingSecretRequestPublic as SharedPendingSecretRequestPublic,
  PublishedFileSummary as SharedPublishedFileSummary,
  ServerWsMessage as SharedServerWsMessage,
  SessionSummary as SharedSessionSummary,
} from "../shared/protocol.ts";
import {
  authenticateRequest,
  buildLogoutCookie,
  buildSessionCookie,
  isLoopbackAddress,
  verifyToken,
} from "./auth.ts";
import { loadBrandingConfig, loadServerConfig, type ServerConfig } from "./config.ts";
import {
  FilesService,
  FilesServiceError,
  type PublishDeliverableInput,
} from "./files/service.ts";
import { OmpBridge, type SendPromptInput } from "./omp/bridge.ts";
import { MirrorResourceError, PimsStatusService } from "./pims/status.ts";
import {
  SecretsService,
  SecretsServiceError,
} from "./secrets/service.ts";
import {
  fromFrontendUiResponse,
  toFrontendBranding,
  toFrontendMirrorDoc,
  toFrontendMirrorExcerpt,
  toFrontendPendingSecret,
  toFrontendPublishedFile,
  toFrontendServerWsMessage,
  toFrontendSessionSummary,
  toFrontendSnapshot,
  toFrontendUploadedFile,
  toSharedPublishedFile,
  toSharedUploadedFile,
} from "./wire-adapter.ts";

export interface WebBridgeLike {
  start(): Promise<void>;
  stop(): Promise<void>;
  getSnapshot(
    role: AuthRole,
    pendingSecretRequests: SharedPendingSecretRequestPublic[],
  ): SharedLiveSessionSnapshot;
  getActiveSessionTitle(): string | null;
  getPendingUiRequest(id: string): SharedExtensionUiRequestView | undefined;
  sendPrompt(input: SendPromptInput): Promise<void>;
  abort(): Promise<void>;
  newSession(): Promise<void>;
  switchSession(sessionPath: string): Promise<void>;
  respondExtensionUi(id: string, response: SharedExtensionUiResponsePayload): void;
  setThinkingLevel(level: string): Promise<void>;
  compact(customInstructions?: string): Promise<void>;
  exportHtml(): Promise<{ html: string; filename: string }>;
  listSessions(): SharedSessionSummary[];
  attachPublishedFile(file: SharedPublishedFileSummary): string | null;
}

export interface CreateWebAppOptions {
  config?: ServerConfig;
  bridge?: WebBridgeLike | ((onBroadcast: (msg: SharedServerWsMessage) => void) => WebBridgeLike);
  filesService?: FilesService;
  secretsService?: SecretsService;
  pimsStatusService?: PimsStatusService;
  resolveRemoteIp?: (req: Request, env: unknown) => string | null;
  skipMemorySeed?: boolean;
}

type AppVariables = {
  authRole: AuthRole;
  wsRole: AuthRole;
};

interface ConnectedWsClient {
  ws: WSContext;
  role: AuthRole;
}

const DEFAULT_POLL_WAIT_TIMEOUT_SEC = 30;

/**
 * Mirrors `.omp/memory-seed/memory_summary.md` into `~/.omp/agent/memories/--app--/memory_summary.md`
 * only when absent or different (`cmp -s` semantics).
 */
export function seedMemorySummaryIfNeeded(
  projectRoot: string,
  homeDir: string = os.homedir(),
): boolean {
  const srcPath = path.join(projectRoot, ".omp", "memory-seed", "memory_summary.md");
  if (!existsSync(srcPath)) {
    return false;
  }

  const targetDir = path.join(homeDir, ".omp", "agent", "memories", "--app--");
  const dstPath = path.join(targetDir, "memory_summary.md");
  const srcBytes = readFileSync(srcPath);

  if (existsSync(dstPath)) {
    const dstBytes = readFileSync(dstPath);
    if (Buffer.compare(srcBytes, dstBytes) === 0) {
      return false;
    }
  }

  mkdirSync(targetDir, { recursive: true });
  writeFileSync(dstPath, srcBytes);
  return true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSecureRequest(req: Request, publicUrl: string): boolean {
  const forwardedProto = req.headers.get("x-forwarded-proto");
  if (forwardedProto !== null) {
    return forwardedProto.split(",")[0]?.trim().toLowerCase() === "https";
  }
  try {
    const url = new URL(req.url);
    if (url.protocol === "https:") {
      return true;
    }
    if (url.hostname === "127.0.0.1" || url.hostname === "localhost") {
      return false;
    }
  } catch {
    // Fall through to publicUrl check if request URL is non-standard.
  }
  return publicUrl.startsWith("https://");
}

function safeHeaderFilename(filename: string): string {
  return filename.replace(/[\r\n"\\]/g, "_");
}

class BadJsonBodyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadJsonBodyError";
  }
}

async function readJsonObject(c: Context): Promise<Record<string, unknown>> {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    throw new BadJsonBodyError("Cuerpo JSON inválido");
  }
  if (!isRecord(raw)) {
    throw new BadJsonBodyError("El cuerpo JSON debe ser un objeto");
  }
  return raw;
}

function sendWsJson(ws: WSContext, payload: FrontendServerWsMessage): boolean {
  try {
    ws.send(JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function createWebApp(options: CreateWebAppOptions = {}) {
  const config = options.config ?? loadServerConfig();

  if (!options.skipMemorySeed) {
    seedMemorySummaryIfNeeded(config.projectRoot);
  }

  const connectedClients = new Map<unknown, ConnectedWsClient>();

  const filesService =
    options.filesService ??
    new FilesService({
      uploadsDir: config.uploadsDir,
      publicBaseUrl: config.publicUrl,
    });

  const pimsStatusService =
    options.pimsStatusService ??
    new PimsStatusService({
      corpusMirrorDir: config.corpusMirrorDir,
      databaseUrl: config.databaseUrl,
      pimsBaseUrl: config.pimsBaseUrl,
      agentModel: config.agentModel,
      softRequestBudget: config.softRequestBudget,
    });

  let bridge!: WebBridgeLike;

  function buildFrontendSnapshot(role: AuthRole) {
    const rawSnapshot = bridge.getSnapshot(role, []);
    const publishedFiles = filesService.listPublished();
    const pendingSecrets = secretsService.listPendingForRole(role);
    const sessionTitle = bridge.getActiveSessionTitle();
    return toFrontendSnapshot(
      rawSnapshot,
      publishedFiles,
      pendingSecrets,
      sessionTitle,
    );
  }

  function broadcastBridgeEvent(msg: SharedServerWsMessage): void {
    if (connectedClients.size === 0) {
      return;
    }

    if (msg.type === "init_snapshot" || msg.type === "session_changed") {
      const eventType = msg.type;
      for (const [key, client] of connectedClients) {
        const snapshot = buildFrontendSnapshot(client.role);
        const ok = sendWsJson(client.ws, {
          type: eventType,
          snapshot,
        });
        if (!ok) {
          connectedClients.delete(key);
        }
      }
      return;
    }

    if (msg.type === "secret_request_created") {
      for (const [key, client] of connectedClients) {
        const ok = sendWsJson(client.ws, {
          type: "secret_request_created",
          request: toFrontendPendingSecret(msg.request, client.role),
        });
        if (!ok) {
          connectedClients.delete(key);
        }
      }
      return;
    }

    const thinkingLevel = bridge.getSnapshot("rw", []).stats.thinkingLevel;
    const translated = toFrontendServerWsMessage(msg, thinkingLevel);
    const serialized = JSON.stringify(translated);

    for (const [key, client] of connectedClients) {
      try {
        client.ws.send(serialized);
      } catch {
        connectedClients.delete(key);
      }
    }
  }

  const secretsService =
    options.secretsService ??
    new SecretsService({
      storeDir: config.secretsStoreDir,
      databaseUrl: config.databaseUrl,
      publicBaseUrl: config.publicUrl,
      onRequestCreated: (req) => {
        broadcastBridgeEvent({ type: "secret_request_created", request: req });
      },
      onRequestResolved: (evt) => {
        broadcastBridgeEvent({
          type: "secret_request_resolved",
          tokenHash: evt.tokenHash,
          label: evt.label,
          handle: evt.handle,
        });
      },
    });

  if (options.bridge === undefined) {
    bridge = new OmpBridge({
      projectRoot: config.projectRoot,
      port: config.port,
      sessionsDir: config.sessionsDir,
      softRequestBudget: config.softRequestBudget,
      agentModel: config.agentModel,
      agentEnvVar: config.agentEnvVar,
      agentApiKey: config.agentApiKey,
      onBroadcast: broadcastBridgeEvent,
    });
  } else if (typeof options.bridge === "function") {
    bridge = options.bridge(broadcastBridgeEvent);
  } else {
    bridge = options.bridge;
  }

  async function handleClientWsMessage(
    ws: WSContext,
    role: AuthRole,
    rawData: WSMessageReceive,
  ): Promise<void> {
    let rawText: string;
    if (typeof rawData === "string") {
      rawText = rawData;
    } else if (rawData instanceof Blob) {
      rawText = await rawData.text();
    } else if (ArrayBuffer.isView(rawData)) {
      rawText = Buffer.from(rawData.buffer, rawData.byteOffset, rawData.byteLength).toString("utf8");
    } else {
      rawText = Buffer.from(rawData).toString("utf8");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      sendWsJson(ws, {
        type: "error",
        code: "INVALID_JSON",
        message: "Mensaje WebSocket JSON inválido",
      });
      return;
    }

    if (!isRecord(parsed) || typeof parsed.type !== "string") {
      sendWsJson(ws, {
        type: "error",
        code: "INVALID_MESSAGE",
        message: "El mensaje WebSocket debe incluir un campo 'type'",
      });
      return;
    }

    if (role !== "rw") {
      sendWsJson(ws, {
        type: "error",
        code: "FORBIDDEN_READ_ONLY",
        message: "Modo observador (solo lectura): no tiene permisos para ejecutar acciones",
      });
      return;
    }

    const msg = parsed as FrontendClientWsMessage;
    try {
      switch (msg.type) {
        case "prompt": {
          const messageText = typeof msg.message === "string" ? msg.message : "";
          const attachments = Array.isArray(msg.attachments)
            ? msg.attachments.map(toSharedUploadedFile)
            : undefined;
          const images = Array.isArray(msg.images)
            ? msg.images.map((img) => ({
                mimeType: img.mimeType,
                data: img.data,
              }))
            : undefined;
          const streamingBehavior =
            msg.streamingBehavior === "steer" || msg.streamingBehavior === "followUp"
              ? msg.streamingBehavior
              : undefined;

          await bridge.sendPrompt({
            message: messageText,
            ...(attachments !== undefined ? { attachments } : {}),
            ...(images !== undefined ? { images } : {}),
            ...(streamingBehavior !== undefined ? { streamingBehavior } : {}),
          });
          return;
        }
        case "abort": {
          await bridge.abort();
          return;
        }
        case "new_session": {
          await bridge.newSession();
          return;
        }
        case "switch_session": {
          if (typeof msg.sessionPath !== "string" || msg.sessionPath.trim().length === 0) {
            throw new Error("sessionPath es obligatorio");
          }
          await bridge.switchSession(msg.sessionPath);
          return;
        }
        case "extension_ui_response": {
          if (typeof msg.id !== "string" || msg.id.trim().length === 0) {
            throw new Error("id de solicitud UI es obligatorio");
          }
          const pendingReq = bridge.getPendingUiRequest(msg.id);
          if (pendingReq === undefined) {
            throw new Error(`No hay solicitud UI pendiente con id '${msg.id}'`);
          }
          const translated = fromFrontendUiResponse(
            pendingReq.method,
            msg.response,
            pendingReq,
          );
          bridge.respondExtensionUi(msg.id, translated);
          return;
        }
        case "set_thinking_level": {
          if (typeof msg.level !== "string" || msg.level.trim().length === 0) {
            throw new Error("level es obligatorio");
          }
          await bridge.setThinkingLevel(msg.level);
          return;
        }
        case "compact": {
          await bridge.compact();
          return;
        }
        default: {
          const exhaustive: never = msg;
          sendWsJson(ws, {
            type: "error",
            code: "UNKNOWN_COMMAND",
            message: `Comando WebSocket no soportado: ${String((exhaustive as { type?: unknown }).type)}`,
          });
          return;
        }
      }
    } catch (err: unknown) {
      sendWsJson(ws, {
        type: "error",
        code: "COMMAND_FAILED",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const app = new Hono<{ Variables: AppVariables }>();

  app.onError((err, c) => {
    if (err instanceof BadJsonBodyError) {
      return c.json({ error: "INVALID_JSON", message: err.message }, 400);
    }
    if (err instanceof FilesServiceError) {
      return c.json(
        { error: err.code, message: err.message },
        err.statusCode as ContentfulStatusCode,
      );
    }
    if (err instanceof SecretsServiceError) {
      return c.json(
        { error: err.code, message: err.message },
        err.statusCode as ContentfulStatusCode,
      );
    }
    if (err instanceof MirrorResourceError) {
      return c.json(
        { error: err.code, message: err.message },
        err.statusCode as ContentfulStatusCode,
      );
    }
    const message = err instanceof Error ? err.message : String(err);
    return c.json({ error: "INTERNAL_ERROR", message }, 500);
  });

  // -------------------------------------------------------------------------
  // Public Health, Branding & Auth Routes
  // -------------------------------------------------------------------------
  const healthHandler = (c: Context) => {
    if (c.req.method === "HEAD") {
      return new Response(null, {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }
    return c.json({
      status: "ok",
      service: "pimsai-web",
      timestamp: new Date().toISOString(),
    });
  };
  app.on(["GET", "HEAD"], "/health", healthHandler);
  app.on(["GET", "HEAD"], "/healthz", healthHandler);

  app.get("/api/branding", (c) => {
    const branding = loadBrandingConfig(config);
    return c.json(toFrontendBranding(branding));
  });

  app.get("/api/auth/me", (c) => {
    const session = authenticateRequest(c.req.raw, config);
    return c.json({
      authenticated: session !== null,
      role: session?.role ?? null,
      authEnabled: !config.devNoAuth,
    });
  });

  app.post("/api/auth/login", async (c) => {
    const body = await readJsonObject(c);
    const token = typeof body.token === "string" ? body.token.trim() : "";

    let role: AuthRole | null;
    if (config.devNoAuth) {
      role =
        token.length > 0
          ? (verifyToken(token, config.rwToken, config.roToken) ?? "rw")
          : "rw";
    } else {
      role = verifyToken(token, config.rwToken, config.roToken);
    }

    if (role === null) {
      return c.json(
        { error: "UNAUTHORIZED", message: "Token de acceso inválido" },
        401,
      );
    }

    const secure = isSecureRequest(c.req.raw, config.publicUrl);
    c.header("Set-Cookie", buildSessionCookie(role, config.cookieSecret, secure));
    return c.json({ role });
  });

  app.post("/api/auth/logout", (c) => {
    const secure = isSecureRequest(c.req.raw, config.publicUrl);
    c.header("Set-Cookie", buildLogoutCookie(secure));
    return c.json({ ok: true });
  });

  // -------------------------------------------------------------------------
  // Loopback-Only Internal Routes
  // -------------------------------------------------------------------------
  app.use("/internal/*", async (c, next) => {
    let remoteIp: string | null = null;
    if (options.resolveRemoteIp !== undefined) {
      remoteIp = options.resolveRemoteIp(c.req.raw, c.env);
    } else {
      const bunServer = getBunServer<{
        requestIP?: (req: Request) => { address: string } | null;
      }>(c);
      if (bunServer !== undefined && typeof bunServer.requestIP === "function") {
        remoteIp = bunServer.requestIP(c.req.raw)?.address ?? null;
      }
    }

    if (!isLoopbackAddress(remoteIp)) {
      return c.json(
        {
          error: "FORBIDDEN_INTERNAL",
          message: "Internal endpoints are restricted to loopback callers",
        },
        403,
      );
    }
    return next();
  });

  app.post("/internal/publish", async (c) => {
    const body = await readJsonObject(c);
    const result = filesService.publishDeliverable(body as PublishDeliverableInput);
    const sharedFile = toSharedPublishedFile(result);
    const messageId = bridge.attachPublishedFile(sharedFile);
    broadcastBridgeEvent({
      type: "file_published",
      file: sharedFile,
      messageId,
    });
    return c.json(result, 201);
  });

  app.post("/internal/secrets/request", async (c) => {
    const body = await readJsonObject(c);
    const label = typeof body.label === "string" ? body.label : "";
    const scope = typeof body.scope === "string" ? body.scope : undefined;
    const createdBy = typeof body.createdBy === "string" ? body.createdBy : undefined;
    const ttlMs = typeof body.ttlMs === "number" ? body.ttlMs : undefined;

    const created = await secretsService.createRequest({
      label,
      ...(scope !== undefined ? { scope } : {}),
      ...(createdBy !== undefined ? { createdBy } : {}),
      ...(ttlMs !== undefined ? { ttlMs } : {}),
    });
    return c.json(created, 201);
  });

  app.get("/internal/secrets/poll/:handleOrToken", async (c) => {
    const handleOrToken = c.req.param("handleOrToken");
    const waitParam = c.req.query("wait");
    const shouldWait = waitParam === "true" || waitParam === "1";

    if (!shouldWait) {
      const status = secretsService.pollStatus(handleOrToken);
      return c.json(status);
    }

    const rawTimeout = c.req.query("timeout");
    let timeoutSec = DEFAULT_POLL_WAIT_TIMEOUT_SEC;
    if (rawTimeout !== undefined) {
      const parsed = Number(rawTimeout);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return c.json(
          { error: "VALIDATION_ERROR", message: "timeout must be a positive number" },
          400,
        );
      }
      timeoutSec = Math.min(parsed, SECRETS_POLL_MAX_TIMEOUT_SEC);
    }

    try {
      const status = await secretsService.waitForStatus(
        handleOrToken,
        timeoutSec * 1000,
        c.req.raw.signal,
      );
      return c.json(status);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return c.json({ error: "CLIENT_ABORTED", message: "Poll request aborted" }, 499 as ContentfulStatusCode);
      }
      throw err;
    }
  });

  // -------------------------------------------------------------------------
  // Authenticated /api/* Routes (RO + RW)
  // -------------------------------------------------------------------------
  app.use("/api/*", async (c, next) => {
    if (
      c.req.path === "/api/branding" ||
      c.req.path === "/api/auth/me" ||
      c.req.path === "/api/auth/login" ||
      c.req.path === "/api/auth/logout"
    ) {
      return next();
    }
    const session = authenticateRequest(c.req.raw, config);
    if (session === null) {
      return c.json(
        { error: "UNAUTHORIZED", message: "Autenticación requerida" },
        401,
      );
    }
    c.set("authRole", session.role);
    return next();
  });

  function requireRwRole(c: Context<{ Variables: AppVariables }>): Response | null {
    const role = c.get("authRole");
    if (role !== "rw") {
      return c.json(
        {
          error: "FORBIDDEN_READ_ONLY",
          message: "Modo observador (solo lectura): acción reservada para instructores RW",
        },
        403,
      );
    }
    return null;
  }

  app.get("/api/sessions", (c) => {
    const role = c.get("authRole");
    const snapshot = bridge.getSnapshot(role, []);
    const sessions = bridge.listSessions().map(toFrontendSessionSummary);
    return c.json({
      activeSessionId: snapshot.activeSessionId,
      activeSessionFile: snapshot.activeSessionFile,
      sessions,
    });
  });

  app.post("/api/sessions/export", async (c) => {
    const exported = await bridge.exportHtml();
    return c.json(exported);
  });

  app.get("/api/files", (c) => {
    const published = filesService.listPublished().map(toFrontendPublishedFile);
    const uploads = filesService.listUploads().map(toFrontendUploadedFile);
    return c.json({ published, uploads });
  });

  app.on(["GET", "HEAD"], "/api/files/:slug", (c) => {
    const slug = c.req.param("slug");
    const { meta, filePath, sizeBytes } = filesService.getPublishedFile(slug);
    const downloadParam = c.req.query("download");
    const isDownload = downloadParam === "1" || downloadParam === "true";

    const headers = new Headers({
      "Content-Type": meta.contentType,
      "Content-Length": String(sizeBytes),
      "Content-Disposition": `${isDownload ? "attachment" : "inline"}; filename="${safeHeaderFilename(meta.filename)}"`,
      "Cache-Control": "private, max-age=60",
      "X-Content-Type-Options": "nosniff",
    });

    if (!isDownload && meta.contentType.toLowerCase().includes("text/html")) {
      headers.set("Content-Security-Policy", "sandbox allow-scripts");
    }

    if (c.req.method === "HEAD") {
      return new Response(null, { status: 200, headers });
    }
    return new Response(Bun.file(filePath), { status: 200, headers });
  });

  app.on(["GET", "HEAD"], "/api/uploads/:id", (c) => {
    const id = c.req.param("id");
    const { record, filePath, sizeBytes } = filesService.getUploadedFile(id);
    const downloadParam = c.req.query("download");
    const isDownload = downloadParam === "1" || downloadParam === "true";

    const headers = new Headers({
      "Content-Type": record.mimeType,
      "Content-Length": String(sizeBytes),
      "Content-Disposition": `${isDownload ? "attachment" : "inline"}; filename="${safeHeaderFilename(record.fileName)}"`,
      "X-Content-Type-Options": "nosniff",
    });

    if (c.req.method === "HEAD") {
      return new Response(null, { status: 200, headers });
    }
    return new Response(Bun.file(filePath), { status: 200, headers });
  });

  app.post("/api/uploads", async (c) => {
    const forbidden = requireRwRole(c);
    if (forbidden !== null) {
      return forbidden;
    }

    let formData: FormData;
    try {
      formData = await c.req.formData();
    } catch {
      return c.json(
        { error: "INVALID_MULTIPART", message: "Solicitud multipart/form-data inválida" },
        400,
      );
    }

    const fileEntry = formData.get("file");
    if (
      fileEntry === null ||
      typeof fileEntry === "string" ||
      typeof fileEntry.arrayBuffer !== "function"
    ) {
      return c.json(
        { error: "MISSING_FILE", message: "Debe adjuntar un archivo en el campo 'file'" },
        400,
      );
    }

    const buffer = Buffer.from(await fileEntry.arrayBuffer());
    const saved = filesService.saveUpload({
      fileName: fileEntry.name,
      mimeType: fileEntry.type,
      buffer,
    });
    return c.json(toFrontendUploadedFile(saved), 201);
  });

  app.get("/api/secrets", async (c) => {
    const role = c.get("authRole");
    const { secrets } = await secretsService.listSecrets();
    const pending = secretsService
      .listPendingForRole(role)
      .map((req) => toFrontendPendingSecret(req, role));
    return c.json({ secrets, pending });
  });

  app.post("/api/secrets", async (c) => {
    const forbidden = requireRwRole(c);
    if (forbidden !== null) {
      return forbidden;
    }

    const body = await readJsonObject(c);
    const label = typeof body.label === "string" ? body.label : "";
    const secretValue = typeof body.secretValue === "string" ? body.secretValue : "";
    const scope = typeof body.scope === "string" ? body.scope : undefined;

    const created = await secretsService.storeSecretDirect({
      label,
      secretValue,
      ...(scope !== undefined ? { scope } : {}),
      createdBy: "instructor",
    });
    return c.json(created, 201);
  });

  app.post("/api/secrets/submit/:token", async (c) => {
    const forbidden = requireRwRole(c);
    if (forbidden !== null) {
      return forbidden;
    }

    const token = c.req.param("token");
    if (token.trim().length === 0) {
      return c.json(
        { error: "VALIDATION_ERROR", message: "Token de envío vacío" },
        400,
      );
    }

    const body = await readJsonObject(c);
    const secretValue = typeof body.secretValue === "string" ? body.secretValue : "";
    const handle = await secretsService.submitSecret(token, secretValue);
    return c.json({ status: "submitted", handle });
  });

  app.get("/api/status", async (c) => {
    const role = c.get("authRole");
    const forceRefresh = c.req.query("refresh") === "1";
    const status = await pimsStatusService.getStatus(forceRefresh);
    const snap = bridge.getSnapshot(role, []);
    return c.json({
      dbOk: status.dbOk,
      pimsReachable: status.pimsReachable,
      mirrorDocCount: status.mirrorDocCount,
      agentModel: status.agentModel,
      softRequestBudget: status.softRequestBudget,
      ompConnected: snap.runState.ompConnected,
      checkedAt: new Date(status.checkedAt).toISOString(),
    });
  });

  app.get("/api/mirror/docs", (c) => {
    const docs = pimsStatusService.listMirrorDocs().map(toFrontendMirrorDoc);
    return c.json({ docs });
  });

  app.get("/api/mirror/excerpt", (c) => {
    const doc = c.req.query("doc") ?? "";
    const ver = c.req.query("ver");
    const lines = c.req.query("lines") ?? "";
    if (doc.trim().length === 0 || lines.trim().length === 0) {
      return c.json(
        {
          error: "VALIDATION_ERROR",
          message: "Parámetros de consulta 'doc' y 'lines' son obligatorios",
        },
        400,
      );
    }
    const excerpt = pimsStatusService.getCitationExcerpt(doc, ver ?? null, lines);
    return c.json(toFrontendMirrorExcerpt(excerpt));
  });

  app.on(["GET", "HEAD"], "/api/mirror/download/:code", (c) => {
    const code = c.req.param("code");
    const ver = c.req.query("ver");
    const downloadParam = c.req.query("download");
    const isDownload = downloadParam === "1" || downloadParam === "true";

    const pdf = pimsStatusService.getMirrorPdfPath(code, ver ?? null);
    const sizeBytes = statSync(pdf.filePath).size;

    const headers = new Headers({
      "Content-Type": "application/pdf",
      "Content-Length": String(sizeBytes),
      "Content-Disposition": `${isDownload ? "attachment" : "inline"}; filename="${safeHeaderFilename(pdf.fileName)}"`,
      "X-Content-Type-Options": "nosniff",
    });

    if (c.req.method === "HEAD") {
      return new Response(null, { status: 200, headers });
    }
    return new Response(Bun.file(pdf.filePath), { status: 200, headers });
  });

  // -------------------------------------------------------------------------
  // Authenticated WebSocket Route
  // -------------------------------------------------------------------------
  const wsUpgradeHandler = upgradeWebSocket((c) => {
    const role = c.get("wsRole");
    return {
      onOpen(_evt, ws) {
        const key = ws.raw ?? ws;
        connectedClients.set(key, { ws, role });
        const snapshot = buildFrontendSnapshot(role);
        sendWsJson(ws, { type: "init_snapshot", snapshot });
      },
      onMessage(evt, ws) {
        void handleClientWsMessage(ws, role, evt.data);
      },
      onClose(_evt, ws) {
        const key = ws.raw ?? ws;
        connectedClients.delete(key);
      },
    };
  });

  app.get("/ws", async (c, next) => {
    const session = authenticateRequest(c.req.raw, config);
    if (session === null) {
      return c.json(
        { error: "UNAUTHORIZED", message: "Autenticación WebSocket requerida" },
        401,
      );
    }
    c.set("wsRole", session.role);
    return wsUpgradeHandler(c, next);
  });

  // -------------------------------------------------------------------------
  // Static SPA Assets + Fallback
  // -------------------------------------------------------------------------
  const staticHandler = serveStatic({ root: config.webDistDir });

  app.use("*", async (c, next) => {
    if (
      c.req.path.startsWith("/api/") ||
      c.req.path === "/api" ||
      c.req.path.startsWith("/internal/") ||
      c.req.path === "/internal" ||
      c.req.path === "/ws"
    ) {
      return next();
    }
    if (!existsSync(config.webDistDir)) {
      return next();
    }
    return staticHandler(c, next);
  });

  app.get("*", (c) => {
    if (
      c.req.path.startsWith("/api/") ||
      c.req.path === "/api" ||
      c.req.path.startsWith("/internal/") ||
      c.req.path === "/internal" ||
      c.req.path === "/ws"
    ) {
      return c.json(
        { error: "NOT_FOUND", message: `Route not found: ${c.req.path}` },
        404,
      );
    }
    const indexPath = path.join(config.webDistDir, "index.html");
    if (!existsSync(indexPath)) {
      return c.text("Web client build not found", 404);
    }
    return new Response(Bun.file(indexPath), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  });

  app.notFound((c) => {
    return c.json(
      { error: "NOT_FOUND", message: `Route not found: ${c.req.path}` },
      404,
    );
  });

  async function start(): Promise<void> {
    await secretsService.initialize();
    await bridge.start();
  }

  async function stop(): Promise<void> {
    for (const [key, client] of connectedClients) {
      try {
        client.ws.close(1001, "Server shutting down");
      } catch {
        // Socket already closed.
      }
      connectedClients.delete(key);
    }
    await bridge.stop();
    await secretsService.close();
  }

  return {
    app,
    websocket,
    config,
    bridge,
    filesService,
    secretsService,
    pimsStatusService,
    broadcastBridgeEvent,
    start,
    stop,
  };
}

if (import.meta.main) {
  const config = loadServerConfig();
  const webApp = createWebApp({ config });

  await webApp.secretsService.initialize();

  const server = Bun.serve({
    port: config.port,
    hostname: "0.0.0.0",
    idleTimeout: 0,
    fetch: webApp.app.fetch,
    websocket: webApp.websocket,
  });

  console.log(
    `[pimsai-web] Listening on http://0.0.0.0:${server.port} (public: ${config.publicUrl})`,
  );

  void webApp.bridge.start().catch((err: unknown) => {
    console.error(
      `[pimsai-web] Failed to start omp bridge on boot: ${err instanceof Error ? err.message : String(err)}`,
    );
  });

  const shutdown = async () => {
    server.stop(true);
    await webApp.stop();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());
}
