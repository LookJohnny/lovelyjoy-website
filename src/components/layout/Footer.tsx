import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { NAV_LINKS, CONTACT_INFO } from '@/lib/constants';
import { Mail, Phone, MessageCircle, MapPin } from 'lucide-react';

export default async function Footer() {
  const t = await getTranslations('footer');
  const tNav = await getTranslations('nav');
  const tContact = await getTranslations('contact');

  const year = new Date().getFullYear();

  // Map href to nav translation key
  function navKey(href: string): string {
    if (href === '/') return 'home';
    if (href === '/products') return 'products';
    if (href === '/oem-odm') return 'oemOdm';
    if (href === '/about') return 'about';
    return 'contact';
  }

  return (
    <footer className="bg-brown text-white">
      {/* Top section: 3 columns */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link href="/">
              <Image
                src="/images/brand/logo-color.jpeg"
                alt="LovelyJoy"
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
              {NAV_LINKS.map((item) => {
                const key = navKey(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-white/70 transition-colors duration-200 hover:text-beige-brand"
                    >
                      {tNav(key)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 3: Contact */}
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
                  rel="noopener noreferrer"
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
                  rel="noopener noreferrer"
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
                  rel="noopener noreferrer"
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
