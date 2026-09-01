import Link from "next/link";
import Image from "next/image";

const CDN = "https://biw.salon/cdn/shop/files";

const principles = [
  {
    letter: "B",
    name: "Beauty",
    title: "The visible result.",
    body: "Clarity of skin, softness of contour, the quiet confidence of looking rested. Never a mask, always an outcome of health.",
  },
  {
    letter: "I",
    name: "Intelligent",
    title: "Assessment before treatment.",
    body: "Specialists rather than technicians. A personalised plan chosen for your skin, your history, and your goals, not a menu applied to everyone.",
  },
  {
    letter: "W",
    name: "Wellness",
    title: "Beauty that follows from health",
    body: "We treat the whole person and the long term, so results are something you keep rather than something you chase.",
  },
];

const founders = [
  {
    name: "LABONI AKTER",
    role: "Founder",
    img: `${CDN}/Untitled_design_1.png?v=1784270911&width=800`,
    bio: "Laboni founded BIW around a belief that wellness and beauty are one pursuit, guided by care and evidence rather than trend. She sets the standard for the client experience and maintaining female services to be the top notch and compatible with clients for best experience. Not only that She maintain the branch catalogs and criteria of services.",
  },
  {
    name: "MD RAZIB AHAMED",
    role: "Founder",
    img: `${CDN}/WhatsApp_Image_2026-07-13_at_14.31.10.jpg?v=1784270928&width=800`,
    bio: "MD: Razib founded BIW to build a wellness centre Dhaka could trust, where every treatment is chosen for the person in front of it. He leads its direction and growth. For Internal communication and getting out the best output from the employee he is the core of this responsibilities. As a humble person he is quite popular among all employee",
  },
  {
    name: "USMAN BHUIYAN",
    role: "Founder",
    img: `${CDN}/Untitled_design_3.png?v=1784270930&width=800`,
    bio: "Usman Bhuiyan Rubel founded BIW with a vision to redefine beauty and wellness through exceptional care, innovation, and excellence. As a founder , he leads the company\u2019s growth while ensuring every BIW location delivers a consistent, personalized experience built on quality, trust, and client satisfaction. Absolutely focused person with ambition.",
  },
];

const locations = [
  {
    badge: "Flagship · Open now",
    name: "Bashundhara Gents",
    address: "Adept NR Complex, Lift 3, Building Ka-5/2, Jagannathpur, Bashundhara Link Road, Dhaka 1229",
    phone: "Phone : 01806553255",
    hours: "Hours 10:00 am - 10:00 pm",
  },
  {
    badge: "Flagship · Open now",
    name: "Bashundhara Ladies",
    address: "Adept NR Complex, Lift 5, Building Ka-5/2, Jagannathpur, Bashundhara Link Road, Dhaka 1229",
    phone: "Phone: +880 1730-891106",
    hours: "Hours 10:00 am - 10:00 pm",
  },
  {
    badge: "Flagship · Open now",
    name: "Uttara ladies",
    address: "House 39 # 4th Floor, 15 no road ,sector-3, Rabindra Sarani, Dhaka 1230, Dhaka, Bangladesh",
    phone: "Phone: +880 1730-891106",
    hours: "Hours: 10:00 am - 10:00 pm",
  },
  {
    badge: "Flagship · Coming soon",
    name: "Mirpur",
    address: "Arriving soon, Keep eye on our pages and website for updates",
    phone: "",
    hours: "",
  },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "What is BIW?",
    a: "BIW is an integrated medical-aesthetic wellness centre in Bashundhara, Dhaka. It offers assessment-led skin, aesthetic, and wellness treatments for women and men, alongside a range of clean, non-toxic skincare.",
  },
  {
    q: "Where is BIW located?",
    a: "Our flagship centre is in Bashundhara, Dhaka, with a dedicated gentlemen's centre in Bashundhara, a branch in Uttara (Azampur), and a further location arriving in Mirpur.",
  },
  {
    q: "What treatments does BIW offer?",
    a: "",
  },
  {
    q: "What makes BIW a medical-aesthetic centre?",
    a: "Every treatment is assessment-led and delivered by trained specialists, with a personalised plan created for you. We treat the whole person and prioritise safety and lasting results.",
  },
  {
    q: "Do you offer consultations?",
    a: "Yes. Every treatment begins with a complimentary consultation, where a specialist listens, assesses, and recommends a personalised plan.",
  },
];

function Kicker({ children }: { children: React.ReactNode }) {
  return <div className="kicker text-center text-[11px] tracking-[0.22em] text-muted">{children}</div>;
}

