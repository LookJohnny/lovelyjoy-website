'use client';

import { useRouter, usePathname } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('language');
  const [isPending, startTransition] = useTransition();

  const nextLocale = locale === 'zh' ? 'en' : 'zh';

  function handleSwitch() {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <button
      onClick={handleSwitch}
      disabled={isPending}
      aria-label={t('switchTo')}
      className={`
        rounded-full border border-brown/20 px-3 py-1 text-sm font-medium
        text-brown transition-all duration-300
        hover:bg-brown/5 hover:border-brown/40
        active:scale-95
        disabled:opacity-50
        ${isPending ? 'animate-pulse' : ''}
      `}
    >
      {t('current')}
    </button>
  );
}
