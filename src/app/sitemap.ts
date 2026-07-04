import type { MetadataRoute } from "next"
import { locales } from "@/lib/i18n"
import stations from "../../data/stations.json"
import lines from "../../data/lines.json"
import landmarks from "../../data/landmarks.json"
import guides from "../../data/guides.json"
import buses from "../../data/buses.json"
import type { Station, Line, Landmark } from "@/lib/types"

const allStations = stations as Station[]
const allLines = lines as Line[]
const allLandmarks = landmarks as Landmark[]
const BASE_URL = "https://mtlmetromap.com"

// Build hreflang language alternates for a path that exists under every locale.
// One sitemap entry per page (English as loc), with xhtml:link alternates for fr
// and x-default, matching the Next.js localized sitemap pattern.
function alternates(path: string): { languages: Record<string, string> } {
  const languages: Record<string, string> = {}
  for (const locale of locales) {
    languages[locale] = `${BASE_URL}/${locale}${path}`
  }
  languages["x-default"] = `${BASE_URL}/en${path}`
  return { languages }
}

// Static, hand-authored pages (path is locale-relative; "" is the home page).
const staticPages = [
  { path: "", changeFrequency: "weekly", priority: 1.0 },
  { path: "/map", changeFrequency: "monthly", priority: 0.7 },
  { path: "/fares", changeFrequency: "monthly", priority: 0.7 },
  { path: "/destinations", changeFrequency: "monthly", priority: 0.7 },
  { path: "/buses", changeFrequency: "monthly", priority: 0.7 },
  { path: "/guide", changeFrequency: "monthly", priority: 0.7 },
  { path: "/trip", changeFrequency: "monthly", priority: 0.6 },
  { path: "/compare", changeFrequency: "monthly", priority: 0.6 },
  { path: "/calculator", changeFrequency: "monthly", priority: 0.6 },
  { path: "/accessibility", changeFrequency: "monthly", priority: 0.6 },
  { path: "/status", changeFrequency: "daily", priority: 0.5 },
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()
  const entries: MetadataRoute.Sitemap = []

  for (const page of staticPages) {
    entries.push({
      url: `${BASE_URL}/en${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: alternates(page.path),
    })
  }

  // Station pages
  for (const s of allStations) {
    entries.push({
      url: `${BASE_URL}/en/station/${s.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: alternates(`/station/${s.slug}`),
    })
  }

  // Line pages
  for (const l of allLines) {
    entries.push({
      url: `${BASE_URL}/en/line/${l.id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: alternates(`/line/${l.id}`),
    })
  }

  // Destination pages ("how to get to X by metro") — high commercial intent
  for (const d of allLandmarks) {
    entries.push({
      url: `${BASE_URL}/en/destination/${d.id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: alternates(`/destination/${d.id}`),
    })
  }

  // Bus route pages
  for (const b of buses as Array<{ route: string }>) {
    entries.push({
      url: `${BASE_URL}/en/bus/${b.route}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: alternates(`/bus/${b.route}`),
    })
  }

  // Guide pages
  for (const g of guides) {
    entries.push({
      url: `${BASE_URL}/en/guide/${g.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: alternates(`/guide/${g.slug}`),
    })
  }

  return entries
}
