import { buildAlternates } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { Sparkles, Palette, Package, Shirt, Users, Gift, CheckCircle, Image as ImageIcon } from "lucide-react";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  return {
    title: isZh
      ? "企业吉祥物毛绒玩具定制_品牌 Mascot 开发生产 | 爱儿采 LovelyJoy"
      : "Corporate Mascot Plush Toy Manufacturer | Brand Mascot Custom Production | LovelyJoy",
    description: isZh
      ? "爱儿采专业企业吉祥物毛绒玩具定制厂家，从品牌 Logo 或 2D 形象开发 3D 毛绒公仔。50+设计师团队，支持尺寸/服装/包装定制，适合活动赠品、品牌周边、会员礼品。"
      : "LovelyJoy is a professional corporate mascot plush manufacturer. We turn your 2D brand character or logo into a 3D plush mascot. 50+ designers, full size/costume/packaging customization — ideal for event gifts, brand merch, and member rewards.",
    alternates: buildAlternates(locale, "/mascot-custom"),
  };
}

function FaqJsonLd({ isZh }: { isZh: boolean }) {
  const faqs = isZh
    ? [
        { q: "只有 Logo 或平面形象，能开发吉祥物毛绒玩具吗？", a: "可以。这是我们最常接的项目类型。客户只需提供 Logo / 2D 角色插画 / 品牌 VI，我们的设计团队会出 3D 效果图、结构拆解、版型样衣图，确认后进入打样。无需客户自己具备玩具设计能力。" },
        { q: "企业吉祥物一般起订量多少？", a: "定制吉祥物推荐起订 300-500 件，确保打样开模成本能有效摊薄。量小的活动礼品项目（100-200 件）也可协商，但单价会相应上浮。量大的渠道产品 1000+ 件起可享批量优惠。" },
        { q: "可以做活动礼品包装吗？", a: "支持。吊牌、品牌标签、OPP 袋、手提袋、彩盒、礼品卡全套可一体开发。常见配置：毛绒公仔 + 品牌吊牌 + 定制礼盒 + 贺卡，适合新品发布会、年会、会员日。" },
        { q: "是否支持多尺寸开发？", a: "支持。常见组合是同一形象做 3 个尺寸：15cm 钥匙扣版（活动伴手礼）、25cm 桌面版（员工礼品）、45cm 大号版（门店摆件）。一次打样可并行开发 2-3 个尺寸。" },
        { q: "打样和量产周期如何安排？", a: "3D 设计稿 3-5 天，首版样品 10-15 天，修改样 5-7 天，确认后大货 30-45 天。急单可压缩：设计+首样 10 天内，大货 20-25 天（加急费另算）。" },
        { q: "能做成衣服/配饰可拆换的吉祥物吗？", a: "可以。我们支持可拆换服装、配件（帽子/眼镜/徽章/围巾）、节日限定 Look。适合长期品牌 IP 运营需要推出季节性内容的场景。" },
      ]
    : [
        { q: "I only have a logo or 2D character — can you still develop a plush mascot?", a: "Yes, this is our most common project type. Just provide your logo, 2D character art, or brand VI guidelines. Our design team produces 3D renderings, structural breakdowns, and pattern sheets. No toy-design experience needed on your side." },
        { q: "What is the typical MOQ for corporate mascots?", a: "Recommended MOQ is 300-500 pcs to amortize tooling and pattern costs. Smaller promotional runs (100-200 pcs) can be negotiated with higher unit cost. Large retail volumes (1,000+) qualify for batch discounts." },
        { q: "Can you do event gift packaging?", a: "Yes. We can develop hang tags, brand labels, poly bags, tote bags, gift boxes, and greeting cards as a set. Common bundle: plush mascot + branded hang tag + custom gift box + greeting card — ideal for product launches, annual meetings, and member days." },
        { q: "Do you support multiple sizes?", a: "Yes. A common combination is one character developed in three sizes: 15 cm keychain (event giveaway), 25 cm desktop (staff gift), 45 cm large (in-store display). One sampling round can cover 2-3 sizes in parallel." },
        { q: "What are the sample and production timelines?", a: "3D design 3-5 days, first physical sample 10-15 days, revision 5-7 days. After approval, bulk production 30-45 days. Rush: design+first sample within 10 days, bulk in 20-25 days (rush fee applies)." },
        { q: "Can the mascot have removable outfits or accessories?", a: "Yes. We support swappable costumes and accessories (hats, glasses, badges, scarves), plus seasonal or limited-edition looks. Perfect for long-running IP programs that need fresh content each season." },
      ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />;
}

export default async function MascotCustomPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const nav = await getTranslations({ locale, namespace: "nav" });

  const whyMascot = [
    { icon: Sparkles, title: isZh ? "让品牌形象可触可抱" : "Turn Brand Into a Tangible Icon", desc: isZh ? "吉祥物毛绒把 2D 品牌形象落到实体，增加情感连接和分享传播" : "A plush mascot turns a 2D brand symbol into something fans can hold — boosting emotional connection and shareability." },
    { icon: Gift, title: isZh ? "高感知价值礼品" : "High-Perceived-Value Gifting", desc: isZh ? "作为活动赠品/员工福利/客户答谢，感知价值远超同价位礼品" : "As event swag, staff perks, or client thank-you's, perceived value outperforms similarly-priced gifts." },
    { icon: Users, title: isZh ? "粉丝与会员运营" : "Fan & Member Engagement", desc: isZh ? "季节限定 / 会员专属版本可持续激活粉丝经济" : "Seasonal and member-exclusive editions keep fan economies alive year-round." },
  ];

  const scenarios = isZh
    ? [
        { icon: Gift, t: "活动赠品", d: "新品发布、年会、展会现场、会员日伴手礼" },
        { icon: Package, t: "品牌周边零售", d: "门店收银台商品、线上周边 SKU、联名礼盒" },
        { icon: Users, t: "员工福利与团建", d: "入职礼包、节日福利、周年庆定制" },
        { icon: Sparkles, t: "IP 衍生开发", d: "动漫/游戏/内容 IP 的毛绒化落地" },
        { icon: Shirt, t: "门店形象物", d: "大型摆件、橱窗装饰、节日主题展陈" },
        { icon: ImageIcon, t: "公关与媒体礼品", d: "KOL 定制包裹、媒体开箱视频专用版" },
      ]
    : [
        { icon: Gift, t: "Event giveaways", d: "Product launches, annual meetings, expo booths, member-day gifts." },
        { icon: Package, t: "Brand retail merch", d: "Checkout-counter SKUs, online merch drops, collab gift sets." },
        { icon: Users, t: "Employee perks & team-building", d: "Onboarding gifts, holiday bonuses, anniversary editions." },
        { icon: Sparkles, t: "IP expansion", d: "Plush versions of anime, game, and content IPs." },
        { icon: Shirt, t: "In-store icon pieces", d: "Large display plush, window dressing, seasonal themed setups." },
        { icon: ImageIcon, t: "PR & media gifting", d: "KOL unboxing packages, media-kit exclusive editions." },
      ];

  const processSteps = [
    { num: "01", title: isZh ? "品牌形象输入" : "Brand Asset Input", desc: isZh ? "提供 Logo、2D 角色、品牌色、风格参考。没有 3D 稿完全 OK" : "Share logo, 2D character, brand colors, and style references. No 3D source needed." },
    { num: "02", title: isZh ? "3D 效果图开发" : "3D Rendering", desc: isZh ? "设计师出 3D 效果图、正/侧/背多视图、比例与姿态方案" : "Our designers produce 3D renderings, multi-view projections, and proportion/pose options." },
    { num: "03", title: isZh ? "打版与首样" : "Patterning & First Sample", desc: isZh ? "10-15 天内寄出实物样品，含品牌色对版与吊牌样张" : "Physical sample in 10-15 days with matched Pantone colors and hang-tag proof." },
    { num: "04", title: isZh ? "细节打磨" : "Refinement", desc: isZh ? "调整比例、表情、服饰、手感，直到客户签字确认" : "Iterate on proportion, expression, costume, and touch-feel until signed off." },
    { num: "05", title: isZh ? "量产 + 品牌包装" : "Mass Production + Brand Packaging", desc: isZh ? "30-45 天完成大货，同步产出全套品牌包装物料" : "Bulk production in 30-45 days with all branded packaging produced in parallel." },
  ];

  return (
    <>
      <FaqJsonLd isZh={isZh} />

      <section className="bg-gradient-to-br from-beige-brand to-beige-brand-dark py-20 md:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold text-brown md:text-5xl">
              {isZh ? "企业吉祥物毛绒玩具定制" : "Corporate Mascot Plush Manufacturing"}
            </h1>
            <p className="mt-4 text-lg text-brown/80 md:text-xl">
              {isZh
                ? "从品牌 Logo / 2D 形象，开发可抱可送的 3D 毛绒吉祥物"
                : "From your logo or 2D character to a huggable, giftable 3D plush mascot"}
            </p>
          </div>
        </Container>
      </section>

      <Container>
        <Breadcrumb
          locale={locale}
          items={[
            { label: nav("home"), href: "/" },
            { label: isZh ? "企业吉祥物定制" : "Corporate Mascot" },
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

      {/* Why */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "企业为什么要定制吉祥物毛绒玩具" : "Why Brands Invest in a Plush Mascot"}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whyMascot.map((w) => (
              <div key={w.title} className="rounded-2xl border border-brown/10 bg-white p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-brand/10">
                  <w.icon className="h-6 w-6 text-sky-brand" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-brown">{w.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brown-light">{w.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Scenarios */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading
            title={isZh ? "吉祥物定制的典型应用场景" : "Where Branded Plush Mascots Shine"}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {scenarios.map((s) => (
              <div key={s.t} className="flex items-start gap-3 rounded-xl bg-white p-5">
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

      {/* Process */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "从品牌形象到毛绒实物的开发流程" : "From Brand Asset to Finished Plush"}
            subtitle={isZh ? "5 步流程，不要求客户具备玩具设计能力" : "A 5-step flow — no toy-design experience required on your side"}
          />
          <div className="mx-auto max-w-3xl space-y-4">
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

      {/* Options */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading
            title={isZh ? "可定制的材质、工艺与包装" : "Material, Craft, and Packaging Options"}
          />
          <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
            {(isZh
              ? [
                  { icon: Palette, t: "面料选择", d: "水晶超柔、短毛绒、Minky、天鹅绒、亲肤涤纶；全部过 EN71/ASTM 检测" },
                  { icon: Shirt, t: "服装与配件", d: "可拆换服装、西装、主题装、节日装、眼镜、围巾、徽章等" },
                  { icon: Sparkles, t: "特殊工艺", d: "刺绣 Logo、丝印品牌、亮片、发光眼睛、发声器、香味植入" },
                  { icon: Package, t: "包装与礼盒", d: "品牌吊牌 / 定制彩盒 / 烫金礼盒 / 透明展示盒 / 贺卡一体化" },
                ]
              : [
                  { icon: Palette, t: "Fabric selection", d: "Crystal super-soft, short plush, Minky, velboa, skin-friendly polyester — all EN71/ASTM tested." },
                  { icon: Shirt, t: "Costumes & accessories", d: "Swappable outfits, suits, themed dresses, seasonal looks, glasses, scarves, badges, and more." },
                  { icon: Sparkles, t: "Special craft", d: "Logo embroidery, silk-screen branding, sequins, LED eyes, sound modules, scent embedding." },
                  { icon: Package, t: "Packaging & gift sets", d: "Branded hang tags, custom color boxes, foil-stamped gift boxes, transparent display boxes, and greeting cards." },
                ]
            ).map((o) => (
              <div key={o.t} className="flex items-start gap-3 rounded-2xl bg-white p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-brand/10">
                  <o.icon className="h-5 w-5 text-sky-brand" />
                </div>
                <div>
                  <h3 className="font-bold text-brown">{o.t}</h3>
                  <p className="mt-1 text-sm text-brown-light">{o.d}</p>
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
              {isZh ? "把品牌形象做成可抱的毛绒" : "Turn Your Brand Into a Plush Fans Will Hold"}
            </h2>
            <p className="mt-4 text-lg text-white/80">
              {isZh ? "发送 Logo 或 2D 角色，我们 3 天内给出 3D 方案与报价。" : "Send your logo or 2D character — 3D proposal and quote within 3 days."}
            </p>
            <div className="mt-8">
              <Button href="/contact" variant="secondary" size="lg">
                <CheckCircle className="h-4 w-4" />
                {isZh ? "提交吉祥物需求" : "Start a Mascot Project"}
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
