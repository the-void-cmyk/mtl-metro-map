import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { findRoute } from "@/lib/router"
import { generateRouteMetadata, generateRouteSchema, generateFAQSchema, generateBreadcrumbSchema } from "@/lib/seo"
import { formatPrice } from "@/lib/fares"
import RouteDiagram from "@/components/RouteDiagram"
import FAQ from "@/components/FAQ"
import Breadcrumbs from "@/components/Breadcrumbs"
import SchemaMarkup from "@/components/SchemaMarkup"
import SearchBar from "@/components/SearchBar"
import ViewTracker from "@/components/ViewTracker"
import stations from "../../../../data/stations.json"
import type { Station } from "@/lib/types"

const allStations = stations as Station[]

interface RoutePageProps {
  params: Promise<{ slug: string }>
}

function parseSlug(slug: string): { from: string; to: string } | null {
  const decoded = decodeURIComponent(slug)
  const match = decoded.match(/^(.+)-to-(.+)$/)
  if (!match) return null
  return { from: match[1], to: match[2] }
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const { slug } = await params
  const parsed = parseSlug(slug)
  if (!parsed) return { title: "Route Not Found" }

  const route = findRoute(parsed.from, parsed.to)
  if (!route) return { title: "Route Not Found" }

  const meta = generateRouteMetadata(route)
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: meta.canonical },
    openGraph: meta.openGraph,
  }
}

export default async function RoutePage({ params }: RoutePageProps) {
  const { slug } = await params
  const parsed = parseSlug(slug)
  if (!parsed) notFound()

  const route = findRoute(parsed.from, parsed.to)
  if (!route) notFound()

  const baseUrl = "https://mtlmetromap.com"
  const schemas = [
    generateRouteSchema(route),
    generateFAQSchema(route),
    generateBreadcrumbSchema(
      [
        { name: route.from.name, url: `/station/${route.from.slug}` },
        { name: `Route to ${route.to.name}`, url: `/route/${slug}` },
      ],
      baseUrl
    ),
  ]

  return (
    <>
      <SchemaMarkup data={schemas} />
      <ViewTracker fromSlug={route.from.slug} toSlug={route.to.slug} />

      <div className="max-w-6xl mx-auto px-5 py-6 sm:py-8">
        <Breadcrumbs
          items={[
            { name: route.from.name, url: `/station/${route.from.slug}` },
            { name: `Route to ${route.to.name}`, url: `/route/${slug}` },
          ]}
        />

        {/* ─── Title ─── */}
        <div className="mt-5 mb-8">
          <h1 className="font-heading text-2xl sm:text-[32px] font-bold tracking-tight leading-tight">
            {route.from.name}
            <span className="text-[var(--text-muted)] mx-2 font-normal">&rarr;</span>
            {route.to.name}
          </h1>
          <p className="text-[var(--text-secondary)] text-[15px] mt-2 leading-relaxed">
            Montreal transit route. {route.totalTime} minutes,{" "}
            {route.stops} stops{route.transfers.length > 0 ? `, ${route.transfers.length} transfer(s)` : ", direct"}.
            Fare: {formatPrice(route.fare.price)}.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* ─── Main Column ─── */}
          <div className="space-y-6">
            {/* Stat Strip */}
            <div className="grid grid-cols-4 gap-3">
              <div className="stat-card stat-card-blue">
                <div className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{route.totalTime}</div>
                <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mt-1">Minutes</div>
              </div>
              <div className="stat-card stat-card-neutral">
                <div className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{route.stops}</div>
                <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mt-1">Stops</div>
              </div>
              <div className="stat-card stat-card-neutral">
                <div className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{route.transfers.length}</div>
                <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mt-1">Transfer{route.transfers.length !== 1 ? "s" : ""}</div>
              </div>
              <div className="stat-card stat-card-green">
                <div className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{formatPrice(route.fare.price)}</div>
                <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mt-1">Fare</div>
              </div>
            </div>

            {/* Route Diagram */}
            <div className="info-card">
              <div className="info-card-header">Step-by-Step Route</div>
              <div className="info-card-body">
                <RouteDiagram route={route} />
              </div>
            </div>

            {/* FAQ */}
            <FAQ route={route} />
          </div>

          {/* ─── Sidebar ─── */}
          <div className="space-y-5">
            {/* Route Info */}
            <div className="info-card">
              <div className="info-card-header">Route Details</div>
              <div className="info-card-body">
                <dl className="space-y-3 text-[14px]">
                  <div className="flex justify-between items-center">
                    <dt className="text-[var(--text-muted)]">Distance</dt>
                    <dd className="font-medium">{route.distance} km</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-[var(--text-muted)]">Lines</dt>
                    <dd className="flex gap-1.5">
                      {route.segments.map((seg) => (
                        <span
                          key={seg.line.id}
                          className="line-badge"
                          style={{ backgroundColor: seg.line.color, color: seg.line.textColor }}
                        >
                          {seg.line.name.replace(" Line", "")}
                        </span>
                      ))}
                    </dd>
                  </div>
                  <div className="h-px bg-[var(--border)]" />
                  <div className="flex justify-between items-center">
                    <dt className="text-[var(--text-muted)]">Fare Zone</dt>
                    <dd className="font-medium">Zone {route.fare.zones.join("")}</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-[var(--text-muted)]">Ticket Valid</dt>
                    <dd className="font-medium">{route.fare.validityMinutes} min</dd>
                  </div>
                  <div className="h-px bg-[var(--border)]" />
                  <div className="flex justify-between items-center">
                    <dt className="text-[var(--text-muted)]">First Train</dt>
                    <dd className="font-medium font-heading tabular-nums">{route.firstTrain}</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-[var(--text-muted)]">Last Train</dt>
                    <dd className="font-medium font-heading tabular-nums">{route.lastTrain}</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-[var(--text-muted)]">Accessible</dt>
                    <dd className="font-medium">{route.from.accessible && route.to.accessible ? "Yes" : "Partial"}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Reverse Route */}
            <Link
              href={`/route/${route.to.slug}-to-${route.from.slug}`}
              className="info-card block hover:border-[#bbb] transition-colors group"
            >
              <div className="p-4 text-center">
                <span className="text-[14px] font-medium text-[var(--accent)] group-hover:underline">
                  {route.to.name} &rarr; {route.from.name}
                </span>
                <span className="block text-[12px] text-[var(--text-muted)] mt-0.5">View reverse route</span>
              </div>
            </Link>

            {/* Search Another */}
            <div className="info-card">
              <div className="info-card-header">Find Another Route</div>
              <div className="info-card-body">
                <SearchBar stations={allStations} compact />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
