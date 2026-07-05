"use client"

import type { ReactNode } from "react"

declare global {
  interface Window {
    gtag?: (command: string, event: string, params?: Record<string, unknown>) => void
  }
}

// A sponsored outbound link that fires a GA4 "affiliate_click" event so we can
// measure which partners/placements actually get clicked. gtag is provided
// globally by the @next/third-parties GoogleAnalytics tag in the root layout.
export default function AffiliateLink({
  href,
  partner,
  placement,
  className,
  children,
}: {
  href: string
  partner: string
  placement?: string
  className?: string
  children: ReactNode
}) {
  const track = () => {
    try {
      window.gtag?.("event", "affiliate_click", {
        partner,
        placement: placement ?? "",
        link_url: href,
      })
    } catch {
      /* analytics must never break navigation */
    }
  }

  return (
    <a href={href} onClick={track} target="_blank" rel="sponsored noopener noreferrer" className={className}>
      {children}
    </a>
  )
}
