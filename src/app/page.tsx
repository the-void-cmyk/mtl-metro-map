import Link from "next/link"
import SearchBar from "@/components/SearchBar"
import stations from "../../data/stations.json"
import lines from "../../data/lines.json"
import type { Station, Line } from "@/lib/types"

const allStations = stations as Station[]
const allLines = lines as Line[]

export default function HomePage() {
  const metroCount = allStations.filter((s) => s.network === "metro").length
  const remCount = allStations.filter((s) => s.network === "rem").length
  const exoCount = allStations.filter((s) => s.network === "exo").length

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-700 text-white py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-3">
            Montreal Metro Route Finder
          </h1>
          <p className="text-blue-100 text-center mb-10 max-w-2xl mx-auto">
            Find the fastest route across Montreal&apos;s transit network. {allStations.length} stations
            covering Metro, REM, and Exo commuter trains.
          </p>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg text-gray-900">
            <SearchBar stations={allStations} />
          </div>
        </div>
      </section>

      {/* Network Overview */}
      <section className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            Montreal Transit Network
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">M</span>
              </div>
              <h3 className="font-semibold text-lg mb-1">STM Metro</h3>
              <p className="text-gray-500 text-sm mb-3">
                {metroCount} stations across 4 lines
              </p>
              <div className="flex justify-center gap-2">
                {allLines
                  .filter((l) => l.network === "metro")
                  .map((line) => (
                    <Link
                      key={line.id}
                      href={`/line/${line.id}`}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: line.color, color: line.textColor }}
                      title={line.name}
                    >
                      {line.name[0]}
                    </Link>
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: "#e6f9f7" }}>
                <span className="font-bold text-lg" style={{ color: "#00B2A9" }}>R</span>
              </div>
              <h3 className="font-semibold text-lg mb-1">REM</h3>
              <p className="text-gray-500 text-sm mb-3">
                {remCount} stations, automated light rail
              </p>
              <Link
                href="/line/rem-a"
                className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: "#00B2A9" }}
              >
                REM Line
              </Link>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: "#f5efe8" }}>
                <span className="font-bold text-lg" style={{ color: "#965F26" }}>E</span>
              </div>
              <h3 className="font-semibold text-lg mb-1">Exo Commuter</h3>
              <p className="text-gray-500 text-sm mb-3">
                {exoCount} stations across 5 train lines
              </p>
              <div className="flex justify-center gap-1.5 flex-wrap">
                {allLines
                  .filter((l) => l.network === "exo")
                  .map((line) => (
                    <Link
                      key={line.id}
                      href={`/line/${line.id}`}
                      className="px-2 py-0.5 rounded text-xs font-medium text-white"
                      style={{ backgroundColor: "#965F26" }}
                      title={line.name}
                    >
                      {line.id.replace("exo", "")}
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fare Info */}
      <section className="py-12 bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-2">
            Unified Fare System
          </h2>
          <p className="text-gray-500 text-center mb-8 max-w-xl mx-auto">
            One ticket covers Metro, REM, and Exo. Valid for 120 minutes across all modes.
            Pay with OPUS card or contactless payment.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { zone: "A", price: "$3.75", desc: "Montreal Island" },
              { zone: "AB", price: "$5.25", desc: "Montreal + Laval" },
              { zone: "ABC", price: "$7.00", desc: "+ Inner Suburbs" },
              { zone: "ABCD", price: "$9.25", desc: "Full Network" },
            ].map((f) => (
              <div key={f.zone} className="bg-gray-50 rounded-lg p-4 text-center border border-gray-100">
                <div className="text-xs font-medium text-gray-400 mb-1">Zone {f.zone}</div>
                <div className="text-xl font-bold text-gray-900">{f.price}</div>
                <div className="text-xs text-gray-500 mt-1">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO intro text */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold mb-3">Plan Your Montreal Transit Trip</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            MTL Metro helps you find the fastest route between any two stations on Montreal&apos;s
            transit network. Whether you&apos;re traveling on the STM Metro (Green, Orange, Blue,
            or Yellow line), the new REM automated light rail, or one of 5 Exo commuter train
            lines, we calculate the optimal path including transfers, travel time, number of
            stops, and fare information. Start typing a station name above to plan your trip.
          </p>
        </div>
      </section>
    </>
  )
}
