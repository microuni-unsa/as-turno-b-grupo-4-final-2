import { useCallback, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api";
import {
  STATUS_POLL_INTERVAL_MS,
  WS_PATH,
  WS_RECONNECT_BASE_MS,
  WS_RECONNECT_MAX_MS,
} from "@/lib/constants";
import { useAppStore } from "@/store/useAppStore";
import type {
  ClientWsMessage,
  PromptImagePayload,
  ServerWsMessage,
  UploadedFileRecord,
} from "@/types/protocol";

function assertNever(value: never): never {
  throw new Error(`Unhandled WebSocket message: ${JSON.stringify(value)}`);
}

export interface AgentClientActions {
  sendPrompt: (
    message: string,
    options?: {
      attachments?: UploadedFileRecord[];
      images?: PromptImagePayload[];
      streamingBehavior?: "steer" | "followUp";
    },
  ) => boolean;
  abortRun: () => boolean;
  newSession: () => boolean;
  switchSession: (sessionPath: string) => boolean;
  sendUiResponse: (id: string, response: unknown) => boolean;
  setThinkingLevel: (level: string) => boolean;
  compactSession: () => boolean;
  refreshCatalogs: () => Promise<void>;
}

export function useAgentWebSocket(): AgentClientActions {
  const authenticated = useAppStore((s) => s.auth.authenticated);
  const authChecked = useAppStore((s) => s.auth.checked);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);

  const refreshCatalogs = useCallback(async () => {
    const store = useAppStore.getState();
    const [sessionsRes, filesRes, secretsRes, statusRes] = await Promise.allSettled([
      apiClient.getSessions(),
      apiClient.getFiles(),
      apiClient.getSecrets(),
      apiClient.getStatus(),
    ]);

    if (sessionsRes.status === "fulfilled") {
      store.setSessions(
        sessionsRes.value.sessions,
        sessionsRes.value.activeSessionId,
        sessionsRes.value.activeSessionFile,
      );
    }
    if (filesRes.status === "fulfilled") {
      store.setFilesCatalog(filesRes.value.published, filesRes.value.uploads);
    }
    if (secretsRes.status === "fulfilled") {
      store.setSecretsCatalog(secretsRes.value.secrets, secretsRes.value.pending);
    }
    if (statusRes.status === "fulfilled") {
      store.setSystemStatus(statusRes.value);
    }
  }, []);

  const handleServerMessage = useCallback(
    (msg: ServerWsMessage) => {
      const store = useAppStore.getState();
      switch (msg.type) {
        case "init_snapshot":
          store.applySnapshot(msg.snapshot);
          void refreshCatalogs();
          break;
        case "message_upsert":
          store.upsertMessage(msg.message);
          break;
        case "agent_state":
          store.setRunState(msg.runState);
          break;
        case "todos_updated":
          store.setTodos(msg.todos);
          break;
        case "subagents_updated":
          store.setSubagents(msg.subagents);
          break;
        case "queue_updated":
          store.setQueue(msg.queue);
          break;
        case "stats_updated":
          store.setStats(msg.stats);
          break;
        case "session_changed":
          store.applySnapshot(msg.snapshot);
          void refreshCatalogs();
          break;
        case "file_published":
          store.addPublishedFile(msg.file, msg.messageId);
          break;
        case "secret_request_created":
          store.addSecretRequest(msg.request);
          break;
        case "secret_request_resolved":
          store.resolveSecretRequest(msg.tokenHash);
          store.pushNotice(
            "info",
            `Secreto "${msg.label}" cifrado con age (${msg.handle}).`,
          );
          void apiClient
            .getSecrets()
            .then((res) => store.setSecretsCatalog(res.secrets, res.pending))
            .catch(() => {
              // Next poll or drawer open will refresh secrets
            });
          break;
        case "ui_request":
          store.addUiRequest(msg.request);
          break;
        case "ui_request_cancelled":
          store.cancelUiRequest(msg.id);
          break;
        case "notice":
          store.pushNotice(msg.level, msg.text, msg.timestamp);
          break;
        case "error":
          store.pushNotice("error", `${msg.code}: ${msg.message}`);
          break;
        default:
          assertNever(msg);
      }
    },
    [refreshCatalogs],
  );

  useEffect(() => {
    if (!authChecked || !authenticated) {
      useAppStore.getState().setWsStatus("disconnected");
      return;
    }

    let disposed = false;

    const connect = () => {
      if (disposed) return;
      useAppStore.getState().setWsStatus("connecting");

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}${WS_PATH}`;
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        if (disposed) {
          socket.close();
          return;
        }
        reconnectAttemptRef.current = 0;
        useAppStore.getState().setWsStatus("connected");
      };

      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(String(event.data)) as ServerWsMessage;
          handleServerMessage(parsed);
        } catch (error) {
          useAppStore
            .getState()
            .pushNotice(
              "error",
              `Mensaje WebSocket inválido: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
      };

      socket.onerror = () => {
        if (!disposed) {
          useAppStore.getState().setWsStatus("error");
        }
      };

      socket.onclose = () => {
        if (wsRef.current === socket) {
          wsRef.current = null;
        }
        if (disposed) return;
        useAppStore.getState().setWsStatus("disconnected");
        const attempt = reconnectAttemptRef.current;
        reconnectAttemptRef.current += 1;
        const delay = Math.min(
          WS_RECONNECT_MAX_MS,
          WS_RECONNECT_BASE_MS * Math.pow(2, attempt),
        );
        reconnectTimerRef.current = window.setTimeout(connect, delay);
      };
    };

    connect();
    void refreshCatalogs();

    const statusTimer = window.setInterval(() => {
      apiClient
        .getStatus()
        .then((status) => useAppStore.getState().setSystemStatus(status))
        .catch(() => {
          // Keep last known system status until next poll
        });
    }, STATUS_POLL_INTERVAL_MS);

    return () => {
      disposed = true;
      window.clearInterval(statusTimer);
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [authChecked, authenticated, handleServerMessage, refreshCatalogs]);

  const sendRaw = useCallback((payload: ClientWsMessage): boolean => {
    const socket = wsRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      useAppStore
        .getState()
        .pushNotice("warn", "Conexión en vivo no disponible. Reintentando reconexión...");
      return false;
    }
    socket.send(JSON.stringify(payload));
    return true;
  }, []);

  const sendPrompt = useCallback(
    (
      message: string,
      options?: {
        attachments?: UploadedFileRecord[];
        images?: PromptImagePayload[];
        streamingBehavior?: "steer" | "followUp";
      },
    ) =>
      sendRaw({
        type: "prompt",
        message,
        attachments: options?.attachments,
        images: options?.images,
        streamingBehavior: options?.streamingBehavior,
      }),
    [sendRaw],
  );

  const abortRun = useCallback(() => sendRaw({ type: "abort" }), [sendRaw]);
  const newSession = useCallback(() => sendRaw({ type: "new_session" }), [sendRaw]);
  const switchSession = useCallback(
    (sessionPath: string) => sendRaw({ type: "switch_session", sessionPath }),
    [sendRaw],
  );
  const sendUiResponse = useCallback(
    (id: string, response: unknown) =>
      sendRaw({ type: "extension_ui_response", id, response }),
    [sendRaw],
  );
  const setThinkingLevel = useCallback(
    (level: string) => sendRaw({ type: "set_thinking_level", level }),
    [sendRaw],
  );
  const compactSession = useCallback(() => sendRaw({ type: "compact" }), [sendRaw]);

  return {
    sendPrompt,
    abortRun,
    newSession,
    switchSession,
    sendUiResponse,
    setThinkingLevel,
    compactSession,
    refreshCatalogs,
  };
}
