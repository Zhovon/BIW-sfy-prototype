/**
 * Brand section header — the editorial pattern from the guidelines:
 * a teal kicker, a Cormorant display heading, and the signature gold hairline.
 * On dark (Teal Ink) sections the kicker turns gold and the subtitle lightens.
 */
export default function SectionHead({
  kicker,
  title,
  subtitle,
  align = "center",
  tone = "light",
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  tone?: "light" | "dark";
}) {
  const centered = align === "center";
  const dark = tone === "dark";
  return (
    <div className={centered ? "text-center" : "text-left"}>
      {kicker && <span className="kicker mb-3">{kicker}</span>}
      <h2 className="font-display text-[30px] leading-[1.1] md:text-[42px]">{title}</h2>
      {subtitle && (
        <p
          className={`mt-3 leading-[1.6] max-w-[54ch] ${centered ? "mx-auto" : ""} ${
            dark ? "text-white/60" : "text-muted"
          }`}
        >
          {subtitle}
        </p>
      )}
      <hr className={`rule-gold mt-6 ${centered ? "mx-auto" : ""}`} />
    </div>
  );
}
