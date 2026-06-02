import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["zh", "en", "ja", "ko", "es", "pt", "ar", "ru", "fr", "de", "it", "th", "id"],
  defaultLocale: "zh",
  localePrefix: "always",

  // The locale is fully encoded in the URL path (localePrefix: "always"), so the
  // NEXT_LOCALE cookie is redundant. Disabling it stops every locale page from
  // emitting a `Set-Cookie` header — the header that forced
  // `Cache-Control: private` and produced `x-vercel-cache: MISS` on every
  // request, defeating Vercel's edge cache.
  localeCookie: false,

  // hreflang alternates are emitted authoritatively from the HTML <head>
  // (generateMetadata -> buildAlternates) and the XML sitemap, both of which
  // point x-default -> /en. next-intl's middleware also added a `Link` header
  // whose x-default pointed at `/` (which redirects), creating a conflicting
  // third signal. Disable the header version so there is one source of truth.
  alternateLinks: false,
});
