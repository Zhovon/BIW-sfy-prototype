import type { Metadata } from "next";
import "../globals.css";
import { display, bodyFont } from "@/lib/fonts";

/**
 * Dedicated root layout for /admin — a separate root layout (route-group style)
 * so the admin area does NOT inherit the storefront header/footer/cart. The
 * nav bar lives in (panel)/layout.tsx; the login page renders on this bare shell.
 */
export const metadata: Metadata = {
  title: "Admin · BIW",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${bodyFont.variable}`}>
      <body className="min-h-screen bg-ice/30">{children}</body>
    </html>
  );
}
