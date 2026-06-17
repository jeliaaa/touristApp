'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00',
];

interface Props {
  restaurantId: string;
  restaurantName: string;
}

export default function ReserveForm({ restaurantId, restaurantName }: Props) {
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
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be logged in to make a reservation.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('reservations').insert({
      user_id: user.id,
      restaurant_id: restaurantId,
      date,
      time,
      party_size: partySize,
      notes: notes || null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/user/restaurants'), 2000);
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <p className="text-green-700 font-medium">Reservation submitted!</p>
        <p className="text-sm text-gray-500 mt-1">Redirecting back to restaurants…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
      <h2 className="font-semibold text-lg">Reserve at {restaurantName}</h2>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          value={date}
          min={today}
          onChange={(e) => setDate(e.target.value)}
          required
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Time</label>
        <select
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select a time</option>
          {TIME_SLOTS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Party size</label>
        <input
          type="number"
          value={partySize}
          min={1}
          max={20}
          onChange={(e) => setPartySize(Number(e.target.value))}
          required
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Allergies, special requests…"
          rows={3}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white rounded-lg py-2 font-medium hover:bg-green-700 transition disabled:opacity-50"
      >
        {loading ? 'Submitting…' : 'Confirm Reservation'}
      </button>
    </form>
  );
}
