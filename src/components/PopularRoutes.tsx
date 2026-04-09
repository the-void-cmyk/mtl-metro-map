import Link from "next/link"
import type { Locale } from "@/lib/i18n"
import { getPopularRoutes } from "@/lib/db"
import { getAllStations } from "@/lib/stations"
import { findRoute } from "@/lib/router"

interface PopularRoutesProps {
  stationSlug: string
  locale: Locale
}

export default async function PopularRoutes({ stationSlug, locale }: PopularRoutesProps) {
  let popular: Array<{ toSlug: string; toName: string; views: number }> = []
  try {
    popular = await getPopularRoutes(stationSlug)
  } catch {
    // DB not available during build - fall through to suggestions
  }

  if (!popular || popular.length === 0) {
    // Fallback: show a few nearby/important stations as suggestions
    const allStations = getAllStations()
    const current = allStations.find(s => s.slug === stationSlug)
    if (!current) return null

    // Pick up to 4 major transfer stations as suggestions
    const suggestions = allStations
      .filter(s => s.id !== current.id && s.lineIds.length > 1 && s.network === 'metro')
      .slice(0, 4)

    if (suggestions.length === 0) return null

    return (
      <div className="info-card">
        <div className="info-card-header">
          {locale === 'fr' ? 'Trajets suggeres' : 'Suggested Routes'}
        </div>
        <div className="info-card-body p-0">
          {suggestions.map(dest => {
            const route = findRoute(stationSlug, dest.slug)
            return (
              <Link
                key={dest.id}
                href={`/${locale}/route/${stationSlug}-to-${dest.slug}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-[var(--surface-inset)] transition-colors border-b border-[var(--border-subtle)] last:border-0"
              >
                <div>
                  <span className="text-[14px] font-medium">{dest.name}</span>
                  <div className="flex gap-1 mt-0.5">
                    {dest.lineIds.map(lid => {
                      const line = getAllStations().find(s => s.lineIds.includes(lid))
                      return <span key={lid} className={`line-dot line-dot-${lid}`} />
                    })}
                  </div>
                </div>
                {route && (
                  <span className="text-[13px] text-[var(--text-muted)] font-heading tabular-nums">
                    {route.totalTime} min
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  // Show actual popular routes from database
  const allStations = getAllStations()

  return (
    <div className="info-card">
      <div className="info-card-header">
        {locale === 'fr' ? 'Trajets populaires' : 'Popular Routes'}
      </div>
      <div className="info-card-body p-0">
        {popular.slice(0, 6).map((pr: { toSlug: string; toName: string; views: number }) => {
          const dest = allStations.find(s => s.slug === pr.toSlug)
          const route = findRoute(stationSlug, pr.toSlug)
          return (
            <Link
              key={pr.toSlug}
              href={`/${locale}/route/${stationSlug}-to-${pr.toSlug}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-[var(--surface-inset)] transition-colors border-b border-[var(--border-subtle)] last:border-0"
            >
              <div>
                <span className="text-[14px] font-medium">{dest?.name ?? pr.toName}</span>
                {dest && (
                  <div className="flex gap-1 mt-0.5">
                    {dest.lineIds.map(lid => (
                      <span key={lid} className={`line-dot line-dot-${lid}`} />
                    ))}
                  </div>
                )}
              </div>
              {route && (
                <span className="text-[13px] text-[var(--text-muted)] font-heading tabular-nums">
                  {route.totalTime} min
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
