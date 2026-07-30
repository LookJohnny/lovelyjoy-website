import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { buildAlternates, SITE, ORG_ID } from "@/lib/seo";
import { getOemCopy } from "@/data/oem-i18n";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import SourcingEssentials from "@/components/home/SourcingEssentials";
import CertificationVerification from "@/components/trust/CertificationVerification";
import { Link } from "@/i18n/navigation";
import {
  Factory,
  PenTool,
  Boxes,
  ShieldCheck,
  Package,
  Truck,
  ArrowRight,
} from "lucide-react";

const PATH = "/oem-plush-manufacturer";

// Icons and link targets are locale-neutral; labels/desc come from the dictionary.
const CAP_ICONS = [PenTool, Boxes, Package, ShieldCheck, Factory, Truck];
const LINK_HREFS = [
  "/factory-capability",
  "/oem-odm",
  "/products",
  "/cases",
  "/faq",
  "/contact",
];

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = getOemCopy(locale);
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    // Self-referencing canonical — single ranking target for the
    // "custom plush toy manufacturer China" cluster.
    alternates: buildAlternates(locale, PATH),
  };
}

function JsonLd({ locale }: { locale: string }) {
  const copy = getOemCopy(locale);
  const url = `${SITE.url}/${locale}${PATH}`;
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: copy.webpageName,
        isPartOf: { "@id": `${SITE.url}/#website` },
        about: { "@id": ORG_ID },
        inLanguage: locale === "zh" ? "zh-Hans" : locale,
      },
      // BreadcrumbList intentionally NOT declared here — the shared
      // <Breadcrumb> component already emits it, and having both produced a
      // duplicate BreadcrumbList in the DOM (flagged in the 2026-07 audit).
      {
        "@type": "FAQPage",
        mainEntity: copy.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}

export default async function OemPlushManufacturerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const nav = await getTranslations({ locale, namespace: "nav" });
  const copy = getOemCopy(locale);

  return (
    <>
      <JsonLd locale={locale} />

      {/* Hero with above-the-fold RFQ CTA */}
      <section className="bg-gradient-to-br from-sky-brand to-sky-brand-dark py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold text-white md:text-5xl">{copy.h1}</h1>
            <p className="mt-4 text-base text-white/85 md:text-lg">{copy.heroSub}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/contact" variant="secondary" size="lg">{copy.ctaRfq}</Button>
              <Button href="/products" variant="outline" size="lg">{copy.ctaProducts}</Button>
            </div>
          </div>
        </Container>
      </section>

      <Container>
        <Breadcrumb
          locale={locale}
          currentPath={PATH}
          items={[
            { label: nav("home"), href: "/" },
            { label: copy.breadcrumb },
          ]}
        />
      </Container>

      {/* 130-170 word SSR intro paragraph (citable) */}
      <section className="py-12 md:py-16 bg-white">
        <Container>
          <div className="mx-auto max-w-3xl text-base leading-relaxed text-brown/80">
            <p>
              {copy.intro}{" "}
              <Link href="/contact" className="font-semibold text-sky-brand underline">
                {copy.introCta}
              </Link>
            </p>
          </div>
        </Container>
      </section>

      {/* 1. Sourcing Essentials table (reuses the homepage band, localized) */}
      <SourcingEssentials locale={locale} />

      {/* 2. OEM/ODM capabilities */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading title={copy.capTitle} subtitle={copy.capSub} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {copy.capabilities.map((c, i) => {
              const Icon = CAP_ICONS[i % CAP_ICONS.length];
              return (
                <div key={c.title} className="rounded-2xl border border-brown/10 bg-white p-6 transition-all duration-300 hover:shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-brand/10">
                    <Icon className="h-6 w-6 text-sky-brand" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-brown">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brown/70">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 3. Product categories */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading title={copy.productCatTitle} />
          <div className="mx-auto max-w-3xl flex flex-wrap justify-center gap-3">
            {copy.productTypes.map((p) => (
              <span key={p} className="rounded-full bg-white px-5 py-2 text-sm font-medium text-brown shadow-sm">{p}</span>
            ))}
          </div>
        </Container>
      </section>

      {/* 4. Customization process */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading title={copy.processTitle} subtitle={copy.processSub} />
          <div className="mx-auto max-w-4xl flex flex-wrap items-center justify-center gap-2 text-sm">
            {copy.processSteps.map((s, i) => (
              <span key={s} className="flex items-center gap-2">
                <span className="rounded-lg bg-bg-sky px-4 py-2 font-medium text-brown">{i + 1}. {s}</span>
                {i < copy.processSteps.length - 1 && <ArrowRight className="h-4 w-4 text-sky-brand/60" />}
              </span>
            ))}
          </div>
        </Container>
      </section>

      {/* 5 + 6. Factory capability + Quality/compliance (certification module) */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading title={copy.qualityTitle} subtitle={copy.qualitySub} />
          <CertificationVerification locale={locale} />
        </Container>
      </section>

      {/* 6b. Comparison table — real on-page <table> (question-shaped H2).
          Mirrors /public/llms.txt, which crawlers of the live site never saw. */}
      {copy.comparison && (
        <section className="py-16 md:py-24 bg-white">
          <Container>
            <SectionHeading title={copy.comparison.title} />
            <div className="mx-auto max-w-4xl overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm md:text-base">
                <thead>
                  <tr className="border-b-2 border-brown/20">
                    <th scope="col" className="py-3 pr-4 font-semibold text-brown">{copy.comparison.colFeature}</th>
                    <th scope="col" className="py-3 pr-4 font-semibold text-sky-brand">{copy.comparison.colUs}</th>
                    <th scope="col" className="py-3 font-semibold text-brown/60">{copy.comparison.colTypical}</th>
                  </tr>
                </thead>
                <tbody>
                  {copy.comparison.rows.map((row) => (
                    <tr key={row.feature} className="border-b border-brown/10">
                      <th scope="row" className="py-3 pr-4 font-medium text-brown">{row.feature}</th>
                      <td className="py-3 pr-4 text-brown">{row.us}</td>
                      <td className="py-3 text-brown/60">{row.typical}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Container>
        </section>
      )}

      {/* 7. Case studies preview */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <SectionHeading title={copy.casesTitle} />
            <p className="text-brown/70">{copy.casesText}</p>
            <div className="mt-6">
              <Button href="/cases" variant="primary" size="lg">{copy.casesCta}</Button>
            </div>
          </div>
        </Container>
      </section>

      {/* 8. FAQ (visible, mirrors FAQPage schema) */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading title={copy.faqTitle} />
          <div className="mx-auto max-w-3xl space-y-4">
            {copy.faqs.map((f) => (
              <details key={f.q} className="rounded-xl bg-white p-5 shadow-sm">
                <summary className="cursor-pointer font-semibold text-brown">{f.q}</summary>
                <p className="mt-2 text-sm leading-relaxed text-brown/70">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* Internal links + 9. RFQ CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-sky-brand to-sky-brand-dark">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">{copy.finalTitle}</h2>
            <p className="mt-4 text-lg text-white/80">{copy.finalText}</p>
            <div className="mt-8">
              <Button href="/contact" variant="secondary" size="lg">{copy.finalBtn}</Button>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/80">
              {LINK_HREFS.map((href, i) => (
                <Link key={href} href={href} className="underline hover:text-white">
                  {copy.links[i]}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
