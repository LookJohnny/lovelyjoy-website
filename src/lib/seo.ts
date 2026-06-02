import { routing } from '@/i18n/routing';

const SITE_URL = 'https://lovelyjoy.cn';

// Map a next-intl locale (the URL path segment) -> BCP-47 hreflang code.
// URL paths stay short and stable (/zh, /pt, /es) while the hreflang tags carry
// the precise script/region Google recommends. The sitemap imports this same
// map, so the <head> alternates and the XML sitemap never disagree.
export const HREFLANG_MAP: Record<string, string> = {
  zh: 'zh-Hans', // Simplified Chinese (Mainland) — site content is Simplified
  en: 'en',
  ja: 'ja',
  ko: 'ko',
  es: 'es-419', // Latin American Spanish — primary import market vs. Spain
  pt: 'pt-BR', // Brazilian Portuguese — dominant Portuguese toy-import market
  ar: 'ar',
  ru: 'ru',
  fr: 'fr',
  de: 'de',
  it: 'it',
  th: 'th',
  id: 'id',
};

// BCP-47 value for the <html lang> attribute (mirrors HREFLANG_MAP).
export function htmlLang(locale: string): string {
  return HREFLANG_MAP[locale] ?? locale;
}

export function buildAlternates(locale: string, path: string = '') {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[HREFLANG_MAP[l] ?? l] = `/${l}${path}`;
  }
  // x-default consistently resolves to the English page — matches the sitemap
  // and the proxy's permanent root redirect.
  languages['x-default'] = `/en${path}`;
  return {
    canonical: `/${locale}${path}`,
    languages,
  };
}

export const SITE = {
  url: SITE_URL,
  name: 'LovelyJoy 爱儿采',
  legalName: 'Yiwu Lebadi Toy Factory',
  foundingDate: '2003',
  email: 'info@lovelyjoytoy.com',
  phone: '+86-15957988866',
  whatsapp: '+1-626-586-7567',
  address: {
    street: 'No.8 Siyuan Road, Niansan Li',
    city: 'Yiwu',
    region: 'Zhejiang',
    country: 'CN',
    postalCode: '322000',
  },
  // External profiles for Organization.sameAs — boosts GEO trust signals.
  // Tracking params (?si=, ?igsh=) stripped to keep URLs canonical.
  sameAs: [
    'https://www.youtube.com/@lovelyjoy-e9d',
    'https://www.tiktok.com/@lovelyjoy_plush',
    'https://www.instagram.com/lovelyjoy.plush',
    'https://v.douyin.com/euL2l2yPYNk/',
    // TODO(business): add the made-in-china.com showroom + any Alibaba/LinkedIn
    // profile here so AI engines consolidate the entity across domains
    // (lovelyjoy.cn <-> lovelyjoytoy.com).
  ],
};

// Stable schema.org @id anchors. Reused across pages/locales so search engines
// and LLMs merge every reference into a single entity node.
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
