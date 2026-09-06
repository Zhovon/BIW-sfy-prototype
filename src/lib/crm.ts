import { getProduct } from "@/lib/catalog";
import type { CartItem } from "@/lib/cart";

/**
 * The CRM app hosts the booking widget (availability grid + appointment POST +
 * confirmation email). We embed its `/book` page rather than reimplementing the
 * scheduler — the same widget the Shopify cart embeds. Override per-env with
 * NEXT_PUBLIC_CRM_URL (e.g. a preview/staging CRM).
 */
export const CRM_URL = (process.env.NEXT_PUBLIC_CRM_URL || "https://crm.biw.salon").replace(/\/$/, "");

/**
 * Shopify product IDs for the service cart items, repeated once per unit —
 * qty 2 means "booked for two people", which the widget prices/times per unit.
 * The CRM matches these against its catalog by `shopify_product_id`.
 */
export function serviceProductIds(serviceItems: CartItem[]): string[] {
  const ids: string[] = [];
  for (const item of serviceItems) {
    const pid = getProduct(item.handle)?.shopify_product_id;
    if (pid == null) continue;
    for (let n = 0; n < item.qty; n++) ids.push(String(pid));
  }
  return ids;
}

/** URL of the reused CRM booking widget, preloaded with these service IDs. */
export function bookingWidgetUrl(ids: string[]): string {
  const qs = ids.length ? `?cart=${encodeURIComponent(ids.join(","))}` : "";
  return `${CRM_URL}/book${qs}`;
}
