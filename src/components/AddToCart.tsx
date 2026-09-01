"use client";

import { useState } from "react";
import { useCart, CartItem } from "@/lib/cart";

type Props = {
  product: Omit<CartItem, "qty">;
  soldOut: boolean;
};

export default function AddToCart({ product, soldOut }: Props) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const isService = product.type === "service";

  return (
    <>
      <div className="mt-7 space-y-3">
        <button
          className="btn w-full !bg-ink !border-ink disabled:opacity-40"
          disabled={soldOut}
          onClick={() => add(product, qty)}
        >
          {soldOut ? "Sold out" : isService ? "Book appointment now" : "Add to cart"}
        </button>
        <button
          className="btn btn--ghost w-full disabled:opacity-40"
          disabled={soldOut}
          onClick={() => add(product, qty)}
        >
          {isService ? "Add service & keep browsing" : "Add to cart & keep browsing"}
        </button>
      </div>

      <div className="mt-6">
        <div className="text-xs text-muted mb-2">Quantity</div>
        <div className="inline-flex items-center border border-ink/30">
          <button className="w-10 h-10 text-lg hover:bg-ice" aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))}>
            −
          </button>
          <span className="w-12 text-center text-sm">{qty}</span>
          <button className="w-10 h-10 text-lg hover:bg-ice" aria-label="Increase" onClick={() => setQty((q) => q + 1)}>
            +
          </button>
        </div>
      </div>
    </>
  );
}
