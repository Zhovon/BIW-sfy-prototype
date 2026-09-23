import Link from "next/link";
import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import PageHeader from "@/components/PageHeader";
import CollectionFilters, { AvailFilter, SortOrder } from "@/components/CollectionFilters";
import { products, getCollections, getCollection, Product } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site";
import { breadcrumbLd, itemListLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

const PAGE_SIZE = 24;

function normalizeAvail(v: string | undefined): AvailFilter {
  return v === "in" || v === "out" ? v : "all";
}
function normalizeSort(v: string | undefined): SortOrder {
  return v === "price-asc" || v === "price-desc" || v === "title" ? v : "featured";
}

function applyFilters(items: Product[], avail: AvailFilter, sort: SortOrder): Product[] {
  let out = items;
  if (avail === "in") out = out.filter((p) => p.availability !== "OutOfStock");
  else if (avail === "out") out = out.filter((p) => p.availability === "OutOfStock");

  if (sort !== "featured") {
    // Copy before sorting so we never mutate the shared catalog array.
    out = [...out];
    const price = (p: Product) => (p.price_bdt == null ? Infinity : p.price_bdt);
    if (sort === "price-asc") out.sort((a, b) => price(a) - price(b));
    else if (sort === "price-desc") out.sort((a, b) => price(b) - price(a));
    else if (sort === "title") out.sort((a, b) => a.title.localeCompare(b.title));
  }
  return out;
}

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

function Pagination({
  handle,
  page,
  totalPages,
  avail,
  sort,
}: {
  handle: string;
  page: number;
  totalPages: number;
  avail: AvailFilter;
  sort: SortOrder;
}) {
  if (totalPages <= 1) return null;
  const base = `/collections/${handle}`;
  const href = (p: number) => {
    const params = new URLSearchParams();
    if (avail !== "all") params.set("avail", avail);
    if (sort !== "featured") params.set("sort", sort);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };
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
  searchParams: Promise<{ page?: string; avail?: string; sort?: string }>;
}) {
  const { handle } = await params;
  const { page: pageParam, avail: availParam, sort: sortParam } = await searchParams;

  const isAll = handle === "all";
  const data = isAll ? { title: "All Products", items: products } : getCollection(handle);
  if (!data) notFound();

  const avail = normalizeAvail(availParam);
  const sort = normalizeSort(sortParam);
  const items = applyFilters(data.items, avail, sort);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(pageParam) || 1), totalPages);
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const crumbsLd = breadcrumbLd([
    { name: "Home", path: "/" },
    { name: "Collections", path: "/collections" },
    { name: data.title, path: `/collections/${handle}` },
  ]);
  const listLd = itemListLd(
    data.title,
    pageItems.map((p) => ({ title: p.title, path: `/products/${p.handle}` })),
  );

  return (
    <div className="wrap py-12">
      <JsonLd data={crumbsLd} />
      <JsonLd data={listLd} />
      <PageHeader title={data.title} className="mb-8" />
      <CollectionFilters count={items.length} avail={avail} sort={sort} />
      {pageItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {pageItems.map((p) => (
            <ProductCard key={p.handle} p={p} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted py-16">No products match these filters.</p>
      )}
      <Pagination handle={handle} page={page} totalPages={totalPages} avail={avail} sort={sort} />
    </div>
  );
}
