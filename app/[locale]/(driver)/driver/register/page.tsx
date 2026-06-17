'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const A = '#4A6E9E';
const inputCls = "bg-white border border-[#E4DDD6] text-[#1A1714] placeholder:text-[#C0B8AE] px-4 py-3 text-sm focus:outline-none transition-colors w-full";

export default function DriverRegister() {
  const t = useTranslations();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const focusStyle = (e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = A;
  const blurStyle = (e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = '#E4DDD6';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: { data: { role: 'driver', full_name: fullName } },
    });
    if (signUpError) { setError(signUpError.message); setLoading(false); return; }
    if (vehicleType || plateNumber) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('drivers').update({ vehicle_type: vehicleType || null, plate_number: plateNumber || null }).eq('id', user.id);
      }
    }
    router.push('/driver/qr');
  }

  return (
    <div className="min-h-screen bg-[#F8F4EF] flex">
      <div className="hidden lg:flex flex-col justify-between w-[44%] border-r border-[#E4DDD6] p-12 bg-white">
        <Link href="/" className="text-[#A8998A] text-[10px] tracking-[0.3em] uppercase hover:text-[#6B5E52] transition-colors">
          {t('common.back')}
        </Link>
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase mb-5" style={{ color: A }}>{t('driverRegister.portalLabel')}</p>
          <h1 className="font-display text-[#1A1714] text-6xl font-light leading-tight mb-6">
            {t('driverRegister.hero1')}<br /><em className="italic">{t('driverRegister.hero2')}</em>
          </h1>
          <p className="text-[#6B5E52] text-sm leading-relaxed max-w-xs">{t('driverRegister.heroDesc')}</p>
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
          <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: A }}>{t('driverRegister.createAccountLabel')}</p>
          <h2 className="font-display text-[#1A1714] text-5xl font-light mb-10">{t('common.register')}</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[#6B5E52] text-[10px] tracking-[0.25em] uppercase">{t('common.fullName')}</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder={t('driverRegister.yourName')} required className={inputCls} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#6B5E52] text-[10px] tracking-[0.25em] uppercase">{t('common.email')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="driver@example.com" required className={inputCls} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#6B5E52] text-[10px] tracking-[0.25em] uppercase">{t('common.password')}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required minLength={6} className={inputCls} onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            <div className="border-t border-[#E4DDD6] pt-5 flex flex-col gap-4">
              <p className="text-[#A8998A] text-[10px] tracking-[0.2em] uppercase">
                {t('driverRegister.vehicleInfo')} <span className="text-[#C0B8AE]">({t('common.optional')})</span>
              </p>
              <div className="flex flex-col gap-2">
                <label className="text-[#6B5E52] text-[10px] tracking-[0.25em] uppercase">{t('driverRegister.vehicleType')}</label>
                <input type="text" value={vehicleType} onChange={e => setVehicleType(e.target.value)}
                  placeholder={t('driverRegister.vehiclePlaceholder')} className={inputCls} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[#6B5E52] text-[10px] tracking-[0.25em] uppercase">{t('driverRegister.plateNumber')}</label>
                <input type="text" value={plateNumber} onChange={e => setPlateNumber(e.target.value)}
                  placeholder={t('driverRegister.platePlaceholder')} className={inputCls} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" disabled={loading}
              className="py-3 text-[10px] font-medium tracking-[0.25em] uppercase transition-all disabled:opacity-40 mt-1"
              style={{ backgroundColor: A, color: '#fff' }}
              onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = '#5A7EAE')}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = A}
            >
              {loading ? t('common.creatingAccount') : t('common.createAccount')}
            </button>
          </form>
          <p className="text-[#A8998A] text-xs text-center mt-8">
            {t('common.alreadyRegistered')}{' '}
            <Link href="/driver/login" className="hover:underline" style={{ color: A }}>{t('common.signInLink')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
