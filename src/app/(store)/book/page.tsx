import type { Metadata } from "next";
import BookingWidget from "@/components/BookingWidget";

export const metadata: Metadata = {
  title: "Book an Appointment · BIW",
  description: "Choose a branch, date and time for your BIW services. Services are paid at the salon.",
  robots: { index: false, follow: false },
};

export default function BookPage() {
  return (
    <div className="wrap py-12">
      <h1 className="font-display text-4xl text-center mb-2">Book Your Appointment</h1>
      <p className="text-center text-sm text-muted mb-8">
        Pick a branch, date and time for your services. Payment is at the salon.
      </p>
      <BookingWidget />
    </div>
  );
}
