import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["zh", "en", "ja", "ko", "es", "pt", "ar", "ru", "fr", "de", "it", "th", "id"],
  defaultLocale: "zh",
  localePrefix: "always",
});
