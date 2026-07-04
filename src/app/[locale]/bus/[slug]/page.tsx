import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { getAllBuses, getBusByRoute, busColor, busCategory, busIntro } from "@/lib/buses"
import { getLineById } from "@/lib/stations"
import { generateBusMetadata, generateBreadcrumbSchema } from "@/lib/seo"
import { locales } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"
import Breadcrumbs from "@/components/Breadcrumbs"
import SchemaMarkup from "@/components/SchemaMarkup"

const BASE = "https://mtlmetromap.com"

interface BusPageProps {
  params: Promise<{ slug: string; locale: string }>
}

export async function generateStaticParams() {
  return locales.flatMap((locale) => getAllBuses().map((b) => ({ locale, slug: b.route })))
}

export async function generateMetadata({ params }: BusPageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const bus = getBusByRoute(slug)
  if (!bus) return { title: "Bus Route Not Found" }

  const meta = generateBusMetadata(bus, locale as Locale)
  const altLocale = locale === "en" ? "fr" : "en"
  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: {
      canonical: `/${locale}/bus/${slug}`,
      languages: {
        [locale]: `/${locale}/bus/${slug}`,
        [altLocale]: `/${altLocale}/bus/${slug}`,
        "x-default": `/en/bus/${slug}`,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      type: "website",
    },
  }
}

