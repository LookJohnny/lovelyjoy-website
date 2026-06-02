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

  const isZh = locale === "zh";

  return (
    <>
      {/* SSR-visible intro so AI search engines can read and cite what "Joy" is,
          independent of the client-only kiosk below. */}
      <section className="bg-bg-sky py-10 md:py-14">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h1 className="text-2xl font-bold text-brown md:text-3xl">
              {isZh ? "Joy — 乐芭迪毛绒玩具 AI 采购助手" : "Joy — LovelyJoy's AI Sourcing Guide for Plush Toys"}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-brown/80">
              {isZh
                ? "Joy 是爱儿采 LovelyJoy 面向国际买家的 AI 采购助手，帮助批发商、进口商、礼品品牌与零售商在联系工厂前快速了解毛绒玩具定制生产、OEM/ODM 选择、面料与材料、打样周期、起订量（MOQ）、认证合规、包装方案与 RFQ 询价准备。你可以向 Joy 询问诸如「定制公仔的最小起订量是多少」「打样要多久」「能否按图纸生产」「支持哪些出口认证」等问题。Joy 覆盖毛绒玩具、毛绒动物、吉祥物公仔、促销毛绒、婴童毛绒、节庆毛绒与 IP 授权毛绒等品类，并可引导你完成从设计简报到样品确认、大货生产与出口发货的完整流程。如需正式报价，请通过联系页面提交需求。"
                : "Joy is LovelyJoy's AI sourcing guide for international plush toy buyers. It helps wholesalers, importers, gift brands, and retailers understand custom plush toy production, OEM vs ODM options, fabrics and materials, sampling timelines, minimum order quantities (MOQ), certification and compliance, packaging choices, and RFQ preparation before contacting the factory. You can ask Joy questions such as “what is the MOQ for a custom plush”, “how long does sampling take”, “can you produce from my drawings”, or “which export certifications do you hold”. Joy covers plush toys, stuffed animals, mascot dolls, promotional plush, baby plush, festival plush, and licensed IP plush, and can walk you from a design brief through sample approval, mass production, and export shipping. For a formal quote, submit your requirements via the contact page."}
            </p>
          </div>
        </Container>
      </section>
      <AvatarKiosk locale={aiLocale} />
    </>
  );
}
