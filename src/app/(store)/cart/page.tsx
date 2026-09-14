"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart, CartItem } from "@/lib/cart";
import { formatBDT } from "@/lib/catalog";
import PageHeader from "@/components/PageHeader";

function LineItem({ i, setQty, remove }: { i: CartItem; setQty: (h: string, q: number) => void; remove: (h: string) => void }) {
  return (
    <div className="flex gap-5 py-6">
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
  );
}

export default function CartPage() {
  const { items, retailItems, serviceItems, retailSubtotal, setQty, remove } = useCart();

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
      <PageHeader title="Your Cart" className="mb-10" />

      <div className="grid lg:grid-cols-[1fr_340px] gap-12">
        <div className="space-y-10">
          {/* Services → booked via the CRM widget, paid at the salon */}
          {serviceItems.length > 0 && (
            <section>
              <h2 className="font-display text-2xl mb-1">Services to book</h2>
              <p className="text-xs text-muted mb-3">Pick a time on the next step — services are paid at the salon, not online.</p>
              <div className="divide-y divide-line border-t border-line">
                {serviceItems.map((i) => (
                  <LineItem key={i.handle} i={i} setQty={setQty} remove={remove} />
                ))}
              </div>
              <Link href="/book" className="btn btn--gold w-full mt-5">Choose a time & book</Link>
            </section>
          )}

          {/* Retail → online (SSLCommerz) checkout */}
          {retailItems.length > 0 && (
            <section>
              {serviceItems.length > 0 && <h2 className="font-display text-2xl mb-3">Products</h2>}
              <div className="divide-y divide-line border-t border-line">
                {retailItems.map((i) => (
                  <LineItem key={i.handle} i={i} setQty={setQty} remove={remove} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* summary — online payment applies to retail products only */}
        <aside className="bg-ice border border-line p-7 h-fit">
          <h2 className="font-display text-2xl mb-5">Order Summary</h2>
          {retailItems.length > 0 ? (
            <>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted">Products subtotal</span>
                <span className="font-medium">{formatBDT(retailSubtotal)}</span>
              </div>
              <p className="text-xs text-muted border-b border-line pb-5 mb-5">
                Pay for products with bKash / card via SSLCommerz at checkout.
                {serviceItems.length > 0 && " Services are booked and paid separately at the salon."}
              </p>
              <Link href="/checkout" className="btn w-full !bg-ink !border-ink">Proceed to Checkout</Link>
            </>
          ) : (
            <p className="text-sm text-muted border-b border-line pb-5 mb-5">
              Your cart has services only — choose a time to book them. Payment is at the salon.
            </p>
          )}
          <Link href="/collections/all" className="block text-center text-xs text-muted mt-4 hover:text-ink">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
