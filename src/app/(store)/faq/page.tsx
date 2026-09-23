import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { PRIMARY_PHONE } from "@/lib/business";

export const metadata: Metadata = {
  title: "FAQ · BIW",
  description:
    "Frequently asked questions about Beauty Intelligent Wellness — locations, treatments, booking, hours, payment, and contact.",
  alternates: { canonical: "/faq" },
};

/**
 * Q&A shown visibly below AND emitted as FAQPage schema — Google requires the
 * answer text to be visible on the page, so both read from this one array.
 */
const FAQ: { q: string; a: string }[] = [
  {
    q: "Where is Beauty Intelligent Wellness located?",
    a: "BIW has two branches in Dhaka: Uttara (House 39, Road 15, Sector 3, Rabindra Sarani) and Bashundhara (Adept NR Complex, Jagannathpur, Bashundhara Link Road). Both are open 10:00 AM–8:00 PM, seven days a week.",
  },
  {
    q: "What treatments and services does BIW offer?",
    a: "As an aesthetic and skin clinic and wellness studio, BIW offers medical-aesthetic treatments (such as HIFU, PRP, dermapen, laser and glutathione), facials and hydrafacials, brightening treatments, hair care, massage, waxing, and manicure and pedicure — alongside a range of skincare products.",
  },
  {
    q: "Do I need to book in advance?",
    a: "Booking in advance is recommended so we can reserve your preferred time and specialist. You can browse treatments and book directly on this website.",
  },
  {
    q: "What are your opening hours?",
    a: "Both branches are open from 10:00 AM to 8:00 PM, every day of the week.",
  },
  {
    q: "How can I pay?",
    a: "Prices are in Bangladeshi Taka (BDT). You can pay at the clinic — pay-at-clinic is supported at checkout.",
  },
  {
    q: "Do you offer services for men?",
    a: "Yes. BIW offers a dedicated range of gents' facials, grooming and treatments alongside its services for women.",
  },
  {
    q: "How do I contact you?",
    a: `You can call or message us on WhatsApp at ${PRIMARY_PHONE}, or reach out through our Facebook pages and Instagram (@beautyintelligent1).`,
  },
  {
    q: "Which treatment is right for my skin?",
    a: "Many treatments can be tailored to your skin and goals. We recommend starting with a consultation so our team can advise the most suitable treatment for you.",
  },
];

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const crumbsLd = breadcrumbLd([
  { name: "Home", path: "/" },
  { name: "FAQ", path: "/faq" },
]);

export default function FaqPage() {
  return (
    <div className="wrap py-16 max-w-[68ch]">
      <JsonLd data={faqLd} />
      <JsonLd data={crumbsLd} />
      <div className="kicker text-center">Help</div>
      <h1 className="font-display text-4xl md:text-5xl mt-3 mb-6 text-center leading-tight">
        Frequently asked questions
      </h1>
      <hr className="rule-gold mx-auto mb-10" />
      <dl className="divide-y divide-line border-y border-line">
        {FAQ.map((item) => (
          <div key={item.q} className="py-6">
            <dt className="font-display text-lg text-ink">{item.q}</dt>
            <dd className="mt-2 text-ink/80 leading-relaxed">{item.a}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-10 text-center text-sm text-muted">
        Still have a question? Message us on{" "}
        <a
          className="underline hover:text-ink"
          href={`https://wa.me/${PRIMARY_PHONE.replace(/[^0-9]/g, "")}`}
        >
          WhatsApp
        </a>
        .
      </p>
    </div>
  );
}
