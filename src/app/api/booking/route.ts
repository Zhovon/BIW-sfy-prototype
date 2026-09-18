import { NextRequest, NextResponse } from "next/server";
import { withApiLog } from "@/lib/analytics";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rate-limit";
import { createAppointment } from "@/lib/crm";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

/**
 * Create an appointment. This is the call that browser CORS would block against
 * the CRM (biw.beauty isn't on its allowlist), so the storefront makes it
 * server-to-server here. We validate the shape, then let the CRM be the
 * authority on price/duration/status. Rate-limited to blunt booking spam.
 */
export const POST = withApiLog(async (req: NextRequest) => {
  const rl = rateLimit(`booking:${clientIp(req)}`, { limit: 10, windowMs: 10 * 60_000 });
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const body = await req.json().catch(() => null);
  const name = String(body?.customer_name ?? "").trim();
  const phone = String(body?.customer_phone ?? "").trim();
  const emailRaw = String(body?.customer_email ?? "").trim();
  const branchId = String(body?.branch_id ?? "").trim();
  const date = String(body?.date ?? "").trim();
  const time = String(body?.time ?? "").trim();
  const serviceIds = Array.isArray(body?.service_ids)
    ? (body.service_ids as unknown[]).map((s) => String(s)).filter(Boolean)
    : [];

  if (!name || !phone) {
    return NextResponse.json({ error: "Name and phone number are required." }, { status: 400 });
  }
  if (serviceIds.length === 0) {
    return NextResponse.json({ error: "Please choose at least one service." }, { status: 400 });
  }
  if (!branchId || !DATE_RE.test(date) || !TIME_RE.test(time)) {
    return NextResponse.json({ error: "Please choose a branch, date and time." }, { status: 400 });
  }
  if (emailRaw && !EMAIL_RE.test(emailRaw)) {
    return NextResponse.json({ error: "That email address looks invalid." }, { status: 400 });
  }

  // Dhaka wall-clock labelled as UTC — the CRM's booking contract (14:00Z = 2pm Dhaka).
  const appointment_time = `${date}T${time}:00Z`;

  const result = await createAppointment({
    customer_name: name,
    customer_phone: phone,
    customer_email: emailRaw || null,
    service_ids: serviceIds,
    branch_id: branchId,
    appointment_time,
  });

  if (!result.ok) {
    // Surface the CRM's own message (e.g. slot taken) but never a 5xx as a 4xx.
    const status = result.status >= 400 && result.status < 500 ? result.status : 502;
    return NextResponse.json({ error: result.detail }, { status });
  }

  return NextResponse.json({ ok: true });
});
