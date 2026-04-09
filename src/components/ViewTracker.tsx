"use client"

import { useEffect } from "react"

interface ViewTrackerProps {
  fromSlug: string
  toSlug: string
}

export default function ViewTracker({ fromSlug, toSlug }: ViewTrackerProps) {
  useEffect(() => {
    // Fire-and-forget view tracking
    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromSlug, toSlug }),
    }).catch(() => {
      // Silent fail - view tracking is non-critical
    })
  }, [fromSlug, toSlug])

  return null
}
