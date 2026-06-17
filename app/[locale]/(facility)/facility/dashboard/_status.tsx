'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/i18n/navigation';

type Status = 'pending' | 'confirmed' | 'cancelled';

export function StatusChanger({ reservationId, current }: { reservationId: string; current: Status }) {
  const t = useTranslations('facilityDashboard');
  const router = useRouter();
  const [status, setStatus] = useState<Status>(current);
  const [loading, setLoading] = useState(false);

  const OPTIONS: { value: Status; label: string; color: string; bg: string; border: string }[] = [
    { value: 'pending',   label: t('pending'),   color: '#C4783A', bg: '#FDF5EE', border: '#F0CFAE' },
    { value: 'confirmed', label: t('confirmed'), color: '#5A8C62', bg: '#F0F7F1', border: '#AECDB3' },
    { value: 'cancelled', label: t('cancelled'), color: '#8C8078', bg: '#F5F3F1', border: '#D0C8C0' },
  ];

  async function update(next: Status) {
    if (next === status || loading) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from('reservations').update({ status: next }).eq('id', reservationId);
    if (!error) { setStatus(next); router.refresh(); }
    setLoading(false);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {OPTIONS.map(o => {
        const active = status === o.value;
        return (
          <button key={o.value} onClick={() => update(o.value)} disabled={loading}
            className="text-[9px] tracking-[0.15em] uppercase px-2.5 py-1 border transition-all disabled:opacity-40"
            style={{
              borderColor: active ? o.border : '#E4DDD6',
              color: active ? o.color : '#A8998A',
              backgroundColor: active ? o.bg : 'white',
            }}
            onMouseEnter={e => !active && (e.currentTarget.style.borderColor = o.border)}
            onMouseLeave={e => !active && (e.currentTarget.style.borderColor = '#E4DDD6')}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
