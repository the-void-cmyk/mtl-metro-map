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

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Breadcrumbs
        items={[
          { name: "Lines", url: "/" },
          { name: line.name, url: `/line/${line.id}` },
        ]}
      />

      <div className="flex items-center gap-3 mt-4 mb-2">
        <span
          className="w-6 h-6 rounded-full flex-shrink-0"
          style={{ backgroundColor: line.color }}
        />
        <h1 className="text-2xl sm:text-3xl font-bold">{line.name}</h1>
      </div>
      <p className="text-gray-600 text-sm mb-6">
        {line.name} ({line.nameFr}) is a {line.network === "metro" ? "Montreal Metro" : line.network === "rem" ? "REM" : "Exo commuter train"} line
        with {lineStations.length} stations. {line.network === "metro" ? "Operated by STM." : line.network === "rem" ? "Automated light rail." : "Operated by Exo."}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* All Stations */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-bold mb-4">
              All {lineStations.length} Stations
            </h2>
            <div className="space-y-0">
              {lineStations.map((station, i) => (
                <div key={station.id} className="flex items-center gap-3 relative">
                  {/* Line bar */}
                  {i < lineStations.length - 1 && (
                    <div
                      className="absolute left-[9px] top-5 bottom-0 w-0.5"
                      style={{ backgroundColor: line.color }}
                    />
                  )}
                  {/* Station dot */}
                  <div
                    className={`relative z-10 flex-shrink-0 rounded-full border-2 ${
                      i === 0 || i === lineStations.length - 1
                        ? "w-5 h-5 border-gray-900 bg-white"
                        : "w-3 h-3 border-white"
                    }`}
                    style={
                      i === 0 || i === lineStations.length - 1
                        ? {}
                        : { backgroundColor: line.color }
                    }
                  />
                  {/* Station info */}
                  <Link
                    href={`/station/${station.slug}`}
                    className="flex-1 py-2 flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 rounded"
                  >
                    <div>
                      <span className={`text-sm ${i === 0 || i === lineStations.length - 1 ? "font-semibold" : ""}`}>
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
                    <div className="text-xs text-gray-400">
                      Zone {station.zone}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold mb-3">Line Details</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Network</dt>
                <dd className="font-medium capitalize">{line.network === "metro" ? "STM Metro" : line.network === "rem" ? "REM" : "Exo"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Stations</dt>
                <dd className="font-medium">{lineStations.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">First Station</dt>
                <dd className="font-medium">{lineStations[0]?.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Last Station</dt>
                <dd className="font-medium">{lineStations[lineStations.length - 1]?.name}</dd>
              </div>
            </dl>
          </div>

          {/* All Lines */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold mb-3">All Lines</h3>
            <div className="space-y-2">
              {getAllLines().map((l) => (
                <Link
                  key={l.id}
                  href={`/line/${l.id}`}
                  className={`flex items-center gap-2 text-sm p-2 rounded ${
                    l.id === line.id ? "bg-gray-100 font-medium" : "hover:bg-gray-50"
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
  )
}
