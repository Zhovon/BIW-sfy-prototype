import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import PageHeader from "@/components/PageHeader";
import { products, getCollections, getCollection } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site";

const PAGE_SIZE = 24;

export function generateStaticParams() {
  return [{ handle: "all" }, ...getCollections().map((c) => ({ handle: c.slug }))];
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const title = handle === "all" ? "All Products" : getCollection(handle)?.title ?? "Collection";
  return {
    title: `${title} · BIW`,
    description: `Browse ${title} at Beauty Intelligent Wellness, Dhaka.`,
    alternates: { canonical: `/collections/${handle}` },
  };
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

function Pagination({ handle, page, totalPages }: { handle: string; page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  const base = `/collections/${handle}`;
  const href = (p: number) => (p === 1 ? base : `${base}?page=${p}`);
  const link = "inline-flex items-center justify-center min-w-9 h-9 px-3 border border-line text-sm hover:border-ink transition-colors";
  const disabled = "pointer-events-none opacity-40";
  return (
    <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Pagination">
      <Link href={href(page - 1)} className={`${link} ${page <= 1 ? disabled : ""}`} aria-label="Previous page" aria-disabled={page <= 1}>
        ←
      </Link>
      <span className="px-3 text-sm text-muted">Page {page} of {totalPages}</span>
      <Link href={href(page + 1)} className={`${link} ${page >= totalPages ? disabled : ""}`} aria-label="Next page" aria-disabled={page >= totalPages}>
        →
      </Link>
    </nav>
  );
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { handle } = await params;
  const { page: pageParam } = await searchParams;

  const isAll = handle === "all";
  const data = isAll ? { title: "All Products", items: products } : getCollection(handle);
  if (!data) notFound();

  const totalPages = Math.max(1, Math.ceil(data.items.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);
  const pageItems = data.items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="wrap py-12">
      <PageHeader title={data.title} className="mb-8" />
      <FilterBar count={data.items.length} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        {pageItems.map((p) => (
          <ProductCard key={p.handle} p={p} />
        ))}
      </div>
      <Pagination handle={handle} page={page} totalPages={totalPages} />
    </div>
  );
}
