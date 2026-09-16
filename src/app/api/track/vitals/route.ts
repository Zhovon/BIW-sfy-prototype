import { NextResponse } from "next/server";
import { logVital, clientMeta } from "@/lib/analytics";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";

/** Metrics the admin Speed page understands — anything else is dropped. */
const METRICS = new Set(["LCP", "INP", "CLS", "FCP", "TTFB"]);
const RATINGS = new Set(["good", "needs-improvement", "poor"]);

/**
 * Core Web Vitals beacon from the Vitals client component. IP + user-agent are
 * read server-side; the client only reports the metric itself. Unauthenticated
 * by design — it fires from every public page load — but tightly validated and
 * rate-limited so it can't be used as a log-flooding vector.
 */
export async function POST(req: Request) {
  // A page load reports at most 5 metrics; 30/min per IP is generous.
  const rl = rateLimit(`vitals:${clientIp(req)}`, { limit: 30, windowMs: 60_000 });
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  let name = "";
  let value = 0;
  let rating = "good";
  let path = "/";
  try {
    const body = await req.json();
    if (typeof body?.name === "string" && METRICS.has(body.name)) name = body.name;
    if (typeof body?.value === "number" && Number.isFinite(body.value) && body.value >= 0) {
      value = Math.min(body.value, 600_000); // sanity cap: 10 min of ms
    }
    if (typeof body?.rating === "string" && RATINGS.has(body.rating)) rating = body.rating;
    if (typeof body?.path === "string" && body.path.startsWith("/")) path = body.path.slice(0, 300);
  } catch {
    /* malformed beacon — dropped below */
  }

  // Silently ignore invalid/unknown metrics rather than 4xx-ing the beacon.
  if (name) {
    const m = clientMeta(req);
    await logVital({
      ts: new Date().toISOString(),
      name,
      value,
      rating,
      path,
      ip: m.ip,
      ua: m.ua,
    });
  }

  return NextResponse.json({ ok: true });
}