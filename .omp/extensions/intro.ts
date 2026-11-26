import * as fs from "node:fs";
import * as path from "node:path";
import {
  SECRETS_HANDLE_REGEX,
  SECRETS_POLL_MAX_TIMEOUT_SEC,
  WEB_INTERNAL_URL,
} from "../../connectors/runtime/constants";

interface MessageContent {
  type?: string;
  text?: string;
  thinking?: string;
  arguments?: unknown;
}

interface ChatMessage {
  role?: string;
  content?: string | MessageContent[];
  details?: unknown;
}

const SENSITIVE_ENV_VARS = [
  "PIMS_PASSWORD",
  "SMTP_PASSWORD",
  "EMBEDDINGS_API_KEY",
  "AGENT_API_KEY",
  "POSTGRES_PASSWORD",
  "AGE_SECRET_KEY",
  "WEB_RW_TOKEN",
  "WEB_RO_TOKEN",
] as const;

const OPAQUE_HANDLE_GLOBAL_REGEX = /\bsecret:[a-zA-Z0-9_.-]+@v?[0-9]+\b/g;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getWebInternalBaseUrl(): string {
  const envUrl = process.env.WEB_INTERNAL_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, "");
  }
  return WEB_INTERNAL_URL;
}

/**
 * Scrubs raw credentials, JWTs, Bearer tokens, DB URIs, and loaded sensitive env vars
 * from arbitrary text while strictly preserving opaque `secret:<name>@v<n>` handles.
 */
export function redactSecrets(text: string): string {
  if (typeof text !== "string" || text.length === 0) {
    return text;
  }

  // Temporarily protect opaque secret handles so no downstream pattern ever alters them.
  let sentinelPrefix = "__PIMS_OPAQUE_HANDLE_";
  while (text.includes(sentinelPrefix)) {
    sentinelPrefix += "_";
  }

  const protectedHandles: string[] = [];
  let scrubbed = text.replace(OPAQUE_HANDLE_GLOBAL_REGEX, (match) => {
    const idx = protectedHandles.length;
    protectedHandles.push(match);
    return `${sentinelPrefix}${idx}__`;
  });

  // 1. Scrub exact values of loaded sensitive environment variables (length >= 6).
  const envSecretValues = Array.from(
    new Set(
      SENSITIVE_ENV_VARS.map((key) => process.env[key])
        .filter(
          (val): val is string =>
            typeof val === "string" &&
            val.length >= 6 &&
            !SECRETS_HANDLE_REGEX.test(val)
        )
    )
  ).sort((a, b) => b.length - a.length);

  for (const secretVal of envSecretValues) {
    const literalRegex = new RegExp(escapeRegExp(secretVal), "g");
    scrubbed = scrubbed.replace(literalRegex, "[REDACTED_SECRET]");
  }

  // 2. Scrub age private key lines if exposed directly.
  scrubbed = scrubbed.replace(/AGE-SECRET-KEY-1[A-Z0-9]{20,}/g, "[REDACTED_SECRET]");

  // 3. Scrub JWTs (eyJ...).
  scrubbed = scrubbed.replace(
    /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g,
    "[REDACTED_JWT_TOKEN]"
  );

  // 4. Scrub Bearer tokens (skipping protected handles and already-redacted markers).
  const bearerRegex = new RegExp(
    `(bearer\\s+)(?!\\[REDACTED_)(?!${escapeRegExp(sentinelPrefix)})([a-zA-Z0-9_\\-\\.+/=]{16,})`,
    "gi"
  );
  scrubbed = scrubbed.replace(bearerRegex, "$1[REDACTED_TOKEN]");

  // 5. Scrub Postgres and other database URIs containing embedded passwords.
  scrubbed = scrubbed.replace(
    /((?:postgres(?:ql)?|mysql|mariadb|mongodb(?:\+srv)?|redis):\/\/[^:\s/@]+:)([^@\s]+)(@)/gi,
    "$1[REDACTED_DB_PASS]$3"
  );

  // 6. Scrub explicit credential assignments (preserving quotes and protected handles).
  const sensitiveKeys =
    "PIMS_PASSWORD|SMTP_PASSWORD|EMBEDDINGS_API_KEY|AGENT_API_KEY|POSTGRES_PASSWORD|AGE_SECRET_KEY|WEB_RW_TOKEN|WEB_RO_TOKEN|password|passwd|secret_value|secretValue|api_key|apiKey";
  const sentinelEscaped = escapeRegExp(sentinelPrefix);

  const quotedAssignRegex = new RegExp(
    `(["']?\\b(?:${sensitiveKeys})\\b["']?\\s*[:=]\\s*)(["'])(?!${sentinelEscaped})(?!\\[REDACTED_)([^"'\\r\\n]{6,})\\2`,
    "gi"
  );
  scrubbed = scrubbed.replace(quotedAssignRegex, "$1$2[REDACTED_SECRET]$2");

  const unquotedAssignRegex = new RegExp(
    `(["']?\\b(?:${sensitiveKeys})\\b["']?\\s*[:=]\\s*)(?!["'])(?!${sentinelEscaped})(?!\\[REDACTED_)([^\\s"',}\\r\\n]{6,})`,
    "gi"
  );
  scrubbed = scrubbed.replace(unquotedAssignRegex, "$1[REDACTED_SECRET]");

  // Restore protected opaque handles verbatim.
  if (protectedHandles.length > 0) {
    const restoreRegex = new RegExp(`${sentinelEscaped}(\\d+)__`, "g");
    scrubbed = scrubbed.replace(restoreRegex, (_full, indexStr) => {
      const idx = Number.parseInt(indexStr, 10);
      return protectedHandles[idx] ?? _full;
    });
  }

  return scrubbed;
}

