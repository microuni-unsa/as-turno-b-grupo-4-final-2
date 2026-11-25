import { afterAll, describe, expect, test } from "bun:test";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  AuthManager,
  DocumentsModule,
  IncidentsModule,
  PIMS_CONFIG,
  PimsAuthError,
  PimsClient,
  PimsValidationError,
  PimsVersionNotFoundError,
  PimsWriteFailureError,
  TenantGuardViolationError,
  assertG4IncidentOwnership,
  assertG4WriteCode,
  decodeJwtExp,
  dedupeAuditFindings,
  isJwtFresh,
} from "./index.ts";
import type { PimsAudit, PimsDocument, PimsIncident } from "./types.ts";

function mockFetchFn(
  handler: (input: URL | RequestInfo, init?: RequestInit) => Promise<Response>,
): typeof fetch {
  return Object.assign(handler, {
    preconnect: () => {},
  }) as typeof fetch;
}

const REPO_ROOT = path.resolve(import.meta.dir, "../..");
const tempDirs: string[] = [];

function createTempDir(prefix = "pims-test-"): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  tempDirs.push(dir);
  return dir;
}

function makeJwt(expOffsetSeconds: number, sub = "grupob4"): string {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ sub, exp: now + expOffsetSeconds, iat: now }),
  ).toString("base64url");
  return `${header}.${payload}.test-sig`;
}

