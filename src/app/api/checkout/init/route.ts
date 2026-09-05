import { NextRequest, NextResponse } from "next/server";
import { initSession } from "@/lib/sslcommerz";
import { priceCart, createOrder } from "@/lib/orders";
import { withApiLog } from "@/lib/analytics";

export const runtime = "nodejs";

export const POST = withApiLog(async (req: NextRequest) => {
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
  await createOrder({
    tranId,
    lines,
    amount,
    customer: { name, email, phone, address: address || "" },
  });

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
