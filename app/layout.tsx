import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { getLocale } from 'next-intl/server';
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Tourist App — Georgian Hospitality",
  description: "Discover and reserve Tbilisi's finest dining experiences",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const isRtl = locale === 'he' || locale === 'ar';

  return (
    <html
      lang={locale}
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`${cormorant.variable} ${dmSans.variable}`}
    >
      <body style={{ fontFamily: "var(--font-body), system-ui, sans-serif", backgroundColor: "#F8F4EF", color: "#1A1714" }}>
        {children}
      </body>
    </html>
  );
}
