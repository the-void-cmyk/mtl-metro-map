import { NextResponse } from "next/server"
import { getSitemapEntries } from "@/lib/db"

const BASE_URL = "https://mtlmetromap.com"

/**
 * Dynamic sitemap for promoted route pages.
 * These routes earned their place by getting enough views.
 * Consumed by Google Search Console alongside the static sitemap.
 */
export async function GET() {
  const entries = await getSitemapEntries()

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries
  .map((entry) => {
    // Stored URLs are locale-agnostic (e.g. /route/a-to-b). Emit the canonical
    // English URL with hreflang alternates so crawlers index the page directly
    // instead of following the middleware redirect, and discover the French page.
    const en = `${BASE_URL}/en${entry.url}`
    const fr = `${BASE_URL}/fr${entry.url}`
    return `  <url>
    <loc>${en}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${en}" />
    <xhtml:link rel="alternate" hreflang="fr" href="${fr}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${en}" />
    <lastmod>${entry.lastModified}</lastmod>
    <priority>${entry.priority}</priority>
  </url>`
  })
  .join("\n")}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
