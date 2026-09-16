import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  expectedToken,
  isAdminConfigured,
  verifyPassword,
} from "@/lib/admin-auth";
import { withApiLog } from "@/lib/analytics";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rate-limit";

export const POST = withApiLog(async (req: Request) => {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin is not configured. Set ADMIN_PASSWORD in the environment." },
      { status: 503 },
    );
  }

  // Throttle brute-force password guessing: 8 attempts per 10 min per IP.
  const rl = rateLimit(`admin-login:${clientIp(req)}`, { limit: 8, windowMs: 10 * 60_000 });
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  let password = "";
  let next = "/admin";
  try {
    const body = await req.json();
    password = typeof body?.password === "string" ? body.password : "";
    if (typeof body?.next === "string" && body.next.startsWith("/admin")) next = body.next;
  } catch {
    /* malformed body → treated as empty password below */
  }

  if (!(await verifyPassword(password))) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = await expectedToken();
  const res = NextResponse.json({ ok: true, next });
  // `Secure` only when the request actually arrives over HTTPS (directly or via
  // a proxy) — keying it off NODE_ENV instead breaks the admin gate on any
  // plain-HTTP deployment, where the browser silently drops Secure cookies.
  const proto = req.headers.get("x-forwarded-proto")?.split(",")[0].trim() ?? new URL(req.url).protocol.replace(":", "");
  res.cookies.set(ADMIN_COOKIE, token!, {
    httpOnly: true,
    sameSite: "lax",
    secure: proto === "https",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return res;
});
