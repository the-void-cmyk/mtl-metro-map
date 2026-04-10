import { NextRequest, NextResponse } from "next/server"
import { findRoute } from "@/lib/router"

const MONTHLY_PASSES: Record<string, number> = {
  A: 94.0,
  AB: 132.5,
  ABC: 176.0,
  ABCD: 220.5,
  B: 94.0,
  BC: 132.5,
  C: 94.0,
  CD: 132.5,
  D: 94.0,
}

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from")
  const to = request.nextUrl.searchParams.get("to")

  if (!from || !to) {
    return NextResponse.json(
      { error: "Missing from or to parameter" },
      { status: 400 }
    )
  }

  const route = findRoute(from, to)

  if (!route) {
    return NextResponse.json(
      { error: "Route not found" },
      { status: 404 }
    )
  }

  const zoneKey = route.fare.zones.sort().join("")
  const monthlyPrice = MONTHLY_PASSES[zoneKey] ?? MONTHLY_PASSES["ABCD"]

  return NextResponse.json({
    zones: route.fare.zones,
    zoneKey,
    singleTrip: route.fare.price,
    monthlyPass: monthlyPrice,
    ticketType: route.fare.ticketType,
  })
}
