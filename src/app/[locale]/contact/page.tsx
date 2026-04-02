import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Container from "@/components/ui/Container";
import InquiryForm from "@/components/contact/InquiryForm";
import ContactInfo from "@/components/contact/ContactInfo";

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
  };
}

export default async function ContactPage() {
  const t = await getTranslations("contact");

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