function jsonResponse(body: unknown, status = 200, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

afterAll(() => {
  for (const dir of tempDirs) {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe("JWT helpers & AuthManager disk cache", () => {
  test("decodeJwtExp & isJwtFresh validate base64url exp with skew", () => {
    const freshJwt = makeJwt(120);
    const edgeExpiredJwt = makeJwt(PIMS_CONFIG.JWT_EXPIRY_SKEW_SECONDS);
    const pastJwt = makeJwt(-60);

    expect(decodeJwtExp(freshJwt)).toBeGreaterThan(0);
    expect(isJwtFresh(freshJwt)).toBe(true);
    expect(isJwtFresh(edgeExpiredJwt)).toBe(false);
    expect(isJwtFresh(pastJwt)).toBe(false);

    expect(decodeJwtExp("invalid-token")).toBeNull();
    expect(decodeJwtExp("a.!!!.c")).toBeNull();
    const badJsonPayload = Buffer.from("{bad-json").toString("base64url");
    expect(decodeJwtExp(`hdr.${badJsonPayload}.sig`)).toBeNull();
    const noExpPayload = Buffer.from(JSON.stringify({ sub: "x" })).toString("base64url");
    expect(decodeJwtExp(`hdr.${noExpPayload}.sig`)).toBeNull();
    expect(isJwtFresh("invalid-token")).toBe(false);
  });

  test("persists JWT cache atomically with mode 0o600 and reuses across instances", async () => {
    const dir = createTempDir();
    const cachePath = path.join(dir, "jwt-cache.json");
    const accessToken = makeJwt(600);
    const refreshToken = makeJwt(3600);

    let loginCalls = 0;
    const mockFetch = mockFetchFn(async (input) => {
      const url = String(input);
      if (url.endsWith("/business/login/")) {
        loginCalls++;
        return jsonResponse({ access: accessToken, refresh: refreshToken });
      }
      throw new Error(`Unexpected fetch URL: ${url}`);
    });

    const auth1 = new AuthManager({
      baseUrl: "https://pims.test",
      schema: "unsa",
      credentials: { username: "grupob4", password: "secret-password" },
      tokenCachePath: cachePath,
      fetchFn: mockFetch,
    });

    const tok1 = await auth1.getValidAccessToken();
    expect(tok1).toBe(accessToken);
    expect(loginCalls).toBe(1);

    // File must exist with 0o600 permissions and keyed by baseUrl|schema|username
    const stat = fs.statSync(cachePath);
    expect(stat.mode & 0o777).toBe(0o600);

    const rawCache = JSON.parse(fs.readFileSync(cachePath, "utf-8")) as Record<
      string,
      Record<string, unknown>
    >;
    const key = "https://pims.test|unsa|grupob4";
    expect(rawCache[key]).toBeDefined();
    expect(rawCache[key].access).toBe(accessToken);
    expect(rawCache[key].refresh).toBe(refreshToken);
    expect(rawCache[key].baseUrl).toBe("https://pims.test");
    expect(rawCache[key].schema).toBe("unsa");
    expect(rawCache[key].username).toBe("grupob4");
    expect(typeof rawCache[key].cachedAt).toBe("string");

    // Second instance reuses disk cache without calling fetchFn
    const failIfCalledFetch = mockFetchFn(async () => {
      throw new Error("fetch should not be called when disk cache is fresh");
    });
    const auth2 = new AuthManager({
      baseUrl: "https://pims.test",
      schema: "unsa",
      credentials: { username: "grupob4", password: "secret-password" },
      tokenCachePath: cachePath,
      fetchFn: failIfCalledFetch,
    });
    const tok2 = await auth2.getValidAccessToken();
    expect(tok2).toBe(accessToken);
  });

  test("isolates cache entries by baseUrl|schema|username without collision", async () => {
    const dir = createTempDir();
    const cachePath = path.join(dir, "multi-cache.json");
    const tokenA = makeJwt(600, "userA");
    const tokenB = makeJwt(600, "userB");

    const authA = new AuthManager({
      baseUrl: "https://pims.test",
      schema: "unsa",
      credentials: { username: "userA", password: "pwA" },
      tokenCachePath: cachePath,
      fetchFn: mockFetchFn(async () => jsonResponse({ access: tokenA, refresh: "refA" })),
    });
    const authB = new AuthManager({
      baseUrl: "https://pims.test",
      schema: "other-schema",
      credentials: { username: "userB", password: "pwB" },
      tokenCachePath: cachePath,
      fetchFn: mockFetchFn(async () => jsonResponse({ access: tokenB, refresh: "refB" })),
    });

    expect(await authA.getValidAccessToken()).toBe(tokenA);
    expect(await authB.getValidAccessToken()).toBe(tokenB);

    const map = JSON.parse(fs.readFileSync(cachePath, "utf-8")) as Record<string, unknown>;
    expect(Object.keys(map)).toContain("https://pims.test|unsa|userA");
    expect(Object.keys(map)).toContain("https://pims.test|other-schema|userB");
  });

  test("refreshes expired cached access token and only logs in if refresh fails", async () => {
    const dir = createTempDir();
    const cachePath = path.join(dir, "refresh-cache.json");
    const expiredAccess = makeJwt(-120);
    const refreshedAccess = makeJwt(600);
    const reLoginAccess = makeJwt(900);

    fs.writeFileSync(
      cachePath,
      JSON.stringify({
        "https://pims.test|unsa|grupob4": {
          access: expiredAccess,
          refresh: "old-refresh-token",
          baseUrl: "https://pims.test",
          username: "grupob4",
          schema: "unsa",
          cachedAt: new Date().toISOString(),
        },
      }),
      { mode: 0o600 },
    );

    const calls: string[] = [];
    const authRefreshOk = new AuthManager({
      baseUrl: "https://pims.test",
      schema: "unsa",
      credentials: { username: "grupob4", password: "pw" },
      tokenCachePath: cachePath,
      fetchFn: mockFetchFn(async (input) => {
        const url = String(input);
        calls.push(url);
        if (url.endsWith("/business/token/refresh/")) {
          return jsonResponse({ access: refreshedAccess });
        }
        throw new Error(`Unexpected call: ${url}`);
      }),
    });

    const tok = await authRefreshOk.getValidAccessToken();
    expect(tok).toBe(refreshedAccess);
    expect(calls).toEqual(["https://pims.test/business/token/refresh/"]);

    // Verify invalid JWT format in cache rejects entry and performs full login
    fs.writeFileSync(
      cachePath,
      JSON.stringify({
        "https://pims.test|unsa|grupob4": {
          access: "corrupted-non-jwt",
          refresh: "should-not-be-used",
          baseUrl: "https://pims.test",
          username: "grupob4",
          schema: "unsa",
          cachedAt: new Date().toISOString(),
        },
      }),
      { mode: 0o600 },
    );

    const calls2: string[] = [];
    const authInvalidFormat = new AuthManager({
      baseUrl: "https://pims.test",
      schema: "unsa",
      credentials: { username: "grupob4", password: "pw" },
      tokenCachePath: cachePath,
      fetchFn: mockFetchFn(async (input) => {
        const url = String(input);
        calls2.push(url);
        if (url.endsWith("/business/login/")) {
          return jsonResponse({ access: reLoginAccess, refresh: "new-ref" });
        }
        throw new Error(`Unexpected call: ${url}`);
      }),
    });

    const tok2 = await authInvalidFormat.getValidAccessToken();
    expect(tok2).toBe(reLoginAccess);
    expect(calls2).toEqual(["https://pims.test/business/login/"]);
  });
});

describe("AuthManager 429 Retry-After backoff & network refusal", () => {
  test("parses Retry-After header and DRF Spanish/English body, caps at 35s, and retries up to MAX_RATE_LIMIT_RETRIES", async () => {
    const dir = createTempDir();
    const cachePath = path.join(dir, "429-cache.json");
    const sleptMs: number[] = [];
    const validJwt = makeJwt(600);
    let attempt = 0;

    const authSuccess = new AuthManager({
      baseUrl: "https://pims.test",
      schema: "unsa",
      credentials: { username: "grupob4", password: "pw" },
      tokenCachePath: cachePath,
      sleepFn: async (ms) => {
        sleptMs.push(ms);
      },
      fetchFn: mockFetchFn(async () => {
        attempt++;
        if (attempt === 1) {
          return new Response(
            JSON.stringify({ detail: "Solicitud bloqueada. Disponible en 12 segundos." }),
            { status: 429 },
          );
        }
        if (attempt === 2) {
          return new Response("Too many requests", {
            status: 429,
            headers: { "Retry-After": "120" },
          });
        }
        return jsonResponse({ access: validJwt, refresh: "ref-ok" });
      }),
    });

    const tok = await authSuccess.getValidAccessToken();
    expect(tok).toBe(validJwt);
    expect(attempt).toBe(3);
    expect(sleptMs).toEqual([12_000, PIMS_CONFIG.MAX_RATE_LIMIT_WAIT_SECONDS * 1000]);

    // Exhausting retries throws PimsAuthError with status: 429
    const sleptFailMs: number[] = [];
    let failAttempts = 0;
    const authFail = new AuthManager({
      baseUrl: "https://pims.test",
      schema: "unsa",
      credentials: { username: "grupob4", password: "pw" },
      tokenCachePath: path.join(dir, "429-fail.json"),
      sleepFn: async (ms) => {
        sleptFailMs.push(ms);
      },
      fetchFn: mockFetchFn(async () => {
        failAttempts++;
        return new Response(
          JSON.stringify({ detail: "Request was throttled. Expected available in 4 seconds." }),
          { status: 429 },
        );
      }),
    });

    let caught: unknown;
    try {
      await authFail.login();
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(PimsAuthError);
    const authErr = caught as PimsAuthError;
    expect(authErr.status).toBe(429);
    expect(authErr.endpoint).toBe("https://pims.test/business/login/");
    expect(failAttempts).toBe(PIMS_CONFIG.MAX_RATE_LIMIT_RETRIES + 1);
    expect(sleptFailMs).toEqual([4000, 4000]);
  });

  test("network refusal throws PimsAuthError with status 0 and explicit login endpoint", async () => {
    const dir = createTempDir();
    const auth = new AuthManager({
      baseUrl: "https://unreachable.test",
      schema: "unsa",
      credentials: { username: "grupob4", password: "pw" },
      tokenCachePath: path.join(dir, "neterr.json"),
      fetchFn: mockFetchFn(async () => {
        throw new TypeError("Unable to connect. Is the computer able to access the url?");
      }),
    });

    let caught: unknown;
    try {
      await auth.getValidAccessToken();
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(PimsAuthError);
    const authErr = caught as PimsAuthError;
    expect(authErr.status).toBe(0);
    expect(authErr.endpoint).toBe("https://unreachable.test/business/login/");
  });
});

describe("Tenant write guards on Documents and Incidents", () => {
  test("assertG4WriteCode & assertG4IncidentOwnership enforce G4- prefix and PimsVersionNotFoundError formats available versions", () => {
    expect(() => assertG4WriteCode("POL-01", "Document")).toThrow(TenantGuardViolationError);
    expect(() => assertG4WriteCode("G4-POL-01", "Document")).not.toThrow();

    const verErr = new PimsVersionNotFoundError("G4-POL-01", "9.99", ["1.00", "2.00"]);
    expect(verErr.status).toBe(404);
    expect(verErr.message).toContain("G4-POL-01");
    expect(verErr.message).toContain("9.99");
    expect(verErr.message).toContain("1.00, 2.00");

    expect(() =>
      assertG4IncidentOwnership({
        id: 11,
        incident_code: "INC-011",
        title: "Phishing campaign",
      }),
    ).toThrow(TenantGuardViolationError);

    expect(() =>
      assertG4IncidentOwnership({
        id: 13,
        incident_code: "INC-013",
        title: "G4-INC-EVAL-01: Phishing simulation",
      }),
    ).not.toThrow();

    expect(() =>
      assertG4IncidentOwnership({
        id: 14,
        incident_code: "G4-INC-01",
        title: "Legacy incident",
      }),
    ).not.toThrow();
  });

  test("DocumentsModule.addDocumentVersion rejects non-G4 document and throws PimsWriteFailureError on write failure", async () => {
    const dir = createTempDir();
    const jwt = makeJwt(600);
    const docsMap: Record<number, PimsDocument> = {
      5: {
        id: 5,
        code: "POL-01",
        current_version: "1.00",
        name: "Other group policy",
        category: "PO",
        status: "V",
        responsible: "other",
        file: "/media/pol01.pdf",
        approved_at: null,
        approved_by_name: null,
        related_documents: [],
        gap_requirements: [],
      },
      11: {
        id: 11,
        code: "G4-PRC-INC-01",
        current_version: "3.00",
        name: "G4 Procedure",
        category: "PR",
        status: "B",
        responsible: "grupob4",
        file: "/media/g4.pdf",
        approved_at: null,
        approved_by_name: null,
        related_documents: [],
        gap_requirements: [],
      },
    };

    const postCalls: string[] = [];
    let failNextVersionPost = false;

    const docsFetch = mockFetchFn(async (input, init) => {
      const url = String(input);
      const method = (init?.method ?? "GET").toUpperCase();
      if (url.endsWith("/business/login/")) {
        return jsonResponse({ access: jwt, refresh: "ref" });
      }
      const getMatch = /\/api\/documents\/(\d+)\/$/.exec(url);
      if (method === "GET" && getMatch) {
        const doc = docsMap[Number(getMatch[1])];
        return doc ? jsonResponse(doc) : jsonResponse({ detail: "Not found" }, 404);
      }
      if (method === "POST" && url.includes("/versions/")) {
        postCalls.push(url);
        if (failNextVersionPost) {
          return jsonResponse({ detail: "Server write error" }, 500);
        }
        return jsonResponse({
          id: 99,
          document: 11,
          version: "4.00",
          file: "/media/g4_v4.pdf",
          change_summary: "Updated",
          created_at: "2026-11-25T00:00:00Z",
          created_by: 14,
          created_by_name: "grupob4",
        });
      }
      throw new Error(`Unexpected fetch: ${method} ${url}`);
    });

    const client = new PimsClient({
      baseUrl: "https://pims.test",
      schema: "unsa",
      credentials: { username: "grupob4", password: "pw" },
      tokenCachePath: path.join(dir, "docs.json"),
      fetchFn: docsFetch,
    });
    const docsDirect = new DocumentsModule(client.auth, {
      baseUrl: "https://pims.test",
      schema: "unsa",
      fetchFn: docsFetch,
    });
    expect(docsDirect).toBeInstanceOf(DocumentsModule);

    // Rejects non-G4 target fetched by ID without issuing POST
    await expect(
      client.addDocumentVersion(5, {
        file: new Uint8Array([1, 2, 3]),
        fileName: "POL-01_v2.pdf",
        change_summary: "Attempt unauthorized bump",
      }),
    ).rejects.toThrow(TenantGuardViolationError);
    expect(postCalls.length).toBe(0);

    // Accepts G4 document
    const createdVer = await client.addDocumentVersion(11, {
      file: new Uint8Array([1, 2, 3]),
      fileName: "G4-PRC-INC-01_v4.pdf",
      change_summary: "Valid G4 update",
    });
    expect(createdVer.version).toBe("4.00");
    expect(postCalls.length).toBe(1);

    // Throws PimsWriteFailureError on POST failure
    failNextVersionPost = true;
    let writeErr: unknown;
    try {
      await client.addDocumentVersion(11, {
        file: new Uint8Array([1, 2, 3]),
        fileName: "G4-PRC-INC-01_v5.pdf",
        change_summary: "Will fail",
      });
    } catch (err) {
      writeErr = err;
    }
    expect(writeErr).toBeInstanceOf(PimsWriteFailureError);
    expect((writeErr as PimsWriteFailureError).message).toContain("PIMS write failed at");
  });

  test("IncidentsModule enforces G4 ownership on update/attach, mandatory incident_type, involves_personal_data, and G4- title prefix", async () => {
    const dir = createTempDir();
    const jwt = makeJwt(600);
    const incidentsMap: Record<number, PimsIncident> = {
      11: {
        id: 11,
        incident_code: "INC-011",
        title: "Authority notification deadline missed",
        status: "P",
        severity: "H",
      },
      13: {
        id: 13,
        incident_code: "INC-013",
        title: "G4-INC-EVAL-01: Unauthorized disclosure test",
        status: "P",
        severity: "H",
      },
    };

    const capturedCreates: Array<Record<string, unknown>> = [];
    const writeCalls: string[] = [];

    const auth = new AuthManager({
      baseUrl: "https://pims.test",
      schema: "unsa",
      credentials: { username: "grupob4", password: "pw" },
      tokenCachePath: path.join(dir, "inc.json"),
      fetchFn: mockFetchFn(async () => jsonResponse({ access: jwt, refresh: "ref" })),
    });

    let failPatch = false;
    const incidentsMod = new IncidentsModule(auth, {
      baseUrl: "https://pims.test",
      schema: "unsa",
      fetchFn: mockFetchFn(async (input, init) => {
        const url = String(input);
        const method = (init?.method ?? "GET").toUpperCase();
        const getMatch = /\/api\/incidents\/(\d+)\/$/.exec(url);
        if (method === "GET" && getMatch) {
          const inc = incidentsMap[Number(getMatch[1])];
          return inc ? jsonResponse(inc) : jsonResponse({ detail: "Not found" }, 404);
        }
        if (method === "POST" && url.endsWith("/api/incidents/")) {
          const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
          capturedCreates.push(body);
          writeCalls.push(`POST ${url}`);
          return jsonResponse({
            id: 15,
            incident_code: "INC-015",
            title: body.title,
            status: body.status ?? "P",
            severity: body.severity ?? "M",
            incident_type: body.incident_type,
            involves_personal_data: body.involves_personal_data,
          });
        }
        if (method === "PATCH" && getMatch) {
          writeCalls.push(`PATCH ${url}`);
          if (failPatch) {
            return jsonResponse({ detail: "Bad patch" }, 400);
          }
          return jsonResponse({ ...incidentsMap[Number(getMatch[1])], status: "C" });
        }
        if (method === "POST" && url.endsWith("/attachments/")) {
          writeCalls.push(`POST ${url}`);
          return jsonResponse([
            {
              id: 1,
              file: "/media/ev.pdf",
              file_name: "ev.pdf",
              uploaded_at: "2026-11-25T00:00:00Z",
              uploaded_by: 14,
              uploaded_by_name: "grupob4",
            },
          ]);
        }
        throw new Error(`Unexpected fetch: ${method} ${url}`);
      }),
    });

    // Rejects INC-011 on updateIncident and uploadIncidentAttachment before PATCH/POST
    await expect(
      incidentsMod.updateIncident(11, { status: "C" }),
    ).rejects.toThrow(TenantGuardViolationError);
    await expect(
      incidentsMod.uploadIncidentAttachment(11, new Uint8Array([1, 2]), "ev.pdf"),
    ).rejects.toThrow(TenantGuardViolationError);
    expect(writeCalls.length).toBe(0);

    // Accepts G4-titled INC-013 on update and attach
    const updated = await incidentsMod.updateIncident(13, { status: "C" });
    expect(updated.status).toBe("C");
    const attached = await incidentsMod.uploadIncidentAttachment(
      13,
      new Uint8Array([1, 2]),
      "ev.pdf",
    );
    expect(attached[0].file_name).toBe("ev.pdf");

    // Throws PimsWriteFailureError on PATCH failure
    failPatch = true;
    await expect(
      incidentsMod.updateIncident(13, { status: "C" }),
    ).rejects.toThrow(PimsWriteFailureError);
    failPatch = false;

    // createIncident requires valid incident_type
    await expect(
      incidentsMod.createIncident({
        incident_code: "G4-INC-99",
        title: "Missing type",
        incident_date: "2026-11-25",
      } as never),
    ).rejects.toThrow(PimsValidationError);

    try {
      await incidentsMod.createIncident({
        incident_code: "G4-INC-99",
        title: "Bad type",
        incident_type: "INVALID" as never,
        incident_date: "2026-11-25",
      });
    } catch (err) {
      expect(err).toBeInstanceOf(PimsValidationError);
      for (const code of PIMS_CONFIG.ALLOWED_INCIDENT_TYPES) {
        expect((err as PimsValidationError).message).toContain(code);
      }
    }

    // createIncident prefixes title when missing G4- and defaults involves_personal_data to true
    await incidentsMod.createIncident({
      incident_code: "G4-INC-EVAL-01",
      title: "Breach Drill",
      incident_type: "DL",
      incident_date: "2026-11-25",
    });
    expect(capturedCreates[0].title).toBe("G4-INC-EVAL-01: Breach Drill");
    expect(capturedCreates[0].involves_personal_data).toBe(true);
    expect(capturedCreates[0].incident_type).toBe("DL");

    // Preserves existing G4- prefix on title and explicit involves_personal_data=false
    await incidentsMod.createIncident({
      incident_code: "G4-INC-EVAL-02",
      title: "G4-INC-EVAL-02: Already prefixed",
      incident_type: "OT",
      involves_personal_data: false,
      incident_date: "2026-11-25",
    });
    expect(capturedCreates[1].title).toBe("G4-INC-EVAL-02: Already prefixed");
    expect(capturedCreates[1].involves_personal_data).toBe(false);
  });
});

describe("dedupeAuditFindings", () => {
  test("returns uniqueFindingsCount, uniqueActionsCount, and originalActionsCount accurately", () => {
    const sampleAudit: PimsAudit = {
      id: 1,
      audit_code: "AUD-2026-001",
      audit_type: "Internal",
      name: "ISO 27701 Audit",
      status: "P",
      progress: 40,
      findings_count: 5,
      findings: [
        {
          classification: "NC-MAJ",
          description: "Missing retention matrix",
          evidence: null,
          position: 0,
          actions: [
            {
              action_plan: "Publish retention policy",
              responsible: "DPO",
              due_date: "2026-12-01",
              status: "P",
              progress: 20,
              closed_at: null,
              position: 0,
              is_overdue: false,
            },
            {
              action_plan: "Publish retention policy",
              responsible: "DPO",
              due_date: "2026-12-01",
              status: "P",
              progress: 20,
              closed_at: null,
              position: 1,
              is_overdue: false,
            },
            {
              action_plan: "Train staff",
              responsible: "HR",
              due_date: "2026-12-15",
              status: "P",
              progress: 0,
              closed_at: null,
              position: 2,
              is_overdue: false,
            },
          ],
        },
        {
          classification: "OBS",
          description: "Incomplete DSAR log",
          evidence: "log.pdf",
          position: 1,
          actions: [
            {
              action_plan: "Automate DSAR log",
              responsible: "SecOps",
              due_date: "2026-12-20",
              status: "C",
              progress: 100,
              closed_at: "2026-11-20T00:00:00Z",
              position: 0,
              is_overdue: false,
            },
            {
              action_plan: "Automate DSAR log",
              responsible: "SecOps",
              due_date: "2026-12-20",
              status: "C",
              progress: 100,
              closed_at: "2026-11-20T00:00:00Z",
              position: 1,
              is_overdue: false,
            },
          ],
        },
      ],
    };

    const result = dedupeAuditFindings(sampleAudit);
    expect(result.uniqueFindingsCount).toBe(2);
    expect(result.uniqueActionsCount).toBe(3);
    expect(result.originalActionsCount).toBe(5);
    expect(result.findings.length).toBe(2);
    expect(result.findings[0].actions.length).toBe(2);
    expect(result.findings[1].actions.length).toBe(1);
    expect(result.findings[0].actions.map((a) => a.position)).toEqual([0, 1]);
  });
});

describe("scripts/pims.ts CLI fidelity and fail-fast checks", () => {
  test("--help prints updated incident flags and exits 0", () => {
    const proc = Bun.spawnSync([process.execPath, "scripts/pims.ts", "--help"], {
      cwd: REPO_ROOT,
      env: process.env,
    });
    expect(proc.exitCode).toBe(0);
    const stdout = proc.stdout.toString("utf-8");
    expect(stdout).toContain("--incident-type");
    expect(stdout).toContain("--involves-personal-data");
    expect(stdout).toContain("--with-history");
  });

  test("CLI guards, token-safe outputs, dedupe counts, version lookup, and status 0 network errors against local mock server", async () => {
    const dir = createTempDir();
    const cachePath = path.join(dir, "cli-cache.json");
    const samplePdf = path.join(dir, "sample.pdf");
    const sampleTxt = path.join(dir, "note.txt");
    fs.writeFileSync(samplePdf, "%PDF-1.4 mock");
    fs.writeFileSync(sampleTxt, "attachment text");

    const jwt = makeJwt(600);
    const longSummary = "A".repeat(235) + "1234567890";

    const mockServer = Bun.serve({
      port: 0,
      hostname: "127.0.0.1",
      fetch(req: Request) {
        const url = new URL(req.url);
        if (url.pathname === "/business/login/") {
          return jsonResponse({ access: jwt, refresh: "cli-ref" });
        }
        if (url.pathname === "/api/documents/5/") {
          return jsonResponse({
            id: 5,
            code: "POL-01",
            current_version: "1.00",
            name: "Foreign Doc",
            category: "PO",
            status: "V",
            responsible: "other",
            file: "/media/pol01.pdf",
            approved_at: null,
            approved_by_name: null,
            related_documents: [],
            gap_requirements: [],
          });
        }
        if (url.pathname === "/api/documents/" && url.searchParams.get("search") === "G4-POL-01") {
          return jsonResponse({
            count: 1,
            next: null,
            previous: null,
            results: [
              {
                id: 11,
                code: "G4-POL-01",
                current_version: "2.00",
                name: "Privacy Policy",
                category: "PO",
                status: "V",
                responsible: "grupob4",
                file: "/media/g4-pol-01-v2.pdf",
                approved_at: null,
                approved_by_name: null,
                related_documents: [],
                gap_requirements: [],
              },
            ],
          });
        }
        if (url.pathname === "/api/documents/11/versions/") {
          return jsonResponse([
            {
              id: 1,
              document: 11,
              version: "1.00",
              file: "/media/g4-pol-01-v1.pdf",
              change_summary: longSummary,
              created_at: "2026-11-20T00:00:00Z",
              created_by: 14,
              created_by_name: "grupob4",
            },
            {
              id: 2,
              document: 11,
              version: "2.00",
              file: "/media/g4-pol-01-v2.pdf",
              change_summary: "Second release",
              created_at: "2026-11-22T00:00:00Z",
              created_by: 14,
              created_by_name: "grupob4",
            },
          ]);
        }
        if (url.pathname === "/api/incidents/") {
          const search = url.searchParams.get("search");
          if (search === "INC-011") {
            return jsonResponse({
              count: 1,
              next: null,
              previous: null,
              results: [
                {
                  id: 11,
                  incident_code: "INC-011",
                  title: "Foreign incident",
                  status: "P",
                  severity: "H",
                },
              ],
            });
          }
          if (search === "INC-013") {
            return jsonResponse({
              count: 1,
              next: null,
              previous: null,
              results: [
                {
                  id: 13,
                  incident_code: "INC-013",
                  title: "G4-INC-EVAL-01: Mock incident",
                  status: "P",
                  severity: "H",
                  actions: [
                    {
                      action_type: "C",
                      responsible: "DPO",
                      action_date: "2026-11-25",
                      description: "Contain",
                      evidence: "doc.pdf",
                      position: 0,
                    },
                    {
                      action_type: "A",
                      responsible: "SecOps",
                      action_date: "2026-11-26",
                      description: "Analyze",
                      evidence: null,
                      position: 1,
                    },
                  ],
                  attachments: [{ id: 1, file: "/a.pdf", file_name: "a.pdf", uploaded_at: "2026-11-25", uploaded_by: 14, uploaded_by_name: "grupob4" }],
                  history: [{ id: 1, event_type: "created", event_type_label: "Creado", changed_at: "2026-11-25", actor: "grupob4", changed_by: 14, changed_by_name: "grupob4", description: "Init", recipients_snapshot: null }],
                },
              ],
            });
          }
        }
        if (url.pathname === "/api/audits/1/") {
          return jsonResponse({
            id: 1,
            audit_code: "AUD-2026-001",
            audit_type: "Internal",
            name: "Privacy Audit",
            status: "P",
            progress: 50,
            findings: [
              {
                classification: "NC",
                description: "F1",
                evidence: null,
                position: 0,
                actions: [
                  { action_plan: "A1", responsible: "R1", due_date: "2026-12-01", status: "P", progress: 0, closed_at: null, position: 0, is_overdue: false },
                  { action_plan: "A1", responsible: "R1", due_date: "2026-12-01", status: "P", progress: 0, closed_at: null, position: 1, is_overdue: false },
                  { action_plan: "A2", responsible: "R1", due_date: "2026-12-02", status: "P", progress: 0, closed_at: null, position: 2, is_overdue: false },
                ],
              },
              {
                classification: "OBS",
                description: "F2",
                evidence: "ok.pdf",
                position: 1,
                actions: [
                  { action_plan: "A3", responsible: "R2", due_date: "2026-12-03", status: "C", progress: 100, closed_at: "2026-11-20", position: 0, is_overdue: false },
                ],
              },
            ],
          });
        }
        if (url.pathname === "/api/audits/") {
          return jsonResponse({
            count: 1,
            next: null,
            previous: null,
            results: [
              {
                id: 1,
                audit_code: "AUD-2026-001",
                audit_type: "Internal",
                name: "Privacy Audit",
                status: "P",
                progress: 50,
                findings: [
                  {
                    classification: "NC",
                    description: "F1",
                    evidence: null,
                    position: 0,
                    actions: [
                      { action_plan: "A1", responsible: "R1", due_date: "2026-12-01", status: "P", progress: 0, closed_at: null, position: 0, is_overdue: false },
                      { action_plan: "A1", responsible: "R1", due_date: "2026-12-01", status: "P", progress: 0, closed_at: null, position: 1, is_overdue: false },
                      { action_plan: "A2", responsible: "R1", due_date: "2026-12-02", status: "P", progress: 0, closed_at: null, position: 2, is_overdue: false },
                    ],
                  },
                  {
                    classification: "OBS",
                    description: "F2",
                    evidence: "ok.pdf",
                    position: 1,
                    actions: [
                      { action_plan: "A3", responsible: "R2", due_date: "2026-12-03", status: "C", progress: 100, closed_at: "2026-11-20", position: 0, is_overdue: false },
                    ],
                  },
                ],
              },
            ],
          });
        }
        return jsonResponse({ detail: `Unhandled path ${url.pathname}` }, 404);
      },
    });

    const runCliAsync = async (
      args: string[],
      envOverrides: Record<string, string | undefined> = {},
    ) => {
      const proc = Bun.spawn([process.execPath, "scripts/pims.ts", ...args], {
        cwd: REPO_ROOT,
        env: {
          ...process.env,
          PIMS_BASE_URL: `http://127.0.0.1:${mockServer.port}`,
          PIMS_SCHEMA: "unsa",
          PIMS_USERNAME: "grupob4",
          PIMS_PASSWORD: "pw",
          PIMS_TOKEN_CACHE_PATH: cachePath,
          ...envOverrides,
        },
        stdout: "pipe",
        stderr: "pipe",
      });
      const [stdout, stderr, exitCode] = await Promise.all([
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text(),
        proc.exited,
      ]);
      return { stdout, stderr, exitCode };
    };

    try {
      // 1. docs add-version --dry-run rejects non-G4 doc
      const docDryRun = await runCliAsync([
        "docs",
        "add-version",
        "5",
        "--file",
        samplePdf,
        "--file-name",
        "POL-01_v2.pdf",
        "--summary",
        "Bump",
        "--dry-run",
        "--json",
      ]);
      expect(docDryRun.exitCode).toBe(1);
      expect(docDryRun.stderr).toContain("TenantGuardViolationError");

      // 2. incidents update & attach --dry-run reject INC-011
      const updDryRun = await runCliAsync([
        "incidents",
        "update",
        "INC-011",
        "--status",
        "C",
        "--dry-run",
        "--json",
      ]);
      expect(updDryRun.exitCode).toBe(1);
      expect(updDryRun.stderr).toContain("TenantGuardViolationError");

      const attDryRun = await runCliAsync([
        "incidents",
        "attach",
        "INC-011",
        "--file",
        sampleTxt,
        "--dry-run",
        "--json",
      ]);
      expect(attDryRun.exitCode).toBe(1);
      expect(attDryRun.stderr).toContain("TenantGuardViolationError");

      // 3. incidents create enforces --incident-type and adds G4- prefix + involves_personal_data
      const incMissingType = await runCliAsync([
        "incidents",
        "create",
        "--code",
        "G4-INC-99",
        "--title",
        "Missing Type",
        "--dry-run",
      ]);
      expect(incMissingType.exitCode).toBe(1);
      expect(incMissingType.stderr).toContain("UA, DL, MW, PH, DS, HE, DV, OT");

      const incCreateDry = await runCliAsync([
        "incidents",
        "create",
        "--code",
        "G4-INC-99",
        "--title",
        "Leak Event",
        "--incident-type",
        "DL",
        "--involves-personal-data",
        "false",
        "--dry-run",
        "--json",
      ]);
      expect(incCreateDry.exitCode).toBe(2);
      const dryPayload = JSON.parse(incCreateDry.stdout) as {
        fields: Record<string, unknown>;
      };
      expect(dryPayload.fields.title).toBe("G4-INC-99: Leak Event");
      expect(dryPayload.fields.incident_type).toBe("DL");
      expect(dryPayload.fields.involves_personal_data).toBe(false);

      // 4. incidents get --json omits history by default, keeps actions/attachments, --with-history includes it
      const incGetJson = await runCliAsync(["incidents", "get", "INC-013", "--json"]);
      expect(incGetJson.exitCode).toBe(0);
      const incObj = JSON.parse(incGetJson.stdout) as Record<string, unknown>;
      expect(incObj.history).toBeUndefined();
      expect(incObj.history_count).toBe(1);
      expect(Array.isArray(incObj.actions)).toBe(true);
      expect(Array.isArray(incObj.attachments)).toBe(true);

      const incGetWithHist = await runCliAsync(["incidents", "get", "INC-013", "--with-history", "--json"]);
      expect(incGetWithHist.exitCode).toBe(0);
      const incHistObj = JSON.parse(incGetWithHist.stdout) as Record<string, unknown>;
      expect(Array.isArray(incHistObj.history)).toBe(true);

      // 5. incidents get --compact prints per-action lines with [evidencia: SI/NO]
      const incGetCompact = await runCliAsync(["incidents", "get", "INC-013", "--compact"]);
      expect(incGetCompact.exitCode).toBe(0);
      expect(incGetCompact.stdout).toContain("#0 C | DPO | 2026-11-25 | [evidencia: SI]");
      expect(incGetCompact.stdout).toContain("#1 A | SecOps | 2026-11-26 | [evidencia: NO]");

      // 6. docs versions --compact prints up to 240 chars of change_summary
      const docsVerCompact = await runCliAsync(["docs", "versions", "G4-POL-01", "--compact"]);
      expect(docsVerCompact.exitCode).toBe(0);
      expect(docsVerCompact.stdout).toContain(`${"A".repeat(235)}12...`);
      expect(docsVerCompact.stdout).not.toContain("1234567890");

      // 7. audits list --dedupe and audits get --dedupe display Findings: 2 and Actions: 3
      const auditsCompact = await runCliAsync(["audits", "list", "--dedupe", "--compact"]);
      expect(auditsCompact.exitCode).toBe(0);
      expect(auditsCompact.stdout).toContain("Findings: 2");
      expect(auditsCompact.stdout).toContain("Actions: 3");

      const auditsJson = await runCliAsync(["audits", "list", "--dedupe", "--json"]);
      expect(auditsJson.exitCode).toBe(0);
      const auditsJsonObj = JSON.parse(auditsJson.stdout) as {
        results: Array<{ findings_count: number; actions_count: number }>;
      };
      expect(auditsJsonObj.results[0].findings_count).toBe(2);
      expect(auditsJsonObj.results[0].actions_count).toBe(3);

      const auditGetCompact = await runCliAsync(["audits", "get", "1", "--dedupe", "--compact"]);
      expect(auditGetCompact.exitCode).toBe(0);
      expect(auditGetCompact.stdout).toContain("Findings: 2");
      expect(auditGetCompact.stdout).toContain("Actions: 3");

      const auditGetJson = await runCliAsync(["audits", "get", "1", "--dedupe", "--json"]);
      expect(auditGetJson.exitCode).toBe(0);
      const auditGetJsonObj = JSON.parse(auditGetJson.stdout) as {
        findings_count: number;
        actions_count: number;
      };
      expect(auditGetJsonObj.findings_count).toBe(2);
      expect(auditGetJsonObj.actions_count).toBe(3);

      // 8. diff fails fast with PimsVersionNotFoundError when version missing (never falls back to doc.file)
      const diffMissing = await runCliAsync(["diff", "G4-POL-01", "--from", "9.99", "--to", "2.00", "--json"]);
      expect(diffMissing.exitCode).toBe(1);
      const diffErr = JSON.parse(diffMissing.stderr) as Record<string, unknown>;
      expect(diffErr.error).toBe("PimsVersionNotFoundError");
      expect(diffErr.status).toBe(404);
      expect(String(diffErr.message)).toContain("G4-POL-01");
      expect(String(diffErr.message)).toContain("9.99");
      expect(String(diffErr.message)).toContain("1.00, 2.00");
    } finally {
      mockServer.stop(true);
    }

    // 9. Network refusal produces status 0 and explicit login endpoint in CLI --json
    const closedServer = Bun.serve({ port: 0, hostname: "127.0.0.1", fetch: () => new Response("ok") });
    const deadPort = closedServer.port;
    closedServer.stop(true);

    const netRefusedCli = await runCliAsync(["docs", "list", "--json"], {
      PIMS_BASE_URL: `http://127.0.0.1:${deadPort}`,
      PIMS_TOKEN_CACHE_PATH: path.join(dir, "dead-port-cache.json"),
    });
    expect(netRefusedCli.exitCode).toBe(1);
    const netErr = JSON.parse(netRefusedCli.stderr) as Record<string, unknown>;
    expect(netErr.error).toBe("PimsAuthError");
    expect(netErr.status).toBe(0);
    expect(netErr.endpoint).toBe(`http://127.0.0.1:${deadPort}/business/login/`);
  });
});
