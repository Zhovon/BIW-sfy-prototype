import { promises as fs } from "fs";
import path from "path";
import { getProduct } from "@/lib/catalog";
import { DATA_DIR } from "@/lib/data-dir";
import type { Order, OrderLine, OrderStatus } from "@/lib/order-types";

/**
 * Scaffold order store — a JSON file. In production these rows move to Postgres
 * (POST /orders on the FastAPI backend). Prices are ALWAYS recomputed here from
 * the catalog; the client-submitted cart is treated as untrusted input.
 *
 * Types + shared constants live in order-types.ts (client-safe, no `fs`).
 */

export type { Order, OrderLine, OrderStatus } from "@/lib/order-types";
export { ADMIN_STATUSES } from "@/lib/order-types";

const FILE = path.join(DATA_DIR, "orders.json");

async function readAll(): Promise<Record<string, Order>> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf-8"));
  } catch {
    return {};
  }
}

async function writeAll(orders: Record<string, Order>) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(orders, null, 2));
}

/** Recompute the authoritative order from client-supplied {handle, qty} pairs. */
export function priceCart(cart: { handle: string; qty: number }[]): { lines: OrderLine[]; amount: number } {
  const lines: OrderLine[] = [];
  for (const item of cart) {
    const p = getProduct(item.handle);
    const qty = Math.max(1, Math.floor(Number(item.qty) || 0));
    if (!p || p.price_bdt == null) continue; // silently drop unknown/invalid handles
    if (p.type === "service") continue; // services are booked + paid at the salon, never charged online
    lines.push({ handle: p.handle, title: p.title, price: p.price_bdt, qty });
  }
  const amount = lines.reduce((n, l) => n + l.price * l.qty, 0);
  return { lines, amount };
}

export async function createOrder(o: Omit<Order, "status" | "createdAt" | "updatedAt">): Promise<Order> {
  const orders = await readAll();
  const now = new Date().toISOString();
  const order: Order = { ...o, status: "pending", createdAt: now, updatedAt: now };
  orders[o.tranId] = order;
  await writeAll(orders);
  return order;
}

export async function getOrder(tranId: string): Promise<Order | undefined> {
  return (await readAll())[tranId];
}

/** All orders, newest first — for the admin dashboard. */
export async function listOrders(): Promise<Order[]> {
  const orders = await readAll();
  return Object.values(orders).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Admin manual status override. Unlike markOrder (the payment-callback path,
 * which is idempotent and never regresses a "paid" order), an admin is trusted
 * to set any status — e.g. marking a paid order "fulfilled" or "refunded".
 */
export async function adminSetStatus(tranId: string, status: OrderStatus): Promise<Order | undefined> {
  const orders = await readAll();
  const order = orders[tranId];
  if (!order) return undefined;
  order.status = status;
  order.updatedAt = new Date().toISOString();
  orders[tranId] = order;
  await writeAll(orders);
  return order;
}

/**
 * Idempotent status transition. A "paid" order never regresses, so repeated IPN
 * or success callbacks are safe (money events must not double-apply).
 */
export async function markOrder(tranId: string, status: OrderStatus, valId?: string): Promise<Order | undefined> {
  const orders = await readAll();
  const order = orders[tranId];
  if (!order) return undefined;
  if (order.status === "paid") return order; // terminal — ignore repeats
  order.status = status;
  if (valId) order.valId = valId;
  order.updatedAt = new Date().toISOString();
  orders[tranId] = order;
  await writeAll(orders);
  return order;
}
