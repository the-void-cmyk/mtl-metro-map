import { NextResponse } from "next/server"

// TEMPORARY diagnostic. Tests the STM key raw vs trimmed and returns the
// upstream status + short body text (no key values). Remove after use.
export const dynamic = "force-dynamic"

const STM_URL = "https://api.stm.info/pub/od/gtfs-rt/ic/v2/serviceAlerts"

async function probe(label: string, headers: Record<string, string>) {
  const t0 = Date.now()
  try {
    const res = await fetch(STM_URL, { headers, signal: AbortSignal.timeout(8000) })
    const text = await res.text()
    return { label, status: res.status, ok: res.ok, bytes: text.length, bodyPreview: text.slice(0, 160), ms: Date.now() - t0 }
  } catch (e) {
    return { label, error: String(e), ms: Date.now() - t0 }
  }
}

export async function GET() {
  const raw = process.env.STM_API_KEY
  const trimmed = raw?.trim()
  const results = []
  if (raw) results.push(await probe("raw", { apiKey: raw }))
  if (trimmed) results.push(await probe("trimmed", { apiKey: trimmed }))
  return NextResponse.json(
    { rawLen: raw?.length ?? 0, trimmedLen: trimmed?.length ?? 0, results },
    { headers: { "Cache-Control": "no-store" } }
  )
}
