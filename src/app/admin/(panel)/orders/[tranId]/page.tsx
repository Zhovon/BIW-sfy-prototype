import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder, type OrderStatus } from "@/lib/orders";
import { formatBDT } from "@/lib/catalog";
import StatusBadge from "@/components/admin/StatusBadge";
import StatusForm from "@/components/admin/StatusForm";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ tranId: string }>;
}) {
  const { tranId } = await params;
  const order = await getOrder(tranId);
  if (!order) notFound();

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <Link
          href="/admin/orders"
          className="text-[13px] uppercase tracking-[0.08em] text-muted hover:text-ink"
        >
          ← Orders
        </Link>
        <div className="flex flex-wrap items-center gap-4 mt-2">
          <h1 className="font-display text-3xl">{order.tranId}</h1>
          <StatusBadge status={order.status as OrderStatus} />
        </div>
        <p className="text-[13px] text-muted mt-1">
          Placed {new Date(order.createdAt).toLocaleString("en-GB")}
          {order.updatedAt !== order.createdAt &&
            ` · Updated ${new Date(order.updatedAt).toLocaleString("en-GB")}`}
        </p>
      </div>

      <section className="border border-line bg-paper p-6 space-y-4">
        <h2 className="kicker">Change status</h2>
        <StatusForm tranId={order.tranId} current={order.status as OrderStatus} />
      </section>

      <section className="border border-line bg-paper">
        <h2 className="kicker px-6 pt-6">Items</h2>
        <table className="w-full text-sm mt-2">
          <thead>
            <tr className="border-b border-line text-left text-[12px] uppercase tracking-[0.06em] text-muted">
              <th className="px-6 py-3 font-semibold">Product</th>
              <th className="px-6 py-3 font-semibold">Price</th>
              <th className="px-6 py-3 font-semibold">Qty</th>
              <th className="px-6 py-3 font-semibold text-right">Line total</th>
            </tr>
          </thead>
          <tbody>
            {order.lines.map((l, i) => (
              <tr key={`${l.handle}-${i}`} className="border-b border-line">
                <td className="px-6 py-3">
                  <Link
                    href={`/products/${l.handle}`}
                    className="underline underline-offset-2 hover:text-ink"
                  >
                    {l.title}
                  </Link>
                </td>
                <td className="px-6 py-3">{formatBDT(l.price)}</td>
                <td className="px-6 py-3">{l.qty}</td>
                <td className="px-6 py-3 text-right">{formatBDT(l.price * l.qty)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="px-6 py-3 text-right font-semibold">
                Total
              </td>
              <td className="px-6 py-3 text-right font-semibold">{formatBDT(order.amount)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="border border-line bg-paper p-6">
        <h2 className="kicker mb-3">Customer</h2>
        <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
          <dt className="text-muted">Name</dt>
          <dd>{order.customer.name || "—"}</dd>
          <dt className="text-muted">Email</dt>
          <dd>{order.customer.email || "—"}</dd>
          <dt className="text-muted">Phone</dt>
          <dd>{order.customer.phone || "—"}</dd>
          <dt className="text-muted">Address</dt>
          <dd>{order.customer.address || "—"}</dd>
          {order.valId && (
            <>
              <dt className="text-muted">Gateway ref</dt>
              <dd className="font-mono text-[13px]">{order.valId}</dd>
            </>
          )}
        </dl>
      </section>
    </div>
  );
}
