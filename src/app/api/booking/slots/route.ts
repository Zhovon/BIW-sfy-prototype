import { NextRequest, NextResponse } from "next/server";
import { withApiLog } from "@/lib/analytics";
import { fetchSlots } from "@/lib/crm";

export const runtime = "nodejs";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Time slots for a branch/date/duration. Proxies the CRM availability API
 * server-side. Params are validated so we never forward garbage to the CRM.
 */
export const GET = withApiLog(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const branchId = (searchParams.get("branch_id") || "").trim();
  const date = (searchParams.get("date") || "").trim();
  const duration = Number(searchParams.get("duration_minutes") || "60");

  if (!branchId || !DATE_RE.test(date)) {
    return NextResponse.json({ error: "branch_id and a valid date are required." }, { status: 400 });
  }
  if (!Number.isFinite(duration) || duration <= 0 || duration > 24 * 60) {
    return NextResponse.json({ error: "Invalid duration." }, { status: 400 });
  }

  try {
    const slots = await fetchSlots(branchId, date, duration);
    return NextResponse.json({ slots });
  } catch {
    return NextResponse.json({ error: "Could not load available times. Please try again." }, { status: 502 });
  }
});
