"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import { formatBDT } from "@/lib/catalog";

export default function CartDrawer() {
  const { items, retailItems, serviceItems, retailSubtotal, isOpen, setOpen, setQty, remove } = useCart();

  return (
    <>
      {/* overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-ink/40 z-50 transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        aria-hidden
      />
      {/* panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-paper z-50 shadow-xl flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        aria-label="Cart"
      >
        <div className="flex items-center justify-between px-6 h-[70px] border-b border-line">
          <h2 className="font-display text-2xl">Your Cart</h2>
          <button onClick={() => setOpen(false)} aria-label="Close" className="text-xl hover:text-gold">✕</button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted gap-4 px-6">
            <p>Your cart is empty</p>
            <Link href="/collections/all" onClick={() => setOpen(false)} className="btn btn--ghost">Continue shopping</Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-line">
              {items.map((i) => (
                <div key={i.handle} className="flex gap-4 py-4">
                  <div className="relative w-16 h-20 bg-ice border border-line shrink-0 overflow-hidden">
                    {i.image && <Image src={i.image} alt={i.title} fill sizes="64px" className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${i.handle}`} onClick={() => setOpen(false)} className="font-display text-base leading-tight hover:text-gold block">
                      {i.title}
                    </Link>
                    <div className="text-[13px] text-muted mt-0.5">{formatBDT(i.price)}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="inline-flex items-center border border-ink/25 text-sm">
                        <button className="w-7 h-7 hover:bg-ice" onClick={() => setQty(i.handle, i.qty - 1)} aria-label="Decrease">−</button>
                        <span className="w-8 text-center">{i.qty}</span>
                        <button className="w-7 h-7 hover:bg-ice" onClick={() => setQty(i.handle, i.qty + 1)} aria-label="Increase">+</button>
                      </div>
                      <button className="text-xs text-muted underline hover:text-ink" onClick={() => remove(i.handle)}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-line px-6 py-5 space-y-4">
              {retailItems.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Products subtotal</span>
                  <span className="font-medium">{formatBDT(retailSubtotal)}</span>
                </div>
              )}
              {serviceItems.length > 0 && (
                <p className="text-xs text-muted">Services are booked on the next step and paid at the salon.</p>
              )}
              {serviceItems.length > 0 && (
                <Link href="/book" onClick={() => setOpen(false)} className="btn btn--gold w-full">Choose a time & book</Link>
              )}
              <div className="grid grid-cols-2 gap-3">
                <Link href="/cart" onClick={() => setOpen(false)} className="btn btn--ghost w-full">View cart</Link>
                {retailItems.length > 0 && (
                  <Link href="/checkout" onClick={() => setOpen(false)} className="btn w-full !bg-ink !border-ink">Check out</Link>
                )}
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
