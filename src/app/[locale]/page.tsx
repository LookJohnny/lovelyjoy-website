import HeroCarousel from '@/components/home/HeroCarousel';
import BrandStory from '@/components/home/BrandStory';
import CoreAdvantages from '@/components/home/CoreAdvantages';
import ProductShowcase from '@/components/home/ProductShowcase';
import QualityDetails from '@/components/home/QualityDetails';
import StoreShowcase from '@/components/home/StoreShowcase';
import Certifications from '@/components/home/Certifications';
import CTABanner from '@/components/home/CTABanner';
import { CONTACT_INFO } from '@/lib/constants';
import { SITE } from '@/lib/seo';

function JsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'Manufacturer'],
    name: SITE.name,
    legalName: SITE.legalName,
    alternateName: ['LovelyJoy', '爱儿采', 'Yiwu Lebadi'],
    url: SITE.url,
    logo: `${SITE.url}/images/brand/logo-color.jpeg`,
    image: `${SITE.url}/images/hero/hero-bear.png`,
    description:
      'Professional plush toy manufacturer in Yiwu, China with 20+ years experience. OEM/ODM services from design to mass production. 20,000 sqm factory, 300+ workers, 800,000 pcs/month capacity. Serving 70+ countries.',
    slogan: 'Feel the Lovely, Spread the Joy',
    foundingDate: SITE.foundingDate,
    numberOfEmployees: { '@type': 'QuantitativeValue', value: 300 },
    knowsAbout: [
      'Plush Toy Manufacturing',
      'Stuffed Animal Production',
      'OEM Plush Toys',
      'ODM Plush Design',
      'Custom Plush Toys',
      'Promotional Plush Toys',
      'Mascot Plush',
      'Licensed IP Plush Manufacturing',
      'Plush Pillows',
      'Plush Keychains',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: CONTACT_INFO.email,
        telephone: SITE.phone,
        contactType: 'sales',
        availableLanguage: ['Chinese', 'English', 'Japanese', 'Korean', 'Spanish'],
        areaServed: 'Worldwide',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    sameAs: SITE.sameAs,
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
