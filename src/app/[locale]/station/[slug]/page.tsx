import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { getStationBySlug, getLinesForStation } from "@/lib/stations"
import { generateStationMetadata } from "@/lib/seo"
import { getTranslations, locales } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import Breadcrumbs from "@/components/Breadcrumbs"
import SearchBar from "@/components/SearchBar"
import PopularRoutes from "@/components/PopularRoutes"
import type { Station } from "@/lib/types"
import stations from "../../../../../data/stations.json"
import stationGuidesData from "../../../../../data/station-guides.json"

const allStations = stations as Station[]

interface StationHighlight {
  name: string
  nameFr: string
  type: string
}

interface StationGuide {
  stationSlug: string
  neighborhood: string
  neighborhoodFr: string
  highlights: StationHighlight[]
  tip: string
  tipFr: string
}

const stationGuides = stationGuidesData as StationGuide[]

const highlightColors: Record<string, string> = {
  education: '#0072BC',
  shopping: '#F58220',
  entertainment: '#E91E63',
  dining: '#FF5722',
  parks: '#00A651',
  culture: '#9C27B0',
  sports: '#F44336',
  transport: '#607D8B',
}

interface StationPageProps {
  params: Promise<{ slug: string; locale: string }>
}

export async function generateStaticParams() {
  return locales.flatMap((locale) =>
    allStations.map((s) => ({ locale, slug: s.slug }))
  )
}

