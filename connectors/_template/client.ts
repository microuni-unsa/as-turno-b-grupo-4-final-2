/**
 * Template Connector Client Skeleton (REST + Webhook).
 * Canonical live-build target: Evolution API / WhatsApp integration.
 * Follows the connector convention (SPEC 8.2 & 4.1):
 * - Constructor takes resolved config or secret handle.
 * - Methods per endpoint with typed inputs and outputs.
 * - Zero secret values exposed to logs or chat.
 * - Deterministic error hierarchy and exhaustive branching.
 */

import { PIMSAI_BASE_DOMAIN, PIMSAI_PUBLIC_PORT } from "../runtime/constants";
import { SecretsStore } from "../runtime/secrets";

// ============================================================================
// Configuration & Types
// ============================================================================

export interface TemplateConnectorConfig {
  baseUrl: string;
  authHandle: string;
  webhookCallbackSlug?: string;
  timeoutMs?: number;
}

export interface SendMessageRequest {
  recipientId: string;
  messageType: "text" | "template" | "media";
  content: string;
  mediaUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface SendMessageResponse {
  messageId: string;
  status: "queued" | "sent" | "delivered" | "failed";
  timestamp: string;
  recipientId: string;
}

export interface WebhookRegistrationRequest {
  callbackSlug: string;
  subscribedEvents: string[];
}

export interface WebhookRegistrationResponse {
  webhookId: string;
  callbackUrl: string;
  active: boolean;
  registeredAt: string;
}

export interface IncomingWebhookEvent {
  eventId: string;
  eventType: "message_received" | "status_updated" | "connection_changed";
  senderId: string;
  payload: Record<string, unknown>;
  receivedAt: string;
}

export interface HealthCheckResult {
  ok: boolean;
  service: string;
  latencyMs: number;
  checkedAt: string;
}

// ============================================================================
// Typed Error Hierarchy
// ============================================================================

export class TemplateConnectorError extends Error {
  public readonly code: string;

