import { buildAlternates } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { MapPin, Truck, Layers, Eye, CheckCircle, Ship, Factory, Globe2 } from "lucide-react";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  return {
    title: isZh
      ? "义乌毛绒玩具厂家_中国源头工厂_OEM/ODM出口服务 | 爱儿采 LovelyJoy"
      : "Yiwu Plush Toy Factory | China Source Manufacturer for OEM/ODM Export | LovelyJoy",
    description: isZh
      ? "爱儿采位于中国义乌——全球最大小商品供应链中心。20000㎡ 自有工厂，月产 80 万件，服务跨境卖家、批发商、品牌采购与礼品公司。支持视频看厂、FOB/EXW/DDP 出口。"
      : "LovelyJoy is located in Yiwu, China — the world's largest small-commodities supply hub. 20,000 sqm factory, 800K monthly capacity. Serving cross-border sellers, wholesalers, brands, and gift companies with FOB/EXW/DDP export and video factory tours.",
    alternates: buildAlternates(locale, "/yiwu-plush-factory"),
  };
}

function FaqJsonLd({ isZh }: { isZh: boolean }) {
  const faqs = isZh
    ? [
        { q: "为什么选择义乌的毛绒玩具工厂？", a: "义乌是全球最大的小商品集散地，毛绒玩具产业链非常完整——面料、填充、辅料、包装在本地一站式解决，打样速度比其他产区快 30-40%。义乌国际物流发达，到宁波港/上海港 3-4 小时车程，跨境出口效率高。" },
        { q: "工厂是否支持海外订单？", a: "支持。我们已出口 70+ 国家，熟悉欧美、日韩、东南亚、中东的清关要求与合规文件（EN71/ASTM/CE/测试报告）。常年为 CVS、Burlington、Kellytoy、Miniso 等全球连锁供货。" },
        { q: "可以安排视频看厂或现场验厂吗？", a: "可以。我们支持 Zoom / 微信 / WhatsApp 视频看厂，专人带看车间、仓库、质检区。外商现场验厂也欢迎——我们已通过 BSCI、ISO 9001、多家品牌客户的年度审厂。" },
        { q: "支持 FOB / EXW / CIF / DDP 等哪些贸易方式？", a: "FOB 宁波/上海是默认方式，也可做 EXW 义乌（客户自提）、CIF 目的港、DDP 送货到门。我们有长期合作的货代团队，能承担全套出口文件、保险、清关。" },
        { q: "如何控制跨境项目的交付风险？", a: "我们采取三重保障：（1）样品阶段实拍视频 + 物流寄样确认；（2）大货生产每周进度周报含照片；（3）出货前 100% 全检 + 第三方 QC 可按需接入。客户只要报 OEM 条款，我们按合规标准执行。" },
        { q: "新客户首单需要准备什么？", a: "推荐流程：提供产品类别/参考图/目标售价区间 → 我们给出面料方案和报价 → 确认后打样 → 样品确认后下 30% 定金开始大货 → 出货前付 70% 尾款。全程专人对接，无需在义乌派常驻。" },
      ]
    : [
        { q: "Why choose a Yiwu plush toy factory?", a: "Yiwu is the world's largest small-commodities supply hub with a complete plush supply chain — fabric, filling, accessories, and packaging all sourced locally. Sampling here is 30-40% faster than other regions. Yiwu is 3-4 hours from Ningbo/Shanghai ports with strong cross-border logistics." },
        { q: "Do you accept overseas orders?", a: "Yes. We export to 70+ countries and are familiar with US, EU, Japan, Korea, SE Asia, and Middle East compliance requirements (EN71, ASTM, CE, test reports). Long-term clients include CVS, Burlington, Kellytoy, and Miniso International." },
        { q: "Can you arrange a video factory tour or on-site audit?", a: "Absolutely. We support live video tours via Zoom, WeChat, or WhatsApp — a staff member walks you through production, warehouse, and QC zones. On-site audits are welcome — we've passed BSCI, ISO 9001, and annual audits from multiple major brand clients." },
        { q: "What trade terms do you support (FOB/EXW/CIF/DDP)?", a: "Default is FOB Ningbo or Shanghai. We also support EXW Yiwu (buyer pickup), CIF destination port, and DDP door-to-door. We have a long-term freight forwarder network covering export documents, insurance, and customs clearance." },
        { q: "How do you manage cross-border delivery risk?", a: "Three-tier protection: (1) real-time sample photos/videos plus courier shipment for confirmation; (2) weekly production progress reports with photos; (3) 100% pre-shipment QC plus optional third-party inspection. OEM confidentiality terms are enforced throughout." },
        { q: "What does a first-time customer need to start?", a: "Recommended flow: share product category / reference images / target price range → we propose fabric and quote → approve sample → 30% deposit begins bulk → 70% balance before shipment. A dedicated account manager guides you through — no need for anyone to be on-site in Yiwu." },
      ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />;
}

export default async function YiwuPlushFactoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const nav = await getTranslations({ locale, namespace: "nav" });

  const advantages = [
    { icon: Layers, title: isZh ? "完整毛绒产业链" : "Complete Plush Supply Chain", desc: isZh ? "义乌本地就能解决面料、填充、辅料、配件、包装，打样速度快 30-40%" : "Fabric, filling, accessories, and packaging all sourced locally — sampling 30-40% faster than elsewhere." },
    { icon: Truck, title: isZh ? "港口与物流优势" : "Port & Logistics Edge", desc: isZh ? "距宁波港/上海港 3-4 小时，国际货运代理资源成熟" : "3-4 hours to Ningbo/Shanghai ports with mature freight forwarder networks." },
    { icon: Factory, title: isZh ? "20000㎡ 源头工厂" : "20,000 sqm Source Factory", desc: isZh ? "不是贸易商、不是办公室外协，产品全部在我们自有厂房生产" : "Not a trader, not an office — everything manufactured under our own roof." },
    { icon: Eye, title: isZh ? "支持视频看厂" : "Live Video Factory Tours", desc: isZh ? "Zoom/微信/WhatsApp 全球视频带看，欢迎现场验厂" : "Live tours via Zoom, WeChat, or WhatsApp. On-site audits welcome anytime." },
    { icon: Ship, title: isZh ? "FOB/EXW/CIF/DDP 全支持" : "Full Export Terms Supported", desc: isZh ? "全套出口文件、商检、保险、清关可一站搞定" : "Full export documentation, inspection, insurance, and customs — handled in-house." },
    { icon: Globe2, title: isZh ? "出口 70+ 国家" : "Exporting to 70+ Countries", desc: isZh ? "欧美/日韩/东南亚/中东/南美主流市场均有长期客户" : "Long-term clients across North America, Europe, Japan, Korea, SE Asia, Middle East, and Latin America." },
  ];

  const clientFit = isZh
    ? [
        { title: "跨境电商卖家", desc: "Amazon/Shopify/TikTok 独立站，需要稳定供应与快速补单" },
        { title: "海外批发商与进口商", desc: "季节性大货采购，要求合规文件完整" },
        { title: "品牌方与礼品公司", desc: "自有品牌 OEM/ODM 定制，要求工艺还原度与品控" },
        { title: "连锁零售渠道", desc: "年度 SKU 采购 + 持续补货，需要产能和交期可控" },
        { title: "IP 授权方 / 联名品牌", desc: "需要认证工厂按授权方 QC 标准生产" },
        { title: "主题乐园与景区", desc: "吉祥物毛绒、纪念品、伴手礼周边定制" },
      ]
    : [
        { title: "Cross-border e-commerce sellers", desc: "Amazon, Shopify, TikTok shops needing stable supply and fast reorders." },
        { title: "Overseas wholesalers & importers", desc: "Seasonal bulk buys requiring complete compliance documentation." },
        { title: "Brand owners & gift companies", desc: "Own-brand OEM/ODM with strict craftsmanship and QC standards." },
        { title: "Retail chains", desc: "Annual SKU sourcing plus replenishment — capacity and on-time delivery critical." },
        { title: "IP licensors & collab brands", desc: "Need a certified factory producing under licensor QC standards." },
        { title: "Theme parks & attractions", desc: "Mascot plush, souvenirs, and themed merchandise." },
      ];

  return (
    <>
      <FaqJsonLd isZh={isZh} />

      <section className="bg-gradient-to-br from-sky-brand to-sky-brand-dark py-20 md:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold text-white md:text-5xl">
              {isZh ? "义乌毛绒玩具工厂 | 中国源头制造" : "Yiwu Plush Toy Factory — China Source Manufacturing"}
            </h1>
            <p className="mt-4 text-lg text-white/85 md:text-xl">
              {isZh
                ? "全球小商品之都 · 20000㎡ 自有工厂 · OEM/ODM 定制出口 · 服务 70+ 国家买家"
                : "At the world's small-commodities capital · 20,000 sqm factory · OEM/ODM for export · serving buyers in 70+ countries"}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-white backdrop-blur">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">
                {isZh ? "义乌市北苑街道三十里 思源路 8 号" : "No.8 Siyuan Road, Niansan Li, Yiwu, Zhejiang, China"}
              </span>
            </div>
          </div>
        </Container>
      </section>

      <Container>
        <Breadcrumb
          locale={locale}
          items={[
            { label: nav("home"), href: "/" },
            { label: isZh ? "义乌毛绒玩具工厂" : "Yiwu Plush Factory" },
          ]}
        />
      </Container>

      {/* Why Yiwu */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "为什么很多客户选择义乌毛绒玩具工厂" : "Why Buyers Choose a Yiwu Plush Factory"}
            subtitle={isZh ? "产业链 + 物流 + 经验的三重优势" : "Supply chain, logistics, and export expertise — all in one place"}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advantages.map((a) => (
              <div key={a.title} className="rounded-2xl border border-brown/10 bg-white p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-brand/10">
                  <a.icon className="h-6 w-6 text-sky-brand" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-brown">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brown-light">{a.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Factory Stats */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading
            title={isZh ? "爱儿采在义乌的工厂实力" : "LovelyJoy's Yiwu Factory at a Glance"}
          />
          <div className="mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { k: "20,000㎡", v: isZh ? "自有厂房" : "Owned Facility" },
              { k: "300+", v: isZh ? "熟练工人" : "Skilled Workers" },
              { k: "50+", v: isZh ? "专业设计师" : "In-House Designers" },
              { k: "800,000+", v: isZh ? "件/月产能" : "pcs/month" },
              { k: "20+", v: isZh ? "年经验" : "Years Experience" },
              { k: "70+", v: isZh ? "出口国家" : "Export Countries" },
              { k: "85%+", v: isZh ? "老客户复购率" : "Client Retention" },
              { k: "6", v: isZh ? "项国际认证" : "Certifications" },
            ].map((s) => (
              <div key={s.v} className="rounded-2xl bg-white p-6 text-center shadow-sm">
                <div className="text-2xl font-bold text-sky-brand md:text-3xl">{s.k}</div>
                <div className="mt-1 text-sm text-brown-light">{s.v}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Who Buys From Us */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading title={isZh ? "适合哪些国内外采购客户" : "Who Sources From Us"} />
          <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-5">
            {clientFit.map((c) => (
              <div key={c.title} className="rounded-2xl border border-brown/10 bg-white p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-sky-brand" />
                  <h3 className="font-bold text-brown">{c.title}</h3>
                </div>
                <p className="mt-2 text-sm text-brown-light">{c.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Delivery Flow */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading
            title={isZh ? "从义乌工厂到全球交付" : "From Our Yiwu Floor to Your Door"}
            subtitle={isZh ? "一套标准化流程，从询盘到收货全流程可追踪" : "A single standardized flow — every step trackable from inquiry to delivery"}
          />
          <div className="mx-auto max-w-3xl space-y-4">
            {(isZh
              ? [
                  { t: "询盘 → 需求评估（24h 内）", d: "专人对接，确认产品类别、MOQ、预算、交期需求" },
                  { t: "报价 → 打样（7-15 天）", d: "实物样品+面料色卡 EMS/DHL 寄到您手" },
                  { t: "确认 → 下单（30% 定金）", d: "签订 PI/合同，锁定产能排期" },
                  { t: "生产 → 周报 + 现场视频", d: "每周进度更新，可随时视频连线车间" },
                  { t: "QC → 全检 + 第三方检验可选", d: "AQL 2.5 标准，100% 出货前全检+照片报告" },
                  { t: "发货 → FOB 宁波/上海 → 门到门", d: "可配套 CIF/DDP，保险与清关一站式" },
                ]
              : [
                  { t: "Inquiry → Scoping (within 24h)", d: "Dedicated account manager confirms category, MOQ, budget, deadline." },
                  { t: "Quote → Sample (7-15 days)", d: "Physical samples plus fabric swatches shipped to you via EMS/DHL." },
                  { t: "Approve → Order (30% deposit)", d: "PI/contract signed, production slot locked in." },
                  { t: "Production → Weekly reports + live video", d: "Weekly progress updates with photos; live factory video on request." },
                  { t: "QC → Full inspection + optional 3rd-party", d: "AQL 2.5, 100% pre-shipment inspection with photo reports." },
                  { t: "Ship → FOB Ningbo/Shanghai → Door-to-door", d: "CIF/DDP available; insurance and customs clearance handled end-to-end." },
                ]
            ).map((step, i) => (
              <div key={step.t} className="flex gap-4 rounded-xl bg-white p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-brand text-white font-bold text-sm">{i + 1}</div>
                <div>
                  <h3 className="font-bold text-brown">{step.t}</h3>
                  <p className="mt-1 text-sm text-brown-light">{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-br from-sky-brand to-sky-brand-dark">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              {isZh ? "预约视频看厂 / 获取出口报价" : "Book a Video Tour or Get an Export Quote"}
            </h2>
            <p className="mt-4 text-lg text-white/80">
              {isZh
                ? "告诉我们您的产品类别和目标市场，我们 24 小时内回复方案与报价。"
                : "Tell us your product category and target market — response within 24 hours."}
            </p>
            <div className="mt-8">
              <Button href="/contact" variant="secondary" size="lg">
                {isZh ? "联系工厂顾问" : "Talk to Our Factory Team"}
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
