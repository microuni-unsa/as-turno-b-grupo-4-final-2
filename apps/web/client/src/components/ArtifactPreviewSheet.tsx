import { useEffect, useState } from "react";
import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileTextIcon,
} from "lucide-react";
import {
  Artifact,
  ArtifactAction,
  ArtifactActions,
  ArtifactClose,
  ArtifactContent,
  ArtifactDescription,
  ArtifactHeader,
  ArtifactTitle,
} from "@/components/ai-elements/artifact";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { apiClient, ApiRequestError } from "@/lib/api";
import { API_ENDPOINTS, COPY_FEEDBACK_MS } from "@/lib/constants";
import { formatBytes } from "@/lib/format";
import { useAppStore } from "@/store/useAppStore";
import type { MirrorExcerptResponse } from "@/types/protocol";

function isPdfTarget(mimeType: string, fileName: string): boolean {
  return mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf");
}

function isHtmlTarget(mimeType: string, fileName: string): boolean {
  return (
    mimeType === "text/html" ||
    fileName.toLowerCase().endsWith(".html") ||
    fileName.toLowerCase().endsWith(".htm")
  );
}

function isImageTarget(mimeType: string, fileName: string): boolean {
  return (
    mimeType.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileName)
  );
}

function isTextTarget(mimeType: string, fileName: string): boolean {
  return (
    mimeType.startsWith("text/") ||
    mimeType === "application/json" ||
    /\.(txt|md|markdown|csv|json|log|yaml|yml|xml|sql|ts|js)$/i.test(fileName)
  );
}

