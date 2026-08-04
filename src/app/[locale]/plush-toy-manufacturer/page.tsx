import { buildAlternates } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { Factory, Users, Globe2, Shield, CheckCircle, Award, Clock, Package } from "lucide-react";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  return {
    // Sharpened for the "factory-direct / verify the manufacturer" sub-intent
    // (2026-07 cannibalization audit) — the custom/OEM head term belongs to
    // the /oem-plush-manufacturer hub.
    title: isZh
      ? "毛绒玩具厂家_义乌工贸一体源头工厂（非贸易商）| 爱儿采 LovelyJoy"
      : "Factory-Direct Plush Toy Manufacturer in China (Not a Trading Company) | LovelyJoy",
    description: isZh
      ? "爱儿采 LovelyJoy 是义乌工贸一体源头毛绒玩具厂家，非贸易商：20+年经验，20000㎡自有厂房，300+工人，月产80万件，BSCI/ISO9001 审核工厂。下单前先核验工厂实力与资质。"
      : "Verify LovelyJoy as a factory-direct plush toy manufacturer in Yiwu, China — not a trading company: 20+ years, 20,000 sqm owned facility, 300+ workers, 800K+ monthly capacity, BSCI & ISO 9001 audited, exporting to 70+ countries.",
    alternates: buildAlternates(locale, "/plush-toy-manufacturer"),
  };
}

