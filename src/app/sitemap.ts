import type { MetadataRoute } from "next"
import stations from "../../data/stations.json"
import lines from "../../data/lines.json"
import type { Station, Line } from "@/lib/types"

const allStations = stations as Station[]
const allLines = lines as Line[]
const BASE_URL = "https://mtlmetro.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/map`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/fares`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ]

  // Station pages (always in sitemap)
  const stationPages: MetadataRoute.Sitemap = allStations.map((s) => ({
    url: `${BASE_URL}/station/${s.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  // Line pages (always in sitemap)
  const linePages: MetadataRoute.Sitemap = allLines.map((l) => ({
    url: `${BASE_URL}/line/${l.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  // Route pages are NOT included here by default.
  // They get promoted to sitemap via the daily cron job.
  // The dynamic sitemap at /api/sitemap handles promoted routes.

  return [...staticPages, ...stationPages, ...linePages]
}
