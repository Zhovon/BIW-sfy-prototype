import { NextResponse } from "next/server";
import { logAccess, clientMeta } from "@/lib/analytics";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Public page-view beacon. The client sends { path, referrer }; the IP, country
 * and user-agent are read server-side from request headers (never trust the
 * client for those). Intentionally unauthenticated — it's called from every
 * public page load.
 */
export async function POST(req: Request) {
  // Cap log flooding: 120 page-view beacons per minute per IP.
  const rl = rateLimit(`track:${clientIp(req)}`, { limit: 120, windowMs: 60_000 });
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  let path = "/";
  let referrer: string | null = null;
  try {
    const body = await req.json();
    if (typeof body?.path === "string") path = body.path;
    if (typeof body?.referrer === "string" && body.referrer) referrer = body.referrer;
  } catch {
    /* malformed beacon — still log the hit with defaults */
  }

  const m = clientMeta(req);
  // Never fail the beacon over a storage error (e.g. read-only FS on
  // serverless) — the visit is simply not recorded.
  await logAccess({
    ts: new Date().toISOString(),
    path,
    ip: m.ip,
    country: m.country,
    ua: m.ua,
    // Prefer the client-reported document.referrer; fall back to the Referer header.
    referrer: referrer ?? m.referrer,
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
