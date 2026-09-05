import type { Metadata } from "next";
import "../globals.css";
import { display, bodyFont } from "@/lib/fonts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/lib/cart";
import CartDrawer from "@/components/CartDrawer";
import Track from "@/components/Track";

export const metadata: Metadata = {
  title: "BIW · Beauty Intelligent Wellness",
  description: "Bangladesh's first integrated medical-aesthetic wellness experience.",
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${bodyFont.variable}`}>
      <body>
        <CartProvider>
          <a
            href="#MainContent"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-paper focus:px-4 focus:py-2 focus:border focus:border-line"
          >
            Skip to content
          </a>
          <Header />
          <main id="MainContent">{children}</main>
          <Footer />
          <CartDrawer />
          <Track />
        </CartProvider>
      </body>
    </html>
  );
}
