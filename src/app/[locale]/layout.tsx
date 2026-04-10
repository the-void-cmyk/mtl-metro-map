import { notFound } from "next/navigation"
import Link from "next/link"
import { isValidLocale, getTranslations, locales } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import ThemeToggle from "@/components/ThemeToggle"
import NavMore from "@/components/NavMore"
import NavGlass from "@/components/NavGlass"
import PWAInstall from "@/components/PWAInstall"

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
      <header id="main-navbar" className="fixed top-0 left-0 right-0 z-50 border-b border-white/10">
        <NavGlass />
        <div className="relative max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center group transition-opacity hover:opacity-80">
            <svg width="40" height="40" viewBox="0 0 1024 1024" fill="var(--orange-line)" aria-label={t.siteName}>
              <path d="M65.39,709.62h89.32v89.32h-89.32v-89.32ZM244.04,530.97v89.32h-89.32v-89.32h89.32ZM422.68,173.69v446.61h89.32v89.32h-89.32v89.32h-89.32v-446.61h-89.32v-178.64h178.64ZM869.29,352.33h-178.64v89.32h-89.32v-89.32h89.32v-89.32h89.32v-89.32h178.64v89.32h-89.32v89.32ZM601.32,709.62h89.32v89.32h-89.32v-89.32ZM690.65,441.65h89.32v178.64h-89.32v-178.64Z"/>
            </svg>
          </Link>
          <nav className="flex items-center gap-1">
            <div className="hidden sm:flex items-center gap-1">
              <Link href={`/${locale}/status`} className="px-3.5 py-2 text-[13px] font-medium text-[var(--orange-line)] hover:text-[var(--orange-line)] hover:bg-[var(--orange-line)]/10 rounded-lg transition-colors">
                {t.navStatus}
              </Link>
              <Link href={`/${locale}/trip`} className="px-3.5 py-2 text-[13px] font-medium text-[var(--orange-line)] hover:text-[var(--orange-line)] hover:bg-[var(--orange-line)]/10 rounded-lg transition-colors">
                {t.navTrip}
              </Link>
              <Link href={`/${locale}/map`} className="px-3.5 py-2 text-[13px] font-medium text-[var(--orange-line)] hover:text-[var(--orange-line)] hover:bg-[var(--orange-line)]/10 rounded-lg transition-colors">
                {t.navMap}
              </Link>
              <Link href={`/${locale}/fares`} className="px-3.5 py-2 text-[13px] font-medium text-[var(--orange-line)] hover:text-[var(--orange-line)] hover:bg-[var(--orange-line)]/10 rounded-lg transition-colors">
                {t.navFares}
              </Link>
            </div>
            <NavMore locale={locale as Locale} />
            <ThemeToggle />
            <Link
              href={`/${altLocale}`}
              className="ml-1 px-2.5 py-1.5 text-[12px] font-semibold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border)] hover:border-[#bbb] rounded-md transition-colors"
            >
              {altLocale.toUpperCase()}
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-16">{children}</main>

      <footer className="border-t border-[var(--border)] bg-[var(--surface-elevated)] py-10 mt-auto">
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
                <Link href={`/${locale}/accessibility`} className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{t.navAccessibility}</Link>
                <Link href={`/${locale}/guide`} className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{t.transitGuides}</Link>
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

      <PWAInstall />
    </>
  )
}
