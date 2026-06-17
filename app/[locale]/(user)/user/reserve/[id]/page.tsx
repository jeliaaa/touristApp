import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { UserNav } from '../../_nav';
import { SignOutButton } from '@/components/SignOutButton';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import ReserveForm from './ReserveForm';

interface Props { params: Promise<{ locale: string; id: string }>; }

export default async function ReservePage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const supabase = await createClient();
  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select('id, name, cuisine, description, capacity')
    .eq('id', id).eq('is_active', true).single();
  if (error || !restaurant) notFound();

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

      <main className="max-w-xl mx-auto px-6 py-14">
        <div className="mb-10 animate-fade-up">
          <p className="text-[#C4783A] text-[10px] tracking-[0.3em] uppercase mb-3">{restaurant.cuisine}</p>
          <h1 className="font-display text-[#1A1714] text-6xl font-light leading-none mb-4">{restaurant.name}</h1>
          {restaurant.description && <p className="text-[#6B5E52] text-sm leading-relaxed">{restaurant.description}</p>}
          <p className="text-[#A8998A] text-[10px] tracking-widest uppercase mt-3">
            {t('reserve.capacityLabel')} {restaurant.capacity} {t('reserve.capacityGuests')}
          </p>
        </div>
        <ReserveForm restaurantId={restaurant.id} restaurantName={restaurant.name} />
      </main>
    </div>
  );
}
