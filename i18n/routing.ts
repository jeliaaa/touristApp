import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ka', 'ru', 'uk', 'he', 'ar'],
  defaultLocale: 'en',
});
