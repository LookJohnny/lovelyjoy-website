import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import {
  Palette,
  Ruler,
  Scissors,
  Package,
  Pen,
  Users,
  Sparkles,
  CheckCircle,
  ArrowRight,
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
      ? "定制毛绒玩具制造商 | LovelyJoy 爱儿采"
      : "Custom Plush Toy Manufacturer | LovelyJoy",
    description: isZh
      ? "LovelyJoy爱儿采是中国义乌专业定制毛绒玩具制造商。50+设计师团队，支持颜色、尺寸、材料、包装全面定制。MOQ 200件起，7-15天出样。"
      : "LovelyJoy is a professional custom plush toy manufacturer in Yiwu, China. 50+ designer team, full customization of colors, sizes, materials, and packaging. MOQ from 200 pcs, samples in 7-15 days.",
    alternates: {
      canonical: `/${locale}/custom-plush-manufacturer`,
      languages: {
        zh: "/zh/custom-plush-manufacturer",
        en: "/en/custom-plush-manufacturer",
        "x-default": "/en/custom-plush-manufacturer",
      },
    },
  };
}

// --------------- FAQ JSON-LD ---------------

function FaqJsonLd() {
  const faqs = [
    {
      q: "Can you make a custom plush toy from my drawing or sketch?",
      a: "Yes, we can create custom plush toys from sketches, drawings, photos, or even verbal descriptions. Our 50+ designer team will develop a detailed 3D rendering and production pattern from your concept, then create a physical sample for your approval.",
    },
    {
      q: "What customization options are available for plush toys?",
      a: "We offer full customization including: size (from 10cm keychains to 150cm giant plush), materials (crystal super-soft, short plush, velboa, minky, organic cotton), colors (Pantone matching), filling (PP cotton, memory foam, weighted beads), accessories (embroidery, printing, clothing), and packaging (hang tags, poly bags, gift boxes, display boxes).",
    },
    {
      q: "How many designers does LovelyJoy have?",
      a: "LovelyJoy has over 50 professional designers on staff. Our design team specializes in plush toy pattern development, 3D modeling, character design, and packaging design. This allows us to offer both OEM (your design) and ODM (our design) services.",
    },
    {
      q: "What is the minimum order for custom plush toys?",
      a: "Our standard MOQ for custom plush toys is 500 pieces per style. For new customers or market testing, we offer trial orders starting from 200 pieces per style.",
    },
    {
      q: "Can you replicate an existing plush toy design?",
      a: "We can manufacture plush toys based on reference samples or existing designs that you own the rights to. We respect intellectual property rights and require that customers confirm they have authorization for any designs based on existing characters or products.",
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

export default async function CustomPlushManufacturerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const nav = await getTranslations({ locale, namespace: "nav" });

  const customizationOptions = [
    {
      icon: Palette,
      title: isZh ? "颜色定制" : "Custom Colors",
      desc: isZh
        ? "Pantone色卡精准匹配，支持渐变色、混色等特殊效果。确保每批次颜色一致性。"
        : "Precise Pantone color matching with support for gradient and mixed-color effects. Consistent color across every batch.",
    },
    {
      icon: Ruler,
      title: isZh ? "尺寸定制" : "Custom Sizes",
      desc: isZh
        ? "从10cm钥匙扣挂件到150cm超大毛绒玩具，任意尺寸均可定制生产。"
        : "From 10cm keychain plush to 150cm giant stuffed animals, any size can be custom manufactured.",
    },
    {
      icon: Scissors,
      title: isZh ? "材料选择" : "Material Selection",
      desc: isZh
        ? "水晶超柔、短毛绒、天鹅绒、Minky面料、有机棉等多种面料可选，全部通过安全检测。"
        : "Crystal super-soft, short plush, velboa, minky, organic cotton, and more. All materials safety-tested and certified.",
    },
    {
      icon: Package,
      title: isZh ? "包装定制" : "Custom Packaging",
      desc: isZh
        ? "吊牌、标签、OPP袋、彩盒、展示盒、手提袋等全套包装方案定制。"
        : "Hang tags, labels, poly bags, gift boxes, display boxes, and shopping bags — full packaging customization.",
    },
    {
      icon: Pen,
      title: isZh ? "品牌植入" : "Branding",
      desc: isZh
        ? "品牌Logo刺绣、织标、印花，支持产品各部位品牌标识植入。"
        : "Brand logo embroidery, woven labels, and printing. Branding placement on any part of the product.",
    },
    {
      icon: Sparkles,
      title: isZh ? "特殊工艺" : "Special Features",
      desc: isZh
        ? "发声器、LED灯、香味、重力球、可活动关节、磁铁等功能性定制。"
        : "Sound modules, LED lights, scents, weighted beads, movable joints, magnets, and other functional features.",
    },
  ];

  const processSteps = [
    {
      step: "01",
      title: isZh ? "概念与设计" : "Concept & Design",
      desc: isZh
        ? "客户提供设计图纸、参考图片或创意描述。我们的50+设计师团队进行图纸优化和3D效果图制作。"
        : "You provide design drawings, reference images, or creative descriptions. Our 50+ designer team optimizes drawings and creates 3D renderings.",
    },
    {
      step: "02",
      title: isZh ? "面料与配件选择" : "Material & Accessory Selection",
      desc: isZh
        ? "根据产品定位推荐最佳面料和填充物组合。提供实物面料色卡供客户确认。"
        : "We recommend the best fabric and filling combinations based on product positioning. Physical fabric swatches provided for confirmation.",
    },
    {
      step: "03",
      title: isZh ? "样品制作" : "Sample Production",
      desc: isZh
        ? "7-15个工作日完成首版样品。包括结构样、面料样和包装样的完整制作。"
        : "First sample completed within 7-15 working days. Includes structural sample, fabric sample, and packaging sample.",
    },
    {
      step: "04",
      title: isZh ? "样品修改与确认" : "Sample Revision & Approval",
      desc: isZh
        ? "根据反馈进行修改调整，5-7个工作日出修改样。直到客户完全满意为止。"
        : "Revisions based on feedback, completed in 5-7 working days. We iterate until you are fully satisfied.",
    },
    {
      step: "05",
      title: isZh ? "批量生产" : "Mass Production",
      desc: isZh
        ? "确认产前样后安排批量生产，30-45天完成。全程提供生产进度更新。"
        : "After pre-production sample approval, bulk production in 30-45 days. Real-time production updates throughout.",
    },
    {
      step: "06",
      title: isZh ? "质检与交付" : "QC & Delivery",
      desc: isZh
        ? "5道质检工序 + 出货前100%全检。安排物流发往全球任何目的地。"
        : "5-stage QC process + 100% pre-shipment inspection. Logistics arranged to any destination worldwide.",
    },
  ];

  const caseExamples = [
    {
      title: isZh ? "品牌吉祥物定制" : "Brand Mascot Customization",
      desc: isZh
        ? "为企业客户将品牌吉祥物从2D形象转化为3D毛绒玩具，涵盖企业礼品、促销赠品和零售产品。"
        : "Transform brand mascots from 2D artwork to 3D plush toys for corporate clients, covering corporate gifts, promotional giveaways, and retail products.",
    },
    {
      title: isZh ? "IP授权产品" : "Licensed IP Products",
      desc: isZh
        ? "为三丽鸥Hello Kitty、迪士尼汪汪队、照明娱乐小黄人等知名IP生产授权毛绒玩具，严格遵守授权方品质要求。"
        : "Manufacture licensed plush toys for Sanrio Hello Kitty, Disney Paw Patrol, and Illumination Minions, strictly adhering to licensor quality standards.",
    },
    {
      title: isZh ? "零售渠道定制" : "Retail Channel Customization",
      desc: isZh
        ? "为CVS、Burlington、Miniso国际、凯蓝等零售渠道客户提供定制产品开发，满足不同市场定位需求。"
        : "Custom product development for retail channel clients including CVS, Burlington, Miniso International, and The Green Party, meeting diverse market positioning needs.",
    },
  ];

  return (
    <>
      <FaqJsonLd />

      {/* Hero */}
      <section className="bg-gradient-to-br from-beige-brand to-beige-brand-dark py-20 md:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold text-brown md:text-5xl">
              {isZh ? "定制毛绒玩具制造商" : "Custom Plush Toy Manufacturer"}
            </h1>
            <p className="mt-4 text-lg text-brown/80 md:text-xl">
              {isZh
                ? "50+设计师团队，从概念到成品的全流程定制服务"
                : "50+ designer team delivering full-process customization from concept to finished product"}
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
              label: isZh ? "定制毛绒玩具" : "Custom Plush Manufacturer",
            },
          ]}
        />
      </Container>

      {/* Customization Capabilities */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "定制能力" : "Customization Capabilities"}
            subtitle={
              isZh
                ? "颜色、尺寸、材料、包装、品牌——一切按您的要求定制"
                : "Colors, sizes, materials, packaging, branding — everything customized to your specifications"
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customizationOptions.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-brown/10 bg-white p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-brand/10">
                  <item.icon className="h-6 w-6 text-sky-brand" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-brown">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-brown-light">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Designer Team Advantage */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading
            title={isZh ? "50+专业设计师团队" : "50+ Professional Designer Team"}
            subtitle={
              isZh
                ? "从创意概念到生产图纸的全流程设计能力"
                : "Full-spectrum design capability from creative concept to production patterns"
            }
          />
          <div className="mx-auto max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  icon: Users,
                  title: isZh ? "团队规模" : "Team Scale",
                  desc: isZh
                    ? "50+全职设计师，涵盖产品设计、结构设计、包装设计等专业方向"
                    : "50+ full-time designers covering product design, structural design, and packaging design",
                },
                {
                  icon: Pen,
                  title: isZh ? "设计服务" : "Design Services",
                  desc: isZh
                    ? "提供从概念草图到3D效果图、生产版型的全套设计服务"
                    : "Full design services from concept sketches to 3D renderings and production patterns",
                },
                {
                  icon: Palette,
                  title: isZh ? "快速出样" : "Fast Prototyping",
                  desc: isZh
                    ? "设计到样品7-15天，修改样5-7天，高效响应客户需求"
                    : "Design to sample in 7-15 days, revisions in 5-7 days, efficiently responding to client needs",
                },
                {
                  icon: Sparkles,
                  title: isZh ? "趋势洞察" : "Trend Insights",
                  desc: isZh
                    ? "每季度发布玩具行业趋势报告，帮助客户把握市场机会"
                    : "Quarterly toy industry trend reports to help clients capture market opportunities",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-xl bg-white p-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-brand/10">
                    <item.icon className="h-5 w-5 text-sky-brand" />
                  </div>
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

      {/* Design-to-Delivery Process */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "从设计到交付" : "Design-to-Delivery Process"}
            subtitle={
              isZh
                ? "标准化六步流程，确保定制产品精准还原您的创意"
                : "Standardized six-step process ensuring your custom plush precisely matches your vision"
            }
          />
          <div className="mx-auto max-w-3xl space-y-6">
            {processSteps.map((step, index) => (
              <div key={step.step} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-brand text-white font-bold text-sm">
                    {step.step}
                  </div>
                  {index < processSteps.length - 1 && (
                    <div className="w-0.5 flex-1 bg-sky-brand/20 mt-2" />
                  )}
                </div>
                <div className="pb-6">
                  <h3 className="text-lg font-bold text-brown">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-brown-light">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Case Examples */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading
            title={isZh ? "定制案例" : "Custom Manufacturing Examples"}
            subtitle={
              isZh
                ? "服务全球品牌客户的定制项目经验"
                : "Custom project experience serving global brand clients"
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {caseExamples.map((example) => (
              <div
                key={example.title}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-bold text-brown">
                  {example.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-brown-light">
                  {example.desc}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-sky-brand to-sky-brand-dark">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              {isZh
                ? "让我们将您的创意变为现实"
                : "Let Us Bring Your Idea to Life"}
            </h2>
            <p className="mt-4 text-lg text-white/80">
              {isZh
                ? "发送您的设计概念或参考图片，我们将在24小时内提供专业方案和报价。"
                : "Send us your design concept or reference images. We will respond with a professional proposal and quote within 24 hours."}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button href="/contact" variant="secondary" size="lg">
                {isZh ? "获取定制方案" : "Get a Custom Quote"}
                <ArrowRight className="h-4 w-4" />
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
