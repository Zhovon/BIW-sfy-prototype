export const metadata = {
  title: "Log in · BIW",
  description: "Log in to your BIW account.",
};

export default function LoginPage() {
  return (
    <div className="wrap py-16 max-w-md mx-auto">
      <h1 className="font-display text-4xl text-center mb-3">Log in</h1>
      <form className="space-y-4 mt-8">
        <div>
          <label htmlFor="email" className="block text-[13px] tracking-[0.08em] mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className="w-full border border-line bg-paper px-4 py-3 text-sm focus:outline-none focus:border-ink"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-[13px] tracking-[0.08em] mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full border border-line bg-paper px-4 py-3 text-sm focus:outline-none focus:border-ink"
          />
        </div>
        <button type="submit" className="btn w-full !bg-ink !border-ink">
          Sign in
        </button>
        <p className="text-center text-[13px] text-muted">
          <a href="#" className="underline underline-offset-2 hover:text-ink">
            Forgot your password?
          </a>
        </p>
      </form>
    </div>
  );
}
