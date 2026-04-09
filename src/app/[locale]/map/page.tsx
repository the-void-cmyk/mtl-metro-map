import type { Metadata } from "next"
import Link from "next/link"
import { locales } from "@/lib/i18n"
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

function LineMap({ line, locale, allLines, allStations }: {
  line: { id: string; name: string; nameFr: string; color: string; stations: string[]; network: string }
  locale: string
  allLines: ReturnType<typeof getAllLines>
  allStations: ReturnType<typeof getAllStations>
}) {
  const lineStations = line.stations.map(id => allStations.find(s => s.id === id)).filter(Boolean)

  return (
    <div className="info-card">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--border)]">
        <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: line.color }} />
        <Link href={`/${locale}/line/${line.id}`} className="font-heading font-semibold text-[15px] tracking-tight hover:underline">
          {locale === 'fr' ? line.nameFr : line.name}
        </Link>
        <span className="ml-auto text-[13px] text-[var(--text-muted)]">
          {lineStations.length} stations
        </span>
      </div>

      <div className="px-5 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          {lineStations.map((station, i) => {
            if (!station) return null
            const isTerminal = i === 0 || i === lineStations.length - 1
            const isTransfer = station.lineIds.length > 1
            const otherLines = station.lineIds
              .filter(lid => lid !== line.id)
              .map(lid => allLines.find(l => l.id === lid))
              .filter(Boolean)

            return (
              <div key={station.id} className="flex items-stretch">
                {/* Line + dot */}
                <div className="flex flex-col items-center w-[18px] flex-shrink-0">
                  {i > 0 ? (
                    <div className="route-line flex-1" style={{ backgroundColor: line.color }} />
                  ) : (
                    <div className="flex-1" />
                  )}
                  <div
                    className={`route-station-dot ${
                      isTerminal ? 'route-station-dot-terminal' :
                      isTransfer ? 'route-station-dot-transfer' :
                      'route-station-dot-intermediate'
                    }`}
                    style={{
                      color: line.color,
                      backgroundColor: isTerminal || isTransfer ? 'white' : line.color,
                      boxShadow: isTransfer ? `0 0 0 2px ${line.color}` : undefined,
                    }}
                  />
                  {i < lineStations.length - 1 ? (
                    <div className="route-line flex-1" style={{ backgroundColor: line.color }} />
                  ) : (
                    <div className="flex-1" />
                  )}
                </div>

                {/* Station info */}
                <Link
                  href={`/${locale}/station/${station.slug}`}
                  className="flex-1 ml-3 py-2 flex items-center gap-2 hover:bg-[var(--surface-inset)] -mx-1 px-1 rounded-md transition-colors min-h-[40px]"
                >
                  <span className={`text-[14px] ${isTerminal || isTransfer ? 'font-semibold' : 'text-[var(--text-secondary)]'}`}>
                    {station.name.replace(' (Exo)', '').replace(' (REM)', '')}
                  </span>
                  {otherLines.length > 0 && (
                    <div className="flex gap-1 ml-auto flex-shrink-0">
                      {otherLines.map(ol => ol ? (
                        <span
                          key={ol.id}
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: ol.color }}
                          title={locale === 'fr' ? ol.nameFr : ol.name}
                        />
                      ) : null)}
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
}

export default async function MapPage({ params }: MapPageProps) {
  const { locale } = await params
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
      <p className="text-[var(--text-secondary)] text-[15px] mb-10">
        {locale === 'fr'
          ? `${allStations.length} stations sur 3 reseaux de transport en commun.`
          : `${allStations.length} stations across 3 transit networks.`}
      </p>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="stat-card stat-card-blue">
          <div className="font-heading text-2xl font-bold">{metroLines.reduce((sum, l) => sum + new Set(l.stations).size, 0) - 4}</div>
          <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mt-1">
            {locale === 'fr' ? 'Metro' : 'Metro'}
          </div>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid var(--rem-line)' }}>
          <div className="font-heading text-2xl font-bold">{remLine?.stations.length ?? 0}</div>
          <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mt-1">REM</div>
        </div>
        <div className="stat-card" style={{ borderTop: '3px solid var(--exo-line)' }}>
          <div className="font-heading text-2xl font-bold">{allStations.filter(s => s.network === 'exo').length}</div>
          <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mt-1">Exo</div>
        </div>
      </div>

      {/* Metro */}
      <div className="space-y-8">
        <h2 className="font-heading text-xl font-bold tracking-tight">
          {locale === 'fr' ? 'Metro STM' : 'STM Metro'}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {metroLines.map(line => (
            <LineMap key={line.id} line={line} locale={locale} allLines={allLines} allStations={allStations} />
          ))}
        </div>

        {/* REM */}
        {remLine && (
          <>
            <h2 className="font-heading text-xl font-bold tracking-tight mt-12">REM</h2>
            <LineMap line={remLine} locale={locale} allLines={allLines} allStations={allStations} />
          </>
        )}

        {/* Exo */}
        <h2 className="font-heading text-xl font-bold tracking-tight mt-12">
          {locale === 'fr' ? 'Trains de banlieue Exo' : 'Exo Commuter Trains'}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {exoLines.map(line => (
            <LineMap key={line.id} line={line} locale={locale} allLines={allLines} allStations={allStations} />
          ))}
        </div>
      </div>
    </div>
  )
}
