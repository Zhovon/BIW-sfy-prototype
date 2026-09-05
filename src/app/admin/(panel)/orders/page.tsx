import Link from "next/link";
import { listOrders, ADMIN_STATUSES, type OrderStatus } from "@/lib/orders";
import { formatBDT } from "@/lib/catalog";
import StatusBadge from "@/components/admin/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const all = await listOrders();
  const active = status && ADMIN_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : null;
  const orders = active ? all.filter((o) => o.status === active) : all;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Orders</h1>

      <div className="flex flex-wrap gap-2 text-[12px] uppercase tracking-[0.08em]">
        <FilterChip label={`All (${all.length})`} href="/admin/orders" active={!active} />
        {ADMIN_STATUSES.map((s) => {
          const count = all.filter((o) => o.status === s).length;
          return (
            <FilterChip
              key={s}
              label={`${s} (${count})`}
              href={`/admin/orders?status=${s}`}
              active={active === s}
            />
          );
        })}
      </div>

      {orders.length === 0 ? (
        <p className="text-muted text-sm border border-line bg-paper p-6">No orders match this filter.</p>
      ) : (
        <div className="border border-line bg-paper overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[12px] uppercase tracking-[0.06em] text-muted">
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Items</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.tranId} className="border-b border-line last:border-0 hover:bg-ice/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${o.tranId}`}
                      className="underline underline-offset-2 hover:text-ink"
                    >
                      {o.tranId}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div>{o.customer.name || "—"}</div>
                    <div className="text-[12px] text-muted">{o.customer.email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {o.lines.reduce((n, l) => n + l.qty, 0)}
                  </td>
                  <td className="px-4 py-3">{formatBDT(o.amount)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status as OrderStatus} />
                  </td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`border px-3 py-1.5 ${
        active ? "border-ink bg-ink text-white" : "border-line bg-paper text-muted hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}
