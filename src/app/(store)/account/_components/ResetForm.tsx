"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!token) {
    return (
      <p className="mt-8 text-sm text-center text-muted">
        This reset link is invalid or has expired.{" "}
        <Link href="/account/login" className="underline underline-offset-2 hover:text-ink">Request a new one</Link>.
      </p>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password.length < 8) { setErr("Password must be at least 8 characters."); return; }
    setBusy(true);
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    setBusy(false);
    if (error) { setErr(error.message || "Could not reset password. The link may have expired."); return; }
    router.push("/account/login");
    router.refresh();
  }

  return (
    <form className="space-y-4 mt-8" onSubmit={onSubmit}>
      {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">{err}</p>}
      <div>
        <label htmlFor="password" className="block text-[13px] tracking-[0.08em] mb-1.5">New password</label>
        <input id="password" type="password" autoComplete="new-password" required minLength={8} value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-line bg-paper px-4 py-3 text-sm focus:outline-none focus:border-ink" />
      </div>
      <button type="submit" disabled={busy} className="btn w-full !bg-ink !border-ink disabled:opacity-60">
        {busy ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
