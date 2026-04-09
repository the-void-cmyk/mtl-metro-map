import { NextRequest, NextResponse } from "next/server"
import { updatePopularRoutes } from "@/lib/db"
import stations from "../../../../../data/stations.json"

export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let updated = 0
  for (const station of stations) {
    await updatePopularRoutes(station.slug, 10)
    updated++
  }

  return NextResponse.json({
    ok: true,
    stationsProcessed: updated,
    timestamp: new Date().toISOString(),
  })
}
