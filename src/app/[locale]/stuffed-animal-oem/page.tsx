import { buildAlternates } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import {
  Tag,
  Layers,
  ClipboardList,
  Package,
  Shield,
  Repeat,
  Truck,
  CheckCircle,
  Pencil,
} from "lucide-react";

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
    // Kept in the "stuffed animal" keyword family (2026-07 cannibalization
    // audit): title drops the generic "plush toy factory" phrase so it stops
    // competing with /oem-plush-manufacturer and /plush-toy-manufacturer.
    title: isZh
      ? "Stuffed Animal OEM 制造厂家 - 私贴牌毛绒动物玩具生产 | 爱儿采 LovelyJoy"
      : "OEM Stuffed Animal Manufacturer | Private Label Stuffed Animals | LovelyJoy",
    description: isZh
      ? "爱儿采为全球品牌提供 OEM 毛绒动物玩具贴牌生产：来图来样、品牌吊牌、定制包装、出口合规、稳定补货。起订量按尺寸分档（800–3,600 件/款），BSCI/ISO/EN71/ASTM F963 认证。"
      : "LovelyJoy is an OEM stuffed animal manufacturer for global brands: artwork-to-sample, private-label tags, custom packaging, export compliance, and reorder consistency. Size-tiered MOQs (800–3,600 pcs by size), BSCI/ISO/EN71/ASTM F963 certified.",
    alternates: buildAlternates(locale, "/stuffed-animal-oem"),
  };
}

