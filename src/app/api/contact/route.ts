import { NextRequest, NextResponse } from "next/server";
import { withApiLog } from "@/lib/analytics";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rate-limit";
import { staffNotificationEmail, customerAutoReplyEmail, type ContactSubmission } from "@/lib/email-templates";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ResendPayload = {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  reply_to?: string;
};

/** Send one email via Resend's REST API (no SDK). Returns ok flag only. */
async function sendEmail(apiKey: string, payload: ResendPayload): Promise<boolean> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => null);
  return !!res && res.ok;
}

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

  const submission: ContactSubmission = { name, email, phone, comment };

  // 1. Staff notification — this is the one that must succeed (it's how the
  //    salon learns about the enquiry), so its result drives the response.
  //    Reply-To is the customer, so hitting reply in the inbox answers them.
  const staff = staffNotificationEmail(submission);
  const staffOk = await sendEmail(apiKey, {
    from,
    to: [to],
    reply_to: email,
    subject: staff.subject,
    html: staff.html,
    text: staff.text,
  });

  if (!staffOk) {
    return NextResponse.json({ error: "Could not send your message. Please try again." }, { status: 502 });
  }

  // 2. Customer auto-reply — best-effort. If it fails we still succeeded (the
  //    salon was notified), so never fail the request on this. Reply-To points
  //    back to the salon inbox so a customer reply reaches the team.
  const reply = customerAutoReplyEmail(submission);
  await sendEmail(apiKey, {
    from,
    to: [email],
    reply_to: to,
    subject: reply.subject,
    html: reply.html,
    text: reply.text,
  }).catch(() => false);

  return NextResponse.json({ ok: true });
});
