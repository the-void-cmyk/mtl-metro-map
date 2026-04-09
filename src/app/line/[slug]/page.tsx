import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { getLineById, getAllLines } from "@/lib/stations"
import { generateLineMetadata } from "@/lib/seo"
import Breadcrumbs from "@/components/Breadcrumbs"
import type { Station } from "@/lib/types"
import stations from "../../../../data/stations.json"

const allStations = stations as Station[]

interface LinePageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllLines().map((l) => ({ slug: l.id }))
}

export async function generateMetadata({ params }: LinePageProps): Promise<Metadata> {
  const { slug } = await params
  const line = getLineById(slug)
  if (!line) return { title: "Line Not Found" }

  const meta = generateLineMetadata(line, line.stations.length)
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: meta.canonical },
  }
}

export default async function LinePage({ params }: LinePageProps) {
  const { slug } = await params
  const line = getLineById(slug)
  if (!line) notFound()

  const lineStations = line.stations
    .map((id) => allStations.find((s) => s.id === id))
    .filter(Boolean) as Station[]

  const networkLabel = line.network === "metro" ? "STM Metro" : line.network === "rem" ? "REM" : "Exo"

  return (
    <div className="max-w-6xl mx-auto px-5 py-6 sm:py-8">
      <Breadcrumbs
        items={[
          { name: "Lines", url: "/" },
          { name: line.name, url: `/line/${line.id}` },
        ]}
      />

      {/* Title */}
      <div className="flex items-center gap-3.5 mt-5 mb-8">
        <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: line.color }} />
        <div>
          <h1 className="font-heading text-2xl sm:text-[32px] font-bold tracking-tight leading-tight">
            {line.name}
          </h1>
          <p className="text-[var(--text-secondary)] text-[15px] mt-0.5">
            {networkLabel} line with {lineStations.length} stations. {line.nameFr}.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main - Station List */}
        <div className="info-card">
          <div className="info-card-header">
            All {lineStations.length} Stations
          </div>
          <div className="info-card-body py-4">
            <div className="space-y-0">
              {lineStations.map((station, i) => {
                const isTerminal = i === 0 || i === lineStations.length - 1

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
                          isTerminal ? "route-station-dot-terminal" : "route-station-dot-intermediate"
                        }`}
                        style={isTerminal ? {} : { backgroundColor: line.color }}
                      />
                      {i < lineStations.length - 1 ? (
                        <div className="route-line flex-1" style={{ backgroundColor: line.color }} />
                      ) : (
                        <div className="flex-1" />
                      )}
                    </div>

                    {/* Station */}
                    <Link
                      href={`/station/${station.slug}`}
                      className="flex-1 ml-4 py-2 flex items-center justify-between hover:bg-[var(--surface-inset)] -mx-2 px-2 rounded-md transition-colors"
                    >
                      <div>
                        <span className={`text-[14px] ${isTerminal ? "font-semibold font-heading" : ""}`}>
                          {station.name}
                        </span>
                        {station.lineIds.length > 1 && (
                          <div className="flex gap-1 mt-0.5">
                            {station.lineIds
                              .filter((lid) => lid !== line.id)
                              .map((lid) => {
                                const otherLine = getAllLines().find((l) => l.id === lid)
                                return otherLine ? (
                                  <span
                                    key={lid}
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: otherLine.color }}
                                    title={otherLine.name}
                                  />
                                ) : null
                              })}
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
                        Zone {station.zone}
                      </span>
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="info-card">
            <div className="info-card-header">Line Details</div>
            <div className="info-card-body">
              <dl className="space-y-3 text-[14px]">
                <div className="flex justify-between items-center">
                  <dt className="text-[var(--text-muted)]">Network</dt>
                  <dd className="font-medium">{networkLabel}</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-[var(--text-muted)]">Stations</dt>
                  <dd className="font-heading font-medium">{lineStations.length}</dd>
                </div>
                <div className="h-px bg-[var(--border)]" />
                <div className="flex justify-between items-center">
                  <dt className="text-[var(--text-muted)]">From</dt>
                  <dd className="font-medium">{lineStations[0]?.name}</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-[var(--text-muted)]">To</dt>
                  <dd className="font-medium">{lineStations[lineStations.length - 1]?.name}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">All Lines</div>
            <div className="info-card-body p-2">
              <div className="space-y-0.5">
                {getAllLines().map((l) => (
                  <Link
                    key={l.id}
                    href={`/line/${l.id}`}
                    className={`flex items-center gap-2.5 text-[14px] px-3 py-2.5 rounded-lg transition-colors ${
                      l.id === line.id
                        ? "bg-[var(--surface-inset)] font-medium"
                        : "hover:bg-[var(--surface-inset)]"
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: l.color }} />
                    {l.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
