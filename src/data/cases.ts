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
}

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
      "Licensed IP manufacturing requires zero deviation on character features, precise colour matching, and full traceability. Licensors reject production runs for issues as small as 0.5 mm on a character's eye position.",
    challengeZh:
      "IP 授权生产对角色特征零容忍：眼距偏差 0.5 毫米、色号漂移半档都会被授权方退回整批。同时要求完整可追溯。",
    solutionEn: [
      "Dedicated licensor-project pattern team maintains frozen pattern files per character",
      "Pre-production gold sample co-signed by our QC + licensor representative",
      "5-stage in-line inspection with photo reports archived per carton",
    ],
    solutionZh: [
      "授权项目专属版型团队，每个角色锁定冻结版型档案",
      "产前金样由我方 QC 与授权方代表共同签字",
      "5 道在线质检，每箱留存照片报告存档",
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
      "Big-box retailers plan 10+ months ahead and expect zero-defect shipments with exact on-shelf dates. A missed vessel cut-off can cost the buyer an entire season.",
    challengeZh:
      "大型连锁零售 10 个月前就开始排单，要求零缺陷交付并精准卡上架日期。错过一次开船就是一整季报废。",
    solutionEn: [
      "Vendor-managed calendar synced to the retailer's planogram",
      "Pre-booked factory capacity with 6-month rolling forecast",
      "100% pre-shipment inspection with retailer-approved QC standards",
    ],
    solutionZh: [
      "按零售商货架规划同步的供应商交付日历",
      "提前 6 个月滚动预测并锁定产能",
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
      "Lifestyle retail runs on narrow margins, tight lead times, and unforgiving quality expectations. Chain-wide replenishment outages damage trust with buyers.",
    challengeZh:
      "生活方式零售利润空间窄、交期紧、对质量零容忍。全链补货断档会严重影响采购信任。",
    solutionEn: [
      "Dedicated production lines for repeat-buy SKUs",
      "Rolling stock of core materials to shorten reorder lead time",
      "Monthly QC scorecard shared with buyer's audit team",
    ],
    solutionZh: [
      "回购型 SKU 配专属生产线",
      "核心材料常备滚动库存，缩短补货周期",
      "月度 QC 评分表与买家审核团队同步",
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
      "Experience retail demands plush that performs in-store — survive children's play, hold shape after re-stuffing, and support branded accessories without structural damage.",
    challengeZh:
      "体验式零售对毛绒性能要求极高——要能承受儿童反复玩耍、能重新填充不变形、能稳定穿戴品牌配件。",
    solutionEn: [
      "Reinforced seam construction tested across multiple stuffing cycles",
      "Custom fabric blends tuned for repeated handling and washing",
      "Brand-shared pattern library maintaining exact look across re-orders",
    ],
    solutionZh: [
      "加固缝合工艺，经多次填充循环测试",
      "定制面料组合，适应反复触摸与清洗",
      "与品牌共享版型库，保证补货外观一致",
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
      "First-time plush brands often lack product design experience, clear MOQ economics, or knowledge of safety compliance. One bad first batch can kill a startup's category entry.",
    challengeZh:
      "首次做毛绒的品牌常常缺少产品设计经验、MOQ 经济模型认知、安全合规知识。首批做坏可能直接断送品类切入。",
    solutionEn: [
      "Design consultation to guide pattern, material, and feature choices",
      "Transparent cost breakdowns tied to MOQ and packaging tier",
      "Sample cost deducted from first bulk order to reduce upfront risk",
    ],
    solutionZh: [
      "设计咨询指导版型、材料、特征选择",
      "成本明细与 MOQ、包装档位挂钩，透明化",
      "样品费从首个大货订单中抵扣，降低前期风险",
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
      "Promotional projects live or die by the event date. Late delivery means the campaign flops. Budget is also tight — brands expect mascot-grade look at promotional-tier pricing.",
    challengeZh:
      "促销类项目命悬活动日：晚交货 = 活动失败。预算又紧——品牌期望「吉祥物级观感 + 促销级单价」。",
    solutionEn: [
      "T-75-day project calendar with buffer before peak-season logistics",
      "Shared pattern library reducing development cost on repeat campaigns",
      "Budget-tier menus (economy / standard / premium) for quick proposal turnaround",
    ],
    solutionZh: [
      "T-75 天的项目日历，旺季物流前预留缓冲",
      "共享版型库，让重复活动复用开发成本",
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
    tags: ["Promotional", "Corporate gifts", "Mascot"],
  },
];
