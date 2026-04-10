"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import type { Station } from "@/lib/types"
import type { Locale } from "@/lib/i18n"
import { getTranslations, getStationName } from "@/lib/i18n"

interface CostCalculatorProps {
  stations: Station[]
  locale: Locale
}

interface FareResult {
  zones: string[]
  zoneKey: string
  singleTrip: number
  monthlyPass: number
  ticketType: string
}

const DAYS_OPTIONS = [3, 4, 5, 6, 7]
const AVG_WEEKS_PER_MONTH = 4.33

export default function CostCalculator({ stations, locale }: CostCalculatorProps) {
  const t = getTranslations(locale)

  const [homeQuery, setHomeQuery] = useState("")
  const [workQuery, setWorkQuery] = useState("")
  const [homeStation, setHomeStation] = useState<Station | null>(null)
  const [workStation, setWorkStation] = useState<Station | null>(null)
  const [activeField, setActiveField] = useState<"home" | "work" | null>(null)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [daysPerWeek, setDaysPerWeek] = useState(5)
  const [fareResult, setFareResult] = useState<FareResult | null>(null)
  const [loading, setLoading] = useState(false)

  const homeRef = useRef<HTMLInputElement>(null)
  const workRef = useRef<HTMLInputElement>(null)
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

  const results = activeField === "home" ? searchStations(homeQuery) : searchStations(workQuery)

  const selectStation = (station: Station, field: "home" | "work") => {
    const displayName = getStationName(station, locale)
    if (field === "home") {
      setHomeStation(station)
      setHomeQuery(displayName)
      setActiveField(null)
      setTimeout(() => workRef.current?.focus(), 50)
      if (workStation) fetchFare(station, workStation)
    } else {
      setWorkStation(station)
      setWorkQuery(displayName)
      setActiveField(null)
      if (homeStation) fetchFare(homeStation, station)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, field: "home" | "work") => {
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
      }
    } else if (e.key === "Escape") {
      setActiveField(null)
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveField(null)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Fetch fare when both stations are selected
  const fetchFare = useCallback(async (home: Station, work: Station) => {
    if (home.id === work.id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/fare-calc?from=${home.slug}&to=${work.slug}`)
      if (!res.ok) throw new Error("Failed to fetch fare")
      const data: FareResult = await res.json()
      setFareResult(data)
    } catch {
      setFareResult(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const getLineDots = (station: Station) =>
    station.lineIds.map((lineId) => (
      <span key={lineId} className={`line-dot line-dot-${lineId}`} aria-label={`${lineId} line`} />
    ))

  // Cost calculations
  const tripsPerMonth = daysPerWeek * 2 * AVG_WEEKS_PER_MONTH
  const payPerRideCost = fareResult ? fareResult.singleTrip * tripsPerMonth : 0
  const monthlyPassCost = fareResult ? fareResult.monthlyPass : 0
  const savingsAmount = payPerRideCost - monthlyPassCost
  const passIsCheaper = savingsAmount > 0
  const breakEvenTrips = fareResult
    ? Math.ceil(fareResult.monthlyPass / fareResult.singleTrip)
    : 0

  const inputClass = `w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-[14px] bg-white
    focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]
    placeholder:text-[var(--text-muted)] transition-all`

  return (
    <div ref={dropdownRef} className="space-y-6">
      {/* Station inputs */}
      <div className="info-card">
        <div className="info-card-header">
          {locale === 'fr' ? 'Votre trajet' : 'Your Commute'}
        </div>
        <div className="info-card-body space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Home station */}
            <div className="relative">
              <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                {t.homeStation}
              </label>
              <input
                ref={homeRef}
                type="text"
                value={homeQuery}
                onChange={(e) => {
                  setHomeQuery(e.target.value)
                  setHomeStation(null)
                  setActiveField("home")
                  setActiveIndex(-1)
                }}
                onFocus={() => setActiveField("home")}
                onKeyDown={(e) => handleKeyDown(e, "home")}
                placeholder={locale === 'fr' ? 'Ex: Berri-UQAM' : 'e.g. Berri-UQAM'}
                className={inputClass}
                autoComplete="off"
              />
              {activeField === "home" && results.length > 0 && (
                <div className="search-dropdown">
                  {results.map((station, i) => (
                    <div
                      key={station.id}
                      className={`search-item ${i === activeIndex ? "active" : ""}`}
                      onClick={() => selectStation(station, "home")}
                    >
                      <div className="flex items-center gap-1">{getLineDots(station)}</div>
                      <span className="text-[14px] font-medium">{getStationName(station, locale)}</span>
                      <span className="text-[11px] text-[var(--text-muted)] ml-auto uppercase tracking-wide">
                        {station.network}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Work station */}
            <div className="relative">
              <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                {t.workStation}
              </label>
              <input
                ref={workRef}
                type="text"
                value={workQuery}
                onChange={(e) => {
                  setWorkQuery(e.target.value)
                  setWorkStation(null)
                  setActiveField("work")
                  setActiveIndex(-1)
                }}
                onFocus={() => setActiveField("work")}
                onKeyDown={(e) => handleKeyDown(e, "work")}
                placeholder={locale === 'fr' ? 'Ex: Guy-Concordia' : 'e.g. Guy-Concordia'}
                className={inputClass}
                autoComplete="off"
              />
              {activeField === "work" && results.length > 0 && (
                <div className="search-dropdown">
                  {results.map((station, i) => (
                    <div
                      key={station.id}
                      className={`search-item ${i === activeIndex ? "active" : ""}`}
                      onClick={() => selectStation(station, "work")}
                    >
                      <div className="flex items-center gap-1">{getLineDots(station)}</div>
                      <span className="text-[14px] font-medium">{getStationName(station, locale)}</span>
                      <span className="text-[11px] text-[var(--text-muted)] ml-auto uppercase tracking-wide">
                        {station.network}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Days per week */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
              {t.tripsPerWeek}
            </label>
            <div className="flex gap-1.5">
              {DAYS_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDaysPerWeek(d)}
                  className={`flex-1 py-2 text-[14px] font-medium rounded-lg border transition-all ${
                    daysPerWeek === d
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "bg-white text-[var(--text-secondary)] border-[var(--border)] hover:border-[#bbb]"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="text-center py-8 text-[var(--text-muted)] text-[14px]">
          {locale === 'fr' ? 'Calcul en cours...' : 'Calculating...'}
        </div>
      )}

      {!fareResult && !loading && (
        <div className="info-card">
          <div className="info-card-body text-center py-8">
            <p className="text-[var(--text-muted)] text-[14px]">
              {t.selectBothStations}
            </p>
          </div>
        </div>
      )}

      {fareResult && !loading && (
        <>
          {/* Zone info */}
          <div className="flex items-center justify-center gap-2 text-[13px] text-[var(--text-secondary)]">
            <span className="font-medium">{t.fareZone}:</span>
            <span className="px-2 py-0.5 bg-[var(--surface-inset)] rounded font-heading font-semibold">
              {fareResult.zoneKey}
            </span>
            <span className="text-[var(--text-muted)]">
              {Math.round(tripsPerMonth)} {t.tripsPerMonth}
            </span>
          </div>

          {/* Comparison cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pay per ride */}
            <div className={`stat-card ${!passIsCheaper ? 'stat-card-green' : 'stat-card-blue'}`}>
              <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                {t.payPerRide}
              </p>
              <p className="font-heading text-[28px] sm:text-[32px] font-bold tracking-tight tabular-nums">
                ${payPerRideCost.toFixed(2)}
              </p>
              <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{t.perMonth}</p>
              <p className="text-[12px] text-[var(--text-muted)] mt-2">
                ${fareResult.singleTrip.toFixed(2)} x {Math.round(tripsPerMonth)} {locale === 'fr' ? 'trajets' : 'trips'}
              </p>
              {!passIsCheaper && (
                <span className="inline-block mt-3 px-2.5 py-1 bg-[#e8f5e9] text-[#2e7d32] text-[11px] font-semibold uppercase tracking-wide rounded-full">
                  {t.cheaperOption}
                </span>
              )}
            </div>

            {/* Monthly pass */}
            <div className={`stat-card ${passIsCheaper ? 'stat-card-green' : 'stat-card-blue'}`}>
              <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">
                {t.monthlyPass}
              </p>
              <p className="font-heading text-[28px] sm:text-[32px] font-bold tracking-tight tabular-nums">
                ${monthlyPassCost.toFixed(2)}
              </p>
              <p className="text-[13px] text-[var(--text-muted)] mt-0.5">{t.perMonth}</p>
              <p className="text-[12px] text-[var(--text-muted)] mt-2">
                Zone {fareResult.zoneKey}
              </p>
              {passIsCheaper && (
                <span className="inline-block mt-3 px-2.5 py-1 bg-[#e8f5e9] text-[#2e7d32] text-[11px] font-semibold uppercase tracking-wide rounded-full">
                  {t.cheaperOption}
                </span>
              )}
            </div>
          </div>

          {/* Savings summary */}
          <div className="info-card">
            <div className="info-card-body space-y-3">
              {savingsAmount !== 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-medium">
                    {t.savings}
                  </span>
                  <span className={`font-heading font-bold text-[18px] tabular-nums ${
                    savingsAmount > 0 ? 'text-[#2e7d32]' : 'text-[#c62828]'
                  }`}>
                    ${Math.abs(savingsAmount).toFixed(2)}{t.perMonth}
                  </span>
                </div>
              )}
              <div className="h-px bg-[var(--border)]" />
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                {t.breakEven(breakEvenTrips)}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
