// ─── Company Identity ────────────────────────────────────────

export const COMPANY_NAME = "LovelyJoy";
export const COMPANY_NAME_CN = "爱儿采";
export const SLOGAN_EN = "Crafting Joy, One Plush at a Time";
export const SLOGAN_CN = "用心缝制，传递快乐";

// ─── Navigation ──────────────────────────────────────────────

export interface NavLink {
  label: string;
  labelCn: string;
  href: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Home", labelCn: "首页", href: "/" },
  { label: "Products", labelCn: "产品展示", href: "/products" },
  { label: "OEM/ODM", labelCn: "OEM/ODM", href: "/oem-odm" },
  { label: "About", labelCn: "关于我们", href: "/about" },
  { label: "Contact", labelCn: "联系我们", href: "/contact" },
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
  email: "info@lovelyjoy.com",
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
