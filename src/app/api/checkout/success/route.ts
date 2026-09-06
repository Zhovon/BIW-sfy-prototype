import { NextRequest, NextResponse } from "next/server";
import { validatePayment, paymentMatchesOrder } from "@/lib/sslcommerz";
import { markOrder, getOrder } from "@/lib/orders";
import { withApiLog } from "@/lib/analytics";

export const runtime = "nodejs";

/** SSLCommerz POSTs here on successful payment. Validate before trusting it. */
export const POST = withApiLog(async (req: NextRequest) => {
  const form = await req.formData();
  const tranId = String(form.get("tran_id") || "");
  const valId = String(form.get("val_id") || "");
  const base = new URL(req.url).origin;

  const order = await getOrder(tranId);
  if (!order) {
    return NextResponse.redirect(`${base}/checkout/cancelled?reason=unknown`, 303);
  }

  // Confirm with the gateway's validator, then cross-check the validated figures
  // against this order — the POST alone (and even a VALID status) is not proof
  // the right amount was paid for the right transaction.
  const v = valId ? await validatePayment(valId) : { ok: false as const };
  if (!v.ok || !paymentMatchesOrder(v, order)) {
    await markOrder(tranId, "failed");
    return NextResponse.redirect(`${base}/checkout/cancelled?reason=unverified`, 303);
  }

  await markOrder(tranId, "paid", v.valId);
  return NextResponse.redirect(`${base}/checkout/success?order=${encodeURIComponent(tranId)}`, 303);
});
