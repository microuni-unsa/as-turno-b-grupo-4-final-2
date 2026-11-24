import { afterEach, describe, expect, test } from "bun:test";
import { MailConfigError, MailConnectorClient } from "./client";

const ENV_KEYS = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_SECURE",
  "SMTP_FROM",
  "SMTP_USERNAME",
  "SMTP_PASSWORD",
  "MAIL_DRAFTS_PATH",
] as const;

const savedEnv = new Map<string, string | undefined>();

function setEnv(vars: Record<string, string>): void {
  for (const k of ENV_KEYS) {
    if (!savedEnv.has(k)) savedEnv.set(k, process.env[k]);
    delete process.env[k];
  }
  for (const [k, v] of Object.entries(vars)) process.env[k] = v;
}

afterEach(() => {
  for (const k of ENV_KEYS) {
    const v = savedEnv.get(k);
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  savedEnv.clear();
});

function priv(c: MailConnectorClient, field: string): unknown {
  return (c as unknown as Record<string, unknown>)[field];
}

describe("MailConnectorClient env resolution (blank-tolerant)", () => {
  test("empty SMTP_FROM falls through to SMTP_USERNAME", () => {
    setEnv({ SMTP_FROM: "", SMTP_USERNAME: "dpo@unsa.edu.pe", SMTP_PASSWORD: "x" });
    const c = new MailConnectorClient();
    expect(priv(c, "fromAddress")).toBe("dpo@unsa.edu.pe");
  });

  test("empty SMTP_HOST falls back to default (twin of the FROM bug)", () => {
    setEnv({ SMTP_HOST: "", SMTP_USERNAME: "dpo@unsa.edu.pe", SMTP_PASSWORD: "x" });
    const c = new MailConnectorClient();
    expect(priv(c, "smtpHost")).toBe("smtp.gmail.com");
  });

  test("empty SMTP_PORT/SECURE fall back to defaults", () => {
    setEnv({ SMTP_PORT: "", SMTP_SECURE: "", SMTP_USERNAME: "dpo@unsa.edu.pe" });
    const c = new MailConnectorClient();
    expect(priv(c, "smtpPort")).toBe(587);
    expect(priv(c, "smtpSecure")).toBe(false);
  });

  test("whitespace-only values count as unset", () => {
    setEnv({ SMTP_FROM: "   ", SMTP_USERNAME: "  dpo@unsa.edu.pe  " });
    const c = new MailConnectorClient();
    expect(priv(c, "fromAddress")).toBe("dpo@unsa.edu.pe");
  });

  test("explicit config wins over env", () => {
    setEnv({ SMTP_FROM: "env@unsa.edu.pe", SMTP_USERNAME: "user@unsa.edu.pe" });
    const c = new MailConnectorClient({ fromAddress: "explicit@unsa.edu.pe" });
    expect(priv(c, "fromAddress")).toBe("explicit@unsa.edu.pe");
  });

  test("explicit empty config string counts as unset", () => {
    setEnv({ SMTP_USERNAME: "user@unsa.edu.pe" });
    const c = new MailConnectorClient({ fromAddress: "" });
    expect(priv(c, "fromAddress")).toBe("user@unsa.edu.pe");
  });

  test("missing sender everywhere still throws", () => {
    setEnv({});
    expect(() => new MailConnectorClient()).toThrow(MailConfigError);
  });

  test("invalid port still throws with offending value", () => {
    setEnv({ SMTP_PORT: "abc", SMTP_USERNAME: "dpo@unsa.edu.pe" });
    expect(() => new MailConnectorClient()).toThrow(/Invalid SMTP_PORT: abc/);
  });

  test("port 465 defaults secure=true", () => {
    setEnv({ SMTP_PORT: "465", SMTP_USERNAME: "dpo@unsa.edu.pe" });
    const c = new MailConnectorClient();
    expect(priv(c, "smtpSecure")).toBe(true);
  });

  test("malformed authHandle still throws", () => {
    setEnv({ SMTP_USERNAME: "dpo@unsa.edu.pe" });
    expect(() => new MailConnectorClient({ authHandle: "plain-token" })).toThrow(
      /authHandle must be formatted/,
    );
  });

  test("empty authHandle counts as unset", () => {
    setEnv({ SMTP_USERNAME: "dpo@unsa.edu.pe" });
    const c = new MailConnectorClient({ authHandle: "" });
    expect(priv(c, "authHandle")).toBeUndefined();
  });
});
