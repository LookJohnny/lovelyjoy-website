import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { Package, Clock, Factory, Boxes, ShieldCheck, MapPin } from "lucide-react";

// B2B "first 15 seconds" panel: the sourcing facts a wholesale/OEM buyer needs
// before they will send an RFQ. Values mirror the business-confirmed figures
// already published in /public/llms.txt.
// TODO(business): re-confirm the MOQ floor, monthly capacity and lead times
// before treating any of these as contractual commitments.
type Copy = {
  headline: string;
  subheadline: string;
  cards: { label: string; value: string }[];
  ctaSample: string;
  ctaQuote: string;
};

const EN: Copy = {
  headline: "Custom Plush Toy Manufacturer in Yiwu, China",
  subheadline:
    "OEM/ODM plush toys, stuffed animals, mascot dolls and custom soft toys for international wholesalers, importers, gift brands and retailers.",
  cards: [
    { label: "MOQ", value: "From 500 pcs · 200 pcs trial" },
    { label: "Sample Time", value: "7–15 days" },
    { label: "Production Lead Time", value: "30–45 days" },
    { label: "Services", value: "OEM · ODM · Private Label" },
    { label: "Certifications", value: "BSCI · ISO 9001 · ASTM F963 · EN 71 · CE · GB 6675" },
    { label: "Location", value: "Yiwu, Zhejiang, China · Ships to 70+ countries" },
  ],
  ctaSample: "Request a Sample",
  ctaQuote: "Get OEM Quote",
};

const ZH: Copy = {
  headline: "义乌毛绒玩具定制工厂",
  subheadline:
    "为全球批发商、进口商、礼品品牌与零售商提供毛绒玩具、公仔、吉祥物及定制软体玩具的 OEM/ODM 一站式制造服务。",
  cards: [
    { label: "起订量 MOQ", value: "500 件起 · 首单可低至 200 件" },
    { label: "打样周期", value: "7–15 天" },
    { label: "大货交期", value: "30–45 天" },
    { label: "服务模式", value: "OEM · ODM · 贴牌定制" },
    { label: "认证资质", value: "BSCI · ISO 9001 · ASTM F963 · EN 71 · CE · GB 6675" },
    { label: "工厂位置", value: "中国浙江义乌 · 出口 70+ 国家" },
  ],
  ctaSample: "申请样品",
  ctaQuote: "获取报价",
};

const ICONS = [Package, Clock, Factory, Boxes, ShieldCheck, MapPin];

export default function SourcingEssentials({ locale }: { locale: string }) {
  // TODO(i18n): author ja/ko/es/pt/ar/ru/fr/de/it/th/id copy. English is the
  // interim fallback so non-CN buyers still get the sourcing facts immediately.
  const t = locale === "zh" ? ZH : EN;

  return (
    <section
      className="bg-bg-sky py-14 md:py-20"
      aria-labelledby="sourcing-essentials-heading"
    >
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="sourcing-essentials-heading"
            className="text-2xl font-bold text-brown md:text-3xl"
          >
            {t.headline}
          </h2>
          <p className="mt-3 text-brown/70">{t.subheadline}</p>
        </div>

        <dl className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.cards.map((card, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <div
                key={card.label}
                className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm"
              >
                <span className="inline-flex shrink-0 rounded-xl bg-sky-brand/10 p-3">
                  <Icon className="h-5 w-5 text-sky-brand" strokeWidth={1.8} />
                </span>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-brown/50">
                    {card.label}
                  </dt>
                  <dd className="mt-1 font-medium text-brown">{card.value}</dd>
                </div>
              </div>
            );
          })}
        </dl>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button href="/contact" variant="primary" size="lg">
            {t.ctaSample}
          </Button>
          <Button href="/oem-odm" variant="outline" size="lg">
            {t.ctaQuote}
          </Button>
        </div>
      </Container>
    </section>
  );
}