const SENSITIVE_KEY_NAME_REGEX =
  /^(?:PIMS_PASSWORD|SMTP_PASSWORD|EMBEDDINGS_API_KEY|AGENT_API_KEY|POSTGRES_PASSWORD|AGE_SECRET_KEY|WEB_RW_TOKEN|WEB_RO_TOKEN|password|passwd|secret_value|secretValue|api_key|apiKey)$/i;

function redactDeep(value: unknown): { value: unknown; changed: boolean } {
  if (typeof value === "string") {
    const next = redactSecrets(value);
    return { value: next, changed: next !== value };
  }

  if (Array.isArray(value)) {
    let anyChanged = false;
    const mapped = value.map((item) => {
      const res = redactDeep(item);
      if (res.changed) {
        anyChanged = true;
      }
      return res.value;
    });
    return anyChanged ? { value: mapped, changed: true } : { value, changed: false };
  }

  if (value !== null && typeof value === "object") {
    let anyChanged = false;
    const record = value as Record<string, unknown>;
    const nextObj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(record)) {
      if (
        SENSITIVE_KEY_NAME_REGEX.test(k) &&
        typeof v === "string" &&
        v.length >= 6 &&
        !SECRETS_HANDLE_REGEX.test(v) &&
        !v.startsWith("[REDACTED_")
      ) {
        nextObj[k] = "[REDACTED_SECRET]";
        anyChanged = true;
        continue;
      }
      const res = redactDeep(v);
      if (res.changed) {
        anyChanged = true;
      }
      nextObj[k] = res.value;
    }
    return anyChanged ? { value: nextObj, changed: true } : { value, changed: false };
  }

  return { value, changed: false };
}

function logStructuredError(event: string, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      event,
      error: message,
    }) + "\n"
  );
}

