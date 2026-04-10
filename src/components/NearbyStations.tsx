'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Station, Line } from '@/lib/types'
import type { Locale } from '@/lib/i18n'
import { getTranslations, getStationName } from '@/lib/i18n'

interface NearbyStationsProps {
  stations: Station[]
  lines: Line[]
  locale: Locale
}

interface NearbyStation {
  station: Station
  distance: number // meters
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000 // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function NearbyStations({ stations, lines, locale }: NearbyStationsProps) {
  const t = getTranslations(locale)
  const [nearby, setNearby] = useState<NearbyStation[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  void lines // used for prop interface, line dots rendered via CSS classes

  const findNearby = () => {
    if (!navigator.geolocation) {
      setError(t.locationError)
      return
    }

    setLoading(true)
    setError(null)
    setNearby(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const withDistance = stations.map((station) => ({
          station,
          distance: haversineDistance(latitude, longitude, station.lat, station.lng),
        }))
        withDistance.sort((a, b) => a.distance - b.distance)
        setNearby(withDistance.slice(0, 5))
        setLoading(false)
      },
      () => {
        setError(t.locationError)
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">{t.nearbyStations}</h2>
      </div>

      {!nearby && !loading && !error && (
        <div className="text-center">
          <button
            onClick={findNearby}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white text-[14px] font-medium rounded-lg hover:bg-[#D96F1A] active:scale-[0.98] transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {t.findNearby}
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3 text-[var(--text-muted)] text-[15px]">
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            {t.locating}
          </div>
        </div>
      )}

      {error && (
        <div className="text-center py-6">
          <p className="text-red-500 text-[14px] mb-4">{error}</p>
          <button
            onClick={findNearby}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-white text-[14px] font-medium rounded-lg hover:bg-[#D96F1A] active:scale-[0.98] transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {t.findNearby}
          </button>
        </div>
      )}

      {nearby && (
        <div className="grid gap-3">
          {nearby.map(({ station, distance }) => {
            const stationName = getStationName(station, locale)
            const distanceText = distance < 1000
              ? t.metersAway(Math.round(distance))
              : t.kmAway((distance / 1000).toFixed(1))

            return (
              <div key={station.id} className="info-card">
                <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex items-center gap-1">
                        {station.lineIds.map((lineId) => (
                          <span key={lineId} className={`line-dot line-dot-${lineId}`} />
                        ))}
                      </div>
                      <Link
                        href={`/${locale}/station/${station.slug}`}
                        className="font-heading font-semibold text-[15px] tracking-tight hover:text-[var(--accent)] transition-colors truncate"
                      >
                        {stationName}
                      </Link>
                    </div>
                    <div className="flex items-center gap-3 text-[13px] text-[var(--text-muted)]">
                      <span>{distanceText}</span>
                      <span className="uppercase tracking-wide text-[11px]">{station.network}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:flex-shrink-0">
                    <Link
                      href={`/${locale}/station/${station.slug}`}
                      className="px-3 py-1.5 text-[13px] font-medium rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-inset)] transition-colors"
                    >
                      {t.station}
                    </Link>
                    <Link
                      href={`/${locale}/route/${station.slug}-to-`}
                      className="px-3 py-1.5 text-[13px] font-medium rounded-md bg-[var(--accent)] text-white hover:bg-[#D96F1A] transition-colors"
                    >
                      {t.routeFromHere}
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}

          <div className="text-center mt-2">
            <button
              onClick={findNearby}
              className="text-[13px] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            >
              {t.findNearby}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
