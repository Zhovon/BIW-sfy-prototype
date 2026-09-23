import type { MetadataRoute } from "next";
import { products, getCollections, customPageSlugs, getArticles } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site";

/** Policy slugs mirror POLICIES in (store)/policies/[slug]/page.tsx. */
const POLICY_SLUGS = ["privacy-policy", "refund-policy", "terms-of-service"];

export default function sitemap(): MetadataRoute.Sitemap {
  const entry = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  ): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(path),
    priority,
    changeFrequency,
  });

  return [
    entry("/", 1, "weekly"),
    entry("/collections", 0.7, "weekly"),
    entry("/blog", 0.6, "weekly"),
    entry("/faq", 0.5, "monthly"),
    ...products.map((p) => entry(`/products/${p.handle}`, 0.8, "weekly")),
    ...getCollections().map((c) => entry(`/collections/${c.slug}`, 0.6, "weekly")),
    ...customPageSlugs().map((s) => entry(`/pages/${s}`, 0.5, "monthly")),
    ...getArticles().map((a) => entry(`/blog/${a.slug}`, 0.5, "monthly")),
    ...POLICY_SLUGS.map((s) => entry(`/policies/${s}`, 0.3, "yearly")),
  ];
}
