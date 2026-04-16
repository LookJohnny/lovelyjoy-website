// ─── Company Identity ────────────────────────────────────────

export const COMPANY_NAME = "LovelyJoy";
export const COMPANY_NAME_CN = "爱儿采";
export const SLOGAN_EN = "Crafting Joy, One Plush at a Time";
export const SLOGAN_CN = "用心缝制，传递快乐";

// ─── Navigation ──────────────────────────────────────────────

export interface NavLink {
  tKey: string;            // translation key within the "nav" namespace
  href?: string;           // present for direct links, absent for dropdown groups
  children?: NavLink[];    // present for dropdown groups
}

export const NAV_LINKS: NavLink[] = [
  { tKey: "home", href: "/" },
  { tKey: "products", href: "/products" },
  {
    tKey: "services",
    children: [
      { tKey: "servicesLinks.plushManufacturer", href: "/plush-toy-manufacturer" },
      { tKey: "servicesLinks.plushToyOem", href: "/plush-toy-oem" },
      { tKey: "servicesLinks.oemOdm", href: "/oem-odm" },
      { tKey: "servicesLinks.customManufacturer", href: "/custom-plush-manufacturer" },
      { tKey: "servicesLinks.stuffedAnimalOem", href: "/stuffed-animal-oem" },
      { tKey: "servicesLinks.mascot", href: "/mascot-custom" },
      { tKey: "servicesLinks.gift", href: "/gift-plush-custom" },
      { tKey: "servicesLinks.yiwuFactory", href: "/yiwu-plush-factory" },
    ],
  },
  {
    tKey: "factory",
    children: [
      { tKey: "factoryLinks.about", href: "/about" },
      { tKey: "factoryLinks.capability", href: "/factory-capability" },
      { tKey: "factoryLinks.certifications", href: "/safety-certifications" },
    ],
  },
  { tKey: "cases", href: "/cases" },
  { tKey: "blog", href: "/blog" },
  { tKey: "mianmian", href: "/mianmian" },
];

// ─── Social Links ────────────────────────────────────────────

export interface SocialLink {
  platform: string;
  url: string;
  icon: string; // lucide icon name or custom identifier
}

export const SOCIAL_LINKS: SocialLink[] = [];

// ─── Contact Info ────────────────────────────────────────────

export const CONTACT_INFO = {
  email: "info@lovelyjoytoy.com",
  phone: "+86 15957988866",
  whatsapp: "+1 (626) 586 7567",
  address: {
    en: "No.8 Siyuan Road, Niansan Li, Yiwu, Zhejiang, China",
    cn: "浙江省义乌市廿三里思源路8号",
  },
  storeAddress: {
    en: "4F-84556, Gate 188, Global Digital Trade Center, Yiwu",
    cn: "义乌市全球数贸中心188号门四楼84556",
  },
} as const;

// ─── Brand Colors (mirrors Tailwind theme) ───────────────────

export const BRAND_COLORS = {
  skyBlue: "#8ECAE6",
  warmBeige: "#DDB892",
  chocolateBrown: "#5D4037",
  bgSky: "#F0F8FB",
  bgWarm: "#F5EDE0",
} as const;
