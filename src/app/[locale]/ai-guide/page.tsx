import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
// AvatarKiosk is a `"use client"` component — Next.js will automatically
// hydrate it on the client and code-split the heavy three.js / three-vrm
// imports inside it (they live behind dynamic `import()` calls in the
// component's effect).
import AvatarKiosk from "@/components/ai-guide/AvatarKiosk";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aiGuide.meta" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/ai-guide`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}/ai-guide`]),
      ),
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
    },
  };
}

export default async function AIGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  // Only the 5 fully translated locales make sense for the live AI; the others
  // fall through to the English translation block already present in messages.
  const supportedAILocales = ["zh", "en", "ja", "ko", "es"] as const;
  type SupportedAI = (typeof supportedAILocales)[number];
  const aiLocale: SupportedAI = supportedAILocales.includes(locale as SupportedAI)
    ? (locale as SupportedAI)
    : "en";

  return <AvatarKiosk locale={aiLocale} />;
}
