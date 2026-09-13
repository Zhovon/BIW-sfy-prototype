import { notFound } from "next/navigation";
import policyData from "@/../data/policies.json";

const POLICIES: Record<string, string> = {
  "privacy-policy": "Privacy Policy",
  "refund-policy": "Refund Policy",
  "terms-of-service": "Terms of Service",
};

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = POLICIES[slug];
  return {
    title: `${title ?? "Policy"} · BIW`,
    description: `${title ?? "Policy"} — Beauty Intelligent Wellness, Dhaka.`,
    alternates: { canonical: `/policies/${slug}` },
  };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = POLICIES[slug];
  if (!title) notFound();

  const blocks = (policyData as unknown as Record<string, [string, string][]>)[slug] ?? [];

  return (
    <div className="wrap py-16 max-w-[70ch]">
      <h1 className="font-display text-4xl mb-8">{title}</h1>
      <div className="space-y-4">
        {blocks.map(([tag, text], i) => {
          if (tag === "h") {
            return (
              <h2 key={i} className="font-display text-2xl pt-4">
                {text}
              </h2>
            );
          }
          if (tag === "li") {
            return (
              <li key={i} className="text-sm text-muted leading-relaxed ml-5 list-disc">
                {text}
              </li>
            );
          }
          return (
            <p key={i} className="text-sm text-ink/80 leading-relaxed">
              {text}
            </p>
          );
        })}
      </div>
    </div>
  );
}

