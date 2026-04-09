/**
 * Weekly Cron: Popular Routes
 *
 * For each station, calculates the top 10 most-viewed routes
 * and caches them in the popular_routes table.
 * Run this weekly via cron, Vercel Cron, or GitHub Actions.
 *
 * Usage: npx tsx scripts/cron-popular.ts
 */

import { updatePopularRoutes } from "../src/lib/db"
import stations from "../data/stations.json"

function main() {
  console.log(`[popular-cron] Calculating popular routes for ${stations.length} stations`)

  let updated = 0
  for (const station of stations) {
    updatePopularRoutes(station.slug, 10)
    updated++
  }

  console.log(`[popular-cron] Updated popular routes for ${updated} stations`)
  console.log(`[popular-cron] Done at ${new Date().toISOString()}`)
}

main()
