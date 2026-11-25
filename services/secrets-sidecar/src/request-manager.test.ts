import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { SecretsSidecarServer } from "../server";
import { SecretRequestExpiredError } from "./errors";
import { SecretRequestManager } from "./request-manager";

const tempDirs: string[] = [];
const savedPath = process.env.PATH;

function makeManager(): SecretRequestManager {
  const storeManager = {
    sanitizeLabel: (label: string) => label.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "_"),
    storeSecret: async (label: string) => `secret:${label}@v1`,
  } as unknown as ConstructorParameters<typeof SecretRequestManager>[0];
  return new SecretRequestManager(storeManager);
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
  return outPath ? path.join(outPath, "bin") : null;
}

const ageBinDir = resolveAgeBinDir();

afterEach(() => {
  process.env.PATH = savedPath;
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("SecretRequestManager.pollStatus", () => {
  test("pending via token, then submitted via token, pollHandle, canonical @v1, and normalized @1 handle", async () => {
    const mgr = makeManager();
    const created = await mgr.createRequest({ label: "probe_handle", scope: "connectors" });

    expect(mgr.pollStatus(created.token)).toEqual({ status: "pending", handle: null });

    const handle = await mgr.submitSecret(created.token, "s3cr3t");
    expect(handle).toBe("secret:probe_handle@v1");

    expect(mgr.pollStatus(created.token)).toEqual({ status: "submitted", handle });
    expect(mgr.pollStatus(created.pollHandle)).toEqual({ status: "submitted", handle });
    expect(mgr.pollStatus(handle)).toEqual({ status: "submitted", handle });
    expect(mgr.pollStatus("secret:probe_handle@1")).toEqual({ status: "submitted", handle });
  });

  test("unknown handle throws invalid-or-expired", async () => {
    const mgr = makeManager();
    expect(() => mgr.pollStatus("secret:nope@v1")).toThrow(/not found or expired/);
  });
});

describe("SecretRequestManager.waitForStatus", () => {
  test("resolves immediately when secret is submitted during wait", async () => {
    const mgr = makeManager();
    const created = await mgr.createRequest({ label: "wait_submit", scope: "connectors" });

    setTimeout(() => {
      void mgr.submitSecret(created.token, "late-secret-value");
    }, 25);

    const res = await mgr.waitForStatus(created.token, 5000);
    expect(res).toEqual({ status: "submitted", handle: "secret:wait_submit@v1" });
  });

  test("returns pending when timeout elapses before submission", async () => {
    const mgr = makeManager();
    const created = await mgr.createRequest({ label: "wait_timeout", scope: "connectors" });

    const res = await mgr.waitForStatus(created.token, 40);
    expect(res).toEqual({ status: "pending", handle: null });
  });

  test("rejects with SecretRequestExpiredError when request expires while waiting", async () => {
    const mgr = makeManager();
    const created = await mgr.createRequest({
      label: "wait_expire",
      scope: "connectors",
      ttlMs: 30,
    });

    await expect(mgr.waitForStatus(created.token, 5000)).rejects.toBeInstanceOf(
      SecretRequestExpiredError
    );
  });
});

describe("SecretsSidecarServer HTTP endpoints", () => {
  test("serves GET/HEAD /health & /healthz, JSON vs HTML POST /s/:token, canonical @v1, and ?wait=true", async () => {
    if (!ageBinDir) {
      throw new Error("age CLI unavailable even via nix build nixpkgs#age");
    }
    process.env.PATH = `${ageBinDir}:${savedPath ?? ""}`;

    const storeDir = mkdtempSync(path.join(tmpdir(), "secrets-sidecar-http-"));
    tempDirs.push(storeDir);

    const sidecar = new SecretsSidecarServer({
      port: 0,
      host: "127.0.0.1",
      storeDir,
      databaseUrl: null,
    });
    await sidecar.initialize();
    await sidecar.start();

    try {
      const baseUrl = `http://127.0.0.1:${sidecar.getPort()}`;

      for (const healthPath of ["/health", "/healthz"]) {
        const getResp = await fetch(`${baseUrl}${healthPath}`, { method: "GET" });
        expect(getResp.status).toBe(200);
        expect(await getResp.json()).toEqual({ status: "ok" });

        const headResp = await fetch(`${baseUrl}${healthPath}`, { method: "HEAD" });
        expect(headResp.status).toBe(200);
        expect(headResp.headers.get("content-type")).toContain("application/json");
        expect(await headResp.text()).toBe("");
      }

      // Create secret request
      const reqResp = await fetch(`${baseUrl}/api/secrets/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: "jira_api_token", scope: "connectors" }),
      });
      expect(reqResp.status).toBe(201);
      const created = (await reqResp.json()) as { token: string; pollHandle: string };

      // Non-blocking poll
      const pollPending = await fetch(`${baseUrl}/api/secrets/poll/${created.token}`);
      expect(pollPending.status).toBe(200);
      expect(await pollPending.json()).toEqual({ status: "pending", handle: null });

      // Start ?wait=true long-poll, submit JSON with Content-Type: application/json & Accept: */*
      setTimeout(async () => {
        const subResp = await fetch(`${baseUrl}/s/${created.token}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
          body: JSON.stringify({ secretValue: "sidecar-test-secret-123" }),
        });
        expect(subResp.status).toBe(200);
        expect(subResp.headers.get("content-type")).toContain("application/json");
        expect(await subResp.json()).toEqual({
          status: "submitted",
          handle: "secret:jira_api_token@v1",
        });
      }, 25);

      const waitResp = await fetch(
        `${baseUrl}/api/secrets/poll/${created.token}?wait=true&timeout=5`
      );
      expect(waitResp.status).toBe(200);
      expect(await waitResp.json()).toEqual({
        status: "submitted",
        handle: "secret:jira_api_token@v1",
      });

      // Polling by canonical handle (URL-encoded) also works
      const handlePollResp = await fetch(
        `${baseUrl}/api/secrets/poll/${encodeURIComponent("secret:jira_api_token@v1")}`
      );
      expect(handlePollResp.status).toBe(200);
      expect(await handlePollResp.json()).toEqual({
        status: "submitted",
        handle: "secret:jira_api_token@v1",
      });

      // Form-urlencoded browser POST without application/json Accept returns HTML
      const req2 = await fetch(`${baseUrl}/api/secrets/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: "form_token", scope: "connectors" }),
      });
      const created2 = (await req2.json()) as { token: string };
      const formResp = await fetch(`${baseUrl}/s/${created2.token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "text/html",
        },
        body: new URLSearchParams({ secretValue: "browser-form-secret" }).toString(),
      });
      expect(formResp.status).toBe(200);
      expect(formResp.headers.get("content-type")).toContain("text/html");
      expect(await formResp.text()).toContain("secret:form_token@v1");
    } finally {
      await sidecar.stop();
    }
  });
});
