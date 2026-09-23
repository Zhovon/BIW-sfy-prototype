import type { Metadata } from "next";
import "../globals.css";
import { display, bodyFont } from "@/lib/fonts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/lib/cart";
import CartDrawer from "@/components/CartDrawer";
import Track from "@/components/Track";
import Vitals from "@/components/Vitals";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, SITE_NAME, SITE_TAGLINE, absoluteUrl } from "@/lib/site";
import { BRANCHES, branchLd, SOCIAL_LINKS, PRIMARY_PHONE } from "@/lib/business";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "BIW · Beauty Intelligent Wellness",
  description: SITE_TAGLINE,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "BIW · Beauty Intelligent Wellness",
    description: SITE_TAGLINE,
    url: SITE_URL,
    locale: "en_US",
    images: ["/biw-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "BIW · Beauty Intelligent Wellness",
    description: SITE_TAGLINE,
    images: ["/biw-logo.png"],
  },
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  alternateName: "BIW",
  url: SITE_URL,
  logo: absoluteUrl("/biw-logo.png"),
  image: absoluteUrl("/biw-logo.png"),
  description: SITE_TAGLINE,
  telephone: PRIMARY_PHONE,
  address: BRANCHES.map((b) => ({
    "@type": "PostalAddress",
    streetAddress: b.streetAddress,
    addressLocality: b.addressLocality,
    postalCode: b.postalCode,
    addressRegion: b.addressRegion,
    addressCountry: "BD",
  })),
  contactPoint: {
    "@type": "ContactPoint",
    telephone: PRIMARY_PHONE,
    contactType: "customer service",
    areaServed: "BD",
    availableLanguage: ["en", "bn"],
  },
  areaServed: { "@type": "City", name: "Dhaka" },
  sameAs: SOCIAL_LINKS,
};

const branchNodes = BRANCHES.map((b) => branchLd(b, SITE_URL, absoluteUrl("/biw-logo.png")));

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${bodyFont.variable}`}>
      <head>
        {/* Without JS, IntersectionObserver never fires, so reveal content would
            stay at opacity:0. Force it visible when scripting is unavailable. */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
      {/* min-h-screen flex column = sticky footer: on short pages (contact,
          cart, policies) main grows to fill the viewport so the footer sits at
          the bottom with a clear gap instead of butting under the content. */}
      <body className="flex min-h-screen flex-col">
        <JsonLd data={organizationLd} />
        <JsonLd data={websiteLd} />
        {branchNodes.map((node) => (
          <JsonLd key={node["@id"]} data={node} />
        ))}
        <CartProvider>
          <a
            href="#MainContent"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-paper focus:px-4 focus:py-2 focus:border focus:border-line"
          >
            Skip to content
          </a>
          <Header />
          <main id="MainContent" className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <Track />
          <Vitals />
        </CartProvider>
      </body>
    </html>
  );
}
