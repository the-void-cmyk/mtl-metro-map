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

  // Mobile: show all nav items. Desktop: only secondary items.
  const primaryItems = [
    { href: `/${locale}/status`, label: t.navStatus },
    { href: `/${locale}/trip`, label: t.navTrip },
    { href: `/${locale}/map`, label: t.navMap },
    { href: `/${locale}/fares`, label: t.navFares },
  ]

  const secondaryItems = [
    { href: `/${locale}/compare`, label: t.navCompare },
    { href: `/${locale}/calculator`, label: t.navCalculator },
    { href: `/${locale}/destinations`, label: t.navDestinations },
    { href: `/${locale}/accessibility`, label: t.navAccessibility },
    { href: `/${locale}/guide`, label: t.navGuides },
  ]

  const linkClass = "block px-3 py-2.5 text-[11px] font-medium tracking-[0.1em] uppercase text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-inset)] transition-colors"

  return (
    <div ref={ref} className="relative">
      {/* Desktop: text button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="hidden sm:flex px-3.5 py-2 text-[11px] font-medium tracking-[0.1em] uppercase text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-inset)] transition-colors items-center gap-1"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {t.navMore}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Mobile: hamburger icon */}
      <button
        onClick={() => setOpen(v => !v)}
        className="sm:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-inset)] transition-colors"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {open ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-0 w-52 bg-[var(--surface-elevated)] border-2 border-[var(--text-primary)] p-1.5 z-50">
          {/* On mobile: show primary items first */}
          <div className="sm:hidden">
            {primaryItems.map(item => (
              <Link key={item.href} href={item.href} className={linkClass} onClick={close}>
                {item.label}
              </Link>
            ))}
            <div className="border-t border-[var(--border)] my-1" />
          </div>
          {secondaryItems.map(item => (
            <Link key={item.href} href={item.href} className={linkClass} onClick={close}>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
