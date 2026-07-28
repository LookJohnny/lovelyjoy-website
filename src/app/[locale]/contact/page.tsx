import { buildAlternates } from '@/lib/seo';
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import InquiryForm from "@/components/contact/InquiryForm";
import ContactInfo from "@/components/contact/ContactInfo";
import { FileSpreadsheet } from "lucide-react";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact.metadata" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale, '/contact'),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const t = await getTranslations("contact");
  const nav = await getTranslations("nav");

  return (
    <>
      {/* Hero */}
      <section className="bg-bg-warm py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold text-brown md:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-4 text-lg text-brown-light md:text-xl">
              {t("subtitle")}
            </p>
          </div>
        </Container>
      </section>

      {/* Breadcrumb */}
      <Container>
        <Breadcrumb
          locale={locale}
          items={[
            { label: nav("home"), href: "/" },
            { label: nav("contact") },
          ]}
        />
      </Container>

      {/* Buyer resource */}
      <section className="bg-bg-sky py-8">
        <Container>
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-5 rounded-2xl border border-sky-brand/15 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-brand/10 text-sky-brand">
                <FileSpreadsheet className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-bold text-brown">
                  {isZh ? "先准备一份完整RFQ" : "Prepare a complete RFQ first"}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-brown/65">
                  {isZh
                    ? "免费下载询价模板，整理尺寸、面料、数量、测试、包装与交期要求。"
                    : "Use the free template to define size, materials, quantity, testing, packaging and timing."}
                </p>
              </div>
            </div>
            <Button href={`/${locale}/rfq-template`} variant="outline" size="sm">
              {isZh ? "查看询价模板" : "Open RFQ template"}
            </Button>
          </div>
        </Container>
      </section>

      {/* Two-column layout */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Inquiry Form */}
            <InquiryForm />

            {/* Right: Contact Info */}
            <ContactInfo />
          </div>
        </Container>
      </section>
    </>
  );
}
