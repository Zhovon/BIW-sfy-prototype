"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatBDT } from "@/lib/catalog";

export default function CheckoutPage() {
  // Online checkout is for retail products only — services are booked via the
  // CRM widget and paid at the salon, so they never enter the payment total.
  const { retailItems, retailSubtotal } = useCart();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  async function pay() {
    setError("");
    if (!form.name || !form.email || !form.phone) {
      setError("Please fill in your name, email and phone.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: retailItems.map((i) => ({ handle: i.handle, qty: i.qty })),
          customer: form,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start payment");
      window.location.href = data.url; // redirect to SSLCommerz hosted page
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  if (retailItems.length === 0) {
    return (
      <div className="wrap py-24 text-center">
        <h1 className="font-display text-4xl mb-4">Checkout</h1>
        <p className="text-muted mb-8">You have no products to pay for online.</p>
        <Link href="/book" className="btn btn--gold">Book a service</Link>
      </div>
    );
  }

  const field = "w-full border border-line bg-paper px-4 py-3 text-sm focus:border-ink outline-none";

  return (
    <div className="wrap py-14">
      <h1 className="font-display text-4xl text-center mb-10">Checkout</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-12 max-w-5xl mx-auto">
        {/* customer details */}
        <div>
          <h2 className="font-display text-2xl mb-5">Your details</h2>
          <div className="space-y-4">
            <input className={field} placeholder="Full name *" value={form.name} onChange={set("name")} />
            <input className={field} placeholder="Email *" type="email" value={form.email} onChange={set("email")} />
            <input className={field} placeholder="Phone (e.g. 01XXXXXXXXX) *" value={form.phone} onChange={set("phone")} />
            <input className={field} placeholder="Address (optional)" value={form.address} onChange={set("address")} />
          </div>
          {error && <p className="text-[#a24a3c] text-sm mt-4">{error}</p>}
          <p className="text-xs text-muted mt-5">
            You&rsquo;ll be redirected to SSLCommerz to pay securely with bKash, Nagad, Rocket or card.
          </p>
        </div>

        {/* summary */}
        <aside className="bg-ice border border-line p-7 h-fit">
          <h2 className="font-display text-2xl mb-5">Order Summary</h2>
          <div className="divide-y divide-line mb-5">
            {retailItems.map((i) => (
              <div key={i.handle} className="flex justify-between py-2.5 text-sm">
                <span className="text-ink/80">{i.title} × {i.qty}</span>
                <span className="whitespace-nowrap">{formatBDT(i.price * i.qty)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-medium border-t border-line pt-4 mb-6">
            <span>Total</span>
            <span>{formatBDT(retailSubtotal)}</span>
          </div>
          <button className="btn w-full !bg-gold !border-gold disabled:opacity-50" onClick={pay} disabled={loading}>
            {loading ? "Redirecting…" : "Pay with SSLCommerz"}
          </button>
          <Link href="/cart" className="block text-center text-xs text-muted mt-4 hover:text-ink">Back to cart</Link>
        </aside>
      </div>
    </div>
  );
}
