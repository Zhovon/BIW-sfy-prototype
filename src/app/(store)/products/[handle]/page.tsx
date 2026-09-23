import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products, getProduct, formatBDT, formatDurationLong } from "@/lib/catalog";
import { absoluteUrl, metaDescription, SITE_NAME } from "@/lib/site";
import { breadcrumbLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import AddToCart from "@/components/AddToCart";

export function generateStaticParams() {
  return products.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const p = getProduct(handle);
  if (!p) return { title: "Product · BIW" };

  const description =
    metaDescription(cleanDescription(p.description)) ||
    `${p.title} at ${SITE_NAME}, Dhaka.`;
  const path = `/products/${p.handle}`;

  return {
    title: `${p.title} · BIW`,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: p.title,
      description,
      url: path,
      images: p.image ? [{ url: p.image, alt: p.title }] : ["/biw-logo.png"],
    },
  };
}

/** Strip the trailing "Duration: ..." sentence — shown separately below. */
function cleanDescription(desc: string): string {
  return desc.replace(/Duration[:\s].*$/i, "").trim();
}

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const p = getProduct(handle);
  if (!p) notFound();

  const duration = formatDurationLong(p.duration_min);
  const soldOut = p.availability === "OutOfStock";
  const desc = cleanDescription(p.description);

  const productLd = {
    "@context": "https://schema.org",
    "@type": p.type === "service" ? "Service" : "Product",
    name: p.title,
    ...(desc ? { description: metaDescription(desc, 300) } : {}),
    ...(p.image ? { image: p.image } : {}),
    brand: { "@type": "Brand", name: SITE_NAME },
    ...(p.price_bdt != null
      ? {
          offers: {
            "@type": "Offer",
            price: p.price_bdt,
            priceCurrency: "BDT",
            availability: soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
            url: absoluteUrl(`/products/${p.handle}`),
          },
        }
      : {}),
  };

  const crumbsLd = breadcrumbLd([
    { name: "Home", path: "/" },
    { name: p.type === "service" ? "Services" : "Products", path: p.type === "service" ? "/collections" : "/pages/products" },
    { name: p.title, path: `/products/${p.handle}` },
  ]);

  return (
    <div className="wrap py-12">
      <JsonLd data={productLd} />
      <JsonLd data={crumbsLd} />
      <div className="grid md:grid-cols-2 gap-10 md:gap-16">
        {/* image */}
        <div className="relative aspect-[4/5] bg-ice border border-line overflow-hidden self-start">
          {p.image ? (
            <Image src={p.image} alt={p.title} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" priority />
          ) : (
            <div className="flex h-full items-center justify-center text-muted tracking-widest">BIW</div>
          )}
        </div>

        {/* detail */}
        <div className="max-w-[440px]">
          <h1 className="font-display text-[40px] leading-tight">{p.title}</h1>
          <div className="text-[15px] mt-3">{formatBDT(p.price_bdt)}</div>

          <AddToCart
            soldOut={soldOut}
            product={{ handle: p.handle, title: p.title, price: p.price_bdt ?? 0, image: p.image, type: p.type }}
          />

          {desc && (
            <div className="mt-8 text-sm text-ink/80 leading-relaxed whitespace-pre-line">{desc}</div>
          )}

          {duration && (
            <div className="mt-6 text-sm">
              <span className="font-medium">Duration:</span> <span className="text-muted">{duration}</span>
            </div>
          )}

          <button className="mt-6 inline-flex items-center gap-2 text-xs text-muted hover:text-ink">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5" />
            </svg>
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
