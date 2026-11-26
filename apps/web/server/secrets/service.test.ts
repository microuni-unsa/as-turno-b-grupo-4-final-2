import { afterEach, describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { AgeEncryptor } from "./age.ts";
import { SecretsRegistryRepository } from "./registry.ts";
import {
  SecretsService,
  SecretRequestExpiredError,
  SecretTokenInvalidOrExpiredError,
  SecretValidationError,
  type SecretRequestCreatedEvent,
  type SecretRequestResolvedEvent,
} from "./service.ts";

const tempDirs: string[] = [];
const savedPath = process.env.PATH;
const savedAgeSecretKey = process.env.AGE_SECRET_KEY;

function createTempDir(prefix: string): string {
  const dir = fs.mkdtempSync(path.join(tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

function resolveAgeBinDir(): string {
  const direct = Bun.which("age");
  const directKeygen = Bun.which("age-keygen");
  if (direct && directKeygen) {
    return path.dirname(direct);
  }

  const nix = Bun.which("nix");
  if (!nix) {
    throw new Error("Neither age nor nix binary found in PATH");
  }

  const res = Bun.spawnSync([nix, "build", "nixpkgs#age", "--no-link", "--print-out-paths"], {
    stdout: "pipe",
    stderr: "pipe",
  });
  if (res.exitCode !== 0) {
    throw new Error(`Failed to resolve nixpkgs#age: ${Buffer.from(res.stderr).toString("utf8")}`);
  }

  const outPath = Buffer.from(res.stdout).toString("utf8").trim();
  if (!outPath) {
    throw new Error("nix build nixpkgs#age returned empty path");
  }
  return path.join(outPath, "bin");
}

const ageBinDir = resolveAgeBinDir();

function withRealAgeInPath(): void {
  process.env.PATH = `${ageBinDir}:${savedPath ?? ""}`;
}

function decryptWithAgeCli(identityPath: string, encryptedPath: string): string {
  const res = Bun.spawnSync(["age", "--decrypt", "-i", identityPath, encryptedPath], {
    stdout: "pipe",
    stderr: "pipe",
    env: process.env,
  });
  if (res.exitCode !== 0) {
    throw new Error(`age decrypt failed: ${Buffer.from(res.stderr).toString("utf8")}`);
  }
  return Buffer.from(res.stdout).toString("utf8");
}

afterEach(() => {
  process.env.PATH = savedPath;
  if (savedAgeSecretKey === undefined) {
    delete process.env.AGE_SECRET_KEY;
  } else {
    process.env.AGE_SECRET_KEY = savedAgeSecretKey;
  }

  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("AgeEncryptor", () => {
  test("generates identity/recipient files and encrypts plaintext via stdin decryptable by age", async () => {
    withRealAgeInPath();
    const storeDir = createTempDir("age-enc-");
    const keysDir = path.join(storeDir, "keys");
    const encryptor = new AgeEncryptor({ keysDir });

    const recipient = await encryptor.initialize();
    expect(recipient.startsWith("age1")).toBe(true);
    expect(fs.existsSync(path.join(keysDir, "identity.txt"))).toBe(true);
    expect(fs.existsSync(path.join(keysDir, "recipient.txt"))).toBe(true);

    const outPath = path.join(storeDir, "secrets", "smtp_pass", "v1.age");
    await encryptor.encryptToFile("super-secret-value-!@#", outPath);

    const ciphertext = fs.readFileSync(outPath, "utf8");
    expect(ciphertext).not.toContain("super-secret-value-!@#");

    const decrypted = decryptWithAgeCli(path.join(keysDir, "identity.txt"), outPath);
    expect(decrypted).toBe("super-secret-value-!@#");
  });

  test("derives recipient from AGE_SECRET_KEY env fallback when keys do not exist yet", async () => {
    withRealAgeInPath();
    const keygenRes = Bun.spawnSync(["age-keygen"], { stdout: "pipe", stderr: "pipe", env: process.env });
    expect(keygenRes.exitCode).toBe(0);
    const keygenText = Buffer.from(keygenRes.stdout).toString("utf8");
    const secretLine = keygenText
      .split(/\r?\n/)
      .find((line) => line.startsWith("AGE-SECRET-KEY-"));
    expect(secretLine).toBeDefined();

    process.env.AGE_SECRET_KEY = secretLine;
    const storeDir = createTempDir("age-env-");
    const keysDir = path.join(storeDir, "keys");
    const encryptor = new AgeEncryptor({ keysDir });

    const recipient = await encryptor.initialize();
    expect(recipient.startsWith("age1")).toBe(true);

    const outPath = path.join(storeDir, "env.age");
    await encryptor.encryptToFile("env-derived-secret", outPath);
    expect(decryptWithAgeCli(path.join(keysDir, "identity.txt"), outPath)).toBe(
      "env-derived-secret",
    );
  });
});

describe("SecretsRegistryRepository", () => {
  test("persists metadata atomically and lists entries newest first without plaintext", async () => {
    const storeDir = createTempDir("secrets-reg-");
    const repo = new SecretsRegistryRepository({ storeDir, databaseUrl: null });
    await repo.initialize();

    expect(await repo.getNextVersion("pims_token")).toBe(1);

    await repo.insertEntry({
      name: "pims_token",
      version: 1,
      created_at: new Date("2026-11-25T10:00:00.000Z"),
      created_by: "instructor",
      scope: "global",
    });
    expect(await repo.getNextVersion("pims_token")).toBe(2);

    await repo.insertEntry({
      name: "smtp_password",
      version: 1,
      created_at: new Date("2026-11-25T11:00:00.000Z"),
      created_by: "agent",
      scope: "connectors",
    });

    const all = await repo.listAllEntries();
    expect(all.map((entry) => entry.name)).toEqual(["smtp_password", "pims_token"]);
    await repo.close();
  });
});

describe("SecretsService", () => {
  test("sanitizes labels strictly and rejects path traversal", async () => {
    withRealAgeInPath();
    const storeDir = createTempDir("secrets-svc-label-");
    const svc = new SecretsService({
      storeDir,
      databaseUrl: null,
      publicBaseUrl: "https://demo.pimsai.mistercricro8.top:444",
    });

    expect(svc.sanitizeLabel(" pims_api.token-1 ")).toBe("pims_api.token-1");

    for (const bad of ["", "   ", ".", "..", "a..b", "../etc", "foo/bar", "a b", "x$y"]) {
      expect(() => svc.sanitizeLabel(bad)).toThrow(SecretValidationError);
    }

    await svc.close();
  });

  test("storeSecretDirect encrypts with real age, increments versions, and survives restart", async () => {
    withRealAgeInPath();
    const storeDir = createTempDir("secrets-svc-direct-");
    const svc = new SecretsService({
      storeDir,
      databaseUrl: null,
      publicBaseUrl: "https://demo.pimsai.mistercricro8.top:444",
    });
    await svc.initialize();

    const v1 = await svc.storeSecretDirect({
      label: "pims_jwt",
      secretValue: "jwt-secret-v1",
      scope: "pims",
      createdBy: "admin",
    });
    expect(v1.handle).toBe("secret:pims_jwt@v1");
    expect(v1.version).toBe(1);

    const v2 = await svc.storeSecretDirect({
      label: "pims_jwt",
      secretValue: "jwt-secret-v2",
      scope: "pims",
      createdBy: "admin",
    });
    expect(v2.handle).toBe("secret:pims_jwt@v2");
    expect(v2.version).toBe(2);

    const identityPath = path.join(storeDir, "keys", "identity.txt");
    expect(decryptWithAgeCli(identityPath, svc.getSecretFilePath("pims_jwt", 1))).toBe(
      "jwt-secret-v1",
    );
    expect(decryptWithAgeCli(identityPath, svc.getSecretFilePath("pims_jwt", 2))).toBe(
      "jwt-secret-v2",
    );

    await svc.close();

    // Fresh instance simulates restart
    const restarted = new SecretsService({
      storeDir,
      databaseUrl: null,
      publicBaseUrl: "https://demo.pimsai.mistercricro8.top:444",
    });
    await restarted.initialize();
    const listed = await restarted.listSecrets();
    expect(listed.secrets.map((s) => s.handle)).toEqual([
      "secret:pims_jwt@v2",
      "secret:pims_jwt@v1",
    ]);
    expect(JSON.stringify(listed)).not.toContain("jwt-secret-v1");
    expect(JSON.stringify(listed)).not.toContain("jwt-secret-v2");
    await restarted.close();
  });

  test("inline request creation, listSecrets redaction, single-use submit, replay rejection, and long-poll semantics", async () => {
    withRealAgeInPath();
    const storeDir = createTempDir("secrets-svc-flow-");
    const createdEvents: SecretRequestCreatedEvent[] = [];
    const resolvedEvents: SecretRequestResolvedEvent[] = [];

    const svc = new SecretsService({
      storeDir,
      databaseUrl: null,
      publicBaseUrl: "https://demo.pimsai.mistercricro8.top:444/",
      onRequestCreated: (evt) => createdEvents.push(evt),
      onRequestResolved: (evt) => resolvedEvents.push(evt),
    });
    await svc.initialize();

    const created = await svc.createRequest({
      label: "jira_token",
      scope: "connectors",
      createdBy: "agent-g4",
    });

    expect(created.mode).toBe("webapp-inline");
    expect(created.url).toBe(`https://demo.pimsai.mistercricro8.top:444/?secret_token=${created.token}`);
    expect(createdEvents).toHaveLength(1);
    expect(createdEvents[0]?.token).toBe(created.token);
    expect(createdEvents[0]?.requestId).toBe(created.requestId);

    // listSecrets NEVER leaks raw tokens
    const beforeSubmitList = await svc.listSecrets();
    expect(beforeSubmitList.pending).toHaveLength(1);
    expect(beforeSubmitList.pending[0]?.label).toBe("jira_token");
    expect("token" in (beforeSubmitList.pending[0] as object)).toBe(false);
    expect(JSON.stringify(beforeSubmitList)).not.toContain(created.token);

    // Non-blocking poll while pending
    expect(svc.pollStatus(created.token)).toEqual({ status: "pending", handle: null });
    expect(svc.pollStatus(created.pollHandle)).toEqual({ status: "pending", handle: null });

    // Long-poll resolves immediately on submit
    setTimeout(() => {
      void svc.submitSecret(created.token, "jira-live-token-xyz");
    }, 25);

    const waitRes = await svc.waitForStatus(created.pollHandle, 5000);
    expect(waitRes).toEqual({
      status: "submitted",
      handle: "secret:jira_token@v1",
    });
    expect(resolvedEvents).toEqual([
      {
        tokenHash: created.pollHandle,
        label: "jira_token",
        handle: "secret:jira_token@v1",
        scope: "connectors",
      },
    ]);

    // Poll works by token, pollHandle, canonical @v1, and normalized @1
    expect(svc.pollStatus(created.token)).toEqual({
      status: "submitted",
      handle: "secret:jira_token@v1",
    });
    expect(svc.pollStatus("secret:jira_token@v1")).toEqual({
      status: "submitted",
      handle: "secret:jira_token@v1",
    });
    expect(svc.pollStatus("secret:jira_token@1")).toEqual({
      status: "submitted",
      handle: "secret:jira_token@v1",
    });

    // Replay is rejected uniformly
    await expect(svc.submitSecret(created.token, "replay-attempt")).rejects.toBeInstanceOf(
      SecretTokenInvalidOrExpiredError,
    );

    // Submitted request no longer in pending
    const afterSubmitList = await svc.listSecrets();
    expect(afterSubmitList.pending).toHaveLength(0);
    expect(afterSubmitList.secrets).toHaveLength(1);
    expect(afterSubmitList.secrets[0]?.handle).toBe("secret:jira_token@v1");

    await svc.close();
  });

  test("waitForStatus handles timeout, expiry (410), and AbortSignal disconnect", async () => {
    withRealAgeInPath();
    const storeDir = createTempDir("secrets-svc-poll-");
    const svc = new SecretsService({
      storeDir,
      databaseUrl: null,
      publicBaseUrl: "https://demo.pimsai.mistercricro8.top:444",
    });
    await svc.initialize();

    const timeoutReq = await svc.createRequest({ label: "timeout_case", ttlMs: 5000 });
    expect(await svc.waitForStatus(timeoutReq.pollHandle, 35)).toEqual({
      status: "pending",
      handle: null,
    });

    const abortController = new AbortController();
    setTimeout(() => abortController.abort(), 20);
    let abortErr: unknown;
    try {
      await svc.waitForStatus(timeoutReq.pollHandle, 5000, abortController.signal);
    } catch (err) {
      abortErr = err;
    }
    expect(abortErr).toBeInstanceOf(Error);
    expect((abortErr as Error).name).toBe("AbortError");

    const expireReq = await svc.createRequest({ label: "expire_case", ttlMs: 30 });
    await expect(svc.waitForStatus(expireReq.pollHandle, 5000)).rejects.toBeInstanceOf(
      SecretRequestExpiredError,
    );

    // listSecrets prunes expired pending requests
    const listAfterExpire = await svc.listSecrets();
    expect(listAfterExpire.pending.map((item) => item.label)).toEqual(["timeout_case"]);

    await svc.close();
  });
});
