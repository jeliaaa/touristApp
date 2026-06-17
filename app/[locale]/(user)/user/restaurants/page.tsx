import { createClient } from '@/lib/supabase/server';
import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { UserNav } from '../_nav';
import { SignOutButton } from '@/components/SignOutButton';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export const dynamic = 'force-dynamic';

export default async function Restaurants({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const supabase = await createClient();
  const { data: restaurants, error } = await supabase
    .from('restaurants')
    .select('id, name, cuisine, description, capacity')
    .eq('is_active', true)
    .order('name');

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
            {t('restaurants.available', { count: restaurants?.length ?? 0 })}
          </p>
          <h1 className="font-display text-[#1A1714] text-6xl font-light leading-none">
            {t('restaurants.title1')}<br /><em className="italic">{t('restaurants.title2')}</em>
          </h1>
        </div>

        {error && (
          <div className="border border-red-200 bg-red-50 p-4 mb-8">
            <p className="text-red-600 text-sm">{error.message}</p>
          </div>
        )}

        <div className="flex flex-col gap-px bg-[#E4DDD6]">
          {restaurants?.map((r, i) => (
            <div key={r.id}
              className={`bg-white hover:bg-[#FDF8F3] transition-colors group animate-fade-up delay-${Math.min(i + 1, 5)}`}>
              <div className="flex items-center justify-between p-7 gap-6">
                <div className="flex gap-5 items-start">
                  <div className="w-[3px] mt-1 self-stretch min-h-[48px] flex-shrink-0 opacity-30 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: '#C4783A' }} />
                  <div>
                    <h2 className="font-display text-[#1A1714] text-3xl font-light leading-tight mb-1">{r.name}</h2>
                    <p className="text-[#C4783A] text-[10px] tracking-[0.2em] uppercase mb-2">{r.cuisine}</p>
                    {r.description && <p className="text-[#6B5E52] text-sm leading-relaxed max-w-sm">{r.description}</p>}
                    <p className="text-[#A8998A] text-[10px] tracking-widest uppercase mt-3">
                      {t('restaurants.capacity')} {r.capacity}
                    </p>
                  </div>
                </div>
                <Link href={`/user/reserve/${r.id}`}
                  className="flex-shrink-0 border border-[#C4783A]/40 text-[#C4783A] px-5 py-2.5 text-[10px] tracking-[0.2em] uppercase hover:bg-[#C4783A] hover:text-white transition-all duration-200">
                  {t('restaurants.reserve')}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {!restaurants?.length && !error && (
          <div className="text-center py-24">
            <p className="font-display text-[#A8998A] text-3xl font-light italic mb-2">{t('restaurants.noVenues')}</p>
            <p className="text-[#A8998A] text-sm">{t('restaurants.noVenuesDesc')}</p>
          </div>
        )}
      </main>
    </div>
  );
}
