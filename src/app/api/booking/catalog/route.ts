import { NextResponse } from "next/server";
import { withApiLog } from "@/lib/analytics";
import { fetchCatalog } from "@/lib/crm";

export const runtime = "nodejs";

/**
 * Bookable services + branches for the native booking flow. Proxies the CRM's
 * public catalog server-side so the browser stays same-origin. Cached at the
 * edge for a few minutes — the catalog changes rarely.
 */
export const GET = withApiLog(async () => {
  try {
    const catalog = await fetchCatalog();
    return NextResponse.json(catalog, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not load booking options right now. Please try again shortly." },
      { status: 502 },
    );
  }
});
