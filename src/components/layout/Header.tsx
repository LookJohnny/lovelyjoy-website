'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { NAV_LINKS } from '@/lib/constants';
import LanguageSwitcher from './LanguageSwitcher';
import MobileNav from './MobileNav';

export default function Header() {
  const t = useTranslations('nav');
  const tHeader = useTranslations('header');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  // Map href to translation key
  function navKey(href: string): string {
    if (href === '/') return 'home';
    if (href === '/products') return 'products';
    if (href === '/oem-odm') return 'oemOdm';
    if (href === '/about') return 'about';
    return 'contact';
  }

  return (
    <>
      <header
        className={`
          sticky top-0 z-30 w-full transition-all duration-300
          backdrop-blur-md bg-white/80
          ${scrolled ? 'shadow-md' : 'shadow-none'}
        `}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/brand/logo-color.jpeg"
              alt="LovelyJoy"
              width={120}
              height={40}
              className="h-10 w-auto rounded"
              priority
            />
          </Link>

          {/* Center: Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((item) => {
              const isActive = pathname === item.href;
              const key = navKey(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    group relative px-3 py-2 text-sm font-medium transition-colors duration-200
                    ${isActive ? 'text-sky-brand-dark' : 'text-brown hover:text-sky-brand-dark'}
                  `}
                >
                  {t(key)}
                  {/* Hover underline animation: expand from center */}
                  <span
                    className={`
                      absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 bg-sky-brand
                      transition-all duration-300 ease-out
                      ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}
                    `}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right: Language + CTA + Mobile hamburger */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            <Link
              href="/contact"
              className="hidden rounded-full bg-sky-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-sky-brand-dark hover:shadow-md sm:inline-flex"
            >
              {tHeader('contactCta')}
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              className="rounded-lg p-2 text-brown transition-colors hover:bg-brown/5 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile navigation overlay */}
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  );
}
