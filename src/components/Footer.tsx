import Link from "next/link";
import Image from "next/image";

const cols = [
  {
    heading: "Explore",
    links: [
      { label: "Shop", href: "/pages/products" },
      { label: "Services", href: "/collections" },
      { label: "Blog", href: "/blog" },
      { label: "About", href: "/pages/about" },
    ],
  },
  {
    heading: "Policies",
    links: [
      { label: "Privacy Policy", href: "/policies/privacy-policy" },
      { label: "Return Policy", href: "/policies/refund-policy" },
      { label: "Terms of Service", href: "/policies/terms-of-service" },
    ],
  },
  {
    heading: "Visit",
    links: [
      { label: "Dhaka, Bangladesh", href: "/pages/contact" },
      { label: "Message on WhatsApp", href: "https://wa.me/8801806553255" },
      { label: "Begin your consultation", href: "/collections" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-white/70">
      {/* signature gold hairline */}
      <div className="h-0.5 w-full bg-gold" />

      <div className="wrap grid gap-10 py-16 sm:grid-cols-2 md:grid-cols-4">
        {/* brand column */}
        <div className="sm:col-span-2 md:col-span-1">
          <Image src="/biw-logo.png" alt="Beauty Intelligent Wellness" width={72} height={72} className="h-16 w-auto object-contain" />
          <p className="mt-4 max-w-[30ch] text-[13px] leading-[1.7] text-white/50">
            Beauty Intelligent Wellness. Bring out your inner beauty, where clinic meets couture.
          </p>
        </div>

        {cols.map((c) => (
          <nav key={c.heading} aria-label={c.heading}>
            <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90">
              {c.heading}
            </h4>
            <ul className="space-y-3">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[13px] leading-[1.5] text-white/60 transition-colors hover:text-gold"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="wrap flex flex-col items-center justify-between gap-3 py-6 text-center sm:flex-row sm:text-left">
          <span className="text-[12px] text-white/45">
            © {new Date().getFullYear()} Beauty Intelligent Wellness
          </span>
          <span className="text-[11px] uppercase tracking-[0.24em] text-white/35">
            Clinical Couture
          </span>
        </div>
      </div>
    </footer>
  );
}