  constructor(message: string, code: string = "TEMPLATE_CONNECTOR_ERROR") {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class TemplateValidationError extends TemplateConnectorError {
  constructor(reason: string) {
    super(`Validation failed: ${reason}`, "VALIDATION_ERROR");
  }
}

export class TemplateAuthError extends TemplateConnectorError {
  constructor(reason: string) {
    super(`Authentication failed: ${reason}`, "AUTH_ERROR");
  }
}

export class TemplateApiError extends TemplateConnectorError {
  public readonly statusCode: number;
  public readonly endpoint: string;

  constructor(endpoint: string, statusCode: number, message: string) {
    super(
      `Endpoint '${endpoint}' returned HTTP ${statusCode}: ${message}`,
      "API_ERROR"
    );
    this.statusCode = statusCode;
    this.endpoint = endpoint;
  }
}

// ============================================================================
// Connector Client Implementation
// ============================================================================

export class TemplateConnectorClient {
  private readonly baseUrl: string;
  private readonly authHandle: string;
  private readonly webhookCallbackSlug?: string;
  private readonly timeoutMs: number;
  private readonly secretsStore: SecretsStore;

  constructor(config: TemplateConnectorConfig) {
    if (!config.baseUrl || typeof config.baseUrl !== "string") {
      throw new TemplateValidationError("baseUrl must be a valid non-empty string URL");
    }
    if (!config.authHandle || typeof config.authHandle !== "string") {
      throw new TemplateValidationError("authHandle must be specified (format: secret:<name>@<v>)");
    }

    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.authHandle = config.authHandle;
    this.webhookCallbackSlug = config.webhookCallbackSlug;
    this.timeoutMs = config.timeoutMs ?? 15000;
    this.secretsStore = SecretsStore.getInstance();
  }

  private async requestJson<T>(
    endpointPath: string,
    init: RequestInit,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpointPath}`;
    const authHeaders = this.secretsStore.resolveAuthHeader(this.authHandle, "Bearer");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...authHeaders,
          ...(init.headers as Record<string, string> | undefined),
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new TemplateApiError(endpointPath, response.status, errBody);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Read-only probe method used by the self-heal loop (SPEC 8.3).
   * Validates endpoint connectivity without mutating production state.
   */
  public async healthCheck(): Promise<HealthCheckResult> {
    const start = Date.now();
    const endpoint = "/health";
    await this.requestJson<Record<string, unknown>>(endpoint, { method: "GET" });
    return {
      ok: true,
      service: "template-connector",
      latencyMs: Date.now() - start,
      checkedAt: new Date().toISOString(),
    };
  }

  /**
   * Example REST dispatch method: sends a real HTTP POST to the external service.
   */
  public async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    if (!request.recipientId || request.recipientId.trim().length === 0) {
      throw new TemplateValidationError("recipientId cannot be empty");
    }
    if (!request.content || request.content.trim().length === 0) {
      throw new TemplateValidationError("content cannot be empty");
    }

    switch (request.messageType) {
      case "text":
        break;
      case "template":
        if (!request.metadata || Object.keys(request.metadata).length === 0) {
          throw new TemplateValidationError("Template messages require metadata parameters");
        }
        break;
      case "media":
        if (!request.mediaUrl || !request.mediaUrl.startsWith("http")) {
          throw new TemplateValidationError("Media messages require a valid mediaUrl");
        }
        break;
      default: {
        const exhaustiveCheck: never = request.messageType;
        throw new TemplateValidationError(`Unsupported messageType: ${String(exhaustiveCheck)}`);
      }
    }

    const data = await this.requestJson<SendMessageResponse>("/message/send", {
      method: "POST",
      body: JSON.stringify(request),
    });

    return {
      messageId: data.messageId,
      status: data.status,
      timestamp: data.timestamp ?? new Date().toISOString(),
      recipientId: data.recipientId ?? request.recipientId,
    };
  }

  /**
   * Registers a webhook callback with mandatory :444 port:
   * URL format: https://<slug>.pimsai.mistercricro8.top:444/webhook
   */
  public async registerWebhook(
    req: WebhookRegistrationRequest
  ): Promise<WebhookRegistrationResponse> {
    if (!req.callbackSlug || req.callbackSlug.trim().length === 0) {
      throw new TemplateValidationError("callbackSlug must be provided");
    }
    if (!req.subscribedEvents || req.subscribedEvents.length === 0) {
      throw new TemplateValidationError("subscribedEvents list cannot be empty");
    }

    const callbackUrl = `https://${req.callbackSlug}.${PIMSAI_BASE_DOMAIN}:${PIMSAI_PUBLIC_PORT}/webhook`;

    const data = await this.requestJson<WebhookRegistrationResponse>("/webhook/register", {
      method: "POST",
      body: JSON.stringify({
        callbackUrl,
        subscribedEvents: req.subscribedEvents,
      }),
    });

    return {
      webhookId: data.webhookId,
      callbackUrl: data.callbackUrl ?? callbackUrl,
      active: data.active,
      registeredAt: data.registeredAt ?? new Date().toISOString(),
    };
  }

  /**
   * Parses and validates incoming webhook payloads.
   */
  public parseIncomingWebhook(rawPayload: unknown): IncomingWebhookEvent {
    if (!rawPayload || typeof rawPayload !== "object") {
      throw new TemplateValidationError("Invalid webhook payload format: must be an object");
    }

    const payload = rawPayload as Record<string, unknown>;
    const eventType = payload["type"];
    const eventId = payload["id"];
    const sender = payload["sender"];

    if (typeof eventId !== "string" || !eventId) {
      throw new TemplateValidationError("Webhook payload missing 'id'");
    }
    if (typeof sender !== "string" || !sender) {
      throw new TemplateValidationError("Webhook payload missing 'sender'");
    }

    if (
      eventType !== "message_received" &&
      eventType !== "status_updated" &&
      eventType !== "connection_changed"
    ) {
      throw new TemplateValidationError(
        `Unrecognized webhook event type: ${String(eventType)}`
      );
    }

    return {
      eventId,
      eventType,
      senderId: sender,
      payload: (payload["data"] as Record<string, unknown>) ?? {},
      receivedAt: new Date().toISOString(),
    };
  }
}
