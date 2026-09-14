import Link from "next/link";
import Image from "next/image";
import { getArticles } from "@/lib/catalog";
import PageHeader from "@/components/PageHeader";

export const metadata = {
  title: "Journal · BIW",
  description: "Skin science and wellness, in plain language — the Beauty Intelligent Wellness journal.",
  alternates: { canonical: "/blog" },
};

export default function Blog() {
  const articles = getArticles();
  return (
    <div className="wrap py-16">
      <PageHeader kicker="Journal" title="Read Our Blog" className="mb-10" />
      <div className="grid gap-8 md:grid-cols-3">
        {articles.map((a) => (
          <article key={a.slug} className="group">
            <Link href={`/blog/${a.slug}`} className="block">
              <div className="relative aspect-[3/2] overflow-hidden bg-ice border border-line group-hover:border-gold transition-colors">
                {a.image && (
                  <Image src={a.image} alt={a.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                )}
              </div>
              <h2 className="font-display text-xl leading-tight mt-4 group-hover:text-gold transition-colors">{a.title}</h2>
              {a.paragraphs[0] && (
                <p className="text-sm text-muted mt-2 line-clamp-3">{a.paragraphs[0]}</p>
              )}
              <span className="kicker text-[10px] mt-3 inline-block">Read more →</span>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
