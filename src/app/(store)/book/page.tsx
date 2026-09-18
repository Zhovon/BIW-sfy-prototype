import type { Metadata } from "next";
import BookingFlow from "@/components/BookingFlow";
import PageHeader from "@/components/PageHeader";

export const metadata: Metadata = {
  title: "Book an Appointment · BIW",
  description: "Choose a branch, date and time for your BIW services. Services are paid at the salon.",
  robots: { index: false, follow: false },
};

export default function BookPage() {
  return (
    <div className="wrap py-12">
      <PageHeader
        kicker="Appointments"
        title="Book Your Appointment"
        subtitle="Pick a branch, date and time for your services. Payment is at the salon."
        className="mb-8"
      />
      <BookingFlow />
    </div>
  );
}
