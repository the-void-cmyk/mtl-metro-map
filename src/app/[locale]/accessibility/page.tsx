import type { Metadata } from "next"
import Link from "next/link"
import { locales } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { getTranslations } from "@/lib/i18n"
import { getAllStations, getAllLines } from "@/lib/stations"
import Breadcrumbs from "@/components/Breadcrumbs"

interface AccessibilityPageProps {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: AccessibilityPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = getTranslations(locale as Locale)
  const altLocale = locale === 'en' ? 'fr' : 'en'

  return {
    title: t.accessibilityGuide,
    description: t.accessibilityDescription,
    alternates: {
      canonical: `/${locale}/accessibility`,
      languages: {
        [locale]: `/${locale}/accessibility`,
        [altLocale]: `/${altLocale}/accessibility`,
      },
    },
  }
}

export default async function AccessibilityPage({ params }: AccessibilityPageProps) {
  const { locale } = await params
  const t = getTranslations(locale as Locale)
  const isFr = locale === 'fr'

  const allStations = getAllStations()
  const allLines = getAllLines()

  const totalStations = allStations.length
  const accessibleCount = allStations.filter(s => s.accessible).length

  // Group stations by network
  const metroStations = allStations.filter(s => s.network === 'metro')
  const remStations = allStations.filter(s => s.network === 'rem')
  const exoStations = allStations.filter(s => s.network === 'exo')

  // Get metro lines, REM lines, Exo lines
  const metroLines = allLines.filter(l => l.network === 'metro')
  const remLines = allLines.filter(l => l.network === 'rem')
  const exoLines = allLines.filter(l => l.network === 'exo')

  // Find non-accessible metro stations for the info section
  const nonAccessibleMetro = metroStations.filter(s => !s.accessible)

  return (
    <div className="max-w-6xl mx-auto px-5 py-6 sm:py-8">
      <Breadcrumbs
        items={[{ name: t.accessibilityGuide, url: `/${locale}/accessibility` }]}
        locale={locale as Locale}
      />

      <h1 className="font-heading text-2xl sm:text-[32px] font-bold tracking-tight mt-5 mb-2">
        {t.accessibilityGuide}
      </h1>
      <p className="text-[var(--text-secondary)] text-[15px] mb-8">
        {t.accessibilityDescription}
      </p>

      {/* Summary card */}
      <div className="stat-card mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#2E7D32]" aria-hidden="true">
              <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 14.59l-3.29-3.3 1.41-1.41L11 13.76l4.88-4.88 1.41 1.41L11 16.59z" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <p className="font-heading font-semibold text-lg">{t.accessibilityOverview}</p>
            <p className="text-[var(--text-secondary)] text-[14px]">{t.accessibleStations(accessibleCount, totalStations)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {/* Metro STM Section */}
          <NetworkSection
            title={t.stmLabel}
            stations={metroStations}
            lines={metroLines}
            allStations={allStations}
            locale={locale}
            isFr={isFr}
          />

          {/* REM Section */}
          <NetworkSection
            title={t.remLabel}
            stations={remStations}
            lines={remLines}
            allStations={allStations}
            locale={locale}
            isFr={isFr}
          />

          {/* Exo Section */}
          <NetworkSection
            title={t.exoLabel}
            stations={exoStations}
            lines={exoLines}
            allStations={allStations}
            locale={locale}
            isFr={isFr}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* General info card */}
          <div className="info-card">
            <div className="info-card-header">
              {t.generalAccessibilityInfo}
            </div>
            <div className="info-card-body text-[14px] text-[var(--text-secondary)] leading-relaxed space-y-3">
              <p>
                {isFr
                  ? 'Toutes les stations du REM sont entierement accessibles avec ascenseurs et embarquement a niveau.'
                  : 'All REM stations are fully accessible with elevators and level boarding.'}
              </p>
              <p>
                {isFr
                  ? `La plupart des stations de metro disposent d'ascenseurs. Les stations suivantes ont une accessibilite limitee :`
                  : 'Most metro stations have elevators. The following stations have limited accessibility:'}
              </p>
              <ul className="list-disc list-inside text-[13px] space-y-0.5">
                {nonAccessibleMetro.map(s => (
                  <li key={s.id}>
                    <Link href={`/${locale}/station/${s.slug}`} className="hover:text-[var(--text-primary)] transition-colors underline decoration-[var(--border)]">
                      {isFr ? s.nameFr : s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tips card */}
          <div className="info-card">
            <div className="info-card-header">
              {t.accessibilityTips}
            </div>
            <div className="info-card-body text-[14px] text-[var(--text-secondary)] leading-relaxed space-y-3">
              <div className="flex items-start gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[var(--text-muted)] mt-0.5 flex-shrink-0" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.59l-3.29-3.3 1.41-1.41L11 13.76l4.88-4.88 1.41 1.41L11 16.59z" fill="currentColor"/>
                </svg>
                <p>
                  {isFr
                    ? 'Des sieges prioritaires sont disponibles dans tous les trains et autobus pour les personnes a mobilite reduite.'
                    : 'Priority seating is available in all trains and buses for passengers with reduced mobility.'}
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[var(--text-muted)] mt-0.5 flex-shrink-0" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.59l-3.29-3.3 1.41-1.41L11 13.76l4.88-4.88 1.41 1.41L11 16.59z" fill="currentColor"/>
                </svg>
                <p>
                  {isFr
                    ? "Les animaux d'assistance sont permis dans l'ensemble du reseau de transport en commun."
                    : 'Service animals are permitted throughout the entire transit network.'}
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[var(--text-muted)] mt-0.5 flex-shrink-0" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.59l-3.29-3.3 1.41-1.41L11 13.76l4.88-4.88 1.41 1.41L11 16.59z" fill="currentColor"/>
                </svg>
                <p>
                  {isFr
                    ? 'Des espaces reserves aux fauteuils roulants sont disponibles dans chaque voiture de metro et du REM.'
                    : 'Designated wheelchair spaces are available in every metro and REM car.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function NetworkSection({
  title,
  stations,
  lines,
  allStations,
  locale,
  isFr,
}: {
  title: string
  stations: ReturnType<typeof getAllStations>
  lines: ReturnType<typeof getAllLines>
  allStations: ReturnType<typeof getAllStations>
  locale: string
  isFr: boolean
}) {
  const accessibleCount = stations.filter(s => s.accessible).length
  const totalCount = stations.length

  return (
    <div className="info-card">
      <div className="info-card-header flex items-center justify-between">
        <span>{title}</span>
        <span className="text-[12px] font-normal text-[var(--text-muted)]">
          {isFr
            ? `${accessibleCount}/${totalCount} accessibles`
            : `${accessibleCount}/${totalCount} accessible`}
        </span>
      </div>
      <div className="info-card-body space-y-5">
        {lines.map(line => {
          // Get unique stations for this line that haven't been shown yet
          const lineStations = line.stations
            .map(id => allStations.find(s => s.id === id))
            .filter((s): s is NonNullable<typeof s> => s != null)

          return (
            <div key={line.id}>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: line.color }} />
                <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                  {isFr ? line.nameFr : line.name}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {lineStations.map(station => (
                  <Link
                    key={station.id}
                    href={`/${locale}/station/${station.slug}`}
                    className="group flex items-center gap-1 text-[12px] px-2.5 py-1 rounded-md border border-[var(--border)] hover:bg-[var(--surface-inset)] transition-colors"
                  >
                    {station.accessible ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[#2E7D32] flex-shrink-0" aria-label={isFr ? 'Accessible' : 'Accessible'}>
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.59l-3.29-3.3 1.41-1.41L11 13.76l4.88-4.88 1.41 1.41L11 16.59z" fill="currentColor"/>
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-[var(--text-muted)] flex-shrink-0" aria-label={isFr ? 'Accessibilite limitee' : 'Limited accessibility'}>
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                      </svg>
                    )}
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: line.color }} />
                    {isFr ? station.nameFr : station.name}
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
