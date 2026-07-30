import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { NAV_LINKS, CONTACT_INFO } from '@/lib/constants';
import { Mail, Phone, MessageCircle, MapPin } from 'lucide-react';

export default async function Footer() {
  const t = await getTranslations('footer');
  const tNav = await getTranslations('nav');
  const tContact = await getTranslations('contact');
  const locale = await getLocale();

  const year = new Date().getFullYear();

  // Only direct-link nav items appear in Quick Links (dropdown groups are
  // surfaced via the Manufacturing Services column instead).
  const directNavLinks = NAV_LINKS.filter((l) => l.href);

  return (
    <footer className="bg-brown text-white">
      {/* Top section: 4 columns */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link href="/">
              <Image
                src="/images/brand/logo-color.jpeg"
                alt="LovelyJoy 爱儿采 — plush toy manufacturer logo"
                width={140}
                height={46}
                className="h-12 w-auto rounded brightness-110"
              />
            </Link>
            <p className="text-lg font-semibold text-beige-brand">
              {t('slogan')}
            </p>
            <p className="text-sm leading-relaxed text-white/70">
              {t('description')}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-beige-brand">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-2">
              {directNavLinks.map((item) => (
                <li key={item.tKey}>
                  <Link
                    href={item.href!}
                    className="text-sm text-white/70 transition-colors duration-200 hover:text-beige-brand"
                  >
                    {tNav(item.tKey)}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-white/70 transition-colors duration-200 hover:text-beige-brand"
                >
                  {tNav('contact')}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-white/70 transition-colors duration-200 hover:text-beige-brand"
                >
                  {t('links.faq')}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-white/70 transition-colors duration-200 hover:text-beige-brand"
                >
                  {t('links.blog')}
                </Link>
              </li>
              <li>
                <Link
                  href="/cases"
                  className="text-sm text-white/70 transition-colors duration-200 hover:text-beige-brand"
                >
                  {t('links.cases')}
                </Link>
              </li>
              <li>
                <Link
                  href="/rfq-template"
                  className="text-sm text-white/70 transition-colors duration-200 hover:text-beige-brand"
                >
                  {locale === 'zh' ? 'RFQ询价模板' : 'RFQ Template'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Manufacturing Services — internal link cluster for SEO */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-beige-brand">
              {t('services')}
            </h3>
            <ul className="space-y-2">
              {[
                { href: '/oem-plush-manufacturer', key: 'oemPlushManufacturer' },
                { href: '/plush-toy-manufacturer', key: 'plushManufacturer' },
                { href: '/yiwu-plush-factory', key: 'yiwuFactory' },
                { href: '/mascot-custom', key: 'mascot' },
                { href: '/gift-plush-custom', key: 'gift' },
                { href: '/plush-toy-oem', key: 'plushToyOem' },
                { href: '/custom-plush-manufacturer', key: 'customManufacturer' },
                { href: '/oem-odm', key: 'oemOdm' },
                { href: '/stuffed-animal-oem', key: 'stuffedAnimalOem' },
              ].map(({ href, key }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/70 transition-colors duration-200 hover:text-beige-brand"
                  >
                    {t(`serviceLinks.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-beige-brand">
              {tNav('contact')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-white/70">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-beige-brand" />
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="transition-colors hover:text-beige-brand"
                >
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/70">
                <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-beige-brand" />
                <a
                  href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`}
                  className="transition-colors hover:text-beige-brand"
                >
                  {CONTACT_INFO.phone}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/70">
                <MessageCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-beige-brand" />
                <a
                  href={`https://wa.me/${CONTACT_INFO.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="transition-colors hover:text-beige-brand"
                >
                  {CONTACT_INFO.whatsapp}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/70">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-beige-brand" />
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(tContact('info.address'))}`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="transition-colors hover:text-beige-brand"
                >
                  {tContact('info.address')}
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/70">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-beige-brand" />
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(tContact('info.storeAddress'))}`}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="transition-colors hover:text-beige-brand"
                >
                  {tContact('info.storeAddress')}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-center text-xs text-white/50 sm:flex-row sm:px-6 lg:px-8">
          <p>{t('copyright', { year: String(year) })}</p>
          <p className="italic text-beige-brand/60">
            Feel the Lovely, Spread the Joy
          </p>
        </div>
      </div>
    </footer>
  );
}
