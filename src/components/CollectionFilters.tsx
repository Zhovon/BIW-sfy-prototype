"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export type AvailFilter = "all" | "in" | "out";
export type SortOrder = "featured" | "price-asc" | "price-desc" | "title";

const AVAIL_OPTIONS: { value: AvailFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "in", label: "In stock" },
  { value: "out", label: "Sold out" },
];

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "title", label: "Alphabetical" },
];

/**
 * Native <select>s styled to look like the original text chips (appearance
 * stripped, caret drawn on top). Changing either control rewrites the URL
 * searchParams and drops back to page 1 so the server re-renders the grid.
 */
export default function CollectionFilters({
  count,
  avail,
  sort,
}: {
  count: number;
  avail: AvailFilter;
  sort: SortOrder;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(key: string, value: string, defaultValue: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === defaultValue) params.delete(key);
    else params.set(key, value);
    params.delete("page"); // any filter change resets pagination
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const caret = (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
      className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2"
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  const selectClass =
    "appearance-none bg-transparent pr-4 text-[13px] text-ink/80 hover:text-ink cursor-pointer focus:outline-none";

  return (
    <div className="flex items-center justify-between border-y border-line py-3 mb-8 text-sm">
      <div className="flex items-center gap-6">
        <span className="text-muted">Filter:</span>
        <label className="relative inline-flex items-center">
          <span className="sr-only">Availability</span>
          <select
            className={selectClass}
            value={avail}
            onChange={(e) => update("avail", e.target.value, "all")}
            aria-label="Filter by availability"
          >
            {AVAIL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.value === "all" ? "Availability" : o.label}
              </option>
            ))}
          </select>
          {caret}
        </label>
      </div>
      <div className="flex items-center gap-6">
        <label className="relative inline-flex items-center gap-1 text-muted">
          <span className="hidden sm:inline">Sort by</span>
          <select
            className={`${selectClass} text-ink/80`}
            value={sort}
            onChange={(e) => update("sort", e.target.value, "featured")}
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {caret}
        </label>
        <span className="text-muted">{count} products</span>
      </div>
    </div>
  );
}
