import { useState, type FormEvent } from "react";
import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  XIcon,
} from "lucide-react";
import {
  Confirmation,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRequest,
  ConfirmationTitle,
} from "@/components/ai-elements/confirmation";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import type { ExtensionUiRequestView } from "@/types/protocol";

interface ExtensionUiCardProps {
  request: ExtensionUiRequestView;
  onRespond: (id: string, response: unknown) => boolean;
}

function normalizeOption(
  option: string | { label: string; value: string; description?: string },
): { label: string; value: string; description?: string } {
  if (typeof option === "string") {
    return { label: option, value: option };
  }
  return option;
}

export function ExtensionUiCard({ request, onRespond }: ExtensionUiCardProps) {
  const role = useAppStore((s) => s.auth.role);
  const cancelUiRequest = useAppStore((s) => s.cancelUiRequest);

  const isReadOnly = role === "ro";

  const [textValue, setTextValue] = useState(request.defaultValue ?? "");
  const [revealSecret, setRevealSecret] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string>(() => {
    const first = request.options?.[0];
    return first ? normalizeOption(first).value : "";
  });
  const [formState, setFormState] = useState<Record<string, string | boolean>>(() => {
    const init: Record<string, string | boolean> = {};
    for (const field of request.fields ?? []) {
      if (field.defaultValue !== undefined) {
        init[field.key] = field.defaultValue;
      } else if (field.type === "boolean") {
        init[field.key] = false;
      } else if (field.options && field.options[0]) {
        const opt = field.options[0];
        init[field.key] = typeof opt === "string" ? opt : opt.value;
      } else {
        init[field.key] = "";
      }
    }
    return init;
  });

  const submitAndDismiss = (payload: unknown) => {
    if (isReadOnly) return;
    if (onRespond(request.id, payload)) {
      cancelUiRequest(request.id);
    }
  };

  if (request.kind === "confirm") {
    return (
      <Confirmation
        approval={{ id: request.id }}
        className="border-primary/40 bg-card shadow-sm"
        state="approval-requested"
      >
        <div className="flex items-start gap-2.5">
          <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="font-semibold text-sm">{request.title}</div>
            {request.message && (
              <ConfirmationTitle className="block whitespace-pre-wrap text-muted-foreground text-xs leading-relaxed">
                {request.message}
              </ConfirmationTitle>
            )}
          </div>
        </div>

        {isReadOnly ? (
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <ShieldAlertIcon className="size-3.5 text-amber-500" />
            En espera de confirmación de Instructor (RW).
          </div>
        ) : (
          <ConfirmationRequest>
            <ConfirmationActions>
              <ConfirmationAction
                onClick={() => submitAndDismiss(false)}
                variant="outline"
              >
                <XIcon className="mr-1 size-3.5" />
                {request.cancelLabel || "Rechazar"}
              </ConfirmationAction>
              <ConfirmationAction
                onClick={() => submitAndDismiss(true)}
                variant="default"
              >
                <CheckIcon className="mr-1 size-3.5" />
                {request.confirmLabel || "Confirmar"}
              </ConfirmationAction>
            </ConfirmationActions>
          </ConfirmationRequest>
        )}
      </Confirmation>
    );
  }

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isReadOnly) return;

    switch (request.kind) {
      case "select":
        submitAndDismiss(selectedValue);
        break;
      case "input":
      case "editor":
      case "ask":
        submitAndDismiss(textValue);
        break;
      case "form":
        submitAndDismiss(formState);
        break;
    }
  };

  return (
    <Card className="border-primary/35 bg-card shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">{request.title}</CardTitle>
          <Badge className="text-[10px] uppercase" variant="secondary">
            {request.kind}
          </Badge>
        </div>
        {request.message && (
          <CardDescription className="whitespace-pre-wrap text-xs">
            {request.message}
          </CardDescription>
        )}
      </CardHeader>

      <form onSubmit={handleFormSubmit}>
        <CardContent className="space-y-3 pb-3">
          {isReadOnly ? (
            <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-muted-foreground text-xs">
              <ShieldAlertIcon className="size-4 text-amber-500" />
              Modo observador (RO): esperando respuesta del instructor.
            </div>
          ) : request.kind === "select" ? (
            <div className="space-y-1.5">
              {(request.options ?? []).map((rawOpt) => {
                const opt = normalizeOption(rawOpt);
                const selected = selectedValue === opt.value;
                return (
                  <button
                    className={cn(
                      "flex w-full flex-col rounded-md border px-3 py-2 text-left text-xs transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border hover:bg-muted/50",
                    )}
                    key={opt.value}
                    onClick={() => setSelectedValue(opt.value)}
                    type="button"
                  >
                    <span className="font-medium">{opt.label}</span>
                    {opt.description && (
                      <span className="text-muted-foreground text-[11px]">
                        {opt.description}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : request.kind === "editor" ? (
            <Textarea
              className="min-h-32 font-mono text-xs"
              onChange={(e) => setTextValue(e.target.value)}
              placeholder={request.placeholder || "Escriba su respuesta…"}
              value={textValue}
            />
          ) : request.kind === "form" ? (
            <div className="space-y-3">
              {(request.fields ?? []).map((field) => {
                const value = formState[field.key];
                if (field.type === "boolean") {
                  return (
                    <div
                      className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
                      key={field.key}
                    >
                      <Label className="text-xs" htmlFor={`ui-field-${field.key}`}>
                        {field.label}
                      </Label>
                      <Switch
                        checked={Boolean(value)}
                        id={`ui-field-${field.key}`}
                        onCheckedChange={(checked) =>
                          setFormState((prev) => ({ ...prev, [field.key]: checked }))
                        }
                      />
                    </div>
                  );
                }
                if (field.type === "textarea") {
                  return (
                    <div className="space-y-1" key={field.key}>
                      <Label className="text-xs" htmlFor={`ui-field-${field.key}`}>
                        {field.label}
                      </Label>
                      <Textarea
                        className="text-xs"
                        id={`ui-field-${field.key}`}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                        placeholder={field.placeholder}
                        required={field.required}
                        value={String(value ?? "")}
                      />
                    </div>
                  );
                }
                if (field.type === "select" && field.options) {
                  return (
                    <div className="space-y-1" key={field.key}>
                      <Label className="text-xs" htmlFor={`ui-field-${field.key}`}>
                        {field.label}
                      </Label>
                      <select
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                        id={`ui-field-${field.key}`}
                        onChange={(e) =>
                          setFormState((prev) => ({ ...prev, [field.key]: e.target.value }))
                        }
                        value={String(value ?? "")}
                      >
                        {field.options.map((rawOpt) => {
                          const opt = normalizeOption(rawOpt);
                          return (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  );
                }
                return (
                  <div className="space-y-1" key={field.key}>
                    <Label className="text-xs" htmlFor={`ui-field-${field.key}`}>
                      {field.label}
                    </Label>
                    <Input
                      className="text-xs"
                      id={`ui-field-${field.key}`}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      placeholder={field.placeholder}
                      required={field.required}
                      type={field.type === "password" ? "password" : "text"}
                      value={String(value ?? "")}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="relative">
              <Input
                className={cn("text-xs", request.secret && "pr-9 font-mono")}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder={request.placeholder || "Escriba su respuesta…"}
                type={request.secret && !revealSecret ? "password" : "text"}
                value={textValue}
              />
              {request.secret && (
                <button
                  aria-label={revealSecret ? "Ocultar" : "Mostrar"}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setRevealSecret((v) => !v)}
                  type="button"
                >
                  {revealSecret ? (
                    <EyeOffIcon className="size-3.5" />
                  ) : (
                    <EyeIcon className="size-3.5" />
                  )}
                </button>
              )}
            </div>
          )}
        </CardContent>

        {!isReadOnly && (
          <CardFooter className="justify-end gap-2 pt-0">
            <Button
              onClick={() => submitAndDismiss(null)}
              size="sm"
              type="button"
              variant="ghost"
            >
              Cancelar
            </Button>
            <Button size="sm" type="submit">
              Enviar respuesta
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
