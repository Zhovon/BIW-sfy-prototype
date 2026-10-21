"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const { error } = await signIn.email({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      setErr(error.message || "Could not sign in. Check your email and password.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form className="space-y-4 mt-8" onSubmit={onSubmit}>
      {err && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">{err}</p>
      )}
      <div>
        <label htmlFor="email" className="block text-[13px] tracking-[0.08em] mb-1.5">Email</label>
        <input id="email" type="email" autoComplete="email" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-line bg-paper px-4 py-3 text-sm focus:outline-none focus:border-ink" />
      </div>
      <div>
        <label htmlFor="password" className="block text-[13px] tracking-[0.08em] mb-1.5">Password</label>
        <input id="password" type="password" autoComplete="current-password" required value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-line bg-paper px-4 py-3 text-sm focus:outline-none focus:border-ink" />
      </div>
      <button type="submit" disabled={busy} className="btn w-full !bg-ink !border-ink disabled:opacity-60">
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-[13px] text-muted">
        <Link href="/account/forgot-password" className="underline underline-offset-2 hover:text-ink">Forgot your password?</Link>
      </p>
      <p className="text-center text-[13px] text-muted">
        New to BIW?{" "}
        <Link href="/account/signup" className="underline underline-offset-2 hover:text-ink">Create an account</Link>
      </p>
    </form>
  );
}
