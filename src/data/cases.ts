export type CaseSegment =
  | "licensed-ip"
  | "global-retail"
  | "lifestyle-retail"
  | "experience-retail"
  | "startup-brand"
  | "promotional";

export interface CaseStudy {
  slug: string;
  segment: CaseSegment;
  titleEn: string;
  titleZh: string;
  summaryEn: string;
  summaryZh: string;
  clientTypeEn: string;
  clientTypeZh: string;
  scopeEn: string[];
  scopeZh: string[];
  challengeEn: string;
  challengeZh: string;
  solutionEn: string[];
  solutionZh: string[];
  outcomeEn: string[];
  outcomeZh: string[];
  image: string;
  referenceClients?: string[];
  tags: string[];

  // ── E-E-A-T enrichment (P3) ──
  regionEn: string;
  regionZh: string;
  // Procurement KPIs surfaced as a metrics strip. Values are derived from the
  // real project outcomes already documented above — no invented numbers.
  metrics: { labelEn: string; labelZh: string; valueEn: string; valueZh: string }[];
  // Honest disclosure of how clients are named vs. anonymized.
  confidentialityNoteEn: string;
  confidentialityNoteZh: string;
  // TODO(business): add a REAL, attributable buyer quote per case when you have
  // one you can publish. Leave undefined until then — never invent a quote.
  quoteEn?: string;
  quoteZh?: string;
  quoteAttributionEn?: string;
  quoteAttributionZh?: string;
}

const STANDARD_DISCLOSURE_EN =
  "Reference clients shown are publicly acknowledged partnerships. Specific order volumes, pricing, and per-project documents are shared with qualified buyers under NDA.";
const STANDARD_DISCLOSURE_ZH =
  "所列参考客户为已公开的合作关系。具体订单量、价格及单项目文档将在签署保密协议后向合格买家提供。";