export default function AboutContent() {
  return (
    <div>
      {/* Intro */}
      <section className="wrap pt-16 pb-10 text-center">
        <Kicker>Medical-Aesthetic Wellness Centre &middot; Dhaka</Kicker>
        <h1 className="font-display text-4xl md:text-5xl mt-4">Where beauty is treated with intelligence.</h1>
        <p className="text-ink/80 leading-relaxed mt-6 max-w-[64ch] mx-auto">
          At BIW, every result begins with understanding. We assess before we treat, and we build each
          plan around one person: you.
        </p>
        <p className="text-ink/80 leading-relaxed mt-4 max-w-[64ch] mx-auto">
          Beauty Intelligent Wellness (BIW) is an integrated medical-aesthetic wellness centre in
          Bashundhara, Dhaka. We provide assessment-led skin, aesthetic, and wellness treatments for
          women and men...
        </p>
        <div className="grid md:grid-cols-3 gap-4 mt-12">
          <div className="relative aspect-[3/4] overflow-hidden bg-ice">
            <Image src={`${CDN}/pedicure_haircut.jpg?v=1784268819&width=1200`} alt="BIW treatment" fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
          </div>
          <div className="relative aspect-[3/4] overflow-hidden bg-ice">
            <Image src={`${CDN}/lobby.jpg?v=1784268819&width=1200`} alt="BIW lobby" fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
          </div>
          <div className="relative aspect-[3/4] overflow-hidden bg-ice">
            <Image src={`${CDN}/face_scan.jpg?v=1784268878&width=1200`} alt="BIW skin assessment" fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* The BIW Method */}
      <section className="wrap py-16 text-center">
        <Kicker>The BIW Method</Kicker>
        <h2 className="font-display text-3xl md:text-4xl mt-4">Beauty, guided by evidence.</h2>
        <Kicker>
          <span className="block mt-12">Philosophy</span>
        </Kicker>
        <h2 className="font-display text-3xl md:text-4xl mt-4">Three principles, held in balance.</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-12 text-left">
          {principles.map((p) => (
            <div key={p.letter} className="border border-line bg-ice p-8">
              <div className="font-display text-5xl text-gold">{p.letter}</div>
              <div className="font-display text-2xl mt-4">{p.name}</div>
              <h3 className="font-display text-lg mt-3">{p.title}</h3>
              <p className="text-sm text-muted leading-relaxed mt-3">{p.body}</p>
            </div>
          ))}
        </div>
        <h2 className="font-display text-2xl md:text-3xl mt-16 max-w-[40ch] mx-auto">
          Intelligent wellness means treatment that reads you first, and treats you second.
        </h2>
      </section>

      {/* Leadership */}
      <section className="wrap py-16 text-center">
        <Kicker>Leadership</Kicker>
        <h2 className="font-display text-3xl md:text-4xl mt-4">Founded on one standard.</h2>
        <div className="grid md:grid-cols-3 gap-8 mt-12 text-left">
          {founders.map((f) => (
            <div key={f.name}>
              <div className="relative aspect-square overflow-hidden bg-ice">
                <Image src={f.img} alt={f.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
              </div>
              <h3 className="font-display text-xl tracking-[0.08em] mt-5">{f.name}</h3>
              <div className="kicker text-[10px] mt-1">{f.role}</div>
              <p className="text-sm text-muted leading-relaxed mt-3">{f.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Locations */}
      <section className="wrap py-16 text-center">
        <Kicker>Visit us</Kicker>
        <h2 className="font-display text-3xl md:text-4xl mt-4">Find us across Dhaka.</h2>
        <div className="grid md:grid-cols-2 gap-6 mt-12 text-left">
          {locations.map((l) => (
            <div key={l.name} className="border border-line bg-ice p-8">
              <div className="kicker text-[10px]">{l.badge}</div>
              <h3 className="font-display text-2xl mt-2">{l.name}</h3>
              <p className="text-sm text-muted leading-relaxed mt-3">{l.address}</p>
              {l.phone && <p className="text-sm text-muted mt-2">{l.phone}</p>}
              {l.hours && <p className="text-sm text-muted mt-1">{l.hours}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="wrap py-16 max-w-3xl">
        <h2 className="font-display text-3xl md:text-4xl text-center">Frequently asked questions.</h2>
        <div className="mt-10 divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex items-center justify-between py-5 cursor-pointer font-display text-lg list-none">
                {f.q}
                <span className="text-muted group-open:rotate-45 transition-transform" aria-hidden>+</span>
              </summary>
              <div className="pb-5 text-sm text-muted leading-relaxed">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="wrap py-16 text-center">
        <Kicker>Your first step is complimentary.</Kicker>
        <h2 className="font-display text-3xl md:text-4xl mt-4">Begin with a conversation.</h2>
        <Link href="/collections/all" className="btn btn--gold mt-8 inline-block">Book a Consultation</Link>
        <p className="text-xs text-muted mt-6 max-w-[70ch] mx-auto">
          * Terms and conditions apply to all complimentary consultations and treatments. Results may
          vary by individual. Please consult with our specialists.
        </p>
      </section>
    </div>
  );
}
