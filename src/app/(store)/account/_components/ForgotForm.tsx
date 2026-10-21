"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function ForgotForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    // Always show the same confirmation (don't reveal whether the email exists).
    await authClient.requestPasswordReset({ email: email.trim(), redirectTo: "/account/reset-password" });
    setBusy(false);
    setSent(true);
  }

  if (sent) {
    return (
      <p className="mt-8 text-sm text-muted text-center">
        If an account exists for <strong>{email}</strong>, we&apos;ve sent a password-reset link. Check your inbox.
      </p>
    );
  }

  return (
    <form className="space-y-4 mt-8" onSubmit={onSubmit}>
      <div>
        <label htmlFor="email" className="block text-[13px] tracking-[0.08em] mb-1.5">Email</label>
        <input id="email" type="email" autoComplete="email" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-line bg-paper px-4 py-3 text-sm focus:outline-none focus:border-ink" />
      </div>
      <button type="submit" disabled={busy} className="btn w-full !bg-ink !border-ink disabled:opacity-60">
        {busy ? "Sending…" : "Send reset link"}
      </button>
      <p className="text-center text-[13px] text-muted">
        <Link href="/account/login" className="underline underline-offset-2 hover:text-ink">Back to sign in</Link>
      </p>
    </form>
  );
}
