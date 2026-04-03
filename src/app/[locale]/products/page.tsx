import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductsPageContent from "@/components/products/ProductsPageContent";

// ─── Static Params ──────────────────────────────────────────

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// ─── Metadata ───────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "products" });

  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: `/${locale}/products`,
      languages: {
        zh: '/zh/products',
        en: '/en/products',
        'x-default': '/en/products',
      },
    },
  };
}

// ─── Page ───────────────────────────────────────────────────

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "products" });
  const nav = await getTranslations({ locale, namespace: "nav" });

  return (
    <>
      {/* Hero Banner */}
      <section className="relative h-64 md:h-80">
        <Image
          src="/images/products/collection.jpeg"
          alt={t("title")}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-brown/60 to-brown/40" />

        {/* Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Container className="text-center">
            <h1 className="text-4xl font-bold text-white md:text-5xl">
              {t("title")}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
              {t("subtitle")}
            </p>
          </Container>
        </div>
      </section>

      {/* Breadcrumb */}
      <Container>
        <Breadcrumb
          locale={locale}
          items={[
            { label: nav("home"), href: "/" },
            { label: nav("products") },
          ]}
        />
      </Container>

      {/* Section heading (decorative) + filter + grid */}
      <ProductsPageContent />
    </>
  );
}
