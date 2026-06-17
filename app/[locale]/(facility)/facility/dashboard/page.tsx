import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { StatusChanger } from './_status';
import { SignOutButton } from '@/components/SignOutButton';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export const dynamic = 'force-dynamic';

export default async function FacilityDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/facility/login`);

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
  const { data: restaurants } = await supabase.from('restaurants').select('id, name, capacity, is_active').eq('facility_id', user.id);

  let reservations: Array<{
    id: string; date: string; time: string; party_size: number;
    status: string; notes: string | null; restaurants: { name: string } | null;
  }> = [];

  if (restaurants?.length) {
    const { data } = await supabase
      .from('reservations')
      .select('id, date, time, party_size, status, notes, restaurants(name)')
      .in('restaurant_id', restaurants.map(r => r.id))
      .order('date', { ascending: false })
      .limit(50);
    reservations = (data as unknown as typeof reservations) ?? [];
  }

  const counts = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'pending').length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length,
    cancelled: reservations.filter(r => r.status === 'cancelled').length,
  };

  const stats = [
    { label: t('facilityDashboard.total'),     value: counts.total,     color: '#1A1714' },
    { label: t('facilityDashboard.pending'),   value: counts.pending,   color: '#C4783A' },
    { label: t('facilityDashboard.confirmed'), value: counts.confirmed, color: '#5A8C62' },
    { label: t('facilityDashboard.cancelled'), value: counts.cancelled, color: '#8C8078' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F4EF]">
      <header className="px-4 sm:px-8 py-5 border-b border-[#E4DDD6] bg-white flex items-center justify-between gap-4">
        <span className="font-display text-[#1A1714] text-lg tracking-[0.12em] uppercase">{t('common.appName')}</span>
        <div className="flex items-center gap-6">
          {profile?.full_name && <span className="text-[#6B5E52] text-xs hidden sm:block">{profile.full_name}</span>}
          <LanguageSwitcher />
          <SignOutButton className="text-[#A8998A] text-[10px] tracking-[0.25em] uppercase hover:text-[#6B5E52] transition-colors" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-14">
        <div className="mb-12 animate-fade-up">
          <p className="text-[#5A8C62] text-[10px] tracking-[0.3em] uppercase mb-3">{t('facilityDashboard.dashLabel')}</p>
          <h1 className="font-display text-[#1A1714] text-6xl font-light leading-none">{t('facilityDashboard.title')}</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#E4DDD6] mb-12 animate-fade-up delay-1">
          {stats.map(s => (
            <div key={s.label} className="bg-white p-7">
              <p className="text-[#A8998A] text-[10px] tracking-[0.25em] uppercase mb-2">{s.label}</p>
              <p className="font-display text-5xl font-light" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {restaurants && restaurants.length > 0 && (
          <div className="mb-10 animate-fade-up delay-2">
            <p className="text-[#A8998A] text-[10px] tracking-[0.3em] uppercase mb-4">{t('facilityDashboard.yourVenues')}</p>
            <div className="flex flex-wrap gap-2">
              {restaurants.map(r => (
                <span key={r.id} className="border border-[#E4DDD6] bg-white text-[#6B5E52] text-xs px-3 py-1.5 tracking-wide">
                  {r.name}<span className="text-[#A8998A] ml-2">· {r.capacity} {t('facilityDashboard.cap')}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {(!restaurants || restaurants.length === 0) && (
          <div className="border border-[#E4DDD6] bg-white p-10 text-center mb-10 animate-fade-up delay-2">
            <p className="font-display text-[#A8998A] text-3xl font-light italic mb-2">{t('facilityDashboard.noRestaurant')}</p>
            <p className="text-[#A8998A] text-sm">{t('facilityDashboard.noRestaurantDesc')}</p>
          </div>
        )}

        {reservations.length > 0 ? (
          <div className="animate-fade-up delay-3">
            <p className="text-[#A8998A] text-[10px] tracking-[0.3em] uppercase mb-4">{t('facilityDashboard.recentReservations')}</p>
            <div className="flex flex-col gap-px bg-[#E4DDD6]">
              <div className="hidden md:grid bg-[#F8F4EF] grid-cols-[1fr_110px_70px_56px_auto] gap-4 px-6 py-3 text-[#A8998A] text-[10px] tracking-[0.2em] uppercase">
                <span>{t('facilityDashboard.colRestaurant')}</span>
                <span>{t('facilityDashboard.colDate')}</span>
                <span>{t('facilityDashboard.colTime')}</span>
                <span>{t('facilityDashboard.colGuests')}</span>
                <span>{t('facilityDashboard.colStatus')}</span>
              </div>

              {reservations.map(r => (
                <div key={r.id} className="bg-white hover:bg-[#FDF8F3] transition-colors">
                  <div className="md:hidden px-5 py-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-display text-[#1A1714] text-xl font-light leading-tight">
                        {r.restaurants?.name ?? '—'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[#6B5E52] text-xs">
                      <span>{r.date}</span>
                      <span>·</span>
                      <span>{r.time}</span>
                      <span>·</span>
                      <span>{r.party_size} {t('facilityDashboard.colGuests').toLowerCase()}</span>
                    </div>
                    <StatusChanger reservationId={r.id} current={r.status as 'pending' | 'confirmed' | 'cancelled'} />
                  </div>

                  <div className="hidden md:grid grid-cols-[1fr_110px_70px_56px_auto] gap-4 px-6 py-4 items-center">
                    <span className="font-display text-[#1A1714] text-base font-light truncate">{r.restaurants?.name ?? '—'}</span>
                    <span className="text-[#6B5E52] text-xs">{r.date}</span>
                    <span className="text-[#6B5E52] text-xs">{r.time}</span>
                    <span className="text-[#6B5E52] text-xs">{r.party_size}</span>
                    <StatusChanger reservationId={r.id} current={r.status as 'pending' | 'confirmed' | 'cancelled'} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : restaurants && restaurants.length > 0 ? (
          <div className="text-center py-16 animate-fade-up delay-3">
            <p className="font-display text-[#A8998A] text-3xl font-light italic">{t('facilityDashboard.noReservations')}</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
