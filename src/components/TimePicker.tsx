"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { Locale } from "@/lib/i18n"
import { getTranslations } from "@/lib/i18n"

export interface TimeSelection {
  mode: "depart" | "arrive"
  time: string
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

  const notify = useCallback(() => {
    onChange({ mode, time, day })
  }, [onChange, mode, time, day])

  const prevValues = useRef(`${mode}|${time}|${day}`)
  useEffect(() => {
    const key = `${mode}|${time}|${day}`
    if (key !== prevValues.current) {
      prevValues.current = key
      notify()
    }
  })

  const activeClass = "bg-black text-white"
  const inactiveClass = "bg-white text-black/50 hover:bg-black/5"

  return (
    <div className="flex flex-col gap-2 mt-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex rounded-lg border border-black/15 overflow-hidden text-[13px]">
          <button
            type="button"
            onClick={() => setMode("depart")}
            className={`px-3 py-1.5 font-medium transition-colors ${mode === "depart" ? activeClass : inactiveClass}`}
          >
            {t.departAt}
          </button>
          <button
            type="button"
            onClick={() => setMode("arrive")}
            className={`px-3 py-1.5 font-medium transition-colors ${mode === "arrive" ? activeClass : inactiveClass}`}
          >
            {t.arriveBy}
          </button>
        </div>

        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="px-3 py-1.5 border border-black/15 rounded-lg text-[16px] sm:text-[14px] text-black
            bg-white
            focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black/30
            transition-all tabular-nums font-medium"
        />

        <div className="flex rounded-lg border border-black/15 overflow-hidden text-[13px]">
          <button
            type="button"
            onClick={() => setDay("today")}
            className={`px-3 py-1.5 font-medium transition-colors ${day === "today" ? activeClass : inactiveClass}`}
          >
            {t.today}
          </button>
          <button
            type="button"
            onClick={() => setDay("tomorrow")}
            className={`px-3 py-1.5 font-medium transition-colors ${day === "tomorrow" ? activeClass : inactiveClass}`}
          >
            {t.tomorrow}
          </button>
        </div>
      </div>
    </div>
  )
}
