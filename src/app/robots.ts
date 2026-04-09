import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: [
      "https://mtlmetro.com/sitemap.xml",
      "https://mtlmetro.com/api/sitemap-routes",
    ],
  }
}
