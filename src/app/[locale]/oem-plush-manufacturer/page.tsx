import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { buildAlternates, SITE, ORG_ID } from "@/lib/seo";
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
      ? "毛绒玩具定制工厂_义乌OEM/ODM源头厂家 | 爱儿采 LovelyJoy"
      : "Custom Plush Toy Manufacturer in China | OEM Plush Toy Supplier",
    description: isZh
      ? "爱儿采 LovelyJoy 是义乌 OEM/ODM 毛绒玩具源头工厂，服务全球批发商、进口商、礼品品牌与零售商。支持来图定制、贴牌生产、毛绒公仔与吉祥物制造，申请样品与报价。"
      : "LovelyJoy is a Yiwu-based OEM/ODM plush toy manufacturer for international wholesalers, importers, gift brands, and retailers. Request samples, private label plush toys, and custom stuffed animal production.",
    // Self-referencing canonical — this is the single ranking target for the
    // "custom plush toy manufacturer China" keyword cluster.
    alternates: buildAlternates(locale, PATH),
  };
}

// Sourcing-intent FAQ (visible content mirrors the FAQPage schema 1:1).
function faqItems(isZh: boolean) {
  return isZh
    ? [
        { q: "定制毛绒玩具的最小起订量（MOQ）是多少？", a: "标准 MOQ 为每款 500 件，新客户首单可低至 200 件/款。具体可根据尺寸与工艺协商。" },
        { q: "打样需要多久？", a: "打样周期通常为 7-15 个工作日，含面料采购、打版、缝制与首检。简单改款最快 5 天。" },
        { q: "可以根据图纸或参考图生产吗？", a: "可以。我们接受设计稿、参考照片、手绘草图甚至口头描述，由 50+ 人设计团队转化为可生产的版型与 3D 效果图。" },
        { q: "支持贴牌（Private Label）包装吗？", a: "支持。吊牌、织唛、彩盒、OPP 袋、购物袋均可按品牌要求定制设计与生产。" },
        { q: "你们有哪些认证？", a: "工厂持有 BSCI、ISO 9001；产品符合 ASTM F963（美国）、EN 71（欧盟）、CE、GB 6675（中国）玩具安全标准，可提供第三方检测报告。" },
        { q: "可以国际发货吗？", a: "可以。支持 FOB/CIF/DDP，协助出口报关、产地证与货运，已出口 70+ 国家。" },
        { q: "如何控制产品质量？", a: "5 道质检（来料/裁片/制程/成品 100% 全检/出货前抽检），每单附带带照片的检验报告。" },
      ]
    : [
        { q: "What is your MOQ for custom plush toys?", a: "Standard MOQ is 500 pcs per style; first trial orders for new customers start at 200 pcs per style, negotiable by size and complexity." },
        { q: "How long does sampling take?", a: "Sampling typically takes 7-15 working days including fabric sourcing, pattern making, sewing, and first-round QC. Simple modifications can be as fast as 5 days." },
        { q: "Can you produce plush toys based on drawings or reference images?", a: "Yes. We accept design files, reference photos, hand sketches, or even verbal briefs; our 50+ in-house design team turns them into production-ready patterns and 3D renderings." },
        { q: "Do you support private label packaging?", a: "Yes. Hang tags, woven labels, color boxes, poly bags, and shopping bags are all custom-designed and produced to your brand requirements." },
        { q: "What certifications do you have?", a: "The factory holds BSCI and ISO 9001; products comply with ASTM F963 (US), EN 71 (EU), CE, and GB 6675 (China). Third-party test reports are available." },
        { q: "Can you ship internationally?", a: "Yes. We support FOB/CIF/DDP, handle export documentation, certificates of origin, and freight, and have shipped to 70+ countries." },
        { q: "How do you control product quality?", a: "Five-stage QC (incoming material, cutting, in-process, 100% final inspection, pre-shipment audit), with a photo inspection report per order." },
      ];
}

