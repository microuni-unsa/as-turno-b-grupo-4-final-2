import { useMemo, useState } from "react";
import {
  DownloadIcon,
  FolderOpenIcon,
  LockIcon,
  MessageSquarePlusIcon,
  MessageSquareTextIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { apiClient, ApiRequestError } from "@/lib/api";
import { formatRelativeTimeEs } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

interface SessionSidebarProps {
  onNewSession: () => void;
  onSwitchSession: (sessionPath: string) => void;
  desktopCollapsed?: boolean;
}

function SidebarBody({
  onNewSession,
  onSwitchSession,
  onAfterNavigate,
}: {
  onNewSession: () => void;
  onSwitchSession: (sessionPath: string) => void;
  onAfterNavigate?: () => void;
}) {
  const auth = useAppStore((s) => s.auth);
  const sessions = useAppStore((s) => s.sessions);
  const activeSessionId = useAppStore((s) => s.activeSessionId);
  const activeSessionFile = useAppStore((s) => s.activeSessionFile);
  const publishedFiles = useAppStore((s) => s.publishedFiles);
  const pendingSecretRequests = useAppStore((s) => s.pendingSecretRequests);
  const setFilesDrawerOpen = useAppStore((s) => s.setFilesDrawerOpen);
  const setSecretsDrawerOpen = useAppStore((s) => s.setSecretsDrawerOpen);
  const pushNotice = useAppStore((s) => s.pushNotice);

  const [query, setQuery] = useState("");
  const [exporting, setExporting] = useState(false);

  const isReadOnly = auth.role === "ro";

  const filteredSessions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) => s.title.toLowerCase().includes(q));
  }, [sessions, query]);

  const handleExportHtml = async () => {
    setExporting(true);
    try {
      const res = await apiClient.exportSession();
      const blob = new Blob([res.html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = res.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      pushNotice("info", `Sesión exportada: ${res.filename}`);
    } catch (err) {
      pushNotice(
        "error",
        err instanceof ApiRequestError
          ? `No se pudo exportar la sesión: ${err.message}`
          : "No se pudo exportar la sesión HTML.",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="space-y-2.5 p-3">
        <Button
          className="w-full justify-start gap-2 font-medium shadow-xs"
          disabled={isReadOnly}
          onClick={() => {
            onNewSession();
            onAfterNavigate?.();
          }}
          type="button"
        >
          <MessageSquarePlusIcon className="size-4" />
          Nueva conversación
        </Button>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Buscar conversaciones"
            className="h-8 bg-background/60 pl-8 text-xs"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar sesiones…"
            value={query}
          />
        </div>
      </div>

      <div className="px-3 pb-1.5 font-medium text-[11px] uppercase tracking-wider text-muted-foreground">
        Historial ({filteredSessions.length})
      </div>

      <ScrollArea className="min-h-0 flex-1 px-2">
        <div className="space-y-1 pb-3">
          {filteredSessions.length === 0 ? (
            <div className="px-2 py-6 text-center text-muted-foreground text-xs">
              {query.trim()
                ? "Sin sesiones coincidentes."
                : "Aún no hay sesiones guardadas."}
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive =
                session.isActive ||
                (activeSessionId !== null && session.id === activeSessionId) ||
                (activeSessionFile !== null && session.filePath === activeSessionFile);

              return (
                <button
                  className={cn(
                    "group flex w-full flex-col gap-1 rounded-lg px-2.5 py-2 text-left transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground ring-1 ring-sidebar-ring/30"
                      : "hover:bg-sidebar-accent/60 text-sidebar-foreground/90",
                  )}
                  key={session.id || session.filePath}
                  onClick={() => {
                    onSwitchSession(session.filePath);
                    onAfterNavigate?.();
                  }}
                  type="button"
                >
                  <div className="flex items-start gap-2">
                    <MessageSquareTextIcon
                      className={cn(
                        "mt-0.5 size-3.5 shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span className="line-clamp-2 font-medium text-xs leading-snug">
                      {session.title || "Sesión sin título"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pl-5 text-[10px] text-muted-foreground">
                    <span>{session.messageCount} msgs</span>
                    <span>{formatRelativeTimeEs(session.updatedAt)}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>

      <Separator />

      <div className="space-y-1.5 p-3">
        <Button
          className="w-full justify-between text-xs"
          onClick={() => {
            setFilesDrawerOpen(true);
            onAfterNavigate?.();
          }}
          size="sm"
          type="button"
          variant="ghost"
        >
          <span className="flex items-center gap-2">
            <FolderOpenIcon className="size-3.5" />
            Archivos y Entregables
          </span>
          {publishedFiles.length > 0 && (
            <Badge className="h-4 px-1.5 text-[10px]" variant="secondary">
              {publishedFiles.length}
            </Badge>
          )}
        </Button>

        <Button
          className="w-full justify-between text-xs"
          onClick={() => {
            setSecretsDrawerOpen(true);
            onAfterNavigate?.();
          }}
          size="sm"
          type="button"
          variant="ghost"
        >
          <span className="flex items-center gap-2">
            <LockIcon className="size-3.5" />
            Bóveda de Secretos
          </span>
          {pendingSecretRequests.length > 0 && (
            <Badge
              className="h-4 border-amber-500/40 bg-amber-500/20 px-1.5 text-[10px] text-amber-500"
              variant="outline"
            >
              {pendingSecretRequests.length}
            </Badge>
          )}
        </Button>

        <Button
          className="w-full justify-start gap-2 text-xs"
          disabled={exporting}
          onClick={handleExportHtml}
          size="sm"
          type="button"
          variant="ghost"
        >
          {exporting ? (
            <Spinner className="size-3.5" />
          ) : (
            <DownloadIcon className="size-3.5" />
          )}
          Exportar sesión (HTML)
        </Button>

        <div className="mt-2 flex items-start gap-2 rounded-lg border border-sidebar-border/80 bg-background/50 p-2 text-[11px] text-muted-foreground">
          <ShieldCheckIcon className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <p className="leading-tight">
            Cumplimiento ISO/IEC 27701:2025 · Citas verificables y aprobaciones explícitas para escrituras G4-.
          </p>
        </div>
      </div>
    </div>
  );
}

export function SessionSidebar({
  onNewSession,
  onSwitchSession,
  desktopCollapsed = false,
}: SessionSidebarProps) {
  const mobileSidebarOpen = useAppStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useAppStore((s) => s.setMobileSidebarOpen);

  return (
    <>
      {!desktopCollapsed && (
        <aside className="hidden w-72 shrink-0 border-r md:flex md:flex-col">
          <SidebarBody
            onNewSession={onNewSession}
            onSwitchSession={onSwitchSession}
          />
        </aside>
      )}

      <Sheet onOpenChange={setMobileSidebarOpen} open={mobileSidebarOpen}>
        <SheetContent className="w-76 p-0" side="left">
          <SheetHeader className="sr-only">
            <SheetTitle>Conversaciones PIMS</SheetTitle>
          </SheetHeader>
          <SidebarBody
            onAfterNavigate={() => setMobileSidebarOpen(false)}
            onNewSession={onNewSession}
            onSwitchSession={onSwitchSession}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
