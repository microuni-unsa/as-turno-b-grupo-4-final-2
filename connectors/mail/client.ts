/**
 * Mail Dispatch Connector Client (Real Gmail SMTP via Nodemailer).
 * Implements SMTP dispatch and strict summons delivery workflow:
 * - Draft creation (persisted on disk) -> Human preview -> Explicit "envíalo" confirmation -> Real SMTP Dispatch.
 * - Credentials resolved from SecretsStore handle OR in-process env vars (SMTP_USERNAME, SMTP_PASSWORD).
 * - Zero secrets exposed to logs, transcripts, or stdout.
 */

import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";
import {
  DEFAULT_MAIL_DRAFTS_PATH,
  DEFAULT_SMTP_HOST,
  DEFAULT_SMTP_PORT,
  SUMMONS_DISPATCH_CONFIRMATION_PHRASE,
} from "../runtime/constants";
import { SecretsStore } from "../runtime/secrets";

// ============================================================================
// Types & Interfaces
// ============================================================================

export type SeverityRAG = "red" | "amber" | "green";

export interface MailConnectorConfig {
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  fromAddress?: string;
  authHandle?: string; // Optional secret:<name>@<v> when using SecretsStore
  draftsFilePath?: string;
  timeoutMs?: number;
}

export interface CreateDraftSummonsInput {
  findingId: string;
  nonConformityTitle: string;
  severity: SeverityRAG;
  recipientName: string;
  recipientEmail: string;
  deadlineDate: string;
  evidenceCitation: string; // pims:..., audit:..., incident:..., or "Sin evidencia..."
  correctiveActionSummary: string;
}

export interface DraftSummonsRecord {
  draftId: string;
  findingId: string;
  nonConformityTitle: string;
  severity: SeverityRAG;
  recipientName: string;
  recipientEmail: string;
  deadlineDate: string;
  evidenceCitation: string;
  subject: string;
  body: string;
  status: "draft" | "dispatched" | "cancelled";
  createdAt: string;
  dispatchedAt: string | null;
}

export interface DispatchSummonsResult {
  draftId: string;
  messageId: string;
  recipientEmail: string;
  dispatchedAt: string;
  status: "dispatched";
}

export interface SendGenericMailInput {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
}

export interface SendGenericMailResult {
  messageId: string;
  to: string;
  sentAt: string;
}

// ============================================================================
// Typed Errors
// ============================================================================

export class MailConnectorError extends Error {
  public readonly code: string;

