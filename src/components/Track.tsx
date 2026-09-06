"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Fires a lightweight page-view beacon on every route change. Admin pages are
 * excluded so internal browsing doesn't pollute store traffic. Uses sendBeacon
 * when available so it survives navigation away from the page.
 */
export default function Track() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const body = JSON.stringify({ path: pathname, referrer: document.referrer || null });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        });
      }
    } catch {
      /* analytics must never break the page */
    }
  }, [pathname]);

  return null;
}
