import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { getStationBySlug, getLinesForStation } from "@/lib/stations"
import { generateStationMetadata } from "@/lib/seo"
import Breadcrumbs from "@/components/Breadcrumbs"
import SearchBar from "@/components/SearchBar"
import type { Station } from "@/lib/types"
import stations from "../../../../data/stations.json"

const allStations = stations as Station[]

interface StationPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return allStations.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: StationPageProps): Promise<Metadata> {
  const { slug } = await params
  const station = getStationBySlug(slug)
  if (!station) return { title: "Station Not Found" }

  const lines = getLinesForStation(station.id)
  const meta = generateStationMetadata(station, lines)
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: meta.canonical },
  }
}

export default async function StationPage({ params }: StationPageProps) {
  const { slug } = await params
  const station = getStationBySlug(slug)
  if (!station) notFound()

  const lines = getLinesForStation(station.id)

  const networkLabel = station.network === "metro" ? "STM Metro" : station.network === "rem" ? "REM" : "Exo Commuter"

  return (
    <div className="max-w-6xl mx-auto px-5 py-6 sm:py-8">
      <Breadcrumbs
        items={[
          { name: lines[0]?.name ?? "Stations", url: lines[0] ? `/line/${lines[0].id}` : "/" },
          { name: station.name, url: `/station/${station.slug}` },
        ]}
      />

      {/* Title */}
      <div className="mt-5 mb-8 flex items-start gap-3">
        <div className="flex gap-1 mt-2">
          {lines.map(l => (
            <div key={l.id} className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: l.color }} />
          ))}
        </div>
        <div>
          <h1 className="font-heading text-2xl sm:text-[32px] font-bold tracking-tight leading-tight">
            {station.name}
          </h1>
          <p className="text-[var(--text-secondary)] text-[15px] mt-1">
            {networkLabel} station served by {lines.map(l => l.name).join(" and ")}. Zone {station.zone}.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main */}
        <div className="space-y-6">
          {/* Station Info Grid */}
          <div className="info-card">
            <div className="info-card-header">Station Information</div>
            <div className="info-card-body">
              <dl className="grid grid-cols-2 gap-y-4 gap-x-8 text-[14px]">
                <div>
                  <dt className="text-[var(--text-muted)] text-[12px] uppercase tracking-wider font-medium">Network</dt>
                  <dd className="font-medium mt-0.5">{networkLabel}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)] text-[12px] uppercase tracking-wider font-medium">Fare Zone</dt>
                  <dd className="font-medium mt-0.5">Zone {station.zone}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)] text-[12px] uppercase tracking-wider font-medium">First Train</dt>
                  <dd className="font-heading font-medium mt-0.5 tabular-nums">{station.firstTrain}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)] text-[12px] uppercase tracking-wider font-medium">Last Train</dt>
                  <dd className="font-heading font-medium mt-0.5 tabular-nums">{station.lastTrain}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)] text-[12px] uppercase tracking-wider font-medium">Accessible</dt>
                  <dd className="font-medium mt-0.5">{station.accessible ? "Yes" : "No"}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)] text-[12px] uppercase tracking-wider font-medium">Lines</dt>
                  <dd className="flex gap-1.5 mt-0.5">
                    {lines.map((line) => (
                      <Link key={line.id} href={`/line/${line.id}`} className="line-badge" style={{ backgroundColor: line.color, color: line.textColor }}>
                        {line.name.replace(" Line", "")}
                      </Link>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Lines through this station */}
          {lines.map((line) => (
            <div key={line.id} className="info-card">
              <div className="info-card-header flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: line.color }} />
                {line.name}
              </div>
              <div className="info-card-body">
                <div className="flex flex-wrap gap-1.5">
                  {line.stations.map((stId) => {
                    const st = allStations.find((s) => s.id === stId)
                    if (!st) return null
                    const isCurrent = st.id === station.id
                    return isCurrent ? (
                      <span
                        key={stId}
                        className="text-[12px] px-2.5 py-1 rounded-md font-semibold text-white"
                        style={{ backgroundColor: line.color }}
                      >
                        {st.name}
                      </span>
                    ) : (
                      <Link
                        key={stId}
                        href={`/station/${st.slug}`}
                        className="text-[12px] px-2.5 py-1 rounded-md border border-[var(--border)] hover:bg-[var(--surface-inset)] transition-colors"
                      >
                        {st.name}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="info-card">
            <div className="info-card-header">Find Route from Here</div>
            <div className="info-card-body">
              <SearchBar stations={allStations} compact />
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">Location</div>
            <div className="info-card-body text-[13px] text-[var(--text-secondary)] font-heading tabular-nums">
              {station.lat.toFixed(4)}N, {Math.abs(station.lng).toFixed(4)}W
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
