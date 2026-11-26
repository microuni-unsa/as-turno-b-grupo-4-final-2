import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  BookOpenIcon,
  DownloadIcon,
  EyeIcon,
  FileIcon,
  FileUpIcon,
  FolderOpenIcon,
  RefreshCwIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient, ApiRequestError } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { formatBytes, formatRelativeTimeEs } from "@/lib/format";
import { useAppStore } from "@/store/useAppStore";
import type { MirrorDocSummary } from "@/types/protocol";

export function FilesDrawer() {
  const open = useAppStore((s) => s.filesDrawerOpen);
  const setOpen = useAppStore((s) => s.setFilesDrawerOpen);
  const role = useAppStore((s) => s.auth.role);
  const publishedFiles = useAppStore((s) => s.publishedFiles);
  const uploadedFiles = useAppStore((s) => s.uploadedFiles);
  const setFilesCatalog = useAppStore((s) => s.setFilesCatalog);
  const addUploadedFile = useAppStore((s) => s.addUploadedFile);
  const addComposerAttachment = useAppStore((s) => s.addComposerAttachment);
  const setPreviewTarget = useAppStore((s) => s.setPreviewTarget);
  const pushNotice = useAppStore((s) => s.pushNotice);

  const [mirrorDocs, setMirrorDocs] = useState<MirrorDocSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isReadOnly = role === "ro";

  const refreshAll = async () => {
    setLoading(true);
    try {
      const [filesRes, mirrorRes] = await Promise.all([
        apiClient.getFiles(),
        apiClient.getMirrorDocs(),
      ]);
      setFilesCatalog(filesRes.published, filesRes.uploads);
      setMirrorDocs(mirrorRes.docs);
    } catch (err) {
      pushNotice(
        "error",
        err instanceof ApiRequestError
          ? `Error al cargar archivos: ${err.message}`
          : "No se pudo actualizar el catálogo de archivos.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      void refreshAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleUploadChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(fileList)) {
        const uploaded = await apiClient.uploadFile(file);
        addUploadedFile(uploaded);
        addComposerAttachment(uploaded);
      }
      pushNotice("info", "Archivo subido y preservado correctamente.");
    } catch (err) {
      pushNotice(
        "error",
        err instanceof ApiRequestError
          ? `Error al subir archivo: ${err.message}`
          : "No se pudo subir el archivo.",
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-xl" side="right">
        <SheetHeader className="border-b px-5 py-4">
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-2">
              <FolderOpenIcon className="size-4 text-primary" />
              <SheetTitle className="text-base">Archivos y Espejo PIMS</SheetTitle>
            </div>
            <Button
              disabled={loading}
              onClick={() => void refreshAll()}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <RefreshCwIcon className={loading ? "size-4 animate-spin" : "size-4"} />
            </Button>
          </div>
          <SheetDescription className="text-xs">
            Entregables publicados, evidencias subidas y repositorio espejo PIMS Grupo 4.
          </SheetDescription>
        </SheetHeader>

        <Tabs className="flex min-h-0 flex-1 flex-col" defaultValue="published">
          <div className="border-b px-5 py-2.5">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger className="text-xs" value="published">
                Entregables ({publishedFiles.length})
              </TabsTrigger>
              <TabsTrigger className="text-xs" value="uploads">
                Subidos ({uploadedFiles.length})
              </TabsTrigger>
              <TabsTrigger className="text-xs" value="mirror">
                Espejo PIMS ({mirrorDocs.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent className="mt-0 min-h-0 flex-1" value="published">
            <ScrollArea className="h-full px-5 py-3">
              {publishedFiles.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  No hay entregables publicados en esta sesión todavía.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {publishedFiles.map((file) => (
                    <div
                      className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3"
                      key={file.slug}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <FileIcon className="size-4 shrink-0 text-primary" />
                          <span className="truncate font-medium text-xs">
                            {file.fileName}
                          </span>
                          <Badge className="text-[10px] uppercase" variant="secondary">
                            {file.extension || file.mimeType.split("/")[1] || "file"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span>{formatBytes(file.sizeBytes)}</span>
                          <span>·</span>
                          <span>{formatRelativeTimeEs(file.publishedAt)}</span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        <Button
                          onClick={() =>
                            setPreviewTarget({
                              kind: "file",
                              title: file.fileName,
                              fileName: file.fileName,
                              mimeType: file.mimeType,
                              url: file.url,
                              downloadUrl: file.downloadUrl,
                              sizeBytes: file.sizeBytes,
                            })
                          }
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          <EyeIcon className="mr-1 size-3.5" />
                          Vista previa
                        </Button>
                        <Button asChild size="icon-sm" variant="ghost">
                          <a download={file.fileName} href={file.downloadUrl}>
                            <DownloadIcon className="size-3.5" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent className="mt-0 flex min-h-0 flex-1 flex-col" value="uploads">
            <div className="border-b px-5 py-2.5">
              <input
                className="hidden"
                multiple
                onChange={handleUploadChange}
                ref={fileInputRef}
                type="file"
              />
              <Button
                className="w-full gap-2 text-xs"
                disabled={isReadOnly || uploading}
                onClick={() => fileInputRef.current?.click()}
                size="sm"
                type="button"
                variant="outline"
              >
                {uploading ? (
                  <Spinner className="size-3.5" />
                ) : (
                  <FileUpIcon className="size-3.5" />
                )}
                {isReadOnly
                  ? "Solo instructores (RW) pueden subir archivos"
                  : "Subir archivo de evidencia o documento"}
              </Button>
            </div>

            <ScrollArea className="min-h-0 flex-1 px-5 py-3">
              {uploadedFiles.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  No hay archivos subidos todavía.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {uploadedFiles.map((file) => (
                    <div
                      className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3"
                      key={file.id}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <FileIcon className="size-4 shrink-0 text-primary" />
                          <span className="truncate font-medium text-xs">
                            {file.fileName}
                          </span>
                          <Badge className="text-[10px] uppercase" variant="secondary">
                            {file.extension.replace(/^\./, "")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span>{formatBytes(file.sizeBytes)}</span>
                          <span>·</span>
                          <span>{formatRelativeTimeEs(file.uploadedAt)}</span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1.5">
                        {!isReadOnly && (
                          <Button
                            onClick={() => {
                              addComposerAttachment(file);
                              setOpen(false);
                            }}
                            size="sm"
                            type="button"
                            variant="secondary"
                          >
                            Adjuntar
                          </Button>
                        )}
                        <Button
                          onClick={() =>
                            setPreviewTarget({
                              kind: "file",
                              title: file.fileName,
                              fileName: file.fileName,
                              mimeType: file.mimeType,
                              url: file.url,
                              downloadUrl: file.downloadUrl,
                              sizeBytes: file.sizeBytes,
                            })
                          }
                          size="icon-sm"
                          type="button"
                          variant="outline"
                        >
                          <EyeIcon className="size-3.5" />
                        </Button>
                        <Button asChild size="icon-sm" variant="ghost">
                          <a download={file.fileName} href={file.downloadUrl}>
                            <DownloadIcon className="size-3.5" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent className="mt-0 min-h-0 flex-1" value="mirror">
            <ScrollArea className="h-full px-5 py-3">
              {mirrorDocs.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs">
                  {loading
                    ? "Cargando documentos del espejo PIMS…"
                    : "No se encontraron documentos en el espejo PIMS."}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {mirrorDocs.map((doc) => (
                    <div
                      className="flex flex-col gap-2 rounded-lg border bg-card p-3"
                      key={doc.code}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <BookOpenIcon className="size-4 shrink-0 text-primary" />
                          <span className="font-mono font-semibold text-xs">
                            {doc.code}
                          </span>
                          <Badge className="text-[10px]" variant="secondary">
                            v{doc.latestVersion}
                          </Badge>
                        </div>

                        {doc.hasPdf && (
                          <div className="flex items-center gap-1.5">
                            <Button
                              onClick={() =>
                                setPreviewTarget({
                                  kind: "file",
                                  title: `${doc.code} (v${doc.latestVersion})`,
                                  fileName: `${doc.code}-v${doc.latestVersion}.pdf`,
                                  mimeType: "application/pdf",
                                  url: API_ENDPOINTS.mirrorDownload(
                                    doc.code,
                                    doc.latestVersion,
                                  ),
                                  downloadUrl: API_ENDPOINTS.mirrorDownload(
                                    doc.code,
                                    doc.latestVersion,
                                    true,
                                  ),
                                })
                              }
                              size="sm"
                              type="button"
                              variant="outline"
                            >
                              <EyeIcon className="mr-1 size-3.5" />
                              PDF
                            </Button>
                            <Button asChild size="icon-sm" variant="ghost">
                              <a
                                download={`${doc.code}-v${doc.latestVersion}.pdf`}
                                href={API_ENDPOINTS.mirrorDownload(
                                  doc.code,
                                  doc.latestVersion,
                                  true,
                                )}
                              >
                                <DownloadIcon className="size-3.5" />
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {doc.versions.map((ver) => (
                          <button
                            className="rounded border bg-muted/50 px-2 py-0.5 font-mono text-[10px] hover:bg-muted"
                            key={ver}
                            onClick={() =>
                              setPreviewTarget({
                                kind: "file",
                                title: `${doc.code} (v${ver})`,
                                fileName: `${doc.code}-v${ver}.pdf`,
                                mimeType: "application/pdf",
                                url: API_ENDPOINTS.mirrorDownload(doc.code, ver),
                                downloadUrl: API_ENDPOINTS.mirrorDownload(
                                  doc.code,
                                  ver,
                                  true,
                                ),
                              })
                            }
                            type="button"
                          >
                            v{ver}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
