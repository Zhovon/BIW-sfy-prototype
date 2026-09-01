import { NextRequest, NextResponse } from "next/server";
import { validatePayment } from "@/lib/sslcommerz";
import { markOrder } from "@/lib/orders";

export const runtime = "nodejs";

/**
 * Server-to-server IPN — the authoritative confirmation channel (fires even if
 * the customer closes the browser before redirect). Idempotent: markOrder never
 * regresses a "paid" order, so repeated IPNs are safe.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const tranId = String(form.get("tran_id") || "");
  const valId = String(form.get("val_id") || "");
  const status = String(form.get("status") || "");

  if (!tranId) return NextResponse.json({ ok: false }, { status: 400 });

  if (status === "VALID" || status === "VALIDATED") {
    const valid = valId ? await validatePayment(valId) : false;
    if (valid) {
      await markOrder(tranId, "paid", valId);
      return NextResponse.json({ ok: true });
    }
  }
  if (status === "FAILED") await markOrder(tranId, "failed");
  if (status === "CANCELLED") await markOrder(tranId, "cancelled");
  return NextResponse.json({ ok: true });
}
