import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle, getArticles } from "@/lib/catalog";

export function generateStaticParams() {
  return getArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArticle(slug);
  if (!a) return { title: "Journal · BIW" };
  const description = a.excerpt || a.paragraphs[0]?.slice(0, 160);
  return {
    title: `${a.title} · BIW`,
    description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { type: "article", title: a.title, description, url: `/blog/${slug}`, images: [a.image || "/biw-logo.png"] },
  };
}

export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <article className="wrap py-16 max-w-[68ch]">
      <div className="kicker text-center">Journal</div>
      <h1 className="font-display text-4xl md:text-5xl mt-3 mb-8 text-center leading-tight">{article.title}</h1>
      <div className="aspect-[16/7] bg-ice border border-line mb-10" />
      <div className="space-y-5">
        {article.paragraphs.map((p, i) => (
          <p key={i} className="text-ink/80 leading-relaxed">{p}</p>
        ))}
      </div>
      <div className="mt-12 text-center">
        <Link href="/blog" className="btn btn--ghost">← Back to journal</Link>
      </div>
    </article>
  );
}
