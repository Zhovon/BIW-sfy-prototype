# BIW Storefront

Custom Next.js storefront replacing the Shopify site (biw.salon). Pixel-matched
to the original layout, skinned in the **Clinical Couture** brand palette.

## Run

```bash
npm install
npm run dev      # http://localhost:3002
npm run build    # production build (163 products prerendered as static HTML)
```

## Stack
- Next.js 15 (App Router) · React 19 · Tailwind 3.4 · TypeScript
- Catalog: `data/products.json` (163 products) read via `src/lib/catalog.ts`
- Cart: client-side context + localStorage (`src/lib/cart.tsx`)
- Palette: CSS variables in `src/app/globals.css` (one place to re-skin)

## Checkout (SSLCommerz)
Sandbox by default (test store `testbox`/`qwerty`). Flow:
`/checkout` → `POST /api/checkout/init` (server recomputes totals from catalog,
creates a pending order, calls the gateway) → redirect to SSLCommerz →
gateway calls back `success` / `fail` / `cancel` / `ipn`.

- Totals are **always** recomputed server-side; the client cart (handle + qty)
  is untrusted input.
- Order status transitions are **idempotent** — a `paid` order never regresses,
  so repeated IPN/success callbacks are safe.
- To test callbacks locally you need a public tunnel (SSLCommerz can't reach
  `localhost`). Set `APP_URL` to the tunnel/deploy URL. See `.env.example`.

## Tests
```bash
node test-cart.mjs   # drives the cart flow in real Chrome (puppeteer-core)
```

## Known follow-ups (not yet done)
- Orders persist to a JSON file (`data/orders.json`) for the scaffold — move to
  Postgres (`storefront_products` DB / FastAPI `POST /orders`) before launch.
- Product images still hotlink the Shopify CDN — migrate to own storage.
- Collections are derived from product `category`, not true Shopify collection
  membership — reconcile from the 24 scraped collection pages.
- Bookings: service products need wiring to the CRM availability/booking API.
- Homepage hero uses an on-brand Ink gradient (original Shopify hero video not
  in the scrape).
