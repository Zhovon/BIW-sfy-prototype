import Link from "next/link";
import Image from "next/image";
import LogoutButton from "@/components/admin/LogoutButton";

const NAV = [
  { label: "Dashboard", href: "/admin" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Products", href: "/admin/products" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "API log", href: "/admin/logs" },
];

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-paper">
        <div className="wrap flex flex-wrap items-center gap-x-8 gap-y-2 py-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image src="/biw-emblem.png" alt="BIW" width={28} height={28} className="h-7 w-7 object-contain" />
            <span className="font-display text-xl">Admin</span>
          </Link>
          <nav className="flex flex-wrap gap-6 text-[13px] uppercase tracking-[0.08em]">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="text-muted hover:text-ink">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-6">
            <Link
              href="/"
              className="text-[12px] uppercase tracking-[0.08em] text-muted hover:text-ink"
            >
              View store
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="wrap py-10">{children}</div>
    </>
  );
}
