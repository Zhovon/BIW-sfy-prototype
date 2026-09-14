/**
 * Page-level header — the brand editorial pattern for top-of-page titles:
 * an optional teal kicker, a Cormorant display <h1>, an optional subtitle,
 * and the signature gold hairline. Mirrors SectionHead (which renders an
 * <h2> for in-page sections) so every page opens with the same treatment.
 */
export default function PageHeader({
  kicker,
  title,
  subtitle,
  align = "center",
  className = "",
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div className={`${centered ? "text-center" : "text-left"} ${className}`}>
      {kicker && <span className="kicker mb-3">{kicker}</span>}
      <h1 className="font-display text-[34px] leading-[1.1] md:text-[40px]">{title}</h1>
      {subtitle && (
        <p className={`mt-3 leading-[1.6] text-muted max-w-[54ch] ${centered ? "mx-auto" : ""}`}>{subtitle}</p>
      )}
      <hr className={`rule-gold mt-6 ${centered ? "mx-auto" : ""}`} />
    </div>
  );
}
