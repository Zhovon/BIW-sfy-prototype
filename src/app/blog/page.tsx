import Link from "next/link";
import { getArticles } from "@/lib/catalog";

export const metadata = { title: "Journal · BIW" };

export default function Blog() {
  const articles = getArticles();
  return (
    <div className="wrap py-16">
      <div className="kicker text-center">Journal</div>
      <h1 className="font-display text-4xl mt-2 mb-10 text-center">Read Our Blog</h1>
      <div className="grid gap-8 md:grid-cols-3">
        {articles.map((a) => (
          <article key={a.slug} className="group">
            <Link href={`/blog/${a.slug}`} className="block">
              <div className="aspect-[3/2] bg-ice border border-line group-hover:border-gold transition-colors" />
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
