"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import Link from "next/link"
import type { Locale } from "@/lib/i18n"
import { getTranslations } from "@/lib/i18n"

interface NavMoreProps {
  locale: Locale
}

export default function NavMore({ locale }: NavMoreProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const t = getTranslations(locale)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close()
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close()
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [close])

  const items = [
    { href: `/${locale}/compare`, label: t.navCompare },
    { href: `/${locale}/calculator`, label: t.navCalculator },
    { href: `/${locale}/destinations`, label: t.navDestinations },
    { href: `/${locale}/accessibility`, label: t.navAccessibility },
    { href: `/${locale}/guide`, label: t.navGuides },
  ]

  const linkClass = "block px-3 py-2 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-inset)] rounded-lg transition-colors"

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="px-3.5 py-2 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-inset)] rounded-lg transition-colors flex items-center gap-1"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {t.navMore}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl shadow-lg p-1.5 z-50">
          {items.map(item => (
            <Link key={item.href} href={item.href} className={linkClass} onClick={close}>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