export const cases: CaseStudy[] = [
  {
    slug: "licensed-ip-plush-manufacturing",
    segment: "licensed-ip",
    titleEn: "Licensed IP Plush Manufacturing",
    titleZh: "IP 授权毛绒玩具生产",
    summaryEn: "Producing plush under licensor-controlled QC for globally recognised character IPs.",
    summaryZh: "为全球知名 IP 按授权方 QC 标准生产毛绒衍生品。",
    clientTypeEn: "Licensed IP programs including Sanrio (Hello Kitty), Disney (Paw Patrol), Illumination (Minions).",
    clientTypeZh: "合作过的授权方项目：Sanrio Hello Kitty、Disney 汪汪队立大功、Illumination 小黄人等。",
    scopeEn: [
      "Production under licensor style guides, colour standards, and safety specs",
      "Approval rounds with licensor QA teams before mass production",
      "Export-ready compliance (EN 71, ASTM F963, CCPSA) across retail markets",
    ],
    scopeZh: [
      "按授权方 style guide、色彩标准和安全规格生产",
      "大货前与授权方 QA 团队走完审批流程",
      "覆盖多个零售市场的出口合规（EN 71 / ASTM F963 / CCPSA）",
    ],
    challengeEn:
      "Licensed IP manufacturing requires zero deviation on character features, precise colour matching, and full traceability. Licensors reject production runs for issues as small as 0.5 mm on a character's eye position. On top of that, every unit must clear multi-market safety compliance (EN 71, ASTM F963, CCPSA) and pass the licensor's own QA approval rounds before mass production is even allowed to start.",
    challengeZh:
      "IP 授权生产对角色特征零容忍：眼距偏差 0.5 毫米、色号漂移半档都会被授权方退回整批。同时要求完整可追溯。此外，每件产品还必须满足多市场安全合规（EN 71 / ASTM F963 / CCPSA），并在量产开始前走完授权方自己的 QA 审批流程。",
    solutionEn: [
      "Dedicated licensor-project pattern team maintains frozen pattern files per character",
      "Pre-production gold sample co-signed by our QC + licensor representative",
      "Fabric and thread lots colour-checked against the licensor's colour standards at incoming inspection, before they ever reach the cutting line",
      "5-stage in-line inspection with photo reports archived per carton",
      "Carton-level records tie every shipment back to its inspected production batch, giving licensors the full traceability their audits require",
    ],
    solutionZh: [
      "授权项目专属版型团队，每个角色锁定冻结版型档案",
      "产前金样由我方 QC 与授权方代表共同签字",
      "面料与色线批次在来料检验阶段即比对授权方色彩标准，不合格不上裁床",
      "5 道在线质检，每箱留存照片报告存档",
      "箱级记录将每批出货追溯到对应的已检生产批次，满足授权方审计的完整可追溯要求",
    ],
    outcomeEn: [
      "Multi-year recurring partner for major IP holders",
      "Zero licensor-initiated production recalls on record",
      "Rapid turnaround on new character launches — from artwork to first sample within 15 days",
    ],
    outcomeZh: [
      "主要 IP 持有方的多年持续合作伙伴",
      "无授权方发起的大货召回记录",
      "新角色上市快速响应——从美术稿到首样 15 天内交付",
    ],
    image: "/images/products/collection.jpeg",
    referenceClients: ["Sanrio", "Disney", "Illumination"],
    regionEn: "Global (licensor-controlled markets)",
    regionZh: "全球（授权方控制市场）",
    metrics: [
      { labelEn: "Artwork → first sample", labelZh: "美术稿→首样", valueEn: "15 days", valueZh: "15 天" },
      { labelEn: "Licensor-initiated recalls", labelZh: "授权方发起召回", valueEn: "0 on record", valueZh: "0 记录" },
      { labelEn: "Partnership length", labelZh: "合作时长", valueEn: "Multi-year", valueZh: "多年" },
    ],
    confidentialityNoteEn: STANDARD_DISCLOSURE_EN,
    confidentialityNoteZh: STANDARD_DISCLOSURE_ZH,
    tags: ["Licensed IP", "Character plush", "Export compliance"],
  },
  {
    slug: "global-retail-seasonal-program",
    segment: "global-retail",
    titleEn: "Seasonal Plush for Global Retail Chains",
    titleZh: "全球连锁零售的季节性毛绒项目",
    summaryEn: "End-to-end seasonal plush programs — concept to shelf — for large US retail chains.",
    summaryZh: "为美国大型连锁零售提供从概念到上架的季节性毛绒项目。",
    clientTypeEn: "US department store and drugstore chains sourcing seasonal collections (Valentine's, Easter, Halloween, Christmas).",
    clientTypeZh: "美国百货与药店连锁，采购情人节 / 复活节 / 万圣节 / 圣诞节等季节系列。",
    scopeEn: [
      "Multi-SKU seasonal collections (20-80 SKUs per season)",
      "Retail-ready packaging (poly bag, header card, hang tag, case pack)",
      "FOB and LDP shipment with full export documentation",
    ],
    scopeZh: [
      "多 SKU 季节性集合（每季 20-80 个 SKU）",
      "零售即用包装（OPP 袋、卡头、吊牌、装箱规格）",
      "FOB 与 LDP 出口，附完整清关文档",
    ],
    challengeEn:
      "Big-box retailers plan 10+ months ahead and expect zero-defect shipments with exact on-shelf dates. A missed vessel cut-off can cost the buyer an entire season. Seasonal collections also compress 20-80 SKUs into a narrow production window, so factory capacity has to be reserved long before final purchase orders are cut.",
    challengeZh:
      "大型连锁零售 10 个月前就开始排单，要求零缺陷交付并精准卡上架日期。错过一次开船就是一整季报废。季节系列还把每季 20-80 个 SKU 压缩在极窄的生产窗口内，产能必须在正式订单下达前很久就锁定。",
    solutionEn: [
      "Vendor-managed calendar synced to the retailer's planogram",
      "Pre-booked factory capacity with 6-month rolling forecast",
      "Forecast-driven line planning converts the rolling forecast into reserved production slots ahead of each seasonal peak",
      "Production and packing staggered by on-shelf date, so retail-ready cartons (poly bag, header card, case pack) ship in planogram sequence",
      "100% pre-shipment inspection with retailer-approved QC standards",
    ],
    solutionZh: [
      "按零售商货架规划同步的供应商交付日历",
      "提前 6 个月滚动预测并锁定产能",
      "以滚动预测驱动排产，在每个季节高峰前把预测转化为预留的生产档期",
      "按上架日期分批生产与包装，零售即用箱（OPP 袋、卡头、装箱规格）按货架顺序出运",
      "按零售商 QC 标准执行 100% 出货前全检",
    ],
    outcomeEn: [
      "On-time vessel performance kept above 98%",
      "Recurring seasonal programs across multiple retail accounts",
      "Complete retail-vendor documentation on file for fast onboarding",
    ],
    outcomeZh: [
      "准时开船率保持 98% 以上",
      "多个零售账户的循环季节性项目",
      "零售供应商文档归档完整，新账户入库快速通过审核",
    ],
    image: "/images/store/storefront.jpeg",
    referenceClients: ["CVS", "Burlington"],
    regionEn: "United States",
    regionZh: "美国",
    metrics: [
      { labelEn: "On-time vessel rate", labelZh: "准时开船率", valueEn: ">98%", valueZh: ">98%" },
      { labelEn: "SKUs per season", labelZh: "每季 SKU 数", valueEn: "20-80", valueZh: "20-80" },
      { labelEn: "Capacity forecast", labelZh: "产能预测", valueEn: "6-month rolling", valueZh: "6 个月滚动" },
    ],
    confidentialityNoteEn: STANDARD_DISCLOSURE_EN,
    confidentialityNoteZh: STANDARD_DISCLOSURE_ZH,
    tags: ["Retail", "Seasonal", "Big-box"],
  },
  {
    slug: "lifestyle-retail-global-supply",
    segment: "lifestyle-retail",
    titleEn: "Lifestyle Retail Global Supply",
    titleZh: "生活方式零售全球供货",
    summaryEn: "High-volume plush SKUs for international lifestyle retail chains.",
    summaryZh: "为国际生活方式零售连锁供应大批量毛绒 SKU。",
    clientTypeEn: "Global lifestyle retail chains with thousands of stores and rapid product turnover.",
    clientTypeZh: "全球生活方式零售连锁——数千家门店、高频上新的采购特性。",
    scopeEn: [
      "Trend-driven plush SKUs with 4-8 week replenishment cycles",
      "Competitive pricing for mass retail shelf points",
      "Consistent quality across high-volume production runs",
    ],
    scopeZh: [
      "契合趋势的毛绒 SKU，4-8 周补货循环",
      "契合连锁零售价位段的有竞争力价格",
      "大批量生产下的稳定质量",
    ],
    challengeEn:
      "Lifestyle retail runs on narrow margins, tight lead times, and unforgiving quality expectations. Chain-wide replenishment outages damage trust with buyers. With 4-8 week replenishment cycles feeding thousands of stores, there is no slack in the calendar to absorb a material shortage or a rework loop.",
    challengeZh:
      "生活方式零售利润空间窄、交期紧、对质量零容忍。全链补货断档会严重影响采购信任。4-8 周的补货循环要支撑数千家门店，日历上没有任何余量去消化缺料或返工。",
    solutionEn: [
      "Dedicated production lines for repeat-buy SKUs",
      "Rolling stock of core materials to shorten reorder lead time",
      "Reorders slot straight onto their dedicated lines without requeuing, keeping repeat SKUs inside the 4-8 week replenishment window",
      "Monthly QC scorecard shared with buyer's audit team",
      "Peak-season capacity ramp-ups planned in advance so replenishment holds steady across multi-country distribution",
    ],
    solutionZh: [
      "回购型 SKU 配专属生产线",
      "核心材料常备滚动库存，缩短补货周期",
      "返单直接进入专属生产线排产、无需重新排队，确保回购 SKU 稳定落在 4-8 周补货窗口内",
      "月度 QC 评分表与买家审核团队同步",
      "提前规划旺季产能扩张，保障多国分销下的补货稳定",
    ],
    outcomeEn: [
      "Long-term plush supply partnership",
      "Reliable reorder performance across multi-country distribution",
      "Scalable capacity accommodating peak-season ramp-ups",
    ],
    outcomeZh: [
      "长期毛绒供应合作关系",
      "跨多国分销的可靠补货表现",
      "旺季产能可扩张的排产能力",
    ],
    image: "/images/products/animals-trio.jpeg",
    referenceClients: ["Miniso International"],
    regionEn: "Global (multi-country distribution)",
    regionZh: "全球（多国分销）",
    metrics: [
      { labelEn: "Replenishment cycle", labelZh: "补货周期", valueEn: "4-8 weeks", valueZh: "4-8 周" },
      { labelEn: "QC reporting", labelZh: "质检报告", valueEn: "Monthly scorecard", valueZh: "月度评分表" },
      { labelEn: "Relationship", labelZh: "合作关系", valueEn: "Long-term supply", valueZh: "长期供货" },
    ],
    confidentialityNoteEn: STANDARD_DISCLOSURE_EN,
    confidentialityNoteZh: STANDARD_DISCLOSURE_ZH,
    tags: ["Lifestyle retail", "High volume", "Replenishment"],
  },
  {
    slug: "experience-retail-custom-plush",
    segment: "experience-retail",
    titleEn: "Experience Retail Custom Plush",
    titleZh: "体验式零售的定制毛绒",
    summaryEn: "Bespoke plush development for retail brands where the product IS the experience.",
    summaryZh: "为'产品即体验'的零售品牌定制开发毛绒。",
    clientTypeEn: "Experience-driven retail brands where each plush is a customer-crafted or brand-crafted artefact.",
    clientTypeZh: "体验驱动型零售品牌——每只毛绒都是客户或品牌的创作载体。",
    scopeEn: [
      "Pattern engineering for handleability, stuffability, and wearables accessibility",
      "Skin-safe fabrics suitable for extended customer contact",
      "Tight tolerance on feature placement for brand consistency",
    ],
    scopeZh: [
      "针对可操作性、填充性、配件穿戴性的版型工程",
      "适合长时间接触的亲肤安全面料",
      "特征位置严格管控，保证品牌一致性",
    ],
    challengeEn:
      "Experience retail demands plush that performs in-store — survive children's play, hold shape after re-stuffing, and support branded accessories without structural damage. Because the plush stays in prolonged contact with customers' skin, fabrics must be skin-safe as well as durable. And feature placement has to hold within tight tolerances across every re-order, or the brand's in-store look slowly drifts.",
    challengeZh:
      "体验式零售对毛绒性能要求极高——要能承受儿童反复玩耍、能重新填充不变形、能稳定穿戴品牌配件。由于产品与顾客皮肤长时间接触，面料既要耐用又要亲肤安全。特征位置还必须在每一次补货中保持严格公差，否则品牌的门店形象会逐渐走样。",
    solutionEn: [
      "Reinforced seam construction tested across multiple stuffing cycles",
      "Custom fabric blends tuned for repeated handling and washing",
      "Brand-shared pattern library maintaining exact look across re-orders",
      "Feature placement verified against the shared pattern library at first article inspection on every re-order run",
      "In-line durability checks confirm seam strength and shape recovery under repeated stuffing and handling before shipment",
    ],
    solutionZh: [
      "加固缝合工艺，经多次填充循环测试",
      "定制面料组合，适应反复触摸与清洗",
      "与品牌共享版型库，保证补货外观一致",
      "每次补货生产在首件检验时对照共享版型库核验特征位置",
      "在线耐久检查确认缝合强度与反复填充、反复把玩后的回弹定型，合格后方可出货",
    ],
    outcomeEn: [
      "Plush products that perform reliably in interactive retail environments",
      "Repeatable pattern standards across multi-year programs",
      "Consistent brand look across geographies and store formats",
    ],
    outcomeZh: [
      "在互动零售环境中稳定表现的毛绒产品",
      "多年项目间保持一致的版型标准",
      "跨地域、跨门店形态的品牌外观统一",
    ],
    image: "/images/products/strawberry-bear.jpeg",
    referenceClients: ["Build-A-Bear", "Kellytoy"],
    regionEn: "Global / United States",
    regionZh: "全球 / 美国",
    metrics: [
      { labelEn: "Seam durability", labelZh: "缝合耐久", valueEn: "Multi-cycle tested", valueZh: "多次填充测试" },
      { labelEn: "Pattern consistency", labelZh: "版型一致性", valueEn: "Brand-shared library", valueZh: "品牌共享版型库" },
      { labelEn: "Fabric", labelZh: "面料", valueEn: "Skin-safe, washable", valueZh: "亲肤可洗" },
    ],
    confidentialityNoteEn: STANDARD_DISCLOSURE_EN,
    confidentialityNoteZh: STANDARD_DISCLOSURE_ZH,
    tags: ["Experience retail", "Handcrafted", "Interactive"],
  },
  {
    slug: "startup-brand-first-plush-line",
    segment: "startup-brand",
    titleEn: "Startup Brand First Plush Line",
    titleZh: "初创品牌首条毛绒产品线",
    summaryEn: "Guiding first-time plush brands from idea to shippable product, with low-MOQ trial orders.",
    summaryZh: "陪伴首次做毛绒的品牌从想法走到可上架，支持低 MOQ 试单。",
    clientTypeEn: "DTC and Amazon-native startup brands launching their first plush product line.",
    clientTypeZh: "首次推出毛绒产品线的 DTC 与 Amazon 原生初创品牌。",
    scopeEn: [
      "Design development from brief, reference images, or sketches",
      "200-piece trial orders to de-risk market testing",
      "Retail-ready Amazon FBA packaging and labelling",
    ],
    scopeZh: [
      "基于 brief、参考图或草图做设计开发",
      "200 件试单，降低市场测试风险",
      "Amazon FBA 的零售级包装和标签",
    ],
    challengeEn:
      "First-time plush brands often lack product design experience, clear MOQ economics, or knowledge of safety compliance. One bad first batch can kill a startup's category entry. Budgets and timelines are equally unforgiving — a mis-specified sample round or a missing test report can burn months before launch, and DTC and Amazon channels add their own packaging and labelling requirements on top.",
    challengeZh:
      "首次做毛绒的品牌常常缺少产品设计经验、MOQ 经济模型认知、安全合规知识。首批做坏可能直接断送品类切入。预算和时间同样不容出错——一轮规格不清的打样或缺一份测试报告就可能耗掉数月，DTC 和 Amazon 渠道还叠加了各自的包装与标签要求。",
    solutionEn: [
      "Design consultation to guide pattern, material, and feature choices",
      "Transparent cost breakdowns tied to MOQ and packaging tier",
      "Compliance guidance from the first sample round, so 200-piece trial batches ship with the documentation their target market requires",
      "Sample cost deducted from first bulk order to reduce upfront risk",
      "Amazon FBA packaging and labelling checked before shipment, so trial orders arrive warehouse-ready",
    ],
    solutionZh: [
      "设计咨询指导版型、材料、特征选择",
      "成本明细与 MOQ、包装档位挂钩，透明化",
      "从首轮打样即介入合规指导，200 件试单出货即附目标市场所需文档",
      "样品费从首个大货订单中抵扣，降低前期风险",
      "出货前核验 Amazon FBA 包装与标签，试单到仓即可直接入库",
    ],
    outcomeEn: [
      "Repeat startup clients scaling from 200-piece trials to 5,000+ orders",
      "Lower barrier for new plush brand category entry",
      "Launch-ready product with first-batch compliance documentation",
    ],
    outcomeZh: [
      "多个从 200 件试单成长到 5,000+ 订单的初创客户",
      "新品牌切入毛绒品类的门槛更低",
      "首批即带合规文档的上架就绪产品",
    ],
    image: "/images/products/penguin.jpeg",
    regionEn: "North America (DTC / Amazon)",
    regionZh: "北美（DTC / Amazon）",
    metrics: [
      { labelEn: "Trial MOQ", labelZh: "试单起订", valueEn: "200 pcs", valueZh: "200 件" },
      { labelEn: "Scaled to", labelZh: "成长至", valueEn: "5,000+ pcs", valueZh: "5,000+ 件" },
      { labelEn: "Sample fee", labelZh: "样品费", valueEn: "Deducted from 1st order", valueZh: "首单抵扣" },
    ],
    confidentialityNoteEn:
      "Anonymized to protect early-stage clients. " + STANDARD_DISCLOSURE_EN,
    confidentialityNoteZh: "为保护初创客户已匿名处理。" + STANDARD_DISCLOSURE_ZH,
    tags: ["Startup", "Low MOQ", "DTC"],
  },
  {
    slug: "promotional-corporate-gifts",
    segment: "promotional",
    titleEn: "Promotional & Corporate Gift Plush",
    titleZh: "企业促销与礼品毛绒",
    summaryEn: "Branded plush and gift-set programs for corporate, event, and promotional use.",
    summaryZh: "面向企业客户、活动方、促销项目的品牌化毛绒与礼盒项目。",
    clientTypeEn: "Gift companies, event agencies, and corporate brand teams running seasonal or launch campaigns.",
    clientTypeZh: "礼品公司、活动公司、企业品牌团队——执行季节性或发布会类的活动项目。",
    scopeEn: [
      "Custom plush mascots in three size tiers (10-15 / 20-30 / 30-45 cm)",
      "Branded gift packaging (hang tags, color boxes, foil gift boxes)",
      "Tight event-deadline production with locked delivery windows",
    ],
    scopeZh: [
      "三档尺寸的定制毛绒吉祥物（10-15 / 20-30 / 30-45 cm）",
      "品牌化礼品包装（吊牌、彩盒、烫金礼盒）",
      "按活动截止日期锁定交付窗口的紧急排产",
    ],
    challengeEn:
      "Promotional projects live or die by the event date. Late delivery means the campaign flops. Budget is also tight — brands expect mascot-grade look at promotional-tier pricing. Many campaigns are recurring programs across holidays and product launches, so mascot patterns and packaging assets need to be reusable rather than redeveloped from scratch for every event.",
    challengeZh:
      "促销类项目命悬活动日：晚交货 = 活动失败。预算又紧——品牌期望「吉祥物级观感 + 促销级单价」。许多活动是跨节庆和新品发布的循环项目，吉祥物版型与包装资产需要可复用，而不是每次活动从零重做。",
    solutionEn: [
      "T-75-day project calendar with buffer before peak-season logistics",
      "Production milestones tracked backwards from the locked event date, protecting the delivery window through sampling, production, and shipping",
      "Shared pattern library reducing development cost on repeat campaigns",
      "Mascot pattern and packaging files archived per client for fast reactivation on the next campaign",
      "Budget-tier menus (economy / standard / premium) for quick proposal turnaround",
    ],
    solutionZh: [
      "T-75 天的项目日历，旺季物流前预留缓冲",
      "以锁定的活动日期倒排生产节点，打样、生产、运输全程守住交付窗口",
      "共享版型库，让重复活动复用开发成本",
      "按客户归档吉祥物版型与包装文件，下次活动快速复用启动",
      "三档预算菜单（经济 / 标准 / 高端），快速回复方案",
    ],
    outcomeEn: [
      "Repeat corporate gift programs across holidays and product launches",
      "Budget-to-brand alignment via the three-tier pricing approach",
      "Event-date hit rate suitable for tight campaign schedules",
    ],
    outcomeZh: [
      "节庆与新品发布循环下单的企业礼品项目",
      "三档价位贴合不同预算与品牌定位",
      "活动日命中率满足紧凑档期需求",
    ],
    image: "/images/details/hangtag-full.jpeg",
    regionEn: "Global (corporate & events)",
    regionZh: "全球（企业与活动）",
    metrics: [
      { labelEn: "Project calendar", labelZh: "项目排期", valueEn: "T-75 days", valueZh: "T-75 天" },
      { labelEn: "Size tiers", labelZh: "尺寸档位", valueEn: "3 (10-45 cm)", valueZh: "3 档 (10-45 cm)" },
      { labelEn: "Budget tiers", labelZh: "预算档位", valueEn: "Economy / Standard / Premium", valueZh: "经济 / 标准 / 高端" },
    ],
    confidentialityNoteEn:
      "Anonymized to protect campaign confidentiality. " + STANDARD_DISCLOSURE_EN,
    confidentialityNoteZh: "为保护活动机密已匿名处理。" + STANDARD_DISCLOSURE_ZH,
    tags: ["Promotional", "Corporate gifts", "Mascot"],
  },
];
