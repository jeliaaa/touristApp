'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

const A = '#C4783A';
const LUNCH = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30'];
const DINNER = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];

interface Props { restaurantId: string; restaurantName: string; }

export default function ReserveForm({ restaurantId }: Props) {
  const t = useTranslations('reserve');
  const tRes = useTranslations('reservations');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!time) { setError(t('selectTimeError')); return; }
    setError(''); setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError(t('notSignedInError')); setLoading(false); return; }
    const { error } = await supabase.from('reservations').insert({
      user_id: user.id, restaurant_id: restaurantId, date, time, party_size: partySize, notes: notes || null,
    });
    if (error) { setError(error.message); setLoading(false); }
    else { setSuccess(true); setTimeout(() => router.push('/user/restaurants'), 2500); }
  }

  if (success) {
    return (
      <div className="border border-[#AECDB3] bg-[#F0F7F1] p-10 text-center animate-fade-in">
        <p className="font-display text-[#5A8C62] text-4xl font-light italic mb-2">{t('successTitle')}</p>
        <p className="text-[#6B5E52] text-sm">{t('successDesc')}</p>
        <p className="text-[#A8998A] text-xs mt-2">{t('returning')}</p>
      </div>
    );
  }

  const timeBtn = (slot: string) => (
    <button key={slot} type="button" onClick={() => setTime(slot)}
      className="py-2 px-3 text-xs tracking-widest transition-all duration-150 border"
      style={{
        borderColor: time === slot ? A : '#E4DDD6',
        backgroundColor: time === slot ? '#FDF5EE' : 'white',
        color: time === slot ? A : '#6B5E52',
      }}
      onMouseEnter={e => time !== slot && (e.currentTarget.style.borderColor = `${A}60`)}
      onMouseLeave={e => time !== slot && (e.currentTarget.style.borderColor = '#E4DDD6')}
    >
      {slot}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 animate-fade-up delay-2">
      <div className="flex flex-col gap-3">
        <label className="text-[#6B5E52] text-[10px] tracking-[0.25em] uppercase">{t('date')}</label>
        <input type="date" value={date} min={today} onChange={e => setDate(e.target.value)} required
          className="bg-white border border-[#E4DDD6] text-[#1A1714] px-4 py-3 text-sm focus:outline-none transition-colors w-full"
          onFocus={e => e.currentTarget.style.borderColor = A}
          onBlur={e => e.currentTarget.style.borderColor = '#E4DDD6'} />
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[#6B5E52] text-[10px] tracking-[0.25em] uppercase">{t('time')}</label>
        <p className="text-[#A8998A] text-[10px] tracking-[0.2em] uppercase">{t('lunch')}</p>
        <div className="grid grid-cols-3 gap-2">{LUNCH.map(timeBtn)}</div>
        <p className="text-[#A8998A] text-[10px] tracking-[0.2em] uppercase mt-1">{t('dinner')}</p>
        <div className="grid grid-cols-4 gap-2">{DINNER.map(timeBtn)}</div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[#6B5E52] text-[10px] tracking-[0.25em] uppercase">{t('partySize')}</label>
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => setPartySize(Math.max(1, partySize - 1))}
            className="w-10 h-10 border border-[#E4DDD6] bg-white text-[#6B5E52] text-lg hover:border-[#C4783A]/40 hover:text-[#C4783A] transition-all flex items-center justify-center">−</button>
          <span className="font-display text-[#1A1714] text-3xl font-light w-8 text-center">{partySize}</span>
          <button type="button" onClick={() => setPartySize(Math.min(20, partySize + 1))}
            className="w-10 h-10 border border-[#E4DDD6] bg-white text-[#6B5E52] text-lg hover:border-[#C4783A]/40 hover:text-[#C4783A] transition-all flex items-center justify-center">+</button>
          <span className="text-[#A8998A] text-xs">
            {partySize !== 1 ? tRes('guests') : tRes('guest')}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[#6B5E52] text-[10px] tracking-[0.25em] uppercase">
          {t('notes')} <span className="text-[#A8998A]">({tCommon('optional')})</span>
        </label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder={t('notesPlaceholder')} rows={3}
          className="bg-white border border-[#E4DDD6] text-[#1A1714] placeholder:text-[#C0B8AE] px-4 py-3 text-sm focus:outline-none transition-colors resize-none w-full"
          onFocus={e => e.currentTarget.style.borderColor = A}
          onBlur={e => e.currentTarget.style.borderColor = '#E4DDD6'} />
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <button type="submit" disabled={loading}
        className="py-3.5 text-[10px] font-medium tracking-[0.25em] uppercase transition-all disabled:opacity-40"
        style={{ backgroundColor: A, color: '#fff' }}
        onMouseEnter={e => !loading && (e.currentTarget.style.backgroundColor = '#D4884A')}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = A}
      >
        {loading ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}
