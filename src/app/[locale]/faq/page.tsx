import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import FAQ from "@/components/oem-odm/FAQ";
import { CONTACT_INFO } from "@/lib/constants";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq.metadata" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/faq`,
      languages: {
        zh: '/zh/faq',
        en: '/en/faq',
        'x-default': '/en/faq',
      },
    },
  };
}

function FaqJsonLd() {
  const faqs = [
    {
      q: "What is the minimum order quantity (MOQ)?",
      a: "Our standard MOQ is 500 pieces per style. For new customers, we offer flexible small-batch trial orders starting from 200 pieces.",
    },
    {
      q: "How long does sample development take?",
      a: "Sample development typically takes 7-15 working days depending on complexity.",
    },
    {
      q: "What is the production lead time?",
      a: "Standard production takes 30-45 days after sample approval.",
    },
    {
      q: "What certifications do your products have?",
      a: "Our products meet ASTM F963, EN 71, CE, and GB 6675 safety standards. Our factory holds BSCI and ISO 9001 certifications.",
    },
    {
      q: "Do you offer design services (ODM)?",
      a: "Yes! Our in-house design team can create original designs from scratch based on your brief.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept T/T, L/C, and PayPal. Standard terms are 30% deposit with 70% balance before shipment.",
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("faq");
  const nav = await getTranslations("nav");

  return (
    <>
      <FaqJsonLd />

      {/* Hero */}
      <section className="bg-gradient-to-br from-bg-warm to-white py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold text-brown md:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-4 text-lg text-brown/70">
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
            { label: t("title") },
          ]}
        />
      </Container>

      {/* FAQ */}
      <FAQ />

      {/* Contact CTA */}
      <section className="bg-white py-12">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-brown/60">{t("contactCta")}</p>
            <a
              href={`mailto:${CONTACT_INFO.email}`}
              className="mt-2 inline-block font-semibold text-sky-brand hover:underline"
            >
              {CONTACT_INFO.email}
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
