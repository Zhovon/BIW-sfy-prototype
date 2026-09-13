import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
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
      return meta && data ? { slug: h, title: meta.title, count: meta.count, cover: data.items[0]?.image } : null;
    })
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="wrap py-12">
      <h1 className="font-display text-4xl text-center mb-10">{page.title}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {cols.map((c) => (
          <Link key={c.slug} href={`/collections/${c.slug}`} className="group block">
            <div className="relative aspect-[4/3] overflow-hidden bg-ice border border-line">
              {c.cover && (
                <Image src={c.cover} alt={c.title} fill sizes="(max-width:768px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
              )}
              {/* uniform gradient scrim so the title reads consistently on any
                  image, title anchored bottom-centre with even padding */}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/25 to-ink/10 group-hover:from-ink/85 transition-colors" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-center px-4 pb-5 text-center">
                <span className="font-display text-white text-lg md:text-xl leading-tight">{c.title}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
