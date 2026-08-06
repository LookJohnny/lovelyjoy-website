import { buildAlternates } from "@/lib/seo";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { cases } from "@/data/cases";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import SectionHeading from "@/components/ui/SectionHeading";
import { ArrowRight } from "lucide-react";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  return {
    title: isZh
      ? "客户案例 - 全球品牌与零售的毛绒玩具代工合作 | 爱儿采 LovelyJoy"
      : "Customer Cases — Plush Manufacturing for Global Brands & Retail | LovelyJoy",
    description: isZh
      ? "爱儿采 LovelyJoy 的客户案例集——IP 授权生产、全球连锁零售季节项目、体验式零售、初创品牌首线、企业促销礼品。覆盖从初创品牌首线到万级大货的多档位合作。"
      : "LovelyJoy customer cases — licensed IP manufacturing, global retail seasonal programs, experience retail, first-line startup brands, and promotional gift projects. From first startup lines to 5-figure bulk orders.",
    alternates: buildAlternates(locale, "/cases"),
  };
}

export default async function CasesListPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const nav = await getTranslations({ locale, namespace: "nav" });

  return (
    <>
      <section className="bg-gradient-to-br from-sky-brand to-sky-brand-dark py-20 md:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold text-white md:text-5xl">
              {isZh ? "客户案例" : "Customer Cases"}
            </h1>
            <p className="mt-4 text-lg text-white/85 md:text-xl">
              {isZh
                ? "从 IP 授权到全球零售、从初创品牌到企业促销——我们承接过的典型项目类型"
                : "From licensed IP to global retail, startup brands to promotional campaigns — the project types we've built"}
            </p>
          </div>
        </Container>
      </section>

      <Container>
        <Breadcrumb
          locale={locale}
          items={[
            { label: nav("home"), href: "/" },
            { label: isZh ? "客户案例" : "Cases" },
          ]}
        />
      </Container>

      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "按客户类型分组的项目案例" : "Project Cases Grouped by Client Type"}
            subtitle={
              isZh
                ? "每个案例聚焦一种典型合作模式——你可以对照找到最贴近自身的参考"
                : "Each case maps to a distinct partnership pattern — find the reference closest to yours"
            }
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c) => {
              const title = isZh ? c.titleZh : c.titleEn;
              const summary = isZh ? c.summaryZh : c.summaryEn;
              return (
                <Link
                  key={c.slug}
                  href={`/cases/${c.slug}`}
                  className="group overflow-hidden rounded-2xl border border-brown/10 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={c.image}
                      alt={`${title} — LovelyJoy ${isZh ? "毛绒玩具代工案例" : "plush manufacturing case study"}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex flex-wrap gap-2">
                      {c.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-sky-brand/10 px-2.5 py-0.5 text-xs font-medium text-sky-brand"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <h3 className="mt-3 font-bold text-brown group-hover:text-sky-brand transition-colors duration-200">
                      {title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-brown/60">{summary}</p>

                    {c.referenceClients && c.referenceClients.length > 0 && (
                      <p className="mt-3 text-xs text-brown/50">
                        <span className="font-semibold text-brown/70">
                          {isZh ? "参考客户：" : "Clients: "}
                        </span>
                        {c.referenceClients.join(" · ")}
                      </p>
                    )}

                    {c.metrics[0] && (
                      <p className="mt-1 text-xs text-brown/50">
                        <span className="font-semibold text-sky-brand">
                          {isZh ? c.metrics[0].valueZh : c.metrics[0].valueEn}
                        </span>{" "}
                        {isZh ? c.metrics[0].labelZh : c.metrics[0].labelEn}
                      </p>
                    )}

                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-sky-brand">
                      {isZh ? "查看案例" : "View case"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-br from-sky-brand to-sky-brand-dark">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              {isZh ? "你的项目和哪个案例最像？" : "Which Case Fits Your Project?"}
            </h2>
            <p className="mt-4 text-lg text-white/80">
              {isZh
                ? "告诉我们你的客户类型和产品目标，我们用最接近的项目经验回复方案。"
                : "Tell us your client type and product goal — we'll reply with the closest reference project and a tailored proposal."}
            </p>
            <div className="mt-8">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3 font-semibold text-sky-brand transition-transform hover:scale-105"
              >
                {isZh ? "联系我们" : "Contact Us"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
