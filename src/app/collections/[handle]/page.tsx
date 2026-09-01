import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { products, getCollections, getCollection } from "@/lib/catalog";

export function generateStaticParams() {
  return [{ handle: "all" }, ...getCollections().map((c) => ({ handle: c.slug }))];
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const title = handle === "all" ? "All Products" : getCollection(handle)?.title ?? "Collection";
  return { title: `${title} · BIW` };
}

function FilterBar({ count }: { count: number }) {
  const chip = "inline-flex items-center gap-1 text-[13px] text-ink/80 hover:text-ink cursor-pointer";
  const caret = (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  return (
    <div className="flex items-center justify-between border-y border-line py-3 mb-8 text-sm">
      <div className="flex items-center gap-6">
        <span className="text-muted">Filter:</span>
        <span className={chip}>Availability {caret}</span>
        <span className={chip}>Price {caret}</span>
      </div>
      <div className="flex items-center gap-6">
        <span className="hidden sm:flex items-center gap-1 text-muted">
          Sort by <span className="text-ink/80">Featured</span> {caret}
        </span>
        <span className="text-muted">{count} products</span>
      </div>
    </div>
  );
}

export default async function CollectionPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;

  const isAll = handle === "all";
  const data = isAll ? { title: "All Products", items: products } : getCollection(handle);
  if (!data) notFound();

  return (
    <div className="wrap py-12">
      <h1 className="font-display text-4xl text-center mb-8">{data.title}</h1>
      <FilterBar count={data.items.length} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        {data.items.map((p) => (
          <ProductCard key={p.handle} p={p} />
        ))}
      </div>
    </div>
  );
}
