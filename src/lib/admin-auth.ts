/**
 * Admin auth — a single shared password gate for /admin.
 *
 * There is no JWT/user system in the storefront yet, so this is intentionally
 * minimal: one ADMIN_PASSWORD env var. The cookie never stores the raw
 * password — it stores a SHA-256 token derived from it, so a leaked cookie
 * doesn't reveal the password, and rotating the env var invalidates old cookies.
 *
 * Uses Web Crypto (globalThis.crypto.subtle) so the same helper works in both
 * the Node runtime (API routes) and the Edge runtime (middleware).
 */

export const ADMIN_COOKIE = "biw_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

/** Is the admin gate configured at all? */
export function isAdminConfigured(): boolean {
  return adminPassword().length > 0;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** The cookie value expected for the currently-configured password. */
export async function expectedToken(): Promise<string | null> {
  const pw = adminPassword();
  if (!pw) return null;
  return sha256Hex(`biw-admin::${pw}`);
}

/** Verify a password the user typed at the login form. */
export function verifyPassword(input: string): boolean {
  const pw = adminPassword();
  return pw.length > 0 && input === pw;
}

/** Verify a cookie token presented on a guarded request. */
export async function isValidToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const expected = await expectedToken();
  return expected != null && token === expected;
}
