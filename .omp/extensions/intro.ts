import * as fs from "node:fs";
import * as path from "node:path";

interface MessageContent {
  type?: string;
  text?: string;
}

interface ChatMessage {
  role?: string;
  content?: string | MessageContent[];
}

export default function (pi: any) {
  const BANNER_TEXT = `UNSA PIMS — OPERADOR AGÉNTICO DEL SGPI (GRUPO 4)
ISO/IEC 27701:2025 — Universidad Nacional de San Agustín

Capacidades:
• Documentos y versiones: búsqueda, comparación, trazabilidad y citación pims:.
• Incidentes, riesgos y capacitación: registro, severidad, tratamiento y evidencias.
• Auditorías y mejora: hallazgos, NC, acciones correctivas y estado semafórico.
• Consultas generales del SGPI: alcance, política, objetivos, control documental.

Comandos iniciales útiles:
• /new              Iniciar una nueva conversación limpia
• /resume           Retomar una sesión anterior
• mas ayuda         Mostrar la guía operativa completa`.trim();

  // 1. Session start banner
  pi.on("session_start", async (_event: any, _ctx: any) => {
    try {
      if (typeof pi.sendMessage === "function") {
        await pi.sendMessage(
          { content: BANNER_TEXT, display: true },
          { triggerTurn: false }
        );
      }
    } catch {
      // Non-blocking fallback
    }
  });

  // 2. On 'mas ayuda' serve USAGE.md
  pi.on("input", async (event: any, _ctx: any) => {
    const rawText = typeof event === "string" ? event : event?.text;
    if (typeof rawText === "string") {
      const normalized = rawText.trim().toLowerCase();
      if (
        normalized === "mas ayuda" ||
        normalized === "más ayuda" ||
        normalized === "'mas ayuda'" ||
        normalized === "\"mas ayuda\""
      ) {
        try {
          const usagePath = path.resolve(process.cwd(), ".omp", "USAGE.md");
          let usageContent = "";
          if (fs.existsSync(usagePath)) {
            usageContent = fs.readFileSync(usagePath, "utf-8");
          } else {
            usageContent = "Manual de uso no disponible en .omp/USAGE.md";
          }

          if (typeof pi.sendMessage === "function") {
            await pi.sendMessage(
              { content: usageContent, display: true },
              { triggerTurn: false }
            );
          }
          return { handled: true };
        } catch {
          // Non-blocking fallback
        }
      }
    }
  });

  // 3. Host secrets.request / secrets_request tool
  const secretsRequestTool = {
    name: "secrets_request",
    label: "Secrets Request",
    description: "Request an external secret or credential by label via pimsai-secrets-sidecar. Generates a one-time URL (https://secrets.pimsai.mistercricro8.top:444/s/<token>) with 5-minute expiry. Never handles plaintext values.",
    parameters: {
      type: "object",
      properties: {
        label: {
          type: "string",
          description: "Descriptive label for the requested secret (e.g., 'Jira Token', 'PIMS Rotation Password')"
        }
      },
      required: ["label"]
    },
    async execute(_toolCallId: string, params: { label: string }) {
      const resp = await fetch("http://pimsai-secrets-sidecar:3000/api/secrets/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: params.label })
      });
      if (!resp.ok) {
        const body = await resp.text();
        throw new Error(`secrets-sidecar /api/secrets/request failed (${resp.status}): ${body}`);
      }
      const data = await resp.json() as Record<string, unknown>;
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    }
  };

  // 4. Host secrets.poll / secrets_poll tool
  const secretsPollTool = {
    name: "secrets_poll",
    label: "Secrets Poll",
    description: "Poll pimsai-secrets-sidecar for an ingested credential handle. Returns an opaque handle (secret:<name>@<version>), NEVER the plaintext value.",
    parameters: {
      type: "object",
      properties: {
        handle: {
          type: "string",
          description: "Token or handle returned by secrets_request"
        }
      },
      required: ["handle"]
    },
    async execute(_toolCallId: string, params: { handle: string }) {
      const resp = await fetch(`http://pimsai-secrets-sidecar:3000/api/secrets/poll/${encodeURIComponent(params.handle)}`);
      if (!resp.ok) {
        const body = await resp.text();
        throw new Error(`secrets-sidecar /api/secrets/poll failed (${resp.status}): ${body}`);
      }
      const data = await resp.json() as Record<string, unknown>;
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2)
          }
        ]
      };
    }
  };

  // Register tools under both conventions (underscore and dotted)
  if (typeof pi.registerTool === "function") {
    try {
      pi.registerTool(secretsRequestTool);
      pi.registerTool(secretsPollTool);
      pi.registerTool({ ...secretsRequestTool, name: "secrets.request" });
      pi.registerTool({ ...secretsPollTool, name: "secrets.poll" });
    } catch {
      // Handle naming restriction or duplicate tool registration quietly
    }
  }

  // 5. Transcript redaction (never leak handle values or raw credentials)
  pi.on("context", async (event: any, _ctx: any) => {
    if (!event || !Array.isArray(event.messages)) return;

    const redactString = (text: string): string => {
      if (typeof text !== "string") return text;
      return text
        .replace(/eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g, "[REDACTED_JWT_TOKEN]")
        .replace(/(bearer\s+)[a-zA-Z0-9_\-\.]{20,}/gi, "$1[REDACTED_TOKEN]")
        .replace(/(password|passwd|secret_value|api_key|token)\s*[:=]\s*["']?([a-zA-Z0-9_\-\.\/]{8,})["']?/gi, "$1: [REDACTED_SECRET]");
    };

    for (const message of event.messages as ChatMessage[]) {
      if (typeof message.content === "string") {
        message.content = redactString(message.content);
      } else if (Array.isArray(message.content)) {
        for (const part of message.content) {
          if (part && typeof part.text === "string") {
            part.text = redactString(part.text);
          }
        }
      }
    }

    return { messages: event.messages };
  });
}
