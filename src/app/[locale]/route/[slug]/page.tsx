import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { findRoute, findRoutes } from "@/lib/router"
import { generateRouteMetadata, generateRouteSchema, generateFAQSchema, generateBreadcrumbSchema } from "@/lib/seo"
import { formatPrice } from "@/lib/fares"
import { getTranslations } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import RouteComparisonTabs from "@/components/RouteComparisonTabs"
import FAQ from "@/components/FAQ"
import Breadcrumbs from "@/components/Breadcrumbs"
import SchemaMarkup from "@/components/SchemaMarkup"
import SearchBar from "@/components/SearchBar"
import ViewTracker from "@/components/ViewTracker"
import PopularRoutes from "@/components/PopularRoutes"
import ShareButton from "@/components/ShareButton"
import stations from "../../../../../data/stations.json"
import type { Station } from "@/lib/types"

const allStations = stations as Station[]

interface RoutePageProps {
  params: Promise<{ slug: string; locale: string }>
  searchParams: Promise<{ depart?: string; arrive?: string }>
}

function parseSlug(slug: string): { from: string; to: string } | null {
  const decoded = decodeURIComponent(slug)
  const match = decoded.match(/^(.+)-to-(.+)$/)
  if (!match) return null
  return { from: match[1], to: match[2] }
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const parsed = parseSlug(slug)
  if (!parsed) return { title: "Route Not Found" }

  const route = findRoute(parsed.from, parsed.to)
  if (!route) return { title: "Route Not Found" }

  const meta = generateRouteMetadata(route)
  const altLocale = locale === 'en' ? 'fr' : 'en'

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${locale}/route/${slug}`,
      languages: {
        [locale]: `/${locale}/route/${slug}`,
        [altLocale]: `/${altLocale}/route/${slug}`,
      },
    },
    openGraph: meta.openGraph,
  }
}

function addMinutes(timeStr: string, mins: number): string {
  const [h, m] = timeStr.split(":").map(Number)
  const totalMinutes = h * 60 + m + mins
  const newH = Math.floor(totalMinutes / 60) % 24
  const newM = totalMinutes % 60
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`
}

function subtractMinutes(timeStr: string, mins: number): string {
  const [h, m] = timeStr.split(":").map(Number)
  let totalMinutes = h * 60 + m - mins
  if (totalMinutes < 0) totalMinutes += 24 * 60
  const newH = Math.floor(totalMinutes / 60) % 24
  const newM = totalMinutes % 60
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`
}

function formatTime12h(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number)
  const period = h >= 12 ? "PM" : "AM"
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${String(m).padStart(2, "0")} ${period}`
}

function parseTimeParam(value: string): string {
  // Strip "tomorrow-" prefix if present, we only need the HH:MM
  return value.replace("tomorrow-", "")
}

function isOutsideServiceHours(time: string, firstTrain: string, lastTrain: string): boolean {
  const [th, tm] = time.split(":").map(Number)
  const [fh, fm] = firstTrain.split(":").map(Number)
  const [lh, lm] = lastTrain.split(":").map(Number)
  const tMin = th * 60 + tm
  const fMin = fh * 60 + fm
  const lMin = lh * 60 + lm

  // Handle overnight service (e.g., first 05:30, last 01:00)
  if (lMin < fMin) {
    // Service wraps past midnight: valid from firstTrain to midnight and midnight to lastTrain
    return tMin > lMin && tMin < fMin
  }
  return tMin < fMin || tMin > lMin
}

