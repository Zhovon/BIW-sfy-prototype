import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import CollectionCard from "@/components/CollectionCard";
import PageHeader from "@/components/PageHeader";
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
        <PageHeader title={page.title} subtitle={`${items.length} products`} className="mb-10" />
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
      // Prefer the collection's dedicated cover (as on biw.salon); fall back
      // to the first product photo if a collection has no cover uploaded.
      return meta && data ? { slug: h, title: meta.title, caption: meta.caption, cover: meta.image ?? data.items[0]?.image } : null;
    })
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="wrap py-16">
      <PageHeader kicker="Treatments" title={page.title} />
      {/* Collection cards mirror biw.salon: square cover, uppercase heading,
          a one-line caption with a trailing arrow. 3-up on desktop. */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
        {cols.map((c) => (
          <CollectionCard key={c.slug} slug={c.slug} title={c.title} caption={c.caption} cover={c.cover} />
        ))}
      </div>
    </div>
  );
}