function FaqJsonLd({ isZh }: { isZh: boolean }) {
  const faqs = isZh
    ? [
        { q: "你们是工厂还是贸易公司？", a: "爱儿采 LovelyJoy 是工贸一体的源头毛绒玩具厂家。自有 20000 平方米厂房、300+ 熟练工人、50+ 专业设计师，所有产品都在我们义乌自有工厂内生产，不依赖外协。" },
        { q: "最小起订量（MOQ）是多少？", a: "标准 MOQ 为每款 500 件。新客户或市场测试订单可降至 200 件/款。尺寸小或工艺简单的订单还可进一步协商。" },
        { q: "可以来图定制吗？打样需要多久？", a: "支持来图（设计稿/参考图/手绘草图/口头描述均可）来样定制。打样周期 7-15 个工作日，首版样品包含面料、打版、缝制与初检。" },
        { q: "大货生产周期多久？", a: "样品确认后，标准大货生产周期为 30-45 天，具体取决于订单量和工艺复杂度。加急订单可压缩至 20-25 天。" },
        { q: "是否支持出口认证要求？", a: "我们的产品已通过 EN71（欧盟）、ASTM F963（美国）、CE、GB 6675（中国）等玩具安全标准。工厂持有 BSCI、ISO 9001 认证，可提供第三方检测报告配合清关。" },
        { q: "你们服务过哪些客户？", a: "服务 CVS、Burlington、Kellytoy、Build-A-Bear、Miniso 国际、凯蓝（The Green Party）等全球连锁品牌，累计出口 70+ 国家。授权生产过 Sanrio Hello Kitty、Disney Paw Patrol、小黄人等 IP 产品。" },
      ]
    : [
        { q: "Are you a factory or a trading company?", a: "LovelyJoy is a factory-direct plush toy manufacturer. We own a 20,000 sqm facility in Yiwu with 300+ skilled workers and 50+ in-house designers — all production happens under our own roof." },
        { q: "What is your MOQ?", a: "Standard MOQ is 500 pcs per style. Trial orders for new customers start at 200 pcs per style. Smaller or simpler designs may be negotiated further." },
        { q: "Can I send my own artwork? How long does sampling take?", a: "Yes — we accept design files, reference photos, hand sketches, or even verbal briefs. Sample development takes 7-15 working days including fabric sourcing, pattern making, sewing, and first-round QC." },
        { q: "What is the production lead time?", a: "After sample approval, standard bulk production is 30-45 days depending on volume and complexity. Rush orders can be compressed to 20-25 days." },
        { q: "Do you support international export compliance?", a: "Yes. Testing and documentation are matched to the product, target age and destination market, including EN 71/CE (EU), ASTM F963/CPSIA (US) and GB 6675 (China) where applicable. Third-party test, factory-audit and quality-system records can be supplied for verification." },
        { q: "Which clients have you worked with?", a: "Long-term partners include CVS, Burlington, Kellytoy, Build-A-Bear, Miniso International, and The Green Party. We've shipped to 70+ countries and hold licensed-IP manufacturing experience for Sanrio Hello Kitty, Disney Paw Patrol, and Illumination Minions." },
      ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />;
}

export default async function PlushToyManufacturerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const nav = await getTranslations({ locale, namespace: "nav" });

  const highlights = [
    { icon: Factory, title: isZh ? "20000㎡ 自有厂房" : "20,000 sqm In-House Factory", desc: isZh ? "位于义乌的现代化毛绒玩具生产基地，工贸一体不外协" : "A modern plush manufacturing hub in Yiwu — no outsourcing, full in-house control." },
    { icon: Users, title: isZh ? "300+ 熟练工人 & 50+ 设计师" : "300+ Skilled Workers & 50+ Designers", desc: isZh ? "从版型开发到缝制、质检全链路自建团队" : "Full in-house team from pattern-making to sewing to QC." },
    { icon: Package, title: isZh ? "月产能 80 万件+" : "800K+ Monthly Output", desc: isZh ? "稳定承接大货订单，支持连锁渠道常年备货" : "Stable capacity for large orders and year-round retail replenishment." },
    { icon: Globe2, title: isZh ? "出口 70+ 国家" : "Exporting to 70+ Countries", desc: isZh ? "深耕欧美、日韩、东南亚、中东市场，熟悉各国合规要求" : "Deep experience serving the US, EU, Japan, Korea, SE Asia, and the Middle East." },
    { icon: Award, title: isZh ? "合作全球知名品牌" : "Trusted by Global Brands", desc: isZh ? "CVS、Burlington、Kellytoy、Build-A-Bear、Miniso 国际等长期合作" : "Long-term partner for CVS, Burlington, Kellytoy, Build-A-Bear, Miniso International." },
    { icon: Shield, title: isZh ? "双体系认证工厂" : "Dual-Certified Factory", desc: isZh ? "BSCI 社会责任 + ISO 9001 质量管理体系双认证" : "BSCI social compliance + ISO 9001 quality management system." },
  ];

  const capabilities = isZh
    ? [
        "毛绒玩具（公仔/动物/卡通/人偶）OEM/ODM 定制生产",
        "企业吉祥物、品牌 IP 衍生毛绒周边",
        "礼品与活动毛绒玩具（礼盒/吊牌/包装定制）",
        "抱枕、靠垫、U 形枕等家居毛绒品类",
        "毛绒挂件、钥匙扣、盲盒、毛绒配件",
        "儿童玩具、婴童安抚玩具（通过 EN71/ASTM 检测）",
      ]
    : [
        "OEM/ODM custom plush toys (characters, animals, cartoons, figures)",
        "Corporate mascot plush and brand-IP merchandise",
        "Promotional and event plush with custom gift packaging",
        "Plush pillows, cushions, and neck pillows",
        "Plush keychains, bag charms, blind-box collectibles",
        "Children's plush and infant-safe plush (EN71 / ASTM tested)",
      ];

  const processSteps = [
    { num: "01", title: isZh ? "需求沟通" : "Brief & Consultation", desc: isZh ? "评估设计可行性，推荐面料、工艺、尺寸方案" : "We assess feasibility and recommend fabric, craft, and sizing options." },
    { num: "02", title: isZh ? "打样开发" : "Sampling", desc: isZh ? "7-15 天出首版样，含实物面料色卡与结构确认" : "First sample in 7-15 days including physical fabric swatches and structure review." },
    { num: "03", title: isZh ? "批量生产" : "Mass Production", desc: isZh ? "30-45 天完成大货，5 道质检+出货前 100% 全检" : "Bulk production in 30-45 days with 5-stage QC and 100% pre-shipment inspection." },
    { num: "04", title: isZh ? "包装与交付" : "Packaging & Delivery", desc: isZh ? "吊牌/礼盒/OPP 袋定制，支持 FOB/CIF/DDP 出口" : "Custom hang tags, gift boxes, poly bags. FOB / CIF / DDP shipping supported." },
  ];

  return (
    <>
      <FaqJsonLd isZh={isZh} />

      <section className="bg-gradient-to-br from-sky-brand to-sky-brand-dark py-20 md:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold text-white md:text-5xl">
              {isZh ? "爱儿采 LovelyJoy｜工贸一体毛绒玩具厂家" : "LovelyJoy — Factory-Direct Plush Toy Manufacturer in China"}
            </h1>
            <p className="mt-4 text-lg text-white/85 md:text-xl">
              {isZh
                ? "义乌源头工厂 · 工贸一体 · 20+年经验 · OEM/ODM 定制生产，服务全球 B2B 客户"
                : "Factory-direct in Yiwu · One-stop OEM/ODM · 20+ years · Serving B2B clients worldwide"}
            </p>
          </div>
        </Container>
      </section>

      <Container>
        <Breadcrumb
          locale={locale}
          items={[
            { label: nav("home"), href: "/" },
            { label: isZh ? "毛绒玩具厂家" : "Plush Toy Manufacturer" },
          ]}
        />
        {/* Hub-and-spoke link to the custom-manufacturing hub */}
        <p className="pb-2 text-sm text-brown-light">
          {isZh ? (
            <>
              本页属于我们的{" "}
              <Link href="/oem-plush-manufacturer" className="font-semibold text-sky-brand underline">
                毛绒玩具定制工厂（OEM/ODM）
              </Link>{" "}
              服务体系。
            </>
          ) : (
            <>
              Part of our{" "}
              <Link href="/oem-plush-manufacturer" className="font-semibold text-sky-brand underline">
                custom plush toy manufacturing
              </Link>{" "}
              services.
            </>
          )}
        </p>
      </Container>

      {/* Why Choose */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "为什么选择爱儿采作为毛绒玩具厂家" : "Why Choose LovelyJoy as Your Plush Toy Manufacturer"}
            subtitle={isZh ? "工贸一体的源头工厂，不是贸易商、不是中间商" : "A factory-direct manufacturer — not a trading company, not a middleman"}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((h) => (
              <div key={h.title} className="rounded-2xl border border-brown/10 bg-white p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-brand/10">
                  <h.icon className="h-6 w-6 text-sky-brand" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-brown">{h.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brown-light">{h.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Capabilities */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading
            title={isZh ? "我们能生产哪些毛绒玩具产品" : "Plush Toy Products We Manufacture"}
            subtitle={isZh ? "覆盖零售、礼品、企业、IP 衍生全品类" : "Covering retail, promotional, corporate, and licensed-IP categories"}
          />
          <div className="mx-auto max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-3">
            {capabilities.map((c) => (
              <div key={c} className="flex items-start gap-3 rounded-xl bg-white p-4">
                <CheckCircle className="h-5 w-5 mt-0.5 shrink-0 text-sky-brand" />
                <span className="text-sm text-brown-light">{c}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Process */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "从打样到量产的合作流程" : "From Sampling to Mass Production"}
            subtitle={isZh ? "标准化四步流程，透明可追踪" : "A standardized four-step process, fully transparent and trackable"}
          />
          <div className="mx-auto max-w-3xl space-y-5">
            {processSteps.map((s) => (
              <div key={s.num} className="flex gap-5 rounded-xl bg-bg-warm p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-brand text-white font-bold">{s.num}</div>
                <div>
                  <h3 className="text-lg font-bold text-brown">{s.title}</h3>
                  <p className="mt-1 text-sm text-brown-light">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Certifications */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading title={isZh ? "工厂资质与出口认证" : "Factory Credentials & Export Certifications"} />
          <div className="mx-auto max-w-3xl grid grid-cols-2 sm:grid-cols-3 gap-4">
            {["BSCI", "ISO 9001", "EN 71", "ASTM F963", "CE", "GB 6675"].map((c) => (
              <div key={c} className="flex items-center gap-3 rounded-xl bg-white p-4">
                <Shield className="h-5 w-5 shrink-0 text-sky-brand" />
                <span className="font-semibold text-brown">{c}</span>
              </div>
            ))}
          </div>
          <p className="mx-auto max-w-3xl mt-6 text-center text-sm text-brown-light">
            {isZh
              ? "具体证书、审核与测试报告按产品、批次和目标市场核验；可向合格买家提供适用文件，用于清关与渠道入库。"
              : "Certificates, audits and test reports are verified by product, batch and destination market. Applicable records can be supplied to qualified buyers for customs and retail onboarding."}
          </p>
        </Container>
      </section>

      {/* Target Clients */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading title={isZh ? "哪些客户适合与我们合作" : "Clients We Work Best With"} />
          <div className="mx-auto max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(isZh
              ? [
                  "自有品牌方（寻找稳定代工厂）",
                  "跨境电商卖家（Amazon / Shopify / 独立站）",
                  "礼品公司 / 活动公司（节庆促销批量采购）",
                  "连锁零售渠道（百货/便利店/连锁玩具店）",
                  "IP 授权方与联名品牌（需认证工厂生产）",
                  "主题乐园与景区（吉祥物与纪念品毛绒）",
                ]
              : [
                  "Own-brand manufacturers seeking a reliable factory partner",
                  "Cross-border e-commerce sellers (Amazon, Shopify, DTC)",
                  "Gift & promotional companies for seasonal campaigns",
                  "Retail chains (department stores, convenience, toy chains)",
                  "IP licensors and collab brands needing certified production",
                  "Theme parks and attractions for mascot & souvenir plush",
                ]).map((t) => (
              <div key={t} className="flex items-start gap-3 rounded-xl border border-brown/10 p-4">
                <Clock className="h-5 w-5 mt-0.5 shrink-0 text-sky-brand" />
                <span className="text-sm text-brown">{t}</span>
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
              {isZh ? "想了解报价或获取样品方案？" : "Ready for a Quote or Sample Plan?"}
            </h2>
            <p className="mt-4 text-lg text-white/80">
              {isZh
                ? "提交您的产品需求或设计稿，24 小时内工厂团队专人回复。"
                : "Share your brief or design — our factory team responds within 24 hours."}
            </p>
            <div className="mt-8">
              <Button href="/contact" variant="secondary" size="lg">
                {isZh ? "立即咨询工厂" : "Contact the Factory"}
              </Button>
            </div>
            <p className="mt-4 text-sm text-white/60">
              {isZh
                ? "邮箱: info@lovelyjoytoy.com · WhatsApp: +1 (626) 586 7567"
                : "Email: info@lovelyjoytoy.com · WhatsApp: +1 (626) 586 7567"}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
