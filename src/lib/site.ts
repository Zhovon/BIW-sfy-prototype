/**
 * Canonical site identity for SEO (sitemap, robots, canonical URLs, OG tags).
 * Defaults to the production domain; override per-env with NEXT_PUBLIC_SITE_URL
 * (e.g. a Vercel preview or a tunnel) so canonical/OG links resolve correctly.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://biw.beauty"
).replace(/\/$/, "");

export const SITE_NAME = "Beauty Intelligent Wellness";
export const SITE_TAGLINE = "Bangladesh's first integrated medical-aesthetic wellness experience.";

/** Absolute URL for a site-relative path (leading slash optional). */
export function absoluteUrl(path = "/"): string {
  return SITE_URL + (path.startsWith("/") ? path : `/${path}`);
}

/** Collapse HTML/whitespace to a plain, length-capped meta description. */
export function metaDescription(text: string, max = 160): string {
  const clean = text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).replace(/\s+\S*$/, "").trim() + "…";
}
