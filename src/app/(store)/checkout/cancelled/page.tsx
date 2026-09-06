import Link from "next/link";

const MESSAGES: Record<string, string> = {
  cancelled: "You cancelled the payment. Your cart is still saved.",
  failed: "The payment failed or was declined. Please try again.",
  unverified: "We couldn't verify the payment with the gateway. You have not been charged.",
  unknown: "We couldn't find that order. Please try again from your cart.",
};

export default async function CheckoutCancelled({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const message = MESSAGES[reason || ""] || "Your payment was not completed.";

  return (
    <div className="wrap py-24 text-center max-w-[52ch] mx-auto">
      <div className="w-16 h-16 rounded-full bg-[#c26454]/15 text-[#a24a3c] flex items-center justify-center mx-auto mb-6 text-3xl">!</div>
      <h1 className="font-display text-4xl mb-4">Payment not completed</h1>
      <p className="text-muted leading-relaxed mb-8">{message}</p>
      <div className="flex items-center justify-center gap-3">
        <Link href="/cart" className="btn btn--gold">Return to cart</Link>
        <Link href="/collections/all" className="btn btn--ghost">Keep browsing</Link>
      </div>
    </div>
  );
}
