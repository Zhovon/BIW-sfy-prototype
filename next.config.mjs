/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // product imagery still served from the Shopify CDN until media is migrated
    remotePatterns: [
      { protocol: "https", hostname: "biw.salon" },
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
};

export default nextConfig;
