"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function CheckoutSuccess() {
  const { clear } = useCart();
  // Read the query on the client (avoids a useSearchParams Suspense boundary).
  const [floor, setFloor] = useState(false);
  const [ref, setRef] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setFloor(q.get("floor") === "1");
    setRef(q.get("ref") || "");
    clear(); // order placed — empty the cart
  }, [clear]);

  return (
    <div className="wrap py-24 text-center max-w-[52ch] mx-auto">
      <div className="w-16 h-16 rounded-full bg-teal/15 text-teal flex items-center justify-center mx-auto mb-6 text-3xl">✓</div>
      <h1 className="font-display text-4xl mb-4">{floor ? "Order placed" : "Payment confirmed"}</h1>
      <p className="text-muted leading-relaxed mb-8">
        {floor
          ? "Thank you — your order is confirmed. Please pay in person when you collect it at the salon. Our team will reach out shortly to arrange the details."
          : "Thank you — your booking is confirmed. A receipt has been sent to your email, and our team will reach out to finalise your appointment time."}
      </p>
      {floor && ref && (
        <p className="text-xs text-muted mb-8">Order reference: <span className="text-ink">{ref}</span></p>
      )}
      <Link href="/collections/all" className="btn btn--gold">Continue exploring</Link>
    </div>
  );
}
