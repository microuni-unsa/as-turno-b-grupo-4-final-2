import { create } from "zustand";
import { DEFAULT_BRANDING, STORAGE_KEYS } from "@/lib/constants";
import type {
  AgentRunState,
  BrandingConfig,
  ChatMessageView,
  ExtensionUiRequestView,
  LiveSessionSnapshot,
  NoticeMessage,
  PendingSecretRequestPublic,
  PreviewTarget,
  PublishedFileSummary,
  QueueStateView,
  SecretMetadataItem,
  SessionStatsView,
  SessionSummary,
  SystemStatusResponse,
  ThemeMode,
  TodoPhaseView,
  SubagentView,
  UploadedFileRecord,
  UserRole,
} from "@/types/protocol";

export type WsConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface AuthState {
  checked: boolean;
  authenticated: boolean;
  role: UserRole | null;
  authEnabled: boolean;
}

function loadInitialShowTraces(): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.showTraces);
    if (raw === "false") return false;
    return true;
  } catch {
    return true;
  }
}

function loadInitialTheme(fallback: ThemeMode): ThemeMode {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.theme);
    if (raw === "light" || raw === "dark") return raw;
    return fallback;
  } catch {
    return fallback;
  }
}

interface AppState {
  branding: BrandingConfig;
  theme: ThemeMode;
  auth: AuthState;
  wsStatus: WsConnectionStatus;
  showTraces: boolean;

  sessions: SessionSummary[];
  activeSessionId: string | null;
  activeSessionFile: string | null;
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
  uploadedFiles: UploadedFileRecord[];
  secrets: SecretMetadataItem[];
  systemStatus: SystemStatusResponse | null;
  notices: NoticeMessage[];

  composerDraft: string;
  composerAttachments: UploadedFileRecord[];

  mobileSidebarOpen: boolean;
  filesDrawerOpen: boolean;
  secretsDrawerOpen: boolean;
  previewTarget: PreviewTarget | null;

  setBranding: (branding: BrandingConfig) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setAuth: (auth: AuthState) => void;
  setWsStatus: (wsStatus: WsConnectionStatus) => void;
  setShowTraces: (show: boolean) => void;

  setSessions: (
    sessions: SessionSummary[],
    activeSessionId: string | null,
    activeSessionFile: string | null,
  ) => void;
  applySnapshot: (snapshot: LiveSessionSnapshot) => void;
  upsertMessage: (message: ChatMessageView) => void;
  setRunState: (runState: AgentRunState) => void;
  setTodos: (todos: TodoPhaseView[]) => void;
  setSubagents: (subagents: SubagentView[]) => void;
  setQueue: (queue: QueueStateView) => void;
  setStats: (stats: SessionStatsView) => void;

  addPublishedFile: (file: PublishedFileSummary, messageId: string | null) => void;
  setFilesCatalog: (published: PublishedFileSummary[], uploads: UploadedFileRecord[]) => void;
  addUploadedFile: (file: UploadedFileRecord) => void;

  setSecretsCatalog: (secrets: SecretMetadataItem[], pending: PendingSecretRequestPublic[]) => void;
  addSecretRequest: (request: PendingSecretRequestPublic) => void;
  resolveSecretRequest: (tokenHash: string) => void;

  addUiRequest: (request: ExtensionUiRequestView) => void;
  cancelUiRequest: (id: string) => void;

  setSystemStatus: (status: SystemStatusResponse) => void;
  pushNotice: (level: "info" | "warn" | "error", text: string, timestamp?: number) => void;
  dismissNotice: (id: string) => void;

  setComposerDraft: (draft: string) => void;
  appendToComposerDraft: (snippet: string) => void;
  addComposerAttachment: (file: UploadedFileRecord) => void;
  removeComposerAttachment: (id: string) => void;
  clearComposerAttachments: () => void;

  setMobileSidebarOpen: (open: boolean) => void;
  setFilesDrawerOpen: (open: boolean) => void;
  setSecretsDrawerOpen: (open: boolean) => void;
  setPreviewTarget: (target: PreviewTarget | null) => void;
  resetSessionState: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  branding: DEFAULT_BRANDING,
  theme: loadInitialTheme(DEFAULT_BRANDING.defaultTheme),
  auth: {
    checked: false,
    authenticated: false,
    role: null,
    authEnabled: true,
  },
  wsStatus: "disconnected",
  showTraces: loadInitialShowTraces(),

  sessions: [],
  activeSessionId: null,
  activeSessionFile: null,
  sessionTitle: null,

  messages: [],
  runState: { status: "idle" },
  todos: [],
  subagents: [],
  queue: { steering: [], followUp: [] },
  stats: null,
  pendingUiRequests: [],
  pendingSecretRequests: [],
  publishedFiles: [],
  uploadedFiles: [],
  secrets: [],
  systemStatus: null,
  notices: [],

  composerDraft: "",
  composerAttachments: [],

  mobileSidebarOpen: false,
  filesDrawerOpen: false,
  secretsDrawerOpen: false,
  previewTarget: null,

  setBranding: (branding) =>
    set((state) => {
      let persistedTheme: string | null = null;
      try {
        persistedTheme = window.localStorage.getItem(STORAGE_KEYS.theme);
      } catch {
        persistedTheme = null;
      }
      const nextTheme =
        persistedTheme === "light" || persistedTheme === "dark"
          ? persistedTheme
          : branding.defaultTheme;
      return {
        branding,
        theme: nextTheme ?? state.theme,
      };
    }),

