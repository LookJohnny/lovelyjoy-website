import { buildAlternates } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { Gift, PartyPopper, Calendar, DollarSign, Package, Tag, CheckCircle, Truck } from "lucide-react";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  return {
    title: isZh
      ? "礼品毛绒玩具定制_活动赠品/促销礼品 OEM 厂家 | 爱儿采 LovelyJoy"
      : "Promotional Plush Toy Manufacturer | Custom Gift & Event Plush OEM | LovelyJoy"
    ,
    description: isZh
      ? "爱儿采承接礼品与活动毛绒玩具定制项目：节庆礼盒、促销伴手礼、品牌周边、会员礼品、企业团建。预算可控、交期稳定、包装一体化，支持小批量起订。"
      : "LovelyJoy manufactures promotional and event plush toys: holiday gift sets, giveaways, brand merch, member rewards, and corporate gifts. Budget-controlled, on-time delivery, integrated packaging, and low MOQ supported.",
    alternates: buildAlternates(locale, "/gift-plush-custom"),
  };
}

function FaqJsonLd({ isZh }: { isZh: boolean }) {
  const faqs = isZh
    ? [
        { q: "活动礼品类项目适合做哪些毛绒产品？", a: "最常见的是小尺寸毛绒（10-20cm 挂件/公仔/钥匙扣），因为单价低、礼品装易落地。礼盒类项目会搭配 25cm 中号公仔 + 包装盒+卡片。节庆活动会做限定造型（圣诞熊/生肖款/情人节爱心熊等）。" },
        { q: "有没有适合低预算的定制方案？", a: "有。低预算方案通常从三方面控制：选用通用款版型+只换色换包装（省开模费），降低尺寸到 10-15cm，选用短毛绒面料。这样单价可压到 8-20 元/件，适合大批量活动赠品。" },
        { q: "包装是否可以一起定制？", a: "可以，推荐一起做——包装是礼品感的关键。常见组合：OPP 袋 + 品牌吊牌（最经济）/ 彩盒 + 卡片（中档）/ 烫金礼盒 + 蝴蝶结 + 贺卡（高端）。包装设计我们有专门团队，可按你的 VI 规范做。" },
        { q: "活动前多久要下单？", a: "推荐至少 60-75 天前下单：打样 10-15 天 + 确认 5-7 天 + 大货 30-45 天 + 物流 5-10 天。节庆旺季（圣诞/春节/中秋前 2 个月）产能紧张，建议再往前留 15 天缓冲。加急订单 45 天交付可做，加急费约 10-15%。" },
        { q: "可以做节日限定款吗？", a: "可以。我们常年承接圣诞/新年/情人节/中秋/万圣节/七夕等节日限定项目。也支持品牌日/周年庆等客户专属节日版。一次打样出多款（如同一形象的春节/圣诞两版）可共用版型节省成本。" },
        { q: "最小起订量多少？礼品项目有灵活起订吗？", a: "标准 MOQ 500 件/款。活动礼品类我们支持 200 件起订（首次试单），会员限定版可低至 100 件（但单价会上浮约 30-40%）。如果你是采购多 SKU 的礼盒项目，总量满 500 件可跨款拼单。" },
      ]
    : [
        { q: "Which plush work best for promotional gifts?", a: "Small plush (10-20 cm keychains, small characters) are most popular — low unit cost and gift-ready. Gift-set projects often pair a 25 cm mid-size plush with a box and card. Seasonal programs use limited-edition shapes (Christmas bears, zodiac editions, Valentine's heart bears, etc.)." },
        { q: "Do you have low-budget promotional options?", a: "Yes. Three levers: use a standard base pattern and change only color/packaging (saves tooling), reduce size to 10-15 cm, and pick short plush fabric. Unit cost can land at $1.20-$3.00 for high-volume event giveaways." },
        { q: "Can packaging be customized too?", a: "Absolutely — and we recommend it. Packaging is what makes it feel like a gift. Common tiers: poly bag + branded hang tag (budget), color box + card (mid), foil-stamped gift box + ribbon + greeting card (premium). Our in-house packaging team designs to your VI guidelines." },
        { q: "How far in advance should I place an order?", a: "Recommend booking 60-75 days ahead: sample 10-15 days + approval 5-7 + bulk 30-45 + shipping 5-10. Peak seasons (2 months before Christmas, CNY, Mid-Autumn) get tight — add 15-day buffer. Rush production at 45 days total is possible with a 10-15% rush fee." },
        { q: "Can you do limited-edition holiday designs?", a: "Yes. Regular projects include Christmas, New Year, Valentine's, Mid-Autumn, Halloween, and Qixi editions. We also support brand-specific holidays (product launches, anniversaries). Running multiple editions of one character (e.g. CNY + Christmas) shares patterns to cut costs." },
        { q: "What is the MOQ? Flexibility for gift projects?", a: "Standard MOQ 500 pcs/style. Event-gift projects accept 200 pcs (first trial) and member-exclusive runs as low as 100 pcs (unit cost up ~30-40%). Multi-SKU gift sets totaling 500+ can be split across designs." },
      ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />;
}

export default async function GiftPlushCustomPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const nav = await getTranslations({ locale, namespace: "nav" });

  const scenarios = isZh
    ? [
        { icon: PartyPopper, t: "品牌促销活动", d: "新品发布 / 双 11 / 黑五限时礼品" },
        { icon: Calendar, t: "节庆限定礼品", d: "圣诞、春节、情人节、中秋、七夕、万圣节" },
        { icon: Gift, t: "会员日礼品", d: "高阶会员专属、周年庆感谢礼、注册赠礼" },
        { icon: Package, t: "企业礼盒定制", d: "客户答谢礼、团建福利、渠道商礼包" },
        { icon: Tag, t: "展会与现场活动", d: "展会伴手礼、发布会入场礼、现场抽奖" },
        { icon: Truck, t: "跨境电商伴手礼", d: "订单加赠 / 满减赠品 / 独立站感谢包" },
      ]
    : [
        { icon: PartyPopper, t: "Brand promotions", d: "Product launches, 11/11, Black Friday limited gifts." },
        { icon: Calendar, t: "Holiday limited editions", d: "Christmas, Lunar New Year, Valentine's, Mid-Autumn, Qixi, Halloween." },
        { icon: Gift, t: "Member-day rewards", d: "Premium-tier exclusives, anniversary thank-you's, sign-up perks." },
        { icon: Package, t: "Corporate gift sets", d: "Client thank-you boxes, team-building kits, channel-partner gifts." },
        { icon: Tag, t: "Expo & on-site events", d: "Booth giveaways, launch-event entrance gifts, on-site raffles." },
        { icon: Truck, t: "Cross-border freebies", d: "Order-add-on, threshold bonus, DTC thank-you packs." },
      ];

  const budgetTiers = isZh
    ? [
        { tier: "经济款", price: "¥8-20 /件", feat: ["10-15cm 小尺寸", "通用版型换色", "OPP 袋 + 品牌吊牌", "适合大批量活动伴手礼"] },
        { tier: "标准款", price: "¥20-50 /件", feat: ["20-30cm 中号尺寸", "定制形象+品牌刺绣", "彩盒 + 品牌卡片", "适合品牌礼盒与会员礼品"] },
        { tier: "高端款", price: "¥50-150 /件", feat: ["30-45cm 大号/礼盒组合", "高端面料+精细做工", "烫金礼盒 + 贺卡 + 包装袋", "适合 VIP 客户答谢与限量款"] },
      ]
    : [
        { tier: "Budget", price: "$1.20-$3.00", feat: ["10-15 cm small size", "Standard pattern, color change only", "Poly bag + branded hang tag", "High-volume event giveaways"] },
        { tier: "Standard", price: "$3.00-$7.50", feat: ["20-30 cm mid-size", "Custom character + brand embroidery", "Color box + branded card", "Brand gift boxes & member rewards"] },
        { tier: "Premium", price: "$7.50-$22", feat: ["30-45 cm large / gift-set combo", "Premium fabric & fine workmanship", "Foil gift box + greeting card + tote", "VIP thank-you & limited editions"] },
      ];

  return (
    <>
      <FaqJsonLd isZh={isZh} />

      <section className="bg-gradient-to-br from-sky-brand to-sky-brand-dark py-20 md:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold text-white md:text-5xl">
              {isZh ? "礼品毛绒玩具定制服务" : "Promotional & Gift Plush Toy Manufacturing"}
            </h1>
            <p className="mt-4 text-lg text-white/85 md:text-xl">
              {isZh
                ? "适用于活动赠品、节庆礼盒、品牌周边、会员礼品与企业团建"
                : "Ideal for event giveaways, holiday gift sets, brand merch, member rewards, and corporate gifting"}
            </p>
          </div>
        </Container>
      </section>

      <Container>
        <Breadcrumb
          locale={locale}
          items={[
            { label: nav("home"), href: "/" },
            { label: isZh ? "礼品毛绒玩具定制" : "Promotional Plush" },
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

      {/* Scenarios */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "礼品毛绒玩具适合哪些营销场景" : "Where Gift Plush Shows Up Best"}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {scenarios.map((s) => (
              <div key={s.t} className="flex items-start gap-3 rounded-xl bg-bg-warm p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-brand/10">
                  <s.icon className="h-5 w-5 text-sky-brand" />
                </div>
                <div>
                  <h3 className="font-bold text-brown">{s.t}</h3>
                  <p className="mt-1 text-sm text-brown-light">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Budget Tiers */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading
            title={isZh ? "三档预算方案参考" : "Three Budget Tiers"}
            subtitle={isZh ? "根据场景与预算匹配尺寸、工艺、包装组合" : "Match size, craft, and packaging to your scenario and budget"}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {budgetTiers.map((b) => (
              <div key={b.tier} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-brown">{b.tier}</h3>
                  <DollarSign className="h-5 w-5 text-sky-brand" />
                </div>
                <p className="mt-2 text-2xl font-bold text-sky-brand">{b.price}</p>
                <ul className="mt-4 space-y-2">
                  {b.feat.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-brown-light">
                      <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-sky-brand" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-brown-light">
            {isZh
              ? "以上参考价为 500-2000 件批量区间含基础包装的工厂出厂价，具体单价视尺寸、工艺、用料与订单量调整。"
              : "Prices above reflect factory cost for 500-2,000 pcs including basic packaging. Unit cost adjusts with size, craft, material, and volume."}
          </p>
        </Container>
      </section>

      {/* Packaging */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "支持的品牌包装与吊牌" : "Branded Packaging & Tag Options"}
          />
          <div className="mx-auto max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(isZh
              ? [
                  "定制吊牌（纸质/硬卡/烫金）",
                  "品牌织标（缝入式/可拆式）",
                  "OPP 袋（透明/磨砂/印品牌）",
                  "彩盒与展示盒（单色/四色印刷）",
                  "高端烫金礼盒（含内衬托盘）",
                  "手提袋与手拎礼盒套装",
                  "品牌贺卡 / 说明卡 / 手写感谢卡",
                  "节日主题包装（圣诞/春节限定版）",
                ]
              : [
                  "Custom hang tags (paper, thick card, foil-stamped)",
                  "Woven brand labels (sewn-in or removable)",
                  "Poly bags (clear, frosted, brand-printed)",
                  "Color boxes and display boxes (1-color or CMYK print)",
                  "Premium foil gift boxes with molded inserts",
                  "Shopping bags and handle-box gift sets",
                  "Branded greeting cards, story cards, handwritten-style cards",
                  "Holiday-themed packaging (Christmas / CNY limited editions)",
                ]
            ).map((t) => (
              <div key={t} className="flex items-start gap-3 rounded-xl bg-bg-warm p-4">
                <CheckCircle className="h-5 w-5 mt-0.5 shrink-0 text-sky-brand" />
                <span className="text-sm text-brown">{t}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading
            title={isZh ? "活动项目交付时间线" : "Event Project Timeline"}
            subtitle={isZh ? "建议活动前 60-75 天启动，旺季前留 15 天缓冲" : "Start 60-75 days before the event; add a 15-day buffer before peak seasons"}
          />
          <div className="mx-auto max-w-3xl space-y-3">
            {(isZh
              ? [
                  { t: "T-75 天", d: "需求沟通 + 报价确认 + 面料方案" },
                  { t: "T-60 天", d: "首版样品寄出（10-15 天打样）" },
                  { t: "T-50 天", d: "样品确认 + 修改样 + 包装样同步" },
                  { t: "T-40 天", d: "30% 定金到账 → 大货开始排产" },
                  { t: "T-10 天", d: "大货完成 + 100% 全检 + 装箱" },
                  { t: "T-5 天", d: "出货 → 物流抵达，活动前 5 天入库" },
                ]
              : [
                  { t: "T-75 days", d: "Brief, quote confirmation, fabric plan." },
                  { t: "T-60 days", d: "First sample shipped (10-15 day sampling)." },
                  { t: "T-50 days", d: "Sample approval, revisions, packaging samples in parallel." },
                  { t: "T-40 days", d: "30% deposit received → bulk production begins." },
                  { t: "T-10 days", d: "Bulk complete + 100% QC + packing." },
                  { t: "T-5 days", d: "Ship out → delivery arrives 5 days before event." },
                ]
            ).map((s, i) => (
              <div key={s.t} className="flex gap-4 rounded-xl bg-white p-4">
                <div className="flex h-10 w-20 shrink-0 items-center justify-center rounded-lg bg-sky-brand text-white font-bold text-sm">{s.t}</div>
                <p className="flex-1 text-sm text-brown-light self-center">
                  <span className="mr-2 text-brown/40">{i + 1}.</span>{s.d}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24 bg-gradient-to-br from-sky-brand to-sky-brand-dark">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              {isZh ? "策划活动礼品？先报一个预算我们给方案" : "Planning an Event Gift? Share a Budget and We'll Propose"}
            </h2>
            <p className="mt-4 text-lg text-white/80">
              {isZh
                ? "告诉我们活动日期、数量和预算，24 小时内提供三档方案对比。"
                : "Share event date, quantity, and budget — we'll come back with a three-tier proposal within 24 hours."}
            </p>
            <div className="mt-8">
              <Button href="/contact" variant="secondary" size="lg">
                {isZh ? "获取礼品定制方案" : "Get a Gift Plush Proposal"}
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
