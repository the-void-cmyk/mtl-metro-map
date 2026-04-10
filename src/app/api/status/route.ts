import { NextResponse } from "next/server"
import { getServiceStatus } from "@/lib/db"
import lines from "../../../../data/lines.json"

export const dynamic = "force-dynamic"

export async function GET() {
  let dbStatus: Awaited<ReturnType<typeof getServiceStatus>> = []

  try {
    dbStatus = await getServiceStatus()
  } catch {
    // DB not available, return defaults
  }

  const statusMap = new Map(dbStatus.map((s) => [s.lineId, s]))

  const allLines = lines.map((line) => {
    const stored = statusMap.get(line.id)
    return {
      lineId: line.id,
      name: line.name,
      nameFr: line.nameFr,
      color: line.color,
      network: line.network,
      status: stored?.status ?? "normal",
      message: stored?.message ?? null,
      messageFr: stored?.messageFr ?? null,
      updatedAt: stored?.updatedAt ?? null,
    }
  })

  return NextResponse.json({
    lines: allLines,
    lastChecked: new Date().toISOString(),
  })
}
