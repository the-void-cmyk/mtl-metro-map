"use client"

import { useSearchParams } from "next/navigation"
import { getTranslations } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"

interface RouteTimePlanProps {
  locale: Locale
  totalTime: number
  firstTrain: string
  lastTrain: string
  variant: "banner" | "details"
}

function addMinutes(timeStr: string, mins: number): string {
  const [h, m] = timeStr.split(":").map(Number)
  const totalMinutes = h * 60 + m + mins
  const newH = Math.floor(totalMinutes / 60) % 24
  const newM = totalMinutes % 60
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`
}

function subtractMinutes(timeStr: string, mins: number): string {
  const [h, m] = timeStr.split(":").map(Number)
  let totalMinutes = h * 60 + m - mins
  if (totalMinutes < 0) totalMinutes += 24 * 60
  const newH = Math.floor(totalMinutes / 60) % 24
  const newM = totalMinutes % 60
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`
}

function formatTime12h(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number)
  const period = h >= 12 ? "PM" : "AM"
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${String(m).padStart(2, "0")} ${period}`
}

function parseTimeParam(value: string): string {
  // Strip "tomorrow-" prefix if present, we only need the HH:MM
  return value.replace("tomorrow-", "")
}

function isOutsideServiceHours(time: string, firstTrain: string, lastTrain: string): boolean {
  const [th, tm] = time.split(":").map(Number)
  const [fh, fm] = firstTrain.split(":").map(Number)
  const [lh, lm] = lastTrain.split(":").map(Number)
  const tMin = th * 60 + tm
  const fMin = fh * 60 + fm
  const lMin = lh * 60 + lm

  // Handle overnight service (e.g., first 05:30, last 01:00)
  if (lMin < fMin) {
    // Service wraps past midnight: valid from firstTrain to midnight and midnight to lastTrain
    return tMin > lMin && tMin < fMin
  }
  return tMin < fMin || tMin > lMin
}

/**
 * The ?depart= / ?arrive= time planning blocks.
 *
 * Read on the client rather than from the page's searchParams: awaiting
 * searchParams in the server component opted the whole route out of
 * prerendering, so every crawler hit on the ~9,000 route pages was a cold
 * function render at 0% cache. Only visitors arriving from the trip planner
 * carry these params, so client rendering them costs nothing in practice.
 */
export default function RouteTimePlan({ locale, totalTime, firstTrain, lastTrain, variant }: RouteTimePlanProps) {
  const searchParams = useSearchParams()
  const t = getTranslations(locale)

  const departParam = searchParams.get("depart")
  const arriveParam = searchParams.get("arrive")

  let departTime: string | null = null
  let arriveTime: string | null = null
  let serviceWarning = false

  if (departParam) {
    departTime = parseTimeParam(departParam)
    arriveTime = addMinutes(departTime, totalTime)
    serviceWarning = isOutsideServiceHours(departTime, firstTrain, lastTrain)
  } else if (arriveParam) {
    arriveTime = parseTimeParam(arriveParam)
    departTime = subtractMinutes(arriveTime, totalTime)
    serviceWarning = isOutsideServiceHours(departTime, firstTrain, lastTrain)
  }

  if (!departTime || !arriveTime) return null

  if (variant === "details") {
    return (
      <>
        <div className="h-px bg-[var(--border)]" />
        <div className="flex justify-between items-center">
          <dt className="text-[var(--text-muted)]">{t.estimatedDeparture}</dt>
          <dd className="font-medium font-heading tabular-nums">{formatTime12h(departTime)}</dd>
        </div>
        <div className="flex justify-between items-center">
          <dt className="text-[var(--text-muted)]">{t.estimatedArrival}</dt>
          <dd className="font-medium font-heading tabular-nums">{formatTime12h(arriveTime)}</dd>
        </div>
      </>
    )
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-inset)] border border-[var(--border)] text-[14px]">
        <span className="text-[var(--text-muted)]">{t.departAt}:</span>
        <span className="font-medium font-heading tabular-nums">{formatTime12h(departTime)}</span>
      </div>
      <span className="text-[var(--text-muted)]">&rarr;</span>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-inset)] border border-[var(--border)] text-[14px]">
        <span className="text-[var(--text-muted)]">{t.estimatedArrival}:</span>
        <span className="font-medium font-heading tabular-nums">{formatTime12h(arriveTime)}</span>
      </div>
      {serviceWarning && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[13px] font-medium">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="shrink-0">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          {t.outsideServiceHours}
        </div>
      )}
    </div>
  )
}
