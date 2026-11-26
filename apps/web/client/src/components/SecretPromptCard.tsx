import { useEffect, useState, type FormEvent } from "react";
import {
  ClockIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  LockIcon,
  ShieldAlertIcon,
} from "lucide-react";
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
import { formatCountdownSeconds, formatMmSs } from "@/lib/format";
import { useAppStore } from "@/store/useAppStore";
import type { PendingSecretRequestPublic } from "@/types/protocol";

interface SecretPromptCardProps {
  request: PendingSecretRequestPublic;
}

export function SecretPromptCard({ request }: SecretPromptCardProps) {
  const role = useAppStore((s) => s.auth.role);
  const resolveSecretRequest = useAppStore((s) => s.resolveSecretRequest);

  const [secretValue, setSecretValue] = useState("");
  const [reveal, setReveal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const isReadOnly = role === "ro";
  const remainingSec = formatCountdownSeconds(request.expiresAt, nowMs);
  const isExpired = remainingSec <= 0 || request.status === "expired";

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isReadOnly || isExpired) return;
    if (!secretValue.trim()) {
      setError("Ingrese el valor del secreto antes de cifrar.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await apiClient.submitSecretRequest(request.token, secretValue);
      setSecretValue("");
      resolveSecretRequest(request.tokenHash);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "No se pudo guardar el secreto cifrado.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-amber-500/45 bg-amber-500/5 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500">
              <LockIcon className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm">
                Solicitud de credencial cifrada: {request.label}
              </CardTitle>
              <CardDescription className="text-xs">
                Se cifra en el servidor con age y nunca entra al historial del chat.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="font-mono text-[11px]" variant="secondary">
              scope: {request.scope}
            </Badge>
            <Badge
              className="gap-1 font-mono text-[11px]"
              variant={isExpired ? "destructive" : "outline"}
            >
              <ClockIcon className="size-3" />
              {isExpired ? "Expirado" : formatMmSs(remainingSec)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-3 pb-3">
          {isReadOnly ? (
            <div className="flex items-center gap-2 rounded-md border border-border bg-background/70 px-3 py-2 text-muted-foreground text-xs">
              <ShieldAlertIcon className="size-4 shrink-0 text-amber-500" />
              <span>
                Modo observador (RO): solo un instructor (RW) puede ingresar esta credencial.
              </span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor={`secret-${request.tokenHash}`}>
                Valor del secreto
              </Label>
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <KeyRoundIcon className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    autoComplete="new-password"
                    className="pr-9 pl-8 font-mono text-xs"
                    disabled={submitting || isExpired}
                    id={`secret-${request.tokenHash}`}
                    onChange={(e) => setSecretValue(e.target.value)}
                    placeholder="Pegue el token o contraseña…"
                    type={reveal ? "text" : "password"}
                    value={secretValue}
                  />
                  <button
                    aria-label={reveal ? "Ocultar secreto" : "Mostrar secreto"}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setReveal((v) => !v)}
                    type="button"
                  >
                    {reveal ? (
                      <EyeOffIcon className="size-3.5" />
                    ) : (
                      <EyeIcon className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-1.5 text-destructive text-xs">
              {error}
            </div>
          )}
        </CardContent>

        {!isReadOnly && (
          <CardFooter className="justify-end pt-0">
            <Button
              disabled={submitting || isExpired || !secretValue.trim()}
              size="sm"
              type="submit"
            >
              {submitting ? (
                <>
                  <Spinner className="mr-2 size-3.5" />
                  Cifrando…
                </>
              ) : (
                <>
                  <LockIcon className="mr-1.5 size-3.5" />
                  Guardar cifrado (age)
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
