import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import SectionHeading from "@/components/ui/SectionHeading";
import FactoryStats from "./FactoryStats";
import GalleryGrid from "./GalleryGrid";
import BrandDetailsGallery from "./BrandDetailsGallery";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Shield } from "lucide-react";

// --------------- Static Params ---------------

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// --------------- Metadata ---------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const meta = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: `${t("title")} | ${meta("title")}`,
    description: t("story.content"),
  };
}

// --------------- Page ---------------

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const nav = await getTranslations({ locale, namespace: "nav" });

  const isZh = locale === "zh";

  // Gallery items (static data)
  const galleryItems = [
    {
      src: "/images/store/factory.jpeg",
      label: isZh ? "生产基地" : "Production Base",
    },
    {
      src: "/images/store/storefront.jpeg",
      label: isZh ? "品牌门面" : "Brand Storefront",
    },
    {
      src: "/images/store/store-wide.jpeg",
      label: isZh ? "旗舰店" : "Flagship Store",
    },
    {
      src: "/images/store/store-wall.jpeg",
      label: isZh ? "产品展厅" : "Product Showroom",
    },
  ];

  // Certification list
  const certifications: string[] = [
    t("certifications.list.0"),
    t("certifications.list.1"),
    t("certifications.list.2"),
    t("certifications.list.3"),
    t("certifications.list.4"),
    t("certifications.list.5"),
  ];

  // Brand detail images
  const detailImages = [
    {
      src: "/images/details/hangtag.jpeg",
      label: isZh ? "品牌吊牌" : "Brand Tags",
    },
    {
      src: "/images/details/label.jpeg",
      label: isZh ? "品质标签" : "Quality Labels",
    },
    {
      src: "/images/details/hangtag-full.jpeg",
      label: isZh ? "吊牌设计" : "Tag Design",
    },
    {
      src: "/images/details/bag.jpeg",
      label: isZh ? "品牌手提袋" : "Shopping Bag",
    },
    {
      src: "/images/details/cup.jpeg",
      label: isZh ? "品牌周边" : "Merchandise",
    },
    {
      src: "/images/details/cards.jpeg",
      label: isZh ? "品牌卡片" : "Brand Cards",
    },
  ];

  return (
    <>
      {/* ───── 1. Hero Banner ───── */}
      <section className="relative h-72 md:h-96 flex items-center justify-center overflow-hidden">
        <Image
          src="/images/brand/brand-cover.jpeg"
          alt={t("title")}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            {t("title")}
          </h1>
          <p className="text-lg md:text-xl text-white/80">{t("story.title")}</p>
        </div>
      </section>

      {/* Breadcrumb */}
      <Container>
        <Breadcrumb
          items={[
            { label: nav("home"), href: "/" },
            { label: nav("about") },
          ]}
        />
      </Container>

      {/* ───── 2. Brand Story ───── */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
              {/* Left: Brand philosophy */}
              <div className="flex flex-col items-center gap-6 rounded-3xl bg-bg-warm p-8">
                <h3 className="text-xl font-bold text-brown">
                  {isZh ? "如何赋予品牌独特的世界观？" : "What Makes Our Brand Unique?"}
                </h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {[
                    isZh ? "情感陪伴" : "Emotional Companionship",
                    isZh ? "情绪价值" : "Emotional Value",
                    isZh ? "美学设计" : "Aesthetic Design",
                  ].map((label) => (
                    <div
                      key={label}
                      className="flex h-28 w-28 items-center justify-center rounded-full bg-brown text-white md:h-32 md:w-32"
                    >
                      <span className="px-2 text-center text-sm font-semibold leading-tight">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-brown/60">
                  {isZh ? "设计独特的品牌视觉元素" : "Crafting a distinctive brand visual identity"}
                </p>
              </div>

              {/* Right: Story text */}
              <div>
                <h2 className="text-3xl font-bold text-brown mb-6">
                  {t("story.title")}
                </h2>
                <div className="h-1 w-16 rounded-full bg-sky-brand mb-6" />
                <p className="text-lg leading-relaxed text-brown-light whitespace-pre-line">
                  {t("story.content")
                    .split("LovelyJoy")
                    .map((part, i, arr) =>
                      i < arr.length - 1 ? (
                        <span key={i}>
                          {part}
                          <span className="font-semibold text-sky-brand">
                            LovelyJoy
                          </span>
                        </span>
                      ) : (
                        <span key={i}>{part}</span>
                      ),
                    )}
                </p>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* ───── 3. Factory Stats ───── */}
      <FactoryStats
        labels={[
          t("factory.area"),
          t("factory.workers"),
          t("factory.capacity"),
          t("factory.markets"),
        ]}
      />

      {/* ───── 4. Factory & Store Gallery ───── */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "工厂与门店" : "Factory & Stores"}
            subtitle={
              isZh
                ? "现代化生产基地与品牌零售终端"
                : "Modern production facilities and brand retail terminals"
            }
          />
          <GalleryGrid items={galleryItems} />
        </Container>
      </section>

      {/* ───── 5. Certifications ───── */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading
            title={t("certifications.title")}
            subtitle={
              isZh
                ? "通过多项国际权威认证，品质值得信赖"
                : "Certified by multiple international authorities for trusted quality"
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map((cert, i) => (
              <ScrollReveal key={cert} delay={i * 0.08}>
                <div className="flex items-start gap-4 rounded-2xl bg-white p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-brand/10">
                    <Shield className="h-6 w-6 text-sky-brand" />
                  </div>
                  <p className="text-base font-medium text-brown leading-snug pt-2">
                    {cert}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ───── 6. Brand Quality Details ───── */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <ScrollReveal>
            <p className="mb-10 text-center text-sm font-semibold uppercase tracking-widest text-brown/50">
              {isZh ? "品牌品质" : "Brand Quality"}
            </p>
          </ScrollReveal>
        </Container>
        <BrandDetailsGallery items={detailImages} />
      </section>
    </>
  );
}
