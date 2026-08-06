import { buildAlternates } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import SectionHeading from "@/components/ui/SectionHeading";
import OemOdmTimeline from "@/components/oem-odm/OemOdmTimeline";
import OemOdmCTA from "@/components/oem-odm/OemOdmCTA";
import { Link } from "@/i18n/navigation";
import {
  Layers,
  Pencil,
  Users,
  Shield,
  Clock,
  Package,
  Factory,
  CheckCircle,
  AlertTriangle,
  Award,
} from "lucide-react";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "oemOdm.metadata" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates(locale, "/oem-odm"),
  };
}

function FaqJsonLd({ isZh }: { isZh: boolean }) {
  const faqs = isZh
    ? [
        { q: "OEM 和 ODM 有什么区别？", a: "OEM（Original Equipment Manufacturer）= 客户提供完整设计稿，工厂按图生产。ODM（Original Design Manufacturer）= 客户提供需求或概念，工厂参与从设计到量产的全过程。两者本质区别在于谁负责设计：OEM 适合已有产品的品牌做扩量，ODM 适合品牌没有玩具开发能力但想推出毛绒新品。" },
        { q: "我没有设计稿能做 ODM 吗？", a: "可以。我们 50+ 设计师团队接受多种输入：手绘草图、参考图、文字描述、Logo 或品牌 VI、甚至口头创意。常见 ODM 流程：客户提需求 → 我们出 3D 渲染图 → 确认结构方案 → 打样 → 修改 → 量产。整个 ODM 设计阶段对达到 MOQ 的客户免费。" },
        { q: "OEM/ODM 项目的 MOQ 是多少？", a: "OEM 与 ODM 的起订量均按尺寸分档：20cm 以下 3,600 件，20–35cm 2,400 件，35–50cm 1,200 件，50cm 以上 800 件（均为每款），下单前公开透明。" },
        { q: "打样和量产周期？", a: "OEM：打样 7-15 天，大货 30-45 天。ODM：3D 设计 3-5 天 + 首样 10-15 天 + 修改样 5-7 天 + 大货 30-45 天。加急可压缩约 30%。" },
        { q: "你们支持哪些安全与质量认证？", a: "国际认证：BSCI（社会责任）、ISO 9001（质量管理）、EN 71（欧盟玩具安全）、ASTM F963（美国 CPSC）、CE（欧盟合规）、GB 6675（中国）。我们可提供原件扫描和第三方测试报告用于清关与渠道入库。" },
        { q: "为什么选工贸一体的工厂而不是贸易商？", a: "贸易商不掌握生产，质量和交期完全依赖外发，出问题难追溯。工贸一体的厂家（如爱儿采）：（1）报价更透明，没有中间加价；（2）打样速度快 30-40%；（3）大货生产可见可控，每周进度更新；（4）质量问题可现场返工，不像贸易商需要协调多方。长期合作角度，工贸一体是更安全的选择。" },
        { q: "可以签 NDA 保密协议吗？", a: "可以。客户的设计稿、产品规划、市场策略等信息我们严格保密。可签订双边 NDA，覆盖打样、生产、包装、出货全过程。授权 IP 项目我们也熟悉品牌方的 confidentiality 要求。" },
        { q: "出货后如果有质量问题怎么处理？", a: "出货前 100% 全检 + 第三方 QC 报告（可选）双重把关，质量问题率长期低于 1%。如果出现批次问题，我们承担返工或重新生产，并承担相应运输与赔偿成本。重大事故有产品责任险覆盖。" },
      ]
    : [
        { q: "What's the difference between OEM and ODM?", a: "OEM (Original Equipment Manufacturer) = you provide complete design files, the factory produces to spec. ODM (Original Design Manufacturer) = you provide a brief or concept, the factory participates in the full design-to-production process. The core distinction is who owns the design — OEM suits brands scaling existing products; ODM suits brands without in-house plush development capability." },
        { q: "Can I do ODM without a design file?", a: "Yes. Our 50+ designer team accepts: hand sketches, reference photos, written briefs, your logo or brand VI, even verbal ideas. Typical ODM flow: brief → 3D rendering → structure approval → sample → revisions → mass production. ODM design is free for orders above MOQ." },
        { q: "What's the MOQ for OEM/ODM?", a: "MOQ is size-tiered for both OEM and ODM: 3,600 pcs for plush under 20 cm, 2,400 pcs for 20–35 cm, 1,200 pcs for 35–50 cm, and 800 pcs for plush over 50 cm — per design, published upfront." },
        { q: "What are the sample and production lead times?", a: "OEM: sample 7-15 days, bulk 30-45 days. ODM: 3D design 3-5 days + first sample 10-15 days + revisions 5-7 days + bulk 30-45 days. Rush can compress timelines by ~30%." },
        { q: "What safety and quality certifications do you hold?", a: "International: BSCI (social compliance), ISO 9001 (quality management), EN 71 (EU toy safety), ASTM F963 (US CPSC), CE (EU compliance), GB 6675 (China). We provide original scans and third-party test reports for customs clearance and retail onboarding." },
        { q: "Why pick a factory-direct manufacturer over a trading company?", a: "Trading companies don't control production — quality and timing depend on subcontractors with poor traceability. A factory-direct manufacturer like LovelyJoy gives you: (1) transparent pricing with no middleman markup; (2) sampling 30-40% faster; (3) visible, controllable bulk production with weekly updates; (4) on-site rework when issues arise. For long-term partnerships, factory-direct is safer." },
        { q: "Can you sign an NDA?", a: "Yes. Your designs, product roadmap, and market strategy are kept strictly confidential. We sign mutual NDAs covering sampling, production, packaging, and shipping. We're also familiar with licensor confidentiality requirements for IP projects." },
        { q: "What happens if there's a quality issue after shipment?", a: "Pre-shipment 100% inspection plus optional third-party QC keeps our defect rate consistently below 1%. If a batch issue occurs, we cover rework or re-production, plus shipping and compensation costs. Major incidents are covered by product liability insurance." },
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

export default async function OemOdmPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const t = await getTranslations("oemOdm");
  const nav = await getTranslations("nav");

  const oemVsOdm = isZh
    ? [
        {
          tag: "OEM",
          title: "客户出设计 · 工厂出生产",
          when: "适合已有成熟设计或参考样品的品牌",
          give: ["完整设计稿 / 版型 / Pantone 色号", "包装与吊牌设计文件", "数量与目标交期"],
          get: ["按图打样、量产、包装、出货", "工厂级 QC + 出口合规", "30% 定金 / 70% 尾款标准付款条款"],
        },
        {
          tag: "ODM",
          title: "客户出概念 · 工厂出设计 + 生产",
          when: "适合没有玩具设计能力、但有产品定位的品牌",
          give: ["创意 brief / 参考图 / 品牌 VI", "目标售价区间与定位", "包装与品牌期望"],
          get: ["3D 设计 + 结构开发 + 打样", "面料与工艺方案推荐", "符合 MOQ 的 ODM 设计费免费"],
        },
      ]
    : [
        {
          tag: "OEM",
          title: "You design · We manufacture",
          when: "For brands with existing designs or reference samples",
          give: ["Complete artwork / patterns / Pantone codes", "Packaging and tag design files", "Quantity and target deadline"],
          get: ["Sampling, production, packaging, shipping to spec", "Factory-grade QC + export compliance", "30% deposit / 70% balance — standard terms"],
        },
        {
          tag: "ODM",
          title: "You bring the concept · We design and manufacture",
          when: "For brands without in-house toy design but with clear positioning",
          give: ["Creative brief / references / brand VI", "Target retail price range and positioning", "Packaging and brand expectations"],
          get: ["3D design + structural development + samples", "Fabric and craft recommendations", "ODM design free for orders above MOQ"],
        },
      ];

  const targetClients = isZh
    ? [
        { icon: Package, t: "品牌方", d: "自有品牌的 OEM 量产或 ODM 新品开发" },
        { icon: Users, t: "礼品 / 活动公司", d: "活动赠品、节庆礼盒、企业团建定制" },
        { icon: Layers, t: "跨境电商 / DTC 卖家", d: "Amazon/Shopify/独立站 SKU 开发与补货" },
        { icon: Shield, t: "IP 授权方与联名品牌", d: "需要认证工厂按授权方品控生产" },
        { icon: Award, t: "连锁渠道与零售集团", d: "季节性 SKU、节庆限定、年度 PB 定制" },
        { icon: Factory, t: "贸易商 / 进口商", d: "需要稳定供应链的海外采购合作伙伴" },
      ]
    : [
        { icon: Package, t: "Brand owners", d: "OEM scale-up or ODM new-product development for own labels." },
        { icon: Users, t: "Gift & event companies", d: "Promotional gifts, holiday gift boxes, corporate team-building." },
        { icon: Layers, t: "Cross-border e-commerce & DTC", d: "Amazon, Shopify, DTC SKU development and replenishment." },
        { icon: Shield, t: "IP licensors & collab brands", d: "Certified factory required to meet licensor QC standards." },
        { icon: Award, t: "Retail chains & PB programs", d: "Seasonal SKUs, holiday limiteds, annual private-label runs." },
        { icon: Factory, t: "Trading companies & importers", d: "Reliable supply-chain partner for overseas sourcing." },
      ];

  const materialsCrafts = isZh
    ? {
        materials: ["水晶超柔 (Crystal Super-soft)", "短毛绒 (Short Plush)", "天鹅绒 (Velboa)", "Minky", "雪尼尔 (Chenille)", "有机棉 (Organic Cotton)"],
        fillings: ["环保 PP 棉", "记忆海绵", "重力球 / 沙包", "硬质塑料结构件", "保暖棉 / 蓬松棉"],
        crafts: ["3D 立体绣花", "数码丝印", "热转印 Logo", "织标 (Woven Label)", "可拆换服装", "发声器 / LED / 香味模块"],
      }
    : {
        materials: ["Crystal Super-soft", "Short Plush", "Velboa", "Minky", "Chenille", "Organic Cotton"],
        fillings: ["Eco PP cotton", "Memory foam", "Weighted beads / sand bags", "Rigid structural inserts", "Loft fill / fluffy fill"],
        crafts: ["3D embroidery", "Digital silk-screen", "Heat-transfer logo", "Woven labels", "Removable costumes", "Sound modules / LED / scent capsules"],
      };

  return (
    <>
      <FaqJsonLd isZh={isZh} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-sky-brand to-sky-brand-dark py-20 md:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold text-white md:text-5xl">
              {isZh ? "毛绒玩具 OEM 与 ODM 定制服务" : "Plush Toy OEM vs ODM Manufacturing Services"}
            </h1>
            <p className="mt-4 text-lg text-white/85 md:text-xl">{t("subtitle")}</p>
          </div>
        </Container>
      </section>

      <Container>
        <Breadcrumb
          locale={locale}
          items={[
            { label: nav("home"), href: "/" },
            { label: nav("oemOdm") },
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

      {/* OEM vs ODM */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "OEM 与 ODM 的区别" : "OEM vs ODM — What's the Difference?"}
            subtitle={
              isZh
                ? "理解两者差异，选择最适合你阶段的合作方式"
                : "Understand the distinction and pick the model that fits your stage"
            }
          />
          <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
            {oemVsOdm.map((c) => (
              <div key={c.tag} className="rounded-2xl border-2 border-sky-brand/30 bg-white p-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-brand px-3 py-1 text-sm font-bold text-white">
                  {c.tag}
                </div>
                <h3 className="mt-3 text-xl font-bold text-brown">{c.title}</h3>
                <p className="mt-2 text-sm text-brown/60">{c.when}</p>
                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-brown/50">
                      {isZh ? "客户提供" : "You provide"}
                    </p>
                    <ul className="mt-1 space-y-1">
                      {c.give.map((g) => (
                        <li key={g} className="flex items-start gap-2 text-sm text-brown-light">
                          <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-sky-brand" />
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-brown/50">
                      {isZh ? "工厂负责" : "We handle"}
                    </p>
                    <ul className="mt-1 space-y-1">
                      {c.get.map((g) => (
                        <li key={g} className="flex items-start gap-2 text-sm text-brown-light">
                          <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-sky-brand" />
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Target Clients */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading
            title={isZh ? "适合哪些客户" : "Who Should Work With Us"}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {targetClients.map((c) => (
              <div key={c.t} className="flex items-start gap-3 rounded-xl bg-white p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-brand/10">
                  <c.icon className="h-5 w-5 text-sky-brand" />
                </div>
                <div>
                  <h3 className="font-bold text-brown">{c.t}</h3>
                  <p className="mt-1 text-sm text-brown-light">{c.d}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Materials & Crafts */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "支持的材质、填充与工艺" : "Materials, Fillings, and Crafts"}
            subtitle={isZh ? "覆盖大部分毛绒品类的可选项" : "Covering most plush categories' standard options"}
          />
          <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: isZh ? "面料" : "Fabrics", icon: Layers, items: materialsCrafts.materials },
              { title: isZh ? "填充物" : "Fillings", icon: Package, items: materialsCrafts.fillings },
              { title: isZh ? "工艺与配件" : "Craft & Add-ons", icon: Pencil, items: materialsCrafts.crafts },
            ].map((g) => (
              <div key={g.title} className="rounded-2xl bg-bg-warm p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-brand/10">
                    <g.icon className="h-5 w-5 text-sky-brand" />
                  </div>
                  <h3 className="text-lg font-bold text-brown">{g.title}</h3>
                </div>
                <ul className="mt-4 space-y-2">
                  {g.items.map((m) => (
                    <li key={m} className="flex items-start gap-2 text-sm text-brown-light">
                      <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-sky-brand" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Existing 7-step Timeline (kept) */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading
            title={isZh ? "开发与打样流程" : "Development & Sampling Process"}
            subtitle={isZh ? "标准化 7 步流程，全程透明可追踪" : "A 7-step standardized flow, fully transparent"}
          />
          <div className="mt-8">
            <OemOdmTimeline />
          </div>
        </Container>
      </section>

      {/* MOQ + Lead Time */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "MOQ、打样时间与量产周期" : "MOQ, Sampling, and Lead Time"}
          />
          <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Package,
                title: isZh ? "MOQ" : "MOQ",
                rows: isZh
                  ? [["20cm 以下", "3,600 件/款"], ["20–35cm", "2,400 件/款"], ["35–50cm", "1,200 件/款"], ["50cm 以上", "800 件/款"]]
                  : [["Under 20 cm", "3,600 pcs/style"], ["20–35 cm", "2,400 pcs/style"], ["35–50 cm", "1,200 pcs/style"], ["Over 50 cm", "800 pcs/style"]],
              },
              {
                icon: Pencil,
                title: isZh ? "打样" : "Sampling",
                rows: isZh
                  ? [["OEM 首样", "7-15 工作日"], ["ODM 设计稿", "3-5 工作日"], ["修改样", "5-7 工作日"]]
                  : [["OEM first sample", "7-15 working days"], ["ODM design", "3-5 working days"], ["Revisions", "5-7 working days"]],
              },
              {
                icon: Clock,
                title: isZh ? "量产" : "Production",
                rows: isZh
                  ? [["标准大货", "30-45 天"], ["加急大货", "20-25 天"], ["质检 & 出货", "3-5 天"]]
                  : [["Standard bulk", "30-45 days"], ["Rush bulk", "20-25 days"], ["QC & shipping", "3-5 days"]],
              },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-brown/10 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-brand/10">
                    <c.icon className="h-5 w-5 text-sky-brand" />
                  </div>
                  <h3 className="text-lg font-bold text-brown">{c.title}</h3>
                </div>
                <table className="mt-4 w-full text-sm">
                  <tbody className="divide-y divide-brown/5">
                    {c.rows.map(([k, v]) => (
                      <tr key={k}>
                        <td className="py-2 text-brown-light">{k}</td>
                        <td className="py-2 text-right font-semibold text-brown">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Certifications & QC */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading
            title={isZh ? "认证与质量控制" : "Certifications & Quality Control"}
            subtitle={
              isZh
                ? "工厂双认证 + 产品多重测试 + 5 道质检 + 100% 出货前全检"
                : "Dual factory cert + multi-test products + 5-stage QC + 100% pre-shipment inspection"
            }
          />
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {["BSCI", "ISO 9001", "EN 71", "ASTM F963", "CE", "GB 6675"].map((c) => (
                <div key={c} className="flex items-center gap-3 rounded-xl bg-white p-4">
                  <Shield className="h-5 w-5 shrink-0 text-sky-brand" />
                  <span className="font-semibold text-brown">{c}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-2">
              {(isZh
                ? ["原料进厂检", "裁片检", "生产中检", "成品全检", "出货前抽检"]
                : ["Incoming material", "Cutting QC", "In-process QC", "100% finished QC", "Pre-shipment audit"]
              ).map((s, i) => (
                <div key={s} className="rounded-xl bg-white p-3 text-center">
                  <div className="text-sm font-bold text-sky-brand">{i + 1}</div>
                  <div className="mt-1 text-xs text-brown-light">{s}</div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Factory vs Trader */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "为什么选工贸一体的工厂而不是贸易商" : "Why Factory-Direct Beats a Trading Company"}
          />
          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-brown/10">
            <table className="w-full text-sm">
              <thead className="bg-bg-warm">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-brown">{isZh ? "维度" : "Dimension"}</th>
                  <th className="px-4 py-3 text-left font-semibold text-sky-brand">{isZh ? "爱儿采（工贸一体）" : "LovelyJoy (Factory-Direct)"}</th>
                  <th className="px-4 py-3 text-left font-semibold text-brown/60">{isZh ? "纯贸易商" : "Trading Company"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brown/10">
                {(isZh
                  ? [
                      ["报价透明度", "源头出厂价，成本可拆解", "层层加价，难追溯成本"],
                      ["打样速度", "7-15 天（自有版师）", "20-30 天（依赖外协）"],
                      ["生产可见度", "可视频看车间，每周进度", "依赖供应商通报，信息滞后"],
                      ["质量控制", "5 道现场 QC + 100% 全检", "依赖外厂，难现场返工"],
                      ["认证完整度", "工厂级 BSCI/ISO + 产品检测", "通常只有产品级认证"],
                      ["长期合作稳定性", "产能可锁定排期", "外协厂可能换，质量波动"],
                    ]
                  : [
                      ["Price transparency", "Factory-direct cost, breakdown available", "Tiered markup, opaque cost"],
                      ["Sampling speed", "7-15 days (in-house pattern team)", "20-30 days (depends on subcontractor)"],
                      ["Production visibility", "Live video tours, weekly updates", "Relies on supplier reports — info lag"],
                      ["Quality control", "5-stage on-site QC + 100% inspection", "Depends on outside factory, hard to rework"],
                      ["Certification scope", "Factory-level BSCI/ISO + product tests", "Usually product-level only"],
                      ["Long-term stability", "Capacity slot can be locked", "Subcontractors may change, quality varies"],
                    ]
                ).map(([d, us, them]) => (
                  <tr key={d}>
                    <td className="px-4 py-3 font-medium text-brown">{d}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2 text-brown">
                        <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-sky-brand" />
                        <span>{us}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2 text-brown/60">
                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-brown/40" />
                        <span>{them}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* Existing CTA */}
      <OemOdmCTA />
    </>
  );
}
