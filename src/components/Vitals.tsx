"use client";

import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";

/**
 * Real-user Core Web Vitals collection (speed insights). Next.js measures
 * LCP / INP / CLS / FCP / TTFB in the browser; each sample is beacons to
 * /api/track/vitals so the admin Speed page can show real-visitor p75s.
 * Uses sendBeacon when available so samples survive page navigation.
 * Must NOT import server-only modules (fs) — this runs in the browser.
 */
export default function Vitals() {
  const pathname = usePathname();

  useReportWebVitals((metric) => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const body = JSON.stringify({
      name: metric.name,
      // CLS is unitless (~0.03); round everything to 2dp, keep ms as integers.
      value: Math.round(metric.value * 100) / 100,
      rating: metric.rating,
      path: pathname,
    });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track/vitals", new Blob([body], { type: "application/json" }));
      } else {
        fetch("/api/track/vitals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        });
      }
    } catch {
      /* analytics must never break the page */
    }
  });

  return null;
}