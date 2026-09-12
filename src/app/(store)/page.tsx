import Link from "next/link";
import Image from "next/image";
import SectionHead from "@/components/SectionHead";
import { getProduct, getArticles } from "@/lib/catalog";

const HERO_VIDEO =
  "https://biw.salon/cdn/shop/videos/c/vp/9e0592ec483f4cec82b7ee0e344db534/9e0592ec483f4cec82b7ee0e344db534.HD-1080p-7.2Mbps-84905408.mp4?v=0";

const testimonials = [
  { stars: 5, name: "Nadia Islam", service: "Signature Facial", text: "The facial treatment at BIW was absolutely divine. My skin felt rejuvenated and glowing for days. The staff was incredibly professional and attentive." },
  { stars: 4, name: "Fatema Afrin", service: "Hair Treatment", text: "I've tried many salons in Dhaka, but BIW is on another level. The ambiance is so calming and the hair treatment left my hair silky smooth. Will definitely be back!" },
  { stars: 4, name: "Nowshin Rahman", service: "Body Massage", text: "Booked a full body massage and it was the most relaxing experience I've had. The therapists are highly skilled and the products they use smell amazing." },
  { stars: 5, name: "Mehnaz Begum", service: "Spa Package", text: "Such a premium experience from start to finish. The salon is beautifully designed and the team made me feel so pampered. BIW is now my go-to wellness destination." },
];

const serviceCards = [
  { label: "Female Services", href: "/pages/female-services", img: getProduct("signature-facial")?.image },
  { label: "Male Services", href: "/pages/male-services", img: getProduct("advance-hydra-gents")?.image },
  { label: "View More Services", href: "/collections", img: getProduct("body-massage")?.image },
];

function Stars({ filled }: { filled: number }) {
  return (
    <div className="flex gap-1 text-lg" aria-label={`${filled} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < filled ? "text-gold" : "text-line"} aria-hidden>
          ★
        </span>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* HERO — full-bleed video banner with the signature gold hairline beneath */}
      <section className="relative overflow-hidden bg-ink">
        <video
          className="w-full h-[70vh] md:h-[80vh] object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>
        <div className="h-0.5 w-full bg-gold" />
      </section>

      {/* HERO TEXT — positioning statement, teal kicker + gold rule */}
      <section className="section text-center">
        <div className="wrap">
          <span className="kicker mb-4">Beauty Intelligent Wellness</span>
          <h1 className="font-display text-[34px] leading-[1.12] font-normal md:text-[54px] mx-auto max-w-[16ch]">
            Smart Beauty. Holistic Wellness.
          </h1>
          <p className="mt-5 text-muted text-[17px] leading-[1.7] max-w-[56ch] mx-auto">
            Bangladesh&rsquo;s first integrated medical-aesthetic wellness experience,
            where advanced technology meets calm, considered care.
          </p>
          <hr className="rule-gold mx-auto mt-8" />
        </div>
      </section>

      {/* ABOUT BIW — image + text, left-aligned section header */}
      <section className="section bg-ice">
        <div className="wrap flex flex-col items-center gap-10 md:flex-row md:gap-16">
          <div className="min-w-0 flex-1 w-full">
            <div className="relative aspect-square overflow-hidden rounded-md bg-paper">
              <Image src="/biw-emblem.png" alt="Beauty Intelligent Wellness" fill sizes="(max-width:768px) 100vw, 45vw" className="object-contain" />
            </div>
          </div>
          <div className="min-w-0 flex-1 text-center md:text-left">
            <SectionHead kicker="Who We Are" title="About BIW" align="left" />
            <p className="mt-6 text-[17px] md:text-[19px] leading-[1.7] text-ink/80 max-w-[46ch] mx-auto md:mx-0">
              Beauty Intelligent Wellness was created as a modern destination for refined beauty,
              advanced aesthetics, and intentional self-care. We sit where clinic meets couture:
              evidence-based skin and body care, held to a luxury standard.
            </p>
            <Link href="/pages/about" className="btn btn--ghost mt-8 inline-flex">
              Discover our story
            </Link>
          </div>
        </div>
      </section>

      {/* OUR SERVICES */}
      <section className="section">
        <div className="wrap">
          <SectionHead kicker="Treatments" title="Our Services" subtitle="Clinical rituals for face, body, and hair, tailored to you." />
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {serviceCards.map((c) => (
              <Link key={c.label} href={c.href} className="group block">
                <div className="overflow-hidden rounded-md border border-line bg-paper transition-shadow duration-300 group-hover:shadow-md">
                  <div className="relative aspect-square overflow-hidden bg-ice">
                    {c.img && (
                      <Image src={c.img} alt={c.label} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2 px-4 py-5 font-display text-xl group-hover:text-gold transition-colors">
                    {c.label} <span className="transition-transform group-hover:translate-x-1" aria-hidden>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section bg-ice">
        <div className="wrap">
          <SectionHead kicker="Testimonials" title="What Our Clients Say" subtitle="Real experiences from our valued clients." />
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {testimonials.map((t) => (
              <figure key={t.name} className="flex flex-col gap-4 rounded-xl border border-line bg-paper p-7 md:p-8 shadow-sm">
                <Stars filled={t.stars} />
                <blockquote className="grow text-[15px] leading-[1.7] text-ink/85">“{t.text}”</blockquote>
                <figcaption className="flex flex-col gap-0.5 border-t border-line pt-4">
                  <span className="font-display text-lg leading-[1.3]">{t.name}</span>
                  <span className="text-[13px] tracking-[0.02em] text-teal">{t.service}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section className="section">
        <div className="wrap">
          <SectionHead kicker="Journal" title="Read Our Blog" subtitle="Skin science and wellness, in plain language." />
          <div className="mt-12 flex gap-6 overflow-x-auto pb-2.5 -mx-5 px-5 md:mx-0 md:px-0">
            {getArticles().slice(0, 5).map((a) => (
              <article key={a.slug} className="w-[280px] flex-none md:w-[320px]">
                <Link href={`/blog/${a.slug}`} className="group flex h-full flex-col overflow-hidden rounded-md border border-line bg-paper transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="relative aspect-[3/2] overflow-hidden bg-ice">
                    {a.image && (
                      <Image src={a.image} alt={a.title} fill sizes="320px" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                    )}
                  </div>
                  <div className="flex grow flex-col p-5">
                    <h3 className="font-display text-lg leading-[1.3] mb-2 group-hover:text-gold transition-colors">{a.title}</h3>
                    {a.excerpt && <p className="text-[13px] leading-[1.6] mb-4 text-muted line-clamp-3">{a.excerpt}</p>}
                    <span className="mt-auto text-[12px] font-semibold uppercase tracking-[0.12em] text-teal group-hover:text-gold transition-colors">Read more →</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
