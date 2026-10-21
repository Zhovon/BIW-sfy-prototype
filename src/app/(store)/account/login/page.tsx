import { Suspense } from "react";
import LoginForm from "../_components/LoginForm";

export const metadata = {
  title: "Log in · BIW",
  description: "Log in to your BIW account.",
};

export default function LoginPage() {
  return (
    <div className="wrap py-16 max-w-md mx-auto">
      <h1 className="font-display text-4xl text-center mb-3">Log in</h1>
      <p className="text-center text-sm text-muted">Welcome back to BIW.</p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
