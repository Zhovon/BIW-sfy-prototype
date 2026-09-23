/**
 * Real-world business facts for local SEO + AI answer engines (LocalBusiness /
 * clinic structured data, llms.txt, contact surfaces). Single source of truth —
 * update here when a branch, phone, or hours change.
 *
 * Sourced from the public Google/Facebook listings 2026-09-23. Owner to confirm:
 *   - price range band (currently "premium")
 *   - the "Bashundhara Residence" 3rd FB page — same address as Bashundhara or a
 *     separate location? (not listed below until confirmed)
 *   - geo lat/long per branch (omitted; Google geocodes from the address)
 */
import { SITE_NAME, SITE_TAGLINE } from "./site";

export type Branch = {
  id: string;
  name: string;
  streetAddress: string;
  addressLocality: string;
  postalCode: string;
  addressRegion: string;
  telephone: string; // E.164
};

export const BRANCHES: Branch[] = [
  {
    id: "uttara",
    name: `${SITE_NAME} — Uttara`,
    streetAddress: "House 39 (4th Floor), Road 15, Sector 3, Rabindra Sarani, Uttara",
    addressLocality: "Dhaka",
    postalCode: "1230",
    addressRegion: "Dhaka",
    telephone: "+8801747298909",
  },
  {
    id: "bashundhara",
    name: `${SITE_NAME} — Bashundhara`,
    streetAddress:
      "Adept NR Complex (KFC / Pizza Hut Building, Lift 3), Jagannathpur, Bashundhara Link Road",
    addressLocality: "Dhaka",
    postalCode: "1229",
    addressRegion: "Dhaka",
    telephone: "+8801806553255",
  },
];

/** Public contact + social profiles. */
export const PRIMARY_PHONE = "+8801806553255";
export const PRICE_RANGE = "৳৳৳"; // premium medical-aesthetic — owner to confirm band
export const OPENS = "10:00";
export const CLOSES = "20:00";

export const SOCIAL_LINKS = [
  "https://www.facebook.com/beautyintelligentwellnessuttara/",
  "https://www.facebook.com/beautyintelligentwellnessbashundara/",
  "https://www.facebook.com/beautyintelligentwellnessbashundhara/",
  "https://www.instagram.com/beautyintelligent1/",
  "https://www.youtube.com/@Beautyintelligent1",
];

const ALL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

/**
 * schema.org LocalBusiness node for one branch. `HealthAndBeautyBusiness` is the
 * recognized LocalBusiness subtype for a skin/aesthetic clinic + spa; positioning
 * as a clinic is carried in the description.
 */
export function branchLd(branch: Branch, siteUrl: string, logo: string) {
  return {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "@id": `${siteUrl}/#${branch.id}`,
    name: branch.name,
    description: SITE_TAGLINE,
    url: siteUrl,
    image: logo,
    logo,
    telephone: branch.telephone,
    priceRange: PRICE_RANGE,
    currenciesAccepted: "BDT",
    address: {
      "@type": "PostalAddress",
      streetAddress: branch.streetAddress,
      addressLocality: branch.addressLocality,
      postalCode: branch.postalCode,
      addressRegion: branch.addressRegion,
      addressCountry: "BD",
    },
    areaServed: { "@type": "City", name: "Dhaka" },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ALL_DAYS,
        opens: OPENS,
        closes: CLOSES,
      },
    ],
    sameAs: SOCIAL_LINKS,
    parentOrganization: { "@type": "Organization", name: SITE_NAME, url: siteUrl },
  };
}
