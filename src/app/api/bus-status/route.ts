import { NextResponse } from "next/server"
import buses from "../../../../data/buses.json"

// Per-route bus service notices from STM's i3 "etat du service" feed, fetched on
// demand and cached 60s at the CDN. Returns, for each of our routes with active
// stop-level notices, the count of affected stops. Routes with none are omitted
// (treated as normal). Kept scoped to our 75 routes to bound the payload.
export const revalidate = 60

const OUR_ROUTES = new Set((buses as Array<{ route: string }>).map((b) => b.route))
const METRO = new Set(["1", "2", "4", "5"])

interface StmEntity {
  route_short_name?: string
  stop_code?: string
}
interface StmAlert {
  informed_entities?: StmEntity[]
}
interface StmFeed {
  alerts?: StmAlert[]
}

export async function GET() {
  const apiKey = process.env.STM_API_KEY?.trim()
  const routes: Record<string, number> = {}
  let ok = false

  if (apiKey) {
    try {
      const res = await fetch("https://api.stm.info/pub/od/i3/v2/messages/etatservice", {
        headers: { apiKey, accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      })
      if (res.ok) {
        ok = true
        const data = (await res.json()) as StmFeed
        for (const a of data.alerts ?? []) {
          const ents = a.informed_entities ?? []
          // Only stop-level notices (a specific stop moved/cancelled).
          if (!ents.some((e) => e.stop_code != null)) continue
          const seen = new Set<string>()
          for (const e of ents) {
            const r = e.route_short_name
            if (r && OUR_ROUTES.has(r) && !METRO.has(r) && !seen.has(r)) {
              seen.add(r)
              routes[r] = (routes[r] ?? 0) + 1
            }
          }
        }
      }
    } catch {
      // degrade to "no data"; the client shows nothing rather than a false state
    }
  }

  return NextResponse.json(
    { ok, routes, lastChecked: new Date().toISOString() },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
  )
}
