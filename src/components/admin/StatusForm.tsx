"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ADMIN_STATUSES, type OrderStatus } from "@/lib/order-types";

export default function StatusForm({
  tranId,
  current,
}: {
  tranId: string;
  current: OrderStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(current);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${tranId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.error || "Update failed.");
      } else {
        setMsg("Saved.");
        router.refresh();
      }
    } catch {
      setMsg("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as OrderStatus)}
        className="border border-line bg-paper px-3 py-2 text-sm focus:outline-none focus:border-ink"
      >
        {ADMIN_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button
        onClick={save}
        disabled={busy || status === current}
        className="btn disabled:opacity-40"
      >
        {busy ? "Saving…" : "Update status"}
      </button>
      {msg && <span className="text-[13px] text-muted">{msg}</span>}
    </div>
  );
}
