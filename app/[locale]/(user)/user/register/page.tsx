'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const A = '#C4783A';
const inputCls = "bg-white border border-[#E4DDD6] text-[#1A1714] placeholder:text-[#C0B8AE] px-4 py-3 text-sm focus:outline-none transition-colors w-full";
const focusStyle = (e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = A;
const blurStyle = (e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = '#E4DDD6';

function RegisterForm() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const referalId = searchParams.get('referal_id');

  const [driverId, setDriverId] = useState<string | null>(null);
  const [referalStatus, setReferalStatus] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [referalError, setReferalError] = useState('');

  const [fullName, setFullName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function validateReferal() {
      if (!referalId) {
        setReferalError(t('userRegister.noReferralError'));
        setReferalStatus('invalid');
        return;
      }
      const supabase = createClient();
      const { data, error } = await supabase.rpc('validate_driver_qr', { qr_code_input: referalId });
      if (error || !data) {
        setReferalError(t('userRegister.invalidCodeError'));
        setReferalStatus('invalid');
        return;
      }
      setDriverId(data as string);
      setReferalStatus('valid');
    }
    validateReferal();
  }, [referalId, t]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: { data: { role: 'user', full_name: fullName, surname } },
    });
    if (signUpError || !data.user) { setError(signUpError?.message ?? 'Sign up failed.'); setLoading(false); return; }
    if (data.user && driverId) {
      await supabase.from('profiles').update({ surname, driver_referral_id: driverId }).eq('id', data.user.id);
    }
    router.push('/user/restaurants');
  }

  if (referalStatus === 'checking') {
    return (
      <div className="min-h-screen bg-[#F8F4EF] flex items-center justify-center">
        <p className="font-display text-[#A8998A] text-2xl font-light italic animate-fade-in">{t('userRegister.validating')}</p>
      </div>
    );
  }

  if (referalStatus === 'invalid') {
    return (
      <div className="min-h-screen bg-[#F8F4EF] flex flex-col items-center justify-center px-6 text-center">
        <p className="text-[10px] tracking-[0.3em] uppercase mb-4" style={{ color: A }}>{t('userRegister.accessDenied')}</p>
        <h1 className="font-display text-[#1A1714] text-5xl font-light mb-4">
          {t('userRegister.invalidTitle')} <em className="italic">{t('userRegister.invalidTitleEm')}</em>
        </h1>
        <p className="text-[#6B5E52] text-sm max-w-xs leading-relaxed mb-8">{referalError}</p>
        <Link href="/"
          className="text-[10px] tracking-[0.25em] uppercase py-3 px-8 border border-[#E4DDD6] text-[#6B5E52] hover:border-[#C4783A]/40 hover:text-[#C4783A] transition-all">
          {t('userRegister.returnHome')}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4EF] flex">
      <div className="hidden lg:flex flex-col justify-between w-[44%] border-r border-[#E4DDD6] p-12 bg-white">
        <Link href="/" className="text-[#A8998A] text-[10px] tracking-[0.3em] uppercase hover:text-[#6B5E52] transition-colors">
          {t('common.back')}
        </Link>
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase mb-5" style={{ color: A }}>{t('userRegister.portalLabel')}</p>
          <h1 className="font-display text-[#1A1714] text-6xl font-light leading-tight mb-6">
            {t('userRegister.hero1')}<br /><em className="italic">{t('userRegister.hero2')}</em>
          </h1>
          <p className="text-[#6B5E52] text-sm leading-relaxed max-w-xs">{t('userRegister.heroDesc')}</p>
          <div className="mt-8 border border-[#E4DDD6] px-4 py-3">
            <p className="text-[#A8998A] text-[10px] tracking-[0.2em] uppercase mb-1">{t('userRegister.referredBy')}</p>
            <p className="text-[#6B5E52] text-xs font-mono truncate">{referalId}</p>
          </div>
        </div>
        <p className="text-[#D0C8BE] text-[10px] tracking-widest uppercase">{t('common.network')}</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
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
          <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: A }}>{t('userRegister.createAccountLabel')}</p>
          <h2 className="font-display text-[#1A1714] text-5xl font-light mb-10">{t('common.register')}</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex gap-3">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-[#6B5E52] text-[10px] tracking-[0.25em] uppercase">{t('userRegister.firstName')}</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="John" required className={inputCls} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-[#6B5E52] text-[10px] tracking-[0.25em] uppercase">{t('userRegister.surname')}</label>
                <input type="text" value={surname} onChange={e => setSurname(e.target.value)}
                  placeholder="Doe" required className={inputCls} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#6B5E52] text-[10px] tracking-[0.25em] uppercase">{t('common.email')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@gmail.com" required className={inputCls} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#6B5E52] text-[10px] tracking-[0.25em] uppercase">{t('common.password')}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required minLength={6} className={inputCls} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" disabled={loading}
              className="py-3 text-[10px] font-medium tracking-[0.25em] uppercase transition-all disabled:opacity-40 mt-2"
              style={{ backgroundColor: A, color: '#fff' }}
              onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = '#D4884A')}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = A}
            >
              {loading ? t('common.creatingAccount') : t('common.createAccount')}
            </button>
          </form>
          <p className="text-[#A8998A] text-xs text-center mt-8">
            {t('common.alreadyRegistered')}{' '}
            <Link href="/user/login" className="hover:underline" style={{ color: A }}>{t('userRegister.signInLink')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UserRegister() {
  const t = useTranslations('common');
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F4EF] flex items-center justify-center">
        <p className="font-display text-[#A8998A] text-2xl font-light italic">{t('loading')}</p>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
