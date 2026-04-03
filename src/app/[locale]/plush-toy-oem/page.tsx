import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import {
  Factory,
  ClipboardList,
  Package,
  Clock,
  Shield,
  CheckCircle,
} from "lucide-react";

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
  const isZh = locale === "zh";

  return {
    title: isZh
      ? "毛绒玩具OEM代工服务 | LovelyJoy 爱儿采"
      : "Plush Toy OEM Services in China | LovelyJoy",
    description: isZh
      ? "LovelyJoy爱儿采提供专业毛绒玩具OEM代工服务。20年经验，20000平米工厂，月产能50万件以上。BSCI、ISO 9001认证，MOQ 500件起。"
      : "LovelyJoy offers professional plush toy OEM manufacturing in Yiwu, China. 20+ years experience, 20,000sqm factory, 500K+ monthly capacity. BSCI & ISO 9001 certified. MOQ from 500 pcs.",
    alternates: {
      canonical: `/${locale}/plush-toy-oem`,
      languages: {
        zh: "/zh/plush-toy-oem",
        en: "/en/plush-toy-oem",
        "x-default": "/en/plush-toy-oem",
      },
    },
  };
}

// --------------- FAQ JSON-LD ---------------

function FaqJsonLd({ isZh }: { isZh: boolean }) {
  const faqs = [
    {
      q: "What is the MOQ for plush toy OEM orders?",
      a: "Our standard MOQ is 500 pieces per style. For new customers or trial orders, we offer a reduced MOQ of 200 pieces to help you test the market before committing to larger volumes.",
    },
    {
      q: "How long does OEM production take from order to delivery?",
      a: "Sample development takes 7-15 working days. After sample approval, bulk production takes 30-45 days depending on order size and complexity. We provide real-time production updates throughout the process.",
    },
    {
      q: "What safety certifications do your OEM plush toys meet?",
      a: "All our plush toys meet international safety standards including ASTM F963 (USA), EN 71 (EU), CE (EU), and GB 6675 (China). Our factory holds BSCI and ISO 9001 certifications.",
    },
    {
      q: "Can you produce licensed character plush toys?",
      a: "Yes, we have experience manufacturing licensed IP products including Sanrio Hello Kitty, Disney Paw Patrol, and Illumination Minions. We can work with your licensed artwork and meet all licensor quality requirements.",
    },
    {
      q: "What materials do you use for OEM plush toys?",
      a: "We use a wide range of materials including crystal super-soft plush, short plush, velboa, minky, and organic cotton. All materials are tested and certified safe. We can source specific materials based on your requirements.",
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

// --------------- Page ---------------

export default async function PlushToyOemPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const nav = await getTranslations({ locale, namespace: "nav" });

  const processSteps = [
    {
      icon: ClipboardList,
      title: isZh ? "1. 需求沟通" : "1. Requirement Discussion",
      desc: isZh
        ? "提供您的设计图纸、参考样品或创意描述。我们的团队将评估可行性并提供专业建议。"
        : "Share your design drawings, reference samples, or creative brief. Our team evaluates feasibility and provides expert recommendations.",
    },
    {
      icon: Package,
      title: isZh ? "2. 打样确认" : "2. Sample Development",
      desc: isZh
        ? "7-15个工作日内完成样品制作。包含面料选择、颜色匹配、尺寸确认和安全测试。"
        : "Sample completed within 7-15 working days. Includes fabric selection, color matching, size confirmation, and safety testing.",
    },
    {
      icon: Factory,
      title: isZh ? "3. 批量生产" : "3. Bulk Production",
      desc: isZh
        ? "样品确认后30-45天完成批量生产。全程5道质检工序，确保每件产品品质一致。"
        : "Bulk production completed 30-45 days after sample approval. 5-stage quality inspection ensures consistent quality for every piece.",
    },
    {
      icon: Clock,
      title: isZh ? "4. 质检出货" : "4. QC & Shipping",
      desc: isZh
        ? "出货前100%全检，提供第三方检测报告。支持FOB、CIF等多种贸易方式。"
        : "100% pre-shipment inspection with third-party testing reports. We support FOB, CIF, and other trade terms.",
    },
  ];

  return (
    <>
      <FaqJsonLd isZh={isZh} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-sky-brand to-sky-brand-dark py-20 md:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold text-white md:text-5xl">
              {isZh ? "毛绒玩具OEM代工服务" : "Plush Toy OEM Services in China"}
            </h1>
            <p className="mt-4 text-lg text-white/85 md:text-xl">
              {isZh
                ? "20年专业经验，从设计到交付的一站式毛绒玩具OEM解决方案"
                : "20+ years of expertise delivering end-to-end plush toy OEM solutions from design to delivery"}
            </p>
          </div>
        </Container>
      </section>

      {/* Breadcrumb */}
      <Container>
        <Breadcrumb
          items={[
            { label: nav("home"), href: "/" },
            {
              label: isZh ? "毛绒玩具OEM代工" : "Plush Toy OEM",
            },
          ]}
        />
      </Container>

      {/* What is OEM */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "什么是毛绒玩具OEM代工？" : "What Is Plush Toy OEM Manufacturing?"}
            subtitle={
              isZh
                ? "OEM（Original Equipment Manufacturer）即原始设备制造商，由客户提供设计，工厂负责生产"
                : "OEM (Original Equipment Manufacturer) means you provide the design, and we handle all manufacturing"
            }
          />
          <div className="mx-auto max-w-3xl">
            <p className="text-lg leading-relaxed text-brown-light">
              {isZh
                ? "毛绒玩具OEM代工是指品牌商或贸易商提供产品设计图纸、面料要求和包装规格，由专业工厂按照要求完成生产制造。LovelyJoy爱儿采是位于中国义乌的专业毛绒玩具OEM代工厂，拥有20000平方米现代化生产基地、300多名熟练工人和50多名专业设计师。我们为全球品牌客户提供从打样到批量生产的全流程服务，月产能超过50万件。"
                : "Plush toy OEM manufacturing means brand owners or trading companies provide product designs, fabric specifications, and packaging requirements, while a specialized factory handles all production. LovelyJoy is a professional plush toy OEM factory located in Yiwu, China, with a 20,000sqm modern production facility, 300+ skilled workers, and 50+ professional designers. We serve global brand clients with end-to-end services from sampling to mass production, with a monthly capacity exceeding 500,000 pieces."}
            </p>
          </div>
        </Container>
      </section>

      {/* OEM Process */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading
            title={isZh ? "OEM代工流程" : "Our OEM Process"}
            subtitle={
              isZh
                ? "标准化四步流程，确保高效交付"
                : "Standardized four-step process ensuring efficient delivery"
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {processSteps.map((step) => (
              <div
                key={step.title}
                className="flex items-start gap-4 rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-brand/10">
                  <step.icon className="h-6 w-6 text-sky-brand" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brown">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brown-light">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* MOQ & Pricing */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "起订量与价格" : "MOQ & Pricing"}
          />
          <div className="mx-auto max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-brown/10 p-6">
                <h3 className="text-lg font-bold text-brown">
                  {isZh ? "标准订单" : "Standard Orders"}
                </h3>
                <p className="mt-2 text-3xl font-bold text-sky-brand">
                  MOQ 500 <span className="text-base font-normal text-brown-light">{isZh ? "件/款" : "pcs/style"}</span>
                </p>
                <p className="mt-2 text-sm text-brown-light">
                  {isZh
                    ? "适合已有市场验证的成熟款式批量生产"
                    : "Ideal for proven designs ready for mass production"}
                </p>
              </div>
              <div className="rounded-2xl border border-brown/10 p-6">
                <h3 className="text-lg font-bold text-brown">
                  {isZh ? "试单" : "Trial Orders"}
                </h3>
                <p className="mt-2 text-3xl font-bold text-sky-brand">
                  MOQ 200 <span className="text-base font-normal text-brown-light">{isZh ? "件/款" : "pcs/style"}</span>
                </p>
                <p className="mt-2 text-sm text-brown-light">
                  {isZh
                    ? "适合新客户首次合作或新品市场测试"
                    : "Perfect for first-time customers or market testing new designs"}
                </p>
              </div>
            </div>
            <p className="mt-8 text-center text-brown-light">
              {isZh
                ? "价格根据尺寸、材料、工艺复杂度和订单数量确定。请联系我们获取详细报价。"
                : "Pricing depends on size, material, complexity, and order quantity. Contact us for a detailed quote."}
            </p>
          </div>
        </Container>
      </section>

      {/* Timelines */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading
            title={isZh ? "生产周期" : "Production Timelines"}
          />
          <div className="mx-auto max-w-3xl">
            <div className="space-y-4">
              {[
                {
                  label: isZh ? "样品开发" : "Sample Development",
                  time: isZh ? "7-15个工作日" : "7-15 working days",
                  detail: isZh
                    ? "含面料采购、打版、缝制、审核"
                    : "Includes fabric sourcing, pattern making, sewing, and review",
                },
                {
                  label: isZh ? "样品修改" : "Sample Revision",
                  time: isZh ? "5-7个工作日" : "5-7 working days",
                  detail: isZh
                    ? "根据客户反馈进行调整，首次修改免费"
                    : "Adjustments based on client feedback; first revision is free",
                },
                {
                  label: isZh ? "批量生产" : "Bulk Production",
                  time: isZh ? "30-45天" : "30-45 days",
                  detail: isZh
                    ? "视订单数量和工艺复杂度而定"
                    : "Depending on order quantity and production complexity",
                },
                {
                  label: isZh ? "质检与出货" : "QC & Shipping",
                  time: isZh ? "3-5天" : "3-5 days",
                  detail: isZh
                    ? "全检、装箱、安排物流"
                    : "Full inspection, packing, and logistics arrangement",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-4 rounded-xl bg-white p-5"
                >
                  <Clock className="h-5 w-5 shrink-0 text-sky-brand" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-brown">{item.label}</h3>
                      <span className="text-sm font-bold text-sky-brand">
                        {item.time}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-brown-light">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Certifications */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "质量认证" : "Quality Certifications"}
            subtitle={
              isZh
                ? "国际权威认证，品质值得信赖"
                : "Internationally certified for trusted quality"
            }
          />
          <div className="mx-auto max-w-3xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "BSCI",
              "ISO 9001",
              "CE",
              "ASTM F963",
              "EN 71",
              "GB 6675",
            ].map((cert) => (
              <div
                key={cert}
                className="flex items-center gap-3 rounded-xl bg-bg-warm p-4"
              >
                <Shield className="h-5 w-5 shrink-0 text-sky-brand" />
                <span className="font-semibold text-brown">{cert}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading
            title={isZh ? "为什么选择LovelyJoy？" : "Why Choose LovelyJoy for OEM?"}
          />
          <div className="mx-auto max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  title: isZh ? "20年行业经验" : "20+ Years Experience",
                  desc: isZh
                    ? "2003年成立，服务全球品牌客户，深耕毛绒玩具行业"
                    : "Founded in 2003, serving global brands with deep plush toy industry expertise",
                },
                {
                  title: isZh ? "知名品牌合作" : "Trusted by Major Brands",
                  desc: isZh
                    ? "CVS、Burlington、Kellytoy、Miniso国际、凯蓝等知名品牌长期合作伙伴"
                    : "Long-term partner for CVS, Burlington, Kellytoy, Miniso International, and The Green Party",
                },
                {
                  title: isZh ? "IP授权生产经验" : "Licensed IP Manufacturing",
                  desc: isZh
                    ? "三丽鸥Hello Kitty、迪士尼汪汪队、照明娱乐小黄人等授权产品生产经验"
                    : "Experience producing Sanrio Hello Kitty, Disney Paw Patrol, and Illumination Minions licensed products",
                },
                {
                  title: isZh ? "大规模产能" : "High Production Capacity",
                  desc: isZh
                    ? "20000平米工厂，300+工人，月产能50万件以上"
                    : "20,000sqm factory, 300+ workers, 500K+ monthly production capacity",
                },
                {
                  title: isZh ? "50+专业设计师" : "50+ Professional Designers",
                  desc: isZh
                    ? "提供OEM来样加工和ODM设计研发双重服务"
                    : "Offering both OEM production and ODM design & development services",
                },
                {
                  title: isZh ? "严格品控体系" : "Rigorous Quality Control",
                  desc: isZh
                    ? "5道质检工序，100%出货前全检，确保产品安全合规"
                    : "5-stage QC process, 100% pre-shipment inspection, ensuring safety and compliance",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 mt-0.5 shrink-0 text-sky-brand" />
                  <div>
                    <h3 className="font-bold text-brown">{item.title}</h3>
                    <p className="mt-1 text-sm text-brown-light">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-sky-brand to-sky-brand-dark">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              {isZh ? "开始您的OEM项目" : "Start Your OEM Project"}
            </h2>
            <p className="mt-4 text-lg text-white/80">
              {isZh
                ? "发送您的设计需求，我们的团队将在24小时内回复报价方案。"
                : "Send us your design requirements and our team will respond with a quote within 24 hours."}
            </p>
            <div className="mt-8">
              <Button href="/contact" variant="secondary" size="lg">
                {isZh ? "联系我们获取报价" : "Contact Us for a Quote"}
              </Button>
            </div>
            <p className="mt-4 text-sm text-white/60">
              {isZh
                ? "邮箱: info@lovelyjoytoy.com | WhatsApp: +1 (626) 586 7567"
                : "Email: info@lovelyjoytoy.com | WhatsApp: +1 (626) 586 7567"}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
