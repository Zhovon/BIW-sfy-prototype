import type { OrderStatus } from "@/lib/orders";

const STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  fulfilled: "bg-teal-50 text-teal-800 border-teal-200",
  cancelled: "bg-gray-100 text-gray-600 border-gray-300",
  refunded: "bg-purple-50 text-purple-700 border-purple-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-block border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
