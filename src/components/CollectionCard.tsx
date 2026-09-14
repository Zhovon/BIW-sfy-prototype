import Link from "next/link";
import Image from "next/image";

/**
 * Service/collection card — mirrors biw.salon's Dawn collection-list card:
 * a square cover, an uppercase Cormorant heading, and a one-line caption
 * with a trailing arrow. Text sits below the image (never overlaid), so it
 * reads cleanly on any artwork. Shared by the service landing pages and the
 * all-collections index so both stay in lockstep.
 */
export default function CollectionCard({
  slug,
  title,
  caption,
  cover,
}: {
  slug: string;
  title: string;
  caption?: string;
  cover?: string | null;
}) {
  return (
    <Link href={`/collections/${slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden bg-ice">
        {cover && (
          <Image
            src={cover}
            alt={title}
            fill
            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        )}
      </div>
      <div className="pt-4">
        <h3 className="font-display text-[22px] leading-tight uppercase tracking-[0.02em] transition-colors group-hover:text-gold">
          {title}
        </h3>
        {caption && (
          <p className="mt-2 text-sm leading-[1.55] text-muted">
            {caption}
            <span className="ml-1 inline-block align-middle text-ink/70 transition-transform group-hover:translate-x-1" aria-hidden>
              →
            </span>
          </p>
        )}
      </div>
    </Link>
  );
}
