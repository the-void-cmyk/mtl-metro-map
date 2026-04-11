import Link from "next/link"
import { getTranslations, locales } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import SearchBar from "@/components/SearchBar"
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
      <section className="-mt-16">
        {/* Top label bar */}
        <div className="border-b-2 border-[var(--text-primary)] bg-[var(--surface)] px-5 lg:px-8 py-2 pt-[calc(theme(spacing.16)+8px)] flex items-center justify-between">
          <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-primary)]">
            {"// MTL_METRO_MAP"}
          </span>
          <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-primary)]">
            {allStations.length} {locale === 'fr' ? 'STATIONS' : 'STATIONS'} / 3 {locale === 'fr' ? 'RESEAUX' : 'NETWORKS'}
          </span>
        </div>

        {/* Two-column hero */}
        <div className="flex flex-col lg:flex-row border-b-2 border-[var(--text-primary)]" style={{ minHeight: "calc(100dvh - 100px)" }}>
          {/* Left: Search */}
          <div className="flex flex-col w-full lg:w-1/2 bg-[var(--surface)]">
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 lg:px-8 py-3 border-b-2 border-[var(--text-primary)]">
              <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)]">
                {locale === 'fr' ? 'PLANIFICATEUR' : 'ROUTE_PLANNER'}
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--accent)]">
                v3.0
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-end px-5 lg:px-8 py-8 lg:py-12">
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight mb-6" style={{ WebkitFontSmoothing: 'none' }}>
                {locale === 'fr' ? 'Trouvez votre trajet.' : 'Find your route.'}
              </h1>
              <p className="text-[15px] text-[var(--text-primary)] leading-relaxed mb-8 max-w-md">
                {t.heroSubtitle}
              </p>

              <SearchBar stations={allStations} locale={locale as Locale} />
            </div>
          </div>

          {/* Right: Statue image */}
          <div className="relative w-full lg:w-1/2 min-h-[50vh] lg:min-h-0 border-b-2 lg:border-b-0 lg:border-l-2 border-[var(--text-primary)] overflow-hidden bg-[#8a8a87]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-mobile.jpg"
              alt=""
              className="block lg:hidden absolute inset-0 w-full h-full object-cover"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero-desktop.jpg"
              alt=""
              className="hidden lg:block absolute inset-0 w-full h-full object-cover"
            />
            {/* Image overlay label */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-[#8a8a87]/80">
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/50">
                MTL / 45.5017 N, 73.5673 W
              </span>
              <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--accent)]">
                {locale === 'fr' ? 'EN DIRECT' : 'LIVE'}
              </span>
            </div>
          </div>
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
          <div className="section-label mb-8">
            <span>{"// NETWORK: STATIONS"}</span>
            <div className="section-line" />
            <span>{String(allStations.length).padStart(3, '0')}</span>
          </div>
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
                  <Link key={line.id} href={`/${locale}/line/${line.id}`} className="line-badge" style={{ backgroundColor: "var(--exo-line)", color: "var(--surface)" }}>
                    {line.id.replace("exo", locale === 'fr' ? 'Ligne ' : 'Line ')}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fares */}
      <section className="py-16 bg-[var(--surface-elevated)] border-y-2 border-[var(--text-primary)]">
        <div className="max-w-6xl mx-auto px-5">
          <div className="section-label mb-8">
            <span>{"// FARES: ZONE_PRICING"}</span>
            <div className="section-line" />
            <span>ARTM</span>
          </div>
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
                <div className="jb-mono text-3xl font-bold tracking-tight">{f.price}</div>
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
