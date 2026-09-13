/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // all product/hero media is now served locally from public/
  // (see scripts/migrate_media_local.py) — no Shopify CDN remote hosts needed.
};

export default nextConfig;
