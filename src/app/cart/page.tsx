"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import { formatBDT } from "@/lib/catalog";

export default function CartPage() {
  const { items, subtotal, setQty, remove } = useCart();

  if (items.length === 0) {
    return (
      <div className="wrap py-24 text-center">
        <h1 className="font-display text-4xl mb-4">Your Cart</h1>
        <p className="text-muted mb-8">Your cart is currently empty.</p>
        <Link href="/collections/all" className="btn btn--gold">Explore Services</Link>
      </div>
    );
  }

  return (
    <div className="wrap py-14">
      <h1 className="font-display text-4xl text-center mb-10">Your Cart</h1>

      <div className="grid lg:grid-cols-[1fr_340px] gap-12">
        {/* line items */}
        <div className="divide-y divide-line border-t border-line">
          {items.map((i) => (
            <div key={i.handle} className="flex gap-5 py-6">
              <div className="relative w-24 h-28 bg-ice border border-line shrink-0 overflow-hidden">
                {i.image && <Image src={i.image} alt={i.title} fill sizes="96px" className="object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/products/${i.handle}`} className="font-display text-xl hover:text-gold">{i.title}</Link>
                <div className="text-sm text-muted mt-1">{formatBDT(i.price)}</div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="inline-flex items-center border border-ink/25 text-sm">
                    <button className="w-8 h-8 hover:bg-ice" onClick={() => setQty(i.handle, i.qty - 1)} aria-label="Decrease">−</button>
                    <span className="w-10 text-center">{i.qty}</span>
                    <button className="w-8 h-8 hover:bg-ice" onClick={() => setQty(i.handle, i.qty + 1)} aria-label="Increase">+</button>
                  </div>
                  <button className="text-xs text-muted underline hover:text-ink" onClick={() => remove(i.handle)}>Remove</button>
                </div>
              </div>
              <div className="text-right font-medium text-sm whitespace-nowrap">{formatBDT(i.price * i.qty)}</div>
            </div>
          ))}
        </div>

        {/* summary */}
        <aside className="bg-ice border border-line p-7 h-fit">
          <h2 className="font-display text-2xl mb-5">Order Summary</h2>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted">Subtotal</span>
            <span className="font-medium">{formatBDT(subtotal)}</span>
          </div>
          <p className="text-xs text-muted border-b border-line pb-5 mb-5">
            Booking time slots and payment (bKash / card via SSLCommerz) are confirmed at checkout.
          </p>
          <Link href="/checkout" className="btn w-full !bg-ink !border-ink">Proceed to Checkout</Link>
          <Link href="/collections/all" className="block text-center text-xs text-muted mt-4 hover:text-ink">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
