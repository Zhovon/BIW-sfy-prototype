"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { CRM_URL, bookingWidgetUrl, serviceProductIds } from "@/lib/crm";

/**
 * Embeds the CRM's `/book` widget for the service items in the cart — the same
 * widget the Shopify storefront iframes. The widget owns the whole booking flow
 * (branch/date/time from the availability API, customer details, appointment
 * POST, confirmation email). We only:
 *   - seed it via `?cart=<shopify_product_ids>` on first load,
 *   - push live updates as `biw:cart-updated` when the cart changes, and
 *   - clear the booked services on `biw:booking-confirmed`.
 * Services are paid at the salon, so they never touch online checkout.
 */
export default function BookingWidget() {
  const { serviceItems, remove } = useCart();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [confirmed, setConfirmed] = useState(false);

  const ids = useMemo(() => serviceProductIds(serviceItems), [serviceItems]);

  // Set the iframe src exactly once. Later cart changes are pushed via
  // postMessage (below) so the widget doesn't reload and lose the user's
  // half-filled form — same contract the Shopify embed uses.
  const initialSrc = useRef(bookingWidgetUrl(ids));

  // Live cart → widget sync. Skip the first run (the initial `?cart=` already
  // seeded the widget) and stop once the booking is confirmed.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (confirmed) return;
    const w = iframeRef.current?.contentWindow;
    w?.postMessage({ type: "biw:cart-updated", ids }, CRM_URL);
  }, [ids, confirmed]);

  // Booking confirmed → clear the booked services from the cart, show success.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== CRM_URL) return;
      if (!e.data || e.data.type !== "biw:booking-confirmed") return;
      setConfirmed(true);
      serviceItems.forEach((i) => remove(i.handle));
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [serviceItems, remove]);

  if (confirmed) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-[#d1fae5] bg-[#ecfdf5] px-6 py-8 text-center text-[#065f46]">
        <p className="font-display text-2xl mb-2">✓ Your appointment is booked</p>
        <p className="text-sm">Payment is at the salon. A confirmation email is on its way.</p>
        <Link href="/collections/all" className="btn btn--ghost mt-6 inline-block">Continue browsing</Link>
      </div>
    );
  }

  if (ids.length === 0) {
    return (
      <div className="py-16 text-center text-muted">
        <p className="mb-6">You have no services to book yet.</p>
        <Link href="/pages/female-services" className="btn btn--gold">Browse services</Link>
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      src={initialSrc.current}
      title="Book your appointment"
      className="w-full rounded-2xl border border-line bg-transparent"
      style={{ height: 760 }}
    />
  );
}
