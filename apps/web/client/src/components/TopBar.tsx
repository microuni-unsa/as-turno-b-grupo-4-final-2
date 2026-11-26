import {
  EyeIcon,
  FolderOpenIcon,
  LockIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  PanelLeftIcon,
  ShieldCheckIcon,
  SunIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

interface TopBarProps {
  onToggleDesktopSidebar?: () => void;
}

export function TopBar({ onToggleDesktopSidebar }: TopBarProps) {
  const branding = useAppStore((s) => s.branding);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const showTraces = useAppStore((s) => s.showTraces);
  const setShowTraces = useAppStore((s) => s.setShowTraces);
  const auth = useAppStore((s) => s.auth);
  const setAuth = useAppStore((s) => s.setAuth);
  const wsStatus = useAppStore((s) => s.wsStatus);
  const systemStatus = useAppStore((s) => s.systemStatus);
  const stats = useAppStore((s) => s.stats);
  const publishedFiles = useAppStore((s) => s.publishedFiles);
  const uploadedFiles = useAppStore((s) => s.uploadedFiles);
  const pendingSecretRequests = useAppStore((s) => s.pendingSecretRequests);
  const setMobileSidebarOpen = useAppStore((s) => s.setMobileSidebarOpen);
  const setFilesDrawerOpen = useAppStore((s) => s.setFilesDrawerOpen);
  const setSecretsDrawerOpen = useAppStore((s) => s.setSecretsDrawerOpen);

  const totalFilesCount = publishedFiles.length + uploadedFiles.length;
  const pendingSecretsCount = pendingSecretRequests.length;

  const pimsOk = systemStatus?.pimsReachable ?? false;
  const dbOk = systemStatus?.dbOk ?? false;
  const mirrorCount = systemStatus?.mirrorDocCount ?? 0;

  const handleLogout = async () => {
    try {
      await apiClient.logout();
    } catch {
      // Clear local auth state even if logout request fails
    }
    setAuth({
      checked: true,
      authenticated: false,
      role: null,
      authEnabled: auth.authEnabled,
    });
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-card/85 px-3 backdrop-blur-md md:px-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <Button
          aria-label="Abrir barra lateral"
          className="md:hidden"
          onClick={() => setMobileSidebarOpen(true)}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <MenuIcon className="size-4" />
        </Button>

        {onToggleDesktopSidebar && (
          <Button
            aria-label="Alternar barra lateral"
            className="hidden md:inline-flex"
            onClick={onToggleDesktopSidebar}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <PanelLeftIcon className="size-4" />
          </Button>
        )}

        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
          <ShieldCheckIcon className="size-4" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate font-semibold text-sm tracking-tight">
              {branding.appName}
            </h1>
            <Badge
              className="hidden border-brand-accent/45 bg-brand-accent/15 px-1.5 py-0 text-[10px] font-medium text-foreground sm:inline-flex"
              variant="outline"
            >
              {branding.shortBadge}
            </Badge>
          </div>
          <p className="hidden truncate text-muted-foreground text-[11px] lg:block">
            {branding.subtitle}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* Role indicator for RO observers */}
        {auth.role === "ro" && (
          <Badge
            className="gap-1 border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-300"
            variant="outline"
          >
            <EyeIcon className="size-3" />
            <span className="hidden sm:inline">Observador · Solo lectura</span>
            <span className="sm:hidden">RO</span>
          </Badge>
        )}

        {/* Governance status pill */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="hidden items-center gap-1.5 rounded-full border bg-background/80 px-2.5 py-1 text-xs md:flex">
              <span
                className={cn(
                  "size-2 rounded-full",
                  wsStatus === "connected" && pimsOk
                    ? "bg-emerald-500"
                    : dbOk
                      ? "bg-amber-500"
                      : "bg-red-500",
                )}
              />
              <span className="font-medium text-[11px]">
                {pimsOk ? "PIMS Vivo" : dbOk ? "Espejo pgvector" : "Sin enlace"}
              </span>
              {mirrorCount > 0 && (
                <span className="text-muted-foreground text-[11px]">
                  · {mirrorCount} docs
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs space-y-1 text-xs">
            <div className="font-semibold">Estado de Gobernanza</div>
            <div>WebSocket: {wsStatus}</div>
            <div>PIMS GESTITEL: {pimsOk ? "Disponible" : "No disponible (ruta espejo)"}</div>
            <div>
              Espejo pgvector: {dbOk ? `Operativo (${mirrorCount} documentos)` : "Desconectado"}
            </div>
            <div>Motor OMP: {systemStatus?.ompConnected ? "Conectado" : "En espera"}</div>
            {systemStatus?.agentModel && <div>Modelo: {systemStatus.agentModel}</div>}
          </TooltipContent>
        </Tooltip>

        {/* Token / Context pill */}
        {stats && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                className="hidden font-mono text-[11px] xl:inline-flex"
                variant="secondary"
              >
                {Math.round(stats.contextPercent)}% · {stats.totalTokens.toLocaleString("es-PE")} tok
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="text-xs">
              Uso de contexto: {stats.contextPercent.toFixed(1)}% ({stats.totalTokens.toLocaleString("es-PE")} tokens)
            </TooltipContent>
          </Tooltip>
        )}

        {/* Trazas del agente toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 rounded-full border bg-background/70 px-2.5 py-1">
              <Switch
                aria-label="Trazas del agente"
                checked={showTraces}
                id="traces-toggle"
                onCheckedChange={setShowTraces}
              />
              <Label
                className="hidden cursor-pointer text-[11px] font-medium sm:inline"
                htmlFor="traces-toggle"
              >
                Trazas del agente
              </Label>
            </div>
          </TooltipTrigger>
          <TooltipContent className="text-xs">
            Muestra u oculta el razonamiento y la ejecución de herramientas en vivo.
          </TooltipContent>
        </Tooltip>

        {/* Archivos drawer button */}
        <Button
          className="gap-1.5"
          onClick={() => setFilesDrawerOpen(true)}
          size="sm"
          type="button"
          variant="outline"
        >
          <FolderOpenIcon className="size-3.5" />
          <span className="hidden sm:inline">Archivos</span>
          {totalFilesCount > 0 && (
            <Badge className="h-4 px-1 text-[10px]" variant="secondary">
              {totalFilesCount}
            </Badge>
          )}
        </Button>

        {/* Secretos drawer button */}
        <Button
          className={cn(
            "relative gap-1.5",
            pendingSecretsCount > 0 &&
              "border-amber-500/60 bg-amber-500/10 text-amber-600 dark:text-amber-300",
          )}
          onClick={() => setSecretsDrawerOpen(true)}
          size="sm"
          type="button"
          variant="outline"
        >
          <LockIcon className="size-3.5" />
          <span className="hidden sm:inline">Secretos</span>
          {pendingSecretsCount > 0 && (
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
            </span>
          )}
        </Button>

        {/* Theme toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label="Cambiar tema"
              onClick={toggleTheme}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              {theme === "dark" ? (
                <SunIcon className="size-4" />
              ) : (
                <MoonIcon className="size-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="text-xs">
            {theme === "dark" ? "Modo claro" : "Modo oscuro"}
          </TooltipContent>
        </Tooltip>

        {/* Logout */}
        {auth.authEnabled && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label="Cerrar sesión"
                onClick={handleLogout}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <LogOutIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">Cerrar sesión</TooltipContent>
          </Tooltip>
        )}
      </div>
    </header>
  );
}
