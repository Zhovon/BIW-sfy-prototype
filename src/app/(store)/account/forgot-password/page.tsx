import ForgotForm from "../_components/ForgotForm";

export const metadata = { title: "Reset password · BIW" };

export default function ForgotPage() {
  return (
    <div className="wrap py-16 max-w-md mx-auto">
      <h1 className="font-display text-4xl text-center mb-3">Reset password</h1>
      <p className="text-center text-sm text-muted">We&apos;ll email you a link to set a new password.</p>
      <ForgotForm />
    </div>
  );
}
