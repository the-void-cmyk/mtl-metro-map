import type { MetadataRoute } from "next"
import { locales } from "@/lib/i18n"
import stations from "../../data/stations.json"
import lines from "../../data/lines.json"
import type { Station, Line } from "@/lib/types"

const allStations = stations as Station[]
const allLines = lines as Line[]
const BASE_URL = "https://mtlmetromap.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()
  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    // Home
    entries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    })

    // Station pages
    for (const s of allStations) {
      entries.push({
        url: `${BASE_URL}/${locale}/station/${s.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      })
    }

    // Line pages
    for (const l of allLines) {
      entries.push({
        url: `${BASE_URL}/${locale}/line/${l.id}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      })
    }
  }

  return entries
}
