/**
 * Daily Cron: Sitemap Promotion
 *
 * Checks route_views table and promotes routes with enough views
 * to the sitemap. Run this daily via cron, Vercel Cron, or GitHub Actions.
 *
 * Usage: npx tsx scripts/cron-sitemap.ts
 */

import { promoteToSitemap } from "../src/lib/db"

const THRESHOLD = 5 // Minimum views to earn sitemap placement

function main() {
  console.log(`[sitemap-cron] Running with threshold: ${THRESHOLD} views`)

  const promoted = promoteToSitemap(THRESHOLD)

  console.log(`[sitemap-cron] Promoted ${promoted} new routes to sitemap`)
  console.log(`[sitemap-cron] Done at ${new Date().toISOString()}`)
}

main()
