import { NextRequest, NextResponse } from "next/server"
import { promoteToSitemap } from "@/lib/db"

const THRESHOLD = 5

export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const promoted = await promoteToSitemap(THRESHOLD)

  return NextResponse.json({
    ok: true,
    promoted,
    threshold: THRESHOLD,
    timestamp: new Date().toISOString(),
  })
}
