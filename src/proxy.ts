import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

// Map country codes to locales
const COUNTRY_LOCALE_MAP: Record<string, string> = {
  // Chinese
  CN: "zh", TW: "zh", HK: "zh", MO: "zh",
  // Japanese
  JP: "ja",
  // Korean
  KR: "ko",
  // Spanish
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", VE: "es",
  EC: "es", GT: "es", CU: "es", BO: "es", DO: "es", HN: "es", PY: "es",
  SV: "es", NI: "es", CR: "es", PA: "es", UY: "es",
  // Portuguese
  BR: "pt", PT: "pt", AO: "pt", MZ: "pt",
  // Arabic
  SA: "ar", AE: "ar", EG: "ar", IQ: "ar", MA: "ar", DZ: "ar", SD: "ar",
  YE: "ar", SY: "ar", TN: "ar", JO: "ar", LB: "ar", LY: "ar", KW: "ar",
  OM: "ar", QA: "ar", BH: "ar",
  // Russian (future)
  RU: "ru", UA: "ru", BY: "ru", KZ: "ru",
  // French (future)
  FR: "fr", BE: "fr", CH: "fr", CA: "fr", SN: "fr", CI: "fr", CM: "fr",
  // German (future)
  DE: "de", AT: "de",
  // Italian (future)
  IT: "it",
  // Thai (future)
  TH: "th",
  // Indonesian (future)
  ID: "id",
};

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only auto-detect on root path (no locale prefix yet)
  if (pathname === "/") {
    const country = request.headers.get("x-vercel-ip-country") ?? "";
    const detectedLocale = COUNTRY_LOCALE_MAP[country];
    const url = request.nextUrl.clone();

    type Locale = (typeof routing.locales)[number];
    if (detectedLocale && routing.locales.includes(detectedLocale as Locale)) {
      // Geo preference varies per visitor, so this must stay a TEMPORARY (302)
      // redirect — a 301 would be permanently cached and pin every later
      // visitor (and shared caches) to the first country's locale.
      url.pathname = `/${detectedLocale}`;
      return Response.redirect(url, 302);
    }

    // Default / unknown country -> PERMANENT (301) redirect to the x-default
    // locale (/en). This is the canonical root destination and what US-based
    // Googlebot resolves to, so it is safe and correct to make permanent.
    url.pathname = "/en";
    return Response.redirect(url, 301);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|downloads|llms.*|google.*\\.html|baidu_verify.*\\.html|af2f0c.*\\.txt|[0-9a-f]{32}\\.txt|knowledge).*)"],
};
