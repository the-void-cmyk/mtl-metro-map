import { NextResponse } from "next/server"

// TEMPORARY diagnostic. Returns only upstream HTTP status codes and key
// lengths (never the key values) so we can see why the STM feed fails in
// production. Remove after diagnosing.
export const dynamic = "force-dynamic"

async function probe(url: string, headers: Record<string, string>) {
  const t0 = Date.now()
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) })
    const buf = await res.arrayBuffer()
    return { status: res.status, ok: res.ok, bytes: buf.byteLength, ms: Date.now() - t0 }
  } catch (e) {
    return { status: 0, ok: false, error: String(e), ms: Date.now() - t0 }
  }
}

export async function GET() {
  const stmKey = process.env.STM_API_KEY
  const exoKey = process.env.EXO_API_KEY

  const stm = stmKey
    ? await probe("https://api.stm.info/pub/od/gtfs-rt/ic/v2/serviceAlerts", { apiKey: stmKey })
    : { note: "no STM_API_KEY in env" }
  const exo = exoKey
    ? await probe("https://exo.chrono-saeiv.com/api/opendata/v1/TRAINS/alert", {
        "Ocp-Apim-Subscription-Key": exoKey,
      })
    : { note: "no EXO_API_KEY in env" }

  return NextResponse.json(
    {
      stmKeyPresent: !!stmKey,
      stmKeyLen: stmKey?.length ?? 0,
      stmKeyTrimmedLen: stmKey?.trim().length ?? 0,
      exoKeyPresent: !!exoKey,
      exoKeyLen: exoKey?.length ?? 0,
      exoKeyTrimmedLen: exoKey?.trim().length ?? 0,
      stm,
      exo,
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}
