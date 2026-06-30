import { NextResponse } from "next/server"
import GtfsRealtimeBindings from "gtfs-realtime-bindings"
import lines from "../../../../data/lines.json"

const { FeedMessage } = GtfsRealtimeBindings.transit_realtime

// Live service status: fetch the STM/Exo GTFS-realtime alert feeds on demand and
// cache the result for 60s at the CDN. The page reflects real disruptions within
// about a minute, with no background cron and no database writes. The function
// only runs on a cache miss (i.e. when someone is actually viewing the page).
//
// Requires env vars (set in Vercel):
//   STM_API_KEY - from stm.info/en/about/developers
//   EXO_API_KEY - from exo.quebec/en/about/open-data
// Without a key the relevant feed degrades to "normal" with no freshness stamp.
export const revalidate = 60

type LineStatus = "normal" | "delayed" | "interrupted" | "planned"

interface AlertEntry {
  lineId: string
  status: LineStatus
  message: string | null
  messageFr: string | null
}

// Map GTFS route IDs to our line IDs. STM and Exo are kept SEPARATE: both
// agencies number routes in overlapping ranges, so a single shared map lets an
// Exo alert (e.g. route "4") get mislabeled onto a metro line (yellow). Each
// feed is parsed only against its own map, so a feed can never write to a line
// it does not own.
const STM_ROUTE_TO_LINE: Record<string, string> = {
  "1": "green",
  "2": "orange",
  "4": "yellow",
  "5": "blue",
}
const EXO_ROUTE_TO_LINE: Record<string, string> = {
  "11": "exo1",
  "12": "exo2",
  "13": "exo3",
  "14": "exo4",
  "15": "exo5",
}

const SEVERITY: Record<LineStatus, number> = {
  normal: 0,
  planned: 1,
  delayed: 2,
  interrupted: 3,
}

function parseProtobufFeed(buffer: ArrayBuffer, routeMap: Record<string, string>): AlertEntry[] {
  const feed = FeedMessage.decode(new Uint8Array(buffer))
  const alerts: AlertEntry[] = []

  for (const entity of feed.entity) {
    const alert = entity.alert
    if (!alert) continue

    const routeIds = (alert.informedEntity ?? [])
      .map((ie) => ie.routeId)
      .filter(Boolean) as string[]

    const enText = alert.headerText?.translation?.find((t) => t.language === "en")?.text ?? null
    const frText = alert.headerText?.translation?.find((t) => t.language === "fr")?.text ?? null

    const effect = alert.effect ?? 0
    let status: LineStatus = "delayed"
    // GTFS-RT Effect enum: 1=NO_SERVICE, 2=REDUCED_SERVICE, 6=MODIFIED_SERVICE
    if (effect === 1) status = "interrupted"
    else if (effect === 2 || effect === 6) status = "delayed"

    for (const routeId of routeIds) {
      const lineId = routeMap[routeId]
      if (lineId) {
        alerts.push({ lineId, status, message: enText, messageFr: frText })
      }
    }
  }

  return alerts
}

async function fetchFeed(
  url: string,
  headers: Record<string, string>,
  routeMap: Record<string, string>
): Promise<{ alerts: AlertEntry[]; ok: boolean }> {
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) })
    if (!res.ok) return { alerts: [], ok: false }
    const buffer = await res.arrayBuffer()
    return { alerts: parseProtobufFeed(buffer, routeMap), ok: true }
  } catch {
    return { alerts: [], ok: false }
  }
}

function fetchSTM() {
  // Trim stray whitespace/newline from the key (defensive hygiene; the same
  // guard db.ts applies to the Turso env vars). Note: a valid key is still
  // required. An invalid/expired STM_API_KEY returns 400 "Invalid API Key"
  // and metro lines fall back to "normal" with no live confirmation.
  const apiKey = process.env.STM_API_KEY?.trim()
  if (!apiKey) return Promise.resolve({ alerts: [] as AlertEntry[], ok: false })
  return fetchFeed("https://api.stm.info/pub/od/gtfs-rt/ic/v2/serviceAlerts", { apiKey }, STM_ROUTE_TO_LINE)
}

function fetchExo() {
  const apiKey = process.env.EXO_API_KEY?.trim()
  if (!apiKey) return Promise.resolve({ alerts: [] as AlertEntry[], ok: false })
  return fetchFeed(
    "https://exo.chrono-saeiv.com/api/opendata/v1/TRAINS/alert",
    { "Ocp-Apim-Subscription-Key": apiKey },
    EXO_ROUTE_TO_LINE
  )
}

export async function GET() {
  const [stm, exo] = await Promise.all([fetchSTM(), fetchExo()])

  // Worst alert wins if a line is referenced by more than one alert.
  const alertMap = new Map<string, AlertEntry>()
  for (const a of [...stm.alerts, ...exo.alerts]) {
    const existing = alertMap.get(a.lineId)
    if (!existing || SEVERITY[a.status] > SEVERITY[existing.status]) {
      alertMap.set(a.lineId, a)
    }
  }

  const now = new Date().toISOString()

  const allLines = lines.map((line) => {
    const isStm = line.network === "metro"
    const isExo = line.network === "exo"
    // Did we successfully reach the feed that governs this line this request?
    const checked = (isStm && stm.ok) || (isExo && exo.ok)
    const alert = alertMap.get(line.id)

    return {
      lineId: line.id,
      name: line.name,
      nameFr: line.nameFr,
      color: line.color,
      network: line.network,
      status: alert?.status ?? "normal",
      message: alert?.message ?? null,
      messageFr: alert?.messageFr ?? null,
      // Only stamp a freshness time for lines we actually confirmed live.
      // REM (no feed) and any source we could not reach stay null.
      updatedAt: checked ? now : null,
    }
  })

  return NextResponse.json(
    {
      lines: allLines,
      lastChecked: now,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    }
  )
}
