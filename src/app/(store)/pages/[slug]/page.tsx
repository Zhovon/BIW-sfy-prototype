import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import SectionHead from "@/components/SectionHead";
import AboutContent from "@/components/AboutContent";
import ContactContent from "@/components/ContactContent";
import { getCustomPage, customPageSlugs, resolveProducts, getCollection, getCollections } from "@/lib/catalog";

export function generateStaticParams() {
  return ["about", "contact", ...customPageSlugs()].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const titles: Record<string, string> = { about: "About BIW", contact: "Contact" };
  const title = titles[slug] ?? getCustomPage(slug)?.title ?? "BIW";
  const descriptions: Record<string, string> = {
    about: "Beauty Intelligent Wellness — an integrated medical-aesthetic wellness centre in Bashundhara, Dhaka.",
    contact: "Get in touch with Beauty Intelligent Wellness, Dhaka.",
  };
  return {
    title: `${title} · BIW`,
    description: descriptions[slug] ?? `${title} at Beauty Intelligent Wellness, Dhaka.`,
    alternates: { canonical: `/pages/${slug}` },
  };
}

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1. text pages (about / contact) — content mirrors biw.salon
  if (slug === "about") return <AboutContent />;
  if (slug === "contact") return <ContactContent />;

  const page = getCustomPage(slug);
  if (!page) notFound();

  // 2. Shop pages — product grid
  if (page.type === "product-grid") {
    const items = resolveProducts(page.products);
    return (
      <div className="wrap py-12">
        <h1 className="font-display text-4xl text-center mb-2">{page.title}</h1>
        <p className="text-center text-muted text-sm mb-10">{items.length} products</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {items.map((p) => (
            <ProductCard key={p.handle} p={p} />
          ))}
        </div>
      </div>
    );
  }

  // 3. Services pages — collection grid
  const all = new Map(getCollections().map((c) => [c.slug, c]));
  const cols = page.collections
    .map((h) => {
      const meta = all.get(h);
      const data = getCollection(h);
      return meta && data ? { slug: h, title: meta.title, caption: meta.caption, cover: data.items[0]?.image } : null;
    })
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="wrap py-16">
      <SectionHead kicker="Treatments" title={page.title} />
      {/* Collection cards mirror biw.salon: square cover, uppercase heading,
          a one-line caption with a trailing arrow. 3-up on desktop. */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
        {cols.map((c) => (
          <Link key={c.slug} href={`/collections/${c.slug}`} className="group block">
            <div className="relative aspect-square overflow-hidden bg-ice">
              {c.cover && (
                <Image src={c.cover} alt={c.title} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              )}
            </div>
            <div className="pt-4">
              <h3 className="font-display text-[22px] leading-tight uppercase tracking-[0.02em] transition-colors group-hover:text-gold">
                {c.title}
              </h3>
              {c.caption && (
                <p className="mt-2 text-sm leading-[1.55] text-muted">
                  {c.caption}
                  <span className="ml-1 inline-block align-middle text-ink/70 transition-transform group-hover:translate-x-1" aria-hidden>→</span>
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
