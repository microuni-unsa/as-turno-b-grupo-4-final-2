import { useEffect, useState, type FormEvent } from "react";
import {
  CheckIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  KeyRoundIcon,
  LockIcon,
  PlusIcon,
  RefreshCwIcon,
} from "lucide-react";
import { SecretPromptCard } from "@/components/SecretPromptCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { apiClient, ApiRequestError } from "@/lib/api";
import { COPY_FEEDBACK_MS } from "@/lib/constants";
import { formatRelativeTimeEs } from "@/lib/format";
import { useAppStore } from "@/store/useAppStore";

export function SecretsDrawer() {
  const open = useAppStore((s) => s.secretsDrawerOpen);
  const setOpen = useAppStore((s) => s.setSecretsDrawerOpen);
  const role = useAppStore((s) => s.auth.role);
  const secrets = useAppStore((s) => s.secrets);
  const pendingRequests = useAppStore((s) => s.pendingSecretRequests);
  const setSecretsCatalog = useAppStore((s) => s.setSecretsCatalog);
  const appendToComposerDraft = useAppStore((s) => s.appendToComposerDraft);
  const pushNotice = useAppStore((s) => s.pushNotice);

  const [label, setLabel] = useState("");
  const [scope, setScope] = useState("connector");
  const [secretValue, setSecretValue] = useState("");
  const [reveal, setReveal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedHandle, setCopiedHandle] = useState<string | null>(null);

  const isReadOnly = role === "ro";

  const refreshSecrets = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getSecrets();
      setSecretsCatalog(res.secrets, res.pending);
    } catch (err) {
      pushNotice(
        "error",
        err instanceof ApiRequestError
          ? `Error al consultar secretos: ${err.message}`
          : "No se pudo actualizar la bóveda de secretos.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      void refreshSecrets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleCopy = async (handle: string) => {
    try {
      await navigator.clipboard.writeText(handle);
      setCopiedHandle(handle);
      window.setTimeout(() => setCopiedHandle(null), COPY_FEEDBACK_MS);
    } catch {
      // Clipboard unavailable
    }
  };

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isReadOnly) return;

    const cleanLabel = label.trim();
    const cleanScope = scope.trim() || "connector";
    if (!cleanLabel || !secretValue.trim()) return;

    setSaving(true);
    try {
      const res = await apiClient.createSecret({
        label: cleanLabel,
        scope: cleanScope,
        secretValue,
      });
      setLabel("");
      setSecretValue("");
      pushNotice("info", `Secreto cifrado con age: ${res.handle}`);
      await refreshSecrets();
    } catch (err) {
      pushNotice(
        "error",
        err instanceof ApiRequestError
          ? `Error al guardar secreto: ${err.message}`
          : "No se pudo guardar el secreto.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-lg" side="right">
        <SheetHeader className="border-b px-5 py-4">
          <div className="flex items-center justify-between pr-8">
            <div className="flex items-center gap-2">
              <LockIcon className="size-4 text-primary" />
              <SheetTitle className="text-base">Bóveda de Secretos (age)</SheetTitle>
            </div>
            <Button
              disabled={loading}
              onClick={() => void refreshSecrets()}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <RefreshCwIcon className={loading ? "size-4 animate-spin" : "size-4"} />
            </Button>
          </div>
          <SheetDescription className="text-xs">
            Solo metadatos y handles cifrados. Los valores en texto plano nunca se exponen en el historial ni al modelo.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1 px-5 py-4">
          <div className="space-y-5">
            {pendingRequests.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-amber-500">
                  Solicitudes pendientes ({pendingRequests.length})
                </h3>
                {pendingRequests.map((req) => (
                  <SecretPromptCard key={req.tokenHash} request={req} />
                ))}
              </div>
            )}

            {!isReadOnly && (
              <form
                className="space-y-3 rounded-lg border bg-card p-3.5"
                onSubmit={handleCreate}
              >
                <div className="flex items-center gap-2 font-semibold text-xs">
                  <PlusIcon className="size-3.5 text-primary" />
                  Agregar / Rotar secreto
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs" htmlFor="vault-label">
                      Nombre / Etiqueta
                    </Label>
                    <Input
                      className="h-8 font-mono text-xs"
                      id="vault-label"
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="ej. slack_bot_token"
                      required
                      value={label}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs" htmlFor="vault-scope">
                      Ámbito (scope)
                    </Label>
                    <Input
                      className="h-8 font-mono text-xs"
                      id="vault-scope"
                      onChange={(e) => setScope(e.target.value)}
                      placeholder="connector"
                      value={scope}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs" htmlFor="vault-value">
                    Valor del secreto
                  </Label>
                  <div className="relative">
                    <KeyRoundIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      autoComplete="new-password"
                      className="h-8 pr-8 pl-8 font-mono text-xs"
                      id="vault-value"
                      onChange={(e) => setSecretValue(e.target.value)}
                      placeholder="Se cifra al instante con age…"
                      required
                      type={reveal ? "text" : "password"}
                      value={secretValue}
                    />
                    <button
                      aria-label={reveal ? "Ocultar" : "Mostrar"}
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

                <div className="flex justify-end">
                  <Button
                    disabled={saving || !label.trim() || !secretValue.trim()}
                    size="sm"
                    type="submit"
                  >
                    {saving ? (
                      <>
                        <Spinner className="mr-1.5 size-3.5" />
                        Cifrando…
                      </>
                    ) : (
                      "Guardar cifrado (age)"
                    )}
                  </Button>
                </div>
              </form>
            )}

            <Separator />

            <div className="space-y-2.5">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                Handles registrados ({secrets.length})
              </h3>

              {secrets.length === 0 ? (
                <div className="rounded-lg border border-dashed py-8 text-center text-muted-foreground text-xs">
                  No hay secretos cifrados registrados aún.
                </div>
              ) : (
                <div className="space-y-2">
                  {secrets.map((item) => (
                    <div
                      className="flex flex-col gap-2 rounded-lg border bg-card p-3"
                      key={item.handle}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <code className="truncate font-mono font-semibold text-xs text-primary">
                          {item.handle}
                        </code>
                        <Badge className="font-mono text-[10px]" variant="secondary">
                          {item.scope}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                        <span>
                          v{item.version} · {item.createdBy} ·{" "}
                          {formatRelativeTimeEs(item.createdAt)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            className="h-6 px-2 text-[11px]"
                            onClick={() => void handleCopy(item.handle)}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            {copiedHandle === item.handle ? (
                              <>
                                <CheckIcon className="mr-1 size-3 text-emerald-500" />
                                Copiado
                              </>
                            ) : (
                              <>
                                <CopyIcon className="mr-1 size-3" />
                                Copiar handle
                              </>
                            )}
                          </Button>
                          {!isReadOnly && (
                            <Button
                              className="h-6 px-2 text-[11px]"
                              onClick={() => {
                                appendToComposerDraft(item.handle);
                                setOpen(false);
                              }}
                              size="sm"
                              type="button"
                              variant="secondary"
                            >
                              Insertar en chat
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