  constructor(message: string, code: string = "MAIL_CONNECTOR_ERROR") {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class MailConfigError extends MailConnectorError {
  constructor(reason: string) {
    super(`Mail configuration error: ${reason}`, "MAIL_CONFIG_ERROR");
  }
}

export class MailValidationError extends MailConnectorError {
  constructor(reason: string) {
    super(`Validation failed: ${reason}`, "MAIL_VALIDATION_ERROR");
  }
}

export class MailDraftNotFoundError extends MailConnectorError {
  constructor(draftId: string) {
    super(`Summons draft '${draftId}' not found in registry`, "MAIL_DRAFT_NOT_FOUND");
  }
}

export class SummonsApprovalRequiredError extends MailConnectorError {
  constructor(givenConfirmation: string) {
    super(
      `Summons dispatch rejected: Explicit confirmation phrase '${SUMMONS_DISPATCH_CONFIRMATION_PHRASE}' is required before dispatching. Received: '${givenConfirmation}'. Draft remains in 'draft' state.`,
      "SUMMONS_APPROVAL_REQUIRED",
    );
  }
}

export class MailDeliveryError extends MailConnectorError {
  constructor(recipient: string, reason: string) {
    super(`Failed to dispatch email to '${recipient}': ${reason}`, "MAIL_DELIVERY_ERROR");
  }
}

// ============================================================================
// Mail Connector Implementation
// ============================================================================

export class MailConnectorClient {
  private readonly smtpHost: string;
  private readonly smtpPort: number;
  private readonly smtpSecure: boolean;
  private readonly fromAddress: string;
  private readonly authHandle?: string;
  private readonly draftsFilePath: string;
  private readonly timeoutMs: number;
  private readonly secretsStore: SecretsStore;

  constructor(config: MailConnectorConfig = {}) {
    const rawHost = config.smtpHost ?? process.env.SMTP_HOST ?? DEFAULT_SMTP_HOST;
    if (!rawHost.trim()) {
      throw new MailConfigError("SMTP_HOST must be non-empty");
    }

    const rawPort =
      config.smtpPort ??
      (process.env.SMTP_PORT !== undefined && process.env.SMTP_PORT.trim() !== ""
        ? Number(process.env.SMTP_PORT)
        : DEFAULT_SMTP_PORT);
    if (!Number.isInteger(rawPort) || rawPort <= 0 || rawPort > 65535) {
      throw new MailConfigError(`Invalid SMTP_PORT: ${String(rawPort)}`);
    }

    const rawSecure =
      config.smtpSecure ??
      (process.env.SMTP_SECURE !== undefined
        ? process.env.SMTP_SECURE.trim().toLowerCase() === "true"
        : rawPort === 465);

    const resolvedFrom =
      config.fromAddress ?? process.env.SMTP_FROM ?? process.env.SMTP_USERNAME ?? "";
    if (!resolvedFrom || !resolvedFrom.includes("@")) {
      throw new MailConfigError(
        "Valid sender address is required (set fromAddress config, SMTP_FROM, or SMTP_USERNAME).",
      );
    }

    if (config.authHandle !== undefined && !config.authHandle.startsWith("secret:")) {
      throw new MailConfigError("authHandle must be formatted as secret:<name>@<v>");
    }

    this.smtpHost = rawHost.trim();
    this.smtpPort = rawPort;
    this.smtpSecure = rawSecure;
    this.fromAddress = resolvedFrom.trim();
    this.authHandle = config.authHandle;
    this.draftsFilePath =
      config.draftsFilePath ?? process.env.MAIL_DRAFTS_PATH ?? DEFAULT_MAIL_DRAFTS_PATH;
    this.timeoutMs = config.timeoutMs ?? 15000;
    this.secretsStore = SecretsStore.getInstance();
  }

  private loadDrafts(): Record<string, DraftSummonsRecord> {
    if (!existsSync(this.draftsFilePath)) {
      return {};
    }
    const raw = readFileSync(this.draftsFilePath, "utf8");
    if (raw.trim() === "") {
      return {};
    }
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new MailConfigError(`Corrupt drafts store at '${this.draftsFilePath}'`);
    }
    return parsed as Record<string, DraftSummonsRecord>;
  }

  private saveDrafts(drafts: Record<string, DraftSummonsRecord>): void {
    const dir = path.dirname(this.draftsFilePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(this.draftsFilePath, JSON.stringify(drafts, null, 2), {
      encoding: "utf8",
      mode: 0o600,
    });
  }

  private async resolveSmtpAuth(): Promise<{ user: string; pass: string }> {
    if (this.authHandle && this.secretsStore.hasHandle(this.authHandle)) {
      return await this.secretsStore.executeWithSecret(this.authHandle, async (rawSecret) => {
        if (rawSecret.trim().startsWith("{")) {
          const parsed = JSON.parse(rawSecret) as {
            user?: string;
            username?: string;
            pass?: string;
            password?: string;
          };
          const user = parsed.user ?? parsed.username ?? process.env.SMTP_USERNAME ?? this.fromAddress;
          const pass = parsed.pass ?? parsed.password ?? "";
          if (!user || !pass) {
            throw new MailConfigError("Secret JSON missing user/pass fields for SMTP");
          }
          return { user, pass };
        }
        const envUser = process.env.SMTP_USERNAME ?? this.fromAddress;
        if (!envUser || !rawSecret) {
          throw new MailConfigError("Missing SMTP username alongside secret handle password");
        }
        return { user: envUser, pass: rawSecret };
      });
    }

    const user = process.env.SMTP_USERNAME?.trim() ?? "";
    const pass = process.env.SMTP_PASSWORD ?? "";
    if (!user || !pass) {
      throw new MailConfigError(
        "Missing SMTP_USERNAME / SMTP_PASSWORD in environment (and no active authHandle in SecretsStore).",
      );
    }
    return { user, pass };
  }

  private async sendViaSmtp(options: {
    to: string;
    subject: string;
    body: string;
    isHtml?: boolean;
  }): Promise<{ messageId: string }> {
    const auth = await this.resolveSmtpAuth();
    const transporter = nodemailer.createTransport({
      host: this.smtpHost,
      port: this.smtpPort,
      secure: this.smtpSecure,
      auth: {
        user: auth.user,
        pass: auth.pass,
      },
      connectionTimeout: this.timeoutMs,
      greetingTimeout: this.timeoutMs,
      socketTimeout: this.timeoutMs,
    });

    try {
      const info = await transporter.sendMail({
        from: this.fromAddress,
        to: options.to,
        subject: options.subject,
        text: options.isHtml ? undefined : options.body,
        html: options.isHtml ? options.body : undefined,
      });
      if (!info.messageId) {
        throw new MailDeliveryError(options.to, "SMTP server did not return a messageId");
      }
      return { messageId: info.messageId };
    } catch (err) {
      if (err instanceof MailDeliveryError) {
        throw err;
      }
      const msg = err instanceof Error ? err.message : String(err);
      throw new MailDeliveryError(options.to, msg);
    }
  }

  private formatSummonsContent(input: CreateDraftSummonsInput): {
    subject: string;
    body: string;
  } {
    const severityBadge = input.severity.toUpperCase();
    const subject = `[UNSA-PIMS / G4] Notificación de Hallazgo / NC: ${input.findingId} [${severityBadge}]`;

    const body = [
      `Estimado(a) ${input.recipientName},`,
      "",
      `Por medio de la presente se le notifica formalmente la asignación y seguimiento del siguiente hallazgo / No Conformidad (NC) registrado en el Sistema de Gestión de Privacidad de la Información (SGPI) de la UNSA:`,
      "",
      `  - Identificador de Hallazgo: ${input.findingId}`,
      `  - Título de la No Conformidad: ${input.nonConformityTitle}`,
      `  - Criticidad: ${severityBadge} (Semáforo RAG)`,
      `  - Fecha Límite de Atención: ${input.deadlineDate}`,
      `  - Evidencia Normativa / Cita: ${input.evidenceCitation}`,
      "",
      `Plan de Acción Correctiva Requerido:`,
      `${input.correctiveActionSummary}`,
      "",
      `Por favor remitir la evidencia de contención y cierre antes de la fecha límite estipulada.`,
      "",
      `Atentamente,`,
      `Equipo Auditor SGPI - Grupo 4`,
      `Universidad Nacional de San Agustín de Arequipa`,
    ].join("\n");

    return { subject, body };
  }

  private isValidCitation(citation: string): boolean {
    const c = citation.trim();
    return (
      c.startsWith("pims:") ||
      c.startsWith("audit:") ||
      c.startsWith("incident:") ||
      c.toLowerCase().startsWith("sin evidencia")
    );
  }

  /**
   * Phase 1 of Summons Workflow:
   * Validates parameters, formats summons, and persists a DRAFT to disk (never dispatches).
   */
  public async createDraftSummons(
    input: CreateDraftSummonsInput,
  ): Promise<DraftSummonsRecord> {
    if (!input.findingId || input.findingId.trim().length === 0) {
      throw new MailValidationError("findingId is required");
    }
    if (!input.nonConformityTitle || input.nonConformityTitle.trim().length === 0) {
      throw new MailValidationError("nonConformityTitle is required");
    }
    if (!input.recipientEmail || !input.recipientEmail.includes("@")) {
      throw new MailValidationError("recipientEmail must be a valid email");
    }
    if (!input.deadlineDate) {
      throw new MailValidationError("deadlineDate is required");
    }
    if (!input.evidenceCitation || !this.isValidCitation(input.evidenceCitation)) {
      throw new MailValidationError(
        `evidenceCitation must begin with 'pims:', 'audit:', 'incident:', or 'Sin evidencia...' (received: '${input.evidenceCitation}')`,
      );
    }

    switch (input.severity) {
      case "red":
      case "amber":
      case "green":
        break;
      default: {
        const exhaustiveCheck: never = input.severity;
        throw new MailValidationError(`Invalid RAG severity: ${String(exhaustiveCheck)}`);
      }
    }

    const { subject, body } = this.formatSummonsContent(input);
    const draftId = `draft_${randomUUID().replace(/-/g, "").slice(0, 12)}`;

    const draftRecord: DraftSummonsRecord = {
      draftId,
      findingId: input.findingId,
      nonConformityTitle: input.nonConformityTitle,
      severity: input.severity,
      recipientName: input.recipientName,
      recipientEmail: input.recipientEmail,
      deadlineDate: input.deadlineDate,
      evidenceCitation: input.evidenceCitation,
      subject,
      body,
      status: "draft",
      createdAt: new Date().toISOString(),
      dispatchedAt: null,
    };

    const drafts = this.loadDrafts();
    drafts[draftId] = draftRecord;
    this.saveDrafts(drafts);

    return draftRecord;
  }

  /**
   * Retrieves draft details from persisted store.
   */
  public getDraft(draftId: string): DraftSummonsRecord {
    const drafts = this.loadDrafts();
    const draft = drafts[draftId];
    if (!draft) {
      throw new MailDraftNotFoundError(draftId);
    }
    return draft;
  }

  /**
   * Lists all saved summons drafts.
   */
  public listDrafts(): DraftSummonsRecord[] {
    return Object.values(this.loadDrafts());
  }

  /**
   * Phase 2 of Summons Workflow:
   * Strictly requires the exact confirmation phrase "envíalo" before dispatching real SMTP mail.
   */
  public async dispatchSummons(
    draftId: string,
    confirmationPhrase: string,
  ): Promise<DispatchSummonsResult> {
    const drafts = this.loadDrafts();
    const draft = drafts[draftId];
    if (!draft) {
      throw new MailDraftNotFoundError(draftId);
    }

    if (draft.status === "dispatched") {
      throw new MailDeliveryError(
        draft.recipientEmail,
        `Draft '${draftId}' has already been dispatched.`,
      );
    }
    if (draft.status === "cancelled") {
      throw new MailDeliveryError(
        draft.recipientEmail,
        `Draft '${draftId}' was previously cancelled.`,
      );
    }

    const normalizedConfirmation = confirmationPhrase ? confirmationPhrase.trim().toLowerCase() : "";
    if (normalizedConfirmation !== SUMMONS_DISPATCH_CONFIRMATION_PHRASE) {
      throw new SummonsApprovalRequiredError(confirmationPhrase);
    }

    const { messageId } = await this.sendViaSmtp({
      to: draft.recipientEmail,
      subject: draft.subject,
      body: draft.body,
    });

    const dispatchedAt = new Date().toISOString();
    draft.status = "dispatched";
    draft.dispatchedAt = dispatchedAt;
    drafts[draftId] = draft;
    this.saveDrafts(drafts);

    return {
      draftId: draft.draftId,
      messageId,
      recipientEmail: draft.recipientEmail,
      dispatchedAt,
      status: "dispatched",
    };
  }

  /**
   * General real SMTP mail dispatch (reports, alerts, notifications).
   */
  public async sendGenericMail(input: SendGenericMailInput): Promise<SendGenericMailResult> {
    if (!input.to || !input.to.includes("@")) {
      throw new MailValidationError("Invalid destination email address");
    }
    if (!input.subject || input.subject.trim().length === 0) {
      throw new MailValidationError("Email subject cannot be empty");
    }

    const { messageId } = await this.sendViaSmtp({
      to: input.to,
      subject: input.subject,
      body: input.body,
      isHtml: input.isHtml,
    });

    return {
      messageId,
      to: input.to,
      sentAt: new Date().toISOString(),
    };
  }
}
