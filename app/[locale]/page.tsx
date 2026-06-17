import { Link } from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const portals = [
    {
      num: "01",
      role: t('home.user.role'),
      tagline: t('home.user.tagline'),
      desc: t('home.user.desc'),
      href: "/user/login" as const,
      accent: "#C4783A",
      hoverBg: "hover:bg-[#FDF8F3]",
      hoverBorder: "hover:border-[#C4783A]/30",
    },
    {
      num: "02",
      role: t('home.partner.role'),
      tagline: t('home.partner.tagline'),
      desc: t('home.partner.desc'),
      href: "/facility/login" as const,
      accent: "#5A8C62",
      hoverBg: "hover:bg-[#F3FAF4]",
      hoverBorder: "hover:border-[#5A8C62]/30",
    },
    {
      num: "03",
      role: t('home.driver.role'),
      tagline: t('home.driver.tagline'),
      desc: t('home.driver.desc'),
      href: "/driver/login" as const,
      accent: "#4A6E9E",
      hoverBg: "hover:bg-[#F3F6FA]",
      hoverBorder: "hover:border-[#4A6E9E]/30",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F8F4EF] flex flex-col">
      <header className="px-8 py-5 border-b border-[#E4DDD6] flex items-center justify-between">
        <span className="font-display text-[#1A1714] text-lg tracking-[0.12em] uppercase">
          {t('common.appName')}
        </span>
        <div className="flex items-center gap-6">
          <span className="text-[#A8998A] text-[10px] tracking-[0.3em] uppercase hidden sm:block">
            {t('common.tagline')}
          </span>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <div className="animate-fade-up text-center mb-16">
          <p className="text-[#A8998A] text-[10px] tracking-[0.35em] uppercase mb-5">
            {t('home.subtitle')}
          </p>
          <h1 className="font-display text-[#1A1714] text-7xl md:text-8xl font-light leading-[0.9] mb-4">
            {t('home.whoAre')}<br />
            <em className="italic">{t('home.you')}</em>
          </h1>
          <p className="text-[#6B5E52] text-sm mt-5">{t('home.selectPortal')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-px w-full max-w-4xl bg-[#E4DDD6]">
          {portals.map((p, i) => (
            <Link
              key={p.role}
              href={p.href}
              className={`group relative bg-[#F8F4EF] ${p.hoverBg} border border-transparent ${p.hoverBorder} transition-all duration-300 p-10 flex flex-col justify-between min-h-[320px] animate-fade-up delay-${i + 1}`}
            >
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase mb-6" style={{ color: p.accent }}>
                  {p.num}
                </p>
                <h2 className="font-display text-[#1A1714] text-5xl font-light mb-3 leading-none">
                  {p.role}
                </h2>
                <p className="font-display italic text-[#6B5E52] text-xl mb-5">{p.tagline}</p>
                <p className="text-[#A8998A] text-sm leading-relaxed">{p.desc}</p>
              </div>
              <div className="flex items-center gap-2 mt-8">
                <span className="text-[10px] tracking-[0.25em] uppercase" style={{ color: p.accent }}>
                  {t('home.enter')}
                </span>
                <span className="text-xs group-hover:translate-x-1 transition-transform" style={{ color: p.accent }}>→</span>
              </div>
              <div
                className="absolute bottom-0 left-0 w-0 h-[1px] group-hover:w-full transition-all duration-500"
                style={{ backgroundColor: p.accent }}
              />
            </Link>
          ))}
        </div>
      </div>

      <footer className="px-8 py-4 border-t border-[#E4DDD6] text-center">
        <p className="text-[#D0C8BE] text-[10px] tracking-[0.3em] uppercase">{t('common.footer')}</p>
      </footer>
    </main>
  );
}
