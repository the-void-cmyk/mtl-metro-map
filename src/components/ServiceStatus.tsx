"use client"

import { useState, useEffect, useCallback } from "react"
import type { Locale } from "@/lib/i18n"

interface LineStatus {
  lineId: string
  name: string
  nameFr: string
  color: string
  network: string
  status: "normal" | "delayed" | "interrupted" | "planned"
  message: string | null
  messageFr: string | null
  updatedAt: string | null
}

interface StatusData {
  lines: LineStatus[]
  lastChecked: string
}

const STATUS_CONFIG = {
  normal: { label: "Normal Service", labelFr: "Service normal", icon: "check", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  delayed: { label: "Delays", labelFr: "Retards", icon: "clock", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  interrupted: { label: "Interrupted", labelFr: "Interrompu", icon: "x", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
  planned: { label: "Planned Work", labelFr: "Travaux", icon: "info", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
}

function StatusIcon({ status }: { status: string }) {
  if (status === "normal") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    )
  }
  if (status === "delayed") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" strokeLinecap="round" />
      </svg>
    )
  }
  if (status === "interrupted") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    )
  }
  // planned
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
    </svg>
  )
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

export default function ServiceStatus({ locale }: { locale: Locale }) {
  const [data, setData] = useState<StatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const isFr = locale === "fr"

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/status")
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch {
      // silently fail, keep last data
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 60000) // refresh every 60s
    return () => clearInterval(interval)
  }, [fetchStatus])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="info-card animate-pulse">
            <div className="p-4 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[var(--surface-inset)]" />
              <div className="h-4 bg-[var(--surface-inset)] rounded w-32" />
              <div className="ml-auto h-4 bg-[var(--surface-inset)] rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!data) return null

  const metro = data.lines.filter((l) => l.network === "metro")
  const rem = data.lines.filter((l) => l.network === "rem")
  const exo = data.lines.filter((l) => l.network === "exo")

  const allNormal = data.lines.every((l) => l.status === "normal")
  const issueCount = data.lines.filter((l) => l.status !== "normal").length

  return (
    <div className="space-y-6">
      {/* Overall status banner */}
      <div className={`rounded-xl border p-4 flex items-center gap-3 ${allNormal ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${allNormal ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
          {allNormal ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <div>
          <p className={`font-heading font-semibold text-[15px] ${allNormal ? "text-emerald-800" : "text-amber-800"}`}>
            {allNormal
              ? (isFr ? "Tous les services sont normaux" : "All Services Running Normally")
              : (isFr ? `${issueCount} ligne(s) affectee(s)` : `${issueCount} line(s) affected`)}
          </p>
          <p className={`text-[12px] mt-0.5 ${allNormal ? "text-emerald-600" : "text-amber-600"}`}>
            {isFr ? "Derniere verification" : "Last checked"}: {formatTime(data.lastChecked, locale)}
          </p>
        </div>
      </div>

      {/* Metro */}
      <StatusGroup
        title={isFr ? "Metro STM" : "STM Metro"}
        lines={metro}
        locale={locale}
        isFr={isFr}
      />

      {/* REM */}
      <StatusGroup
        title="REM"
        lines={rem}
        locale={locale}
        isFr={isFr}
      />

      {/* Exo */}
      <StatusGroup
        title={isFr ? "Trains de banlieue Exo" : "Exo Commuter Trains"}
        lines={exo}
        locale={locale}
        isFr={isFr}
      />

      {/* Sources */}
      <div className="text-[12px] text-[var(--text-muted)] space-y-1">
        <p>{isFr ? "Sources officielles :" : "Official sources:"}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <a href="https://www.stm.info/en/info/service-status" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-secondary)] underline">STM</a>
          <a href="https://rem.info/en/travelling/network-status" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-secondary)] underline">REM</a>
          <a href="https://exo.quebec/en/service-status/train" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-secondary)] underline">Exo</a>
        </div>
      </div>
    </div>
  )
}

function StatusGroup({
  title,
  lines,
  locale,
  isFr,
}: {
  title: string
  lines: LineStatus[]
  locale: string
  isFr: boolean
}) {
  return (
    <div>
      <h2 className="font-heading text-lg font-semibold tracking-tight mb-3">{title}</h2>
      <div className="space-y-2">
        {lines.map((line) => {
          const cfg = STATUS_CONFIG[line.status]
          const msg = isFr ? line.messageFr : line.message
          return (
            <div key={line.lineId} className={`info-card border ${line.status !== "normal" ? cfg.border : ""}`}>
              <div className="p-4 flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: line.color }}
                  aria-label={isFr ? line.nameFr : line.name}
                />
                <span className="text-[14px] font-medium flex-1 min-w-0 truncate">
                  {isFr ? line.nameFr : line.name}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium ${cfg.bg} ${cfg.text}`}>
                  <StatusIcon status={line.status} />
                  {isFr ? cfg.labelFr : cfg.label}
                </span>
              </div>
              {msg && (
                <div className={`px-4 pb-3 text-[13px] ${cfg.text} leading-relaxed`}>
                  {msg}
                </div>
              )}
              {line.updatedAt && (
                <div className="px-4 pb-3 text-[11px] text-[var(--text-muted)]">
                  {isFr ? "Mis a jour" : "Updated"}: {formatTime(line.updatedAt, locale)}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
