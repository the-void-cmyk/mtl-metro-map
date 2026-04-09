import { NextResponse } from "next/server"
import { getSitemapEntries } from "@/lib/db"

const BASE_URL = "https://mtlmetro.com"

/**
 * Dynamic sitemap for promoted route pages.
 * These routes earned their place by getting enough views.
 * Consumed by Google Search Console alongside the static sitemap.
 */
export async function GET() {
  const entries = await getSitemapEntries()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${BASE_URL}${entry.url}</loc>
    <lastmod>${entry.lastModified}</lastmod>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
