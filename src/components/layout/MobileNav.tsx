'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { NAV_LINKS, type NavLink } from '@/lib/constants';
import LanguageSwitcher from './LanguageSwitcher';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileGroup({
  item,
  pathname,
  onClose,
  t,
}: {
  item: NavLink;
  pathname: string;
  onClose: () => void;
  t: (key: string) => string;
}) {
  const childActive = (item.children ?? []).some((c) => c.href === pathname);
  const [open, setOpen] = useState(childActive);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`
          flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-lg font-medium transition-all duration-200
          ${childActive ? 'text-sky-brand-dark' : 'text-brown hover:bg-beige-brand/10'}
        `}
        aria-expanded={open}
      >
        <span>{t(item.tKey)}</span>
        <ChevronDown
          className={`h-4 w-4 text-brown/60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            {(item.children ?? []).map((c) => {
              const isActive = pathname === c.href;
              return (
                <li key={c.href}>
                  <Link
                    href={c.href!}
                    onClick={onClose}
                    className={`
                      block rounded-lg px-8 py-2.5 text-sm transition-colors duration-200
                      ${isActive
                        ? 'bg-sky-brand/10 text-sky-brand-dark font-semibold'
                        : 'text-brown/80 hover:bg-beige-brand/10'}
                    `}
                  >
                    {t(c.tKey)}
                  </Link>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 end-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl"
          >
            <div className="flex h-full flex-col px-6 py-6">
              {/* Top: Logo + Close */}
              <div className="flex items-center justify-between">
                <Link href="/" onClick={onClose}>
                  <Image
                    src="/images/brand/logo-color.jpeg"
                    alt="LovelyJoy 爱儿采 — plush toy manufacturer logo"
                    width={120}
                    height={40}
                    className="h-10 w-auto rounded"
                  />
                </Link>
                <button
                  onClick={onClose}
                  aria-label="Close menu"
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-brown transition-colors hover:bg-brown/5"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Nav links (scrollable) */}
              <nav className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto">
                {NAV_LINKS.map((item) => {
                  if (item.children) {
                    return (
                      <MobileGroup
                        key={item.tKey}
                        item={item}
                        pathname={pathname}
                        onClose={onClose}
                        t={t}
                      />
                    );
                  }
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.tKey}
                      href={item.href!}
                      onClick={onClose}
                      className={`
                        w-full rounded-xl px-4 py-3 text-left text-lg font-medium
                        transition-all duration-200
                        ${
                          isActive
                            ? 'bg-sky-brand/10 text-sky-brand-dark'
                            : 'text-brown hover:bg-beige-brand/10'
                        }
                      `}
                    >
                      {t(item.tKey)}
                    </Link>
                  );
                })}
              </nav>

              {/* Bottom: Language + CTA */}
              <div className="flex flex-col items-center gap-4 border-t border-brown/10 pt-6">
                <LanguageSwitcher />
                <Link
                  href="/contact"
                  onClick={onClose}
                  className="w-full rounded-full bg-sky-brand px-6 py-3 text-center font-semibold text-white shadow-md transition-all duration-300 hover:bg-sky-brand-dark hover:shadow-lg"
                >
                  {t('contact')}
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
