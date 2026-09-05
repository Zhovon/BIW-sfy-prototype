/**
 * Order types + shared constants — no server-only imports (no `fs`), so this is
 * safe to import from client components (e.g. the admin StatusForm). The file
 * store lives in orders.ts, which imports these.
 */

export type OrderStatus = "pending" | "paid" | "failed" | "cancelled" | "fulfilled" | "refunded";

export type OrderLine = { handle: string; title: string; price: number; qty: number };

export type Order = {
  tranId: string;
  lines: OrderLine[];
  amount: number;
  customer: { name: string; email: string; phone: string; address: string };
  status: OrderStatus;
  valId?: string;
  createdAt: string;
  updatedAt: string;
};

/** Statuses an admin may set manually from the dashboard. */
export const ADMIN_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "fulfilled",
  "cancelled",
  "refunded",
  "failed",
];
