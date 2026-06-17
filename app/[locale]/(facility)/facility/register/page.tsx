'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const A = '#5A8C62';
const inputCls = "bg-white border border-[#E4DDD6] text-[#1A1714] placeholder:text-[#C0B8AE] px-4 py-3 text-sm focus:outline-none transition-colors w-full";

export default function FacilityRegister() {
  const t = useTranslations();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(20);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => e.currentTarget.style.borderColor = A;
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => e.currentTarget.style.borderColor = '#E4DDD6';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: { data: { role: 'facility', full_name: fullName } },
    });
    if (signUpError || !data.user) { setError(signUpError?.message ?? 'Sign up failed.'); setLoading(false); return; }
    const { error: restaurantError } = await supabase.from('restaurants').insert({
      name: restaurantName,
      cuisine: cuisine || null,
      description: description || null,
      capacity,
      facility_id: data.user.id,
      is_active: true,
    });
    if (restaurantError) { setError(`${t('facilityRegister.accountError')} ${restaurantError.message}`); setLoading(false); return; }
    router.push('/facility/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#F8F4EF] flex">
      <div className="hidden lg:flex flex-col justify-between w-[44%] border-r border-[#E4DDD6] p-12 bg-white">
        <Link href="/" className="text-[#A8998A] text-[10px] tracking-[0.3em] uppercase hover:text-[#6B5E52] transition-colors">
          {t('common.back')}
        </Link>
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase mb-5" style={{ color: A }}>{t('facilityRegister.portalLabel')}</p>
          <h1 className="font-display text-[#1A1714] text-6xl font-light leading-tight mb-6">
            {t('facilityRegister.hero1')}<br /><em className="italic">{t('facilityRegister.hero2')}</em>
          </h1>
          <p className="text-[#6B5E52] text-sm leading-relaxed max-w-xs">{t('facilityRegister.heroDesc')}</p>
        </div>
        <p className="text-[#D0C8BE] text-[10px] tracking-widest uppercase">{t('common.network')}</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/" className="text-[#A8998A] text-[10px] tracking-[0.3em] uppercase hover:text-[#6B5E52] transition-colors">
              {t('common.back')}
            </Link>
            <LanguageSwitcher />
          </div>
          <div className="hidden lg:flex justify-end mb-6">
            <LanguageSwitcher />
          </div>
          <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: A }}>{t('facilityRegister.createAccountLabel')}</p>
          <h2 className="font-display text-[#1A1714] text-5xl font-light mb-10">{t('common.register')}</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <p className="text-[#A8998A] text-[10px] tracking-[0.25em] uppercase">{t('facilityRegister.yourAccount')}</p>
            <div className="flex flex-col gap-2">
              <label className="text-[#6B5E52] text-[10px] tracking-[0.25em] uppercase">{t('common.fullName')}</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder={t('facilityRegister.contactPerson')} required className={inputCls} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#6B5E52] text-[10px] tracking-[0.25em] uppercase">{t('common.email')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="venue@example.com" required className={inputCls} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#6B5E52] text-[10px] tracking-[0.25em] uppercase">{t('common.password')}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required minLength={6} className={inputCls} onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            <div className="border-t border-[#E4DDD6] pt-5 flex flex-col gap-4">
              <p className="text-[#A8998A] text-[10px] tracking-[0.25em] uppercase">{t('facilityRegister.yourRestaurant')}</p>
              <div className="flex flex-col gap-2">
                <label className="text-[#6B5E52] text-[10px] tracking-[0.25em] uppercase">{t('facilityRegister.restaurantName')}</label>
                <input type="text" value={restaurantName} onChange={e => setRestaurantName(e.target.value)}
                  placeholder={t('facilityRegister.restaurantPlaceholder')} required className={inputCls} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[#6B5E52] text-[10px] tracking-[0.25em] uppercase">{t('facilityRegister.cuisine')}</label>
                <input type="text" value={cuisine} onChange={e => setCuisine(e.target.value)}
                  placeholder={t('facilityRegister.cuisinePlaceholder')} className={inputCls} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[#6B5E52] text-[10px] tracking-[0.25em] uppercase">{t('facilityRegister.description')}</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder={t('facilityRegister.descPlaceholder')} rows={3}
                  className="bg-white border border-[#E4DDD6] text-[#1A1714] placeholder:text-[#C0B8AE] px-4 py-3 text-sm focus:outline-none transition-colors resize-none w-full"
                  onFocus={focusStyle} onBlur={blurStyle} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[#6B5E52] text-[10px] tracking-[0.25em] uppercase">
                  {t('facilityRegister.capacity')} <span className="text-[#A8998A]">({t('facilityRegister.capacityUnit')})</span>
                </label>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setCapacity(Math.max(1, capacity - 5))}
                    className="w-10 h-10 border border-[#E4DDD6] text-[#6B5E52] hover:border-[#5A8C62]/40 hover:text-[#5A8C62] transition-all flex items-center justify-center text-lg bg-white">−</button>
                  <span className="font-display text-[#1A1714] text-3xl font-light w-10 text-center">{capacity}</span>
                  <button type="button" onClick={() => setCapacity(capacity + 5)}
                    className="w-10 h-10 border border-[#E4DDD6] text-[#6B5E52] hover:border-[#5A8C62]/40 hover:text-[#5A8C62] transition-all flex items-center justify-center text-lg bg-white">+</button>
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" disabled={loading}
              className="py-3 text-[10px] font-medium tracking-[0.25em] uppercase transition-all disabled:opacity-40 mt-2"
              style={{ backgroundColor: A, color: '#fff' }}
              onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = '#6A9E72')}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = A}
            >
              {loading ? t('facilityRegister.registering') : t('facilityRegister.submitLabel')}
            </button>
          </form>

          <p className="text-[#A8998A] text-xs text-center mt-8">
            {t('common.alreadyRegistered')}{' '}
            <Link href="/facility/login" className="hover:underline" style={{ color: A }}>{t('facilityRegister.signInLink')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
