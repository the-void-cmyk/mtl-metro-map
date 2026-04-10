"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import type { Station, RouteResult } from "@/lib/types"
import type { Locale } from "@/lib/i18n"
import { getTranslations } from "@/lib/i18n"
import { findRoute } from "@/lib/router"
import RouteDiagram from "./RouteDiagram"

interface MultiStopPlannerProps {
  stations: Station[]
  locale: Locale
}

interface StopEntry {
  id: string
  query: string
  station: Station | null
}

function createStop(): StopEntry {
  return { id: crypto.randomUUID(), query: "", station: null }
}

export default function MultiStopPlanner({ stations, locale }: MultiStopPlannerProps) {
  const t = getTranslations(locale)

  const [stops, setStops] = useState<StopEntry[]>([createStop(), createStop()])
  const [activeStopIndex, setActiveStopIndex] = useState<number | null>(null)
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(-1)
  const [results, setResults] = useState<(RouteResult | null)[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedLegs, setExpandedLegs] = useState<Set<number>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)

  const normalizeText = (text: string) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()

  const searchStations = useCallback(
    (query: string): Station[] => {
      if (!query || query.length < 1) return []
      const normalized = normalizeText(query)
      const scored = stations.map((station) => {
        const name = normalizeText(station.name)
        const nameFr = normalizeText(station.nameFr)
        let score = 0
        if (name.startsWith(normalized) || nameFr.startsWith(normalized)) {
          score = 100
        } else if (
          name.split(/[-\s]/).some((w) => w.startsWith(normalized)) ||
          nameFr.split(/[-\s]/).some((w) => w.startsWith(normalized))
        ) {
          score = 75
        } else if (name.includes(normalized) || nameFr.includes(normalized)) {
          score = 50
        }
        return { station, score }
      })
      return scored
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map((s) => s.station)
    },
    [stations]
  )

  const currentResults =
    activeStopIndex !== null ? searchStations(stops[activeStopIndex]?.query || "") : []

  const updateStop = (index: number, updates: Partial<StopEntry>) => {
    setStops((prev) => prev.map((s, i) => (i === index ? { ...s, ...updates } : s)))
  }

  const selectStation = (index: number, station: Station) => {
    updateStop(index, { station, query: station.name })
    setActiveStopIndex(null)
    setActiveDropdownIndex(-1)
  }

  const addStop = () => {
    if (stops.length >= 5) return
    const newStops = [...stops]
    newStops.splice(stops.length - 1, 0, createStop())
    setStops(newStops)
  }

  const removeStop = (index: number) => {
    if (stops.length <= 2) return
    if (index === 0 || index === stops.length - 1) return
    setStops((prev) => prev.filter((_, i) => i !== index))
  }

  const moveStop = (index: number, direction: "up" | "down") => {
    if (index <= 0 || index >= stops.length - 1) return
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex <= 0 || targetIndex >= stops.length - 1) return
    const newStops = [...stops]
    const temp = newStops[index]
    newStops[index] = newStops[targetIndex]
    newStops[targetIndex] = temp
    setStops(newStops)
  }

  const handleQueryChange = (index: number, value: string) => {
    updateStop(index, { query: value, station: null })
    setActiveStopIndex(index)
    setActiveDropdownIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveDropdownIndex((prev) => Math.min(prev + 1, currentResults.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveDropdownIndex((prev) => Math.max(prev - 1, -1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (activeDropdownIndex >= 0 && currentResults[activeDropdownIndex]) {
        selectStation(index, currentResults[activeDropdownIndex])
      }
    } else if (e.key === "Escape") {
      setActiveStopIndex(null)
    }
  }

  const planTrip = () => {
    setError(null)
    setResults(null)

    const allSelected = stops.every((s) => s.station !== null)
    if (!allSelected) {
      setError(locale === "fr" ? "Veuillez selectionner toutes les stations." : "Please select all stations.")
      return
    }

    const hasDuplicateConsecutive = stops.some(
      (s, i) => i > 0 && s.station?.id === stops[i - 1].station?.id
    )
    if (hasDuplicateConsecutive) {
      setError(
        locale === "fr"
          ? "Deux arrets consecutifs ne peuvent pas etre la meme station."
          : "Two consecutive stops cannot be the same station."
      )
      return
    }

    const legs: (RouteResult | null)[] = []
    for (let i = 0; i < stops.length - 1; i++) {
      const fromStation = stops[i].station!
      const toStation = stops[i + 1].station!
      const route = findRoute(fromStation.id, toStation.id)
      legs.push(route)
    }

    if (legs.some((l) => l === null)) {
      setError(
        locale === "fr"
          ? "Impossible de trouver un trajet pour un ou plusieurs troncons."
          : "Could not find a route for one or more legs."
      )
    }

    setResults(legs)
    setExpandedLegs(new Set(legs.map((_, i) => i)))
  }

  const toggleLeg = (index: number) => {
    setExpandedLegs((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveStopIndex(null)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const validResults = results?.filter((r): r is RouteResult => r !== null) || []
  const totalTime = validResults.reduce((sum, r) => sum + r.totalTime, 0)
  const totalStops = validResults.reduce((sum, r) => sum + r.stops, 0)
  const totalTransfers = validResults.reduce((sum, r) => sum + r.transfers.length, 0)
  const maxFare = validResults.length > 0
    ? Math.max(...validResults.map((r) => r.fare.price))
    : 0

  const getLineDots = (station: Station) =>
    station.lineIds.map((lineId) => (
      <span key={lineId} className={`line-dot line-dot-${lineId}`} aria-label={`${lineId} line`} />
    ))

  const getStopLabel = (index: number): string => {
    if (index === 0) return t.from
    if (index === stops.length - 1) return t.to
    return `${t.stop} ${index}`
  }

  const getStopPlaceholder = (index: number): string => {
    if (index === 0) return locale === "fr" ? "Station de depart..." : "Departure station..."
    if (index === stops.length - 1) return locale === "fr" ? "Station d'arrivee..." : "Arrival station..."
    return locale === "fr" ? `Arret ${index}...` : `Stop ${index}...`
  }

  const inputClass = `w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-[14px] bg-white
    focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]
    placeholder:text-[var(--text-muted)] transition-all`

  return (
    <div ref={containerRef}>
      {/* Stop inputs */}
      <div className="info-card mb-6">
        <div className="info-card-header">
          <h2 className="font-heading font-semibold text-lg tracking-tight">{t.planTrip}</h2>
          <p className="text-[var(--text-muted)] text-[13px] mt-1">{t.planMultiStop}</p>
        </div>
        <div className="info-card-body space-y-3">
          {stops.map((stop, index) => (
            <div key={stop.id} className="flex items-start gap-2">
              {/* Stop indicator */}
              <div className="flex flex-col items-center pt-7 w-5 flex-shrink-0">
                <div
                  className={`w-3 h-3 rounded-full border-2 ${
                    stop.station
                      ? "bg-[var(--accent)] border-[var(--accent)]"
                      : "bg-white border-[var(--border)]"
                  }`}
                />
                {index < stops.length - 1 && (
                  <div className="w-0.5 h-6 bg-[var(--border)] mt-1" />
                )}
              </div>

              {/* Input field */}
              <div className="relative flex-1">
                <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  {getStopLabel(index)}
                </label>
                <input
                  type="text"
                  value={stop.query}
                  onChange={(e) => handleQueryChange(index, e.target.value)}
                  onFocus={() => {
                    setActiveStopIndex(index)
                    setActiveDropdownIndex(-1)
                  }}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  placeholder={getStopPlaceholder(index)}
                  className={inputClass}
                  autoComplete="off"
                />
                {activeStopIndex === index && currentResults.length > 0 && (
                  <div className="search-dropdown">
                    {currentResults.map((station, i) => (
                      <div
                        key={station.id}
                        className={`search-item ${i === activeDropdownIndex ? "active" : ""}`}
                        onClick={() => selectStation(index, station)}
                      >
                        <div className="flex items-center gap-1">{getLineDots(station)}</div>
                        <span className="text-[14px] font-medium">{station.name}</span>
                        <span className="text-[11px] text-[var(--text-muted)] ml-auto uppercase tracking-wide">
                          {station.network}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Move/Remove buttons for intermediate stops */}
              {index > 0 && index < stops.length - 1 && (
                <div className="flex flex-col gap-0.5 pt-6">
                  <button
                    onClick={() => moveStop(index, "up")}
                    disabled={index <= 1}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-inset)] rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title={locale === "fr" ? "Monter" : "Move up"}
                    type="button"
                  >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 4L4 10M10 4L16 10M10 4V16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveStop(index, "down")}
                    disabled={index >= stops.length - 2}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-inset)] rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title={locale === "fr" ? "Descendre" : "Move down"}
                    type="button"
                  >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 16L4 10M10 16L16 10M10 16V4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeStop(index)}
                    className="p-1 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title={t.removeStop}
                    type="button"
                  >
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 10H16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add stop + Plan buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            {stops.length < 5 && (
              <button
                onClick={addStop}
                className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-[var(--text-secondary)] border border-[var(--border)] hover:border-[#bbb] hover:bg-[var(--surface-inset)] rounded-lg transition-colors"
                type="button"
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 4V16M4 10H16" />
                </svg>
                {t.addStop}
              </button>
            )}
            <button
              onClick={planTrip}
              disabled={stops.some((s) => !s.station)}
              className="px-6 py-2 bg-[var(--accent)] text-white text-[14px] font-medium rounded-lg
                hover:bg-[#0055AA] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed
                transition-all ml-auto"
              type="button"
            >
              {t.planTrip}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[14px]">
          {error}
        </div>
      )}

      {/* Results */}
      {results && results.length > 0 && (
        <div className="space-y-6">
          {/* Summary stats */}
          <div className="info-card">
            <div className="info-card-header">
              <h2 className="font-heading font-semibold text-lg tracking-tight">{t.totalTrip}</h2>
            </div>
            <div className="info-card-body">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="stat-card">
                  <div className="text-[11px] font-semibold tracking-widest text-[var(--text-muted)] uppercase mb-2">
                    {t.minutes}
                  </div>
                  <div className="font-heading text-3xl font-bold tracking-tight">{totalTime}</div>
                </div>
                <div className="stat-card">
                  <div className="text-[11px] font-semibold tracking-widest text-[var(--text-muted)] uppercase mb-2">
                    {t.stops}
                  </div>
                  <div className="font-heading text-3xl font-bold tracking-tight">{totalStops}</div>
                </div>
                <div className="stat-card">
                  <div className="text-[11px] font-semibold tracking-widest text-[var(--text-muted)] uppercase mb-2">
                    {t.transfers}
                  </div>
                  <div className="font-heading text-3xl font-bold tracking-tight">{totalTransfers}</div>
                </div>
                <div className="stat-card">
                  <div className="text-[11px] font-semibold tracking-widest text-[var(--text-muted)] uppercase mb-2">
                    {t.fare}
                  </div>
                  <div className="font-heading text-3xl font-bold tracking-tight">
                    ${maxFare.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Individual legs */}
          {results.map((route, index) => (
            <div key={index} className="info-card">
              <button
                onClick={() => toggleLeg(index)}
                className="info-card-header w-full text-left flex items-center justify-between cursor-pointer hover:bg-[var(--surface-inset)] transition-colors"
                type="button"
              >
                <div>
                  <h3 className="font-heading font-semibold text-[15px] tracking-tight">
                    {t.leg} {index + 1}: {stops[index].station?.name} {"\u2192"} {stops[index + 1].station?.name}
                  </h3>
                  {route && (
                    <p className="text-[var(--text-muted)] text-[13px] mt-0.5">
                      {route.totalTime} {t.minutes.toLowerCase()} · {route.stops} {t.stops.toLowerCase()} · {route.transfers.length} {t.transfers.toLowerCase()}
                    </p>
                  )}
                </div>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`text-[var(--text-muted)] transition-transform ${expandedLegs.has(index) ? "rotate-180" : ""}`}
                >
                  <path d="M4 7L10 13L16 7" />
                </svg>
              </button>
              {expandedLegs.has(index) && (
                <div className="info-card-body">
                  {route ? (
                    <RouteDiagram route={route} locale={locale} />
                  ) : (
                    <p className="text-red-600 text-[14px] py-3">
                      {locale === "fr"
                        ? "Aucun trajet trouve pour ce troncon."
                        : "No route found for this leg."}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
