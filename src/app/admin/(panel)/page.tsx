import Link from "next/link";
import { listOrders, type OrderStatus } from "@/lib/orders";
import { products, formatBDT } from "@/lib/catalog";
import StatusBadge from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="border border-line bg-paper p-6">
      <p className="kicker">{label}</p>
      <p className="font-display text-4xl mt-2">{value}</p>
      {sub && <p className="text-[13px] text-muted mt-1">{sub}</p>}
    </div>
  );
}

export default async function AdminDashboard() {
  const orders = await listOrders();

  const byStatus = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  // Revenue = orders that represent real money in (paid or fulfilled).
  const revenue = orders
    .filter((o) => o.status === "paid" || o.status === "fulfilled")
    .reduce((n, o) => n + o.amount, 0);

  const pending = byStatus["pending"] ?? 0;
  const recent = orders.slice(0, 8);

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total orders" value={String(orders.length)} />
        <Stat label="Collected revenue" value={formatBDT(revenue)} sub="paid + fulfilled" />
        <Stat label="Awaiting action" value={String(pending)} sub="pending payment" />
        <Stat label="Catalog" value={String(products.length)} sub="products" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-2xl">Recent orders</h2>
          <Link href="/admin/orders" className="text-[13px] uppercase tracking-[0.08em] text-muted hover:text-ink">
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-muted text-sm border border-line bg-paper p-6">No orders yet.</p>
        ) : (
          <div className="border border-line bg-paper overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[12px] uppercase tracking-[0.06em] text-muted">
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.tranId} className="border-b border-line last:border-0 hover:bg-ice/50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/orders/${o.tranId}`} className="underline underline-offset-2 hover:text-ink">
                        {o.tranId}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{o.customer.name || "—"}</td>
                    <td className="px-4 py-3">{formatBDT(o.amount)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status as OrderStatus} />
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(o.createdAt).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
