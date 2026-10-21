/**
 * Better Auth — self-hosted customer accounts for the storefront.
 *
 * Users/sessions live in the storefront's own Postgres (DATABASE_URL → the
 * `biw_store` database on the VPS Postgres). Email + password for now;
 * magic-link / email verification can be layered on later once email is wired.
 *
 * Extra profile fields (phone, address) live on the user row so the account
 * page can show "Profile & saved address" and speed up checkout.
 */
import { betterAuth } from "better-auth";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

/** Best-effort transactional email via Resend (same provider the checkout uses). */
async function sendStoreEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM || "BIW <noreply@biw.beauty>";
  if (!apiKey) return; // email not configured — silently skip (dev)
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html }),
  }).catch(() => null);
}

export const auth = betterAuth({
  database: new Pool(connectionString ? { connectionString } : {}),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    // Don't block sign-in on email verification (kept lightweight for a storefront).
    requireEmailVerification: false,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      await sendStoreEmail(
        user.email,
        "Reset your BIW password",
        `<div style="font-family:system-ui,sans-serif;max-width:480px">
           <h2 style="font-weight:600">Reset your password</h2>
           <p>We received a request to reset your BIW account password. Click below to choose a new one:</p>
           <p><a href="${url}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;text-decoration:none">Reset password</a></p>
           <p style="color:#666;font-size:13px">If you didn't request this, you can safely ignore this email. This link expires in 1 hour.</p>
         </div>`,
      );
    },
  },
  user: {
    additionalFields: {
      phone: { type: "string", required: false, input: true },
      address: { type: "string", required: false, input: true },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh once a day
  },
  trustedOrigins: [
    "https://biw.beauty",
    "https://www.biw.beauty",
    "http://localhost:3000",
    "http://localhost:3002",
  ],
});
