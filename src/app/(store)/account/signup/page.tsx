import SignupForm from "../_components/SignupForm";

export const metadata = {
  title: "Create account · BIW",
  description: "Create your BIW account to track orders, bookings, and loyalty.",
};

export default function SignupPage() {
  return (
    <div className="wrap py-16 max-w-md mx-auto">
      <h1 className="font-display text-4xl text-center mb-3">Create account</h1>
      <p className="text-center text-sm text-muted">Track your orders, appointments, and loyalty in one place.</p>
      <SignupForm />
    </div>
  );
}
