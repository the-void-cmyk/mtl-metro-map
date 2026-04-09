import { NextRequest, NextResponse } from "next/server"
import { incrementView } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { fromSlug, toSlug } = await request.json()

    if (!fromSlug || !toSlug || typeof fromSlug !== "string" || typeof toSlug !== "string") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    // Basic sanitization
    const cleanFrom = fromSlug.replace(/[^a-z0-9-]/g, "").slice(0, 100)
    const cleanTo = toSlug.replace(/[^a-z0-9-]/g, "").slice(0, 100)

    await incrementView(cleanFrom, cleanTo)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
