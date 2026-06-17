'use client';

import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/i18n/navigation';

export function SignOutButton({ className }: { className?: string }) {
  const t = useTranslations('common');
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <button onClick={handleSignOut} className={className}>
      {t('signOut')}
    </button>
  );
}