export async function generateMetadata({ params }: StationPageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const station = getStationBySlug(slug)
  if (!station) return { title: "Station Not Found" }

  const lines = getLinesForStation(station.id)
  const meta = generateStationMetadata(station, lines)
  const altLocale = locale === 'en' ? 'fr' : 'en'

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${locale}/station/${slug}`,
      languages: { [locale]: `/${locale}/station/${slug}`, [altLocale]: `/${altLocale}/station/${slug}` },
    },
  }
}

export default async function StationPage({ params }: StationPageProps) {
  const { slug, locale } = await params
  const station = getStationBySlug(slug)
  if (!station) notFound()

  const lines = getLinesForStation(station.id)
  const t = getTranslations(locale as Locale)
  const networkLabel = station.network === "metro" ? t.stmLabel : station.network === "rem" ? t.remLabel : t.exoLabel
  const guide = stationGuides.find(g => g.stationSlug === station.slug)

  return (
    <div className="max-w-6xl mx-auto px-5 py-6 sm:py-8">
      <Breadcrumbs
        items={[
          { name: locale === 'fr' ? (lines[0]?.nameFr ?? 'Stations') : (lines[0]?.name ?? 'Stations'), url: lines[0] ? `/${locale}/line/${lines[0].id}` : `/${locale}` },
          { name: station.name, url: `/${locale}/station/${station.slug}` },
        ]}
        locale={locale as Locale}
      />

      <div className="mt-5 mb-8 flex items-start gap-3">
        <div className="flex gap-1 mt-2">
          {lines.map(l => (<div key={l.id} className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: l.color }} />))}
        </div>
        <div>
          <h1 className="font-heading text-2xl sm:text-[32px] font-bold tracking-tight leading-tight">{station.name}</h1>
          <p className="text-[var(--text-secondary)] text-[15px] mt-1">
            {t.stationServedBy(networkLabel, lines.map(l => locale === 'fr' ? l.nameFr : l.name).join(locale === 'fr' ? ' et ' : ' and '), station.zone)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <div className="info-card">
            <div className="info-card-header">{t.stationInfo}</div>
            <div className="info-card-body">
              <dl className="grid grid-cols-2 gap-y-4 gap-x-8 text-[14px]">
                <div>
                  <dt className="text-[var(--text-muted)] text-[12px] uppercase tracking-wider font-medium">{t.network}</dt>
                  <dd className="font-medium mt-0.5">{networkLabel}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)] text-[12px] uppercase tracking-wider font-medium">{t.fareZone}</dt>
                  <dd className="font-medium mt-0.5">Zone {station.zone}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)] text-[12px] uppercase tracking-wider font-medium">{t.firstTrain}</dt>
                  <dd className="font-heading font-medium mt-0.5 tabular-nums">{station.firstTrain}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)] text-[12px] uppercase tracking-wider font-medium">{t.lastTrain}</dt>
                  <dd className="font-heading font-medium mt-0.5 tabular-nums">{station.lastTrain}</dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)] text-[12px] uppercase tracking-wider font-medium">{t.accessible}</dt>
                  <dd className="font-medium mt-0.5 flex items-center gap-1.5">
                    {station.accessible ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#2E7D32] flex-shrink-0" aria-hidden="true">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.59l-3.29-3.3 1.41-1.41L11 13.76l4.88-4.88 1.41 1.41L11 16.59z" fill="currentColor"/>
                        </svg>
                        {t.wheelchairAccessible}
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#E65100] flex-shrink-0" aria-hidden="true">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                        </svg>
                        {t.limitedAccessibility}
                      </>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--text-muted)] text-[12px] uppercase tracking-wider font-medium">{t.lines}</dt>
                  <dd className="flex gap-1.5 mt-0.5">
                    {lines.map((line) => (
                      <Link key={line.id} href={`/${locale}/line/${line.id}`} className="line-badge" style={{ backgroundColor: line.color, color: line.textColor }}>
                        {locale === 'fr' ? line.nameFr.replace('Ligne ', '') : line.name.replace(' Line', '')}
                      </Link>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {guide && (
            <div className="info-card">
              <div className="info-card-header">{t.neighborhoodGuide}</div>
              <div className="info-card-body space-y-4">
                <div>
                  <h3 className="font-heading font-semibold text-[15px]">
                    {locale === 'fr' ? guide.neighborhoodFr : guide.neighborhood}
                  </h3>
                  <p className="text-[12px] text-[var(--text-muted)] uppercase tracking-wider mt-0.5">{t.thingsNearby}</p>
                </div>
                <ul className="space-y-2">
                  {guide.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-[14px]">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: highlightColors[h.type] || '#999' }}
                      />
                      <span>{locale === 'fr' ? h.nameFr : h.name}</span>
                      <span className="text-[11px] text-[var(--text-muted)] ml-auto">
                        {t[h.type as keyof typeof t] as string}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="rounded-lg bg-[var(--surface-inset)] border border-[var(--border-subtle)] px-4 py-3">
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">{t.localTip}</p>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                    {locale === 'fr' ? guide.tipFr : guide.tip}
                  </p>
                </div>
              </div>
            </div>
          )}

          {lines.map((line) => (
            <div key={line.id} className="info-card">
              <div className="info-card-header flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: line.color }} />
                {locale === 'fr' ? line.nameFr : line.name}
              </div>
              <div className="info-card-body">
                <div className="flex flex-wrap gap-1.5">
                  {line.stations.map((stId) => {
                    const st = allStations.find((s) => s.id === stId)
                    if (!st) return null
                    return st.id === station.id ? (
                      <span key={stId} className="text-[12px] px-2.5 py-1 rounded-md font-semibold text-white" style={{ backgroundColor: line.color }}>{st.name}</span>
                    ) : (
                      <Link key={stId} href={`/${locale}/station/${st.slug}`} className="text-[12px] px-2.5 py-1 rounded-md border border-[var(--border)] hover:bg-[var(--surface-inset)] transition-colors">{st.name}</Link>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-5">
          <div className="info-card">
            <div className="info-card-header">{t.findRouteFromHere}</div>
            <div className="info-card-body"><SearchBar stations={allStations} compact locale={locale as Locale} /></div>
          </div>
          <PopularRoutes stationSlug={station.slug} locale={locale as Locale} />
          <div className="info-card">
            <div className="info-card-header">{t.location}</div>
            <div className="info-card-body text-[13px] text-[var(--text-secondary)] font-heading tabular-nums">
              {station.lat.toFixed(4)}N, {Math.abs(station.lng).toFixed(4)}W
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
