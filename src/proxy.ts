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

    if (detectedLocale && routing.locales.includes(detectedLocale as any)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${detectedLocale}`;
      return Response.redirect(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|llms.*|google.*\\.html|af2f0c.*\\.txt|knowledge).*)"],
};
