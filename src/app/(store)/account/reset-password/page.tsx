import { Suspense } from "react";
import ResetForm from "../_components/ResetForm";

export const metadata = { title: "Set new password · BIW" };

export default function ResetPage() {
  return (
    <div className="wrap py-16 max-w-md mx-auto">
      <h1 className="font-display text-4xl text-center mb-3">Set a new password</h1>
      <Suspense>
        <ResetForm />
      </Suspense>
    </div>
  );
}
