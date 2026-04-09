"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { Station } from "@/lib/types"

interface SearchBarProps {
  stations: Station[]
  compact?: boolean
}

export default function SearchBar({ stations, compact = false }: SearchBarProps) {
  const router = useRouter()
  const [fromQuery, setFromQuery] = useState("")
  const [toQuery, setToQuery] = useState("")
  const [fromStation, setFromStation] = useState<Station | null>(null)
  const [toStation, setToStation] = useState<Station | null>(null)
  const [activeField, setActiveField] = useState<"from" | "to" | null>(null)
  const [activeIndex, setActiveIndex] = useState(-1)
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

  const handleSubmit = () => {
    if (fromStation && toStation && fromStation.id !== toStation.id) {
      router.push(`/route/${fromStation.slug}-to-${toStation.slug}`)
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

  // Reset active index when query changes
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

  const getLineDots = (station: Station) =>
    station.lineIds.map((lineId) => (
      <span
        key={lineId}
        className={`inline-block w-2.5 h-2.5 rounded-full line-dot-${lineId}`}
        title={lineId}
      />
    ))

  return (
    <div ref={dropdownRef} className={compact ? "" : "max-w-xl mx-auto"}>
      <div className={`flex ${compact ? "flex-row gap-2" : "flex-col sm:flex-row gap-3"} items-stretch`}>
        {/* From Field */}
        <div className="relative flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input
            ref={fromRef}
            type="text"
            value={fromQuery}
            onChange={handleFromChange}
            onFocus={() => setActiveField("from")}
            onKeyDown={(e) => handleKeyDown(e, "from")}
            placeholder="Departure station..."
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
                  <div className="flex items-center gap-1.5">{getLineDots(station)}</div>
                  <span className="text-sm">{station.name}</span>
                  <span className="text-xs text-gray-400 ml-auto capitalize">{station.network}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className={`flex items-end ${compact ? "pb-0.5" : "pb-0.5 sm:pb-0"}`}>
          <button
            onClick={swapStations}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            title="Swap stations"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 3L3 7L7 11" />
              <path d="M3 7H17" />
              <path d="M13 9L17 13L13 17" />
              <path d="M17 13H3" />
            </svg>
          </button>
        </div>

        {/* To Field */}
        <div className="relative flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input
            ref={toRef}
            type="text"
            value={toQuery}
            onChange={handleToChange}
            onFocus={() => setActiveField("to")}
            onKeyDown={(e) => handleKeyDown(e, "to")}
            placeholder="Arrival station..."
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
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
                  <div className="flex items-center gap-1.5">{getLineDots(station)}</div>
                  <span className="text-sm">{station.name}</span>
                  <span className="text-xs text-gray-400 ml-auto capitalize">{station.network}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-end">
          <button
            onClick={handleSubmit}
            disabled={!fromStation || !toStation || fromStation.id === toStation.id}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Find Route
          </button>
        </div>
      </div>
    </div>
  )
}
