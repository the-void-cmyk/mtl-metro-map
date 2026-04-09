import type { RouteResult } from "@/lib/types"
import type { Locale } from "@/lib/i18n"
import { getTranslations } from "@/lib/i18n"

interface RouteDiagramProps {
  route: RouteResult
  locale?: Locale
}

export default function RouteDiagram({ route, locale = 'en' }: RouteDiagramProps) {
  const t = getTranslations(locale)

  return (
    <div className="py-2">
      {route.segments.map((segment, segIdx) => (
        <div key={segIdx}>
          {segIdx > 0 && (
            <div className="flex items-center ml-[7px] py-1">
              <div className="w-[4px] h-8 border-l-2 border-dashed border-[var(--border)]" style={{ marginLeft: '-1px' }} />
              <div className="ml-5 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[var(--text-muted)]">
                  <path d="M6 9l6-6 6 6M6 15l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-[12px] font-medium text-[var(--text-muted)]">
                  {t.transferAt(route.transfers[segIdx - 1]?.stationName)}
                  <span className="text-[var(--text-muted)]/60 ml-1">{t.walkMin}</span>
                </span>
              </div>
            </div>
          )}

          {segment.stations.map((station, stIdx) => {
            const isFirst = stIdx === 0
            const isLast = stIdx === segment.stations.length - 1
            const isOrigin = segIdx === 0 && isFirst
            const isDestination = segIdx === route.segments.length - 1 && isLast
            const isEndpoint = isOrigin || isDestination

            return (
              <div key={station.id} className="flex items-stretch">
                <div className="flex flex-col items-center w-[18px] flex-shrink-0">
                  {!(isFirst && segIdx === 0) && (
                    <div className="route-line flex-1 min-h-[4px]" style={{ backgroundColor: segment.line.color }} />
                  )}
                  {isFirst && segIdx === 0 && <div className="flex-1" />}
                  <div
                    className={`route-station-dot ${isEndpoint ? "route-station-dot-terminal" : isFirst || isLast ? "route-station-dot-transfer" : "route-station-dot-intermediate"}`}
                    style={{ color: segment.line.color, backgroundColor: isEndpoint ? "white" : segment.line.color }}
                  />
                  {!(isLast && segIdx === route.segments.length - 1) && (
                    <div className="route-line flex-1 min-h-[4px]" style={{ backgroundColor: segment.line.color }} />
                  )}
                  {isLast && segIdx === route.segments.length - 1 && <div className="flex-1" />}
                </div>

                <div className={`ml-4 ${isEndpoint ? "py-3" : "py-[7px]"} flex-1 min-w-0`}>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`${isEndpoint ? "text-[15px] font-semibold font-heading tracking-tight" : "text-[13px] text-[var(--text-secondary)]"}`}>
                      {station.name}
                    </span>
                    {isFirst && (
                      <span className="line-badge" style={{ backgroundColor: segment.line.color + "14", color: segment.line.color }}>
                        {locale === 'fr' ? segment.line.nameFr : segment.line.name}
                      </span>
                    )}
                  </div>
                  {isOrigin && <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mt-0.5 block">{t.departure}</span>}
                  {isDestination && <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mt-0.5 block">{t.arrival}</span>}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
