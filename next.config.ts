import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Applied to every response. A full nonce-based Content-Security-Policy needs
// middleware wiring and is tracked as a follow-up; the headers below are static,
// safe, and carry no false-positive risk. HSTS now includes `includeSubDomains`
// and `preload` so the domain is eligible for the HSTS preload list.
const securityHeaders = [
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
