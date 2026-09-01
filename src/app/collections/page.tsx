import Link from "next/link";
import Image from "next/image";
import cards from "../../../data/collection_cards.json";

type Card = { handle: string; title: string; caption: string; image: string | null };

export const metadata = {
  title: "Collections · BIW",
  description: "Browse all BIW service collections.",
};

export default function CollectionsPage() {
  return (
    <div className="wrap py-16">
      <h1 className="font-display text-4xl text-center mb-12">Collections</h1>
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" role="list">
        {(cards as Card[]).map((c) => (
          <li key={c.handle}>
            <Link href={`/collections/${c.handle}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-ice">
                {c.image && (
                  <Image
                    src={c.image}
                    alt={c.title}
                    fill
                    sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                )}
                {/* Dawn card--media: title + caption overlay on the image */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent p-5 pt-10">
                  <h3 className="font-display text-lg tracking-[0.06em] text-white leading-[1.3] group-hover:underline underline-offset-4">
                    {c.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] text-white/85 leading-[1.5]">
                    {c.caption} <span aria-hidden>→</span>
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
