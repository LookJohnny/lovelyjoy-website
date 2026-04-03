'use client';

import { useRouter, usePathname } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { useState, useRef, useEffect, useTransition } from 'react';
import { ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { code: 'zh', label: '中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'ar', label: 'العربية' },
  { code: 'ru', label: 'Русский' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'th', label: 'ไทย' },
  { code: 'id', label: 'Bahasa' },
] as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSwitch(code: string) {
    setOpen(false);
    startTransition(() => {
      router.replace(pathname, { locale: code });
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className={`
          flex items-center gap-1 rounded-full border border-brown/20 px-3 py-1
          text-sm font-medium text-brown transition-all duration-200
          hover:bg-brown/5 hover:border-brown/40 active:scale-95
          ${isPending ? 'opacity-50' : ''}
        `}
      >
        {current.label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute end-0 top-full z-50 mt-1 min-w-[140px] max-h-[320px] overflow-y-auto rounded-xl border border-brown/10 bg-white py-1 shadow-lg">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSwitch(lang.code)}
              className={`
                block w-full px-4 py-2 text-start text-sm transition-colors
                ${lang.code === locale
                  ? 'bg-sky-brand/10 font-semibold text-sky-brand'
                  : 'text-brown hover:bg-brown/5'
                }
              `}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
