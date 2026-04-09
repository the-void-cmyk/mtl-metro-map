import { NextRequest, NextResponse } from "next/server"
import { searchStations } from "@/lib/stations"

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? ""

  if (!q || q.length < 1) {
    return NextResponse.json([])
  }

  const results = searchStations(q, 8)

  return NextResponse.json(
    results.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      lineIds: s.lineIds,
      network: s.network,
    }))
  )
}