export default async function BusPage({ params }: BusPageProps) {
  const { slug, locale } = await params
  const bus = getBusByRoute(slug)
  if (!bus) notFound()

  const isFr = locale === "fr"
  const color = busColor(bus)
  const cat = busCategory(bus, locale as Locale)
  const from = bus.stops[0]
  const to = bus.stops[bus.stops.length - 1]

  const L = {
    buses: isFr ? "Autobus" : "Buses",
    heading: isFr ? `Autobus ${bus.route}` : `Bus ${bus.route}`,
    subtitle: isFr ? `STM · ${bus.stopCount} arrêts` : `STM · ${bus.stopCount} stops`,
    allStops: isFr ? `Les ${bus.stopCount} arrêts` : `All ${bus.stopCount} stops`,
    details: isFr ? "Détails de la ligne" : "Route details",
    service: isFr ? "Service" : "Service",
    frequency: isFr ? "Fréquence" : "Frequency",
    stops: isFr ? "Arrêts" : "Stops",
    from: isFr ? "De" : "From",
    to: isFr ? "À" : "To",
    connections: isFr ? "Correspondances métro et train" : "Metro & train connections",
    noConnections: isFr ? "Aucune correspondance directe avec le métro." : "No direct metro connection.",
    allBuses: isFr ? "Toutes les lignes d'autobus" : "All bus routes",
    source: isFr
      ? "Données : Société de transport de Montréal (STM), sous licence CC-BY-4.0."
      : "Data: Société de transport de Montréal (STM), licensed under CC-BY-4.0.",
  }

  const breadcrumbItems = [
    { name: L.buses, url: `/${locale}/buses` },
    { name: `${L.heading} ${bus.name}`, url: `/${locale}/bus/${bus.route}` },
  ]
  const schema = generateBreadcrumbSchema(breadcrumbItems, BASE)

  return (
    <div className="max-w-6xl mx-auto px-5 py-6 sm:py-8">
      <SchemaMarkup data={[schema]} />
      <Breadcrumbs items={breadcrumbItems} locale={locale as Locale} />

      <div className="flex items-center gap-3.5 mt-5 mb-4">
        <div
          className="flex-shrink-0 rounded-lg text-white font-heading font-bold flex items-center justify-center px-2.5 h-9 min-w-9 text-[15px]"
          style={{ backgroundColor: color }}
        >
          {bus.route}
        </div>
        <div>
          <h1 className="font-heading text-2xl sm:text-[32px] font-bold tracking-tight leading-tight">
            {L.heading} {bus.name}
          </h1>
          <p className="text-[var(--text-secondary)] text-[15px] mt-0.5">
            {L.subtitle} · {cat.label}
          </p>
        </div>
      </div>

      <p className="text-[15px] text-[var(--text-secondary)] leading-relaxed max-w-3xl mb-8">
        {busIntro(bus, locale as Locale)}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <div className="info-card">
          <div className="info-card-header">{L.allStops}</div>
          <div className="info-card-body py-4">
            <div className="space-y-0">
              {bus.stops.map((stop, i) => {
                const isTerminal = i === 0 || i === bus.stops.length - 1
                return (
                  <div key={`${stop}-${i}`} className="flex items-stretch">
                    <div className="flex flex-col items-center w-[18px] flex-shrink-0">
                      {i > 0 ? <div className="route-line flex-1" style={{ backgroundColor: color }} /> : <div className="flex-1" />}
                      <div
                        className={`route-station-dot ${isTerminal ? "route-station-dot-terminal" : "route-station-dot-intermediate"}`}
                        style={isTerminal ? {} : { backgroundColor: color }}
                      />
                      {i < bus.stops.length - 1 ? <div className="route-line flex-1" style={{ backgroundColor: color }} /> : <div className="flex-1" />}
                    </div>
                    <div className="flex-1 ml-4 py-2">
                      <span className={`text-[14px] ${isTerminal ? "font-semibold font-heading" : ""}`}>{stop}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="info-card">
            <div className="info-card-header">{L.details}</div>
            <div className="info-card-body">
              <dl className="space-y-3 text-[14px]">
                <div className="flex justify-between items-center gap-4">
                  <dt className="text-[var(--text-muted)]">{L.service}</dt>
                  <dd className="font-medium text-right">{cat.label}</dd>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <dt className="text-[var(--text-muted)]">{L.stops}</dt>
                  <dd className="font-heading font-medium">{bus.stopCount}</dd>
                </div>
                <div className="h-px bg-[var(--border)]" />
                <div className="flex justify-between items-start gap-4">
                  <dt className="text-[var(--text-muted)] flex-shrink-0">{L.from}</dt>
                  <dd className="font-medium text-right">{from}</dd>
                </div>
                <div className="flex justify-between items-start gap-4">
                  <dt className="text-[var(--text-muted)] flex-shrink-0">{L.to}</dt>
                  <dd className="font-medium text-right">{to}</dd>
                </div>
                <div className="h-px bg-[var(--border)]" />
                <div className="text-[13px] text-[var(--text-secondary)] leading-relaxed">{cat.freq}</div>
              </dl>
            </div>
          </div>

          <div className="info-card">
            <div className="info-card-header">{L.connections}</div>
            <div className="info-card-body p-2">
              {bus.metroConnections.length === 0 ? (
                <p className="text-[13px] text-[var(--text-muted)] px-3 py-2">{L.noConnections}</p>
              ) : (
                <div className="space-y-0.5">
                  {bus.metroConnections.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/${locale}/station/${c.slug}`}
                      className="flex items-center gap-2.5 text-[14px] px-3 py-2.5 rounded-lg hover:bg-[var(--surface-inset)] transition-colors"
                    >
                      <span className="flex gap-1 flex-shrink-0">
                        {c.lineIds.map((lid) => {
                          const line = getLineById(lid)
                          return line ? (
                            <span key={lid} className="w-3 h-3 rounded-full" style={{ backgroundColor: line.color }} title={isFr ? line.nameFr : line.name} />
                          ) : null
                        })}
                      </span>
                      <span className="flex-1 min-w-0 truncate">{c.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Link
            href={`/${locale}/buses`}
            className="block info-card hover:bg-[var(--surface-inset)] transition-colors"
          >
            <div className="info-card-body py-3 text-[14px] font-medium text-center">{L.allBuses}</div>
          </Link>

          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed px-1">{L.source}</p>
        </div>
      </div>
    </div>
  )
}
