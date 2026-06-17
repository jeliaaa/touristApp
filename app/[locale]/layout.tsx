import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import "../globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Refresh Supabase session (Node.js runtime — safe here, unlike Edge middleware)
  const supabase = await createClient();
  await supabase.auth.getUser();

  const messages = await getMessages();
  const isRtl = locale === 'he' || locale === 'ar';

  return (
    <html
      lang={locale}
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`${cormorant.variable} ${dmSans.variable}`}
    >
      <body style={{ fontFamily: "var(--font-body), system-ui, sans-serif", backgroundColor: "#F8F4EF", color: "#1A1714" }}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
