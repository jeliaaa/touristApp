'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const A = '#5A8C62';
const inputCls = "bg-white border border-[#E4DDD6] text-[#1A1714] placeholder:text-[#C0B8AE] px-4 py-3 text-sm focus:outline-none transition-colors w-full";

export default function FacilityLogin() {
  const t = useTranslations();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else router.push('/facility/dashboard');
  }

  const focusStyle = (e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = A;
  const blurStyle = (e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = '#E4DDD6';

  return (
    <div className="min-h-screen bg-[#F8F4EF] flex">
      <div className="hidden lg:flex flex-col justify-between w-[44%] border-r border-[#E4DDD6] p-12 bg-white">
        <Link href="/" className="text-[#A8998A] text-[10px] tracking-[0.3em] uppercase hover:text-[#6B5E52] transition-colors">
          {t('common.back')}
        </Link>
        <div className="animate-fade-up">
          <p className="text-[10px] tracking-[0.3em] uppercase mb-5" style={{ color: A }}>{t('facilityLogin.portalLabel')}</p>
          <h1 className="font-display text-[#1A1714] text-6xl font-light leading-tight mb-6">
            {t('facilityLogin.hero1')}<br /><em className="italic">{t('facilityLogin.hero2')}</em><br />{t('facilityLogin.hero3')}
          </h1>
          <p className="text-[#6B5E52] text-sm leading-relaxed max-w-xs">{t('facilityLogin.heroDesc')}</p>
        </div>
        <p className="text-[#D0C8BE] text-[10px] tracking-widest uppercase">{t('common.network')}</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/" className="text-[#A8998A] text-[10px] tracking-[0.3em] uppercase hover:text-[#6B5E52] transition-colors">
              {t('common.back')}
            </Link>
            <LanguageSwitcher />
          </div>
          <div className="hidden lg:flex justify-end mb-6">
            <LanguageSwitcher />
          </div>
          <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: A }}>{t('facilityLogin.portalSubLabel')}</p>
          <h2 className="font-display text-[#1A1714] text-5xl font-light mb-10">{t('common.signIn')}</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[#6B5E52] text-[10px] tracking-[0.25em] uppercase">{t('common.email')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="venue@example.com" required className={inputCls} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#6B5E52] text-[10px] tracking-[0.25em] uppercase">{t('common.password')}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required className={inputCls} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" disabled={loading}
              className="py-3 text-[10px] font-medium tracking-[0.25em] uppercase transition-all disabled:opacity-40 mt-2"
              style={{ backgroundColor: A, color: '#fff' }}
              onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = '#6A9E72')}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = A}
            >
              {loading ? t('common.signingIn') : t('common.signIn')}
            </button>
          </form>
          <p className="text-[#A8998A] text-xs text-center mt-8">
            {t('common.noAccount')}{' '}
            <Link href="/facility/register" className="hover:underline" style={{ color: A }}>{t('facilityLogin.registerLink')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
