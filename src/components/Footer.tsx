import Link from "next/link";

const cols = [
  {
    heading: "Quick links",
    links: [
      { label: "Shop", href: "/pages/products" },
      { label: "Services", href: "/collections" },
      { label: "Blog", href: "/blog" },
      { label: "About", href: "/" },
    ],
  },
  {
    heading: "Policies",
    links: [
      { label: "Privacy Policy", href: "/policies/privacy-policy" },
      { label: "Return Policy", href: "/policies/refund-policy" },
      { label: "Terms of Services", href: "/policies/terms-of-service" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-ice">
      <div className="wrap py-14 grid gap-10 grid-cols-2 md:grid-cols-4">
        {cols.map((c) => (
          <div key={c.heading}>
            <h4 className="font-display text-lg mb-4">{c.heading}</h4>
            <ul className="space-y-2.5">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[13px] text-muted hover:text-ink transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="wrap pb-10 text-center text-xs text-muted tracking-[0.04em]">
        © {new Date().getFullYear()}, BIW
      </div>
    </footer>
  );
}
