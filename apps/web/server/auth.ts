import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_TTL_SECONDS,
} from "../shared/constants.ts";
import type { AuthRole } from "../shared/protocol.ts";

export interface VerifiedCookieSession {
  role: AuthRole;
}

interface AuthCookiePayload {
  role: AuthRole;
  exp: number;
  iat: number;
}

const LOOPBACK_ADDRESSES = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

function sha256Digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

/**
 * Compares two token strings in constant time by hashing both to fixed 32-byte SHA-256
 * digests before `timingSafeEqual`, preventing length-oracle timing leaks.
 */
export function constantTimeTokenEqual(candidate: string, expected: string): boolean {
  const a = sha256Digest(candidate);
  const b = sha256Digest(expected);
  return timingSafeEqual(a, b);
}

export function verifyToken(
  candidate: string | null | undefined,
  rwToken: string,
  roToken: string | null,
): AuthRole | null {
  if (typeof candidate !== "string" || candidate.length === 0) {
    return null;
  }
  if (rwToken.length > 0 && constantTimeTokenEqual(candidate, rwToken)) {
    return "rw";
  }
  if (roToken !== null && roToken.length > 0 && constantTimeTokenEqual(candidate, roToken)) {
    return "ro";
  }
  return null;
}

function signPayload(payloadB64: string, cookieSecret: string): Buffer {
  return createHmac("sha256", cookieSecret).update(payloadB64, "utf8").digest();
}

export function createSignedCookieValue(
  role: AuthRole,
  cookieSecret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): string {
  if (cookieSecret.length === 0) {
    throw new Error("cookieSecret must not be empty");
  }
  const payload: AuthCookiePayload = {
    role,
    iat: nowSeconds,
    exp: nowSeconds + AUTH_COOKIE_TTL_SECONDS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sigB64 = signPayload(payloadB64, cookieSecret).toString("base64url");
  return `${payloadB64}.${sigB64}`;
}

export function buildSessionCookie(
  role: AuthRole,
  cookieSecret: string,
  isSecure: boolean,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): string {
  const value = createSignedCookieValue(role, cookieSecret, nowSeconds);
  const parts = [
    `${AUTH_COOKIE_NAME}=${value}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${AUTH_COOKIE_TTL_SECONDS}`,
  ];
  if (isSecure) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

export function buildLogoutCookie(isSecure: boolean): string {
  const parts = [
    `${AUTH_COOKIE_NAME}=`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    "Max-Age=0",
  ];
  if (isSecure) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

function extractCookieValue(cookieHeader: string | null | undefined, name: string): string | null {
  if (typeof cookieHeader !== "string" || cookieHeader.trim().length === 0) {
    return null;
  }
  const pairs = cookieHeader.split(";");
  for (const rawPair of pairs) {
    const eqIndex = rawPair.indexOf("=");
    if (eqIndex <= 0) {
      continue;
    }
    const key = rawPair.slice(0, eqIndex).trim();
    if (key === name) {
      return rawPair.slice(eqIndex + 1).trim();
    }
  }
  return null;
}

export function verifyAuthCookie(
  cookieHeader: string | null | undefined,
  cookieSecret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): VerifiedCookieSession | null {
  if (cookieSecret.length === 0) {
    return null;
  }

  const rawValue = extractCookieValue(cookieHeader, AUTH_COOKIE_NAME);
  if (rawValue === null || rawValue.length === 0) {
    return null;
  }

  const dotIndex = rawValue.indexOf(".");
  if (dotIndex <= 0 || rawValue.indexOf(".", dotIndex + 1) !== -1) {
    return null;
  }

  const payloadB64 = rawValue.slice(0, dotIndex);
  const sigB64 = rawValue.slice(dotIndex + 1);
  if (payloadB64.length === 0 || sigB64.length === 0) {
    return null;
  }

  let providedSig: Buffer;
  try {
    providedSig = Buffer.from(sigB64, "base64url");
  } catch {
    return null;
  }

  const expectedSig = signPayload(payloadB64, cookieSecret);
  if (providedSig.byteLength !== expectedSig.byteLength) {
    return null;
  }
  if (!timingSafeEqual(providedSig, expectedSig)) {
    return null;
  }

  let parsed: unknown;
  try {
    const payloadJson = Buffer.from(payloadB64, "base64url").toString("utf8");
    parsed = JSON.parse(payloadJson);
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return null;
  }

  const record = parsed as Record<string, unknown>;
  const role = record.role;
  const exp = record.exp;
  const iat = record.iat;

  if (role !== "rw" && role !== "ro") {
    return null;
  }
  if (typeof exp !== "number" || !Number.isFinite(exp)) {
    return null;
  }
  if (typeof iat !== "number" || !Number.isFinite(iat)) {
    return null;
  }
  if (exp <= nowSeconds) {
    return null;
  }

  return { role };
}

export function isLoopbackAddress(ip: string | null | undefined): boolean {
  if (typeof ip !== "string") {
    return false;
  }
  const normalized = ip.trim().toLowerCase();
  return LOOPBACK_ADDRESSES.has(normalized);
}

export function authenticateRequest(
  req: Request,
  authConfig: {
    rwToken: string;
    roToken: string | null;
    devNoAuth: boolean;
    cookieSecret: string;
  },
): VerifiedCookieSession | null {
  if (authConfig.devNoAuth) {
    return { role: "rw" };
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== null && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length).trim();
    const role = verifyToken(token, authConfig.rwToken, authConfig.roToken);
    if (role !== null) {
      return { role };
    }
    return null;
  }

  const cookieHeader = req.headers.get("cookie");
  return verifyAuthCookie(cookieHeader, authConfig.cookieSecret);
}
