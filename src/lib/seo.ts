/**
 * Structured-data (JSON-LD) helpers shared across pages.
 * Keep types schema.org-valid and data server-serialized (never user input).
 */
import { SITE_NAME, absoluteUrl } from "./site";

/** Reusable publisher/author node for Article + blog schema. */
export const publisherLd = {
  "@type": "Organization",
  name: SITE_NAME,
  logo: { "@type": "ImageObject", url: absoluteUrl("/biw-logo.png") },
};

/** BreadcrumbList from an ordered list of {name, path} crumbs. */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

/** ItemList for a collection/listing page (helps SEO + AI enumerate offerings). */
export function itemListLd(
  name: string,
  items: { title: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.title,
      url: absoluteUrl(it.path),
    })),
  };
}