function FaqJsonLd({ isZh }: { isZh: boolean }) {
  const faqs = isZh
    ? [
        { q: "你们能做私贴牌（Private Label）毛绒玩具生产吗？", a: "可以。我们专做品牌方的私贴牌 OEM——成品全部贴你的品牌吊牌、织标、包装，没有任何工厂自有标识。客户有完整的品牌所有权，我们仅作为生产方出现。" },
        { q: "我可以发自己的设计文件吗？支持哪些格式？", a: "支持。AI/PSD/PDF/PNG/JPG 都可，也接受手绘扫描或参考样品实物。我们打版团队会基于你的设计文件输出生产版型，并在 3 天内回报技术可行性与建议优化。" },
        { q: "你们支持品牌吊牌、织标和包装定制吗？", a: "全部支持。可定制：纸质吊牌（含烫金/凹凸/UV）、织标（缝入式/可拆式）、OPP 自封袋（透明/磨砂/印品牌）、彩盒、礼盒、手提袋。设计稿由你方提供，或由我们设计团队按 VI 规范出图。" },
        { q: "平均量产周期是多久？", a: "样品确认后标准量产 30-45 天，订单量大或工艺复杂可能延长 5-10 天。加急订单可压缩至 20-25 天（加急费 10-15%）。每批订单含 100% 出货前全检与照片报告。" },
        { q: "补货订单（reorder）能保证质量一致吗？", a: "可以。我们保留每个客户项目的完整生产档案：版型、面料批次记录、Pantone 色号、辅料供应商清单。补货订单按原档案生产，关键工序由原班组负责，确保和首单一致。客户复购率长期保持 85%+。" },
        { q: "出口合规支持哪些标准？", a: "我们按具体产品、目标年龄和目的国匹配 EN 71/CE（欧盟）、ASTM F963/CPSIA（美国）、GB 6675（中国）及 CCPSA（加拿大）等适用要求。第三方测试报告、工厂审核和质量体系文件可向合格买家提供，并在下单前确认适用范围与有效性。" },
      ]
    : [
        { q: "Can you manufacture private label stuffed animals?", a: "Yes — private-label OEM is our specialty. Finished products carry your brand's hang tags, woven labels, and packaging exclusively. No factory branding appears anywhere. You retain full brand ownership; we appear only as the manufacturer of record." },
        { q: "Can I send my own design files? Which formats?", a: "Yes. We accept AI, PSD, PDF, PNG, JPG, plus scanned hand sketches or physical reference samples. Our patterning team converts your design into production-ready patterns and returns a feasibility note with optimization suggestions within 3 working days." },
        { q: "Do you support branded tags, woven labels, and custom packaging?", a: "Fully supported. Available: paper hang tags (foil-stamping, embossing, UV), woven labels (sewn-in or removable), poly bags (clear, frosted, brand-printed), color boxes, gift boxes, and shopping bags. Provide your artwork or let our design team produce it from your VI guidelines." },
        { q: "What's the average production lead time?", a: "Standard bulk runs 30-45 days after sample approval; large or complex orders may add 5-10 days. Rush production at 20-25 days is available with a 10-15% rush fee. Every batch includes 100% pre-shipment inspection plus a photo report." },
        { q: "Can you maintain quality consistency on reorders?", a: "Yes. We keep a complete production dossier per customer project: patterns, fabric batch records, Pantone codes, accessory supplier lists. Reorders use the original dossier and the same production line for key processes, matching the first run. Our reorder rate sits consistently above 85%." },
        { q: "What export compliance standards do you support?", a: "Requirements are matched to the product, target age and destination market, including EN 71/CE (EU), ASTM F963/CPSIA (US), GB 6675 (China) and CCPSA (Canada) where applicable. Third-party test, factory-audit and quality-system records can be supplied to qualified buyers, with scope and validity confirmed before ordering." },
      ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default async function StuffedAnimalOemPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const nav = await getTranslations({ locale, namespace: "nav" });

  const services = isZh
    ? [
        { icon: Tag, t: "私贴牌生产 (Private Label)", d: "100% 客户品牌——吊牌、织标、包装无任何工厂标识" },
        { icon: ClipboardList, t: "Artwork → Sample 全流程", d: "你出设计文件，我们 7-15 天内出实物样品" },
        { icon: Pencil, t: "技术可行性反馈", d: "3 天内回报版型可行性与优化建议，避免量产失真" },
        { icon: Package, t: "定制吊牌/织标/包装", d: "纸质 + 织物 + 包装一体设计，按 VI 规范执行" },
        { icon: Shield, t: "出口合规与认证", d: "EN71/ASTM F963/CE/CCPSA，附第三方检测报告" },
        { icon: Repeat, t: "补货一致性保障", d: "保留生产档案，原班组生产，复购率 85%+" },
      ]
    : [
        { icon: Tag, t: "Private Label Manufacturing", d: "100% your brand — tags, labels, and packaging carry no factory branding." },
        { icon: ClipboardList, t: "Artwork-to-Sample Workflow", d: "Send design files, we deliver physical samples in 7-15 days." },
        { icon: Pencil, t: "Technical Feasibility Review", d: "3-day feedback on patterning feasibility and optimization to avoid production drift." },
        { icon: Package, t: "Custom Tags / Labels / Packaging", d: "Paper, woven, and packaging designed as one — executed to your VI standards." },
        { icon: Shield, t: "Export Compliance & Certification", d: "EN71, ASTM F963, CE, CCPSA — with third-party test reports per market." },
        { icon: Repeat, t: "Reorder Consistency", d: "Production dossiers preserved; same line on reorders. 85%+ customer retention." },
      ];

  const idealFor = isZh
    ? [
        { t: "Amazon FBA / DTC 卖家", d: "需要私贴牌、稳定补货、合规清关的跨境品牌" },
        { t: "Specialty retail brands", d: "百货、玩具连锁、礼品店的自有品牌 (PB) 项目" },
        { t: "Brand merchandise programs", d: "企业周边、IP 衍生品、联名款生产" },
        { t: "Promotional / corporate gift companies", d: "节庆、活动、会员专属的批量礼品" },
        { t: "Distributors / wholesalers", d: "需要可靠源头工厂稳定供应的进口商" },
        { t: "Subscription box brands", d: "月度订阅盒里的高品质毛绒 SKU" },
      ]
    : [
        { t: "Amazon FBA & DTC sellers", d: "Cross-border brands needing private-label, reliable reorders, and clean compliance." },
        { t: "Specialty retail brands", d: "Department-store, toy-chain, and gift-shop private-label (PB) programs." },
        { t: "Brand merchandise programs", d: "Corporate merch, IP derivatives, and collab editions." },
        { t: "Promotional & corporate gift companies", d: "Bulk holiday, event, and member-exclusive gifts." },
        { t: "Distributors & wholesalers", d: "Importers needing a reliable source factory for stable supply." },
        { t: "Subscription box brands", d: "Premium plush SKUs for monthly subscription drops." },
      ];

  const workflow = [
    { num: "01", t: isZh ? "Brief & 报价" : "Brief & Quote", d: isZh ? "提供产品类别、目标售价、预期 MOQ。24h 内出报价 + 面料方案。" : "Share category, target retail price, expected MOQ. Quote + fabric plan within 24h." },
    { num: "02", t: isZh ? "Artwork → Pattern" : "Artwork → Pattern", d: isZh ? "上传设计文件，3 天反馈技术可行性，必要时优化结构。" : "Upload design files, 3-day feasibility feedback, structural optimization where needed." },
    { num: "03", t: isZh ? "首样制作 (7-15 天)" : "First Sample (7-15 days)", d: isZh ? "实物样品 + 面料色卡 + 吊牌打样寄出，便于品牌方决策。" : "Physical sample + fabric swatches + tag proofs shipped for review." },
    { num: "04", t: isZh ? "样品修改与签字" : "Revisions & Sign-off", d: isZh ? "5-7 天内出修改样，签字版作为产前金样固化。" : "Revisions in 5-7 days; signed sample becomes the pre-production gold standard." },
    { num: "05", t: isZh ? "量产 + 周报" : "Bulk + Weekly Updates", d: isZh ? "30% 定金启动大货，每周进度+照片，30-45 天完成。" : "30% deposit kicks off bulk; weekly progress + photos; completed in 30-45 days." },
    { num: "06", t: isZh ? "QC + 出货" : "QC + Ship", d: isZh ? "100% 出货前全检、照片报告、第三方 QC 可选；FOB/CIF/DDP 全支持。" : "100% pre-shipment inspection, photo report, optional 3rd-party QC; FOB/CIF/DDP supported." },
  ];

  return (
    <>
      <FaqJsonLd isZh={isZh} />

      <section className="bg-gradient-to-br from-sky-brand to-sky-brand-dark py-20 md:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold text-white md:text-5xl">
              {isZh
                ? "OEM Stuffed Animal Manufacturer ｜私贴牌毛绒玩具生产"
                : "OEM Stuffed Animal Manufacturer for Private Label & Custom Production"}
            </h1>
            <p className="mt-4 text-lg text-white/85 md:text-xl">
              {isZh
                ? "你的品牌、你的设计、你的包装——我们 100% 私贴牌生产，符合欧美出口合规标准。"
                : "Your brand, your design, your packaging — produced 100% under private label, compliant with US/EU export standards."}
            </p>
          </div>
        </Container>
      </section>

      <Container>
        <Breadcrumb
          locale={locale}
          items={[
            { label: nav("home"), href: "/" },
            { label: isZh ? "Stuffed Animal OEM" : "Stuffed Animal OEM" },
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

      {/* Service Pillars */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "OEM 毛绒动物玩具生产服务包含什么" : "What Our OEM Stuffed Animal Service Includes"}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.t} className="rounded-2xl border border-brown/10 bg-white p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-brand/10">
                  <s.icon className="h-6 w-6 text-sky-brand" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-brown">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brown-light">{s.d}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Ideal For */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading
            title={isZh ? "适合哪些客户" : "Who Our OEM Service Is For"}
          />
          <div className="mx-auto max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-5">
            {idealFor.map((c) => (
              <div key={c.t} className="rounded-2xl bg-white p-5">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-sky-brand" />
                  <h3 className="font-bold text-brown">{c.t}</h3>
                </div>
                <p className="mt-2 text-sm text-brown-light">{c.d}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Workflow */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "从 Artwork 到 Bulk Production 的工作流" : "From Artwork to Bulk Production"}
            subtitle={isZh ? "标准化 6 步流程，每步可追溯" : "A standardized 6-step workflow — every step traceable"}
          />
          <div className="mx-auto max-w-3xl space-y-4">
            {workflow.map((s) => (
              <div key={s.num} className="flex gap-5 rounded-xl bg-bg-warm p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-brand text-white font-bold">{s.num}</div>
                <div>
                  <h3 className="text-lg font-bold text-brown">{s.t}</h3>
                  <p className="mt-1 text-sm text-brown-light">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Tags / Labels / Packaging detail */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading
            title={isZh ? "可定制吊牌、织标与包装" : "Tags, Labels & Packaging Options"}
          />
          <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
            {(isZh
              ? [
                  { icon: Tag, t: "吊牌 (Hang Tags)", items: ["铜版纸/白卡/牛皮纸", "烫金/凹凸/UV/局部覆膜", "双面 CMYK 印刷或专色", "棉绳/塑料扣/挂枪打孔"] },
                  { icon: Layers, t: "织标 (Woven Labels)", items: ["主标 (Main Label) 缝入颈后", "尺码标/洗水标", "织唛 (Damask) 或印唛", "环保牛奶丝或棉质"] },
                  { icon: Package, t: "包装 (Packaging)", items: ["OPP 袋（透明/磨砂/印品牌）", "白卡彩盒 / 瓦楞礼盒", "烫金高端礼盒 + 内衬", "外箱（双瓦/五层瓦楞）"] },
                ]
              : [
                  { icon: Tag, t: "Hang Tags", items: ["Coated, white, or kraft paper", "Foil, emboss, UV, spot-coat finishes", "Double-sided CMYK or spot color", "Cotton string, plastic loop, or tag-gun"] },
                  { icon: Layers, t: "Woven Labels", items: ["Main label sewn at neck", "Size labels, care labels", "Damask weave or printed labels", "Eco milk-fiber or cotton"] },
                  { icon: Package, t: "Packaging", items: ["Poly bags (clear, frosted, branded print)", "White card color box or corrugated gift box", "Premium foil gift box with insert", "Outer cartons (double or 5-ply corrugated)"] },
                ]
            ).map((g) => (
              <div key={g.t} className="rounded-2xl bg-white p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-brand/10">
                    <g.icon className="h-5 w-5 text-sky-brand" />
                  </div>
                  <h3 className="text-lg font-bold text-brown">{g.t}</h3>
                </div>
                <ul className="mt-4 space-y-2">
                  {g.items.map((i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-brown-light">
                      <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-sky-brand" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* MOQ + Lead Time + Compliance */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "MOQ、交期与出口合规" : "MOQ, Lead Time & Export Compliance"}
          />
          <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-brown/10 p-6">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-sky-brand" />
                <h3 className="text-lg font-bold text-brown">MOQ</h3>
              </div>
              <p className="mt-3 text-3xl font-bold text-sky-brand">800–3,600<span className="text-base font-normal text-brown-light"> {isZh ? "件 / 款" : "pcs / style"}</span></p>
              <p className="mt-2 text-sm text-brown-light">{isZh ? "<20cm 3,600 · 20–35cm 2,400 · 35–50cm 1,200 · >50cm 800 件" : "<20cm 3,600 · 20–35cm 2,400 · 35–50cm 1,200 · >50cm 800 pcs"}</p>
            </div>
            <div className="rounded-2xl border border-brown/10 p-6">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-sky-brand" />
                <h3 className="text-lg font-bold text-brown">{isZh ? "交期" : "Lead Time"}</h3>
              </div>
              <p className="mt-3 text-3xl font-bold text-sky-brand">30-45 <span className="text-base font-normal text-brown-light">{isZh ? "天大货" : "days bulk"}</span></p>
              <p className="mt-2 text-sm text-brown-light">{isZh ? "样品 7-15 天 + 修改样 5-7 天 + 加急可压缩 30%" : "Sample 7-15 + revision 5-7 + rush -30%"}</p>
            </div>
            <div className="rounded-2xl border border-brown/10 p-6">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-sky-brand" />
                <h3 className="text-lg font-bold text-brown">{isZh ? "出口合规" : "Export Compliance"}</h3>
              </div>
              <p className="mt-3 text-sm text-brown-light">EN 71 · ASTM F963 · CE · CCPSA · GB 6675 · BSCI · ISO 9001</p>
              <p className="mt-2 text-sm text-brown-light">{isZh ? "第三方检测：SGS / Intertek / BV" : "3rd-party testing: SGS / Intertek / BV"}</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-br from-sky-brand to-sky-brand-dark">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              {isZh ? "Ready to ship your brand under your label?" : "Ready to Ship Your Brand Under Your Own Label?"}
            </h2>
            <p className="mt-4 text-lg text-white/80">
              {isZh
                ? "把你的设计文件或参考样品发给我们，24 小时内回报报价、面料方案与样品时间。"
                : "Send us your design files or a reference sample — quote, fabric plan, and sample timeline in 24 hours."}
            </p>
            <div className="mt-8">
              <Button href="/contact" variant="secondary" size="lg">
                {isZh ? "Start Your OEM Project" : "Start Your OEM Project"}
              </Button>
            </div>
            <p className="mt-4 text-sm text-white/60">
              Email: info@lovelyjoytoy.com · WhatsApp: +1 (626) 586 7567
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
