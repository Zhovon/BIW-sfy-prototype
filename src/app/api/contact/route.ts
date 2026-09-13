import { NextRequest, NextResponse } from "next/server";
import { withApiLog } from "@/lib/analytics";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Contact form handler. Emails the submission to CONTACT_TO_EMAIL via Resend's
 * REST API (no SDK dependency). Requires RESEND_API_KEY + CONTACT_TO_EMAIL to be
 * set in the environment — otherwise returns 503 so the UI can say so honestly
 * rather than silently dropping the message (the old form did nothing at all).
 */
export const POST = withApiLog(async (req: NextRequest) => {
  const rl = rateLimit(`contact:${clientIp(req)}`, { limit: 5, windowMs: 10 * 60_000 });
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const phone = String(body?.phone ?? "").trim();
  const comment = String(body?.comment ?? "").trim();

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (!comment) {
    return NextResponse.json({ error: "Please include a message." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM || "BIW Website <noreply@biw.beauty>";
  if (!apiKey || !to) {
    return NextResponse.json(
      { error: "Contact form is not configured yet. Please reach us on WhatsApp." },
      { status: 503 }
    );
  }

  const text = [
    `Name: ${name || "—"}`,
    `Email: ${email}`,
    `Phone: ${phone || "—"}`,
    "",
    comment,
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `New contact form message${name ? ` from ${name}` : ""}`,
      text,
    }),
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json({ error: "Could not send your message. Please try again." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
});
