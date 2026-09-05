import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  expectedToken,
  isAdminConfigured,
  verifyPassword,
} from "@/lib/admin-auth";
import { withApiLog } from "@/lib/analytics";

export const POST = withApiLog(async (req: Request) => {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Admin is not configured. Set ADMIN_PASSWORD in the environment." },
      { status: 503 },
    );
  }

  let password = "";
  let next = "/admin";
  try {
    const body = await req.json();
    password = typeof body?.password === "string" ? body.password : "";
    if (typeof body?.next === "string" && body.next.startsWith("/admin")) next = body.next;
  } catch {
    /* malformed body → treated as empty password below */
  }

  if (!verifyPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = await expectedToken();
  const res = NextResponse.json({ ok: true, next });
  res.cookies.set(ADMIN_COOKIE, token!, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return res;
});
