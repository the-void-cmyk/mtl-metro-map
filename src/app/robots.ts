import type { MetadataRoute } from "next"

const parasiticCrawlers = [
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "DataForSeoBot",
  "PetalBot",
  "BLEXBot",
  "SeznamBot",
  "Bytespider",
  "ImagesiftBot",
  "Amazonbot",
  "Applebot-Extended",
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...parasiticCrawlers.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    sitemap: [
      "https://mtlmetromap.com/sitemap.xml",
      "https://mtlmetromap.com/api/sitemap-routes",
    ],
  }
}
