'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

const A = '#C4783A';

export function UserNav() {
  const pathname = usePathname();
  const t = useTranslations('nav');

  const items = [
    { label: t('restaurants'), href: '/user/restaurants' as const },
    { label: t('myReservations'), href: '/user/reservations' as const },
  ];

  return (
    <nav className="flex gap-6">
      {items.map(item => (
        <Link key={item.href} href={item.href}
          className="text-[10px] tracking-[0.25em] uppercase transition-colors"
          style={{ color: pathname.startsWith(item.href) ? A : '#6B5E52' }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
