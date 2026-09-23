/**
 * Real-world business facts for local SEO + AI answer engines (LocalBusiness /
 * clinic structured data, llms.txt, contact surfaces). Single source of truth —
 * update here when a branch, phone, or hours change.
 *
 * Addresses confirmed by owner 2026-09-23 (2 physical locations — the
 * "Bashundhara Residence" FB page is the SAME Bashundhara building: gents 3rd
 * floor, ladies 5th floor). Still open: price band (currently "premium") and
 * geo lat/long per branch (omitted; Google geocodes from the address).
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
    streetAddress: "House 39 (Level 4), Sector 3, Rabindra Sarani, Uttara",
    addressLocality: "Dhaka",
    postalCode: "1230",
    addressRegion: "Dhaka",
    telephone: "+8801747298909",
  },
  {
    id: "bashundhara",
    name: `${SITE_NAME} — Bashundhara`,
    // Same building serves both: gents on the 3rd floor, ladies on the 5th.
    streetAddress:
      "Adept NR Complex, Main Gate (KFC / Pizza Hut Building), Bashundhara — gents 3rd floor, ladies 5th floor",
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
