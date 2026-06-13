import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo";
import { notFound } from "next/navigation";
// AvatarKiosk is a `"use client"` component — Next.js will automatically
// hydrate it on the client and code-split the heavy three.js / three-vrm
// imports inside it (they live behind dynamic `import()` calls in the
// component's effect).
import AvatarKiosk from "@/components/ai-guide/AvatarKiosk";
import Container from "@/components/ui/Container";
import { getAiGuideIntro } from "@/data/ai-guide-i18n";

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
    alternates: buildAlternates(locale, "/ai-guide"),
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

  const intro = getAiGuideIntro(locale);

  return (
    <>
      {/* SSR-visible intro so AI search engines can read and cite what "Joy" is,
          independent of the client-only kiosk below. Localized to all 14 locales. */}
      <section className="bg-bg-sky py-10 md:py-14">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h1 className="text-2xl font-bold text-brown md:text-3xl">{intro.h1}</h1>
            <p className="mt-4 text-base leading-relaxed text-brown/80">{intro.body}</p>
          </div>
        </Container>
      </section>
      <AvatarKiosk locale={aiLocale} />
    </>
  );
}