export default function (pi: any) {
  const BANNER_TEXT = `UNSA PIMS — OPERADOR AGÉNTICO DEL SGPI (GRUPO 4)
ISO/IEC 27701:2025 — Universidad Nacional de San Agustín

Capacidades en la consola web unificada:
• Documentos y versiones: búsqueda, comparación, trazabilidad y citación pims:.
• Incidentes, riesgos y capacitación: registro, severidad, tratamiento y evidencias.
• Auditorías y mejora: hallazgos, NC, acciones correctivas y estado semafórico.
• Carga directa de archivos (clip / arrastrar hasta 50 MB) y Bóveda de Secretos cifrada.

Comandos iniciales útiles:
• /new              Iniciar una nueva conversación limpia
• /resume           Retomar una sesión anterior
• mas ayuda         Mostrar la guía operativa completa`.trim();

  // 1. Session start banner
  pi.on("session_start", async (_event: unknown, _ctx: unknown) => {
    if (typeof pi.sendMessage !== "function") {
      throw new Error("intro extension requires pi.sendMessage during session_start");
    }
    try {
      await pi.sendMessage(
        { content: BANNER_TEXT, display: true },
        { triggerTurn: false }
      );
    } catch (err: unknown) {
      logStructuredError("intro_session_start_banner_failed", err);
      throw err;
    }
  });

  // 2. Input hook: handle 'mas ayuda' & redact credentials before session persistence / LLM
  pi.on("input", async (event: any, _ctx: unknown) => {
    const rawText = typeof event === "string" ? event : event?.text;
    if (typeof rawText !== "string") {
      return undefined;
    }

    const normalized = rawText.trim().toLowerCase();
    if (
      normalized === "mas ayuda" ||
      normalized === "más ayuda" ||
      normalized === "'mas ayuda'" ||
      normalized === '"mas ayuda"'
    ) {
      if (typeof pi.sendMessage !== "function") {
        throw new Error("intro extension requires pi.sendMessage for 'mas ayuda'");
      }

      const usagePath = path.resolve(process.cwd(), ".omp", "USAGE.md");
      let usageContent: string;
      if (fs.existsSync(usagePath)) {
        try {
          usageContent = fs.readFileSync(usagePath, "utf-8");
        } catch (err: unknown) {
          logStructuredError("intro_usage_read_failed", err);
          throw err;
        }
      } else {
        usageContent = "Manual de uso no disponible en .omp/USAGE.md";
      }

      await pi.sendMessage(
        { content: usageContent, display: true },
        { triggerTurn: false }
      );
      return { handled: true };
    }

    const redacted = redactSecrets(rawText);
    if (redacted !== rawText) {
      if (event && typeof event === "object" && "text" in event) {
        event.text = redacted;
      }
      return { text: redacted };
    }

    return undefined;
  });

  // 3. Tool result hook: scrub secrets before session transcript persistence
  pi.on("tool_result", async (event: any, _ctx: unknown) => {
    if (!event || typeof event !== "object") {
      return undefined;
    }

    const contentResult = redactDeep(event.content);
    const detailsResult =
      event.details !== undefined
        ? redactDeep(event.details)
        : { value: undefined, changed: false };

    if (!contentResult.changed && !detailsResult.changed) {
      return undefined;
    }

    if (contentResult.changed) {
      event.content = contentResult.value;
    }
    if (detailsResult.changed) {
      event.details = detailsResult.value;
    }

    return {
      ...(contentResult.changed ? { content: contentResult.value } : {}),
      ...(detailsResult.changed ? { details: detailsResult.value } : {}),
    };
  });

  // 4. Context hook: defense-in-depth scrub before LLM provider calls
  pi.on("context", async (event: any, _ctx: unknown) => {
    if (!event || !Array.isArray(event.messages)) {
      return undefined;
    }

    for (const message of event.messages as ChatMessage[]) {
      if (typeof message.content === "string") {
        message.content = redactSecrets(message.content);
      } else if (Array.isArray(message.content)) {
        for (const part of message.content) {
          if (!part || typeof part !== "object") {
            continue;
          }
          if (typeof part.text === "string") {
            part.text = redactSecrets(part.text);
          }
          if (typeof part.thinking === "string") {
            part.thinking = redactSecrets(part.thinking);
          }
          if (part.arguments !== undefined) {
            const argsRes = redactDeep(part.arguments);
            if (argsRes.changed) {
              part.arguments = argsRes.value;
            }
          }
        }
      }
      if (message.details !== undefined) {
        const detailsRes = redactDeep(message.details);
        if (detailsRes.changed) {
          message.details = detailsRes.value;
        }
      }
    }

    return { messages: event.messages };
  });

  // 5. secrets_request tool
  const secretsRequestTool = {
    name: "secrets_request",
    label: "Secrets Request",
    loadMode: "essential" as const,
    description:
      "Request an external secret or credential by label via the unified web app. Opens an inline encrypted password card directly inside the web chat (5-minute expiry, age-encrypted, zero plaintext in chat). Also manageable from the Bóveda de Secretos drawer.",
    parameters: {
      type: "object",
      properties: {
        label: {
          type: "string",
          description:
            "Descriptive label for the requested secret (e.g., 'jira_api_token', 'pims_rotation_password')",
        },
        scope: {
          type: "string",
          description: "Optional scope boundary for the secret (default: 'global')",
        },
      },
      required: ["label"],
    },
    async execute(_toolCallId: string, params: { label: string; scope?: string }) {
      const baseUrl = getWebInternalBaseUrl();
      const resp = await fetch(`${baseUrl}/internal/secrets/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          label: params.label,
          ...(params.scope ? { scope: params.scope } : {}),
        }),
      });
      if (!resp.ok) {
        const body = await resp.text();
        throw new Error(`web app /internal/secrets/request failed (${resp.status}): ${body}`);
      }
      const data = (await resp.json()) as Record<string, unknown>;
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    },
  };

  // 6. secrets_poll tool (supports optional wait=true long-poll)
  const secretsPollTool = {
    name: "secrets_poll",
    label: "Secrets Poll",
    loadMode: "essential" as const,
    description:
      "Poll the unified web app (/internal/secrets/poll) for an age-encrypted credential submitted via the inline encrypted password card or Bóveda de Secretos. Returns an opaque handle (secret:<name>@v<version>), NEVER the plaintext value. Pass wait=true to long-poll until submitted or expired.",
    parameters: {
      type: "object",
      properties: {
        handle: {
          type: "string",
          description: "Token, pollHandle, or secret handle returned by secrets_request",
        },
        wait: {
          type: "boolean",
          description:
            "When true, passes ?wait=true so the server waits until status becomes 'submitted', 'expired', or timeout elapses.",
        },
        timeout: {
          type: "number",
          description:
            "Optional timeout in seconds when wait=true (capped at 300 seconds).",
        },
      },
      required: ["handle"],
    },
    async execute(
      _toolCallId: string,
      params: { handle: string; wait?: boolean; timeout?: number }
    ) {
      const baseUrl = getWebInternalBaseUrl();
      const pollUrl = new URL(
        `/internal/secrets/poll/${encodeURIComponent(params.handle)}`,
        baseUrl
      );
      if (params.wait === true) {
        pollUrl.searchParams.set("wait", "true");
        if (
          typeof params.timeout === "number" &&
          Number.isFinite(params.timeout) &&
          params.timeout > 0
        ) {
          const capped = Math.min(Math.floor(params.timeout), SECRETS_POLL_MAX_TIMEOUT_SEC);
          pollUrl.searchParams.set("timeout", String(capped));
        }
      }

      const resp = await fetch(pollUrl.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });
      if (!resp.ok) {
        const body = await resp.text();
        throw new Error(`web app /internal/secrets/poll failed (${resp.status}): ${body}`);
      }
      const data = (await resp.json()) as Record<string, unknown>;
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    },
  };

  if (typeof pi.registerTool !== "function") {
    const err = new Error("intro extension requires pi.registerTool to register secrets tools");
    logStructuredError("intro_register_tool_missing", err);
    throw err;
  }

  try {
    pi.registerTool(secretsRequestTool);
    pi.registerTool(secretsPollTool);
  } catch (err: unknown) {
    logStructuredError("intro_tool_registration_failed", err);
    throw err;
  }
}
