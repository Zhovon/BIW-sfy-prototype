import Link from "next/link";
import Image from "next/image";
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
  { label: "Female Service", href: "/pages/female-services", img: getProduct("signature-facial")?.image },
  { label: "Male Service", href: "/pages/male-services", img: getProduct("advance-hydra-gents")?.image },
  { label: "View More Services", href: "/collections", img: getProduct("body-massage")?.image },
];

function Stars({ filled }: { filled: number }) {
  return (
    <div className="flex gap-1 text-xl" aria-label={`${filled} out of 5 stars`}>
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
      {/* HERO — full-bleed video banner (matches biw.salon) */}
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
      </section>

      {/* HERO TEXT BLOCK — matches biw.salon ai-responsive-text: one 48px block, ~80px pt / ~105px pb */}
      <section className="pt-[52px] pb-[72px] text-center md:pt-[80px] md:pb-[104px]">
        <div className="wrap">
          <h1 className="font-display text-[32px] leading-[1.2] font-normal md:text-[48px] mx-auto max-w-[22ch]">
            Smart Beauty. Holistic Wellness. Bangladesh&rsquo;s first integrated
            medical-aesthetic wellness experience.
          </h1>
        </div>
      </section>

      {/* ABOUT BIW — matches biw.salon ai-image-text (95% container, gap 40px, 48px heading, 21px body) */}
      <section className="py-10 md:py-16">
        <div className="wrap flex flex-col items-center gap-8 md:flex-row md:gap-12">
          <div className="min-w-0 flex-1">
            <div className="relative aspect-square overflow-hidden rounded-md bg-ice">
              <Image src="/biw-emblem.png" alt="Beauty Intelligent Wellness" fill sizes="(max-width:768px) 100vw, 45vw" className="object-contain" />
            </div>
          </div>
          <div className="min-w-0 flex-1 text-center md:text-left">
            <h2 className="font-display text-[34px] md:text-[48px] leading-[1.2] mb-5">About BIW</h2>
            <p className="text-[18px] md:text-[21px] leading-[1.6]">
              Beauty Intelligent Wellness was created as a modern destination for refined beauty,
              advanced aesthetics, and intentional self-care.
            </p>
            <Link href="/pages/about" className="font-display text-lg font-bold underline underline-offset-4 hover:text-gold transition-colors inline-block mt-5">
              See More
            </Link>
          </div>
        </div>
      </section>

      {/* OUR SERVICES — matches biw.salon ai-page-links-collection (32px heading, mb-40px, gap 20px, 1:1 media) */}
      <section className="py-10">
        <div className="wrap">
          <div className="text-center mb-10">
            <h2 className="font-display text-[32px] leading-[1.2]">Our Services</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {serviceCards.map((c) => (
              <Link key={c.label} href={c.href} className="group block">
                <div className="overflow-hidden rounded-md border border-line bg-paper transition-shadow duration-300 group-hover:shadow-md">
                  <div className="relative aspect-square overflow-hidden bg-ice">
                    {c.img && (
                      <Image src={c.img} alt={c.label} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2 px-4 py-4 font-display text-xl group-hover:text-gold transition-colors">
                    {c.label} <span aria-hidden>→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — matches biw.salon ai-testimonial-carousel (py-60px, px-40px, cards p-30px r-12px, gap 30px) */}
      <section className="py-[60px]">
        <div className="wrap">
          <div className="text-center mb-10">
            <h2 className="font-display text-[32px] md:text-[38px] leading-[1.2]">What Our Clients Say</h2>
            <p className="mt-3 text-base text-muted">Real experiences from our valued customers</p>
          </div>
          <div className="grid grid-cols-1 gap-[30px] md:grid-cols-2">
            {testimonials.map((t) => (
              <div key={t.name} className="flex flex-col gap-4 rounded-xl border border-line bg-paper p-[30px] shadow-sm">
                <Stars filled={t.stars} />
                <p className="grow text-base leading-[1.6]">{t.text}</p>
                <div className="flex flex-col gap-1">
                  <h3 className="font-display text-lg leading-[1.3]">{t.name}</h3>
                  <div className="text-sm italic text-muted">{t.service}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex items-center justify-center gap-2" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-ink/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink/30" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink/30" />
          </div>
        </div>
      </section>

      {/* BLOG — matches biw.salon ai-blog-carousel (horizontal scroll, cards 320px, gap 25px, content p-20px) */}
      <section className="py-6">
        <div className="wrap">
          <div className="text-center mb-[30px]">
            <h2 className="font-display text-[32px] leading-[1.2]">Read Our Blog</h2>
          </div>
          <div className="flex gap-[25px] overflow-x-auto pb-2.5">
            {getArticles().slice(0, 5).map((a) => (
              <article key={a.slug} className="w-[280px] flex-none md:w-[320px]">
                <Link href={`/blog/${a.slug}`} className="group block overflow-hidden rounded-md border border-line bg-paper transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="relative aspect-[3/2] overflow-hidden bg-ice">
                    {a.image && (
                      <Image src={a.image} alt={a.title} fill sizes="320px" className="object-cover" />
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg leading-[1.3] mb-2.5 group-hover:text-gold transition-colors">{a.title}</h3>
                    {a.excerpt && <p className="text-sm leading-[1.6] mb-[15px] text-ink/80">{a.excerpt}</p>}
                    <span className="text-sm font-semibold group-hover:underline">Read more</span>
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
