import { describe, expect, test } from "bun:test";
import { SecretRequestManager } from "./request-manager";

function makeManager(): SecretRequestManager {
  const storeManager = {
    sanitizeLabel: (label: string) => label.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_"),
    storeSecret: async (label: string) => `secret:${label}@1`,
  } as unknown as ConstructorParameters<typeof SecretRequestManager>[0];
  return new SecretRequestManager(storeManager);
}

describe("SecretRequestManager.pollStatus", () => {
  test("pending via token, then submitted via token, pollHandle and handle", async () => {
    const mgr = makeManager();
    const created = await mgr.createRequest({ label: "probe_handle", scope: "connectors" });

    expect(mgr.pollStatus(created.token)).toEqual({ status: "pending", handle: null });

    const handle = await mgr.submitSecret(created.token, "s3cr3t");
    expect(handle).toBe("secret:probe_handle@1");

    expect(mgr.pollStatus(created.token)).toEqual({ status: "submitted", handle });
    expect(mgr.pollStatus(created.pollHandle)).toEqual({ status: "submitted", handle });
    expect(mgr.pollStatus(handle)).toEqual({ status: "submitted", handle });
  });

  test("unknown handle throws invalid-or-expired", async () => {
    const mgr = makeManager();
    expect(() => mgr.pollStatus("secret:nope@1")).toThrow(/not found or expired/);
  });
});