export default async function RoutePage({ params, searchParams }: RoutePageProps) {
  const { slug, locale } = await params
  const sp = await searchParams
  const parsed = parseSlug(slug)
  if (!parsed) notFound()

  const route = findRoute(parsed.from, parsed.to)
  if (!route) notFound()

  const comparison = findRoutes(parsed.from, parsed.to)

  const t = getTranslations(locale as Locale)
  const baseUrl = "https://mtlmetromap.com"
  const altLocale = locale === 'en' ? 'fr' : 'en'

  // Time planning
  const departParam = sp.depart
  const arriveParam = sp.arrive
  let departTime: string | null = null
  let arriveTime: string | null = null
  let timeMode: "depart" | "arrive" | null = null
  let serviceWarning = false

  if (departParam) {
    timeMode = "depart"
    departTime = parseTimeParam(departParam)
    arriveTime = addMinutes(departTime, route.totalTime)
    serviceWarning = isOutsideServiceHours(departTime, route.firstTrain, route.lastTrain)
  } else if (arriveParam) {
    timeMode = "arrive"
    arriveTime = parseTimeParam(arriveParam)
    departTime = subtractMinutes(arriveTime, route.totalTime)
    serviceWarning = isOutsideServiceHours(departTime, route.firstTrain, route.lastTrain)
  }

  const schemas = [
    generateRouteSchema(route),
    generateFAQSchema(route),
    generateBreadcrumbSchema(
      [
        { name: route.from.name, url: `/${locale}/station/${route.from.slug}` },
        { name: t.routeTo(route.to.name), url: `/${locale}/route/${slug}` },
      ],
      baseUrl
    ),
  ]

  return (
    <>
      <SchemaMarkup data={schemas} />
      <ViewTracker fromSlug={route.from.slug} toSlug={route.to.slug} />

      {/* hreflang */}
      <link rel="alternate" hrefLang={locale} href={`${baseUrl}/${locale}/route/${slug}`} />
      <link rel="alternate" hrefLang={altLocale} href={`${baseUrl}/${altLocale}/route/${slug}`} />

      <div className="max-w-6xl mx-auto px-5 py-6 sm:py-8">
        <Breadcrumbs
          items={[
            { name: route.from.name, url: `/${locale}/station/${route.from.slug}` },
            { name: t.routeTo(route.to.name), url: `/${locale}/route/${slug}` },
          ]}
          locale={locale as Locale}
        />

        <div className="mt-5 mb-8">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-[32px] font-bold tracking-tight leading-tight break-words">
              {route.from.name}
              <span className="text-[var(--text-muted)] mx-2 font-normal">&rarr;</span>
              {route.to.name}
            </h1>
            <ShareButton
              url={`${baseUrl}/${locale}/route/${slug}`}
              title={`${route.from.name} \u2192 ${route.to.name}`}
              copiedLabel={t.copied}
              shareLabel={t.shareRoute}
            />
          </div>
          <p className="text-[var(--text-secondary)] text-[15px] mt-2 leading-relaxed">
            {t.routeDescription(route.totalTime, route.stops, route.transfers.length, formatPrice(route.fare.price))}
          </p>

          {timeMode && departTime && arriveTime && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-inset)] border border-[var(--border)] text-[14px]">
                <span className="text-[var(--text-muted)]">{t.departAt}:</span>
                <span className="font-medium font-heading tabular-nums">{formatTime12h(departTime)}</span>
              </div>
              <span className="text-[var(--text-muted)]">&rarr;</span>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-inset)] border border-[var(--border)] text-[14px]">
                <span className="text-[var(--text-muted)]">{t.estimatedArrival}:</span>
                <span className="font-medium font-heading tabular-nums">{formatTime12h(arriveTime)}</span>
              </div>
              {serviceWarning && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[13px] font-medium">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="shrink-0">
                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  {t.outsideServiceHours}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            <RouteComparisonTabs comparison={comparison ?? { primary: route, alternatives: [] }} locale={locale as Locale} />

            <FAQ route={route} locale={locale as Locale} />
          </div>

          <div className="space-y-5">
            <div className="info-card">
              <div className="info-card-header">{t.routeDetails}</div>
              <div className="info-card-body">
                <dl className="space-y-3 text-[14px]">
                  <div className="flex justify-between items-center">
                    <dt className="text-[var(--text-muted)]">{t.distance}</dt>
                    <dd className="font-medium">{route.distance} km</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-[var(--text-muted)]">{t.lines}</dt>
                    <dd className="flex gap-1.5">
                      {route.segments.map((seg) => (
                        <span key={seg.line.id} className="line-badge" style={{ backgroundColor: seg.line.color, color: seg.line.textColor }}>
                          {locale === 'fr' ? seg.line.nameFr.replace('Ligne ', '') : seg.line.name.replace(' Line', '')}
                        </span>
                      ))}
                    </dd>
                  </div>
                  <div className="h-px bg-[var(--border)]" />
                  <div className="flex justify-between items-center">
                    <dt className="text-[var(--text-muted)]">{t.fareZone}</dt>
                    <dd className="font-medium">Zone {route.fare.zones.join("")}</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-[var(--text-muted)]">{t.ticketValid}</dt>
                    <dd className="font-medium">{route.fare.validityMinutes} min</dd>
                  </div>
                  <div className="h-px bg-[var(--border)]" />
                  <div className="flex justify-between items-center">
                    <dt className="text-[var(--text-muted)]">{t.firstTrain}</dt>
                    <dd className="font-medium font-heading tabular-nums">{route.firstTrain}</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-[var(--text-muted)]">{t.lastTrain}</dt>
                    <dd className="font-medium font-heading tabular-nums">{route.lastTrain}</dd>
                  </div>
                  {timeMode && departTime && arriveTime && (
                    <>
                      <div className="h-px bg-[var(--border)]" />
                      <div className="flex justify-between items-center">
                        <dt className="text-[var(--text-muted)]">{t.estimatedDeparture}</dt>
                        <dd className="font-medium font-heading tabular-nums">{formatTime12h(departTime)}</dd>
                      </div>
                      <div className="flex justify-between items-center">
                        <dt className="text-[var(--text-muted)]">{t.estimatedArrival}</dt>
                        <dd className="font-medium font-heading tabular-nums">{formatTime12h(arriveTime)}</dd>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between items-center">
                    <dt className="text-[var(--text-muted)]">{t.accessible}</dt>
                    <dd className="font-medium">{route.from.accessible && route.to.accessible ? t.yes : t.partial}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <PopularRoutes stationSlug={route.from.slug} locale={locale as Locale} />

            <Link href={`/${locale}/route/${route.to.slug}-to-${route.from.slug}`} className="info-card block hover:border-[#bbb] transition-colors group">
              <div className="p-4 text-center">
                <span className="text-[14px] font-medium text-[var(--accent)] group-hover:underline">
                  {route.to.name} &rarr; {route.from.name}
                </span>
                <span className="block text-[12px] text-[var(--text-muted)] mt-0.5">{t.viewReverseRoute}</span>
              </div>
            </Link>

            <div className="info-card">
              <div className="info-card-header">{t.findAnotherRoute}</div>
              <div className="info-card-body">
                <SearchBar stations={allStations} compact locale={locale as Locale} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
