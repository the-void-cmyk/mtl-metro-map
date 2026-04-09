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

  const baseUrl = "https://mtlmetro.com"
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

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { name: route.from.name, url: `/station/${route.from.slug}` },
            { name: `Route to ${route.to.name}`, url: `/route/${slug}` },
          ]}
        />

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold mt-4 mb-2">
          {route.from.name} to {route.to.name}
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          Montreal transit route from {route.from.name} to {route.to.name}. {route.totalTime} minutes,{" "}
          {route.stops} stops{route.transfers.length > 0 ? `, ${route.transfers.length} transfer(s)` : ", direct route"}.
          Fare: {formatPrice(route.fare.price)}.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{route.totalTime}</div>
                <div className="text-xs text-gray-500 mt-1">minutes</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{route.stops}</div>
                <div className="text-xs text-gray-500 mt-1">stops</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">{route.transfers.length}</div>
                <div className="text-xs text-gray-500 mt-1">transfer{route.transfers.length !== 1 ? "s" : ""}</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{formatPrice(route.fare.price)}</div>
                <div className="text-xs text-gray-500 mt-1">fare</div>
              </div>
            </div>

            {/* Route Diagram */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg font-bold mb-4">Step-by-Step Route</h2>
              <RouteDiagram route={route} />
            </div>

            {/* FAQ */}
            <FAQ route={route} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Route Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold mb-3">Route Information</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Distance</dt>
                  <dd className="font-medium">{route.distance} km</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Lines</dt>
                  <dd className="flex gap-1">
                    {route.segments.map((seg) => (
                      <span
                        key={seg.line.id}
                        className="px-1.5 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: seg.line.color, color: seg.line.textColor }}
                      >
                        {seg.line.name.replace(" Line", "")}
                      </span>
                    ))}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Fare Zone</dt>
                  <dd className="font-medium">{route.fare.zones.join("")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Ticket Valid</dt>
                  <dd className="font-medium">{route.fare.validityMinutes} min</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">First Train</dt>
                  <dd className="font-medium">{route.firstTrain}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Last Train</dt>
                  <dd className="font-medium">{route.lastTrain}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Accessible</dt>
                  <dd className="font-medium">{route.from.accessible && route.to.accessible ? "Yes" : "Partial"}</dd>
                </div>
              </dl>
            </div>

            {/* Reverse Route */}
            <Link
              href={`/route/${route.to.slug}-to-${route.from.slug}`}
              className="block bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition text-center"
            >
              <span className="text-sm font-medium text-blue-600">
                {route.to.name} to {route.from.name}
              </span>
              <span className="block text-xs text-gray-500 mt-1">View reverse route</span>
            </Link>

            {/* Search Another Route */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold mb-3 text-sm">Find Another Route</h3>
              <SearchBar stations={allStations} compact />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
