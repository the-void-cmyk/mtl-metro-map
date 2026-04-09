import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: [
      "https://mtlmetromap.com/sitemap.xml",
      "https://mtlmetromap.com/api/sitemap-routes",
    ],
  }
}
