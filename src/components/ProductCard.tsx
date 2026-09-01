import Link from "next/link";
import Image from "next/image";
import { Product, formatBDT } from "@/lib/catalog";

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link href={`/products/${p.handle}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-ice border border-line">
        {p.image ? (
          <Image
            src={p.image}
            alt={p.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted text-xs uppercase tracking-widest">
            BIW
          </div>
        )}
        {p.availability === "OutOfStock" && (
          <span className="absolute top-3 left-3 bg-ink text-white text-[10px] uppercase tracking-widest px-2 py-1">
            Sold out
          </span>
        )}
      </div>
      <div className="pt-3 text-center">
        <h3 className="font-display text-lg leading-tight group-hover:underline underline-offset-[0.3rem]">
          {p.title}
        </h3>
        <div className="text-[13px] text-muted mt-1">{formatBDT(p.price_bdt)}</div>
      </div>
    </Link>
  );
}
