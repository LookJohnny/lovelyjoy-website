import { COMPANY_FACTS } from '@/data/company-facts';

const SITE_URL = 'https://lovelyjoy.cn';

// Only Chinese and English currently have unique, page-level content across
// the whole site. Other locale routes remain available to visitors, but they
// must not compete in search until their page bodies and metadata are fully
// translated.
export const INDEXABLE_LOCALES = ['zh', 'en'] as const;

// Map a next-intl locale (the URL path segment) -> BCP-47 hreflang code.
// URL paths stay short and stable (/zh, /pt, /es) while the hreflang tags carry
// the precise script/region Google recommends.
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

export function isIndexableLocale(
  locale: string,
): locale is (typeof INDEXABLE_LOCALES)[number] {
  return INDEXABLE_LOCALES.includes(
    locale as (typeof INDEXABLE_LOCALES)[number],
  );
}

export function buildAlternates(locale: string, path: string = '') {
  const languages: Record<string, string> = {};
  for (const l of INDEXABLE_LOCALES) {
    languages[HREFLANG_MAP[l] ?? l] = `/${l}${path}`;
  }
  // Non-indexable locale routes contain English fallback content, so their
  // canonical must point to the real English page instead of creating a
  // duplicate self-canonical cluster. x-default follows the same target.
  languages['x-default'] = `/en${path}`;
  return {
    canonical: `/${isIndexableLocale(locale) ? locale : 'en'}${path}`,
    languages,
  };
}

export const SITE = {
  url: SITE_URL,
  name: 'LovelyJoy 爱儿采',
  legalName: 'Yiwu Lebadi Toy Factory',
  foundingDate: String(COMPANY_FACTS.foundedYear),
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
    // TODO(business): uncomment each line below ONCE confirmed to be the
    // company's own official profile, so AI engines consolidate the entity
    // across domains (lovelyjoy.cn <-> lovelyjoytoy.com). Do not add unverified
    // URLs — a wrong sameAs pollutes the entity graph.
    // 'https://www.lovelyjoytoy.com',                         // sister/.com site (email domain)
    // 'https://www.made-in-china.com/showroom/lovelyjoy/',    // Made-in-China showroom (verify it's ours)
    // 'https://lovelyjoy.en.alibaba.com',                     // Alibaba supplier page (fill real URL)
    // 'https://www.linkedin.com/company/lovelyjoy',           // LinkedIn company page (fill real URL)
  ],
  facts: COMPANY_FACTS,
};

// Stable schema.org @id anchors. Reused across pages/locales so search engines
// and LLMs merge every reference into a single entity node.
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
