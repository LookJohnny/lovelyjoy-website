import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Applied to every response. A full nonce-based Content-Security-Policy needs
// middleware wiring and is tracked as a follow-up; the headers below are static,
// safe, and carry no false-positive risk. HSTS now includes `includeSubDomains`
// and `preload` so the domain is eligible for the HSTS preload list.
const securityHeaders = [
  {
    // Static baseline CSP. 'unsafe-inline'/'unsafe-eval' are required by
    // Next.js inline runtime scripts until nonce-based CSP is wired through
    // middleware (tracked follow-up). Still blocks foreign script origins.
    // frame-src pre-allows YouTube's privacy-enhanced embed for planned
    // factory-tour videos.
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self' https://vercel.live",
      "frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    // Default ladder tops out at 3840w; nothing on this site renders wider
    // than a 1920 hero, and the 2048/3840 rungs only bloated every srcset
    // string (the /products listing HTML was ~2.9x heavier than other pages).
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // Expected procurement URLs → existing canonical content (301). The locale
    // is constrained to the 13 supported codes so we never hijack other paths.
    const LOCALE = "zh|en|ja|ko|es|pt|ar|ru|fr|de|it|th|id";
    return [
      // statusCode 301 (rather than `permanent: true`, which emits 308) to match
      // the classic permanent-redirect signal. SEO-equivalent; 301 is explicit.
      {
        source: `/:locale(${LOCALE})/factory`,
        destination: "/:locale/factory-capability",
        statusCode: 301,
      },
      {
        source: `/:locale(${LOCALE})/services`,
        destination: "/:locale/oem-odm",
        statusCode: 301,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