function JsonLd({ locale, isZh }: { locale: string; isZh: boolean }) {
  const url = `${SITE.url}/${locale}${PATH}`;
  const faqs = faqItems(isZh);
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: isZh
          ? "毛绒玩具定制工厂 | 爱儿采 LovelyJoy"
          : "Custom Plush Toy Manufacturer in China",
        isPartOf: { "@id": `${SITE.url}/#website` },
        about: { "@id": ORG_ID },
        inLanguage: locale === "zh" ? "zh-Hans" : locale,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: isZh ? "首页" : "Home", item: `${SITE.url}/${locale}/` },
          { "@type": "ListItem", position: 2, name: isZh ? "毛绒玩具定制工厂" : "Custom Plush Toy Manufacturer", item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
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

const INTERNAL_LINKS = [
  { href: "/factory-capability", en: "Factory & Capability", zh: "工厂实力" },
  { href: "/oem-odm", en: "OEM / ODM Services", zh: "OEM/ODM 服务" },
  { href: "/products", en: "Product Catalog", zh: "产品目录" },
  { href: "/cases", en: "Case Studies", zh: "客户案例" },
  { href: "/faq", en: "Sourcing FAQ", zh: "采购常见问题" },
  { href: "/contact", en: "Request a Quote", zh: "获取报价" },
];

export default async function OemPlushManufacturerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale === "zh";
  const nav = await getTranslations({ locale, namespace: "nav" });
  const faqs = faqItems(isZh);

  const capabilities = [
    { icon: PenTool, title: isZh ? "OEM 来图定制" : "OEM (Your Design)", desc: isZh ? "按您的设计稿、技术包与材料规格精准生产，IP 完全归属您方。" : "Production to your exact artwork, tech pack, and material specs — full IP ownership stays with you." },
    { icon: Boxes, title: isZh ? "ODM 设计开发" : "ODM (Our Design)", desc: isZh ? "50+ 人设计团队从概念到 3D 效果图，缩短开发周期。" : "Our 50+ designer team takes you from concept to 3D rendering, shortening development." },
    { icon: Package, title: isZh ? "贴牌与包装" : "Private Label & Packaging", desc: isZh ? "吊牌、织唛、彩盒、礼盒全程内制，统一品牌规范。" : "Hang tags, woven labels, color boxes and gift packaging produced in-house to brand spec." },
    { icon: ShieldCheck, title: isZh ? "认证与合规" : "Certification & Compliance", desc: isZh ? "BSCI / ISO 9001 工厂，产品满足 ASTM F963 / EN 71 / CE / GB 6675。" : "BSCI / ISO 9001 factory; products meet ASTM F963 / EN 71 / CE / GB 6675." },
    { icon: Factory, title: isZh ? "规模化产能" : "Scaled Capacity", desc: isZh ? "20,000㎡ 厂房、300+ 工人、月产 80 万件+，承接大货稳定交付。" : "20,000 sqm, 300+ workers, 800K+ pcs/month for stable large-order delivery." },
    { icon: Truck, title: isZh ? "出口物流" : "Export Logistics", desc: isZh ? "FOB/CIF/DDP，报关、产地证、货代一站式，出口 70+ 国家。" : "FOB/CIF/DDP with customs, certificates of origin and freight — shipping to 70+ countries." },
  ];

  const productTypes = isZh
    ? ["毛绒玩具", "毛绒公仔/动物", "吉祥物公仔", "促销毛绒", "婴童毛绒", "节庆毛绒", "IP 授权毛绒"]
    : ["Plush toys", "Stuffed animals", "Mascot dolls", "Promotional plush", "Baby plush", "Festival plush", "IP / licensed plush"];

  const processSteps = isZh
    ? ["设计简报", "打样原型", "样品确认", "材料采购", "批量生产", "质检 (5 道)", "出口发货"]
    : ["Design brief", "Prototype", "Sample approval", "Material sourcing", "Mass production", "QC (5 stages)", "Export shipping"];

  return (
    <>
      <JsonLd locale={locale} isZh={isZh} />

      {/* Hero with above-the-fold RFQ CTA */}
      <section className="bg-gradient-to-br from-sky-brand to-sky-brand-dark py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold text-white md:text-5xl">
              {isZh ? "义乌毛绒玩具定制工厂（OEM/ODM）" : "Custom Plush Toy Manufacturer in China"}
            </h1>
            <p className="mt-4 text-base text-white/85 md:text-lg">
              {isZh
                ? "义乌源头工厂 · OEM/ODM 一站式 · 服务全球批发商、进口商、礼品品牌与零售商"
                : "Yiwu factory-direct · One-stop OEM/ODM · For wholesalers, importers, gift brands & retailers"}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/contact" variant="secondary" size="lg">
                {isZh ? "申请样品 / 报价 (RFQ)" : "Request a Sample / Quote (RFQ)"}
              </Button>
              <Button href="/products" variant="outline" size="lg">
                {isZh ? "查看产品" : "View Products"}
              </Button>
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
            { label: isZh ? "毛绒玩具定制工厂" : "Custom Plush Toy Manufacturer" },
          ]}
        />
      </Container>

      {/* 130-170 word SSR intro paragraph (citable) */}
      <section className="py-12 md:py-16 bg-white">
        <Container>
          <div className="mx-auto max-w-3xl text-base leading-relaxed text-brown/80">
            {isZh ? (
              <p>
                爱儿采 LovelyJoy 是位于<strong>中国浙江义乌</strong>的<strong>毛绒玩具 OEM/ODM 源头工厂</strong>，
                成立于 2003 年，拥有 20,000㎡ 自有厂房、300+ 熟练工人与 50+ 人设计团队，月产能 80 万件以上，
                产品出口 70+ 国家。我们为<strong>国际批发商、进口商、礼品与品牌方、零售连锁及采购经理</strong>
                提供从设计、打样、材料采购到大货生产、质检与出口的一站式定制服务，覆盖毛绒玩具、定制公仔与毛绒动物、
                企业吉祥物、促销毛绒、婴童毛绒、节庆毛绒以及 IP 授权毛绒等品类。标准起订量为每款 500 件
                （首单可低至 200 件），打样 7-15 天、大货 30-45 天。工厂通过 BSCI 与 ISO 9001 认证，
                产品满足 ASTM F963、EN 71、CE 与 GB 6675 玩具安全标准。
                {" "}
                <Link href="/contact" className="font-semibold text-sky-brand underline">立即提交需求获取样品与报价。</Link>
              </p>
            ) : (
              <p>
                LovelyJoy is a Yiwu, China-based <strong>OEM/ODM plush toy manufacturer</strong> founded in 2003,
                operating a 20,000 sqm in-house factory with 300+ skilled workers and a 50+ person design team,
                an output capacity above 800,000 pieces per month, and exports to 70+ countries. We serve
                <strong> international wholesalers, importers, gift brands, retailers, and sourcing managers</strong>{" "}
                with one-stop production — design, sampling, material sourcing, mass production, quality control,
                and export — across custom stuffed animals, plush toys, mascot dolls, promotional plush, baby plush,
                festival plush, and licensed IP plush. The standard MOQ is 500 pcs per style (trial orders from
                200 pcs), with 7-15 day sampling and 30-45 day production lead times. The factory is BSCI and
                ISO 9001 certified, and products meet ASTM F963, EN 71, CE, and GB 6675 toy-safety standards.{" "}
                <Link href="/contact" className="font-semibold text-sky-brand underline">Send your brief to request samples and a quote.</Link>
              </p>
            )}
          </div>
        </Container>
      </section>

      {/* 1. Sourcing Essentials table (reuses the homepage band) */}
      <SourcingEssentials locale={locale} />

      {/* 2. OEM/ODM capabilities */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "OEM/ODM 毛绒玩具制造能力" : "OEM/ODM Plush Toy Manufacturing Capabilities"}
            subtitle={isZh ? "从设计到出口的一站式工厂服务" : "One-stop factory service from design to export"}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((c) => (
              <div key={c.title} className="rounded-2xl border border-brown/10 bg-white p-6 transition-all duration-300 hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-brand/10">
                  <c.icon className="h-6 w-6 text-sky-brand" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-brown">{c.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brown/70">{c.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 3. Product categories */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading title={isZh ? "可定制的毛绒产品品类" : "Plush Product Categories We Customize"} />
          <div className="mx-auto max-w-3xl flex flex-wrap justify-center gap-3">
            {productTypes.map((p) => (
              <span key={p} className="rounded-full bg-white px-5 py-2 text-sm font-medium text-brown shadow-sm">{p}</span>
            ))}
          </div>
        </Container>
      </section>

      {/* 4. Customization process */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading title={isZh ? "毛绒玩具定制流程" : "Plush Toy Customization Process"} subtitle={isZh ? "7 步透明可追踪" : "A transparent, trackable 7-step path"} />
          <div className="mx-auto max-w-4xl flex flex-wrap items-center justify-center gap-2 text-sm">
            {processSteps.map((s, i) => (
              <span key={s} className="flex items-center gap-2">
                <span className="rounded-lg bg-bg-sky px-4 py-2 font-medium text-brown">{i + 1}. {s}</span>
                {i < processSteps.length - 1 && <ArrowRight className="h-4 w-4 text-sky-brand/60" />}
              </span>
            ))}
          </div>
        </Container>
      </section>

      {/* 5 + 6. Factory capability + Quality/compliance (certification module) */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading title={isZh ? "质量控制与认证合规" : "Quality Control & Compliance"} subtitle={isZh ? "可核验的认证，而非仅展示 Logo" : "Verifiable certifications, not just logos"} />
          <CertificationVerification locale={locale} />
        </Container>
      </section>

      {/* 7. Case studies preview */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <SectionHeading title={isZh ? "客户合作案例" : "Buyer Case Studies"} />
            <p className="text-brown/70">
              {isZh
                ? "查看我们为北美礼品品牌、跨境电商卖家与零售连锁完成的贴牌与 IP 毛绒项目。"
                : "See private-label and licensed-IP plush programs we've delivered for North American gift brands, cross-border sellers, and retail chains."}
            </p>
            <div className="mt-6">
              <Button href="/cases" variant="primary" size="lg">{isZh ? "查看全部案例" : "View All Case Studies"}</Button>
            </div>
          </div>
        </Container>
      </section>

      {/* 8. FAQ (visible, mirrors FAQPage schema) */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading title={isZh ? "采购常见问题" : "Sourcing FAQ"} />
          <div className="mx-auto max-w-3xl space-y-4">
            {faqs.map((f) => (
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
            <h2 className="text-3xl font-bold text-white md:text-4xl">{isZh ? "开始您的毛绒玩具定制项目" : "Start Your Custom Plush Project"}</h2>
            <p className="mt-4 text-lg text-white/80">{isZh ? "提交设计或需求，工厂团队 24 小时内回复。" : "Share your brief — our factory team responds within 24 hours."}</p>
            <div className="mt-8">
              <Button href="/contact" variant="secondary" size="lg">{isZh ? "提交 RFQ" : "Send RFQ"}</Button>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/80">
              {INTERNAL_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="underline hover:text-white">
                  {isZh ? l.zh : l.en}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
