"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";

export default function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (form.password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    const { error } = await signUp.email({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim(),
    });
    setBusy(false);
    if (error) {
      setErr(error.message || "Could not create your account.");
      return;
    }
    router.push("/account");
    router.refresh();
  }

  return (
    <form className="space-y-4 mt-8" onSubmit={onSubmit}>
      {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">{err}</p>}
      <div>
        <label htmlFor="name" className="block text-[13px] tracking-[0.08em] mb-1.5">Full name</label>
        <input id="name" required value={form.name} onChange={set("name")}
          className="w-full border border-line bg-paper px-4 py-3 text-sm focus:outline-none focus:border-ink" />
      </div>
      <div>
        <label htmlFor="email" className="block text-[13px] tracking-[0.08em] mb-1.5">Email</label>
        <input id="email" type="email" autoComplete="email" required value={form.email} onChange={set("email")}
          className="w-full border border-line bg-paper px-4 py-3 text-sm focus:outline-none focus:border-ink" />
      </div>
      <div>
        <label htmlFor="phone" className="block text-[13px] tracking-[0.08em] mb-1.5">Phone <span className="text-muted">(optional)</span></label>
        <input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={set("phone")}
          className="w-full border border-line bg-paper px-4 py-3 text-sm focus:outline-none focus:border-ink" />
      </div>
      <div>
        <label htmlFor="password" className="block text-[13px] tracking-[0.08em] mb-1.5">Password</label>
        <input id="password" type="password" autoComplete="new-password" required minLength={8} value={form.password} onChange={set("password")}
          className="w-full border border-line bg-paper px-4 py-3 text-sm focus:outline-none focus:border-ink" />
      </div>
      <button type="submit" disabled={busy} className="btn w-full !bg-ink !border-ink disabled:opacity-60">
        {busy ? "Creating…" : "Create account"}
      </button>
      <p className="text-center text-[13px] text-muted">
        Already have an account?{" "}
        <Link href="/account/login" className="underline underline-offset-2 hover:text-ink">Sign in</Link>
      </p>
    </form>
  );
}
