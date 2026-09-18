import { getProduct } from "@/lib/catalog";
import type { CartItem } from "@/lib/cart";

/**
 * Thin client for the CRM's public booking API. The storefront runs its OWN
 * native booking UI (see BookingFlow) and reaches the CRM through its own API
 * routes as a server-to-server proxy — so the browser never makes a cross-origin
 * call and no CRM CORS/CSP change is needed. These helpers run on the storefront
 * server (inside those routes), never in the browser.
 *
 * Override the backend per-env with CRM_API_BASE (e.g. a preview/staging CRM).
 */
export const CRM_API_BASE = (process.env.CRM_API_BASE || "https://bcrm.biw.salon").replace(/\/$/, "");

/** Corporate & Head Office is a back-office cost centre, not a bookable salon. */
const CORPORATE_BRANCH_ID = "branch-corporate";

export type CrmService = {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  category: string | null;
  shopify_product_id: string | null;
};

export type CrmBranch = { id: string; name: string; address?: string | null };

export type CrmSlot = { time: string; label: string; available: boolean };

export type BookingCatalog = { services: CrmService[]; branches: CrmBranch[] };

type RawService = {
  id: string;
  name: string;
  price: number | null;
  duration_minutes: number | null;
  category: string | null;
  shopify_product_id: string | number | null;
};
type RawBranch = { id: string; name: string; address?: string | null; is_active?: boolean };

/**
 * Load the bookable services + branches from the CRM. Services are slimmed to
 * the fields the booking UI needs and limited to those linked to a Shopify
 * product (the storefront catalog is keyed on `shopify_product_id`). Branches
 * drop the corporate cost centre and any inactive location. Cached briefly —
 * the catalog changes rarely and this is public data.
 */
export async function fetchCatalog(): Promise<BookingCatalog> {
  const [servicesRes, branchesRes] = await Promise.all([
    fetch(`${CRM_API_BASE}/api/v1/services`, { next: { revalidate: 300 } }),
    fetch(`${CRM_API_BASE}/api/v1/branches`, { next: { revalidate: 300 } }),
  ]);
  if (!servicesRes.ok || !branchesRes.ok) {
    throw new Error(`CRM catalog fetch failed (services ${servicesRes.status}, branches ${branchesRes.status})`);
  }

  const rawServices = (await servicesRes.json()) as RawService[];
  const rawBranches = (await branchesRes.json()) as RawBranch[];

  const services: CrmService[] = rawServices
    .filter((s) => s.shopify_product_id != null)
    .map((s) => ({
      id: s.id,
      name: s.name,
      price: Number(s.price ?? 0),
      duration_minutes: s.duration_minutes || 60,
      category: s.category,
      shopify_product_id: s.shopify_product_id == null ? null : String(s.shopify_product_id),
    }));

  const branches: CrmBranch[] = rawBranches
    .filter((b) => b.id !== CORPORATE_BRANCH_ID && b.is_active !== false)
    .map((b) => ({ id: b.id, name: b.name, address: b.address ?? null }));

  return { services, branches };
}

/** Available time slots for a branch/date, fitted to the total service duration. */
export async function fetchSlots(branchId: string, date: string, durationMinutes: number): Promise<CrmSlot[]> {
  const qs = new URLSearchParams({
    branch_id: branchId,
    date,
    duration_minutes: String(durationMinutes || 60),
  });
  const res = await fetch(`${CRM_API_BASE}/api/v1/availability/slots?${qs}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`CRM slots fetch failed (${res.status})`);
  const data = await res.json();
  return (data.slots ?? []) as CrmSlot[];
}

export type CreateAppointmentInput = {
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  service_ids: string[];
  branch_id: string;
  /** Dhaka wall-clock labelled as UTC, e.g. "2026-09-20T14:00:00Z" (CRM contract). */
  appointment_time: string;
};

export type CreateAppointmentResult =
  | { ok: true; appointment: unknown }
  | { ok: false; status: number; detail: string };

/**
 * Create the appointment via the CRM. This is the one call that CORS blocks for
 * a browser (biw.beauty isn't on the CRM's allowlist), so it MUST run here on
 * the server. The CRM ignores any client-supplied status/price and recomputes
 * them from its own rows — we still forward only the fields it expects.
 */
export async function createAppointment(input: CreateAppointmentInput): Promise<CreateAppointmentResult> {
  const res = await fetch(`${CRM_API_BASE}/api/v1/appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });
  if (res.ok) {
    return { ok: true, appointment: await res.json().catch(() => null) };
  }
  const body = await res.json().catch(() => null);
  const detail = typeof body?.detail === "string" ? body.detail : "Could not create the appointment.";
  return { ok: false, status: res.status, detail };
}

/**
 * Shopify product IDs for the service cart items, repeated once per unit — qty 2
 * means "booked for two people", which the CRM prices/times per unit. Used to
 * seed the booking flow from the cart.
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
