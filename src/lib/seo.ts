import { routing } from '@/i18n/routing';

const SITE_URL = 'https://lovelyjoy.cn';

export function buildAlternates(locale: string, path: string = '') {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `/${l}${path}`;
  }
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
  ],
};
