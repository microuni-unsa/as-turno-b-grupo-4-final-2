import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import {
  AlertCircleIcon,
  ArrowUpRightIcon,
  BookMarkedIcon,
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  FileIcon,
  FileTextIcon,
  GlobeIcon,
  PaperclipIcon,
  SendIcon,
  ShieldCheckIcon,
  SparklesIcon,
  SquareIcon,
  XIcon,
} from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { AgentTraceView, LiveWorkProgress } from "@/components/AgentTraceView";
import { ExtensionUiCard } from "@/components/ExtensionUiCard";
import { SecretPromptCard } from "@/components/SecretPromptCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { apiClient, ApiRequestError } from "@/lib/api";
import { API_ENDPOINTS, COPY_FEEDBACK_MS } from "@/lib/constants";
import {
  extractDeliverableSlugs,
  extractExternalServiceLinks,
  extractPimsCitations,
} from "@/lib/citations";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import type {
  ChatMessageView,
  PromptImagePayload,
  PublishedFileSummary,
  ThinkingMessagePart,
  ToolCallMessagePart,
  UploadedFileRecord,
} from "@/types/protocol";

interface ChatThreadProps {
  onSendPrompt: (
    message: string,
    options?: {
      attachments?: UploadedFileRecord[];
      images?: PromptImagePayload[];
      streamingBehavior?: "steer" | "followUp";
    },
  ) => boolean;
  onAbort: () => boolean;
  onUiResponse: (id: string, response: unknown) => boolean;
}

function DeliverableCard({
  file,
  onPreview,
}: {
  file: PublishedFileSummary;
  onPreview: (file: PublishedFileSummary) => void;
}) {
  const ext = (file.extension || file.fileName.split(".").pop() || "archivo").replace(
    /^\./,
    "",
  );
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/25 bg-card/85 p-3 shadow-xs">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
          <FileTextIcon className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold text-xs">{file.fileName}</span>
            <Badge className="text-[10px] uppercase" variant="secondary">
              {ext}
            </Badge>
          </div>
          <div className="text-[11px] text-muted-foreground">
            {file.sizeBytes > 0 ? formatBytes(file.sizeBytes) : "Entregable publicado"}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Button
          onClick={() => onPreview(file)}
          size="sm"
          type="button"
          variant="outline"
        >
          <EyeIcon className="mr-1 size-3.5" />
          Vista previa
        </Button>
        <Button asChild size="sm" variant="default">
          <a download={file.fileName} href={file.downloadUrl}>
            <DownloadIcon className="mr-1 size-3.5" />
            Descargar
          </a>
        </Button>
      </div>
    </div>
  );
}

