import { NextRequest, NextResponse } from "next/server";
import { initSession } from "@/lib/sslcommerz";
import { priceCart, createOrder } from "@/lib/orders";
import { orderNotificationEmail, orderCustomerEmail } from "@/lib/email-templates";
import type { Order } from "@/lib/order-types";
import { withApiLog } from "@/lib/analytics";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rate-limit";

export const runtime = "nodejs";

// "floor" (default) = pay in person at the clinic, no online gateway.
// "online" = redirect to SSLCommerz. Flip via the CHECKOUT_MODE env var.
const CHECKOUT_MODE = (process.env.CHECKOUT_MODE || "floor").toLowerCase();

type Mail = { subject: string; html: string; text: string };

async function send(apiKey: string, from: string, to: string, mail: Mail): Promise<void> {
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject: mail.subject, html: mail.html, text: mail.text }),
  }).catch(() => null);
}

/**
 * Best-effort emails for a new pay-at-the-clinic order — a staff alert (there's no
 * payment callback, so this is how the team hears about it) and a customer
 * confirmation/receipt. Never blocks the order; the row is saved regardless.
 */
async function sendOrderEmails(order: Order): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const staffTo = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM || "BIW Website <noreply@biw.beauty>";
  if (!apiKey) return; // email not configured — order still saved, visible in /admin/orders
  await Promise.allSettled([
    staffTo ? send(apiKey, from, staffTo, orderNotificationEmail(order)) : Promise.resolve(),
    order.customer.email ? send(apiKey, from, order.customer.email, orderCustomerEmail(order)) : Promise.resolve(),
  ]);
}

export const POST = withApiLog(async (req: NextRequest) => {
  // Cap order/session spam: 15 checkout inits per 10 min per IP.
  const rl = rateLimit(`checkout-init:${clientIp(req)}`, { limit: 15, windowMs: 10 * 60_000 });
  if (!rl.ok) return tooManyRequests(rl.retryAfter);

  const body = await req.json().catch(() => null);
  if (!body?.cart || !Array.isArray(body.cart) || !body.customer) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { name, email, phone, address } = body.customer;
  if (!name || !email || !phone) {
    return NextResponse.json({ error: "Name, email and phone are required" }, { status: 400 });
  }

  // Recompute authoritative totals from the catalog — never trust client prices.
  const { lines, amount } = priceCart(body.cart);
  if (lines.length === 0 || amount <= 0) {
    return NextResponse.json({ error: "Cart is empty or invalid" }, { status: 400 });
  }

  const tranId = `BIW-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const order = await createOrder({
    tranId,
    lines,
    amount,
    customer: { name, email, phone, address: address || "" },
    payment: CHECKOUT_MODE === "online" ? "online" : "floor",
  });

  // Pay at the clinic: the order is recorded as `pending`; no online gateway.
  // Notify staff by email (best-effort) and let the client show a confirmation.
  if (CHECKOUT_MODE !== "online") {
    await sendOrderEmails(order);
    return NextResponse.json({ payAtFloor: true, tranId });
  }

  const result = await initSession({
    tranId,
    amount,
    customer: { name, email, phone, address: address || "" },
    productName: lines.map((l) => l.title).join(", "),
    numItems: lines.reduce((n, l) => n + l.qty, 0),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.reason, tranId }, { status: 502 });
  }
  return NextResponse.json({ url: result.gatewayUrl, tranId });
});
