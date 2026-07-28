import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { buildAlternates, ORG_ID, SITE, WEBSITE_ID } from "@/lib/seo";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileSpreadsheet,
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
    title: isZh
      ? "毛绒玩具 RFQ 询价模板（免费下载）| LovelyJoy"
      : "Plush Toy RFQ Template — Free Download | LovelyJoy",
    description: isZh
      ? "免费下载毛绒玩具采购询价模板，整理设计、尺寸、面料、数量、目标市场、测试、包装与交期要求，获得可比较的工厂报价。"
      : "Download a practical plush toy RFQ template covering design, size, materials, quantity, destination market, testing, packaging and delivery requirements.",
    alternates: buildAlternates(locale, "/rfq-template"),
  };
}

export default async function RfqTemplatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale === "zh";
  const nav = await getTranslations({ locale, namespace: "nav" });
  const pageUrl = `${SITE.url}/${locale}/rfq-template`;
  const downloadHref = isZh
    ? "/downloads/lovelyjoy-plush-rfq-template-zh.csv"
    : "/downloads/lovelyjoy-plush-rfq-template-en.csv";

  const fields = isZh
    ? [
        ["产品与用途", "产品类型、使用场景、目标年龄、是否涉及授权IP"],
        ["设计资料", "正/侧/背面图、Logo、Pantone色号、参考图及知识产权说明"],
        ["规格", "成品尺寸、坐高/站高、重量、允许公差"],
        ["材料", "面料、克重、填充物、绣花/印花、配件及禁用物质"],
        ["数量", "每款数量、颜色数量、试单与年度预测"],
        ["目标市场", "销售国家、年龄分级及适用的测试/标签要求"],
        ["包装", "单品包装、吊牌、洗标、外箱、条码及零售渠道要求"],
        ["时间与贸易条款", "样品期限、大货交期、目的港、EXW/FOB/CIF/DDP"],
      ]
    : [
        ["Product and use", "Product type, use case, target age and licensed-IP status"],
        ["Design files", "Front/side/back views, logo, Pantone colors, references and IP statement"],
        ["Specifications", "Finished dimensions, seated/standing height, weight and tolerances"],
        ["Materials", "Fabric, weight, filling, embroidery/printing, accessories and restricted substances"],
        ["Quantity", "Units per style, color count, trial order and annual forecast"],
        ["Destination market", "Sales countries, age grade, testing and labeling requirements"],
        ["Packaging", "Unit pack, hangtag, care label, master carton, barcode and retail requirements"],
        ["Timing and Incoterms", "Sample deadline, bulk deadline, destination and EXW/FOB/CIF/DDP"],
      ];

  const steps = isZh
    ? [
        "下载CSV模板并填写已知信息；未知项可标记“待工厂建议”。",
        "附上设计文件、参考图和目标市场要求。",
        "将同一份RFQ发送给候选工厂，确保报价口径一致。",
        "比较单价时同时核对样品费、测试费、包装、模具、运输与付款条件。",
      ]
    : [
        "Download the CSV and complete known fields; mark unknown items as “factory recommendation needed.”",
        "Attach design files, reference images and destination-market requirements.",
        "Send the same RFQ to shortlisted factories so quotations use the same scope.",
        "Compare sample, testing, packaging, tooling, freight and payment terms—not only unit price.",
      ];

  const emailTemplate = isZh
    ? `主题：毛绒玩具询价 — [项目/品牌名称]

产品类型：
目标尺寸：
每款数量：
目标市场与年龄分级：
面料与填充物偏好：
Logo / 绣花 / 印花要求：
包装与标签要求：
需要的测试或合规文件：
样品期望日期：
大货期望日期：
贸易条款与目的地：
附件：设计稿 / 参考图 / 品牌规范`
    : `Subject: Plush Toy RFQ — [Project / Brand Name]

Product type:
Target size:
Quantity per style:
Destination market and age grade:
Fabric and filling preference:
Logo / embroidery / print requirements:
Packaging and labeling:
Required tests or compliance documents:
Requested sample date:
Requested bulk-delivery date:
Incoterm and destination:
Attachments: artwork / references / brand guide`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: isZh ? "如何准备毛绒玩具RFQ" : "How to prepare a plush toy RFQ",
    description: isZh
      ? "使用统一询价模板获得范围清晰、可比较的毛绒玩具生产报价。"
      : "Use one structured brief to receive clear, comparable plush toy manufacturing quotes.",
    url: pageUrl,
    inLanguage: isZh ? "zh-Hans" : "en",
    dateModified: "2026-07-28",
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": WEBSITE_ID },
    step: steps.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: isZh ? `步骤 ${index + 1}` : `Step ${index + 1}`,
      text,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="bg-gradient-to-br from-bg-warm to-white py-16 md:py-24">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-brand/10 px-4 py-2 text-sm font-semibold text-sky-brand">
              <FileSpreadsheet className="h-4 w-4" />
              {isZh ? "采购工具" : "Buyer Resource"}
            </span>
            <h1 className="mt-5 text-4xl font-bold text-brown md:text-5xl">
              {isZh ? "毛绒玩具 RFQ 询价模板" : "Plush Toy RFQ Template"}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-brown/70">
              {isZh
                ? "把设计、规格、合规、包装和交期一次说清楚，减少反复确认，并获得口径一致、真正可比较的工厂报价。"
                : "Define design, specifications, compliance, packaging and timing once—reducing back-and-forth and producing genuinely comparable factory quotes."}
            </p>
            <div className="mt-8">
              <Button href={downloadHref} download size="lg">
                <Download className="h-5 w-5" />
                {isZh ? "下载CSV模板" : "Download CSV Template"}
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <Container>
        <Breadcrumb
          locale={locale}
          currentPath="/rfq-template"
          items={[
            { label: nav("home"), href: "/" },
            { label: isZh ? "RFQ询价模板" : "RFQ Template" },
          ]}
        />
      </Container>

      <section className="bg-white py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-bold text-brown">
              {isZh ? "一份完整RFQ需要什么？" : "What belongs in a complete RFQ?"}
            </h2>
            <div className="mt-8 overflow-hidden rounded-2xl border border-brown/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-bg-warm">
                  <tr>
                    <th className="w-1/3 px-5 py-4 font-bold text-brown">
                      {isZh ? "项目" : "Field"}
                    </th>
                    <th className="px-5 py-4 font-bold text-brown">
                      {isZh ? "建议提供的信息" : "Information to provide"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map(([label, detail]) => (
                    <tr key={label} className="border-t border-brown/10">
                      <td className="px-5 py-4 font-semibold text-brown">{label}</td>
                      <td className="px-5 py-4 leading-relaxed text-brown/70">{detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-bg-sky py-16 md:py-20">
        <Container>
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-brown">
                {isZh ? "使用方法" : "How to use it"}
              </h2>
              <ol className="mt-6 space-y-4">
                {steps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-brown/75">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-brand" />
                    <span>
                      <strong className="text-brown">
                        {isZh ? `步骤 ${index + 1}：` : `Step ${index + 1}: `}
                      </strong>
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-brown">
                {isZh ? "可直接复制的邮件模板" : "Copy-ready email template"}
              </h2>
              <pre className="mt-6 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-brown p-6 text-sm leading-relaxed text-white/85">
                {emailTemplate}
              </pre>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16 text-center md:py-20">
        <Container>
          <h2 className="text-3xl font-bold text-brown">
            {isZh ? "准备好项目资料了吗？" : "Ready to brief your project?"}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-brown/65">
            {isZh
              ? "提交模板和设计资料后，我们会确认缺失信息、适用测试与报价范围。"
              : "Send the completed template with your artwork. We will confirm missing inputs, applicable testing and quotation scope."}
          </p>
          <div className="mt-7">
            <Button href={`/${locale}/contact`} size="lg">
              {isZh ? "提交询价" : "Submit an RFQ"}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