function AssistantMessageCard({
  msg,
  isLastAssistant,
}: {
  msg: ChatMessageView;
  isLastAssistant: boolean;
}) {
  const showTraces = useAppStore((s) => s.showTraces);
  const todos = useAppStore((s) => s.todos);
  const subagents = useAppStore((s) => s.subagents);
  const runState = useAppStore((s) => s.runState);
  const publishedCatalog = useAppStore((s) => s.publishedFiles);
  const setPreviewTarget = useAppStore((s) => s.setPreviewTarget);

  const [copied, setCopied] = useState(false);

  const traceParts = useMemo(
    () =>
      msg.parts.filter(
        (p): p is ThinkingMessagePart | ToolCallMessagePart =>
          p.type === "thinking" || p.type === "tool_call",
      ),
    [msg.parts],
  );

  const textParts = useMemo(() => {
    const joined = msg.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("\n\n")
      .trim();
    return joined || msg.text;
  }, [msg.parts, msg.text]);

  const citations = useMemo(() => extractPimsCitations(textParts), [textParts]);
  const externalServices = useMemo(
    () => extractExternalServiceLinks(textParts),
    [textParts],
  );

  const resolvedDeliverables = useMemo(() => {
    const bySlug = new Map<string, PublishedFileSummary>();
    for (const file of msg.publishedFiles ?? []) {
      bySlug.set(file.slug, file);
    }
    for (const slug of extractDeliverableSlugs(textParts)) {
      if (!bySlug.has(slug)) {
        const fromCatalog = publishedCatalog.find((f) => f.slug === slug);
        if (fromCatalog) {
          bySlug.set(slug, fromCatalog);
        } else {
          bySlug.set(slug, {
            slug,
            fileName: slug,
            mimeType: slug.endsWith(".pdf")
              ? "application/pdf"
              : slug.endsWith(".html")
                ? "text/html"
                : "application/octet-stream",
            sizeBytes: 0,
            publishedAt: msg.createdAt,
            url: API_ENDPOINTS.fileBySlug(slug, false),
            downloadUrl: API_ENDPOINTS.fileBySlug(slug, true),
          });
        }
      }
    }
    return Array.from(bySlug.values());
  }, [msg.publishedFiles, msg.createdAt, publishedCatalog, textParts]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textParts);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <Message className="max-w-full" from="assistant">
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <div className="flex size-6 items-center justify-center rounded-md bg-primary/15 text-primary">
          <ShieldCheckIcon className="size-3.5" />
        </div>
        <span className="font-semibold text-foreground">Operador PIMS</span>
        {msg.model && (
          <Badge className="font-mono text-[10px]" variant="outline">
            {msg.model}
          </Badge>
        )}
        {msg.isStreaming && (
          <Shimmer className="text-[11px]" duration={1.1}>
            En ejecución…
          </Shimmer>
        )}
      </div>

      <MessageContent className="w-full max-w-full pl-8">
        <AgentTraceView
          isMessageStreaming={Boolean(msg.isStreaming)}
          runState={isLastAssistant ? runState : undefined}
          showTraces={showTraces}
          subagents={isLastAssistant ? subagents : undefined}
          thinkingAndToolParts={traceParts}
          todos={isLastAssistant ? todos : undefined}
        />

        {textParts.length > 0 && (
          <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
            <MessageResponse isAnimating={Boolean(msg.isStreaming)}>
              {textParts}
            </MessageResponse>
          </div>
        )}

        {citations.length > 0 && (
          <div className="mt-2 space-y-1.5 rounded-lg border border-border/70 bg-muted/30 p-2.5">
            <div className="flex items-center gap-1.5 font-medium text-[11px] text-muted-foreground">
              <BookMarkedIcon className="size-3.5 text-primary" />
              Citas verificables del espejo PIMS (clic para inspeccionar):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {citations.map((c) => (
                <button
                  className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/8 px-2.5 py-0.5 font-mono text-[11px] text-foreground transition-colors hover:bg-primary/18"
                  key={c.raw}
                  onClick={() =>
                    setPreviewTarget({
                      kind: "citation",
                      raw: c.raw,
                      doc: c.doc,
                      version: c.version,
                      chunkId: c.chunkId,
                      lines: c.lines,
                    })
                  }
                  type="button"
                >
                  <span>{c.doc}</span>
                  <span className="text-muted-foreground">v{c.version}</span>
                  <span className="text-primary">{c.lines}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {resolvedDeliverables.length > 0 && (
          <div className="mt-2 space-y-2">
            {resolvedDeliverables.map((file) => (
              <DeliverableCard
                file={file}
                key={file.slug}
                onPreview={(target) =>
                  setPreviewTarget({
                    kind: "file",
                    title: target.fileName,
                    fileName: target.fileName,
                    mimeType: target.mimeType,
                    url: target.url,
                    downloadUrl: target.downloadUrl,
                    sizeBytes: target.sizeBytes,
                  })
                }
              />
            ))}
          </div>
        )}

        {externalServices.length > 0 && (
          <div className="mt-2 space-y-2">
            {externalServices.map((svc) => (
              <a
                className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/35 bg-emerald-500/8 p-3 transition-colors hover:bg-emerald-500/14"
                href={svc.url}
                key={svc.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500">
                    <GlobeIcon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-xs">
                      Servicio desplegado: {svc.slug}
                    </div>
                    <div className="truncate font-mono text-[11px] text-muted-foreground">
                      {svc.url}
                    </div>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 font-medium text-xs text-emerald-600 dark:text-emerald-400">
                  Abrir servicio en vivo
                  <ArrowUpRightIcon className="size-3.5" />
                </span>
              </a>
            ))}
          </div>
        )}
      </MessageContent>

      {!msg.isStreaming && textParts.length > 0 && (
        <MessageActions className="pl-8 opacity-0 transition-opacity group-hover:opacity-100">
          <MessageAction
            label="Copiar respuesta"
            onClick={() => void handleCopy()}
            tooltip={copied ? "Copiado" : "Copiar respuesta"}
          >
            {copied ? (
              <CheckIcon className="size-3.5 text-emerald-500" />
            ) : (
              <CopyIcon className="size-3.5" />
            )}
          </MessageAction>
        </MessageActions>
      )}
    </Message>
  );
}

export function ChatThread({
  onSendPrompt,
  onAbort,
  onUiResponse,
}: ChatThreadProps) {
  const branding = useAppStore((s) => s.branding);
  const role = useAppStore((s) => s.auth.role);
  const messages = useAppStore((s) => s.messages);
  const runState = useAppStore((s) => s.runState);
  const todos = useAppStore((s) => s.todos);
  const subagents = useAppStore((s) => s.subagents);
  const queue = useAppStore((s) => s.queue);
  const pendingUiRequests = useAppStore((s) => s.pendingUiRequests);
  const pendingSecretRequests = useAppStore((s) => s.pendingSecretRequests);
  const notices = useAppStore((s) => s.notices);
  const dismissNotice = useAppStore((s) => s.dismissNotice);
  const composerDraft = useAppStore((s) => s.composerDraft);
  const setComposerDraft = useAppStore((s) => s.setComposerDraft);
  const composerAttachments = useAppStore((s) => s.composerAttachments);
  const addComposerAttachment = useAppStore((s) => s.addComposerAttachment);
  const removeComposerAttachment = useAppStore((s) => s.removeComposerAttachment);
  const clearComposerAttachments = useAppStore((s) => s.clearComposerAttachments);
  const addUploadedFile = useAppStore((s) => s.addUploadedFile);
  const pushNotice = useAppStore((s) => s.pushNotice);

  const [uploading, setUploading] = useState(false);
  const [draggingOver, setDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isReadOnly = role === "ro";
  const isAgentRunning =
    runState.status === "running" || runState.status === "streaming";

  const lastAssistantId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const candidate = messages[i];
      if (candidate?.role === "assistant") return candidate.id;
    }
    return null;
  }, [messages]);

  const hasAssistantStreamingMsg = useMemo(
    () => messages.some((m) => m.role === "assistant" && m.isStreaming),
    [messages],
  );

  const uploadFiles = async (files: FileList | File[]) => {
    if (isReadOnly) return;
    const list = Array.from(files);
    if (list.length === 0) return;

    setUploading(true);
    try {
      for (const file of list) {
        const record = await apiClient.uploadFile(file);
        addUploadedFile(record);
        addComposerAttachment(record);
      }
    } catch (err) {
      pushNotice(
        "error",
        err instanceof ApiRequestError
          ? `Error al subir archivo: ${err.message}`
          : "No se pudo subir el archivo adjunto.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await uploadFiles(e.target.files);
    }
    e.target.value = "";
  };

  const handleGlobalDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDraggingOver(false);
    if (isReadOnly) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(e.dataTransfer.files);
    }
  };

  const handleSubmitPrompt = () => {
    if (isReadOnly) return;
    const trimmed = composerDraft.trim();
    if (!trimmed && composerAttachments.length === 0) return;

    const ok = onSendPrompt(trimmed || "Analiza los archivos adjuntos.", {
      attachments:
        composerAttachments.length > 0 ? [...composerAttachments] : undefined,
      streamingBehavior: isAgentRunning ? "steer" : undefined,
    });

    if (ok) {
      setComposerDraft("");
      clearComposerAttachments();
    }
  };

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDraggingOver(false);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!isReadOnly) setDraggingOver(true);
      }}
      onDrop={(e) => void handleGlobalDrop(e)}
    >
      {draggingOver && !isReadOnly && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-xs">
          <div className="rounded-2xl border-2 border-dashed border-primary bg-card px-8 py-6 text-center shadow-lg">
            <PaperclipIcon className="mx-auto mb-2 size-7 text-primary" />
            <p className="font-semibold text-sm">
              Suelte el archivo para adjuntarlo a la consulta PIMS
            </p>
          </div>
        </div>
      )}

      {/* Transient notices bar */}
      {notices.length > 0 && (
        <div className="space-y-1 border-b bg-muted/30 px-4 py-2">
          {notices.map((notice) => (
            <div
              className={cn(
                "mx-auto flex max-w-4xl items-center justify-between gap-2 rounded-md border px-3 py-1.5 text-xs",
                notice.level === "error"
                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                  : notice.level === "warn"
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300"
                    : "border-primary/30 bg-primary/10 text-foreground",
              )}
              key={notice.id}
            >
              <div className="flex items-center gap-2">
                <AlertCircleIcon className="size-3.5 shrink-0" />
                <span>{notice.text}</span>
              </div>
              <button
                aria-label="Cerrar aviso"
                className="opacity-70 hover:opacity-100"
                onClick={() => dismissNotice(notice.id)}
                type="button"
              >
                <XIcon className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="mx-auto w-full max-w-4xl gap-5 px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
                <ShieldCheckIcon className="size-7" />
              </div>
              <Badge
                className="mb-2 border-brand-accent/45 bg-brand-accent/15 text-foreground"
                variant="outline"
              >
                {branding.shortBadge}
              </Badge>
              <h2 className="font-semibold text-2xl tracking-tight">
                {branding.appName}
              </h2>
              <p className="mt-1 max-w-xl text-muted-foreground text-sm">
                {branding.subtitle}. Consulte evidencias con citas verificables, audite cumplimiento ISO/IEC 27701:2025 o gestione versiones G4- con aprobación humana explícita.
              </p>

              <div className="mt-7 grid w-full grid-cols-1 gap-3 text-left sm:grid-cols-2">
                {branding.starterPrompts.map((card) => (
                  <button
                    className={cn(
                      "group flex flex-col justify-between gap-2 rounded-xl border bg-card p-4 text-left transition-all hover:border-primary/60 hover:bg-accent/35 hover:shadow-sm",
                      isReadOnly && "cursor-not-allowed opacity-65",
                    )}
                    disabled={isReadOnly}
                    key={card.id}
                    onClick={() => onSendPrompt(card.prompt)}
                    type="button"
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="font-semibold text-sm group-hover:text-primary">
                        {card.title}
                      </span>
                      <Badge
                        className="shrink-0 font-mono text-[10px]"
                        variant="secondary"
                      >
                        {card.badge}
                      </Badge>
                    </div>
                    {card.description && (
                      <p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">
                        {card.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              if (msg.role === "user") {
                return (
                  <Message from="user" key={msg.id}>
                    <MessageContent>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {msg.text}
                      </div>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {msg.attachments.map((att) => (
                            <Badge
                              className="gap-1 text-[11px]"
                              key={att.id}
                              variant="outline"
                            >
                              <FileIcon className="size-3" />
                              <span>{att.fileName}</span>
                              <span className="text-muted-foreground">
                                ({formatBytes(att.sizeBytes)})
                              </span>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </MessageContent>
                  </Message>
                );
              }

              return (
                <AssistantMessageCard
                  isLastAssistant={msg.id === lastAssistantId}
                  key={msg.id}
                  msg={msg}
                />
              );
            })
          )}

          {/* Live progress indicator if agent is running before assistant message exists */}
          {isAgentRunning && !hasAssistantStreamingMsg && (
            <div className="space-y-2 rounded-xl border border-border/70 bg-card/60 p-3">
              <div className="flex items-center gap-2 text-xs">
                <Spinner className="size-3.5 text-primary" />
                <Shimmer duration={1.1}>
                  {runState.activeToolName
                    ? `Ejecutando ${runState.activeToolName}…`
                    : "Procesando solicitud PIMS…"}
                </Shimmer>
              </div>
              <LiveWorkProgress subagents={subagents} todos={todos} />
            </div>
          )}

          {/* Queued steering / follow-up messages */}
          {(queue.steering.length > 0 || queue.followUp.length > 0) && (
            <div className="rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">En cola:</span>{" "}
              {[...queue.steering, ...queue.followUp].join(" · ")}
            </div>
          )}

          {/* Inline Encrypted Secret Requests */}
          {pendingSecretRequests.map((req) => (
            <SecretPromptCard key={req.tokenHash} request={req} />
          ))}

          {/* Interactive Extension UI Requests */}
          {pendingUiRequests.map((req) => (
            <ExtensionUiCard
              key={req.id}
              onRespond={onUiResponse}
              request={req}
            />
          ))}
        </ConversationContent>

        <ConversationScrollButton />
      </Conversation>

      {/* Bottom Composer / Observer Banner */}
      <div className="shrink-0 border-t bg-background/95 px-3 py-3 backdrop-blur-md md:px-4">
        <div className="mx-auto max-w-4xl space-y-2">
          {isReadOnly ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-500/35 bg-amber-500/8 px-4 py-3 text-xs text-muted-foreground">
              <SparklesIcon className="size-4 text-amber-500" />
              <span>
                Sesión de observador (solo lectura): visualizando la actividad del operador PIMS en tiempo real.
              </span>
            </div>
          ) : (
            <>
              <input
                className="hidden"
                multiple
                onChange={(e) => void handleFileInputChange(e)}
                ref={fileInputRef}
                type="file"
              />

              {composerAttachments.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {composerAttachments.map((att) => (
                    <Badge
                      className="gap-1.5 py-1 pr-1.5 pl-2.5 text-xs"
                      key={att.id}
                      variant="secondary"
                    >
                      <FileIcon className="size-3 text-primary" />
                      <span className="max-w-48 truncate">{att.fileName}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatBytes(att.sizeBytes)}
                      </span>
                      <button
                        aria-label={`Quitar ${att.fileName}`}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
                        onClick={() => removeComposerAttachment(att.id)}
                        type="button"
                      >
                        <XIcon className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <PromptInput
                onSubmit={() => {
                  handleSubmitPrompt();
                }}
              >
                <PromptInputBody>
                  <PromptInputTextarea
                    onChange={(e) => setComposerDraft(e.target.value)}
                    placeholder={
                      isAgentRunning
                        ? "Escriba una instrucción adicional (steering) o detenga la ejecución…"
                        : "Consulte sobre documentos G4-, incidentes, auditorías o ISO/IEC 27701:2025…"
                    }
                    value={composerDraft}
                  />
                </PromptInputBody>
                <PromptInputFooter>
                  <PromptInputTools>
                    <Button
                      aria-label="Adjuntar archivo"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      size="icon-sm"
                      type="button"
                      variant="ghost"
                    >
                      {uploading ? (
                        <Spinner className="size-4" />
                      ) : (
                        <PaperclipIcon className="size-4" />
                      )}
                    </Button>
                  </PromptInputTools>

                  <div className="flex items-center gap-1.5">
                    {isAgentRunning && (
                      <Button
                        className="gap-1 text-xs"
                        onClick={() => onAbort()}
                        size="sm"
                        type="button"
                        variant="destructive"
                      >
                        <SquareIcon className="size-3 fill-current" />
                        Detener
                      </Button>
                    )}

                    <Button
                      aria-label="Enviar consulta"
                      disabled={
                        uploading ||
                        (!composerDraft.trim() && composerAttachments.length === 0)
                      }
                      size="icon-sm"
                      type="submit"
                      variant="default"
                    >
                      <SendIcon className="size-4" />
                    </Button>
                  </div>
                </PromptInputFooter>
              </PromptInput>

              <p className="text-center text-[11px] text-muted-foreground">
                Las escrituras en PIMS (G4-) y envíos de correo requieren confirmación explícita.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
