import { notFound } from "next/navigation"
import Link from "next/link"
import { isValidLocale, getTranslations, locales } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params
  if (!isValidLocale(locale)) notFound()

  const t = getTranslations(locale as Locale)
  const altLocale = locale === 'en' ? 'fr' : 'en'

  return (
    <>
      <header className="bg-white/80 backdrop-blur-lg border-b border-[var(--border)] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-[var(--hero-bg)] flex items-center justify-center transition-transform group-hover:scale-105">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 .67 3 1.5S13.66 8 12 8s-3-.67-3-1.5S10.34 5 12 5zM7 19v-2c0-2.76 4-4 5-4s5 1.24 5 4v2H7z" fill="currentColor"/>
                <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.5"/>
              </svg>
            </div>
            <span className="font-heading font-semibold text-[17px] tracking-tight">{t.siteName}</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href={`/${locale}/map`} className="px-3.5 py-2 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-inset)] rounded-lg transition-colors">
              {t.navMap}
            </Link>
            <Link href={`/${locale}/fares`} className="px-3.5 py-2 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-inset)] rounded-lg transition-colors">
              {t.navFares}
            </Link>
            <Link
              href={`/${altLocale}`}
              className="ml-2 px-2.5 py-1.5 text-[12px] font-semibold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border)] hover:border-[#bbb] rounded-md transition-colors"
            >
              {altLocale.toUpperCase()}
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[var(--border)] bg-white py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col sm:flex-row justify-between gap-6">
            <div>
              <p className="font-heading font-semibold text-sm tracking-tight">{t.siteName}</p>
              <p className="mt-1.5 text-[13px] text-[var(--text-muted)] max-w-xs leading-relaxed">
                {t.footerDescription}
              </p>
            </div>
            <div className="flex gap-8 text-[13px]">
              <div className="space-y-2">
                <p className="font-medium text-[var(--text-muted)] text-[11px] uppercase tracking-wider">{t.navigate}</p>
                <Link href={`/${locale}/map`} className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{t.networkMap}</Link>
                <Link href={`/${locale}/fares`} className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{t.faresZones}</Link>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-[var(--text-muted)] text-[11px] uppercase tracking-wider">{t.lines}</p>
                <Link href={`/${locale}/line/green`} className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{locale === 'fr' ? 'Ligne verte' : 'Green Line'}</Link>
                <Link href={`/${locale}/line/orange`} className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{locale === 'fr' ? 'Ligne orange' : 'Orange Line'}</Link>
                <Link href={`/${locale}/line/blue`} className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{locale === 'fr' ? 'Ligne bleue' : 'Blue Line'}</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
