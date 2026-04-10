"use client"

import { useState } from "react"
import type { RouteComparison, RouteResult } from "@/lib/types"
import type { Locale } from "@/lib/i18n"
import { getTranslations } from "@/lib/i18n"
import { formatPrice } from "@/lib/fares"
import RouteDiagram from "@/components/RouteDiagram"

interface RouteComparisonTabsProps {
  comparison: RouteComparison
  locale: Locale
}

function getRouteLabel(route: RouteResult, t: ReturnType<typeof getTranslations>) {
  switch (route.label) {
    case "fastest":
      return t.fastest
    case "fewest-transfers":
      return t.fewestTransfers
    case "alternative":
      return t.alternativeRoute
    default:
      return t.recommended
  }
}

function getBadgeColors(label: RouteResult["label"]) {
  switch (label) {
    case "fastest":
      return "bg-blue-50 text-blue-700"
    case "fewest-transfers":
      return "bg-emerald-50 text-emerald-700"
    case "alternative":
      return "bg-purple-50 text-purple-700"
    default:
      return "bg-blue-50 text-blue-700"
  }
}

export default function RouteComparisonTabs({ comparison, locale }: RouteComparisonTabsProps) {
  const t = getTranslations(locale)
  const [activeIndex, setActiveIndex] = useState(0)

  const hasAlternatives = comparison.alternatives.length > 0
  const allRoutes: RouteResult[] = [comparison.primary, ...comparison.alternatives]
  const activeRoute = allRoutes[activeIndex]

  // No alternatives: render primary route directly without tabs
  if (!hasAlternatives) {
    const route = comparison.primary
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="stat-card stat-card-blue">
            <div className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{route.totalTime}</div>
            <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mt-1">{t.minutes}</div>
          </div>
          <div className="stat-card stat-card-neutral">
            <div className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{route.stops}</div>
            <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mt-1">{t.stops}</div>
          </div>
          <div className="stat-card stat-card-neutral">
            <div className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{route.transfers.length}</div>
            <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mt-1">
              {route.transfers.length !== 1 ? t.transfers : t.transfer}
            </div>
          </div>
          <div className="stat-card stat-card-green">
            <div className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{formatPrice(route.fare.price)}</div>
            <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mt-1">{t.fare}</div>
          </div>
        </div>
        <RouteDiagram route={route} locale={locale} />
      </div>
    )
  }

  // With alternatives: render tabbed interface
  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {allRoutes.map((route, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`flex-shrink-0 rounded-xl border px-4 py-3 text-left transition-colors ${
              activeIndex === index
                ? "border-l-[3px] border-l-blue-500 border-y border-r border-[var(--border)] bg-blue-50/50"
                : "border-[var(--border)] hover:bg-[var(--bg-secondary)]"
            }`}
          >
            <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${getBadgeColors(route.label)}`}>
              {getRouteLabel(route, t)}
            </span>
            <div className="mt-1.5 text-[13px] text-[var(--text-secondary)]">
              {route.totalTime} min | {route.transfers.length} {route.transfers.length !== 1 ? t.transfers.toLowerCase() : t.transfer.toLowerCase()} | {route.stops} {t.stops.toLowerCase()}
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="stat-card stat-card-blue">
          <div className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{activeRoute.totalTime}</div>
          <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mt-1">{t.minutes}</div>
        </div>
        <div className="stat-card stat-card-neutral">
          <div className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{activeRoute.stops}</div>
          <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mt-1">{t.stops}</div>
        </div>
        <div className="stat-card stat-card-neutral">
          <div className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{activeRoute.transfers.length}</div>
          <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mt-1">
            {activeRoute.transfers.length !== 1 ? t.transfers : t.transfer}
          </div>
        </div>
        <div className="stat-card stat-card-green">
          <div className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{formatPrice(activeRoute.fare.price)}</div>
          <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mt-1">{t.fare}</div>
        </div>
      </div>

      <RouteDiagram route={activeRoute} locale={locale} />
    </div>
  )
}
