"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function CheckoutSuccess() {
  const { clear } = useCart();
  useEffect(() => {
    clear(); // payment confirmed — empty the cart
  }, [clear]);

  return (
    <div className="wrap py-24 text-center max-w-[52ch] mx-auto">
      <div className="w-16 h-16 rounded-full bg-teal/15 text-teal flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
      <h1 className="font-display text-4xl mb-4">Payment confirmed</h1>
      <p className="text-muted leading-relaxed mb-8">
        Thank you — your booking is confirmed. A receipt has been sent to your email, and our team
        will reach out to finalise your appointment time.
      </p>
      <Link href="/collections/all" className="btn btn--gold">Continue exploring</Link>
    </div>
  );
}
