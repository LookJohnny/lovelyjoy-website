// ─── Company Identity ────────────────────────────────────────

export const COMPANY_NAME = "LovelyJoy";
export const COMPANY_NAME_CN = "乐芭迪";
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

export const SOCIAL_LINKS: SocialLink[] = [
  { platform: "WeChat", url: "#", icon: "message-circle" },
  { platform: "Instagram", url: "#", icon: "instagram" },
  { platform: "Facebook", url: "#", icon: "facebook" },
  { platform: "LinkedIn", url: "#", icon: "linkedin" },
];

// ─── Contact Info ────────────────────────────────────────────

export const CONTACT_INFO = {
  email: "info@lovelyjoy.com",
  phone: "+86-579-8523-XXXX",
  whatsapp: "+86-158-XXXX-XXXX",
  address: {
    en: "Yiwu, Zhejiang, China",
    cn: "中国浙江省义乌市",
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
