import { SITE_NAME, SITE_TAGLINE, SITE_URL, absoluteUrl } from "@/lib/site";
import { BRANCHES, OPENS, CLOSES } from "@/lib/business";
import { getCollections, products } from "@/lib/catalog";

/**
 * /llms.txt — a concise, machine-readable overview for AI answer engines
 * (the emerging llms.txt convention). Generated from the live catalog + branch
 * data so it stays in sync. Served as plain text at the site root.
 */
export const dynamic = "force-static";

export function GET() {
  const collections = getCollections();
  const to12h = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hr = h % 12 || 12;
    return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
  };
  const hours = `${to12h(OPENS)}–${to12h(CLOSES)}, daily`;

  const lines = [
    `# ${SITE_NAME} (BIW)`,
    "",
    `> ${SITE_TAGLINE}`,
    "",
    `BIW is an aesthetic & skin clinic and wellness studio in Dhaka, Bangladesh, offering medical-aesthetic treatments (HIFU, PRP, dermapen, laser, glutathione), facials & hydrafacials, brightening, hair care, massage, waxing, manicure/pedicure, and skincare products.`,
    "",
    "## Locations",
    ...BRANCHES.map(
      (b) =>
        `- ${b.name}: ${b.streetAddress}, ${b.addressLocality} ${b.postalCode}. Phone ${b.telephone}. Open ${hours}.`,
    ),
    "",
    "## Key pages",
    `- [Home](${SITE_URL}): overview of the clinic and featured treatments`,
    `- [All treatments & products](${absoluteUrl("/collections/all")}): full catalogue (${products.length} items)`,
    `- [Journal](${absoluteUrl("/blog")}): skincare and wellness articles`,
    `- [Search](${absoluteUrl("/search")}): search treatments and products`,
    "",
    "## Categories",
    ...collections.map(
      (c) => `- [${c.title}](${absoluteUrl(`/collections/${c.slug}`)}): ${c.count} items`,
    ),
    "",
    "## Notes",
    "- Prices are in Bangladeshi Taka (BDT).",
    "- Bookings are taken online and pay-at-clinic is supported.",
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
