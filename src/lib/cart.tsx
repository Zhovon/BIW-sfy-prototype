"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type CartItem = {
  handle: string;
  title: string;
  price: number;
  image: string | null;
  type: "service" | "retail";
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (handle: string, qty: number) => void;
  remove: (handle: string) => void;
  clear: () => void;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "biw-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // hydrate from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  // persist
  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((cur) => {
      const found = cur.find((i) => i.handle === item.handle);
      if (found) return cur.map((i) => (i.handle === item.handle ? { ...i, qty: i.qty + qty } : i));
      return [...cur, { ...item, qty }];
    });
    setOpen(true);
  }, []);

  const setQty = useCallback((handle: string, qty: number) => {
    setItems((cur) =>
      qty <= 0 ? cur.filter((i) => i.handle !== handle) : cur.map((i) => (i.handle === handle ? { ...i, qty } : i))
    );
  }, []);

  const remove = useCallback((handle: string) => setItems((cur) => cur.filter((i) => i.handle !== handle)), []);
  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((n, i) => n + i.qty, 0);
  const subtotal = items.reduce((n, i) => n + i.price * i.qty, 0);

  return (
    <Ctx.Provider value={{ items, count, subtotal, add, setQty, remove, clear, isOpen, setOpen }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
