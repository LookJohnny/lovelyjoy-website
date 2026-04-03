import HeroCarousel from '@/components/home/HeroCarousel';
import BrandStory from '@/components/home/BrandStory';
import CoreAdvantages from '@/components/home/CoreAdvantages';
import ProductShowcase from '@/components/home/ProductShowcase';
import QualityDetails from '@/components/home/QualityDetails';
import StoreShowcase from '@/components/home/StoreShowcase';
import Certifications from '@/components/home/Certifications';
import CTABanner from '@/components/home/CTABanner';
import { CONTACT_INFO } from '@/lib/constants';

function JsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LovelyJoy 爱儿采',
    url: 'https://lovelyjoy.cn',
    logo: 'https://lovelyjoy.cn/images/brand/logo-color.jpeg',
    description:
      'Professional plush toy manufacturer with 20+ years experience. OEM/ODM services from design to mass production.',
    contactPoint: {
      '@type': 'ContactPoint',
      email: CONTACT_INFO.email,
      telephone: CONTACT_INFO.phone,
      contactType: 'sales',
      availableLanguage: ['Chinese', 'English'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'No.8 Siyuan Road, Niansan Li',
      addressLocality: 'Yiwu',
      addressRegion: 'Zhejiang',
      addressCountry: 'CN',
    },
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <HeroCarousel />
      <CoreAdvantages />
      <BrandStory />
      <ProductShowcase />
      <QualityDetails />
      <StoreShowcase />
      <Certifications />
      <CTABanner />
    </>
  );
}
