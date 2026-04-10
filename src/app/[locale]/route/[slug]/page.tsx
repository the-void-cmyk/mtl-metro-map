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
import stations from "../../../../../data/stations.json"
import type { Station } from "@/lib/types"

const allStations = stations as Station[]

interface RoutePageProps {
  params: Promise<{ slug: string; locale: string }>
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

export default async function RoutePage({ params }: RoutePageProps) {
  const { slug, locale } = await params
  const parsed = parseSlug(slug)
  if (!parsed) notFound()

  const route = findRoute(parsed.from, parsed.to)
  if (!route) notFound()

  const comparison = findRoutes(parsed.from, parsed.to)

  const t = getTranslations(locale as Locale)
  const baseUrl = "https://mtlmetromap.com"
  const altLocale = locale === 'en' ? 'fr' : 'en'

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
          <h1 className="font-heading text-2xl sm:text-[32px] font-bold tracking-tight leading-tight break-words">
            {route.from.name}
            <span className="text-[var(--text-muted)] mx-2 font-normal">&rarr;</span>
            {route.to.name}
          </h1>
          <p className="text-[var(--text-secondary)] text-[15px] mt-2 leading-relaxed">
            {t.routeDescription(route.totalTime, route.stops, route.transfers.length, formatPrice(route.fare.price))}
          </p>
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
