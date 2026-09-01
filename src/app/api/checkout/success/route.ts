import { NextRequest, NextResponse } from "next/server";
import { validatePayment } from "@/lib/sslcommerz";
import { markOrder, getOrder } from "@/lib/orders";

export const runtime = "nodejs";

/** SSLCommerz POSTs here on successful payment. Validate before trusting it. */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const tranId = String(form.get("tran_id") || "");
  const valId = String(form.get("val_id") || "");
  const base = new URL(req.url).origin;

  const order = await getOrder(tranId);
  if (!order) {
    return NextResponse.redirect(`${base}/checkout/cancelled?reason=unknown`, 303);
  }

  // Confirm with the gateway's validator — the POST alone is not proof of payment.
  const valid = valId ? await validatePayment(valId) : false;
  if (!valid) {
    await markOrder(tranId, "failed");
    return NextResponse.redirect(`${base}/checkout/cancelled?reason=unverified`, 303);
  }

  await markOrder(tranId, "paid", valId);
  return NextResponse.redirect(`${base}/checkout/success?order=${encodeURIComponent(tranId)}`, 303);
}
