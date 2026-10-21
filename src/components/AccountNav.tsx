"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";

/** Header link: "Account" when signed in, "Log in" otherwise. */
export default function AccountNav() {
  const { data: session, isPending } = useSession();
  const href = session ? "/account" : "/account/login";
  const label = session ? "Account" : "Log in";
  return (
    <Link
      href={href}
      className="text-[12.5px] tracking-[0.14em] text-ink/75 hover:text-ink transition-colors"
      // avoid a flash of the wrong label before the session resolves
      style={isPending ? { opacity: 0.6 } : undefined}
    >
      {label}
    </Link>
  );
}
