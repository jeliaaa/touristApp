'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@/lib/supabase/client';

export default function DriverQR() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchQrCode() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated');
        return;
      }
      const { data, error } = await supabase
        .from('drivers')
        .select('qr_code')
        .eq('id', user.id)
        .single();
      if (error || !data) {
        setError('Could not load QR code');
      } else {
        setQrCode(data.qr_code);
      }
    }
    fetchQrCode();
  }, []);

  const qrUrl = qrCode
    ? `https://touristapp.example.com/driver/verify/${qrCode}`
    : null;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-bold">Your Driver QR Code</h1>
      <p className="text-sm text-gray-500">Passengers scan this to verify your identity</p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {qrUrl ? (
        <>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <QRCodeSVG value={qrUrl} size={220} />
          </div>
          <p className="text-xs text-gray-400 max-w-xs text-center break-all">{qrUrl}</p>
        </>
      ) : !error ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : null}
    </main>
  );
}
