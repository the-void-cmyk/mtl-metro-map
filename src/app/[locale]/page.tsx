import Link from "next/link"
import { getTranslations, locales } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import SearchBar from "@/components/SearchBar"
import LiquidGlass from "@/components/LiquidGlass"
import NearbyStations from "@/components/NearbyStations"
import stations from "../../../data/stations.json"
import lines from "../../../data/lines.json"
import type { Station, Line } from "@/lib/types"

const allStations = stations as Station[]
const allLines = lines as Line[]

interface HomeProps {
  params: Promise<{ locale: string }>
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function HomePage({ params }: HomeProps) {
  const { locale } = await params
  const t = getTranslations(locale as Locale)

  const metroCount = allStations.filter((s) => s.network === "metro").length
  const remCount = allStations.filter((s) => s.network === "rem").length
  const exoCount = allStations.filter((s) => s.network === "exo").length

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden h-screen flex items-center">
        {/* Hero background image */}
        <img
          src="/hero-mobile.jpg"
          srcSet="/hero-mobile.jpg 768w, /hero-tablet.jpg 1024w, /hero-desktop.jpg 1920w"
          sizes="100vw"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative max-w-6xl mx-auto px-5">
          {/* Text area with subtle backdrop for readability */}
          <div className="text-center mb-10 py-8 px-6 rounded-3xl" style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium mb-6 tracking-wide" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {t.heroBadge(allStations.length)}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight leading-[1.1] mb-4" style={{ color: "#FFFFFF", fontFamily: "var(--font-space-grotesk), system-ui", textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
              {t.heroTitle1}<br />
              <span style={{ color: "rgba(255,255,255,0.6)" }}>{t.heroTitle2}</span>
            </h1>
            <p className="text-[15px] max-w-md mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>{t.heroSubtitle}</p>
          </div>
          {/* Liquid glass search card */}
          <LiquidGlass backgroundSrc="/hero-desktop.jpg" className="max-w-2xl mx-auto">
            <div className="rounded-2xl p-6">
              <SearchBar stations={allStations} locale={locale as Locale} />
            </div>
          </LiquidGlass>
        </div>
      </section>

      {/* Nearby Stations */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-5">
          <NearbyStations stations={allStations} lines={allLines} locale={locale as Locale} />
        </div>
      </section>

      {/* Network Cards */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-10">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{t.networkTitle}</h2>
            <p className="text-[var(--text-muted)] text-[15px] mt-2">{t.networkSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="network-card">
              <div className="flex justify-center gap-1.5 mb-5">
                {allLines.filter(l => l.network === "metro").map(line => (<div key={line.id} className="w-3 h-3 rounded-full" style={{ backgroundColor: line.color }} />))}
              </div>
              <h3 className="font-heading font-semibold text-xl tracking-tight">{t.stmLabel}</h3>
              <p className="text-[var(--text-muted)] text-sm mt-1.5 mb-5">{t.stationsAcrossLines(metroCount, 4)}</p>
              <div className="flex justify-center gap-2">
                {allLines.filter(l => l.network === "metro").map(line => (
                  <Link key={line.id} href={`/${locale}/line/${line.id}`} className="line-badge" style={{ backgroundColor: line.color, color: line.textColor }}>
                    {locale === 'fr' ? line.nameFr.replace('Ligne ', '') : line.name.replace(' Line', '')}
                  </Link>
                ))}
              </div>
            </div>
            <div className="network-card">
              <div className="flex justify-center mb-5"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--rem-line)" }} /></div>
              <h3 className="font-heading font-semibold text-xl tracking-tight">{t.remLabel}</h3>
              <p className="text-[var(--text-muted)] text-sm mt-1.5 mb-5">{t.stationsAutomated(remCount)}</p>
              <Link href={`/${locale}/line/rem-a`} className="line-badge" style={{ backgroundColor: "var(--rem-line)" }}>REM</Link>
            </div>
            <div className="network-card">
              <div className="flex justify-center gap-1 mb-5">{[1,2,3,4,5].map(n => (<div key={n} className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--exo-line)" }} />))}</div>
              <h3 className="font-heading font-semibold text-xl tracking-tight">{t.exoLabel}</h3>
              <p className="text-[var(--text-muted)] text-sm mt-1.5 mb-5">{t.stationsTrainLines(exoCount, 5)}</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {allLines.filter(l => l.network === "exo").map(line => (
                  <Link key={line.id} href={`/${locale}/line/${line.id}`} className="line-badge" style={{ backgroundColor: "var(--exo-line)" }}>
                    {line.id.replace("exo", locale === 'fr' ? 'Ligne ' : 'Line ')}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fares */}
      <section className="py-16 bg-[var(--surface-elevated)] border-y border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-tight">{t.fareZonesTitle}</h2>
              <p className="text-[var(--text-muted)] text-[15px] mt-1">{t.fareZonesSubtitle}</p>
            </div>
            <span className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-wider">{t.farePayment}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { zone: "A", price: "$3.75", area: t.montrealIsland, accent: "var(--blue-line)" },
              { zone: "AB", price: "$5.25", area: t.montrealLaval, accent: "var(--orange-line)" },
              { zone: "ABC", price: "$7.00", area: t.innerSuburbs, accent: "var(--green-line)" },
              { zone: "ABCD", price: "$9.25", area: t.fullNetwork, accent: "var(--text-primary)" },
            ].map((f) => (
              <div key={f.zone} className="stat-card">
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: f.accent }} />
                <div className="text-[11px] font-semibold tracking-widest text-[var(--text-muted)] uppercase mb-2">Zone {f.zone}</div>
                <div className="font-heading text-3xl font-bold tracking-tight">{f.price}</div>
                <div className="text-[13px] text-[var(--text-muted)] mt-1.5">{f.area}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Text */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <h2 className="font-heading text-xl font-bold tracking-tight mb-3">{t.planTripTitle}</h2>
          <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed">{t.planTripText}</p>
        </div>
      </section>
    </>
  )
}
