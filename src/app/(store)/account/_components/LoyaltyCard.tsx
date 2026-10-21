import type { PortalLoyaltyCard } from "@/lib/crm";

/** A single stamp card: progress dots, reward, and redemption count. */
export default function LoyaltyCard({ card }: { card: PortalLoyaltyCard }) {
  const complete = card.stamps_count >= card.stamps_required;
  const remaining = Math.max(card.stamps_required - card.stamps_count, 0);
  const dots = Array.from({ length: card.stamps_required }, (_, i) => i < card.stamps_count);

  return (
    <div className="border border-line p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="font-medium">{card.program_name}</div>
        <div className="text-[13px] text-muted">
          {card.stamps_count}/{card.stamps_required}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {dots.map((filled, i) => (
          <span
            key={i}
            className={`h-7 w-7 rounded-full border flex items-center justify-center text-[11px] ${
              filled ? "bg-ink text-paper border-ink" : "border-line text-muted"
            }`}
          >
            {filled ? "✓" : i + 1}
          </span>
        ))}
      </div>

      {complete ? (
        <p className="text-sm font-medium">
          Reward ready: {card.reward_text}. Show this at the clinic to redeem.
        </p>
      ) : (
        <p className="text-sm text-muted">
          {remaining} more visit{remaining === 1 ? "" : "s"} to earn {card.reward_text}.
        </p>
      )}

      {card.redeemed_count > 0 && (
        <p className="text-[13px] text-muted mt-2">
          {card.redeemed_count} reward{card.redeemed_count === 1 ? "" : "s"} earned so far.
        </p>
      )}
    </div>
  );
}
