import { describe, expect, test } from "bun:test";
import { AUTH_COOKIE_NAME, AUTH_COOKIE_TTL_SECONDS } from "../shared/constants.ts";
import {
  authenticateRequest,
  buildLogoutCookie,
  buildSessionCookie,
  createSignedCookieValue,
  isLoopbackAddress,
  verifyAuthCookie,
  verifyToken,
} from "./auth.ts";

const RW_TOKEN = "rw-super-secret-token-123456";
const RO_TOKEN = "ro-viewer-token-789";
const COOKIE_SECRET = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

describe("verifyToken", () => {
  test("recognizes RW and RO tokens and rejects invalid candidates", () => {
    expect(verifyToken(RW_TOKEN, RW_TOKEN, RO_TOKEN)).toBe("rw");
    expect(verifyToken(RO_TOKEN, RW_TOKEN, RO_TOKEN)).toBe("ro");
    expect(verifyToken("short", RW_TOKEN, RO_TOKEN)).toBeNull();
    expect(verifyToken(`${RW_TOKEN}x`, RW_TOKEN, RO_TOKEN)).toBeNull();
    expect(verifyToken("", RW_TOKEN, RO_TOKEN)).toBeNull();
    expect(verifyToken(null, RW_TOKEN, RO_TOKEN)).toBeNull();
    expect(verifyToken(undefined, RW_TOKEN, RO_TOKEN)).toBeNull();
    expect(verifyToken(RO_TOKEN, RW_TOKEN, null)).toBeNull();
  });
});

describe("auth cookies", () => {
  test("round-trips signed RW and RO cookies", () => {
    const now = 1_700_000_000;
    const rwCookie = createSignedCookieValue("rw", COOKIE_SECRET, now);
    const roCookie = createSignedCookieValue("ro", COOKIE_SECRET, now);

    expect(
      verifyAuthCookie(`other=1; ${AUTH_COOKIE_NAME}=${rwCookie}; theme=dark`, COOKIE_SECRET, now + 10),
    ).toEqual({ role: "rw" });
    expect(
      verifyAuthCookie(`${AUTH_COOKIE_NAME}=${roCookie}`, COOKIE_SECRET, now + 10),
    ).toEqual({ role: "ro" });
  });

  test("rejects expired cookies", () => {
    const now = 1_700_000_000;
    const cookie = createSignedCookieValue("rw", COOKIE_SECRET, now);
    expect(
      verifyAuthCookie(
        `${AUTH_COOKIE_NAME}=${cookie}`,
        COOKIE_SECRET,
        now + AUTH_COOKIE_TTL_SECONDS,
      ),
    ).toBeNull();
  });

  test("rejects tampered payload or signature or wrong secret", () => {
    const now = 1_700_000_000;
    const cookie = createSignedCookieValue("ro", COOKIE_SECRET, now);
    const [payloadB64, sigB64] = cookie.split(".");

    const tamperedPayload = Buffer.from(
      JSON.stringify({ role: "rw", iat: now, exp: now + AUTH_COOKIE_TTL_SECONDS }),
      "utf8",
    ).toString("base64url");

    expect(verifyAuthCookie(`${AUTH_COOKIE_NAME}=${tamperedPayload}.${sigB64}`, COOKIE_SECRET, now)).toBeNull();
    expect(verifyAuthCookie(`${AUTH_COOKIE_NAME}=${payloadB64}.AAAA${sigB64.slice(4)}`, COOKIE_SECRET, now)).toBeNull();
    expect(verifyAuthCookie(`${AUTH_COOKIE_NAME}=${cookie}`, "wrong-secret", now)).toBeNull();
    expect(verifyAuthCookie(`${AUTH_COOKIE_NAME}=malformed`, COOKIE_SECRET, now)).toBeNull();
    expect(verifyAuthCookie("", COOKIE_SECRET, now)).toBeNull();
  });

  test("buildSessionCookie and buildLogoutCookie format secure flags correctly", () => {
    const now = 1_700_000_000;
    const secureHeader = buildSessionCookie("rw", COOKIE_SECRET, true, now);
    expect(secureHeader).toContain(`${AUTH_COOKIE_NAME}=`);
    expect(secureHeader).toContain("HttpOnly");
    expect(secureHeader).toContain("SameSite=Lax");
    expect(secureHeader).toContain(`Max-Age=${AUTH_COOKIE_TTL_SECONDS}`);
    expect(secureHeader).toContain("; Secure");

    const insecureHeader = buildSessionCookie("ro", COOKIE_SECRET, false, now);
    expect(insecureHeader).not.toContain("Secure");

    const logoutHeader = buildLogoutCookie(true);
    expect(logoutHeader).toContain(`${AUTH_COOKIE_NAME}=;`);
    expect(logoutHeader).toContain("Max-Age=0");
    expect(logoutHeader).toContain("; Secure");
  });
});

describe("isLoopbackAddress", () => {
  test("accepts only strict loopback addresses and fails closed otherwise", () => {
    expect(isLoopbackAddress("127.0.0.1")).toBe(true);
    expect(isLoopbackAddress("::1")).toBe(true);
    expect(isLoopbackAddress("::ffff:127.0.0.1")).toBe(true);
    expect(isLoopbackAddress("  ::FFFF:127.0.0.1  ")).toBe(true);

    expect(isLoopbackAddress("127.0.0.2")).toBe(false);
    expect(isLoopbackAddress("0.0.0.0")).toBe(false);
    expect(isLoopbackAddress("10.0.0.5")).toBe(false);
    expect(isLoopbackAddress("localhost")).toBe(false);
    expect(isLoopbackAddress("")).toBe(false);
    expect(isLoopbackAddress(null)).toBe(false);
    expect(isLoopbackAddress(undefined)).toBe(false);
  });
});

describe("authenticateRequest", () => {
  const cfg = {
    rwToken: RW_TOKEN,
    roToken: RO_TOKEN,
    devNoAuth: false,
    cookieSecret: COOKIE_SECRET,
  };

  test("authenticates Bearer token and signed cookie", () => {
    const bearerReq = new Request("http://localhost/api/test", {
      headers: { authorization: `Bearer ${RO_TOKEN}` },
    });
    expect(authenticateRequest(bearerReq, cfg)).toEqual({ role: "ro" });

    const cookieVal = createSignedCookieValue("rw", COOKIE_SECRET);
    const cookieReq = new Request("http://localhost/api/test", {
      headers: { cookie: `${AUTH_COOKIE_NAME}=${cookieVal}` },
    });
    expect(authenticateRequest(cookieReq, cfg)).toEqual({ role: "rw" });

    const unauthReq = new Request("http://localhost/api/test");
    expect(authenticateRequest(unauthReq, cfg)).toBeNull();
  });

  test("grants rw when devNoAuth is enabled", () => {
    const req = new Request("http://localhost/api/test");
    expect(authenticateRequest(req, { ...cfg, devNoAuth: true })).toEqual({ role: "rw" });
  });
});
