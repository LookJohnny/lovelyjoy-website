import { buildAlternates } from '@/lib/seo';
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
import Button from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { Shield, ArrowRight } from "lucide-react";

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
    alternates: buildAlternates(locale, '/about'),
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

  // Company journey — only the 2003 founding carries a specific year; growth
  // stages are framed generically (no invented milestone dates).
  const journey = [
    {
      period: isZh ? "2003年" : "2003",
      title: isZh ? "创立于义乌" : "Founded in Yiwu",
      desc: isZh
        ? "爱儿采（义乌市乐芭迪玩具厂）在全球小商品之都——中国浙江省义乌市创立，从创立之初就专注于毛绒玩具的设计与制造。"
        : "LovelyJoy (Yiwu Lebadi Toy Factory) was established in Yiwu, Zhejiang Province, China — the world's capital of small commodities — focused from day one on plush toy design and manufacturing.",
    },
    {
      period: isZh ? "发展初期" : "Early years",
      title: isZh ? "打磨工艺与品控" : "Building craft and quality control",
      desc: isZh
        ? "工厂逐步建立起覆盖裁剪、绣花、缝制、充棉、整形包装的完整生产流程，并沉淀出贯穿原材料到出货的五道质检工序。"
        : "The factory built out a complete production flow — cutting, embroidery, sewing, stuffing, and shaping and packing — and developed the 5-stage quality control process that still runs from raw material to shipment today.",
    },
    {
      period: isZh ? "成长阶段" : "Growth",
      title: isZh ? "走向全球市场" : "Going global",
      desc: isZh
        ? "二十多年间，产品逐步出口至全球70多个国家和地区，并通过BSCI、ISO 9001等国际认证，成为CVS、Burlington、Kellytoy、Build-A-Bear、Miniso国际、凯蓝等品牌的长期供应商。"
        : "Over two decades, exports expanded to more than 70 countries and regions, backed by international certifications such as BSCI and ISO 9001, with long-term programs for brands including CVS, Burlington, Kellytoy, Build-A-Bear, Miniso International, and The Green Party.",
    },
    {
      period: isZh ? "今天" : "Today",
      title: isZh ? "综合性毛绒玩具企业" : "A comprehensive plush toy enterprise",
      desc: isZh
        ? "如今工厂占地20000平方米，拥有300多名熟练工人和50多名专业设计师，月产能超过80万件，集研发设计、生产制造、品牌运营于一体。"
        : "Today the factory covers 20,000 square meters with 300+ skilled workers and 50+ professional designers, produces over 800,000 plush toys per month, and integrates R&D design, manufacturing, and brand operations under one roof.",
    },
  ];

  // What the factory does — OEM / ODM / private label
  const services = [
    {
      name: "OEM",
      title: isZh ? "OEM 代工生产" : "OEM Manufacturing",
      desc: isZh
        ? "按照客户提供的设计和规格进行生产。从版型工程、面料采购到量产和出口物流，工厂按既定标准精准执行，样品周期7–15个工作日，样品确认后30–45天交付大货。"
        : "Manufacturing to your exact designs and specifications. From pattern engineering and material sourcing to mass production and export logistics, the factory executes to your standard — samples in 7–15 working days, production in 30–45 days after sample approval.",
    },
    {
      name: "ODM",
      title: isZh ? "ODM 原创设计" : "ODM Original Design",
      desc: isZh
        ? "由50多名设计师组成的自有设计团队，把客户的草图、参考图甚至一句描述转化为可量产的设计和3D渲染图，再打样、迭代直到满意为止。"
        : "Our in-house team of 50+ designers turns a sketch, reference image, or even a verbal brief into a production-ready design with 3D renderings, then samples and iterates until you are satisfied.",
    },
    {
      name: isZh ? "自有品牌" : "Private Label",
      title: isZh ? "自有品牌与包装" : "Private Label & Branded Packaging",
      desc: isZh
        ? "吊牌、织标、彩盒、手提袋等品牌化包装均可在厂内设计和生产，支持Pantone精准配色，帮助品牌以完整的零售形象上架。"
        : "Hang tags, woven labels, color boxes, and shopping bags are designed and produced in-house, with precise Pantone color matching — so your plush line arrives retail-ready under your own brand.",
    },
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
          locale={locale}
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

      {/* ───── 2b. Company Journey ───── */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading
            title={isZh ? "发展历程" : "Our Journey"}
            subtitle={
              isZh
                ? "从义乌工厂到全球毛绒玩具供应商"
                : "From a Yiwu factory to a global plush toy supplier"
            }
          />
          <div className="mx-auto max-w-3xl space-y-6">
            {journey.map((step, i) => (
              <ScrollReveal key={step.title} delay={i * 0.08}>
                <div className="flex gap-5 rounded-2xl bg-white p-6">
                  <div className="shrink-0 pt-0.5">
                    <span className="inline-flex items-center justify-center rounded-full bg-sky-brand/10 px-4 py-1.5 text-sm font-bold text-sky-brand whitespace-nowrap">
                      {step.period}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brown">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-brown-light">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
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

      {/* ───── 3b. What We Do ───── */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading
            title={isZh ? "我们做什么" : "What We Do"}
            subtitle={
              isZh
                ? "OEM 代工、ODM 原创设计与自有品牌一站式服务"
                : "One-stop OEM, ODM, and private label plush manufacturing"
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <ScrollReveal key={service.title} delay={i * 0.08}>
                <div className="h-full rounded-2xl bg-white p-6">
                  <span className="inline-flex items-center justify-center rounded-full bg-sky-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-sky-brand">
                    {service.name}
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-brown">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-brown-light">
                    {service.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </section>

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
          <ScrollReveal>
            <div className="mx-auto mt-12 max-w-3xl">
              <p className="text-base leading-relaxed text-brown-light">
                {isZh
                  ? "认证只是底线，日常执行才是关键。每张订单都要经过五道质检工序：来料检验（IQC）、首件检验（FAI）、过程检验（IPQC）、100%成品检验（FQC）和出货前检验（OQC）。我们相信长期合作而非一锤子买卖——报价透明、成本明细清晰，起订量按尺寸分档：20cm以下3,600件，20–35cm 2,400件，35–50cm 1,200件，50cm以上800件，样品费在首个大货订单中抵扣。"
                  : "Certifications set the baseline; daily execution is what keeps quality consistent. Every order runs through our 5-stage quality control process — incoming material inspection (IQC), first article inspection (FAI), in-process checks (IPQC), 100% final product inspection (FQC), and outgoing pre-shipment inspection (OQC). We also believe in long-term partnerships over one-off transactions: transparent pricing with clear cost breakdowns, size-tiered MOQs published upfront (3,600 pcs for plush under 20 cm, 2,400 pcs for 20–35 cm, 1,200 pcs for 35–50 cm, and 800 pcs for plush over 50 cm), and sample costs deducted from your first production order."}
              </p>
            </div>
          </ScrollReveal>
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

      {/* ───── 7. Closing CTA ───── */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-sky-brand to-sky-brand-dark">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              {isZh ? "开始您的毛绒玩具项目" : "Start Your Plush Toy Project"}
            </h2>
            <p className="mt-4 text-lg text-white/80">
              {isZh
                ? "无论您是首次下单的初创品牌，还是需要稳定大批量供货的零售连锁，欢迎联系我们获取报价，或进一步了解我们的工厂实力与品控体系。"
                : "Whether you are a startup placing its first order or a retail chain that needs reliable high-volume supply, get in touch for a quote — or take a closer look at our factory capability and quality control system."}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button href="/contact" variant="secondary" size="lg">
                {isZh ? "联系我们" : "Contact Us"}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Link
                href="/factory-capability"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/70 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-white/10"
              >
                {isZh ? "了解工厂实力" : "Explore Factory Capability"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
