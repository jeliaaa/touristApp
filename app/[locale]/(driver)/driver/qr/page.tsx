'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslations, useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
import { SignOutButton } from '@/components/SignOutButton';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function DriverQR() {
  const t = useTranslations('driverQr');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [driverName, setDriverName] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError(t('notAuthenticated')); return; }

      const [driverRes, profileRes] = await Promise.all([
        supabase.from('drivers').select('qr_code').eq('id', user.id).maybeSingle(),
        supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
      ]);

      let driverData = driverRes.data;

      if (!driverData) {
        const { data: inserted, error: insertError } = await supabase
          .from('drivers')
          .insert({ id: user.id })
          .select('qr_code')
          .single();
        if (insertError || !inserted) { setError(t('driverRecordError')); return; }
        driverData = inserted;
      }

      const code = driverData.qr_code;
      setQrCode(code);
      setQrUrl(`${window.location.origin}/${locale}/user/register?referal_id=${code}`);
      setDriverName(profileRes.data?.full_name ?? null);
    }
    load();
  }, [t, locale]);

  const firstName = driverName ? driverName.split(' ')[0] : null;

  return (
    <div className="min-h-screen bg-[#F8F4EF] flex flex-col">
      <header className="px-8 py-5 border-b border-[#E4DDD6] bg-white flex items-center justify-between">
        <span className="font-display text-[#1A1714] text-lg tracking-[0.12em] uppercase">{tCommon('appName')}</span>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <SignOutButton className="text-[#A8998A] text-[10px] tracking-[0.25em] uppercase hover:text-[#6B5E52] transition-colors" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="text-center mb-10 animate-fade-up">
          <p className="text-[#4A6E9E] text-[10px] tracking-[0.35em] uppercase mb-3">{t('verificationLabel')}</p>
          <h1 className="font-display text-[#1A1714] text-5xl font-light">
            {firstName ? <>{t('titleWith', { name: firstName })} <em className="italic">{t('titleCode')}</em></> : <>{t('titleOwn')} <em className="italic">{t('titleCode')}</em></>}
          </h1>
        </div>

        {error && (
          <div className="border border-red-200 bg-red-50 px-6 py-4 text-center">
            <p className="text-red-600 text-sm">{error}</p>
            <Link href="/driver/login" className="text-[#4A6E9E] text-xs mt-2 block hover:underline">
              {t('returnToLogin')}
            </Link>
          </div>
        )}

        {qrUrl ? (
          <div className="flex flex-col items-center animate-fade-up delay-2">
            <div className="bg-white border border-[#E4DDD6] p-7 shadow-sm">
              <QRCodeSVG value={qrUrl} size={220} bgColor="#FFFFFF" fgColor="#1A1714" />
            </div>
            <div className="w-full max-w-xs mt-px bg-[#4A6E9E] h-[2px]" />
            <div className="mt-8 text-center">
              <p className="text-[#A8998A] text-[10px] tracking-[0.3em] uppercase mb-1">{t('showToPassengers')}</p>
              {driverName && <p className="font-display text-[#6B5E52] text-lg italic">{driverName}</p>}
            </div>
            <div className="mt-8 border border-[#E4DDD6] bg-white px-8 py-5 text-center max-w-xs">
              <p className="text-[#A8998A] text-[10px] tracking-[0.2em] uppercase mb-2">{t('verificationId')}</p>
              <p className="text-[#C0B8AE] text-[10px] font-mono break-all leading-relaxed">{qrCode}</p>
            </div>
          </div>
        ) : !error ? (
          <div className="text-center animate-fade-in">
            <p className="font-display text-[#A8998A] text-2xl font-light italic">{t('loading')}</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
