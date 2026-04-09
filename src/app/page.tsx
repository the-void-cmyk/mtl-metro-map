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
      {/* ─── Hero ─── */}
      <section
        className="relative overflow-hidden py-20 sm:py-28"
        style={{ background: "#0C1220" }}
      >
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,102,204,0.12), transparent), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(0,166,81,0.06), transparent)"
          }}
        />
        <div className="relative max-w-6xl mx-auto px-5">
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium mb-6 tracking-wide"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {allStations.length} stations across 3 networks
            </div>
            <h1
              className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight leading-[1.1] mb-4"
              style={{ color: "#FFFFFF", fontFamily: "var(--font-space-grotesk), system-ui" }}
            >
              Montreal Metro
              <br />
              <span style={{ color: "rgba(255,255,255,0.45)" }}>Route Finder</span>
            </h1>
            <p className="text-[15px] max-w-md mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
              Plan your trip across the STM Metro, REM light rail,
              and Exo commuter train network.
            </p>
          </div>

          <div
            className="max-w-2xl mx-auto rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}
          >
            <SearchBar stations={allStations} />
          </div>
        </div>
      </section>

      {/* ─── Network Cards ─── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-10">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">The Network</h2>
            <p className="text-[var(--text-muted)] text-[15px] mt-2">
              Three interconnected transit systems, one fare.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Metro */}
            <div className="network-card">
              <div className="flex justify-center gap-1.5 mb-5">
                {allLines.filter(l => l.network === "metro").map(line => (
                  <div key={line.id} className="w-3 h-3 rounded-full" style={{ backgroundColor: line.color }} />
                ))}
              </div>
              <h3 className="font-heading font-semibold text-xl tracking-tight">STM Metro</h3>
              <p className="text-[var(--text-muted)] text-sm mt-1.5 mb-5">
                {metroCount} stations, 4 lines
              </p>
              <div className="flex justify-center gap-2">
                {allLines.filter(l => l.network === "metro").map(line => (
                  <Link
                    key={line.id}
                    href={`/line/${line.id}`}
                    className="line-badge"
                    style={{ backgroundColor: line.color, color: line.textColor }}
                  >
                    {line.name.replace(" Line", "")}
                  </Link>
                ))}
              </div>
            </div>

            {/* REM */}
            <div className="network-card">
              <div className="flex justify-center mb-5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--rem-line)" }} />
              </div>
              <h3 className="font-heading font-semibold text-xl tracking-tight">REM</h3>
              <p className="text-[var(--text-muted)] text-sm mt-1.5 mb-5">
                {remCount} stations, automated light rail
              </p>
              <Link
                href="/line/rem-a"
                className="line-badge"
                style={{ backgroundColor: "var(--rem-line)" }}
              >
                REM
              </Link>
            </div>

            {/* Exo */}
            <div className="network-card">
              <div className="flex justify-center gap-1 mb-5">
                {[1,2,3,4,5].map(n => (
                  <div key={n} className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--exo-line)" }} />
                ))}
              </div>
              <h3 className="font-heading font-semibold text-xl tracking-tight">Exo Commuter</h3>
              <p className="text-[var(--text-muted)] text-sm mt-1.5 mb-5">
                {exoCount} stations, 5 train lines
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                {allLines.filter(l => l.network === "exo").map(line => (
                  <Link
                    key={line.id}
                    href={`/line/${line.id}`}
                    className="line-badge"
                    style={{ backgroundColor: "var(--exo-line)" }}
                  >
                    {line.id.replace("exo", "Line ")}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Fares ─── */}
      <section className="py-16 bg-white border-y border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-tight">Fare Zones</h2>
              <p className="text-[var(--text-muted)] text-[15px] mt-1">
                Unified pricing across all modes. Valid 120 minutes.
              </p>
            </div>
            <span className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-wider">OPUS Card or Contactless</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { zone: "A", price: "$3.75", area: "Montreal Island", accent: "var(--blue-line)" },
              { zone: "AB", price: "$5.25", area: "Montreal + Laval", accent: "var(--orange-line)" },
              { zone: "ABC", price: "$7.00", area: "+ Inner Suburbs", accent: "var(--green-line)" },
              { zone: "ABCD", price: "$9.25", area: "Full Network", accent: "var(--text-primary)" },
            ].map((f) => (
              <div key={f.zone} className="stat-card">
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: f.accent }} />
                <div className="text-[11px] font-semibold tracking-widest text-[var(--text-muted)] uppercase mb-2">
                  Zone {f.zone}
                </div>
                <div className="font-heading text-3xl font-bold tracking-tight">{f.price}</div>
                <div className="text-[13px] text-[var(--text-muted)] mt-1.5">{f.area}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEO Text ─── */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <h2 className="font-heading text-xl font-bold tracking-tight mb-3">
            Plan Your Montreal Transit Trip
          </h2>
          <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed">
            MTL Metro calculates the fastest route between any two stations on Montreal&apos;s
            transit network. Whether you&apos;re traveling on the STM Metro, the REM automated
            light rail, or Exo commuter trains, get the optimal path with transfers,
            travel time, stops, and fare info.
          </p>
        </div>
      </section>
    </>
  )
}
