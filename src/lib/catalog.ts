import raw from "@/../data/products.json";

export type Variant = { id: number | null; price_bdt: number | null; title: string | null };

export type Product = {
  handle: string;
  shopify_product_id: number | null;
  title: string;
  category: string | null;
  vendor: string | null;
  type: "service" | "retail";
  duration_min: number | null;
  price_bdt: number | null;
  currency: string;
  availability: string | null;
  image: string | null;
  description: string;
  variants: Variant[];
  url: string;
};

import collectionsData from "@/../data/collections.json";
import pagesData from "@/../data/pages.json";
import blogData from "@/../data/blog.json";

export const products = raw as Product[];

const byHandle = new Map(products.map((p) => [p.handle, p]));
export function getProduct(handle: string): Product | undefined {
  return byHandle.get(handle);
}

// ---- Real Shopify collections (handle + true membership) ----
type RawCollection = { handle: string; title: string; caption?: string; image?: string; products: string[] };
const rawCollections = collectionsData as RawCollection[];
const collectionByHandle = new Map(rawCollections.map((c) => [c.handle, c]));

export type Collection = { slug: string; title: string; caption?: string; image?: string; count: number };

export function getCollections(): Collection[] {
  return rawCollections
    .map((c) => ({ slug: c.handle, title: c.title, caption: c.caption, image: c.image, count: c.products.length }))
    .sort((a, b) => b.count - a.count);
}

export function getCollection(slug: string): { title: string; items: Product[] } | undefined {
  const c = collectionByHandle.get(slug);
  if (!c) return undefined;
  const items = c.products.map((h) => getProduct(h)).filter((p): p is Product => Boolean(p));
  if (items.length === 0) return undefined;
  return { title: c.title, items };
}

// ---- Custom pages (Shop product grids + Services collection grids) ----
type ProductGridPage = { slug: string; type: "product-grid"; title: string; products: string[] };
type CollectionGridPage = { slug: string; type: "collection-grid"; title: string; collections: string[] };
export type CustomPage = ProductGridPage | CollectionGridPage;
const pagesMap = pagesData as Record<string, CustomPage>;

export function getCustomPage(slug: string): CustomPage | undefined {
  return pagesMap[slug];
}
export function customPageSlugs(): string[] {
  return Object.keys(pagesMap);
}
export function resolveProducts(handles: string[]): Product[] {
  return handles.map((h) => getProduct(h)).filter((p): p is Product => Boolean(p));
}

// ---- Blog ----
export type Article = { slug: string; title: string; excerpt?: string; image?: string; paragraphs: string[] };
const articles = blogData as Article[];
export function getArticles(): Article[] {
  return articles;
}
export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

/** Matches the original storefront format exactly: "Tk 14,000.00 BDT". */
export function formatBDT(amount: number | null): string {
  if (amount == null) return "—";
  return "Tk " + amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " BDT";
}

/** Short form for cards: "2 hr 50 min". */
export function formatDuration(min: number | null): string | null {
  if (!min) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return [h ? `${h} hr` : "", m ? `${m} min` : ""].filter(Boolean).join(" ");
}

/** Long form for product pages: "2 hours 50 min" (matches original copy). */
export function formatDurationLong(min: number | null): string | null {
  if (!min) return null;
  const h = Math.floor(min / 60);
  const m = min % 60;
  const parts = [];
  if (h) parts.push(`${h} ${h === 1 ? "hour" : "hours"}`);
  if (m) parts.push(`${m} min`);
  return parts.join(" ");
}
