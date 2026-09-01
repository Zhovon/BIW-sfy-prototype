import { NextRequest, NextResponse } from "next/server";
import { markOrder } from "@/lib/orders";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const tranId = String(form.get("tran_id") || "");
  const base = new URL(req.url).origin;
  if (tranId) await markOrder(tranId, "cancelled");
  return NextResponse.redirect(`${base}/checkout/cancelled?reason=cancelled`, 303);
}