  setTheme: (theme) => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.theme, theme);
    } catch {
      // Storage unavailable in restricted private context; state still updates
    }
    set({ theme });
  },

  toggleTheme: () =>
    set((state) => {
      const next: ThemeMode = state.theme === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(STORAGE_KEYS.theme, next);
      } catch {
        // Storage unavailable in restricted private context; state still updates
      }
      return { theme: next };
    }),

  setAuth: (auth) => set({ auth }),
  setWsStatus: (wsStatus) => set({ wsStatus }),

  setShowTraces: (showTraces) => {
    try {
      window.localStorage.setItem(STORAGE_KEYS.showTraces, String(showTraces));
    } catch {
      // Storage unavailable; state still updates
    }
    set({ showTraces });
  },

  setSessions: (sessions, activeSessionId, activeSessionFile) =>
    set({ sessions, activeSessionId, activeSessionFile }),

  applySnapshot: (snapshot) =>
    set((state) => {
      const mergedPublished =
        snapshot.publishedFiles.length > 0 ? snapshot.publishedFiles : state.publishedFiles;
      return {
        activeSessionId: snapshot.sessionId,
        activeSessionFile: snapshot.sessionFile,
        sessionTitle: snapshot.sessionTitle,
        messages: snapshot.messages,
        runState: snapshot.runState,
        todos: snapshot.todos,
        subagents: snapshot.subagents,
        queue: snapshot.queue,
        stats: snapshot.stats,
        pendingUiRequests: snapshot.pendingUiRequests,
        pendingSecretRequests: snapshot.pendingSecretRequests,
        publishedFiles: mergedPublished,
      };
    }),

  upsertMessage: (message) =>
    set((state) => {
      const idx = state.messages.findIndex((m) => m.id === message.id);
      if (idx === -1) {
        return { messages: [...state.messages, message] };
      }
      const next = [...state.messages];
      next[idx] = message;
      return { messages: next };
    }),

  setRunState: (runState) => set({ runState }),
  setTodos: (todos) => set({ todos }),
  setSubagents: (subagents) => set({ subagents }),
  setQueue: (queue) => set({ queue }),
  setStats: (stats) => set({ stats }),

  addPublishedFile: (file, messageId) =>
    set((state) => {
      const existingIdx = state.publishedFiles.findIndex((f) => f.slug === file.slug);
      const nextPublished =
        existingIdx === -1
          ? [file, ...state.publishedFiles]
          : state.publishedFiles.map((f, idx) => (idx === existingIdx ? file : f));

      const nextMessages = messageId
        ? state.messages.map((msg) => {
            if (msg.id !== messageId) return msg;
            const current = msg.publishedFiles ?? [];
            const already = current.some((f) => f.slug === file.slug);
            return {
              ...msg,
              publishedFiles: already ? current : [...current, file],
            };
          })
        : state.messages;

      return {
        publishedFiles: nextPublished,
        messages: nextMessages,
      };
    }),

  setFilesCatalog: (published, uploads) =>
    set({ publishedFiles: published, uploadedFiles: uploads }),

  addUploadedFile: (file) =>
    set((state) => ({
      uploadedFiles: [file, ...state.uploadedFiles.filter((u) => u.id !== file.id)],
    })),

  setSecretsCatalog: (secrets, pending) =>
    set({ secrets, pendingSecretRequests: pending }),

  addSecretRequest: (request) =>
    set((state) => ({
      pendingSecretRequests: [
        request,
        ...state.pendingSecretRequests.filter((r) => r.tokenHash !== request.tokenHash),
      ],
    })),

  resolveSecretRequest: (tokenHash) =>
    set((state) => ({
      pendingSecretRequests: state.pendingSecretRequests.filter(
        (r) => r.tokenHash !== tokenHash,
      ),
    })),

  addUiRequest: (request) =>
    set((state) => ({
      pendingUiRequests: [
        ...state.pendingUiRequests.filter((r) => r.id !== request.id),
        request,
      ],
    })),

  cancelUiRequest: (id) =>
    set((state) => ({
      pendingUiRequests: state.pendingUiRequests.filter((r) => r.id !== id),
    })),

  setSystemStatus: (systemStatus) => set({ systemStatus }),

  pushNotice: (level, text, timestamp = Date.now()) =>
    set((state) => {
      const id = `${timestamp}-${Math.random().toString(36).slice(2, 8)}`;
      const next = [...state.notices, { id, level, text, timestamp }].slice(-6);
      return { notices: next };
    }),

  dismissNotice: (id) =>
    set((state) => ({
      notices: state.notices.filter((n) => n.id !== id),
    })),

  setComposerDraft: (composerDraft) => set({ composerDraft }),

  appendToComposerDraft: (snippet) =>
    set((state) => {
      const trimmed = state.composerDraft.trimEnd();
      return {
        composerDraft: trimmed.length > 0 ? `${trimmed} ${snippet}` : snippet,
      };
    }),

  addComposerAttachment: (file) =>
    set((state) => ({
      composerAttachments: [
        ...state.composerAttachments.filter((f) => f.id !== file.id),
        file,
      ],
    })),

  removeComposerAttachment: (id) =>
    set((state) => ({
      composerAttachments: state.composerAttachments.filter((f) => f.id !== id),
    })),

  clearComposerAttachments: () => set({ composerAttachments: [] }),

  setMobileSidebarOpen: (mobileSidebarOpen) => set({ mobileSidebarOpen }),
  setFilesDrawerOpen: (filesDrawerOpen) => set({ filesDrawerOpen }),
  setSecretsDrawerOpen: (secretsDrawerOpen) => set({ secretsDrawerOpen }),
  setPreviewTarget: (previewTarget) => set({ previewTarget }),

  resetSessionState: () =>
    set({
      messages: [],
      todos: [],
      subagents: [],
      queue: { steering: [], followUp: [] },
      pendingUiRequests: [],
      runState: { status: "idle" },
      notices: [],
    }),
}));
