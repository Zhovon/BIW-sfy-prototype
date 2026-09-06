/**
 * Minimal in-memory fixed-window rate limiter.
 *
 * Caveat (same shape as the file-based stores): on serverless each instance has
 * its own memory, so this is per-instance, not global. It meaningfully slows
 * brute-force/flooding on a warm instance and is fine for dev/preview, but for
 * hard production guarantees swap the store for Upstash Redis (same interface).
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_KEYS = 10_000; // guard against unbounded growth from spoofed IPs

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfter: number };

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    if (buckets.size >= MAX_KEYS) pruneExpired(now);
    buckets.set(key, { count: 1, resetAt: now + opts.windowMs });
    return { ok: true, remaining: opts.limit - 1 };
  }

  if (existing.count >= opts.limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) };
  }

  existing.count += 1;
  return { ok: true, remaining: opts.limit - existing.count };
}

function pruneExpired(now: number) {
  for (const [k, b] of buckets) {
    if (now >= b.resetAt) buckets.delete(k);
  }
}

/** Best-effort client IP from proxy headers (Vercel / reverse proxies). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for") || "";
  return xff.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

/** Standard 429 with a Retry-After header. */
export function tooManyRequests(retryAfter: number): Response {
  return new Response(JSON.stringify({ error: "Too many requests. Please slow down." }), {
    status: 429,
    headers: { "Content-Type": "application/json", "Retry-After": String(retryAfter) },
  });
}
