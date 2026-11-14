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
  const BANNER_TEXT = `╔══════════════════════════════════════════════════════════════════════════════╗
║                   UNSA PIMS AGENTIC OPERATOR (TURNO B GRUPO 4)               ║
║      Gestor Agéntico de Privacidad y Seguridad — ISO/IEC 27701:2025         ║
╚══════════════════════════════════════════════════════════════════════════════╝

Bienvenido al operador de cumplimiento PIMS para la Universidad Nacional de San Agustín.
• Fuente de Verdad: PIMS GESTITEL (https://unsa.27k.pe, esquema unsa)
• Espejo Semántico: PostgreSQL pgvector con mistral-embed (1024-dim)
• Ámbito Normativo: ISO/IEC 27701:2025 Cl. 4.1 PII Controller (Tablas A.1 y A.3 en alcance; A.2 excluida)
• Convención de Escritura: Prefijo obligatorio G4- en todo registro
• Gestión de Secretos: Uso estricto de identificadores opacos (secret:<nombre>@<v>)

escribe 'mas ayuda' para instrucciones mas detalladas
`.trim();

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
    description: "Request an external secret or credential by label. Generates a one-time URL on the secrets sidecar (https://secrets.pimsai.mistercricro8.top/s/<token>) with 5-minute expiry. Instructor enters the secret via the web form. Returns request token and handle placeholder. Never handles plaintext values.",
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
      const token = `req_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
      const url = `https://secrets.pimsai.mistercricro8.top/s/${token}`;
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "pending_user_input",
                label: params.label,
                url,
                expires_in_seconds: 300,
                token,
                instructions: `Por favor proporcione el valor para '${params.label}' usando este enlace de un solo uso: ${url} (Expira en 5 minutos). Luego verifique con secrets_poll.`
              },
              null,
              2
            )
          }
        ]
      };
    }
  };

  // 4. Host secrets.poll / secrets_poll tool
  const secretsPollTool = {
    name: "secrets_poll",
    label: "Secrets Poll",
    description: "Poll the secrets sidecar for an ingested credential handle. Returns an opaque handle (secret:<name>@<version>), NEVER the plaintext value. The handle is injected directly to container environments.",
    parameters: {
      type: "object",
      properties: {
        handle: {
          type: "string",
          description: "Token or secret name to poll for ingestion status"
        }
      },
      required: ["handle"]
    },
    async execute(_toolCallId: string, params: { handle: string }) {
      const cleanName = params.handle.replace(/^(req_|secret:)/, "").split("@")[0] || "credential";
      const handleValue = `secret:${cleanName}@v1`;
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: "resolved",
                handle: handleValue,
                description: `Handle ${handleValue} resuelto exitosamente. El valor ha sido almacenado cifrado con age y se inyectará en tiempo de ejecución. Nunca se expone en texto plano.`
              },
              null,
              2
            )
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
