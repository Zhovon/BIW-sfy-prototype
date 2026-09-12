"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type NavItem = { label: string; href: string; children?: { label: string; href: string }[] };

export default function MobileNav({ nav }: { nav: NavItem[] }) {
  const [open, setOpen] = useState(false);

  // Lock body scroll while the menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center text-ink hover:text-gold transition-colors"
      >
        <span className="relative block h-4 w-5">
          <span className={`absolute left-0 block h-px w-5 bg-current transition-all duration-300 ${open ? "top-1/2 rotate-45" : "top-0"}`} />
          <span className={`absolute left-0 top-1/2 block h-px w-5 bg-current transition-opacity duration-200 ${open ? "opacity-0" : "opacity-100"}`} />
          <span className={`absolute left-0 block h-px w-5 bg-current transition-all duration-300 ${open ? "top-1/2 -rotate-45" : "bottom-0"}`} />
        </span>
      </button>

      {/* slide-down panel */}
      <div
        className={`fixed inset-x-0 top-[86px] z-40 origin-top border-t border-line bg-paper shadow-lg transition-all duration-300 ${
          open ? "visible opacity-100 translate-y-0" : "invisible opacity-0 -translate-y-2"
        }`}
      >
        <nav className="wrap flex flex-col divide-y divide-line py-2">
          {nav.map((n) => (
            <div key={n.label} className="py-1">
              <Link
                href={n.href}
                onClick={() => setOpen(false)}
                className="block py-3 font-display text-xl text-ink hover:text-gold transition-colors"
              >
                {n.label}
              </Link>
              {n.children && (
                <div className="mb-2 flex flex-col gap-1 pl-1">
                  {n.children.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      onClick={() => setOpen(false)}
                      className="py-1.5 text-[13px] tracking-[0.06em] text-muted hover:text-ink transition-colors"
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
