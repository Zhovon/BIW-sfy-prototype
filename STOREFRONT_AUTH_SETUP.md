# Storefront customer accounts — Better Auth (setup/deploy)

Self-hosted customer login for biw.beauty using **Better Auth** (fully open-source, no third-party vendor). Users/sessions live in a new **`biw_store`** Postgres DB on the VPS.

## What's built (Phase 1 — done, verified locally)
- `src/lib/auth.ts` — Better Auth server instance (email+password, 30-day sessions, custom `phone`/`address` profile fields).
- `src/app/api/auth/[...all]/route.ts` — auth API handler (`/api/auth/*`).
- `src/lib/auth-client.ts` — browser client.
- `src/app/(store)/account/login` + `/signup` — real working sign-in / sign-up (replaced the dead mockup).
- `src/app/(store)/account` — session-gated dashboard: **Order history** (by email) + **Profile & address**; Appointments + Loyalty are "coming soon" (Phase 2).
- Deps added: `better-auth`, `pg`, `@types/pg`.

Also built (same session): **password reset** (`/account/forgot-password` + `/account/reset-password`, emails via Resend using the storefront's existing `RESEND_API_KEY`/`CONTACT_FROM`), a **session-aware header link** ("Account" when signed in, else "Log in"), and **checkout ties orders to the account email** when the shopper is signed in (so order history fills reliably).

Verified end-to-end on a local throwaway DB + a full `next build`: sign-up/sign-in (200), wrong password (401), **password reset token flow** (reset → new password works, old rejected), `/account` redirects when logged out and renders all sections when logged in, custom `phone` persists, appointments degrade gracefully to "No appointments" until the backend endpoint is deployed. `npx tsc --noEmit` and `npx next build` both clean.

> For password-reset emails in prod, the storefront env needs `RESEND_API_KEY` + `CONTACT_FROM` (already set for checkout emails). Without them, reset silently no-ops (dev).

## Database (already created on the VPS)
- DB `biw_store` on the postgres:16 container, with the 4 Better Auth tables already migrated.
- Role **`biw_store_app`** (LOGIN) — password: `03958d2186d93cde20aec9f8996855be91131cea9743a5d5` (internal-only DB; rotate anytime with `ALTER ROLE biw_store_app PASSWORD '...'`).

## To go live — set these in the storefront's Coolify env, then redeploy
1. **`DATABASE_URL`** = `postgresql://biw_store_app:03958d2186d93cde20aec9f8996855be91131cea9743a5d5@<POSTGRES_INTERNAL_HOST>:5432/biw_store`
   - `<POSTGRES_INTERNAL_HOST>` = the internal hostname of the VPS Postgres on the Coolify network (the same host the CRM/n8n use — in Coolify, connect the storefront app to that Postgres resource / shared network).
2. **`BETTER_AUTH_SECRET`** = generate your own and paste it (don't reuse a chat-shared value):
   ```
   openssl rand -base64 32
   ```
   (Prod has 0 users yet, so the secret can be anything 32+ chars — nothing depends on it.)
3. **`BETTER_AUTH_URL`** = `https://biw.beauty`
4. Ensure the storefront container shares a Docker network with the Postgres container (Coolify: link them / same project network) so `DATABASE_URL` resolves.
5. **Redeploy** the storefront (picks up new code + deps + env). The DB tables already exist, so no migration step is needed at boot. If you ever change auth config/fields, run `npx @better-auth/cli migrate --config src/lib/auth.ts`.

## Local dev
Run a local Postgres and point `.env.local`:
```
docker run -d --name biw_store_dev -e POSTGRES_PASSWORD=pw -e POSTGRES_DB=biw_store -p 55432:5432 postgres:16
# DATABASE_URL=postgres://postgres:pw@localhost:55432/biw_store  (in .env.local)
npx @better-auth/cli migrate --config src/lib/auth.ts
npm run dev   # http://localhost:3002
```

## Phase 2 — Appointments (BUILT 2026-10-20, needs deploy)
The account page now shows the customer's real salon appointments.

- **Backend (CRM / BIW-MAIN):** new public-but-key-gated endpoint `GET /api/v1/portal/appointments?phone=&email=` (`app/api/v1/customer_portal.py`, mounted in `router.py`; config key `portal_api_key`). Requires header `X-Portal-Key`. Matches the customer by normalized phone (01XXXXXXXXX) or email, returns their appointments with service names + branch + time + status. Verified: app imports (py3.12), route mounted, gate returns 401 without key / 200 `[]` with key. **This is a backend change → feature branch + PR (owner merges); backend auto-deploys on the VPS.**
- **Storefront:** `getCustomerAppointments()` in `src/lib/crm.ts` (server-to-server, sends `X-Portal-Key`, graceful `[]` on any error); account page renders them (Dhaka time formatted in UTC per convention).
- **Env — set `PORTAL_API_KEY` to the SAME value in BOTH:**
  - CRM backend env (Coolify / the backend's `.env`): `PORTAL_API_KEY=<value>`
  - Storefront env: `PORTAL_API_KEY=<same value>`
  - A generated value is in `/tmp/portal_api_key.txt` (or generate your own `openssl rand -hex 32` and use it in both).
- Matching works best when the customer's **phone** is on their account (set at signup or in Profile) and matches how the CRM stores it.

## Phase 2 — Loyalty (still blocked)
Not built: the loyalty stamp module isn't on production — it lives on the other `BIW main` stack. Showing loyalty here first requires promoting that module (schema + endpoints) to prod. Separate initiative. The account page shows "coming soon" for loyalty.

## Later / optional
Email verification, magic-link, or password reset (Resend is already used by the CRM backend); linking a storefront account to the CRM customer record; "remember address at checkout."
