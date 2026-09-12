import Link from "next/link";
import Image from "next/image";
import CartButton from "@/components/CartButton";
import MobileNav from "@/components/MobileNav";

type NavItem = { label: string; href: string; children?: { label: string; href: string }[] };

const nav: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Shop",
    href: "/pages/products",
    children: [
      { label: "Shampoo", href: "/pages/shampoo" },
      { label: "Serum", href: "/pages/serums" },
      { label: "Face wash", href: "/pages/face-wash" },
      { label: "All Products", href: "/pages/products" },
    ],
  },
  {
    label: "Services",
    href: "/pages/female-services",
    children: [
      { label: "Female's Services", href: "/pages/female-services" },
      { label: "Male's Services", href: "/pages/male-services" },
    ],
  },
  { label: "About", href: "/pages/about" },
  { label: "Contact", href: "/pages/contact" },
];

function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

export default function Header() {
  return (
    <header className="border-b border-line bg-paper sticky top-0 z-40">
      {/* utility row */}
      <div className="wrap grid grid-cols-3 items-center h-[86px]">
        <div className="flex items-center gap-2">
          <MobileNav nav={nav} />
          <button aria-label="Search" className="text-ink hover:text-gold transition-colors">
            <IconSearch />
          </button>
        </div>
        <Link href="/" className="flex justify-center" aria-label="BIW home">
          <Image src="/biw-logo.png" alt="BIW" width={64} height={64} priority className="h-14 w-auto object-contain" />
        </Link>
        <div className="flex items-center justify-end gap-5 text-ink">
          <Link href="/account/login" className="text-[12.5px] tracking-[0.14em] text-ink/75 hover:text-ink transition-colors">
            Log in
          </Link>
          <CartButton />
        </div>
      </div>

      {/* nav row with dropdowns */}
      <nav className="hidden md:flex items-center justify-center gap-9 pb-3 -mt-2">
        {nav.map((n) =>
          n.children ? (
            <div key={n.label} className="relative group">
              <Link
                href={n.href}
                className="flex items-center gap-1 text-[12.5px] tracking-[0.14em] text-ink/75 group-hover:text-ink transition-colors py-1"
              >
                <span className="group-hover:underline underline-offset-[0.3rem]">{n.label}</span>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5" aria-hidden>
                  <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              {/* dropdown */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <div className="bg-paper border border-line shadow-lg min-w-[190px] py-2">
                  {n.children.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className="block px-5 py-2.5 text-[12.5px] tracking-[0.08em] text-ink/80 hover:text-ink hover:underline underline-offset-[0.3rem] hover:bg-ice transition-colors whitespace-nowrap"
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Link
              key={n.label}
              href={n.href}
              className="text-[12.5px] tracking-[0.14em] text-ink/75 hover:text-ink hover:underline underline-offset-[0.3rem] transition-colors py-1"
            >
              {n.label}
            </Link>
          )
        )}
      </nav>
    </header>
  );
}
