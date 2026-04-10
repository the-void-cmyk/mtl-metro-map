"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { Station } from "@/lib/types"
import type { Locale } from "@/lib/i18n"
import TimePicker, { type TimeSelection } from "@/components/TimePicker"

interface SearchBarProps {
  stations: Station[]
  compact?: boolean
  locale?: Locale
  defaultTo?: Station
}

export default function SearchBar({ stations, compact = false, locale = 'en', defaultTo }: SearchBarProps) {
  const router = useRouter()
  const [fromQuery, setFromQuery] = useState("")
  const [toQuery, setToQuery] = useState(defaultTo ? defaultTo.name : "")
  const [fromStation, setFromStation] = useState<Station | null>(null)
  const [toStation, setToStation] = useState<Station | null>(defaultTo ?? null)
  const [activeField, setActiveField] = useState<"from" | "to" | null>(null)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [timeSelection, setTimeSelection] = useState<TimeSelection | null>(null)
  const fromRef = useRef<HTMLInputElement>(null)
  const toRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  const results = activeField === "from" ? searchStations(fromQuery) : searchStations(toQuery)

  const selectStation = (station: Station, field: "from" | "to") => {
    if (field === "from") {
      setFromStation(station)
      setFromQuery(station.name)
      setActiveField(null)
      setTimeout(() => toRef.current?.focus(), 50)
    } else {
      setToStation(station)
      setToQuery(station.name)
      setActiveField(null)
    }
  }

  const handleTimeChange = useCallback((selection: TimeSelection) => {
    setTimeSelection(selection)
  }, [])

  const handleSubmit = () => {
    if (fromStation && toStation && fromStation.id !== toStation.id) {
      let url = `/${locale}/route/${fromStation.slug}-to-${toStation.slug}`
      if (timeSelection) {
        const param = timeSelection.mode === "depart" ? "depart" : "arrive"
        const dayPrefix = timeSelection.day === "tomorrow" ? "tomorrow-" : ""
        url += `?${param}=${dayPrefix}${timeSelection.time}`
      }
      router.push(url)
    }
  }

  const swapStations = () => {
    const tempStation = fromStation
    const tempQuery = fromQuery
    setFromStation(toStation)
    setFromQuery(toQuery)
    setToStation(tempStation)
    setToQuery(tempQuery)
  }

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromQuery(e.target.value)
    setFromStation(null)
    setActiveField("from")
    setActiveIndex(-1)
  }

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToQuery(e.target.value)
    setToStation(null)
    setActiveField("to")
    setActiveIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent, field: "from" | "to") => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prev) => Math.max(prev - 1, -1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (activeIndex >= 0 && results[activeIndex]) {
        selectStation(results[activeIndex], field)
      } else if (fromStation && toStation) {
        handleSubmit()
      }
    } else if (e.key === "Escape") {
      setActiveField(null)
    }
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveField(null)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const getLineDots = (station: Station) =>
    station.lineIds.map((lineId) => (
      <span key={lineId} className={`line-dot line-dot-${lineId}`} aria-label={`${lineId} line`} />
    ))

  const labels = locale === 'fr'
    ? { from: 'De', to: 'A', dep: 'Station de depart...', arr: "Station d'arrivee...", find: 'Trouver un trajet', swap: 'Inverser' }
    : { from: 'From', to: 'To', dep: 'Departure station...', arr: 'Arrival station...', find: 'Find Route', swap: 'Swap stations' }

  const inputClass = `w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-[16px] sm:text-[14px] bg-[var(--surface-elevated)]
    focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]
    placeholder:text-[var(--text-muted)] transition-all`

  return (
    <div ref={dropdownRef}>
      <div className={`flex ${compact ? "flex-col gap-2" : "flex-col gap-2 sm:flex-row sm:gap-3"} items-stretch`}>
        {/* From */}
        <div className="relative flex-1">
          <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">{labels.from}</label>
          <input
            ref={fromRef}
            type="text"
            value={fromQuery}
            onChange={handleFromChange}
            onFocus={() => setActiveField("from")}
            onKeyDown={(e) => handleKeyDown(e, "from")}
            placeholder={labels.dep}
            className={inputClass}
            autoComplete="off"
          />
          {activeField === "from" && results.length > 0 && (
            <div className="search-dropdown">
              {results.map((station, i) => (
                <div
                  key={station.id}
                  className={`search-item ${i === activeIndex ? "active" : ""}`}
                  onClick={() => selectStation(station, "from")}
                >
                  <div className="flex items-center gap-1">{getLineDots(station)}</div>
                  <span className="text-[14px] font-medium">{station.name}</span>
                  <span className="text-[11px] text-[var(--text-muted)] ml-auto uppercase tracking-wide">{station.network}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Swap */}
        {!compact && (
          <div className="hidden sm:flex items-end pb-0.5">
            <button
              onClick={swapStations}
              className="p-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-inset)] rounded-lg transition-colors"
              title={labels.swap}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 3L3 7L7 11" />
                <path d="M3 7H17" />
                <path d="M13 9L17 13L13 17" />
                <path d="M17 13H3" />
              </svg>
            </button>
          </div>
        )}

        {/* To */}
        <div className="relative flex-1">
          <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">{labels.to}</label>
          <input
            ref={toRef}
            type="text"
            value={toQuery}
            onChange={handleToChange}
            onFocus={() => setActiveField("to")}
            onKeyDown={(e) => handleKeyDown(e, "to")}
            placeholder={labels.arr}
            className={inputClass}
            autoComplete="off"
          />
          {activeField === "to" && results.length > 0 && (
            <div className="search-dropdown">
              {results.map((station, i) => (
                <div
                  key={station.id}
                  className={`search-item ${i === activeIndex ? "active" : ""}`}
                  onClick={() => selectStation(station, "to")}
                >
                  <div className="flex items-center gap-1">{getLineDots(station)}</div>
                  <span className="text-[14px] font-medium">{station.name}</span>
                  <span className="text-[11px] text-[var(--text-muted)] ml-auto uppercase tracking-wide">{station.network}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit - desktop inline */}
        <div className="hidden sm:flex items-end">
          <button
            onClick={handleSubmit}
            disabled={!fromStation || !toStation || fromStation.id === toStation.id}
            className={`${compact ? "w-full" : "w-full sm:w-auto"} px-6 py-2.5 bg-[var(--accent)] text-white text-[16px] sm:text-[14px] font-medium rounded-lg
              hover:bg-[#0055AA] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed
              transition-all`}
          >
            {labels.find}
          </button>
        </div>
      </div>

      <TimePicker locale={locale} onChange={handleTimeChange} />

      {/* Submit - mobile last CTA */}
      <div className="sm:hidden mt-3">
        <button
          onClick={handleSubmit}
          disabled={!fromStation || !toStation || fromStation.id === toStation.id}
          className="w-full px-6 py-3 bg-[var(--accent)] text-white text-[16px] font-semibold rounded-lg
            hover:bg-[#0055AA] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed
            transition-all"
        >
          {labels.find}
        </button>
      </div>
    </div>
  )
}
