import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import {
  Shield,
  Globe,
  FlaskConical,
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
      ? "毛绒玩具安全标准与认证 | LovelyJoy 爱儿采"
      : "Plush Toy Safety Standards & Certifications | LovelyJoy",
    description: isZh
      ? "了解LovelyJoy爱儿采毛绒玩具的安全认证：BSCI、ISO 9001、CE、ASTM F963、EN 71、GB 6675。每项认证的测试内容、适用市场和重要性详解。"
      : "Learn about LovelyJoy plush toy safety certifications: BSCI, ISO 9001, CE, ASTM F963, EN 71, GB 6675. Detailed explanations of each certification, what it tests, applicable markets, and why it matters.",
    alternates: {
      canonical: `/${locale}/safety-certifications`,
      languages: {
        zh: "/zh/safety-certifications",
        en: "/en/safety-certifications",
        "x-default": "/en/safety-certifications",
      },
    },
  };
}

// --------------- FAQ JSON-LD ---------------

function FaqJsonLd() {
  const faqs = [
    {
      q: "What safety certifications do LovelyJoy plush toys have?",
      a: "LovelyJoy plush toys meet ASTM F963 (USA), EN 71 (EU), CE (EU), and GB 6675 (China) safety standards. Our factory holds BSCI social compliance certification and ISO 9001 quality management certification.",
    },
    {
      q: "What does ASTM F963 test for in plush toys?",
      a: "ASTM F963 is the U.S. Consumer Safety Specification for Toy Safety. For plush toys, it tests mechanical and physical properties (small parts, sharp edges, pull strength of eyes and noses), flammability, and chemical content (lead, phthalates, heavy metals). All plush toys sold in the United States must comply with ASTM F963.",
    },
    {
      q: "What is the difference between EN 71 and ASTM F963?",
      a: "EN 71 is the European toy safety standard and ASTM F963 is the U.S. standard. While both cover mechanical safety, flammability, and chemical properties, they have different specific test methods and limits. EN 71 has stricter limits on certain chemical elements (Part 3: Migration of Certain Elements), while ASTM F963 includes additional mechanical abuse tests. Products sold in Europe need EN 71; products sold in the USA need ASTM F963.",
    },
    {
      q: "Is BSCI certification required to sell plush toys?",
      a: "BSCI (Business Social Compliance Initiative) is not a product certification but a factory social audit. It verifies that the factory meets international standards for worker rights, fair wages, safe working conditions, and environmental protection. While not legally required, major retailers like Walmart, Target, and European chains increasingly require their suppliers to hold BSCI or equivalent social compliance audits.",
    },
    {
      q: "How does LovelyJoy ensure plush toy safety during production?",
      a: "LovelyJoy implements a 5-stage quality control process: (1) Incoming Quality Control tests all raw materials, (2) First Article Inspection verifies the first production piece, (3) In-Process Quality Control with regular line inspections, (4) Final Quality Control with 100% inspection of finished products, and (5) Outgoing Quality Control before shipment. We also use metal detectors on all finished products and conduct regular third-party lab testing.",
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

export default async function SafetyCertificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const nav = await getTranslations({ locale, namespace: "nav" });

  const certifications = [
    {
      name: "BSCI",
      fullName: isZh
        ? "商业社会合规倡议"
        : "Business Social Compliance Initiative",
      type: isZh ? "工厂社会责任审核" : "Factory Social Audit",
      markets: isZh ? "全球（主要欧洲零售商要求）" : "Global (mainly required by European retailers)",
      whatItTests: isZh
        ? "工人权益保障、公平工资、工作时间、安全工作条件、禁止童工和强迫劳动、环境保护措施。BSCI审核基于国际劳工组织(ILO)公约和联合国指导原则。"
        : "Worker rights protection, fair wages, working hours, safe working conditions, prohibition of child labor and forced labor, and environmental protection measures. BSCI audits are based on ILO conventions and UN Guiding Principles.",
      whyItMatters: isZh
        ? "证明工厂在社会责任方面符合国际标准。沃尔玛、Target和多数欧洲零售商要求供应商通过BSCI或同等社会合规审核。"
        : "Demonstrates that the factory meets international social responsibility standards. Walmart, Target, and most European retailers require suppliers to pass BSCI or equivalent social compliance audits.",
    },
    {
      name: "ISO 9001",
      fullName: isZh
        ? "质量管理体系认证"
        : "Quality Management System Certification",
      type: isZh ? "质量管理体系" : "Quality Management System",
      markets: isZh ? "全球通用" : "Globally recognized",
      whatItTests: isZh
        ? "质量管理体系的建立、实施和持续改进。包括文件管理、过程控制、内部审核、纠正措施、管理评审等环节。"
        : "Establishment, implementation, and continuous improvement of the quality management system. Covers document management, process control, internal audits, corrective actions, and management reviews.",
      whyItMatters: isZh
        ? "证明工厂拥有标准化的质量管理流程，能够持续稳定地生产合格产品。是客户评估供应商管理能力的重要依据。"
        : "Proves the factory has standardized quality management processes capable of consistently producing conforming products. A key indicator for clients evaluating supplier management capability.",
    },
    {
      name: "CE",
      fullName: isZh ? "欧盟合格认证" : "Conformit\u00e9 Europ\u00e9enne",
      type: isZh ? "产品安全认证" : "Product Safety Certification",
      markets: isZh
        ? "欧盟 (EU) + 欧洲经济区 (EEA)"
        : "European Union (EU) + European Economic Area (EEA)",
      whatItTests: isZh
        ? "CE标志表示产品符合所有适用的欧盟指令。对于玩具，需满足EN 71安全标准、REACH化学物质法规（限制有害化学物质）、以及2009/48/EC玩具安全指令的所有要求。"
        : "CE marking indicates the product complies with all applicable EU directives. For toys, this means meeting EN 71 safety standards, REACH chemical regulations (restricting harmful chemicals), and all requirements of the 2009/48/EC Toy Safety Directive.",
      whyItMatters: isZh
        ? "CE标志是在欧盟和欧洲经济区销售玩具产品的法律强制要求。没有CE标志的玩具不得在欧洲市场销售。"
        : "CE marking is a legal requirement for selling toy products in the EU and EEA. Toys without CE marking cannot be sold in the European market.",
    },
    {
      name: "ASTM F963",
      fullName: isZh
        ? "美国玩具安全标准"
        : "Standard Consumer Safety Specification for Toy Safety",
      type: isZh ? "产品安全标准" : "Product Safety Standard",
      markets: isZh ? "美国" : "United States",
      whatItTests: isZh
        ? "机械和物理性能（小部件、锐利边缘、眼鼻拉力强度）、易燃性（表面闪燃、固体燃烧速率）、化学成分（铅、邻苯二甲酸盐、重金属含量）、电气安全、以及标签要求。"
        : "Mechanical and physical properties (small parts, sharp edges, eye/nose pull strength), flammability (surface flash, solid burn rate), chemical content (lead, phthalates, heavy metals), electrical safety, and labeling requirements.",
      whyItMatters: isZh
        ? "ASTM F963是美国消费品安全改进法案(CPSIA)引用的核心玩具安全标准。所有在美国销售的玩具必须符合此标准，且需经CPSC认可的第三方实验室测试。"
        : "ASTM F963 is the core toy safety standard referenced by the U.S. Consumer Product Safety Improvement Act (CPSIA). All toys sold in the USA must comply and be tested by a CPSC-accepted third-party laboratory.",
    },
    {
      name: "EN 71",
      fullName: isZh ? "欧盟玩具安全标准" : "European Toy Safety Standard",
      type: isZh ? "产品安全标准" : "Product Safety Standard",
      markets: isZh ? "欧盟 + 欧洲经济区" : "European Union + European Economic Area",
      whatItTests: isZh
        ? "EN 71分为多个部分：Part 1 机械和物理性能（跌落测试、拉力测试、压缩测试）、Part 2 易燃性（表面燃烧速率、毛发可燃性）、Part 3 特定元素迁移（19种有害元素限量）。还包括有机化合物、活动场所中的玩具等专项测试。"
        : "EN 71 has multiple parts: Part 1 Mechanical & Physical Properties (drop tests, tension tests, compression tests), Part 2 Flammability (surface burning rate, hair flammability), Part 3 Migration of Certain Elements (limits for 19 harmful elements). Also includes tests for organic compounds and playground equipment.",
      whyItMatters: isZh
        ? "EN 71是CE认证的核心组成部分，是所有在欧盟销售的玩具必须通过的安全标准。不符合EN 71标准的玩具无法取得CE标志。"
        : "EN 71 is a core component of CE certification and mandatory for all toys sold in the EU. Toys that do not meet EN 71 standards cannot obtain CE marking.",
    },
    {
      name: "GB 6675",
      fullName: isZh ? "中国国家玩具安全标准" : "China National Toy Safety Standard",
      type: isZh ? "国家强制性标准" : "Mandatory National Standard",
      markets: isZh ? "中国" : "China",
      whatItTests: isZh
        ? "等同采用ISO 8124国际标准。GB 6675分为4个部分：基本规范、机械和物理性能、易燃性能、特定元素迁移。涵盖材料清洁度、填充物卫生、标识标注等中国市场特有要求。"
        : "Equivalent to ISO 8124 international standard. GB 6675 has 4 parts: basic specifications, mechanical & physical properties, flammability, and migration of certain elements. Includes China-specific requirements for material cleanliness, filling hygiene, and labeling.",
      whyItMatters: isZh
        ? "GB 6675是中国市场的强制性国家标准。所有在中国境内销售的玩具产品必须符合此标准并通过强制性产品认证(CCC)。"
        : "GB 6675 is a mandatory national standard for the Chinese market. All toy products sold in China must comply with this standard and pass China Compulsory Certification (CCC).",
    },
  ];

  const marketCertMap = [
    {
      market: isZh ? "美国" : "United States",
      required: ["ASTM F963", "CPSIA"],
      recommended: ["BSCI", "ISO 9001"],
    },
    {
      market: isZh ? "欧盟" : "European Union",
      required: ["CE", "EN 71", "REACH"],
      recommended: ["BSCI", "ISO 9001"],
    },
    {
      market: isZh ? "中国" : "China",
      required: ["GB 6675", "CCC"],
      recommended: ["ISO 9001"],
    },
    {
      market: isZh ? "日本" : "Japan",
      required: ["ST Mark (ST-2016)"],
      recommended: ["ISO 9001", "BSCI"],
    },
    {
      market: isZh ? "澳大利亚" : "Australia",
      required: ["AS/NZS ISO 8124"],
      recommended: ["ISO 9001"],
    },
  ];

  const testingProcess = [
    {
      title: isZh ? "材料入库检测" : "Raw Material Testing",
      desc: isZh
        ? "所有面料和填充物入库前送第三方实验室进行化学成分检测，确保铅、邻苯二甲酸盐、偶氮染料等有害物质含量符合标准。"
        : "All fabrics and fillings are sent to third-party labs for chemical composition testing before storage, ensuring lead, phthalate, azo dye, and other harmful substance levels meet standards.",
    },
    {
      title: isZh ? "物理性能测试" : "Physical Property Testing",
      desc: isZh
        ? "对样品进行拉力测试（眼睛、鼻子、小部件）、跌落测试、压缩测试，确保产品在正常使用和可预见的误用中安全。"
        : "Samples undergo pull strength tests (eyes, noses, small parts), drop tests, and compression tests, ensuring products are safe during normal use and foreseeable misuse.",
    },
    {
      title: isZh ? "易燃性测试" : "Flammability Testing",
      desc: isZh
        ? "测试毛绒面料的表面闪燃性和燃烧速率，确保材料不会快速燃烧，符合目标市场的防火安全要求。"
        : "Test plush fabric surface flash and burn rate to ensure materials do not burn rapidly, meeting fire safety requirements of target markets.",
    },
    {
      title: isZh ? "批次抽检送检" : "Batch Sampling & Lab Testing",
      desc: isZh
        ? "每个生产批次按比例抽样，送SGS、Bureau Veritas或Intertek等国际权威第三方检测机构进行全套安全测试。"
        : "Proportional sampling from each production batch sent to SGS, Bureau Veritas, or Intertek for comprehensive safety testing by internationally recognized third-party labs.",
    },
    {
      title: isZh ? "金属检测" : "Metal Detection",
      desc: isZh
        ? "所有成品通过金属检测仪扫描，排除生产过程中可能混入的断针和金属异物，确保产品安全。"
        : "All finished products pass through metal detectors to eliminate broken needles and metal foreign objects that may have been introduced during production.",
    },
  ];

  return (
    <>
      <FaqJsonLd />

      {/* Hero */}
      <section className="bg-gradient-to-br from-bg-warm to-white py-20 md:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold text-brown md:text-5xl">
              {isZh
                ? "毛绒玩具安全标准与认证"
                : "Plush Toy Safety Standards & Certifications"}
            </h1>
            <p className="mt-4 text-lg text-brown/70 md:text-xl">
              {isZh
                ? "通过6项国际权威认证，确保每一件毛绒玩具的安全与品质"
                : "6 international certifications ensuring the safety and quality of every plush toy"}
            </p>
          </div>
        </Container>
      </section>

      {/* Breadcrumb */}
      <Container>
        <Breadcrumb
          locale={locale}
          items={[
            { label: nav("home"), href: "/" },
            {
              label: isZh ? "安全认证" : "Safety Certifications",
            },
          ]}
        />
      </Container>

      {/* Certification Details */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "认证详解" : "Certification Details"}
            subtitle={
              isZh
                ? "了解每项认证的测试内容、适用市场和重要性"
                : "Understanding what each certification tests, where it applies, and why it matters"
            }
          />
          <div className="space-y-8">
            {certifications.map((cert) => (
              <div
                key={cert.name}
                className="rounded-2xl border border-brown/10 bg-white p-6 md:p-8 shadow-sm"
                id={cert.name.toLowerCase().replace(/\s+/g, "-")}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-brand/10">
                    <Shield className="h-7 w-7 text-sky-brand" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-brown">
                      {cert.name}
                    </h2>
                    <p className="text-sm text-brown-light">{cert.fullName}</p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-brown/60">
                      <FlaskConical className="h-4 w-4" />
                      {isZh ? "测试内容" : "What It Tests"}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-brown-light">
                      {cert.whatItTests}
                    </p>
                  </div>
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-brown/60">
                      <CheckCircle className="h-4 w-4" />
                      {isZh ? "为什么重要" : "Why It Matters"}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-brown-light">
                      {cert.whyItMatters}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-warm px-3 py-1 text-xs font-medium text-brown">
                    <Globe className="h-3.5 w-3.5" />
                    {cert.markets}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-brand/10 px-3 py-1 text-xs font-medium text-sky-brand">
                    {cert.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Market Requirements */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading
            title={
              isZh
                ? "各市场认证要求"
                : "Certification Requirements by Market"
            }
            subtitle={
              isZh
                ? "不同市场的强制认证和推荐认证一览"
                : "Overview of mandatory and recommended certifications for different markets"
            }
          />
          <div className="mx-auto max-w-3xl">
            <div className="overflow-hidden rounded-2xl border border-brown/10 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brown/10 bg-bg-warm">
                    <th className="px-4 py-3 text-left font-bold text-brown">
                      {isZh ? "市场" : "Market"}
                    </th>
                    <th className="px-4 py-3 text-left font-bold text-brown">
                      {isZh ? "强制认证" : "Required"}
                    </th>
                    <th className="px-4 py-3 text-left font-bold text-brown">
                      {isZh ? "推荐认证" : "Recommended"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {marketCertMap.map((row, index) => (
                    <tr
                      key={row.market}
                      className={
                        index < marketCertMap.length - 1
                          ? "border-b border-brown/5"
                          : ""
                      }
                    >
                      <td className="px-4 py-3 font-semibold text-brown">
                        {row.market}
                      </td>
                      <td className="px-4 py-3 text-brown-light">
                        {row.required.join(", ")}
                      </td>
                      <td className="px-4 py-3 text-brown-light">
                        {row.recommended.join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Container>
      </section>

      {/* Our Testing Process */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "我们的测试流程" : "Our Testing Process"}
            subtitle={
              isZh
                ? "从原材料到成品的全链条安全检测"
                : "Full-chain safety testing from raw materials to finished products"
            }
          />
          <div className="mx-auto max-w-3xl space-y-6">
            {testingProcess.map((item, index) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-brand text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  {index < testingProcess.length - 1 && (
                    <div className="w-0.5 flex-1 bg-sky-brand/20 mt-2" />
                  )}
                </div>
                <div className="pb-4">
                  <h3 className="font-bold text-brown">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-brown-light">
                    {item.desc}
                  </p>
                </div>
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
                ? "需要认证合规的毛绒玩具？"
                : "Need Certified Plush Toys?"}
            </h2>
            <p className="mt-4 text-lg text-white/80">
              {isZh
                ? "联系我们了解目标市场的认证要求，获取符合安全标准的毛绒玩具报价方案。"
                : "Contact us to understand your target market's certification requirements and receive a quote for safety-compliant plush toys."}
            </p>
            <div className="mt-8">
              <Button href="/contact" variant="secondary" size="lg">
                {isZh ? "咨询安全认证" : "Inquire About Certifications"}
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
