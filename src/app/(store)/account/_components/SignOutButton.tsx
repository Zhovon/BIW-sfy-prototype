"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export default function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await signOut();
        router.push("/account/login");
        router.refresh();
      }}
      className="text-[13px] underline underline-offset-2 text-muted hover:text-ink"
    >
      Sign out
    </button>
  );
}
