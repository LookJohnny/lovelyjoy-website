import { setRequestLocale } from 'next-intl/server';
import HeroCarousel from '@/components/home/HeroCarousel';
import SourcingEssentials from '@/components/home/SourcingEssentials';
import BrandStory from '@/components/home/BrandStory';
import CoreAdvantages from '@/components/home/CoreAdvantages';
import ProductShowcase from '@/components/home/ProductShowcase';
import QualityDetails from '@/components/home/QualityDetails';
import StoreShowcase from '@/components/home/StoreShowcase';
import Certifications from '@/components/home/Certifications';
import CTABanner from '@/components/home/CTABanner';
import { CONTACT_INFO } from '@/lib/constants';
import { SITE, ORG_ID, WEBSITE_ID } from '@/lib/seo';

// Statically render + revalidate hourly. Emits
// `Cache-Control: s-maxage=3600, stale-while-revalidate` so Vercel serves the
// homepage from the edge instead of rendering it on every request.
export const revalidate = 3600;

function JsonLd() {
  // One @graph with stable @ids so search engines and LLMs merge every
  // reference (here and on other pages) into a single Organization entity.
  const organization = {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    alternateName: ['LovelyJoy', '爱儿采', 'Yiwu Lebadi'],
    url: SITE.url,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE.url}/images/brand/logo-color.jpeg`,
      // Measured from the actual file (sips): 3780x2126.
      width: 3780,
      height: 2126,
    },
    image: `${SITE.url}/images/hero/hero-bear.jpg`,
    description:
      `Professional plush toy manufacturer in Yiwu, China, founded in ${SITE.facts.foundedYear}. OEM/ODM services from design to mass production. ${SITE.facts.factoryAreaSqm.toLocaleString('en-US')} sqm factory, ${SITE.facts.skilledWorkers}+ workers, ${SITE.facts.monthlyCapacity.toLocaleString('en-US')}+ pcs/month capacity. Serving ${SITE.facts.exportMarkets}+ countries.`,
    slogan: 'Feel the Lovely, Spread the Joy',
    foundingDate: SITE.foundingDate,
    // TODO(business): confirm current headcount.
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      minValue: SITE.facts.skilledWorkers,
    },
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

  const website = {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: 'LovelyJoy',
    alternateName: SITE.name,
    url: SITE.url,
    publisher: { '@id': ORG_ID },
    // Only the two languages with unique, indexable page content belong in the
    // public WebSite language graph. Other locale routes currently fall back to
    // English and are deliberately noindex.
    inLanguage: ['en', 'zh-Hans'],
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [organization, website],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <JsonLd />
      <HeroCarousel />
      <SourcingEssentials locale={locale} />
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