function NumberedTextView({
  text,
  startLine = 1,
}: {
  text: string;
  startLine?: number;
}) {
  const lines = text.split(/\r?\n/);
  return (
    <div className="overflow-x-auto rounded-md border bg-muted/30 font-mono text-xs leading-relaxed">
      <table className="w-full border-collapse">
        <tbody>
          {lines.map((line, idx) => (
            <tr className="hover:bg-muted/50" key={idx}>
              <td className="w-12 select-none border-r px-2.5 py-0.5 text-right text-muted-foreground">
                {startLine + idx}
              </td>
              <td className="whitespace-pre-wrap break-words px-3 py-0.5">
                {line || " "}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ArtifactPreviewSheet() {
  const previewTarget = useAppStore((s) => s.previewTarget);
  const setPreviewTarget = useAppStore((s) => s.setPreviewTarget);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [excerpt, setExcerpt] = useState<MirrorExcerptResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!previewTarget) {
      setTextContent(null);
      setExcerpt(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setError(null);

    if (previewTarget.kind === "citation") {
      setLoading(true);
      setTextContent(null);
      apiClient
        .getMirrorExcerpt(
          previewTarget.doc,
          previewTarget.version,
          previewTarget.lines,
        )
        .then((res) => {
          if (!cancelled) {
            setExcerpt(res);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setError(
              err instanceof ApiRequestError
                ? err.message
                : "No se pudo cargar el extracto del espejo PIMS.",
            );
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else if (
      isTextTarget(previewTarget.mimeType, previewTarget.fileName) &&
      !isHtmlTarget(previewTarget.mimeType, previewTarget.fileName)
    ) {
      setLoading(true);
      setExcerpt(null);
      fetch(previewTarget.url, { credentials: "include" })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          return res.text();
        })
        .then((txt) => {
          if (!cancelled) setTextContent(txt);
        })
        .catch((err) => {
          if (!cancelled) {
            setError(
              err instanceof Error
                ? err.message
                : "No se pudo leer la vista previa de texto.",
            );
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    } else {
      setLoading(false);
      setTextContent(null);
      setExcerpt(null);
    }

    return () => {
      cancelled = true;
    };
  }, [previewTarget]);

  const handleCopyCitation = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    } catch {
      // Clipboard unavailable
    }
  };

  const openUrl =
    previewTarget?.kind === "file"
      ? previewTarget.url
      : previewTarget?.kind === "citation"
        ? API_ENDPOINTS.mirrorDownload(previewTarget.doc, previewTarget.version)
        : "";

  const downloadUrl =
    previewTarget?.kind === "file"
      ? previewTarget.downloadUrl
      : previewTarget?.kind === "citation"
        ? API_ENDPOINTS.mirrorDownload(previewTarget.doc, previewTarget.version, true)
        : "";

  return (
    <Sheet
      onOpenChange={(open) => {
        if (!open) setPreviewTarget(null);
      }}
      open={previewTarget !== null}
    >
      <SheetContent
        className="w-full p-0 sm:max-w-2xl lg:max-w-3xl"
        showCloseButton={false}
        side="right"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Vista previa de artefacto</SheetTitle>
        </SheetHeader>

        {previewTarget && (
          <Artifact className="h-full rounded-none border-0">
            <ArtifactHeader>
              <div className="min-w-0 flex-1 space-y-0.5 pr-2">
                <div className="flex items-center gap-2">
                  <FileTextIcon className="size-4 shrink-0 text-primary" />
                  <ArtifactTitle className="truncate">
                    {previewTarget.kind === "file"
                      ? previewTarget.title
                      : `${previewTarget.doc} · v${previewTarget.version}`}
                  </ArtifactTitle>
                  {previewTarget.kind === "citation" && (
                    <Badge className="font-mono text-[10px]" variant="secondary">
                      {previewTarget.lines}
                    </Badge>
                  )}
                </div>
                <ArtifactDescription className="truncate font-mono text-xs">
                  {previewTarget.kind === "file"
                    ? `${previewTarget.fileName}${
                        previewTarget.sizeBytes !== undefined
                          ? ` · ${formatBytes(previewTarget.sizeBytes)}`
                          : ""
                      }`
                    : previewTarget.raw}
                </ArtifactDescription>
              </div>

              <ArtifactActions>
                {previewTarget.kind === "citation" && (
                  <ArtifactAction
                    icon={copied ? CheckIcon : CopyIcon}
                    label="Copiar cita"
                    onClick={() => void handleCopyCitation(previewTarget.raw)}
                    tooltip="Copiar cita pims:"
                  />
                )}
                {openUrl && (
                  <ArtifactAction
                    icon={ExternalLinkIcon}
                    label="Abrir en nueva pestaña"
                    onClick={() =>
                      window.open(openUrl, "_blank", "noopener,noreferrer")
                    }
                    tooltip="Abrir en nueva pestaña"
                  />
                )}
                {downloadUrl && (
                  <ArtifactAction
                    icon={DownloadIcon}
                    label="Descargar"
                    onClick={() => {
                      const anchor = document.createElement("a");
                      anchor.href = downloadUrl;
                      anchor.download =
                        previewTarget.kind === "file"
                          ? previewTarget.fileName
                          : `${previewTarget.doc}-v${previewTarget.version}.pdf`;
                      document.body.appendChild(anchor);
                      anchor.click();
                      anchor.remove();
                    }}
                    tooltip="Descargar archivo"
                  />
                )}
                <ArtifactClose onClick={() => setPreviewTarget(null)} />
              </ArtifactActions>
            </ArtifactHeader>

            <ArtifactContent className="flex flex-col gap-3 p-4">
              {loading && (
                <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground text-sm">
                  <Spinner className="size-5" />
                  <span>Cargando contenido…</span>
                </div>
              )}

              {error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-destructive text-xs">
                  {error}
                </div>
              )}

              {!loading && !error && previewTarget.kind === "citation" && excerpt && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-muted-foreground text-xs">
                    <span>
                      Líneas {excerpt.startLine}–{excerpt.endLine} de {excerpt.totalLines}
                    </span>
                    <span>Fuente: Espejo PIMS ({excerpt.doc} v{excerpt.version})</span>
                  </div>
                  <NumberedTextView
                    startLine={excerpt.startLine}
                    text={excerpt.text}
                  />
                </div>
              )}

              {!loading && !error && previewTarget.kind === "file" && (
                <>
                  {isPdfTarget(previewTarget.mimeType, previewTarget.fileName) ? (
                    <iframe
                      className="min-h-[75vh] w-full flex-1 rounded-md border bg-background"
                      src={previewTarget.url}
                      title={previewTarget.fileName}
                    />
                  ) : isHtmlTarget(previewTarget.mimeType, previewTarget.fileName) ? (
                    <iframe
                      className="min-h-[75vh] w-full flex-1 rounded-md border bg-white"
                      sandbox="allow-scripts"
                      src={previewTarget.url}
                      title={previewTarget.fileName}
                    />
                  ) : isImageTarget(previewTarget.mimeType, previewTarget.fileName) ? (
                    <div className="flex flex-1 items-center justify-center rounded-md border bg-muted/20 p-4">
                      <img
                        alt={previewTarget.fileName}
                        className="max-h-[75vh] max-w-full rounded object-contain"
                        src={previewTarget.url}
                      />
                    </div>
                  ) : textContent !== null ? (
                    <NumberedTextView text={textContent} />
                  ) : (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-md border border-dashed p-8 text-center">
                      <FileTextIcon className="size-10 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="font-medium text-sm">
                          Vista previa directa no disponible para este formato
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Use el botón de descarga en la barra superior para abrir {previewTarget.fileName}.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </ArtifactContent>
          </Artifact>
        )}
      </SheetContent>
    </Sheet>
  );
}
