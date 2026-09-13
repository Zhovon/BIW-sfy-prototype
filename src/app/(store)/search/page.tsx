import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/catalog";

// Search result pages shouldn't be indexed (thin/duplicate content).
export const metadata: Metadata = {
  title: "Search · BIW",
  robots: { index: false, follow: true },
};

function search(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  return products
    .map((p) => {
      const hay = `${p.title} ${p.category ?? ""} ${p.description}`.toLowerCase();
      const score = terms.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0);
      return { p, score };
    })
    .filter((r) => r.score === terms.length) // every term must match
    .sort((a, b) => a.p.title.localeCompare(b.p.title))
    .map((r) => r.p);
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const results = q.trim() ? search(q) : [];

  return (
    <div className="wrap py-12">
      <h1 className="font-display text-4xl text-center mb-8">Search</h1>

      <form action="/search" method="get" className="mx-auto max-w-xl mb-10">
        <div className="flex items-center border border-line bg-paper focus-within:border-ink transition-colors">
          <input
            type="search"
            name="q"
            defaultValue={q}
            autoFocus
            placeholder="Search treatments and products…"
            aria-label="Search"
            className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none"
          />
          <button type="submit" className="px-5 py-3 text-[13px] tracking-[0.12em] text-ink hover:text-gold transition-colors">
            SEARCH
          </button>
        </div>
      </form>

      {q.trim() && (
        <p className="text-center text-muted text-sm mb-10">
          {results.length} {results.length === 1 ? "result" : "results"} for &ldquo;{q}&rdquo;
        </p>
      )}

      {results.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {results.map((p) => (
            <ProductCard key={p.handle} p={p} />
          ))}
        </div>
      ) : q.trim() ? (
        <p className="text-center text-muted py-10">
          No matches. Try a different term, or browse{" "}
          <a href="/collections/all" className="text-ink underline underline-offset-4">all products</a>.
        </p>
      ) : null}
    </div>
  );
}
