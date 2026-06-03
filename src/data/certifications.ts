// ─── Certification data ─────────────────────────────────────
//
// Cert NAMES, ISSUERS, SCOPE and MARKET relevance are public, factual
// descriptions of each standard — safe to publish. The per-certificate
// NUMBER, VALIDITY window, downloadable PDF and online verification URL are
// company-specific and must be supplied by the business. They are left null
// with TODO(business) markers and the UI hides any field that is null, so we
// never render an invented certificate number or a dead PDF link.

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  scopeEn: string;
  scopeZh: string;
  marketEn: string;
  marketZh: string;
  // TODO(business): fill the four fields below from the real certificates.
  certificateNumber: string | null;
  validUntil: string | null; // ISO date, e.g. "2027-03-31"
  pdfUrl: string | null; // place the file in /public and reference it here
  verifyUrl: string | null; // official issuer verification page, if any
}

export const certifications: Certification[] = [
  {
    id: "bsci",
    name: "BSCI",
    issuer: "amfori (Business Social Compliance Initiative)",
    scopeEn: "Social compliance & ethical labor audit of the manufacturing facility.",
    scopeZh: "工厂社会责任与劳工合规第三方审核。",
    marketEn: "Required by many EU/US retail buyers for supplier onboarding.",
    marketZh: "欧美零售渠道供应商准入常见要求。",
    certificateNumber: null, // TODO(business): amfori BSCI ID / DBID
    validUntil: null, // TODO(business): audit validity end date
    pdfUrl: null, // TODO(business): /certs/bsci-report.pdf
    verifyUrl: null, // TODO(business): amfori platform link if shareable
  },
  {
    id: "iso-9001",
    name: "ISO 9001",
    issuer: "Accredited certification body", // TODO(business): name the registrar (e.g. SGS, BV, TÜV)
    scopeEn: "Quality Management System certification covering design, production and QC.",
    scopeZh: "覆盖设计、生产与质检的质量管理体系认证。",
    marketEn: "Global quality-system credential recognized in all export markets.",
    marketZh: "全球通用的质量体系凭证，适用于所有出口市场。",
    certificateNumber: null, // TODO(business): ISO 9001 certificate number
    validUntil: null,
    pdfUrl: null,
    verifyUrl: null,
  },
  {
    id: "astm-f963",
    name: "ASTM F963",
    issuer: "Tested per ASTM International standard (CPSC-enforced)",
    scopeEn: "US toy safety: mechanical, flammability and chemical testing.",
    scopeZh: "美国玩具安全标准：机械、可燃性与化学测试。",
    marketEn: "Mandatory for toys sold in the United States.",
    marketZh: "美国市场销售玩具的强制标准。",
    certificateNumber: null, // TODO(business): test report number(s) / CPC
    validUntil: null,
    pdfUrl: null,
    verifyUrl: null,
  },
  {
    id: "en-71",
    name: "EN 71",
    issuer: "Tested per EN 71 (EU toy safety standard)",
    scopeEn: "EU toy safety: mechanical, flammability and element-migration parts.",
    scopeZh: "欧盟玩具安全：机械、可燃性与元素迁移等部分。",
    marketEn: "Basis for CE marking of toys in the EU/EEA.",
    marketZh: "欧盟/欧洲经济区玩具 CE 标志的基础。",
    certificateNumber: null,
    validUntil: null,
    pdfUrl: null,
    verifyUrl: null,
  },
  {
    id: "ce",
    name: "CE",
    issuer: "EU Toy Safety Directive 2009/48/EC (Declaration of Conformity)",
    scopeEn: "Declaration that products meet applicable EU directives.",
    scopeZh: "声明产品符合适用的欧盟指令。",
    marketEn: "Required to place toys on the EU market.",
    marketZh: "玩具进入欧盟市场的必要条件。",
    certificateNumber: null,
    validUntil: null,
    pdfUrl: null,
    verifyUrl: null,
  },
  {
    id: "gb-6675",
    name: "GB 6675",
    issuer: "China National Toy Safety Standard",
    scopeEn: "China toy safety: general, mechanical, flammability, element migration.",
    scopeZh: "中国玩具安全：基本、机械、可燃性、元素迁移。",
    marketEn: "Mandatory standard for toys in the Chinese domestic market.",
    marketZh: "中国国内市场玩具强制性标准。",
    certificateNumber: null,
    validUntil: null,
    pdfUrl: null,
    verifyUrl: null,
  },
];
