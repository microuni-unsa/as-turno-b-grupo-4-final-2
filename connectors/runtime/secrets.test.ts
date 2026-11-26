import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import introExtension, { redactSecrets } from "../../.omp/extensions/intro";
import {
  DEFAULT_SECRETS_STORE_PATH,
  WEB_APP_DOMAIN,
  WEB_INTERNAL_URL,
  SecretExpiredError,
  SecretHandleFormatError,
  SecretNotFoundError,
  SecretSecurityError,
  SecretsStore,
  formatSecretHandle,
  parseSecretHandle,
  resolveToDockerEnv as indexResolveToDockerEnv,
} from "./index";
import { resolveToDockerEnv } from "./secrets";

const tempDirs: string[] = [];
const savedEnv = new Map<string, string | undefined>();
const savedPath = process.env.PATH;

function makeTempDir(prefix: string): string {
  const dir = mkdtempSync(path.join(tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

function setEnv(key: string, value: string | undefined): void {
  if (!savedEnv.has(key)) {
    savedEnv.set(key, process.env[key]);
  }
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
}

function resolveAgeBinDir(): string | null {
  const direct = Bun.which("age");
  const directKeygen = Bun.which("age-keygen");
  if (direct && directKeygen) {
    return path.dirname(direct);
  }
  const nix = Bun.which("nix");
  if (!nix) {
    return null;
  }
  const res = Bun.spawnSync([nix, "build", "nixpkgs#age", "--no-link", "--print-out-paths"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  if (res.exitCode !== 0) {
    return null;
  }
  const outPath = Buffer.from(res.stdout).toString("utf8").trim();
  if (!outPath) {
    return null;
  }
  return path.join(outPath, "bin");
}

const ageBinDir = resolveAgeBinDir();

afterEach(() => {
  SecretsStore.resetInstance();
  process.env.PATH = savedPath;
  for (const [key, val] of savedEnv.entries()) {
    if (val === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = val;
    }
  }
  savedEnv.clear();
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("constants and exports", () => {
  test("centralized constants and named resolveToDockerEnv export exist on runtime index", () => {
    expect(WEB_APP_DOMAIN).toBe("demo.pimsai.mistercricro8.top");
    expect(WEB_INTERNAL_URL).toContain("http");
    expect(DEFAULT_SECRETS_STORE_PATH.length).toBeGreaterThan(0);
    expect(indexResolveToDockerEnv).toBe(resolveToDockerEnv);
  });
});

describe("parseSecretHandle & formatSecretHandle", () => {
  test("parses canonical @v<n> and unprefixed @<n> handles", () => {
    expect(parseSecretHandle("secret:db_token@v2")).toEqual({ name: "db_token", version: 2 });
    expect(parseSecretHandle("secret:jira_api@1")).toEqual({ name: "jira_api", version: 1 });
    expect(parseSecretHandle("secret:svc.prod-key_1@v12")).toEqual({
      name: "svc.prod-key_1",
      version: 12,
    });
  });

  test("rejects invalid secret handles and path traversal attempts", () => {
    const invalidHandles = [
      "",
      "secret:foo",
      "plain-token",
      "secret:foo@v0",
      "secret:foo@0",
      "secret:foo@v",
      "secret:@v1",
      "secret:..@v1",
      "secret:../etc/passwd@v1",
      "other:foo@v1",
    ];
    for (const invalid of invalidHandles) {
      expect(() => parseSecretHandle(invalid)).toThrow(SecretHandleFormatError);
    }
  });

  test("formats canonical secret:<name>@v<n> handles and rejects bad inputs", () => {
    expect(formatSecretHandle("jira", 1)).toBe("secret:jira@v1");
    expect(formatSecretHandle("  db_pass ", 3)).toBe("secret:db_pass@v3");
    expect(() => formatSecretHandle("", 1)).toThrow(SecretHandleFormatError);
    expect(() => formatSecretHandle("..", 1)).toThrow(SecretHandleFormatError);
    expect(() => formatSecretHandle("jira", 0)).toThrow(SecretHandleFormatError);
    expect(() => formatSecretHandle("jira", -2)).toThrow(SecretHandleFormatError);
  });
});

describe("SecretsStore real age decryption & failure semantics", () => {
  test("fails fast with SecretNotFoundError when ciphertext file does not exist", () => {
    const storeDir = makeTempDir("secrets-missing-");
    const store = new SecretsStore({ storePath: storeDir });
    expect(() => store.getDecryptedValue("secret:missing_secret@v1")).toThrow(SecretNotFoundError);
    expect(store.hasHandle("secret:missing_secret@v1")).toBe(false);
    expect(store.hasHandle("not-a-handle")).toBe(false);
  });

  test("fails fast with SecretSecurityError when identity key is missing", () => {
    const storeDir = makeTempDir("secrets-no-key-");
    const secretDir = path.join(storeDir, "secrets", "test_key");
    mkdirSync(secretDir, { recursive: true });
    writeFileSync(path.join(secretDir, "v1.age"), "dummy-ciphertext");
    setEnv("AGE_SECRET_KEY", undefined);

    const store = new SecretsStore({ storePath: storeDir });
    expect(() => store.getDecryptedValue("secret:test_key@v1")).toThrow(SecretSecurityError);
  });

  test("fails fast when explicit identityPath override is missing (even if AGE_SECRET_KEY is set)", () => {
    const storeDir = makeTempDir("secrets-bad-id-override-");
    const secretDir = path.join(storeDir, "secrets", "test_key");
    mkdirSync(secretDir, { recursive: true });
    writeFileSync(path.join(secretDir, "v1.age"), "dummy-ciphertext");
    setEnv("AGE_SECRET_KEY", "AGE-SECRET-KEY-1QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ");

    const store = new SecretsStore({
      storePath: storeDir,
      identityPath: path.join(storeDir, "nonexistent-identity.txt"),
    });
    expect(() => store.getDecryptedValue("secret:test_key@v1")).toThrow(SecretSecurityError);
  });

  test("real age encrypt/decrypt roundtrip, AGE_SECRET_KEY env support, and resolveToDockerEnv", async () => {
    if (!ageBinDir) {
      throw new Error("age CLI unavailable even via nix build nixpkgs#age");
    }
    process.env.PATH = `${ageBinDir}:${savedPath ?? ""}`;

    const storeDir = makeTempDir("secrets-real-age-");
    const keysDir = path.join(storeDir, "keys");
    const secretsDir = path.join(storeDir, "secrets", "test");
    mkdirSync(keysDir, { recursive: true });
    mkdirSync(secretsDir, { recursive: true });

    const identityPath = path.join(keysDir, "identity.txt");
    const ageKeygenExe = path.join(ageBinDir, "age-keygen");
    const ageExe = path.join(ageBinDir, "age");

    const keygenRes = Bun.spawnSync([ageKeygenExe, "-o", identityPath], {
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(keygenRes.exitCode).toBe(0);

    const recipientRes = Bun.spawnSync([ageKeygenExe, "-y", identityPath], {
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(recipientRes.exitCode).toBe(0);
    const recipient = Buffer.from(recipientRes.stdout).toString("utf8").trim();
    expect(recipient.startsWith("age1")).toBe(true);

    const rawSecret = "RealAgeSecretValue!#2026";
    const ciphertextPath = path.join(secretsDir, "v1.age");
    const encryptRes = Bun.spawnSync([ageExe, "-r", recipient, "-o", ciphertextPath], {
      stdin: new TextEncoder().encode(rawSecret),
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(encryptRes.exitCode).toBe(0);

    // Corrupt file v2 to test non-zero age exit failure
    const corruptPath = path.join(secretsDir, "v2.age");
    writeFileSync(corruptPath, "not-valid-age-ciphertext");

    setEnv("SECRETS_STORE_PATH", storeDir);
    SecretsStore.resetInstance();
    const store = SecretsStore.getInstance();

    expect(store.hasHandle("secret:test@v1")).toBe(true);
    expect(store.hasHandle("secret:test@1")).toBe(true);
    expect(store.getDecryptedValue("secret:test@v1")).toBe(rawSecret);
    expect(store.getDecryptedValue("secret:test@1")).toBe(rawSecret);

    const meta = store.getMetadata("secret:test@v1");
    expect(meta.name).toBe("test");
    expect(meta.version).toBe(1);
    expect((meta as Record<string, unknown>).ciphertext).toBeUndefined();

    // Named export matching CHECK.md Phase 4 verification: resolveToDockerEnv("API_KEY", "secret:test@v1")
    const dockerEnvA = resolveToDockerEnv("API_KEY", "secret:test@v1");
    expect(dockerEnvA.envVar).toBe("API_KEY");
    expect(dockerEnvA.flag).toBe(`--env API_KEY=${rawSecret}`);
    expect(dockerEnvA.args).toEqual(["--env", `API_KEY=${rawSecret}`]);
    expect(dockerEnvA.getResolvedValue()).toBe(rawSecret);

    // Also accepts (handle, envVarName) order on both named export and instance method
    const dockerEnvB = store.resolveToDockerEnv("secret:test@1", "ALT_API_KEY");
    expect(dockerEnvB.envVar).toBe("ALT_API_KEY");
    expect(dockerEnvB.args).toEqual(["--env", `ALT_API_KEY=${rawSecret}`]);

    // Auth header & executeWithSecret
    expect(store.resolveAuthHeader("secret:test@v1", "Bearer")).toEqual({
      Authorization: `Bearer ${rawSecret}`,
    });
    const closureResult = await store.executeWithSecret("secret:test@v1", async (v) => v.length);
    expect(closureResult).toBe(rawSecret.length);

    // Corrupt ciphertext fails fast with SecretSecurityError
    expect(() => store.getDecryptedValue("secret:test@v2")).toThrow(SecretSecurityError);

    // AGE_SECRET_KEY env var decryption when keys/identity.txt is removed
    const identityContent = await Bun.file(identityPath).text();
    const secretKeyLine = identityContent
      .split(/\r?\n/)
      .find((line) => line.startsWith("AGE-SECRET-KEY-1"));
    expect(secretKeyLine).toBeDefined();
    rmSync(identityPath);
    setEnv("AGE_SECRET_KEY", secretKeyLine);

    expect(store.getDecryptedValue("secret:test@v1")).toBe(rawSecret);
  });
});

describe("SecretsStore unified web app HTTP client wiring", () => {
  test("requestSecret and pollSecret wire real fetch() to /internal/secrets/* with wait=true and canonical handles", async () => {
    const requestsSeen: string[] = [];
    let pollCalls = 0;

    const server = Bun.serve({
      port: 0,
      hostname: "127.0.0.1",
      async fetch(req) {
        const u = new URL(req.url);
        requestsSeen.push(`${req.method} ${u.pathname}${u.search}`);

        if (req.method === "POST" && u.pathname === "/internal/secrets/request") {
          return Response.json(
            {
              token: "tok_abc123",
              url: "https://demo.pimsai.mistercricro8.top:444/?secret_token=tok_abc123",
              expiresAt: new Date(Date.now() + 300_000).toISOString(),
              pollHandle: "hash_abc123",
            },
            { status: 201 }
          );
        }

        if (req.method === "GET" && u.pathname === "/internal/secrets/poll/tok_abc123") {
          pollCalls += 1;
          if (u.searchParams.get("wait") === "true") {
            return Response.json({
              status: "submitted",
              handle: "secret:jira_api@1",
            });
          }
          return Response.json({ status: "pending", handle: null });
        }

        if (req.method === "GET" && u.pathname === "/internal/secrets/poll/expired_tok") {
          return Response.json(
            { status: "expired", handle: null, error: "REQUEST_EXPIRED" },
            { status: 410 }
          );
        }

        if (req.method === "GET" && u.pathname === "/internal/secrets/poll/bad_tok") {
          return Response.json({ error: "TOKEN_INVALID_OR_EXPIRED" }, { status: 400 });
        }

        return Response.json({ error: "NOT_FOUND" }, { status: 404 });
      },
    });

    try {
      const store = new SecretsStore({ webInternalUrl: server.url.toString() });
      const session = await store.requestSecret("jira_api", "connectors");
      expect(session.token).toBe("tok_abc123");
      expect(session.status).toBe("pending");

      const immediate = await store.pollSecret(session.token);
      expect(immediate).toEqual({ status: "pending" });

      const waited = await store.pollSecret(session.token, { wait: true, timeoutSeconds: 999 });
      expect(waited).toEqual({ status: "submitted", handle: "secret:jira_api@v1" });
      expect(requestsSeen).toContain("GET /internal/secrets/poll/tok_abc123?wait=true&timeout=300");
      expect(pollCalls).toBe(2);

      const expired = await store.pollSecret("expired_tok");
      expect(expired).toEqual({ status: "expired" });

      await expect(store.pollSecret("bad_tok")).rejects.toBeInstanceOf(SecretExpiredError);
    } finally {
      await server.stop(true);
    }
  });
});

describe(".omp/extensions/intro.ts redaction & tool registration", () => {
  test("redactSecrets scrubs JWTs, Bearer tokens, passwords, DB URIs, and env vars while keeping secret handles intact", () => {
    setEnv("PIMS_PASSWORD", "LoadedPimsPass!42");
    setEnv("SMTP_PASSWORD", "LoadedSmtpAppKey99");
    setEnv("EMBEDDINGS_API_KEY", "emb_live_secret_value_123");

    const sampleJwt =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJncnVwb2I0IiwiaWF0IjoxNzAwMDAwMDAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    const input = [
      `jwt=${sampleJwt}`,
      "Authorization: Bearer tok_super_long_bearer_secret_abcdef12345",
      "Authorization: Bearer secret:jira@v1",
      "password=SuperSecretEval999",
      '{"api_key": "raw_api_key_xyz987", "handle": "secret:jira@v1"}',
      "db=postgresql://agent:DbPassSuper99@db:5432/pims_agent",
      "raw=LoadedPimsPass!42",
      "smtp=LoadedSmtpAppKey99",
      "emb=emb_live_secret_value_123",
      "keep=secret:jira@v1",
      "keep2=secret:smtp_creds@v2",
    ].join("\n");

    const redacted = redactSecrets(input);

    expect(redacted).toContain("[REDACTED_JWT_TOKEN]");
    expect(redacted).not.toContain(sampleJwt);

    expect(redacted).toContain("Authorization: Bearer [REDACTED_TOKEN]");
    expect(redacted).not.toContain("tok_super_long_bearer_secret_abcdef12345");

    expect(redacted).toContain("password=[REDACTED_SECRET]");
    expect(redacted).not.toContain("SuperSecretEval999");

    expect(redacted).toContain('"api_key": "[REDACTED_SECRET]"');
    expect(redacted).not.toContain("raw_api_key_xyz987");

    expect(redacted).toContain("postgresql://agent:[REDACTED_DB_PASS]@db:5432/pims_agent");
    expect(redacted).not.toContain("DbPassSuper99");

    expect(redacted).not.toContain("LoadedPimsPass!42");
    expect(redacted).not.toContain("LoadedSmtpAppKey99");
    expect(redacted).not.toContain("emb_live_secret_value_123");

    // Opaque secret handles must NEVER be redacted
    expect(redacted).toContain("Authorization: Bearer secret:jira@v1");
    expect(redacted).toContain('"handle": "secret:jira@v1"');
    expect(redacted).toContain("keep=secret:jira@v1");
    expect(redacted).toContain("keep2=secret:smtp_creds@v2");
  });

  test("registers only valid underscore tools and applies hooks cleanly", async () => {
    const handlers = new Map<string, Array<(event: unknown, ctx: unknown) => Promise<unknown>>>();
    const registeredTools: Array<{ name: string; parameters: Record<string, unknown> }> = [];
    const sentMessages: Array<{ payload: unknown; opts: unknown }> = [];

    const mockPi = {
      on(name: string, handler: (event: unknown, ctx: unknown) => Promise<unknown>) {
        const list = handlers.get(name) ?? [];
        list.push(handler);
        handlers.set(name, list);
      },
      registerTool(tool: { name: string; parameters: Record<string, unknown> }) {
        if (!/^[a-zA-Z0-9_-]+$/.test(tool.name)) {
          throw new Error(`Invalid tool name: ${tool.name}`);
        }
        registeredTools.push(tool);
      },
      async sendMessage(payload: unknown, opts: unknown) {
        sentMessages.push({ payload, opts });
      },
    };

    introExtension(mockPi);

    expect(registeredTools.map((t) => t.name)).toEqual(["secrets_request", "secrets_poll"]);
    const pollTool = registeredTools.find((t) => t.name === "secrets_poll");
    expect((pollTool?.parameters as { properties?: Record<string, unknown> })?.properties?.wait).toBeDefined();

    // session_start sends banner
    const sessionStart = handlers.get("session_start")?.[0];
    expect(sessionStart).toBeDefined();
    await sessionStart!({}, {});
    expect(sentMessages.length).toBe(1);

    // input handles 'mas ayuda' and redacts raw passwords on regular input
    const inputHandler = handlers.get("input")?.[0];
    expect(inputHandler).toBeDefined();

    const helpResult = await inputHandler!({ text: "mas ayuda" }, {});
    expect(helpResult).toEqual({ handled: true });
    expect(sentMessages.length).toBe(2);

    const secretInputEvent = { text: "password=SuperSecretEval999 handle=secret:jira@v1" };
    const inputResult = (await inputHandler!(secretInputEvent, {})) as { text?: string };
    expect(secretInputEvent.text).toBe("password=[REDACTED_SECRET] handle=secret:jira@v1");
    expect(inputResult).toEqual({ text: "password=[REDACTED_SECRET] handle=secret:jira@v1" });

    // tool_result redacts before persistence
    const toolResultHandler = handlers.get("tool_result")?.[0];
    expect(toolResultHandler).toBeDefined();
    const trEvent = {
      content: [{ type: "text", text: "Bearer tok_super_long_bearer_secret_abcdef12345" }],
      details: { secret_value: "TopSecretValue999", handle: "secret:jira@v1" },
    };
    const trRes = (await toolResultHandler!(trEvent, {})) as {
      content: Array<{ text: string }>;
      details: { secret_value: string; handle: string };
    };
    expect(trRes.content[0]?.text).toBe("Bearer [REDACTED_TOKEN]");
    expect(trRes.details.secret_value).toBe("[REDACTED_SECRET]");
    expect(trRes.details.handle).toBe("secret:jira@v1");

    // context defense-in-depth redacts messages
    const contextHandler = handlers.get("context")?.[0];
    expect(contextHandler).toBeDefined();
    const ctxRes = (await contextHandler!(
      {
        messages: [
          { role: "user", content: "postgresql://agent:DbPass999@db:5432/pims" },
          { role: "assistant", content: [{ type: "text", text: "using secret:jira@v1" }] },
        ],
      },
      {}
    )) as { messages: Array<{ content: unknown }> };
    expect(ctxRes.messages[0]?.content).toBe("postgresql://agent:[REDACTED_DB_PASS]@db:5432/pims");
    expect((ctxRes.messages[1]?.content as Array<{ text: string }>)[0]?.text).toBe(
      "using secret:jira@v1"
    );
  });
});
