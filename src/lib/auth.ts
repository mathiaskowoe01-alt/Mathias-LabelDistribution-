/**
 * Auth helpers for the admin area.
 *
 * Production-grade:
 * - Sessions are HMAC-SHA256 signed tokens (impossible to forge without the secret)
 * - Login is rate-limited per IP (5 attempts / minute, in-memory)
 * - All secrets come from environment variables
 *
 * Required env vars:
 * - ADMIN_PASSWORD: the admin password (plain text, compared via timingSafeEqual)
 * - ADMIN_SESSION_SECRET: 32+ char random string used to sign session tokens
 *
 * Generate a strong secret with: openssl rand -hex 32
 */

const SESSION_COOKIE = "mrk_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours, in seconds
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_ATTEMPTS = 5;

// In-memory rate limiter (per IP, per minute).
// Note: on serverless platforms (Vercel), each instance has its own memory,
// so this is best-effort. For true distributed rate limiting, use Upstash Redis.
const rateLimitMap = new Map<string, number[]>();

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "ADMIN_SESSION_SECRET must be set in production (use `openssl rand -hex 32`)."
      );
    }
    // Dev fallback — DO NOT use in production
    return "dev-only-secret-please-set-ADMIN_SESSION_SECRET-in-production-xxxxxxxx";
  }
  return secret;
}

function getPassword(): string {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ADMIN_PASSWORD must be set in production.");
    }
    // Dev fallback — DO NOT use in production
    return "mrk2025";
  }
  return pwd;
}

/**
 * Sign a payload with HMAC-SHA256 using Web Crypto API (works in Node 18+ and Edge).
 * Returns a hex string.
 */
async function sign(payload: string): Promise<string> {
  const secret = getSecret();
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Create a signed session token: `<issuedAt>:<signature>`.
 * The signature covers `issuedAt` so the token can't be tampered with.
 */
export async function createSessionToken(): Promise<string> {
  const issuedAt = Date.now().toString();
  const sig = await sign(issuedAt);
  return `${issuedAt}.${sig}`;
}

/**
 * Verify a session token. Returns true if the signature is valid AND the token
 * has not expired (12h max age).
 */
export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [issuedAtStr, sig] = parts;
  const issuedAt = parseInt(issuedAtStr, 10);
  if (!Number.isFinite(issuedAt)) return false;

  // Check expiry
  const ageMs = Date.now() - issuedAt;
  if (ageMs < 0 || ageMs > SESSION_MAX_AGE * 1000) return false;

  // Recompute signature and compare
  const expectedSig = await sign(issuedAtStr);
  return timingSafeEqual(sig, expectedSig);
}

/**
 * Verify a candidate password against the configured ADMIN_PASSWORD.
 * Uses constant-time comparison.
 */
export async function verifyPassword(candidate: string): Promise<boolean> {
  return timingSafeEqual(candidate, getPassword());
}

/**
 * Check if an IP has exceeded the login rate limit.
 * Returns true if the request should be blocked.
 * Side-effect: records the attempt timestamp.
 */
export function checkRateLimit(ip: string): { blocked: boolean; remaining: number } {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  // Get existing timestamps, prune old ones
  const attempts = (rateLimitMap.get(ip) || []).filter((t) => t > windowStart);

  if (attempts.length >= RATE_LIMIT_MAX_ATTEMPTS) {
    rateLimitMap.set(ip, attempts);
    return { blocked: true, remaining: 0 };
  }

  // Record this attempt
  attempts.push(now);
  rateLimitMap.set(ip, attempts);
  return {
    blocked: false,
    remaining: RATE_LIMIT_MAX_ATTEMPTS - attempts.length,
  };
}

/**
 * Extract the client IP from a Next.js request.
 * Handles Vercel's x-forwarded-for header.
 */
export function getClientIP(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    return xff.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_COOKIE_MAX_AGE = SESSION_MAX_AGE;
