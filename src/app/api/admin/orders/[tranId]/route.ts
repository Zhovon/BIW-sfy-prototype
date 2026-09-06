import { NextResponse } from "next/server";
import { ADMIN_STATUSES, adminSetStatus, type OrderStatus } from "@/lib/orders";
import { withApiLog } from "@/lib/analytics";

/**
 * PATCH /api/admin/orders/:tranId  { status }
 * Guarded by middleware (the /admin cookie). Sets an order status manually.
 */
export const PATCH = withApiLog(async (
  req: Request,
  { params }: { params: Promise<{ tranId: string }> },
) => {
  const { tranId } = await params;

  let status: unknown;
  try {
    ({ status } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }

  if (typeof status !== "string" || !ADMIN_STATUSES.includes(status as OrderStatus)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const order = await adminSetStatus(tranId, status as OrderStatus);
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  return NextResponse.json({ ok: true, order });
});
