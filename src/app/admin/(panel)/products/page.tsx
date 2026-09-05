import Link from "next/link";
import Image from "next/image";
import { products, formatBDT, formatDuration } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/**
 * Read-only catalog viewer. Shopify remains the master for product data
 * (name/price/category/duration) until cutover, so this intentionally does not
 * edit — it's a reference view of what the store is selling.
 */
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q, type } = await searchParams;
  const query = (q ?? "").trim().toLowerCase();

  let items = products;
  if (type === "service" || type === "retail") items = items.filter((p) => p.type === type);
  if (query) {
    items = items.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        (p.category ?? "").toLowerCase().includes(query) ||
        p.handle.toLowerCase().includes(query),
    );
  }

  const serviceCount = products.filter((p) => p.type === "service").length;
  const retailCount = products.filter((p) => p.type === "retail").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-3xl">Products</h1>
        <p className="text-[13px] text-muted">
          Read-only · Shopify is master until cutover
        </p>
      </div>

      <form method="get" className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search name, category, handle…"
          className="border border-line bg-paper px-4 py-2 text-sm focus:outline-none focus:border-ink w-72 max-w-full"
        />
        <select
          name="type"
          defaultValue={type ?? ""}
          className="border border-line bg-paper px-3 py-2 text-sm focus:outline-none focus:border-ink"
        >
          <option value="">All types ({products.length})</option>
          <option value="service">Services ({serviceCount})</option>
          <option value="retail">Retail ({retailCount})</option>
        </select>
        <button type="submit" className="btn">
          Filter
        </button>
        {(query || type) && (
          <Link href="/admin/products" className="text-[13px] text-muted hover:text-ink underline underline-offset-2">
            Clear
          </Link>
        )}
      </form>

      <p className="text-[13px] text-muted">{items.length} shown</p>

      <div className="border border-line bg-paper overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[12px] uppercase tracking-[0.06em] text-muted">
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Duration</th>
              <th className="px-4 py-3 font-semibold text-right">Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.handle} className="border-b border-line last:border-0 hover:bg-ice/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.image ? (
                      <Image
                        src={p.image}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 object-cover border border-line shrink-0"
                      />
                    ) : (
                      <span className="h-10 w-10 bg-ice border border-line shrink-0 inline-block" />
                    )}
                    <Link
                      href={`/products/${p.handle}`}
                      className="underline underline-offset-2 hover:text-ink"
                    >
                      {p.title}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{p.category || "—"}</td>
                <td className="px-4 py-3 text-muted capitalize">{p.type}</td>
                <td className="px-4 py-3 text-muted">{formatDuration(p.duration_min) || "—"}</td>
                <td className="px-4 py-3 text-right">{formatBDT(p.price_bdt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
