import { NextResponse } from "next/server"
import GtfsRealtimeBindings from "gtfs-realtime-bindings"
import lines from "../../../../data/lines.json"

const { FeedMessage } = GtfsRealtimeBindings.transit_realtime

// Live service status, fetched on demand and cached 60s at the CDN. The function
// only runs on a cache miss (i.e. when someone is viewing the page).
//
//  - STM metro: the i3 "etat du service" JSON API. It returns one line-level
//    alert per metro line ("Your line" / "Votre ligne") whose description is the
//    current status ("Normal metro service" when fine, a message when not).
//  - Exo trains: GTFS-realtime protobuf service-alerts feed.
//
// Requires env vars (set in Vercel):
//   STM_API_KEY - from the STM API Hub (portail.developpeurs.stm.info). The
//                 application there must be PUBLISHED or STM returns 400
//                 "Invalid API Key".
//   EXO_API_KEY - from exo.quebec/en/about/open-data
// Without a valid key the relevant feed degrades to "normal" with no freshness
// stamp; it never invents an alert.
export const revalidate = 60

type LineStatus = "normal" | "delayed" | "interrupted" | "planned"

interface AlertEntry {
  lineId: string
  status: LineStatus
  message: string | null
  messageFr: string | null
}

const SEVERITY: Record<LineStatus, number> = { normal: 0, planned: 1, delayed: 2, interrupted: 3 }

// STM metro route_short_name -> our line id. green=1, orange=2, yellow=4,
// blue=5 (there is no line 3). Bus routes use higher numbers and are ignored.
const STM_RSN_TO_LINE: Record<string, string> = { "1": "green", "2": "orange", "4": "yellow", "5": "blue" }

// Exo trains, keyed by GTFS-realtime route id (kept separate from STM so the
// two agencies' overlapping route numbers can never cross-contaminate).
const EXO_ROUTE_TO_LINE: Record<string, string> = {
  "11": "exo1",
  "12": "exo2",
  "13": "exo3",
  "14": "exo4",
  "15": "exo5",
}

// --- STM: i3 "etat du service" JSON ----------------------------------------
interface StmText {
  language?: string
  text?: string | null
}
interface StmEntity {
  route_short_name?: string
  direction_id?: string
  stop_code?: string
}
interface StmAlert {
  informed_entities?: StmEntity[]
  description_texts?: StmText[]
  header_texts?: StmText[]
}
interface StmFeed {
  alerts?: StmAlert[]
}

function pickText(arr: StmText[] | undefined, lang: string): string | null {
  return arr?.find((t) => t.language === lang)?.text ?? null
}

function parseStmEtatService(data: StmFeed): AlertEntry[] {
  const out: AlertEntry[] = []
  for (const a of data.alerts ?? []) {
    const ents = a.informed_entities ?? []
    // Line-level status only. Entries carrying a stop_code are station-entrance
    // notices (e.g. "Entrance B closed"), not line disruptions, so skip them.
    if (ents.some((e) => e.stop_code != null)) continue
    const rsn = ents
      .map((e) => e.route_short_name)
      .find((r): r is string => typeof r === "string" && r in STM_RSN_TO_LINE)
    if (!rsn) continue

    const en = pickText(a.description_texts, "en")
    const fr = pickText(a.description_texts, "fr")
    const combined = `${en ?? ""} ${fr ?? ""}`.trim().toLowerCase()

    // No description -> do not fabricate an alert.
    if (!combined) continue
    // Normal service produces no alert entry.
    // ("Normal metro service" / "Service normal du metro")
    if (/service normal|normal m[eé]tro service/.test(combined)) continue

    // effect/cause are not populated in this feed, so classify from the text.
    let status: LineStatus = "delayed"
    if (/interrom|interrup|no service|aucun service|suspend|ferm[eé]|closed|arr[eê]t complet/.test(combined)) {
      status = "interrupted"
    }
    out.push({ lineId: STM_RSN_TO_LINE[rsn], status, message: en, messageFr: fr })
  }
  return out
}

async function fetchSTM(): Promise<{ alerts: AlertEntry[]; ok: boolean }> {
  const apiKey = process.env.STM_API_KEY?.trim()
  if (!apiKey) return { alerts: [], ok: false }
  try {
    const res = await fetch("https://api.stm.info/pub/od/i3/v2/messages/etatservice", {
      headers: { apiKey, accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return { alerts: [], ok: false }
    const data = (await res.json()) as StmFeed
    return { alerts: parseStmEtatService(data), ok: true }
  } catch {
    return { alerts: [], ok: false }
  }
}

// --- Exo: GTFS-realtime protobuf -------------------------------------------
function parseExoFeed(buffer: ArrayBuffer): AlertEntry[] {
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
      const lineId = EXO_ROUTE_TO_LINE[routeId]
      if (lineId) {
        alerts.push({ lineId, status, message: enText, messageFr: frText })
      }
    }
  }

  return alerts
}

async function fetchExo(): Promise<{ alerts: AlertEntry[]; ok: boolean }> {
  const apiKey = process.env.EXO_API_KEY?.trim()
  if (!apiKey) return { alerts: [], ok: false }
  try {
    const res = await fetch("https://exo.chrono-saeiv.com/api/opendata/v1/TRAINS/alert", {
      headers: { "Ocp-Apim-Subscription-Key": apiKey },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return { alerts: [], ok: false }
    const buffer = await res.arrayBuffer()
    return { alerts: parseExoFeed(buffer), ok: true }
  } catch {
    return { alerts: [], ok: false }
  }
}

export async function GET() {
  const [stm, exo] = await Promise.all([fetchSTM(), fetchExo()])

  // Worst alert wins if a line is referenced more than once.
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
