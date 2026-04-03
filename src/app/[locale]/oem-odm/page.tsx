import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Container from "@/components/ui/Container";
import OemOdmTimeline from "@/components/oem-odm/OemOdmTimeline";
import OemOdmCTA from "@/components/oem-odm/OemOdmCTA";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "oemOdm.metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function OemOdmPage() {
  const t = await getTranslations("oemOdm");

  return (
    <>
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-sky-brand to-sky-brand-dark py-20 md:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold text-white md:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-4 text-lg text-white/85 md:text-xl">
              {t("subtitle")}
            </p>
          </div>
        </Container>
      </section>

      {/* Process Timeline */}
      <section className="py-16 md:py-24">
        <Container>
          <OemOdmTimeline />
        </Container>
      </section>

      {/* Bottom CTA */}
      <OemOdmCTA />
    </>
  );
}
