'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Menu, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { NAV_LINKS, type NavLink } from '@/lib/constants';
import LanguageSwitcher from './LanguageSwitcher';
import MobileNav from './MobileNav';

function NavDropdown({
  item,
  pathname,
  t,
}: {
  item: NavLink;
  pathname: string;
  t: (key: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function handleLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }

  const childActive = (item.children ?? []).some((c) => c.href === pathname);

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`
          group relative flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors duration-200
          ${childActive ? 'text-sky-brand-dark' : 'text-brown hover:text-sky-brand-dark'}
        `}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {t(item.tKey)}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
        <span
          className={`
            absolute bottom-0 left-1/2 h-0.5 -translate-x-1/2 bg-sky-brand
            transition-all duration-300 ease-out
            ${childActive ? 'w-full' : 'w-0 group-hover:w-full'}
          `}
        />
      </button>

      <AnimatePresence>
        {open && item.children && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 top-full z-40 mt-1 w-64 -translate-x-1/2"
            role="menu"
          >
            <div className="overflow-hidden rounded-2xl border border-brown/10 bg-white shadow-lg">
              <ul className="py-2">
                {item.children.map((c) => {
                  const isActive = pathname === c.href;
                  return (
                    <li key={c.href}>
                      <Link
                        href={c.href!}
                        className={`
                          block px-4 py-2 text-sm transition-colors duration-150
                          ${isActive
                            ? 'bg-sky-brand/10 text-sky-brand-dark font-semibold'
                            : 'text-brown hover:bg-beige-brand/10 hover:text-sky-brand-dark'}
                        `}
                      >
                        {t(c.tKey)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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

  // Close mobile nav on route change. Syncing UI state to the router is a
  // legitimate effect; the rule is overly strict for this navigation pattern.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileNavOpen(false);
  }, [pathname]);

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
              alt="LovelyJoy 爱儿采 — plush toy manufacturer logo"
              width={120}
              height={40}
              className="h-10 w-auto rounded"
              priority
            />
          </Link>

          {/* Center: Desktop Nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((item) => {
              if (item.children) {
                return (
                  <NavDropdown
                    key={item.tKey}
                    item={item}
                    pathname={pathname}
                    t={t}
                  />
                );
              }
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.tKey}
                  href={item.href!}
                  className={`
                    group relative px-3 py-2 text-sm font-medium transition-colors duration-200
                    ${isActive ? 'text-sky-brand-dark' : 'text-brown hover:text-sky-brand-dark'}
                  `}
                >
                  {t(item.tKey)}
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
              className="rounded-lg p-2 text-brown transition-colors hover:bg-brown/5 lg:hidden"
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
