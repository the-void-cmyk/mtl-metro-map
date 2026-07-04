"use client"

import { useEffect, useState } from "react"
import type { Locale } from "@/lib/i18n"

interface BusStatusData {
  ok: boolean
  routes: Record<string, number>
  lastChecked: string
}

function formatTime(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleTimeString(locale === "fr" ? "fr-CA" : "en-CA", {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return ""
  }
}

export default function BusStatus({ route, locale }: { route: string; locale: Locale }) {
  const [data, setData] = useState<BusStatusData | null>(null)
  const isFr = locale === "fr"

  useEffect(() => {
    let live = true
    const load = () =>
      fetch("/api/bus-status")
        .then((r) => (r.ok ? r.json() : null))
        .then((d: BusStatusData | null) => {
          if (live && d) setData(d)
        })
        .catch(() => {})
    load()
    const id = setInterval(load, 60000)
    return () => {
      live = false
      clearInterval(id)
    }
  }, [])

  // Until we have a live, successful read, show nothing (never fabricate a state).
  if (!data || !data.ok) return null

  const n = data.routes[route] ?? 0
  const normal = n === 0
  const time = formatTime(data.lastChecked, locale)

  return (
    <div className="info-card">
      <div className="info-card-header">{isFr ? "État du service" : "Service status"}</div>
      <div className="info-card-body py-3">
        <div className={`flex items-center gap-2.5 rounded-lg px-3 py-2 ${normal ? "bg-emerald-50" : "bg-amber-50"}`}>
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${normal ? "bg-emerald-500" : "bg-amber-500"}`} />
          <span className={`text-[13px] font-medium ${normal ? "text-emerald-800" : "text-amber-800"}`}>
            {normal
              ? isFr
                ? "Service normal"
                : "Normal service"
              : isFr
                ? `${n} arrêt${n > 1 ? "s" : ""} touché${n > 1 ? "s" : ""}`
                : `${n} stop${n > 1 ? "s" : ""} affected`}
          </span>
        </div>
        {!normal && (
          <p className="text-[12px] text-[var(--text-secondary)] mt-2 leading-relaxed">
            {isFr
              ? "Certains arrêts sont déplacés ou annulés (travaux ou détours). "
              : "Some stops are moved or cancelled (roadwork or detours). "}
            <a
              href="https://www.stm.info/en/info/service-status"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[var(--text-primary)]"
            >
              {isFr ? "Détails sur STM" : "Details on STM"}
            </a>
          </p>
        )}
        {time && <p className="text-[11px] text-[var(--text-muted)] mt-2">{isFr ? "Mis à jour" : "Updated"}: {time}</p>}
      </div>
    </div>
  )
}
