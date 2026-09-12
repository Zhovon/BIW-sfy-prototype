"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Article = { slug: string; title: string; excerpt?: string; image?: string | null };

export default function BlogCarousel({ articles }: { articles: Article[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = scroller.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector("article")?.clientWidth ?? 320;
    el.scrollBy({ left: dir * (card + 24), behavior: "smooth" });
  };

  return (
    <div>
      <div
        ref={scroller}
        className="flex gap-6 overflow-x-auto pb-2.5 -mx-5 px-5 md:mx-0 md:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {articles.map((a) => (
          <article key={a.slug} className="w-[280px] flex-none md:w-[320px]">
            <Link
              href={`/blog/${a.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-md border border-line bg-paper transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
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

      {/* prev / next controls */}
      <div className="mt-8 flex items-center justify-center gap-3">
        <CarouselButton dir="prev" disabled={atStart} onClick={() => scrollBy(-1)} />
        <CarouselButton dir="next" disabled={atEnd} onClick={() => scrollBy(1)} />
      </div>
    </div>
  );
}

function CarouselButton({
  dir,
  disabled,
  onClick,
}: {
  dir: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={dir === "prev" ? "Previous articles" : "Next articles"}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
        disabled
          ? "cursor-not-allowed border-line bg-ice text-muted/50"
          : "border-ink bg-ink text-white hover:border-gold hover:bg-gold hover:text-ink"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        {dir === "prev" ? (
          <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}
