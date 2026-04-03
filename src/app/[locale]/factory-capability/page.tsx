import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import {
  Factory,
  Users,
  Zap,
  Shield,
  CheckCircle,
  ClipboardCheck,
  Eye,
  Microscope,
  PackageCheck,
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
      ? "工厂实力与生产能力 | LovelyJoy 爱儿采"
      : "Factory Capability & Production Capacity | LovelyJoy",
    description: isZh
      ? "LovelyJoy爱儿采毛绒玩具工厂：20000平米生产基地，300+工人，月产能50万件。5道质检工序，BSCI、ISO 9001认证。了解我们的生产线和品控体系。"
      : "LovelyJoy plush toy factory: 20,000sqm facility, 300+ workers, 500K+ monthly capacity. 5-stage QC process, BSCI & ISO 9001 certified. Learn about our production lines and quality control system.",
    alternates: {
      canonical: `/${locale}/factory-capability`,
      languages: {
        zh: "/zh/factory-capability",
        en: "/en/factory-capability",
        "x-default": "/en/factory-capability",
      },
    },
  };
}

// --------------- Page ---------------

export default async function FactoryCapabilityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isZh = locale === "zh";
  const nav = await getTranslations({ locale, namespace: "nav" });

  const factoryStats = [
    {
      icon: Factory,
      value: "20,000",
      unit: isZh ? "平方米" : "sqm",
      label: isZh ? "厂房面积" : "Factory Area",
    },
    {
      icon: Users,
      value: "300+",
      unit: "",
      label: isZh ? "熟练工人" : "Skilled Workers",
    },
    {
      icon: Zap,
      value: "500K+",
      unit: isZh ? "件/月" : "pcs/month",
      label: isZh ? "月产能" : "Monthly Capacity",
    },
    {
      icon: Shield,
      value: "50+",
      unit: "",
      label: isZh ? "专业设计师" : "Professional Designers",
    },
  ];

  const qcStages = [
    {
      icon: ClipboardCheck,
      title: isZh ? "来料检验 (IQC)" : "Incoming Quality Control (IQC)",
      desc: isZh
        ? "所有原材料入库前进行严格检验，包括面料色牢度、填充物成分、配件安全性测试。不合格材料100%退回供应商。"
        : "All raw materials undergo strict inspection before storage, including fabric color fastness, filling composition, and accessory safety tests. Non-conforming materials are 100% returned to suppliers.",
    },
    {
      icon: Eye,
      title: isZh ? "首件检验 (FAI)" : "First Article Inspection (FAI)",
      desc: isZh
        ? "批量生产前对首件样品进行全方位检验，确认尺寸、颜色、工艺细节完全符合确认样标准。"
        : "Comprehensive inspection of the first production sample before mass production, confirming dimensions, colors, and craftsmanship match the approved sample.",
    },
    {
      icon: Microscope,
      title: isZh ? "过程检验 (IPQC)" : "In-Process Quality Control (IPQC)",
      desc: isZh
        ? "在裁剪、缝制、充棉、手工等关键工序设置质检点，巡检员定时抽检，发现问题即时纠正。"
        : "Quality checkpoints at key processes — cutting, sewing, stuffing, and handwork. Inspectors conduct regular sampling to detect and correct issues immediately.",
    },
    {
      icon: PackageCheck,
      title: isZh ? "成品检验 (FQC)" : "Final Quality Control (FQC)",
      desc: isZh
        ? "100%成品全检，检查外观、尺寸、缝合牢度、填充均匀度、标签正确性。使用金属检测仪排除异物。"
        : "100% finished product inspection checking appearance, dimensions, seam strength, fill evenness, and label accuracy. Metal detectors eliminate foreign objects.",
    },
    {
      icon: CheckCircle,
      title: isZh ? "出货前检验 (OQC)" : "Outgoing Quality Control (OQC)",
      desc: isZh
        ? "按AQL标准抽检或100%全检，核对装箱数量、包装完整性、唛头信息。出具检验报告随货发送。"
        : "AQL sampling or 100% inspection, verifying packing quantities, packaging integrity, and shipping mark accuracy. Inspection reports issued with every shipment.",
    },
  ];

  const productionLines = [
    {
      title: isZh ? "裁剪车间" : "Cutting Workshop",
      desc: isZh
        ? "自动化裁床和激光裁剪设备，确保面料裁片精度。每日裁剪产能满足大批量生产需求。"
        : "Automated cutting beds and laser cutting equipment ensuring fabric piece precision. Daily cutting capacity supports large-volume production.",
    },
    {
      title: isZh ? "绣花车间" : "Embroidery Workshop",
      desc: isZh
        ? "多头电脑绣花机，支持复杂图案刺绣和品牌Logo定制。色线种类齐全，Pantone色精准匹配。"
        : "Multi-head computerized embroidery machines supporting complex pattern embroidery and brand logo customization. Complete thread color range with Pantone matching.",
    },
    {
      title: isZh ? "缝制车间" : "Sewing Workshop",
      desc: isZh
        ? "200+台工业缝纫机，按产品类型分流水线作业。经验丰富的缝纫工确保针距均匀、缝合牢固。"
        : "200+ industrial sewing machines organized in production lines by product type. Experienced sewers ensure even stitch spacing and strong seams.",
    },
    {
      title: isZh ? "充棉车间" : "Stuffing Workshop",
      desc: isZh
        ? "自动充棉机配合手工整形，确保填充物分布均匀、触感一致。支持PP棉、记忆棉、重力球等多种填充。"
        : "Automatic stuffing machines combined with manual shaping ensure even fill distribution and consistent feel. Supports PP cotton, memory foam, weighted beads, and more.",
    },
    {
      title: isZh ? "整形包装车间" : "Shaping & Packing Workshop",
      desc: isZh
        ? "手工整形、质检、挂标签、装袋/装箱一条龙作业。确保每件产品以最佳状态出厂。"
        : "Hand shaping, quality inspection, tag attachment, and bagging/boxing in a streamlined process. Every product leaves the factory in perfect condition.",
    },
  ];

  const certifications = [
    {
      name: "BSCI",
      desc: isZh
        ? "商业社会合规倡议——证明工厂在劳工权益、工作条件、环境保护等方面符合国际标准"
        : "Business Social Compliance Initiative — certifies the factory meets international standards for labor rights, working conditions, and environmental protection",
    },
    {
      name: "ISO 9001",
      desc: isZh
        ? "质量管理体系认证——证明工厂建立了标准化的质量管理流程和持续改进机制"
        : "Quality Management System certification — confirms the factory has standardized quality management processes and continuous improvement mechanisms",
    },
    {
      name: "CE",
      desc: isZh
        ? "欧盟合格认证——产品符合欧盟安全、健康和环保要求，可在欧洲经济区自由销售"
        : "European Conformity marking — products meet EU safety, health, and environmental requirements for free sale in the European Economic Area",
    },
    {
      name: "ASTM F963",
      desc: isZh
        ? "美国玩具安全标准——涵盖机械物理性能、易燃性、化学成分等全面安全测试"
        : "U.S. Toy Safety Standard — covers mechanical/physical properties, flammability, and chemical composition in comprehensive safety testing",
    },
    {
      name: "EN 71",
      desc: isZh
        ? "欧盟玩具安全标准——包括机械物理性能、易燃性、特定元素迁移等严格测试"
        : "EU Toy Safety Standard — includes strict testing for mechanical/physical properties, flammability, and specific element migration",
    },
    {
      name: "GB 6675",
      desc: isZh
        ? "中国国家玩具安全标准——等同采用ISO 8124国际标准，是进入中国市场的必备认证"
        : "China National Toy Safety Standard — equivalent to ISO 8124, mandatory for products sold in the Chinese market",
    },
  ];

  return (
    <>
      {/* Hero with factory image */}
      <section className="relative h-72 md:h-96 flex items-center justify-center overflow-hidden">
        <Image
          src="/images/store/factory.jpeg"
          alt={isZh ? "LovelyJoy毛绒玩具工厂" : "LovelyJoy Plush Toy Factory"}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            {isZh ? "工厂实力与生产能力" : "Factory Capability & Production Capacity"}
          </h1>
          <p className="text-lg md:text-xl text-white/80">
            {isZh
              ? "20000平米现代化毛绒玩具生产基地"
              : "20,000sqm modern plush toy production facility"}
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <Container>
        <Breadcrumb
          items={[
            { label: nav("home"), href: "/" },
            {
              label: isZh ? "工厂实力" : "Factory Capability",
            },
          ]}
        />
      </Container>

      {/* Factory Stats */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {factoryStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-brand/10">
                  <stat.icon className="h-7 w-7 text-sky-brand" />
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-brown">
                    {stat.value}
                  </span>
                  {stat.unit && (
                    <span className="ml-1 text-sm text-brown-light">
                      {stat.unit}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm font-medium text-brown-light">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Factory Overview */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading
            title={isZh ? "工厂概况" : "Factory Overview"}
          />
          <div className="mx-auto max-w-3xl">
            <p className="text-lg leading-relaxed text-brown-light">
              {isZh
                ? "LovelyJoy爱儿采毛绒玩具工厂位于中国浙江省义乌市，2003年成立至今已有20多年历史。工厂占地20000平方米，拥有现代化的生产设备和完善的质量管理体系。工厂现有300多名熟练工人和50多名专业设计师，月产能超过50万件毛绒玩具。我们的产品出口至全球30多个国家和地区，长期服务CVS、Burlington、Kellytoy、Miniso国际、凯蓝等知名品牌客户。"
                : "LovelyJoy's plush toy factory is located in Yiwu, Zhejiang Province, China. Founded in 2003, we have over 20 years of manufacturing experience. The factory covers 20,000 square meters with modern production equipment and a comprehensive quality management system. With 300+ skilled workers and 50+ professional designers, our monthly capacity exceeds 500,000 plush toys. Our products are exported to over 30 countries and regions, serving established brands including CVS, Burlington, Kellytoy, Miniso International, and The Green Party."}
            </p>
          </div>
        </Container>
      </section>

      {/* Production Lines */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "生产线介绍" : "Production Lines"}
            subtitle={
              isZh
                ? "从裁剪到包装的完整生产流水线"
                : "Complete production flow from cutting to packing"
            }
          />
          <div className="mx-auto max-w-3xl space-y-6">
            {productionLines.map((line, index) => (
              <div
                key={line.title}
                className="flex gap-4 rounded-2xl bg-bg-warm p-6"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-brand text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brown">{line.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brown-light">
                    {line.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Factory Photos */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading
            title={isZh ? "工厂实拍" : "Factory Photos"}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="/images/store/factory.jpeg"
                alt={isZh ? "LovelyJoy毛绒玩具工厂外景" : "LovelyJoy plush toy factory exterior"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <p className="text-sm font-semibold text-white">
                  {isZh ? "生产基地" : "Production Base"}
                </p>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="/images/store/store-wide.jpeg"
                alt={isZh ? "LovelyJoy产品展厅" : "LovelyJoy product showroom"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <p className="text-sm font-semibold text-white">
                  {isZh ? "产品展厅" : "Product Showroom"}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Quality Control Process */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <SectionHeading
            title={isZh ? "五道质检工序" : "5-Stage Quality Control Process"}
            subtitle={
              isZh
                ? "从原材料到成品，全流程品质管控"
                : "End-to-end quality management from raw materials to finished products"
            }
          />
          <div className="mx-auto max-w-3xl space-y-6">
            {qcStages.map((stage) => (
              <div
                key={stage.title}
                className="flex items-start gap-4 rounded-2xl border border-brown/10 bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-brand/10">
                  <stage.icon className="h-6 w-6 text-sky-brand" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brown">
                    {stage.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-brown-light">
                    {stage.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Certifications */}
      <section className="py-16 md:py-24 bg-bg-warm">
        <Container>
          <SectionHeading
            title={isZh ? "资质认证" : "Certifications"}
            subtitle={
              isZh
                ? "通过多项国际权威认证，产品畅销全球"
                : "Internationally certified, products sold worldwide"
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certifications.map((cert) => (
              <div
                key={cert.name}
                className="flex items-start gap-4 rounded-2xl bg-white p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-brand/10">
                  <Shield className="h-5 w-5 text-sky-brand" />
                </div>
                <div>
                  <h3 className="font-bold text-brown">{cert.name}</h3>
                  <p className="mt-1 text-sm text-brown-light">{cert.desc}</p>
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
              {isZh ? "参观我们的工厂" : "Visit Our Factory"}
            </h2>
            <p className="mt-4 text-lg text-white/80">
              {isZh
                ? "欢迎预约参观我们位于义乌的毛绒玩具工厂，亲身体验我们的生产能力和品质管控体系。"
                : "Schedule a visit to our plush toy factory in Yiwu, China. Experience our production capability and quality control system firsthand."}
            </p>
            <div className="mt-8">
              <Button href="/contact" variant="secondary" size="lg">
                {isZh ? "预约参观工厂" : "Schedule a Factory Visit"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-4 text-sm text-white/60">
              {isZh
                ? "地址: 浙江省义乌市廿三里思源路8号 | 电话: +86 15957988866"
                : "Address: No.8 Siyuan Road, Niansan Li, Yiwu, Zhejiang, China | Phone: +86 15957988866"}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
