import type { Metadata } from "next"
import Link from "next/link"
import { getTranslations, locales } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import { getAllLines, getAllStations } from "@/lib/stations"
import Breadcrumbs from "@/components/Breadcrumbs"

interface MapPageProps {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: MapPageProps): Promise<Metadata> {
  const { locale } = await params
  return {
    title: locale === 'fr' ? 'Carte du reseau' : 'Network Map',
    description: locale === 'fr'
      ? 'Carte interactive du reseau de transport en commun de Montreal. Metro, REM et trains de banlieue Exo.'
      : 'Interactive map of Montreal\'s transit network. Metro, REM, and Exo commuter trains.',
  }
}

export default async function MapPage({ params }: MapPageProps) {
  const { locale } = await params
  const t = getTranslations(locale as Locale)
  const allLines = getAllLines()
  const allStations = getAllStations()

  const metroLines = allLines.filter(l => l.network === 'metro')
  const remLine = allLines.find(l => l.id === 'rem-a')
  const exoLines = allLines.filter(l => l.network === 'exo')

  return (
    <div className="max-w-6xl mx-auto px-5 py-6 sm:py-8">
      <Breadcrumbs
        items={[{ name: locale === 'fr' ? 'Carte du reseau' : 'Network Map', url: `/${locale}/map` }]}
        locale={locale as Locale}
      />

      <h1 className="font-heading text-2xl sm:text-[32px] font-bold tracking-tight mt-5 mb-2">
        {locale === 'fr' ? 'Carte du reseau' : 'Network Map'}
      </h1>
      <p className="text-[var(--text-secondary)] text-[15px] mb-8">
        {locale === 'fr'
          ? `${allStations.length} stations sur 3 reseaux de transport en commun.`
          : `${allStations.length} stations across 3 transit networks.`}
      </p>

      {/* Metro Lines */}
      <div className="space-y-6">
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          {locale === 'fr' ? 'Metro STM' : 'STM Metro'}
        </h2>

        {metroLines.map(line => {
          const lineStations = line.stations.map(id => allStations.find(s => s.id === id)).filter(Boolean)
          return (
            <div key={line.id} className="info-card">
              <div className="info-card-header flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: line.color }} />
                <Link href={`/${locale}/line/${line.id}`} className="hover:underline">
                  {locale === 'fr' ? line.nameFr : line.name}
                </Link>
                <span className="ml-auto text-[var(--text-muted)] font-normal normal-case tracking-normal">
                  {lineStations.length} {locale === 'fr' ? 'stations' : 'stations'}
                </span>
              </div>
              <div className="info-card-body py-3 overflow-x-auto">
                <div className="flex items-center gap-0 min-w-max px-2">
                  {lineStations.map((station, i) => {
                    if (!station) return null
                    const isTransfer = station.lineIds.length > 1
                    const isTerminal = i === 0 || i === lineStations.length - 1
                    return (
                      <div key={station.id} className="flex items-center">
                        {i > 0 && (
                          <div className="h-[4px] w-8 sm:w-12" style={{ backgroundColor: line.color }} />
                        )}
                        <Link
                          href={`/${locale}/station/${station.slug}`}
                          className="group relative flex flex-col items-center"
                          title={station.name}
                        >
                          <div
                            className={`rounded-full border-2 ${
                              isTransfer
                                ? 'w-4 h-4 border-white ring-2 bg-white'
                                : isTerminal
                                ? 'w-4 h-4 border-[var(--text-primary)] bg-white'
                                : 'w-2.5 h-2.5 border-white'
                            }`}
                            style={{
                              backgroundColor: isTransfer || isTerminal ? 'white' : line.color,
                              boxShadow: isTransfer ? `0 0 0 2px ${line.color}` : undefined,
                            }}
                          />
                          <span className={`absolute top-5 text-[10px] whitespace-nowrap max-w-[60px] text-center leading-tight ${
                            isTerminal || isTransfer ? 'font-medium text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                          } ${i % 2 === 0 ? '' : 'top-auto bottom-5'}`}>
                            {station.name.length > 12 ? station.name.substring(0, 11) + '.' : station.name}
                          </span>
                          {isTransfer && (
                            <div className={`absolute ${i % 2 === 0 ? 'top-6' : 'bottom-6'} flex gap-0.5 mt-3`}>
                              {station.lineIds.filter(l => l !== line.id).map(lid => {
                                const otherLine = allLines.find(l => l.id === lid)
                                return otherLine ? (
                                  <span key={lid} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: otherLine.color }} />
                                ) : null
                              })}
                            </div>
                          )}
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}

        {/* REM */}
        {remLine && (
          <>
            <h2 className="font-heading text-lg font-semibold tracking-tight mt-8">REM</h2>
            <div className="info-card">
              <div className="info-card-header flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: remLine.color }} />
                <Link href={`/${locale}/line/rem-a`} className="hover:underline">REM</Link>
                <span className="ml-auto text-[var(--text-muted)] font-normal normal-case tracking-normal">
                  {remLine.stations.length} stations
                </span>
              </div>
              <div className="info-card-body py-4">
                <div className="flex flex-wrap gap-1.5">
                  {remLine.stations.map(stId => {
                    const st = allStations.find(s => s.id === stId)
                    if (!st) return null
                    return (
                      <Link
                        key={st.id}
                        href={`/${locale}/station/${st.slug}`}
                        className="text-[12px] px-2.5 py-1 rounded-md border border-[var(--border)] hover:bg-[var(--surface-inset)] transition-colors"
                      >
                        {st.name}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Exo */}
        <h2 className="font-heading text-lg font-semibold tracking-tight mt-8">
          {locale === 'fr' ? 'Trains de banlieue Exo' : 'Exo Commuter Trains'}
        </h2>
        {exoLines.map(line => {
          const lineStations = line.stations.map(id => allStations.find(s => s.id === id)).filter(Boolean)
          return (
            <div key={line.id} className="info-card">
              <div className="info-card-header flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: line.color }} />
                <Link href={`/${locale}/line/${line.id}`} className="hover:underline">
                  {locale === 'fr' ? line.nameFr : line.name}
                </Link>
                <span className="ml-auto text-[var(--text-muted)] font-normal normal-case tracking-normal">
                  {lineStations.length} stations
                </span>
              </div>
              <div className="info-card-body py-3 overflow-x-auto">
                <div className="flex items-center gap-0 min-w-max px-2">
                  {lineStations.map((station, i) => {
                    if (!station) return null
                    const isTerminal = i === 0 || i === lineStations.length - 1
                    return (
                      <div key={station.id} className="flex items-center">
                        {i > 0 && (
                          <div className="h-[4px] w-6 sm:w-10" style={{ backgroundColor: line.color }} />
                        )}
                        <Link
                          href={`/${locale}/station/${station.slug}`}
                          className="group relative flex flex-col items-center"
                          title={station.name}
                        >
                          <div
                            className={`rounded-full border-2 ${
                              isTerminal ? 'w-4 h-4 border-[var(--text-primary)] bg-white' : 'w-2.5 h-2.5 border-white'
                            }`}
                            style={{ backgroundColor: isTerminal ? 'white' : line.color }}
                          />
                          <span className={`absolute top-5 text-[10px] whitespace-nowrap max-w-[70px] text-center leading-tight ${
                            isTerminal ? 'font-medium text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                          } ${i % 2 === 0 ? '' : 'top-auto bottom-5'}`}>
                            {station.name.replace(' (Exo)', '').substring(0, 14)}
                          </span>
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
