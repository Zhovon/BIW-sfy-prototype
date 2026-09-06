import { NextRequest, NextResponse } from "next/server";
import { validatePayment, paymentMatchesOrder } from "@/lib/sslcommerz";
import { markOrder, getOrder } from "@/lib/orders";
import { withApiLog } from "@/lib/analytics";

export const runtime = "nodejs";

/**
 * Server-to-server IPN — the authoritative confirmation channel (fires even if
 * the customer closes the browser before redirect). Idempotent: markOrder never
 * regresses a "paid" order, so repeated IPNs are safe.
 */
export const POST = withApiLog(async (req: NextRequest) => {
  const form = await req.formData();
  const tranId = String(form.get("tran_id") || "");
  const valId = String(form.get("val_id") || "");
  const status = String(form.get("status") || "");

  if (!tranId) return NextResponse.json({ ok: false }, { status: 400 });

  if (status === "VALID" || status === "VALIDATED") {
    const order = await getOrder(tranId);
    const v = valId ? await validatePayment(valId) : { ok: false as const };
    if (order && v.ok && paymentMatchesOrder(v, order)) {
      await markOrder(tranId, "paid", v.valId);
      return NextResponse.json({ ok: true });
    }
    // VALID status but validation/cross-check failed — never mark paid. Leave
    // the order untouched so a genuine retry (or the success callback) can still
    // confirm it; a mismatch here is a tampering signal.
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (status === "FAILED") await markOrder(tranId, "failed");
  if (status === "CANCELLED") await markOrder(tranId, "cancelled");
  return NextResponse.json({ ok: true });
});
