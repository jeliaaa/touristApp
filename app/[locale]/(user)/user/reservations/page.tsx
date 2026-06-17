import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { UserNav } from '../_nav';
import { SignOutButton } from '@/components/SignOutButton';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export const dynamic = 'force-dynamic';

export default async function UserReservations({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/user/login`);

  const { data: reservations, error } = await supabase
    .from('reservations')
    .select('id, date, time, party_size, status, notes, restaurants(name, cuisine)')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  const STATUS_STYLES: Record<string, { color: string; bg: string; border: string }> = {
    pending:   { color: '#C4783A', bg: '#FDF5EE', border: '#F0CFAE' },
    confirmed: { color: '#5A8C62', bg: '#F0F7F1', border: '#AECDB3' },
    cancelled: { color: '#8C8078', bg: '#F5F3F1', border: '#D0C8C0' },
  };

  const statusLabel: Record<string, string> = {
    pending:   t('reservations.status.pending'),
    confirmed: t('reservations.status.confirmed'),
    cancelled: t('reservations.status.cancelled'),
  };

  return (
    <div className="min-h-screen bg-[#F8F4EF]">
      <header className="px-8 py-5 border-b border-[#E4DDD6] bg-white flex items-center justify-between">
        <span className="font-display text-[#1A1714] text-lg tracking-[0.12em] uppercase">{t('common.appName')}</span>
        <div className="flex items-center gap-6">
          <UserNav />
          <LanguageSwitcher />
          <SignOutButton className="text-[#A8998A] text-[10px] tracking-[0.25em] uppercase hover:text-[#6B5E52] transition-colors" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-14">
        <div className="mb-12 animate-fade-up">
          <p className="text-[#C4783A] text-[10px] tracking-[0.3em] uppercase mb-3">
            {t('reservations.count', { count: reservations?.length ?? 0 })}
          </p>
          <h1 className="font-display text-[#1A1714] text-6xl font-light leading-none">
            {t('reservations.title1')}<br /><em className="italic">{t('reservations.title2')}</em>
          </h1>
        </div>

        {error && (
          <div className="border border-red-200 bg-red-50 p-4 mb-8">
            <p className="text-red-600 text-sm">{error.message}</p>
          </div>
        )}

        {reservations && reservations.length > 0 ? (
          <div className="flex flex-col gap-px bg-[#E4DDD6] animate-fade-up delay-1">
            {reservations.map((r) => {
              const restaurant = r.restaurants as unknown as { name: string; cuisine: string } | null;
              const s = STATUS_STYLES[r.status] ?? STATUS_STYLES.pending;
              return (
                <div key={r.id} className="bg-white hover:bg-[#FDF8F3] transition-colors p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-5 items-start">
                      <div className="w-[3px] mt-1 self-stretch min-h-[48px] flex-shrink-0"
                        style={{ backgroundColor: s.color, opacity: 0.5 }} />
                      <div>
                        <h2 className="font-display text-[#1A1714] text-3xl font-light leading-tight mb-1">
                          {restaurant?.name ?? '—'}
                        </h2>
                        <p className="text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: s.color }}>
                          {restaurant?.cuisine}
                        </p>
                        <div className="flex flex-wrap gap-3 text-[#6B5E52] text-xs">
                          <span>{r.date}</span>
                          <span>·</span>
                          <span>{r.time}</span>
                          <span>·</span>
                          <span>{r.party_size} {r.party_size !== 1 ? t('reservations.guests') : t('reservations.guest')}</span>
                        </div>
                        {r.notes && <p className="text-[#A8998A] text-xs mt-2 italic">"{r.notes}"</p>}
                      </div>
                    </div>
                    <span className="flex-shrink-0 text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 border"
                      style={{ color: s.color, backgroundColor: s.bg, borderColor: s.border }}>
                      {statusLabel[r.status] ?? r.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : !error ? (
          <div className="text-center py-24 animate-fade-up delay-1">
            <p className="font-display text-[#A8998A] text-3xl font-light italic mb-3">{t('reservations.noReservations')}</p>
            <p className="text-[#A8998A] text-sm mb-8">{t('reservations.noReservationsDesc')}</p>
            <Link href="/user/restaurants"
              className="text-[10px] tracking-[0.25em] uppercase py-3 px-8 border border-[#E4DDD6] text-[#6B5E52] hover:border-[#C4783A]/40 hover:text-[#C4783A] transition-all">
              {t('reservations.viewRestaurants')}
            </Link>
          </div>
        ) : null}
      </main>
    </div>
  );
}
