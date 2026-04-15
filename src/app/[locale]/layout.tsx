import { notFound } from "next/navigation"
import Link from "next/link"
import { isValidLocale, getTranslations, locales } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import ThemeToggle from "@/components/ThemeToggle"
import NavMore from "@/components/NavMore"
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
      <header id="main-navbar" className="fixed top-0 left-0 right-0 z-50 border-b-2 border-[var(--text-primary)] bg-[var(--surface)]">
        <div className="relative max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center group transition-opacity hover:opacity-80">
            <svg width="40" height="40" viewBox="0 0 1024 1024" fill="var(--text-primary)" aria-label={t.siteName}>
              <path d="M65.39,709.62h89.32v89.32h-89.32v-89.32ZM244.04,530.97v89.32h-89.32v-89.32h89.32ZM422.68,173.69v446.61h89.32v89.32h-89.32v89.32h-89.32v-446.61h-89.32v-178.64h178.64ZM869.29,352.33h-178.64v89.32h-89.32v-89.32h89.32v-89.32h89.32v-89.32h178.64v89.32h-89.32v89.32ZM601.32,709.62h89.32v89.32h-89.32v-89.32ZM690.65,441.65h89.32v178.64h-89.32v-178.64Z"/>
            </svg>
          </Link>
          <nav className="flex items-center gap-1">
            <div className="hidden sm:flex items-center gap-0">
              <Link href={`/${locale}/status`} className="px-3.5 py-2 text-[11px] font-medium tracking-[0.1em] uppercase text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-inset)] transition-colors">
                {t.navStatus}
              </Link>
              <Link href={`/${locale}/trip`} className="px-3.5 py-2 text-[11px] font-medium tracking-[0.1em] uppercase text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-inset)] transition-colors">
                {t.navTrip}
              </Link>
              <Link href={`/${locale}/map`} className="px-3.5 py-2 text-[11px] font-medium tracking-[0.1em] uppercase text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-inset)] transition-colors">
                {t.navMap}
              </Link>
              <Link href={`/${locale}/fares`} className="px-3.5 py-2 text-[11px] font-medium tracking-[0.1em] uppercase text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-inset)] transition-colors">
                {t.navFares}
              </Link>
            </div>
            <NavMore locale={locale as Locale} />
            <ThemeToggle />
            <Link
              href={`/${altLocale}`}
              className="ml-1 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)] hover:text-[var(--surface)] border-2 border-[var(--text-primary)] hover:bg-[var(--text-primary)] transition-colors"
            >
              {altLocale.toUpperCase()}
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-16">{children}</main>

      <footer className="border-t-2 border-[var(--text-primary)] bg-[var(--surface-elevated)] py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col sm:flex-row justify-between gap-6">
            <div>
              <svg width="48" height="48" viewBox="0 0 1024 1024" fill="var(--text-primary)" aria-label={t.siteName} className="mb-2">
                <path d="M65.39,709.62h89.32v89.32h-89.32v-89.32ZM244.04,530.97v89.32h-89.32v-89.32h89.32ZM422.68,173.69v446.61h89.32v89.32h-89.32v89.32h-89.32v-446.61h-89.32v-178.64h178.64ZM869.29,352.33h-178.64v89.32h-89.32v-89.32h89.32v-89.32h89.32v-89.32h178.64v89.32h-89.32v89.32ZM601.32,709.62h89.32v89.32h-89.32v-89.32ZM690.65,441.65h89.32v178.64h-89.32v-178.64Z"/>
              </svg>
              <p className="text-[13px] text-[var(--text-muted)] max-w-xs leading-relaxed">
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
          <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] text-[12px] text-[var(--text-muted)]">
            {locale === 'fr'
              ? <span>Concu, construit et code par <a href="https://allolumari.com" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors underline">allolumari.com</a></span>
              : <span>Designed, built and coded by <a href="https://allolumari.com" target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors underline">allolumari.com</a></span>
            }
          </div>
        </div>
      </footer>

      <PWAInstall />
    </>
  )
}
