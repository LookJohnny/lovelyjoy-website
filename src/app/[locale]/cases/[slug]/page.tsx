import { buildAlternates, SITE } from "@/lib/seo";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { cases } from "@/data/cases";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import { ArrowRight, Target, Lightbulb, TrendingUp, Layers } from "lucide-react";

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    for (const c of cases) {
      params.push({ locale, slug: c.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const c = cases.find((x) => x.slug === slug);
  if (!c) return {};
  const isZh = locale === "zh";
  const title = isZh ? c.titleZh : c.titleEn;
  const summary = isZh ? c.summaryZh : c.summaryEn;

  return {
    title: isZh
      ? `${title} - 案例 | 爱儿采 LovelyJoy`
      : `${title} - Case Study | LovelyJoy`,
    description: summary,
    alternates: buildAlternates(locale, `/cases/${slug}`),
    openGraph: {
      title,
      description: summary,
      type: "article",
      images: [{ url: `${SITE.url}${c.image}`, width: 1200, height: 630 }],
    },
  };
}

function CaseStudyJsonLd({
  caseStudy,
  locale,
}: {
  caseStudy: (typeof cases)[number];
  locale: string;
}) {
  const isZh = locale === "zh";
  const title = isZh ? caseStudy.titleZh : caseStudy.titleEn;
  const summary = isZh ? caseStudy.summaryZh : caseStudy.summaryEn;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: summary,
    image: `${SITE.url}${caseStudy.image}`,
    author: { "@type": "Organization", name: SITE.name, url: SITE.url },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      logo: { "@type": "ImageObject", url: `${SITE.url}/images/brand/logo-color.jpeg` },
    },
    about: {
      "@type": "Service",
      name: "Plush Toy OEM/ODM Manufacturing",
      provider: { "@type": "Organization", name: SITE.name, url: SITE.url },
      serviceType: caseStudy.tags.join(", "),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const c = cases.find((x) => x.slug === slug);
  if (!c) notFound();

  const isZh = locale === "zh";
  const nav = await getTranslations({ locale, namespace: "nav" });

  const title = isZh ? c.titleZh : c.titleEn;
  const summary = isZh ? c.summaryZh : c.summaryEn;
  const clientType = isZh ? c.clientTypeZh : c.clientTypeEn;
  const challenge = isZh ? c.challengeZh : c.challengeEn;
  const scope = isZh ? c.scopeZh : c.scopeEn;
  const solution = isZh ? c.solutionZh : c.solutionEn;
  const outcome = isZh ? c.outcomeZh : c.outcomeEn;

  const related = cases.filter((x) => x.slug !== c.slug).slice(0, 3);

  const sections = [
    { icon: Target, title: isZh ? "项目范围" : "Project Scope", items: scope },
    { icon: Lightbulb, title: isZh ? "解决方案" : "Our Approach", items: solution },
    { icon: TrendingUp, title: isZh ? "交付成果" : "Outcomes", items: outcome },
  ];

  return (
    <>
      <CaseStudyJsonLd caseStudy={c} locale={locale} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-sky-brand to-sky-brand-dark py-20 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {c.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur"
                >
                  {t}
                </span>
              ))}
            </div>
            <h1 className="mt-4 text-3xl font-bold text-white md:text-4xl">{title}</h1>
            <p className="mt-4 text-lg text-white/85">{summary}</p>
          </div>
        </Container>
      </section>

      <Container>
        <Breadcrumb
          locale={locale}
          items={[
            { label: nav("home"), href: "/" },
            { label: isZh ? "客户案例" : "Cases", href: "/cases" },
            { label: title },
          ]}
        />
      </Container>

      {/* Image */}
      <section className="bg-bg-sky pb-8">
        <Container>
          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl shadow-sm">
            <div className="relative aspect-[16/9]">
              <Image
                src={c.image}
                alt={`${title} — LovelyJoy ${isZh ? "毛绒玩具代工案例" : "plush manufacturing case"}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 896px"
                priority
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Client Type + Challenge */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <div className="mx-auto max-w-3xl space-y-10">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-sky-brand">
                <Layers className="h-4 w-4" />
                {isZh ? "客户类型" : "Client Type"}
              </div>
              <p className="mt-3 text-lg leading-relaxed text-brown-light">{clientType}</p>
              {c.referenceClients && c.referenceClients.length > 0 && (
                <p className="mt-3 text-sm italic text-brown/50">
                  {isZh ? "参考客户：" : "Reference clients: "}
                  {c.referenceClients.join(" · ")}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-sky-brand">
                <Target className="h-4 w-4" />
                {isZh ? "客户挑战" : "The Challenge"}
              </div>
              <p className="mt-3 text-lg leading-relaxed text-brown-light">{challenge}</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Scope / Solution / Outcome */}
      <section className="py-16 md:py-20 bg-bg-warm">
        <Container>
          <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
            {sections.map((s) => (
              <div key={s.title} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-brand/10">
                  <s.icon className="h-5 w-5 text-sky-brand" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-brown">{s.title}</h3>
                <ul className="mt-3 space-y-2">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-brown-light">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sky-brand" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Related cases */}
      {related.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <Container>
            <h2 className="text-2xl font-bold text-brown md:text-3xl">
              {isZh ? "相关案例" : "Related Cases"}
            </h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r) => {
                const rt = isZh ? r.titleZh : r.titleEn;
                const rs = isZh ? r.summaryZh : r.summaryEn;
                return (
                  <Link
                    key={r.slug}
                    href={`/cases/${r.slug}`}
                    className="group overflow-hidden rounded-2xl border border-brown/10 bg-white transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={r.image}
                        alt={`${rt} — LovelyJoy ${isZh ? "案例" : "case"}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-brown group-hover:text-sky-brand transition-colors">
                        {rt}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-brown/60">{rs}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-sky-brand to-sky-brand-dark">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              {isZh ? "类似项目？告诉我们你的需求" : "A Project Like This? Share Your Brief"}
            </h2>
            <p className="mt-4 text-lg text-white/80">
              {isZh
                ? "我们会用最贴近你的案例经验回复方案与报价。"
                : "We'll respond with the closest reference experience, a proposal, and a quote."}
            </p>
            <div className="mt-8">
              <Button href="/contact" variant="secondary" size="lg">
                {isZh ? "联系我们" : "Contact Us"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
