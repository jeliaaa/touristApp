'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

const LANGUAGES = [
  { code: 'en', native: 'English' },
  { code: 'ka', native: 'ქართული' },
  { code: 'ru', native: 'Русский' },
  { code: 'uk', native: 'Українська' },
  { code: 'he', native: 'עברית' },
  { code: 'ar', native: 'العربية' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function switchLocale(code: string) {
    setOpen(false);
    router.replace(pathname, { locale: code });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-[#A8998A] hover:text-[#6B5E52] transition-colors"
        aria-label="Switch language"
      >
        <span className="text-[10px] tracking-[0.25em] uppercase font-medium">{locale}</span>
        <svg
          className={`w-2.5 h-2.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 10 6" fill="none"
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-[#E4DDD6] shadow-sm z-50 py-1 min-w-[148px]">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => switchLocale(lang.code)}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 transition-colors hover:bg-[#F8F4EF] text-left"
            >
              <span
                className="text-[9px] tracking-[0.2em] uppercase w-5 shrink-0 font-medium"
                style={{ color: lang.code === locale ? '#C4783A' : '#A8998A' }}
              >
                {lang.code}
              </span>
              <span
                className="text-[11px] leading-tight"
                style={{ color: lang.code === locale ? '#1A1714' : '#6B5E52' }}
              >
                {lang.native}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
