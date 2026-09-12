"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

function IconBag() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" /><path d="M9 8a3 3 0 0 1 6 0" strokeLinecap="round" />
    </svg>
  );
}

export default function CartButton() {
  const { count, setOpen } = useCart();
  return (
    <button
      aria-label={`Cart, ${count} items`}
      onClick={() => setOpen(true)}
      className="relative hover:text-gold transition-colors"
    >
      <IconBag />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-gold text-ink text-[10px] leading-none min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}
