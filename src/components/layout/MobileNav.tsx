'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { NAV_LINKS } from '@/lib/constants';
import LanguageSwitcher from './LanguageSwitcher';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
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
            className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl"
          >
            <div className="flex h-full flex-col px-6 py-6">
              {/* Top: Logo + Close */}
              <div className="flex items-center justify-between">
                <Link href="/" onClick={onClose}>
                  <Image
                    src="/images/brand/logo-color.jpeg"
                    alt="LovelyJoy"
                    width={120}
                    height={40}
                    className="h-10 w-auto rounded"
                  />
                </Link>
                <button
                  onClick={onClose}
                  aria-label="Close menu"
                  className="rounded-full p-2 text-brown transition-colors hover:bg-brown/5"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="mt-12 flex flex-1 flex-col items-center gap-2">
                {NAV_LINKS.map((item) => {
                  const isActive = pathname === item.href;
                  // Map the href to the translation key
                  const key = item.href === '/'
                    ? 'home'
                    : item.href === '/products'
                    ? 'products'
                    : item.href === '/oem-odm'
                    ? 'oemOdm'
                    : item.href === '/about'
                    ? 'about'
                    : 'contact';

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`
                        w-full rounded-xl px-4 py-3 text-center text-lg font-medium
                        transition-all duration-200
                        ${
                          isActive
                            ? 'bg-sky-brand/10 text-sky-brand-dark'
                            : 'text-brown hover:bg-beige-brand/10'
                        }
                      `}
                    >
                      {t(key)}
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
