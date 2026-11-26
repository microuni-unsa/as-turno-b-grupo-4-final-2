import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { KeyRoundIcon, MoonIcon, ShieldCheckIcon, SunIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { apiClient, ApiRequestError } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

interface LoginGateProps {
  children: ReactNode;
}

export function LoginGate({ children }: LoginGateProps) {
  const auth = useAppStore((s) => s.auth);
  const branding = useAppStore((s) => s.branding);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const setAuth = useAppStore((s) => s.setAuth);

  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const bootstrapAuth = async () => {
      const url = new URL(window.location.href);
      const urlToken = url.searchParams.get("token");

      if (urlToken && urlToken.trim().length > 0) {
        url.searchParams.delete("token");
        const nextSearch = url.searchParams.toString();
        const cleanedUrl = `${url.pathname}${nextSearch ? `?${nextSearch}` : ""}${url.hash}`;
        window.history.replaceState({}, document.title, cleanedUrl);

        try {
          const loginRes = await apiClient.login(urlToken.trim());
          if (!cancelled) {
            setAuth({
              checked: true,
              authenticated: true,
              role: loginRes.role,
              authEnabled: true,
            });
          }
          return;
        } catch (err) {
          if (!cancelled) {
            setError(
              err instanceof ApiRequestError
                ? `Token de acceso inválido (${err.message}).`
                : "No se pudo validar el token de acceso.",
            );
          }
        }
      }

      try {
        const me = await apiClient.getAuthMe();
        if (!cancelled) {
          setAuth({
            checked: true,
            authenticated: me.authenticated || !me.authEnabled,
            role: me.role,
            authEnabled: me.authEnabled,
          });
        }
      } catch {
        if (!cancelled) {
          setAuth({
            checked: true,
            authenticated: false,
            role: null,
            authEnabled: true,
          });
        }
      }
    };

    void bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, [setAuth]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) {
      setError("Ingrese el token de acceso asignado.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient.login(trimmed);
      setToken("");
      setAuth({
        checked: true,
        authenticated: true,
        role: res.role,
        authEnabled: true,
      });
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.status === 401 || err.status === 403
            ? "Token inválido o expirado."
            : err.message
          : "Error de conexión al autenticar.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!auth.checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground text-sm">
          <Spinner className="size-5" />
          <span>Verificando sesión institucional…</span>
        </div>
      </div>
    );
  }

  if (auth.authenticated || !auth.authEnabled) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at 20% 20%, color-mix(in oklab, var(--brand-primary) 28%, transparent), transparent 45%), radial-gradient(circle at 80% 80%, color-mix(in oklab, var(--brand-accent) 18%, transparent), transparent 45%)`,
        }}
      />

      <div className="absolute top-4 right-4">
        <Button
          aria-label="Cambiar tema"
          onClick={toggleTheme}
          size="icon"
          type="button"
          variant="outline"
        >
          {theme === "dark" ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
        </Button>
      </div>

      <Card className="relative z-10 w-full max-w-md border-border/80 shadow-xl backdrop-blur-sm">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <ShieldCheckIcon className="size-5" />
            </div>
            <Badge
              className="border-brand-accent/40 bg-brand-accent/15 text-foreground"
              variant="outline"
            >
              {branding.shortBadge}
            </Badge>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl tracking-tight">{branding.appName}</CardTitle>
            <CardDescription>{branding.subtitle}</CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="access-token">Token de acceso</Label>
              <div className="relative">
                <KeyRoundIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoComplete="current-password"
                  autoFocus
                  className="pl-9 font-mono"
                  id="access-token"
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Ingrese token de Instructor (RW) u Observador (RO)"
                  type="password"
                  value={token}
                />
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                El rol Instructor habilita consultas, archivos, secretos y confirmaciones de escritura PIMS; el rol Observador permite monitoreo en vivo de solo lectura.
              </p>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive text-xs">
                {error}
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-2">
            <Button className="w-full" disabled={submitting} type="submit">
              {submitting ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Validando acceso…
                </>
              ) : (
                "Ingresar al operador"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
