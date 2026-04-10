import type { Metadata } from "next"
import Link from "next/link"
import { getAllLines, getAllStations, getConnections } from "@/lib/stations"
import { getTranslations, locales } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import Breadcrumbs from "@/components/Breadcrumbs"
import type { Station, Line, Connection } from "@/lib/types"

interface ComparePageProps {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const { locale } = await params
  const t = getTranslations(locale as Locale)
  const altLocale = locale === 'en' ? 'fr' : 'en'

  return {
    title: `${t.compareLines} | MTL Metro`,
    description: t.compareLinesDesc,
    alternates: {
      canonical: `/${locale}/compare`,
      languages: { [locale]: `/${locale}/compare`, [altLocale]: `/${altLocale}/compare` },
    },
  }
}

function getEndToEndTime(line: Line, connections: Connection[]): number {
  const lineConnections = connections.filter(
    (c) => c.lineId === line.id && c.type === 'rail'
  )

  // Build adjacency for this line and walk the station order
  const timeMap = new Map<string, number>()
  for (const conn of lineConnections) {
    const key = `${conn.from}|${conn.to}`
    timeMap.set(key, conn.travelTime)
  }

  let total = 0
  for (let i = 0; i < line.stations.length - 1; i++) {
    const from = line.stations[i]
    const to = line.stations[i + 1]
    const key = `${from}|${to}`
    const reverseKey = `${to}|${from}`
    const time = timeMap.get(key) ?? timeMap.get(reverseKey) ?? 0
    total += time
  }

  return total
}

function getTransferStationsForLine(
  line: Line,
  allLines: Line[],
  allStations: Station[]
): Station[] {
  const transferStations: Station[] = []
  for (const stationId of line.stations) {
    const station = allStations.find((s) => s.id === stationId)
    if (station && station.lineIds.length > 1) {
      transferStations.push(station)
    }
  }
  return transferStations
}

function getAccessibleCount(line: Line, allStations: Station[]): number {
  let count = 0
  for (const stationId of line.stations) {
    const station = allStations.find((s) => s.id === stationId)
    if (station?.accessible) count++
  }
  return count
}

function getNetworkLabel(network: string, t: ReturnType<typeof getTranslations>): string {
  if (network === 'metro') return t.stmLabel
  if (network === 'rem') return t.remLabel
  return t.exoLabel
}

