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

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Breadcrumbs
        items={[
          { name: lines[0]?.name ?? "Stations", url: lines[0] ? `/line/${lines[0].id}` : "/" },
          { name: station.name, url: `/station/${station.slug}` },
        ]}
      />

      <h1 className="text-2xl sm:text-3xl font-bold mt-4 mb-2">{station.name} Station</h1>
      <p className="text-gray-600 text-sm mb-6">
        {station.name} is a {station.network === "metro" ? "Montreal Metro" : station.network === "rem" ? "REM" : "Exo commuter train"} station
        served by {lines.map((l) => l.name).join(" and ")}. Located in fare zone {station.zone}.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Station Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-bold mb-4">Station Information</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Network</dt>
                <dd className="font-medium capitalize mt-0.5">{station.network === "metro" ? "STM Metro" : station.network === "rem" ? "REM" : "Exo Commuter"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Fare Zone</dt>
                <dd className="font-medium mt-0.5">Zone {station.zone}</dd>
              </div>
              <div>
                <dt className="text-gray-500">First Train</dt>
                <dd className="font-medium mt-0.5">{station.firstTrain}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Last Train</dt>
                <dd className="font-medium mt-0.5">{station.lastTrain}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Accessible</dt>
                <dd className="font-medium mt-0.5">{station.accessible ? "Yes" : "No"}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Lines</dt>
                <dd className="flex gap-1.5 mt-0.5">
                  {lines.map((line) => (
                    <Link
                      key={line.id}
                      href={`/line/${line.id}`}
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ backgroundColor: line.color, color: line.textColor }}
                    >
                      {line.name}
                    </Link>
                  ))}
                </dd>
              </div>
            </dl>
          </div>

          {/* Lines through this station */}
          {lines.map((line) => (
            <div key={line.id} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: line.color }}
                />
                {line.name}
              </h2>
              <div className="flex flex-wrap gap-2">
                {line.stations.map((stId) => {
                  const st = allStations.find((s) => s.id === stId)
                  if (!st) return null
                  const isCurrent = st.id === station.id
                  return isCurrent ? (
                    <span
                      key={stId}
                      className="text-xs px-2 py-1 rounded border font-bold border-gray-900 bg-gray-900 text-white"
                    >
                      {st.name}
                    </span>
                  ) : (
                    <Link
                      key={stId}
                      href={`/station/${st.slug}`}
                      className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
                    >
                      {st.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Find Route From Here */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold mb-3 text-sm">Find Route from {station.name}</h3>
            <SearchBar stations={allStations} compact />
          </div>

          {/* Coordinates */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-sm">
            <h3 className="font-semibold mb-2">Location</h3>
            <p className="text-gray-500">
              {station.lat.toFixed(4)}, {station.lng.toFixed(4)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
