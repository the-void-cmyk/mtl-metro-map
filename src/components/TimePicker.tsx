"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { Locale } from "@/lib/i18n"
import { getTranslations } from "@/lib/i18n"

export interface TimeSelection {
  mode: "depart" | "arrive"
  time: string // HH:MM format
  day: "today" | "tomorrow"
}

interface TimePickerProps {
  locale: Locale
  onChange: (selection: TimeSelection) => void
}

function getCurrentTime(): string {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, "0")
  const m = String(now.getMinutes()).padStart(2, "0")
  return `${h}:${m}`
}

export default function TimePicker({ locale, onChange }: TimePickerProps) {
  const t = getTranslations(locale)
  const [mode, setMode] = useState<"depart" | "arrive">("depart")
  const [time, setTime] = useState(() => {
    if (typeof window === "undefined") return "12:00"
    return getCurrentTime()
  })
  const [day, setDay] = useState<"today" | "tomorrow">("today")

  // Notify parent of changes via callback on user interaction
  const notify = useCallback(() => {
    onChange({ mode, time, day })
  }, [onChange, mode, time, day])

  // Call notify when values change (triggered by user interaction)
  const prevValues = useRef(`${mode}|${time}|${day}`)
  useEffect(() => {
    const key = `${mode}|${time}|${day}`
    if (key !== prevValues.current) {
      prevValues.current = key
      notify()
    }
  })

  return (
    <div className="flex flex-col gap-2 mt-3">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Depart / Arrive toggle */}
        <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-[13px]">
          <button
            type="button"
            onClick={() => setMode("depart")}
            className={`px-3 py-1.5 font-medium transition-colors ${
              mode === "depart"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--surface-inset)]"
            }`}
          >
            {t.departAt}
          </button>
          <button
            type="button"
            onClick={() => setMode("arrive")}
            className={`px-3 py-1.5 font-medium transition-colors ${
              mode === "arrive"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--surface-inset)]"
            }`}
          >
            {t.arriveBy}
          </button>
        </div>

        {/* Time input */}
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="px-3 py-1.5 border border-[var(--border)] rounded-lg text-[16px] sm:text-[14px] bg-[var(--surface-elevated)]
            focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]
            transition-all tabular-nums font-medium"
        />

        {/* Day toggle */}
        <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-[13px]">
          <button
            type="button"
            onClick={() => setDay("today")}
            className={`px-3 py-1.5 font-medium transition-colors ${
              day === "today"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--surface-inset)]"
            }`}
          >
            {t.today}
          </button>
          <button
            type="button"
            onClick={() => setDay("tomorrow")}
            className={`px-3 py-1.5 font-medium transition-colors ${
              day === "tomorrow"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:bg-[var(--surface-inset)]"
            }`}
          >
            {t.tomorrow}
          </button>
        </div>
      </div>
    </div>
  )
}