export default async function ComparePage({ params }: ComparePageProps) {
  const { locale } = await params
  const t = getTranslations(locale as Locale)

  const allLines = getAllLines()
  const allStations = getAllStations()
  const connections = getConnections()

  // Compute stats for each line
  const lineStats = allLines.map((line) => {
    const stationCount = line.stations.length
    const endToEndTime = getEndToEndTime(line, connections)
    const transferStations = getTransferStationsForLine(line, allLines, allStations)
    const accessibleCount = getAccessibleCount(line, allStations)
    const lineName = locale === 'fr' ? line.nameFr : line.name

    return {
      line,
      lineName,
      stationCount,
      endToEndTime,
      transferStations,
      transferCount: transferStations.length,
      accessibleCount,
    }
  })

  // Interesting stats
  const longestByStations = [...lineStats].sort((a, b) => b.stationCount - a.stationCount)[0]
  const longestByTime = [...lineStats].sort((a, b) => b.endToEndTime - a.endToEndTime)[0]
  const mostTransfers = [...lineStats].sort((a, b) => b.transferCount - a.transferCount)[0]

  // Total network stats
  const uniqueStationIds = new Set<string>()
  for (const line of allLines) {
    for (const sid of line.stations) {
      uniqueStationIds.add(sid)
    }
  }
  const totalUniqueStations = uniqueStationIds.size
  const totalLines = allLines.length

  // Count transfer connections (stations appearing on multiple lines)
  const totalTransferStations = allStations.filter((s) => s.lineIds.length > 1).length

  return (
    <div className="max-w-6xl mx-auto px-5 py-6 sm:py-8">
      <Breadcrumbs
        items={[
          { name: t.lines, url: `/${locale}` },
          { name: t.compareLines, url: `/${locale}/compare` },
        ]}
        locale={locale as Locale}
      />

      <div className="mt-5 mb-8">
        <h1 className="font-heading text-2xl sm:text-[32px] font-bold tracking-tight leading-tight">
          {t.compareLines}
        </h1>
        <p className="text-[var(--text-secondary)] text-[15px] mt-1">
          {t.compareLinesDesc}
        </p>
      </div>

      {/* Comparison Table */}
      <div className="info-card mb-8">
        <div className="info-card-header">{t.allLines}</div>
        <div className="info-card-body p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left px-4 py-3 font-heading font-semibold text-[13px]">{t.lines}</th>
                  <th className="text-center px-4 py-3 font-heading font-semibold text-[13px]">{t.stops}</th>
                  <th className="text-center px-4 py-3 font-heading font-semibold text-[13px]">{t.endToEnd}</th>
                  <th className="text-center px-4 py-3 font-heading font-semibold text-[13px]">{t.network}</th>
                  <th className="text-center px-4 py-3 font-heading font-semibold text-[13px]">{t.accessibleCount}</th>
                  <th className="text-center px-4 py-3 font-heading font-semibold text-[13px]">{t.transferStations}</th>
                </tr>
              </thead>
              <tbody>
                {lineStats.map((stat) => (
                  <tr key={stat.line.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-inset)] transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/${locale}/line/${stat.line.id}`}
                        className="flex items-center gap-2.5 hover:underline"
                      >
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: stat.line.color }}
                        />
                        <span className="font-medium">{stat.lineName}</span>
                      </Link>
                    </td>
                    <td className="text-center px-4 py-3 font-heading font-medium">
                      {stat.stationCount}
                    </td>
                    <td className="text-center px-4 py-3">
                      {stat.endToEndTime > 0 ? `${stat.endToEndTime} min` : '-'}
                    </td>
                    <td className="text-center px-4 py-3 text-[var(--text-secondary)]">
                      {getNetworkLabel(stat.line.network, t)}
                    </td>
                    <td className="text-center px-4 py-3 font-heading font-medium">
                      {stat.accessibleCount}/{stat.stationCount}
                    </td>
                    <td className="text-center px-4 py-3">
                      {stat.transferCount > 0 ? (
                        <span className="font-heading font-medium">{stat.transferCount}</span>
                      ) : (
                        <span className="text-[var(--text-muted)]">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Interesting Stats */}
      <h2 className="font-heading text-lg sm:text-xl font-bold tracking-tight mb-4">
        {t.networkStats}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Longest line by stations */}
        <div className="stat-card stat-card-green">
          <p className="text-[12px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
            {t.longestLine} ({t.byStations})
          </p>
          <p className="font-heading text-xl font-bold">{longestByStations.lineName}</p>
          <p className="text-[14px] text-[var(--text-secondary)] mt-0.5">
            {longestByStations.stationCount} {t.stops.toLowerCase()}
          </p>
        </div>

        {/* Longest line by travel time */}
        <div className="stat-card stat-card-blue">
          <p className="text-[12px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
            {t.longestLine} ({t.byTravelTime})
          </p>
          <p className="font-heading text-xl font-bold">{longestByTime.lineName}</p>
          <p className="text-[14px] text-[var(--text-secondary)] mt-0.5">
            {longestByTime.endToEndTime} {t.minutes.toLowerCase()}
          </p>
        </div>

        {/* Most transfer connections */}
        <div className="stat-card stat-card-neutral">
          <p className="text-[12px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
            {t.mostConnected}
          </p>
          <p className="font-heading text-xl font-bold">{mostTransfers.lineName}</p>
          <p className="text-[14px] text-[var(--text-secondary)] mt-0.5">
            {mostTransfers.transferCount} {t.transferStations.toLowerCase()}
          </p>
        </div>

        {/* Total stations */}
        <div className="stat-card stat-card-green">
          <p className="text-[12px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
            {t.totalStations}
          </p>
          <p className="font-heading text-2xl font-bold">{totalUniqueStations}</p>
        </div>

        {/* Total lines */}
        <div className="stat-card stat-card-blue">
          <p className="text-[12px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
            {t.totalLines}
          </p>
          <p className="font-heading text-2xl font-bold">{totalLines}</p>
        </div>

        {/* Total transfer stations */}
        <div className="stat-card stat-card-neutral">
          <p className="text-[12px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
            {t.totalConnections}
          </p>
          <p className="font-heading text-2xl font-bold">{totalTransferStations}</p>
        </div>
      </div>
    </div>
  )
}
