"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUser } from "@/lib/auth-client";

type Props = { name: string; email: string; phone: string; address: string };

export default function ProfileForm({ name, email, phone, address }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ name, phone, address });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null); setErr(null); setBusy(true);
    const { error } = await updateUser({ name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim() });
    setBusy(false);
    if (error) { setErr(error.message || "Could not save."); return; }
    setMsg("Saved.");
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={save}>
      {msg && <p className="text-sm text-green-700">{msg}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div>
        <label className="block text-[13px] tracking-[0.08em] mb-1.5">Full name</label>
        <input value={form.name} onChange={set("name")}
          className="w-full border border-line bg-paper px-4 py-3 text-sm focus:outline-none focus:border-ink" />
      </div>
      <div>
        <label className="block text-[13px] tracking-[0.08em] mb-1.5">Email</label>
        <input value={email} disabled
          className="w-full border border-line bg-ice/40 px-4 py-3 text-sm text-muted" />
      </div>
      <div>
        <label className="block text-[13px] tracking-[0.08em] mb-1.5">Phone</label>
        <input value={form.phone} onChange={set("phone")} type="tel"
          className="w-full border border-line bg-paper px-4 py-3 text-sm focus:outline-none focus:border-ink" />
      </div>
      <div>
        <label className="block text-[13px] tracking-[0.08em] mb-1.5">Delivery address</label>
        <input value={form.address} onChange={set("address")}
          className="w-full border border-line bg-paper px-4 py-3 text-sm focus:outline-none focus:border-ink" />
      </div>
      <button type="submit" disabled={busy} className="btn !bg-ink !border-ink disabled:opacity-60">
        {busy ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
